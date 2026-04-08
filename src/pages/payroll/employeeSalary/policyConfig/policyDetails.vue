<template>
  <div class="bank-details-container">
    <!-- Filter Panel -->
    <div class="filter-panel" v-if="showFilters && !showForm">
      <div class="filter-content">
        <FilterComponent
          :tenantId="tenantId"
          :initialFilters="initialFilters"
          :initiallyVisible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <div
      v-if="!showForm"
      class="main-content"
      :class="{ 'full-width': !showFilters }"
    >
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Bank Details'"
        :isEmpty="filteredItems.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <!-- Filter Toggle Button -->
        <template #before-search>
          <button
            v-if="!showForm"
            class="filter-toggle-static"
            @click="toggleFilters"
            :class="{ active: hasActiveFilters }"
            :title="showFilters ? 'Hide filters' : 'Show filters'"
            aria-label="Toggle filters"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </button>
        </template>

        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="items.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load bank details"
            :message="error"
            @retry="fetchBankData"
          />
        </div>

        <div v-else-if="filteredItems.length === 0">
          <EmptyState
            title="No Bank Details found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredItems"
            :columns="columns"
            :selectedItems="selectedItems"
            :showSelection="false"
            :sortBy="sortBy[0]?.key || ''"
            :sortDirection="sortBy[0]?.order || 'asc'"
            :itemKey="'id'"
            :rowClickable="true"
            @update:selectedItems="selectedItems = $event"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @rowClick="handleRowClick"
            @sort="handleSort"
          >
            <!-- Profile Column -->
            <template #cell-profile="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="item.assignedUser?.first_name"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </template>

            <!-- Employer Name Column -->
            <template #cell-name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.assignedUser?.first_name || "Unknown" }}
                </h3>
              </div>
            </template>

            <!-- Employee ID Column -->
            <template #cell-id="{ item }">
              <span class="employee-id">{{ item.employeeId || "N/A" }}</span>
            </template>

            <!-- Role Column -->
            <template #cell-role="{ item }">
              <span class="role-badge">
                {{ item.assignedUser?.role?.name || "No role" }}
              </span>
            </template>

            <!-- Phone Column -->
            <template #cell-phone="{ item }">
              <span>{{ item.assignedUser?.phone || "No phone" }}</span>
            </template>

            <template #cell-salaryConfigName="{ item }">
              <span>{{ item.salaryConfig?.configName || "N/A" }}</span>
            </template>

            <template #cell-configName="{ item }">
              <span>{{ item.config?.configName || "N/A" }}</span>
            </template>
          </DataTable>
        </div>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>

      <!-- Bank Form -->
      <BankForm
        v-if="showForm"
        :is-editing="isEditing"
        :bank-data="editedItem"
        :tenant-id="tenantId"
        :first-name="editedItem.assignedUser?.first_name"
      />
    </div>
    <router-view @close="handleClose" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
// import BankForm from "@/pages/employee/my-teams/bankDetails/bankDetails.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import SensitiveDataView from "@/components/sensitiveData/sensitiveDataView.vue";
import { useRouter } from "vue-router";

// State
const loading = ref(false);
const error = ref(null);
const showFilters = ref(true);
const search = ref("");
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const items = ref([]);
const selectedItems = ref([]);
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const managerBranchId = ref(null);

const filters = reactive({
  branch: "",

  organization: "", // new
  department: "", // new
});

// Filter schema for FilterComponent
const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

// Computed Properties
const columns = computed(() => [
  { key: "profile", label: "Profile", sortable: false, width: "60px" },
  { key: "name", label: "Employee Name", sortable: false, width: "150px" },
  { key: "id", label: "Employee ID", sortable: false, width: "120px" },
  { key: "role", label: "Role", sortable: false, width: "120px" },
  { key: "phone", label: "Phone", sortable: false, width: "130px" },
  {
    key: "salaryConfigName",
    label: "Payroll Category",
    sortable: true,
    width: "200px",
  },
  {
    key: "configName",
    label: "Penality Category",
    sortable: true,
    width: "200px",
  },
  {
    key: "AttendanceCycle",
    label: "Attendance Cycle Type",
    sortable: true,
    width: "200px",
  },
]);

const initialFilters = computed(() => ({
  branch: filters.branch,

  organization: filters.organization,
  department: filters.department,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.organization ||
    filters.department ||
    filters.branch ||
    search.value !== ""
  );
});

const filteredItems = computed(() => {
  return items.value;
});

const router = useRouter();
const token = authService.getToken();

// Helper Functions
const getAccountStatusClass = (status) => {
  if (!status) return "status-default";
  const statusLower = status.toLowerCase();
  if (statusLower === "active") return "status-active";
  if (statusLower === "inactive") return "status-inactive";
  if (statusLower === "pending") return "status-pending";
  return "status-default";
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// API Logic
const fetchManagerBranch = async () => {
  if (userRole === "Manager" && token && userId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][id][_eq]=${userId}&fields=branch.id,branch.branchName`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.data && data.data.length > 0 && data.data[0].branch?.id) {
        managerBranchId.value = data.data[0].branch.id;
      } else {
        console.warn("No branch ID found for manager");
      }
    } catch (error) {
      console.error("Error fetching manager's branch:", error);
    }
  }
};

const fetchBankData = async (
  currentPage = page.value,
  currentItemsPerPage = itemsPerPage.value,
  searchTerm = search.value,
) => {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      fields: [
        "id",
        "employeeId",
        "branch.id",
        "branch.branchName",
        "assignedUser.first_name",
        "assignedUser.phone",

        "assignedUser.role.name",
        "assignedUser.avatar.id",
        "cycleType",
        "salaryConfig.configName",
        "config.configName",
      ],
      limit: currentItemsPerPage,
      page: currentPage,
    };

    let filterParams = [];

    // Role-based filtering
    if (userRole === "Admin" || userRole === "Dealer") {
      filterParams.push(
        `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      );
    } else {
      filterParams.push(`filter[_or][0][approver][id][_eq]=${userId}`);
      filterParams.push(`filter[_or][1][assignedUser][id][_eq]=${userId}`);
    }

    // Organization filter
    if (filters.organization) {
      filterParams.push(
        `filter[assignedUser][organization][id][_eq]=${filters.organization}`,
      );
    }

    // Department filter
    if (filters.department) {
      filterParams.push(`filter[department][id][_eq]=${filters.department}`);
    }

    // Branch filter
    if (filters.branch) {
      filterParams.push(`filter[branchLocation][id][_eq]=${filters.branch}`);
    }

    // Search term filters
    if (searchTerm) {
      filterParams.push(`filter[_or][0][employeeId][_eq]=${searchTerm}`);
      filterParams.push(
        `filter[_or][1][assignedUser][first_name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][2][assignedUser][role][name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][3][assignedUser][phone][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][4][assignedUser][bankName][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][5][assignedUser][IFSC][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][6][assignedUser][UPI][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][7][assignedUser][accountNumber][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][8][branch][branchName][_icontains]=${searchTerm}`,
      );
    }

    // Sorting
    if (sortBy.value.length > 0) {
      const sortParam = sortBy.value
        .map((sortItem) => {
          const direction = sortItem.order === "desc" ? "-" : "";
          return `${direction}${sortItem.key}`;
        })
        .join(",");
      filterParams.push(`sort=${sortParam}`);
    }

    // Construct query string
    const queryString = [
      ...params.fields.map((f) => `fields[]=${f}`),
      ...filterParams,
      `limit=${currentItemsPerPage}`,
      `page=${currentPage}`,
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    items.value = await Promise.all(
      data.data.map(async (employee) => {
        if (employee.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${employee.assignedUser.avatar.id}`;
          employee.avatarImage = await fetchAuthorizedImage(avatarUrl);
        }

        return employee;
      }),
    );

    // Fetch total count
    const countUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${filterParams.join("&")}&aggregate[countDistinct]=id`;
    const countResponse = await fetch(countUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countData = await countResponse.json();
    totalItems.value = parseInt(countData.data[0].countDistinct.id);
  } catch (err) {
    console.error("Error fetching bank data:", err);
    error.value = err.message || "Failed to load bank details";
  } finally {
    loading.value = false;
  }
};

// const fetchFilterOptions = async () => {
//   try {
//     const params = new URLSearchParams({
//       "filter[tenant][tenantId][_eq]": tenantId,
//     });

//     const [branchRes, bankRes, roleRes] = await Promise.all([
//       fetch(
//         `${import.meta.env.VITE_API_URL}/items/branch?${params}&fields=id,branchName`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       ),
//       fetch(
//         `${import.meta.env.VITE_API_URL}/items/personalModule?${params}&fields=assignedUser.bankName`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       ),
//       fetch(
//         `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       ),
//     ]);

//     const [branchData, bankData, roleData] = await Promise.all([
//       branchRes.json(),
//       bankRes.json(),
//       roleRes.json(),
//     ]);

//     branchOptions.value = branchData.data.map((b) => ({
//       title: b.branchName,
//       value: b.branchName,
//     }));
//     bankOptions.value = [
//       ...new Set(
//         bankData.data.map((b) => b.assignedUser?.bankName).filter(Boolean),
//       ),
//     ].map((name) => ({ title: name, value: name }));
//     roleOptions.value = roleData.data.map((r) => ({
//       title: r.name,
//       value: r.name,
//     }));
//   } catch (error) {
//     console.error("Error fetching filter options:", error);
//   }
// };

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchBankData();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  selectedItems.value = [];
  fetchBankData();
};

const toggleItemSelection = (itemId) => {
  if (selectedItems.value.includes(itemId)) {
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId);
  } else {
    selectedItems.value.push(itemId);
  }
};

const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newSortDirection) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newSortDirection }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchBankData();
};

const handleRowClick = (item) => {
  if (item && item.id) {
    showForm.value = true;
    router.push(
      `/payroll/employee-salary/policyDetails/${item.id}/policy-edit`,
    );
  } else {
    console.error("Invalid item or item ID");
  }
};

const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = item;
  showForm.value = true;
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchBankData();
};

const deleteItem = async (item) => {
  if (confirm("Are you sure you want to delete this bank detail?")) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule/${item.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignedUser: {
              bankName: null,
              accountNumber: null,
              IFSC: null,
              UPI: null,
            },
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to delete bank details");
      alert("Bank details deleted successfully");
      fetchBankData();
    } catch (error) {
      console.error("Error deleting bank details:", error);
      alert("An error occurred while deleting the bank details");
    }
  }
};

const debouncedSearch = debounce(() => {
  fetchBankData(1, itemsPerPage.value, search.value);
}, 300);
const handleClose = async () => {
  showForm.value = false;
  await fetchBankData();
};
// Lifecycle Hooks
onMounted(async () => {
  await fetchManagerBranch();

  await fetchBankData();
});

watch(
  [search, filters, sortBy],
  () => {
    debouncedSearch();
  },
  { deep: true },
);
</script>

<style scoped>
.bank-details-container {
  display: flex;
  height: 100vh;
  position: relative;

}

/* Filter Panel */
.filter-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

/* Filter Toggle Button */
.filter-toggle-static {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #374151;
}

.filter-toggle-static:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-toggle-static.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-content.full-width {
  margin-left: 0;
}

/* Profile Avatar */
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #64748b;
}

/* Employee Info */
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.employee-name {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}

.employee-id {
  font-weight: 500;
  color: #3b82f6;
}

/* Role Badge */
.role-badge {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-default {
  background: #f1f5f9;
  color: #475569;
}

/* Checkbox */
.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-checkbox:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .bank-details-container {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 50vh;
    position: relative;
    z-index: 100;
  }

  .filter-toggle-static {
    position: static;
    margin: 1rem;
    width: 40px;
    height: 40px;
  }

  .main-content {
    margin-left: 0 !important;
  }
}
</style>

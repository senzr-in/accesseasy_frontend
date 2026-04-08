<template>
  <div class="leave-container">
    <!-- Filter Panel -->
    <div class="filter-panel" v-if="showFilters">
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

    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Leave Details'"
        :isEmpty="filteredLeaveDetails.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <!-- Filter Toggle Button -->
        <template #before-search>
          <button
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
            <div v-if="hasActiveFilters" class="filter-indicator"></div></button
        ></template>

        <!-- Table content states -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="leaveDetailsData.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load leave details"
            :message="error"
            @retry="fetchLeaveDetails"
          />
        </div>

        <div v-else-if="filteredLeaveDetails.length === 0">
          <EmptyState
            title="No employee leave Details found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters', icon: X }"
            @primaryAction="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredLeaveDetails"
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
            <!-- Checkbox Column -->
            <template #cell-checkbox="{ item }">
              <input
                type="checkbox"
                class="custom-checkbox"
                :checked="selectedItems.includes(item.id)"
                :disabled="isEmployeeLeft(item)"
                @change="toggleItemSelection(item.id)"
              />
            </template>

            <!-- Profile Column -->
            <template #cell-profile="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="item.assignedUser?.first_name"
                  class="avatar-image"
                  :class="{ grayscale: isEmployeeLeft(item) }"
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

            <!-- Employee Name Column -->
            <template #cell-name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.assignedUser?.first_name || "N/A" }}
                  <span
                    v-if="isEmployeeLeft(item)"
                    class="status-badge status-inactive ml-2"
                  >
                    LEFT
                  </span>
                </h3>
              </div>
            </template>

            <!-- Employee ID Column -->
            <template #cell-employeeId="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ item.employeeId || "-" }}
              </span>
            </template>

            <!-- Organization Column -->
            <template #cell-organization="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ item.assignedUser?.organization?.orgName || "N/A" }}
              </span>
            </template>

            <!-- Department Column -->
            <template #cell-department="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ item.department?.departmentName || "-" }}
              </span>
            </template>

            <!-- Attendance Category Column -->
            <template #cell-attendanceCategory="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ item.config?.configName || "-" }}
              </span>
            </template>

            <!-- Date of Leaving Column -->
            <template #cell-dateOfLeaving="{ item }">
              <span :class="{ 'text-red': isEmployeeLeft(item) }">
                {{ item.assignedUser?.dateOfLeaving || "-" }}
              </span>
            </template>

            <!-- Dynamic Leave Type Columns -->
            <template
              v-for="leaveType in uniqueLeaveTypes"
              :key="leaveType"
              #[`cell-${leaveType}`]="{ item }"
            >
              <div class="leave-info-cell">
                <div
                  class="leave-taken"
                  :class="{ 'text-muted': isEmployeeLeft(item) }"
                >
                  <span class="taken-label">Taken:</span>
                  <span class="taken-value">{{
                    item.leaves?.leaveTaken?.[`t${leaveType}`] || 0
                  }}</span>
                </div>
              </div>
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

      <!-- Leave Form -->
      <LeaveForm
        v-if="showForm"
        :personal-module-id="editedItem.id"
        :config-name="editedItem.config?.configName"
        :first-name="editedItem.assignedUser?.first_name"
        @save-success="handleSaveSuccess"
        @cancel="showForm = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "../../../../utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue"; // Adjust the path as needed
import { debounce } from "lodash";
import { useRouter } from "vue-router";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import { Branch } from "@/pages/taskManagement/taskmodels/Employee";
// State
const loading = ref(false);
const showFilters = ref(true);
const search = ref("");
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const leaveDetailsData = ref([]);
const selectedItems = ref([]);
const isNavigating = ref(false);
// Get tenant ID properly
const tenantId = currentUserTenant.getTenantId();

// Define columns for DataTable
const columns = computed(() => {
  const staticColumns = [
    // { key: "profile", label: "Profile", sortable: false, width: "60px" },
    { key: "name", label: "Employee Name", sortable: false, width: "150px" },
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: false,
      width: "120px",
    },
    {
      key: "organization",
      label: "Organization",
      sortable: false,
      width: "130px",
    },
    { key: "department", label: "Department", sortable: false, width: "130px" },
    {
      key: "attendanceCategory",
      label: "Attendance Category",
      sortable: false,
      width: "120px",
    },
    {
      key: "dateOfLeaving",
      label: "Date of Leaving",
      sortable: false,
      width: "120px",
    },
  ];

  if (uniqueLeaveTypes.value.length > 0) {
    const leaveTypeColumns = uniqueLeaveTypes.value.map((leaveType) => ({
      key: leaveType,
      label: leaveType
        .split(/(?=[A-Z])/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      sortable: false,
      width: "180px",
    }));
    return [...staticColumns, ...leaveTypeColumns];
  } else {
    // If no leave types exist, show a single "Leave Details" column
    return [
      ...staticColumns,
      {
        key: "leaveDetails",
        label: "Leave Details",
        sortable: false,
        width: "200px",
      },
    ];
  }
});
const initialFilters = computed(() => ({
  organization: filters.organization,
  department: filters.department,
  branch: filters.branch,
}));
// Compute unique leave types
const uniqueLeaveTypes = computed(() => {
  const leaveTypes = new Set();
  leaveDetailsData.value.forEach((employee) => {
    if (employee.leaves?.leaveBalance) {
      Object.keys(employee.leaves.leaveBalance).forEach((type) =>
        leaveTypes.add(type),
      );
    }
    if (employee.leaves?.leaveTaken) {
      Object.keys(employee.leaves.leaveTaken).forEach((type) =>
        leaveTypes.add(type.replace(/^t/, "")),
      );
    }
  });
  return Array.from(leaveTypes);
});

// Computed Properties
const hasActiveFilters = computed(() => {
  return (
    filters.employeeStatus.length > 0 ||
    filters.leaveType.length > 0 ||
    filters.organization ||
    filters.branch ||
    filters.department ||
    filters.role ||
    filters.gender ||
    filters.dateFrom ||
    filters.dateTo ||
    search.value !== ""
  );
});
const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchLeaveDetails();
};
const allItemsSelected = computed(() => {
  return (
    leaveDetailsData.value.length > 0 &&
    selectedItems.value.length === leaveDetailsData.value.length
  );
});

const someItemsSelected = computed(() => {
  return (
    selectedItems.value.length > 0 &&
    selectedItems.value.length < leaveDetailsData.value.length
  );
});
const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};
const filteredLeaveDetails = computed(() => {
  return leaveDetailsData.value;
});

// Filters
const filters = reactive({
  employeeStatus: [],
  leaveType: [],
  organization: "", // Add if needed for FilterComponent
  department: "",
  branch: "", // Add if needed for FilterComponent
  role: "", // Add if needed for FilterComponent
  gender: "", // Add if needed for FilterComponent
  dateFrom: "", // Add if needed for FilterComponent
  dateTo: "", // Add if needed for FilterComponent
});
const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];
// Check if employee has left
const isEmployeeLeft = (employee) => {
  if (!employee.assignedUser?.dateOfLeaving) {
    return false;
  }
  const today = new Date();
  const leavingDate = new Date(employee.assignedUser.dateOfLeaving);
  today.setHours(0, 0, 0, 0);
  leavingDate.setHours(0, 0, 0, 0);
  return leavingDate <= today;
};

// Get balance class
const getBalanceClass = (balance, isLeft = false) => {
  if (isLeft) return "text-muted";
  if (balance === 0) return "zero-balance";
  if (balance < 0) return "negative-balance";
  return "positive-balance";
};

// API Logic
const router = useRouter();

const fetchLeaveDetails = async (
  currentPage = page.value,
  currentItemsPerPage = itemsPerPage.value,
  searchTerm = search.value,
) => {
  try {
    loading.value = true;
    const token = authService.getToken();
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const tenantId = currentUserTenant.getTenantId();
    const userRole = userDetails.role?.name;
    const userId = userDetails.id;

    let baseUrl = `${import.meta.env.VITE_API_URL}/items/personalModule`;
    let fields = [
      "assignedUser.id",
      "assignedUser.first_name",
      "assignedUser.tenant",
      "assignedUser.dateOfLeaving",
      "config.configName",
      "config.id",
      "assignedUser.avatar.id",
      "assignedUser.avatar.type",
      "assignedUser.avatar.title",
      "department.id",
      "department.departmentName",
      "branch.id",
      "branch.branchName",
      "assignedUser.tenant.tenantId",
      "assignedUser.organization.orgName",
      "id",
      "employeeId",
      "leaves.id",
      "leaves.leaveBalance",
      "leaves.leaveTaken",
    ];

    let filterParams = [];

    // Role-based filtering
    if (userRole === "Admin" || userRole === "Dealer") {
      filterParams.push(
        `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      );
      // Apply extra filters
      if (filters.organization) {
        filterParams.push(
          `filter[assignedUser][organization][id][_eq]=${filters.organization}`,
        );
      }
      if (filters.department) {
        filterParams.push(`filter[department][id][_eq]=${filters.department}`);
      }
      if (filters.branch) {
        filterParams.push(`filter[branchLocation][id][_eq]=${filters.branch}`);
      }
    } else {
      filterParams.push(`filter[_or][0][approver][id][_eq]=${userId}`);
      filterParams.push(`filter[_or][1][assignedUser][id][_eq]=${userId}`);
    }

    // Search term
    if (searchTerm) {
      filterParams.push(`filter[_or][0][employeeId][_icontains]=${searchTerm}`);
      filterParams.push(
        `filter[_or][1][assignedUser][first_name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][2][assignedUser][last_name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][3][department][departmentName][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][4][branch][branchName][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][5][assignedUser][organization][orgName][_icontains]=${searchTerm}`,
      );
    } else {
      filterParams.push(`limit=${currentItemsPerPage}`);
      filterParams.push(`page=${currentPage}`);
    }

    // Sorting
    if (Array.isArray(sortBy.value) && sortBy.value.length > 0) {
      const sortParam = sortBy.value
        .map((sortItem) => {
          const direction = sortItem.order === "desc" ? "-" : "";
          return `${direction}${sortItem.key}`;
        })
        .join(",");
      filterParams.push(`sort=${sortParam}`);
    }

    // Apply employee status filter
    if (filters.employeeStatus.length) {
      if (
        filters.employeeStatus.includes("Active") &&
        !filters.employeeStatus.includes("Left")
      ) {
        filterParams.push(`filter[assignedUser][dateOfLeaving][_null]=true`);
      } else if (
        filters.employeeStatus.includes("Left") &&
        !filters.employeeStatus.includes("Active")
      ) {
        filterParams.push(`filter[assignedUser][dateOfLeaving][_nnull]=true`);
      }
    }

    // Apply leave type filter
    if (filters.leaveType.length) {
      filters.leaveType.forEach((type, index) => {
        filterParams.push(
          `filter[_or][${index + 6}][leaves][leaveBalance][${type}][_gt]=0`,
        );
      });
    }

    // Construct URL
    let url = `${baseUrl}?${fields.map((f) => `fields[]=${f}`).join("&")}&${filterParams.join("&")}`;

    // Fetch employee data
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    // Process employee data with leave information
    let processedData = await Promise.all(
      data.data.map(async (employee) => {
        if (employee.assignedUser.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${
            employee.assignedUser.avatar.id
          }`;
          employee.avatarImage = await fetchAuthorizedImage(avatarUrl);
        }
        return {
          ...employee,
          name: employee.assignedUser?.first_name || "N/A",
          employeeId: employee.employeeId || "-",
          organization: employee.assignedUser?.organization?.orgName || "N/A",
          department: employee.department?.departmentName || "-",
          attendanceCategory: employee.config?.configName || "-",
          dateOfLeaving: employee.assignedUser?.dateOfLeaving || "-",
          ...Object.fromEntries(
            uniqueLeaveTypes.value.map((leaveType) => [
              leaveType,
              employee.leaves?.leaveBalance?.[leaveType] || 0,
            ]),
          ),
        };
      }),
    );

    leaveDetailsData.value = processedData;
    console.log(leaveDetailsData.value);
    // Fetch total count
    let countUrl = `${baseUrl}?${filterParams.join("&")}&aggregate[countDistinct]=id`;
    const countResponse = await fetch(countUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const countData = await countResponse.json();
    totalItems.value = parseInt(countData.data[0].countDistinct.id);
  } catch (error) {
    console.error("Error fetching leave details:", error);
  } finally {
    loading.value = false;
  }
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const token = authService.getToken();
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// Import handlers
const handleImportSuccess = (result) => {
  console.log("Import successful:", result);
  fetchLeaveDetails();
  alert(`Successfully imported ${result.imported || 0} leave balance records`);
};

const handleImportError = (error) => {
  console.error("Import failed:", error);
  alert(
    "Import failed: " + (error.message || "An error occurred during import"),
  );
};

// Debounced search
const debouncedSearch = debounce(() => {
  fetchLeaveDetails(1, itemsPerPage.value, search.value);
}, 300);

// Sorting handlers
const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newSortDirection) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newSortDirection }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchLeaveDetails();
};

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  selectedItems.value = [];
  fetchLeaveDetails();
};

const applyFilters = () => {
  page.value = 1;
  fetchLeaveDetails();
  showFilters.value = false;
};

const toggleItemSelection = (itemId) => {
  if (selectedItems.value.includes(itemId)) {
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId);
  } else {
    selectedItems.value.push(itemId);
  }
};

const toggleSelectAll = () => {
  if (allItemsSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = leaveDetailsData.value
      .filter((item) => !isEmployeeLeft(item))
      .map((item) => item.id);
  }
};

// In the first code snippet, replace the existing handleRowClick with this:
const handleRowClick = (item) => {
  if (isEmployeeLeft(item)) {
    console.log("Cannot navigate: Employee has left.");
    return;
  }

  if (item && item.id) {
    isNavigating.value = true;
    router.push({
      name: "EmployeeForm",
      params: { id: item.id, module: "leavePolicy" },
    });
  } else {
    console.error("Invalid item or item ID");
  }
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchLeaveDetails(page.value, itemsPerPage.value);
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchLeaveDetails(newPage, itemsPerPage.value, search.value);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchLeaveDetails(1, newItemsPerPage, search.value);
};

// Lifecycle hooks
onMounted(async () => {
  await fetchLeaveDetails();
});

// Watch for changes
watch(
  [search, sortBy],
  () => {
    debouncedSearch();
  },
  { deep: true },
);
</script>

<style scoped>
/* Leave Container */
.leave-container {
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

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  max-width: none;
}

/* Search */
.search-container {
  flex: 1;
  max-width: 400px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input svg {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.search-input input {
  width: 100%;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  background: transparent;
  color: #1e293b;
}

.search-input input:focus {
  outline: none;
}

.search-input input::placeholder {
  color: #9ca3af;
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #e5e7eb;
  color: #6b7280;
  transform: scale(1.1);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Main Content Area */
.main-content-area {
  flex: 1;
  overflow-y: auto;
  background-color: #f9fafb;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
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
  font-size: 0.85rem;
  color: #1e293b;
}

/* Leave Info Cell */
.leave-info-cell {
  display: flex;
  gap: 4px;
  padding: 8px 4px;
  min-width: 120px;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

/* Checkbox */
.custom-checkbox:indeterminate::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: white;
  transform: translate(-50%, -50%);
  border-radius: 1px;
}

.custom-checkbox:disabled {
  background-color: #e2e8f0;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }

  .search-container {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .leave-container {
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

  .header-content {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }
}
</style>

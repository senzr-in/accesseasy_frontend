<template>
  <div class="employee-container">
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
        :searchPlaceholder="'Search employees...'"
        :isEmpty="filteredItems.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
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
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </button>
        </template>
        <template v-slot:actions>
          <div class="header-actions">
            <button
              v-if="selectedItems.length > 0"
              class="btn-danger"
              @click="deleteSelected"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-trash"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete ({{ selectedItems.length }})
            </button>
            <EmployeeOtherDetailsExcelExport
              :headers="headers"
              :items="filteredItems"
              :filters="filters"
              :search="search"
            />
          </div>
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
            title="Unable to load employees"
            :message="error"
            @retry="fetchEmployeeData"
          />
        </div>

        <div v-else-if="filteredItems.length === 0">
          <EmptyState
            title="No employees found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearAllFilters"
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
            <!-- Avatar Column -->
            <template #cell-avatarImage="{ item }">
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

            <!-- Employee Name Column -->
            <template #cell-assignedUser.first_name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.assignedUser?.first_name || "Unknown" }}
                </h3>
                <p class="employee-email">
                  {{ item.assignedUser?.email || "No email" }}
                </p>
              </div>
            </template>

            <!-- Gender Column -->
            <template #cell-assignedUser.gender="{ item }">
              <span>{{ item.assignedUser?.gender || "N/A" }}</span>
            </template>

            <!-- DOB Column -->
            <template #cell-assignedUser.DOB="{ item }">
              <span>{{ formatDate(item.assignedUser?.DOB) }}</span>
            </template>

            <!-- Blood Group Column -->
            <template #cell-assignedUser.bloodGroup="{ item }">
              <span>{{ item.assignedUser?.bloodGroup || "N/A" }}</span>
            </template>

            <!-- Marital Status Column -->
            <template #cell-assignedUser.maritalStatus="{ item }">
              <span>{{ item.assignedUser?.maritalStatus || "N/A" }}</span>
            </template>

            <!-- Tag Status Column -->
            <template #cell-tagStatus="{ item }">
              <span>{{ getTagStatus(item) }}</span>
            </template>

            <!-- Date of Leaving Column -->
            <template #cell-assignedUser.dateOfLeaving="{ item }">
              <span>{{ formatDate(item.assignedUser?.dateOfLeaving) }}</span>
            </template>

            <!-- Date of Joining Column -->
            <template #cell-assignedUser.dateOfJoining="{ item }">
              <span>{{ formatDate(item.assignedUser?.dateOfJoining) }}</span>
            </template>

            <!-- ESI Account Number Column -->
            <template #cell-assignedUser.ESIAccountNumber="{ item }">
              <span>{{ item.assignedUser?.ESIAccountNumber || "N/A" }}</span>
            </template>

            <!-- PF Account Number Column -->
            <template #cell-assignedUser.PFAccountNumber="{ item }">
              <span>{{ item.assignedUser?.PFAccountNumber || "N/A" }}</span>
            </template>

            <!-- Permanent Address Column -->
            <template #cell-assignedUser.permanent_Address="{ item }">
              <span class="address-text">{{
                item.assignedUser?.permanent_Address || "N/A"
              }}</span>
            </template>

            <!-- Current Address Column -->
            <template #cell-assignedUser.current_Address="{ item }">
              <span class="address-text">{{
                item.assignedUser?.current_Address || "N/A"
              }}</span>
            </template>

            <!-- Emergency Contact Column -->
            <template #cell-assignedUser.emergency_Contact_Name="{ item }">
              <span>{{
                item.assignedUser?.emergency_Contact_Name || "N/A"
              }}</span>
            </template>

            <!-- Emergency Contact Number Column -->
            <template
              #cell-assignedUser.emergency_Contact_Mobile_Number="{ item }"
            >
              <span>{{
                item.assignedUser?.emergency_Contact_Mobile_Number || "N/A"
              }}</span>
            </template>

            <!-- Emergency Relationship Column -->
            <template
              #cell-assignedUser.emergency_Contact_Relationship="{ item }"
            >
              <span>{{
                item.assignedUser?.emergency_Contact_Relationship || "N/A"
              }}</span>
            </template>

            <!-- Guardian's Name Column -->
            <template #cell-assignedUser.guardians_Name="{ item }">
              <span>{{ item.assignedUser?.guardians_Name || "N/A" }}</span>
            </template>

            <!-- Aadhar Column -->
            <template #cell-assignedUser.aadhar="{ item }">
              <SensitiveDataView
                :encrypted-value="item.assignedUser?.aadhar"
                field-name="aadhar"
              />
            </template>

            <!-- PAN Column -->
            <template #cell-assignedUser.pan="{ item }">
              <SensitiveDataView
                :encrypted-value="item.assignedUser?.pan"
                field-name="pan"
              />
            </template>

            <!-- UAN Column -->
            <template #cell-assignedUser.UAN="{ item }">
              <SensitiveDataView
                :encrypted-value="item.assignedUser?.UAN"
                field-name="UAN"
              />
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

      <!-- RFID Card Popup -->
      <RfidCardPopup ref="rfidCardPopup" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
import { useRouter } from "vue-router";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import EmployeeOtherDetailsExcelExport from "./excelExport/employeeExcelExport.vue";
import RfidCardPopup from "./rfidCardPopup.vue";
import SensitiveDataView from "@/components/sensitiveData/sensitiveDataView.vue";

// State
const rfidCardPopup = ref(null);
const router = useRouter();
const tenantId = ref(currentUserTenant.getTenantId());
const loading = ref(false);
const error = ref(null);
const showFilters = ref(true);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([{ key: "assignedUser.first_name", order: "asc" }]);
const items = ref([]);
const selectedItems = ref([]);
const userRole = ref(currentUserTenant.getRole());
const userId = ref(currentUserTenant.getUserId());
const managerBranchId = ref(null);

// Filter Options
const branchOptions = ref([]);
const departmentOptions = ref([]);
const roleOptions = ref([]);
const accessLevelOptions = ref([]);

// Filters
const filters = reactive({
  organization: "",
  branch: "",
  department: "",
  role: [],
  accessLevel: [],
  gender: [],
  dateFrom: "",
  dateTo: "",
});

const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

// Computed Properties
const columns = computed(() => [
  { key: "avatarImage", label: "Avatar", sortable: false, width: "0.8" },
  {
    key: "assignedUser.first_name",
    label: "Name",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.gender",
    label: "Gender",
    sortable: false,
    width: "1",
  },
  { key: "assignedUser.DOB", label: "DOB", sortable: false, width: "1.2" },
  {
    key: "assignedUser.bloodGroup",
    label: "Blood Group",
    sortable: false,
    width: "1.2",
  },
  {
    key: "assignedUser.maritalStatus",
    label: "Marital Status",
    sortable: false,
    width: "1.4",
  },
  { key: "tagStatus", label: "Tag Status", sortable: false, width: "180px" },
  {
    key: "assignedUser.dateOfLeaving",
    label: "Date of Leaving",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.dateOfJoining",
    label: "Date of Joining",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.ESIAccountNumber",
    label: "ESI AccNo",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.PFAccountNumber",
    label: "PF AccNo",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.permanent_Address",
    label: "Permanent Address",
    sortable: false,
    width: "2",
  },
  {
    key: "assignedUser.current_Address",
    label: "Current Address",
    sortable: false,
    width: "2",
  },
  {
    key: "assignedUser.emergency_Contact_Name",
    label: "Emergency Contact",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.emergency_Contact_Mobile_Number",
    label: "Emergency Contact Number",
    sortable: false,
    width: "1.8",
  },
  {
    key: "assignedUser.emergency_Contact_Relationship",
    label: "Emergency Relationship",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.guardians_Name",
    label: "Guardian's Name",
    sortable: false,
    width: "1.5",
  },
  {
    key: "assignedUser.aadhar",
    label: "Aadhar",
    sortable: false,
    width: "1.2",
  },
  { key: "assignedUser.pan", label: "PAN", sortable: false, width: "1.2" },
  { key: "assignedUser.UAN", label: "UAN", sortable: false, width: "1.5" },
]);

const initialFilters = computed(() => ({
  branch: filters.branch,
  department: filters.department,
  organization: filters.organization,
  role: filters.role,
  accessLevel: filters.accessLevel,
  gender: filters.gender,
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.branch ||
    filters.organization ||
    filters.department ||
    filters.role.length > 0 ||
    filters.accessLevel.length > 0 ||
    filters.gender.length > 0 ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    search.value !== ""
  );
});

const filteredItems = computed(() => items.value);

// Helper Functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const getStatusClass = (status) => {
  if (!status) return "status-default";
  const statusLower = status.toLowerCase();
  if (statusLower === "active") return "status-successful";
  if (statusLower === "inactive") return "status-failed";
  return "status-default";
};

const getTagStatus = (item) => {
  const tagCard = item.assignedCards?.find(
    (card) => card.cardManagement_id?.type === "tag"
  );
  if (tagCard) {
    return `${tagCard.cardManagement_id.rfidCard} (${
      tagCard.cardManagement_id.cardAccess ? "Enabled" : "Disabled"
    })`;
  }
  return "N/A";
};

const getRfidCardCount = (item) => {
  return (
    item.assignedCards?.filter(
      (card) => card.cardManagement_id?.type === "rfid"
    ).length || 0
  );
};

const showRfidCards = (item) => {
  const rfidCards =
    item.assignedCards?.filter(
      (card) => card.cardManagement_id?.type === "rfid"
    ) || [];
  rfidCardPopup.value?.open(rfidCards);
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const token = authService.getToken();
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
  if (userRole.value === "Manager" && userId.value) {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][id][_eq]=${userId.value}&fields=branch.id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      managerBranchId.value = data.data[0]?.branch?.id || null;
    } catch (error) {
      console.error("Error fetching manager's branch:", error);
    }
  }
};

// const fetchFilterOptions = async () => {
//   try {
//     const token = authService.getToken();
//     const params = new URLSearchParams({
//       "filter[tenant][tenantId][_eq]": tenantId.value,
//     });

//     const [branchRes, departmentRes, roleRes, accessLevelRes] =
//       await Promise.all([
//         fetch(
//           `${import.meta.env.VITE_API_URL}/items/branch?${params}&fields=branchName`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         ),
//         fetch(
//           `${import.meta.env.VITE_API_URL}/items/department?${params}&fields=departmentName`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         ),
//         fetch(
//           `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer&fields=name`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         ),
//         fetch(
//           `${import.meta.env.VITE_API_URL}/items/accesslevels?${params}&fields=accessLevelName`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         ),
//       ]);

//     const [branchData, departmentData, roleData, accessLevelData] =
//       await Promise.all([
//         branchRes.json(),
//         departmentRes.json(),
//         roleRes.json(),
//         accessLevelRes.json(),
//       ]);

//     branchOptions.value = branchData.data.map((b) => ({
//       title: b.branchName,
//       value: b.branchName,
//     }));
//     departmentOptions.value = departmentData.data.map((d) => ({
//       title: d.departmentName,
//       value: d.departmentName,
//     }));
//     roleOptions.value = roleData.data.map((r) => ({
//       title: r.name,
//       value: r.name,
//     }));
//     accessLevelOptions.value = accessLevelData.data.map((a) => ({
//       title: a.accessLevelName,
//       value: a.accessLevelName,
//     }));
//   } catch (error) {
//     console.error("Error fetching filter options:", error);
//   }
// };

const fetchEmployeeData = async (
  currentPage = page.value,
  currentItemsPerPage = itemsPerPage.value,
  searchTerm = search.value
) => {
  try {
    loading.value = true;
    error.value = null;

    const token = authService.getToken();
    const fields = [
      "employeeId",
      "accessOn",
      "status",
      "assignedUser.appAccess",
      "config.configName",
      "config.id",
      "salaryConfig.configName",
      "salaryConfig.id",
      "controllerStatus",
      "assignedCards.cardManagement_id.id",
      "assignedCards.cardManagement_id.rfidCard",
      "assignedCards.cardManagement_id.type",
      "assignedCards.cardManagement_id.cardAccess",
      "assignedTag.cardManagement_id.rfidCard",
      "assignedTag.cardManagement_id.type",
      "assignedTag.cardManagement_id.cardAccess",
      "assignedAccessLevels.accesslevels_id.accessLevelName",
      "assignedAccessLevels.accesslevels_id.id",
      "assignedAccessLevels.accesslevels_id.accessLevelNumber",
      "department.id",
      "department.departmentName",
      "branch.branchName",
      "branch.id",
      "id",
      "assignedCards.id",
      "assignedTag.id",
      "assignedAccessLevels.id",
      "assignedUser.first_name",
      "assignedUser.phone",
      "assignedUser.email",
      "assignedUser.avatar.id",
      "assignedUser.avatar.type",
      "assignedUser.avatar.title",
      "assignedUser.tenant.tenantId",
      "assignedUser.tenant.tenantName",
      "assignedUser.role.name",
      "assignedUser.role.id",
      "assignedUser.id",
      "date_created",
      "assignedUser.accountNumber",
      "assignedUser.aadhar",
      "assignedUser.IFSC",
      "assignedUser.gender",
      "assignedUser.UPI",
      "assignedUser.dateOfLeaving",
      "assignedUser.dateOfJoining",
      "assignedUser.DOB",
      "assignedUser.PFAccountNumber",
      "assignedUser.maritalStatus",
      "assignedUser.ESIAccountNumber",
      "assignedUser.officeEmail",
      "assignedUser.pan",
      "assignedUser.bloodGroup",
      "assignedUser.gst",
      "assignedUser.permanent_Address",
      "assignedUser.current_Address",
      "assignedUser.emergency_Contact_Name",
      "assignedUser.emergency_Contact_Mobile_Number",
      "assignedUser.emergency_Contact_Relationship",
      "assignedUser.emergency_Contact_Address",
      "assignedUser.guardians_Name",
      "assignedUser.voter_ID",
      "assignedUser.driving_License",
      "assignedUser.UAN",
      "assignedUser.verification",
      "previousRecord.id",
      "previousRecord.previousRecord_id.id",
      "previousRecord.previousRecord_id.companyName",
      "previousRecord.previousRecord_id.Designation",
      "previousRecord.previousRecord_id.joiningDate",
      "previousRecord.previousRecord_id.leavingDate",
      "previousRecord.previousRecord_id.Currency",
      "previousRecord.previousRecord_id.salary",
    ];

    let filterParams = [];

    // Role-based filtering
    if (userRole.value === "Admin" || userRole.value === "Dealer") {
      filterParams.push(
        `filter[assignedUser][tenant][tenantId][_eq]=${tenantId.value}`
      );
    } else {
      filterParams.push(`filter[_or][0][approver][id][_eq]=${userId.value}`);
      filterParams.push(
        `filter[_or][1][assignedUser][id][_eq]=${userId.value}`
      );
    }

    // Search term
    if (searchTerm) {
      filterParams.push(`filter[_or][0][employeeId][_contains]=${searchTerm}`);
      filterParams.push(
        `filter[_or][1][assignedUser][first_name][_contains]=${searchTerm}`
      );
      filterParams.push(
        `filter[_or][2][assignedUser][email][_contains]=${searchTerm}`
      );
      filterParams.push(
        `filter[_or][3][branch][branchName][_contains]=${searchTerm}`
      );
    }

    if (filters.organization) {
      filterParams.push(
        `filter[assignedUser][organization][id][_eq]=${filters.organization}`
      );
    }

    // 🔹 Department
    if (filters.department) {
      filterParams.push(`filter[department][id][_eq]=${filters.department}`);
    }

    // 🔹 Branch
    if (filters.branch) {
      filterParams.push(`filter[branchLocation][id][_eq]=${filters.branch}`);
    }

    if (filters.role.length) {
      filterParams.push(
        `filter[assignedUser][role][name][_in]=${filters.role.join(",")}`
      );
    }
    if (filters.accessLevel.length) {
      filterParams.push(
        `filter[assignedAccessLevels][accesslevels_id][accessLevelName][_in]=${filters.accessLevel.join(",")}`
      );
    }
    if (filters.gender.length) {
      filterParams.push(
        `filter[assignedUser][gender][_in]=${filters.gender.join(",")}`
      );
    }
    if (filters.dateFrom) {
      filterParams.push(
        `filter[assignedUser][dateOfJoining][_gte]=${filters.dateFrom}`
      );
    }
    if (filters.dateTo) {
      filterParams.push(
        `filter[assignedUser][dateOfJoining][_lte]=${filters.dateTo}`
      );
    }

    if (sortBy.value.length > 0) {
      const sortParam = sortBy.value
        .map((sortItem) => {
          const direction = sortItem.order === "desc" ? "-" : "";
          return `${direction}${sortItem.key}`;
        })
        .join(",");
      filterParams.push(`sort=${sortParam}`);
    }

    const queryString = [
      ...fields.map((f) => `fields[]=${f}`),
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
      }
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
      })
    );

    // Fetch total count
    const countUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${filterParams.join("&")}&aggregate[countDistinct]=id`;
    const countResponse = await fetch(countUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countData = await countResponse.json();
    totalItems.value = parseInt(countData.data[0].countDistinct.id);
  } catch (err) {
    console.error("Error fetching employee data:", err);
    error.value = err.message || "Failed to load employees";
  } finally {
    loading.value = false;
  }
};

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchEmployeeData();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const clearAllFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  selectedItems.value = [];
  sortBy.value = [{ key: "assignedUser.first_name", order: "asc" }];
  fetchEmployeeData();
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
  fetchEmployeeData();
};

const handleRowClick = (item) => {
  if (item && item.id) {
    router.push(`/employee-details/employee/${item.id}/personalmodule`);
  } else {
    console.error("Invalid item or item ID");
  }
};

const deleteSelected = async () => {
  if (!selectedItems.value.length) {
    alert("Please select items to delete");
    return;
  }

  if (
    confirm(
      `Are you sure you want to delete ${selectedItems.value.length} selected employee(s)?`
    )
  ) {
    try {
      const token = authService.getToken();
      let errors = 0;
      for (const itemId of selectedItems.value) {
        const item = items.value.find((emp) => emp.id === itemId);
        if (!item) continue;

        const deletePromises = [
          fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule/${itemId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ];

        if (item.assignedUser?.id) {
          deletePromises.push(
            fetch(
              `${import.meta.env.VITE_API_URL}/users/${item.assignedUser.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          );
        }

        try {
          await Promise.all(deletePromises);
        } catch (error) {
          console.error(`Error deleting item ${itemId}:`, error);
          errors++;
        }
      }

      selectedItems.value = [];
      if (errors === 0) {
        alert("Selected employees deleted successfully");
      } else {
        alert(
          `Operation completed with ${errors} errors. Please refresh the page.`
        );
      }

      await fetchEmployeeData();
    } catch (error) {
      console.error("Error in delete operation:", error);
      alert("An error occurred during the delete operation. Please try again.");
    }
  }
};

const debouncedSearch = debounce(() => {
  fetchEmployeeData(1, itemsPerPage.value, search.value);
}, 300);

const handlePageChange = async (newPage) => {
  page.value = newPage;
  await fetchEmployeeData();
};

const handleItemsPerPageChange = async (newLimit) => {
  itemsPerPage.value = newLimit;
  page.value = 1;
  await fetchEmployeeData();
};

// Lifecycle Hooks
onMounted(async () => {
  // await fetchManagerBranch();
  // await fetchFilterOptions();
  await fetchEmployeeData();
  await currentUserTenant.fetchLoginUserDetails();
  tenantId.value = currentUserTenant.getTenantId();
});

onUnmounted(() => {
  debouncedSearch.cancel();
});
</script>

<style scoped>
.employee-container {
  display: flex;
  height: 100vh;
  position: relative;
  background-color: #f8fafc;
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
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.employee-name {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}

.employee-email {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-successful {
  background: #dcfce7;
  color: #166534;
}

.status-failed {
  background: #fee2e2;
  color: #dc2626;
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

/* Buttons */
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Address Text */
.address-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .employee-container {
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

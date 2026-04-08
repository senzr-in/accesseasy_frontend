<template>
  <div class="employee-container" :class="{ 'drawer-open': showAdvanceDrawer }">
    <!-- toast msg -->
    <ToastContainer ref="toastRef" />

    <!-- Filter Panel -->
    <div class="filter-panel" v-if="showFilters && tenantId">
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

    <!-- Main Content -->
    <div
      class="main-content"
      v-if="tenantId"
      :class="{ 'full-width': !showFilters }"
    >
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Employee...'"
        :isEmpty="items.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <template #before-search>
          <!-- Filter Toggle Button -->
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
        <!-- Loading State -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="itemsPerPage || 10"
            :columns="headers.length"
          />
        </div>

        <!-- Error State -->
        <div v-else-if="error">
          <ErrorState
            title="Unable to load employee data"
            :message="error"
            @retry="fetchEmployees"
          />
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0">
          <EmptyState
            title="No employee data found"
            message="Try adjusting your search criteria"
            :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            v-model="selected"
            :items="paginatedItems"
            :columns="headers"
            :sortBy="sortBy"
            :sortDirection="sortDirection"
            :showSelection="true"
            :expandable="false"
            :rowClickable="true"
            @sort="handleSort"
            @rowClick="openViewDrawer($event, 'view')"
          >
            <!-- Employee Name Column -->
            <template #cell-employee.assignedUser.first_name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.employee?.assignedUser?.first_name || "Unknown" }}
                </h3>
              </div>
            </template>

            <!-- employeeId Column -->
            <template #cell-employee.employeeId="{ item }">
              <span class="role-badge">
                {{ item.employee?.employeeId || "No role" }}
              </span>
            </template>

            <!-- Monthly CTC Column -->
            <template #cell-monthlyCTC="{ item }">
              <span>{{ item.filteredMonthlyCTC || "0" }}</span>
            </template>

            <!-- Actions Column -->
            <template #cell-actions="{ item }">
              <div class="actions-container">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click.stop="
                    openViewDrawer(item.id, 'add');
                    resetBenefitsForm();
                  "
                  class="mr-2"
                  clickable
                >
                  Add Loan
                </v-btn>
                <div class="view-section">
                  <v-chip
                    color="info"
                    variant="outlined"
                    size="small"
                    @click.stop="openViewDrawer(item.id, 'view')"
                    class="view-chip"
                    clickable
                  >
                    View Details
                  </v-chip>
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
            :total-items="totalFilteredItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>

    <!-- View Drawer -->
    <AdvanceDrawer
      v-model:show="showAdvanceDrawer"
      :employee-id="selectedEmployeeId"
      :mode="drawerMode"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import debounce from "lodash/debounce";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import AdvanceDrawer from "@/pages/payroll/advanceLoan/loan/loanAdd.vue";

const loading = ref(false);
const error = ref(null);
const activeFilters = ref({});
const search = ref("");
const selected = ref([]);
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = ref("");
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const sortBy = ref("");
const sortDirection = ref("asc");
const toastRef = ref(null);
const employeeSalaryBreakdown = ref(null);

const showFilters = ref(true);
const viewDrawer = ref(false);
const viewedEmployee = ref(null);
const editMode = ref(false);
const employeeBenefits = ref({
  advanceManual: [],
});
const showAdvanceDrawer = ref(false);
const selectedEmployeeId = ref(null);
const drawerMode = ref("view");
const menu = ref(false);

const editingBenefits = ref({
  reason: "",
  amount: null,
  month: null,
  notes: "",
  index: null,
});

const updatingBenefits = ref(false);

const items = ref([]);
const headers = ref([
  {
    key: "employee.employeeId",
    label: "EmployeeId",
    sortable: false,
    width: "120px",
  },
  {
    key: "employee.assignedUser.first_name",
    label: "Employee Name",
    sortable: false,
    width: "200px",
  },
  { key: "monthlyCTC", label: "Monthly CTC", sortable: false, width: "20%" },
  { key: "loanCredit", label: "Loan Credit", sortable: false, width: "15%" },
  { key: "loanDebit", label: "Loan Deduct", sortable: false, width: "15%" },

  { key: "actions", label: "Actions", sortable: false, width: "25%" },
]);

const filters = reactive({
  role: [],
  branch: [],
  department: [],
  organization: "",
});

const pageFilters = [
  { key: "organization", label: "Organization", type: "select", show: true },
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
  { key: "monthYear", label: "Month & Year", type: "month", show: true },
  {
    key: "attendanceCycle",
    label: "Attendance Cycle",
    type: "select",
    show: true,
  },
];

const initialFilters = computed(() => ({
  role: filters.role,
  branch: filters.branch,
  department: filters.department,
  organization: filters.organization,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.role.length > 0 ||
    filters.branch.length > 0 ||
    filters.department.length > 0 ||
    filters.organization ||
    !!search.value
  );
});

// Computed Properties
const filteredItems = computed(() => {
  let filtered = [...items.value];

  if (search.value.trim()) {
    const query = search.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.assignedUser?.first_name?.toLowerCase().includes(query) ||
        item.employeeId?.toLowerCase().includes(query),
    );
  }

  if (sortBy.value) {
    filtered.sort((a, b) => {
      let valueA, valueB;
      if (sortBy.value.includes(".")) {
        const [parent, child] = sortBy.value.split(".");
        valueA = a[parent]?.[child] || "";
        valueB = b[parent]?.[child] || "";
      } else {
        valueA = a[sortBy.value] || "";
        valueB = b[sortBy.value] || "";
      }
      const direction = sortDirection.value === "asc" ? 1 : -1;
      if (typeof valueA === "string") {
        return valueA.localeCompare(valueB) * direction;
      }
      return (valueA - valueB) * direction;
    });
  }

  return filtered;
});

const totalFilteredItems = computed(() => filteredItems.value.length);

const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

// Utility Functions
const getInitials = (item) => {
  const firstName = item.assignedUser?.first_name || "";
  return firstName.charAt(0).toUpperCase() || "??";
};

const getAvatarColor = (item) => {
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];
  const employeeId = item.employeeId || item.id?.toString() || "";
  const sum = employeeId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

const calculateTotal = () => {
  return employeeBenefits.value.advanceManual.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );
};

const getMonthName = (monthNumber) => {
  return months.find((m) => m.value === monthNumber)?.title || "Unknown";
};

const resetBenefitsForm = () => {
  editingBenefits.value = {
    reason: "",
    amount: null,
    month: null,
    notes: "",
    index: null,
  };
};

const showSuccessMessage = (message) => {
  console.log("Success:", message);
};

const showErrorMessage = (message) => {
  console.error("Error:", message);
};

// Event Handlers
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  page.value = 1;
  fetchEmployees();
};

const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchEmployees();
}, 300);

const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
  page.value = 1;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
};

const editSpecificBenefit = (index) => {
  const advance = employeeBenefits.value.advanceManual[index];
  editingBenefits.value = {
    reason: advance.reason || "",
    amount: advance.amount || 0,
    month: advance.month || null,
    notes: advance.notes || "",
    index: index,
  };
  editMode.value = true;
};

const navigateToBenefits = () => {
  editMode.value = true;
  resetBenefitsForm();
};

const cancelEdit = () => {
  editMode.value = false;
  resetBenefitsForm();
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  activeFilters.value = {
    cycleType: newFilters.attendanceCycle
      ? parseInt(newFilters.attendanceCycle)
      : null,
  };
  fetchEmployees();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

// API Functions
const fetchTenantId = async () => {
  try {
    const id = await currentUserTenant.getTenantId();
    if (!id) {
      throw new Error("Tenant ID is null or undefined");
    }
    tenantId.value = id;
  } catch (err) {
    console.error("Error fetching tenantId:", err);
    error.value = err.message || "Failed to fetch tenant ID";
  }
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId.value) {
      toastRef.value = {
        message: "Authentication required or tenant not found",
        type: "error",
        visible: true,
      };
      return;
    }

    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (err) {
    toastRef.value = {
      message: `Failed to fetch employee count: ${err.message}`,
      type: "error",
      visible: true,
    };
  }
};

const fetchEmployees = async () => {
  await aggregateCount();

  if (!token) {
    error.value = "Authentication required. Please login again!";
    return;
  }

  loading.value = true;
  try {
    const params = {
      page: page.value,
      limit: itemsPerPage.value,
      fields: [
        "id",
        "employee.id",
        "employee.employeeId",
        "employee.assignedUser.first_name",
        "employee.assignedUser.role.name",
        "salaryTracking",
        "loanDebit",
        "loanCredit",
      ],
      ...filterParams(),
      sort: sortBy.value.length
        ? sortBy.value
            .map((sortItem) => {
              const direction = sortItem.order === "desc" ? "-" : "";
              return `${direction}${sortItem.key}`;
            })
            .join(",")
        : "-date_created",
    };

    const queryString = Object.keys(params)
      .map((key) =>
        key === "fields"
          ? params[key].map((field) => `fields[]=${field}`).join("&")
          : `${key}=${params[key]}`,
      )
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    items.value =
      data.data.map((item) => {
        let filteredMonthlyCTC = item.monthlyCTC || "0";

        if (filters.monthYear && item.salaryTracking) {
          const [selectedYear, selectedMonth] = filters.monthYear.split("-");
          const selectedDate = new Date(
            Number(selectedYear),
            Number(selectedMonth) - 1,
            1,
          );

          const availableMonths = Object.keys(item.salaryTracking)
            .map((monthStr) => {
              const [month, year] = monthStr.split("/");
              return {
                key: monthStr,
                date: new Date(Number(year), Number(month) - 1, 1),
                value: item.salaryTracking[monthStr],
              };
            })
            .sort((a, b) => b.date - a.date);

          const matchingMonth = availableMonths.find(
            (month) => month.date <= selectedDate,
          );

          if (matchingMonth) {
            filteredMonthlyCTC = matchingMonth.value;
          }
        }

        const getTotal = (data) => data?.[year]?.[month]?.totalAmount || 0;
        const [year, month] = filters.monthYear?.split("-") || [];

        return {
          ...item,
          filteredMonthlyCTC,
          loanCredit: getTotal(item.loanCredit),
          loanDebit: getTotal(item.loanDebit),
        };
      }) || [];
  } catch (err) {
    error.value = "Authentication required. Please login again!";
  } finally {
    loading.value = false;
  }
};

const fetchSalaryBreakdown = async (employeeIds = []) => {
  if (!employeeIds.length) return [];

  try {
    const params = {
      fields: ["*", "employee.employeeId", "advance"],
      "filter[employee][employeeId][_in]": employeeIds.join(","),
      limit: -1,
    };

    const queryString = Object.keys(params)
      .map((key) =>
        key === "fields"
          ? params[key].map((field) => `fields[]=${field}`).join("&")
          : `${key}=${params[key]}`,
      )
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch salary breakdown data");
    }

    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("Error fetching salary breakdown:", err);
    return [];
  }
};

const filterParams = () => {
  const params = {};

  params["filter[employee][assignedUser][tenant][tenantId][_eq]"] =
    tenantId.value;

  if (search.value) {
    params["filter[employee][assignedUser][first_name][_icontains]"] =
      search.value;
  }

  if (filters.organization) {
    params["filter[employee][assignedUser][organization][id][_eq]"] =
      filters.organization;
  }

  if (filters.department.length) {
    params["filter[employee][department][departmentName][_in]"] =
      filters.department.join(",");
  }

  if (filters.branch.length) {
    params["filter[employee][branchLocation][id][_eq]"] =
      filters.branch.join(",");
  }

  if (filters.role.length) {
    params["filter[employee][assignedUser][role][name][_in]"] =
      filters.role.join(",");
  }
  if (activeFilters.value.cycleType) {
    params["filter[employee][cycleType][_eq]"] = parseInt(
      activeFilters.value.cycleType,
    );
  }
  return params;
};

const openViewDrawer = (id, mode) => {
  selectedEmployeeId.value = id;
  drawerMode.value = mode;
  showAdvanceDrawer.value = true;
};

const updateBenefit = async () => {
  updatingBenefits.value = true;
  try {
    const config = editingBenefits.value;

    if (!config.reason) throw new Error("Please select a reason");
    if (!config.amount || config.amount <= 0)
      throw new Error("Please enter a valid amount");
    if (!config.month) throw new Error("Please select a month");

    // Use global salary breakdown fetched in openViewDrawer
    if (!employeeSalaryBreakdown.value)
      throw new Error("Salary breakdown not loaded");

    const salaryBreakdownId = employeeSalaryBreakdown.value.id;
    const currentAdvance = employeeSalaryBreakdown.value.advance || {};

    // Extract year and month
    const [year, month] = config.month.split("-");

    // Ensure year & month objects exist
    currentAdvance[year] ??= {};
    currentAdvance[year][month] ??= { totalAmount: 0 };

    // Create new deduction
    const deductionKey = `advance${Object.keys(currentAdvance[year][month]).length}`;
    currentAdvance[year][month][deductionKey] = {
      reason: config.reason,
      amount: Number(config.amount),
      notes: config.notes,
    };

    // Update totalAmount
    currentAdvance[year][month].totalAmount += Number(config.amount);

    const updatePayload = { advance: currentAdvance };

    // PATCH update to server
    const updateResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${salaryBreakdownId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      },
    );

    if (!updateResponse.ok) throw new Error("Failed to update advance");

    // Sync back to global variable
    employeeSalaryBreakdown.value.advance = currentAdvance;

    editMode.value = false;
    editingBenefits.value.index = null;

    await openViewDrawer(viewedEmployee.value);
    showSuccessMessage("Advance updated successfully!");
  } catch (err) {
    showErrorMessage(`Failed to update advance: ${err.message}`);
  } finally {
    updatingBenefits.value = false;
  }
};

const deleteSpecificBenefit = async (index) => {
  if (!employeeSalaryBreakdown.value) return;

  const currentAdvance = employeeSalaryBreakdown.value.advance || {};
  const item = employeeBenefits.value.advanceManual[index];

  const { year, month, key } = item;

  // Subtract from totalAmount
  if (currentAdvance[year]?.[month]?.[key]) {
    currentAdvance[year][month].totalAmount -= Number(
      currentAdvance[year][month][key].amount,
    );
    delete currentAdvance[year][month][key];
  }

  // Update server
  const updatePayload = { advance: currentAdvance };
  await fetch(
    `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${employeeSalaryBreakdown.value.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    },
  );

  // Remove from UI
  employeeBenefits.value.advanceManual.splice(index, 1);

  // Sync back
  employeeSalaryBreakdown.value.advance = currentAdvance;
};

// Watchers
watch([search, filters], debouncedSearch, { deep: true });

// Lifecycle
onMounted(async () => {
  await fetchTenantId();
  if (tenantId.value) {
    await fetchEmployees();
  } else {
    error.value = "Failed to fetch tenant ID, cannot fetch employee data";
  }
});
</script>

<style scoped>
.employee-container {
  display: flex;
  height: 100vh;
  position: relative;
}

:deep(.table-container) {
  height: calc(95vh - 160px) !important;
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
  transition: margin-right 0.3s ease;
}

.main-content.full-width {
  margin-left: 0;
}

.employee-container.drawer-open .main-content {
  margin-right: 400px;
}

/* Table Cell Styles */
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-width: 200px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.employee-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-id {
  font-size: 0.75rem;
  color: #6b7280;
}

.money-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.money-value {
  font-weight: 500;
  font-size: 0.875rem;
}

/* Navigation Drawer */
.v-navigation-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 90vh;
}

.v-navigation-drawer__content {
  overflow-y: auto;
}

.v-card-text {
  padding: 16px;
}

.v-list-item {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.v-list-item:last-child {
  border-bottom: none;
}

.action-btn {
  text-transform: capitalize;
}

.text-caption {
  color: rgba(0, 0, 0, 0.6);
}

:deep(.v-navigation-drawer__scrim) {
  background: transparent !important;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  flex: 0 0 120px;
  font-weight: 500;
}

.form-field {
  flex: 1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .employee-container.drawer-open .main-content {
    margin-right: 300px;
  }

  .v-navigation-drawer {
    width: 300px !important;
  }

  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .employee-container {
    flex-direction: column;
  }

  .employee-container.drawer-open .main-content {
    margin-right: 0;
  }

  .v-navigation-drawer {
    width: 100% !important;
    position: fixed;
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

  .filter-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 50vh;
    position: relative;
  }
}
</style>

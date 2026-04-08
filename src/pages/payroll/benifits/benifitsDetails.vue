<template>
  <div class="employee-container" :class="{ 'drawer-open': viewDrawer }">
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
        :searchPlaceholder="'Search Employee'"
        :isEmpty="items.length === 0 && !search"
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
            @retry="fetchEmployees"
          />
        </div>

        <div v-else-if="items.length === 0">
          <EmptyState
            title="No Employees found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="items"
            :columns="columns"
            :selectedItems="selected"
            :sortBy="sortBy[0]?.key || ''"
            :sortDirection="sortBy[0]?.order || 'asc'"
            :itemKey="'id'"
            :rowClickable="true"
            @update:selectedItems="selected = $event"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @rowClick="handleAdhocEdit"
            @sort="handleSort"
            :show-selection="false"
          >
            <!-- Employee Name Column -->
            <template #cell-employee.assignedUser.first_name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.employee?.assignedUser?.first_name || "Unknown" }}
                </h3>
              </div>
            </template>

            <!-- Role Column -->
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
              <div class="actions-container d-flex align-center">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="
                    openViewDrawer(item, 'add');
                    resetBenefitsForm(viewActiveTab);
                  "
                  class="mr-2"
                  clickable
                >
                  Add Adhoc Payments
                </v-btn>
                <div class="view-section">
                  <v-chip
                    color="info"
                    variant="outlined"
                    size="small"
                    @click="openViewDrawer(item)"
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
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import { authService } from "@/services/authService";
import debounce from "lodash/debounce";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const error = ref(null);
const search = ref("");
const selected = ref([]);

const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();

const selectedYear = ref(null);
const selectedMonth = ref(null);
const activeFilters = ref({});
const dateRange = ref({ start: null, end: null });
const page = ref(1);

// Filter state
const showFilters = ref(true);
const filters = reactive({
  role: [],

  department: [],
  monthYear: null,
});

// Filter schema for FilterComponent
const pageFilters = [
  { key: "monthYear", label: "Month & Year", type: "month", show: true },
  { key: "department", label: "Department", type: "select", show: true },
  { key: "branch", label: "Branch", type: "select", show: true },
  {
    key: "attendanceCycle",
    label: "Attendance Cycle",
    type: "select",
    show: true,
  },
];

// Benefits section and tabs
const showBenefitsPanel = ref(false);
const activeTab = ref("bonus");
const selectedEmployee = ref(null);
const viewDrawer = ref(false);
const viewedEmployee = ref(null);
const viewActiveTab = ref("bonus");
const employeeBenefits = ref({
  bonusManual: [],
  incentiveManual: [],
  retentionPayManual: [],
  salaryArrearsManual: [],
  deductionManual: [],
});

// Benefits config
const bonusTypes = ["Performance", "Seasonal", "Special Achievement", "Other"];
const incentiveTypes = [
  "Sales",
  "Productivity",
  "Referral",
  "Technical",
  "Other",
];
const retentionPayTypes = [
  "Performance Retention",
  "Contract Extension",
  "Key Personnel",
  "Other",
];

const benefitsConfig = ref({
  bonus: {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
  },
  incentive: {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
  },
  retention: {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
  },
  salaryArrear: {
    name: "",
    value: null,
    date: "",
  },
  deduction: {
    name: "",
    value: 0,
    date: "",
  },
});

const savingBenefits = ref({
  bonus: false,
  incentive: false,
  retention: false,
  salaryArrear: false,
  deduction: false,
});
const editMode = ref(false);
const updatingBenefits = ref({
  bonus: false,
  incentive: false,
  retention: false,
  salaryArrear: false,
  deduction: false,
});

const editingBenefits = ref({
  bonus: {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
    index: null,
  },
  incentive: {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
    index: null,
  },
  retentionPay: {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
    index: null,
  },
  salaryArrear: {
    name: null,
    amount: 0,
    date: null,
    index: null,
  },
  deduction: {
    name: null,
    amount: 0,
    date: null,
    index: null,
  },
});

const columns = computed(() => [
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
  { key: "monthlyCTC", label: "Monthly CTC", sortable: false, width: "160px" },
  { key: "bonus", label: "Bonus", sortable: false, width: "160px" },
  { key: "incentives", label: "Incentives", sortable: false, width: "160px" },
  {
    key: "retentionPay",
    label: "Retention Pay",
    sortable: false,
    width: "160px",
  },
  {
    key: "salaryArrears",
    label: "Salary Arrears",
    sortable: false,
    width: "160px",
  },
  { key: "deduction", label: "Deduction", sortable: false, width: "160px" },

  // { key: "actions", label: "Actions", sortable: false, width: "400px" },
]);

const initialFilters = computed(() => ({
  role: filters.role,

  department: filters.department,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.role.length > 0 ||
    filters.department.length > 0 ||
    search.value !== ""
  );
});

const calculateTotal = (benefitType) => {
  const benefitKey = benefitType;
  const benefitsData = employeeBenefits.value[benefitKey];

  if (!benefitsData) return 0;

  if (Array.isArray(benefitsData)) {
    if (!benefitsData.length) return 0;
    return benefitsData.reduce((sum, item) => sum + (item.amount || 0), 0);
  } else if (typeof benefitsData === "object") {
    return Object.values(benefitsData).reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
  }

  return 0;
};

const editSpecificBenefit = (type, index) => {
  const benefitKey =
    type === "salaryArrear" ? "salaryArrearsManual" : `${type}Manual`;
  const benefit = employeeBenefits.value[benefitKey][index];

  resetBenefitsForm(type);

  if (type === "deduction" || type === "salaryArrear") {
    editingBenefits.value[type] = {
      name: benefit.name || "",
      amount: benefit.amount || 0,
      date: benefit.date || "",
      index: index,
    };
  } else {
    editingBenefits.value[type] = {
      reason: benefit.reason || "",
      value: benefit.amount || benefit.value || 0,
      paymentDateType: benefit.paymentDateType || "",
      specificDate: benefit.specificDate || benefit.date || "",
      month: benefit.month || "",
      index: index,
    };
  }

  editMode.value = true;
  showBenefitsPanel.value = true;
  viewActiveTab.value = type;
};

const navigateToBenefits = (tab) => {
  viewActiveTab.value = tab;
  editMode.value = true;
  showBenefitsPanel.value = true;
  resetBenefitsForm(tab);
};

const cancelEdit = () => {
  editMode.value = false;
  showBenefitsPanel.value = false;
  resetBenefitsForm();
};

const openViewDrawer = async (item, mode = "view") => {
  viewedEmployee.value = item;
  viewDrawer.value = true;
  editMode.value = mode === "add";
  employeeBenefits.value = {
    bonusManual: [],
    incentiveManual: [],
    retentionPayManual: [],
    deductionManual: [],
    salaryArrearsManual: [],
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[employee][_eq]=${item.id}`,
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
    const salaryBreakdown = data.data[0];

    if (mode !== "add" && salaryBreakdown?.benefitsManual) {
      employeeBenefits.value = {
        bonusManual: salaryBreakdown.benefitsManual.bonusManual || [],
        incentiveManual: salaryBreakdown.benefitsManual.incentiveManual || [],
        retentionPayManual:
          salaryBreakdown.benefitsManual.retentionPayManual || [],
        deductionManual: Object.values(
          salaryBreakdown.individualDeduction || {},
        ),
        salaryArrearsManual: Object.values(salaryBreakdown.salaryArrears || {}),
      };
    }
    if (mode === "add") {
      resetBenefitsForm();
    }
  } catch (error) {
    console.error("Error loading benefits:", error.message);
    error.value = `Failed to load benefits: ${error.message}`;
  }
};
const handleAdhocEdit = (row) => {
  router.push({
    path: "/payroll/adhoc-paymentsEdit",
    query: {
      id: row.id,
      employeeName: row.employee.assignedUser.first_name,
      month: filters.monthYear || "-",
    },
  });
};
const updateBenefit = async (type) => {
  updatingBenefits.value[type] = true;
  try {
    const config = editingBenefits.value[type];
    const employeeId = viewedEmployee.value.id;

    if (!employeeId) throw new Error("No employee selected");

    let storageField = "benefitsManual";
    if (type === "deduction") storageField = "individualDeduction";
    else if (type === "salaryArrear") storageField = "salaryArrears";

    if (storageField === "individualDeduction") {
      if (!config.name) throw new Error("Please enter a name");
      if (!(config.amount || config.value))
        throw new Error("Please enter a valid amount");
      if (!config.date) throw new Error("Please select a date");
    } else if (storageField === "salaryArrears") {
      if (!(config.amount || config.value))
        throw new Error("Please enter a valid amount");
      if (!config.date) throw new Error("Please select a date");
    } else {
      if (!config.reason) throw new Error("Please select a reason");
      if (!config.value || config.value <= 0)
        throw new Error("Please enter a valid amount");
      if (!config.month) throw new Error("Please select a month");
    }

    const queryUrl = `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[employee][_eq]=${employeeId}&fields[]=id&fields[]=${storageField}`;
    const response = await fetch(queryUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const salaryBreakdownId = data?.data?.[0]?.id;
    if (!salaryBreakdownId)
      throw new Error("No salary breakdown found for this employee");

    let currentData = data.data[0][storageField] || {};

    if (
      storageField === "benefitsManual" &&
      ["bonus", "retentionPay", "incentive"].includes(type)
    ) {
      const benefitKey = `${type}Manual`;
      if (!Array.isArray(currentData[benefitKey])) {
        currentData[benefitKey] = [];
      }

      const updatedBenefit = {
        reason: config.reason,
        amount: Number(config.value),
        paymentDateType: config.paymentDateType,
        specificDate:
          config.paymentDateType === "specific" ? config.specificDate : null,
        month: config.month,
        createdAt: new Date().toISOString(),
      };

      if (config.index !== null && currentData[benefitKey][config.index]) {
        currentData[benefitKey][config.index] = updatedBenefit;
      } else {
        currentData[benefitKey].push(updatedBenefit);
      }
    } else {
      let keys = Object.keys(currentData);
      let prefix = type;
      let newKey = prefix + "1";

      if (keys.length) {
        const maxIndex = keys.reduce((max, key) => {
          if (key.startsWith(prefix)) {
            const num = parseInt(key.slice(prefix.length), 10);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        newKey = prefix + (maxIndex + 1);
      }

      const updatedObj = {
        name: config.name,
        amount: Number(config.amount ?? config.value),
        date: config.date,
      };

      if (config.index !== null && keys[config.index]) {
        const keyToUpdate = keys[config.index];
        currentData[keyToUpdate] = updatedObj;
      } else {
        currentData[newKey] = updatedObj;
      }
    }

    const updatePayload = {};
    updatePayload[storageField] = currentData;

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

    if (!updateResponse.ok) {
      throw new Error(`HTTP error! Status: ${updateResponse.status}`);
    }

    editMode.value = false;
    showBenefitsPanel.value = false;
    editingBenefits.value[type].index = null;

    await openViewDrawer(viewedEmployee.value);
    showSuccessMessage(
      `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`,
    );
  } catch (error) {
    console.error(`Error updating ${type}:`, error.message);
    showErrorMessage(`Failed to update ${type}: ${error.message}`);
  } finally {
    updatingBenefits.value[type] = false;
  }
};

const deleteSpecificBenefit = async (type, index = null) => {
  updatingBenefits.value[type] = true;
  try {
    const employeeId = viewedEmployee.value.id;
    if (!employeeId) throw new Error("No employee selected");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[employee][_eq]=${employeeId}&fields[]=id&fields[]=benefitsManual&fields[]=individualDeduction&fields[]=salaryArrears`,
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
    const breakdown = data?.data?.[0];
    if (!breakdown) throw new Error("Salary breakdown not found");

    const salaryBreakdownId = breakdown.id;
    const updateField = {};

    let storageField = "benefitsManual";
    if (type === "deduction") storageField = "individualDeduction";
    else if (type === "salaryArrear") storageField = "salaryArrears";

    if (type === "deduction") {
      if (index === null || index === undefined) {
        throw new Error("Deduction index is required for deletion");
      }

      const currentDeductions = { ...(breakdown.individualDeduction || {}) };
      const deductionKeys = Object.keys(currentDeductions).sort();

      if (index >= deductionKeys.length || index < 0) {
        throw new Error(
          `Invalid index ${index}. Available range: 0-${deductionKeys.length - 1}.`,
        );
      }

      const keyToDelete = deductionKeys[index];
      delete currentDeductions[keyToDelete];
      updateField.individualDeduction = currentDeductions;
    } else if (type === "salaryArrear") {
      if (index === null || index === undefined) {
        throw new Error("Salary arrear index is required for deletion");
      }

      const currentArrears = { ...(breakdown.salaryArrears || {}) };
      const arrearKeys = Object.keys(currentArrears).sort();

      if (index >= arrearKeys.length || index < 0) {
        throw new Error(
          `Invalid index ${index}. Available range: 0-${arrearKeys.length - 1}.`,
        );
      }

      const keyToDelete = arrearKeys[index];
      delete currentArrears[keyToDelete];
      updateField.salaryArrears = currentArrears;
    } else {
      const config = editingBenefits.value[type];
      const currentBenefits = { ...(breakdown.benefitsManual || {}) };

      const benefitKey = `${type}Manual`;
      if (!Array.isArray(currentBenefits[benefitKey])) {
        throw new Error(`${benefitKey} is not an array or missing`);
      }

      if (config.index >= currentBenefits[benefitKey].length) {
        throw new Error(
          `Invalid index ${config.index} for ${benefitKey} array`,
        );
      }

      currentBenefits[benefitKey].splice(config.index, 1);
      updateField.benefitsManual = currentBenefits;
    }

    const patchResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${salaryBreakdownId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateField),
      },
    );

    if (!patchResponse.ok) {
      throw new Error(`HTTP error! Status: ${patchResponse.status}`);
    }

    await openViewDrawer(viewedEmployee.value);
    showSuccessMessage(
      `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`,
    );
  } catch (error) {
    console.error(`Error deleting ${type}:`, error.message);
    showErrorMessage(`Failed to delete ${type}: ${error.message}`);
  } finally {
    updatingBenefits.value[type] = false;
  }
};

const getMonthName = (monthNumber) => {
  return months.find((m) => m.value === monthNumber)?.title || "Unknown";
};

// Months data
const months = [
  { title: "January", value: 1 },
  { title: "February", value: 2 },
  { title: "March", value: 3 },
  { title: "April", value: 4 },
  { title: "May", value: 5 },
  { title: "June", value: 6 },
  { title: "July", value: 7 },
  { title: "August", value: 8 },
  { title: "September", value: 9 },
  { title: "October", value: 10 },
  { title: "November", value: 11 },
  { title: "December", value: 12 },
];

const items = ref([]);
const roleOptions = ref([]);
const organizationOptions = ref([]);
const departmentOptions = ref([]);

const resetBenefitsForm = (type = null) => {
  const defaultConfig = {
    reason: "",
    value: null,
    paymentDateType: "salary",
    specificDate: null,
    month: null,
    index: null,
    name: "",
    date: null,
    amount: 0,
  };

  if (type) {
    editingBenefits.value[type] = { ...defaultConfig };
  } else {
    editingBenefits.value = {
      bonus: { ...defaultConfig },
      incentive: { ...defaultConfig },
      retentionPay: { ...defaultConfig },
      deduction: { ...defaultConfig },
      salaryArrear: { ...defaultConfig },
    };
  }
};

const showSuccessMessage = (message) => {
  console.log("Success:", message);
};

const showErrorMessage = (message) => {
  console.error("Error:", message);
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
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
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! Status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error.message);
    error.value = `Failed to fetch count: ${error.message}`;
  }
};

const fetchEmployees = async () => {
  await aggregateCount();
  if (!token) {
    console.error("Authentication required. Please login again.");
    error.value = "Authentication required. Please login again.";
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

        "salaryArrears",
        "individualDeduction",
        "bonus",
        "incentive",
        "retentionPay",
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
          bonus: getTotal(item.bonus),
          incentives: getTotal(item.incentive),
          retentionPay: getTotal(item.retentionPay),
          salaryArrears: getTotal(item.salaryArrears),
          deduction: getTotal(item.individualDeduction),
        };
      }) || [];
  } catch (error) {
    console.error("Error fetching employees:", error.message);
    error.value = `Failed to load employees: ${error.message}`;
  } finally {
    loading.value = false;
  }
};

// const fetchSalaryBreakdown = async (employeeIds = []) => {
//   if (!employeeIds.length) return [];

//   try {
//     const params = {
//       fields: ["*", "employee.employeeId", "benefitsManual.*"],
//       "filter[employee][employeeId][_in]": employeeIds.join(","),
//       limit: -1,
//     };

//     const queryString = Object.keys(params)
//       .map((key) =>
//         key === "fields"
//           ? params[key].map((field) => `fields[]=${field}`).join("&")
//           : `${key}=${params[key]}`,
//       )
//       .join("&");

//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data || [];
//   } catch (error) {
//     console.error("Error fetching salary breakdown:", error.message);
//     return [];
//   }
// };

const fetchFilterOptions = async () => {
  try {
    const params = new URLSearchParams({
      "filter[tenant][tenantId][_eq]": tenantId,
    });

    const [roleRes, departmentRes] = await Promise.all([
      fetch(
        `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
      fetch(
        `${import.meta.env.VITE_API_URL}/items/department?${params}&fields=id,departmentName`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
    ]);

    if (!roleRes.ok || !departmentRes.ok) {
      throw new Error(
        `HTTP error! Status: Roles(${roleRes.status}), Organization(${organizationRes.status}), Department(${departmentRes.status})`,
      );
    }

    const [roleData, departmentData] = await Promise.all([
      roleRes.json(),
      departmentRes.json(),
    ]);

    roleOptions.value = roleData.data.map((r) => ({
      title: r.name,
      value: r.name,
    }));

    departmentOptions.value = departmentData.data.map((d) => ({
      title: d.departmentName,
      value: d.departmentName,
    }));
  } catch (error) {
    console.error("Error fetching filter options:", error.message);
    error.value = `Failed to fetch filter options: ${error.message}`;
  }
};

const filterParams = () => {
  const params = {};

  if (userRole === "Admin") {
    params["filter[employee][assignedUser][tenant][tenantId][_eq]"] = tenantId;
  }

  if (search.value) {
    params["filter[_or][0][employee][employeeId][_eq]"] = search.value;
    params["filter[_or][1][employee][assignedUser][first_name][_icontains]"] =
      search.value;
    params["filter[_or][2][employee][assignedUser][role][name][_icontains]"] =
      search.value;
  }

  // if (activeFilters.value.organization) {
  //   params["filter[employee][assignedUser][organization][id][_eq]"] =
  //     activeFilters.value.organization;
  // }

  // if (activeFilters.value.department) {
  //   params["filter[employee][department][departmentName][_in]"] =
  //     activeFilters.value.department.join(",");
  // }

  // if (activeFilters.value.role) {
  //   params["filter[employee][assignedUser][role][name][_in]"] =
  //     activeFilters.value.role.join(",");
  // }
  if (activeFilters.value.cycleType) {
    params["filter[employee][cycleType][_eq]"] = parseInt(
      activeFilters.value.cycleType,
    );
  }

  return params;
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);

  page.value = 1;
  showFilters.value = true;
  activeFilters.value = {
    branch: newFilters.branch || null,
    department: newFilters.department || null,

    cycleType: newFilters.attendanceCycle
      ? parseInt(newFilters.attendanceCycle)
      : null,
  };

  fetchEmployees();
};
const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  selected.value = [];
  fetchEmployees();
};

const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newSortDirection) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newSortDirection }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchEmployees();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchEmployees();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchEmployees();
};

const debouncedSearch = debounce(() => {
  fetchEmployees();
}, 300);

onMounted(async () => {
  await fetchFilterOptions();
  await fetchEmployees();
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
.employee-container {
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

/* Drawer and Table Width Adjustment */
.employee-container.drawer-open .main-content {
  margin-right: 400px;
  transition: margin-right 0.3s ease;
}

.v-navigation-drawer {
  z-index: 1001;
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
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

.text-caption {
  color: rgba(0, 0, 0, 0.6);
}

:deep(.v-navigation-drawer__scrim) {
  background: transparent !important;
}

.v-navigation-drawer__content {
  overflow-y: auto;
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

.custom-tabs {
  --tab-padding: 0 12px;
}

.custom-tabs .v-tab {
  min-width: unset;
  padding: var(--tab-padding);
  margin: 0 2px;
}

.custom-tabs .v-tab--selected {
  background-color: black !important;
  color: white !important;
  border-radius: 6px;
}

.custom-tabs .v-tab--selected .v-icon {
  color: white !important;
}

.custom-tab {
  color: inherit;
  text-transform: capitalize;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0 4px;
  font-size: 0.875rem;
  letter-spacing: 0.25px;
}

.custom-tab .v-icon {
  margin-right: 4px !important;
}

.custom-tab:hover {
  opacity: 0.9;
}

.custom-tabs .v-slide-group__wrapper::after {
  display: none;
}

.active-tab {
  background-color: black !important;
  color: white !important;
  border-radius: 6px;
}

.active-tab .v-icon {
  color: white !important;
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

<template>
  <div class="salary-container">
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
        :searchPlaceholder="'Search Employee'"
        :isEmpty="filteredItems.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <template #before-search>
          <!-- Filter Toggle Button -->
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
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            :left-icon="Upload"
            @click="importAttendance"
            class="ms-2"
          >
            Import Salaries
          </BaseButton></template
        >

        <template #default>
          <SkeletonLoader
            v-if="loading"
            variant="table-body-only"
            :rows="items.length || 10"
            :columns="columns.length"
          />

          <div v-else-if="error">
            <ErrorState
              title="Unable to load salary details"
              :message="error"
              @retry="fetchSalaryDetails"
            />
          </div>

          <div v-else-if="filteredItems.length === 0">
            <EmptyState
              title="No Salary Details found"
              message="Try adjusting your filters or search term"
              :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
              @primaryAction="clearFilters"
            />
          </div>

          <div v-else>
            <DataTable
              :items="filteredItems"
              :columns="columns"
              :selectedItems="selected"
              :showSelection="true"
              :sortBy="sortBy[0]?.key || ''"
              :sortDirection="sortBy[0]?.order || 'asc'"
              :itemKey="'id'"
              :rowClickable="true"
              @update:selectedItems="selected = $event"
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
                  :checked="selected.includes(item.id)"
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
                    :alt="item.employee?.assignedUser?.first_name"
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
                    {{ item.employee?.assignedUser?.first_name || "N/A" }}
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
                  {{ item.employee?.employeeId || "-" }}
                </span>
              </template>

              <!-- Role Column -->
              <template #cell-role="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ item.employee?.assignedUser?.role?.name || "N/A" }}
                </span>
              </template>
              <template #cell-pfAccount="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ item.employee?.assignedUser.PFAccountNumber || "-" }}
                </span>
              </template>

              <template #cell-esiAccount="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ item.employee?.assignedUser.ESIAccountNumber || "-" }}
                </span>
              </template>

              <!-- Montly CTC Column -->
              <template #cell-ctc="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.BasicSalary) }}
                </span>
              </template>

              <!-- Basic Salary Column -->
              <template #cell-basicSalary="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.basicPay) }}
                </span>
              </template>

              <!-- Total Earnings Column -->
              <template #cell-totalEarnings="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.totalEarnings) }}
                </span>
              </template>

              <!-- Total Deductions Column -->
              <template #cell-totalDeductions="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.totalDeductions) }}
                </span>
              </template>

              <!-- PF Column -->
              <template #cell-pf="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.employeeDeduction?.pf || 0) }}
                </span>
              </template>

              <!-- Bonus Column -->
              <template #cell-bonus="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.earnings?.bonus || 0) }}
                </span>
              </template>

              <!-- Professional Tax Column -->
              <template #cell-professionalTax="{ item }">
                <button
                  class="status-badge"
                  :class="{ 'status-inactive': isEmployeeLeft(item) }"
                  :disabled="isEmployeeLeft(item)"
                  @click.stop="showPTDetails(item)"
                >
                  {{ formatCurrency(item.professionalTax) }}
                </button>
              </template>

              <!-- Employer PF Column -->
              <template #cell-employerpf="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.employersContribution?.pf || 0) }}
                </span>
              </template>

              <!-- Employer ESI Column -->
              <template #cell-employeresi="{ item }">
                <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                  {{ formatCurrency(item.employersContribution?.esi || 0) }}
                </span>
              </template>

              <!-- Date of Leaving Column -->
              <template #cell-dateOfLeaving="{ item }">
                <span :class="{ 'text-red': isEmployeeLeft(item) }">
                  {{ item.employee?.assignedUser?.dateOfLeaving || "-" }}
                </span>
              </template>
            </DataTable>
          </div>
        </template>
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
    <v-dialog v-model="showImportDialog" max-width="600px" persistent>
      <v-card class="bg-gray-900 rounded-lg shadow-lg">
        <!-- Header -->
        <v-card-title class="text-h6 font-bold text-white">
          Import Salaries
        </v-card-title>
        <v-divider class="border-gray-700" />

        <!-- Scrollable Content -->
        <v-card-text
          style="max-height: 440px; overflow-y: auto; padding-right: 8px"
          class="custom-scrollbar"
        >
          <!-- ===================== EMPLOYEE DETAILS ===================== -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-green-400 mb-2">
              🧍 Employee Details
            </h3>
            <v-row dense>
              <v-col
                v-for="(header, i) in headerGroups.employeeDetails"
                :key="'emp-' + i"
                cols="6"
                class="py-1"
              >
                <v-checkbox
                  v-model="header.selected"
                  :label="header.label"
                  density="compact"
                  hide-details
                  color="success"
                  class="text-gray-100"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="border-gray-700 my-3" />

          <!-- ===================== EARNINGS ===================== -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-green-400 mb-2">
              💰 Earnings
            </h3>
            <v-row dense>
              <v-col
                v-for="(header, i) in headerGroups.earnings"
                :key="'earn-' + i"
                cols="6"
                class="py-1"
              >
                <v-checkbox
                  v-model="header.selected"
                  :label="header.label"
                  density="compact"
                  hide-details
                  color="success"
                  class="text-gray-100"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="border-gray-700 my-3" />

          <!-- ===================== EMPLOYER CONTRIBUTIONS ===================== -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-green-400 mb-2">
              🏢 Employer Contributions
            </h3>
            <v-row dense>
              <v-col
                v-for="(header, i) in headerGroups.employerContrib"
                :key="'empl-' + i"
                cols="6"
                class="py-1"
              >
                <v-checkbox
                  v-model="header.selected"
                  :label="header.label"
                  density="compact"
                  hide-details
                  color="success"
                  class="text-gray-100"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="border-gray-700 my-3" />

          <!-- ===================== EMPLOYEE CONTRIBUTIONS ===================== -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-green-400 mb-2">
              👤 Employee Contributions
            </h3>
            <v-row dense>
              <v-col
                v-for="(header, i) in headerGroups.employeeContrib"
                :key="'empcon-' + i"
                cols="6"
                class="py-1"
              >
                <v-checkbox
                  v-model="header.selected"
                  :label="header.label"
                  density="compact"
                  hide-details
                  color="success"
                  class="text-gray-100"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="border-gray-700 my-3" />

          <!-- ===================== DEDUCTIONS ===================== -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-green-400 mb-2">
              💸 Deductions
            </h3>
            <v-row dense>
              <v-col
                v-for="(header, i) in headerGroups.deductions"
                :key="'ded-' + i"
                cols="6"
                class="py-1"
              >
                <v-checkbox
                  v-model="header.selected"
                  :label="header.label"
                  density="compact"
                  hide-details
                  color="success"
                  class="text-gray-100"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="border-gray-700 my-4" />

          <!-- ===================== CONDITIONAL FILE/BTN SECTION ===================== -->
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <!-- Show Download button if any checkbox selected -->
            <v-btn
              color="success"
              variant="tonal"
              @click="downloadTemplate"
              class="text-sm w-full md:w-auto"
            >
              ⬇ Download Template
            </v-btn>

            <!-- Show File Upload if none selected -->
            <v-file-input
              v-model="selectedFile"
              accept=".xlsx, .xls"
              label="Upload Excel File"
              variant="outlined"
              density="compact"
              hide-details
              class="text-gray-300 w-full md:w-64"
            />
          </div>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="justify-end gap-3 p-4">
          <v-btn
            variant="outlined"
            color="red"
            @click="showImportDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="primary" @click="handleImport">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <router-view @close="handleClose" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { useRouter, useRoute } from "vue-router";
import ErrorState from "@/components/common/states/ErrorState.vue";
import { X, Upload } from "lucide-vue-next";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

// State
const route = useRoute();
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
const selected = ref([]);
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();

// Dialog states
const lwfDialog = reactive({ show: false, data: null });
const ptDialog = reactive({ show: false, data: null });

// Filters
const filters = reactive({
  organization: "",
  branch: "",
  department: "",
  basicPayFrom: "",
  basicPayTo: "",
  employeeStatus: [],
});

// Filter schema for FilterComponent
const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

// Computed Properties
const columns = computed(() => [
  // { key: "profile", label: "Profile", sortable: false, width: "60px" },
  { key: "employeeId", label: "Employee ID", sortable: false, width: "120px" },
  { key: "name", label: "Employee Name", sortable: false, width: "180px" },
  { key: "ctc", label: "Monthly Ctc", sortable: false, width: "150px" },

  {
    key: "totalEarnings",
    label: "Earnings",
    sortable: false,
    width: "150px",
  },
  {
    key: "totalDeductions",
    label: "Deductions",
    sortable: false,
    width: "200px",
  },
  { key: "pf", label: "PF", sortable: false, width: "120px" },

  { key: "employerpf", label: "Employer PF", sortable: false, width: "120px" },
  {
    key: "employeresi",
    label: "Employer ESI",
    sortable: false,
    width: "120px",
  },
  { key: "pfAccount", label: "PF Account", sortable: false, width: "150px" },
  { key: "esiAccount", label: "ESI Account", sortable: false, width: "150px" },
]);

const initialFilters = computed(() => ({
  organization: filters.organization,
  branch: filters.branch,
  department: filters.department,
  employeeStatus: filters.employeeStatus,
  basicPayFrom: filters.basicPayFrom,
  basicPayTo: filters.basicPayTo,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.organization ||
    filters.branch ||
    filters.department ||
    filters.basicPayFrom ||
    filters.basicPayTo ||
    filters.employeeStatus.length > 0 ||
    search.value !== ""
  );
});

const filteredItems = computed(() => {
  return items.value;
});

const router = useRouter();
const token = authService.getToken();

// Helper Functions
const isEmployeeLeft = (employee) => {
  if (!employee.employee?.assignedUser?.dateOfLeaving) {
    return false;
  }
  const today = new Date();
  const leavingDate = new Date(employee.employee.assignedUser.dateOfLeaving);
  today.setHours(0, 0, 0, 0);
  leavingDate.setHours(0, 0, 0, 0);
  return leavingDate <= today;
};

const formatCurrency = (value) => {
  return value ? `₹${Number(value).toLocaleString()}` : "₹0";
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

const parseTaxRules = (rules) => {
  if (typeof rules === "string") {
    try {
      return JSON.parse(rules);
    } catch (e) {
      console.error("Error parsing tax rules:", e);
      return [];
    }
  }
  return Array.isArray(rules) ? rules : [];
};

// API Logic
const fetchSalaryDetails = async (
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
        "ctc",
        "employee.id",
        "employee.employeeId",
        "employee.assignedUser.id",
        "employee.assignedUser.avatar.id",
        "employee.assignedUser.avatar.type",
        "employee.assignedUser.avatar.title",
        "employee.assignedBranch.branch_id.id",
        "employee.assignedUser.first_name",
        "employee.assignedUser.role.name",
        "employee.assignedUser.PFAccountNumber",
        "employee.assignedUser.ESIAccountNumber",
        "employee.assignedUser.dateOfLeaving",
        "employee.assignedDepartment.department_id.departmentName",
        "employee.assignedBranch.branch_id.branchName",
        "basicSalary",
        "salaryTracking",
        "totalEarnings",
        "totalDeductions",
        "professionalTax",
        "employeeDeduction",
        "employersContribution",
        "deduction",
        "earnings",
        "status",
        "salaryConfig.LWF",
        "salaryConfig.professionalTax",
      ],
      limit: currentItemsPerPage,
      page: currentPage,
    };

    let filterParams = [];
    if (userRole === "Admin" || userRole === "Dealer") {
      filterParams.push(`filter[tenant][tenantId][_eq]=${tenantId}`);
    } else if (userRole === "Manager") {
      filterParams.push(`filter[tenant][tenantId][_eq]=${tenantId}`);
      filterParams.push(`filter[assignedUser][role][name][_eq]=Employee`);
    } else if (userRole === "Employee") {
      filterParams.push(`filter[employee][assignedUser][id][_eq]=${userId}`);
    }

    if (searchTerm) {
      filterParams.push(
        `filter[_or][0][employee][assignedUser][first_name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][1][employee][assignedUser][role][name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][2][employee][employeeId][_eq]=${searchTerm}`,
      );
    }
    if (filters.organization) {
      filterParams.push(
        `filter[employee][assignedUser][organization][id][_eq]=${filters.organization}`,
      );
    }

    if (filters.branch) {
      filterParams.push(
        `filter[employee][branchLocation][id][_eq]=${filters.branch}`,
      );
    }
    if (filters.department) {
      filterParams.push(
        `filter[employee][department][_eq]=${filters.department}`,
      );
    }
    if (filters.basicPayFrom) {
      filterParams.push(`filter[basicSalary][_gte]=${filters.basicPayFrom}`);
    }
    if (filters.basicPayTo) {
      filterParams.push(`filter[basicSalary][_lte]=${filters.basicPayTo}`);
    }
    if (filters.employeeStatus.length) {
      if (
        filters.employeeStatus.includes("Active") &&
        !filters.employeeStatus.includes("Left")
      ) {
        filterParams.push(
          `filter[employee][assignedUser][dateOfLeaving][_null]=true`,
        );
      } else if (
        filters.employeeStatus.includes("Left") &&
        !filters.employeeStatus.includes("Active")
      ) {
        filterParams.push(
          `filter[employee][assignedUser][dateOfLeaving][_nnull]=true`,
        );
      }
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
      ...params.fields.map((f) => `fields[]=${f}`),
      ...filterParams,
      `limit=${currentItemsPerPage}`,
      `page=${currentPage}`,
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
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
      data.data.map(async (item) => {
        const current = new Date();
        const currentKey = `${current.getFullYear()}/${String(current.getMonth() + 1).padStart(2, "0")}`;
        console.log(
          "🟩 [Salary Tracking Debug] Processing Employee:",
          item?.employee?.assignedUser?.first_name || "Unknown",
        );
        console.log("   ➤ Current Month Key:", currentKey);
        console.log(
          "   ➤ Available salaryTracking keys:",
          Object.keys(item.salaryTracking || {}),
        );

        let salaryValue = item.salaryTracking?.[currentKey] || null;

        // CASE 1: Found direct match for current month
        if (salaryValue) {
          console.log(
            "   ✅ Found salary for current month:",
            currentKey,
            "→",
            salaryValue,
          );
        } else if (item.salaryTracking) {
          // CASE 2: No current month entry → find nearest past month entry
          console.log(
            "   ⚠️ Current month not found. Searching for previous available month...",
          );

          const sortedKeys = Object.keys(item.salaryTracking).sort(
            (a, b) =>
              new Date(b.split("/")[1], b.split("/")[0] - 1) -
              new Date(a.split("/")[1], a.split("/")[0] - 1),
          );
          console.log(
            "   ➤ Sorted salaryTracking keys (newest first):",
            sortedKeys,
          );

          for (const key of sortedKeys) {
            const keyDate = new Date(key.split("/")[1], key.split("/")[0] - 1);
            if (keyDate < current) {
              salaryValue = item.salaryTracking[key];
              console.log(
                "   🔄 Using previous month salary value from:",
                key,
                "→",
                salaryValue,
              );
              break;
            }
          }

          if (!salaryValue) {
            console.log(
              "   🚫 No matching or past month salary found, defaulting to 0",
            );
          }
        } else {
          console.log("   🚫 salaryTracking not available for this record");
        }

        item.BasicSalary = salaryValue || 0;
        console.log("   🧮 Final Assigned BasicSalary:", item.BasicSalary);

        // Avatar Fetch Log
        if (item.employee?.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${item.employee.assignedUser.avatar.id}`;
          console.log("   🖼️ Fetching avatar from:", avatarUrl);
          item.avatarImage = await fetchAuthorizedImage(avatarUrl);
        }

        console.log("────────────────────────────────────────────");
        return item;
      }),
    );

    // Fetch total count
    const countUrl = `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${filterParams.join("&")}&aggregate[countDistinct]=id`;
    const countResponse = await fetch(countUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countData = await countResponse.json();
    totalItems.value = parseInt(countData.data[0].countDistinct.id);
  } catch (err) {
    console.error("Error fetching salary details:", err);
    error.value = err.message || "Failed to load salary details";
  } finally {
    loading.value = false;
  }
};

const showImportDialog = ref(false);
const selectedFile = ref(null);

const headerGroups = ref({
  // ===================== EMPLOYEE DETAILS =====================
  employeeDetails: [
    { label: "Employee ID", selected: true },
    { label: "Effective Month", selected: true },
    { label: "Monthly CTC", selected: true },
  ],

  // ===================== EARNINGS =====================
  earnings: [
    { label: "Basic Pay", selected: true },
    { label: "HRA", selected: false },
    { label: "Dearness Allowance", selected: false },
    { label: "Special Allowance", selected: false },
    { label: "Travel Allowance", selected: false },
    { label: "Accomodation and Food", selected: false },
    { label: "Bonus and Incentives", selected: false },
    { label: "Cash Allowance", selected: false },
    { label: "Conveyance Allowance", selected: false },
    { label: "Children Education Allowance", selected: false },
    { label: "Distance Allowance", selected: false },
    { label: "Transport Allowance", selected: false },
  ],

  // ===================== EMPLOYER CONTRIBUTIONS =====================
  employerContrib: [
    { label: "Employer PF", selected: true },
    { label: "Employer ESI", selected: true },
  ],

  // ===================== EMPLOYEE CONTRIBUTIONS =====================
  employeeContrib: [
    { label: "Employee PF", selected: true },
    { label: "Employee ESI", selected: true },
  ],

  // ===================== DEDUCTIONS =====================
  deductions: [
    { label: "Gratuity", selected: false },
    { label: "Benevolent Fund", selected: false },
    { label: "Term Insurance", selected: false },
    { label: "Group Accidental Policy & WC", selected: false },

    { label: "Statutory Bonus Deduction", selected: false },
    { label: "Security Deposit", selected: false },
    { label: "Uniform Deduction", selected: false },
    { label: "Transport Charges", selected: false },
    { label: "Miscellaneous Deduction", selected: false },
    { label: "Food Deduction", selected: false },
    { label: "Medical Insurance Premium", selected: false },
  ],
});
// open popup
const importAttendance = () => {
  showImportDialog.value = true;
};

//  Download  template
const downloadTemplate = () => {
  const groupedHeaders = [
    ...headerGroups.value.employeeDetails.map((h) => ({
      ...h,
      section: "Employee Details",
    })),
    ...headerGroups.value.earnings.map((h) => ({
      ...h,
      section: "Earnings",
    })),
    ...headerGroups.value.employerContrib.map((h) => ({
      ...h,
      section: "Employer Contribution",
    })),
    ...headerGroups.value.employeeContrib.map((h) => ({
      ...h,
      section: "Employee Contribution",
    })),
    ...headerGroups.value.deductions.map((h) => ({
      ...h,
      section: "Deductions",
    })),
  ];

  // 2️⃣ Include only selected headers
  const selectedHeaders = groupedHeaders
    .filter((h) => h.selected)
    .map((h) => {
      return h.section === "Employee Details"
        ? h.label
        : `${h.section}: ${h.label}`;
    });

  // 3️⃣ Create an empty sheet with formatted headers
  const ws = XLSX.utils.aoa_to_sheet([selectedHeaders]);

  // 4️⃣ Set column widths for neat alignment
  ws["!cols"] = selectedHeaders.map((header) => ({
    wch: Math.max(22, header.length + 4),
  }));

  // 5️⃣ Style header row (bold, centered, dark theme)
  selectedHeaders.forEach((header, i) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "1F2937" } },
    };
  });

  // 6️⃣ Generate workbook and save file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Salary Template");
  XLSX.writeFile(wb, "salary_import_template.xlsx");
};

// handle file import
const handleImport = async () => {
  if (!selectedFile.value) return;
  const file = selectedFile.value;
  if (!tenantId) return;

  try {
    console.log("🔹 Starting import...");

    // ------------------------------
    // 1️⃣ Upload file
    const fileId = await uploadFile({ target: { files: [file] } });
    console.log("✅ File uploaded, fileId:", fileId);

    // 2️⃣ Register file
    const importID = await handleImportFile(fileId);
    console.log("✅ File registered, importID:", importID);

    // ------------------------------
    // 3️⃣ Process Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await selectedFile.value.arrayBuffer());
    const worksheet = workbook.getWorksheet(1);

    const headerMap = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headerMap[colNumber] = cell.value;
    });
    console.log("✅ Header map created:", headerMap);

    const employeeRows = [];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const employeeID = row.getCell("A").value;
      if (employeeID) employeeRows.push({ employeeID, row });
    }
    console.log(`✅ Found ${employeeRows.length} employee rows.`);

    const BATCH_SIZE = 100;

    // ------------------------------
    // 4️⃣ Get SalarySetting ID
    const salarySettingRes = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting?filter[configName][_eq]=Custom&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const salarySettingData = await salarySettingRes.json();
    const customSalarySettingID = salarySettingData.data?.[0]?.id;
    console.log("✅ Custom SalarySetting ID:", customSalarySettingID);

    // ------------------------------
    // 5️⃣ Batch GET Personal module
    const personalMap = {};
    for (let start = 0; start < employeeRows.length; start += BATCH_SIZE) {
      const batchRows = employeeRows.slice(start, start + BATCH_SIZE);
      const batchIDs = batchRows.map((r) => r.employeeID);

      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?filter[employeeId][_in]=${batchIDs.join(",")}&limit=${BATCH_SIZE}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(`🔹 Fetched Personal batch for IDs: ${batchIDs.join(",")}`);
      console.log("🔹 Personal batch returned:", data.data);

      const personalMapBatch = {};
      data.data.forEach((item) => {
        personalMapBatch[item.employeeId] = item;
      });

      // ------------------------------
      // 6️⃣ Build PATCH payload
      const batchPayload = [];
      for (const { employeeID, row } of batchRows) {
        const existingItem = personalMapBatch[employeeID];

        if (!existingItem) {
          console.warn(
            `⚠️ EmployeeID ${employeeID} not found in Personal module, skipping PATCH.`,
          );
          continue;
        }

        const effectiveMonth = row.getCell("B").value || "2025-04";
        const [yearStr, monthStr] = effectiveMonth.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);

        const existingTracking = existingItem.salaryConfigTracking || {};
        const newTracking = { ...existingTracking };
        if (!newTracking[year]) newTracking[year] = {};
        newTracking[year][month] = customSalarySettingID;

        batchPayload.push({
          id: existingItem.id,
          salaryConfigTracking: newTracking,
        });
        console.log(
          `✅ Prepared PATCH payload for EmployeeID ${employeeID}:`,
          newTracking,
        );
      }

      if (batchPayload.length === 0) {
        console.warn(
          "⚠️ Batch payload is empty, no PATCH call will be made for this batch.",
        );
        continue;
      }

      console.log(
        `🔹 Sending PATCH for ${batchPayload.length} employees in this batch...`,
      );
      const patchRes = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchPayload),
        },
      );
      const patchResult = await patchRes.json();
      console.log("✅ PATCH result:", patchResult);
    }

    // ------------------------------
    // Similar detailed logging can be added for SalaryBreakdown PATCH
    console.log("🔹 Finished processing Personal module PATCH batches.");

    // ------------------------------
    // 7️⃣ Batch GET SalaryBreakdown IDs & existing data
    const salaryMap = {}; // employeeID => existing SalaryBreakdown object
    for (let start = 0; start < employeeRows.length; start += BATCH_SIZE) {
      const batchRows = employeeRows.slice(start, start + BATCH_SIZE);
      const batchIDs = batchRows.map((r) => r.employeeID);

      const batchUrl = `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[employee][employeeId][_in]=${batchIDs.join(
        ",",
      )}&fields=id,employee.employeeId,earnings,deduction,employeeDeduction,employersContribution,salaryTracking&limit=${BATCH_SIZE}`;
      const getRes = await fetch(batchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await getRes.json();
      console.log(
        `🔹 Fetched SalaryBreakdown batch for IDs: ${batchIDs.join(",")}`,
      );
      console.log("🔹 SalaryBreakdown batch returned:", data.data);

      data.data.forEach((item) => {
        // Map using the API field exactly
        salaryMap[item.employee.employeeId] = item; // note: lowercase d
      });
    }

    // ------------------------------
    // 8️⃣ Batch PATCH SalaryBreakdown
    for (let start = 0; start < employeeRows.length; start += BATCH_SIZE) {
      const batchRows = employeeRows.slice(start, start + BATCH_SIZE);
      const batchPayload = [];

      for (const { employeeID, row } of batchRows) {
        const existingItem = salaryMap[employeeID];

        if (!existingItem) {
          console.warn(
            `⚠️ EmployeeID ${employeeID} not found in SalaryBreakdown, skipping PATCH.`,
          );
          continue;
        }

        // Build new payload from Excel row
        const newData = buildPayloadWithMonth(row, headerMap); // returns earnings/deductions/contributions

        // Merge carefully with existing structure
        const mergedPayload = {
          earnings: mergeNested(
            existingItem.earnings || {},
            newData.earnings || {},
          ),
          deductions: mergeNested(
            existingItem.deduction || {},
            newData.deduction || {},
          ),
          employeeDeduction: mergeNested(
            existingItem.employeeDeduction || {},
            newData.employeeDeduction || {},
          ),
          employersContribution: mergeNested(
            existingItem.employersContribution || {},
            newData.employersContribution || {},
          ),
          salaryTracking: mergeNested(
            existingItem.salaryTracking || {},
            newData.salaryTracking || {},
          ),
        };

        // Log what will be PATCHed for this employee
        console.log(
          `✅ Prepared SalaryBreakdown PATCH payload for EmployeeID ${employeeID}:`,
          mergedPayload,
        );

        batchPayload.push({ id: existingItem.id, ...mergedPayload });
      }

      if (batchPayload.length === 0) {
        console.warn(
          "⚠️ SalaryBreakdown batch payload is empty, no PATCH call will be made for this batch.",
        );
        continue;
      }

      console.log(
        `🔹 Sending PATCH for ${batchPayload.length} SalaryBreakdown records in this batch...`,
      );
      const patchRes = await fetch(
        `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchPayload),
        },
      );
      const patchResult = await patchRes.json();
      console.log("✅ SalaryBreakdown PATCH result:", patchResult);
    }

    console.log("🔹 Finished processing SalaryBreakdown PATCH batches.");

    alert("All employees processed successfully!");
  } catch (error) {
    console.error("❌ Error during import:", error);
    alert("Failed to process file: " + error.message);
  }
};

// Utility: Deep merge for nested year/month objects
function mergeNested(existingData, newData) {
  existingData = existingData || {};
  newData = newData || {};

  const result = { ...existingData };

  // Iterate through all years in newData
  Object.keys(newData).forEach((yearKey) => {
    if (!result[yearKey]) result[yearKey] = {};

    Object.keys(newData[yearKey]).forEach((monthKey) => {
      const newMonthData = newData[yearKey][monthKey];
      const hasValidData =
        newMonthData &&
        typeof newMonthData === "object" &&
        Object.keys(newMonthData).length > 0;

      // ✅ If Excel has data for this month → REPLACE completely
      if (hasValidData) {
        result[yearKey][monthKey] = newMonthData;
        console.log(`🔁 Replaced month ${monthKey}/${yearKey}`);
      } else {
        // ✅ If Excel has no data → remove this month completely
        if (result[yearKey] && result[yearKey][monthKey]) {
          delete result[yearKey][monthKey];
          console.log(`🗑️ Removed empty month ${monthKey}/${yearKey}`);
        }
      }
    });
  });

  // ✅ Remove year if all its months got deleted
  Object.keys(result).forEach((yearKey) => {
    if (
      result[yearKey] &&
      typeof result[yearKey] === "object" &&
      Object.keys(result[yearKey]).length === 0
    ) {
      delete result[yearKey];
    }
  });

  return result;
}

function buildPayloadWithMonth(row, headerMap) {
  const effectiveMonth = row.getCell(2)?.value || "2025-04";
  const [yearStr, monthStr] = effectiveMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const earnings = {};
  const deduction = {};
  const employeeDeduction = {};
  const employersContribution = {};
  const salaryTracking = {};

  // -------------------------------------------------------
  // Create nested year/month placeholders
  const ensureYM = (obj) => {
    if (!obj[year]) obj[year] = {};
    if (!obj[year][month]) obj[year][month] = {};
  };

  // -------------------------------------------------------
  // Detect column for Monthly CTC dynamically
  const monthlyCTCCol = Object.entries(headerMap).find(([_, v]) =>
    /monthly\s*ctc/i.test(v),
  );
  const monthlyCTC = monthlyCTCCol
    ? row.getCell(parseInt(monthlyCTCCol[0]))?.value || 0
    : 0;

  // -------------------------------------------------------
  // Loop through all headers & classify automatically
  Object.entries(headerMap).forEach(([colNumber, header]) => {
    if (!header) return;
    const value = row.getCell(parseInt(colNumber))?.value || 0;
    if (!value) return; // skip empty

    const headerText = header.toString().trim();

    // --- Earnings ---
    if (/^Earnings:/i.test(headerText)) {
      const label = headerText.replace(/^Earnings:\s*/i, "");
      ensureYM(earnings);
      earnings[year][month][label] = value;
    }

    // --- Employer Contribution ---
    else if (/^Employer Contribution:/i.test(headerText)) {
      const label = headerText.replace(/^Employer Contribution:\s*/i, "");
      ensureYM(employersContribution);
      const key = label.replace(/\s/g, "");
      employersContribution[year][month][key] = {
        amount: value,
        includedInCTC: false,
      };
    }

    // --- Employee Contribution ---
    else if (/^Employee Contribution:/i.test(headerText)) {
      const label = headerText.replace(/^Employee Contribution:\s*/i, "");
      ensureYM(employeeDeduction);
      const key = label.replace(/\s/g, "");
      employeeDeduction[year][month][key] = value;
    }

    // --- Deductions (generic) ---
    else if (/^Deduction:/i.test(headerText)) {
      const label = headerText.replace(/^Deduction:\s*/i, "");
      ensureYM(deduction);
      deduction[year][month][label] = value;
    }
  });

  // -------------------------------------------------------
  // Salary tracking
  const monthKey = `${String(month).padStart(2, "0")}/${year}`;
  if (monthlyCTC) salaryTracking[monthKey] = monthlyCTC;

  // -------------------------------------------------------
  console.log(
    `✅ Processed row for EmployeeID ${row.getCell(1)?.value}, Month ${effectiveMonth}:`,
  );
  console.log({
    earnings,
    deduction,
    employeeDeduction,
    employersContribution,
    salaryTracking,
  });

  return {
    earnings,
    deduction,
    employeeDeduction,
    employersContribution,
    salaryTracking,
  };
}

const handleImportFile = async (file) => {
  if (!file) throw new Error("File not defined");

  const payload = {
    generatedFile: file,
    collectionName: "Salary Breadown",
    status: "Genrated",
    tenant: tenantId,
  };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/items/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("handleImport API failed");

  const result = await response.json();
  return result?.data?.id || null;
};

const tdsFolderId = ref(null);
const fetchTDSFolderId = async () => {
  try {
    const token = authService.getToken();

    if (!tenantId) {
      console.error("Tenant ID not found in employee data");
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?limit=25&fields[]=tenantName&fields[]=tenantId&fields[]=foldersId&filter[_and][0][_and][0][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the TDS folder
      const tdsFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Imported Files",
      );

      if (tdsFolder) {
        tdsFolderId.value = tdsFolder.id;
        console.log("TDS folder ID:", tdsFolder.id);
        return tdsFolder.id;
      } else {
        console.error("TDS folder not found in tenant data");
        return null;
      }
    } else {
      console.error("No folder structure found for tenant");
      return null;
    }
  } catch (error) {
    console.error("Error fetching TDS folder ID:", error);
    return null;
  }
};
const uploadFile = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    if (!tdsFolderId.value) {
      await fetchTDSFolderId();
      if (!tdsFolderId.value) {
        console.log(
          "Could not find TDS folder. Using default upload location.",
        );
      }
    }

    const formData = new FormData();

    if (tdsFolderId.value) {
      formData.append("folder", tdsFolderId.value);
    }

    formData.append("file", file);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.data.id;
  } catch (err) {
    console.error("File upload failed:", err);
  }
};
const fetchFilterOptions = async () => {
  try {
    const params = new URLSearchParams({
      "filter[tenant][tenantId][_eq]": tenantId,
    });

    const [branchRes, departmentRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/items/branch?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/items/department?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [branchData, departmentData] = await Promise.all([
      branchRes.json(),
      departmentRes.json(),
    ]);

    branchOptions.value = branchData.data.map((b) => ({
      title: b.branchName,
      value: b.branchName,
    }));
    departmentOptions.value = departmentData.data.map((d) => ({
      title: d.departmentName,
      value: d.departmentName,
    }));
  } catch (error) {
    console.error("Error fetching filter options:", error);
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
  fetchSalaryDetails();
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
  fetchSalaryDetails();
};

const toggleItemSelection = (itemId) => {
  if (selected.value.includes(itemId)) {
    selected.value = selected.value.filter((id) => id !== itemId);
  } else {
    selected.value.push(itemId);
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
  fetchSalaryDetails();
};

const showLWFDetails = (item) => {
  if (isEmployeeLeft(item)) return;
  lwfDialog.data = item.salaryConfig?.LWF;
  lwfDialog.show = true;
};

const showPTDetails = (item) => {
  if (isEmployeeLeft(item)) return;
  ptDialog.data = item.salaryConfig?.professionalTax;
  ptDialog.show = true;
};

const handleRowClick = (item) => {
  if (isEmployeeLeft(item)) {
    console.log("Cannot navigate: Employee has left.");
    return;
  }

  let employeeId = item.employee?.id || item.id || item.employee?.employeeId;
  if (employeeId) {
    showForm.value = true;
    router.push(
      `/payroll/employee-salary/salary-details/${employeeId}/salary-detailsedit`,
    );
    console.log("Navigating with employeeId:", employeeId);
  } else {
    console.error("Invalid item or employee ID", item);
    alert("Unable to navigate to employee details. Employee ID not found.");
  }
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchSalaryDetails();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchSalaryDetails(newPage, itemsPerPage.value, search.value);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchSalaryDetails(1, newItemsPerPage, search.value);
};

const debouncedSearch = debounce(() => {
  fetchSalaryDetails(1, itemsPerPage.value, search.value);
}, 300);
watch(
  [search, filters, sortBy],
  () => {
    debouncedSearch();
  },
  { deep: true },
);
// watch(
//   () => route.path,
//   (newPath) => {
//     if (newPath === "/payroll/employee-salary/salary-details") {
//       alert("Called");
//       onMounted();
//     }
//   },
// );

// Lifecycle Hooks
// onMounted(async () => {
//   await fetchFilterOptions();
//   await fetchSalaryDetails();
// });
const handleClose = async () => {
  showForm.value = false;
  await fetchSalaryDetails();
  await fetchFilterOptions();
};
onMounted(() => {
  (async () => {
    await fetchSalaryDetails();
    await fetchFilterOptions();
  })();
});
</script>

<style scoped>
.salary-container {
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
  font-size: 0.875rem;
  color: #1e293b;
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
.custom-checkbox:disabled {
  background-color: #e2e8f0;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Dialog Styles */
.dialog-title {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  font-size: 1.25rem;
  font-weight: 500;
  position: relative;
}

.v-dialog .v-card-title .v-btn {
  position: absolute;
  right: 8px;
  top: 8px;
}

.v-list-item {
  padding: 12px 0;
}

.v-list-item-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  color: rgba(0, 0, 0, 0.6);
}

/* Text Styles */
.text-red {
  color: #f44336 !important;
  font-weight: 600;
}

.text-muted {
  color: #757575 !important;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .salary-container {
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

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #2c2c2c;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #777;
}
</style>

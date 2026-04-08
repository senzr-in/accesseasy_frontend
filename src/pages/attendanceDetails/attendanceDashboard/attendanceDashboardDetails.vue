<template>
  <div class="tasks-container">
    <template v-if="!showMonthlyReport && !showCalendarView">
      <!-- Filter Panel -->
      <div
        v-if="showFilters && tenantId && !tenantLoading && isAdmin"
        class="filter-panel"
      >
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
        v-if="tenantId && !tenantLoading"
        class="content-area"
        :class="{ 'full-width': !showFilters }"
      >
        <data-table-wrapper
          v-model:searchQuery="search"
          :search-placeholder="'Search employees...'"
          :show-search="isAdmin"
          :has-error="error"
          wrapper-class="attendance-table-wrapper"
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
          <!-- Toolbar Actions Slot -->
          <template #toolbar-actions v-if="isAdmin">
            <!-- Filter Toggle Button - MOVED HERE, BEFORE EXPORT BUTTON -->

            <Dropdown
              text="Export"
              variant="primary"
              :leftIcon="Download"
              :items="exportOptions"
              placement="bottom-right"
              @itemClick="handleExportOption"
            />
          </template>

          <!-- Loading State -->
          <template v-if="loading">
            <SkeletonLoader
              variant="table-body-only"
              :rows="itemsPerPage || 10"
              :columns="columns.length"
            />
          </template>

          <!-- Table Content -->
          <template v-else>
            <DataTable
              :items="attendanceData"
              :columns="columns"
              :sort-by="sortBy"
              :sort-direction="sortDirection"
              :row-clickable="true"
              item-key="employeeId"
              @rowClick="handleRowClick"
              @sort="handleSort"
            >
              <!-- Error State -->
              <template #error-state>
                <ErrorState
                  v-if="error"
                  title="Unable to load attendance data"
                  :message="error"
                  @retry="fetchAttendanceData"
                />
              </template>

              <!-- Empty State -->
              <template #empty-state>
                <EmptyState
                  v-if="attendanceData.length === 0 && !loading"
                  :title="
                    search
                      ? 'No employees found'
                      : 'No attendance data available'
                  "
                  :message="
                    search
                      ? 'Try a different search term'
                      : 'Try adjusting your filters or check back later'
                  "
                  :primary-action="{ text: 'Clear Filters', icon: 'X' }"
                  @primaryAction="clearFilters"
                />
              </template>

              <!-- Cell Templates -->
              <template #cell-profile="{ item }">
                <div class="profile-avatar">
                  <img
                    v-if="item.avatarImage"
                    :src="item.avatarImage"
                    :alt="formatEmployeeName(item)"
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
              <template #cell-name="{ item }">
                <div class="employee-info">
                  <div class="employee-details">
                    <h3 class="employee-name">
                      {{ item.name || "Unknown Employee" }}
                    </h3>
                  </div>
                </div>
              </template>
              <template #cell-department="{ item }">
                <span class="department-name">{{
                  item.department || "N/A"
                }}</span>
              </template>

              <template #cell-employeeCode="{ item }">
                <span class="employee-code">{{
                  item.employeeCode || "N/A"
                }}</span>
              </template>
              <template #cell-present="{ item }">
                <span class="attendance-count present">{{
                  item.present || 0
                }}</span>
              </template>
              <template #cell-absent="{ item }">
                <span class="attendance-count absent">{{
                  item.absent || 0
                }}</span>
              </template>
              <template #cell-halfDay="{ item }">
                <span class="attendance-count halfday">{{
                  item.halfDay || 0
                }}</span>
              </template>
              <template #cell-weekOff="{ item }">
                <span class="attendance-count weekoff">{{
                  item.weekOff || 0
                }}</span>
              </template>
              <template #cell-holiday="{ item }">
                <span class="attendance-count holiday">{{
                  item.holiday || 0
                }}</span>
              </template>
              <template #cell-onDuty="{ item }">
                <span class="attendance-count onduty">{{
                  item.onDuty || 0
                }}</span>
              </template>
              <template #cell-workFromHome="{ item }">
                <span class="attendance-count wfh">{{
                  item.workFromHome || 0
                }}</span>
              </template>
              <template #cell-paidLeave="{ item }">
                <span class="attendance-count paid">{{
                  item.paidLeave || 0
                }}</span>
              </template>
              <template #cell-unPaidLeave="{ item }">
                <span class="attendance-count unpaid">{{
                  item.unPaidLeave || 0
                }}</span>
              </template>
              <template #cell-totalPayableDays="{ item }">
                <span class="attendance-count payable">{{
                  item.totalPayableDays || 0
                }}</span>
              </template>
              <template #cell-totalDaysOfMonth="{ item }">
                <span class="attendance-count total">{{
                  item.totalDaysOfMonth || 0
                }}</span>
              </template>
            </DataTable>
          </template>

          <!-- Pagination Slot -->
          <template #pagination v-if="isAdmin">
            <PaginationComponent
              v-model:page="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :total-items="totalItems"
              :is-searching="!!search"
              @update:page="handlePageChange"
              @update:itemsPerPage="handleItemsPerPageChange"
            />
          </template>
        </data-table-wrapper>
      </div>

      <!-- Tenant Loading State -->
      <div v-if="tenantLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading tenant information...</p>
      </div>
    </template>

    <!-- Monthly Report View -->
    <!-- <template v-if="showMonthlyReport">
      <v-container fluid class="pa-6">
        <div class="d-flex justify-space-between align-center">
          <BaseButton
            size="md"
            variant="primary"
            :leftIcon="ArrowLeft"
            @click="backToMainView"
            :text="'Back to Dashboard'"
          />
        </div>
        <UserAttendanceReport
          v-if="selectedEmployeeId"
          :employee-id="selectedEmployeeId"
        />
      </v-container>
    </template> -->

    <!-- Calendar View -->
    <template v-if="showCalendarView">
      <v-container fluid class="pa-6">
        <div class="d-flex justify-space-between align-center">
          <BaseButton
            size="md"
            variant="primary"
            :leftIcon="ArrowLeft"
            @click="backToMainView"
            :text="'Back to Dashboard'"
          />
        </div>
        <CalendarView
          :month="selectedCalendarMonth"
          :year="selectedCalendarYear"
          :attendanceData="selectedMonthAttendanceData"
          :employee="userData"
        />
      </v-container>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted, reactive } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import UserAttendanceReport from "./monthUserAttendance.vue";
import CalendarView from "./calanderView.vue";
import PaginationComponent from "../../../utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import Dropdown from "@/components/common/buttons/DropdownButton.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import debounce from "lodash/debounce";
import { ArrowLeft, Download } from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formattedCurrentMonth = computed(() => {
  const now = new Date();
  return format(now, "MMMM yyyy");
});

const pageFilters = computed(() => {
  if (isEmployee.value) {
    return [
      { key: "monthYear", label: "Month & Year", type: "month", show: true },
    ];
  } else {
    return [
      { key: "monthYear", label: "Month & Year", type: "month", show: true },
      { key: "branch", label: "Branch", type: "select", show: true },
      { key: "department", label: "Department", type: "select", show: true },
      {
        key: "attendanceCycle",
        label: "Attendance Cycle",
        type: "select",
        show: true,
      },
    ];
  }
});

const debouncedFetchAttendanceData = debounce(() => {
  currentPage.value = 1;
  fetchAttendanceData();
}, 300);

const search = ref("");
const loading = ref(false);
const error = ref(null);
const tenantLoading = ref(true);
const attendanceData = ref([]);
const showMonthlyReport = ref(false);
const showCalendarView = ref(false);
const selectedEmployeeId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const showFilters = ref(true);
const organizationName = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");
const tenantId = ref("");
const userId = currentUserTenant.getUserId();
const userRole = currentUserTenant.getRole();
const selectedCalendarMonth = ref(new Date().getMonth()); // 1-12 for January-December
const selectedCalendarYear = ref(new Date().getFullYear());
const selectedMonthAttendanceData = ref([]);
const userData = ref(null);
const filters = reactive({
  organization: "",
  branch: "",
  department: "",
  monthYear: new Date().toISOString().slice(0, 7),
  attendanceCycle: "",
  cycleStartDate: "",
  cycleEndDate: "",
  cycleEndDay: "",
});
const isAdmin = computed(() => userRole === "Admin" || userRole === "Dealer");
const isEmployee = computed(() => userRole === "Employee");
const initialFilters = computed(() => ({
  organization: filters.organization,
  branch: filters.branch,
  department: filters.department,
  attendanceCycle: filters.attendanceCycle,
  monthYear: filters.monthYear,
  cycleStartDate: "",
  cycleEndDate: "",
}));

const attendanceCycleData = ref({
  startDate: "",
  endDate: "",
  fixedCycle: true,
});

const exportOptions = ref([
  { label: "Excel", value: "excel", icon: Download },
  { label: "CSV", value: "csv", icon: Download },
  { label: "PDF", value: "pdf", icon: Download },
]);

const columns = ref([
  { key: "profile", label: "Profile", width: "60px" },
  {
    key: "employeeCode",
    label: "Employee Code",
    sortable: true,
    width: "100px",
  },
  { key: "name", label: "Employee Name", sortable: true, width: "200px" },

  { key: "department", label: "Department", sortable: true, width: "120px" },

  { key: "present", label: "Present", sortable: true, width: "80px" },
  { key: "absent", label: "Absent", sortable: true, width: "80px" },
  { key: "halfDay", label: "Half Days", sortable: true, width: "80px" },
  { key: "weekOff", label: "Week Off", sortable: true, width: "80px" },
  { key: "holiday", label: "Holiday", sortable: true, width: "80px" },
  { key: "onDuty", label: "On Duty", sortable: true, width: "80px" },
  { key: "workFromHome", label: "WFH", sortable: true, width: "80px" },
  { key: "paidLeave", label: "Paid Leave", sortable: true, width: "80px" },
  { key: "unPaidLeave", label: "Unpaid Leave", sortable: true, width: "80px" },
  {
    key: "totalPayableDays",
    label: "Payable Days",
    sortable: true,
    width: "80px",
  },
  {
    key: "totalDaysOfMonth",
    label: "Total Days",
    sortable: true,
    width: "80px",
  },
]);

const getInitials = (item) => {
  if (!item?.name) return "";
  return item.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
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
  const identifier = String(item?.employeeCode || item?.name || "");
  const sum = identifier
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

const hasActiveFilters = computed(() => {
  return (
    filters.monthYear !== new Date().toISOString().slice(0, 7) ||
    filters.organization !== "" ||
    filters.branch !== "" ||
    filters.department !== "" ||
    filters.attendanceCycle !== "" ||
    search.value
  );
});

const fetchTenantId = async () => {
  tenantLoading.value = true;
  try {
    const id = await currentUserTenant.getTenantId();
    if (!id) {
      throw new Error("Tenant ID is null or undefined");
    }
    tenantId.value = id;
    organizationName.value = currentUserTenant.getTenantName() || "FieldOPs";
  } catch (error) {
    console.error("Error fetching tenantId:", error);
    error.value = error.message || "Failed to fetch tenant ID";
  } finally {
    tenantLoading.value = false;
  }
};

const fetchEmployeeId = async () => {
  if (!tenantId.value || !userId) {
    console.error("fetchEmployeeId: tenantId or userId is not set");
    error.value = "Tenant ID or User ID is not set";
    return null;
  }
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        params: {
          fields: ["id", "assignedUser.first_name"],
          "filter[_and][1][assignedUser][id][_eq]": userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (response.data && response.data.data && response.data.data.length > 0) {
      const data = response.data.data[0];
      userData.value = {
        id: data.id,
        name: `${data.assignedUser.first_name}`,
      };
      return userData.value;
    } else {
      throw new Error("No employee data found for the user");
    }
  } catch (error) {
    console.error("Error fetching employee ID:", error);
    error.value = error.message || "Failed to fetch employee ID";
    return null;
  }
};

const fetchAttendanceCycle = async () => {
  if (!tenantId.value) {
    console.error("fetchAttendanceCycle: tenantId is not set");
    return;
  }
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle`,
      {
        params: {
          fields: ["id", "startDate", "endDate", "fixedCycle"],
          "filter[_and][0][tenant][tenantId][_eq]": tenantId.value,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (response.data && response.data.data && response.data.data.length > 0) {
      attendanceCycleData.value = response.data.data[0];
    }
  } catch (error) {
    console.error("Error fetching attendance cycle data:", error);
    error.value = error.message || "Failed to fetch attendance cycle data";
  }
};

const fetchAttendanceData = async (
  employeeId = null,
  employeeName = null,
  employeeCode = null,
) => {
  if (!tenantId.value) {
    console.error("fetchAttendanceData: tenantId is not set");
    error.value = "Tenant ID is not set";
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    // If user is an employee, resolve employeeId automatically
    if (isEmployee.value && !employeeId) {
      const employeeData = await fetchEmployeeId();
      if (!employeeData) {
        throw new Error("Failed to fetch employee ID");
      }
      employeeId = employeeData.id;
      employeeName = employeeData.name;
    }

    let apiUrl = `${import.meta.env.VITE_API_URL}/attendance/monthly-dashboard?`;
    const andFilters = [];

    // Tenant filter (always required)
    andFilters.push(`tenantId=${tenantId.value}`);

    // Employee filter (if provided or auto-resolved)
    if (employeeId) {
      andFilters.push(`employeeId=${employeeId}`);
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split("-");
        if (year) andFilters.push(`year=${year}`);
        if (month) andFilters.push(`month=${month}`);
      }
    }

    // Common filters (for admin or employee)
    if (filters.monthYear && !employeeId) {
      const [year, month] = filters.monthYear.split("-");
      if (year) andFilters.push(`year=${year}`);
      if (month) andFilters.push(`month=${month}`);
    }

    if (filters.cycleStartDate && filters.cycleEndDate) {
      andFilters.push(`startDate=${filters.cycleStartDate}`);
      andFilters.push(`endDate=${filters.cycleEndDate}`);
    }
    if (filters.attendanceCycle && !employeeId) {
      andFilters.push(`cycleTypeFilter=${filters.attendanceCycle}`);
    }
    if (filters.organization && !employeeId) {
      andFilters.push(`organizationId=${filters.organization}`);
    }
    if (filters.branch && !employeeId) {
      andFilters.push(`branchLocationId=${filters.branch}`);
    }
    if (filters.department && !employeeId) {
      andFilters.push(`departmentId=${filters.department}`);
    }

    if (!employeeId) {
      // Pagination (admin only)
      andFilters.push(`page=${currentPage.value}`);
      andFilters.push(`limit=${itemsPerPage.value}`);

      if (search.value) {
        andFilters.push(`search=${encodeURIComponent(search.value)}`);
      }

      andFilters.push(`sortBy=${sortBy.value}`);
      andFilters.push(`sortDirection=${sortDirection.value}`);
    }

    apiUrl += andFilters.join("&");

    console.log("📡 API URL:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Raw API Response:", response.data);

    // Unified data processing
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        // Admin view: list of employees - fetch additional employee details
        const employeesWithDetails = await Promise.all(
          response.data.data.map(async (employee) => {
            // Fetch additional employee details including avatar, department, and branch
            const employeeDetails = await fetchEmployeeDetails(
              employee.employeeId,
            );

            return {
              employeeId: employee.employeeId,
              employeeCode: employee.employeeCode,
              name: employee.firstName,
              department:
                employeeDetails?.department || employee.department || "N/A",
              present: employee.present,
              absent: employee.absent,
              halfDay: employee.halfDay,
              weekOff: employee.weekOff,
              holiday: employee.holiday,
              onDuty: employee.onDuty,
              workFromHome: employee.workFromHome,
              paidLeave: employee.paidLeave,
              unPaidLeave: employee.unPaidLeave,
              weekoffPresent: employee.weekoffPresent,
              holidayPresent: employee.holidayPresent,
              earlyLeaving: employee.earlyLeaving,
              lateComing: employee.lateComing,
              workingDayOT: employee.workingDayOT,
              weekoffPresentOT: employee.weekoffPresentOT,
              holidayPresentOT: employee.holidayPresentOT,
              workFromHomeOT: employee.workFromHomeOT,
              totalPayableDays: employee.totalPayableDays,
              totalDaysOfMonth: employee.totalDaysOfMonth,
            };
          }),
        );

        attendanceData.value = employeesWithDetails;
        totalItems.value =
          response.data.meta?.total || response.data.data.length;
      } else if (response.data.data.summary) {
        // Employee view: single summary
        const { summary } = response.data.data;

        // Fetch employee details for the current employee
        const employeeDetails = await fetchEmployeeDetails(employeeId);

        attendanceData.value = [
          {
            employeeId,
            employeeCode,
            name: employeeName,
            department: employeeDetails?.department || "N/A",

            present: summary.present,
            absent: summary.absent,
            halfDay: summary.halfDay,
            weekOff: summary.weekOff,
            holiday: summary.holiday,
            onDuty: summary.onDuty,
            workFromHome: summary.workFromHome,
            paidLeave: summary.paidLeave,
            unPaidLeave: summary.unPaidLeave,
            weekoffPresent: summary.weekoffPresent,
            holidayPresent: summary.holidayPresent,
            earlyLeaving: summary.earlyLeaving,
            lateComing: summary.lateComing,
            workingDayOT: summary.workingDayOT,
            weekoffPresentOT: summary.weekoffPresentOT,
            holidayPresentOT: summary.holidayPresentOT,
            workFromHomeOT: summary.workFromHomeOT,
            totalPayableDays: summary.totalPayableDays,
            totalDaysOfMonth: summary.totalDaysOfMonth,
          },
        ];
        totalItems.value = 1;
      }
      // Update selectedMonthAttendanceData for CalendarView
      selectedMonthAttendanceData.value = attendanceData.value;
    } else {
      attendanceData.value = [];
      selectedMonthAttendanceData.value = [];
    }
  } catch (error) {
    console.error("❌ Error fetching attendance data:", error);
    error.value = error.message || "Failed to load attendance data";
  } finally {
    loading.value = false;
  }
};
// Add this function to fetch detailed employee information
const fetchEmployeeDetails = async (employeeId) => {
  try {
    const token = authService.getToken();
    if (!token || !employeeId) {
      return null;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${employeeId}`,
      {
        params: {
          fields: [
            "assignedUser.first_name",
            "assignedUser.last_name",
            "assignedUser.avatar.id",
            "department.departmentName",
            "branchLocation.locdetail",
            "employeeId",
          ],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data && response.data.data) {
      const employee = response.data.data;

      // Process avatar image
      let avatarImage = null;
      if (employee.assignedUser?.avatar?.id) {
        const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${employee.assignedUser.avatar.id}`;
        avatarImage = await fetchAuthorizedImage(avatarUrl);
      }

      return {
        name: `${employee.assignedUser?.first_name || ""} ${employee.assignedUser?.last_name || ""}`.trim(),
        department: employee.department?.departmentName || "N/A",

        location: employee.branchLocation?.locdetail?.locationName || "N/A",
        avatarImage: avatarImage,
        employeeCode: employee.employeeId,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching employee details for ${employeeId}:`, error);
    return null;
  }
};
// Avatar Functions
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
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  console.log("Applying filters with cycle ID:", newFilters.cycleId);

  const {
    cycleId,
    cycleStartDate,
    cycleEndDate,
    cycleTotalDays,
    ...otherFilters
  } = newFilters;

  Object.assign(filters, otherFilters);
  filters.cycleId = cycleId || "";
  filters.cycleStartDate = cycleStartDate || "";
  filters.cycleEndDate = cycleEndDate || "";
  filters.cycleTotalDays = cycleTotalDays || 0;

  currentPage.value = 1;
  fetchAttendanceData();
};

const clearFilters = () => {
  Object.assign(filters, {
    organization: "",
    branch: "",
    department: "",
    monthYear: new Date().toISOString().slice(0, 7),
  });
  search.value = "";
  currentPage.value = 1;
  fetchAttendanceData();
};

const handleRowClick = (item) => {
  selectedEmployeeId.value = item.employeeId;
  userData.value = {
    id: item.employeeId,
    name: item.name,
    employeeCode: item.employeeCode,
  };
  showCalendarView.value = true; // Show CalendarView instead of MonthlyReport
};

const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
  fetchAttendanceData();
};

const backToMainView = async () => {
  showMonthlyReport.value = false;
  showCalendarView.value = false;
  selectedEmployeeId.value = null;
  userData.value = null;
  await fetchAttendanceCycle();
  await fetchAttendanceData();
  if (isEmployee.value) {
    await fetchEmployeeId();
  }
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchAttendanceData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  fetchAttendanceData();
};

const handleExportOption = (item) => {
  switch (item.value) {
    case "excel":
      downloadExcel();
      break;
    case "csv":
      downloadCSV();
      break;
    case "pdf":
      downloadPDF();
      break;
  }
};

const downloadExcel = async () => {
  try {
    loading.value = true;
    const start = filters.cycleStartDate
      ? new Date(filters.cycleStartDate)
      : filters.monthYear
        ? new Date(filters.monthYear + "-01")
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const end = filters.cycleEndDate
      ? new Date(filters.cycleEndDate)
      : filters.monthYear
        ? new Date(new Date(start).setMonth(start.getMonth() + 1) - 1)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const wb = XLSX.utils.book_new();
    const headerData = [
      [organizationName.value],
      [
        `Attendance Report (${format(start, "dd MMM yyyy")} - ${format(
          end,
          "dd MMM yyyy",
        )})`,
      ],
      [],
      ["===== ATTENDANCE SUMMARY ====="],
      [],
    ];

    const attendanceHeaders = [
      "Employee Code",
      "Employee Name",
      "Present",
      "Absent",
      "Half Day",
      "Week Off",
      "Holiday",
      "On Duty",
      "Work From Home",
      "Paid Leave",
      "Unpaid Leave",
      "Weekoff Present",
      "Holiday Present",
      "Working Days OT",
      "Holiday Present OT",
      "Weekoff Present OT",
      "Work From Home OT",
      "Early Leaving",
      "Late Coming",
      "Total Payable Days",
      "Total Days of Month",
    ];

    const attendanceRows = attendanceData.value.map((employee) => [
      employee.employeeCode || "",
      employee.name || "",
      employee.present || 0,
      employee.absent || 0,
      employee.halfDay || 0,
      employee.weekOff || 0,
      employee.holiday || 0,
      employee.onDuty || 0,
      employee.workFromHome || 0,
      employee.paidLeave || 0,
      employee.unPaidLeave || 0,
      employee.weekoffPresent || 0,
      employee.holidayPresent || 0,
      employee.workingDayOT || 0,
      employee.holidayPresentOT || 0,
      employee.weekoffPresentOT || 0,
      employee.workFromHomeOT || 0,
      employee.earlyLeaving || 0,
      employee.lateComing || 0,
      employee.totalPayableDays || 0,
      employee.totalDaysOfMonth || 0,
    ]);

    const wsData = [
      ...headerData,
      attendanceHeaders,
      ...attendanceRows,
      [],
      ["===== LEGEND ====="],
      ["P: Present, A: Absent, HD: Half Day, WO: Week Off, PH: Holiday"],
      ["PL: Paid Leave, UPL: Unpaid Leave, OD: On Duty, WFH: Work From Home"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(
      wb,
      `attendance-report-${format(start, "yyyy-MM-dd")}-to-${format(
        end,
        "yyyy-MM-dd",
      )}.xlsx`,
    );
  } catch (error) {
    console.error("Error generating Excel:", error);
    error.value = error.message || "Failed to generate Excel report";
  } finally {
    loading.value = false;
  }
};

const downloadCSV = async () => {
  try {
    loading.value = true;

    const start = filters.monthYear
      ? new Date(filters.monthYear + "-01")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = filters.monthYear
      ? new Date(new Date(start).setMonth(start.getMonth() + 1) - 1)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    let csvRows = [];
    csvRows.push([organizationName.value]);
    csvRows.push([
      `Attendance Report (${format(start, "dd MMM yyyy")} - ${format(
        end,
        "dd MMM yyyy",
      )})`,
    ]);
    csvRows.push([]);
    csvRows.push(["===== ATTENDANCE SUMMARY ====="]);
    csvRows.push([]);

    const summaryHeaders = [
      "Employee Code",
      "Employee Name",
      "Present",
      "Absent",
      "Half Day",
      "Week Off",
      "Holiday",
      "On Duty",
      "Work From Home",
      "Paid Leave",
      "Unpaid Leave",
      "Weekoff Present",
      "Holiday Present",
      "Working Days OT",
      "Holiday Present OT",
      "Weekoff Present OT",
      "Work From Home OT",
      "Early Leaving",
      "Late Coming",
      "Total Payable Days",
      "Total Days of Month",
    ];
    csvRows.push(summaryHeaders);

    attendanceData.value.forEach((employee) => {
      const paddedEmployeeCode = (employee.employeeCode || "")
        .toString()
        .padEnd(10);
      const summaryRow = [
        paddedEmployeeCode,
        employee.name || "",
        employee.present || "0",
        employee.absent || "0",
        employee.halfDay || "0",
        employee.weekOff || "0",
        employee.holiday || "0",
        employee.onDuty || "0",
        employee.workFromHome || "0",
        employee.paidLeave || "0",
        employee.unPaidLeave || "0",
        employee.weekoffPresent || "0",
        employee.holidayPresent || "0",
        employee.workingDayOT || "0",
        employee.holidayPresentOT || "0",
        employee.weekoffPresentOT || "0",
        employee.workFromHomeOT || "0",
        employee.earlyLeaving || "0",
        employee.lateComing || "0",
        employee.totalPayableDays || "0",
        employee.totalDaysOfMonth || "0",
      ];
      csvRows.push(summaryRow);
    });

    csvRows.push([]);
    csvRows.push(["===== LEGEND ====="]);
    csvRows.push([
      "P: Present, A: Absent, HD: Half Day, WO: Week Off, PH: Holiday",
    ]);
    csvRows.push([
      "PL: Paid Leave, UPL: Unpaid Leave, OD: On Duty, WFH: Work From Home",
    ]);

    const csvContent = csvRows
      .map((row) =>
        row
          .map((cell) => {
            const cellContent = cell?.toString() || "";
            if (
              cellContent.includes(",") ||
              cellContent.includes('"') ||
              cellContent.includes("\n")
            ) {
              return `"${cellContent.replace(/"/g, '""')}"`;
            }
            return cellContent;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `attendance-report-${format(start, "yyyy-MM-dd")}-to-${format(
        end,
        "yyyy-MM-dd",
      )}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating CSV:", error);
    error.value = error.message || "Failed to generate CSV report";
  } finally {
    loading.value = false;
  }
};

const downloadPDF = async () => {
  try {
    loading.value = true;

    const pdf = new jsPDF("l", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 10;

    const start = filters.monthYear
      ? new Date(filters.monthYear + "-01")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = filters.monthYear
      ? new Date(new Date(start).setMonth(start.getMonth() + 1) - 1)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(organizationName.value, pageWidth / 2, margin + 10, {
      align: "center",
    });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `ATTENDANCE REPORT (${format(start, "dd MMM yyyy")} - ${format(
        end,
        "dd MMM yyyy",
      )})`,
      pageWidth / 2,
      margin + 20,
      { align: "center" },
    );

    const tableHeaders = [
      "Employee Code",
      "Name",
      "Present",
      "Absent",
      "Half Day",
      "Week Off",
      "Holiday",
      "On Duty",
      "WFH",
      "Paid Leave",
      "Unpaid Leave",
      "Payable Days",
      "Total Days",
    ];

    const tableData = attendanceData.value.map((employee) => [
      employee.employeeCode || "",
      employee.name || "",
      employee.present || 0,
      employee.absent || 0,
      employee.halfDay || 0,
      employee.weekOff || 0,
      employee.holiday || 0,
      employee.onDuty || 0,
      employee.workFromHome || 0,
      employee.paidLeave || 0,
      employee.unPaidLeave || 0,
      employee.totalPayableDays || 0,
      employee.totalDaysOfMonth || 0,
    ]);

    pdf.autoTable({
      startY: margin + 30,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [75, 75, 75],
        textColor: 255,
        halign: "center",
        fontSize: 8,
      },
      bodyStyles: {
        halign: "center",
        fontSize: 7,
      },
      margin: { left: margin, right: margin },
      styles: {
        cellPadding: 2,
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
      },
    });

    const finalY = pdf.lastAutoTable.finalY || margin + 50;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    const legend =
      "Legend: P: Present, A: Absent, HD: Half Day, WO: Week Off, PH: Holiday, " +
      "PL: Paid Leave, UPL: Unpaid Leave, OD: On Duty, WFH: Work From Home";
    pdf.text(legend, margin, finalY + 10);

    pdf.save(
      `attendance-report-${format(start, "yyyy-MM-dd")}-to-${format(
        end,
        "yyyy-MM-dd",
      )}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    error.value = error.message || "Failed to generate PDF report";
  } finally {
    loading.value = false;
  }
};

watch([currentPage, itemsPerPage], () => {
  if (isAdmin.value) {
    fetchAttendanceData();
  }
});
watch(search, () => {
  if (isAdmin.value) {
    debouncedFetchAttendanceData();
  }
});

watch(tenantId, (newValue) => {
  console.log("tenantId updated:", newValue);
});

onMounted(async () => {
  await fetchTenantId();
  if (tenantId.value) {
    await fetchAttendanceCycle();
    if (isEmployee.value) {
      const employeeData = await fetchEmployeeId();
      if (employeeData) {
        await fetchAttendanceData(
          employeeData.id,
          employeeData.name,
          employeeData.employeeCode,
        );
      }
    } else {
      await fetchAttendanceData();
    }
  } else {
    console.error("Failed to fetch tenantId, cannot fetch attendance data");
  }
});

onUnmounted(() => {
  // Cleanup if necessary
});
</script>
<style scoped>
.tasks-container {
  display: flex;
  /* height: 100vh; */
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 350px);
  transition: all 0.3s ease;
}

/* .content-area.full-width {
  margin-left: 0;
} */

/* :deep(.table-table) {
  height: calc(95vh - 200px) !important;
} */

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

/* Loading Container */
/* .loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
} */

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* DataTable Custom Cell Styles */
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.employee-name {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}

.employee-code {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* .department-name,
.branch-name {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
} */

.employee-code {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.attendance-count {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.attendance-count.present {
  background: #dcfce7;
  color: #166534;
}

.attendance-count.absent {
  background: #fee2e2;
  color: #dc2626;
}

.attendance-count.halfday {
  background: #fef3c7;
  color: #92400e;
}

.attendance-count.weekoff,
.attendance-count.holiday {
  background: #e0e7ff;
  color: #3730a3;
}

.attendance-count.onduty,
.attendance-count.wfh {
  background: #dbeafe;
  color: #1d4ed8;
}

.attendance-count.paid,
.attendance-count.unpaid {
  background: #f3e8ff;
  color: #7c3aed;
}

.attendance-count.payable,
.attendance-count.total {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
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

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .tasks-container {
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

  .content-area {
    margin-left: 0 !important;
  }
}
</style>
```

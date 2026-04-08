<template>
  <div class="employee-container">
    <!-- Filter Toggle Button -->

    <!-- Filter Panel -->
    <div class="filter-pane" v-if="showFilters && tenantId && !tenantLoading">
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
        :show-search="true"
        :has-error="showError"
        wrapper-class="employee-table-wrapper"
      >
        <template #before-search>
          <button
            v-if="tenantId && !tenantLoading"
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
        <template #toolbar-actions>
          <div class="d-flex align-center" style="gap: 8px">
            <!-- Cycle Info Display -->
            <div v-if="selectedMonthIndex !== -1" class="cycle-info">
              <v-chip
                size="small"
                :color="cycleConfig?.fixedCycle ? 'primary' : 'secondary'"
                class="text-none"
              >
                {{ cycleConfig?.fixedCycle ? "Fixed Cycle" : "Custom Cycle" }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                {{ formatDateRange(filters.dateFrom, filters.dateTo) }}
              </span>
            </div>
            <!-- Export Dropdown -->
            <Dropdown
              v-if="!['Manager', 'Employee'].includes(role?.trim())"
              text="Export"
              variant="primary"
              :leftIcon="Download"
              :items="exportOptions"
              placement="bottom-right"
              @itemClick="handleExportOption"
            />
            <!-- Import Button -->
            <!-- <v-btn
              @click="handleImport"
              class="text-none import-btn"
              color="primary"
              variant="elevated"
            >
              <v-icon start>mdi-import</v-icon>
              Import Attendance
            </v-btn> -->
          </div>
        </template>

        <!-- Loading State -->
        <template v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="itemsPerPage || 10"
            :columns="columns.length"
          />
        </template>

        <!-- Data Table with Error/Empty State Handling -->
        <template v-else>
          <DataTable
            :items="items"
            :columns="columns"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            :row-clickable="true"
            item-key="id"
            @rowClick="handleRowClick"
            @sort="handleSort"
          >
            <!-- Error State Slot -->
            <template #error-state>
              <ErrorState
                v-if="showError"
                title="Unable to load attendance data"
                :message="errorMessage"
                @retry="fetchAttendance"
              />
            </template>

            <!-- Empty State Slot -->
            <template #empty-state>
              <EmptyState
                v-if="items.length === 0 && !showError"
                title="No attendance data found"
                message="Try adjusting your filters or check back later"
                :primary-action="{ text: 'Clear Filters', icon: 'X' }"
                @primaryAction="clearFilters"
              />
            </template>
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
            <!-- Custom Cell for Employee Name -->
            <template #cell-employeeName="{ item }">
              <div class="employee-info">
                <div class="employee-details">
                  <h3 class="employee-name">
                    {{ item.employeeId?.assignedUser?.first_name || "Unknown" }}
                  </h3>
                </div>
              </div>
            </template>

            <!-- Custom Cell for Employee ID -->
            <template #cell-employeeId="{ item }">
              <span class="employee-code">{{
                item.employeeId?.employeeId || "N/A"
              }}</span>
            </template>

            <!-- Custom Cell for Status -->
            <template #cell-status="{ item }">
              <span
                class="attendance-count"
                :class="getStatusClass(item.status)"
              >
                {{ item.status || "-" }}
              </span>
            </template>

            <!-- Custom Cell for Attendance -->
            <template #cell-attendance="{ item }">
              <span
                class="attendance-count"
                :class="getAttendanceClass(item.attendance)"
              >
                {{ item.attendance || "-" }}
              </span>
            </template>

            <!-- Custom Cell for Mode -->
            <template #cell-mode="{ item }">
              <span class="attendance-count" :class="getModeClass(item.mode)">
                {{ getModeDisplayName(item.mode) || "-" }}
              </span>
            </template>

            <!-- Custom Cell for In Time -->
            <template #cell-inTime="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.inTime }">
                {{ formatTime24Hour(item.inTime) }}
              </span>
            </template>

            <!-- Custom Cell for Out Time -->
            <template #cell-outTime="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.outTime }">
                {{ formatTime24Hour(item.outTime) }}
              </span>
            </template>

            <!-- Custom Cell for Work Hours -->
            <template #cell-workHours="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.workHours }">
                {{ formatDuration24Hour(item.workHours) }}
              </span>
            </template>

            <!-- Custom Cell for Break Time -->
            <template #cell-breakTime="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.breakTime }">
                {{ formatDuration24Hour(item.breakTime) }}
              </span>
            </template>

            <!-- Custom Cell for Late By -->
            <template #cell-lateBy="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.lateBy }">
                {{ formatDuration24Hour(item.lateBy) }}
              </span>
            </template>

            <!-- Custom Cell for Over Time -->
            <template #cell-overTime="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.overTime }">
                {{ formatDuration24Hour(item.overTime) }}
              </span>
            </template>

            <!-- Custom Cell for On Time -->
            <template #cell-onTime="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.onTime }">
                {{ formatDuration24Hour(item.onTime) }}
              </span>
            </template>

            <!-- Custom Cell for Leave Type -->
            <template #cell-leaveType="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.leaveType }">
                {{ item.leaveType || "-" }}
              </span>
            </template>

            <!-- Custom Cell for Attendance Context -->
            <template #cell-attendanceContext="{ item }">
              <span :class="{ 'text-grey-darken-1': !item.attendanceContext }">
                {{ item.attendanceContext || "-" }}
              </span>
            </template>
          </DataTable>
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
      </data-table-wrapper>
    </div>

    <!-- Tenant Loading State -->
    <div v-if="tenantLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading tenant information...</p>
    </div>

    <!-- Right Filter/Edit Panel -->
    <transition name="slide">
      <div v-if="showFilters && editMode" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Edit Attendance</h3>
            <v-btn icon @click="closePanel" variant="text">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div v-if="showSuccessMessage" class="success-message">
          <v-alert type="success" variant="tonal" class="ma-4">
            {{ successMessage }}
          </v-alert>
        </div>
        <div v-if="showError" class="error-message">
          <v-alert type="error" variant="tonal" class="ma-4">
            {{ errorMessage }}
          </v-alert>
        </div>

        <div class="filter-content">
          <v-text-field
            v-model="editForm.employeeName"
            label="Employee Name"
            variant="outlined"
            class="mb-4"
            disabled
            prepend-inner-icon="mdi-account"
          ></v-text-field>

          <v-select
            v-model="editForm.attendance"
            :items="attendanceOptions"
            label="Attendance"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-calendar-check"
          ></v-select>

          <v-text-field
            v-model="editForm.inTime"
            label="In Time"
            type="time"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-clock-in"
          ></v-text-field>

          <v-text-field
            v-model="editForm.outTime"
            label="Out Time"
            type="time"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-clock-out"
          ></v-text-field>

          <v-text-field
            v-model="editForm.lateByMinutes"
            label="Late By"
            type="time"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-timer-sand"
          />

          <v-text-field
            v-model="editForm.overtimeMinutes"
            label="Overtime"
            type="time"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-clock-plus"
          />

          <v-text-field
            v-model="editForm.workHours"
            label="Work Hours"
            type="time"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-briefcase-clock"
          />

          <v-text-field
            v-model="editForm.earlyDepartureMinutes"
            label="Early Departure"
            type="time"
            variant="outlined"
            class="mb-4"
            prepend-inner-icon="mdi-clock-minus"
          />

          <div class="edit-actions">
            <v-btn color="primary" @click="saveEdit" class="ms-2 text-none">
              Save
            </v-btn>
          </div>
        </div>
      </div>
    </transition>

    <!-- Import Modal -->
    <ImportAttendance
      v-if="showImportModal"
      @close="showImportModal = false"
      @import-success="handleImportSuccess"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, watch, reactive, computed, onUnmounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import Dropdown from "@/components/common/buttons/DropdownButton.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import ImportAttendance from "./attendanceImport/attendanceImport.vue";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import debounce from "lodash/debounce";
import { Download } from "lucide-vue-next";

const debouncedFetchAttendance = debounce(() => {
  page.value = 1;
  fetchAttendance();
}, 300);

const tenantId = ref(currentUserTenant.getTenantId());
const role = ref(currentUserTenant.getRole());
const token = authService.getToken();
const userId = currentUserTenant.getUserId();
const items = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  return sortedItems.value.slice(start, start + itemsPerPage.value);
});
const allPossibleItems = ref([]);
const employees = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(true);
const showError = ref(false);
const errorMessage = ref("");
const editMode = ref(false);
const selectedRecord = ref(null);
const selectedMonthIndex = ref(-1);
const selectedYear = ref(new Date().getFullYear());
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = computed(() => filteredItems.value.length);
const showSuccessMessage = ref(false);
const successMessage = ref("");
const showImportModal = ref(false);
const sortBy = ref("date");
const sortDirection = ref("desc");
const branchOptions = ref([]);
const departmentOptions = ref([]);

const editForm = reactive({
  id: null,
  employeeName: "",
  attendance: "",
  date: "",
  inTime: "",
  outTime: "",
  mode: "manual",
  lateByMinutes: "",
  overtimeMinutes: "",
  workHours: "",
  earlyDepartureMinutes: "",
});

const filters = reactive({
  organization: "",
  branch: "",
  department: "",
  status: "",
  attendance: "",
  mode: "",
  attendanceCycle: "",
  cycleStartDate: "",
  cycleEndDate: "",
});

const initialFilters = computed(() => ({
  organization: filters.organization,
  branch: filters.branch,
  department: filters.department,
  status: filters.status,
  attendance: filters.attendance,
  mode: filters.mode,
  attendanceCycle: filters.attendanceCycle,
  cycleStartDate: filters.cycleStartDate,
  cycleEndDate: filters.cycleEndDate,
}));

const isVirtualMode = computed(
  () => filters.cycleStartDate && filters.cycleEndDate,
);

const filteredItems = computed(() => {
  return allPossibleItems.value.filter((item) => {
    let matchFilters = true;
    if (filters.status)
      matchFilters = matchFilters && item.status === filters.status;
    if (filters.attendance)
      matchFilters = matchFilters && item.attendance === filters.attendance;
    if (filters.mode) matchFilters = matchFilters && item.mode === filters.mode;

    const searchLower = search.value.toLowerCase();
    const matchSearch =
      !search.value ||
      item.employeeId?.employeeId
        ?.toString()
        .toLowerCase()
        .includes(searchLower) ||
      item.employeeId?.assignedUser?.first_name
        ?.toLowerCase()
        .includes(searchLower) ||
      item.employeeId?.branch?.branchName
        ?.toLowerCase()
        .includes(searchLower) ||
      item.employeeId?.department?.departmentName
        ?.toLowerCase()
        .includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower) ||
      item.date?.includes(search.value) ||
      item.attendance?.toLowerCase().includes(searchLower) ||
      item.mode?.toLowerCase().includes(searchLower) ||
      item.leaveType?.toLowerCase().includes(searchLower);

    return matchFilters && matchSearch;
  });
});

const sortedItems = computed(() => {
  const sorted = [...filteredItems.value];
  if (sortBy.value) {
    const dir = sortDirection.value === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      const va = getValueByKey(a, sortBy.value);
      const vb = getValueByKey(b, sortBy.value);
      if (va === null || va === undefined) return dir;
      if (vb === null || vb === undefined) return -dir;
      if (typeof va === "number" && typeof vb === "number") {
        return dir * (va - vb);
      }
      return dir * ("" + va).localeCompare("" + vb);
    });
  }
  return sorted;
});

const pageFilters = [
  { key: "monthYear", label: "Month & Year", type: "month", show: true },
  {
    key: "attendanceCycle",
    label: "Attendance Cycle",
    type: "select",
    show: true,
  },
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },

  // { key: "attendance", label: "Attendance type", type: "select", show: true },
  { key: "mode", label: " Attendance Mode", type: "select", show: true },
];

const statusOptions = ["in", "out", "notPunchedIn", "unknown"];
const attendanceOptions = [
  "present",
  "absent",
  "weekOff",
  "holiday",
  "onDuty",
  "workFromHome",
  "halfDay",
  "paidLeave",
  "unpaidLeave",
  "holidayPresent",
  "weekoffPresent",
  "earlyLeaving",
  "lateComing",
  "workingDayOT",
  "weekOffOT",
  "holidayOT",
  "workFromHomeOT",
  "unknown",
];
const modeOptions = ref([
  { value: "face", title: "AI Face" },
  { value: "manual", title: "Manual Entry" },
  { value: "import", title: "Import Entry" },
  { value: "throughApp", title: " App Entry" },
  { value: "cronJob", title: "System Auto entry" },
  { value: "rfid", title: "Card Entry" },
  { value: "systemUpdate", title: "Abnormality" },
]);

const exportOptions = ref([
  { label: "Excel", value: "excel", icon: Download },
  { label: "CSV", value: "csv", icon: Download },
  { label: "PDF", value: "pdf", icon: Download },
]);

const columns = ref([
  { key: "profile", label: "Profile", width: "60px" },
  { key: "employeeId", label: "EmpID", sortable: true, width: "120px" },
  {
    key: "employeeName",
    label: "Employee Name",
    sortable: true,
    width: "250px",
  },
  // { key: "status", label: "Current Status", sortable: true, width: "150px" },
  { key: "date", label: "Date", sortable: true, width: "150px" },
  { key: "attendance", label: "Attendance", sortable: true, width: "150px" },
  // {
  //   key: "attendanceContext",
  //   label: "Context",
  //   sortable: true,
  //   width: "300px",
  // },
  // { key: "leaveType", label: "Leave Type", sortable: true, width: "120px" },
  { key: "mode", label: "Mode", sortable: true, width: "150px" },
  { key: "inTime", label: "First Punch", sortable: true, width: "100px" },
  { key: "outTime", label: "Last Punch", sortable: true, width: "100px" },
  { key: "workHours", label: "Work Duration", sortable: true, width: "120px" },
  // { key: "breakTime", label: "Break Time", sortable: true, width: "120px" },
  { key: "lateBy", label: "Late By", sortable: true, width: "100px" },
  { key: "overTime", label: "Over Time", sortable: true, width: "100px" },
]);

const getStatusClass = (status) => {
  switch (status) {
    case "in":
      return "present";
    case "out":
      return "absent";
    case "notPunchedIn":
      return "weekoff";
    case "abnormality":
      return "holiday";
    default:
      return "total";
  }
};

const getAttendanceClass = (attendance) => {
  switch (attendance) {
    case "present":
      return "present";
    case "absent":
      return "absent";
    case "weekOff":
      return "weekoff";
    case "holiday":
      return "holiday";
    case "onDuty":
      return "onduty";
    case "workFromHome":
      return "wfh";
    case "halfDay":
      return "halfday";
    case "paidLeave":
      return "paid";
    case "unpaidLeave":
      return "unpaid";
    default:
      return "total";
  }
};

const getModeClass = (mode) => {
  switch (mode) {
    case "face":
      return "present";
    case "manual":
      return "absent";
    case "import":
      return "weekoff";
    case "throughApp":
      return "holiday";
    case "cronJob":
      return "onduty";
    case "rfid":
      return "wfh";
    case "systemUpdate":
      return "halfday";
    default:
      return "total";
  }
};

const getModeDisplayName = (mode) => {
  const modeOption = modeOptions.value.find((option) => option.value === mode);
  return modeOption ? modeOption.title : mode;
};

const hasActiveFilters = computed(() => {
  return (
    filters.organization ||
    filters.branch ||
    filters.department ||
    filters.status ||
    filters.attendance ||
    filters.mode ||
    filters.attendanceCycle ||
    filters.cycleEndDate ||
    filters.cycleStartDate ||
    search.value
  );
});

const formatTime24Hour = (time) => {
  if (!time) return "-";
  try {
    if (time.includes(":") && time.split(":").length >= 2) {
      const parts = time.split(":");
      const hours = parts[0].padStart(2, "0");
      const minutes = parts[1].padStart(2, "0");
      const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";
      return `${hours}:${minutes}:${seconds}`;
    }
    return time;
  } catch (e) {
    console.error("Error formatting time:", e);
    return time;
  }
};

const formatDuration24Hour = (duration) => {
  if (!duration) return "-";
  try {
    if (duration.includes(":")) {
      const parts = duration.split(":");
      const hours = parts[0].padStart(2, "0");
      const minutes = parts[1].padStart(2, "0");
      const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";
      return `${hours}:${minutes}:${seconds}`;
    }
    return duration;
  } catch (e) {
    console.error("Error formatting duration:", e);
    return duration;
  }
};

const getValueByKey = (item, key) => {
  switch (key) {
    case "employeeId":
      return item.employeeId?.employeeId;
    case "employeeName":
      return item.employeeId?.assignedUser?.first_name;
    case "status":
      return item.status;
    case "date":
      return item.date;
    case "attendance":
      return item.attendance;
    case "attendanceContext":
      return item.attendanceContext;
    case "leaveType":
      return item.leaveType;
    case "mode":
      return item.mode;
    case "inTime":
      return item.inTime;
    case "outTime":
      return item.outTime;
    case "workHours":
      return item.workHours;
    case "breakTime":
      return item.breakTime;
    case "lateBy":
      return item.lateBy;
    case "overTime":
      return item.overTime;
    default:
      return null;
  }
};

const handleRowClick = (item) => {
  selectedRecord.value = item;
  editMode.value = true;
  showFilters.value = true;

  editForm.id = item.id;
  editForm.employeeName = item.employeeId?.assignedUser?.first_name || "";
  editForm.attendance = item.attendance || "";
  editForm.date = item.date || "";
  editForm.inTime = item.inTime || "";
  editForm.outTime = item.outTime || "";
  editForm.mode = "manual";
  editForm.lateByMinutes = item.lateBy;
  editForm.overtimeMinutes = item.overTime;
  editForm.workHours = item.workHours;
  editForm.earlyDepartureMinutes = item.earlyDeparture;
};

const saveEdit = async () => {
  try {
    loading.value = true;

    const updateData = {
      attendance: editForm.attendance,
      inTime: editForm.inTime,
      outTime: editForm.outTime,
      mode: editForm.mode,
      lateBy: editForm.lateByMinutes,
      overTime: editForm.overtimeMinutes,
      earlyDeparture: editForm.earlyDepartureMinutes,
      workHours: editForm.workHours,
    };

    let response;
    if (editForm.id) {
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/attendance/${editForm.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );
    } else {
      updateData.employeeId = selectedRecord.value.employeeId.id;
      updateData.date = editForm.date;
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/attendance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );
    }

    if (response.ok) {
      await fetchAttendance();
      successMessage.value = "Attendance updated successfully!";
      showSuccessMessage.value = true;

      setTimeout(() => {
        showSuccessMessage.value = false;
        cancelEdit();
        showFilters.value = false;
      }, 2000);
    } else {
      throw new Error("Failed to update attendance");
    }
  } catch (error) {
    console.error("Error updating attendance:", error);
    setErrorMessage("Failed to update attendance record");
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  editMode.value = false;
  selectedRecord.value = null;
  Object.keys(editForm).forEach((key) => {
    editForm[key] = key === "mode" ? "manual" : "";
  });
};

const closePanel = () => {
  showFilters.value = false;
  if (editMode.value) cancelEdit();
};

const handleImport = () => {
  showImportModal.value = true;
};

const handleImportSuccess = () => {
  fetchAttendance();
  showImportModal.value = false;
  successMessage.value = "Attendance data imported successfully!";
  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 3000);
};

const handleExportOption = (item) => {
  switch (item.value) {
    case "excel":
      handleDownload("excel");
      break;
    case "csv":
      handleDownload("csv");
      break;
    case "pdf":
      handleDownload("pdf");
      break;
  }
};

const handleDownload = async (format) => {
  try {
    loading.value = true;
    let formattedData;
    if (isVirtualMode.value) {
      formattedData = filteredItems.value.map((item) => ({
        "Employee ID": item.employeeId?.employeeId || "-",
        "Employee Name": item.employeeId?.assignedUser?.first_name || "-",
        Branch: item.employeeId?.branch?.branchName || "-",
        Department: item.employeeId?.department?.departmentName || "-",
        Status: item.status || "-",
        Date: item.date || "-",
        Attendance: item.attendance || "-",
        "Attendance Context": item.attendanceContext || "-",
        "Leave Type": item.leaveType || "-",
        Mode: getModeDisplayName(item.mode) || "-",
        "In Time": formatTime24Hour(item.inTime),
        "Out Time": formatTime24Hour(item.outTime),
        "Work Hours": formatDuration24Hour(item.workHours),
        "Break Time": formatDuration24Hour(item.breakTime),
        "Late By": formatDuration24Hour(item.lateBy),
        "Over Time": formatDuration24Hour(item.overTime),
        "On Time": formatDuration24Hour(item.onTime),
      }));
    } else {
      await aggregateCount();
      const batchSize = 100;
      const total = totalItems.value;
      const totalPages = Math.ceil(total / batchSize);
      let allData = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const params = {
          fields: [
            "employeeId.employeeId",
            "employeeId.branch.id",
            "employeeId.branch.branchName",
            "employeeId.department.id",
            "employeeId.department.departmentName",
            "employeeId.assignedUser.id",
            "employeeId.assignedUser.first_name",
            "status",
            "date",
            "attendance",
            "id",
            "mode",
            "inTime",
            "outTime",
            "onTime",
            "overTime",
            "lateBy",
            "workHours",
            "breakTime",
            "attendanceContext",
            "leaveType",
          ],
          ...filterParams(),
          sort: "-date",
          page: pageNum,
          limit: batchSize,
        };

        const queryString = Object.keys(params)
          .map((key) => {
            if (key === "fields") {
              return params[key].map((field) => `fields[]=${field}`).join("&");
            } else if (
              typeof params[key] === "object" &&
              params[key] !== null
            ) {
              return Object.keys(params[key])
                .map((subKey) => {
                  if (
                    typeof params[key][subKey] === "object" &&
                    params[key][subKey] !== null
                  ) {
                    return Object.keys(params[key][subKey])
                      .map((opKey) => {
                        return `${key}[${subKey}][${opKey}]=${encodeURIComponent(params[key][subKey][opKey])}`;
                      })
                      .join("&");
                  }
                  return `${key}[${subKey}]=${encodeURIComponent(params[key][subKey])}`;
                })
                .join("&");
            }
            return `${key}=${encodeURIComponent(params[key])}`;
          })
          .join("&");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        allData = [...allData, ...data.data];
      }

      formattedData = allData.map((item) => ({
        "Employee ID": item.employeeId?.employeeId || "-",
        "Employee Name": item.employeeId?.assignedUser?.first_name || "-",
        Branch: item.employeeId?.branch?.branchName || "-",
        Department: item.employeeId?.department?.departmentName || "-",
        Status: item.status || "-",
        Date: item.date || "-",
        Attendance: item.attendance || "-",
        "Attendance Context": item.attendanceContext || "-",
        "Leave Type": item.leaveType || "-",
        Mode: getModeDisplayName(item.mode) || "-",
        "In Time": formatTime24Hour(item.inTime),
        "Out Time": formatTime24Hour(item.outTime),
        "Work Hours": formatDuration24Hour(item.workHours),
        "Break Time": formatDuration24Hour(item.breakTime),
        "Late By": formatDuration24Hour(item.lateBy),
        "Over Time": formatDuration24Hour(item.overTime),
        "On Time": formatDuration24Hour(item.onTime),
      }));
    }

    switch (format) {
      case "excel":
        await exportToExcel(formattedData);
        break;
      case "csv":
        exportToCSV(formattedData);
        break;
      case "pdf":
        await exportToPDF(formattedData);
        break;
      default:
        await exportToExcel(formattedData);
    }
  } catch (error) {
    setErrorMessage(
      `Failed to export data. Please try again. (${error.message})`,
    );
  } finally {
    loading.value = false;
  }
};

const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");
  worksheet.columns = [
    { header: "Date", key: "Date", width: 15 },
    { header: "Employee ID", key: "Employee ID", width: 15 },
    { header: "Employee Name", key: "Employee Name", width: 20 },
    { header: "Branch", key: "Branch", width: 20 },
    { header: "Department", key: "Department", width: 20 },
    { header: "Status", key: "Status", width: 15 },
    { header: "Attendance", key: "Attendance", width: 15 },
    { header: "Leave Type", key: "Leave Type", width: 15 },
    { header: "In Time", key: "In Time", width: 15 },
    { header: "Out Time", key: "Out Time", width: 15 },
    { header: "Work Hours", key: "Work Hours", width: 15 },
    { header: "Over Time", key: "Over Time", width: 15 },
    { header: "On Time", key: "On Time", width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 25;

  data.forEach((item) => {
    worksheet.addRow({
      "Employee ID": item["Employee ID"],
      "Employee Name": item["Employee Name"],
      Branch: item["Branch"],
      Department: item["Department"],
      Status: item["Status"],
      Date: item["Date"],
      Attendance: item["Attendance"],
      "Leave Type": item["Leave Type"],
      "In Time": item["In Time"],
      "Out Time": item["Out Time"],
      "Work Hours": item["Work Hours"],
      "Over Time": item["Over Time"],
      "On Time": item["On Time"],
    });
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadFile(
    blob,
    `Attendance_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

const exportToCSV = (data) => {
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(
    blob,
    `Attendance_Export_${new Date().toISOString().split("T")[0]}.csv`,
  );
};

const exportToPDF = async (data) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
  doc.setFontSize(16);
  doc.text("Attendance Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 20);

  const headers = [
    "Date",
    "Employee ID",
    "Employee Name",
    "Branch",
    "Department",
    "Status",
    "Attendance",
    "In Time",
    "Out Time",
    "Work Hours",
  ];

  const tableData = data.map((item) => [
    item["Date"],
    item["Employee ID"],
    item["Employee Name"],
    item["Branch"],
    item["Department"],
    item["Status"],
    item["Attendance"],
    item["In Time"],
    item["Out Time"],
    item["Work Hours"],
  ]);

  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 25,
    margin: { horizontal: 14 },
    styles: { fontSize: 8 },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 15 },
    },
  });

  doc.save(`Attendance_Export_${new Date().toISOString().split("T")[0]}.pdf`);
};

const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const aggregateCount = async () => {
  try {
    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };
    delete params.page;
    delete params.limit;
    const queryString = Object.keys(params)
      .map((key) => {
        if (typeof params[key] === "object" && params[key] !== null) {
          return Object.keys(params[key])
            .map((subKey) => {
              if (
                typeof params[key][subKey] === "object" &&
                params[key][subKey] !== null
              ) {
                return Object.keys(params[key][subKey])
                  .map((opKey) => {
                    return `${key}[${subKey}][${opKey}]=${encodeURIComponent(params[key][subKey][opKey])}`;
                  })
                  .join("&");
              }
              return `${key}[${subKey}]=${encodeURIComponent(params[key][subKey])}`;
            })
            .join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!countResponse.ok)
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};

// const fetchEmployees = async () => {
//   try {
//     const params = {
//       ...filterParams(true, true, false),
//       limit: -1,
//       sort: "employeeId",
//       fields: [
//         "id",
//         "employeeId",

//         "department.id",
//         "department.departmentName",
//         "assignedUser.id",
//         "assignedUser.first_name",
//       ],
//     };

//     const queryString = Object.keys(params)
//       .map((key) => {
//         if (key === "fields") {
//           return params[key].map((field) => `fields[]=${field}`).join("&");
//         } else if (typeof params[key] === "object" && params[key] !== null) {
//           return Object.keys(params[key])
//             .map((subKey) => {
//               if (
//                 typeof params[key][subKey] === "object" &&
//                 params[key][subKey] !== null
//               ) {
//                 return Object.keys(params[key][subKey])
//                   .map((opKey) => {
//                     return `${key}[${subKey}][${opKey}]=${encodeURIComponent(params[key][subKey][opKey])}`;
//                   })
//                   .join("&");
//               }
//               return `${key}[${subKey}]=${encodeURIComponent(params[key][subKey])}`;
//             })
//             .join("&");
//         }
//         return `${key}=${encodeURIComponent(params[key])}`;
//       })
//       .join("&");

//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//     const data = await response.json();
//     employees.value = data.data;
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//   }
// };
const fetchAuthorizedImage = async (imageUrl) => {
  try {
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
const fetchAttendance = async () => {
  if (!token) {
    setErrorMessage("Authentication required. Please login again.");
    return;
  }

  try {
    loading.value = true;

    if (isVirtualMode.value) {
      // Generate date range based on cycle
      const start = parseISO(filters.cycleStartDate);
      const end = parseISO(filters.cycleEndDate);
      const dates = eachDayOfInterval({ start, end }).map((d) =>
        format(d, "yyyy-MM-dd"),
      );

      // Fetch ALL existing attendance records for the date range and filters
      const attParams = {
        ...filterParams(true, false, true),
        limit: -1,
        fields: [
          "employeeId.id",
          "employeeId.employeeId",
          "employeeId.department.id",
          "employeeId.department.departmentName",
          "employeeId.assignedUser.id",
          "employeeId.assignedUser.first_name",
          "status",
          "date",
          "attendance",
          "id",
          "mode",
          "inTime",
          "outTime",
          "onTime",
          "overTime",
          "lateBy",
          "workHours",
          "breakTime",
          "attendanceContext",
          "leaveType",
        ],
      };

      const queryString = Object.keys(attParams)
        .map((key) => {
          if (key === "fields") {
            return attParams[key].map((field) => `fields[]=${field}`).join("&");
          } else if (
            typeof attParams[key] === "object" &&
            attParams[key] !== null
          ) {
            return Object.keys(attParams[key])
              .map((subKey) => {
                if (
                  typeof attParams[key][subKey] === "object" &&
                  attParams[key][subKey] !== null
                ) {
                  return Object.keys(attParams[key][subKey])
                    .map((opKey) => {
                      return `${key}[${subKey}][${opKey}]=${encodeURIComponent(attParams[key][subKey][opKey])}`;
                    })
                    .join("&");
                }
                return `${key}[${subKey}]=${encodeURIComponent(attParams[key][subKey])}`;
              })
              .join("&");
          }
          return `${key}=${encodeURIComponent(attParams[key])}`;
        })
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const existingAttendances = data.data;

      // Fetch avatars for existing records and mark them as not virtual
      const attendancesWithAvatars = await Promise.all(
        existingAttendances.map(async (attendance) => {
          const attendanceWithAvatar = { ...attendance, isVirtual: false };
          if (attendance.employeeId?.assignedUser?.avatar?.id) {
            const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${
              attendance.employeeId.assignedUser.avatar.id
            }`;
            attendanceWithAvatar.avatarImage =
              await fetchAuthorizedImage(avatarUrl);
          } else {
            attendanceWithAvatar.avatarImage = null;
          }
          return attendanceWithAvatar;
        }),
      );

      // Create a map of existing attendance records by employeeId_date
      const existingAttendanceMap = new Map(
        attendancesWithAvatars.map((a) => [`${a.employeeId.id}_${a.date}`, a]),
      );

      // Extract unique employee IDs from existing attendance data
      const employeeIdsWithAttendance = new Set(
        existingAttendances.map((a) => a.employeeId.id),
      );

      // Build final items array
      const tempItems = [];

      // Only process employees who have at least one attendance record
      for (const employeeId of employeeIdsWithAttendance) {
        // Get employee details from first attendance record
        const sampleRecord = existingAttendances.find(
          (a) => a.employeeId.id === employeeId,
        );
        const empData = sampleRecord.employeeId;

        for (const date of dates) {
          const key = `${employeeId}_${date}`;

          if (existingAttendanceMap.has(key)) {
            // Use existing record
            tempItems.push(existingAttendanceMap.get(key));
          } else {
            // Generate virtual record ONLY for missing dates of employees with attendance
            const virtualRecord = {
              id: null,
              isVirtual: true,
              employeeId: {
                id: empData.id,
                employeeId: empData.employeeId,
                branch: empData.branch || {},
                department: empData.department || {},
                assignedUser: empData.assignedUser || {},
              },
              date: date,
              status: "notPunchedIn",
              attendance: "absent",
              mode: "manual",
              inTime: null,
              outTime: null,
              workHours: null,
              breakTime: null,
              lateBy: null,
              overTime: null,
              onTime: null,
              attendanceContext: null,
              leaveType: null,
              earlyDeparture: null,
              avatarImage: null,
            };
            tempItems.push(virtualRecord);
          }
        }
      }

      allPossibleItems.value = tempItems;
    } else {
      await aggregateCount();
      const params = {
        fields: [
          "employeeId.employeeId",
          "employeeId.branch.id",
          "employeeId.branch.branchName",
          "employeeId.department.id",
          "employeeId.department.departmentName",
          "employeeId.assignedUser.id",
          "employeeId.assignedUser.first_name",
          "status",
          "date",
          "attendance",
          "id",
          "mode",
          "inTime",
          "outTime",
          "onTime",
          "overTime",
          "lateBy",
          "workHours",
          "breakTime",
          "attendanceContext",
          "leaveType",
        ],
        ...filterParams(),
        sort:
          sortDirection.value === "desc" ? `-${sortBy.value}` : sortBy.value,
        page: page.value,
        limit: itemsPerPage.value,
      };

      const queryString = Object.keys(params)
        .map((key) => {
          if (key === "fields") {
            return params[key].map((field) => `fields[]=${field}`).join("&");
          } else if (typeof params[key] === "object" && params[key] !== null) {
            return Object.keys(params[key])
              .map((subKey) => {
                if (
                  typeof params[key][subKey] === "object" &&
                  params[key][subKey] !== null
                ) {
                  return Object.keys(params[key][subKey])
                    .map((opKey) => {
                      return `${key}[${subKey}][${opKey}]=${encodeURIComponent(params[key][subKey][opKey])}`;
                    })
                    .join("&");
                }
                return `${key}[${subKey}]=${encodeURIComponent(params[key][subKey])}`;
              })
              .join("&");
          }
          return `${key}=${encodeURIComponent(params[key])}`;
        })
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const itemsWithAvatars = await Promise.all(
        data.data.map(async (item) => {
          const itemWithAvatar = { ...item, isVirtual: false };
          if (item.employeeId?.assignedUser?.avatar?.id) {
            const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${
              item.employeeId.assignedUser.avatar.id
            }`;
            itemWithAvatar.avatarImage = await fetchAuthorizedImage(avatarUrl);
          } else {
            itemWithAvatar.avatarImage = null;
          }
          return itemWithAvatar;
        }),
      );

      allPossibleItems.value = itemsWithAvatars;
    }
  } catch (error) {
    setErrorMessage(
      error.message || "Failed to fetch attendance data. Please try again.",
    );
  } finally {
    loading.value = false;
  }
};
const filterParams = (
  skipAttFilters = false,
  skipDate = false,
  forAttendance = true,
) => {
  const params = {};
  let filterCount = 0;
  const prefix = forAttendance ? "[employeeId]" : "";

  if (role.value === "Admin" || role.value === "Dealer") {
    params[
      `filter[_and][${filterCount}]${prefix}[assignedUser][tenant][tenantId][_eq]`
    ] = tenantId.value;
    filterCount++;
  } else if (role.value === "Manager") {
    params[`filter[_or][0]${prefix}[assignedUser][id][_eq]`] = userId;
    params[`filter[_or][1]${prefix}[approver][id][_eq]`] = userId;
  } else if (role.value === "Employee") {
    params[`filter[_and][${filterCount}]${prefix}[assignedUser][id][_eq]`] =
      userId;
    filterCount++;
  }

  if (filters.organization) {
    params[
      `filter[_and][${filterCount}]${prefix}[assignedUser][organization][id][_eq]`
    ] = filters.organization;
    filterCount++;
  }

  if (filters.branch) {
    params[`filter[_and][${filterCount}]${prefix}[branch][id][_eq]`] =
      filters.branch;
    filterCount++;
  }

  if (filters.department) {
    params[`filter[_and][${filterCount}]${prefix}[department][id][_eq]`] =
      filters.department;
    filterCount++;
  }

  if (filters.attendanceCycle) {
    params[`filter[_and][${filterCount}]${prefix}[cycleType][_icontains]`] =
      filters.attendanceCycle;
    filterCount++;
  }

  if (!skipAttFilters && forAttendance) {
    if (filters.status) {
      params[`filter[_and][${filterCount}][status][_in]`] = filters.status;
      filterCount++;
    }

    if (filters.attendance) {
      params[`filter[_and][${filterCount}][attendance][_in]`] =
        filters.attendance;
      filterCount++;
    }

    if (filters.mode) {
      params[`filter[_and][${filterCount}][mode][_in]`] = filters.mode;
      filterCount++;
    }
  }

  if (!skipDate && forAttendance) {
    if (filters.cycleStartDate) {
      params[`filter[_and][${filterCount}][date][_gte]`] =
        filters.cycleStartDate;
      filterCount++;
    }

    if (filters.cycleEndDate) {
      params[`filter[_and][${filterCount}][date][_lte]`] = filters.cycleEndDate;
      filterCount++;
    }
  }

  if (search.value) {
    let searchOrIndex = 0;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}]${prefix}[employeeId][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}]${prefix}[assignedUser][first_name][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}]${prefix}[branch][branchName][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}]${prefix}[department][departmentName][_icontains]`
    ] = search.value;
    searchOrIndex++;

    if (forAttendance) {
      params[
        `filter[_and][${filterCount}][_or][${searchOrIndex}][status][_icontains]`
      ] = search.value;
      searchOrIndex++;

      const dateFormats = [
        /^\d{4}-\d{2}-\d{2}$/,
        /^\d{2}-\d{2}-\d{4}$/,
        /^\d{2}\/\d{2}\/\d{4}$/,
      ];
      if (dateFormats.some((format) => format.test(search.value))) {
        let dateValue = search.value;
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
          const parts = dateValue.split("-");
          dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
          const parts = dateValue.split("/");
          dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        params[
          `filter[_and][${filterCount}][_or][${searchOrIndex}][date][_eq]`
        ] = dateValue;
        searchOrIndex++;
      }
      params[
        `filter[_and][${filterCount}][_or][${searchOrIndex}][attendance][_icontains]`
      ] = search.value;
      searchOrIndex++;
      params[
        `filter[_and][${filterCount}][_or][${searchOrIndex}][mode][_icontains]`
      ] = search.value;
      searchOrIndex++;
      params[
        `filter[_and][${filterCount}][_or][${searchOrIndex}][leaveType][_icontains]`
      ] = search.value;
      searchOrIndex++;
    }
    filterCount++;
  }

  return params;
};

const formatDateRange = (from, to) => {
  if (!from || !to) return "";
  const formatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
  const fromDate = new Date(from).toLocaleDateString("en-GB", formatOptions);
  const toDate = new Date(to).toLocaleDateString("en-GB", formatOptions);
  return `${fromDate} - ${toDate}`;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  if (!isVirtualMode.value) fetchAttendance();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  if (!isVirtualMode.value) fetchAttendance();
};

const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
  if (!isVirtualMode.value) fetchAttendance();
};

const toggleFilters = () => {
  if (editMode.value) {
    cancelEdit();
    showFilters.value = true;
  } else {
    showFilters.value = !showFilters.value;
  }
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  fetchAttendance();
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = "";
  });
  selectedMonthIndex.value = -1;
  page.value = 1;
  fetchAttendance();
};

const setErrorMessage = (message) => {
  errorMessage.value = message;
  showError.value = true;
  setTimeout(() => {
    showError.value = false;
    errorMessage.value = "";
  }, 3000);
};

watch(selectedMonthIndex, () => {
  page.value = 1;
  fetchAttendance();
});

watch(search, () => {
  debouncedFetchAttendance();
});

onMounted(async () => {
  await fetchAttendance();
});

onUnmounted(() => {
  debouncedFetchAttendance.cancel();
});
</script>

<style scoped>
.employee-container {
  display: flex;
  height: 100vh;
  position: relative;

  background-color: #f5f7fa;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-area.full-width {
  margin-right: 0;
}

.filter-pane {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.filter-toggle-static {
  position: relative;
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
  left: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
}

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
.attendance-count.halfday {
  background: #fef3c7;
  color: #92400e;
}
.attendance-count.paid,
.attendance-count.unpaid {
  background: #f3e8ff;
  color: #7c3aed;
}
.attendance-count.total {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
}

.import-btn {
  background: #122f68 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transition: all 0.3s ease !important;
}

.import-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4) !important;
}

.filter-panel {
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  right: 0;
  top: 64px;
  height: calc(100vh - 64px);
  z-index: 100;
}

.filter-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.cycle-info {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-message,
.error-message {
  position: sticky;
  top: 0;
  z-index: 10;
}

.success-message .v-alert,
.error-message .v-alert {
  margin: 0 !important;
  border-radius: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

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
    border-left: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 50vh;
    position: relative;
    top: 0;
  }

  .filter-toggle-static {
    position: static;
    margin: 1rem;
    width: 40px;
    height: 40px;
  }

  .content-area {
    margin-right: 0 !important;
  }
}
</style>

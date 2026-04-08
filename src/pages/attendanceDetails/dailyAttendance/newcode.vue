<template>
  <div class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <v-data-table
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="-1"
        class="elevation-1 employee-table"
        height="calc(90vh - 190px)"
        show-select
        fixed-header
        @click:row="handleRowClick"
      >
        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <v-text-field
              v-model="search"
              label="Search Attendance"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>

            <div class="position-relative">
              <v-btn color="primary" @click="toggleFilters">
                <v-icon start>mdi-filter</v-icon>
                Filters
              </v-btn>
              <span v-if="hasActiveFilters" class="filter-indicator"></span>
            </div>
            <v-btn color="black" @click="handleDownload" class="ms-2">
              <v-icon start>mdi-download</v-icon>
              Download
            </v-btn>
          </div>
        </template>

        <template v-slot:[`item.inTime`]="{ item }">
          {{ formatTime(item.inTime) }}
        </template>
        <template v-slot:[`item.outTime`]="{ item }">
          {{ formatTime(item.outTime) }}
        </template>
        <template v-slot:[`item.workHours`]="{ item }">
          {{ formatDuration(item.workHours) }}
        </template>
        <template v-slot:[`item.breakTime`]="{ item }">
          {{ formatDuration(item.breakTime) }}
        </template>
      </v-data-table>

      <CustomPagination
        :page="page"
        :itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>

    <!-- Right Filter/Edit Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">
              {{ editMode ? "Edit Attendance" : "Advanced Filters" }}
            </h3>
            <v-btn icon @click="closePanel">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div v-if="showSuccessMessage" class="success-message">
          <v-alert type="success" variant="tonal" class="ma-4">
            {{ successMessage }}
          </v-alert>
        </div>

        <div class="filter-content">
          <!-- Edit Mode - Only for Admin -->
          <div v-if="editMode && selectedRecord && isAdmin">
            <v-text-field
              v-model="editForm.employeeName"
              label="Employee Name"
              variant="outlined"
              readonly
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="editForm.attendance"
              :items="attendanceOptions"
              label="Attendance"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model="editForm.date"
              label="Date"
              variant="outlined"
              readonly
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="editForm.inTime"
              label="In Time"
              type="time"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="editForm.outTime"
              label="Out Time"
              type="time"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="editForm.mode"
              label="Mode"
              variant="outlined"
              readonly
              value="manual"
              class="mb-4"
            ></v-text-field>

            <div class="edit-actions">
              <v-btn color="error" variant="text" @click="cancelEdit">
                Cancel
              </v-btn>
              <v-btn color="primary" @click="saveEdit" class="ms-2">
                Save
              </v-btn>
            </div>
          </div>

          <!-- Non-Admin Edit Message -->
          <div
            v-else-if="editMode && selectedRecord && !isAdmin"
            class="text-center pa-4"
          >
            <v-icon size="48" color="warning" class="mb-2">mdi-lock</v-icon>
            <p class="text-body-1 text-medium-emphasis">
              Only administrators can edit attendance records.
            </p>
            <v-btn
              color="primary"
              variant="text"
              @click="cancelEdit"
              class="mt-2"
            >
              Close
            </v-btn>
          </div>

          <!-- Filter Mode -->
          <div v-else>
            <!-- Attendance Cycle Filter -->
            <v-select
              v-model="filters.selectedMonth"
              :items="monthOptions"
              label="Select Month"
              variant="outlined"
              class="mb-4"
              @update:model-value="onMonthChange"
            ></v-select>

            <v-select
              v-model="filters.branch"
              :items="branchOptions"
              item-title="branchName"
              item-value="id"
              label="Branch"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
            ></v-select>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">Department</h4>
            <v-select
              v-model="filters.department"
              :items="departmentOptions"
              item-title="departmentName"
              item-value="id"
              label="Department"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
            ></v-select>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">Status</h4>
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
            ></v-select>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">Attendance</h4>
            <v-select
              v-model="filters.attendance"
              :items="attendanceOptions"
              label="Attendance"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
            ></v-select>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">Mode</h4>
            <v-select
              v-model="filters.mode"
              :items="modeOptions"
              label="Mode"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
            ></v-select>

            <div class="filter-actions">
              <v-btn color="error" variant="text" @click="clearFilters">
                Clear
              </v-btn>
              <v-btn color="primary" @click="applyFilters" class="ms-2">
                Apply
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { ref, onMounted, watch, reactive, computed } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { getAttendanceCycles } from "@/services/attendanceCycle";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import * as XLSX from "xlsx";

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const selectedStatus = ref("all");
const editMode = ref(false);
const selectedRecord = ref(null);

const currentCycleData = ref(null);

const showImportModal = ref(false);
const tenantId = currentUserTenant.getTenantId();
const role = currentUserTenant.getRole();
const token = authService.getToken();
const userId = currentUserTenant.getUserId();
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);

const showSuccessMessage = ref(false);
const successMessage = ref("");
const branchOptions = ref([]);
const departmentOptions = ref([]);

const isAdmin = computed(() => role === "Admin");

const attendanceCycleOptions = ref([]);
const availableCycles = ref([]);

// Edit form
const editForm = reactive({
  id: null,
  employeeName: "",
  attendance: "",
  date: "",
  inTime: "",
  outTime: "",
  mode: "manual",
});

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
const modeOptions = [
  "face",
  "manual",
  "import",
  "throughApp",
  "cronJob",
  "rfid",
];

const statuses = [
  { text: "All", value: "all", color: "primary" },
  { text: "Present", value: "present", color: "success" },
  { text: "Absent", value: "absent", color: "error" },
  { text: "On Leave", value: "leave", color: "warning" },
];

// Updated headers with new field references
const headers = [
  { title: "Employee ID", key: "employeeId.employeeId", width: "120px" },
  {
    title: "Employee Name",
    key: "employeeId.assignedUser.first_name",
    width: "150px",
  },
  {
    title: "Branch",
    key: "employeeId.branch.branchName",
    width: "150px",
  },
  {
    title: "Department",
    key: "employeeId.department.departmentName",
    width: "150px",
  },
  { title: "Status", key: "status", width: "100px" },
  { title: "Date", key: "date", width: "150px" },
  { title: "Attendance", key: "attendance", width: "120px" },
  { title: "attendanceContext", key: "attendanceContext", width: "140px" },
  { title: "leaveType", key: "leaveType", width: "120px" },
  { title: "Day", key: "day", width: "120px" },
  { title: "Mode", key: "mode", width: "100px" },
  { title: "In Time", key: "inTime", width: "100px" },
  { title: "Out Time", key: "outTime", width: "100px" },
  { title: "Work Hours", key: "workHours", width: "120px" },
  { title: "Break Time", key: "breakTime", width: "120px" },
  { title: "Late By", key: "lateBy", width: "100px" },
  { title: "Over Time", key: "overTime", width: "100px" },
  { title: "On Time", key: "onTime", width: "100px" },
];

// Update the filters reactive object
const filters = reactive({
  selectedMonth: new Date().getMonth(), // Default to current month
  dateFrom: "",
  dateTo: "",
  branch: [],
  department: [],
  status: [],
  attendance: [],
  mode: [],
});

// Month options (January to December)
const monthOptions = ref([
  { title: "January", value: 0 },
  { title: "February", value: 1 },
  { title: "March", value: 2 },
  { title: "April", value: 3 },
  { title: "May", value: 4 },
  { title: "June", value: 5 },
  { title: "July", value: 6 },
  { title: "August", value: 7 },
  { title: "September", value: 8 },
  { title: "October", value: 9 },
  { title: "November", value: 10 },
  { title: "December", value: 11 },
]);

// Handle month change
const onMonthChange = (monthValue) => {
  setDateRangeFromMonth(monthValue);
  fetchAttendance();
};

// Set date range based on selected month
const setDateRangeFromMonth = (month) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, month, 1);
  const endDate = new Date(currentYear, month + 1, 0);

  filters.dateFrom = formatDate(startDate);
  filters.dateTo = formatDate(endDate);
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Handle attendance cycle change
const onAttendanceCycleChange = (cycleValue) => {
  setDateRangeFromCycle(cycleValue);
  if (cycleValue !== "custom") {
    fetchAttendance();
  }
};

// Set date range based on cycle selection
const setDateRangeFromCycle = (cycleType) => {
  if (cycleType === "current_cycle" && currentCycleData.value) {
    // Use the dates from the attendance cycle service
    filters.dateFrom = currentCycleData.value.formattedStartDate;
    filters.dateTo = currentCycleData.value.formattedEndDate;
  } else if (cycleType === "custom") {
    // Don't set dates for custom, let user choose
    filters.dateFrom = "";
    filters.dateTo = "";
  }
};

// Fetch attendance cycles from API
const fetchAttendanceCycle = async () => {
  try {
    const cycleData = await getAttendanceCycles(tenantId, token);
    if (cycleData) {
      currentCycleData.value = cycleData;

      // Create cycle options based on the fetched data
      const cycleInfo = cycleData.cycleData;
      availableCycles.value = [cycleData]; // Store the cycle data

      // Create dropdown options
      attendanceCycleOptions.value = [
        {
          title: `Current Cycle (${cycleData.formattedStartDate} to ${cycleData.formattedEndDate})`,
          value: "current_cycle",
        },
        { title: "Custom Range", value: "custom" },
      ];

      // Set default to current cycle
      filters.attendanceCycle = "current_cycle";
      setDateRangeFromCycle("current_cycle");
    }
  } catch (error) {
    console.error("Error fetching attendance cycle:", error);
    // Fallback to custom range only if API fails
    attendanceCycleOptions.value = [{ title: "Custom Range", value: "custom" }];
    filters.attendanceCycle = "custom";
  }
};

// Fetch branches and departments
const fetchBranchesAndDepartments = async () => {
  try {
    // Fetch branches
    const branchResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=branchName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (branchResponse.ok) {
      const branchData = await branchResponse.json();
      branchOptions.value = branchData.data || [];
    }

    // Fetch departments
    const deptResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (deptResponse.ok) {
      const deptData = await deptResponse.json();
      departmentOptions.value = deptData.data || [];
    }
  } catch (error) {
    console.error("Error fetching branches and departments:", error);
  }
};

// Update handleRowClick to check admin role
const handleRowClick = (event, { item }) => {
  selectedRecord.value = item;
  editMode.value = true;
  showFilters.value = true;

  if (isAdmin.value) {
    // Populate edit form only for admin
    editForm.id = item.id;
    editForm.employeeName = item.employeeId?.assignedUser?.first_name || "";
    editForm.attendance = item.attendance || "";
    editForm.date = item.date || "";
    editForm.inTime = item.inTime || "";
    editForm.outTime = item.outTime || "";
    editForm.mode = "manual";
  }
};

// Update the saveEdit function
const saveEdit = async () => {
  if (!isAdmin.value) {
    return;
  }

  try {
    loading.value = true;

    const updateData = {
      attendance: editForm.attendance,
      inTime: editForm.inTime,
      outTime: editForm.outTime,
      mode: editForm.mode,
    };

    const response = await fetch(
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

    if (response.ok) {
      await fetchAttendance();

      // Show success message
      successMessage.value = "Attendance updated successfully!";
      showSuccessMessage.value = true;

      // Auto close after 2 seconds
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
    showError.value = true;
    errorMessage.value = "Failed to update attendance record";
  } finally {
    loading.value = false;
  }
};

// Cancel edit
const cancelEdit = () => {
  editMode.value = false;
  selectedRecord.value = null;
  Object.keys(editForm).forEach((key) => {
    editForm[key] = key === "mode" ? "manual" : "";
  });
};

// Close panel - Fixed to properly close edit mode
const closePanel = () => {
  showFilters.value = false;
  if (editMode.value) {
    cancelEdit();
  }
};

const handleDownload = async () => {
  try {
    loading.value = true;

    await aggregateCount();
    const batchSize = 100;
    const total = totalItems.value;
    const totalPages = Math.ceil(total / batchSize);
    let allData = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const baseParams = {
        fields: [
          "employeeId.employeeId",
          "employeeId.branch.branchName",
          "employeeId.department.departmentName",
          "employeeId.assignedUser.id",
          "employeeId.assignedUser.first_name",
          "status",
          "date",
          "attendance",
          "id",
          "mode",
          "tenant",
          "inTime",
          "outTime",
          "tenant.tenantId",
          "tenant.tenantName",
          "date_created",
          "onTime",
          "overTime",
          "lateBy",
          "workHours",
          "breakTime",
          "day",
          "attendanceContext",
          "leaveType",
        ],
        ...filterParams(),
        sort: "date",
        page: pageNum,
        limit: batchSize,
      };

      const customParams = hasActiveFilters.value
        ? filterParams()
        : {
            [`filter[tenant][tenantId][_eq]`]: tenantId,
          };

      const params = {
        ...baseParams,
        ...customParams,
      };

      const queryString = Object.keys(params)
        .map((key) => {
          if (key === "fields") {
            return params[key].map((field) => `fields[]=${field}`).join("&");
          }
          return `${key}=${params[key]}`;
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      allData = [...allData, ...data.data];
    }

    // Format data for Excel
    const excelData = allData.map((item) => ({
      "Employee ID": item.employeeId?.employeeId || "-",
      "Employee Name": item.employeeId?.assignedUser.first_name || "-",
      Branch: item.employeeId?.branch?.branchName || "-",
      Department: item.employeeId?.department?.departmentName || "-",
      Status: item.status || "-",
      Date: item.date || "-",
      Attendance: item.attendance || "-",
      "Attendance Context": item.attendanceContext || "-",
      "Leave Type": item.leaveType || "-",
      Day: item.day || "-",
      Mode: item.mode || "-",
      "In Time": formatTime(item.inTime),
      "Out Time": formatTime(item.outTime),
      "Work Hours": formatDuration(item.workHours),
      "Break Time": formatDuration(item.breakTime),
      "Late By": item.lateBy || "-",
      "Over Time": item.overTime || "-",
      "On Time": item.onTime || "-",
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Attendance_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    showError.value = true;
    errorMessage.value =
      "Failed to download attendance data. Please try again.";
  } finally {
    loading.value = false;
  }
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
      `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
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
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};

const fetchAttendance = async () => {
  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  try {
    loading.value = true;

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
        "tenant",
        "inTime",
        "outTime",
        "tenant.tenantId",
        "tenant.tenantName",
        "date_created",
        "onTime",
        "overTime",
        "lateBy",
        "workHours",
        "breakTime",
        "day",
        "attendanceContext",
        "leaveType",
      ],
      ...filterParams(),
      sort: "-date_created",
      page: page.value,
      limit: itemsPerPage.value,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        } else if (key.includes("filter") && Array.isArray(params[key])) {
          return params[key]
            .map((value) => `${key}=${encodeURIComponent(value)}`)
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
      const errorData = await response.text();
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = data.data;
  } catch (error) {
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch attendance data. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Update filterParams function to use _in for branch and department
const filterParams = () => {
  const params = {};
  let filterIndex = 0;

  if (role === "Admin" || role === "Manager" || role === "Dealer") {
    params[`filter[_and][${filterIndex}][tenant][tenantId][_eq]`] = tenantId;
    filterIndex++;
  }
  if (role === "Employee") {
    params[`filter[_and][${filterIndex}][employeeId][assignedUser][id][_eq]`] =
      userId;
    filterIndex++;
  }

  // Branch filter using _in
  if (filters.branch.length) {
    params[`filter[_and][${filterIndex}][employeeId][branch][id][_in]`] =
      filters.branch.join(",");
    filterIndex++;
  }

  // Department filter using _in
  if (filters.department.length) {
    params[`filter[_and][${filterIndex}][employeeId][department][id][_in]`] =
      filters.department.join(",");
    filterIndex++;
  }

  if (search.value) {
    params["filter[_or][0][employeeId][employeeId][_icontains]"] = search.value;
    params["filter[_or][1][employeeId][assignedUser][first_name][_icontains]"] =
      search.value;
    params["filter[_or][2][employeeId][branch][branchName][_icontains]"] =
      search.value;
    params[
      "filter[_or][3][employeeId][department][departmentName][_icontains]"
    ] = search.value;
    params["filter[_or][4][status][_contains]"] = search.value;

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
      params["filter[_or][5][date][_eq]"] = dateValue;
    }
    params["filter[_or][6][attendance][_contains]"] = search.value;
    params["filter[_or][7][mode][_icontains]"] = search.value;
    params["filter[_or][8][leaveType][_icontains]"] = search.value;
  }

  if (filters.status.length) {
    params[`filter[_and][${filterIndex}][status][_in]`] =
      filters.status.join(",");
    filterIndex++;
  }

  if (filters.attendance.length) {
    params[`filter[_and][${filterIndex}][attendance][_in]`] =
      filters.attendance.join(",");
    filterIndex++;
  }

  if (filters.mode.length) {
    params[`filter[_and][${filterIndex}][mode][_in]`] = filters.mode.join(",");
    filterIndex++;
  }

  // Use attendance cycle dates if available
  if (filters.dateFrom) {
    params[`filter[_and][${filterIndex}][date][_gte]`] = filters.dateFrom;
    filterIndex++;
  }

  if (filters.dateTo) {
    params[`filter[_and][${filterIndex}][date][_lte]`] = filters.dateTo;
    filterIndex++;
  }

  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchAttendance(newPage);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  fetchAttendance(newItemsPerPage);
};

const getStatusCount = (status) => {
  if (!hasActiveFilters.value && selectedStatus.value === "all") {
    return 0;
  }
};

const hasActiveFilters = computed(() => {
  return (
    filters.branch.length > 0 ||
    filters.department.length > 0 ||
    filters.status.length > 0 ||
    filters.attendance.length > 0 ||
    filters.mode.length > 0 ||
    filters.attendanceCycle !== "current_cycle" ||
    (filters.attendanceCycle === "custom" &&
      (filters.dateFrom || filters.dateTo))
  );
});

const formatTime = (time) => {
  if (!time) return "-";
  return time;
};

const formatDuration = (duration) => {
  if (!duration) return "-";
  return duration;
};

// Update toggleFilters function for better panel switching
const toggleFilters = () => {
  if (editMode.value) {
    // If edit mode is active, switch to filter mode
    cancelEdit();
    editMode.value = false;
    showFilters.value = true;
  } else if (showFilters.value) {
    // If filters are showing, close panel
    showFilters.value = false;
  } else {
    // Open filter panel
    showFilters.value = true;
  }
};

// Fixed clearFilters function to properly clear all filters
const clearFilters = () => {
  // Reset all filter values
  filters.attendanceCycle = "current_cycle";
  filters.dateFrom = "";
  filters.dateTo = "";
  filters.branch = [];
  filters.department = [];
  filters.status = [];
  filters.attendance = [];
  filters.mode = [];

  // Set date range back to current cycle
  setDateRangeFromCycle("current_cycle");

  // Fetch attendance with cleared filters
  fetchAttendance();
};

const applyFilters = () => {
  fetchAttendance();
};

// Watch for search changes
watch(search, () => {
  fetchAttendance();
});

onMounted(async () => {
  setDateRangeFromMonth(new Date().getMonth());
  await fetchBranchesAndDepartments();
  await fetchAttendance();
});
</script>

<style scoped>
.employee-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.main-content.with-filter {
  margin-right: 300px;
}

.search-field {
  max-width: 300px;
}

.cycle-selector {
  max-width: 200px;
}

/* Table Styles */
:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}

:deep(.v-data-table tbody tr) {
  cursor: pointer;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: #f5f5f5;
}

/* Header Styles */
:deep(.resizable-header) {
  position: relative;
  background: #f5f5f5;
  padding: 0 16px;
  height: 48px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
}

:deep(.resize-handle) {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
}

:deep(.resize-handle:hover) {
  background: rgba(0, 0, 0, 0.1);
}

:deep(.v-data-table td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.v-data-table th) {
  white-space: nowrap;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

::v-deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;
  text-align: start;
  z-index: 1;
}

/* Scrollbar Styling */
:deep(.v-data-table__wrapper::-webkit-scrollbar) {
  height: 8px;
  width: 8px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #888;
  border-radius: 4px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #555;
}

:deep(.v-data-table .text-center) {
  text-align: center;
}

:deep(.v-data-table .status-cell) {
  text-transform: capitalize;
  font-weight: 500;
}

:deep(.v-data-table .time-cell) {
  font-size: 0.9em;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-in {
  background-color: #4caf50;
}

.status-out {
  background-color: #f44336;
}

.time-display {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.null-value {
  color: #999;
  font-style: italic;
}

.v-chip {
  font-weight: 600;
}

.position-relative {
  position: relative;
}

.filter-indicator {
  position: absolute;
  top: 2px;
  right: 3px;
  width: 14px;
  height: 14px;
  background-color: #ff0000;
  border-radius: 50%;
  border: 2px solid white;
  pointer-events: none;
}

.filter-content::-webkit-scrollbar {
  width: 8px;
}

.filter-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.filter-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.filter-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.filter-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e0e0e0;
  position: fixed;
  right: 0;
  top: 64px;
  height: calc(100vh - 64px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

.filter-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
}

.filter-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.filter-actions,
.edit-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  bottom: 0;
}

.success-message {
  position: sticky;
  top: 0;
  z-index: 10;
}

.success-message .v-alert {
  margin: 0 !important;
  border-radius: 0;
}
</style>

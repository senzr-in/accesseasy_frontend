<template>
  <div>
    <!-- Main Import Dialog -->
    <v-dialog v-model="dialog.open" max-width="1100" persistent scrollable>
      <v-card elevation="2">
        <!-- Polished header -->
        <v-toolbar color="#122f68" density="comfortable" flat>
          <v-btn icon variant="text" class="mr-2" color="white">
            <v-icon>mdi-database-import</v-icon>
          </v-btn>
          <v-toolbar-title class="text-white text-pretty">
            Import Attendance Logs
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="closeDialog"
            :disabled="importing"
            color="white"
            variant="text"
            :aria-label="'Close dialog'"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <!-- Visual step indicators (purely presentational) -->
          <v-row class="mb-4" align="center" no-gutters>
            <v-col cols="12" class="d-flex align-center flex-wrap ga-2">
              <v-chip
                :color="state.fileName ? 'success' : 'grey-lighten-2'"
                variant="elevated"
                size="small"
                class="text-body-2"
              >
                <v-icon start>mdi-upload</v-icon>
                1. Upload
              </v-chip>
              <v-icon>mdi-chevron-right</v-icon>
              <v-chip
                :color="
                  validation.loading
                    ? 'info'
                    : state.rows.length
                      ? 'success'
                      : 'grey-lighten-2'
                "
                variant="elevated"
                size="small"
                class="text-body-2"
              >
                <v-icon start>mdi-account-check</v-icon>
                2. Validate
              </v-chip>
              <v-icon>mdi-chevron-right</v-icon>
              <v-chip
                :color="
                  importing
                    ? 'warning'
                    : progress.completedDates > 0
                      ? 'success'
                      : 'grey-lighten-2'
                "
                variant="elevated"
                size="small"
                class="text-body-2"
              >
                <v-icon start>mdi-database-arrow-down</v-icon>
                3. Import
              </v-chip>
              <v-spacer />
              <v-chip
                v-if="state.fileName"
                size="small"
                color="primary"
                variant="tonal"
                class="text-body-2"
              >
                <v-icon start>mdi-file</v-icon>
                {{ state.fileName }}
              </v-chip>
              <v-chip
                v-if="validation.progress > 0"
                size="small"
                color="info"
                variant="tonal"
                class="text-body-2"
              >
                <v-icon start>mdi-progress-clock</v-icon>
                Validating: {{ validation.progress }}%
              </v-chip>
            </v-col>
          </v-row>

          <!-- Step: File upload and options -->
          <v-sheet rounded="lg" class="pa-4 mb-4" color="surface">
            <v-row dense>
              <v-col cols="12" md="7">
                <v-file-input
                  v-model="state.file"
                  accept=".xlsx,.xls,.csv"
                  label="Upload Attendance File"
                  prepend-inner-icon="mdi-file-excel"
                  variant="outlined"
                  density="comfortable"
                  :disabled="importing"
                  @change="onFileSelected"
                  show-size
                  hide-details="auto"
                />
                <div
                  v-if="state.fileName"
                  class="text-caption mt-2 d-flex align-center"
                >
                  <v-icon size="16" class="mr-1"
                    >mdi-information-outline</v-icon
                  >
                  <!-- Selected: <strong class="ml-1">{{ state.fileName }}</strong> -->
                </div>
              </v-col>
              <v-col cols="12" md="5" class="d-flex align-center">
                <v-btn
                  color="primary"
                  variant="text"
                  prepend-icon="mdi-download"
                  @click="downloadSampleFile"
                >
                  Download Sample File
                </v-btn>
              </v-col>
            </v-row>
          </v-sheet>

          <!-- Header validation error -->
          <v-alert
            v-if="validation.headerErrors.length"
            type="error"
            variant="tonal"
            class="mb-4"
            border="start"
            border-color="error"
            :title="`Invalid File Headers`"
          >
            <div class="text-body-2 mb-3">
              The uploaded file is missing or has incorrect headers. Required
              headers are:
              <ul>
                <li>
                  <strong>Employee Code</strong> (or EmployeeCode, EmpCode,
                  Employee ID, etc.)
                </li>
                <li>
                  <strong>LogDate</strong> (or Timestamp, DateTime, Date, etc.)
                </li>
                <li>
                  <strong>Employee Name</strong> (optional, or EmployeeName,
                  Name, etc.)
                </li>
              </ul>
              Missing or invalid headers:
              <strong>{{ validation.headerErrors.join(", ") }}</strong>
            </div>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="downloadSampleFile"
            >
              Download Sample File
            </v-btn>
          </v-alert>

          <!-- Validation status -->
          <v-alert
            v-if="validation.loading"
            type="info"
            variant="tonal"
            class="mb-4"
            density="comfortable"
            border="start"
            border-color="info"
          >
            <div class="d-flex align-center ga-2">
              <v-progress-circular
                indeterminate
                size="16"
                width="2"
                color="info"
              />
              Validating users in personal module...
              <v-progress-linear
                v-if="validation.progress > 0"
                :model-value="validation.progress"
                color="info"
                height="8"
                rounded
                class="ml-2"
                style="width: 100px"
              />
            </div>
          </v-alert>

          <!-- Missing users list -->
          <v-alert
            v-if="validation.missing.length"
            type="warning"
            variant="tonal"
            class="mb-4"
            border="start"
            border-color="warning"
            :title="`Some Employees are not found in Database`"
          >
            <div class="text-body-2 mb-3">
              {{
                "The following users are missing. You can still proceed; those users will be skipped:"
              }}
            </div>
            <v-table
              density="comfortable"
              class="mt-2"
              fixed-header
              height="200"
            >
              <thead>
                <tr>
                  <th class="text-left">Employee ID</th>
                  <th class="text-left">Employee Name</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, idx) in validation.missing" :key="idx">
                  <td>{{ u.employeeId }}</td>
                  <td>{{ u.employeeName || "Unknown" }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-alert>

          <!-- File preview -->
          <v-sheet
            v-if="preview.rows.length"
            rounded="lg"
            class="mb-4"
            color="surface"
          >
            <v-card variant="text">
              <v-card-title class="py-3 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-table-eye</v-icon>
                Uploaded File Preview
                <v-spacer />
                <span class="text-caption text-medium-emphasis"
                  >All {{ preview.rows.length }} rows</span
                >
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-0">
                <v-table density="comfortable" fixed-header height="400">
                  <thead>
                    <tr>
                      <th
                        v-for="(col, cIdx) in preview.headers"
                        :key="cIdx"
                        class="text-left text-no-wrap"
                      >
                        {{ col }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rIdx) in preview.rows" :key="rIdx">
                      <td v-for="(col, cIdx) in preview.headers" :key="cIdx">
                        {{ displayCell(row[col]) }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-sheet>

          <!-- Import progress by date -->
          <v-card v-if="importing" class="mt-2" variant="outlined" rounded="lg">
            <v-card-title class="py-3 d-flex align-center">
              <v-icon class="mr-2">mdi-progress-clock</v-icon>
              Import Progress by Date
              <v-spacer />
              <span class="text-caption">
                {{ progress.completedDates }} / {{ progress.totalDates }} dates
                processed
              </span>
            </v-card-title>
            <v-divider />
            <v-card-text class="pt-4">
              <v-progress-linear
                :model-value="
                  progress.totalDates
                    ? Math.round(
                        (progress.completedDates / progress.totalDates) * 100,
                      )
                    : 0
                "
                color="primary"
                height="8"
                rounded
                class="mb-4"
              />
              <v-table density="comfortable" fixed-header height="300">
                <thead>
                  <tr>
                    <th class="text-left">Date</th>
                    <th class="text-left">Total Rows</th>
                    <th class="text-left">Imported</th>
                    <th class="text-left">Errors</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="date in progress.dateOrder" :key="date">
                    <td class="text-no-wrap">{{ date }}</td>
                    <td>{{ progress.byDate[date]?.total || 0 }}</td>
                    <td>
                      <v-chip size="small" color="success" variant="tonal">
                        {{ progress.byDate[date]?.success || 0 }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip
                        size="small"
                        :color="
                          (progress.byDate[date]?.errors || 0) > 0
                            ? 'error'
                            : 'grey-lighten-2'
                        "
                        variant="tonal"
                      >
                        {{ progress.byDate[date]?.errors || 0 }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-icon
                        v-if="progress.byDate[date]?.status === 'success'"
                        color="success"
                        >mdi-checkbox-marked-circle</v-icon
                      >
                      <v-icon
                        v-else-if="progress.byDate[date]?.status === 'error'"
                        color="error"
                        >mdi-close-circle</v-icon
                      >
                      <v-icon
                        v-else-if="progress.byDate[date]?.status === 'partial'"
                        color="warning"
                        >mdi-alert-circle</v-icon
                      >
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <BaseButton
            variant="danger"
            size="md"
            text="Cancel"
            :disabled="importing"
            @click="closeDialog"
          />
          <BaseButton
            variant="primary"
            size="md"
            text="Import"
            :disabled="!readyToImport || importing || validation.loading"
            :leftIcon="import"
            @click="onImportClicked"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Missing Users Confirmation Dialog -->
    <v-dialog v-model="confirmMissing.open" max-width="520" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon class="mr-2" color="warning">mdi-account-alert</v-icon>
          Import with Missing Users?
        </v-card-title>
        <v-card-text class="pt-2">
          <v-alert
            type="warning"
            variant="tonal"
            border="start"
            border-color="warning"
            density="comfortable"
          >
            There are {{ validation.missing.length }} user(s) not found in the
            personal module. Continue importing logs for existing users and skip
            the missing ones?
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="grey"
            :disabled="importing"
            @click="cancelImportFlow"
          >
            No
          </v-btn>
          <v-btn
            color="primary"
            :disabled="importing"
            @click="startImport(true)"
          >
            Yes, Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import * as XLSX from "xlsx";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

// Expected headers for validation and sample file
const expectedHeaders = {
  employeeCode: [
    "Employee Code",
    "EmployeeCode",
    "employee_code",
    "EmpCode",
    "Employee ID",
    "EmployeeId",
    "Emp Id",
    "EmpID",
  ],
  employeeName: [
    "Employee Name",
    "EmployeeName",
    "Name",
    "Full Name",
    "EmpName",
  ],
  logDate: [
    "LogDate",
    "Log date",
    "Timestamp",
    "Date Time",
    "DateTime",
    "Date",
    "TimeStamp",
  ],
};

// Primary headers for sample file
const sampleHeaders = ["Employee Code", "Employee Name", "LogDate"];

// Sample data for download
const sampleData = [
  {
    "Employee Code": "EMP001",
    "Employee Name": "John Doe",
    LogDate: "2025-09-12 09:00:00",
  },
  {
    "Employee Code": "EMP002",
    "Employee Name": "Jane Smith",
    LogDate: "2025-09-12 17:00:00",
  },
];

/**
 * Helpers: extract common fields from a row using flexible header names
 */
const getEmployeeCode = (row) => {
  const code =
    row["Employee Code"] ||
    row["EmployeeCode"] ||
    row["employee_code"] ||
    row["EmpCode"] ||
    row["Employee ID"] ||
    row["EmployeeId"] ||
    row["Emp Id"] ||
    row["EmpID"];
  return code ? String(code).trim() : "";
};

const getEmployeeName = (row) =>
  row["Employee Name"] ||
  row["EmployeeName"] ||
  row["Name"] ||
  row["Full Name"] ||
  row["EmpName"];

const getDateTimeRaw = (row) =>
  row["LogDate"] ||
  row["Log date"] ||
  row["Timestamp"] ||
  row["Date Time"] ||
  row["DateTime"] ||
  row["Date"] ||
  row["TimeStamp"];

function parseDateAndTime(dateTimeStr) {
  if (!dateTimeStr) return { date: null, time: null };

  // If it's already two columns "Date" + "Time", try to split on space first
  const asString = String(dateTimeStr);
  let datePart = asString;
  let timePart = null;

  // Split date and time (common separators: space, T, comma)
  const spaceSplit = asString.split(" ");
  if (spaceSplit.length >= 2) {
    datePart = spaceSplit[0];
    timePart = spaceSplit.slice(1).join(" ");
  } else if (asString.includes("T")) {
    const tSplit = asString.split("T");
    datePart = tSplit[0];
    timePart = tSplit[1];
  } else if (asString.includes(",")) {
    const commaSplit = asString.split(",");
    datePart = commaSplit[0];
    timePart = commaSplit[1];
  }

  // Parse date
  let dateObj;
  try {
    if (datePart.includes("/")) {
      const [m, d, y] = datePart.split("/").map(Number);
      dateObj = new Date(y, (m || 1) - 1, d || 1);
    } else if (datePart.includes("-")) {
      // Handle ISO format or similar (YYYY-MM-DD)
      const parts = datePart.split("-");
      if (parts.length === 3) {
        // Check if it's YYYY-MM-DD or DD-MM-YYYY
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          // Assume DD-MM-YYYY
          dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
    } else {
      // Fallback to native parsing
      dateObj = new Date(datePart);
    }
    if (isNaN(dateObj.getTime())) return { date: null, time: null };
  } catch {
    return { date: null, time: null };
  }
  const yyyy = String(dateObj.getFullYear());
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  // Parse time
  let formattedTime = null;
  if (timePart) {
    formattedTime = convertToRailwayTime(timePart);
  }

  return { date: formattedDate, time: formattedTime };
}

/**
 * Convert various time formats to railway time (24-hour format)
 */
function convertToRailwayTime(timeStr) {
  if (!timeStr) return null;

  const time = String(timeStr).trim().toUpperCase();

  // Check if it's already in 24-hour format (HH:MM:SS or HH:MM)
  const railwayRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
  if (railwayRegex.test(time)) {
    // Ensure proper formatting (add seconds if missing)
    const parts = time.split(":");
    if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    }
    return time;
  }

  // Handle 12-hour format with AM/PM
  const amPmRegex = /^(\d{1,2}):(\d{2})(:(\d{2}))?\s*(AM|PM)$/;
  const match = time.match(amPmRegex);

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2].padStart(2, "0");
    const seconds = match[4] ? match[4].padStart(2, "0") : "00";
    const period = match[5];

    // Convert to 24-hour format
    if (period === "PM" && hours < 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  }

  // Handle times without AM/PM but potentially in 12-hour format
  const simpleTimeRegex = /^(\d{1,2}):(\d{2})(:(\d{2}))?$/;
  const simpleMatch = time.match(simpleTimeRegex);

  if (simpleMatch) {
    let hours = parseInt(simpleMatch[1], 10);
    const minutes = simpleMatch[2].padStart(2, "0");
    const seconds = simpleMatch[4] ? simpleMatch[4].padStart(2, "0") : "00";

    // If hours > 12, assume it's already in 24-hour format
    if (hours <= 12) {
      console.warn(`Ambiguous time format: ${time}. Assuming 24-hour format.`);
    }

    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  }

  console.error(`Unrecognized time format: ${timeStr}`);
  return null;
}

const getToken = () => localStorage.getItem("userToken");
const tenantId = currentUserTenant.getTenantId();

/**
 * State
 */
const dialog = reactive({ open: false });
const state = reactive({
  file: null,
  fileName: "",
  rows: [], // parsed rows
  headers: [], // detected headers for preview
  branchId: "", // optional
});
const validation = reactive({
  loading: false,
  progress: 0,
  missing: [], // [{ employeeId, employeeName }]
  existsMap: {}, // code -> { id, employeeId, first_name, last_name }
  headerErrors: [], // List of missing/invalid headers
});
const importing = ref(false);
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

/**
 * Progress by date
 */
const progress = reactive({
  byDate: {}, // date -> { total, success, errors, status: 'pending'|'success'|'error'|'partial' }
  dateOrder: [], // to preserve order
  totalDates: 0,
  completedDates: 0,
});

/**
 * Derived
 */
const preview = reactive({
  get rows() {
    return state.rows;
  },
  get headers() {
    return state.headers;
  },
});

const uniqueCodes = computed(() => {
  const set = new Set();
  for (const r of state.rows) {
    const code = getEmployeeCode(r);
    if (code) set.add(String(code).trim());
  }
  return Array.from(set);
});

const codeToName = computed(() => {
  const map = {};
  for (const r of state.rows) {
    const code = getEmployeeCode(r);
    if (!code) continue;
    const name = getEmployeeName(r);
    if (name && !map[code]) map[code] = name;
  }
  return map;
});

const groupedByDateAll = computed(() => {
  // Group all rows by parsed date (including missing users)
  const groups = {};
  for (const r of state.rows) {
    const dtRaw = getDateTimeRaw(r);
    const { date } = parseDateAndTime(dtRaw);
    if (!date) continue;
    groups[date] = groups[date] || [];
    groups[date].push(r);
  }
  return groups;
});

const readyToImport = computed(
  () =>
    state.rows.length > 0 &&
    !validation.loading &&
    validation.headerErrors.length === 0,
);

/**
 * Dialog controls - Exposed openDialog method for external access
 */
function openDialog() {
  resetAll();
  dialog.open = true;
}

function closeDialog() {
  if (importing.value) return;
  dialog.open = false;
}

defineExpose({
  openDialog,
});

/**
 * Download sample file
 */
function downloadSampleFile() {
  try {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Logs");

    // Generate Excel file as an ArrayBuffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create a Blob and trigger download
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_attendance_logs.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(`Failed to generate sample file: ${err.message}`);
  }
}

/**
 * File handling
 */
async function onFileSelected(e) {
  const file = e?.target?.files?.[0] || state.file;
  if (!file) return;

  state.fileName = file.name;
  validation.headerErrors = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });
    state.headers = detectHeaders(rows);

    // Validate headers
    const headerErrors = validateHeaders(state.headers);
    if (headerErrors.length > 0) {
      validation.headerErrors = headerErrors;
      state.file = null;
      state.fileName = "";
      state.rows = [];
      state.headers = [];
      showError("Invalid file headers. Please use the sample file format.");
      return;
    }

    state.rows = rows;

    // Validate users after parsing
    await validateUsers();
    initDateProgress();
  } catch (err) {
    showError(`Failed to read file: ${err?.message || err}`);
    state.file = null;
    state.fileName = "";
  }
}

function detectHeaders(rows) {
  if (!rows?.length) return [];
  const row = rows[0];
  return Object.keys(row);
}

function validateHeaders(headers) {
  const errors = [];
  const employeeCodeFound = headers.some((h) =>
    expectedHeaders.employeeCode.includes(h),
  );
  const logDateFound = headers.some((h) => expectedHeaders.logDate.includes(h));

  if (!employeeCodeFound) {
    errors.push("Employee Code (or similar)");
  }
  if (!logDateFound) {
    errors.push("LogDate (or Timestamp, etc.)");
  }

  return errors;
}

function displayCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

/**
 * Validation against personalModule
 */
async function validateUsers() {
  validation.loading = true;
  validation.progress = 0;
  validation.missing = [];
  validation.existsMap = {};

  try {
    const codes = uniqueCodes.value;
    if (!codes.length) {
      validation.loading = false;
      return;
    }

    // Process in batches of 50 users
    const batchSize = 50;
    const totalBatches = Math.ceil(codes.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchCodes = codes.slice(i * batchSize, (i + 1) * batchSize);

      // Build Directus filter with _or of employeeId codes and tenant
      const filter = {
        _and: [
          { assignedUser: { tenant: { _eq: tenantId } } },
          { _or: batchCodes.map((c) => ({ employeeId: { _eq: c } })) },
        ],
      };

      const params = new URLSearchParams({
        filter: JSON.stringify(filter),
        fields: "id,employeeId,assignedUser.first_name,assignedUser.last_name",
        limit: "-1",
      });

      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // Build exists map
      if (Array.isArray(data?.data)) {
        for (const item of data.data) {
          const code = item.employeeId;
          validation.existsMap[code] = {
            id: item.id,
            employeeId: code,
            first_name: item?.assignedUser?.first_name,
            last_name: item?.assignedUser?.last_name,
          };
        }
      }

      // Update progress
      validation.progress = Math.round(((i + 1) / totalBatches) * 100);
    }

    // Find missing users after all batches are processed
    for (const code of codes) {
      if (!validation.existsMap[code]) {
        validation.missing.push({
          employeeId: code,
          employeeName: codeToName.value[code] || null,
        });
      }
    }
  } catch (err) {
    showError(`Failed to validate users: ${err?.message || err}`);
  } finally {
    validation.loading = false;
    validation.progress = 0;
  }
}

/**
 * Initialize date progress structure
 */
function initDateProgress() {
  progress.byDate = {};
  progress.dateOrder = Object.keys(groupedByDateAll.value).sort();
  for (const d of progress.dateOrder) {
    const total = groupedByDateAll.value[d]?.length || 0;
    progress.byDate[d] = {
      total,
      success: 0,
      errors: 0,
      status: "pending", // pending | success | error | partial
    };
  }
  progress.totalDates = progress.dateOrder.length;
  progress.completedDates = 0;
}

/**
 * Import flow
 */
const confirmMissing = reactive({ open: false });
function onImportClicked() {
  if (validation.missing.length > 0) {
    confirmMissing.open = true;
  } else {
    startImport(false);
  }
}

function cancelImportFlow() {
  confirmMissing.open = false;
  closeDialog();
}

async function startImport(userConfirmedWithMissing) {
  confirmMissing.open = false;
  if (!readyToImport.value) return;

  importing.value = true;
  try {
    for (const date of progress.dateOrder) {
      const rowsForDate = groupedByDateAll.value[date] || [];
      if (!rowsForDate.length) {
        markDateStatus(date, { success: 0, errors: 0, total: 0 });
        continue;
      }

      // Build payload per date (skip missing users)
      const { payload, counts } = await buildPayloadForDate(date, rowsForDate);

      if (!payload.length) {
        // Nothing to import for this date (e.g., all users missing or parse errors)
        markDateStatus(date, {
          success: 0,
          errors: counts.errors,
          total: counts.total,
        });
        continue;
      }

      try {
        // Process logs in batches to avoid large payloads
        const batchSize = 100;
        for (let i = 0; i < payload.length; i += batchSize) {
          const batch = payload.slice(i, i + batchSize);

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/items/logs`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(batch),
            },
          );

          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Server ${res.status}: ${text}`);
          }
        }

        // Mark success for this date
        markDateStatus(date, {
          success: payload.length,
          errors: counts.errors,
          total: counts.total,
        });
      } catch (err) {
        // Mark error and continue
        markDateStatus(date, {
          success: 0,
          errors: (counts.errors || 0) + (rowsForDate.length || 0),
          total: counts.total,
        });
        showError(`Date ${date}: import failed - ${err?.message || err}`);
      }
    }

    snackbar.show = true;
    snackbar.color = "success";
    snackbar.message = "Import completed.";
  } catch (err) {
    showError(`Import failed: ${err?.message || err}`);
  } finally {
    importing.value = false;
  }
}

function markDateStatus(date, { success, errors, total }) {
  const entry = progress.byDate[date] || {
    total: total || 0,
    success: 0,
    errors: 0,
    status: "pending",
  };
  entry.total = total ?? entry.total;
  entry.success = success ?? entry.success;
  entry.errors = errors ?? entry.errors;

  // Status logic:
  // - partial if both success>0 and errors>0
  // - success if success>0
  // - error if success==0 and errors>0
  if (entry.success > 0 && entry.errors > 0) {
    entry.status = "partial";
  } else if (entry.success > 0) {
    entry.status = "success";
  } else if (entry.errors > 0) {
    entry.status = "error";
  } else {
    entry.status = "pending";
  }

  progress.byDate[date] = entry;
  progress.completedDates = Object.values(progress.byDate).filter(
    (d) => d.status !== "pending",
  ).length;
}

/**
 * Build payload per date:
 * - Skip rows with missing users (if not found in personalModule)
 * - For each employee on that date, sort timestamps, alternate in/out
 * - Consider existing logs to decide starting action
 */
async function buildPayloadForDate(date, rowsForDate) {
  const counts = { total: rowsForDate.length, errors: 0 };
  const perEmployee = {};

  // Group timestamps per employee code
  for (const r of rowsForDate) {
    const empCode = getEmployeeCode(r);
    if (!empCode) {
      counts.errors++;
      continue;
    }
    // Skip missing users
    if (!validation.existsMap[empCode]) continue;

    const dtRaw = getDateTimeRaw(r);
    const { date: parsedDate, time } = parseDateAndTime(dtRaw);
    if (!parsedDate || parsedDate !== date || !time) {
      counts.errors++;
      continue;
    }
    perEmployee[empCode] = perEmployee[empCode] || [];
    perEmployee[empCode].push(time);
  }

  // For each employee, determine starting action based on existing logs
  const payload = [];
  for (const [code, times] of Object.entries(perEmployee)) {
    times.sort(); // chronological
    const employeeId = validation.existsMap[code]?.id;
    if (!employeeId) {
      counts.errors++;
      continue;
    }

    // Determine last action from existing logs
    const existingLogs = await checkExistingLogsByEmployeeId(employeeId, date);
    let lastAction = existingLogs[0]?.action || null; // last by date_created desc

    for (const t of times) {
      let action = "in";
      let status = "in";

      if (lastAction === "in") {
        action = "out";
        status = "out";
      } else {
        action = "in";
        status = "in";
      }

      payload.push({
        mode: "import",
        date,
        timeStamp: t,
        tenant: tenantId,
        employeeId,
        action,
        status,
        ValidLogs: "authorized",
        ...(state.branchId ? { branch: state.branchId } : {}),
      });

      lastAction = action;
    }
  }

  return { payload, counts };
}

/**
 * API helpers
 */
async function checkExistingLogsByEmployeeId(employeeId, date) {
  try {
    const filter = {
      _and: [
        { employeeId: { _eq: employeeId } },
        { date: { _eq: date } },
        { tenant: { _eq: tenantId } },
      ],
    };
    const params = new URLSearchParams({
      filter: JSON.stringify(filter),
      fields: "timeStamp,date,action,mode,date_created",
      sort: "-date_created",
      limit: "100",
    });

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/logs?${params}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    // On error, assume no prior logs
    return [];
  }
}

/**
 * Utils
 */
function resetAll() {
  state.file = null;
  state.fileName = "";
  state.rows = [];
  state.headers = [];
  state.branchId = "";

  validation.loading = false;
  validation.progress = 0;
  validation.missing = [];
  validation.existsMap = {};
  validation.headerErrors = [];

  importing.value = false;

  progress.byDate = {};
  progress.dateOrder = [];
  progress.totalDates = 0;
  progress.completedDates = 0;

  snackbar.show = false;
}

function showError(message) {
  snackbar.show = true;
  snackbar.color = "error";
  snackbar.message = message;
}
</script>

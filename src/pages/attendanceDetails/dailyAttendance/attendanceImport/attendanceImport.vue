<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Import Attendance Data</h2>
        <button class="close-btn" @click="$emit('close')">
          <X class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Unknown Users Error Summary -->
        <div v-if="unknownUsers.length > 0" class="error-summary">
          <div class="error-summary-header">
            <AlertTriangle class="error-icon" />
            <h3>Unknown Users Found</h3>
            <button class="close-error-btn" @click="clearUnknownUsers">
              <X class="icon-sm" />
            </button>
          </div>
          <div class="error-summary-content">
            <p>
              {{ unknownUsers.length }} employee(s) not found in the database.
            </p>
            <button class="download-unknown-btn" @click="downloadUnknownUsers">
              <Download class="icon-sm" />
              Download List
            </button>
          </div>

          <!-- Scrollable list of unknown users -->
          <div class="unknown-users-list">
            <table>
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in unknownUsers" :key="index">
                  <td>{{ user.employeeCode }}</td>
                  <td>{{ user.employeeName }}</td>
                  <td>{{ user.department }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Other Errors -->
        <div v-if="errors.length > 0" class="error-container">
          <div class="error-header">
            <AlertCircle class="error-icon" />
            <h3>Errors Found</h3>
            <button class="close-error-btn" @click="clearErrors">
              <X class="icon-sm" />
            </button>
          </div>
          <ul class="error-list">
            <li v-for="(error, index) in errors" :key="index">
              {{ error.message }}
            </li>
          </ul>
        </div>

        <div class="import-section">
          <h3>Upload Attendance File</h3>
          <div
            class="file-upload-container"
            @click="triggerFileInput"
            @drop.prevent="handleFileDrop"
            @dragover.prevent
            @dragenter.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="{
              'file-upload-error': fileError,
              'file-upload-dragging': isDragging,
              'file-upload-has-file': uploadedFile,
            }"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept=".csv, .xlsx"
              class="file-input"
            />
            <div class="file-upload-content">
              <div v-if="!uploadedFile" class="upload-placeholder">
                <UploadCloud class="upload-icon" />
                <p>
                  Drag and drop your attendance file here or click to browse
                </p>
                <span class="file-formats">Supported formats: CSV, XLSX</span>
              </div>
              <div v-else class="file-preview">
                <FileText class="file-icon" />
                <div class="file-info">
                  <p class="file-name">{{ uploadedFile.filename_download }}</p>
                  <p class="file-size">
                    {{ formatFileSize(uploadedFile.filesize) }}
                  </p>
                </div>
                <button class="remove-file-btn" @click.stop="removeFile">
                  <X class="icon-sm" />
                </button>
              </div>
            </div>
          </div>
          <p v-if="fileError" class="field-error">{{ fileError }}</p>
        </div>

        <div v-if="previewData.length > 0" class="preview-section">
          <h3>Data Preview</h3>
          <div class="preview-table-container">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Date</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in previewData" :key="index">
                  <td>{{ item.employeeId }}</td>
                  <td>{{ item.employeeName }}</td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.attendance }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="format-section">
          <h3>File Format</h3>
          <p>Please ensure your attendance file follows this format:</p>
          <ul>
            <li>CSV or XLSX file</li>
            <li>
              Required columns: Employee Code, Employee Name, Department,
              AttendanceDate, Status
            </li>
          </ul>
          <button class="download-template-btn" @click="openDownloadModal">
            <Download class="icon-sm" />
            Download Template
          </button>
        </div>
      </div>

      <div v-if="successMessage" class="success-message">
        <CheckCircle class="success-icon" />
        {{ successMessage }}
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Cancel</button>
        <button
          class="import-btn"
          @click="importData"
          :disabled="
            !uploadedFile ||
            isImporting ||
            errors.length > 0 ||
            isValidating ||
            !dataValidated
          "
        >
          <Loader2 v-if="isImporting || isValidating" class="icon-sm spinner" />
          <span v-if="isValidating">Validating...</span>
          <span v-else-if="isImporting">Importing...</span>
          <span v-else>Import</span>
        </button>
      </div>
    </div>

    <!-- Download Attachment Modal -->
    <downloadAttachment
      v-if="showDownloadModal"
      :fileId="templateFileId"
      @close="showDownloadModal = false"
    />

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmationModal"
      class="modal-overlay confirmation-overlay"
    >
      <div class="confirmation-modal">
        <div class="confirmation-header">
          <AlertTriangle class="warning-icon" />
          <h3>Warning</h3>
        </div>
        <div class="confirmation-body">
          <p>{{ confirmationMessage }}</p>
        </div>
        <div class="confirmation-footer">
          <button class="cancel-btn" @click="cancelConfirmation">
            No, Cancel
          </button>
          <button class="confirm-btn" @click="confirmAction">
            Yes, Continue
          </button>
        </div>
      </div>
    </div>

    <!-- Unknown Users Confirmation Modal -->
    <div
      v-if="showUnknownUsersModal"
      class="modal-overlay unknown-users-overlay"
    >
      <div class="confirmation-modal">
        <div class="confirmation-header">
          <AlertTriangle class="warning-icon" />
          <h3>Unknown Users Found</h3>
        </div>
        <div class="confirmation-body">
          <p>
            {{ unknownUsers.length }} employee(s) were not found in the
            database. Would you like to eliminate these users and continue with
            the import?
          </p>
          <p class="confirmation-note">
            <strong>OK</strong>: Skip unknown users and import the rest<br />
            <strong>Cancel</strong>: Cancel the import process
          </p>
        </div>
        <div class="confirmation-footer">
          <button class="cancel-btn" @click="cancelUnknownUsersConfirmation">
            Cancel
          </button>
          <button class="confirm-btn" @click="confirmUnknownUsersAction">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, watch } from "vue";
import {
  UploadCloud,
  AlertCircle,
  CheckCircle,
  Download,
  X,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-vue-next";
import { currentUserTenant } from "@/utils/currentUserTenant";
import axios from "axios";
import * as XLSX from "xlsx";
import downloadAttachment from "./downloadAttachment.vue";

const uploadedFile = ref(null);
const fileInput = ref(null);
const isImporting = ref(false);
const isValidating = ref(false);
const dataValidated = ref(false);
const successMessage = ref("");
const fileError = ref("");
const errors = ref([]);
const tenantId = currentUserTenant.getTenantId();
const previewData = ref([]);
const employeeIdMap = ref(new Map());
const skippedRecords = ref(0);
const isDragging = ref(false);
const unknownUsers = ref([]);

// Download template related variables
const showDownloadModal = ref(false);
const templateFileId = ref(""); // Replace with your actual template file ID

// Confirmation modal variables
const showConfirmationModal = ref(false);
const confirmationMessage = ref("");
const pendingAction = ref(null);
const existingAttendanceIds = ref([]);
const processedAttendanceData = ref([]);
const jsonData = ref([]);
const importedRecordIds = ref([]); // Track IDs of imported records for rollback

// Unknown users confirmation modal variables
const showUnknownUsersModal = ref(false);
const eliminateUnknownUsers = ref(false);

const emit = defineEmits(["close"]);

// Reset validation state when file changes
watch(uploadedFile, () => {
  dataValidated.value = false;
});

const clearErrors = () => {
  errors.value = [];
  fileError.value = "";
};

const clearUnknownUsers = () => {
  unknownUsers.value = [];
};

const removeFile = () => {
  uploadedFile.value = null;
  previewData.value = [];
  dataValidated.value = false;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const addError = (message, type = "general") => {
  errors.value.push({
    message,
    type,
    timestamp: new Date().toISOString(),
  });
  console.error(`[${type}] ${message}`);
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const getManagerBranchId = async (tenantId, userId) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][id][_eq]=${userId}&filter[_and][1][assignedUser][tenant][tenantId][_eq]=${tenantId}&fields[]=assignedBranch.branch_id.id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (
      response.data?.data?.length > 0 &&
      response.data.data[0].assignedBranch?.length > 0
    ) {
      return response.data.data[0].assignedBranch[0].branch_id.id;
    }
    return null;
  } catch (error) {
    console.error("Error fetching manager branch ID:", error);
    return null;
  }
};

// Function to get the "Imported Files" folder ID from tenant data
const getImportedFilesFolderId = async (tenantId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tenant data");
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the "Imported Files" folder
      const importedFilesFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Imported Files",
      );
      if (importedFilesFolder) {
        return importedFilesFolder.id;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching imported files folder ID:", error);
    return null;
  }
};

// Function to create import record
const createImportRecord = async (fileId, status = "Generated") => {
  const token = getToken();
  const branchId = await getManagerBranchId(
    tenantId,
    currentUserTenant.getUserId(),
  );

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/items/import`,
      {
        generatedFile: fileId,
        collectionName: "Attendance",
        branch: branchId,
        tenant: tenantId,
        status: status,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.id;
  } catch (error) {
    addError(
      "Error creating import record: " +
        (error.response?.data?.message || error.message),
      "import",
    );
    return null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return null;

  // Convert to string if it's not already a string
  const dateStr = String(dateString);

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  let date;

  // Handle formats like "20-Mar-25" (DD-MMM-YY)
  const monthMap = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  // Try to match DD-MMM-YY format (e.g., 20-Mar-25)
  const ddMmmYyRegex = /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/;
  const ddMmmYyMatch = dateStr.match(ddMmmYyRegex);

  if (ddMmmYyMatch) {
    const day = parseInt(ddMmmYyMatch[1]);
    const monthStr = ddMmmYyMatch[2].toLowerCase();
    let year = parseInt(ddMmmYyMatch[3]);

    // Handle 2-digit years
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }

    if (!isNaN(day) && monthMap[monthStr] !== undefined && !isNaN(year)) {
      // Format as YYYY-MM-DD
      const month = String(monthMap[monthStr] + 1).padStart(2, "0");
      const formattedDay = String(day).padStart(2, "0");
      return `${year}-${month}-${formattedDay}`;
    }
  }

  // Try to parse DD/MM/YY format
  const ddMmYyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const ddMmYyMatch = dateStr.match(ddMmYyRegex);

  if (ddMmYyMatch) {
    const day = parseInt(ddMmYyMatch[1]);
    const month = parseInt(ddMmYyMatch[2]);
    let year = parseInt(ddMmYyMatch[3]);

    // Handle 2-digit years
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // Excel dates might be stored as numbers
  // Check if it's a number that could be an Excel date (Excel dates are days since 1/1/1900)
  if (!isNaN(dateStr) && Number(dateStr) > 1000) {
    try {
      // Convert Excel date number to JS date
      // Excel dates start from 1/1/1900, and 1 = 1/1/1900
      // JS dates are milliseconds since 1/1/1970
      const excelDate = new Date((Number(dateStr) - 25569) * 86400 * 1000);
      if (!isNaN(excelDate.getTime())) {
        const year = excelDate.getFullYear();
        const month = String(excelDate.getMonth() + 1).padStart(2, "0");
        const day = String(excelDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.warn("Failed to parse Excel date:", e);
    }
  }

  // Try standard date parsing for other formats
  date = new Date(dateStr);

  // If standard parsing fails, try custom parsing for other formats
  if (isNaN(date.getTime())) {
    // Handle formats like "21-02-2025" (DD-MM-YYYY)
    const dateParts = dateStr.split("-");
    if (dateParts.length === 3) {
      // Check if it's likely DD-MM-YYYY format
      if (
        dateParts[0].length <= 2 &&
        dateParts[1].length <= 2 &&
        dateParts[2].length === 4
      ) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const year = parseInt(dateParts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          date = new Date(year, month, day);
        }
      }
    }
  }

  if (isNaN(date.getTime())) {
    console.warn(`Could not parse date: ${dateStr}`);
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    if (
      file.type === "text/csv" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fileError.value = "";
      await uploadFile(file);
      await parseFileForPreview();
    } else {
      fileError.value = "Invalid file type. Please upload a CSV or XLSX file.";
      event.target.value = null;
    }
  }
};

const handleFileDrop = async (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    if (
      file.type === "text/csv" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fileError.value = "";
      await uploadFile(file);
      await parseFileForPreview();
    } else {
      fileError.value = "Invalid file type. Please upload a CSV or XLSX file.";
    }
  }
};

const uploadFile = async (file) => {
  try {
    const tenantId = await currentUserTenant.getTenantId();
    const importedFilesFolderId = await getImportedFilesFolderId(tenantId);

    const formData = new FormData();
    if (importedFilesFolderId) {
      formData.append("folder", importedFilesFolderId);
    }

    const fileExtension = file.name.split(".").pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const customFileName = `attendance-import-${timestamp}.${fileExtension}`;
    formData.append("file", file, customFileName);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    uploadedFile.value = data.data;

    const importRecordId = await createImportRecord(data.data.id);
    if (importRecordId) {
      console.log("Import record created with ID:", importRecordId);
    }

    return data.data.id;
  } catch (error) {
    const errorMsg =
      "Failed to upload file: " +
      (error.response?.data?.message || error.message);
    addError(errorMsg, "upload");
    fileError.value = "Upload failed. Please try again.";
    return null;
  }
};

const mapAttendanceStatus = (status) => {
  if (!status) {
    return {
      attendance: "unknown",
      day: 0.0,
      attendanceContext: "Unknown",
      leaveType: "none",
      considerableDay: 0.0,
    };
  }

  // Clean and normalize the status string to extract status code
  const statusCode = status.includes("StatusCode")
    ? status.split("StatusCode")[1].trim()
    : (status.match(/([AÂ½¼¾PLCSWOa-z()]+)$/) || [])[1] || "";

  // Map for all status types with their corresponding values
  const statusMap = {
    // Basic statuses
    A: {
      attendance: "absent",
      day: 0.0,
      attendanceContext: "Absent",
      leaveType: "none",
    },
    P: {
      attendance: "present",
      day: 1.0,
      attendanceContext: "Present",
      leaveType: "none",
    },
    H: {
      attendance: "holiday",
      day: 1.0,
      attendanceContext: "Holiday",
      leaveType: "none",
    },
    "P(OD)": {
      attendance: "onDuty",
      day: 1.0,
      attendanceContext: "Present On OD",
      leaveType: "none",
    },
    WO: {
      attendance: "weekOff",
      day: 1.0,
      attendanceContext: "WeeklyOff",
      leaveType: "none",
    },
    // Half day statuses
    "Â½P": {
      attendance: "halfDay",
      day: 0.5,
      attendanceContext: "1/2Present",
      leaveType: "none",
    },
    "WOÂ½P": {
      attendance: "weekoffPresent",
      day: 0.5,
      attendanceContext: "WeeklyOff 1/2Present",
      leaveType: "none",
    },
    // Weekly off present
    WOP: {
      attendance: "weekoffPresent",
      day: 1.0,
      attendanceContext: "WeeklyOff Present",
      leaveType: "none",
    },
    "WOP(OD)": {
      attendance: "weekoffPresent",
      day: 1.0,
      attendanceContext: "WeeklyOff Present On OD",
      leaveType: "none",
    },
    // Simple leave types
    CL: {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "On Leave(CL)",
      leaveType: "casualLeave",
    },
    PL: {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "On Leave(PL)",
      leaveType: "privilegeLeave",
    },
    SL: {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "On Leave(SL)",
      leaveType: "sickLeave",
    },
    ML: {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "On Leave(ML)",
      leaveType: "MedicalLeave",
    },
    // Half leave types
    "Â½PL": {
      attendance: "paidLeave",
      day: 0.5,
      attendanceContext: "On Leave(1/2PL)",
      leaveType: "privilegeLeave",
    },
    "Â½CL": {
      attendance: "paidLeave",
      day: 0.5,
      attendanceContext: "On Leave(1/2CL)",
      leaveType: "casualLeave",
    },
    // 3/4 leave types
    "Â¾CL": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "On Leave(3/4CL)",
      leaveType: "casualLeave",
    },
    "Â¾PL": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "On Leave(3/4PL)",
      leaveType: "casualLeave",
    },
    // Complex status combinations - 1/4 leave with present
    "Â¼CLÂ½P": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On Leave(1/4CL)",
      leaveType: "casualLeave",
    },
    "Â¼CLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(1/4CL)",
      leaveType: "casualLeave",
    },
    "Â¼PLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(1/4PL)",
      leaveType: "privilegeLeave",
    },
    "Â¼SLÂ½P": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On Leave(1/4SL)",
      leaveType: "sickLeave",
    },
    "Â¼SLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(1/4SL)",
      leaveType: "sickLeave",
    },
    // Complex status combinations - 1/2 leave with present
    "Â½CLÂ½P": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On Leave(1/2CL)",
      leaveType: "casualLeave",
    },
    "Â½CLÂ½P(OD)": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On OD On Leave(1/2CL)",
      leaveType: "casualLeave",
    },
    "Â½CLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(1/2CL)",
      leaveType: "casualLeave",
    },
    "Â½PLÂ½P": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On Leave(1/2PL)",
      leaveType: "privilegeLeave",
    },
    "Â½PLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(1/2PL)",
      leaveType: "privilegeLeave",
    },
    "Â½PLP(OD)": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On OD On Leave(1/2PL)",
      leaveType: "privilegeLeave",
    },
    "Â½SLÂ½P": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On Leave(1/2SL)",
      leaveType: "sickLeave",
    },
    "Â½SLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(1/2SL)",
      leaveType: "sickLeave",
    },
    // Complex status combinations - 3/4 leave with present
    "Â¾SLP": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(3/4SL)",
      leaveType: "sickLeave",
    },
    // Complex status combinations - full leave with present
    "CLÂ½P": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "1/2Present On Leave(CL)",
      leaveType: "casualLeave",
    },
    CLP: {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(CL)",
      leaveType: "casualLeave",
    },
    "CLP(OD)": {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On OD On Leave(CL)",
      leaveType: "casualLeave",
    },
    PLP: {
      attendance: "paidLeave",
      day: 1.0,
      attendanceContext: "Present On Leave(PL)",
      leaveType: "privilegeLeave",
    },
  };

  // Try to find a direct match in the status map
  let attendanceData = null;
  if (statusCode && statusMap[statusCode]) {
    attendanceData = { ...statusMap[statusCode] };
  } else if (status) {
    // If no exact match for the status code, try to parse from the full status text
    if (status.includes("Absent")) {
      attendanceData = {
        attendance: "absent",
        day: 0.0,
        attendanceContext: "Absent",
        leaveType: "none",
      };
    } else if (
      status.includes("Holiday") ||
      status.includes("Holiday ") ||
      status.includes("H")
    ) {
      attendanceData = {
        attendance: "holiday",
        day: 1.0,
        attendanceContext: "Holiday",
        leaveType: "none",
      };
    } else if (
      status.includes("WeeklyOff") &&
      status.includes("Present") &&
      status.includes("OD")
    ) {
      attendanceData = {
        attendance: "weekoffPresent",
        day: 1.0,
        attendanceContext: "WeeklyOff Present On OD",
        leaveType: "none",
      };
    } else if (status.includes("WeeklyOff") && status.includes("Â½Present")) {
      attendanceData = {
        attendance: "weekoffPresent",
        day: 1.0,
        attendanceContext: "WeeklyOff 1/2Present",
        leaveType: "none",
      };
    } else if (status.includes("WeeklyOff") && status.includes("Present")) {
      attendanceData = {
        attendance: "weekoffPresent",
        day: 1.0,
        attendanceContext: "WeeklyOff Present",
        leaveType: "none",
      };
    } else if (status.includes("WeeklyOff")) {
      attendanceData = {
        attendance: "weekOff",
        day: 1.0,
        attendanceContext: "WeeklyOff",
        leaveType: "none",
      };
    } else if (status.includes("On Leave(Â½CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "On Leave(1/2CL)",
        leaveType: "casualLeave",
      };
    } else if (
      status.includes("Â½Present") &&
      status.includes("OD") &&
      status.includes("Leave(Â½CL)")
    ) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On OD On Leave(1/2CL)",
        leaveType: "casualLeave",
      };
    } else if (
      status.includes("Present") &&
      status.includes("OD") &&
      status.includes("Leave(Â½CL)")
    ) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On OD On Leave(1/2CL)",
        leaveType: "casualLeave",
      };
    } else if (
      status.includes("Present") &&
      status.includes("OD") &&
      status.includes("Leave(Â½PL)")
    ) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On OD On Leave(1/2PL)",
        leaveType: "privilegeLeave",
      };
    } else if (
      status.includes("Present") &&
      status.includes("OD") &&
      status.includes("Leave(CL)")
    ) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On OD On Leave(CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Present") && status.includes("OD")) {
      attendanceData = {
        attendance: "onDuty",
        day: 1.0,
        attendanceContext: "Present On OD",
        leaveType: "none",
      };
    } else if (status.includes("Â½Present") && status.includes("Leave(Â¼CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On Leave(1/4CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â¼CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(1/4CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â¼PL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(1/4PL)",
        leaveType: "privilegeLeave",
      };
    } else if (status.includes("Â½Present") && status.includes("Leave(Â¼SL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On Leave(1/4SL)",
        leaveType: "sickLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â¼SL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(1/4SL)",
        leaveType: "sickLeave",
      };
    } else if (status.includes("Â½Present") && status.includes("Leave(Â½CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On Leave(1/2CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â½CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(1/2CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Â½Present") && status.includes("Leave(Â½PL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On Leave(1/2PL)",
        leaveType: "privilegeLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â½PL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(1/2PL)",
        leaveType: "privilegeLeave",
      };
    } else if (status.includes("Â½Present") && status.includes("Leave(Â½SL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On Leave(1/2SL)",
        leaveType: "sickLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â½SL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(1/2SL)",
        leaveType: "sickLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(Â¾SL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(3/4SL)",
        leaveType: "sickLeave",
      };
    } else if (status.includes("Â½Present") && status.includes("Leave(CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "1/2Present On Leave(CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("Present") && status.includes("Leave(PL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "Present On Leave(PL)",
        leaveType: "privilegeLeave",
      };
    } else if (status.includes("Â½Present")) {
      attendanceData = {
        attendance: "halfDay",
        day: 0.5,
        attendanceContext: "1/2Present",
        leaveType: "none",
      };
    } else if (status.includes("Present")) {
      attendanceData = {
        attendance: "present",
        day: 1.0,
        attendanceContext: "Present",
        leaveType: "none",
      };
    } else if (status.includes("On Leave(Â¾CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "On Leave(3/4CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("On Leave(Â½PL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 0.5,
        attendanceContext: "On Leave(1/2PL)",
        leaveType: "privilegeLeave",
      };
    } else if (status.includes("On Leave(CL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "On Leave(CL)",
        leaveType: "casualLeave",
      };
    } else if (status.includes("On Leave(PL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "On Leave(PL)",
        leaveType: "privilegeLeave",
      };
    } else if (status.includes("On Leave(SL)")) {
      attendanceData = {
        attendance: "paidLeave",
        day: 1.0,
        attendanceContext: "On Leave(SL)",
        leaveType: "sickLeave",
      };
    }
  }

  // If no match found, return unknown status
  if (!attendanceData) {
    console.warn(
      `Unknown attendance status: "${status}" (code: "${statusCode}")`,
    );
    attendanceData = {
      attendance: "unknown",
      day: 0.0,
      attendanceContext: `Unknown: ${status}`,
      leaveType: "none",
    };
  }

  // Apply the rules for considerable days:
  // 1. If values are 0.75, they should be considered as 1 for a single day
  // 2. If values are more than 1 (like 1.25,1.50,1.75), they should be considered as 1 only for single day
  if (attendanceData.day === 0.75) {
    attendanceData.considerableDay = 1.0;
  } else if (attendanceData.day > 1) {
    attendanceData.considerableDay = 1.0;
  } else {
    attendanceData.considerableDay = attendanceData.day;
  }

  return attendanceData;
};

// Function to apply the considerable count rules
const applyConsiderableCountRules = (attendanceData) => {
  if (attendanceData.day === 0.75) {
    attendanceData.considerableDay = 1.0;
  } else if (attendanceData.day > 1) {
    attendanceData.considerableDay = 1.0;
  } else {
    attendanceData.considerableDay = attendanceData.day;
  }
  return attendanceData;
};

const parseFileForPreview = async () => {
  if (!uploadedFile.value) return;

  previewData.value = [];
  const token = getToken();

  try {
    const fileResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/assets/${uploadedFile.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "arraybuffer",
      },
    );

    const data = new Uint8Array(fileResponse.data);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    jsonData.value = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.value.length === 0) {
      addError(
        "The uploaded file contains no data or is in an incorrect format.",
        "file",
      );
      return;
    }

    // Extract unique employee codes for API lookup
    const employeeCodes = [
      ...new Set(
        jsonData.value.map(
          (item) => item["Employee Code"] || item.EmployeeCode || "",
        ),
      ),
    ];

    // Fetch employee IDs in batches to avoid long URLs
    const batchSize = 10;
    for (let i = 0; i < employeeCodes.length; i += batchSize) {
      const batch = employeeCodes.slice(i, i + batchSize);
      await fetchEmployeeIds(batch);
    }

    // Process all records for preview (not just the first 10)
    const allPreviewRecords = jsonData.value.map((record) => {
      const employeeCode = record["Employee Code"] || record.EmployeeCode || "";
      const employeeName = record["Employee Name"] || record.EmployeeName || "";
      const attendanceDate =
        record["AttendanceDate"] || record.AttendanceDate || "";
      const status = record["Status"] || record.Status || "";

      // Format the date to YYYY-MM-DD
      const formattedDate = formatDate(attendanceDate);

      // For preview, we'll show the employee code if no match is found
      const employeeId = employeeIdMap.value.get(employeeCode) || employeeCode;

      return {
        employeeId,
        employeeName,
        date: formattedDate,
        attendance: status,
      };
    });

    previewData.value = allPreviewRecords;

    // Automatically validate data after preview
    validateData();
  } catch (error) {
    addError(
      "Error parsing file: " + (error.response?.data?.message || error.message),
      "parse",
    );
  }
};

// FIXED: This is the corrected fetchEmployeeIds function
const fetchEmployeeIds = async (employeeCodes) => {
  if (!employeeCodes || employeeCodes.length === 0) return;

  const token = getToken();

  // Filter out empty codes and convert to strings
  const validCodes = employeeCodes
    .filter((code) => code !== null && code !== undefined && code !== "")
    .map((code) => String(code).trim())
    .filter((code) => code !== "");

  if (validCodes.length === 0) return;

  try {
    // Use the correct filter format for array values
    const codesParam = validCodes.join(",");

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[employeeId][_in]=${encodeURIComponent(codesParam)}&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&fields[]=id,employeeId`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data && response.data.data) {
      // Map employee codes to their IDs from personalModule
      response.data.data.forEach((item) => {
        // Convert both to strings for comparison
        const employeeCode = String(item.employeeId);
        employeeIdMap.value.set(employeeCode, item.id);
      });

      console.log(
        "Employee ID mapping:",
        Object.fromEntries(employeeIdMap.value),
      );
    }
  } catch (error) {
    console.error("Error fetching employee IDs:", error);
    addError(
      "Error fetching employee IDs: " +
        (error.response?.data?.message || error.message),
      "api",
    );
  }
};

// Function to validate data before import
const validateData = async () => {
  if (!uploadedFile.value || jsonData.value.length === 0) return;

  isValidating.value = true;
  dataValidated.value = false;
  clearErrors();
  clearUnknownUsers();

  try {
    // Process the attendance data - this will track unknown users
    const transformedData = await processAttendanceData(jsonData.value);
    processedAttendanceData.value = transformedData;

    // Check if we have any data to import after filtering
    if (transformedData.length === 0) {
      addError(
        "No valid records found to import. All records were skipped due to missing employee IDs.",
        "validation",
      );
      isValidating.value = false;
      return;
    }

    // Check for existing attendance data
    await checkExistingAttendanceData(transformedData);

    // Mark data as validated
    dataValidated.value = true;
  } catch (error) {
    addError(
      "Error validating data: " + (error.message || "Unknown error"),
      "validation",
    );
  } finally {
    isValidating.value = false;
  }
};

// This function processes the attendance data and tracks unknown users
const processAttendanceData = async (jsonData) => {
  skippedRecords.value = 0;

  // Extract unique employee codes for API lookup
  const employeeCodes = [
    ...new Set(
      jsonData.map((item) => item["Employee Code"] || item.EmployeeCode || ""),
    ),
  ];

  // Fetch employee IDs in batches to avoid long URLs
  const batchSize = 20;
  for (let i = 0; i < employeeCodes.length; i += batchSize) {
    const batch = employeeCodes.slice(i, i + batchSize);
    await fetchEmployeeIds(batch);
  }

  // Transform the data for import and track unknown users
  const transformedData = [];
  jsonData.forEach((record) => {
    const employeeCode = record["Employee Code"] || record.EmployeeCode || "";
    const employeeName = record["Employee Name"] || record.EmployeeName || "";
    const attendanceDate =
      record["AttendanceDate"] || record.AttendanceDate || "";
    const status = record["Status"] || record.Status || "";
    const department = record["Department"] || record.Department || "";

    // Format the date to YYYY-MM-DD
    const formattedDate = formatDate(attendanceDate);

    // Get the employee ID from the map - using the id from personalModule
    // Convert employeeCode to string for consistent comparison
    const employeeId = employeeIdMap.value.get(String(employeeCode));

    // If employee not found, add to unknown users list
    if (!employeeId) {
      skippedRecords.value++;
      // Add to unknown users list if not already there
      if (
        !unknownUsers.value.some((user) => user.employeeCode === employeeCode)
      ) {
        unknownUsers.value.push({
          employeeCode,
          employeeName,
          department,
        });
      }
      return; // Skip this record
    }

    // Map the status to the structured attendance data
    const attendanceData = mapAttendanceStatus(status);

    // Apply the considerable count rules
    const finalAttendanceData = applyConsiderableCountRules(attendanceData);

    // Create uniqueId in the format: tenantId-employeeId-date
    const uniqueId = `${tenantId}-${employeeId}-${formattedDate}`;

    transformedData.push({
      employeeId, // This is the id from personalModule
      date: formattedDate,
      uniqueId, // Add the uniqueId field
      ...finalAttendanceData, // Spread the attendance data with considerable day applied
      tenant: tenantId,
      status: "notPunchedIn",
      mode: "import",
    });
  });

  return transformedData;
};

// Function to download unknown users list as CSV
const downloadUnknownUsers = () => {
  if (unknownUsers.value.length === 0) return;

  // Create CSV content with proper escaping
  const headers = ['"Employee Code","Employee Name","Department"'];
  const csvContent = [
    headers.join(","),
    ...unknownUsers.value.map((user) => {
      // Escape fields properly for CSV
      const escapeCsv = (field) => {
        if (field === null || field === undefined) return '""';
        return `"${String(field).replace(/"/g, '""')}"`;
      };

      const employeeCode = escapeCsv(user.employeeCode);
      const employeeName = escapeCsv(user.employeeName);
      const department = escapeCsv(user.department);

      return [employeeCode, employeeName, department].join(",");
    }),
  ].join("\r\n"); // Use \r\n for proper line endings in CSV

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "unknown_employees.csv");
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

const checkExistingAttendanceData = async (transformedData) => {
  const token = getToken();
  existingAttendanceIds.value = [];

  // Group data by date first
  const datesMap = new Map();
  transformedData.forEach((item) => {
    if (!datesMap.has(item.date)) {
      datesMap.set(item.date, []);
    }
    datesMap.get(item.date).push(item.employeeId);
  });

  try {
    // Check each date separately
    for (const [date, employeeIds] of datesMap) {
      // Split employee IDs into smaller batches
      const batchSize = 100;
      for (let i = 0; i < employeeIds.length; i += batchSize) {
        const batch = employeeIds.slice(i, i + batchSize);
        const employeeIdParams = batch
          .map(
            (id, index) =>
              `filter[_and][0][employeeId][id][_in][${index}]=${encodeURIComponent(id)}`,
          )
          .join("&");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/attendance?fields[]=id&${employeeIdParams}&filter[_and][1][date][_eq]=${encodeURIComponent(date)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data?.data?.length > 0) {
          response.data.data.forEach((item) => {
            existingAttendanceIds.value.push(item.id);
          });
        }
      }
    }
  } catch (error) {
    // Handle error...
  }
};

const deleteExistingAttendanceData = async () => {
  if (existingAttendanceIds.value.length === 0) {
    return true; // No data to delete
  }

  const token = getToken();

  try {
    // Make the API call to delete the existing attendance data
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/items/attendance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          keys: existingAttendanceIds.value,
        },
      },
    );

    return response.status === 204;
  } catch (error) {
    addError(
      "Error deleting existing attendance data: " +
        (error.response?.data?.message || error.message),
      "api",
    );
    return false;
  }
};

// Function to show confirmation modal
const showConfirmation = (message, action) => {
  confirmationMessage.value = message;
  pendingAction.value = action;
  showConfirmationModal.value = true;
};

// Function to handle confirmation
const confirmAction = async () => {
  showConfirmationModal.value = false;
  if (pendingAction.value) {
    await pendingAction.value();
  }
};

// Function to cancel confirmation
const cancelConfirmation = () => {
  showConfirmationModal.value = false;
  pendingAction.value = null;
  isImporting.value = false;
};

// Function to handle unknown users confirmation
const confirmUnknownUsersAction = () => {
  showUnknownUsersModal.value = false;
  eliminateUnknownUsers.value = true;
  // Continue with import process
  checkForExistingData();
};

// Function to cancel unknown users confirmation
const cancelUnknownUsersConfirmation = () => {
  showUnknownUsersModal.value = false;
  eliminateUnknownUsers.value = false;
  isImporting.value = false;
};

// Function to check for existing data after unknown users decision
const checkForExistingData = async () => {
  // Check for existing attendance data
  const hasExistingData = await checkExistingAttendanceData(
    processedAttendanceData.value,
  );

  if (hasExistingData) {
    // Show confirmation dialog for existing data
    showConfirmation(
      "It may delete your previous attendance data on these dates. Do you want to continue?",
      performImport,
    );
  } else {
    // No existing data, proceed with import
    await performImport();
  }
};

const rollbackImportedData = async () => {
  if (importedRecordIds.value.length === 0) {
    return true; // No data to rollback
  }

  const token = getToken();

  try {
    // Make the API call to delete the imported data
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/items/attendance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          keys: importedRecordIds.value,
        },
      },
    );

    if (response.status === 204) {
      console.log(
        `Successfully rolled back ${importedRecordIds.value.length} records`,
      );
      return true;
    } else {
      console.error("Failed to rollback imported data");
      return false;
    }
  } catch (error) {
    console.error("Error during rollback:", error);
    return false;
  }
};

// Function to perform the actual import after confirmation
const performImport = async () => {
  try {
    importedRecordIds.value = []; // Reset imported record IDs

    // First, delete existing attendance data if needed
    if (existingAttendanceIds.value.length > 0) {
      const deleteSuccess = await deleteExistingAttendanceData();
      if (!deleteSuccess) {
        addError(
          "Failed to delete existing attendance data. Import aborted.",
          "import",
        );
        isImporting.value = false;
        return;
      }
    }

    // Now import the new attendance data
    // We'll import in batches to track IDs for potential rollback
    const batchSize = 100;
    let importSuccess = true;

    for (let i = 0; i < processedAttendanceData.value.length; i += batchSize) {
      const batch = processedAttendanceData.value.slice(i, i + batchSize);

      try {
        const importResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/items/attendance?fields[]=id,attendance,attendanceContext`,
          batch,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (
          importResponse.status === 200 &&
          importResponse.data &&
          importResponse.data.data
        ) {
          // Track the IDs of imported records for potential rollback
          importResponse.data.data.forEach((item) => {
            importedRecordIds.value.push(item.id);
          });
        } else {
          importSuccess = false;
          break;
        }
      } catch (error) {
        importSuccess = false;
        addError(
          "Error during batch import: " +
            (error.response?.data?.message || error.message),
          "import",
        );
        break;
      }
    }

    if (!importSuccess) {
      // If any batch failed, rollback all imported data
      addError("Import failed. Rolling back all imported data.", "import");
      await rollbackImportedData();
      isImporting.value = false;
      return;
    }

    // All batches imported successfully
    let message = `Successfully imported ${processedAttendanceData.value.length} attendance records.`;
    if (unknownUsers.value.length > 0 && eliminateUnknownUsers.value) {
      message += ` (${unknownUsers.value.length} unknown employees were skipped)`;
    }
    {
      message += ` (${unknownUsers.value.length} unknown employees were skipped)`;
    }

    successMessage.value = message;
    setTimeout(() => {
      emit("close");
    }, 3000);
  } catch (error) {
    addError(
      "Error during import process: " +
        (error.response?.data?.message || error.message),
      "import",
    );
    // Attempt to rollback any imported data
    await rollbackImportedData();
  } finally {
    isImporting.value = false;
  }
};

const importData = async () => {
  if (uploadedFile.value && dataValidated.value) {
    isImporting.value = true;
    successMessage.value = "";

    try {
      // Check if there are unknown users
      if (unknownUsers.value.length > 0) {
        // Show unknown users confirmation dialog
        showUnknownUsersModal.value = true;
      } else {
        // No unknown users, proceed to check for existing data
        checkForExistingData();
      }
    } catch (error) {
      addError(
        "Error during import process: " +
          (error.response?.data?.message || error.message),
        "import",
      );
      isImporting.value = false;
    }
  }
};

// Function to open the download modal
const openDownloadModal = () => {
  // You would need to fetch or set the template file ID here
  // For example, you might have a predefined template file ID:
  templateFileId.value = "your-template-file-id"; // Replace with your actual template file ID
  showDownloadModal.value = true;
};

// Function to fetch the template file ID if needed
const fetchTemplateFileId = async () => {
  const token = getToken();

  try {
    // Example API call to get the template file ID
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/templates?filter[name][_eq]=attendance_template`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data && response.data.data && response.data.data.length > 0) {
      templateFileId.value = response.data.data[0].file_id;
    }
  } catch (error) {
    console.error("Error fetching template file ID:", error);
  }
};

// Initialize on component mount
onMounted(() => {
  clearErrors();
  fetchTemplateFileId();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 650px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}

.import-section,
.format-section,
.preview-section {
  margin-bottom: 28px;
}

.import-section h3,
.format-section h3,
.preview-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #111827;
}

.file-upload-container {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f9fafb;
}

.file-upload-container:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

.file-upload-dragging {
  border-color: #60a5fa;
  background-color: rgba(96, 165, 250, 0.05);
}

.file-upload-has-file {
  border-style: solid;
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.file-upload-error {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.05);
}

.field-error {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #6b7280;
  margin-bottom: 12px;
}

.file-formats {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.file-icon {
  color: #10b981;
  flex-shrink: 0;
}

.file-info {
  flex-grow: 1;
  text-align: left;
  overflow: hidden;
}

.file-name {
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-file-btn:hover {
  background-color: #f3f4f6;
  color: #ef4444;
}

.format-section ul {
  padding-left: 20px;
  margin-bottom: 12px;
}

.download-template-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f3f4f6;
  color: #68ade1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.download-template-btn:hover {
  background-color: #e5e7eb;
}

.preview-table-container {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.preview-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 1;
}

.preview-table tr:last-child td {
  border-bottom: none;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f9fafb;
}

.cancel-btn,
.import-btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #68ade1;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-btn:hover {
  background-color: #f3f4f6;
}

.import-btn {
  background-color: #10b981;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.import-btn:hover {
  background-color: #059669;
}

.import-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.success-message {
  background-color: #10b981;
  color: white;
  text-align: center;
  padding: 12px 16px;
  margin: 0 24px 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.success-icon {
  width: 20px;
  height: 20px;
}

/* Error container styling */
.error-container {
  background-color: #fee2e2;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.error-header {
  background-color: #ef4444;
  color: white;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-header h3 {
  margin: 0;
  font-size: 16px;
  flex-grow: 1;
}

.error-icon {
  width: 20px;
  height: 20px;
}

.close-error-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-list {
  list-style: none;
  padding: 12px 16px;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.error-list li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

.error-list li:last-child {
  border-bottom: none;
}

/* Unknown users error summary */
.error-summary {
  background-color: #fff7ed;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid #fdba74;
}

.error-summary-header {
  background-color: #f97316;
  color: white;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-summary-header h3 {
  margin: 0;
  font-size: 16px;
  flex-grow: 1;
}

.error-summary-content {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-summary-content p {
  margin: 0;
  font-weight: 500;
  color: #9a3412;
}

.download-unknown-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: white;
  border: 1px solid #fdba74;
  color: #9a3412;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.download-unknown-btn:hover {
  background-color: #ffedd5;
}

/* Unknown users list styling */
.unknown-users-list {
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid rgba(249, 115, 22, 0.2);
}

.unknown-users-list table {
  width: 100%;
  border-collapse: collapse;
}

.unknown-users-list th,
.unknown-users-list td {
  padding: 8px 16px;
  text-align: left;
  font-size: 13px;
}

.unknown-users-list th {
  background-color: #ffedd5;
  color: #9a3412;
  position: sticky;
  top: 0;
  z-index: 1;
}

.unknown-users-list tr:nth-child(even) {
  background-color: rgba(255, 237, 213, 0.3);
}

.unknown-users-list tr:hover {
  background-color: rgba(255, 237, 213, 0.5);
}

/* Confirmation modal styling */
.confirmation-overlay,
.unknown-users-overlay {
  z-index: 1100;
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.confirmation-header {
  background-color: #f97316;
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirmation-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.warning-icon {
  width: 24px;
  height: 24px;
}

.confirmation-body {
  padding: 24px;
}

.confirmation-note {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.confirmation-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f9fafb;
}

.confirm-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background-color: #dc2626;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

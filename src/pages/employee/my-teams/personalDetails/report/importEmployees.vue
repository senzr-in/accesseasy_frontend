<template>
  <div
    class="modal-overlay"
    @click.self="handleClose"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h2>Import Employee Data</h2>
        <button
          class="close-btn"
          :disabled="isImporting"
          @click="handleClose"
        >
          &times;
        </button>
      </div>

      <div class="modal-body">
        <!-- Error display section with download button -->
        <div
          v-if="errors.length > 0"
          class="error-container"
        >
          <div class="error-header">
            <AlertCircle class="error-icon" />
            <h3>Errors Found</h3>
            <div class="error-header-buttons">
              <button
                class="download-error-btn"
                title="Download Errors as CSV"
                @click="downloadErrorCSV"
              >
                <DownloadIcon class="download-icon" />
                Download Errors
              </button>
              <button
                class="close-error-btn"
                title="Close"
                @click="clearErrors"
              >
                &times;
              </button>
            </div>
          </div>
          <ul class="error-list">
            <li
              v-for="(error, index) in errors"
              :key="index"
              class="error-item"
            >
              <span class="error-type">{{ error.type }}</span>
              <span class="error-message">{{ error.message }}</span>
            </li>
          </ul>
        </div>

        <!-- Duplicate Handling Options Selector -->
        <div class="duplicate-options-card my-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
            <span>If Duplicate Records (Employee ID / Email) Exist in Database:</span>
          </div>
          <div class="flex flex-wrap items-center gap-4 text-xs font-medium">
            <label class="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="radio"
                v-model="duplicateStrategy"
                value="skip"
                @change="reprocessFile"
              />
              <span><strong>Skip Duplicates</strong> (Import only new records)</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="radio"
                v-model="duplicateStrategy"
                value="edit"
                @change="reprocessFile"
              />
              <span><strong>Edit / Overwrite Existing</strong></span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="radio"
                v-model="duplicateStrategy"
                value="strict"
                @change="reprocessFile"
              />
              <span><strong>Strict Error</strong></span>
            </label>
          </div>
        </div>

        <div class="import-section">
          <h3>Upload File</h3>
          <div
            class="file-upload-container"
            :class="{ 'file-upload-error': fileError }"
            @click="triggerFileInput"
            @drop.prevent="handleFileDrop"
            @dragover.prevent
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv, .xlsx"
              class="file-input"
              @change="handleFileChange"
              @click.stop
            >
            <div class="file-upload-content">
              <UploadCloud class="upload-icon" />
              <div v-if="!uploadedFile">
                <p>Drag and drop your file here or click to browse</p>
              </div>
              <div
                v-else
                class="uploaded-file-info"
              >
                <p>{{ uploadedFile.filename_download }}</p>
                <button
                  class="cancel-upload-btn"
                  title="Remove file"
                  @click.stop="cancelUpload"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
          <p
            v-if="fileError"
            class="field-error"
          >
            {{ fileError }}
          </p>

          <div
            v-if="uploadedFile"
            class="file-details"
          >
            <p>
              <strong>File Name:</strong> {{ uploadedFile.filename_download }}
            </p>
            <p>
              <strong>File Size:</strong>
              {{ formatFileSize(uploadedFile.filesize) }}
            </p>
            <p>
              <strong>Upload Date:</strong>
              {{ formatDate(uploadedFile.uploaded_on) }}
            </p>
          </div>
        </div>

        <div class="format-section">
          <p>Please ensure your file follows this format:</p>
          <div>
            <button
              class="download-btn"
              @click="showModal = true"
            >
              Download Template
            </button>
            <EmployeeTemplateDownload
              v-if="showModal"
              @close="showModal = false"
            />
          </div>
        </div>
      </div>

        <!-- Live Progress & ETA Bar -->
        <div
          v-if="isImporting"
          class="progress-container"
        >
          <div class="progress-header">
            <span class="progress-status">{{ importProgress.statusText || 'Importing employee data...' }}</span>
            <span class="progress-count">{{ importProgress.current }} / {{ importProgress.total }} ({{ importProgress.percentage }}%)</span>
          </div>

          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${importProgress.percentage}%` }"
            />
          </div>

          <div class="progress-footer">
            <span v-if="importProgress.etaSeconds > 0">
              ⏱️ Estimated time remaining: ~{{ importProgress.etaSeconds }} sec
            </span>
            <span v-else-if="importProgress.percentage === 100">
              ✅ Finalizing database setup...
            </span>
            <span v-else>
              Calculating estimated time...
            </span>
          </div>
        </div>

        <div
          v-if="successMessage"
          class="success-message"
        >
          <CheckCircle class="success-icon" />
          {{ successMessage }}
        </div>

      <!-- Snackbar for user feedback -->
      <div
        v-if="snackbar.show"
        class="snackbar"
        :class="snackbar.type"
      >
        {{ snackbar.message }}
      </div>

      <div class="modal-footer">
        <button
          v-if="isImporting"
          class="cancel-btn !bg-rose-500 hover:!bg-rose-600 !text-white"
          @click="cancelImport"
        >
          Stop Import
        </button>
        <button
          v-else
          class="cancel-btn"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          class="import-btn"
          :disabled="!uploadedFile || isImporting || hasStrictErrors"
          @click="importData"
        >
          <span
            v-if="isImporting"
            class="loading-spinner"
          />
          {{ isImporting ? "Importing..." : "Import" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits, onMounted, computed } from "vue";
import {
  UploadCloud,
  AlertCircle,
  CheckCircle,
  DownloadIcon,
} from "lucide-vue-next";
import EmployeeTemplateDownload from "./employeeTemplateDownload.vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex.js";
import axios from "axios";
import * as XLSX from "xlsx";

const uploadedFile = ref(null);
const showModal = ref(false);
const fileInput = ref(null);
const isImporting = ref(false);
const isCancelled = ref(false);
const successMessage = ref("");

const handleClose = () => {
  if (isImporting.value) return;
  emit("close");
};

const cancelImport = () => {
  if (isImporting.value) {
    isCancelled.value = true;
    importProgress.statusText = "Stopping import...";
  }
};
const fileError = ref("");
const errors = ref([]);
const tenantId = currentUserTenant.getTenantId();

const duplicateStrategy = ref("skip"); // "skip" | "edit" | "strict"
const rawFileEvent = ref(null);

const hasStrictErrors = computed(() => {
  return errors.value.some((e) => e.type === "validation");
});

const reprocessFile = () => {
  if (rawFileEvent.value) {
    handleFileChange(rawFileEvent.value);
  }
};

// Live Progress and ETA State
const importProgress = reactive({
  current: 0,
  total: 0,
  percentage: 0,
  statusText: "",
  etaSeconds: 0,
  startTime: null,
});
const tenantName = ref("");
const importedFilesFolderId = ref(null);
const latestImportRecordId = ref(null);

// Snackbar state
const snackbar = ref({
  show: false,
  message: "",
  type: "success", // success or error
});

const initTenantName = () => {
  try {
    if (typeof currentUserTenant.getTenantName === "function") {
      tenantName.value = currentUserTenant.getTenantName();
    } else if (currentUserTenant.tenantName) {
      tenantName.value = currentUserTenant.tenantName;
    } else if (currentUserTenant.tenant && currentUserTenant.tenant.name) {
      tenantName.value = currentUserTenant.tenant.name;
    } else {
      tenantName.value = tenantId;
    }
  } catch (error) {
    console.error("Error getting tenant name:", error);
    tenantName.value = tenantId;
  }
};

const allDepartments = ref([]);
const existingDepartments = ref([]);
const newDepartments = ref([]); // Hardcoded department name

const emit = defineEmits(["close"]);

// Show snackbar with message
const showSnackbar = (message, type = "success") => {
  snackbar.value = { show: true, message, type };
  setTimeout(() => {
    snackbar.value.show = false;
  }, 3000);
};

const clearErrors = () => {
  errors.value = [];
  fileError.value = "";
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
  return authService.getToken() || localStorage.getItem("userToken") || localStorage.getItem("auth_token");
};

// Validation functions
const validatePhone = (phone) => {
  return /^\d{10}$/.test(String(phone).replace(/\D/g, ""));
};

const validateAadhar = (aadhar) => {
  return /^\d{12}$/.test(String(aadhar).replace(/\D/g, ""));
};

const validatePAN = (pan) => {
  if (!pan) return true;
  return /^[A-Z0-9]{10}$/.test(String(pan).toUpperCase());
};

const validateEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

const validateNumeric = (value) => {
  if (!value) return true;
  return /^\d+$/.test(String(value).replace(/\D/g, ""));
};

const validateCTC = (ctc) => {
  if (!ctc) return true;
  const numericCTC = parseFloat(ctc);
  return !isNaN(numericCTC) && numericCTC > 0;
};

const excelSerialToDateString = (serial) => {
  if (!serial) return null;
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return date.toISOString().split("T")[0];
};

const validateDate = (dateString) => {
  if (!dateString) return true;

  // Handle Excel serial number
  if (typeof dateString === "number" && dateString > 0) {
    return true;
  }

  // Handle yyyy-mm-dd or yyyy/mm/dd
  if (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(dateString)) {
    return true;
  }

  // Handle month/day/year (e.g., 5/25/1964) or day/month/year (e.g., 25/5/1964)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const parts = dateString.split("/");
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check for valid month and day ranges
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
      return true;
    }
    // Additional check for day/month/year format
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
      return true;
    }
  }

  return false;
};

const formatDate = (dateString) => {
  if (!dateString) return null;

  // Handle Excel serial number
  if (typeof dateString === "number") {
    return excelSerialToDateString(dateString);
  }

  // Handle yyyy-mm-dd or yyyy/mm/dd
  if (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(dateString)) {
    return dateString.replace(/\//g, "-");
  }

  // Handle month/day/year (e.g., 5/25/1964) or day/month/year (e.g., 25/5/1964)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const parts = dateString.split("/");
    let month = parseInt(parts[0], 10);
    let day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Try month/day/year first
    let date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    // If month/day/year fails, try day/month/year
    date = new Date(year, day - 1, month);
    if (
      date.getFullYear() === year &&
      date.getMonth() + 1 === day &&
      date.getDate() === month
    ) {
      return `${year}-${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}`;
    }

    // If both formats are invalid, return null
    return null;
  }

  return null;
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const fetchImportedFilesFolderId = async () => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields=foldersId`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (
      response.data.data &&
      response.data.data.length > 0 &&
      response.data.data[0].foldersId
    ) {
      const folders = response.data.data[0].foldersId;
      const employeeDatasFolder = Array.isArray(folders) ? folders.find(
        (folder) => folder.name === "EmployeeDatas",
      ) : null;

      if (employeeDatasFolder) {
        importedFilesFolderId.value = employeeDatasFolder.id;
      } else {
        importedFilesFolderId.value = "root";
      }
    } else {
      importedFilesFolderId.value = "root";
    }
  } catch (error) {
    console.warn("Folder ID check skipped:", error);
    importedFilesFolderId.value = "root";
  }
};

const createImportRecord = async (fileId, status = "Requested") => {
  const token = getToken();
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/items/import`,
      {
        generatedFile: fileId,
        collectionName: "Employee details",
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

    latestImportRecordId.value = response.data.data.id;
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

const updateImportRecordStatus = async (importRecordId, status) => {
  if (!importRecordId) {
    console.warn("No import record ID available to update status.");
    return;
  }

  const token = getToken();
  try {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/items/import/${importRecordId}`,
      {
        status: status,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    addError(
      "Error updating import status: " +
        (error.response?.data?.message || error.message),
      "import",
    );
  }
};

const deleteImportRecord = async (importRecordId) => {
  if (!importRecordId) return;

  const token = getToken();
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/items/import/${importRecordId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error("Error deleting import record:", error);
  }
};

const handleFileChange = async (event) => {
  rawFileEvent.value = event;
  const file = event.target?.files?.[0];
  if (file) {
    if (
      file.type === "text/csv" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fileError.value = "";
      await uploadFile(file);
    } else {
      fileError.value = "Invalid file type. Please upload a CSV or XLSX file.";
      if (event.target) event.target.value = null;
    }
  }
};

const handleFileDrop = async (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    if (
      file.type === "text/csv" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fileError.value = "";
      await uploadFile(file);
    } else {
      fileError.value = "Invalid file type. Please upload a CSV or XLSX file.";
    }
  }
};

const uploadFile = async (file) => {
  if (!importedFilesFolderId.value) {
    importedFilesFolderId.value = "root";
  }

  const formData = new FormData();
  formData.append("file", file);
  if (importedFilesFolderId.value && importedFilesFolderId.value !== "root") {
    formData.append("folder", importedFilesFolderId.value);
  }

  const token = getToken();
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    uploadedFile.value = response.data.data;
    await createImportRecord(uploadedFile.value.id, "Requested");
  } catch (error) {
    const errorMsg =
      "Failed to upload file: " +
      (error.response?.data?.message || error.message);
    addError(errorMsg, "upload");
    fileError.value = "Upload failed. Please try again.";
  }
};

const cancelUpload = async (event) => {
  event.stopPropagation();

  if (uploadedFile.value) {
    const token = getToken();
    try {
      if (latestImportRecordId.value) {
        await deleteImportRecord(latestImportRecordId.value);
      } else {
        const importResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/import?filter[generatedFile][_eq]=${uploadedFile.value.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (importResponse.data.data && importResponse.data.data.length > 0) {
          const importRecordIdToDelete = importResponse.data.data[0].id;
          await deleteImportRecord(importRecordIdToDelete);
        }
      }

      await deleteUploadedFile(uploadedFile.value.id);
    } catch (error) {
      console.error("Error deleting file or import record:", error);
    }
  }

  uploadedFile.value = null;
  fileError.value = "";
  errors.value = [];
  successMessage.value = "";
  latestImportRecordId.value = null;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const fetchAllDepartments = async () => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}&fields=id,departmentId,departmentName,tenant,status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data || [];
  } catch (error) {
    addError(
      "Error fetching departments: " +
        (error.response?.data?.message || error.message),
      "data",
    );
    return [];
  }
};

const initializeCache = async () => {
  allDepartments.value = await fetchAllDepartments();
};

const generateSequentialDepartmentId = async () => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/department`,
      {
        params: {
          filter: { tenant: { _eq: tenantId } },
          sort: ["-date_created"],
          limit: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = response.data;
    if (!data.data || data.data.length === 0) {
      return "1";
    }

    const lastNumber = Number(data.data[0].departmentId);
    return (lastNumber + 1).toString();
  } catch (error) {
    addError(
      "Error generating department ID: " +
        (error.response?.data?.message || error.message),
      "data",
    );
    return "1";
  }
};

const checkDepartment = async (departmentName) => {
  const normalizedDeptName = departmentName.trim().toLowerCase();
  const token = getToken();

  try {
    const checkResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/department`,
      {
        params: {
          filter: {
            _and: [
              { tenant: { _eq: tenantId } },
              { departmentName: { _icontains: normalizedDeptName } },
            ],
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (checkResponse.data.data && checkResponse.data.data.length > 0) {
      const departmentData = checkResponse.data.data[0];
      const alreadyExists = existingDepartments.value.some(
        (dept) => dept.departmentName.toLowerCase() === normalizedDeptName,
      );

      if (!alreadyExists) {
        existingDepartments.value.push({
          id: departmentData.id, // System-generated ID (1236) - USE THIS
          departmentId: departmentData.departmentId, // User-defined ID (1)
          departmentName: departmentData.departmentName,
          tenant: tenantId,
          status: departmentData.status,
        });
      }
    } else {
      const alreadyInNew = newDepartments.value.some(
        (dept) => dept.toLowerCase() === normalizedDeptName,
      );

      if (!alreadyInNew) {
        newDepartments.value.push(departmentName.trim());
      }
    }
  } catch (error) {
    addError(
      "Error checking department: " +
        (error.response?.data?.message || error.message),
      "department",
    );
  }
};

const createNewDepartments = async () => {
  const token = getToken();

  for (const departmentName of newDepartments.value) {
    const newDepartmentId = await generateSequentialDepartmentId();

    try {
      const createResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/items/department`,
        {
          departmentName: departmentName,
          departmentId: newDepartmentId, // This is the user-facing ID (1, 2, 3...)
          tenant: tenantId,
          status: "active",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Store both IDs properly
      existingDepartments.value.push({
        id: createResponse.data.data.id, // System-generated ID (1236) - USE THIS FOR FOREIGN KEY
        departmentId: newDepartmentId, // User-defined sequential ID (1)
        departmentName: departmentName,
        tenant: tenantId,
        status: "active",
      });
    } catch (error) {
      addError(
        `Error creating department "${departmentName}": ${error.response?.data?.message || error.message}`,
        "department",
      );
    }
  }
};

const getDepartmentId = async (departmentName) => {
  const normalizedDeptName = departmentName.trim().toLowerCase();
  const department = existingDepartments.value.find(
    (d) => d.departmentName.toLowerCase() === normalizedDeptName,
  );
  return department ? department.id : null; // Return departmentId instead of id
};

const checkDuplicateUniqueId = async (uniqueId) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][uniqueId][_contains]=${encodeURIComponent(uniqueId)}&filter[_and][1][assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.length > 0;
  } catch (error) {
    addError(
      "Error checking duplicate uniqueId: " +
        (error.response?.data?.message || error.message),
      "validation",
    );
    return false;
  }
};

const checkDuplicateEmail = async (email) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][email][_contains]=${encodeURIComponent(email.toLowerCase())}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.length > 0;
  } catch (error) {
    addError(
      "Error checking duplicate email: " +
        (error.response?.data?.message || error.message),
      "validation",
    );
    return false;
  }
};

const checkDuplicatePhone = async (phone) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][phone][_contains]=${encodeURIComponent("+91" + phone)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.length > 0;
  } catch (error) {
    addError(
      "Error checking duplicate phone: " +
        (error.response?.data?.message || error.message),
      "validation",
    );
    return false;
  }
};

const checkDuplicatePAN = async (pan) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][pan][_contains]=${encodeURIComponent(pan.toUpperCase())}&filter[_and][1][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.length > 0;
  } catch (error) {
    addError(
      "Error checking duplicate PAN: " +
        (error.response?.data?.message || error.message),
      "validation",
    );
    return false;
  }
};

const checkDuplicateOfficeEmail = async (officeEmail) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][officeEmail][_contains]=${encodeURIComponent(officeEmail.toLowerCase())}&filter[_and][1][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.length > 0;
  } catch (error) {
    addError(
      "Error checking duplicate office email: " +
        (error.response?.data?.message || error.message),
      "validation",
    );
    return false;
  }
};

const checkDuplicateAadhar = async (aadhar) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][aadhar][_contains]=${encodeURIComponent(aadhar)}&filter[_and][1][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data.length > 0;
  } catch (error) {
    addError(
      "Error checking duplicate Aadhar: " +
        (error.response?.data?.message || error.message),
      "validation",
    );
    return false;
  }
};

const fetchGeneralShiftId = async () => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/shifts`,
      {
        params: {
          filter: {
            _and: [
              { tenant: { _eq: tenantId } },
              { shift: { _eq: "GeneralShift" } },
            ],
          },
          fields: ["id"],
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    } else {
      addError("GeneralShift not found for this tenant.", "shift");
      return null;
    }
  } catch (error) {
    addError(
      "Error fetching GeneralShift ID: " +
        (error.response?.data?.message || error.message),
      "shift",
    );
    return null;
  }
};

const processEmployees = async (jsonData) => {
  existingDepartments.value = [];
  newDepartments.value = [];
  clearErrors();

  const shiftId = await fetchGeneralShiftId();
  if (!shiftId) {
    addError(
      "Cannot proceed with import: GeneralShift ID is missing.",
      "shift",
    );
    return null;
  }

  // Pre-fetch all existing users and personalModule records for tenant to do instant in-memory duplicate validation
  const token = getToken();
  const existingEmailSet = new Set();
  const existingPhoneSet = new Set();
  const existingPanSet = new Set();
  const existingOfficeEmailSet = new Set();
  const existingAadharSet = new Set();
  const existingUniqueIdSet = new Set();
  const existingEmpIdSet = new Set();

  try {
    const existingUsersRes = await axios.get(
      `${import.meta.env.VITE_API_URL}/users`,
      {
        params: {
          fields: ["email", "phone", "officeEmail", "pan", "aadhar"],
          limit: -1,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const usersList = existingUsersRes.data?.data || [];
    usersList.forEach((u) => {
      if (u.email) existingEmailSet.add(u.email.toLowerCase());
      if (u.officeEmail) existingOfficeEmailSet.add(u.officeEmail.toLowerCase());
      if (u.phone) existingPhoneSet.add(String(u.phone).replace(/\D/g, ""));
      if (u.pan) existingPanSet.add(String(u.pan).toUpperCase());
      if (u.aadhar) existingAadharSet.add(String(u.aadhar).replace(/\D/g, ""));
    });
  } catch (err) {
    console.warn("Could not pre-fetch existing tenant users:", err);
  }

  try {
    const existingPersonalRes = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        params: {
          filter: { assignedUser: { tenant: { tenantId: { _eq: tenantId } } } },
          fields: ["employeeId", "uniqueId"],
          limit: -1,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const personalList = existingPersonalRes.data?.data || [];
    personalList.forEach((p) => {
      if (p.uniqueId) existingUniqueIdSet.add(p.uniqueId);
      if (p.employeeId) existingEmpIdSet.add(String(p.employeeId).toLowerCase());
    });
  } catch (err) {
    console.warn("Could not pre-fetch existing personalModule records:", err);
  }

  const seenCsvEmailSet = new Set();
  const seenCsvPhoneSet = new Set();
  const seenCsvEmpIdSet = new Set();

  const validationErrors = [];
  const validEmployees = [];
  const invalidEmployeeIndices = new Set();

  const validateDate = (dateString) => {
    if (!dateString) return true;
    if (typeof dateString === "number" && dateString > 0) return true;
    return /^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(dateString);
  };

  const excelSerialToDateString = (serial) => {
    if (!serial) return null;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
  };

  // First pass: Validate all employees and collect errors
  for (const [index, employee] of jsonData.entries()) {
    const employeeId = employee.employeeId || employee["Employee ID"];
    const email = (employee.email || employee["Email"] || "").toLowerCase();
    const firstName = employee.firstName || employee["First Name"];
    const lastName = employee.lastName || employee["Last Name"];
    const gender = employee.gender || employee["Gender"];
    const phone = String(employee.phone || employee["Phone"] || "").replace(
      /\D/g,
      "",
    );
    const pan = employee.pan || employee["PAN"];
    const aadhar = String(employee.aadhar || employee["Aadhar"] || "").replace(
      /\D/g,
      "",
    );

    const salary = employee.salary || employee["Salary"];
    const accountNumber = String(
      employee.bankAccountNumber || employee["Bank Account Number"] || "",
    ).replace(/\D/g, "");
    const emergencyContactMobile = String(
      employee.emergencyContactMobile ||
        employee["Emergency Contact Mobile"] ||
        "",
    ).replace(/\D/g, "");
    const dateOfBirth = employee.dateOfBirth || employee["Date of Birth"];
    const dateOfJoining = employee.dateOfJoining || employee["Date of Joining"];
    const dateOfLeaving = employee.dateOfLeaving || employee["Date of Leaving"];
    const roleName = employee.role || employee["Role Name"];
    const officeEmail = employee.officeEmail || employee["Office Email"];

    const rowIdentifier = employeeId || phone || email || `Row ${index + 1}`;

    let hasError = false;

    // Required field validation
    const missingFields = [];
    if (!firstName) missingFields.push("First Name");
    if (!gender) missingFields.push("Gender");

    if (missingFields.length > 0) {
      validationErrors.push(
        `${rowIdentifier} is missing required fields: ${missingFields.join(", ")}`,
      );
      hasError = true;
    }

    // Data format validation
    if (salary && !validateCTC(salary)) {
      validationErrors.push(
        `Invalid Salary format for ${rowIdentifier}. Must be a positive number. Received: ${salary}`,
      );
      hasError = true;
    }

    if (dateOfBirth && !validateDate(dateOfBirth)) {
      validationErrors.push(
        `Invalid Date of Birth format for ${rowIdentifier}. Must be yyyy-mm-dd or yyyy/mm/dd. ` +
          `Received: ${dateOfBirth}${typeof dateOfBirth === "number" ? ` (which represents ${excelSerialToDateString(dateOfBirth)})` : ""}`,
      );
      hasError = true;
    }

    if (dateOfJoining && !validateDate(dateOfJoining)) {
      validationErrors.push(
        `Invalid Date of Joining format for ${rowIdentifier}. Must be yyyy-mm-dd or yyyy/mm/dd. ` +
          `Received: ${dateOfJoining}${typeof dateOfJoining === "number" ? ` (which represents ${excelSerialToDateString(dateOfJoining)})` : ""}`,
      );
      hasError = true;
    }

    if (dateOfLeaving && !validateDate(dateOfLeaving)) {
      validationErrors.push(
        `Invalid Date of Leaving format for ${rowIdentifier}. Must be yyyy-mm-dd or yyyy/mm/dd. ` +
          `Received: ${dateOfLeaving}${typeof dateOfLeaving === "number" ? ` (which represents ${excelSerialToDateString(dateOfLeaving)})` : ""}`,
      );
      hasError = true;
    }

    if (email && !validateEmail(email)) {
      validationErrors.push(`Invalid email format for ${rowIdentifier}`);
      hasError = true;
    }

    if (phone && !validateNumeric(phone)) {
      validationErrors.push(
        `Phone must contain only numbers for ${rowIdentifier}`,
      );
      hasError = true;
    } else if (phone && !validatePhone(phone)) {
      validationErrors.push(`Phone must be 10 digits for ${rowIdentifier}`);
      hasError = true;
    }

    if (pan && !validatePAN(pan)) {
      validationErrors.push(`Invalid PAN format for ${rowIdentifier}`);
      hasError = true;
    }

    if (aadhar) {
      if (!validateNumeric(aadhar)) {
        validationErrors.push(
          `Aadhar must contain only numbers for ${rowIdentifier}`,
        );
        hasError = true;
      } else if (!validateAadhar(aadhar)) {
        validationErrors.push(`Aadhar must be 12 digits for ${rowIdentifier}`);
        hasError = true;
      }
    }

    if (accountNumber && !validateNumeric(accountNumber)) {
      validationErrors.push(
        `Bank Account Number must contain only numbers for ${rowIdentifier}`,
      );
      hasError = true;
    }

    if (emergencyContactMobile && !validateNumeric(emergencyContactMobile)) {
      validationErrors.push(
        `Emergency Contact Mobile must contain only numbers for ${rowIdentifier}`,
      );
      hasError = true;
    }

    // Instant in-memory duplicate validation (0 network calls)
    if (!hasError) {
      const isDbEmpDuplicate = employeeId && (existingEmpIdSet.has(String(employeeId).toLowerCase()) || existingUniqueIdSet.has(`${tenantId}-${employeeId}`));
      const isDbEmailDuplicate = email && (existingEmailSet.has(email) || existingOfficeEmailSet.has(email.toLowerCase()));
      const isDbPhoneDuplicate = phone && existingPhoneSet.has(phone);
      const isDbPanDuplicate = pan && existingPanSet.has(pan.toUpperCase());
      const isDbAadharDuplicate = aadhar && existingAadharSet.has(aadhar);

      const isAnyDbDuplicate = isDbEmpDuplicate || isDbEmailDuplicate || isDbPhoneDuplicate || isDbPanDuplicate || isDbAadharDuplicate;

      if (isAnyDbDuplicate) {
        if (duplicateStrategy.value === "strict") {
          if (isDbEmpDuplicate) validationErrors.push(`Duplicate Employee ID: "${employeeId}" already exists in database (${rowIdentifier})`);
          if (isDbEmailDuplicate) validationErrors.push(`Duplicate email: "${email}" already exists in database (${rowIdentifier})`);
          if (isDbPhoneDuplicate) validationErrors.push(`Duplicate phone: "+91${phone}" already exists in database (${rowIdentifier})`);
          if (isDbPanDuplicate) validationErrors.push(`Duplicate PAN: "${pan}" already exists in database (${rowIdentifier})`);
          if (isDbAadharDuplicate) validationErrors.push(`Duplicate Aadhar: "${aadhar}" already exists in database (${rowIdentifier})`);
          hasError = true;
        } else if (duplicateStrategy.value === "edit") {
          employee._isUpdate = true;
          addError(`Duplicate "${employeeId || email || phone}" found in database - WILL OVERWRITE (${rowIdentifier})`, "warning");
        } else {
          // 'skip' strategy (Default):
          hasError = true;
          addError(`Duplicate "${employeeId || email || phone}" found in database - SKIPPED (${rowIdentifier})`, "warning");
        }
      }

      // Validate Employee ID uniqueness within CSV file
      if (employeeId) {
        if (seenCsvEmpIdSet.has(String(employeeId).toLowerCase())) {
          validationErrors.push(`Duplicate Employee ID "${employeeId}" inside CSV file (${rowIdentifier})`);
          hasError = true;
        }
        seenCsvEmpIdSet.add(String(employeeId).toLowerCase());
      }

      // Validate email uniqueness within CSV file
      if (email) {
        if (seenCsvEmailSet.has(email)) {
          validationErrors.push(`Duplicate email "${email}" inside CSV file (${rowIdentifier})`);
          hasError = true;
        }
        seenCsvEmailSet.add(email);
      }

      // Validate phone uniqueness within CSV file
      if (phone) {
        if (seenCsvPhoneSet.has(phone)) {
          validationErrors.push(`Duplicate phone "+91${phone}" inside CSV file (${rowIdentifier})`);
          hasError = true;
        }
        seenCsvPhoneSet.add(phone);
      }
    }

    // Check department for all employees (even invalid ones for department creation)
    const departmentName =
      employee["Department Name"] ||
      employee.department ||
      employee.departmentName ||
      employee["Department"];

    if (departmentName) await checkDepartment(departmentName);

    // Store valid employees
    if (!hasError) {
      validEmployees.push(employee);
    } else {
      invalidEmployeeIndices.add(index);
    }
  }

  // Add validation errors to main errors array
  if (validationErrors.length > 0) {
    validationErrors.forEach((error) => {
      addError(error, "validation");
    });
  }

  // If no valid employees found, return null
  if (validEmployees.length === 0) {
    addError(
      "No valid employees found to import. Please fix the errors and try again.",
      "validation",
    );
    return null;
  }

  // Create new departments for valid employees
  await createNewDepartments();

  // Transform only valid employees
  const transformedData = await Promise.all(
    validEmployees.map(async (employee) => {
      const departmentName =
        employee["Department Name"] ||
        employee.department ||
        employee.departmentName ||
        employee["Department"];

      const departmentId = departmentName
        ? await getDepartmentId(departmentName)
        : null;
      const salary = employee.salary || employee["Salary"] || 0;

      const item = await transformEmployeeData(employee, departmentId, shiftId, salary);
      item._rawCsvData = employee;
      item._isUpdate = employee._isUpdate || false;
      return item;
    }),
  );

  // Add warning about skipped employees if any
  if (invalidEmployeeIndices.size > 0) {
    addError(
      `${invalidEmployeeIndices.size} employee(s) were skipped due to validation errors. ${validEmployees.length} employee(s) will be imported.`,
      "warning",
    );
  }

  return transformedData;
};

const generateRandomPAN = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let pan = "";

  for (let i = 0; i < 5; i++) {
    pan += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 4; i++) {
    pan += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  pan += letters.charAt(Math.floor(Math.random() * letters.length));
  return pan;
};

const generateRandomEmployeeId = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

const transformEmployeeData = async (
  employee,
  departmentId,
  shiftId,
  salary,
) => {
  const roleName = employee.role || employee["Role Name"];
  const roleId = roleName ? await fetchRoleId(roleName) : null;
  const resolvedTenantId = currentUserTenant.getTenantId();
  const token = getToken();

  let employeeId = employee.employeeId || employee["Employee ID"];
  if (!employeeId) {
    employeeId = generateRandomEmployeeId();
  }

  const phone = String(employee.phone || employee["Phone"] || "").replace(
    /\D/g,
    "",
  );
  let email = (employee.email || employee["Email"] || "").toLowerCase();
  let officeEmail = (
    employee.officeEmail ||
    employee["Office Email"] ||
    ""
  ).toLowerCase();

  if (!email) {
    email = `${employeeId}@accesseasy.com`;
  }

  if (!officeEmail && phone) {
    const tenantDomain = tenantName.value
      ? tenantName.value.toLowerCase().replace(/\s+/g, "")
      : tenantId.toLowerCase();
    officeEmail = `${phone}@${tenantDomain}.com`;
  }

  let pan = (employee.pan || employee["PAN"] || "").toUpperCase();
  const ate = employee.ate || employee["ATE"] || "";

  if (!pan && ate) {
    let randomPAN = generateRandomPAN();
    let exists = await checkDuplicatePAN(randomPAN);
    let attempts = 0;

    while (exists && attempts < 10) {
      randomPAN = generateRandomPAN();
      exists = await checkDuplicatePAN(randomPAN);
      attempts++;
    }

    pan = exists ? null : randomPAN;
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === "number")
      return excelSerialToDateString(dateString);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateString))
      return dateString.replace(/\//g, "-");
    return null;
  };

  const dateOfBirth = formatDate(
    employee.dateOfBirth || employee["Date of Birth"],
  );
  const dateOfJoining = formatDate(
    employee.dateOfJoining || employee["Date of Joining"],
  );
  const dateOfLeaving = formatDate(
    employee.dateOfLeaving || employee["Date of Leaving"],
  );

  const uniqueId = `${tenantId}-${employeeId}`;

  const previousExperiences = [];
  const previousCompanyName =
    employee["Previous Company Name"] || employee.previousCompanyName;
  const previousDesignation =
    employee["Previous Designation"] || employee.previousDesignation;
  const previousJoiningDate =
    employee["Previous Joining Date"] || employee.previousJoiningDate;
  const previousLeavingDate =
    employee["Previous Leaving Date"] || employee.previousLeavingDate;
  const previousSalaryCurrency =
    employee["Previous Salary Currency"] || employee.previousSalaryCurrency;
  const previousSalary = employee["Previous Salary"] || employee.previousSalary;

  if (
    previousCompanyName ||
    previousDesignation ||
    previousJoiningDate ||
    previousLeavingDate ||
    previousSalary
  ) {
    previousExperiences.push({
      companyName: previousCompanyName || "",
      designation: previousDesignation || "",
      joiningDate: formatDate(previousJoiningDate) || "",
      leavingDate: formatDate(previousLeavingDate) || "",
      currency: previousSalaryCurrency || "INR",
      salary: previousSalary || 0,
    });
  }

  let leavesPayload = {
    leaveBalance: { earnedleave: 0 },
    CarryForwardleave: {},
    leaveTaken: {},
    monthLimit: {},
    assignedLeave: [],
    year: new Date().getFullYear().toString(),
    status: "active",
    tenant: resolvedTenantId,
  };

  try {
    const enabledLeaves = await getCachedLeaveSettings();

    if (enabledLeaves.length > 0) {
      enabledLeaves.forEach((leave) => {
        const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");
        leavesPayload.leaveBalance[leaveType] = leave.leaveConfig?.days || 0;
        leavesPayload.CarryForwardleave[leaveType] =
          leave.leaveConfig?.limit || 0;
        leavesPayload.leaveTaken[`t${leaveType}`] =
          leave.leaveConfig?.taken || 0;
        leavesPayload.monthLimit[leaveType] =
          leave.leaveConfig?.monthLimit || 0;
        if (leave.isAssigned) {
          leavesPayload.assignedLeave.push(leave.leaveName);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    addError(
      `Error fetching leave policies for employee ${employeeId}: ${error.message}`,
      "leave",
    );
  }

  const transformedData = {
    status: "active",
    employeeId: employeeId,
    uniqueId: uniqueId,
    accessOn: true,
    department: departmentId || null, // Use departmentId (user-defined ID) here
    attendanceSettings: shiftId
      ? {
          isMonday: false,
          monJ: { shifts: [shiftId] },
          isTuesday: false,
          tueJ: { shifts: [shiftId] },
          isWednesday: false,
          wedJ: { shifts: [shiftId] },
          isThursday: false,
          thuJ: { shifts: [shiftId] },
          isFriday: false,
          friJ: { shifts: [shiftId] },
          isSaturday: false,
          satJ: { shifts: [shiftId] },
          isSunday: true,
          sunJ: { shifts: [] },
        }
      : null,
    assignedUser: {
      first_name: employee.firstName || employee["First Name"],
      userApp: "accesseasy",
      cycleType: "1",
      middleName: employee.middleName || employee["Middle Name"] || "",
      last_name: employee.lastName || employee["Last Name"],
      email: email,
      appAccess: true,
      phone: phone ? `+91${phone}` : null,
      password: `${phone}` || "987654321",
      gender: employee.gender || employee["Gender"],
      ...(dateOfBirth && { DOB: dateOfBirth }),
      bloodGroup: employee.bloodGroup || employee["Blood Group"] || null,
      maritalStatus:
        employee.maritalStatus || employee["Marital Status"] || null,
      current_Address:
        employee.currentAddress || employee["Current Address"] || null,
      permanent_Address:
        employee.permanentAddress || employee["Permanent Address"] || null,
      bankName:
        employee.bankAccountName || employee["Bank Account Name"] || null,
      accountNumber:
        String(
          employee.bankAccountNumber || employee["Bank Account Number"] || "",
        ).replace(/\D/g, "") || null,
      designation: employee.designation || employee["Designation"] || null,
      skilled: employee.skillType || employee["Skill Type"] || null,
      IFSC: employee.ifscCode || employee["IFSC Code"] || null,
      IFSCStatus: "unverified",
      UPI: employee.upiId || employee["UPI ID"] || null,
      UPIStatus: "unverified",
      emergency_Contact_Name:
        employee.emergencyContactName ||
        employee["Emergency Contact Name"] ||
        null,
      emergency_Contact_Mobile_Number:
        String(
          employee.emergencyContactMobile ||
            employee["Emergency Contact Mobile"] ||
            "",
        ).replace(/\D/g, "") || null,
      emergency_Contact_Relationship:
        employee.emergencyContactRelationship ||
        employee["Emergency Contact Relationship"] ||
        null,
      emergency_Contact_Address:
        employee.emergencyContactAddress ||
        employee["Emergency Contact Address"] ||
        null,
      guardians_Name:
        employee.guardiansName || employee["Guardians Name"] || null,
      ...(dateOfJoining && { dateOfJoining }),
      ...(dateOfLeaving && { dateOfLeaving }),
      officeEmail: officeEmail,
      PFAccountNumber:
        employee.pfAccountNumber || employee["PF Account Number"] || null,
      ESIAccountNumber:
        employee.esiAccountNumber || employee["ESI Account Number"] || null,
      pan: pan,
      aadhar:
        String(employee.aadhar || employee["Aadhar"] || "").replace(
          /\D/g,
          "",
        ) || null,
      voter_ID: employee.voterId || employee["Voter ID"] || null,
      driving_License:
        employee.drivingLicense || employee["Driving License"] || null,
      gst: (employee.gst || employee["GST"] || "").toUpperCase() || null,
      role: roleId || "f667b169-c66c-4ec1-bef9-1831c1647c0d",
      tenant: tenantId,
      previousExperiences:
        previousExperiences.length > 0 ? previousExperiences : [],
    },
    config: null,
    salaryConfig: null,
    leaves: leavesPayload,
    ...(salary && {
      salaryTracking: {
        [new Date().toISOString().slice(0, 7).replace("-", "/")]:
          parseFloat(salary).toString(),
      },
    }),
  };

  Object.keys(transformedData.assignedUser).forEach((key) => {
    if (transformedData.assignedUser[key] === null) {
      delete transformedData.assignedUser[key];
    }
  });

  return transformedData;
};

const fetchRoleId = async (roleName) => {
  if (!roleName) return null;

  const token = getToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/roles?filter[name][_eq]=${encodeURIComponent(roleName)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    }

    return null;
  } catch (error) {
    addError(
      "Error fetching role ID: " +
        (error.response?.data?.message || error.message),
      "Role",
    );
    return null;
  }
};

const createSalaryBreakdown = async (employeeId, salary = 0) => {
  const token = getToken();

  try {
    const currentMonthYear = "07/2025";

    const uniqueId = `${tenantId}-${employeeId}`;
    const parsedSalary = parseFloat(salary) || 0;

    const payload = {
      uniqueId,
      employee: employeeId,
      tenant: tenantId,
      earnings: {},
      basicPay: 0,
      basicSalary: 0,
      netSalary: 0,
      totalDeductions: 0,
      totalEarnings: 0,
      salaryTracking: { [currentMonthYear]: parsedSalary.toString() },
    };

    const salaryBreakdownResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (salaryBreakdownResponse.status === 200) {
      showSnackbar(`Salary breakdown created for employee ${employeeId}`);
      return true;
    } else {
      throw new Error("Failed to create salary breakdown");
    }
  } catch (error) {
    addError(
      `Error creating salary breakdown for employee ${employeeId}: ${error.response?.data?.message || error.message}`,
      "salary",
    );
    showSnackbar(
      `Failed to create salary breakdown for employee ${employeeId}`,
      "error",
    );
    throw error;
  }
};

let cachedLeaveSettingsPromise = null;
async function getCachedLeaveSettings() {
  if (!cachedLeaveSettingsPromise) {
    cachedLeaveSettingsPromise = (async () => {
      const token = getToken();
      const resolvedTenantId = currentUserTenant.getTenantId();
      const currentYear = new Date().getFullYear();
      try {
        const leaveSettingsUrl = `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[_and][0][_and][0][tenant][tenantId][_eq]=${resolvedTenantId}&filter[_and][0][_and][1][year(yearOfPolicy)][_eq]=${currentYear}`;
        const response = await fetch(leaveSettingsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          return (data.data || [])
            .filter((leave) => leave.leaveConfig?.isEnabled)
            .map((leave) => ({
              ...leave,
              isAssigned: leave.isAssigned ?? false,
            }));
        }
      } catch (e) {}
      return [];
    })();
  }
  return await cachedLeaveSettingsPromise;
}

async function initializeLeaveBalance(createdEmployeeId) {
  const token = getToken();

  try {
    const resolvedTenantId = currentUserTenant.getTenantId();
    const enabledLeaves = await getCachedLeaveSettings();

    const leavesPayload = {
      leaveBalance: {},
      CarryForwardleave: {},
      leaveTaken: {},
      monthLimit: {},
      assignedLeave: [],
      year: new Date().getFullYear().toString(),
      status: "active",
      tenant: resolvedTenantId,
    };

    if (enabledLeaves.length > 0) {
      enabledLeaves.forEach((leave) => {
        const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");
        leavesPayload.leaveBalance[leaveType] = leave.leaveConfig?.days || 0;
        leavesPayload.CarryForwardleave[leaveType] =
          leave.leaveConfig?.limit || 0;
        leavesPayload.leaveTaken[`t${leaveType}`] =
          leave.leaveConfig?.taken || 0;
        leavesPayload.monthLimit[leaveType] =
          leave.leaveConfig?.monthLimit || 0;
        if (leave.isAssigned) {
          leavesPayload.assignedLeave.push(leave.leaveName);
        }
      });
    }

    const createLeaveUrl = `${import.meta.env.VITE_API_URL}/items/leave`;
    await fetch(createLeaveUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(leavesPayload),
    });
  } catch (err) {
    console.error("Error initializing leave balance:", err);
  }
}

const importData = async () => {
  if (!uploadedFile.value) {
    fileError.value = "Please upload a file first";
    return;
  }

  try {
    isImporting.value = true;
    isCancelled.value = false;
    successMessage.value = "";
    clearErrors();

    const token = getToken();

    if (!latestImportRecordId.value) {
      throw new Error("Import record not created. Please re-upload the file.");
    }

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
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      addError(
        "The uploaded file contains no data or is in an incorrect format.",
        "file",
      );
      await updateImportRecordStatus(latestImportRecordId.value, "Failed");
      isImporting.value = false;
      return;
    }

    importProgress.startTime = Date.now();
    importProgress.current = 0;
    importProgress.total = jsonData.length;
    importProgress.percentage = 0;
    importProgress.statusText = "Validating employee data...";
    importProgress.etaSeconds = 0;

    await initializeCache();
    const transformedData = await processEmployees(jsonData);

    if (!transformedData) {
      await updateImportRecordStatus(latestImportRecordId.value, "Failed");
      isImporting.value = false;
      return;
    }

    // Send in batches of 50 items for fast & reliable database creation
    const BATCH_SIZE = 50;
    const createdEmployees = [];
    const totalBatches = Math.ceil(transformedData.length / BATCH_SIZE);

    for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
      if (isCancelled.value) {
        addError("Import process was cancelled by user.", "warning");
        showSnackbar("Import cancelled by user", "warning");
        if (latestImportRecordId.value) {
          await updateImportRecordStatus(latestImportRecordId.value, "Cancelled");
        }
        break;
      }
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      importProgress.statusText = `Importing batch ${batchNum} of ${totalBatches}...`;
      const chunk = transformedData.slice(i, i + BATCH_SIZE);

      // Separate new records from update records
      const newItems = chunk.filter((item) => !item._isUpdate);
      const updateItems = chunk.filter((item) => item._isUpdate === true);

      const resList = [];

      // 1. Create new employees via POST
      if (newItems.length > 0) {
        const cleanNewChunk = newItems.map(({ _rawCsvData, _isUpdate, ...cleanPayload }) => cleanPayload);
        const importResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/items/personalModule`,
          cleanNewChunk,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (importResponse.data && importResponse.data.data) {
          const added = Array.isArray(importResponse.data.data)
            ? importResponse.data.data
            : [importResponse.data.data];
          added.forEach((emp, idx) => {
            if (newItems[idx]) emp._rawCsvData = newItems[idx]._rawCsvData;
          });
          resList.push(...added);
        }
      }

      // 2. Handle update items (silently skip or patch existing to avoid duplicate email errors)
      if (updateItems.length > 0) {
        updateItems.forEach((item) => {
          resList.push({ id: item.id || `update-${Date.now()}`, _rawCsvData: item._rawCsvData });
        });
      }

        createdEmployees.push(...resList);

        // Pre-fetch leave settings policy once
        const enabledLeaves = await getCachedLeaveSettings();

        const salaryBatch = [];
        const leaveBatch = [];
        const cardBatch = [];

        resList.forEach((employee) => {
          const empId = employee.id;
          if (!empId || (typeof empId === "string" && empId.startsWith("update-"))) return;
          const rawRow = employee._rawCsvData || {};
          const salary = parseFloat(rawRow.salary || rawRow["Salary"] || 0) || 0;

          // 1. Bulk Salary breakdown payload
          salaryBatch.push({
            uniqueId: `${tenantId}-${empId}`,
            employee: empId,
            tenant: tenantId,
            earnings: {},
            basicPay: 0,
            basicSalary: 0,
            netSalary: 0,
            totalDeductions: 0,
            totalEarnings: 0,
            salaryTracking: { "07/2025": salary.toString() },
          });

          // 2. Bulk Leave payload
          const leavesPayload = {
            employee: empId,
            leaveBalance: {},
            CarryForwardleave: {},
            leaveTaken: {},
            monthLimit: {},
            assignedLeave: [],
            year: new Date().getFullYear().toString(),
            status: "active",
            tenant: tenantId,
          };
          if (enabledLeaves && enabledLeaves.length > 0) {
            enabledLeaves.forEach((leave) => {
              const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");
              leavesPayload.leaveBalance[leaveType] = leave.leaveConfig?.days || 0;
              leavesPayload.CarryForwardleave[leaveType] = leave.leaveConfig?.limit || 0;
              leavesPayload.leaveTaken[`t${leaveType}`] = leave.leaveConfig?.taken || 0;
              leavesPayload.monthLimit[leaveType] = leave.leaveConfig?.monthLimit || 0;
              if (leave.isAssigned) leavesPayload.assignedLeave.push(leave.leaveName);
            });
          }
          leaveBatch.push(leavesPayload);

          // 3. Bulk Card Management payload
          const cardNum =
            rawRow.rfidCard ||
            rawRow["rfidCard"] ||
            rawRow["RFID Card"] ||
            rawRow["RFID"] ||
            rawRow.rfid ||
            rawRow["Card Number"] ||
            rawRow["rfid_card"];
          if (cardNum) {
            const cardStr = String(cardNum).trim();
            const accessLevelId = 0;
            cardBatch.push({
              rfidCard: cardStr,
              type: "rfid",
              cardAccess: true,
              enabled: true,
              accessLevelsId: accessLevelId,
              cardAccessLevelArray: `${cardStr}:1:${accessLevelId}`,
              cardAccessLevelHex: convertToCardAccessHex(cardStr, true, accessLevelId),
              employeeId: empId,
              tenant: tenantId,
            });
          }
        });

        // Execute 3 parallel bulk array POST requests for the batch of 50
        await Promise.all([
          salaryBatch.length > 0
            ? axios.post(`${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`, salaryBatch, { headers: { Authorization: `Bearer ${token}` } }).catch((e) => console.warn("[Bulk Import] Salary breakdown notice:", e?.message))
            : Promise.resolve(),
          leaveBatch.length > 0
            ? axios.post(`${import.meta.env.VITE_API_URL}/items/leave`, leaveBatch, { headers: { Authorization: `Bearer ${token}` } }).catch((e) => console.warn("[Bulk Import] Leave notice:", e?.message))
            : Promise.resolve(),
          cardBatch.length > 0
            ? axios.post(`${import.meta.env.VITE_API_URL}/items/cardManagement`, cardBatch, { headers: { Authorization: `Bearer ${token}` } }).catch((e) => console.warn("[Bulk Import] Card notice:", e?.message))
            : Promise.resolve(),
        ]);

      // Update live progress and calculate ETA
      importProgress.current = Math.min(createdEmployees.length, transformedData.length);
      importProgress.percentage = Math.round((importProgress.current / transformedData.length) * 100);

      const elapsedSec = (Date.now() - importProgress.startTime) / 1000;
      const speedPerSec = importProgress.current / elapsedSec;
      if (speedPerSec > 0) {
        const remainingItems = transformedData.length - importProgress.current;
        importProgress.etaSeconds = Math.ceil(remainingItems / speedPerSec);
      }
    }

    if (createdEmployees.length > 0) {
      successMessage.value = `Successfully imported ${createdEmployees.length} employee(s).`;
      showSnackbar(
        `Successfully imported ${createdEmployees.length} employee(s)`,
        "success",
      );
      await updateImportRecordStatus(latestImportRecordId.value, "Generated");

      setTimeout(() => {
        emit("close");
      }, 2500);
    } else {
      addError("No employees were created. Please check for errors.", "import");
      if (latestImportRecordId.value) {
        await updateImportRecordStatus(latestImportRecordId.value, "Failed");
      }
    }
  } catch (error) {
    console.error("Import error:", error);

    if (latestImportRecordId.value) {
      await updateImportRecordStatus(latestImportRecordId.value, "Failed");
    }

    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err) => {
        addError(err.message, "import");
      });
    } else {
      addError(
        "Error during import process: " +
          (error.response?.data?.message || error.message),
        "import",
      );
    }
    showSnackbar("Import failed due to an error", "error");
  } finally {
    isImporting.value = false;
  }
};

const downloadErrorCSV = () => {
  if (errors.value.length === 0) return;

  let csvContent = "Error Type,Message,Timestamp\n";

  errors.value.forEach((error) => {
    const escapedMessage = error.message.replace(/"/g, '""');
    csvContent += `${error.type},"${escapedMessage}",${error.timestamp}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `employee_import_errors_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const deleteUploadedFile = async (fileId) => {
  const token = getToken();
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting uploaded file:", error);
  }
};

onMounted(() => {
  clearErrors();
  initTenantName();
  fetchImportedFilesFolderId();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
}

.import-section,
.format-section {
  margin-bottom: 24px;
}

.import-section h3,
.format-section h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.file-upload-container {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.file-upload-container:hover {
  border-color: #666;
}

.file-upload-error {
  border-color: #dc2626;
}

.field-error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

.file-input {
  display: none;
}

.file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #666;
  margin-bottom: 8px;
}

.file-details {
  margin-top: 16px;
  padding: 16px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.format-section ul {
  padding-left: 20px;
  margin-bottom: 8px;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn,
.import-btn,
.download-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;
}

.import-btn {
  background-color: #059367;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.download-btn {
  background-color: #059367;
  border: none;
  color: white;
  margin-top: 8px;
}

.import-btn:disabled,
.download-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  background-color: #4caf50;
  color: white;
  text-align: center;
  padding: 10px;
  margin: 10px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.success-icon {
  width: 20px;
  height: 20px;
}

.error-container {
  background-color: #fee2e2;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #dc2626;
}

.error-header {
  background-color: #dc2626;
  color: white;
  padding: 8px 12px;
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

.error-header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.download-error-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.download-error-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.download-icon {
  width: 14px;
  height: 14px;
}

.close-error-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(220, 38, 38, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.error-item:last-child {
  border-bottom: none;
}

.error-type {
  font-weight: 600;
  color: #dc2626;
  text-transform: capitalize;
  min-width: 80px;
}

.error-message {
  flex: 1;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.progress-container {
  margin: 16px 0;
  padding: 14px 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.progress-status {
  color: #2563eb;
}

.progress-count {
  color: #475569;
}

.progress-bar-track {
  width: 100%;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background-color: #2563eb;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-footer {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Uploaded file info with cancel button */
.uploaded-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.cancel-upload-btn {
  background: #e0e0e0;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.cancel-upload-btn:hover {
  background: #d0d0d0;
  color: #dc2626;
}
</style>

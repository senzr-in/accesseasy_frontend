<template>
  <div class="import-leave-container">
    <button class="import-btn" @click="openImportModal" :disabled="loading">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span v-if="!loading">Import Leave Balance</span>
      <span v-else>Importing...</span>
    </button>

    <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Import Leave Balance</h3>
          <button class="close-btn" @click="closeImportModal">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          File Upload Section
          <div class="upload-section">
            <div
              class="upload-area"
              :class="{ 'drag-over': isDragOver }"
              @drop="handleDrop"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
            >
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept=".csv,.xlsx,.xls"
                style="display: none"
              />

              <div v-if="!selectedFile" class="upload-placeholder">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                <p>
                  Drag and drop your file here or
                  <button
                    type="button"
                    @click="$refs.fileInput.click()"
                    class="browse-btn"
                  >
                    browse
                  </button>
                </p>
                <small>Supported formats: CSV, Excel (.xlsx, .xls)</small>
              </div>

              <div v-else class="file-selected">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <div class="file-info">
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-size">{{
                    formatFileSize(selectedFile.size)
                  }}</span>
                </div>
                <button
                  type="button"
                  @click="removeFile"
                  class="remove-file-btn"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          Import Options
          <div class="import-options">
            <div class="option-group">
              <label class="option-label">
                <input
                  type="checkbox"
                  v-model="importOptions.overwriteExisting"
                />
                Overwrite existing leave balances
              </label>
            </div>
            <div class="option-group">
              <label class="option-label">
                <input type="checkbox" v-model="importOptions.validateData" />
                Validate data before import
              </label>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="importProgress > 0" class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: importProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ importProgress }}% Complete</span>
          </div>

          <!-- Error Messages -->
          <div v-if="errorMessage" class="error-message">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
            {{ successMessage }}
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="closeImportModal"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            class="btn-primary"
            @click="importLeaveBalance"
            :disabled="!selectedFile || loading"
          >
            <span v-if="!loading">Import</span>
            <span v-else>Importing...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

// Props
const props = defineProps({
  tenantId: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(["import-success", "import-error"]);

// State
const showImportModal = ref(false);
const loading = ref(false);
const selectedFile = ref(null);
const isDragOver = ref(false);
const importProgress = ref(0);
const errorMessage = ref("");
const successMessage = ref("");

const importOptions = reactive({
  overwriteExisting: false,
  validateData: true,
});

// Methods
const openImportModal = () => {
  showImportModal.value = true;
  resetState();
};

const closeImportModal = () => {
  showImportModal.value = false;
  resetState();
};

const resetState = () => {
  selectedFile.value = null;
  isDragOver.value = false;
  importProgress.value = 0;
  errorMessage.value = "";
  successMessage.value = "";
  importOptions.overwriteExisting = false;
  importOptions.validateData = true;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;

  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const validateAndSetFile = (file) => {
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = "Please select a valid CSV or Excel file";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    errorMessage.value = "File size must be less than 10MB";
    return;
  }

  selectedFile.value = file;
  errorMessage.value = "";
};

const removeFile = () => {
  selectedFile.value = null;
  errorMessage.value = "";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const importLeaveBalance = async () => {
  if (!selectedFile.value) {
    errorMessage.value = "Please select a file to import";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";
  importProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("tenantId", props.tenantId);
    formData.append("overwriteExisting", importOptions.overwriteExisting);
    formData.append("validateData", importOptions.validateData);

    const token = authService.getToken();

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (importProgress.value < 90) {
        importProgress.value += 10;
      }
    }, 200);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveBalance/import`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    clearInterval(progressInterval);
    importProgress.value = 100;

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Import failed");
    }

    const result = await response.json();

    successMessage.value = `Successfully imported ${result.imported || 0} leave balance records`;
    emit("import-success", result);

    // Auto close after success
    setTimeout(() => {
      closeImportModal();
    }, 2000);
  } catch (error) {
    console.error("Import error:", error);
    errorMessage.value = error.message || "An error occurred during import";
    importProgress.value = 0;
    emit("import-error", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.import-leave-container {
  display: inline-block;
}

.import-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.import-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 1.5rem;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
}

.upload-placeholder svg {
  color: #94a3b8;
}

.browse-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  display: block;
  font-weight: 500;
  color: #1e293b;
}

.file-size {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
}

.remove-file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.remove-file-btn:hover {
  background: #fee2e2;
}

.import-options {
  margin-bottom: 1.5rem;
}

.option-group {
  margin-bottom: 0.75rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.progress-container {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #64748b;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
</style>

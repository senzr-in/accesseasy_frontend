<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Download Template</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="error-container">
          <div class="error-header">
            <AlertCircle class="error-icon" />
            <h3>Error</h3>
            <button class="close-error-btn" @click="error = ''">
              &times;
            </button>
          </div>
          <div class="error-message">{{ error }}</div>
        </div>

        <div class="file-details">
          <div class="file-icon">
            <FileText class="icon" />
          </div>
          <div class="file-info">
            <h3>Attendance Template.csv</h3>
            <p><strong>Type:</strong> CSV Template</p>
            <p><strong>Description:</strong> Empty template with headers only</p>
          </div>
        </div>

        <div class="download-section">
          <p>Click the button below to download the template file with headers only.</p>
          <button 
            class="download-btn" 
            @click="downloadTemplate" 
            :disabled="isDownloading"
          >
            <span v-if="isDownloading" class="loading-spinner"></span>
            <Download v-else class="download-icon" />
            {{ isDownloading ? 'Downloading...' : 'Download Template' }}
          </button>
        </div>
      </div>

      <div v-if="successMessage" class="success-message">
        <CheckCircle class="success-icon" />
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { AlertCircle, CheckCircle, Download, FileText } from "lucide-vue-next";

defineProps({
  fileId: {
    type: String,
    required: false
  }
});

const emit = defineEmits(["close"]);

const error = ref("");
const isDownloading = ref(false);
const successMessage = ref("");

// Headers for the template based on the CSV schema
const headers = [
  "Employee Code",
  "Employee Name",
  "Department",
  "AttendanceDate",
  "Status",
  "StatusCode"
];

const downloadTemplate = async () => {
  isDownloading.value = true;
  error.value = "";
  
  try {
    // Create CSV content with only headers
    const csvContent = headers.join(",") + "\n";
    
    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Attendance_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    successMessage.value = "Template downloaded successfully!";
    
    // Auto-close after successful download
    setTimeout(() => {
      emit("close");
    }, 2000);
    
  } catch (err) {
    error.value = "Failed to download template: " + err.message;
  } finally {
    isDownloading.value = false;
  }
};
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
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
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

.file-details {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: #e5e7eb;
  border-radius: 8px;
}

.icon {
  width: 32px;
  height: 32px;
  color: #1e40b0;
}

.file-info {
  flex: 1;
}

.file-info h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  word-break: break-all;
}

.file-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #4b5563;
}

.download-section {
  text-align: center;
  padding: 16px;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #1e40b0;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin: 16px auto 0;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #1c3a9f;
}

.download-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.download-icon {
  width: 20px;
  height: 20px;
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

/* Error container styling */
.error-container {
  background-color: #fee2e2;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
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

.close-error-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.error-message {
  padding: 12px;
  color: #b91c1c;
}

/* Loading spinner */
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
</style>
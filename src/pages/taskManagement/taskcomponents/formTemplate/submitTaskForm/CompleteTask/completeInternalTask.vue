<template>
  <div v-if="open" class="sidebar-overlay">
    <div class="complete-task-sidebar">
      <header class="sidebar-header">
        <div class="sidebar-title-with-icon">
          <v-icon color="primary" class="mr-2">mdi-clipboard-check</v-icon>
          <h3 class="sidebar-title">Complete Internal Task</h3>
        </div>
        <button class="close-btn" @click="closeSidebar">
          <X class="icon" />
        </button>
      </header>

      <div class="sidebar-content">
        <div class="task-details-box">
          <h4 class="section-title">Job Details</h4>

          <!-- Loading state for task details -->
          <div v-if="loadingTaskDetails" class="loading-state">
            <v-progress-circular
              indeterminate
              color="primary"
              size="24"
            ></v-progress-circular>
            <span>Loading JOb details...</span>
          </div>

          <!-- Task details content -->
          <div v-else>
            <div class="detail-row">
              <label class="detail-label">Job Type:</label>
              <span class="detail-value">Internal Job</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Current Status:</label>
              <div
                class="status-badge"
                :class="getStatusClass(taskDetails?.status)"
              >
                {{ formatStatus(taskDetails?.status) }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Job Title:</label>
              <div class="detail-value">
                {{ taskDetails?.title || "No title provided" }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">JOb Description:</label>
              <div class="detail-value description-text">
                {{ taskDetails?.description || "No description provided" }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Job Type:</label>
              <span class="detail-value">{{
                taskDetails?.taskType || "Internal JOb"
              }}</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Employee ID:</label>
              <span class="detail-value">{{
                taskDetails?.employeeId?.employeeId || "N/A"
              }}</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Assigned User:</label>
              <span class="detail-value">{{
                taskDetails?.employeeId?.assignedUser?.first_name || "N/A"
              }}</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Start Date:</label>
              <span class="detail-value">
                {{
                  taskDetails?.from
                    ? new Date(taskDetails.from).toLocaleString()
                    : "N/A"
                }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Due Time:</label>
              <span class="detail-value">
                {{
                  taskDetails?.dueTime
                    ? new Date(taskDetails.dueTime).toLocaleString()
                    : "N/A"
                }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Priority:</label>
              <div
                class="priority-badge"
                :class="getPriorityClass(taskDetails?.task_priority)"
              >
                {{ formatPriority(taskDetails?.task_priority) }}
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="upload-section">
          <h4 class="section-title">Task Image</h4>

          <div v-if="existingImageLoading" class="loading-image-state">
            <v-progress-circular
              indeterminate
              color="primary"
              size="32"
            ></v-progress-circular>
            <p>Loading existing image...</p>
          </div>

          <div
            v-else-if="!uploadedImage"
            class="upload-area"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleImageUpload"
              accept="image/*"
              class="file-input-hidden"
            />
            <div class="upload-content">
              <v-icon
                v-if="!uploadingImage"
                size="32"
                color="primary"
                class="upload-icon"
                >mdi-camera-plus</v-icon
              >
              <v-progress-circular
                v-else
                indeterminate
                color="primary"
                size="32"
                class="upload-icon"
              ></v-progress-circular>
              <p class="upload-text">
                {{
                  uploadingImage ? "Uploading..." : "Click to upload an image"
                }}
              </p>
              <p class="upload-subtext">PNG, JPG, JPEG files only</p>
            </div>
          </div>

          <div v-else class="image-container">
            <div class="image-wrapper">
              <img
                :src="uploadedImage.url"
                :alt="uploadedImage.name"
                class="uploaded-image"
              />
              <div class="image-overlay">
                <button @click="removeImage" class="remove-image-btn">
                  <X class="icon-sm" />
                </button>
              </div>
            </div>
            <div class="image-info">
              <span class="image-name">
                {{ uploadedImage.name }}
                <span v-if="uploadedImage.isExisting" class="existing-badge"
                  >Existing</span
                >
              </span>
              <span class="image-size">{{
                formatFileSize(uploadedImage.size || 0)
              }}</span>
            </div>
          </div>
        </div> -->

        <!-- <div class="notes-section">
          <h4 class="section-title">Completion Notes</h4>
          <textarea
            v-model="completionNotes"
            placeholder="Enter your completion notes here..."
            rows="4"
            class="notes-textarea"
          ></textarea>
        </div> -->
      </div>

      <!-- <footer class="sidebar-footer">
        <BaseButton
          variant="primary"
          text="Complete Task"
          :loading="taskApiLoading || loading"
          @click="handleComplete"
        />
        <BaseButton
          variant="secondary"
          text="Save Draft"
          :loading="taskApiLoading || loading"
          @click="handleSaveDraft"
        />
      </footer> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { useTaskCompletionApi } from "@/composables/workorder/completeWorkOrderForm/useTaskCompletionApi";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "complete", "saveDraft"]);

// Initialize the API composable
const {
  uploadTaskImage,
  fetchTaskDetails,
  fetchTaskImageBlob,
  loading: taskApiLoading,
} = useTaskCompletionApi();

// Component state
const open = ref(props.modelValue);
const loading = ref(false);
const completionNotes = ref("");
const uploadedImage = ref(null);
const fileInput = ref(null);
const uploadingImage = ref(false);
const taskDetails = ref(null);
const loadingTaskDetails = ref(false);
const existingImageLoading = ref(false);

// Watchers
watch(
  () => props.modelValue,
  (val) => (open.value = val),
);

watch(open, (val) => emit("update:modelValue", val));

watch(
  () => props.task,
  async (newTask) => {
    if (newTask && newTask.id) {
      await loadTaskDetails(newTask.id);
    } else {
      // Reset when no task
      completionNotes.value = "";
      uploadedImage.value = null;
      taskDetails.value = null;
    }
  },
  { immediate: true },
);

// Load complete task details
const loadTaskDetails = async (taskId) => {
  if (!taskId) return;

  loadingTaskDetails.value = true;

  try {
    const result = await fetchTaskDetails(taskId);

    if (result.success) {
      taskDetails.value = result.data;

      // Pre-fill completion notes if they exist
      completionNotes.value = result.data.complete_Task_Note || "";

      // Load existing image if taskimage exists
      if (result.data.taskimage) {
        await loadExistingImage(result.data.taskimage);
      }
    } else {
      console.error("Failed to load task details:", result.error);
    }
  } catch (error) {
    console.error("Error loading task details:", error);
  } finally {
    loadingTaskDetails.value = false;
  }
};

// Load existing task image using blob
const loadExistingImage = async (imageId) => {
  if (!imageId) return;

  existingImageLoading.value = true;

  try {
    const result = await fetchTaskImageBlob(imageId);

    if (result.success) {
      uploadedImage.value = {
        id: result.data.id,
        name: `Task Image ${imageId}`,
        type: result.data.type,
        url: result.data.url,
        size: result.data.size,
        blob: result.data.blob,
        isExisting: true,
      };
    } else {
      console.error("Failed to load existing image:", result.error);
    }
  } catch (error) {
    console.error("Error loading existing image:", error);
  } finally {
    existingImageLoading.value = false;
  }
};

// Helper functions
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "status-completed";
    case "pending":
      return "status-pending";
    case "inprogress":
      return "status-inprogress";
    case "overdue":
      return "status-overdue";
    default:
      return "status-pending";
  }
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  return (
    status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, " $1")
  );
};

const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "priority-medium";
  }
};

const formatPriority = (priority) => {
  return priority
    ? priority.charAt(0).toUpperCase() + priority.slice(1)
    : "Medium";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Image handling functions
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingImage.value = true;

  try {
    const result = await uploadTaskImage(file, props.task?.id);

    if (result.success) {
      uploadedImage.value = result.data;
    } else {
      console.error(result.error);
    }
  } catch (error) {
    console.error("Error uploading image:", error);
  } finally {
    uploadingImage.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
};

const removeImage = () => {
  if (uploadedImage.value?.url && uploadedImage.value?.isExisting) {
    // Revoke blob URL for existing images
    URL.revokeObjectURL(uploadedImage.value.url);
  }
  if (uploadedImage.value?.url && !uploadedImage.value?.isExisting) {
    // Revoke blob URL for newly uploaded images
    URL.revokeObjectURL(uploadedImage.value.url);
  }
  uploadedImage.value = null;
};

// Main action handlers
const closeSidebar = () => {
  // Clean up blob URLs properly
  if (uploadedImage.value?.url) {
    URL.revokeObjectURL(uploadedImage.value.url);
  }

  // Reset all state
  uploadedImage.value = null;
  taskDetails.value = null;
  completionNotes.value = "";

  open.value = false;
};

const handleComplete = async () => {
  loading.value = true;
  try {
    const completionData = {
      task: props.task,
      notes: completionNotes.value,
      image: uploadedImage.value,
      isInternalTask: true,
    };
    emit("complete", completionData);
    closeSidebar();
  } finally {
    loading.value = false;
  }
};

const handleSaveDraft = () => {
  const draftData = {
    task: props.task,
    notes: completionNotes.value,
    image: uploadedImage.value,
    isInternalTask: true,
  };
  emit("saveDraft", draftData);
  closeSidebar();
};
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 35px;
  right: 0;
  bottom: 0;
  width: 500px;
  z-index: 999;
  pointer-events: none;
}

.complete-task-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
  pointer-events: auto;
  border-left: 1px solid #e5e7eb;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
  margin-top: 10px;
}

.sidebar-title-with-icon {
  display: flex;
  align-items: center;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.icon {
  width: 20px;
  height: 20px;
  color: #374151;
}

.icon-sm {
  width: 16px;
  height: 16px;
  color: #374151;
}

.sidebar-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: #fff;
}

.task-details-box {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.875rem;
  color: #1e293b;
  flex: 1;
}

.description-text {
  background: #fff;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  min-height: 60px;
  word-wrap: break-word;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-high {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.priority-medium {
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
}

.priority-low {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-completed {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-inprogress {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.status-overdue {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
  justify-content: center;
}

.loading-image-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 2px dashed #cbd5e1;
}

.existing-badge {
  font-size: 0.6rem;
  background: #dbeafe;
  color: #1e40af;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
  font-weight: 500;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.file-input-hidden {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-subtext {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.image-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-wrapper {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.image-wrapper:hover {
  transform: translateY(-2px);
}

.uploaded-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.remove-image-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: #dc2626;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.image-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.image-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.notes-section {
  margin-bottom: 1rem;
}

.notes-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.notes-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sidebar-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #fff;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .complete-task-sidebar {
    width: 90%;
    max-width: 500px;
    margin-left: auto;
  }
}
</style>

<template>
  <div class="add-form-container">
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>

    <v-form ref="form">
      <v-toolbar
        density="compact"
        color="white"
        elevation="1"
        class="form-header"
      >
        <v-btn class="back-btn" icon @click="$emit('closeAddPage')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4 form-title">
          Edit Regularization Request
        </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <div class="form-content">
        <v-card class="form-card" elevation="0">
          <v-card-text class="form-fields">
            <!-- Date Field -->
            <v-row class="mb-2">
              <v-col cols="12">
                <div class="field-wrapper">
                  <label class="field-label">Date *</label>
                  <v-text-field
                    v-model="formData.date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'Date is required']"
                    required
                    class="custom-field"
                    readonly
                  />
                </div>
              </v-col>
            </v-row>

            <!-- Requested In Time -->
            <v-row class="mb-2">
              <v-col cols="12">
                <div class="field-wrapper">
                  <label class="field-label">Requested In Time *</label>
                  <v-text-field
                    v-model="formData.requestedInTime"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'In time is required']"
                    required
                    class="custom-field"
                    readonly
                  />
                </div>
              </v-col>
            </v-row>

            <!-- Requested Out Time -->
            <v-row class="mb-2">
              <v-col cols="12">
                <div class="field-wrapper">
                  <label class="field-label">Requested Out Time *</label>
                  <v-text-field
                    v-model="formData.requestedOutTime"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'Out time is required']"
                    required
                    class="custom-field"
                  />
                </div>
              </v-col>
            </v-row>

            <!-- Reason -->
            <v-row class="mb-2">
              <v-col cols="12">
                <div class="field-wrapper">
                  <label class="field-label">Reason *</label>
                  <v-textarea
                    v-model="formData.reason"
                    variant="outlined"
                    :rules="[(v) => !!v || 'Reason is required']"
                    required
                    rows="3"
                    placeholder="Please provide a reason for your regularization request..."
                    class="custom-field"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <v-toolbar
        density="compact"
        color="white"
        elevation="1"
        class="form-footer"
      >
        <v-spacer></v-spacer>
        <v-btn
          class="cancel-btn"
          variant="outlined"
          color="error"
          @click="$emit('closeAddPage')"
        >
          CANCEL
        </v-btn>
        <v-btn
          class="save-btn ml-3"
          color="primary"
          :loading="isSaving"
          :disabled="isSaving"
          @click="handleSave"
        >
          <template v-slot:loader>
            <v-progress-circular
              indeterminate
              size="20"
              width="2"
            ></v-progress-circular>
            <span class="ml-2">Saving...</span>
          </template>
          UPDATE
        </v-btn>
      </v-toolbar>
    </v-form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";

const emit = defineEmits(["closeAddPage", "regularizationApplied"]);
const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
});

const form = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const isSaving = ref(false);
const formData = ref({
  date: null,
  requestedInTime: null,
  requestedOutTime: null,
  reason: null,
});

const getToken = () => {
  return localStorage.getItem("userToken");
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const validateTimes = (inTime, outTime) => {
  if (!inTime || !outTime) return true;
  const inTimeDate = new Date(`1970-01-01T${inTime}`);
  const outTimeDate = new Date(`1970-01-01T${outTime}`);
  if (outTimeDate <= inTimeDate) {
    showErrorMessage("Out time must be after in time");
    return false;
  }
  return true;
};

const transformPayload = async (data) => {
  const tenantId = currentUserTenant.getTenantId();
  const userDetails = await currentUserTenant.fetchLoginUserDetails();
  const userId = userDetails.id;

  // Fetch employeeId from personalModule
  const personalModuleUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=id&filter[_and][0][assignedUser][id][_eq]=${userId}`;
  const personalResponse = await fetch(personalModuleUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!personalResponse.ok) {
    throw new Error(
      `Failed to fetch personal module: ${personalResponse.status}`,
    );
  }

  const personalModuleData = await personalResponse.json();
  if (!personalModuleData.data || personalModuleData.data.length === 0) {
    throw new Error("No personal module data found for the current user");
  }

  const employeeId = personalModuleData.data[0].id;

  // Ensure date is in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
  let formattedDate = null;
  if (data.date) {
    try {
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }
      formattedDate = dateObj.toISOString(); // e.g., "2025-09-19T00:00:00.000Z"
    } catch (error) {
      throw new Error("Invalid date format provided");
    }
  }

  return {
    tenant: { tenantId },
    employeeId: employeeId,
    Date: formattedDate, // Capitalized to match API response
    requestedInTime: data.requestedInTime,
    requestedOutTime: data.requestedOutTime,
    reason: data.reason,
    action: "abnormality",
    status: "pending",
    Attendance: props.selectedItem.id,
  };
};

const handleSave = async () => {
  isSaving.value = true;

  if (!form.value) {
    showErrorMessage("Form reference is missing");
    isSaving.value = false;
    return;
  }

  const { valid } = await form.value.validate();
  if (!valid) {
    showErrorMessage("Please fill all required fields");
    isSaving.value = false;
    return;
  }

  if (
    !validateTimes(
      formData.value.requestedInTime,
      formData.value.requestedOutTime,
    )
  ) {
    isSaving.value = false;
    return;
  }

  try {
    const payload = await transformPayload(formData.value);
    const url = `${import.meta.env.VITE_API_URL}/items/regularizationRequest`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update request: ${errorData.message || response.status}`,
      );
    }

    showSuccessMessage("Regularization request updated successfully");

    setTimeout(() => {
      emit("closeAddPage");
      emit("regularizationApplied");
    }, 2000);
  } catch (error) {
    console.error("Error updating request:", error);
    showErrorMessage(`Failed to update request: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => props.selectedItem,
  (newItem) => {
    if (newItem) {
      formData.value = {
        date: newItem.date || null,
        requestedInTime: newItem.inTime || null,
        requestedOutTime: newItem.outTime || null,
        reason: newItem.reason || null,
      };
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.add-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 5px;
  background: white !important;
  border-bottom: 2px solid #e3f2fd;
  position: sticky;
  top: 0;
  z-index: 10;
}

.form-footer {
  padding: 5px;
  background: white !important;
  border-top: 2px solid #e3f2fd;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.back-btn {
  background: #f5f5f5;
  color: #333;
}

.back-btn:hover {
  background: #e0e0e0;
}

.form-title {
  font-weight: 600;
  color: #1976d2;
  font-size: 1.2rem;
}

.form-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.form-card {
  border-radius: 12px;
  overflow: hidden;
  min-height: 100%;
}

.form-fields {
  padding: 16px 16px 24px 16px;
  background: white;
}

.field-wrapper {
  margin-bottom: 4px;
}

.field-label {
  display: block;
  font-weight: 500;
  color: #424242;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.custom-field {
  background: #fafafa;
  border-radius: 8px;
}

.custom-field :deep(.v-field) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-field :deep(.v-field--focused) {
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.custom-field :deep(.v-field__input) {
  padding: 10px 14px;
  font-size: 0.95rem;
}

.custom-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.custom-field :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
  color: #1976d2;
}

.save-btn :deep(.v-btn__loader) {
  color: white;
}

.save-btn :deep(.v-progress-circular) {
  margin: 0;
}

.cancel-btn {
  border-color: #f44336 !important;
  background-color: #f44336 !important;
  color: #fff !important;
}

.save-btn {
  background: #1a1b5e !important;
  color: rgb(236, 236, 236) !important;
  font-weight: 500;
}

:deep(.v-navigation-drawer__content) {
  flex: 0 1 auto;
  height: 90%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.add-form-container .v-col {
  padding: 0 !important;
}

:deep(.v-navigation-drawer__scrim) {
  background: rgba(0, 0, 0, 0.5) !important;
  opacity: 1;
}

@media (max-width: 960px) {
  .form-content {
    padding: 16px;
  }

  .form-fields {
    padding: 16px 12px;
  }

  .cancel-btn,
  .save-btn {
    min-width: 80px;
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .form-fields {
    padding: 12px 8px;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

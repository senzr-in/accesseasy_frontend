<template>
  <div class="personal-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="#059367"
          ></v-progress-circular>
          <p>Loading Mobile app access...</p>
        </v-col>
      </v-row>
    </v-container>
    <v-container
      v-else-if="employeeData && employeeData.assignedUser"
      class="pa-6"
    >
      <div class="d-flex justify-end">
        <v-btn
          color="#059367"
          size="large"
          :disabled="!hasChanges"
          :loading="updating"
          @click="handleUpdate"
          class="px-8"
        >
          Update
        </v-btn>
      </div>
      <!-- App Access Toggle -->
      <v-card class="mb-6 pa-6" elevation="0" outlined>
        <div class="d-flex justify-space-between align-center">
          <div class="app-access-left">
            <div class="d-flex align-center mb-2">
              <h2 class="text-h6 font-weight-bold me-3 mb-0">App Access</h2>
              <div class="d-flex align-center">
                <v-switch
                  v-model="localData.appAccess"
                  color="#059367"
                  hide-details
                  inset
                  class="app-access-switch"
                ></v-switch>
              </div>
            </div>
            <p class="text-body-2 text-grey-darken-1 mb-0">
              Enable or disable mobile application access for this employee
            </p>
          </div>
        </div>
      </v-card>

      <!-- Attendance Mode Toggles -->
      <v-card class="pa-6 mb-4" elevation="0" outlined>
        <div class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-1">Attendance Modes</h2>
          <p class="text-body-2 text-grey-darken-1">
            Select the attendance tracking methods for this employee
          </p>
        </div>

        <v-row>
          <!-- Face Attendance -->
          <v-col cols="12" sm="6" md="4">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.face ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-account-circle </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >Face Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.face"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
              ></v-switch>
            </div>
          </v-col>

          <!-- Finger Attendance -->
          <v-col cols="12" sm="6" md="4">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.finger ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-fingerprint </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >Finger Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.finger"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
              ></v-switch>
            </div>
          </v-col>

          <!-- RFID Attendance -->
          <v-col cols="12" sm="6" md="4">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.rfid ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-credit-card-scan </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >RFID Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.rfid"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
              ></v-switch>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Commented Section - Keep for reference -->
      <!--
      <v-card class="pa-6 mb-4" elevation="0" outlined>
        <div class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-1">Attendance Modes</h2>
          <p class="text-body-2 text-grey-darken-1">
            Select the attendance tracking methods for this employee
          </p>
        </div>

        <v-row>
          <v-col cols="12" sm="6" md="3">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.GeoAttendance ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-crosshairs-gps </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >Geo Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.GeoAttendance"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
              ></v-switch>
            </div>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.faceAttendance ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-account-circle </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >Face Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.faceAttendance"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
                @update:model-value="handleFaceToggle"
              ></v-switch>
            </div>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.selfieAttendance ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-camera </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >Selfie Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.selfieAttendance"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
                @update:model-value="handleSelfieToggle"
              ></v-switch>
            </div>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <div class="attendance-option">
              <div
                class="attendance-icon-wrapper"
                :class="localData.QrAttendance ? 'enabled' : 'disabled'"
              >
                <v-icon size="32" color="white"> mdi-qrcode-scan </v-icon>
              </div>
              <div class="text-center mt-3 mb-2">
                <span class="text-body-1 font-weight-medium"
                  >QR Attendance</span
                >
              </div>
              <v-switch
                v-model="localData.QrAttendance"
                color="#059367"
                hide-details
                inset
                class="attendance-switch"
              ></v-switch>
            </div>
          </v-col>
        </v-row>
      </v-card>
      -->
    </v-container>

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
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, watch } from "vue";
import { authService } from "@/services/authService";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const loading = ref(true);
const updating = ref(false);
const originalEmployeeData = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Local data for form editing
const localData = ref({
  appAccess: false,
  face: false,
  finger: false,
  rfid: false,
});

// Check if there are any changes
const hasChanges = computed(() => {
  if (!originalEmployeeData.value) return false;

  return (
    localData.value.appAccess !==
      originalEmployeeData.value.assignedUser?.appAccess ||
    localData.value.face !== originalEmployeeData.value.face ||
    localData.value.finger !== originalEmployeeData.value.finger ||
    localData.value.rfid !== originalEmployeeData.value.rfid
  );
});

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const syncLocalData = (data) => {
  localData.value = {
    appAccess: data.assignedUser?.appAccess ?? false,
    face: data.face ?? false,
    finger: data.finger ?? false,
    rfid: data.rfid ?? false,
  };
};

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.appAccess",
      "face",
      "finger",
      "rfid",
    ];
    const queryString = `fields[]=${fields.join("&fields[]=")}`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (data.data) {
      originalEmployeeData.value = JSON.parse(JSON.stringify(data.data));
      syncLocalData(data.data);
      emit("update:employeeData", data.data);
    } else {
      throw new Error("No employee data found");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
    showErrorMessage(`Error fetching employee data: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async () => {
  updating.value = true;

  try {
    const token = authService.getToken();

    const body = {
      assignedUser: {
        id: props.employeeData.assignedUser.id,
        appAccess: localData.value.appAccess,
      },
      face: localData.value.face,
      finger: localData.value.finger,
      rfid: localData.value.rfid,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.errors?.[0]?.message || "Failed to update settings");
    }

    showSuccessMessage("Settings updated successfully");
    await fetchEmployeeData();
  } catch (error) {
    showErrorMessage(`Error updating settings: ${error.message}`);
  } finally {
    updating.value = false;
  }
};

const handleCancel = () => {
  if (originalEmployeeData.value) {
    syncLocalData(originalEmployeeData.value);
  }
};

// Watch for external changes to employeeData
watch(
  () => props.employeeData,
  (newData) => {
    if (newData && !updating.value) {
      originalEmployeeData.value = JSON.parse(JSON.stringify(newData));
      syncLocalData(newData);
    }
  },
  { deep: true }
);

onMounted(fetchEmployeeData);
</script>

<style scoped>
.personal-details {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* App Access Switch */
.app-access-switch :deep(.v-switch__track) {
  width: 48px;
  height: 24px;
  border-radius: 12px;
}

.app-access-switch :deep(.v-switch__thumb) {
  width: 20px;
  height: 20px;
}

/* App Access Left Section */
.app-access-left {
  flex-grow: 1;
}

/* Attendance Option Container */
.attendance-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Icon Wrapper - Circular with Green/Red background */
.attendance-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.attendance-icon-wrapper.enabled {
  background-color: #059367;
}

.attendance-icon-wrapper.disabled {
  background-color: #f44336;
}

/* Attendance Switch */
.attendance-switch {
  display: flex;
  justify-content: center;
}

.attendance-switch :deep(.v-switch__track) {
  width: 48px;
  height: 24px;
  border-radius: 12px;
}

.attendance-switch :deep(.v-switch__thumb) {
  width: 20px;
  height: 20px;
}

.attendance-switch :deep(.v-selection-control) {
  min-height: auto;
}

/* Card styling */
.v-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
</style>

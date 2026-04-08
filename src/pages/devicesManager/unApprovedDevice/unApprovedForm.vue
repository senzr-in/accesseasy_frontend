<template>
  <div class="controller-form-container">
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

    <div class="form-header">
      <div class="header-content">
        <v-btn icon variant="text" @click="$emit('cancel')" class="back-button">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h6">
          {{ isEditing ? "Edit Device" : "Add Device" }}
        </h2>
      </div>
      <div class="action-buttons">
        <v-btn color="error" variant="text" @click="$emit('cancel')"
          >CANCEL</v-btn
        >
        <v-btn color="primary" @click="saveController">SAVE</v-btn>
      </div>
    </div>

    <div v-if="!isEditing" class="main-content">
      <div v-if="showDoorWarning" class="info-banner">
        <v-icon
          icon="mdi-information-outline"
          color="info"
          class="me-2"
        ></v-icon>
        <span>
          Controller type {{ formData.controllerType }} can only have
          {{ formData.controllerType }} door(s). Please remove extra selections.
        </span>
      </div>

      <v-form ref="form" v-model="valid" @submit.prevent="saveController">
        <div class="form-fields">
          <!-- First row -->
          <div class="form-row">
            <v-select
              v-model="formData.controllerName"
              :items="['AI face', 'finger print', '4 door device']"
              label="Device Name *"
              required
              variant="outlined"
              density="comfortable"
              :error-messages="getFieldErrorMessage('controllerName')"
              @blur="markFieldAsTouched('controllerName')"
            ></v-select>

            <v-text-field
              v-model="formData.controllerId"
              label="Device ID *"
              required
              variant="outlined"
              density="comfortable"
              :error-messages="getFieldErrorMessage('controllerId')"
              @blur="markFieldAsTouched('controllerId')"
            ></v-text-field>

            <!-- Device Group Dropdown with Search and Add Option -->
            <div class="device-group-container">
              <div class="custom-dropdown">
                <div
                  label="deviceGroup"
                  class="dropdown-trigger"
                  @click="toggleDeviceGroupDropdown"
                  :class="{ 'dropdown-active': showDeviceGroupDropdown }"
                >
                  <span v-if="formData.deviceGroup">{{
                    formData.deviceGroup
                  }}</span>
                  <span v-else class="placeholder">Select device group</span>
                  <v-icon>{{
                    showDeviceGroupDropdown
                      ? "mdi-chevron-up"
                      : "mdi-chevron-down"
                  }}</v-icon>
                </div>

                <div v-if="showDeviceGroupDropdown" class="dropdown-content">
                  <div class="search-container">
                    <input
                      type="text"
                      v-model="deviceGroupSearch"
                      placeholder="Search groups..."
                      @input="filterDeviceGroups"
                      class="search-input"
                    />
                  </div>

                  <div class="dropdown-items">
                    <div
                      v-for="group in filteredDeviceGroups"
                      :key="group"
                      class="dropdown-item"
                      @click="selectDeviceGroup(group)"
                      :class="{ selected: formData.deviceGroup === group }"
                    >
                      {{ group }}
                    </div>

                    <div
                      class="dropdown-item add-new"
                      @click="showAddGroupPopup = true"
                    >
                      <v-icon size="small" class="me-2">mdi-plus</v-icon> Add
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <v-select
              v-if="formData.controllerName !== 'AI face'"
              v-model="formData.assignedDoor"
              :items="doorOptions"
              item-title="doorName"
              item-value="id"
              label="Assigned Door"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
              @update:model-value="handleAssignedDoorUpdate"
            ></v-select>

            <v-select
              v-if="isAdminRole"
              v-model="formData.tenant"
              :items="tenantOptions"
              variant="outlined"
              density="comfortable"
              item-title="name"
              item-value="id"
              label="Tenant"
            ></v-select>
          </div>

          <!-- Second row -->
          <div class="form-row">
            <v-select
              v-if="formData.controllerName !== 'AI face'"
              v-model="formData.controllerType"
              :items="['1', '2', '3', '4']"
              label="Device Type *"
              required
              variant="outlined"
              density="comfortable"
              :error-messages="getFieldErrorMessage('controllerType')"
              @blur="markFieldAsTouched('controllerType')"
            ></v-select>

            <v-select
              v-model="formData.attendanceMode"
              :items="['in', 'out', 'inandout']"
              label="Attendance Mode"
              variant="outlined"
              density="comfortable"
              :error-messages="getFieldErrorMessage('attendanceMode')"
              @blur="markFieldAsTouched('attendanceMode')"
            ></v-select>

            <v-select
              v-model="formData.branch"
              :items="branchOptions"
              variant="outlined"
              density="comfortable"
              item-title="name"
              item-value="id"
              label="Branch"
            ></v-select>
          </div>
        </div>

        <div v-if="formData.controllerName" class="split-section">
          <div class="image-section">
            <div v-if="formData.controllerName" class="device-image">
              <img :src="getImageUrl()" alt="Device Image" />
            </div>
            <div v-else class="device-image-placeholder">
              <v-icon size="48" color="grey-lighten-1">mdi-camera</v-icon>
              <div class="placeholder-text">Select a device to view image</div>
            </div>
          </div>

          <div class="device-details-section">
            <h3 class="details-title">Device Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-icon sn-icon">
                  <v-icon>mdi-barcode</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">SN Number</div>
                  <div class="detail-value">{{ formData.sn }}</div>
                </div>
              </div>

              <div
                class="detail-item"
                v-if="formData.controllerName !== 'AI face'"
              >
                <div class="detail-icon device-type-icon">
                  <v-icon>mdi-devices</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Device Type</div>
                  <div class="detail-value">
                    {{ formData.controllerType }}
                  </div>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon attendance-mode-icon">
                  <v-icon>mdi-clock-check-outline</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Attendance mode</div>
                  <div class="detail-value">
                    {{ formData.attendanceMode }}
                  </div>
                </div>
              </div>

              <div
                class="detail-item"
                v-if="formData.controllerName !== 'AI face'"
              >
                <div class="detail-icon passback-icon">
                  <v-icon>mdi-shield-outline</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Anti Pass-back Mode</div>
                  <div class="detail-value">
                    {{ formData.antiPassbackMode }}
                  </div>
                </div>
              </div>
              <div
                class="detail-item"
                v-if="formData.controllerName !== 'AI face'"
              >
                <div class="detail-icon timer-icon">
                  <v-icon>mdi-timer-outline</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Timer Mode</div>
                  <div class="detail-value">{{ formData.timerMode }}</div>
                </div>
              </div>

              <div
                class="detail-item"
                v-if="formData.controllerName !== 'AI face'"
              >
                <div class="detail-icon door-icon">
                  <v-icon>mdi-door</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Door Mode</div>
                  <div class="detail-value">{{ formData.doorMode }}</div>
                </div>
              </div>
              <div
                class="detail-item"
                v-if="formData.controllerName !== 'AI face'"
              >
                <div class="detail-icon interlock-icon">
                  <v-icon>mdi-lock</v-icon>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Interlock mode</div>
                  <div class="detail-value">{{ formData.interlockMode }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden fields -->
        <div style="display: none">
          <v-file-input
            v-model="formData.controllerImageFile"
            accept="image/*"
            @update:model-value="handleImageChange"
          ></v-file-input>
          <v-text-field v-model="formData.sn"></v-text-field>
          <v-text-field
            v-model="formData.interval"
            type="number"
          ></v-text-field>
          <v-select
            v-model="formData.timerMode"
            :items="timerModeOptions"
          ></v-select>
          <v-select
            v-model="formData.interlockMode"
            :items="interlockModeOptions"
          ></v-select>
        </div>
      </v-form>
    </div>

    <!-- ORIGINAL UI DESIGN FOR EDIT DEVICE -->
    <div v-else class="form-content-wrapper">
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="(tab, index) in tabs"
            :key="index"
            :value="tab"
            :active="currentTab === tab.id"
            @click="currentTab = tab.id"
            :class="{ 'has-error': tabHasError(tab.id) }"
          >
            <template v-slot:prepend>
              <v-icon :color="tabHasError(tab.id) ? 'error' : 'default'">
                {{ tab.icon }}
              </v-icon>
            </template>
            <v-list-item-title>
              {{ tab.title }}
              <v-icon
                v-if="tabHasError(tab.id)"
                color="error"
                size="small"
                class="ms-2"
              >
                mdi-alert-circle
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Main Form Content -->
      <div class="form-content">
        <div v-if="showDoorWarning" class="info-banner">
          <v-icon
            icon="mdi-information-outline"
            color="info"
            class="me-2"
          ></v-icon>
          <span>
            Controller type {{ formData.controllerType }} can only have
            {{ formData.controllerType }} door(s). Please remove extra
            selections.
          </span>
        </div>
        <v-form ref="form" v-model="valid" @submit.prevent="saveController">
          <div v-show="currentTab === 'basic'" class="form-section">
            <v-row>
              <!-- <v-col cols="12" md="6">
                <v-file-input
                  v-model="formData.controllerImageFile"
                  label="Device Image"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="handleImageChange"
                  :error-messages="imageError"
                  :show-size="false"
                ></v-file-input>
              </v-col> -->

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.controllerId"
                  label="Device ID *"
                  required
                  :error-messages="getFieldErrorMessage('controllerId')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('controllerId')"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.controllerName"
                  :items="['AI face', 'finger print', '4 door device']"
                  required
                  :error-messages="getFieldErrorMessage('controllerName')"
                  label="Device Name *"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('controllerName')"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.sn"
                  label="Serial Number"
                  :error-messages="getFieldErrorMessage('sn')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('sn')"
                ></v-text-field>
              </v-col>

              <!-- Device Group Dropdown in Edit Mode -->
              <v-col cols="12" md="6">
                <div class="device-group-container">
                  <div class="custom-dropdown">
                    <div
                      class="dropdown-trigger"
                      @click="toggleDeviceGroupDropdown"
                      :class="{ 'dropdown-active': showDeviceGroupDropdown }"
                    >
                      <span v-if="formData.deviceGroup">{{
                        formData.deviceGroup
                      }}</span>
                      <span v-else class="placeholder"
                        >Select device group</span
                      >
                      <v-icon>{{
                        showDeviceGroupDropdown
                          ? "mdi-chevron-up"
                          : "mdi-chevron-down"
                      }}</v-icon>
                    </div>

                    <div
                      v-if="showDeviceGroupDropdown"
                      class="dropdown-content"
                    >
                      <div class="search-container">
                        <input
                          type="text"
                          v-model="deviceGroupSearch"
                          placeholder="Search groups..."
                          @input="filterDeviceGroups"
                          class="search-input"
                        />
                      </div>

                      <div class="dropdown-items">
                        <div
                          v-for="group in filteredDeviceGroups"
                          :key="group"
                          class="dropdown-item"
                          @click="selectDeviceGroup(group)"
                          :class="{ selected: formData.deviceGroup === group }"
                        >
                          {{ group }}
                        </div>

                        <div
                          class="dropdown-item add-new"
                          @click="showAddGroupPopup = true"
                        >
                          <v-icon size="small" class="me-2">mdi-plus</v-icon>
                          Add
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.controllerType"
                  :items="['1', '2', '3', '4']"
                  label="Device Type *"
                  required
                  :error-messages="getFieldErrorMessage('controllerType')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('controllerType')"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.branch"
                  :items="branchOptions"
                  item-title="name"
                  item-value="id"
                  label="Branch"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6" v-if="isAdminRole">
                <v-select
                  v-model="formData.tenant"
                  :items="tenantOptions"
                  item-title="name"
                  item-value="id"
                  label="Tenant"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </div>

          <div v-show="currentTab === 'modes'" class="form-section">
            <v-row>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.assignedDoor"
                  :items="doorOptions"
                  item-title="doorName"
                  item-value="id"
                  label="Assigned Door"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="
                    (val) => {
                      if (
                        formData.controllerType &&
                        val.length > parseInt(formData.controllerType)
                      ) {
                        showDoorWarning.value = true;
                      } else {
                        showDoorWarning.value = false;
                      }
                    }
                  "
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.doorMode"
                  :items="doorModeOptions"
                  label="Door Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.timerMode"
                  :items="timerModeOptions"
                  label="Timer Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-text-field
                  v-model="formData.interval"
                  label="Interval"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.interlockMode"
                  :items="interlockModeOptions"
                  label="Interlock Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.parkingMode"
                  :items="['Enabled', 'Disabled']"
                  label="Parking Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.attendanceMode"
                  :items="['in', 'out', 'InOut']"
                  label="Attendance Mode"
                  :error-messages="getFieldErrorMessage('attendanceMode')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('attendanceMode')"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.antiPassbackMode"
                  :items="antiPassbackModeOptions"
                  label="Anti-Passback Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </div>
    </div>

    <!-- Add Group Popup -->
    <div
      v-if="showAddGroupPopup"
      class="popup-overlay"
      @click.self="showAddGroupPopup = false"
    >
      <div class="popup-container">
        <div class="popup-header">
          <h3>Add New Device Group</h3>
          <v-icon @click="showAddGroupPopup = false" class="close-icon"
            >mdi-close</v-icon
          >
        </div>
        <div class="popup-content">
          <div class="input-group">
            <label for="newGroupName">Group Name</label>
            <input
              type="text"
              id="newGroupName"
              v-model="newDeviceGroup"
              placeholder="Enter group name"
              ref="newGroupInput"
              @keyup.enter="addNewDeviceGroup"
            />
          </div>
          <div class="popup-actions">
            <button class="cancel-btn" @click="showAddGroupPopup = false">
              Cancel
            </button>
            <button
              class="add-btn"
              @click="addNewDeviceGroup"
              :disabled="!newDeviceGroup.trim()"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
  onUnmounted,
} from "vue";

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  deviceData: {
    type: Object,
    default: () => ({}),
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["save-success", "cancel"]);

const form = ref(null);
const valid = ref(false);
const currentTab = ref("basic");
const imageError = ref("");
const currentImageId = ref(null);
const formSubmitAttempted = ref(false);
const formErrors = ref({});
const touchedFields = ref({});
const showDoorWarning = ref(false);
const existingControllers = ref([]);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const userRole = ref("");
const tenantOptions = ref([]);
const deviceGroups = ref([]);
const filteredDeviceGroups = ref([]);
const deviceGroupSearch = ref("");
const showDeviceGroupDropdown = ref(false);
const newDeviceGroup = ref("");
const newGroupInput = ref(null);

const showAddGroupPopup = ref(false);

const isAdminRole = computed(() => {
  return ["esslAdmin", "Administrator"].includes(userRole.value);
});

const doorOptions = ref([]);
const branchOptions = ref([]);
const statusOptions = ["unApproved", "approved"];
const doorModeOptions = [
  "4Reader-4Switch",
  "6Reader-2Switch",
  "8Reader-0Switch",
];
const timerModeOptions = ["10Seconds", "15Seconds", "20Seconds"];
const interlockModeOptions = [
  "No Interlock",
  "Door 1 & 2",
  "Door 1,2 & 3",
  "Door (1,2)& (3,4)",
  "Door 1,2,3 & 4",
];
const antiPassbackModeOptions = [
  "No anti pass-back mode",
  "Door 1,2",
  "Door 1,2 & 3",
  "Door (1,2) & (3,4)",
  "Door 1,2,3,4",
];

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};
const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const tabs = [
  { id: "basic", title: "Basic Info", icon: "mdi-information" },
  { id: "modes", title: "Device Modes", icon: "mdi-door" },
];

const tabRequiredFields = {
  basic: ["controllerId", "controllerName", "controllerType"],
  modes: ["attendanceMode"],
};

const formData = reactive({
  controllerImage: null,
  controllerImageFile: null,
  controllerId: "",
  controllerName: "",
  controllerIP: "",
  serverIp: "",
  sn: "",
  controllerType: "",
  status: "",
  assignedDoor: [],
  doorMode: "4Reader-4Switch",
  timerMode: "10Seconds",
  interlockMode: "No Interlock",
  interval: "60",
  parkingMode: "Disabled",
  attendanceMode: "in and out",
  antiPassbackMode: "No anti pass-back mode",
  controllerStatus: "",
  branch: "",
  tenant: "",
  deviceGroup: "",
});

const validateNumberInput = (event) => {
  const keyCode = event.keyCode ? event.keyCode : event.which;
  if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
    event.preventDefault();
  }
};

const formatIPAddress = (field) => {
  let value = formData[field].replace(/[^\d]/g, "");
  let formattedIP = "";
  for (let i = 0; i < value.length && i < 12; i++) {
    if (i > 0 && i % 3 === 0) {
      formattedIP += ".";
    }
    formattedIP += value[i];
  }

  formData[field] = formattedIP;
};

function validateFormData(formData) {
  function isValidIP(ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }

    const octets = ip.split(".");
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  if (!/^[A-Za-z0-9-_]+$/.test(formData.controllerId)) {
    throw new Error(
      "Controller ID can only contain letters, numbers, hyphens and underscores",
    );
  }

  return true;
}

const getDoorValidationMessage = computed(() => {
  if (!formData.controllerType || !formData.assignedDoor.length) return "";

  const maxDoors = parseInt(formData.controllerType);
  const selectedDoors = formData.assignedDoor.length;

  if (selectedDoors > maxDoors) {
    return `Controller type ${maxDoors} can only have ${maxDoors} door(s). Please remove extra selections.`;
  }
  return "";
});

const validateDoorCount = () => {
  if (!formData.controllerType) return true;

  const maxDoors = parseInt(formData.controllerType);
  return formData.assignedDoor.length <= maxDoors;
};

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value) return false;
  const requiredFields = tabRequiredFields[tabId];

  if (tabId === "modes" && formData.controllerName !== "AI face") {
    return requiredFields
      .filter((field) => field !== "attendanceMode")
      .some((field) => !formData[field]);
  }
  return requiredFields.some((field) => !formData[field]);
};

const isAttendanceModeRequired = () => {
  return formData.controllerName === "AI face";
};
const getFieldErrorMessage = (field) => {
  if (field === "attendanceMode") {
    if (
      isAttendanceModeRequired() &&
      !formData[field] &&
      touchedFields.value[field]
    ) {
      return "This field is required for AI face devices";
    }
    return "";
  }

  if (formData[field]) {
    formErrors.value[field] = "";
    return "";
  }
  if (formErrors.value[field] && touchedFields.value[field]) {
    return formErrors.value[field];
  }
  return "";
};

const markFieldAsTouched = (field) => {
  touchedFields.value[field] = true;
  if (!formData[field] && tabRequiredFields[currentTab.value].includes(field)) {
    formErrors.value[field] = "This field is required";
  }
};

async function handleImageChange(file) {
  try {
    if (file) {
      if (currentImageId.value) {
        await deleteImage(currentImageId.value);
      }
      const fileId = await handleImageUpload(file);
      currentImageId.value = fileId;
      formData.controllerImage = fileId;
      imageError.value = "";
    } else {
      if (currentImageId.value) {
        await deleteImage(currentImageId.value);
        currentImageId.value = null;
        formData.controllerImage = null;
      }
    }
  } catch (error) {
    imageError.value = "Failed to process image. Please try again.";
    console.error("Image handling error:", error);
  }
}

async function handleImageUpload(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authService.getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to upload image");

  const data = await response.json();
  return data.data.id;
}

async function deleteImage(fileId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/files/${fileId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    },
  );

  if (!response.ok) throw new Error("Failed to delete image");
  return true;
}

async function fetchUserRole() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/me?fields=role.name`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch user role");

    const data = await response.json();
    userRole.value = data.data?.role?.name || "";
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
}

async function fetchTenants() {
  if (!isAdminRole.value) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch tenants");

    const data = await response.json();
    tenantOptions.value = data.data.map((tenant) => ({
      id: tenant.tenantId,
      name: tenant.tenantName,
    }));
  } catch (error) {
    console.error("Error fetching tenants:", error);
  }
}

// Device group functions
const toggleDeviceGroupDropdown = () => {
  showDeviceGroupDropdown.value = !showDeviceGroupDropdown.value;
  if (showDeviceGroupDropdown.value) {
    fetchDeviceGroups();
  }
};

const fetchDeviceGroups = async () => {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=deviceGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch device groups");
    }

    const data = await response.json();

    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.deviceGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];

    deviceGroups.value = uniqueGroups;
    filteredDeviceGroups.value = uniqueGroups;
  } catch (error) {
    console.error("Error fetching device groups:", error);
    showErrorMessage("Failed to load device groups");
  }
};

const filterDeviceGroups = () => {
  if (!deviceGroupSearch.value) {
    filteredDeviceGroups.value = deviceGroups.value;
  } else {
    filteredDeviceGroups.value = deviceGroups.value.filter((group) =>
      group.toLowerCase().includes(deviceGroupSearch.value.toLowerCase()),
    );
  }
};

const selectDeviceGroup = (group) => {
  formData.deviceGroup = group;
  showDeviceGroupDropdown.value = false;
  showAddGroupPopup.value = false;
};

const showAddNewGroupInput = () => {
  showAddGroupPopup.value = true;
  newDeviceGroup.value = "";
  nextTick(() => {
    if (newGroupInput.value) {
      newGroupInput.value.focus();
    }
  });
};

const addNewDeviceGroup = async () => {
  if (!newDeviceGroup.value.trim()) {
    return;
  }
  try {
    const newGroup = newDeviceGroup.value.trim();

    deviceGroups.value.push(newGroup);
    filteredDeviceGroups.value = deviceGroups.value;

    formData.deviceGroup = newGroup;

    showAddGroupPopup.value = false;
    showDeviceGroupDropdown.value = false;
    newDeviceGroup.value = "";

    showSuccessMessage("Device group added successfully!");
  } catch (error) {
    console.error("Error creating device group:", error);
    showErrorMessage(error.message || "Failed to create device group");
  }
};

async function saveController() {
  if (props.isEditing) {
    await editController();
  } else {
    await createNewController();
  }
}

async function createNewController() {
  formSubmitAttempted.value = true;
  const mandatoryFields = ["controllerId", "controllerName"];

  if (formData.controllerName !== "AI face") {
    mandatoryFields.push("controllerType");
  }

  if (isAttendanceModeRequired()) {
    mandatoryFields.push("attendanceMode");
  }

  let hasErrors = false;
  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  if (hasErrors) {
    showErrorMessage("Please fill in all required fields");
    return;
  }

  try {
    validateFormData(formData);
  } catch (error) {
    showErrorMessage(error.message);
    return;
  }

  try {
    const resolvedTenantId =
      isAdminRole.value && formData.tenant
        ? formData.tenant
        : await resolveTenantId();

    let status;
    if (formData.controllerName === "AI face") {
      status = "approved";
    } else {
      status = formData.assignedDoor.length > 0 ? "approved" : "unapproved";
    }

    const payload = {
      id: formData.controllerId,
      controllerName: formData.controllerName,
      controllerIP: formData.controllerIP,
      serverIp: formData.serverIp,
      sn: formData.sn,
      status: status,
      controllerImage: currentImageId.value,
      controllerStatus: "waiting",
      tenant: resolvedTenantId,
      branch: formData.branch || null,
      deviceGroup: formData.deviceGroup || null,
    };

    if (formData.controllerName === "AI face") {
      payload.attendanceMode = formData.attendanceMode || null;
      payload.controllerType = "1";
    } else {
      payload.controllerType = formData.controllerType;
      payload.doorMode = formData.doorMode || null;
      payload.timerMode = formData.timerMode || null;
      payload.interlockMode = formData.interlockMode || null;
      payload.interval = formData.interval || null;
      payload.parkingMode = formData.parkingMode || "Disabled";
      payload.attendanceMode = formData.attendanceMode || null;
      payload.antiPassbackMode = formData.antiPassbackMode || null;

      if (formData.assignedDoor.length > 0) {
        payload.assignedDoor = {
          create: formData.assignedDoor.map((doorId) => ({
            doors_id: { id: doorId },
          })),
        };
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to create controller",
      );
    }

    showSuccessMessage("Device added successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error creating controller:", error);
    showErrorMessage(
      error.message || "Failed to create controller. Please try again.",
    );
  }
}

async function editController() {
  formSubmitAttempted.value = true;
  const mandatoryFields = ["controllerId", "controllerName"];

  if (formData.controllerName !== "AI face") {
    mandatoryFields.push("controllerType");
  }

  if (isAttendanceModeRequired()) {
    mandatoryFields.push("attendanceMode");
  }

  let hasErrors = false;
  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  if (hasErrors) {
    showErrorMessage("Please fill in all required fields");
    return;
  }

  try {
    validateFormData(formData);
  } catch (error) {
    showErrorMessage(error.message);
    return;
  }

  try {
    let status;
    if (formData.controllerName === "AI face") {
      status = "approved";
    } else {
      status = formData.assignedDoor.length > 0 ? "approved" : "unapproved";
    }

    const payload = {
      controllerName: formData.controllerName,
      controllerIP: formData.controllerIP,
      serverIp: formData.serverIp,
      status: status,
      deviceGroup: formData.deviceGroup || null,
    };

    if (formData.controllerName === "AI face") {
      payload.attendanceMode = formData.attendanceMode || null;
      payload.controllerType = "1";
    } else {
      payload.controllerType = formData.controllerType;
      payload.doorMode = formData.doorMode || null;
      payload.timerMode = formData.timerMode || null;
      payload.interlockMode = formData.interlockMode || null;
      payload.interval = formData.interval || null;
      payload.parkingMode = formData.parkingMode || "Disabled";
      payload.attendanceMode = formData.attendanceMode || null;
      payload.antiPassbackMode = formData.antiPassbackMode || null;
    }

    if (formData.branch) {
      payload.branch = { id: formData.branch };
    }

    if (isAdminRole.value && formData.tenant) {
      payload.tenant = formData.tenant;
    }

    if (currentImageId.value !== props.deviceData?.controllerImage?.id) {
      payload.controllerImage = currentImageId.value;
    }

    if (
      formData.controllerName !== "AI face" &&
      !arraysEqual(
        formData.assignedDoor,
        props.deviceData?.assignedDoor?.map((d) => d.doors_id.id) || [],
      )
    ) {
      payload.assignedDoor = {
        create: formData.assignedDoor.map((doorId) => ({
          doors_id: { id: doorId },
        })),
        delete: props.deviceData?.assignedDoor?.map((d) => d.id) || [],
        update: [],
      };
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers/${
        props.deviceData?.id
      }`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update controller",
      );
    }

    showSuccessMessage("Controller updated successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error updating controller:", error);
    showErrorMessage(
      error.message || "Failed to update controller. Please try again.",
    );
  }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

async function resolveTenantId() {
  if (props.tenantId instanceof Promise) {
    return await props.tenantId;
  }
  return props.tenantId;
}

async function fetchExistingControllers() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=id,assignedDoor.doors_id.id`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    existingControllers.value = data.data;
  } catch (error) {
    console.error("Error fetching existing controllers:", error);
  }
}

async function fetchDoors() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();

    let availableDoors = data.data.map((door) => ({
      id: door.id,
      doorName: door.doorName,
    }));

    if (existingControllers.value.length > 0) {
      availableDoors = availableDoors.filter((door) => {
        if (props.isEditing && props.deviceData) {
          const currentControllerDoors =
            props.deviceData.assignedDoor?.map((d) => d.doors_id?.id) || [];
          if (currentControllerDoors.includes(door.id)) {
            return true;
          }
        }

        const isDoorAssigned = existingControllers.value.some((controller) => {
          if (props.isEditing && controller.id === props.deviceData?.id) {
            return false;
          }
          return (
            controller.assignedDoor?.some((d) => d?.doors_id?.id === door.id) ||
            false
          );
        });

        return !isDoorAssigned;
      });
    }

    doorOptions.value = availableDoors;
  } catch (error) {
    console.error("Error fetching doors:", error);
  }
}

async function fetchBranches() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    branchOptions.value = data.data.map((branch) => ({
      id: branch.id,
      name: branch.branchName,
    }));
  } catch (error) {
    console.error("Error fetching branches:", error);
  }
}

const handleAssignedDoorUpdate = (val) => {
  if (
    formData.controllerType &&
    val.length > parseInt(formData.controllerType)
  ) {
    showDoorWarning.value = true;
  } else {
    showDoorWarning.value = false;
  }
};

watch(
  () => props.deviceData,
  (newVal) => {
    if (props.isEditing && newVal) {
      try {
        Object.keys(formData).forEach((key) => {
          formData[key] = "";
        });

        formData.controllerId = newVal.id || "";
        formData.controllerName = newVal.controllerName || "";
        formData.controllerIP = newVal.controllerIP || "";
        formData.serverIp = newVal.serverIp || "";
        formData.sn = newVal.sn || "";
        formData.controllerType = newVal.controllerType || "";
        formData.status = newVal.status || "unApproved";
        formData.doorMode = newVal.doorMode || "4Reader-4Switch";
        formData.timerMode = newVal.timerMode || "10Seconds";
        formData.interlockMode = newVal.interlockMode || "No Interlock";
        formData.interval = newVal.interval || "60";
        formData.parkingMode = newVal.parkingMode || "Disabled";
        formData.attendanceMode = newVal.attendanceMode || "in";
        formData.antiPassbackMode =
          newVal.antiPassbackMode || "No anti pass-back mode";
        formData.deviceGroup = newVal.deviceGroup || "";

        if (newVal?.controllerImage?.id) {
          currentImageId.value = newVal.controllerImage.id;
          formData.controllerImage = newVal.controllerImage.id;
        }

        if (newVal?.assignedDoor) {
          formData.assignedDoor = newVal.assignedDoor
            .map((door) => door.doors_id?.id)
            .filter((id) => id);
        }

        if (newVal?.branch?.id) {
          formData.branch = newVal.branch.id;
        }

        if (newVal?.tenant?.tenantId) {
          formData.tenant = newVal.tenant.tenantId;
        }
      } catch (error) {
        console.error("Error populating form data:", error);
        showErrorMessage("Error loading controller data. Please try again.");
      }
    }
  },
  { immediate: true, deep: true },
);

watch(
  formData,
  (newVal, oldVal) => {
    Object.keys(newVal).forEach((field) => {
      if (newVal[field] && formErrors.value[field]) {
        formErrors.value[field] = "";
      }
    });
  },
  { deep: true },
);

watch(currentTab, (newTab, oldTab) => {
  if (oldTab) {
    const mandatoryFields = tabRequiredFields[oldTab];
    mandatoryFields.forEach((field) => {
      if (!formData[field]) {
        touchedFields.value[field] = true;
        formErrors.value[field] = "This field is required";
      }
    });
  }
});

watch(
  () => formData.controllerIP,
  (newValue) => {
    if (newValue) {
      formData.controllerIP = newValue.replace(/[^\d.]/g, "");
    }
  },
);

watch(
  () => formData.serverIp,
  (newValue) => {
    if (newValue) {
      formData.serverIp = newValue.replace(/[^\d.]/g, "");
    }
  },
);
watch(
  () => formData.controllerId,
  (newValue) => {
    formData.sn = newValue;
  },
);

watch(
  () => formData.controllerName,
  async (newValue) => {
    if (newValue === "AI face") {
      formData.controllerType = "1";
      await uploadImageForController("AI face");
    } else if (newValue === "finger print") {
      formData.controllerType = "4";
      await uploadImageForController("finger print");
    } else if (newValue === "4 door device") {
      formData.controllerType = "4";
      await uploadImageForController("4 door device");
    }
  },
);

watch(
  () => formData.controllerType,
  (newValue) => {
    if (newValue && formData.assignedDoor.length > parseInt(newValue)) {
      formData.assignedDoor = formData.assignedDoor.slice(
        0,
        parseInt(newValue),
      );
    }
  },
);
watch(
  () => formData.controllerId,
  (newValue) => {
    formData.sn = newValue;
  },
);
watch(
  () => formData.assignedDoor,
  (newValue) => {
    if (
      formData.controllerType &&
      newValue.length > parseInt(formData.controllerType)
    ) {
      showDoorWarning.value = true;
    } else {
      showDoorWarning.value = false;
    }
  },
);
function getDefaultImagePath(controllerName) {
  switch (controllerName) {
    case "AI face":
      return "/deviceImages/Aiface.jpg";
    case "finger print":
      return "/deviceImages/FingerPrint.jpg";
    case "4 door device":
      return "/deviceImages/DoorDevice.jpg";
    default:
      return null;
  }
}

const getImageUrl = () => {
  if (currentImageId.value) {
    return `${import.meta.env.VITE_API_URL}/assets/${currentImageId.value}?access_token=${authService.getToken()}`;
  } else if (formData.controllerName) {
    return getDefaultImagePath(formData.controllerName);
  }
  return null;
};
async function uploadImageForController(controllerName) {
  try {
    const imagePath = getDefaultImagePath(controllerName);
    const response = await fetch(imagePath);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const fileName = `${controllerName.replace(/\s+/g, "_")}.jpg`;
    const file = new File([blob], fileName, { type: "image/jpeg" });

    const fileId = await handleImageUpload(file);
    currentImageId.value = fileId;
    formData.controllerImage = fileId;
  } catch (error) {
    console.error("Error uploading controller image:", error);
    imageError.value = "Failed to upload image for controller";
  }
}

const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll(".custom-dropdown");
  let clickedOutside = true;

  dropdowns.forEach((dropdown) => {
    if (dropdown.contains(event.target)) {
      clickedOutside = false;
    }
  });

  if (clickedOutside && showDeviceGroupDropdown.value) {
    showDeviceGroupDropdown.value = false;
  }
};

onMounted(async () => {
  await fetchUserRole();
  await fetchTenants();
  await fetchExistingControllers();
  await fetchDoors();
  await fetchBranches();

  document.addEventListener("click", handleClickOutside);

  fetchDeviceGroups();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.controller-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}

.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Original UI Styles */
.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.form-section {
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.has-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-list-item--active) {
  background-color: #eee;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

/* New UI Styles */
.main-content {
  padding: 20px;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  max-width: 1200px;
}

.image-panel {
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  width: 100%;
  aspect-ratio: 1;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-image {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.device-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.device-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4169e1, #7b68ee);
  border-radius: 8px;
  color: white;
  text-align: center;
  padding: 20px;
}
.placeholder-text {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 500;
}
.form-panel {
  padding: 16px;
  margin-top: 16px;
}
.form-fields {
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row > * {
  flex: 1 1 calc(25% - 15px);
  min-width: 200px;
  max-width: calc(25% - 15px);
}

.form-group {
  max-width: 300px;
}

.split-section {
  display: flex;
  gap: 30px;
}

.image-section {
  flex: 1;
  max-width: 300px;
}
.device-details-section {
  flex: 2;
}

.details-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.detail-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.sn-icon {
  background-color: #e3f2fd;
  color: #2196f3;
}
.device-type-icon {
  background-color: #e3f2fd;
  color: #2196f3;
}

.attendance-mode-icon {
  background-color: #e8f5e9;
  color: #4caf50;
}

.passback-icon {
  background-color: #fff3e0;
  color: #ff9800;
}
.timer-icon {
  background-color: #fff3e0;
  color: blue;
}
.door-icon {
  background-color: #fff3e0;
  color: green;
}
.parking-icon {
  background-color: #f3e5f5;
  color: #9c27b0;
}
.interval-icon {
  background-color: #fff3e0;
  color: #ff9800;
}

.interlock-icon {
  background-color: #ede7f6;
  color: #673ab7;
}
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.875rem;
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

.info-banner {
  background-color: rgb(231, 242, 252);
  color: rgb(13, 60, 97);
  padding: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-radius: 4px;
  width: 100%;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  animation:
    fadeIn 0.3s ease-in-out,
    fadeOut 0.3s ease-in-out 2.7s;
  order: -1;
}
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  animation:
    fadeIn 0.3s ease-in-out,
    fadeOut 0.3s ease-in-out 2.7s;
  order: -1;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .form-row > * {
    flex: 1 1 calc(33.33% - 13.33px);
    max-width: calc(33.33% - 13.33px);
  }
}

@media (max-width: 900px) {
  .form-row > * {
    flex: 1 1 calc(50% - 10px);
    max-width: calc(50% - 10px);
  }
}

@media (max-width: 600px) {
  .form-row > * {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .image-panel {
    max-height: 300px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
  .split-section {
    flex-direction: column;
  }

  .image-section {
    max-width: 100%;
  }
}

/* Device group dropdown styles */
.device-group-container {
  position: relative;
  width: 100%;
}

.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-height: 40px;
}

.dropdown-active {
  border-color: #2196f3;
}

.placeholder {
  color: #999;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
  margin-top: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-container {
  padding: 8px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dropdown-items {
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.selected {
  background-color: #e3f2fd;
  color: #2196f3;
}

.dropdown-item.add-new {
  display: flex;
  align-items: center;
  color: #2196f3;
  border-top: 1px solid #eee;
  margin-top: 8px;
}

/* Popup styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-container {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-icon {
  cursor: pointer;
  color: #666;
}

.popup-content {
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

/* Fix for v-label to match Vuetify styling */
.v-label {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  margin-bottom: 4px;
  display: block;
}
</style>

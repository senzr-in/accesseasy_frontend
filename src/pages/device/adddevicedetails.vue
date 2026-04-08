<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col cols="6">
        <h2 class="text-h5 font-weight-bold">
          {{ props.editingDevice ? "Edit Device" : "Create Device" }}
        </h2>
      </v-col>
      <v-col class="d-flex justify-end">
        <BaseButton
          variant="ghost"
          text="Cancel"
          @click="handleCancel"
          class="mr-2"
        ></BaseButton>
        <BaseButton
          variant="primary"
          :text="props.editingDevice ? 'Update' : 'Save'"
          :loading="isSaving"
          @click="handleSave"
        ></BaseButton>
      </v-col>
    </v-row>

    <!--  DEVICE DETAILS  -->
    <v-card class="mb-8">
      <v-card-title>Device Details</v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSave">
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="form.controllerName"
                label="Device Type"
                :items="deviceTypes"
                item-title="label"
                item-value="value"
                variant="outlined"
                :rules="[(v) => !!v || 'Device type is required']"
                required
                @update:model-value="handleDeviceTypeChange"
              ></v-select>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.deviceName"
                label="Device Name"
                variant="outlined"
                :rules="[(v) => !!v || 'Device name is required']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.serialNumber"
                label="Serial Number"
                required
                variant="outlined"
                :rules="[(v) => !!v || 'Serial number is required']"
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="form.branch"
                label="Branch"
                :items="props.branches"
                item-title="locdetail.locationName"
                item-value="id"
                variant="outlined"
                :loading="loadingBranches"
              ></v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!--  DOOR CONFIGURATION  -->
    <v-card>
      <v-card-title>Door Configuration</v-card-title>
      <v-card-text>
        <div v-if="!form.controllerName" class="text-center text-grey py-8">
          <v-icon size="64" color="grey lighten-1" class="mb-4">
            mdi-devices
          </v-icon>
          <div>Please select a device type first</div>
          <div class="text-caption">
            Fill the Device Details section above to configure doors
          </div>
        </div>

        <div v-else>
          <v-row>
            <v-col
              v-for="doorTab in doorTabs"
              :key="doorTab.value"
              cols="12"
              class="mb-4"
            >
              <v-card outlined class="door-card h-100" elevation="0">
                <v-card-title class="bg-grey-lighten-3 pa-4">
                  {{ doorTab.label.toLowerCase() }} Configuration
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-form @submit.prevent="saveDoor(doorTab.value)">
                    <!-- First Row -->
                    <v-row>
                      <v-col cols="4">
                        <v-card outlined elevation="0" class="h-100">
                          <v-card-text>
                            <div class="mb-2 font-weight-medium">
                              Select Door
                            </div>
                            <v-select
                              v-model="form.doors[doorTab.value].selectedDoor"
                              :items="getAvailableDoorsForTab(doorTab.value)"
                              item-title="doorName"
                              item-value="id"
                              variant="outlined"
                              clearable
                              hide-details
                              @update:model-value="
                                onDoorSelectionChange(doorTab.value)
                              "
                            ></v-select>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <v-col cols="4">
                        <v-card outlined elevation="0" class="h-100">
                          <v-card-text class="pa-4">
                            <div
                              class="mb-2 font-weight-medium d-flex align-center"
                            >
                              Door open duration
                              <v-tooltip location="top">
                                <template
                                  v-slot:activator="{ props: tooltipProps }"
                                >
                                  <v-icon
                                    v-bind="tooltipProps"
                                    size="small"
                                    color="grey"
                                    class="ml-1"
                                  >
                                    mdi-information
                                  </v-icon>
                                </template>
                                <span class="custom-tooltip"
                                  >The number of seconds the door should remain
                                  open.</span
                                >
                              </v-tooltip>
                            </div>
                            <v-text-field
                              v-model.number="
                                form.doors[doorTab.value].dotlDuration
                              "
                              label="Duration (seconds)"
                              type="number"
                              variant="outlined"
                              hide-details
                              min="0"
                              @input="
                                validatePositiveNumber(
                                  doorTab.value,
                                  'dotlDuration'
                                )
                              "
                            ></v-text-field>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <v-col cols="4">
                        <v-card outlined elevation="0" class="h-100">
                          <v-card-text class="pa-4">
                            <div
                              class="mb-2 font-weight-medium d-flex align-center"
                            >
                              DOTL Alarm Delay
                              <v-tooltip location="top">
                                <template
                                  v-slot:activator="{ props: tooltipProps }"
                                >
                                  <v-icon
                                    v-bind="tooltipProps"
                                    size="small"
                                    color="grey"
                                    class="ml-1"
                                  >
                                    mdi-information
                                  </v-icon>
                                </template>
                                <span class="custom-tooltip"
                                  >The delay (in seconds) after the door open
                                  duration ends before the alarm sounds.</span
                                >
                              </v-tooltip>
                            </div>
                            <v-row align="center">
                              <v-col cols="7">
                                <v-text-field
                                  v-model.number="
                                    form.doors[doorTab.value].dotlDelay
                                  "
                                  label="Delay (seconds)"
                                  type="number"
                                  variant="outlined"
                                  hide-details
                                  min="0"
                                  :disabled="
                                    !form.doors[doorTab.value].alarmEnabled
                                  "
                                  @input="
                                    validatePositiveNumber(
                                      doorTab.value,
                                      'dotlDelay'
                                    )
                                  "
                                ></v-text-field>
                              </v-col>
                              <v-col cols="5" class="text-right">
                                <v-switch
                                  v-model="
                                    form.doors[doorTab.value].alarmEnabled
                                  "
                                  label="Alarm"
                                  color="primary"
                                  inset
                                  hide-details
                                  @update:model-value="
                                    onAlarmToggle(doorTab.value)
                                  "
                                ></v-switch>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <!-- Second Row -->
                    <v-row class="mb-14">
                      <!-- <v-col cols="4">
                        <v-card outlined elevation="0" class="h-100">
                          <v-card-text class="pa-4">
                            <v-row align="center">
                              <v-col cols="8">
                                <div class="font-weight-medium">
                                  Unauthorize when the door is open
                                </div>
                              </v-col>
                              <v-col cols="4" class="text-right">
                                <v-switch
                                  v-model="
                                    form.doors[doorTab.value].sensorStatus
                                  "
                                  color="primary"
                                  inset
                                  hide-details
                                ></v-switch>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col> -->

                      <!-- Updated auto door open schedule -->
                      <v-col cols="8">
                        <v-card outlined elevation="0" class="h-100">
                          <v-card-text class="pa-4">
                            <v-row
                              align="center"
                              class="flex-nowrap"
                              no-gutters
                            >
                              <v-col cols="5" class="d-flex align-center">
                                <span
                                  class="font-weight-medium d-flex align-center"
                                >
                                  Auto door open schedule (passive Mode)
                                  <v-tooltip location="top">
                                    <template
                                      v-slot:activator="{ props: tooltipProps }"
                                    >
                                      <v-icon
                                        v-bind="tooltipProps"
                                        size="small"
                                        color="grey"
                                        class="ml-1"
                                      >
                                        mdi-information
                                      </v-icon>
                                    </template>
                                    <span class="custom-tooltip"
                                      >When enabled, the door stays open 24
                                      hours or as per the selected time zone
                                      schedule.</span
                                    >
                                  </v-tooltip>
                                </span>
                              </v-col>

                              <v-col cols="2" class="text-right">
                                <v-switch
                                  v-model="
                                    form.doors[doorTab.value].passageStatus
                                  "
                                  color="primary"
                                  inset
                                  hide-details
                                  @update:model-value="
                                    onPassageStatusChange(doorTab.value)
                                  "
                                ></v-switch>
                              </v-col>

                              <v-col
                                v-if="form.doors[doorTab.value].passageStatus"
                                cols="5"
                                class="d-flex align-center justify-end"
                                style="gap: 8px"
                              >
                                <v-select
                                  v-model="
                                    form.doors[doorTab.value].scheduleTime
                                  "
                                  :items="timeSlots"
                                  item-title="displayText"
                                  item-value="id"
                                  variant="outlined"
                                  density="compact"
                                  clearable
                                  hide-details
                                  class="timezone-select"
                                ></v-select>

                                <BaseButton
                                  variant="primary"
                                  text="Create Time Zone"
                                  @click="createTimeZone"
                                  size="small"
                                ></BaseButton>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.type" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  defineProps,
  defineEmits,
  computed,
  watch,
} from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";
import { useRouter } from "vue-router";

const props = defineProps({
  tenantId: String,
  branches: Array,
  availableDoors: Array,
  editingDevice: Object,
});

const emit = defineEmits(["save-success", "cancel"]);

const activeTab = ref("basic");
const isSaving = ref(false);
const formRef = ref(null);
const snackbar = ref({ show: false, message: "", type: "success" });
const loadingBranches = ref(false);
const loadingTimeSlots = ref(false);
const timeSlots = ref([]);
const router = useRouter();

// Device type options
const deviceTypes = [
  { label: "2 Door Device", value: "2 Door Device" },
  { label: "4 Door Device", value: "4 Door Device" },
  { label: "Finger Print", value: "Finger Print" },
  { label: "AI", value: "AI" },
];
const createTimeZone = () => {
  router.push("/configuration/timerzone-configuration");
};

// Dynamic door tabs based on device type - labels changed to lowercase
const doorTabs = computed(() => {
  if (form.controllerName === "2 Door Device") {
    return [
      { label: "door1", value: "door1" },
      { label: "door2", value: "door2" },
    ];
  } else if (form.controllerName === "4 Door Device") {
    return [
      { label: "door1", value: "door1" },
      { label: "door2", value: "door2" },
      { label: "door3", value: "door3" },
      { label: "door4", value: "door4" },
    ];
  } else if (
    form.controllerName === "Finger Print" ||
    form.controllerName === "AI"
  ) {
    return [{ label: "door1", value: "door1" }];
  }
  return [];
});

// Get assigned door IDs across all tabs
const allAssignedDoorIds = computed(() => {
  const assigned = new Set();

  // Add doors already assigned to other devices from props
  if (props.availableDoors) {
    props.availableDoors.forEach((door) => {
      // Assuming doors that have deviceId in doorsConfigure are already assigned
      if (door.doorsConfigure && door.doorsConfigure.deviceId) {
        assigned.add(door.id);
      }
    });
  }

  // Add doors currently being selected in this form
  Object.values(form.doors).forEach((door) => {
    if (door.selectedDoor) {
      assigned.add(door.selectedDoor);
    }
  });

  return assigned;
});

// Get available doors for a specific tab (excluding already assigned doors in other tabs)
const getAvailableDoorsForTab = (currentTab) => {
  // Combine all available doors from props and editing device
  const allDoors = [
    ...(props.availableDoors || []),
    ...(props.editingDevice?.allAvailableDoors || []),
  ];

  if (allDoors.length === 0) return [];

  const currentTabSelectedDoor = form.doors[currentTab]?.selectedDoor;

  return allDoors.filter((door) => {
    // Always include the door currently selected in this tab
    if (door.id === currentTabSelectedDoor) {
      return true;
    }

    // Check if door is assigned to any OTHER tab in the current form
    const isAssignedToOtherTab = Object.entries(form.doors).some(
      ([tabKey, doorConfig]) => {
        return tabKey !== currentTab && doorConfig.selectedDoor === door.id;
      }
    );

    // For editing scenario, allow doors that are already assigned to this device
    const isAssignedToThisDevice = props.editingDevice?.selectedDoors?.includes(
      door.id
    );

    // Check if door is assigned to other devices (excluding current device)
    const isAssignedToOtherDevice =
      door.doorsConfigure &&
      door.doorsConfigure.deviceId &&
      door.doorsConfigure.deviceId !== (props.editingDevice?.id || "");

    return (
      !isAssignedToOtherTab &&
      (!isAssignedToOtherDevice || isAssignedToThisDevice)
    );
  });
};

// Get selected doors count
const selectedDoorsCount = computed(() => {
  return Object.values(form.doors).filter((door) => door.selectedDoor).length;
});

// Initialize form with empty values
const form = reactive({
  controllerName: "",
  deviceName: "",
  serialNumber: "",
  branch: "",
  connectionStatus: "Disconnected",
  controllerStatus: "Waiting",
  doors: {
    door1: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "limittime",
      scheduleTime: null,
    },
    door2: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "limittime",
      scheduleTime: null,
    },
    door3: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "limittime",
      scheduleTime: null,
    },
    door4: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "limittime",
      scheduleTime: null,
    },
  },
});

// Watch for tenant changes to load time slots
watch(
  () => props.tenantId,
  (newTenantId) => {
    if (newTenantId) {
      loadTimeSlots();
    }
  }
);

// Handle device type change
const handleDeviceTypeChange = (newDeviceType) => {
  // Reset door configurations when device type changes
  resetDoorConfigurations(newDeviceType);
};

// Reset door configurations based on device type
const resetDoorConfigurations = (deviceType) => {
  const defaultDoorConfig = {
    selectedDoor: "",
    dotlDuration: "",
    sensorStatus: false,
    dotlDelay: "",
    alarmEnabled: false,
    passageStatus: false,
    passageMode: "limittime",
    scheduleTime: null,
  };

  Object.keys(form.doors).forEach((key) => {
    // Only reset doors that are applicable for the current device type
    if (deviceType === "2 Door Device") {
      // For 2 Door Device, only door1 and door2 are applicable
      if (key === "door1" || key === "door2") {
        form.doors[key] = { ...defaultDoorConfig };
      } else {
        // Clear other doors completely
        form.doors[key] = { ...defaultDoorConfig };
        form.doors[key].selectedDoor = ""; // Ensure no door is selected
      }
    } else if (deviceType === "4 Door Device") {
      // All doors are applicable for 4 Door Device
      form.doors[key] = { ...defaultDoorConfig };
    } else if (deviceType === "Finger Print" || deviceType === "AI") {
      // Only door1 is applicable for Finger Print and AI
      if (key === "door1") {
        form.doors[key] = { ...defaultDoorConfig };
      } else {
        // Clear other doors completely
        form.doors[key] = { ...defaultDoorConfig };
        form.doors[key].selectedDoor = ""; // Ensure no door is selected
      }
    } else {
      // For no device type selected or other cases, clear all
      form.doors[key] = { ...defaultDoorConfig };
      form.doors[key].selectedDoor = ""; // Ensure no door is selected
    }
  });
};

// Load time slots from API
const loadTimeSlots = async () => {
  if (!props.tenantId) {
    console.warn("No tenant ID available for loading time slots");
    return;
  }

  loadingTimeSlots.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/time?filter[_and][0][_and][0][tenant][tenantId][_eq]=${props.tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load time slots: ${response.statusText}`);
    }

    const data = await response.json();
    timeSlots.value = data.data.map((slot) => ({
      id: slot.id,
      displayText: `${slot.timeZoneName} (${slot.entryTime} - ${slot.exitTime})`,
      timeZoneName: slot.timeZoneName,
      entryTime: slot.entryTime,
      exitTime: slot.exitTime,
      tenantName: slot.tenant?.tenantName || "Unknown",
    }));

    console.log("Loaded time slots:", timeSlots.value);
  } catch (error) {
    console.error("Error loading time slots:", error);
    showToast("Failed to load time slots", "error");
  } finally {
    loadingTimeSlots.value = false;
  }
};

// Handle door selection change
const onDoorSelectionChange = (doorKey) => {
  console.log(`Door ${doorKey} selected:`, form.doors[doorKey].selectedDoor);

  // If door selection is cleared, reset the configuration
  if (!form.doors[doorKey].selectedDoor) {
    form.doors[doorKey] = {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "limittime",
      scheduleTime: null,
    };
  } else {
    form.doors[doorKey].dotlDuration = 20;
    form.doors[doorKey].alarmEnabled = true;
    form.doors[doorKey].dotlDelay = 5;
  }
};

// Handle passage status change
const onPassageStatusChange = (doorKey) => {
  const doorConfig = form.doors[doorKey];
  if (doorConfig.passageStatus) {
    if (timeSlots.value.length === 0 && props.tenantId) {
      loadTimeSlots();
    }
  }
};

// Handle alarm toggle - clear delay value when alarm is disabled
const onAlarmToggle = (doorKey) => {
  if (!form.doors[doorKey].alarmEnabled) {
    form.doors[doorKey].dotlDelay = "";
  } else {
    // When alarm is enabled, set default 5 seconds
    form.doors[doorKey].dotlDelay = 5;
  }
};

// Validate positive numbers (no negative values)
const validatePositiveNumber = (doorKey, field) => {
  const value = form.doors[doorKey][field];
  if (value < 0) {
    form.doors[doorKey][field] = "";
  }
};

// Check if device serial number already exists
const checkDeviceExists = async (serialNumber) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[sn][_eq]=${encodeURIComponent(
        serialNumber
      )}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check device: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.length > 0;
  } catch (error) {
    console.error("Error checking device:", error);
    return false;
  }
};

// Map door configuration to backend fields
const mapDoorConfigToBackend = (doorConfig, deviceId) => {
  let scheduleTimeValue = null;

  if (doorConfig.passageStatus) {
    if (doorConfig.scheduleTime) {
      // For limit time mode, find the selected time slot and extract entry/exit times
      const selectedTimeSlot = timeSlots.value.find(
        (slot) => slot.id === doorConfig.scheduleTime
      );
      if (selectedTimeSlot) {
        scheduleTimeValue = {
          entryTime: selectedTimeSlot.entryTime,
          exitTime: selectedTimeSlot.exitTime,
        };
      }
    } else {
      scheduleTimeValue = {
        entryTime: "00:00",
        exitTime: "23:59",
      };
    }
  }

  return {
    deviceId: deviceId,
    doorOpenTimer: doorConfig.dotlDuration || null,
    delayTimer: doorConfig.alarmEnabled ? doorConfig.dotlDelay || null : null,
    sensorMode: doorConfig.sensorStatus,
    passiveMode: doorConfig.passageStatus,
    scheduleTime: scheduleTimeValue,
  };
};

// Validate door configuration for a specific door
const validateDoorConfiguration = (doorKey) => {
  const doorConfig = form.doors[doorKey];

  // If no door is selected, no validation needed
  if (!doorConfig.selectedDoor) {
    return true;
  }

  // Validate duration
  if (!doorConfig.dotlDuration) {
    showToast(
      `Please enter door open duration for ${doorKey.toUpperCase()}`,
      "error"
    );
    return false;
  }

  if (doorConfig.alarmEnabled && !doorConfig.dotlDelay) {
    showToast(`Please enter alarm delay for ${doorKey.toUpperCase()}`, "error");
    return false;
  }

  return true;
};
const clearDoorConfiguration = async (doorId) => {
  if (!doorId) return;

  try {
    const payload = {
      doorsConfigure: null, // Clear the doorsConfigure data
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors/${doorId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error(`Failed to clear configuration for door ${doorId}`);
      return false;
    }

    console.log(`Successfully cleared configuration for door ${doorId}`);
    return true;
  } catch (error) {
    console.error(`Error clearing door configuration for ${doorId}:`, error);
    return false;
  }
};

// Get previously assigned doors (for editing scenario)
const getPreviouslyAssignedDoors = () => {
  if (!props.editingDevice || !props.editingDevice.selectedDoors) {
    return new Set();
  }
  return new Set(props.editingDevice.selectedDoors);
};
// Save device by making API call
const saveDevice = async () => {
  if (!formRef.value) {
    showToast("Form reference not available.", "error");
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  if (selectedDoorsCount.value === 0) {
    showToast("Please select at least one door for the device.", "error");
    activeTab.value = "doors-configure";
    return;
  }

  for (const doorTab of doorTabs.value) {
    const doorConfig = form.doors[doorTab.value];
    if (doorConfig.selectedDoor && !validateDoorConfiguration(doorTab.value)) {
      activeTab.value = "doors-configure";
      return;
    }
  }

  if (!props.editingDevice && (await checkDeviceExists(form.serialNumber))) {
    showToast("Device with this serial number already exists.", "error");
    return;
  }

  isSaving.value = true;
  try {
    // Get current selected doors
    const currentSelectedDoors = doorTabs.value
      .map((tab) => form.doors[tab.value].selectedDoor)
      .filter(Boolean);

    const branchValue = form.branch === "" ? null : form.branch;
    const devicePayload = {
      branchDetails: branchValue,
      controllerName: form.controllerName,
      deviceName: form.deviceName || form.controllerName,
      sn: form.serialNumber,
      tenant: props.tenantId,
      connectionStatus: form.connectionStatus,
      controllerStatus: form.controllerStatus,
      selectedDoors: currentSelectedDoors,
    };

    let deviceResponse;
    let deviceId;

    if (props.editingDevice) {
      // For editing: Handle door removal first
      const previouslyAssignedDoors = getPreviouslyAssignedDoors();
      const currentlySelectedDoorsSet = new Set(currentSelectedDoors);

      // Find doors that were previously assigned but are no longer selected
      const removedDoors = [...previouslyAssignedDoors].filter(
        (doorId) => !currentlySelectedDoorsSet.has(doorId)
      );

      // Clear configuration for removed doors
      if (removedDoors.length > 0) {
        console.log("Clearing configuration for removed doors:", removedDoors);
        const clearPromises = removedDoors.map((doorId) =>
          clearDoorConfiguration(doorId)
        );

        const clearResults = await Promise.all(clearPromises);
        const failedClears = clearResults.filter((success) => !success);

        if (failedClears.length > 0) {
          console.warn(
            `Failed to clear configuration for ${failedClears.length} doors`
          );
        }
      }

      // Update device
      deviceResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/controllers/${props.editingDevice.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(devicePayload),
        }
      );
      deviceId = props.editingDevice.id;
    } else {
      // Create new device
      devicePayload.id = form.serialNumber;
      deviceResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/controllers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(devicePayload),
        }
      );
    }

    if (!deviceResponse.ok) {
      const errorData = await deviceResponse.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `API call failed with status: ${deviceResponse.status}`
      );
    }

    const deviceResult = await deviceResponse.json();
    if (!props.editingDevice) {
      deviceId = deviceResult.data.id;
    }

    // Update door configurations for currently selected doors
    const doorUpdatePromises = doorTabs.value
      .map((doorTab) => {
        const doorConfig = form.doors[doorTab.value];

        // Skip tabs with no door selected
        if (!doorConfig.selectedDoor) return null;

        const doorsConfigure = mapDoorConfigToBackend(doorConfig, deviceId);
        const payload = {
          id: doorConfig.selectedDoor,
          doorsConfigure: doorsConfigure,
        };

        console.log(
          `Updating door ${doorTab.value} configuration: ${JSON.stringify(payload)}`
        );

        return fetch(
          `${import.meta.env.VITE_API_URL}/items/doors/${doorConfig.selectedDoor}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(payload),
          }
        );
      })
      .filter(Boolean);

    // Only run door updates if there are any
    if (doorUpdatePromises.length > 0) {
      const doorResponses = await Promise.all(doorUpdatePromises);

      // Only count actual failed HTTP responses
      const failedDoors = doorResponses.filter((response) => !response.ok);
      if (failedDoors.length > 0) {
        throw new Error(`Failed to update ${failedDoors.length} door(s)`);
      }
    }

    // Emit success event
    emit("save-success", {
      device: props.editingDevice
        ? { ...props.editingDevice, ...devicePayload }
        : deviceResult.data,
      doors: doorTabs.value
        .map((tab) => ({
          doorId: form.doors[tab.value].selectedDoor,
          configuration: form.doors[tab.value],
        }))
        .filter((door) => door.doorId),
      isEdit: !!props.editingDevice,
      removedDoors: props.editingDevice
        ? [...getPreviouslyAssignedDoors()].filter(
            (doorId) => !currentSelectedDoors.includes(doorId)
          )
        : [],
    });

    showToast(
      `Device ${props.editingDevice ? "updated" : "saved"} successfully!`,
      "success"
    );
  } catch (error) {
    console.error("Error saving device and doors:", error);
    showToast(
      error.message ||
        `Failed to ${props.editingDevice ? "update" : "save"} device. Please try again.`,
      "error"
    );
  } finally {
    isSaving.value = false;
  }
};

// Handle save based on active tab
const handleSave = () => {
  saveDevice();
};

// Handle cancel based on active tab
const handleCancel = () => {
  emit("cancel");
};

// Show toast notification
const showToast = (message, type = "success") => {
  snackbar.value = { show: true, message, type };
};

// Enhanced initialization function
const initializeForm = () => {
  if (props.editingDevice) {
    console.log("Initializing form for editing device:", props.editingDevice);

    // Populate form with existing device data for editing
    form.controllerName = props.editingDevice.controllerName || "";
    form.deviceName = props.editingDevice.deviceName || "";
    form.serialNumber = props.editingDevice.sn || "";
    form.branch = props.editingDevice.branchDetails || null;
    form.connectionStatus =
      props.editingDevice.status === "approved" ? "Connected" : "Disconnected";
    form.controllerStatus = props.editingDevice.controllerStatus || "Waiting";

    // Reset door configurations first
    resetDoorConfigurations(form.controllerName);

    // Then populate door configurations if available
    if (
      props.editingDevice.selectedDoors &&
      props.editingDevice.selectedDoors.length > 0
    ) {
      console.log(
        "Device has selected doors:",
        props.editingDevice.selectedDoors
      );

      // Load door configurations after a brief delay to ensure form is ready
      setTimeout(() => {
        loadDoorConfigurations(props.editingDevice.selectedDoors);
      }, 100);
    } else {
      console.log("No selected doors found for device");
    }
  } else {
    // New device - initialize empty form
    form.controllerName = "";
    form.deviceName = "";
    form.serialNumber = "";
    form.branch = null;
    form.connectionStatus = "Disconnected";
    form.controllerStatus = "Waiting";
    resetDoorConfigurations("");
  }
};

// Enhanced function to load door configurations
const loadDoorConfigurations = async (selectedDoorIds) => {
  try {
    console.log("Loading door configurations for doors:", selectedDoorIds);

    // Reset all door configurations first
    resetDoorConfigurations(form.controllerName);

    // Create a map of door configurations by door ID for quick lookup
    const doorConfigMap = new Map();

    // Use both availableDoors prop and any additional doors from editingDevice
    const allAvailableDoors = [
      ...(props.availableDoors || []),
      ...(props.editingDevice?.allAvailableDoors || []),
    ];

    console.log("All available doors:", allAvailableDoors);

    // Collect door configurations
    allAvailableDoors.forEach((door) => {
      if (door.doorsConfigure && door.id) {
        doorConfigMap.set(door.id, {
          ...door.doorsConfigure,
          doorId: door.id,
          doorName: door.doorName,
        });
      }
    });

    console.log("Door configuration map:", doorConfigMap);

    // Assign configurations to tabs
    doorTabs.value.forEach((tab, tabIndex) => {
      if (tabIndex < selectedDoorIds.length) {
        const doorId = selectedDoorIds[tabIndex];
        const config = doorConfigMap.get(doorId);

        console.log(`Configuring ${tab.value} with door ${doorId}:`, config);

        if (config) {
          form.doors[tab.value].selectedDoor = doorId;
          form.doors[tab.value].dotlDuration = config.doorOpenTimer || 20; // Default to 20 if not set
          form.doors[tab.value].sensorStatus = config.sensorMode || false;
          form.doors[tab.value].dotlDelay = config.delayTimer || 5; // Default to 5 if not set
          form.doors[tab.value].alarmEnabled =
            config.delayTimer !== null && config.delayTimer !== undefined;
          form.doors[tab.value].passageStatus = config.passiveMode || false;

          // Handle scheduleTime
          if (config.scheduleTime && typeof config.scheduleTime === "object") {
            const scheduleTime = config.scheduleTime;

            // Find matching time slot
            const matchingSlot = timeSlots.value.find(
              (slot) =>
                slot.entryTime === scheduleTime.entryTime &&
                slot.exitTime === scheduleTime.exitTime
            );

            form.doors[tab.value].scheduleTime = matchingSlot
              ? matchingSlot.id
              : null;

            console.log(`Schedule time for ${tab.value}:`, {
              scheduleTime: scheduleTime,
              matchingSlot: matchingSlot,
              finalValue: form.doors[tab.value].scheduleTime,
            });
          } else {
            form.doors[tab.value].scheduleTime = null;
          }

          console.log(
            `Final configuration for ${tab.value}:`,
            form.doors[tab.value]
          );
        } else {
          // No configuration found - set default values
          form.doors[tab.value].selectedDoor = doorId;
          form.doors[tab.value].dotlDuration = 20;
          form.doors[tab.value].sensorStatus = false;
          form.doors[tab.value].dotlDelay = 5;
          form.doors[tab.value].alarmEnabled = true;
          form.doors[tab.value].passageStatus = false;
          form.doors[tab.value].scheduleTime = null;

          console.log(
            `Default configuration for ${tab.value}:`,
            form.doors[tab.value]
          );
        }
      }
    });
  } catch (error) {
    console.error("Error loading door configurations:", error);
  }
};

// Load initial data
onMounted(async () => {
  console.log("Branches received:", props.branches);
  console.log("Doors received:", props.availableDoors);
  console.log("Tenant ID:", props.tenantId);

  if (props.availableDoors && props.availableDoors.length > 0) {
    console.log(
      "Available door names:",
      props.availableDoors.map((door) => door.doorName)
    );
  }

  if (props.tenantId) {
    loadTimeSlots();
  }

  initializeForm();
});
</script>

<style scoped>
.timezone-select {
  width: 250px !important;
  flex-shrink: 0;
}

.timezone-select-wide {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
}

.device-configuration-form {
  height: 100%;
}

.tabs-container {
  height: 100%;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.compact-tabs {
  height: 100%;
}

.compact-tab {
  min-height: 48px;
  justify-content: start;
  padding-left: 16px;
}

.tab-text {
  font-size: 0.875rem;
  margin-left: 8px;
}

.content-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.compact-field {
  max-width: 140px;
}

/* Improve visual hierarchy and spacing */
.v-card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.text-subtitle-1 {
  font-size: 1rem;
  font-weight: 500;
}

/* Ensure proper spacing in compact mode */
:deep(.v-field--variant-outlined) {
  --v-field-padding-top: 8px;
}

:deep(.v-selection-control) {
  min-height: 40px;
}

/* Style for individual door cards */
.door-card {
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
}

.door-card:last-child {
  margin-bottom: 0;
}

/* Updated styles for top tabs */
.tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Compact timezone select */
:deep(.compact-timezone-select .v-field) {
  font-size: 0.875rem;
}

:deep(.compact-timezone-select .v-field__input) {
  min-height: 40px;
}
.compact-timezone-select {
  max-width: 260px;
}

.compact-timezone-select :deep(.v-field) {
  font-size: 0.875rem;
}

.compact-timezone-select :deep(.v-field__input) {
  min-height: 36px;
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>

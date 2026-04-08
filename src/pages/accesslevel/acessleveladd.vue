<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span class="text-h5">{{ isEditing ? "Edit" : "Add" }} Access Level</span>
      <v-spacer></v-spacer>

      <!-- Save/Cancel Buttons moved to title row -->
      <div class="d-flex align-center">
        <BaseButton
          variant="ghost"
          text="Cancel"
          @click="$emit('cancel')"
          class="mr-2"
        ></BaseButton>
        <BaseButton
          variant="primary"
          text="Save"
          :loading="isSaving"
          @click="handleSave"
        ></BaseButton>
      </div>
    </v-card-title>

    <v-card-text>
      <!-- Access Level Name Field with Access Type Toggle -->
      <v-row dense class="mb-6 align-center">
        <v-col cols="12" sm="6">
          <v-text-field
            label="Access Level Name"
            placeholder="e.g. 'Staff Access'"
            variant="outlined"
            dense
            v-model="accessLevelName"
            :rules="[requiredRule]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end">
          <!-- Access Type Toggle moved to field row -->
          <div class="d-flex align-center">
            <span class="mr-2">Access Type:</span>
            <v-switch
              v-model="accessType"
              :label="accessType ? 'Active' : 'Inactive'"
              color="primary"
              hide-details
              inset
              density="compact"
            ></v-switch>
          </div>
        </v-col>
      </v-row>

      <!-- Access Timing Section -->
      <div class="section-title mb-4">
        <h3 class="text-h6">Access Timing</h3>
      </div>

      <v-card class="mb-6" variant="flat">
        <v-card-text class="pa-4">
          <!-- Current Active Option Message -->
          <v-alert
            v-if="
              access24Hours || accessTiming || maxWorkHours || holidayAccess
            "
            class="mb-4"
            density="compact"
            type="info"
            variant="tonal"
          >
            Current active option:
            <strong class="ml-1">
              {{ access24Hours ? "24 Hours Access" : "" }}
              {{ accessTiming ? "Time Zone" : "" }}
              {{
                maxWorkHours
                  ? "Max Work Hours: " +
                    (maxWorkHoursValue ? maxWorkHoursValue : "")
                  : ""
              }}
              {{ holidayAccess ? "Holiday Access" : "" }}
            </strong>
          </v-alert>

          <!-- 24 Hours Access -->
          <v-row dense class="mb-4 align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <div class="d-flex align-center">
                    <span>24 Hours Access</span>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="small"
                          color="grey"
                          class="ml-2"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span
                        >This access level allows entry at any time, 24 hours a
                        day.</span
                      >
                    </v-tooltip>
                    <v-chip
                      v-if="access24Hours"
                      size="small"
                      color="green"
                      class="ml-2"
                    >
                      ACTIVE
                    </v-chip>
                    <v-chip v-else size="small" color="grey" class="ml-2">
                      INACTIVE
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="auto" class="ml-3">
                  <v-switch
                    v-model="access24Hours"
                    :disabled="isAnyOtherTimingOptionActive('24Hours')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handle24HoursToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Time Zone -->
          <v-row dense class="mb-4 align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <div class="d-flex align-center">
                    <span>Time Zone</span>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="small"
                          color="grey"
                          class="ml-2"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span
                        >The selected time zone determines when this access
                        level is active.</span
                      >
                    </v-tooltip>
                    <v-chip
                      v-if="accessTiming"
                      size="small"
                      color="green"
                      class="ml-2"
                    >
                      ACTIVE
                    </v-chip>
                    <v-chip v-else size="small" color="grey" class="ml-2">
                      INACTIVE
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="auto" class="ml-3">
                  <v-switch
                    v-model="accessTiming"
                    :disabled="isAnyOtherTimingOptionActive('timeZone')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handleAccessTimingToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="4" v-if="accessTiming">
              <v-select
                label="Select Time Zone"
                :items="timeOptions"
                :loading="loadingTimeSchedules"
                variant="outlined"
                dense
                v-model="selectedTimeSchedule"
                class="small-select"
                :rules="accessTiming ? [requiredRule] : []"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Date Validity Section (Optional) - Visible only when Time Zone is enabled -->
          <div v-if="accessTiming" class="mb-6 ml-4 pl-4 border-l-2 border-gray-200">
            <div class="text-subtitle-2 mb-2 font-weight-bold">
              Date Validity (Optional)
            </div>
            <div class="text-caption text-grey mb-3">
              Access level will be disabled automatically after expiry date
            </div>

            <v-radio-group v-model="dateValidityType" inline density="compact" class="mb-2">
              <v-radio label="No Date Selected" :value="null"></v-radio>
              <v-radio label="Single Date" value="single"></v-radio>
              <v-radio label="Date Range" value="range"></v-radio>
            </v-radio-group>

            <!-- Single Date Picker -->
            <v-row v-if="dateValidityType === 'single'" dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="singleDate"
                  label="Select Date"
                  type="date"
                  variant="outlined"
                  dense
                  :rules="[requiredRule]"
                  :min="todayDate"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Date Range Picker -->
            <v-row v-if="dateValidityType === 'range'" dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="startDate"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  dense
                  :rules="[requiredRule]"
                  :min="todayDate"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="endDate"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  dense
                  :rules="[requiredRule, endDateRule]"
                  :min="startDate || todayDate"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Max Work Hours -->
          <v-row dense class="mb-4 align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <div class="d-flex align-center">
                    <span>Max Work Hours</span>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="small"
                          color="grey"
                          class="ml-2"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span
                        >The total number of working hours allowed for this
                        access level.</span
                      >
                    </v-tooltip>
                    <v-chip
                      v-if="maxWorkHours"
                      size="small"
                      color="green"
                      class="ml-2"
                    >
                      ACTIVE
                    </v-chip>
                    <v-chip v-else size="small" color="grey" class="ml-2">
                      INACTIVE
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="auto">
                  <v-switch
                    v-model="maxWorkHours"
                    :disabled="isAnyOtherTimingOptionActive('maxWorkHours')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handleMaxWorkHoursToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="4" v-if="maxWorkHours">
              <v-text-field
                label="Time Zone"
                placeholder="e.g. 40 hours"
                variant="outlined"
                dense
                v-model="maxWorkHoursValue"
                class="small-field"
                :rules="maxWorkHours ? [requiredRule] : []"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Holiday Access -->
          <v-row dense class="align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <div class="d-flex align-center">
                    <span>Holiday Access</span>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="small"
                          color="grey"
                          class="ml-2"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span
                        >Allows entry even on holidays for this access
                        level.</span
                      >
                    </v-tooltip>
                    <v-chip
                      v-if="holidayAccess"
                      size="small"
                      color="green"
                      class="ml-2"
                    >
                      ACTIVE
                    </v-chip>
                    <v-chip v-else size="small" color="grey" class="ml-2">
                      INACTIVE
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="auto">
                  <v-switch
                    v-model="holidayAccess"
                    :disabled="isAnyOtherTimingOptionActive('holidayAccess')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handleHolidayAccessToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Doors Section -->
      <div class="section-title mb-4">
        <h3 class="text-h6">Doors</h3>
      </div>

      <v-card variant="flat">
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="selectedDoors"
                label="Door List"
                :items="filteredDoorOptions"
                item-title="doorName"
                item-value="id"
                variant="outlined"
                multiple
                chips
                dense
                return-object
                :loading="loadingDoors"
              >
                <!-- Custom search input slot -->
                <template v-slot:prepend-item>
                  <v-text-field
                    v-model="doorSearch"
                    label="Search Doors"
                    variant="outlined"
                    dense
                    class="ma-2"
                    @input="filterDoors"
                  ></v-text-field>
                  <v-divider></v-divider>
                </template>
                <!-- Display selected doors as chips -->
                <template v-slot:selection="{ item, index }">
                  <v-chip v-if="index < 3" color="primary" small class="ma-1">
                    {{ item.title || item.doorName }}
                  </v-chip>
                  <span v-if="index === 3" class="text-grey text-caption">
                    (+{{ selectedDoors.length - 3 }} more)
                  </span>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";

const props = defineProps({
  tenantId: {
    type: String,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  accessLevelData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["cancel", "saved"]);

const accessLevelName = ref("");
const accessType = ref(true); // Default value is true
const access24Hours = ref(false);
const accessTiming = ref(false);
const maxWorkHours = ref(false);
const holidayAccess = ref(false);
const selectedDoors = ref([]);
const doorSearch = ref("");
const isSaving = ref(false);
const loadingTimeSchedules = ref(false);
const timeSchedules = ref([]);
const selectedTimeSchedule = ref(null);
const maxWorkHoursValue = ref("");
const accessLevelNumber = ref("");

// Date Validity State
const dateValidityType = ref(null); // null, 'single', 'range'
const singleDate = ref("");
const startDate = ref("");
const endDate = ref("");

// Computed today's date for min attribute
const todayDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

// Door options
const doorOptions = ref([]);
const loadingDoors = ref(false);

// Validation rules
const requiredRule = (value) => !!value || "This field is required";
const timeFormatRule = (value) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value) || "Please use hh:mm format";
};
const endDateRule = (value) => {
  if (!startDate.value) return true;
  return (
    new Date(value) >= new Date(startDate.value) ||
    "End date must be after start date"
  );
};

// Time options (will be populated from API)
const timeOptions = computed(() => {
  return timeSchedules.value.map((schedule) => ({
    title: schedule.displayText,
    value: schedule.displayText, // CHANGED: Use displayText (entry - exit) instead of id, so Valid_hours gets the times
    raw: schedule,
  }));
});

// Filtered door options based on search
const filteredDoorOptions = computed(() => {
  if (!doorSearch.value) return doorOptions.value;
  return doorOptions.value.filter((door) =>
    door.doorName.toLowerCase().includes(doorSearch.value.toLowerCase())
  );
});

// Check if any other timing option is active (mutual exclusion)
const isAnyOtherTimingOptionActive = (currentOption) => {
  const activeOptions = [
    { name: "24Hours", value: access24Hours.value },
    { name: "timeZone", value: accessTiming.value },
    { name: "maxWorkHours", value: maxWorkHours.value },
    { name: "holidayAccess", value: holidayAccess.value },
  ];

  return activeOptions.some(
    (option) => option.name !== currentOption && option.value === true
  );
};

// Watch for accessTiming changes to fetch time schedules
watch(accessTiming, (newVal) => {
  if (newVal && timeSchedules.value.length === 0) {
    fetchTimeSchedules();
  }
});

onMounted(async () => {
  await fetchDoors();

  if (!props.isEditing) {
    accessLevelNumber.value = await generateSequentialAccessLevelId();
  }

  if (props.isEditing && props.accessLevelData) {
    setTimeout(() => {
      initializeFormData();
    }, 100);
  }
});

const fetchDoors = async () => {
  if (!props.tenantId) {
    console.warn("No tenant ID available for loading doors");
    return;
  }

  loadingDoors.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?fields[]=id&fields[]=doorNumber&fields[]=tenant&fields[]=tenant.tenantName&fields[]=doorName&fields[]=doorType&filter[_and][0][_and][0][tenant][tenantId][_eq]=${props.tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load doors: ${response.statusText}`);
    }

    const data = await response.json();
    doorOptions.value = data.data.map((door) => ({
      id: door.id,
      doorName: door.doorName,
      doorNumber: door.doorNumber,
      doorType: door.doorType,
      tenantName: door.tenant?.tenantName || "Unknown",
    }));

    console.log("Loaded doors:", doorOptions.value);
  } catch (error) {
    console.error("Error loading doors:", error);
  } finally {
    loadingDoors.value = false;
  }
};

const initializeFormData = () => {
  const data = props.accessLevelData;
  console.log("Editing access level data:", data);

  accessLevelName.value = data.accessLevelName || "";
  accessType.value = data.accessType !== undefined ? data.accessType : true;
  accessLevelNumber.value = data.accessLevelNumber || "";

  // Initialize selected doors
  if (data.assignDoorsGroup && Array.isArray(data.assignDoorsGroup)) {
    selectedDoors.value = doorOptions.value.filter((door) =>
      data.assignDoorsGroup.includes(door.id)
    );
  } else if (data.doors && Array.isArray(data.doors)) {
    selectedDoors.value = doorOptions.value.filter((door) =>
      data.doors.includes(door.id)
    );
  }

  // Reset all timing options first
  access24Hours.value = false;
  accessTiming.value = false;
  maxWorkHours.value = false;
  holidayAccess.value = false;
  selectedTimeSchedule.value = null;
  maxWorkHoursValue.value = "";

  // Determine which timing option is active
  if (data._24hrs === true || data.Valid_hours === "24_hours") {
    // 24 Hours Access
    access24Hours.value = true;
    console.log("✅ Loaded: 24 Hours Access");
  } else if (data.Valid_hours && data.Valid_hours.startsWith("MAX:")) {
    // Legacy Max Work Hours - parse "MAX:HH:MM:SS" format
    maxWorkHours.value = true;
    const maxTimeMatch = data.Valid_hours.match(/MAX:(\d{2}):(\d{2}):(\d{2})/);
    if (maxTimeMatch) {
      const hours = maxTimeMatch[1];
      const minutes = maxTimeMatch[2];
      maxWorkHoursValue.value = `${hours}:${minutes}`;
    }
    console.log(
      "✅ Loaded: Max Work Hours (Legacy) -",
      maxWorkHoursValue.value
    );
  } else if (
    data.Valid_hours &&
    data.Valid_hours !== "24_hours" &&
    data.Valid_hours !== "HOLIDAY" &&
    !data.Valid_hours.includes(" - ")
  ) {
    // New Max Work Hours - direct string
    maxWorkHours.value = true;
    maxWorkHoursValue.value = data.Valid_hours;
    console.log("✅ Loaded: Max Work Hours -", maxWorkHoursValue.value);
  } else if (data.Valid_hours && data.Valid_hours.includes(" - ")) {
    // Time Zone Access - contains a time range
    accessTiming.value = true;

    // Find matching time schedule
    const timeMatch = data.Valid_hours.match(
      /(\d{2}:\d{2}):\d{2} - (\d{2}:\d{2}):\d{2}/
    );
    if (timeMatch) {
      const entryTime = timeMatch[1];
      const exitTime = timeMatch[2];
      const displayText = `${entryTime} - ${exitTime}`;
      selectedTimeSchedule.value = displayText;
    } else {
      selectedTimeSchedule.value = data.Valid_hours;
    }

    console.log("✅ Loaded: Time Zone Access -", selectedTimeSchedule.value);

    // Fetch time schedules if needed
    if (timeSchedules.value.length === 0) {
      fetchTimeSchedules();
    }
  } else if (data.holidays === true || data.Valid_hours === "HOLIDAY") {
    // Holiday Access
    holidayAccess.value = true;
    console.log("✅ Loaded: Holiday Access");
  } else {
    console.log("⚠️ No access timing detected");
  }

  // Log the current state
  console.log("Form initialized:", {
    accessLevelName: accessLevelName.value,
    accessType: accessType.value,
    selectedDoors: selectedDoors.value,
    access24Hours: access24Hours.value,
    accessTiming: accessTiming.value,
    selectedTimeSchedule: selectedTimeSchedule.value,
    maxWorkHours: maxWorkHours.value,
    maxWorkHoursValue: maxWorkHoursValue.value,
    holidayAccess: holidayAccess.value,
  });

  // Initialize Date Validity
  if (data.dateValidity) {
    dateValidityType.value = data.dateValidity.type || null;
    if (data.dateValidity.type === "single") {
      singleDate.value = data.dateValidity.date || "";
    } else if (data.dateValidity.type === "range") {
      startDate.value = data.dateValidity.startDate || "";
      endDate.value = data.dateValidity.endDate || "";
    }
  } else {
    dateValidityType.value = null;
    singleDate.value = "";
    startDate.value = "";
    endDate.value = "";
  }
};

// Toggle handlers to ensure only one option is active
const handle24HoursToggle = (value) => {
  if (value) {
    accessTiming.value = false;
    maxWorkHours.value = false;
    holidayAccess.value = false;
    selectedTimeSchedule.value = null;
    maxWorkHoursValue.value = "";
  }
};

const handleAccessTimingToggle = (value) => {
  if (value) {
    access24Hours.value = false;
    maxWorkHours.value = false;
    holidayAccess.value = false;
    maxWorkHoursValue.value = "";
  } else {
    selectedTimeSchedule.value = null;
    // Reset Date Validity when Time Zone is disabled
    dateValidityType.value = null;
    singleDate.value = "";
    startDate.value = "";
    endDate.value = "";
  }
};

const handleMaxWorkHoursToggle = (value) => {
  if (value) {
    access24Hours.value = false;
    accessTiming.value = false;
    holidayAccess.value = false;
    selectedTimeSchedule.value = null;
  } else {
    maxWorkHoursValue.value = "";
  }
};

const handleHolidayAccessToggle = (value) => {
  if (value) {
    access24Hours.value = false;
    accessTiming.value = false;
    maxWorkHours.value = false;
    selectedTimeSchedule.value = null;
    maxWorkHoursValue.value = "";
  }
};

// Fetch time schedules from API
const fetchTimeSchedules = async () => {
  if (!props.tenantId) {
    console.warn("No tenant ID available for loading time schedules");
    return;
  }

  loadingTimeSchedules.value = true;
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
      throw new Error(`Failed to load time schedules: ${response.statusText}`);
    }

    const data = await response.json();
    timeSchedules.value = data.data.map((slot) => ({
      id: slot.id,
      displayText: `${slot.entryTime} - ${slot.exitTime}`,
      entryTime: slot.entryTime,
      exitTime: slot.exitTime,
      tenantName: slot.tenant?.tenantName || "Unknown",
    }));

    console.log("Loaded time schedules:", timeSchedules.value);
  } catch (error) {
    console.error("Error loading time schedules:", error);
  } finally {
    loadingTimeSchedules.value = false;
  }
};

const filterDoors = () => {
  // This is handled by the computed property filteredDoorOptions
};

const handleSave = async () => {
  if (!accessLevelName.value.trim()) {
    alert("Please enter an access level name");
    return;
  }

  // For new records, ensure we have a generated access level number
  if (!props.isEditing && !accessLevelNumber.value) {
    alert("Error: Could not generate access level number");
    return;
  }

  // Validate timing options
  if (accessTiming.value && !selectedTimeSchedule.value) {
    alert("Please select a time schedule when 'Time Zone' is enabled");
    return;
  }

  if (maxWorkHours.value && !maxWorkHoursValue.value) {
    alert("Please enter max work hours when 'Max Work Hours' is enabled");
    return;
  }

  // Validate Date Validity
  if (accessTiming.value && dateValidityType.value === "single") {
    if (!singleDate.value) {
      alert("Please select a date for Single Date validity");
      return;
    }
  } else if (accessTiming.value && dateValidityType.value === "range") {
    if (!startDate.value || !endDate.value) {
      alert("Please select both Start and End dates for Date Range validity");
      return;
    }
    if (new Date(endDate.value) < new Date(startDate.value)) {
      alert("End date cannot be earlier than start date");
      return;
    }
  }

  isSaving.value = true;
  try {
    const payload = buildPayload();
    console.log("Saving payload:", payload);

    const url = props.isEditing
      ? `${import.meta.env.VITE_API_URL}/items/accesslevels/${props.accessLevelData.id}`
      : `${import.meta.env.VITE_API_URL}/items/accesslevels`;

    const method = props.isEditing ? "PATCH" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to ${props.isEditing ? "update" : "create"} access level: ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json();
    console.log(
      `${props.isEditing ? "Updated" : "Created"} access level:`,
      result
    );

    emit("saved", result.data);
  } catch (error) {
    console.error("Error saving access level:", error);
    alert(`Failed to save access level: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

async function generateSequentialAccessLevelId() {
  try {
    const tenantId = props.tenantId;
    const url =
      `${import.meta.env.VITE_API_URL}/items/accesslevels` +
      `?filter[tenant][tenantId][_eq]=${tenantId}` +
      `&sort[]=-accessLevelNumber&limit=1`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) throw new Error(resp.statusText);

    const { data } = await resp.json();

    if (!data?.length) return "1";

    const last = parseInt(data[0].accessLevelNumber, 10);
    return (isNaN(last) ? 1 : last + 1).toString();
  } catch (e) {
    console.error("Error generating access level ID:", e);
    return "1";
  }
}

const buildPayload = () => {
  const payload = {
    accessLevelName: accessLevelName.value.trim(),
    accessType: accessType.value,
    tenant: props.tenantId,
  };

  // Include accessLevelNumber for NEW records only
  if (!props.isEditing) {
    payload.accessLevelNumber = accessLevelNumber.value;
  }

  // Doors
  if (selectedDoors.value.length) {
    payload.assignDoorsGroup = selectedDoors.value.map((d) => d.id);
  }

  // Date Validity Payload
  if (accessTiming.value && dateValidityType.value) {
    if (dateValidityType.value === "single") {
      payload.dateValidity = {
        type: "single",
        date: singleDate.value,
      };
    } else if (dateValidityType.value === "range") {
      payload.dateValidity = {
        type: "range",
        startDate: startDate.value,
        endDate: endDate.value,
      };
    }
  } else {
    payload.dateValidity = null;
  }

  // Timing (only one active)
  if (access24Hours.value) {
    // For 24 hours access
    payload._24hrs = true;
    payload.Valid_hours = "24_hours";
  } else if (accessTiming.value && selectedTimeSchedule.value) {
    // For Time Zone access - gets time range from time schedule
    payload._24hrs = false;

    // Find the actual time schedule to get entry/exit times
    const selectedSchedule = timeSchedules.value.find(
      (schedule) => schedule.displayText === selectedTimeSchedule.value
    );

    if (selectedSchedule) {
      // Format: "HH:MM:SS - HH:MM:SS"
      payload.Valid_hours = `${selectedSchedule.entryTime}:00 - ${selectedSchedule.exitTime}:00`;
    } else {
      // Fallback to just the display text
      payload.Valid_hours = selectedTimeSchedule.value;
    }
  } else if (maxWorkHours.value && maxWorkHoursValue.value) {
    // For Max Work Hours - pass directly as user input
    payload._24hrs = false;
    payload.Valid_hours = maxWorkHoursValue.value;
    payload.maxWorkHours = maxWorkHoursValue.value; // Store in maxWorkHours field as well
    payload.workingHours = true; // Flag to indicate working hours limit is active
    payload.limitTime = true; // Flag to indicate time limit is enabled
  } else if (holidayAccess.value) {
    // For Holiday Access - might use "HOLIDAY" or similar
    payload._24hrs = false;
    payload.Valid_hours = "HOLIDAY";
    payload.holidays = true;
  } else {
    // Default case if no timing option selected
    payload._24hrs = false;
    payload.Valid_hours = null;
  }

  return payload;
};

watch(
  () => props.isEditing,
  async (isEdit) => {
    if (!isEdit) {
      accessLevelNumber.value = await generateSequentialAccessLevelId();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.small-select,
.small-field {
  max-width: 200px;
  font-size: 14px;
}
.small-select :deep(.v-field),
.small-field :deep(.v-field) {
  min-height: 40px;
  padding: 4px 8px;
}
.small-select :deep(.v-select__selection-text),
.small-field :deep(.v-input__control) {
  font-size: 14px;
}

.section-title {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

/* Optional: Add some spacing for the tooltip icons */
.d-flex.align-center .v-icon {
  margin-left: 4px;
}
</style>

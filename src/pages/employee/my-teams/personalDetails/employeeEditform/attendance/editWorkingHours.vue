<template>
  <div class="working-hours-container">
    <!-- <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-calendar-clock</v-icon>
        Working Hours Configuration
      </h3>
      <v-btn
        color="success"
        variant="flat"
        @click="redirectToShifts"
        class="go-to-shift-btn"
      >
        Go to Shift details
      </v-btn>
    </div> -->
    <v-card flat class="pa-4">
      <v-card-text class="scrollable">
        <!-- Using DataTable Component -->
        <DataTable
          :items="internalWeekDays"
          :columns="tableColumns"
          :showSelection="false"
          :rowClickable="true"
          @rowClick="handleRowClick"
        >
          <!-- Expanded content slot for each day -->
          <template #expanded-content="{ item: day }">
            <div class="expanded-day-content pa-4">
              <div
                class="d-flex align-center justify-space-between gap-4 flex-wrap"
              >
                <!-- Status -->
                <div class="status-cell">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="day.isWorking"
                      color="#059367"
                      inset
                      @change="updateWeekDays"
                      class="custom-switch ma-0 pa-0"
                      hide-details
                    ></v-switch>
                    <span
                      :class="
                        day.isWorking
                          ? 'text-success font-weight-bold'
                          : 'text-grey'
                      "
                      class="status-text ml-2"
                    >
                      {{ day.isWorking ? "Working Day" : "Week Off" }}
                    </span>
                  </div>
                </div>

                <!-- Shifts and Actions -->
                <div class="shifts-actions-cell">
                  <div
                    v-if="day.isWorking"
                    class="d-flex align-center flex-wrap gap-4"
                  >
                    <v-text-field
                      :value="getShiftsDisplay(day)"
                      readonly
                      variant="outlined"
                      density="compact"
                      :append-inner-icon="
                        loadingStates.shifts && selectedDay?.key === day.key
                          ? undefined
                          : 'mdi-chevron-down'
                      "
                      :loading="
                        loadingStates.shifts && selectedDay?.key === day.key
                      "
                      @click:append-inner="openManageShifts(day)"
                      @click="openManageShifts(day)"
                      hide-details
                      class="shift-select-field"
                    ></v-text-field>
                    <span class="time-display ml-2">{{
                      getTimeDisplay(day)
                    }}</span>
                  </div>
                  <div v-else class="text-grey">
                    Day off - no shifts available
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Custom cell slots for each column -->
          <template #cell-day="{ item: day }">
            <div class="day-cell">{{ day.name }}</div>
          </template>

          <template #cell-status="{ item: day }">
            <div class="status-cell" @click.stop>
              <div class="d-flex align-center">
                <v-switch
                  v-model="day.isWorking"
                  color="#059367"
                  inset
                  @change="updateWeekDays"
                  @click.stop
                  class="custom-switch ma-0 pa-0"
                  hide-details
                ></v-switch>
                <span
                  :class="
                    day.isWorking
                      ? 'text-success font-weight-bold'
                      : 'text-grey'
                  "
                  class="status-text ml-2"
                >
                  {{ day.isWorking ? "Working Day" : "Week Off" }}
                </span>
              </div>
            </div>
          </template>

          <template #cell-availableShifts="{ item: day }">
            <v-text-field
              v-if="day.isWorking"
              :value="getShiftsDisplay(day)"
              readonly
              variant="outlined"
              density="compact"
              :append-inner-icon="
                loadingStates.shifts && selectedDay?.key === day.key
                  ? undefined
                  : 'mdi-chevron-down'
              "
              :loading="loadingStates.shifts && selectedDay?.key === day.key"
              @click:append-inner="openManageShifts(day)"
              @click="openManageShifts(day)"
              hide-details
              class="shift-select-field clickable-field"
            />
            <span v-else class="text-grey">—</span>
          </template>

          <template #cell-time="{ item: day }">
            <span
              v-if="day.isWorking"
              class="time-display clickable-time"
              @click="openManageShifts(day)"
            >
              {{ getTimeDisplay(day) }}
            </span>
            <span v-else>—</span>
          </template>
        </DataTable>
      </v-card-text>
    </v-card>

    <!-- Manage Shifts Dialog -->
    <v-dialog v-model="showManageShiftsDialog" width="700" persistent>
      <v-card>
        <v-card-title class="text-h5 pb-2">
          Manage Available Shifts - {{ selectedDay?.name }}
          <v-btn
            icon
            variant="text"
            size="large"
            @click="closeManageShiftsDialog"
            class="float-right"
          >
            <v-icon size="24px">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-4" style="max-height: 60vh; overflow-y: auto">
          <div v-if="loadingShifts" class="text-center pa-4">
            <v-progress-circular indeterminate size="48"></v-progress-circular>
          </div>
          <div v-else>
            <!-- Selection Info -->
            <div class="selection-info mb-4">
              <v-chip color="primary" variant="tonal">
                {{ selectedDay?.shifts?.length || 0 }} shifts selected
              </v-chip>
            </div>

            <v-list>
              <v-list-item
                v-for="shift in allShifts"
                :key="shift.id"
                class="mb-3 shift-list-item"
                :class="{ 'shift-selected': isShiftSelected(shift) }"
              >
                <template v-slot:default>
                  <v-list-item-title
                    class="d-flex align-center justify-content-between py-2 flex-wrap"
                  >
                    <div class="d-flex align-center flex-wrap">
                      <v-chip
                        :color="getShiftColor(shift.shift)"
                        class="mr-3"
                        size="large"
                        label
                      >
                        {{ shift.shift }}
                      </v-chip>
                      <span class="shift-time">
                        {{ formatTime(shift.entryTime) }} -
                        {{ formatTime(shift.exitTime) }}
                        <div
                          v-if="
                            shift.breakTypes &&
                            formatBreakTypes(shift.breakTypes).length > 0
                          "
                          class="break-time ml-2"
                        >
                          <!-- <small>
                            <span
                              v-for="(breakItem, bIndex) in formatBreakTypes(
                                shift.breakTypes,
                              )"
                              :key="bIndex"
                              style="display: block"
                            >
                              {{ breakItem }}
                            </span>
                          </small> -->
                        </div>
                        <div v-else class="break-time ml-2">
                          <small>No breaks</small>
                        </div>
                      </span>
                    </div>
                    <div class="d-flex align-center ml-auto">
                      <v-icon
                        v-if="isShiftSelected(shift)"
                        color="success"
                        size="24px"
                        class="mr-2"
                      >
                        mdi-check-circle
                      </v-icon>
                      <v-btn
                        :color="isShiftSelected(shift) ? 'error' : 'primary'"
                        :variant="isShiftSelected(shift) ? 'tonal' : 'outlined'"
                        size="large"
                        @click="selectShift(shift)"
                      >
                        {{ isShiftSelected(shift) ? "Remove" : "Select" }}
                      </v-btn>
                    </div>
                  </v-list-item-title>
                </template>
              </v-list-item>
            </v-list>

            <!-- Action Buttons -->
            <div class="d-flex justify-space-between mt-4">
              <v-btn
                color="primary"
                variant="outlined"
                size="large"
                @click="assignToAll"
              >
                Assign to All Working Days
              </v-btn>
              <div>
                <v-btn
                  color="grey"
                  variant="text"
                  size="large"
                  @click="resetSelectedDay"
                  class="mr-2"
                >
                  Reset
                </v-btn>
                <v-btn
                  color="#059367"
                  size="large"
                  @click="closeManageShiftsDialog"
                >
                  Apply Changes
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";
import DataTable from "@/components/common/table/DataTable.vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [
      { name: "Monday", key: "mon", shifts: [], isWorking: true },
      { name: "Tuesday", key: "tue", shifts: [], isWorking: true },
      { name: "Wednesday", key: "wed", shifts: [], isWorking: true },
      { name: "Thursday", key: "thu", shifts: [], isWorking: true },
      { name: "Friday", key: "fri", shifts: [], isWorking: true },
      { name: "Saturday", key: "sat", shifts: [], isWorking: true },
      { name: "Sunday", key: "sun", shifts: [], isWorking: false },
    ],
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const internalWeekDays = ref([]);
const showManageShiftsDialog = ref(false);
const selectedDay = ref(null);
const loadingShifts = ref(false);
const allShifts = ref([]);

// Loading states
const loadingStates = ref({
  shifts: false,
});

// DataTable columns configuration
const tableColumns = computed(() => [
  {
    key: "day",
    label: "Days",
    width: "15%",
  },
  {
    key: "status",
    label: "Status",
    width: "25%",
  },
  {
    key: "availableShifts",
    label: "Available shifts",
    width: "30%",
  },
  {
    key: "time",
    label: "Time",
    width: "30%",
  },
]);

// All your existing methods remain exactly the same
const redirectToShifts = () => {
  router.push("/configuration/shifts");
};

const formatTime = (time) => {
  if (!time) return "";
  try {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } catch (e) {
    console.error("Error formatting time:", time, e);
    return time;
  }
};

const formatBreakTypes = (breakTypes) => {
  if (!breakTypes || !Array.isArray(breakTypes) || breakTypes.length === 0) {
    return [];
  }

  return breakTypes
    .filter(
      (breakItem) =>
        breakItem.breakType || (breakItem.startTime && breakItem.endTime),
    )
    .map((breakItem) => {
      const breakName = breakItem.breakType || "Unnamed Break";
      const startTime = formatTime(breakItem.startTime);
      const endTime = formatTime(breakItem.endTime);
      if (startTime === "" || endTime === "") {
        return `${breakName}`;
      }
      return `${breakName}: ${startTime} - ${endTime}`;
    });
};

const getShiftColor = (shiftType) => {
  const colors = {
    Morning: "success",
    Evening: "purple",
    Day: "primary",
    Night: "error",
    "Day 1": "orange",
    "Day-Morning": "green",
    morning: "success",
    evening: "purple",
    day: "primary",
    night: "error",
    "Week Off": "green",
    "General Shift": "indigo",
  };
  return colors[shiftType] || "indigo";
};

const getShiftsDisplay = (day) => {
  if (day.shifts.length === 0) {
    return "Select shifts";
  }
  const firstShift = day.shifts[0];
  let display = firstShift.shift || "Unnamed Shift";
  if (day.shifts.length > 1) {
    display += ` +${day.shifts.length - 1} more`;
  }
  return display;
};

const getTimeDisplay = (day) => {
  if (day.shifts.length === 0) {
    return "";
  }
  const firstShift = day.shifts[0];
  let display = `${formatTime(firstShift.entryTime)} - ${formatTime(firstShift.exitTime)}`;
  if (day.shifts.length > 1) {
    display += ` +${day.shifts.length - 1} more`;
  }
  return display;
};

const fetchShifts = async () => {
  loadingShifts.value = true;
  loadingStates.value.shifts = true;
  try {
    const token = authService.getToken();
    await currentUserTenant.initialize();
    const tenantId = props.tenantId || currentUserTenant.getTenantId();

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/shifts/?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch shifts");

    const data = await response.json();
    allShifts.value = data.data;
  } catch (error) {
    console.error("Error fetching shifts:", error);
  } finally {
    loadingShifts.value = false;
    loadingStates.value.shifts = false;
  }
};

const openManageShifts = async (day) => {
  // Create a deep copy of the day to avoid reference issues
  selectedDay.value = JSON.parse(JSON.stringify(day));
  await fetchShifts();
  showManageShiftsDialog.value = true;
};
const closeManageShiftsDialog = () => {
  if (selectedDay.value) {
    // Update the original day in internalWeekDays with the modified shifts
    const dayIndex = internalWeekDays.value.findIndex(
      (day) => day.key === selectedDay.value.key,
    );

    if (dayIndex > -1) {
      // Update the shifts but preserve other properties
      internalWeekDays.value[dayIndex].shifts = JSON.parse(
        JSON.stringify(selectedDay.value.shifts),
      );
      // Force reactivity
      internalWeekDays.value = [...internalWeekDays.value];
    }

    updateWeekDays();
  }

  showManageShiftsDialog.value = false;
  selectedDay.value = null;
};

const isShiftSelected = (shift) => {
  if (!selectedDay.value || !selectedDay.value.shifts) return false;

  return selectedDay.value.shifts.some(
    (selectedShift) => selectedShift.id === shift.id,
  );
};
const selectShift = (shift) => {
  if (!selectedDay.value) return;

  // Create a deep copy of the shift to avoid reference issues
  const shiftCopy = JSON.parse(JSON.stringify(shift));

  // Check if shift already exists by ID
  const existingIndex = selectedDay.value.shifts.findIndex(
    (s) => s.id === shiftCopy.id,
  );

  if (existingIndex > -1) {
    // Remove the shift
    selectedDay.value.shifts.splice(existingIndex, 1);
  } else {
    // Add the shift
    selectedDay.value.shifts.push(shiftCopy);
  }

  // Force reactivity update
  selectedDay.value.shifts = [...selectedDay.value.shifts];
};

const assignToAll = () => {
  if (!selectedDay.value) return;

  // Create a deep copy of the shifts
  const selectedShiftsToAssign = JSON.parse(
    JSON.stringify(selectedDay.value.shifts),
  );

  // Update all working days with the same shifts
  internalWeekDays.value = internalWeekDays.value.map((day) => {
    if (day.isWorking) {
      return {
        ...day,
        shifts: JSON.parse(JSON.stringify(selectedShiftsToAssign)),
      };
    }
    return day;
  });

  updateWeekDays();
  closeManageShiftsDialog();
};
const resetSelectedDay = () => {
  if (selectedDay.value) {
    const originalDay = internalWeekDays.value.find(
      (day) => day.key === selectedDay.value.key,
    );
    if (originalDay) {
      selectedDay.value.shifts = JSON.parse(JSON.stringify(originalDay.shifts));
    }
  }
};
const updateWeekDays = () => {
  internalWeekDays.value.forEach((day) => {
    if (!day.isWorking) {
      day.shifts = [];
    }
  });
  emit("update:modelValue", internalWeekDays.value);
};

const handleRowClick = async (event, day) => {
  // Check if the click came from a switch or its label
  const isSwitchClick =
    event.target.closest(".v-switch") ||
    event.target.closest(".custom-switch") ||
    event.target.closest(".status-cell");

  if (!isSwitchClick && day.isWorking) {
    await openManageShifts(day);
  }
};
onMounted(() => {
  internalWeekDays.value = JSON.parse(JSON.stringify(props.modelValue));
  fetchShifts();
});

watch(
  () => props.modelValue,
  (newVal) => {
    internalWeekDays.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true },
);

watch(
  () => props.tenantId,
  (newVal) => {
    if (newVal) {
      fetchShifts();
    }
  },
);
</script>

<style scoped>
.working-hours-container {
  width: 100%;
  height: auto;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: -1.5rem;
}

.day-cell {
  font-size: 18px;
  font-weight: bold;
}

.status-cell {
  min-width: 250px;
}

.status-cell .d-flex {
  gap: 8px;
}

.status-text {
  font-size: 16px;
  line-height: 24px;
}

.shifts-actions-cell {
  flex: 1;
  display: flex;
  cursor: pointer;
}

.shift-select-field {
  min-width: 120px;
  max-width: 200px;
  cursor: pointer;
}

.time-display {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
}
.clickable-field {
  cursor: pointer;
}

/* Also target Vuetify's internal classes */
:deep(.clickable-field .v-field) {
  cursor: pointer;
}

:deep(.clickable-field .v-field__input) {
  cursor: pointer;
}
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  font-size: 16px;
  height: 40px;
}

:deep(.custom-switch) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.v-switch__track) {
  opacity: 1;
}

.shift-list-item {
  border-radius: 8px;
  margin: 8px 0;
}

.shift-selected {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.shift-selected .v-list-item__content) {
  opacity: 1;
}

.float-right {
  position: absolute;
  right: 12px;
  top: 12px;
}

.gap-4 {
  gap: 1rem;
}

.break-item {
  display: block;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
}

.break-time small {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.2;
}

/* Custom styling for DataTable integration */

/* Responsive adjustments */
@media (max-width: 768px) {
  .working-hours-container {
    height: auto;
  }

  .day-cell {
    font-size: 16px;
  }

  .status-cell {
    min-width: auto;
    width: 100%;
    justify-content: flex-start;
  }

  .shift-select-field {
    min-width: 100px;
    max-width: 150px;
  }

  .time-display {
    font-size: 12px;
  }
}
</style>

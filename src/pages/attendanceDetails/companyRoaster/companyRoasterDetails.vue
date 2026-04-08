<template>
  <div class="calendar-container">
    <!-- Success message notification -->
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
    <!-- Calendar View -->
    <div
      class="calendar-view"
      :class="{
        'with-filter': showFilters,
        'with-shift-drawer': showShiftDrawer,
      }"
    >
      <div class="calendar-header">
        <div class="d-flex justify-space-between align-center px-4 py-2">
          <v-chip class="ml-2 name-chip" color="primary" text-color="white">
            {{ props.attendanceData[0]["name"] }}
          </v-chip>
          <div class="d-flex align-center">
            <v-btn icon @click="previousMonth">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <h2 class="text-h5 font-weight-medium mx-4">
              {{ currentMonthYear }}
            </h2>
            <v-btn icon @click="nextMonth">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <div class="d-flex align-center">
            <!-- Only show CURRENT MONTH button if not already on current month -->
            <v-btn
              v-if="!isCurrentMonthDisplayed"
              text
              @click="today"
              color="primary"
            >
              GO TO CURRENT MONTH
            </v-btn>
            <v-btn
              v-if="selectionMode === 'week'"
              text
              @click="toggleSelectionMode"
              color="primary"
              class="ml-2"
            >
              SWITCH TO DAY MODE
            </v-btn>
            <v-btn
              v-else
              text
              @click="toggleSelectionMode"
              color="primary"
              class="ml-2"
            >
              SWITCH TO WEEK MODE
            </v-btn>
          </div>
        </div>
      </div>

      <div class="calendar-body">
        <div class="calendar-grid">
          <div class="calendar-days">
            <div v-for="day in daysOfWeek" :key="day" class="day-header">
              {{ day }}
            </div>
          </div>

          <div class="calendar-dates">
            <div
              v-for="date in calendarDates"
              :key="date.fullDate"
              class="date-cell"
              :class="{
                'current-month': date.currentMonth,
                today: date.isToday,
                selected: isSelected(date),
                'week-selected': isInSelectedWeek(date),
                'has-event': hasShifts(date),
                'non-selectable': !isDateSelectable(date),
              }"
              @click="selectDate(date)"
            >
              <span class="date-number">{{ date.day }}</span>
              <div v-if="hasShifts(date)" class="event-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Filter Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <h3 class="text-h6">Filters</h3>
        </div>
        <div class="filter-content">
          <v-text-field
            v-model="filters.dateFrom"
            label="Date From"
            type="date"
            outlined
            dense
          ></v-text-field>
          <v-text-field
            v-model="filters.dateTo"
            label="Date To"
            type="date"
            outlined
            dense
          ></v-text-field>
          <v-select
            v-model="filters.branch"
            :items="branchOptions"
            label="Branch"
            outlined
            dense
          ></v-select>
          <v-select
            v-model="filters.department"
            :items="departmentOptions"
            label="Department"
            outlined
            dense
          ></v-select>
          <v-select
            v-model="filters.shift"
            :items="shiftOptions"
            label="Shift"
            outlined
            dense
          ></v-select>
        </div>
        <div class="filter-actions">
          <v-btn text @click="clearFilters">Clear</v-btn>
          <v-btn color="primary" @click="applyFilters">Apply</v-btn>
        </div>
      </div>
    </transition>

    <!-- Right Shift Selection Drawer -->
    <transition name="slide">
      <div v-if="showShiftDrawer" class="shift-drawer">
        <div class="shift-drawer-header">
          <h3 class="text-h6">
            <v-icon left color="primary">mdi-calendar-clock</v-icon>
            {{
              selectionMode === "day"
                ? "Select Shifts for " + format(selectedDate, "MMMM d, yyyy")
                : "Select Shifts for Week of " +
                  format(selectedWeekStart, "MMMM d") +
                  " - " +
                  format(selectedWeekEnd, "MMMM d, yyyy")
            }}
          </h3>
          <v-btn icon @click="closeShiftDrawer">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="shift-drawer-content">
          <v-list v-if="props.selectedUserIds.length === 1">
            <v-list-item
              v-for="(shift, index) in shifts"
              :key="index"
              @click="toggleShiftSelection(shift)"
              :class="{ 'selected-shift': isShiftSelected(shift) }"
            >
              <v-list-item-icon>
                <v-icon :color="getShiftColor(shift)">{{
                  getShiftIcon(shift)
                }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ shift.shift }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ shift.entryTime }} - {{ shift.exitTime }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon v-if="isShiftSelected(shift)" color="success"
                  >mdi-check-circle</v-icon
                >
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item
              v-for="(shift, index) in availableShifts"
              :key="index"
              @click="toggleShiftSelection(shift)"
              :class="{ 'selected-shift': isShiftSelected(shift) }"
            >
              <v-list-item-icon>
                <v-icon :color="getShiftColor(shift)">{{
                  getShiftIcon(shift)
                }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ shift.shift }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ shift.entryTime }} - {{ shift.exitTime }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon v-if="isShiftSelected(shift)" color="success"
                  >mdi-check-circle</v-icon
                >
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
        <div class="shift-drawer-actions">
          <v-btn
            color="primary"
            @click="handleSave"
            :disabled="isSaving"
            class="mr-4"
          >
            {{ isSaving ? "Saving..." : "Save" }}
          </v-btn>
          <v-btn text @click="closeShiftDrawer">Cancel</v-btn>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import axios from "axios";

import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
  isWithinInterval,
  isSameYear,
} from "date-fns";

const showFilters = ref(false);
const showShiftDrawer = ref(false);
const selectedDate = ref(new Date());
const currentDate = ref(new Date());
const selectedShifts = ref({});
const userShifts = ref([]);
const selectionMode = ref("day");
const selectedWeekStart = ref(null);
const selectedWeekEnd = ref(null);
const selectedWeekDates = ref([]);
const isSaving = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Function to show success message
const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};
const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const filters = ref({
  dateFrom: "",
  dateTo: "",
  month: "",
  branch: null,
  department: null,
  shift: null,
});

const props = defineProps({
  selectedUser: {
    type: Object,
    required: true,
  },
  attendanceData: {
    type: Array,
    required: true,
  },
  selectedUserIds: {
    type: Array,
    required: true,
  },
});

const token = authService.getToken();
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const shifts = ref([]);

// Add a computed property to check if the current month is displayed
const isCurrentMonthDisplayed = computed(() => {
  const today = new Date();
  return (
    isSameMonth(currentDate.value, today) &&
    isSameYear(currentDate.value, today)
  );
});

const fetchShifts = async () => {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/items/shifts?filter[_and][0][_and][0][tenant][tenantId][_eq]=${
        currentUserTenant["tenantId"]
      }`,
      {
        headers: headers,
      },
    );
    shifts.value = response.data.data;
  } catch (error) {
    console.error("Error fetching shifts:", error);
  }
};

const fetchUserShifts = async () => {
  if (props.selectedUserIds.length === 1) {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/items/flexibleShift?fields[]=employee,shiftDate,id,shifts.shifts_id.id,shifts.id&filter[_and][0][_and][0][employee][id][_eq]=${
          props.selectedUserIds[0]
        }`,
        {
          headers: headers,
        },
      );
      console.log("User shifts data:", JSON.stringify(response.data));
      userShifts.value = response.data.data.map((shift) => ({
        ...shift,
        shifts: Array.isArray(shift.shifts) ? shift.shifts : [shift.shifts],
      }));
    } catch (error) {
      console.error("Error fetching user shifts:", error);
    }
  } else {
    userShifts.value = [];
  }
};

onMounted(() => {
  fetchShifts();
  fetchUserShifts();
  const selectedUser =
    typeof props.selectedUser === "string"
      ? JSON.parse(props.selectedUser)
      : props.selectedUser;
});

watch(() => props.selectedUserIds, fetchUserShifts);

const branchOptions = ["Main Branch", "Branch 1", "Branch 2"];
const departmentOptions = ["IT", "HR", "Finance", "Operations"];
const shiftOptions = computed(() => shifts.value.map((shift) => shift.shift));

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const currentMonthYear = computed(() => {
  return format(currentDate.value, "MMMM yyyy");
});

const calendarDates = computed(() => {
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(
    (date) => ({
      fullDate: format(date, "yyyy-MM-dd"),
      day: format(date, "d"),
      currentMonth: isSameMonth(date, currentDate.value),
      isToday: isToday(date),
    }),
  );
});

const isDateSelectable = computed(() => {
  return (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date.fullDate) > today;
  };
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1);
};

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1);
};

const today = () => {
  currentDate.value = new Date();
};

// Modified to automatically select current month and show drawer when switching to week mode
const toggleSelectionMode = () => {
  if (selectionMode.value === "week") {
    selectionMode.value = "day";
    selectedWeekDates.value = [];
    selectedWeekStart.value = null;
    selectedWeekEnd.value = null;

    // Set to current date and show drawer when switching to day mode
    const today = new Date();
    selectedDate.value = today;
    showShiftDrawer.value = true;
  } else {
    selectionMode.value = "week";

    // Set to current month
    currentDate.value = new Date();

    // Select the current week
    const today = new Date();
    selectedDate.value = today;
    selectedWeekStart.value = startOfWeek(today);
    selectedWeekEnd.value = endOfWeek(today);

    selectedWeekDates.value = eachDayOfInterval({
      start: selectedWeekStart.value,
      end: selectedWeekEnd.value,
    }).map((date) => format(date, "yyyy-MM-dd"));

    // Show the drawer automatically
    showShiftDrawer.value = true;
  }

  showFilters.value = false;
};

const isInSelectedWeek = (date) => {
  if (!selectedWeekStart.value || !selectedWeekEnd.value) return false;

  const dateObj = new Date(date.fullDate);
  return isWithinInterval(dateObj, {
    start: selectedWeekStart.value,
    end: selectedWeekEnd.value,
  });
};

const selectDate = (date) => {
  if (!isDateSelectable.value(date)) return;

  const dateObj = new Date(date.fullDate);

  if (selectionMode.value === "day") {
    selectedDate.value = dateObj;
    showShiftDrawer.value = true;
  } else {
    selectedDate.value = dateObj;
    selectedWeekStart.value = startOfWeek(dateObj);
    selectedWeekEnd.value = endOfWeek(dateObj);

    selectedWeekDates.value = eachDayOfInterval({
      start: selectedWeekStart.value,
      end: selectedWeekEnd.value,
    }).map((date) => format(date, "yyyy-MM-dd"));

    showShiftDrawer.value = true;
  }
};

const closeShiftDrawer = () => {
  showShiftDrawer.value = false;
};

const isSelected = (date) => {
  if (selectionMode.value === "day") {
    return format(selectedDate.value, "yyyy-MM-dd") === date.fullDate;
  } else {
    return isInSelectedWeek(date);
  }
};

const clearFilters = () => {
  filters.value = {
    dateFrom: "",
    dateTo: "",
    month: "",
    branch: null,
    department: null,
    shift: null,
  };
};

const applyFilters = () => {
  showFilters.value = false;
  // Add your filter logic here
};

const availableShifts = computed(() => {
  if (props.selectedUserIds.length === 1) {
    const dateKey = format(selectedDate.value, "yyyy-MM-dd");
    const userShiftsForDate = userShifts.value.filter(
      (shift) => format(parseISO(shift.shiftDate), "yyyy-MM-dd") === dateKey,
    );
    const selectedShiftIds = userShiftsForDate.flatMap((shift) =>
      shift.shifts.map((s) => s.shifts_id.id),
    );
    return shifts.value.filter((shift) => !selectedShiftIds.includes(shift.id));
  } else {
    return shifts.value;
  }
});

const fetchFlexibleShiftByFilter = async (employee, shiftId, date) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/flexibleShift?fields[]=id&fields[]=shifts.id,shifts.shifts_id.id,shifts.shifts_id.shift&filter[_and][0][_and][0][employee][id][_eq]=${employee}&filter[_and][0][_and][1][shifts][shifts_id][id][_eq]=${shiftId}&filter[_and][0][_and][2][shiftDate][_eq]=${date}`,
      {
        headers: headers,
      },
    );
    console.log(
      "Fetched flexible shifts by filter:",
      JSON.stringify(response.data.data),
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching flexible shifts by filter:", error);
    return [];
  }
};

const deleteShiftImmediately = async (flexibleShiftId, shiftId) => {
  try {
    console.log(
      `Deleting shift ID ${shiftId} from flexible shift ID ${flexibleShiftId}`,
    );
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/items/flexibleShift/${flexibleShiftId}`,
      {
        shifts: {
          delete: [shiftId],
        },
      },
      {
        headers: headers,
      },
    );
    console.log("Shift deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting shift:", error);
    throw error;
  }
};

const deleteFlexibleShift = async (flexibleShiftId) => {
  try {
    console.log(`Deleting entire flexible shift ID ${flexibleShiftId}`);
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/items/flexibleShift/${flexibleShiftId}`,
      {
        headers: headers,
      },
    );
    console.log("Flexible shift deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting flexible shift:", error);
    throw error;
  }
};

const deleteMultipleFlexibleShifts = async (ids) => {
  try {
    console.log(
      `Deleting multiple flexible shifts with IDs: ${ids.join(", ")}`,
    );
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/items/flexibleShift`,
      {
        data: {
          keys: ids,
        },
        headers: headers,
      },
    );
    console.log(
      "Multiple flexible shifts deleted successfully:",
      response.data,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting multiple flexible shifts:", error);
    throw error;
  }
};

const toggleShiftSelection = async (shift) => {
  if (selectionMode.value === "day") {
    const dateKey = format(selectedDate.value, "yyyy-MM-dd");
    await toggleShiftForDate(shift, dateKey);
  } else {
    for (const dateKey of selectedWeekDates.value) {
      if (isDateSelectable.value({ fullDate: dateKey })) {
        await toggleShiftForDate(shift, dateKey);
      }
    }
  }
};

const toggleShiftForDate = async (shift, dateKey) => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    if (props.selectedUserIds.length === 1) {
      // Check if the shift is already selected for this date
      const isShiftAlreadySelected = isShiftSelectedForDate(shift, dateKey);

      if (isShiftAlreadySelected) {
        // UNSELECT SHIFT - This is the part we need to fix
        try {
          // Fetch ALL records for this employee, date, and shift ID
          const flexibleShiftData = await fetchFlexibleShiftByFilter(
            props.selectedUserIds[0],
            shift.id,
            dateKey,
          );

          console.log(
            `Found ${flexibleShiftData.length} records to process for shift ID ${shift.id} on ${dateKey}`,
          );

          // Process each record that contains this shift
          for (const record of flexibleShiftData) {
            const matchingShifts = record.shifts.filter(
              (s) => s.shifts_id.id === shift.id,
            );

            if (matchingShifts.length === 0) {
              console.log(
                `No matching shifts found in record ID ${record.id}, skipping`,
              );
              continue;
            }

            // If this is the only shift in the record, delete the entire record
            if (record.shifts.length === matchingShifts.length) {
              await deleteFlexibleShift(record.id);
              console.log(
                `Deleted entire record ID: ${record.id} as it only contained the shift being removed`,
              );
            } else {
              // Otherwise, delete just the matching shifts
              for (const matchingShift of matchingShifts) {
                await deleteShiftImmediately(record.id, matchingShift.id);
                console.log(
                  `Deleted shift ID: ${matchingShift.id} from record ID: ${record.id}`,
                );
              }
            }
          }

          // Update local state to reflect changes
          const updatedUserShifts = userShifts.value.filter((userShift) => {
            if (
              format(parseISO(userShift.shiftDate), "yyyy-MM-dd") !== dateKey
            ) {
              return true;
            }

            // Remove shifts with the matching shift ID
            userShift.shifts = userShift.shifts.filter(
              (s) => s.shifts_id.id !== shift.id,
            );

            // Keep the record if it still has shifts
            return userShift.shifts.length > 0;
          });

          userShifts.value = updatedUserShifts;
        } catch (error) {
          console.error("Error removing shift:", error);
          await fetchUserShifts(); // Refresh data if there was an error
        }
      } else {
        // ADD SHIFT - This part remains mostly the same
        const existingShiftIndex = userShifts.value.findIndex(
          (userShift) =>
            format(parseISO(userShift.shiftDate), "yyyy-MM-dd") === dateKey,
        );

        if (existingShiftIndex !== -1) {
          // Add to existing record
          const existingShift = userShifts.value[existingShiftIndex];
          existingShift.shifts.push({ shifts_id: { id: shift.id } });

          const payload = {
            shiftDate: dateKey,
            employee: props.selectedUserIds[0],
            shifts: {
              create: [
                {
                  flexibleShift_id: "+",
                  shifts_id: {
                    id: shift.id,
                  },
                },
              ],
              update: [],
              delete: [],
            },
            existingId: existingShift.id,
          };

          await sendPayloadToServer(payload, dateKey);
        } else {
          // Create new record
          userShifts.value.push({
            shiftDate: dateKey,
            shifts: [{ shifts_id: { id: shift.id } }],
          });

          const payload = {
            shiftDate: dateKey,
            employee: props.selectedUserIds[0],
            shifts: {
              create: [
                {
                  flexibleShift_id: "+",
                  shifts_id: {
                    id: shift.id,
                  },
                },
              ],
              update: [],
              delete: [],
            },
          };

          await sendPayloadToServer(payload, dateKey);
        }
      }
    } else {
      // Multiple users logic - remains the same
      if (!selectedShifts.value[dateKey]) {
        selectedShifts.value[dateKey] = [];
      }

      const index = selectedShifts.value[dateKey].findIndex(
        (s) => s.shift === shift.shift,
      );

      if (index === -1) {
        selectedShifts.value[dateKey].push(shift);

        const payloads = props.selectedUserIds.map((userId) => ({
          shiftDate: dateKey,
          employee: userId,
          shifts: {
            create: [
              {
                flexibleShift_id: "+",
                shifts_id: {
                  id: shift.id,
                },
              },
            ],
            update: [],
            delete: [],
          },
        }));

        await sendPayloadToServer(payloads, dateKey);
      } else {
        selectedShifts.value[dateKey].splice(index, 1);

        for (const userId of props.selectedUserIds) {
          const flexibleShiftData = await fetchFlexibleShiftByFilter(
            userId,
            shift.id,
            dateKey,
          );

          for (const record of flexibleShiftData) {
            const matchingShifts = record.shifts.filter(
              (s) => s.shifts_id.id === shift.id,
            );

            if (matchingShifts.length === 0) continue;

            if (record.shifts.length === matchingShifts.length) {
              await deleteFlexibleShift(record.id);
            } else {
              for (const matchingShift of matchingShifts) {
                await deleteShiftImmediately(record.id, matchingShift.id);
              }
            }
          }
        }
      }
    }

    // Refresh user shifts data after changes
    await fetchUserShifts();
  } catch (error) {
    console.error("Error in toggleShiftForDate:", error);
  } finally {
    isSaving.value = false;
  }
};

const isShiftSelected = (shift) => {
  if (selectionMode.value === "day") {
    return isShiftSelectedForDate(
      shift,
      format(selectedDate.value, "yyyy-MM-dd"),
    );
  } else {
    return selectedWeekDates.value.some((dateKey) =>
      isShiftSelectedForDate(shift, dateKey),
    );
  }
};

const isShiftSelectedForDate = (shift, dateKey) => {
  if (props.selectedUserIds.length === 1) {
    return userShifts.value.some(
      (userShift) =>
        format(parseISO(userShift.shiftDate), "yyyy-MM-dd") === dateKey &&
        userShift.shifts.some((s) => s.shifts_id.id === shift.id),
    );
  } else {
    return (
      selectedShifts.value[dateKey]?.some((s) => s.shift === shift.shift) ||
      false
    );
  }
};

const hasShifts = (date) => {
  const dateKey = format(new Date(date.fullDate), "yyyy-MM-dd");
  return userShifts.value.some(
    (shift) => format(parseISO(shift.shiftDate), "yyyy-MM-dd") === dateKey,
  );
};

const createPayloadForDate = (dateKey) => {
  if (props.selectedUserIds.length === 1) {
    const userId = props.selectedUserIds[0];
    const shiftsForDate = userShifts.value.find(
      (shift) => format(parseISO(shift.shiftDate), "yyyy-MM-dd") === dateKey,
    );

    const shiftsToDelete = [];
    if (shiftsForDate) {
      shiftsForDate.shifts.forEach((shift) => {
        if (shift.id) {
          shiftsToDelete.push(shift.id);
        }
      });
    }

    return {
      shiftDate: dateKey,
      employee: userId,
      shifts: {
        create: shiftsForDate
          ? shiftsForDate.shifts
              .filter((shift) => !shift.id)
              .map((shift) => ({
                flexibleShift_id: "+",
                shifts_id: {
                  id: shift.shifts_id.id,
                },
              }))
          : [],
        update: [],
        delete: shiftsToDelete,
      },
      existingId: shiftsForDate?.id,
    };
  } else {
    const shiftsForDate = selectedShifts.value[dateKey] || [];
    return props.selectedUserIds.map((userId) => ({
      shiftDate: dateKey,
      employee: userId,
      shifts: {
        create: shiftsForDate.map((shift) => ({
          flexibleShift_id: "+",
          shifts_id: {
            id: shift.id,
          },
        })),
        update: [],
        delete: [],
      },
    }));
  }
};

const sendPayloadToServer = async (payload, dateIdentifier) => {
  try {
    let url = `${import.meta.env.VITE_API_URL}/items/flexibleShift`;
    let method = "post";

    if (!Array.isArray(payload) && payload.existingId) {
      method = "patch";
      url += `/${payload.existingId}`;
      delete payload.existingId;
    }

    const response = await axios({
      method: method,
      url: url,
      data: payload,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Shifts saved for ${dateIdentifier}:`, response.data);
  } catch (error) {
    console.error(`Error saving shifts for ${dateIdentifier}:`, error);
  }
};

const getShiftColor = (shift) => {
  const hour = parseInt(shift.entryTime.split(":")[0]);
  if (hour >= 5 && hour < 12) return "orange";
  if (hour >= 12 && hour < 18) return "green";
  return "blue";
};

const getShiftIcon = (shift) => {
  const hour = parseInt(shift.entryTime.split(":")[0]);
  if (hour >= 5 && hour < 12) return "mdi-weather-sunny";
  if (hour >= 12 && hour < 18) return "mdi-weather-partly-cloudy";
  return "mdi-weather-night";
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    await fetchUserShifts();
    closeShiftDrawer();
    showSuccessMessage("Saved successfully");
  } catch (error) {
    console.error("Error fetching user shifts:", error);
    showErrorMessage("Error: Failed to save shifts");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.v-data-table ::v-deep thead th {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  background: #f5f7f9;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}
.calendar-container {
  height: 100vh;
  width: 100%;
  display: flex;
  background-color: white;
  position: relative;
  overflow: hidden;
}

.calendar-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease;
}

.calendar-view.with-filter {
  margin-right: 300px;
}

.calendar-view.with-shift-drawer {
  margin-right: 300px;
}

.calendar-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.calendar-body {
  flex: 1;
  overflow: auto;
}

.calendar-grid {
  height: calc(90vh - 64px);
  display: flex;
  flex-direction: column;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f7f9;
  border-bottom: 1px solid #e0e0e0;
}

.day-header {
  padding: 12px;
  text-align: center;
  font-weight: 500;
  color: #1a1a1a;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 1fr;
  flex: 1;
}

.date-cell {
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.date-cell:hover {
  background-color: #f0f0f0;
}

.date-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 500;
}

.date-cell:not(.current-month) {
  color: #bbb;
}

.date-cell.today .date-number {
  background: #e8f5e9;
  color: #4caf50;
}

.date-cell.selected .date-number {
  background: #1976d2;
  color: white;
}

.date-cell.week-selected .date-number {
  background: #1976d2;
  color: white;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1976d2;
  margin-top: 4px;
}

.filter-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding-top: 60px;
}

.filter-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.filter-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.shift-drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding-top: 60px;
}

.shift-drawer-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shift-drawer-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.shift-drawer-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 24px; /* Increased gap between buttons */
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

:deep(.v-text-field.v-text-field--enclosed .v-text-field__details) {
  display: none;
}

:deep(.v-text-field__slot) {
  min-height: 40px;
}

.v-select {
  font-size: 14px;
}

.v-select :deep(.v-input__slot) {
  min-height: 40px;
}
.selected-shift {
  background-color: #e3f2fd;
}

.date-cell.non-selectable {
  opacity: 0.5;
  cursor: not-allowed;
}

.date-cell.non-selectable:hover {
  background-color: transparent;
}

/* New styles for the name chip */
.name-chip {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  padding: 0 16px !important;
  height: 36px !important;
}
</style>

<template>
  <div class="calendar-view">
    <div class="main-content">
      <div class="calendar-section">
        <div class="header-actions">
          <div class="title-section">
            <h2 class="text-h5">{{ monthName }} {{ year }} Attendance</h2>
          </div>
          <div class="action-section">
            <div class="cycle-info mr-4">
              <!-- <span class="cycle-type">{{ cycleType }}</span> -->
              <span class="cycle-dates ml-2"
                >{{ formattedCycleStartDate }} -
                {{ formattedCycleEndDate }}</span
              >
            </div>
            <v-btn
              color="primary"
              @click="confirmMarkAllPresent"
              :disabled="loading || isAttendanceLocked"
            >
              Mark All Present
            </v-btn>
          </div>
        </div>

        <div v-if="isAttendanceLocked" class="locked-notification">
          <v-icon color="warning" class="mr-2">mdi-lock</v-icon>
          <span
            >This attendance can't be edited because it's already verified. No
            mode add or edit the attendance, only can view the data.</span
          >
        </div>

        <div v-if="loading" class="loading-indicator">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <span class="ml-2">Loading attendance data...</span>
        </div>

        <div v-else>
          <div class="calendar-weekdays">
            <div v-for="day in weekDays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>

          <div class="calendar-grid">
            <div
              v-for="(date, index) in allCalendarDates"
              :key="index"
              class="calendar-day"
              :class="{
                'outside-month': !isCurrentMonth(date),
                'not-on-cycle': !isDateInCycle(date),
                locked: isAttendanceLocked || !isDateInCycle(date),
              }"
              @click="isDateInCycle(date) ? openPopup(date) : null"
            >
              <div class="day-number">{{ date.getDate() }}</div>
              <div class="attendance-status" :class="getAttendanceClass(date)">
                {{ getAttendanceStatus(date).status }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="calendarAttendanceData.length > 0" class="debug-info mt-4">
          <!-- <p>API data loaded: {{ calendarAttendanceData.length }} records</p> -->
        </div>

        <AttendancePopup
          v-if="showPopup"
          :empid="props.employee?.id"
          :day="selectedDay"
          :month="selectedMonth"
          :year="selectedYear"
          :selectedDate="selectedDate"
          :AttendanceId="selectedAttendanceId"
          :attendanceStatuses="attendanceStatuses"
          :currentStatus="currentAttendanceStatus"
          :isLocked="isAttendanceLocked"
          @close="closePopup"
          @update="updateAttendance"
        />

        <v-dialog v-model="showConfirmationDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h5">Confirm Action</v-card-title>
            <v-card-text>
              <p v-if="hasExistingData">
                This month already has attendance data. Do you want to overwrite
                all days as "Present"?
              </p>
              <p v-else>
                Are you sure you want to mark all days in {{ monthName }} as
                "Present"?
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="showConfirmationDialog = false"
                >Cancel</v-btn
              >
              <v-btn color="primary" @click="markAllPresent">Confirm</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

      <div class="summary-section">
        <h3 class="summary-title">Attendance Summary</h3>
        <div class="summary-content">
          <div v-if="loading" class="loading-indicator">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
            <span class="ml-2">Loading summary...</span>
          </div>
          <div v-else-if="summaryData" class="summary-items">
            <div class="summary-item">
              <span class="summary-label">Total PayableDays:</span>
              <span class="summary-value">{{
                summaryData.totalDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Present:</span>
              <span class="summary-value">{{
                summaryData.presentDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Absent:</span>
              <span class="summary-value">{{
                summaryData.absentDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Week Off:</span>
              <span class="summary-value">{{
                summaryData.weekOffDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Holiday:</span>
              <span class="summary-value">{{
                summaryData.holidayDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Paid Leave:</span>
              <span class="summary-value">{{
                summaryData.paidLeaveDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Unpaid Leave:</span>
              <span class="summary-value">{{
                summaryData.unpaidLeaveDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Work From Home:</span>
              <span class="summary-value">{{
                summaryData.workFromHomeDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">On Duty:</span>
              <span class="summary-value">{{
                summaryData.onDutyDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Half Day:</span>
              <span class="summary-value">{{
                summaryData.halfDayDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Holiday Present:</span>
              <span class="summary-value">{{
                summaryData.holidayPresentDays || 0
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Week Off Present:</span>
              <span class="summary-value">{{
                summaryData.weekOffPresentDays || 0
              }}</span>
            </div>
          </div>
          <div v-else class="no-data">No summary data available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import AttendancePopup from "./AttendancePopup.vue";
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { format } from "date-fns";

const props = defineProps({
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  attendanceData: {
    type: Array,
    default: () => [],
  },
  employee: {
    type: Object,
    required: true,
  },
});

const showPopup = ref(false);
const selectedDay = ref(null);
const selectedMonth = ref(null);
const selectedYear = ref(null);
const selectedDate = ref(null);
const selectedAttendanceId = ref(null);
const currentAttendanceStatus = ref("");
const loading = ref(false);
const calendarAttendanceData = ref([]);
const showConfirmationDialog = ref(false);
const hasExistingData = ref(false);
const cycleStartDate = ref(null);
const cycleEndDate = ref(null);
const cycleType = ref("Standard Cycle");
const cycleDates = ref([]);
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const isAttendanceLocked = ref(false);
const summaryData = ref(null);

const emit = defineEmits(["close"]);

const allCalendarDates = computed(() => {
  if (cycleDates.value.length === 0) return [];

  const firstCycleDate = cycleDates.value[0];
  const lastCycleDate = cycleDates.value[cycleDates.value.length - 1];

  const startDayOfWeek = firstCycleDate.getDay();
  const datesBeforeCycle = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(firstCycleDate);
    date.setDate(date.getDate() - (i + 1));
    datesBeforeCycle.push(date);
  }

  const endDayOfWeek = lastCycleDate.getDay();
  const datesAfterCycle = [];

  for (let i = 1; i <= 6 - endDayOfWeek; i++) {
    const date = new Date(lastCycleDate);
    date.setDate(date.getDate() + i);
    datesAfterCycle.push(date);
  }

  return [...datesBeforeCycle, ...cycleDates.value, ...datesAfterCycle];
});

const isDateInCycle = (date) => {
  if (!cycleStartDate.value || !cycleEndDate.value) return false;

  const cycleStart = new Date(cycleStartDate.value);
  const cycleEnd = new Date(cycleEndDate.value);

  return date >= cycleStart && date <= cycleEnd;
};

const goBack = () => {
  emit("close");
};

const monthName = computed(() => {
  return new Date(props.year, props.month).toLocaleString("default", {
    month: "long",
  });
});

const formattedCycleStartDate = computed(() => {
  if (!cycleStartDate.value) return "";
  return format(new Date(cycleStartDate.value), "MMM dd, yyyy");
});

const formattedCycleEndDate = computed(() => {
  if (!cycleEndDate.value) return "";
  return format(new Date(cycleEndDate.value), "MMM dd, yyyy");
});

const isCurrentMonth = (date) => {
  return date.getMonth() === props.month;
};

const hasAttendanceData = computed(() => {
  return calendarAttendanceData.value.length > 0;
});

onMounted(() => {
  fetchAttendanceData();
});

watch([() => props.month, () => props.year, () => props.employee?.id], () => {
  fetchAttendanceData();
});

const confirmMarkAllPresent = () => {
  if (isAttendanceLocked.value) return;

  hasExistingData.value = hasAttendanceData.value;
  showConfirmationDialog.value = true;
};

const markAllPresent = async () => {
  if (isAttendanceLocked.value) return;

  showConfirmationDialog.value = false;
  loading.value = true;

  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    if (!token || !tenantId || !props.employee?.id) {
      console.error("Missing required data");
      return;
    }

    const recordsToUpdate = [];
    const recordsToCreate = [];

    for (const date of cycleDates.value) {
      const dayOfWeek = date.getDay();
      const formattedDate = formatDateForAPI(date);

      const existingRecord = calendarAttendanceData.value.find(
        (r) => r.date === formattedDate,
      );

      let attendanceRecord;

      if (dayOfWeek === 0) {
        attendanceRecord = {
          employeeId: props.employee.id,
          tenant: tenantId,
          date: formattedDate,
          attendance: "weekOff",
          attendanceContext: "WeeklyOff",
          day: "0.0",
          inTime: "00:00",
          outTime: "00:00",
          mode: "manual",
          workHours: "00:00",
          leaveType: "none",
        };
      } else {
        attendanceRecord = {
          employeeId: props.employee.id,
          tenant: tenantId,
          date: formattedDate,
          attendance: "present",
          attendanceContext: "Present",
          day: "1.0",
          inTime: "09:00",
          outTime: "18:00",
          mode: "manual",
          workHours: "08:00",
          leaveType: "none",
        };
      }

      if (existingRecord && existingRecord.id) {
        recordsToUpdate.push({ ...attendanceRecord, id: existingRecord.id });
      } else {
        recordsToCreate.push(attendanceRecord);
      }
    }

    if (recordsToUpdate.length > 0) {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/items/attendance?many=1`,
        recordsToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (recordsToCreate.length > 0) {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/items/attendance`,
        recordsToCreate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    await fetchAttendanceData();
  } catch (error) {
    console.error("Error marking days:", error);
  } finally {
    loading.value = false;
  }
};

const fetchAttendanceData = async () => {
  if (!props.employee?.id) {
    return;
  }

  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    if (!token || !tenantId) {
      console.error("Authentication required or tenant not found");
      return;
    }

    const attendanceResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/attendance/monthly-dashboard?tenantId=${tenantId}&employeeId=${props.employee.id}&year=${props.year}&month=${props.month + 1}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Attendance dashboard response:", attendanceResponse.data);

    if (attendanceResponse.data && attendanceResponse.data.data) {
      const { summary, dailyRecords } = attendanceResponse.data.data;

      cycleStartDate.value = summary.cycleStartDate;
      cycleEndDate.value = summary.cycleEndDate;
      cycleType.value = summary.cycleType || "Standard Cycle";
      summaryData.value = {
        totalDays: summary.totalPayableDays || 0,
        presentDays: summary.present || 0,
        absentDays: summary.absent || 0,
        weekOffDays: summary.weekOff || 0,
        holidayDays: summary.holiday || 0,
        paidLeaveDays: summary.paidLeave || 0,
        unpaidLeaveDays: summary.unpaidLeave || 0,
        workFromHomeDays: summary.workFromHome || 0,
        onDutyDays: summary.onDuty || 0,
        halfDayDays: summary.halfDay || 0,
        holidayPresentDays: summary.holidayPresent || 0,
        weekOffPresentDays: summary.weekOffPresent || 0,
      };

      cycleDates.value = getAllDatesInRange(
        new Date(summary.cycleStartDate),
        new Date(summary.cycleEndDate),
      );

      const records = dailyRecords.map((record) => ({
        id: record.id,
        date: record.date,
        attendance: record.attendance,
        inTime: record.inTime || "-",
        outTime: record.outTime || "-",
        workHours: record.workHours || "-",
        lateBy: record.lateBy || "-",
        earlyDeparture: record.earlyDeparture || "-",
        breakTime: record.breakTime || "-",
        overTime: record.overTime || "-",
        mode: record.mode || "-",
        onTime: record.onTime || "-",
        leaveType: record.leaveType || "-",
      }));

      console.log(`Received ${records.length} attendance records from API`);
      calendarAttendanceData.value = records;

      isAttendanceLocked.value =
        attendanceResponse.data.meta?.lockedMonthAttendance === true;
    }
  } catch (error) {
    console.error("Error fetching calendar attendance data:", error);
  } finally {
    loading.value = false;
  }
};

const getAllDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAttendanceStatus = (date) => {
  if (!isDateInCycle(date)) {
    return { status: "notOnCycle", id: null };
  }

  const formattedDate = formatDateForAPI(date);
  const record = calendarAttendanceData.value.find(
    (r) => r.date === formattedDate,
  );

  if (record) {
    return { status: record.attendance, id: record.id };
  }

  return { status: "noRecord", id: null };
};

const getAttendanceClass = (date) => {
  const { status } = getAttendanceStatus(date);
  if (!status) return "";

  switch (status.toLowerCase().replace(/\s+/g, "")) {
    case "present":
      return "status-present";
    case "absent":
      return "status-absent";
    case "weekoff":
      return "status-week-off";
    case "holiday":
      return "status-holiday";
    case "holidaypresent":
      return "status-holiday-present";
    case "weekoffpresent":
      return "status-weekoff-present";
    case "unpaidleave":
      return "status-unpaid-leave";
    case "workfromhome":
      return "status-work-from-home";
    case "paidleave":
      return "status-paid-leave";
    case "onduty":
      return "status-on-duty";
    case "halfday":
      return "status-half-day";
    case "norecord":
      return "status-no-record";
    case "notoncycle":
      return "status-not-on-cycle";
    default:
      return "";
  }
};

const openPopup = (date) => {
  if (isAttendanceLocked.value || !isDateInCycle(date)) {
    return;
  }

  selectedDay.value = date.getDate();
  selectedMonth.value = date.getMonth();
  selectedYear.value = date.getFullYear();
  selectedDate.value = formatDateForAPI(date);

  const { status, id } = getAttendanceStatus(date);
  selectedAttendanceId.value = id;
  currentAttendanceStatus.value = status;

  console.log(
    `Opening popup for date ${selectedDate.value} with attendance ID: ${id}`,
  );
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
};

const updateAttendance = async (day, newStatus) => {
  if (isAttendanceLocked.value) {
    return;
  }

  const dateToUpdate = cycleDates.value.find(
    (d) =>
      d.getDate() === parseInt(day) &&
      d.getMonth() === selectedMonth.value &&
      d.getFullYear() === selectedYear.value,
  );

  if (dateToUpdate) {
    const formattedDate = formatDateForAPI(dateToUpdate);
    const index = calendarAttendanceData.value.findIndex(
      (r) => r.date === formattedDate,
    );

    if (index !== -1) {
      calendarAttendanceData.value[index].attendance = newStatus;
    } else {
      calendarAttendanceData.value.push({
        date: formattedDate,
        attendance: newStatus,
      });
    }
  }

  closePopup();
  await fetchAttendanceData();
};

const attendanceStatuses = [
  { label: "Present", class: "status-present" },
  { label: "Absent", class: "status-absent" },
  { label: "Week Off", class: "status-week-off" },
  { label: "Holiday", class: "status-holiday" },
  { label: "Holiday Present", class: "status-holiday-present" },
  { label: "Week Off Present", class: "status-weekoff-present" },
  { label: "Paid Leave", class: "status-paid-leave" },
  { label: "Unpaid Leave", class: "status-unpaid-leave" },
  { label: "On Duty", class: "status-on-duty" },
  { label: "workFromHome", class: "status-work-from-home" },
  { label: "Half Day", class: "status-half-day" },
];
</script>

<style scoped>
.calendar-view {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(90vh - 170px);
  overflow-y: auto;
}

.main-content {
  display: flex;
  gap: 20px;
}

.calendar-section {
  flex: 3;
}

.summary-section {
  flex: 1;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1e293b;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.summary-label {
  font-weight: 500;
  color: #64748b;
}

.summary-value {
  font-weight: 600;
  color: #1e293b;
}

.no-data {
  color: #64748b;
  font-style: italic;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  display: flex;
  align-items: center;
}

.action-section {
  display: flex;
  align-items: center;
}

.cycle-info {
  display: flex;
  align-items: center;
}

.cycle-type {
  font-weight: bold;
  background-color: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.cycle-dates {
  color: #64748b;
}

.back-button {
  margin-right: 8px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: #64748b;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.calendar-day {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: #f3f4f6;
}

.calendar-day.locked {
  cursor: not-allowed;
  opacity: 0.9;
}

.calendar-day.not-on-cycle {
  cursor: not-allowed;
  background-color: #f1f1f1;
}

.calendar-day.not-on-cycle:hover {
  background-color: #f1f1f1;
}

.day-number {
  font-weight: bold;
  margin-bottom: 5px;
  color: #1e293b;
}

.outside-month {
  background-color: #f8fafc;
}

.outside-month .day-number {
  color: #1e293b;
}

.attendance-status {
  font-size: 0.8rem;
  padding: 2px 4px;
  border-radius: 4px;
  margin-top: auto;
}

.debug-info {
  font-size: 0.8rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
}

.locked-notification {
  display: flex;
  align-items: center;
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.status-present {
  background-color: #4ade80;
  color: #ffffff;
}
.status-absent {
  background-color: #f87171;
  color: #ffffff;
}
.status-week-off {
  background-color: #60a5fa;
  color: #ffffff;
}
.status-work-from-home {
  background-color: #34d399;
  color: #ffffff;
}
.status-on-duty {
  background-color: #fbbf24;
  color: #ffffff;
}
.status-holiday {
  background-color: #a78bfa;
  color: #ffffff;
}
.status-paid-leave {
  background-color: #818cf8;
  color: #ffffff;
}
.status-unpaid-leave {
  background-color: #f472b6;
  color: #ffffff;
}
.status-half-day {
  background-color: #fb923c;
  color: #ffffff;
}
.status-holiday-present {
  background-color: #9333ea;
  color: #ffffff;
}
.status-weekoff-present {
  background-color: #2563eb;
  color: #ffffff;
}
.status-no-record {
  background-color: #e2e8f0;
  color: #64748b;
}
.status-not-on-cycle {
  background-color: #a8a8aa;
  color: #ffffff;
}
</style>

<template>
  <div class="popup-overlay" @click="$emit('close')">
    <div class="popup-content" @click.stop>
      <h3 class="text-h6 mb-4">Select Attendance for {{ formattedDate }}</h3>

      <div v-if="isLocked" class="locked-message">
        <v-icon small color="warning" class="mr-1">mdi-lock</v-icon>
        Attendance is locked and cannot be modified
      </div>

      <div class="attendance-options">
        <button
          v-for="status in attendanceStatuses"
          :key="status.label"
          :class="[
            'attendance-option',
            status.class,
            {
              active:
                currentStatus.toLowerCase() === status.label.toLowerCase(),
            },
          ]"
          @click="updateAttendance(status.label)"
          :disabled="isLoading || isLocked"
        >
          {{ status.label }}
        </button>
      </div>
      <div v-if="isLoading" class="loading-indicator">Updating...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button class="close-button" @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import { currentUserTenant } from "@/utils/currentUserTenant";

const props = defineProps({
  day: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  attendanceStatuses: {
    type: Array,
    required: true,
  },
  currentStatus: {
    type: String,
    required: true,
  },
  AttendanceId: {
    type: Number,
    required: false,
    default: null,
  },
  empid: {
    type: Number,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "update"]);

const formattedDate = computed(() => {
  return new Date(props.year, props.month, props.day).toLocaleDateString(
    "default",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
});

const isLoading = ref(false);
const error = ref(null);

const getToken = () => {
  return localStorage.getItem("token");
};

const updateAttendance = async (newStatus) => {
  if (props.isLocked) {
    error.value = "Cannot update: Attendance is locked for this month";
    return;
  }

  const token = authService.getToken();
  isLoading.value = true;
  error.value = null;

  if (!token) {
    error.value = "Authentication token not found. Please log in again.";
    isLoading.value = false;
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const attendanceMapping = {
      Present: { attendance: "present", day: "1.0", context: "Present" },
      Absent: { attendance: "absent", day: "0.0", context: "Absent" },
      "Week Off": { attendance: "weekOff", day: "0.0", context: "WeeklyOff" },
      "Work From Home": {
        attendance: "workFromHome",
        day: "1.0",
        context: "WorkFromHome",
      },
      "On Duty": { attendance: "onDuty", day: "1.0", context: "Present On OD" },
      Holiday: { attendance: "holiday", day: "0.0", context: "Holiday" },
      "Paid Leave": {
        attendance: "paidLeave",
        day: "1.0",
        context: "On Leave(CL)",
      },
      "Unpaid Leave": {
        attendance: "unPaidLeave",
        day: "0.0",
        context: "UnPaid Leave",
      },
      workFromHome: {
        attendance: "workFromHome",
        day: "1.0",
        context: "WorkFromHome",
      },
      "Half Day": { attendance: "halfDay", day: "0.5", context: "1/2Present" },
      "Holiday Present": {
        attendance: "holidayPresent",
        day: "1.0",
        context: "HolidayPresent",
      },
      "Week Off Present": {
        attendance: "weekoffPresent",
        day: "1.0",
        context: "WeeklyOff Present",
      },
    };

    const mappedStatus = attendanceMapping[newStatus] || {
      attendance: "present",
      day: "1.0",
      context: "Present",
    };

    let response;

    console.log(`Updating attendance with ID: ${props.AttendanceId}`);

    if (props.currentStatus && props.AttendanceId) {
      console.log(
        `Updating existing attendance record with ID: ${props.AttendanceId}`,
      );
      response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/items/attendance/${props.AttendanceId}`,
        {
          attendance: mappedStatus.attendance,
          day: mappedStatus.day,
          attendanceContext: mappedStatus.context,
        },
        { headers },
      );
    } else {
      console.log(
        `Creating new attendance record for employee ID: ${props.empid}`,
      );
      response = await axios.post(
        `${import.meta.env.VITE_API_URL}/items/attendance`,
        {
          attendance: mappedStatus.attendance,
          day: mappedStatus.day,
          attendanceContext: mappedStatus.context,
          employeeId: props.empid,
          date: props.selectedDate,
          tenant: await currentUserTenant.getTenantId(),
          leaveType: mappedStatus.attendance.includes("Leave")
            ? "casualLeave"
            : "none",
        },
        { headers },
      );
    }
    emit("update", props.day, newStatus);
  } catch (error) {
    console.error("Error updating attendance:", error);
    if (error.response) {
      error.value = `Failed to update attendance: ${error.response.data.message || error.response.statusText}`;
    } else if (error.request) {
      error.value =
        "Network error. Please check your connection and try again.";
    } else {
      error.value = "An unexpected error occurred. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log(`Employee ID: ${props.empid}`);
  console.log(`Attendance ID: ${props.AttendanceId}`);
});
</script>

<style scoped>
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
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  width: 400px;
}

.attendance-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.attendance-option {
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.3s ease;
}

.attendance-option:hover {
  opacity: 0.8;
}

.attendance-option.active {
  outline: 2px solid #000;
}

.attendance-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-button {
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: #d1d5db;
}

.loading-indicator {
  text-align: center;
  margin-top: 10px;
  font-style: italic;
  color: #666;
}

.error-message {
  color: #dc2626;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
}

.locked-message {
  color: #f59e0b;
  margin: 10px 0 15px;
  text-align: center;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff8e1;
  padding: 8px;
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
</style>

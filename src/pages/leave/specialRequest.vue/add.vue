<template>
  <div>
    <!-- Success and Error Snackbars remain unchanged -->
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

    <v-form ref="form" @submit.prevent="handleSave">
      <v-toolbar density="compact" color="white" flat>
        <v-btn icon @click="$emit('closeAddPage')" class="mr-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Add Work Preference</v-toolbar-title>
      </v-toolbar>

      <div class="pa-4">
        <v-card flat>
          <!-- Date Fields with Spacing -->
          <v-row class="date-row">
            <v-col cols="12" class="date-col">
              <v-text-field
                v-model="formData.from"
                label="Start Date *"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'Start date is required']"
                required
                hide-details="auto"
                :hint="cycleHint"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" class="date-col">
              <v-text-field
                v-model="formData.to"
                label="End Date *"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'End date is required']"
                required
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-label class="text-subtitle-1 font-weight-medium mb-2"
                >Work Preference *</v-label
              >
              <v-radio-group
                v-model="formData.workPreference"
                :rules="[(v) => !!v || 'Work preference is required']"
                @update:model-value="onWorkPreferenceChange"
                inline
              >
                <v-radio
                  label="Work From Home"
                  value="workFromHome"
                  color="primary"
                ></v-radio>
                <v-radio
                  label="On Duty"
                  value="onDuty"
                  color="primary"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="formData.reason"
                label="Reason *"
                :items="reasonOptions"
                variant="outlined"
                :rules="[(v) => !!v || 'Reason is required']"
                required
                :disabled="!formData.workPreference"
              />
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end gap-3">
              <BaseButton
                variant="danger"
                text="Cancel"
                @click="$emit('closeAddPage')"
                class="mr-2"
              />
              <BaseButton
                variant="primary"
                text="Save"
                type="submit"
                @click="handleSave"
              />
            </v-col>
          </v-row>
        </v-card>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const emits = defineEmits(["closeAddPage", "saved"]);

const form = ref(null);
const tenantId = currentUserTenant.getTenantId();
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const userDetails = ref(null);
const personalModuleData = ref(null);
const attendanceCycle = ref(null);
const isLoading = ref(true); // Added for reactivity timing

const formData = ref({
  from: null,
  to: null,
  workPreference: null,
  reason: null,
});

const reasonOptionsData = {
  workFromHome: [
    "Internet issues at office location",
    "Personal health concerns",
    "Family care responsibilities",
    "Remote work setup available",
    "Weather conditions",
  ],
  onDuty: [
    "Client meeting",
    "Site visit",
    "Training/Conference",
    "Business travel",
    "External audit",
  ],
};

const reasonOptions = computed(() => {
  if (!formData.value.workPreference) return [];
  return reasonOptionsData[formData.value.workPreference] || [];
});

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const getToken = () => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

const fetchUserData = async () => {
  try {
    const token = getToken();
    userDetails.value = await currentUserTenant.fetchLoginUserDetails();
    const userId = userDetails.value.id;

    const url = `${
      import.meta.env.VITE_API_URL
    }/items/personalModule?fields[]=id,assignedUser.dateOfJoining,cycleType&filter[_and][0][assignedUser][id][_eq]=${userId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    personalModuleData.value = data.data?.[0];

    if (!personalModuleData.value) {
      throw new Error("Personal module not found");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    showErrorMessage("Failed to fetch user data.");
  }
};

const fetchAttendanceCycle = async () => {
  console.log("Fetching attendance cycle...");
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][_eq]=${tenantId}&fields=multi_attendance_cycle`,
      { headers: { Authorization: `Bearer ${getToken()}` } },
    );
    if (!res.ok) throw new Error("Failed to fetch attendance cycle");

    const json = await res.json();
    const allCycles = json.data?.[0]?.multi_attendance_cycle?.cycles ?? null;

    if (!allCycles) {
      console.warn("No cycles found in attendance data");
      attendanceCycle.value = null;
      return;
    }

    // Validate cycle data
    allCycles.forEach((cycle) => {
      if (cycle.startDate > 31 || cycle.endDate > 31) {
        console.warn(
          `Invalid cycle date: cycleId ${cycle.cycleId} has startDate ${cycle.startDate} or endDate ${cycle.endDate}`,
        );
      }
    });

    attendanceCycle.value = allCycles;
    console.log("All attendance cycles loaded:", attendanceCycle.value);
  } catch (e) {
    console.error("Error fetching attendance cycle:", e);
    showErrorMessage("Could not load attendance-cycle data");
  }
};

const onWorkPreferenceChange = () => {
  formData.value.reason = null;
};

const transformPayload = (data) => {
  if (!userDetails.value || !personalModuleData.value) {
    throw new Error("User data not loaded");
  }

  return {
    tenant: { tenantId },
    fromDate: data.from,
    toDate: data.to,
    leaveType: data.workPreference,
    reason: data.reason,
    status: "pending",
    requestedBy: personalModuleData.value.id,
  };
};

const validateDates = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    showErrorMessage("Start and end dates are required.");
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);

  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    showErrorMessage("Invalid date format.");
    return false;
  }

  // // Check if end date is before start date
  // if (endDate < startDate) {
  //   showErrorMessage("End date cannot be before start date.");
  //   return false;
  // }

  // // Check if dates are in the past (optional, based on requirements)
  // if (startDate < today) {
  //   showErrorMessage("Cannot apply for past dates.");
  //   return false;
  // }

  // Check date of joining
  if (personalModuleData.value?.assignedUser?.dateOfJoining) {
    const dateOfJoining = new Date(
      personalModuleData.value.assignedUser.dateOfJoining,
    );
    if (startDate < dateOfJoining) {
      showErrorMessage("Cannot select dates before your date of joining.");
      return false;
    }
  }

  // Check attendance cycle restrictions
  if (personalModuleData.value?.cycleType && attendanceCycle.value) {
    const userCycleId =
      typeof personalModuleData.value.cycleType === "string"
        ? parseInt(personalModuleData.value.cycleType, 10)
        : personalModuleData.value.cycleType;

    const userCycle = attendanceCycle.value.find(
      (cycle) => cycle.cycleId === userCycleId,
    );

    if (!userCycle) {
      showErrorMessage("No matching attendance cycle found for your profile.");
      return false;
    }

    const { cycleStart, cycleEnd } = calculateCycleDates(userCycle);

    console.log("Cycle validation:", {
      cycleStart: cycleStart.toDateString(),
      cycleEnd: cycleEnd.toDateString(),
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
    });
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // Normalize all before comparing
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    const cStart = normalizeDate(cycleStart);
    const cEnd = normalizeDate(cycleEnd);
    if (start < cStart || end > cEnd) {
      showErrorMessage(
        `Selected dates must be within your attendance cycle (${cStart.toLocaleDateString()} to ${cEnd.toLocaleDateString()}).`,
      );
      return false;
    }
  }

  return true;
};

// Shared function to calculate cycle dates (used in both validateDates and cycleHint)
const calculateCycleDates = (userCycle) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  let cycleStart, cycleEnd;
  let adjustedEndDate = userCycle.endDate;

  if (userCycle.endDate === "end of the month") {
    console.log("Using 'end of the month' cycle logic", { currentDay });
    cycleStart = new Date(currentYear, currentMonth, userCycle.startDate);
    cycleEnd = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
  } else {
    console.log("Using standard cycle logic", {
      currentDay,
      startDate: userCycle.startDate,
    });
    if (currentDay >= userCycle.startDate) {
      cycleStart = new Date(currentYear, currentMonth, userCycle.startDate);
      cycleEnd = new Date(currentYear, currentMonth, adjustedEndDate);
    } else {
      cycleStart = new Date(currentYear, currentMonth - 1, userCycle.startDate);
      if (cycleStart.getDate() !== userCycle.startDate) {
        console.log(
          `Adjusting start date from ${userCycle.startDate} to last valid day of previous month`,
        );
        cycleStart = new Date(currentYear, currentMonth, 0); // Last day of previous month
        adjustedEndDate = userCycle.endDate - 1;
      }
      cycleEnd = new Date(currentYear, currentMonth, adjustedEndDate);
      if (cycleEnd.getDate() !== adjustedEndDate) {
        console.log(`Adjusting end date to last valid day of current month`);
        cycleEnd = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
      }
    }
  }

  // Ensure cycle dates are valid
  if (isNaN(cycleStart.getTime()) || isNaN(cycleEnd.getTime())) {
    console.error("Invalid cycle dates computed:", { cycleStart, cycleEnd });
    throw new Error("Invalid attendance cycle configuration.");
  }

  return { cycleStart, cycleEnd };
};

// Refactored cycleHint to reuse calculateCycleDates
const cycleHint = computed(() => {
  if (!attendanceCycle.value?.length || !personalModuleData.value?.cycleType) {
    return "";
  }

  const userCycleId =
    typeof personalModuleData.value.cycleType === "string"
      ? parseInt(personalModuleData.value.cycleType, 10)
      : personalModuleData.value.cycleType;

  const userCycle = attendanceCycle.value.find(
    (c) => c.cycleId === userCycleId,
  );

  if (!userCycle) {
    console.warn("No matching cycle found for cycleId:", userCycleId);
    return "";
  }

  try {
    const { cycleStart, cycleEnd } = calculateCycleDates(userCycle);
    console.log("Cycle dates computed:", {
      start: cycleStart.toDateString(),
      end: cycleEnd.toDateString(),
    });
    return `Current cycle: ${cycleStart.toLocaleDateString()} – ${cycleEnd.toLocaleDateString()}`;
  } catch (error) {
    console.error("Error computing cycle hint:", error);
    return "";
  }
});

const checkConflictingLeaveRequests = async (payload) => {
  try {
    console.log("🔍 Checking for conflicting leave requests...");
    const { fromDate, toDate, requestedBy } = payload;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?` +
        `filter[_and][0][requestedBy][id][_eq]=${requestedBy}&` +
        `filter[_and][1][status][_in]=approved,pending&` +
        `filter[_and][2][_or][0][fromDate][_between]=${fromDate},${toDate}&` +
        `filter[_and][2][_or][1][toDate][_between]=${fromDate},${toDate}&` +
        `filter[_and][2][_or][2][_and][0][fromDate][_lte]=${fromDate}&` +
        `filter[_and][2][_or][2][_and][1][toDate][_gte]=${toDate}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );

    if (!response.ok)
      throw new Error("Failed to check for conflicting leave requests");

    const conflictingLeaves = (await response.json()).data || [];

    if (conflictingLeaves.length) {
      const conflictingTypes = conflictingLeaves
        .map((l) => l.leaveType)
        .join(", ");
      showErrorMessage(
        `Cannot apply leave. You have existing ${conflictingTypes} request(s) overlapping with the selected dates.`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("❌ Error checking conflicting leave requests:", err);
    showErrorMessage(
      "Failed to verify conflicting leave requests. Please try again.",
    );
    return false;
  }
};

const handleSave = async () => {
  console.log("handleSave called");

  if (
    !userDetails.value ||
    !personalModuleData.value ||
    !attendanceCycle.value
  ) {
    showErrorMessage(
      "User or attendance cycle data is still loading. Please try again.",
    );
    return;
  }
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  if (!validateDates(formData.value.from, formData.value.to)) return;

  try {
    const payload = transformPayload(formData.value);
    const noConflict = await checkConflictingLeaveRequests(payload);
    if (!noConflict) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 403)
        throw new Error(errorData?.errors?.[0]?.message || "Permission denied");
      throw new Error("Failed to save work preference request");
    }

    showSuccessMessage("Work preference applied successfully");
    emits("saved");
    setTimeout(() => emits("closeAddPage"), 2000);
  } catch (error) {
    console.error("Error in handleSave:", error);
    showErrorMessage(error.message || "Failed to apply work preference.");
  }
};

onMounted(async () => {
  await Promise.all([fetchUserData(), fetchAttendanceCycle()]);
  isLoading.value = false;
});
</script>
<style scoped>
.v-toolbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.v-row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 0 -12px;
}

.v-col {
  padding: 0 12px;
  box-sizing: border-box;
}

/* Add spacing between date fields */
.date-row .date-col:not(:last-child) {
  margin-bottom: 16px; /* Adjust this value for desired spacing */
}

/* Optional: Add gap to the row for consistent spacing */
.date-row {
  gap: 16px; /* Adds spacing between columns in the row */
}

:deep(.v-field__input) {
  min-height: 56px;
}

:deep(.v-picker__title) {
  display: none;
}

:deep(.v-picker-title) {
  padding-top: 0px;
  padding-bottom: 0px;
}

/* Improved button spacing */
:deep(.v-col.d-flex.justify-end) {
  gap: 12px;
  padding-top: 16px;
}

:deep(.base-button) {
  min-width: 100px;
  padding: 8px 16px;
}
</style>

<template>
  <div class="attendance-settings">
    <v-container v-if="isLoading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="#059367"
          ></v-progress-circular>
          <p>Loading attendance settings...</p>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else fluid class="attendance-settings-editor-container pa-0">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h6 font-weight-bold d-flex align-center"></h3>
        <BaseButton
          variant="primary"
          text="Update"
          :disabled="!hasChanges"
          @click="saveChanges"
        />
      </div>

      <v-card flat class="attendance-card">
        <v-card-text>
          <WorkingHoursForm
            v-model="internalWorkingHoursData"
            :tenant-id="tenantId"
          />
        </v-card-text>

        <v-card-text>
          <HolidaySettingsForm
            v-model="internalHolidayIds"
            :tenant-id="tenantId"
            :branch-id="employeeData.branch?.id"
          />
        </v-card-text>
      </v-card>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";
import WorkingHoursForm from "./editWorkingHours.vue";
// import HolidaySettingsForm from "./editHolidaySettings.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const router = useRouter();

const attendancePolicies = ref([]);
const loadingPolicies = ref(true);

const internalSelectedPolicyId = ref(null);
const internalWorkingHoursData = ref([]);
const internalHolidayIds = ref([]);

const initialSelectedPolicyId = ref(null);
const initialWorkingHoursData = ref([]);
const initialHolidayIds = ref([]);

const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const allShifts = ref([]);
const isLoading = ref(true);

const defaultWorkingHours = [
  { name: "Monday", key: "mon", shifts: [], isWorking: true },
  { name: "Tuesday", key: "tue", shifts: [], isWorking: true },
  { name: "Wednesday", key: "wed", shifts: [], isWorking: true },
  { name: "Thursday", key: "thu", shifts: [], isWorking: true },
  { name: "Friday", key: "fri", shifts: [], isWorking: true },
  { name: "Saturday", key: "sat", shifts: [], isWorking: true },
  { name: "Sunday", key: "sun", shifts: [], isWorking: false },
];

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const hasChanges = computed(() => {
  if (internalSelectedPolicyId.value !== initialSelectedPolicyId.value) {
    return true;
  }

  if (
    JSON.stringify(internalWorkingHoursData.value) !==
    JSON.stringify(initialWorkingHoursData.value)
  ) {
    return true;
  }

  if (
    JSON.stringify(internalHolidayIds.value) !==
    JSON.stringify(initialHolidayIds.value)
  ) {
    return true;
  }

  return false;
});

async function fetchShifts() {
  try {
    const token = authService.getToken();
    await currentUserTenant.initialize();
    const tenantId = currentUserTenant.getTenantId();

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
  }
}

async function fetchAttendancePolicies() {
  if (!props.tenantId) return;
  loadingPolicies.value = true;
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config?filter[tenant][tenantId][_eq]=${props.tenantId}&fields=id,configName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch attendance policies");
    const data = await response.json();
    attendancePolicies.value = data.data.filter((item) => item.configName);
    if (props.employeeData?.config?.id) {
      internalSelectedPolicyId.value = props.employeeData.config.id;
      initialSelectedPolicyId.value = props.employeeData.config.id;
    } else if (attendancePolicies.value.length > 0) {
      internalSelectedPolicyId.value = attendancePolicies.value[0].id;
      initialSelectedPolicyId.value = attendancePolicies.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching attendance policies:", error);
  } finally {
    loadingPolicies.value = false;
  }
}

async function fetchEmployeeAttendanceData() {
  if (!props.id || !props.tenantId) return;
  try {
    const token = authService.getToken();
    const fields = [
      "id",
      "config.id",
      "config.configName",
      "holidaySettingsJ",
      "attendanceSettings.id",
      "attendanceSettings.isMonday",
      "attendanceSettings.isTuesday",
      "attendanceSettings.monJ",
      "attendanceSettings.tueJ",
      "attendanceSettings.isWednesday",
      "attendanceSettings.isThursday",
      "attendanceSettings.isFriday",
      "attendanceSettings.isSaturday",
      "attendanceSettings.isSunday",
      "attendanceSettings.wedJ",
      "attendanceSettings.thuJ",
      "attendanceSettings.friJ",
      "attendanceSettings.satJ",
      "attendanceSettings.sunJ",
      "branch.id",
      "branch.branchName",
    ];
    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      internalSelectedPolicyId.value = employee.config?.id || null;
      if (employee.attendanceSettings) {
        const attendanceSettings = employee.attendanceSettings;
        const daysMapping = {
          mon: "Monday",
          tue: "Tuesday",
          wed: "Wednesday",
          thu: "Thursday",
          fri: "Friday",
          sat: "Saturday",
          sun: "Sunday",
        };
        const newWorkingHoursData = Object.keys(daysMapping).map((key) => {
          const dayName = daysMapping[key];
          const isWorkingKey = `is${dayName}`;
          const shiftsKey = `${key}J`;
          const isWorking = !attendanceSettings[isWorkingKey];
          const shiftIds = attendanceSettings[shiftsKey]?.shifts || [];
          const shifts = shiftIds
            .map((shiftId) =>
              allShifts.value.find((s) => s.id === Number(shiftId)),
            )
            .filter(Boolean);

          return {
            name: dayName,
            key: key,
            shifts: shifts,
            isWorking: isWorking,
          };
        });
        internalWorkingHoursData.value = newWorkingHoursData;
      } else {
        internalWorkingHoursData.value = JSON.parse(
          JSON.stringify(defaultWorkingHours),
        );
      }

      if (employee.holidaySettingsJ?.holidays) {
        internalHolidayIds.value =
          employee.holidaySettingsJ.holidays.map(Number);
      } else {
        internalHolidayIds.value = [];
      }

      initialSelectedPolicyId.value = internalSelectedPolicyId.value;
      initialWorkingHoursData.value = JSON.parse(
        JSON.stringify(internalWorkingHoursData.value),
      );
      initialHolidayIds.value = [...internalHolidayIds.value];
    } else {
      internalWorkingHoursData.value = JSON.parse(
        JSON.stringify(defaultWorkingHours),
      );
      internalHolidayIds.value = [];
      initialSelectedPolicyId.value = null;
      initialWorkingHoursData.value = JSON.parse(
        JSON.stringify(defaultWorkingHours),
      );
      initialHolidayIds.value = [];
    }
  } catch (error) {
    console.error("Error fetching employee attendance data:", error);
    showErrorMessage("Failed to load employee attendance data.");

    internalWorkingHoursData.value = JSON.parse(
      JSON.stringify(defaultWorkingHours),
    );
    internalHolidayIds.value = [];
    initialSelectedPolicyId.value = null;
    initialWorkingHoursData.value = JSON.parse(
      JSON.stringify(defaultWorkingHours),
    );
    initialHolidayIds.value = [];
  }
}

const redirectToAttendanceConfig = () => {
  router.push("/configuration/penalty-policy");
};

const saveChanges = async () => {
  try {
    const token = authService.getToken();

    const transformedAttendanceSettings = {
      id: props.employeeData.attendanceSettings?.id,
    };
    internalWorkingHoursData.value.forEach((day) => {
      const isWorkingKey = `is${day.name}`;
      const shiftsKey = `${day.key}J`;

      transformedAttendanceSettings[isWorkingKey] = !day.isWorking;
      transformedAttendanceSettings[shiftsKey] = {
        shifts: day.shifts.map((s) => s.id.toString()),
      };
    });

    const payload = {
      config: internalSelectedPolicyId.value,
      holidaySettingsJ: {
        holidays: internalHolidayIds.value.map(String),
      },
      attendanceSettings: transformedAttendanceSettings,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update employee attendance settings");
    }

    showSuccessMessage("Attendance settings updated successfully!");

    initialSelectedPolicyId.value = internalSelectedPolicyId.value;
    initialWorkingHoursData.value = JSON.parse(
      JSON.stringify(internalWorkingHoursData.value),
    );
    initialHolidayIds.value = [...internalHolidayIds.value];

    emit("update:employeeData", {
      ...props.employeeData,
      config: { id: internalSelectedPolicyId.value },
      holidaySettingsJ: { holidays: internalHolidayIds.value.map(String) },
      attendanceSettings: transformedAttendanceSettings,
    });
  } catch (error) {
    console.error("Error updating attendance settings:", error);
    showErrorMessage(`Error updating settings: ${error.message}`);
  }
};

onMounted(async () => {
  isLoading.value = true;
  await fetchShifts();
  await fetchEmployeeAttendanceData();
  isLoading.value = false;
});

watch(
  () => props.id,
  async () => {
    isLoading.value = true;
    await fetchShifts();
    await fetchEmployeeAttendanceData();
    isLoading.value = false;
  },
);

watch(
  () => props.tenantId,
  async (newVal) => {
    if (newVal) {
      isLoading.value = true;
      await fetchShifts();
      await fetchEmployeeAttendanceData();
      isLoading.value = false;
    }
  },
);
</script>

<style scoped>
/* .attendance-settings-editor-container {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
} */

.attendance-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.v-select {
  max-width: 400px;
}

.policy-details-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fdfdfd;
}
</style>

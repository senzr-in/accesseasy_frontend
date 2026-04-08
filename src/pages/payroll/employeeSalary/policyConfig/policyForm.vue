<template>
  <v-container fluid class="attendance-settings-editor-container pa-0">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-list-box-outline</v-icon>
        Policies Configuration
      </h3>
      <BaseButton
        variant="primary"
        text="Update"
        :disabled="!hasChanges"
        @click="saveChanges"
      />
    </div>

    <v-card flat class="attendance-card">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-select
              v-model="internalSelectedPolicyId"
              :items="attendancePolicies"
              item-title="configName"
              item-value="id"
              label="Choose a Policy"
              variant="outlined"
              density="comfortable"
              placeholder="Select an attendance policy"
              clearable
              class="mb-6"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedCycleType"
              :items="cycleTypeOptions"
              item-title="cycleName"
              item-value="cycleId"
              label="Attendance Cycle Type"
              variant="outlined"
              density="comfortable"
              @update:model-value="handleCycleTypeChange"
              @blur="markFieldAsTouched('cycleType')"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.assignedUser.ESIAccountNumber"
              type="string"
              label="ESI Account Number"
              variant="outlined"
              density="comfortable"
              @input="handleInputChange('assignedUser.ESIAccountNumber')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.assignedUser.PFAccountNumber"
              type="string"
              label="UAN PF AccountNumber"
              variant="outlined"
              density="comfortable"
              @input="handleInputChange('assignedUser.PFAccountNumber')"
            ></v-text-field> </v-col
        ></v-row>
        <!-- <v-col cols="12" md="6">
            <div
              style="
                background-color: #e1f5fe;
                padding: 16px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <v-icon color="blue" style="margin-right: 8px"
                >mdi-information</v-icon
              >
              <span style="color: #2196f3">
                To manage attendance policies and settings, click the button
                below:
              </span>
              <v-btn
                color="primary"
                @click="redirectToAttendanceConfig"
                style="margin-left: 8px"
              >
                Go to Attendance policies
              </v-btn>
            </div>
          </v-col> -->
        <v-alert
          v-if="loadingPolicies"
          type="info"
          variant="tonal"
          class="mb-4"
          icon="mdi-information-outline"
        >
          Loading attendance policies...
        </v-alert>
        <v-alert
          v-else-if="!attendancePolicies.length"
          type="warning"
          variant="tonal"
          class="mb-4"
          icon="mdi-alert-outline"
        >
          No attendance policies found. Please create one.
        </v-alert>
        <v-alert
          v-else-if="!internalSelectedPolicyId"
          type="info"
          variant="tonal"
          class="mb-4"
          icon="mdi-information-outline"
        >
          Please select an attendance policy from the dropdown above to view its
          details.
        </v-alert>
      </v-card-text>

      <v-divider class="my-6"></v-divider>

      <!-- <v-divider class="my-6"></v-divider> -->

      <!-- <v-card-title class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-calendar-star</v-icon>
        Employee Holiday Settings
      </v-card-title> -->
      <v-card-text>
        <!-- <HolidaySettingsForm
          v-model="internalHolidayIds"
          :tenant-id="tenantId"
          :branch-id="employeeData.branch?.id"
        /> -->
      </v-card-text>
    </v-card>
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
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const tenantId = currentUserTenant.getTenantId();

const emit = defineEmits(["update:employeeData"]);
const router = useRouter();

const attendancePolicies = ref([]);
const loadingPolicies = ref(true);
const assignedUserId = ref(null);
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
const touchedFields = ref(new Set());
const validationErrors = ref({});
const cycleTypeOptions = ref([]);
const selectedCycleType = ref(null);
const originalData = ref(null);
const changedFields = ref({});
const allShifts = ref([]);
const formData = ref({
  assignedUser: {
    PFAccountNumber: "",
    ESIAccountNumber: "",
  },
});
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
  if (Object.keys(changedFields.value).length > 0) {
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

async function fetchCycleTypes() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance cycles");
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const firstItem = data.data[0];
      const multiAttendanceCycle = firstItem.multi_attendance_cycle;
      if (
        multiAttendanceCycle &&
        multiAttendanceCycle.cycles &&
        Array.isArray(multiAttendanceCycle.cycles)
      ) {
        cycleTypeOptions.value = multiAttendanceCycle.cycles.map((cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
        }));
      } else {
        console.warn("No cycles found in multi_attendance_cycle");
      }
    } else {
      console.warn("No data found in response");
    }
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    showErrorMessage("Failed to load attendance cycle options");
  }
}
const handleCycleTypeChange = (newValue) => {
  const currentCycleType = originalData.value.cycleType;
  if (newValue !== currentCycleType) {
    changedFields.value.cycleType = newValue;
  } else {
    delete changedFields.value.cycleType;
  }

  if (newValue) {
    validationErrors.value.cycleType = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};
const validateField = (fieldName) => {
  touchedFields.value.add(fieldName);
  validationErrors.value[fieldName] = null;
};
async function fetchAttendancePolicies() {
  if (tenantId.value) return;
  loadingPolicies.value = true;

  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config?filter[tenant][tenantId][_eq]=${tenantId}&fields=id,configName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch attendance policies");

    const data = await response.json();
    attendancePolicies.value = data.data.filter((item) => item.configName);

    // Default selection: first policy if available
    if (attendancePolicies.value.length > 0) {
      internalSelectedPolicyId.value = attendancePolicies.value[0].id;
      initialSelectedPolicyId.value = attendancePolicies.value[0].id;
    } else {
      internalSelectedPolicyId.value = null;
      initialSelectedPolicyId.value = null;
    }
  } catch (error) {
    console.error("Error fetching attendance policies:", error);
  } finally {
    loadingPolicies.value = false;
  }
}

async function fetchEmployeeAttendanceData() {
  if (!props.id) return;

  try {
    const token = authService.getToken();
    const fields = [
      "config.id",
      "cycleType",
      "assignedUser.PFAccountNumber",
      "assignedUser.ESIAccountNumber",
      "assignedUser.id",
    ];
    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      assignedUserId.value = employee.assignedUser.id;
      originalData.value = JSON.parse(JSON.stringify(employee));

      internalSelectedPolicyId.value = employee.config?.id || null;
      initialSelectedPolicyId.value = internalSelectedPolicyId.value;

      formData.value.assignedUser.PFAccountNumber =
        employee.assignedUser?.PFAccountNumber || "";
      formData.value.assignedUser.ESIAccountNumber =
        employee.assignedUser?.ESIAccountNumber || "";

      if (employee.cycleType) {
        selectedCycleType.value = Number(
          employee.cycleType.cycleId || employee.cycleType,
        );
      }
    } else {
      internalSelectedPolicyId.value = null;
      initialSelectedPolicyId.value = null;
    }
  } catch (error) {
    console.error("Error fetching employee attendance data:", error);
    showErrorMessage("Failed to load employee attendance data.");
    internalSelectedPolicyId.value = null;
    initialSelectedPolicyId.value = null;
  }
}

const redirectToAttendanceConfig = () => {
  router.push("/settings/attendancepolicy");
};
const markFieldAsTouched = (fieldName) => {
  touchedFields.value.add(fieldName);
  validateField(fieldName);
};
const saveChanges = async () => {
  try {
    const token = authService.getToken();

    const payload = {
      config: internalSelectedPolicyId.value,
      cycleType: selectedCycleType.value || null,
      assignedUser: {
        id: assignedUserId.value,
        PFAccountNumber: formData.value.assignedUser.PFAccountNumber || "",
        ESIAccountNumber: formData.value.assignedUser.ESIAccountNumber || "",
      },
      // attendanceSettings: transformedAttendanceSettings,
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
  } catch (error) {
    console.error("Error updating attendance settings:", error);
    showErrorMessage(`Error updating settings: ${error.message}`);
  }
};

onMounted(async () => {
  await fetchEmployeeAttendanceData();
  await fetchCycleTypes();
  await fetchAttendancePolicies();
});

watch(
  () => props.id,
  async () => {
    await fetchCycleTypes();
    await fetchAttendancePolicies();
    await fetchEmployeeAttendanceData();
  },
);

watch(
  () => props.tenantId,
  async (newVal) => {
    if (newVal) {
      await fetchCycleTypes();
      await fetchAttendancePolicies();
      await fetchEmployeeAttendanceData();
    }
  },
);
</script>

<style scoped>
.attendance-settings-editor-container {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}

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

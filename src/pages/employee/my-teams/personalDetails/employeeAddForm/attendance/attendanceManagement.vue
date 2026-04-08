<template>
  <v-container fluid class="attendance-settings-editor-container pa-0">
    <v-card flat class="attendance-card">
      <v-card-title class="text-h6 font-weight-bold d-flex align-center">
        <!-- <v-icon class="mr-2" color="black">mdi-list-box-outline</v-icon>
        Select Attendance Policy -->
      </v-card-title>
      <!-- <v-card-text>
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
          </v-col>
        </v-row>

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
      </v-card-text> -->

      <v-divider class="my-6"></v-divider>

      <!-- <v-card-title class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-calendar-clock</v-icon>
        Employee Working Hours Configuration
      </v-card-title> -->
      <v-card-text>
        <WorkingHours
          v-model="internalWorkingHoursData"
          :tenant-id="tenantId"
        />
      </v-card-text>

      <!-- <v-divider class="my-6"></v-divider> -->

      <!-- <v-card-title class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-calendar-star</v-icon>
        Employee Holiday Settings
      </v-card-title> -->
      <v-card-text>
        <HolidaySettings v-model="internalHolidayIds" :tenant-id="tenantId" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import WorkingHours from "./workingHours.vue";
// import HolidaySettings from "./holidaySettings.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  initialWorkingHoursData: {
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
  initialHolidayIds: {
    type: Array,
    default: () => [],
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:workingHoursData",
  "update:holidayIds",
]);

const attendancePolicies = ref([]);
const loadingPolicies = ref(true);

// Internal refs for v-model bindings
const internalSelectedPolicyId = ref(props.modelValue);
const internalWorkingHoursData = ref(
  JSON.parse(JSON.stringify(props.initialWorkingHoursData)),
);
const internalHolidayIds = ref([...props.initialHolidayIds]);

async function fetchAttendancePolicies() {
  loadingPolicies.value = true;
  try {
    const token = authService.getToken();
    const tenantId = props.tenantId;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config?filter[tenant][tenantId][_eq]=${tenantId}&fields=id,configName`, // Only fetch ID and configName
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch attendance policies");
    const data = await response.json();

    attendancePolicies.value = data.data.filter((item) => item.configName);

    if (props.modelValue) {
      const foundPolicy = attendancePolicies.value.find(
        (p) => p.id === props.modelValue,
      );
      if (foundPolicy) {
        internalSelectedPolicyId.value = props.modelValue;
      } else if (attendancePolicies.value.length > 0) {
        internalSelectedPolicyId.value = attendancePolicies.value[0].id;
      }
    } else if (attendancePolicies.value.length > 0) {
      internalSelectedPolicyId.value = attendancePolicies.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching attendance policies:", error);
  } finally {
    loadingPolicies.value = false;
  }
}

const redirectToAttendanceConfig = () => {
  router.push("/configuration/penalty-policy");
};

onMounted(() => {
  // fetchAttendancePolicies();
});

watch(internalSelectedPolicyId, (newVal) => {
  emit("update:modelValue", newVal);
});

watch(
  internalWorkingHoursData,
  (newVal) => {
    emit("update:workingHoursData", newVal);
  },
  { deep: true },
);

watch(
  internalHolidayIds,
  (newVal) => {
    emit("update:holidayIds", newVal);
  },
  { deep: true },
);

watch(
  () => props.modelValue,
  (newVal) => {
    internalSelectedPolicyId.value = newVal;
  },
);

watch(
  () => props.initialWorkingHoursData,
  (newVal) => {
    internalWorkingHoursData.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true },
);

watch(
  () => props.initialHolidayIds,
  (newVal) => {
    internalHolidayIds.value = [...newVal];
  },
  { deep: true },
);

watch(
  () => props.tenantId,
  (newVal) => {
    if (newVal) {
      fetchAttendancePolicies();
    }
  },
);
</script>

<style scoped>
.attendance-settings-editor-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 20px;
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

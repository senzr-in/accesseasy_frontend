<template>
  <div class="holiday-settings-container">
    <v-card flat class="pa-4">
      <v-card-text>
        <v-alert
          v-if="loading"
          type="info"
          variant="tonal"
          class="mb-4"
          icon="mdi-information-outline"
        >
          Loading holidays...
        </v-alert>

        <div v-else-if="!availableHolidays.length" class="no-holidays-message">
          <v-icon size="48" color="grey-lighten-1">mdi-calendar-off</v-icon>
          <p class="text-h6 text-grey-lighten-1 mt-2">
            No holidays found for this tenant.
          </p>
          <p class="text-caption text-grey-lighten-1">
            You can add holidays via your main settings.
          </p>
        </div>

        <v-list v-else class="holiday-list">
          <v-list-item
            v-for="holiday in availableHolidays"
            :key="holiday.id"
            class="holiday-list-item mb-3"
            :class="{ 'holiday-disabled': !isSelected(holiday.id) }"
          >
            <template v-slot:prepend>
              <v-icon :color="isSelected(holiday.id) ? 'success' : 'grey'"
                >mdi-calendar-check</v-icon
              >
            </template>
            <v-list-item-title class="font-weight-medium">{{
              holiday.event
            }}</v-list-item-title>
            <v-list-item-subtitle
              class="text-caption text-purple font-weight-bold"
            >
              {{ formatDate(holiday.date) }}
              <span
                v-if="
                  holiday.assignedBranchNames &&
                  holiday.assignedBranchNames.length
                "
              >
                (Branches: {{ holiday.assignedBranchNames.join(", ") }})
              </span>
              <span v-else> (All Branches) </span>
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-switch
                :model-value="isSelected(holiday.id)"
                color="success"
                inset
                hide-details
                @update:model-value="toggleHolidaySelection(holiday.id, $event)"
              ></v-switch>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { authService } from "@/services/authService";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const availableHolidays = ref([]);
const internalSelectedHolidayIds = ref([]);
const loading = ref(false);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const isSelected = (holidayId) => {
  return internalSelectedHolidayIds.value.includes(holidayId);
};

const toggleHolidaySelection = (holidayId, isEnabled) => {
  if (isEnabled) {
    if (!internalSelectedHolidayIds.value.includes(holidayId)) {
      internalSelectedHolidayIds.value.push(holidayId);
    }
  } else {
    internalSelectedHolidayIds.value = internalSelectedHolidayIds.value.filter(
      (id) => id !== holidayId,
    );
  }
  emit("update:modelValue", internalSelectedHolidayIds.value);
};

const fetchAvailableHolidays = async () => {
  if (!props.tenantId) {
    availableHolidays.value = [];
    console.warn(
      "tenantId is not available for HolidaySettings component. Cannot fetch holidays.",
    );
    return;
  }

  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = props.tenantId;

    // 1. Fetch holidays with AssignHolidays (array of branch IDs)
    const holidaysResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/holiday?filter[tenant][_eq]=${tenantId}&fields=id,event,date,AssignHolidays`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!holidaysResponse.ok)
      throw new Error("Failed to fetch available holidays");

    const holidaysData = await holidaysResponse.json();
    const holidays = holidaysData.data;

    // Collect all unique branch IDs from AssignHolidays
    const allBranchIds = new Set();
    holidays.forEach((holiday) => {
      if (Array.isArray(holiday.AssignHolidays)) {
        holiday.AssignHolidays.forEach((branchId) => {
          allBranchIds.add(branchId);
        });
      }
    });

    let branchMap = new Map();
    if (allBranchIds.size > 0) {
      const branchIdsString = Array.from(allBranchIds).join(",");
      // 2. Fetch branch names using the collected IDs
      const branchesResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/branch?filter[tenant][tenantId][_eq]=${tenantId}&filter[id][_in]=${branchIdsString}&fields=id,branchName`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!branchesResponse.ok) throw new Error("Failed to fetch branch names");

      const branchesData = await branchesResponse.json();
      branchesData.data.forEach((branch) => {
        branchMap.set(branch.id, branch.branchName);
      });
    }

    // 3. Map branch names back to holidays
    availableHolidays.value = holidays.map((h) => ({
      ...h,
      assignedBranchNames: Array.isArray(h.AssignHolidays)
        ? h.AssignHolidays.map((id) => branchMap.get(id)).filter((name) => name) // Get names and filter out undefined
        : [],
    }));
  } catch (error) {
    console.error("Error fetching available holidays:", error);
    availableHolidays.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  internalSelectedHolidayIds.value = [...props.modelValue];
  fetchAvailableHolidays();
});

watch(
  () => props.modelValue,
  (newVal) => {
    internalSelectedHolidayIds.value = [...newVal];
  },
  { deep: true },
);

watch(
  () => props.tenantId,
  (newVal) => {
    if (newVal) {
      fetchAvailableHolidays();
    }
  },
);
</script>

<style scoped>
.holiday-settings-container {
  width: 100%;
  height: auto;
  margin-top: -1.5rem;
}

.holiday-list {
  padding: 0;
}

.holiday-list-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
}

.holiday-disabled {
  background-color: #f8f8f8;
}

.no-holidays-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #9e9e9e;
}
</style>

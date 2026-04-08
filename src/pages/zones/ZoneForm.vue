<template>
  <div class="zone-form-container">
    <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
        <v-row>
          <!-- Zone Name -->
          <v-col cols="12">
            <v-text-field
              v-model="formData.zoneName"
              label="Zone Name"
              placeholder="Enter zone name"
              variant="outlined"
              density="comfortable"
              :rules="zoneNameRules"
              required
            ></v-text-field>
          </v-col>

          <!-- Entry Doors -->
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedEntryDoors"
              :items="availableDoors"
              item-title="displayName"
              item-value="id"
              label="Entry Doors"
              placeholder="Select entry doors"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
              :rules="doorsValidationRules"
            >
              <template v-slot:chip="{ item, props }">
                <v-chip
                  v-bind="props"
                  :text="item.raw.displayName"
                  closable
                ></v-chip>
              </template>
            </v-select>
          </v-col>

          <!-- Exit Doors -->
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedExitDoors"
              :items="availableDoors"
              item-title="displayName"
              item-value="id"
              label="Exit Doors"
              placeholder="Select exit doors"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
              :rules="doorsValidationRules"
            >
              <template v-slot:chip="{ item, props }">
                <v-chip
                  v-bind="props"
                  :text="item.raw.displayName"
                  closable
                ></v-chip>
              </template>
            </v-select>
          </v-col>

          <!-- Overlap Warning -->
          <v-col cols="12" v-if="hasOverlappingDoors">
            <v-alert type="warning" variant="tonal" density="compact">
              <v-icon start>mdi-alert</v-icon>
              Warning: Some doors are selected in both Entry and Exit doors.
            </v-alert>
          </v-col>

          <!-- Action Buttons -->
          <v-col cols="12" class="d-flex justify-end gap-2">
            <BaseButton
              variant="secondary"
              @click="handleCancel"
              :disabled="loading"
            >
              Cancel
            </BaseButton>
            <BaseButton
              variant="primary"
              @click="handleSubmit"
              :loading="loading"
              :disabled="!valid"
            >
              {{ isEditing ? "Update Zone" : "Create Zone" }}
            </BaseButton>
          </v-col>
        </v-row>
      </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { zoneService } from "@/services/zoneService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  zoneData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["save-success", "cancel"]);

// Form state
const formRef = ref(null);
const valid = ref(false);
const loading = ref(false);
const availableDoors = ref([]);
const selectedEntryDoors = ref([]);
const selectedExitDoors = ref([]);

const formData = ref({
  zoneName: "",
  entry_doors: [],
  exit_doors: [],
});

// Validation rules
const zoneNameRules = [
  (v) => !!v || "Zone name is required",
  (v) => (v && v.length >= 3) || "Zone name must be at least 3 characters",
];

const doorsValidationRules = [
  () => {
    const hasEntryDoors = selectedEntryDoors.value.length > 0;
    const hasExitDoors = selectedExitDoors.value.length > 0;
    return (
      hasEntryDoors ||
      hasExitDoors ||
      "At least one Entry Door or Exit Door must be selected"
    );
  },
];

// Computed properties
const hasOverlappingDoors = computed(() => {
  const entrySet = new Set(selectedEntryDoors.value);
  const exitSet = new Set(selectedExitDoors.value);
  
  for (const doorId of entrySet) {
    if (exitSet.has(doorId)) {
      return true;
    }
  }
  return false;
});

/**
 * Fetch available doors
 */
const fetchDoors = async () => {
  try {
    const doors = await zoneService.fetchDoors();
    availableDoors.value = doors.map((door) => ({
      ...door,
      displayName: `${door.doorNumber} - ${door.doorName}`,
    }));
  } catch (error) {
    console.error("Error fetching doors:", error);
  }
};

/**
 * Convert door IDs to door objects for JSON storage
 */
const convertDoorIdsToObjects = (doorIds) => {
  return doorIds.map((doorId) => {
    const door = availableDoors.value.find((d) => d.id === doorId);
    return {
      doorNumber: door.doorNumber,
      doorName: door.doorName,
    };
  });
};

/**
 * Convert door objects to door IDs for form selection
 */
const convertDoorObjectsToIds = (doorObjects) => {
  if (!doorObjects || !Array.isArray(doorObjects)) return [];
  
  return doorObjects
    .map((doorObj) => {
      const door = availableDoors.value.find(
        (d) => d.doorNumber === doorObj.doorNumber && d.doorName === doorObj.doorName
      );
      return door?.id;
    })
    .filter((id) => id !== undefined);
};

/**
 * Initialize form with existing data (for editing)
 */
const initializeForm = () => {
  if (props.isEditing && props.zoneData) {
    formData.value.zoneName = props.zoneData.zoneName || "";
    
    // Convert door objects to IDs for selection
    selectedEntryDoors.value = convertDoorObjectsToIds(props.zoneData.entry_doors);
    selectedExitDoors.value = convertDoorObjectsToIds(props.zoneData.exit_doors);
  }
};

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  const { valid: isValid } = await formRef.value.validate();
  
  if (!isValid) return;

  loading.value = true;

  try {
    // Convert selected door IDs to door objects
    formData.value.entry_doors = convertDoorIdsToObjects(selectedEntryDoors.value);
    formData.value.exit_doors = convertDoorIdsToObjects(selectedExitDoors.value);

    if (props.isEditing) {
      await zoneService.updateZone(props.zoneData.id, formData.value);
    } else {
      await zoneService.createZone(formData.value);
    }

    emit("save-success");
  } catch (error) {
    console.error("Error saving zone:", error);
    alert(`Error ${props.isEditing ? "updating" : "creating"} zone`);
  } finally {
    loading.value = false;
  }
};

/**
 * Handle cancel action
 */
const handleCancel = () => {
  emit("cancel");
};

// Watch for changes in door selections to trigger validation
watch([selectedEntryDoors, selectedExitDoors], () => {
  if (formRef.value) {
    formRef.value.validate();
  }
});

// Watch for changes in zoneData prop to re-initialize form
watch(() => props.zoneData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    initializeForm();
  }
}, { deep: true });

onMounted(async () => {
  await fetchDoors();
  initializeForm();
});
</script>

<style scoped>
.zone-form-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.gap-2 {
  gap: 8px;
}
</style>

<template>
  <div class="space-y-6">
    <!-- Zone Name -->
    <div>
      <label class="ae-section-label mb-1.5 block">Zone Name</label>
      <input
        v-model="formData.zoneName"
        type="text"
        class="ae-input w-full"
        placeholder="e.g. Main Hub Area"
      >
      <p
        v-if="!formData.zoneName && attemptSubmit"
        class="text-xs text-rose-500 mt-1"
      >
        Zone name is required
      </p>
    </div>
    <div>
      <label class="ae-section-label mb-1.5 block">Description</label>
      <textarea
        v-model="formData.description"
        rows="2"
        class="ae-input w-full py-2 resize-none"
        placeholder="e.g. Main storage area for high-value goods"
      ></textarea>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <!-- Status -->
      <div>
        <label class="ae-section-label mb-1.5 block">Status</label>
        <select
          v-model="formData.status"
          class="ae-input w-full py-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Access Points -->
      <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div class="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
          <label class="ae-section-label">Linked Access Points</label>
        </div>
        <div class="p-3 max-h-64 overflow-y-auto space-y-1">
          <label 
            v-for="door in availableDoors" 
            :key="door.id"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <input 
              v-model="selectedDoors" 
              type="checkbox" 
              :value="door.id"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            >
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ door.displayName }}</span>
          </label>
          <div
            v-if="availableDoors.length === 0"
            class="text-xs text-slate-400 text-center py-4"
          >
            No access points available
          </div>
        </div>
      </div>
    </div>

    <!-- Validation Error -->
    <div
      v-if="attemptSubmit && selectedDoors.length === 0"
      class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center"
    >
      At least one Access Point must be selected.
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
      <button
        class="btn-secondary text-sm px-5"
        :disabled="loading"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        class="btn-primary text-sm px-5"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ loading ? 'Saving...' : (isEditing ? "Update Zone" : "Create Zone") }}
      </button>
    </div>
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
const attemptSubmit = ref(false);
const loading = ref(false);
const availableDoors = ref([]);
const selectedDoors = ref([]);

const formData = ref({
  zoneName: "",
  description: "",
  status: "active",
  entry_doors: [],
  exit_doors: [],
});

// Validation rules (manual)
const isValid = computed(() => {
  if (!formData.value.zoneName || formData.value.zoneName.length < 3) return false;
  if (selectedDoors.value.length === 0) return false;
  return true;
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
    formData.value.description = props.zoneData.description || "";
    formData.value.status = props.zoneData.status || "active";
    
    // Convert door objects to IDs for selection
    const allIds = [
      ...convertDoorObjectsToIds(props.zoneData.entry_doors),
      ...convertDoorObjectsToIds(props.zoneData.exit_doors)
    ];
    selectedDoors.value = [...new Set(allIds)];
  }
};

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  attemptSubmit.value = true;
  
  if (!isValid.value) return;

  loading.value = true;

  try {
    // Convert selected door IDs to door objects
    const doorObjects = convertDoorIdsToObjects(selectedDoors.value);
    
    // Store all selected access points in entry_doors to maintain schema compatibility
    formData.value.entry_doors = doorObjects;
    formData.value.exit_doors = [];

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

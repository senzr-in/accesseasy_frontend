<template>
  <div class="space-y-5">
    <!-- Zone Name -->
    <div>
      <label class="ae-section-label mb-1.5 block">Zone Name *</label>
      <input
        v-model="formData.zoneName"
        type="text"
        class="ae-input w-full"
        placeholder="e.g. Main Warehouse Area"
        autofocus
      >
      <p
        v-if="!formData.zoneName && attemptSubmit"
        class="text-xs text-rose-500 mt-1"
      >
        Zone name is required (minimum 2 characters)
      </p>
    </div>

    <!-- Description -->
    <div>
      <label class="ae-section-label mb-1.5 block">Description</label>
      <textarea
        v-model="formData.description"
        rows="3"
        class="ae-input w-full py-2 resize-none"
        placeholder="e.g. Main storage area for high-value inventory and perimeter rounds"
      ></textarea>
    </div>

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

const formData = ref({
  zoneName: "",
  description: "",
  status: "active",
  entry_doors: [],
  exit_doors: [],
});

// Validation rules
const isValid = computed(() => {
  return formData.value.zoneName && formData.value.zoneName.trim().length >= 2;
});

/**
 * Initialize form with existing data (for editing)
 */
const initializeForm = () => {
  if (props.isEditing && props.zoneData) {
    formData.value.zoneName = props.zoneData.zoneName || props.zoneData.name || "";
    formData.value.description = props.zoneData.description || "";
    formData.value.status = props.zoneData.status || "active";
    formData.value.entry_doors = props.zoneData.entry_doors || [];
    formData.value.exit_doors = props.zoneData.exit_doors || [];
  } else {
    formData.value.zoneName = "";
    formData.value.description = "";
    formData.value.status = "active";
    formData.value.entry_doors = [];
    formData.value.exit_doors = [];
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
    const payload = {
      zoneName: formData.value.zoneName.trim(),
      description: formData.value.description || "",
      status: formData.value.status || "active",
      entry_doors: formData.value.entry_doors || [],
      exit_doors: formData.value.exit_doors || []
    };

    if (props.isEditing) {
      await zoneService.updateZone(props.zoneData.id, payload);
    } else {
      await zoneService.createZone(payload);
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

onMounted(() => {
  initializeForm();
});
</script>

<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <h2>Reschedule Task(s)</h2>

      <!-- Selected Tasks Display -->
      <div class="selected-items">
        <p class="label">
          Selected tasks: <span class="count">{{ taskIds.length }}</span>
        </p>
      </div>

      <!-- Start Date Field -->
      <div class="date-field">
        <div class="field-header">
          <label>Start Date & Time</label>
          <div
            v-if="fromInvalid"
            class="warning-icon"
            @click="showFromWarning = !showFromWarning"
          >
            <AlertCircle :size="18" />
          </div>
        </div>
        <input
          type="datetime-local"
          v-model="fromLocal"
          :min="minDateTime"
          @change="validateFromDate"
          :class="{ 'input-error': fromInvalid }"
        />
        <div v-if="showFromWarning && fromInvalid" class="warning-message">
          ⚠️ Start date cannot be in the past. Please select a current or future
          date.
        </div>
      </div>

      <!-- End Date Field -->
      <div class="date-field">
        <div class="field-header">
          <label>End Date & Time</label>
          <div
            v-if="dueInvalid"
            class="warning-icon"
            @click="showDueWarning = !showDueWarning"
          >
            <AlertCircle :size="18" />
          </div>
        </div>
        <input
          type="datetime-local"
          v-model="dueTimeLocal"
          :min="fromLocal || minDateTime"
          @change="validateDueDate"
          :class="{ 'input-error': dueInvalid }"
        />
        <div v-if="showDueWarning && dueInvalid" class="warning-message">
          ⚠️ End date must be after the start date and cannot be in the past.
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-actions">
        <BaseButton variant="secondary" text="Cancel" @click="$emit('close')" />
        <BaseButton
          variant="primary"
          text="Reschedule"
          @click="handleSubmit"
          :disabled="isInvalid"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { AlertCircle } from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  show: Boolean,
  taskIds: Array,
  currentFrom: [String, null],
  currentDueTime: [String, null],
});

const emit = defineEmits(["close", "reschedule"]);

const minDateTime = new Date().toISOString().slice(0, 16);

const fromLocal = ref(
  props.taskIds.length === 1 && props.currentFrom
    ? new Date(props.currentFrom).toISOString().slice(0, 16)
    : minDateTime,
);

const dueTimeLocal = ref(
  props.taskIds.length === 1 && props.currentDueTime
    ? new Date(props.currentDueTime).toISOString().slice(0, 16)
    : new Date(new Date().getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
);

const showFromWarning = ref(false);
const showDueWarning = ref(false);

const fromInvalid = computed(() => {
  if (!fromLocal.value) return false;
  return new Date(fromLocal.value) < new Date(minDateTime);
});

const dueInvalid = computed(() => {
  if (!dueTimeLocal.value) return false;
  return (
    new Date(dueTimeLocal.value) <= new Date(fromLocal.value || minDateTime) ||
    new Date(dueTimeLocal.value) < new Date(minDateTime)
  );
});

const isInvalid = computed(() => {
  if (!fromLocal.value || !dueTimeLocal.value) return true;
  return fromInvalid.value || dueInvalid.value;
});

const validateFromDate = () => {
  if (fromInvalid.value) {
    showFromWarning.value = true;
  }
};

const validateDueDate = () => {
  if (dueInvalid.value) {
    showDueWarning.value = true;
  }
};

const handleSubmit = () => {
  const fromDate = new Date(fromLocal.value);
  const dueDate = new Date(dueTimeLocal.value);
  const formatLocalDateTime = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
  };

  const from = formatLocalDateTime(fromDate);
  const dueTime = formatLocalDateTime(dueDate);

  emit("reschedule", { from, dueTime, status: "pending" });
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.selected-items {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.selected-items .label {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #374151;
}

.selected-items .count {
  color: #3b82f6;
  font-weight: 700;
}

.date-field {
  margin-bottom: 1.5rem;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.field-header label {
  font-weight: 500;
  color: #374151;
}

.warning-icon {
  cursor: pointer;
  color: #ef4444;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.warning-icon:hover {
  transform: scale(1.1);
}

.date-field input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.date-field input:focus {
  outline: none;
  border-color: #3b82f6;
}

.date-field input.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.warning-message {
  color: #dc2626;
  font-size: medium;

  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fee2e2;
  border-left: 3px solid #dc2626;
  border-radius: 4px;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>

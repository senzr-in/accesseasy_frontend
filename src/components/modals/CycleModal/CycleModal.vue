<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEdit ? "Edit Attendance Cycle" : "Add New Attendance Cycle" }}
        </h3>
        <button @click="$emit('close')" class="modal-close">
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="cycle-form">
          <!-- Cycle Name -->
          <div class="form-group">
            <label class="form-label">Cycle Name</label>
            <input
              v-model="form.cycleName"
              type="text"
              class="form-input"
              placeholder="Enter cycle name"
              required
            />
          </div>

          <!-- Date Range -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Start Day</label>
              <input
                v-model.number="form.startDate"
                type="number"
                class="form-input"
                min="1"
                max="31"
                required
                @input="updateEndDate"
              />
            </div>

            <div class="form-group">
              <label class="form-label">End Day (Auto-calculated)</label>

              <!-- Show hardcoded text if startDate = 1 -->
              <input
                v-if="form.startDate === 1"
                value="end of the month"
                class="form-input"
                readonly
                disabled
              />

              <!-- Else show calculated number -->
              <input
                v-else
                :value="form.endDate"
                type="number"
                class="form-input"
                readonly
                disabled
              />

              <div class="info-text">End date is automatically calculated</div>
            </div>
          </div>

          <!-- Toggle Options -->
          <div class="form-group">
            <div class="toggle-group">
              <div class="toggle-item">
                <label class="toggle-label">
                  <span>Include Weekends</span>
                  <div class="toggle-switch">
                    <input
                      v-model="form.includeWeekends"
                      type="checkbox"
                      class="toggle-input"
                    />
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
              <div class="toggle-item">
                <label class="toggle-label">
                  <span>Include Holidays</span>
                  <div class="toggle-switch">
                    <input
                      v-model="form.includeHolidays"
                      type="checkbox"
                      class="toggle-input"
                    />
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <BaseButton variant="secondary" text="Cancel" @click="$emit('close')" />
        <BaseButton
          variant="primary"
          :text="isEdit ? 'Update Cycle' : 'Create Cycle'"
          :loading="loading"
          @click="handleSubmit"
          :disabled="!isFormValid"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { XIcon } from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  cycle: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  cycleName: "",
  startDate: null,
  endDate: null,
  includeWeekends: true,
  includeHolidays: false,
});

const isEdit = computed(() => !!props.cycle?.cycleId);

// ✅ Disable button until Cycle Name + Start Date entered
const isFormValid = computed(() => {
  return form.value.cycleName.trim() !== "" && !!form.value.startDate;
});

// Reset form
const resetForm = () => {
  form.value = {
    cycleName: "",
    startDate: null,
    endDate: null,
    includeWeekends: true,
    includeHolidays: false,
  };
};

// ✅ Update End Date logic
const updateEndDate = () => {
  const start = Number(form.value.startDate);

  if (!start || start < 1 || start > 31) {
    form.value.endDate = null;
    return;
  }

  if (start === 1) {
    form.value.endDate = "end of the month";
  } else {
    form.value.endDate = start - 1;
  }
};

// Submit
const handleSubmit = () => {
  if (!isFormValid.value) return;
  emit("save", { ...form.value });
};

// Watch cycle prop
watch(
  () => props.cycle,
  (newCycle) => {
    if (newCycle) {
      form.value = {
        cycleName: newCycle.cycleName || "",
        startDate: newCycle.startDate || null,
        endDate:
          newCycle.startDate === 1
            ? "end of the month"
            : (newCycle.startDate || 2) - 1,
        includeWeekends: newCycle.includeWeekends ?? true,
        includeHolidays: newCycle.includeHolidays ?? false,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// Reset form when modal closes
watch(
  () => props.show,
  (show) => {
    if (!show) resetForm();
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.cycle-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #19345f;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.info-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-item {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background-color: #19345f;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .modal-content {
    margin: 0;
    border-radius: 0;
    height: 100vh;
    max-height: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>

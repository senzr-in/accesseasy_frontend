<!-- scr/components/common/filters/filterDateRnage.vue -->
<template>
  <div class="date-range-filter">
    <div class="date-input-group">
      <label v-if="fromLabel" class="date-label">{{ fromLabel }}</label>
      <input
        type="date"
        :value="fromDate"
        @input="$emit('update:fromDate', $event.target.value)"
        @change="$emit('change')"
        class="date-input"
        :disabled="disabled"
      />
    </div>

    <div class="date-input-group">
      <label v-if="toLabel" class="date-label">{{ toLabel }}</label>
      <input
        type="date"
        :value="toDate"
        @input="$emit('update:toDate', $event.target.value)"
        @change="$emit('change')"
        class="date-input"
        :disabled="disabled"
      />
    </div>

    <div v-if="showClearButton && (fromDate || toDate)" class="date-actions">
      <BaseButton
        variant="ghost"
        size="sm"
        :leftIcon="X"
        @click="$emit('clear')"
      >
        {{ clearText }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { X } from "lucide-vue-next";
import BaseButton from "../buttons/BaseButton.vue";

defineProps({
  fromDate: String,
  toDate: String,
  fromLabel: {
    type: String,
    default: "From Date",
  },
  toLabel: {
    type: String,
    default: "To Date",
  },
  disabled: Boolean,
  showClearButton: {
    type: Boolean,
    default: true,
  },
  clearText: {
    type: String,
    default: "Clear Dates",
  },
});

defineEmits(["update:fromDate", "update:toDate", "change", "clear"]);
</script>

<style scoped>
.date-range-filter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.date-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.date-actions {
  display: flex;
  justify-content: flex-end;
}
</style>

<!-- scr/components/common/filters/filterseclect.vue -->
<template>
  <div class="filter-select-wrapper">
    <select
      :value="modelValue"
      @change="
        $emit('update:modelValue', $event.target.value);
        $emit('change', $event.target.value);
      "
      class="filter-select"
      :disabled="disabled"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
        :disabled="option.disabled"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>

    <ChevronDown :size="20" class="select-icon" />
  </div>
</template>

<script setup>
import { ChevronDown } from "lucide-vue-next";

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: String,
  disabled: Boolean,

  // For object options
  valueKey: {
    type: String,
    default: "value",
  },
  labelKey: {
    type: String,
    default: "label",
  },
});

defineEmits(["update:modelValue", "change"]);

const getOptionValue = (option) => {
  return typeof option === "object" ? option[props.valueKey] : option;
};

const getOptionLabel = (option) => {
  return typeof option === "object" ? option[props.labelKey] : option;
};
</script>

<style scoped>
.filter-select-wrapper {
  position: relative;
  width: 100%;
}

.filter-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #fff;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover:not(:disabled) {
  border-color: #cbd5e1;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
}
</style>

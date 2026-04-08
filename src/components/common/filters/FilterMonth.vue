<template>
  <div class="filter-month">
    <select v-model="selectedMonth" @change="handleChange" class="month-select">
      <option value="">All Months</option>
      <option
        v-for="month in monthOptions"
        :key="month.value"
        :value="month.value"
      >
        {{ month.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "change", "clear"]);

const selectedMonth = ref(props.modelValue);

const monthOptions = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

watch(
  () => props.modelValue,
  (newValue) => {
    selectedMonth.value = newValue;
  },
);

const handleChange = () => {
  emit("update:modelValue", selectedMonth.value);
  emit("change", selectedMonth.value);
};
</script>

<style scoped>
.filter-month {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: border-color 0.2s ease;
}

.month-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background-color: #f3f4f6;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-button:hover {
  background-color: #e5e7eb;
  color: #374151;
}
</style>

<template>
  <button 
    class="expand-button"
    @click="$emit('toggle')"
    :aria-expanded="isExpanded"
    title="Toggle Details"
  >
    <ChevronDown 
      :size="16"
      :class="{ 'rotate-180': isExpanded }"
    />
  </button>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next';

defineProps({
  isExpanded: Boolean
});

defineEmits(['toggle']);
</script>

<style scoped>
.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.expand-button svg {
  transition: transform 0.2s ease;
}

.expand-button svg.rotate-180 {
  transform: rotate(180deg);
}
</style>

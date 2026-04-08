<template>
  <div class="assigned-info">
    <User :size="16" />
    <span>{{ user || "Unassigned" }}</span>
  </div>
</template>

<script setup>
import { User } from 'lucide-vue-next';

defineProps({
  user: String
});
</script>

<style scoped>
.assigned-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.assigned-info svg {
  color: #94a3b8;
}
</style>

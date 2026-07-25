<template>
  <div class="client-info">
    <Users :size="16" />
    <span>{{ client || "No Client" }}</span>
  </div>
</template>

<script setup>
import { Users } from 'lucide-vue-next';

defineProps({
  client: String
});
</script>

<style scoped>
.client-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.client-info svg {
  color: #94a3b8;
}
</style>

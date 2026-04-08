<template>
  <slot v-if="hasAccess"></slot>
</template>

<script setup>
import { computed } from 'vue';
import { authService } from '@/services/authService';

const props = defineProps({
  requiredRole: {
    type: [String, Array],
    required: true
  }
});

// Read role synchronously — it's always in localStorage after login
const userRole = authService.getUserRole(); // returns role.name string e.g. "Admin", "esslAdmin"

const hasAccess = computed(() => {
  if (!userRole) return false;

  // Normalize both sides to lowercase for safe comparison
  const normalizedUserRole = userRole.toLowerCase();

  if (Array.isArray(props.requiredRole)) {
    return props.requiredRole.some(r => r.toLowerCase() === normalizedUserRole);
  }

  return props.requiredRole.toLowerCase() === normalizedUserRole;
});
</script>

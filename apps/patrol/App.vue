<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePlanStore } from '@/stores/usePlanStore';
import { authService } from '@/services/authService';

// Force light mode and clean up any old dark mode state
localStorage.removeItem('ae_theme');
document.documentElement.classList.remove('dark');

const planStore = usePlanStore();

onMounted(async () => {
  // Only initialize plan data if the user is authenticated.
  // The router beforeEach handles redirecting unauthenticated users,
  // so this guard prevents a premature API call on the login page.
  if (authService.isAuthenticated() && authService.isPinVerified()) {
    await planStore.initPlan();
  }
});
</script>

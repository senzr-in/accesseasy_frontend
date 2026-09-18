<!-- src/App.vue -->
<template>
  <div>
    <router-view />
    <GlobalToast />
  </div>
</template>

<script setup>
import GlobalToast from '@/components/common/GlobalToast.vue';

// Force light mode and clean up any old dark mode state
localStorage.removeItem('ae_theme');
document.documentElement.classList.remove('dark');
</script>

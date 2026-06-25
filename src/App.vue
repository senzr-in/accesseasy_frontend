<!-- src/App.vue -->
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Apply dark mode class to <html> based on localStorage preference.
// Defaults to dark mode so the premium dark design is visible immediately.
onMounted(() => {
  const saved = localStorage.getItem('ae_theme');
  if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Default to dark mode
    document.documentElement.classList.add('dark');
    if (!saved) localStorage.setItem('ae_theme', 'dark');
  }
});
</script>

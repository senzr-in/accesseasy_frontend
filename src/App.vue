<!-- src/App.vue -->
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Enforce light theme as default
onMounted(() => {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('ae_theme', 'light');
});
</script>

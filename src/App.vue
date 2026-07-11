<!-- src/App.vue -->
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Force light mode — remove any previously stored dark preference
onMounted(() => {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('ae_theme');
});
</script>

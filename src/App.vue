<!-- src/App.vue -->
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
// Force light mode and clean up any old dark mode state
localStorage.removeItem('ae_theme');
document.documentElement.classList.remove('dark');
</script>

<!-- src/App.vue -->
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { useDark } from '@vueuse/core';


// Initialize dark mode
useDark({
  storageKey: 'ae_theme',
});
</script>

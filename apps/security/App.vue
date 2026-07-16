<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { useDark } from '@vueuse/core';

// Migrate stale 'light' value written by the old appearance.vue
// useDark expects '' (empty string) for light mode, not 'light'
const storedTheme = localStorage.getItem('ae_theme');
if (storedTheme === 'light') {
  localStorage.removeItem('ae_theme');
  document.documentElement.classList.remove('dark');
}

// Initialize dark mode
useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'ae_theme',
});
</script>

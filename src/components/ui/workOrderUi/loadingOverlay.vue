<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading...</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
});
</script>

<!-- scr/components/common/filters/filterSection.vue -->
<template>
  <div class="filter-section" :class="sectionClass">
    <h4 v-if="title" class="filter-section-title">
      <component v-if="icon" :is="icon" :size="18" />
      {{ title }}
      <span v-if="count !== null" class="filter-count">({{ count }})</span>
    </h4>

    <div class="filter-section-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  icon: [Object, Function],
  count: [Number, String],
  sectionClass: String,
});
</script>

<style scoped>
.filter-section {
  margin-bottom: 2rem;
}

.filter-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-count {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
}

.filter-section-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>

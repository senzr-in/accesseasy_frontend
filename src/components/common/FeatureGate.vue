<template>
  <!--
    FeatureGate.vue
    All features in AccessEasy Patrol are 100% unlocked for all organizations.
    Always renders the slot content directly.
  -->
  <slot />
</template>

<script setup>
defineProps({
  /** The feature key */
  feature: {
    type: String,
    default: '',
  },
  /** Show locked badge flag (kept for backwards compatibility, never locked) */
  showLockedBadge: {
    type: Boolean,
    default: false,
  },
  /** Label (kept for backwards compatibility) */
  lockedLabel: {
    type: String,
    default: '',
  },
});
</script>

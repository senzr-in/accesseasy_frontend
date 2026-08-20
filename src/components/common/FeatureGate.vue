<template>
  <!--
    FeatureGate.vue
    Phase 0 — Feature Entitlement Gate

    Renders slot content only if the current plan has the feature enabled.
    Renders the #locked slot (or nothing) if the feature is not available.

    Usage:
      <FeatureGate feature="geofence.zone">
        <ZoneGeofenceEditor />
        <template #locked>
          <UpgradeBadge message="Advanced geofencing is a Pro feature" />
        </template>
      </FeatureGate>

    Usage with inline locked badge:
      <FeatureGate feature="incident.escalation" show-locked-badge />
  -->
  <template v-if="store.ready">
    <!-- Feature available -->
    <slot v-if="hasFeature" />

    <!-- Feature locked -->
    <template v-else>
      <slot name="locked">
        <!-- Default locked badge when no custom #locked slot is provided -->
        <div v-if="showLockedBadge" class="fg-locked-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span>{{ lockedLabel }}</span>
          <button class="fg-locked-badge__cta" @click="$emit('upgrade')">
            {{ upgradePlan === 'custom' ? 'Contact Sales' : 'Upgrade to Pro' }}
          </button>
        </div>
      </slot>
    </template>
  </template>

  <!-- Still loading — render slot optimistically to avoid flash -->
  <slot v-else />
</template>

<script setup>
import { computed } from 'vue';
import { usePlanStore } from '@/stores/usePlanStore';

const props = defineProps({
  /**
   * The feature key to check. e.g. 'geofence.zone', 'incident.escalation'
   */
  feature: {
    type: String,
    required: true,
  },
  /**
   * If true and no #locked slot is provided, shows the default locked badge.
   */
  showLockedBadge: {
    type: Boolean,
    default: false,
  },
  /**
   * Label shown in the locked badge.
   */
  lockedLabel: {
    type: String,
    default: 'Pro Feature',
  },
});

defineEmits(['upgrade']);

const store = usePlanStore();

const hasFeature = computed(() => store.entitlements.has(props.feature));

/** Which plan would unlock this feature? */
const upgradePlan = computed(() => {
  // Custom-only features
  if (props.feature.startsWith('enterprise.')) return 'custom';
  return 'pro';
});
</script>

<style scoped>
.fg-locked-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 8px;
  color: #a78bfa;
  font-size: 12px;
  font-weight: 500;
}

.fg-locked-badge__cta {
  margin-left: 6px;
  padding: 3px 10px;
  background: rgba(139, 92, 246, 0.18);
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 5px;
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.fg-locked-badge__cta:hover {
  background: rgba(139, 92, 246, 0.3);
}
</style>

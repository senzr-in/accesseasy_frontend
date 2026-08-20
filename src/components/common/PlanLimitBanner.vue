<template>
  <!-- PlanLimitBanner — inline warning strip shown when a resource limit is reached -->
  <Transition name="plan-banner-fade">
    <div
      v-if="visible"
      class="plan-limit-banner"
      :class="`plan-limit-banner--${severity}`"
      role="alert"
    >
      <div class="plan-limit-banner__inner">
        <!-- Icon -->
        <div class="plan-limit-banner__icon">
          <svg v-if="severity === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <!-- Message -->
        <div class="plan-limit-banner__text">
          <span class="plan-limit-banner__message">{{ message }}</span>
          <span v-if="currentCount !== undefined && maxCount !== undefined" class="plan-limit-banner__count">
            {{ currentCount }} / {{ maxCount }}
          </span>
        </div>

        <!-- Upgrade CTA -->
        <button
          v-if="showUpgrade"
          class="plan-limit-banner__upgrade"
          @click="$emit('upgrade')"
        >
          {{ upgradeLabel }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        <!-- Dismiss -->
        <button
          v-if="dismissible"
          class="plan-limit-banner__dismiss"
          aria-label="Dismiss"
          @click="visible = false"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  /**
   * The message to display. Usually the upgradeMessage from subscriptionService.checkLimit().
   */
  message: {
    type: String,
    required: true,
  },
  /**
   * 'warning' = near limit (80%+), 'error' = at limit (100%)
   */
  severity: {
    type: String,
    default: 'error',
    validator: v => ['warning', 'error'].includes(v),
  },
  currentCount: {
    type: Number,
    default: undefined,
  },
  maxCount: {
    type: Number,
    default: undefined,
  },
  showUpgrade: {
    type: Boolean,
    default: true,
  },
  upgradeLabel: {
    type: String,
    default: 'Upgrade Plan',
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['upgrade']);

const visible = ref(true);

// Reset visibility when message changes (new limit hit)
watch(() => props.message, () => { visible.value = true; });
</script>

<style scoped>
.plan-limit-banner {
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
}

.plan-limit-banner__inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid;
}

/* Warning — approaching limit */
.plan-limit-banner--warning .plan-limit-banner__inner {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}
.plan-limit-banner--warning .plan-limit-banner__upgrade {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}
.plan-limit-banner--warning .plan-limit-banner__upgrade:hover {
  background: rgba(245, 158, 11, 0.25);
}

/* Error — at limit */
.plan-limit-banner--error .plan-limit-banner__inner {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}
.plan-limit-banner--error .plan-limit-banner__upgrade {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}
.plan-limit-banner--error .plan-limit-banner__upgrade:hover {
  background: rgba(239, 68, 68, 0.25);
}

.plan-limit-banner__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.plan-limit-banner__text {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.plan-limit-banner__message {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.plan-limit-banner__count {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.8;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.plan-limit-banner__upgrade {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.18s ease;
  white-space: nowrap;
}

.plan-limit-banner__dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: opacity 0.15s;
}
.plan-limit-banner__dismiss:hover { opacity: 1; }

/* Transition */
.plan-banner-fade-enter-active,
.plan-banner-fade-leave-active { transition: all 0.25s ease; }
.plan-banner-fade-enter-from,
.plan-banner-fade-leave-to    { opacity: 0; transform: translateY(-6px); }
</style>

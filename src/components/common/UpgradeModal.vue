<template>
  <!-- UpgradeModal — Plan comparison + usage meters + upgrade CTA -->
  <Teleport to="body">
    <Transition name="upgrade-modal">
      <div
        v-if="modelValue"
        class="um-overlay"
        @click.self="$emit('update:modelValue', false)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        <div class="um-panel">
          <!-- Close -->
          <button class="um-close" @click="$emit('update:modelValue', false)" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Header -->
          <div class="um-header">
            <div class="um-header__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Upgrade Your Plan
            </div>
            <h2 class="um-header__title" id="upgrade-modal-title">
              {{ triggerMessage || 'Unlock more with AccessEasy Patrol' }}
            </h2>
            <p class="um-header__sub">Choose the plan that fits your security operations.</p>
          </div>

          <!-- Current Usage Meters -->
          <div v-if="store.usageMeters.length" class="um-usage">
            <div class="um-usage__title">Current Usage — {{ planLabel }}</div>
            <div class="um-usage__grid">
              <div
                v-for="meter in store.usageMeters"
                :key="meter.resource"
                class="um-meter"
                :class="{ 'um-meter--warn': meter.resource === 'sites' && meter.nearLimit, 'um-meter--full': meter.resource === 'sites' && meter.atLimit }"
              >
                <div class="um-meter__row">
                  <span class="um-meter__label">{{ meter.label }}</span>
                  <span class="um-meter__count">
                    {{ meter.isUnlimited || meter.max === Infinity ? `${meter.current} (∞)` : `${meter.current} / ${meter.max}` }}
                  </span>
                </div>
                <div class="um-meter__bar">
                  <div
                    class="um-meter__fill"
                    :style="{ width: `${meter.isUnlimited || meter.max === Infinity ? 100 : Math.min(meter.percent || 0, 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Plan Showcase Card -->
          <div class="um-single-plan">
            <div class="um-single-plan__left">
              <div class="um-single-plan__tag">⭐ All Patrol Features Included</div>
              <h3 class="um-single-plan__title">AccessEasy Patrol Platform</h3>
              <p class="um-single-plan__desc">
                Everything unlocked: Live GPS tracking, geofence breach alarms, automated escalation chains, patrol scheduling, and command center.
              </p>
              <div class="um-single-plan__price">
                <span class="price-val">₹1,999</span>
                <span class="price-sub">/ site / month</span>
              </div>
            </div>

            <div class="um-single-plan__right">
              <ul class="um-features-list">
                <li><span class="um-check">✓</span> All Platform Features Unlocked</li>
                <li><span class="um-check">✓</span> Scale Sites Seamlessly</li>
                <li><span class="um-check">✓</span> Unlimited Guards & Checkpoints</li>
                <li><span class="um-check">✓</span> Live Breadcrumbs & Escalation</li>
              </ul>
              <button class="um-plan__cta" @click="handleNavigateToPlans">
                Configure Sites & Upgrade →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/usePlanStore';
import { subscriptionService } from '@/services/subscriptionService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** The message that triggered the modal (e.g. from checkLimit()) */
  triggerMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'upgrade-requested']);
const router = useRouter();
const store = usePlanStore();

const planLabel = computed(() => {
  if (store.isTrial) return '⚡ 7-Day Free Trial';
  return '⭐ Full Platform Plan';
});

async function handleNavigateToPlans() {
  await subscriptionService.logEvent('plan_upgrade_requested', { target_plan: 'full_platform' });
  emit('upgrade-requested', 'full_platform');
  emit('update:modelValue', false);
  router.push('/dashboard/settings/plans');
}
</script>

<style scoped>
.um-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.um-panel {
  position: relative;
  background: #111318;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 20px;
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.7);
}

.um-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s;
}
.um-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

/* Header */
.um-header { margin-bottom: 24px; }

.um-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #818cf8;
  margin-bottom: 12px;
}

.um-header__title {
  font-size: 22px;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 6px;
  line-height: 1.2;
}

.um-header__sub {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Usage meters */
.um-usage {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.um-usage__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 12px;
}

.um-usage__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.um-meter {}
.um-meter__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.um-meter__label { font-size: 12px; color: #9ca3af; }
.um-meter__count {
  font-size: 11px;
  font-weight: 700;
  color: #d1d5db;
  font-variant-numeric: tabular-nums;
}
.um-meter--warn .um-meter__count { color: #fbbf24; }
.um-meter--full .um-meter__count { color: #f87171; }

.um-meter__bar {
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
}
.um-meter__fill {
  height: 100%;
  background: #4f46e5;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.25,1,0.5,1);
}
.um-meter--warn .um-meter__fill { background: #f59e0b; }
.um-meter--full .um-meter__fill { background: #ef4444; }

/* Single Plan Showcase */
.um-single-plan {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.12) 100%);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 16px;
  padding: 24px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  align-items: center;
}

@media (max-width: 700px) {
  .um-single-plan { grid-template-columns: 1fr; }
}

.um-single-plan__tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.18);
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.um-single-plan__title {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px;
}

.um-single-plan__desc {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 14px;
}

.um-single-plan__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.price-val { font-size: 28px; font-weight: 900; color: #ffffff; }
.price-sub { font-size: 12px; color: #64748b; font-weight: 600; }

.um-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.um-features-list li {
  font-size: 12px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.um-check { color: #4ade80; font-weight: 700; font-size: 11px; }
.um-x     { color: #4b5563; font-weight: 700; font-size: 11px; }

.um-plan__cta {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s, transform 0.15s;
}
.um-plan__cta:hover { opacity: 0.9; transform: scale(0.98); }

.um-plan__cta--secondary {
  background: rgba(168,85,247,0.2);
  border: 1px solid rgba(168,85,247,0.35);
  color: #c084fc;
}

.um-plan__current-label {
  margin-top: 12px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #4ade80;
}

/* Transition */
.upgrade-modal-enter-active,
.upgrade-modal-leave-active { transition: all 0.25s ease; }
.upgrade-modal-enter-from .um-panel,
.upgrade-modal-leave-to   .um-panel { transform: scale(0.95) translateY(10px); opacity: 0; }
.upgrade-modal-enter-from,
.upgrade-modal-leave-to { opacity: 0; }
</style>

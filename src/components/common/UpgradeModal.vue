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
                :class="{ 'um-meter--warn': meter.nearLimit, 'um-meter--full': meter.atLimit }"
              >
                <div class="um-meter__row">
                  <span class="um-meter__label">{{ meter.label }}</span>
                  <span class="um-meter__count">
                    {{ meter.max === Infinity ? '∞' : `${meter.current} / ${meter.max}` }}
                  </span>
                </div>
                <div class="um-meter__bar">
                  <div
                    class="um-meter__fill"
                    :style="{ width: `${Math.min(meter.percent, 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Plan Comparison Table -->
          <div class="um-plans">
            <!-- Normal -->
            <div class="um-plan" :class="{ 'um-plan--current': store.plan === 'normal' }">
              <div class="um-plan__badge um-plan__badge--normal">Normal</div>
              <div class="um-plan__name">Basic Patrol</div>
              <div class="um-plan__desc">Single-site patrol execution for small teams</div>
              <ul class="um-plan__list">
                <li><span class="um-check">✓</span> 1 Site, 3 Zones</li>
                <li><span class="um-check">✓</span> 5 Guards</li>
                <li><span class="um-check">✓</span> 30 Checkpoints</li>
                <li><span class="um-check">✓</span> QR + GPS + Photo</li>
                <li><span class="um-check">✓</span> Offline patrol</li>
                <li><span class="um-check">✓</span> Basic incidents</li>
                <li><span class="um-x">✗</span> Escalation engine</li>
                <li><span class="um-x">✗</span> Live map</li>
                <li><span class="um-x">✗</span> NFC / Video</li>
              </ul>
              <div v-if="store.plan === 'normal'" class="um-plan__current-label">Current Plan</div>
            </div>

            <!-- Pro -->
            <div class="um-plan um-plan--pro" :class="{ 'um-plan--current': store.plan === 'pro' }">
              <div class="um-plan__badge um-plan__badge--pro">⭐ Pro</div>
              <div class="um-plan__name">Security Operations</div>
              <div class="um-plan__desc">Multi-site command for professional security teams</div>
              <ul class="um-plan__list">
                <li><span class="um-check">✓</span> 10 Sites, 25 Zones/Site</li>
                <li><span class="um-check">✓</span> 100 Guards</li>
                <li><span class="um-check">✓</span> 1,000 Checkpoints</li>
                <li><span class="um-check">✓</span> NFC + Video + Checklists</li>
                <li><span class="um-check">✓</span> Operations Center + Live Map</li>
                <li><span class="um-check">✓</span> Escalation engine</li>
                <li><span class="um-check">✓</span> Full incident workflow</li>
                <li><span class="um-check">✓</span> Advanced geofencing</li>
                <li><span class="um-check">✓</span> API + Webhooks</li>
              </ul>
              <button
                v-if="store.plan === 'normal'"
                class="um-plan__cta"
                @click="handleUpgrade('pro')"
              >
                Upgrade to Pro →
              </button>
              <div v-else-if="store.plan === 'pro'" class="um-plan__current-label">Current Plan</div>
            </div>

            <!-- Custom -->
            <div class="um-plan" :class="{ 'um-plan--current': store.plan === 'custom' }">
              <div class="um-plan__badge um-plan__badge--custom">Custom</div>
              <div class="um-plan__name">Enterprise Platform</div>
              <div class="um-plan__desc">Built for large agencies, industrial groups and enterprises</div>
              <ul class="um-plan__list">
                <li><span class="um-check">✓</span> Custom capacity</li>
                <li><span class="um-check">✓</span> Multiple clients</li>
                <li><span class="um-check">✓</span> SSO + Custom roles</li>
                <li><span class="um-check">✓</span> Custom workflows + SLA</li>
                <li><span class="um-check">✓</span> CCTV/NVR integrations</li>
                <li><span class="um-check">✓</span> Dedicated support</li>
                <li><span class="um-check">✓</span> Custom dashboards</li>
                <li><span class="um-check">✓</span> Enterprise integrations</li>
              </ul>
              <button
                v-if="store.plan !== 'custom'"
                class="um-plan__cta um-plan__cta--secondary"
                @click="handleUpgrade('custom')"
              >
                Contact Sales →
              </button>
              <div v-else class="um-plan__current-label">Current Plan</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
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

const store = usePlanStore();

const planLabel = computed(() => ({
  normal: '🟢 Normal',
  pro:    '🔵 Pro',
  custom: '🟣 Custom',
}[store.plan] || store.plan));

async function handleUpgrade(targetPlan) {
  await subscriptionService.logEvent('plan_upgrade_requested', { target_plan: targetPlan });
  emit('upgrade-requested', targetPlan);
  emit('update:modelValue', false);
  // TODO: Navigate to billing page or open external checkout
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

/* Plan cards */
.um-plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 700px) {
  .um-plans { grid-template-columns: 1fr; }
}

.um-plan {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.um-plan--pro {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.3);
}

.um-plan--current {
  border-color: rgba(74, 222, 128, 0.3);
}

.um-plan__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 5px;
  align-self: flex-start;
}
.um-plan__badge--normal { background: rgba(74,222,128,0.15); color: #4ade80; }
.um-plan__badge--pro    { background: rgba(99,102,241,0.2);  color: #818cf8; }
.um-plan__badge--custom { background: rgba(168,85,247,0.15); color: #c084fc; }

.um-plan__name {
  font-size: 16px;
  font-weight: 800;
  color: #f9fafb;
}

.um-plan__desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.um-plan__list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.um-plan__list li {
  font-size: 12px;
  color: #d1d5db;
  display: flex;
  align-items: baseline;
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

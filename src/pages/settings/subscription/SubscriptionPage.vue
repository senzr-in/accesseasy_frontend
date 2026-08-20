<template>
  <div class="sub-page">
    <!-- Loading state -->
    <div v-if="store.loading" class="sub-page__loading">
      <div class="sub-spinner" />
      <span>Loading plan details…</span>
    </div>

    <template v-else>
      <!-- Plan Header -->
      <div class="sub-header">
        <div class="sub-header__left">
          <div class="sub-plan-badge" :class="`sub-plan-badge--${store.plan}`">
            {{ planBadgeLabel }}
          </div>
          <div>
            <h1 class="sub-header__title">Your Subscription</h1>
            <p class="sub-header__meta">
              Status: <strong :class="statusClass">{{ statusLabel }}</strong>
              <span v-if="renewalDate" class="sub-header__renewal">
                · Renews {{ renewalDate }}
              </span>
            </p>
          </div>
        </div>
        <button
          v-if="store.plan !== 'custom'"
          class="sub-upgrade-btn"
          @click="showUpgradeModal = true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          {{ store.plan === 'normal' ? 'Upgrade to Pro' : 'Upgrade to Enterprise' }}
        </button>
      </div>

      <!-- Usage Meters -->
      <section class="sub-section">
        <h2 class="sub-section__title">Plan Usage</h2>
        <div class="sub-meters-grid">
          <div
            v-for="meter in store.usageMeters"
            :key="meter.resource"
            class="sub-meter-card"
            :class="{
              'sub-meter-card--warn': meter.nearLimit,
              'sub-meter-card--full': meter.atLimit,
            }"
          >
            <div class="sub-meter-card__header">
              <span class="sub-meter-card__label">{{ meter.label }}</span>
              <span class="sub-meter-card__count">
                <template v-if="meter.max === Infinity">Unlimited</template>
                <template v-else>{{ meter.current }} <span class="sub-meter-card__max">/ {{ meter.max }}</span></template>
              </span>
            </div>
            <div class="sub-meter-card__bar-wrap">
              <div class="sub-meter-card__bar">
                <div
                  class="sub-meter-card__fill"
                  :style="{ width: `${Math.min(meter.percent, 100)}%` }"
                />
              </div>
              <span class="sub-meter-card__pct" v-if="meter.max !== Infinity">{{ meter.percent }}%</span>
            </div>
            <div v-if="meter.atLimit" class="sub-meter-card__warn-msg">
              Limit reached — <button class="sub-inline-link" @click="showUpgradeModal = true">Upgrade to increase</button>
            </div>
            <div v-else-if="meter.nearLimit" class="sub-meter-card__warn-msg sub-meter-card__warn-msg--amber">
              Approaching limit
            </div>
          </div>
        </div>
      </section>

      <!-- Plan Limits Reference -->
      <section class="sub-section">
        <h2 class="sub-section__title">Plan Limits</h2>
        <div class="sub-limits-table">
          <div class="sub-limits-row sub-limits-row--header">
            <span>Resource</span>
            <span>Your Limit</span>
          </div>
          <div v-for="row in limitRows" :key="row.label" class="sub-limits-row">
            <span class="sub-limits-row__label">{{ row.label }}</span>
            <span class="sub-limits-row__value">{{ row.value }}</span>
          </div>
        </div>
      </section>

      <!-- Feature Entitlements -->
      <section class="sub-section">
        <h2 class="sub-section__title">Feature Access</h2>
        <div class="sub-features-grid">
          <div
            v-for="group in featureGroups"
            :key="group.label"
            class="sub-feature-group"
          >
            <div class="sub-feature-group__title">{{ group.label }}</div>
            <div
              v-for="feat in group.features"
              :key="feat.key"
              class="sub-feature-row"
              :class="{ 'sub-feature-row--locked': !store.entitlements.has(feat.key) }"
            >
              <span class="sub-feature-row__icon">
                {{ store.entitlements.has(feat.key) ? '✓' : '✗' }}
              </span>
              <span>{{ feat.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Upgrade Modal -->
    <UpgradeModal
      v-model="showUpgradeModal"
      @upgrade-requested="onUpgradeRequested"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePlanStore } from '@/stores/usePlanStore';
import UpgradeModal from '@/components/common/UpgradeModal.vue';

const store = usePlanStore();
const showUpgradeModal = ref(false);

const planBadgeLabel = computed(() => ({
  normal: '🟢 Normal',
  pro:    '🔵 Pro ⭐',
  custom: '🟣 Custom',
}[store.plan] || store.plan));

const statusLabel = computed(() => {
  const s = store.subscription ? store.subscription.status : 'active';
  return { active: 'Active', trial: 'Trial', suspended: 'Suspended', cancelled: 'Cancelled' }[s] || 'Active';
});

const statusClass = computed(() => {
  const s = store.subscription ? store.subscription.status : 'active';
  return { active: 'sub-status--active', trial: 'sub-status--trial', suspended: 'sub-status--warn', cancelled: 'sub-status--error' }[s] || 'sub-status--active';
});

const renewalDate = computed(() => {
  const d = store.subscription?.renewal_date;
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
});

const limitRows = computed(() => {
  const l = store.limits;
  if (!l) return [];
  const fmt = v => v === undefined || v === null || v === Infinity ? 'Unlimited' : v.toLocaleString();
  const fmtBytes = v => v === Infinity ? 'Unlimited' : `${(v / 1073741824).toFixed(0)} GB`;
  const fmtDays = v => v === Infinity ? 'Unlimited' : `${v} days`;
  return [
    { label: 'Sites',               value: fmt(l.sites) },
    { label: 'Zones per Site',      value: fmt(l.zones_per_site) },
    { label: 'Guards',              value: fmt(l.guards) },
    { label: 'Patrol Routes',       value: fmt(l.patrol_routes) },
    { label: 'Checkpoints',         value: fmt(l.checkpoints) },
    { label: 'Active Patrols/Day',  value: fmt(l.active_patrols_per_day) },
    { label: 'Admin Users',         value: fmt(l.admin_users) },
    { label: 'Storage',             value: fmtBytes(l.storage_bytes) },
    { label: 'Data Retention',      value: fmtDays(l.retention_days) },
  ];
});

const featureGroups = [
  {
    label: 'Attendance',
    features: [
      { key: 'attendance.basic',           label: 'Basic Attendance' },
      { key: 'attendance.advanced',        label: 'Advanced Attendance' },
      { key: 'attendance.breaks',          label: 'Break Management' },
      { key: 'attendance.shift_compliance',label: 'Shift Compliance' },
      { key: 'attendance.replacement',     label: 'Guard Replacement' },
    ]
  },
  {
    label: 'Geofencing',
    features: [
      { key: 'geofence.checkpoint_radius', label: 'Checkpoint Radius' },
      { key: 'geofence.site',              label: 'Site Geofence' },
      { key: 'geofence.zone',              label: 'Zone Geofence' },
      { key: 'geofence.live_tracking',     label: 'Live Guard Tracking' },
      { key: 'geofence.violation_history', label: 'Violation History' },
    ]
  },
  {
    label: 'Evidence',
    features: [
      { key: 'evidence.qr',       label: 'QR Scanning' },
      { key: 'evidence.gps',      label: 'GPS Verification' },
      { key: 'evidence.photo',    label: 'Photo Evidence' },
      { key: 'evidence.nfc',      label: 'NFC Scanning' },
      { key: 'evidence.video',    label: 'Video Evidence' },
      { key: 'evidence.checklist',label: 'Checklists' },
      { key: 'evidence.export',   label: 'Evidence Export' },
    ]
  },
  {
    label: 'Incidents',
    features: [
      { key: 'incident.basic',           label: 'Basic Incident Reporting' },
      { key: 'incident.workflow',        label: 'Full Incident Workflow' },
      { key: 'incident.escalation',      label: 'Escalation Engine' },
      { key: 'incident.custom_workflow', label: 'Custom Workflows' },
    ]
  },
  {
    label: 'Operations',
    features: [
      { key: 'ops.operations_center', label: 'Operations Center' },
      { key: 'ops.live_map',          label: 'Live Map' },
      { key: 'ops.broadcast',         label: 'Broadcast Messaging' },
      { key: 'ops.audit_log',         label: 'Audit Logs' },
      { key: 'ops.api',               label: 'API Access' },
      { key: 'ops.webhooks',          label: 'Webhooks' },
    ]
  },
  {
    label: 'Enterprise',
    features: [
      { key: 'enterprise.sso',            label: 'SSO' },
      { key: 'enterprise.custom_roles',   label: 'Custom Roles' },
      { key: 'enterprise.multi_client',   label: 'Multi-Client' },
      { key: 'enterprise.integrations',   label: 'Enterprise Integrations' },
      { key: 'enterprise.cctv',           label: 'CCTV/NVR Integration' },
      { key: 'enterprise.custom_sla',     label: 'Custom SLA' },
    ]
  },
];

function onUpgradeRequested(targetPlan) {
  // TODO: Route to billing / contact sales
  console.log('[SubscriptionPage] Upgrade requested:', targetPlan);
}
</script>

<style scoped>
.sub-page {
  padding: 28px 24px;
  max-width: 1000px;
  font-family: inherit;
}

.sub-page__loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  padding: 40px 0;
}

.sub-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Header */
.sub-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.sub-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sub-plan-badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.sub-plan-badge--normal { background: rgba(74,222,128,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
.sub-plan-badge--pro    { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.35); }
.sub-plan-badge--custom { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); }

.sub-header__title {
  font-size: 20px;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 4px;
}

.sub-header__meta {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.sub-header__renewal { margin-left: 4px; }

.sub-status--active { color: #4ade80; }
.sub-status--trial  { color: #fbbf24; }
.sub-status--warn   { color: #f59e0b; }
.sub-status--error  { color: #f87171; }

.sub-upgrade-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.18s, transform 0.15s;
}
.sub-upgrade-btn:hover { opacity: 0.88; transform: scale(0.98); }

/* Sections */
.sub-section { margin-bottom: 32px; }
.sub-section__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0 0 14px;
}

/* Usage meters */
.sub-meters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.sub-meter-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 14px;
}
.sub-meter-card--warn { border-color: rgba(245,158,11,0.3); }
.sub-meter-card--full { border-color: rgba(239,68,68,0.3); }

.sub-meter-card__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.sub-meter-card__label { font-size: 13px; color: #9ca3af; }
.sub-meter-card__count { font-size: 14px; font-weight: 800; color: #f9fafb; font-variant-numeric: tabular-nums; }
.sub-meter-card__max   { font-size: 12px; font-weight: 500; color: #6b7280; }

.sub-meter-card__bar-wrap { display: flex; align-items: center; gap: 8px; }
.sub-meter-card__bar {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.07);
  border-radius: 999px;
  overflow: hidden;
}
.sub-meter-card__fill {
  height: 100%;
  background: #4f46e5;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.25,1,0.5,1);
}
.sub-meter-card--warn .sub-meter-card__fill { background: #f59e0b; }
.sub-meter-card--full .sub-meter-card__fill { background: #ef4444; }
.sub-meter-card__pct { font-size: 11px; color: #6b7280; min-width: 30px; text-align: right; font-variant-numeric: tabular-nums; }

.sub-meter-card__warn-msg {
  margin-top: 6px;
  font-size: 11px;
  color: #f87171;
}
.sub-meter-card__warn-msg--amber { color: #fbbf24; }
.sub-inline-link {
  background: none;
  border: none;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
}

/* Limits table */
.sub-limits-table {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  overflow: hidden;
}
.sub-limits-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 13px;
}
.sub-limits-row:last-child { border-bottom: none; }
.sub-limits-row--header {
  background: rgba(255,255,255,0.03);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
}
.sub-limits-row__label { color: #9ca3af; }
.sub-limits-row__value { font-weight: 700; color: #f9fafb; font-variant-numeric: tabular-nums; }

/* Features grid */
.sub-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.sub-feature-group {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 14px;
}

.sub-feature-group__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 10px;
}

.sub-feature-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #d1d5db;
  padding: 3px 0;
}
.sub-feature-row--locked { color: #4b5563; }
.sub-feature-row__icon {
  font-size: 11px;
  font-weight: 800;
  min-width: 12px;
}
.sub-feature-row:not(.sub-feature-row--locked) .sub-feature-row__icon { color: #4ade80; }
.sub-feature-row--locked .sub-feature-row__icon { color: #374151; }
</style>

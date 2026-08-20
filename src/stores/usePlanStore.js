/**
 * usePlanStore.js
 * Phase 0 — Global Plan State (Singleton)
 *
 * Mirrors the same pattern as useSOCStore.js in this codebase.
 * Loaded once at app init; shared reactively across all components.
 *
 * State:
 *   plan           — 'normal' | 'pro' | 'custom'
 *   subscription   — full subscription row
 *   limits         — plan_limits row
 *   entitlements   — Set<string> of enabled feature keys
 *   usage          — subscription_usage row
 *   ready          — true once initial load completes
 */

import { ref, reactive, computed } from 'vue';
import { subscriptionService } from '@/services/subscriptionService';

// ─── Singleton state ──────────────────────────────────────────────────────────
const plan         = ref('normal');
const subscription = ref(null);
const limits       = ref(null);
const entitlements = ref(new Set());
const usage        = ref({});
const ready        = ref(false);
const loading      = ref(false);
const error        = ref(null);

// ─── Getters ──────────────────────────────────────────────────────────────────
const isNormal = computed(() => plan.value === 'normal');
const isPro    = computed(() => plan.value === 'pro' || plan.value === 'custom');
const isCustom = computed(() => plan.value === 'custom');

/**
 * Usage percentages for the subscription usage meter UI.
 * Returns array of { label, resource, current, max, percent, nearLimit, atLimit }
 */
const usageMeters = computed(() => {
  if (!limits.value) return [];
  const u = usage.value;
  const l = limits.value;

  const meters = [
    { label: 'Sites',          resource: 'sites',         current: u.site_count          ?? 0, max: l.sites                  },
    { label: 'Zones',          resource: 'zones',         current: u.zone_count           ?? 0, max: l.zones_per_site          },
    { label: 'Guards',         resource: 'guards',        current: u.guard_count          ?? 0, max: l.guards                 },
    { label: 'Patrol Routes',  resource: 'patrol_routes', current: u.patrol_route_count   ?? 0, max: l.patrol_routes          },
    { label: 'Checkpoints',    resource: 'checkpoints',   current: u.checkpoint_count     ?? 0, max: l.checkpoints            },
    { label: 'Admin Users',    resource: 'admin_users',   current: u.admin_user_count     ?? 0, max: l.admin_users            },
  ];

  return meters.map(m => {
    const percent = m.max === Infinity ? 0 : Math.round((m.current / m.max) * 100);
    return {
      ...m,
      percent,
      nearLimit: percent >= 80 && percent < 100,
      atLimit:   percent >= 100,
    };
  });
});

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Loads all subscription data from the backend.
 * Called once on app init (from App.vue or router beforeEach).
 */
const initPlan = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const [sub, lim, ents, usg] = await Promise.all([
      subscriptionService.getSubscription(),
      subscriptionService.getLimits(),
      subscriptionService.getEntitlements(),
      subscriptionService.getUsage(),
    ]);

    subscription.value = sub;
    plan.value         = sub?.plan || 'normal';
    limits.value       = lim;
    entitlements.value = ents instanceof Set ? ents : new Set(ents);
    usage.value        = usg || {};
    ready.value        = true;
  } catch (err) {
    console.error('[PlanStore] Failed to load subscription data:', err);
    error.value = err.message;
    // Safe fallback — Normal plan, no features locked (prevents blank UI)
    plan.value   = 'normal';
    ready.value  = true;
  } finally {
    loading.value = false;
  }
};

/**
 * Forces a refresh of subscription data (e.g. after plan upgrade).
 */
const refreshPlan = async () => {
  subscriptionService.clearCache();
  ready.value = false;
  await initPlan();
};

/**
 * Synchronous limit check used by usePlanGuard.limitFor().
 * @param {string} resource
 */
const getLimitCheck = (resource) => {
  if (!limits.value) return { allowed: true, current: 0, max: Infinity };

  const u = usage.value;
  const l = limits.value;

  const map = {
    sites:          { current: u.site_count          ?? 0, max: l.sites                  },
    zones:          { current: u.zone_count           ?? 0, max: l.zones_per_site          },
    guards:         { current: u.guard_count          ?? 0, max: l.guards                 },
    patrol_routes:  { current: u.patrol_route_count   ?? 0, max: l.patrol_routes          },
    checkpoints:    { current: u.checkpoint_count     ?? 0, max: l.checkpoints            },
    active_patrols: { current: u.active_patrols_today ?? 0, max: l.active_patrols_per_day },
    admin_users:    { current: u.admin_user_count     ?? 0, max: l.admin_users            },
  };

  const entry = map[resource];
  if (!entry) return { allowed: true, current: 0, max: Infinity };

  const allowed = entry.max === Infinity || entry.current < entry.max;
  return { allowed, current: entry.current, max: entry.max };
};

// ─── Store instance (same reactive singleton pattern as useSOCStore) ──────────
const storeInstance = reactive({
  plan,
  subscription,
  limits,
  entitlements,
  usage,
  ready,
  loading,
  error,

  isNormal,
  isPro,
  isCustom,
  usageMeters,

  initPlan,
  refreshPlan,
  getLimitCheck,
});

export const usePlanStore = () => storeInstance;

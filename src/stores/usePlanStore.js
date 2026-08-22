/**
 * usePlanStore.js
 * AccessEasy Patrol — Global Plan & Entitlements State Store (Singleton)
 *
 * Loaded once at app init; shared reactively across all components.
 *
 * State:
 *   plan           — 'normal' | 'pro' | 'custom' | 'trial' | 'expired'
 *   subscription   — full parsed subscription row
 *   limits         — plan_limits row (sites, guards, checkpoints, etc.)
 *   entitlements   — Set<string> of enabled feature keys
 *   usage          — subscription_usage row (live counts)
 *   ready          — true once initial load completes
 */

import { ref, reactive, computed } from "vue";
import { subscriptionService } from "@/services/subscriptionService";

// ─── Singleton state ──────────────────────────────────────────────────────────
const plan         = ref("normal");
const subscription = ref(null);
const limits       = ref(null);
const entitlements = ref(new Set());
const usage        = ref({});
const ready        = ref(false);
const loading      = ref(false);
const error        = ref(null);

// ─── Getters ──────────────────────────────────────────────────────────────────
const isNormal = computed(() => plan.value === "normal");
const isPro    = computed(() => true); // All features unlocked for single unified Patrol plan
const isCustom = computed(() => plan.value === "custom");

const isTrial = computed(() => {
  const sub = subscription.value;
  return sub?.is_trial === true || sub?.status === "trial" || sub?.billing_cycle === "trial";
});

const isExpired = computed(() => {
  const sub = subscription.value;
  return sub?.is_expired === true || sub?.status === "expired";
});

const planName = computed(() => {
  const sub = subscription.value;
  if (isTrial.value) return "⚡ 7-Day Free Trial (1 Site)";
  if (isExpired.value) return `${sub?.plan_name || "AccessEasy Patrol"} (Expired)`;
  return sub?.plan_name || "AccessEasy Patrol Platform";
});

const planKey = computed(() => {
  return subscription.value?.plan_key || "ez_patrol_platform";
});

const trialDaysRemaining = computed(() => {
  const sub = subscription.value;
  const end = sub?.active_until || sub?.end_date || sub?.renewal_date;
  if (!end) return 7;
  const diffTime = new Date(end) - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

const daysRemaining = computed(() => {
  const sub = subscription.value;
  const end = sub?.active_until || sub?.end_date || sub?.renewal_date;
  if (!end) return null;
  const diffTime = new Date(end) - new Date();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

const allowedSites = computed(() => {
  if (limits.value?.sites) return limits.value.sites;
  return isTrial.value ? 1 : (subscription.value?.sites || 1);
});

/**
 * Usage percentages for the subscription usage meter UI.
 * Returns array of { label, resource, current, max, percent, nearLimit, atLimit }
 */
const usageMeters = computed(() => {
  if (!limits.value) return [];
  const u = usage.value;
  const l = limits.value;

  const meters = [
    { label: "Licensed Sites",  resource: "sites",         current: u.site_count          ?? 0, max: l.sites                  },
    { label: "Zones per Site",  resource: "zones",         current: u.zone_count           ?? 0, max: l.zones_per_site          },
    { label: "Guards",          resource: "guards",        current: u.guard_count          ?? 0, max: l.guards                 },
    { label: "Patrol Routes",   resource: "patrol_routes", current: u.patrol_route_count   ?? 0, max: l.patrol_routes          },
    { label: "Checkpoints",     resource: "checkpoints",   current: u.checkpoint_count     ?? 0, max: l.checkpoints            },
    { label: "Admin Users",     resource: "admin_users",   current: u.admin_user_count     ?? 0, max: l.admin_users            },
  ];

  return meters.map((m) => {
    const isUnlimited = m.max === Infinity || m.max === null || m.max === undefined;
    const percent = isUnlimited ? null : Math.round((m.current / m.max) * 100);
    return {
      ...m,
      isUnlimited,
      percent,
      nearLimit: !isUnlimited && percent >= 80 && percent < 100,
      atLimit:   !isUnlimited && percent >= 100,
    };
  });
});

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Loads all subscription data from the backend.
 * Called on app init from App.vue or router beforeEach.
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
    plan.value         = sub?.status || "active";
    limits.value       = lim;
    entitlements.value = ents instanceof Set ? ents : new Set(ents);
    usage.value        = usg || {};
    ready.value        = true;
  } catch (err) {
    console.error("[PlanStore] Failed to load subscription data:", err);
    error.value = err.message;
    plan.value   = "normal";
    ready.value  = true;
  } finally {
    loading.value = false;
  }
};

/**
 * Forces a refresh of subscription data (e.g. after payment or plan upgrade).
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
  if (!limits.value || resource !== "sites") {
    return { allowed: true, current: 0, max: Infinity };
  }

  const u = usage.value;
  const l = limits.value;
  const current = u.site_count ?? 0;
  const max = l.sites ?? 1;
  const allowed = max === Infinity || current < max;

  return { allowed, current, max };
};

// ─── Store instance ───────────────────────────────────────────────────────────
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
  isTrial,
  isExpired,
  planName,
  planKey,
  trialDaysRemaining,
  daysRemaining,
  allowedSites,
  usageMeters,

  initPlan,
  refreshPlan,
  getLimitCheck,
});

export const usePlanStore = () => storeInstance;

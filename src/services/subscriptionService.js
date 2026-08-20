/**
 * subscriptionService.js
 * Phase 0 — Subscription, Entitlements & Limits
 *
 * Handles fetching and caching of the current organization's:
 *  - Plan (normal | pro | custom)
 *  - Plan Limits (sites, guards, checkpoints, etc.)
 *  - Feature Entitlements (grouped by domain key)
 *  - Usage counters (pre-computed by backend hooks)
 *
 * IMPORTANT: This service provides the FRONTEND UX layer only.
 * The backend (Directus hooks / custom endpoint) enforces the actual
 * limits and must reject writes with { code: "PLAN_LIMIT_EXCEEDED" }
 * independently of what the frontend does.
 */

import { authService } from '@/services/authService';

// ─── Upgrade messages per resource ───────────────────────────────────────────
const UPGRADE_MESSAGES = {
  sites:              (plan, max) => `You've reached your ${max}-site limit. ${plan === 'pro' ? 'Contact us to upgrade to an Enterprise plan.' : 'Upgrade to Pro to manage up to 10 sites.'}`,
  zones:              (plan, max) => `You've reached your ${max}-zone limit. ${plan === 'pro' ? 'Contact us to upgrade to an Enterprise plan.' : 'Upgrade to Pro to manage up to 25 zones per site.'}`,
  guards:             (plan, max) => `You've reached your ${max}-guard limit. ${plan === 'pro' ? 'Contact us to upgrade to an Enterprise plan.' : 'Upgrade to Pro to manage up to 100 guards.'}`,
  patrol_routes:      (plan, max) => `You've reached your ${max} patrol route limit. ${plan === 'pro' ? 'Contact us to upgrade.' : 'Upgrade to Pro for up to 200 patrol routes.'}`,
  checkpoints:        (plan, max) => `You've reached your ${max}-checkpoint limit. ${plan === 'pro' ? 'Contact us to upgrade.' : 'Upgrade to Pro for up to 1,000 checkpoints.'}`,
  active_patrols:     (plan, max) => `You've reached your ${max} active patrols/day limit. ${plan === 'pro' ? 'Contact us to upgrade.' : 'Upgrade to Pro for up to 250 patrols/day.'}`,
  admin_users:        (plan, max) => `You've reached your ${max} admin user limit. ${plan === 'pro' ? 'Contact us to upgrade.' : 'Upgrade to Pro for up to 10 admin users.'}`,
  storage:            (plan, max) => `You've reached your storage limit (${max}). ${plan === 'pro' ? 'Contact us to upgrade.' : 'Upgrade to Pro for 25 GB storage.'}`,
};

// ─── Default limits (fallback when backend is unavailable) ───────────────────
const DEFAULT_LIMITS = {
  normal: {
    sites: 1, zones_per_site: 3, guards: 5, patrol_routes: 10,
    checkpoints: 30, active_patrols_per_day: 10, admin_users: 2,
    storage_bytes: 1073741824, retention_days: 30, device_heartbeat_interval_sec: 300
  },
  pro: {
    sites: 10, zones_per_site: 25, guards: 100, patrol_routes: 200,
    checkpoints: 1000, active_patrols_per_day: 250, admin_users: 10,
    storage_bytes: 26843545600, retention_days: 180, device_heartbeat_interval_sec: 60
  },
  custom: {
    sites: Infinity, zones_per_site: Infinity, guards: Infinity, patrol_routes: Infinity,
    checkpoints: Infinity, active_patrols_per_day: Infinity, admin_users: Infinity,
    storage_bytes: Infinity, retention_days: Infinity, device_heartbeat_interval_sec: 30
  }
};

// ─── Default entitlements per plan ───────────────────────────────────────────
const DEFAULT_ENTITLEMENTS = {
  normal: new Set([
    'attendance.basic',
    'geofence.checkpoint_radius',
    'evidence.qr', 'evidence.gps', 'evidence.photo',
    'incident.basic',
  ]),
  pro: new Set([
    'attendance.basic', 'attendance.advanced', 'attendance.breaks',
    'attendance.shift_compliance', 'attendance.replacement',
    'geofence.checkpoint_radius', 'geofence.site', 'geofence.zone',
    'geofence.live_tracking', 'geofence.violation_history',
    'evidence.qr', 'evidence.gps', 'evidence.photo', 'evidence.nfc',
    'evidence.video', 'evidence.checklist', 'evidence.export',
    'incident.basic', 'incident.workflow', 'incident.escalation',
    'ops.operations_center', 'ops.live_map', 'ops.broadcast',
    'ops.audit_log', 'ops.api', 'ops.webhooks',
  ]),
  custom: new Set([
    // Everything
    'attendance.basic', 'attendance.advanced', 'attendance.breaks',
    'attendance.shift_compliance', 'attendance.replacement',
    'geofence.checkpoint_radius', 'geofence.site', 'geofence.zone',
    'geofence.live_tracking', 'geofence.violation_history',
    'evidence.qr', 'evidence.gps', 'evidence.photo', 'evidence.nfc',
    'evidence.video', 'evidence.checklist', 'evidence.export',
    'incident.basic', 'incident.workflow', 'incident.escalation',
    'incident.custom_workflow',
    'ops.operations_center', 'ops.live_map', 'ops.broadcast',
    'ops.audit_log', 'ops.api', 'ops.webhooks',
    'enterprise.sso', 'enterprise.custom_roles', 'enterprise.multi_client',
    'enterprise.custom_reports', 'enterprise.integrations',
    'enterprise.cctv', 'enterprise.custom_sla',
  ])
};

// ─── Cache keys ───────────────────────────────────────────────────────────────
const CACHE_KEY_PLAN        = 'patrol_plan';
const CACHE_KEY_LIMITS      = 'patrol_limits';
const CACHE_KEY_ENTITLEMENTS= 'patrol_entitlements';
const CACHE_KEY_USAGE       = 'patrol_usage';
const CACHE_TTL_MS          = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cacheSet(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
  } catch (_) { /* ignore quota errors */ }
}

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return value;
  } catch (_) { return null; }
}

function cacheClear() {
  [CACHE_KEY_PLAN, CACHE_KEY_LIMITS, CACHE_KEY_ENTITLEMENTS, CACHE_KEY_USAGE]
    .forEach(k => sessionStorage.removeItem(k));
}

// ─── Service ─────────────────────────────────────────────────────────────────

class SubscriptionService {

  /**
   * Returns the current organization's subscription row.
   * Falls back to { plan: 'normal' } if unavailable.
   */
  async getSubscription() {
    const cached = cacheGet(CACHE_KEY_PLAN);
    if (cached) return cached;

    try {
      const tenantId = authService.getTenantId();
      const res = await authService.protectedApi.get(
        `/items/subscriptions?filter[organization][_eq]=${tenantId}&filter[status][_in]=active,trial&limit=1`
      );
      const sub = res.data?.data?.[0] || { plan: 'normal', status: 'active' };
      cacheSet(CACHE_KEY_PLAN, sub);
      return sub;
    } catch (err) {
      console.warn('[SubscriptionService] Could not fetch subscription, using Normal defaults:', err.message);
      return { plan: 'normal', status: 'active' };
    }
  }

  /**
   * Returns the plan limits row for this organization's plan.
   */
  async getLimits() {
    const cached = cacheGet(CACHE_KEY_LIMITS);
    if (cached) return cached;

    try {
      const sub = await this.getSubscription();
      const plan = sub.plan || 'normal';

      // Custom plans may have limits stored per-org rather than per-plan
      const res = await authService.protectedApi.get(
        `/items/plan_limits?filter[plan][_eq]=${plan}&limit=1`
      );
      const limits = res.data?.data?.[0] || DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.normal;
      cacheSet(CACHE_KEY_LIMITS, limits);
      return limits;
    } catch (err) {
      const sub = await this.getSubscription().catch(() => ({ plan: 'normal' }));
      const fallback = DEFAULT_LIMITS[sub.plan] || DEFAULT_LIMITS.normal;
      cacheSet(CACHE_KEY_LIMITS, fallback);
      return fallback;
    }
  }

  /**
   * Returns a Set<string> of enabled feature keys for the current plan.
   * e.g. can('geofence.zone'), can('incident.escalation')
   */
  async getEntitlements() {
    const cached = cacheGet(CACHE_KEY_ENTITLEMENTS);
    if (cached) return new Set(cached);

    try {
      const sub = await this.getSubscription();
      const plan = sub.plan || 'normal';

      const res = await authService.protectedApi.get(
        `/items/feature_entitlements?filter[plan][_eq]=${plan}&filter[enabled][_eq]=true&limit=200`
      );
      const keys = (res.data?.data || []).map(e => e.feature_key);
      // If backend returns empty (collection not seeded yet), fall back to hardcoded defaults
      const entitlementSet = keys.length > 0 ? new Set(keys) : (DEFAULT_ENTITLEMENTS[plan] || DEFAULT_ENTITLEMENTS.normal);
      cacheSet(CACHE_KEY_ENTITLEMENTS, [...entitlementSet]);
      return entitlementSet;
    } catch (err) {
      console.warn('[SubscriptionService] Could not fetch entitlements, using defaults:', err.message);
      const sub = await this.getSubscription().catch(() => ({ plan: 'normal' }));
      return DEFAULT_ENTITLEMENTS[sub.plan] || DEFAULT_ENTITLEMENTS.normal;
    }
  }

  /**
   * Returns the pre-computed subscription_usage row for this organization.
   * These counters are maintained by Directus hooks on create/delete events.
   */
  async getUsage() {
    const cached = cacheGet(CACHE_KEY_USAGE);
    if (cached) return cached;

    try {
      const tenantId = authService.getTenantId();
      const res = await authService.protectedApi.get(
        `/items/subscription_usage?filter[organization][_eq]=${tenantId}&limit=1`
      );
      const usage = res.data?.data?.[0] || {};
      cacheSet(CACHE_KEY_USAGE, usage);
      return usage;
    } catch (err) {
      console.warn('[SubscriptionService] Could not fetch usage:', err.message);
      return {};
    }
  }

  /**
   * Checks whether a write of a new resource is allowed.
   * Returns { allowed, current, max, upgradeMessage }
   *
   * @param {'sites'|'zones'|'guards'|'patrol_routes'|'checkpoints'|'active_patrols'|'admin_users'} resource
   */
  async checkLimit(resource) {
    const [limits, usage, sub] = await Promise.all([
      this.getLimits(),
      this.getUsage(),
      this.getSubscription()
    ]);

    const limitMap = {
      sites:          { limit: limits.sites,                  used: usage.site_count },
      zones:          { limit: limits.zones_per_site,         used: usage.zone_count },
      guards:         { limit: limits.guards,                  used: usage.guard_count },
      patrol_routes:  { limit: limits.patrol_routes,           used: usage.patrol_route_count },
      checkpoints:    { limit: limits.checkpoints,             used: usage.checkpoint_count },
      active_patrols: { limit: limits.active_patrols_per_day, used: usage.active_patrols_today },
      admin_users:    { limit: limits.admin_users,             used: usage.admin_user_count },
    };

    const entry = limitMap[resource];
    if (!entry) return { allowed: true, current: 0, max: Infinity, upgradeMessage: '' };

    const current = entry.used ?? 0;
    const max = entry.limit ?? Infinity;
    const allowed = max === Infinity || current < max;
    const plan = sub.plan || 'normal';
    const msgFn = UPGRADE_MESSAGES[resource];
    const upgradeMessage = !allowed && msgFn ? msgFn(plan, max) : '';

    return { allowed, current, max, upgradeMessage, plan };
  }

  /**
   * Returns true if the current plan has the given feature key enabled.
   * Prefer using the `usePlanGuard` composable in Vue components.
   */
  async canUse(featureKey) {
    const entitlements = await this.getEntitlements();
    return entitlements.has(featureKey);
  }

  /**
   * Invalidates all cached subscription data.
   * Call after plan upgrades or admin changes.
   */
  clearCache() {
    cacheClear();
  }

  /**
   * Logs a plan-related event to the subscription_events collection.
   * Fire-and-forget — does not throw.
   */
  async logEvent(eventType, metadata = {}) {
    try {
      const tenantId = authService.getTenantId();
      await authService.protectedApi.post('/items/subscription_events', {
        organization: tenantId,
        event_type: eventType,
        metadata: JSON.stringify(metadata),
      });
    } catch (_) { /* non-critical — never block UX */ }
  }
}

export const subscriptionService = new SubscriptionService();

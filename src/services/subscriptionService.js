/**
 * subscriptionService.js
 * AccessEasy Patrol — Subscription, Entitlements & Limits Service
 *
 * Handles fetching, parsing, and caching of the current organization's:
 *  - Active Patrol Plan (ez_patrol_platform, ez_access_platform)
 *  - Plan Limits (licensed sites, guards, checkpoints, patrol routes)
 *  - Feature Entitlements (all Patrol operations features)
 *  - Live Usage Counters (sites, zones, guards, checkpoints, routes)
 */

import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

// ─── All platform features for AccessEasy Patrol ──────────────────────────────
const ALL_PATROL_FEATURES = [
  "attendance.basic",
  "attendance.advanced",
  "attendance.breaks",
  "attendance.shift_compliance",
  "attendance.replacement",
  "geofence.checkpoint_radius",
  "geofence.site",
  "geofence.zone",
  "geofence.live_tracking",
  "geofence.violation_history",
  "evidence.qr",
  "evidence.gps",
  "evidence.photo",
  "evidence.nfc",
  "evidence.video",
  "evidence.checklist",
  "evidence.export",
  "incident.basic",
  "incident.workflow",
  "incident.escalation",
  "incident.custom_workflow",
  "ops.operations_center",
  "ops.live_map",
  "ops.broadcast",
  "ops.audit_log",
  "ops.api",
  "ops.webhooks",
  "enterprise.sso",
  "enterprise.custom_roles",
  "enterprise.multi_client",
  "enterprise.custom_reports",
  "enterprise.integrations",
  "enterprise.cctv",
  "enterprise.custom_sla",
];

// ─── Cache keys & TTL ─────────────────────────────────────────────────────────
const CACHE_KEY_PLAN = "patrol_plan_v2";
const CACHE_KEY_LIMITS = "patrol_limits_v2";
const CACHE_KEY_USAGE = "patrol_usage_v2";
const CACHE_TTL_MS = 60 * 1000; // 60 seconds live cache

const _subInFlight = new Map();

function cacheSet(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
  } catch (_) {}
}

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return value;
  } catch (_) {
    return null;
  }
}

function cacheClear() {
  [CACHE_KEY_PLAN, CACHE_KEY_LIMITS, CACHE_KEY_USAGE].forEach((k) =>
    sessionStorage.removeItem(k)
  );
  _subInFlight.clear();
}

function isPlanActive(planJson) {
  if (!planJson) return false;
  if (planJson.status === "trial" || planJson.is_trial) return true;
  if (planJson.status === "active" && planJson.active_until) {
    return new Date(planJson.active_until).getTime() > Date.now();
  }
  return planJson.status === "active";
}

class SubscriptionService {
  /**
   * Returns the current organization's active subscription row.
   * Checks Directus `plans` table first, falls back to `currentUserTenant` or defaults to 7-Day Free Trial.
   */
  async getSubscription(force = false) {
    if (!force) {
      const cached = cacheGet(CACHE_KEY_PLAN);
      if (cached) return cached;
    }

    if (_subInFlight.has(CACHE_KEY_PLAN)) {
      return _subInFlight.get(CACHE_KEY_PLAN);
    }

    const promise = (async () => {
      try {
        const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
        if (!tenantId) {
          const defaultAnon = {
            plan: "trial",
            status: "trial",
            is_trial: true,
            sites: 1,
            plan_name: "AccessEasy Patrol 7-Day Free Trial",
            plan_key: "ez_patrol_platform",
          };
          return defaultAnon;
        }

        // Do not attempt cloud plan lookup unless a valid JWT token is available
        if (!authService.getToken()) {
          return {
            plan_key: "ez_patrol_platform",
            plan_name: "AccessEasy Patrol 7-Day Free Trial",
            plan: "trial",
            status: "trial",
            is_trial: true,
            sites: 1,
          };
        }

        // 1. Query Directus `plans` collection
        try {
          const res = await authService.protectedApi.get(
            `/items/plans?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&sort=-id&limit=20`
          );
        const rows = res.data?.data || [];

        // Sort to prioritize row with userapp === 'patrol'
        rows.sort((a, b) => {
          const isPatrolA = String(a.userapp || '').toLowerCase() === 'patrol' ? 1 : 0;
          const isPatrolB = String(b.userapp || '').toLowerCase() === 'patrol' ? 1 : 0;
          return isPatrolB - isPatrolA;
        });

        for (const row of rows) {
          let currentPlanMap = row.currentplan;
          if (typeof currentPlanMap === "string") {
            try {
              currentPlanMap = JSON.parse(currentPlanMap);
            } catch (_) {}
          }

          if (currentPlanMap && typeof currentPlanMap === "object") {
            // Check for ez_patrol_platform in map, or check userapp === 'patrol'
            const isPatrolRow = String(row.userapp || '').toLowerCase() === 'patrol' || String(row.userapp || '').toLowerCase() === 'accesseasy_patrol';
            const targetPlan =
              currentPlanMap.ez_patrol_platform ||
              (isPatrolRow ? (currentPlanMap.plan_key ? currentPlanMap : Object.values(currentPlanMap)[0]) : null);

            if (targetPlan) {
              const now = Date.now();
              const expTime = targetPlan.active_until ? new Date(targetPlan.active_until).getTime() : null;
              const isTrial = targetPlan.is_trial === true || targetPlan.billing_cycle === "trial" || targetPlan.status === "trial";
              const isExpired = expTime ? expTime <= now : false;

              const sitesLimit = Number(targetPlan.sites || targetPlan.sites_count || row.max_sites || 1);

              const formatted = {
                id: row.id,
                plan_key: targetPlan.plan_key || "ez_patrol_platform",
                plan_name: targetPlan.plan_name || row.name || "AccessEasy Patrol Platform",
                status: isExpired ? "expired" : targetPlan.status || (isTrial ? "trial" : "active"),
                is_trial: isTrial,
                is_expired: isExpired,
                sites: sitesLimit,
                billing_cycle: targetPlan.billing_cycle || row.billing_period || "monthly",
                currency: targetPlan.currency || row.currency || "INR",
                start_date: targetPlan.start_date,
                active_until: targetPlan.active_until,
                renewal_date: targetPlan.active_until,
                features: targetPlan.features || ALL_PATROL_FEATURES,
              };

              cacheSet(CACHE_KEY_PLAN, formatted);
              return formatted;
            }
          }
        }
      } catch (directusErr) {
        console.warn("[SubscriptionService] Plans collection query:", directusErr.message);
      }

      // 2. Fallback to `currentUserTenant` plan field
      const tenantPlanRaw = currentUserTenant.getTenantPlan();
      if (tenantPlanRaw) {
        const parsed =
          typeof tenantPlanRaw === "string" ? JSON.parse(tenantPlanRaw) : tenantPlanRaw;
        const expTime = parsed.active_until || parsed.end_date;
        const isTrial = parsed.is_trial === true || parsed.billing_cycle === "trial" || parsed.status === "trial";
        const isExpired = expTime ? new Date(expTime).getTime() <= Date.now() : false;

        const subFromTenant = {
          plan_key: parsed.plan_key || "ez_patrol_platform",
          plan_name: parsed.plan_name || (isTrial ? "7-Day Free Trial" : "AccessEasy Patrol Platform"),
          status: isExpired ? "expired" : parsed.status || (isTrial ? "trial" : "active"),
          is_trial: isTrial,
          is_expired: isExpired,
          sites: Number(parsed.sites || 1),
          billing_cycle: parsed.billing_cycle || (isTrial ? "trial" : "monthly"),
          start_date: parsed.start_date,
          active_until: expTime,
          renewal_date: expTime,
        };
        cacheSet(CACHE_KEY_PLAN, subFromTenant);
        return subFromTenant;
      }

      // 3. Default fallback: 7-Day Free Trial (1 Site) & Auto-persist to Directus plans table
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const defaultTrial = {
        plan_key: "ez_patrol_platform",
        plan_name: "AccessEasy Patrol 7-Day Free Trial",
        plan: "trial",
        status: "trial",
        is_trial: true,
        is_expired: false,
        sites: 1,
        start_date: now.toISOString().split("T")[0],
        active_until: trialEnd.toISOString(),
        renewal_date: trialEnd.toISOString(),
      };

      // Auto-insert row into Directus `plans` table for this tenant in background
      if (tenantId && authService.getToken()) {
        try {
          const planPayload = {
            tenant: tenantId,
            userapp: "patrol",
            name: "AccessEasy Patrol 7-Day Free Trial",
            tier: "trial",
            billing_period: "trial",
            price: 0,
            currency: "INR",
            max_sites: 1,
            active: true,
            currentplan: {
              ez_patrol_platform: {
                plan_key: "ez_patrol_platform",
                plan_name: "AccessEasy Patrol 7-Day Free Trial",
                status: "trial",
                is_trial: true,
                sites: 1,
                billing_cycle: "trial",
                currency: "INR",
                start_date: defaultTrial.start_date,
                active_until: defaultTrial.active_until
              }
            },
            date_created: now.toISOString()
          };

          authService.protectedApi.post("/items/plans", planPayload).then(res => {
            if (res.data?.data?.id) {
              defaultTrial.id = res.data.data.id;
            }
          }).catch(e => {
            console.warn("[SubscriptionService] Auto-create plan in Directus:", e.message);
          });
        } catch (_) {}
      }

      cacheSet(CACHE_KEY_PLAN, defaultTrial);
      return defaultTrial;
    } catch (err) {
      console.warn("[SubscriptionService] Error resolving subscription:", err.message);
      return {
        plan_key: "ez_patrol_platform",
        plan: "trial",
        status: "trial",
        is_trial: true,
        sites: 1,
      };
    } finally {
      _subInFlight.delete(CACHE_KEY_PLAN);
    }
  })();

  _subInFlight.set(CACHE_KEY_PLAN, promise);
  return promise;
}

  /**
   * Returns the plan limits for this organization's active tier.
   */
  async getLimits() {
    const cached = cacheGet(CACHE_KEY_LIMITS);
    if (cached) return cached;

    const sub = await this.getSubscription();
    const sitesLimit = Number(sub.sites) || 1;

    const limits = {
      sites: sitesLimit,
      zones_per_site: Infinity,
      guards: Infinity,
      patrol_routes: Infinity,
      checkpoints: Infinity,
      active_patrols_per_day: Infinity,
      admin_users: Infinity,
      storage_bytes: Infinity,
      retention_days: Infinity,
      device_heartbeat_interval_sec: 30,
    };

    cacheSet(CACHE_KEY_LIMITS, limits);
    return limits;
  }

  /**
   * Returns a Set<string> of enabled feature keys for the current plan.
   */
  async getEntitlements() {
    return new Set(ALL_PATROL_FEATURES);
  }

  /**
   * Returns actual live resource counts for this organization.
   */
  async getUsage() {
    const cached = cacheGet(CACHE_KEY_USAGE);
    if (cached) return cached;

    if (_subInFlight.has(CACHE_KEY_USAGE)) {
      return _subInFlight.get(CACHE_KEY_USAGE);
    }

    const promise = (async () => {
      try {
        const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
        // Guard: don't query APIs without a token (e.g. during login flow)
        if (!tenantId || !authService.getToken()) {
          return { site_count: 0, zone_count: 0, guard_count: 0, patrol_route_count: 0, checkpoint_count: 0 };
        }

        let siteCount = 0;
        let zoneCount = 0;
        let guardCount = 0;
        let checkpointCount = 0;
        let patrolRouteCount = 0;

        // Sites (Location Management) count
        try {
          const res = await authService.protectedApi.get(
            `/items/locationManagement?filter[tenant][_eq]=${tenantId}&fields[]=id&limit=500`
          );
          if (res.data?.data) siteCount = res.data.data.length;
        } catch (_) {
          const stored = localStorage.getItem(`accesseasy_sites_${tenantId}`);
          if (stored) {
            try { siteCount = JSON.parse(stored).length; } catch (_) {}
          }
        }

        // Checkpoints count
        try {
          const res = await authService.protectedApi.get(
            `/items/checkpoints?filter[tenant][_eq]=${tenantId}&fields[]=id&limit=1000`
          );
          if (res.data?.data) checkpointCount = res.data.data.length;
        } catch (_) {}

        // Patrol routes / groups count
        try {
          const res = await authService.protectedApi.get(
            `/items/checkpoint_groups?filter[tenant][_eq]=${tenantId}&fields[]=id&limit=500`
          );
          if (res.data?.data) patrolRouteCount = res.data.data.length;
        } catch (_) {}

        // Guards count — use aggregate to avoid requiring Admin-level /users access
        try {
          const res = await authService.protectedApi.get(
            `/users?filter[tenant][_eq]=${tenantId}&aggregate[count]=id&groupBy[]=tenant`
          );
          const row = res.data?.data?.[0];
          guardCount = row ? Number(row.count?.id || 0) : 0;
        } catch (_) {}

        const usage = {
          site_count: siteCount,
          zone_count: zoneCount,
          guard_count: guardCount,
          patrol_route_count: patrolRouteCount,
          checkpoint_count: checkpointCount,
          admin_user_count: 1,
        };

        cacheSet(CACHE_KEY_USAGE, usage);
        return usage;
      } catch (err) {
        console.warn("[SubscriptionService] Could not fetch live usage:", err.message);
        return { site_count: 0, guard_count: 0, checkpoint_count: 0, patrol_route_count: 0 };
      } finally {
        _subInFlight.delete(CACHE_KEY_USAGE);
      }
    })();

    _subInFlight.set(CACHE_KEY_USAGE, promise);
    return promise;
  }

  /**
   * Checks whether creating a new resource exceeds the plan limit.
   */
  async checkLimit(resource) {
    if (resource !== "sites") {
      return { allowed: true, current: 0, max: Infinity, upgradeMessage: "", plan: "Active" };
    }

    const [limits, usage, sub] = await Promise.all([
      this.getLimits(),
      this.getUsage(),
      this.getSubscription(),
    ]);

    const current = usage.site_count ?? 0;
    const max = limits.sites ?? 1;
    const allowed = current < max;
    const upgradeMessage = !allowed
      ? `You've reached your ${max}-site limit (${sub.is_trial ? "7-Day Free Trial" : "Active Plan"}). Add more sites at ₹1,999/site to expand.`
      : "";

    return { allowed, current, max, upgradeMessage, plan: sub.plan_name, isTrial: sub.is_trial };
  }

  /**
   * Clear cached subscription data
   */
  clearCache() {
    cacheClear();
  }

  /**
   * Fire-and-forget plan event logger
   */
  async logEvent(eventType, metadata = {}) {
    try {
      const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
      await authService.protectedApi.post("/items/subscription_events", {
        organization: tenantId,
        event_type: eventType,
        metadata: JSON.stringify(metadata),
      });
    } catch (_) {}
  }
}

export const subscriptionService = new SubscriptionService();

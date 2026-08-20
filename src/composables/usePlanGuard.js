/**
 * usePlanGuard.js
 * Phase 0 — Feature Entitlement Composable
 *
 * Usage in Vue components / router:
 *   const { can, planReady, currentPlan } = usePlanGuard();
 *   can('geofence.zone')          // → boolean (reactive)
 *   can('incident.escalation')    // → boolean
 *
 * The composable reads from the global plan store (populated at app init).
 * It is synchronous after init — no async calls in templates.
 */

import { computed } from 'vue';
import { usePlanStore } from '@/stores/usePlanStore';

export function usePlanGuard() {
  const store = usePlanStore();

  /**
   * Returns true if the current plan includes the given feature key.
   * Returns true while the plan is still loading (optimistic — avoids flash of locked UI).
   * @param {string} featureKey  e.g. 'geofence.zone', 'incident.escalation'
   */
  const can = (featureKey) => {
    if (!store.ready) return true; // Optimistic while loading
    return store.entitlements.has(featureKey);
  };

  /**
   * Reactive computed wrapper — use inside templates.
   * Example: v-if="canComputed('geofence.zone').value"
   */
  const canComputed = (featureKey) => computed(() => can(featureKey));

  /**
   * Current plan name: 'normal' | 'pro' | 'custom'
   */
  const currentPlan = computed(() => store.plan);

  /**
   * True once the subscription data has been loaded.
   */
  const planReady = computed(() => store.ready);

  /**
   * True if the plan is Normal.
   */
  const isNormal = computed(() => store.plan === 'normal');

  /**
   * True if the plan is Pro or above.
   */
  const isPro = computed(() => store.plan === 'pro' || store.plan === 'custom');

  /**
   * True if the plan is Custom / Enterprise.
   */
  const isCustom = computed(() => store.plan === 'custom');

  /**
   * Checks a resource limit and returns the check result reactively.
   * @param {'sites'|'zones'|'guards'|'patrol_routes'|'checkpoints'|'admin_users'} resource
   */
  const limitFor = (resource) => computed(() => {
    if (!store.ready) return { allowed: true, current: 0, max: Infinity };
    return store.getLimitCheck(resource);
  });

  return {
    can,
    canComputed,
    currentPlan,
    planReady,
    isNormal,
    isPro,
    isCustom,
    limitFor,
  };
}

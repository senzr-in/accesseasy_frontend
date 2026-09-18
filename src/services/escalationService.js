import { authService } from "@/services/authService";

class EscalationService {
  getDefaultPolicies() {
    return [];
  }

  getDefaultActiveEscalations() {
    return [];
  }

  /**
   * Fetch configured escalation policies
   */
  async fetchPolicies(siteId = null) {
    try {
      const tenantId = authService.getTenantId() || 'default';

      let cloudPolicies = [];
      try {
        const res = await authService.protectedApi.get(
          `/items/escalation_policies?filter[tenant][_eq]=${tenantId}&sort=name`
        );
        if (res.data?.data && Array.isArray(res.data.data)) {
          cloudPolicies = res.data.data;
        }
      } catch (e) {}

      let localPolicies = [];
      const stored = localStorage.getItem(`accesseasy_escalation_policies_${tenantId}`);
      if (stored) {
        try {
          localPolicies = JSON.parse(stored);
        } catch (e) {}
      }

      if (cloudPolicies.length > 0) {
        const cloudIds = new Set(cloudPolicies.map(p => String(p.id)));
        const uniqueLocal = localPolicies.filter(p => !cloudIds.has(String(p.id)));
        return [...cloudPolicies, ...uniqueLocal];
      }

      return localPolicies;
    } catch (error) {
      console.error("Error fetching escalation policies:", error);
      return [];
    }
  }

  /**
   * Save / Update Escalation Policy in Directus Cloud with LocalStorage Fallback
   */
  async savePolicy(policyData) {
    const tenantId = authService.getTenantId() || 'default';
    const payload = { ...policyData, tenant: tenantId };
    
    try {
      if (policyData.id && !String(policyData.id).startsWith('esc-pol-')) {
        const res = await authService.protectedApi.patch(`/items/escalation_policies/${policyData.id}`, payload);
        if (res.data?.data) return res.data.data;
      } else {
        const createPayload = { ...payload };
        delete createPayload.id;
        const res = await authService.protectedApi.post("/items/escalation_policies", createPayload);
        if (res.data?.data) return res.data.data;
      }
    } catch (error) {
      console.warn("Directus escalation_policies save failed (403/404), falling back to local storage:", error?.message);
    }

    // LocalStorage Fallback
    const storageKey = `accesseasy_escalation_policies_${tenantId}`;
    let list = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) list = JSON.parse(stored);
    } catch (e) {}

    let savedItem = null;
    if (policyData.id) {
      const idx = list.findIndex(p => p.id === policyData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        savedItem = list[idx];
      }
    }

    if (!savedItem) {
      savedItem = {
        ...payload,
        id: policyData.id || `esc-pol-${Date.now()}`
      };
      list.push(savedItem);
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {}

    return savedItem;
  }

  /**
   * Delete Escalation Policy
   */
  async deletePolicy(policyId) {
    const tenantId = authService.getTenantId() || 'default';
    try {
      if (!String(policyId).startsWith('esc-pol-')) {
        await authService.protectedApi.delete(`/items/escalation_policies/${policyId}`);
      }
    } catch (e) {
      console.warn("Directus delete policy error:", e?.message);
    }

    // Also remove from LocalStorage
    const storageKey = `accesseasy_escalation_policies_${tenantId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter(p => p.id !== policyId);
        localStorage.setItem(storageKey, JSON.stringify(list));
      }
    } catch (e) {}
    return true;
  }

  /**
   * Fetch currently running escalation jobs
  /**
   * Fetch currently active/escalating alerts from Directus Cloud
   */
  async fetchActiveEscalations() {
    try {
      const tenantId = authService.getTenantId();
      let query = `filter[status][_in]=open,reported,acknowledged,investigating,action_taken,pending_review&sort=-date_created`;
      if (tenantId) {
        query = `filter[tenant][_eq]=${tenantId}&` + query;
      }
      const res = await authService.protectedApi.get(`/items/patrol_alerts?${query}`);
      return res.data?.data || [];
    } catch (e) {
      console.warn("fetchActiveEscalations error:", e);
      return [];
    }
  }

  /**
   * Acknowledge active escalation in Directus Cloud
   */
  async acknowledgeEscalation(escalationId, user = 'Supervisor') {
    try {
      const res = await authService.protectedApi.patch(`/items/patrol_alerts/${escalationId}`, {
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString()
      });
      return res.data.data;
    } catch (error) {
      console.error("Error acknowledging escalation on cloud:", error);
      throw error;
    }
  }

  /**
   * Simulate / test escalation trigger — creates a real alert record in Directus Cloud
   */
  async simulateTrigger(triggerType = "sos_emergency", siteName = "Default Site", guardName = "On-Duty Guard") {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenant: tenantId,
        title: `Alert: ${triggerType.toUpperCase()}`,
        type: triggerType,
        severity: 'critical',
        status: 'reported',
        notes: `Simulated escalation from ${siteName} — Guard: ${guardName}`,
        action_log: []
      };
      const res = await authService.protectedApi.post("/items/patrol_alerts", payload);
      return res.data.data;
    } catch (error) {
      console.error("Error triggering simulation on cloud:", error);
      throw error;
    }
  }
}

export const escalationService = new EscalationService();

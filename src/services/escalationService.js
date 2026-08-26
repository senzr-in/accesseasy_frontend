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
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      try {
        const res = await authService.protectedApi.get(
          `/items/escalation_policies?filter[tenant][_eq]=${tenantId}&sort=name`
        );
        if (res.data?.data) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_escalation_policies_${tenantId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }

      return [];
    } catch (error) {
      console.error("Error fetching escalation policies:", error);
      return [];
    }
  }

  /**
   * Save / Update Escalation Policy in Directus Cloud
   */
  async savePolicy(policyData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = { ...policyData, tenant: tenantId };
      
      if (policyData.id && !policyData.id.startsWith('esc-pol-')) {
        const res = await authService.protectedApi.patch(`/items/escalation_policies/${policyData.id}`, payload);
        return res.data.data;
      } else {
        delete payload.id;
        const res = await authService.protectedApi.post("/items/escalation_policies", payload);
        return res.data.data;
      }
    } catch (error) {
      console.error("Error saving escalation policy on cloud:", error);
      throw error;
    }
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

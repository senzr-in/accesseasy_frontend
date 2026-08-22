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
   * Save / Update Escalation Policy
   */
  async savePolicy(policyData) {
    try {
      const tenantId = authService.getTenantId();
      const policies = await this.fetchPolicies();
      
      if (policyData.id) {
        const idx = policies.findIndex(p => p.id === policyData.id);
        if (idx !== -1) policies[idx] = policyData;
      } else {
        policyData.id = `esc-pol-${Date.now()}`;
        policies.push(policyData);
      }

      localStorage.setItem(`accesseasy_escalation_policies_${tenantId}`, JSON.stringify(policies));
      return policyData;
    } catch (error) {
      console.error("Error saving escalation policy:", error);
      throw error;
    }
  }

  /**
   * Fetch currently running escalation jobs
   */
  async fetchActiveEscalations() {
    try {
      const tenantId = authService.getTenantId();
      const stored = localStorage.getItem(`accesseasy_active_escalations_${tenantId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Acknowledge active escalation (stops further escalation up the chain)
   */
  async acknowledgeEscalation(escalationId, user = 'Supervisor') {
    try {
      const tenantId = authService.getTenantId();
      const list = await this.fetchActiveEscalations();
      const item = list.find(e => String(e.id) === String(escalationId));
      if (item) {
        item.status = "acknowledged";
        item.acknowledged_by = user;
        item.acknowledged_at = new Date().toISOString();
        localStorage.setItem(`accesseasy_active_escalations_${tenantId}`, JSON.stringify(list));
      }
      return item;
    } catch (error) {
      console.error("Error acknowledging escalation:", error);
      throw error;
    }
  }

  /**
   * Test / Simulate Escalation Trigger
   */
  async simulateTrigger(triggerType = "sos_emergency", siteName = "Default Site", guardName = "On-Duty Guard") {
    try {
      const tenantId = authService.getTenantId();
      const list = await this.fetchActiveEscalations();
      const newEsc = {
        id: `esc-act-${Date.now()}`,
        policy_id: "esc-pol-01",
        trigger_type: triggerType,
        incident_title: `Alert: ${triggerType.toUpperCase()}`,
        site_name: siteName,
        zone_name: "Active Zone",
        guard_name: guardName,
        current_level: 1,
        max_level: 3,
        triggered_at: new Date().toISOString(),
        next_escalation_at: new Date(Date.now() + 5 * 60000).toISOString(),
        status: "escalating",
        acknowledged_by: null
      };
      list.unshift(newEsc);
      localStorage.setItem(`accesseasy_active_escalations_${tenantId}`, JSON.stringify(list));
      return newEsc;
    } catch (error) {
      console.error("Error triggering simulation:", error);
      throw error;
    }
  }
}

export const escalationService = new EscalationService();

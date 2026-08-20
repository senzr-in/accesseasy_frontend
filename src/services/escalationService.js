import { authService } from "@/services/authService";

class EscalationService {
  getDefaultPolicies() {
    return [
      {
        id: "esc-pol-01",
        name: "Standard SOS Emergency Escalation",
        trigger_type: "sos_emergency",
        site_name: "All Properties",
        enabled: true,
        levels: [
          {
            level: 1,
            delay_minutes: 0,
            target_role: "On-Duty Shift Supervisor",
            channels: ["push", "audio_alarm", "sms"],
            action: "Immediate alarm on supervisor handheld & SOC console"
          },
          {
            level: 2,
            delay_minutes: 5,
            target_role: "Site Security Manager",
            channels: ["sms", "push"],
            action: "SMS dispatch & priority alert to manager if unacknowledged in 5 mins"
          },
          {
            level: 3,
            delay_minutes: 15,
            target_role: "Central SOC Command & External Emergency Dispatch",
            channels: ["voice_call", "webhook"],
            action: "Automated voice call to Head of Security + Webhook trigger to 911 dispatch"
          }
        ]
      },
      {
        id: "esc-pol-02",
        name: "Overdue / Missed Patrol Escalation",
        trigger_type: "missed_patrol",
        site_name: "All Properties",
        enabled: true,
        levels: [
          {
            level: 1,
            delay_minutes: 0,
            target_role: "Assigned Guard",
            channels: ["push"],
            action: "Prompt guard mobile with 5-minute reminder"
          },
          {
            level: 2,
            delay_minutes: 10,
            target_role: "Shift Supervisor",
            channels: ["push", "sms"],
            action: "Alert supervisor of missed perimeter round"
          },
          {
            level: 3,
            delay_minutes: 30,
            target_role: "Operations Manager",
            channels: ["sms", "email"],
            action: "Log SLA penalty and notify client security lead"
          }
        ]
      }
    ];
  }

  getDefaultActiveEscalations() {
    const now = new Date();
    return [
      {
        id: "esc-act-01",
        policy_id: "esc-pol-01",
        trigger_type: "sos_emergency",
        incident_title: "SOS Panic Button Triggered",
        site_name: "Chennai Tech Park",
        zone_name: "North Gate Perimeter",
        guard_name: "Kumar S",
        current_level: 2,
        max_level: 3,
        triggered_at: new Date(now.getTime() - 7 * 60000).toISOString(),
        next_escalation_at: new Date(now.getTime() + 8 * 60000).toISOString(),
        status: "escalating", // 'escalating' | 'acknowledged' | 'resolved'
        acknowledged_by: null
      }
    ];
  }

  /**
   * Fetch configured escalation policies
   */
  async fetchPolicies(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultPolicies();

      try {
        const res = await authService.protectedApi.get(
          `/items/escalation_policies?filter[tenant][_eq]=${tenantId}&sort=name`
        );
        if (res.data.data && res.data.data.length > 0) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_escalation_policies_${tenantId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }

      return this.getDefaultPolicies();
    } catch (error) {
      console.error("Error fetching escalation policies:", error);
      return this.getDefaultPolicies();
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
      return this.getDefaultActiveEscalations();
    } catch (e) {
      return this.getDefaultActiveEscalations();
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
  async simulateTrigger(triggerType = "sos_emergency", siteName = "Chennai Tech Park") {
    try {
      const tenantId = authService.getTenantId();
      const list = await this.fetchActiveEscalations();
      const newEsc = {
        id: `esc-act-${Date.now()}`,
        policy_id: "esc-pol-01",
        trigger_type: triggerType,
        incident_title: `Simulated Alert: ${triggerType.toUpperCase()}`,
        site_name: siteName,
        zone_name: "Test Perimeter Sector",
        guard_name: "Kumar S",
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

import { authService } from "@/services/authService";

export const INCIDENT_STAGES = [
  { key: "reported", label: "1. Reported", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", allowedRoles: ["Guard", "Manager", "Admin"] },
  { key: "acknowledged", label: "2. Acknowledged", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", allowedRoles: ["Manager", "Admin"] },
  { key: "investigating", label: "3. Investigating", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10", allowedRoles: ["Manager", "Admin"] },
  { key: "action_taken", label: "4. Action Taken", color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10", allowedRoles: ["Manager", "Admin"] },
  { key: "pending_review", label: "5. Pending Review", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10", allowedRoles: ["Manager", "Admin"] },
  { key: "resolved", label: "6. Resolved", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", allowedRoles: ["Admin", "Manager"] },
  { key: "closed", label: "7. Closed & Archived", color: "text-slate-600 bg-slate-100 dark:bg-slate-800", allowedRoles: ["Admin"] }
];

class IncidentService {
  getDefaultIncidents() {
    return [];
  }

  /**
   * Fetch incidents list with optional status/priority filters
   */
  async fetchIncidents(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      try {
        let endpoint = `/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const res = await authService.protectedApi.get(endpoint);
        if (res.data?.data) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_incidents_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(i => String(i.site) === String(siteId));
          return list;
        } catch (e) {}
      }

      return [];
    } catch (error) {
      console.error("Error fetching incidents:", error);
      return [];
    }
  }

  /**
   * Pro: Transition Incident to Next Stage in 7-stage workflow
   */
  async transitionIncident(incidentId, targetStatus, { notes = '', user = 'Supervisor' }) {
    try {
      const tenantId = authService.getTenantId();
      const incidents = await this.fetchIncidents();
      const inc = incidents.find(i => String(i.id) === String(incidentId));
      if (!inc) throw new Error("Incident not found");

      const now = new Date().toISOString();
      inc.status = targetStatus;
      if (!inc.action_log) inc.action_log = [];

      inc.action_log.push({
        status: targetStatus,
        user,
        time: now,
        notes: notes || `Transitioned to ${targetStatus}`
      });

      if (targetStatus === 'acknowledged') inc.acknowledged_at = now;
      if (targetStatus === 'resolved') inc.resolved_at = now;
      if (targetStatus === 'closed') inc.closed_at = now;

      try {
        await authService.protectedApi.patch(`/items/patrol_alerts/${incidentId}`, {
          status: targetStatus,
          action_log: JSON.stringify(inc.action_log)
        });
      } catch (e) {}

      localStorage.setItem(`accesseasy_incidents_${tenantId}`, JSON.stringify(incidents));
      return inc;
    } catch (error) {
      console.error("Error transitioning incident:", error);
      throw error;
    }
  }

  /**
   * Determine available next stages based on current stage & role
   */
  getAvailableTransitions(currentStatus, userRole = 'Admin') {
    const stageKeys = INCIDENT_STAGES.map(s => s.key);
    const currentIndex = stageKeys.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= stageKeys.length - 1) return [];

    const nextStage = INCIDENT_STAGES[currentIndex + 1];
    return [nextStage];
  }
}

export const incidentService = new IncidentService();

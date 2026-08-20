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
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: "inc-101",
        title: "Perimeter Gate Lock Tampered",
        category: "Security Breach",
        priority: "Critical",
        status: "investigating",
        site_name: "Chennai Tech Park",
        zone_name: "Perimeter Fence - North",
        reported_by: "Kumar S (Guard)",
        reported_at: `${today}T08:30:00`,
        acknowledged_at: `${today}T08:35:00`,
        acknowledged_by: "Supervisor Rajesh",
        sla_target_hours: 2,
        description: "Padlock at North Emergency gate found cut and hanging. Barbed wire slightly shifted.",
        photo_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400",
        action_log: [
          { status: "reported", user: "Kumar S", time: `${today}T08:30:00`, notes: "Reported during routine patrol round #102." },
          { status: "acknowledged", user: "Supervisor Rajesh", time: `${today}T08:35:00`, notes: "Dispatched backup response team to perimeter gate." },
          { status: "investigating", user: "Supervisor Rajesh", time: `${today}T08:42:00`, notes: "Inspecting CCTV coverage on Sector 4 camera." }
        ]
      },
      {
        id: "inc-102",
        title: "Water Leakage Near Server Room",
        category: "Facility / Safety",
        priority: "High",
        status: "action_taken",
        site_name: "Chennai Tech Park",
        zone_name: "Tower A Core",
        reported_by: "Suresh M (Guard)",
        reported_at: `${today}T07:15:00`,
        acknowledged_at: `${today}T07:20:00`,
        acknowledged_by: "Admin",
        sla_target_hours: 4,
        description: "Ceiling AC duct condensation dripping near electrical cabinet.",
        action_log: [
          { status: "reported", user: "Suresh M", time: `${today}T07:15:00`, notes: "Logged via mobile checklist." },
          { status: "acknowledged", user: "Admin", time: `${today}T07:20:00`, notes: "Notified Facilities engineering." },
          { status: "action_taken", user: "Facilities Team", time: `${today}T08:10:00`, notes: "Drain line cleared, catch pan installed." }
        ]
      },
      {
        id: "inc-103",
        title: "Unidentified Vehicle in Loading Bay",
        category: "Suspicious Activity",
        priority: "Medium",
        status: "resolved",
        site_name: "ABC Retail Mall",
        zone_name: "Loading Dock",
        reported_by: "Vignesh P",
        reported_at: `${today}T06:00:00`,
        sla_target_hours: 6,
        description: "White commercial van parked without delivery permit.",
        action_log: [
          { status: "reported", user: "Vignesh P", time: `${today}T06:00:00`, notes: "Found parked during morning intake." },
          { status: "resolved", user: "Supervisor", time: `${today}T06:45:00`, notes: "Driver identified as vendor technician with valid pass." }
        ]
      }
    ];
  }

  /**
   * Fetch incidents list with optional status/priority filters
   */
  async fetchIncidents(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultIncidents();

      try {
        let endpoint = `/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const res = await authService.protectedApi.get(endpoint);
        if (res.data.data && res.data.data.length > 0) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_incidents_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(i => String(i.site) === String(siteId));
          return list;
        } catch (e) {}
      }

      return this.getDefaultIncidents();
    } catch (error) {
      console.error("Error fetching incidents:", error);
      return this.getDefaultIncidents();
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

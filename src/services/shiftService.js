import { authService } from "@/services/authService";

class ShiftService {
  getDefaultShiftTemplates() {
    return [];
  }

  getDefaultRoster() {
    return [];
  }

  /**
   * Fetch shift templates (types of shifts: morning, afternoon, night, etc.)
   */
  async fetchShiftTemplates() {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      try {
        const res = await authService.protectedApi.get(`/items/shifts?filter[tenant][_eq]=${tenantId}&sort=name`);
        if (res.data?.data) return res.data.data;
      } catch (e) {}

      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Fetch weekly roster schedule for guards
   */
  async fetchWeeklyRoster(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      const stored = localStorage.getItem(`accesseasy_roster_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(r => String(r.siteId) === String(siteId));
          return list;
        } catch (e) {}
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Save / Update guard shift slot in roster
   */
  async assignGuardShift(guardId, dayKey, shiftId, shiftName, siteId = 'site-01') {
    try {
      const tenantId = authService.getTenantId();
      const roster = await this.fetchWeeklyRoster();
      let guardRow = roster.find(r => String(r.guardId) === String(guardId));
      if (!guardRow) {
        guardRow = {
          guardId,
          guardName: `Guard ${guardId}`,
          siteId,
          schedule: {}
        };
        roster.push(guardRow);
      }
      guardRow.schedule[dayKey] = {
        shiftId,
        shiftName,
        status: shiftId === 'off' ? 'off' : 'confirmed'
      };
      localStorage.setItem(`accesseasy_roster_${tenantId}`, JSON.stringify(roster));
      return guardRow;
    } catch (error) {
      console.error("Error assigning shift:", error);
      throw error;
    }
  }

  /**
   * Detect potential scheduling conflict
   */
  detectConflict(guardRosterRow, dayKey, targetShiftId) {
    if (targetShiftId === 'off') return null;
    // Check consecutive night -> morning shift rule (less than 8h turnaround)
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const idx = dayOrder.indexOf(dayKey);
    if (idx > 0) {
      const prevDay = dayOrder[idx - 1];
      const prevShift = guardRosterRow.schedule?.[prevDay]?.shiftId;
      if (prevShift === 'tmpl-3' && targetShiftId === 'tmpl-1') {
        return "Back-to-back turnaround alert: Guard working Night shift into Morning shift without 8h rest.";
      }
    }
    return null;
  }
}

export const shiftService = new ShiftService();

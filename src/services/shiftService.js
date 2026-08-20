import { authService } from "@/services/authService";

class ShiftService {
  getDefaultShiftTemplates() {
    return [
      { id: "tmpl-1", name: "Morning Shift (General)", startTime: "06:00", endTime: "14:00", durationHours: 8 },
      { id: "tmpl-2", name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", durationHours: 8 },
      { id: "tmpl-3", name: "Night Shift (Perimeter)", startTime: "22:00", endTime: "06:00", durationHours: 8 },
      { id: "tmpl-4", name: "12-Hour Day Shift", startTime: "07:00", endTime: "19:00", durationHours: 12 }
    ];
  }

  getDefaultRoster() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return [
      {
        guardId: "g-01",
        guardName: "Kumar S",
        siteId: "site-01",
        zoneId: "zone-01",
        schedule: {
          Mon: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Tue: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Wed: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Thu: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Fri: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Sat: { shiftId: "off", shiftName: "Weekly Off", status: "off" },
          Sun: { shiftId: "off", shiftName: "Weekly Off", status: "off" },
        }
      },
      {
        guardId: "g-02",
        guardName: "Ramesh K",
        siteId: "site-01",
        zoneId: "zone-02",
        schedule: {
          Mon: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Tue: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Wed: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Thu: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Fri: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Sat: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Sun: { shiftId: "off", shiftName: "Weekly Off", status: "off" },
        }
      },
      {
        guardId: "g-03",
        guardName: "Suresh M",
        siteId: "site-01",
        zoneId: "zone-03",
        schedule: {
          Mon: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
          Tue: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
          Wed: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
          Thu: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
          Fri: { shiftId: "off", shiftName: "Weekly Off", status: "off" },
          Sat: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
          Sun: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
        }
      },
      {
        guardId: "g-04",
        guardName: "Vignesh P",
        siteId: "site-01",
        zoneId: "zone-01",
        schedule: {
          Mon: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Tue: { shiftId: "tmpl-1", shiftName: "Morning (06-14)", status: "confirmed" },
          Wed: { shiftId: "off", shiftName: "Weekly Off", status: "off" },
          Thu: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Fri: { shiftId: "tmpl-2", shiftName: "Afternoon (14-22)", status: "confirmed" },
          Sat: { shiftId: "tmpl-3", shiftName: "Night (22-06)", status: "confirmed" },
          Sun: { shiftId: "off", shiftName: "Weekly Off", status: "off" },
        }
      }
    ];
  }

  /**
   * Fetch shift templates (types of shifts: morning, afternoon, night, etc.)
   */
  async fetchShiftTemplates() {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultShiftTemplates();

      try {
        const res = await authService.protectedApi.get(`/items/shifts?filter[tenant][_eq]=${tenantId}&sort=name`);
        if (res.data.data && res.data.data.length > 0) return res.data.data;
      } catch (e) {}

      return this.getDefaultShiftTemplates();
    } catch (e) {
      return this.getDefaultShiftTemplates();
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

      const defaults = this.getDefaultRoster();
      if (siteId) return defaults.filter(r => String(r.siteId) === String(siteId));
      return defaults;
    } catch (e) {
      return this.getDefaultRoster();
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

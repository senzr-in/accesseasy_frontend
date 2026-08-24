import { authService } from "@/services/authService";

class ShiftService {
  getDefaultShiftTemplates() {
    return [];
  }

  getDefaultRoster() {
    return [];
  }

  /**
   * Fetch shift templates (morning, afternoon, night, etc.) from Directus Cloud
   */
  async fetchShiftTemplates() {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];
      const res = await authService.protectedApi.get(
        `/items/shifts?filter[tenant][_eq]=${tenantId}`
      );
      return (res.data?.data || []).map(s => ({
        ...s,
        name: s.name || s.shift || `Shift ${s.id}`,
        shift: s.shift || s.name || `Shift ${s.id}`,
        start_time: s.start_time || s.entryTime || '08:00',
        end_time: s.end_time || s.exitTime || '16:00'
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Create a new shift template in Directus Cloud
   */
  async createShiftTemplate(templateData) {
    const tenantId = authService.getTenantId();
    const res = await authService.protectedApi.post("/items/shifts", {
      ...templateData,
      tenant: tenantId
    });
    return res.data.data;
  }

  /**
   * Update an existing shift template in Directus Cloud
   */
  async updateShiftTemplate(shiftId, templateData) {
    const res = await authService.protectedApi.patch(`/items/shifts/${shiftId}`, templateData);
    return res.data.data;
  }

  /**
   * Delete a shift template from Directus Cloud
   */
  async deleteShiftTemplate(shiftId) {
    await authService.protectedApi.delete(`/items/shifts/${shiftId}`);
    return true;
  }

  /**
   * Fetch weekly roster for all guards (or filtered by site) from Directus Cloud
   */
  async fetchWeeklyRoster(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      let endpoint = `/items/guard_roster?filter[tenant][_eq]=${tenantId}&sort=guard_name`;
      if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
      const res = await authService.protectedApi.get(endpoint);
      return res.data?.data || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Assign / update a guard's shift for a specific day in Directus Cloud
   */
  async assignGuardShift(guardId, dayKey, shiftId, shiftName, siteId = null) {
    try {
      const tenantId = authService.getTenantId();

      // Check if a roster row already exists for this guard
      const existing = await authService.protectedApi
        .get(`/items/guard_roster?filter[tenant][_eq]=${tenantId}&filter[guard][_eq]=${guardId}&limit=1`)
        .then(r => r.data?.data?.[0])
        .catch(() => null);

      const schedule = existing?.schedule ? { ...existing.schedule } : {};
      schedule[dayKey] = {
        shiftId,
        shiftName,
        status: shiftId === "off" ? "off" : "confirmed"
      };

      if (existing?.id) {
        const upd = await authService.protectedApi.patch(
          `/items/guard_roster/${existing.id}`,
          { schedule }
        );
        return upd.data.data;
      } else {
        const created = await authService.protectedApi.post("/items/guard_roster", {
          tenant: tenantId,
          guard: guardId,
          site: siteId,
          schedule
        });
        return created.data.data;
      }
    } catch (error) {
      console.error("Error assigning shift on cloud:", error);
      throw error;
    }
  }

  /**
   * Detect scheduling conflicts (pure client-side business logic — no cloud call)
   * Rule: Night shift followed immediately by Morning shift = back-to-back turnaround violation
   */
  detectConflict(guardRosterRow, dayKey, targetShiftId) {
    if (targetShiftId === "off") return null;
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const idx = dayOrder.indexOf(dayKey);
    if (idx > 0) {
      const prevDay = dayOrder[idx - 1];
      const prevShift = guardRosterRow.schedule?.[prevDay]?.shiftId;
      if (prevShift === "tmpl-3" && targetShiftId === "tmpl-1") {
        return "Back-to-back turnaround alert: Guard working Night shift into Morning shift without 8h rest.";
      }
    }
    return null;
  }
}

export const shiftService = new ShiftService();

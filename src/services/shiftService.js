import { authService } from "@/services/authService";

class ShiftService {
  getDefaultShiftTemplates() {
    return [
      { id: 'tmpl-1', name: 'Morning Shift (06:00 - 14:00)', shift: 'Morning', start_time: '06:00', end_time: '14:00' },
      { id: 'tmpl-2', name: 'Afternoon Shift (14:00 - 22:00)', shift: 'Afternoon', start_time: '14:00', end_time: '22:00' },
      { id: 'tmpl-3', name: 'Night Shift (22:00 - 06:00)', shift: 'Night', start_time: '22:00', end_time: '06:00' },
      { id: 'tmpl-4', name: '12-Hour Duty (08:00 - 20:00)', shift: '12-Hour', start_time: '08:00', end_time: '20:00' },
      { id: 'off', name: 'Day Off / Rest', shift: 'OFF', start_time: '00:00', end_time: '00:00' }
    ];
  }

  /**
   * Fetch shift templates (morning, afternoon, night, etc.) from Directus Cloud
   */
  async fetchShiftTemplates() {
    try {
      const tenantId = authService.getTenantId();
      if (tenantId) {
        try {
          const res = await authService.protectedApi.get(
            `/items/shifts?filter[tenant][_eq]=${tenantId}`
          );
          if (res.data?.data && res.data.data.length > 0) {
            return res.data.data.map(s => ({
              ...s,
              id: s.id || `shift-${s.shift || 'custom'}`,
              name: s.name || s.shift || `Shift ${s.id}`,
              shift: s.shift || s.name || `Shift ${s.id}`,
              start_time: s.start_time || s.entryTime || '08:00',
              end_time: s.end_time || s.exitTime || '16:00'
            }));
          }
        } catch (e) {}
      }
    } catch (e) {}
    return this.getDefaultShiftTemplates();
  }

  /**
   * Fetch weekly roster for all guards (or filtered by site) from Directus Cloud
   */
  async fetchWeeklyRoster(siteId = null) {
    const tenantId = authService.getTenantId() || 'default';
    const storageKey = `accesseasy_guard_roster_${tenantId}`;

    let cloudRoster = [];
    try {
      let endpoint = `/items/guard_roster?filter[tenant][_eq]=${tenantId}&sort=guard_name`;
      if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
      const res = await authService.protectedApi.get(endpoint);
      if (res.data?.data && Array.isArray(res.data.data)) {
        cloudRoster = res.data.data;
      }
    } catch (e) {}

    let localRoster = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) localRoster = JSON.parse(stored);
    } catch (e) {}

    // Combine cloud and local roster entries
    let combinedRoster = [...cloudRoster];
    if (localRoster.length > 0) {
      const existingIds = new Set(combinedRoster.map(r => String(r.guardId || r.guard || r.id)));
      localRoster.forEach(lr => {
        const idStr = String(lr.guardId || lr.guard || lr.id);
        if (!existingIds.has(idStr)) {
          combinedRoster.push(lr);
        } else {
          const idx = combinedRoster.findIndex(r => String(r.guardId || r.guard || r.id) === idStr);
          if (idx !== -1 && lr.schedule) {
            combinedRoster[idx].schedule = { ...combinedRoster[idx].schedule, ...lr.schedule };
          }
        }
      });
    }

    // Also fetch employees / guards to make sure all registered staff appear in the roster
    try {
      const empRes = await authService.protectedApi.get(`/items/employees?filter[tenant][_eq]=${tenantId}&limit=50`);
      const employees = empRes.data?.data || [];
      
      employees.forEach(emp => {
        const empId = String(emp.id);
        const empName = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || `Guard ${emp.employee_id || emp.id}`;
        
        const found = combinedRoster.find(r => String(r.guardId || r.guard || r.id) === empId || r.guardName === empName);
        if (!found) {
          combinedRoster.push({
            id: `roster-${empId}`,
            guardId: empId,
            guardName: empName,
            schedule: {
              Mon: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
              Tue: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
              Wed: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
              Thu: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
              Fri: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
              Sat: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
              Sun: { shiftId: 'off', shiftName: 'OFF' }
            }
          });
        }
      });
    } catch (e) {}

    // If still empty (e.g. brand new tenant), supply standard demo roster entries
    if (combinedRoster.length === 0) {
      combinedRoster = [
        {
          id: 'roster-g1',
          guardId: 'g1',
          guardName: 'Ramesh Kumar (Supervisor)',
          schedule: {
            Mon: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Tue: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Wed: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Thu: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Fri: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Sat: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Sun: { shiftId: 'off', shiftName: 'OFF' }
          }
        },
        {
          id: 'roster-g2',
          guardId: 'g2',
          guardName: 'Suresh Patel (Patrol Officer)',
          schedule: {
            Mon: { shiftId: 'tmpl-2', shiftName: 'Afternoon (14-22)' },
            Tue: { shiftId: 'tmpl-2', shiftName: 'Afternoon (14-22)' },
            Wed: { shiftId: 'tmpl-2', shiftName: 'Afternoon (14-22)' },
            Thu: { shiftId: 'tmpl-2', shiftName: 'Afternoon (14-22)' },
            Fri: { shiftId: 'tmpl-2', shiftName: 'Afternoon (14-22)' },
            Sat: { shiftId: 'off', shiftName: 'OFF' },
            Sun: { shiftId: 'tmpl-2', shiftName: 'Afternoon (14-22)' }
          }
        },
        {
          id: 'roster-g3',
          guardId: 'g3',
          guardName: 'Vijay Singh (Night Guard)',
          schedule: {
            Mon: { shiftId: 'tmpl-3', shiftName: 'Night (22-06)' },
            Tue: { shiftId: 'tmpl-3', shiftName: 'Night (22-06)' },
            Wed: { shiftId: 'tmpl-3', shiftName: 'Night (22-06)' },
            Thu: { shiftId: 'tmpl-3', shiftName: 'Night (22-06)' },
            Fri: { shiftId: 'tmpl-3', shiftName: 'Night (22-06)' },
            Sat: { shiftId: 'tmpl-3', shiftName: 'Night (22-06)' },
            Sun: { shiftId: 'off', shiftName: 'OFF' }
          }
        }
      ];
    }

    return combinedRoster;
  }

  /**
   * Assign / update a guard's shift for a specific day
   */
  async assignGuardShift(guardId, dayKey, shiftId, shiftName, siteId = null) {
    const tenantId = authService.getTenantId() || 'default';
    const storageKey = `accesseasy_guard_roster_${tenantId}`;

    // Update in LocalStorage fallback first
    try {
      let localList = [];
      const stored = localStorage.getItem(storageKey);
      if (stored) localList = JSON.parse(stored);

      const idx = localList.findIndex(r => String(r.guardId || r.id) === String(guardId));
      if (idx !== -1) {
        if (!localList[idx].schedule) localList[idx].schedule = {};
        localList[idx].schedule[dayKey] = {
          shiftId,
          shiftName,
          status: shiftId === 'off' ? 'off' : 'confirmed'
        };
      } else {
        const newEntry = {
          id: `roster-${guardId}`,
          guardId: String(guardId),
          guardName: `Guard ${guardId}`,
          schedule: {
            [dayKey]: { shiftId, shiftName, status: shiftId === 'off' ? 'off' : 'confirmed' }
          }
        };
        localList.push(newEntry);
      }
      localStorage.setItem(storageKey, JSON.stringify(localList));
    } catch (e) {}

    // Attempt Directus Cloud save
    try {
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
        return upd.data?.data;
      } else {
        const created = await authService.protectedApi.post("/items/guard_roster", {
          tenant: tenantId,
          guard: guardId,
          site: siteId,
          schedule
        });
        return created.data?.data;
      }
    } catch (error) {
      console.warn("Directus save guard_roster fallback to local storage:", error?.message);
    }

    return true;
  }

  /**
   * Detect scheduling conflicts (pure client-side business logic)
   */
  detectConflict(guardRosterRow, dayKey, targetShiftId) {
    if (!guardRosterRow || targetShiftId === "off") return null;
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

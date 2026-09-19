import { authService } from "@/services/authService";

class ShiftService {
  getDefaultShiftTemplates() {
    return [
      { id: 'tmpl-1', name: 'Morning Shift (06:00 - 14:00)', shift: 'Morning', start_time: '06:00', end_time: '14:00', durationHours: 8 },
      { id: 'tmpl-2', name: 'Afternoon Shift (14:00 - 22:00)', shift: 'Afternoon', start_time: '14:00', end_time: '22:00', durationHours: 8 },
      { id: 'tmpl-3', name: 'Night Shift (22:00 - 06:00)', shift: 'Night', start_time: '22:00', end_time: '06:00', durationHours: 8 },
      { id: 'tmpl-4', name: '12-Hour Duty (08:00 - 20:00)', shift: '12-Hour', start_time: '08:00', end_time: '20:00', durationHours: 12 },
      { id: 'off', name: 'Day Off / Rest', shift: 'OFF', start_time: '00:00', end_time: '00:00', durationHours: 0 }
    ];
  }

  /**
   * Fetch shift templates (morning, afternoon, night, etc.)
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
              id: String(s.id || `shift-${s.shift || 'custom'}`),
              name: s.name || s.shift || `Shift ${s.id}`,
              shift: s.shift || s.name || `Shift ${s.id}`,
              startTime: s.start_time || s.startTime || s.entryTime || '08:00',
              endTime: s.end_time || s.endTime || s.exitTime || '16:00',
              durationHours: s.durationHours || 8
            }));
          }
        } catch (e) {}
      }
    } catch (e) {}
    return this.getDefaultShiftTemplates();
  }

  /**
   * Fetch weekly roster for all guards
   */
  async fetchWeeklyRoster(siteId = null) {
    const tenantId = authService.getTenantId() || 'default';
    const storageKey = `accesseasy_guard_roster_${tenantId}`;

    let localRoster = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) localRoster = JSON.parse(stored);
    } catch (e) {}

    const rosterMap = new Map();
    localRoster.forEach(lr => {
      const key = String(lr.guardId || lr.id);
      rosterMap.set(key, lr);
    });

    // Fetch real registered guards/users for this tenant
    try {
      const token = authService.getToken();
      const apiUrl = import.meta.env.VITE_API_URL;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(
        `${apiUrl}/users?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=phone&fields[]=role&limit=100`,
        { headers }
      );

      if (res.ok) {
        const json = await res.json();
        const rawUsers = json?.data || [];

        rawUsers.forEach(u => {
          if (u && u.id) {
            const uid = String(u.id);
            const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.phone || `Guard ${u.id}`;

            if (rosterMap.has(uid)) {
              const existing = rosterMap.get(uid);
              existing.guardName = name;
            } else {
              rosterMap.set(uid, {
                id: `roster-${uid}`,
                guardId: uid,
                guardName: name,
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
          }
        });
      }
    } catch (e) {
      console.warn('[shiftService] Error fetching users for roster:', e);
    }

    const finalRoster = Array.from(rosterMap.values());
    return finalRoster;
  }

  /**
   * Assign / update a guard's shift for a specific day
   */
  async assignGuardShift(guardId, dayKey, shiftId, shiftName, siteId = null, guardName = null) {
    const tenantId = authService.getTenantId() || 'default';
    const storageKey = `accesseasy_guard_roster_${tenantId}`;

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
        if (guardName) localList[idx].guardName = guardName;
      } else {
        const newEntry = {
          id: `roster-${guardId}`,
          guardId: String(guardId),
          guardName: guardName || `Guard ${guardId}`,
          schedule: {
            Mon: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Tue: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Wed: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Thu: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Fri: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Sat: { shiftId: 'tmpl-1', shiftName: 'Morning (06-14)' },
            Sun: { shiftId: 'off', shiftName: 'OFF' },
            [dayKey]: { shiftId, shiftName, status: shiftId === 'off' ? 'off' : 'confirmed' }
          }
        };
        localList.push(newEntry);
      }
      localStorage.setItem(storageKey, JSON.stringify(localList));
    } catch (e) {
      console.error('[shiftService] Error saving guard shift:', e);
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

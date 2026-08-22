import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class AttendanceService {
  /**
   * Mock default attendance roster when backend collection is empty
   */
  getDefaultAttendance() {
    return [];
  }

  /**
   * Fetch today's guard attendance records
   * @param {string|null} siteId
   */
  async getTodayAttendance(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      const today = new Date().toISOString().split('T')[0];
      let query = `/items/guard_attendance?filter[tenant][_eq]=${tenantId}&filter[date_created][_gte]=${today}T00:00:00&sort=-check_in_time&fields=*,guard.first_name,guard.last_name,guard.phone,guard.avatar,site.name,zone.name`;
      
      if (siteId) {
        query += `&filter[site][_eq]=${siteId}`;
      }

      try {
        const res = await authService.protectedApi.get(query);
        if (res.data?.data) {
          return res.data.data.map(r => ({
            ...r,
            guard_name: r.guard ? `${r.guard.first_name || ''} ${r.guard.last_name || ''}`.trim() : (r.guard_name || 'Guard'),
            site_name: r.site?.name || r.site_name || 'Main Site',
            zone_name: r.zone?.name || r.zone_name || 'General Area'
          }));
        }
      } catch (err) {
        // Directus collection might not exist yet
      }

      const stored = localStorage.getItem(`accesseasy_attendance_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(a => String(a.site?.id || a.site) === String(siteId));
          return list;
        } catch (e) {}
      }

      return [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }
  }

  /**
   * Get KPI aggregate statistics for attendance dashboard
   */
  async getAttendanceStats(siteId = null) {
    const list = await this.getTodayAttendance(siteId);
    const total = list.length;
    const onDuty = list.filter(a => a.status === 'present' || a.status === 'late').length;
    const offDuty = list.filter(a => a.status === 'off_duty' || a.check_out_time).length;
    const late = list.filter(a => a.status === 'late' || a.is_late).length;
    const absent = list.filter(a => a.status === 'absent' || (!a.check_in_time && a.status !== 'off_duty')).length;
    const onBreak = list.filter(a => a.status === 'on_break').length;
    const offline = list.filter(a => a.status === 'offline').length;

    const complianceRate = total > 0 ? Math.round(((total - absent - late) / total) * 100) : 100;

    return {
      totalGuards: total,
      onDuty,
      offDuty,
      late,
      absent,
      onBreak,
      offline,
      complianceRate: Math.max(0, complianceRate)
    };
  }

  /**
   * Guard Clock-In (App or Web Admin)
   */
  async checkIn(guardId, siteId, zoneId = null, location = {}) {
    try {
      const tenantId = authService.getTenantId();
      const now = new Date().toISOString();
      const payload = {
        guard: guardId,
        site: siteId,
        zone: zoneId,
        check_in_time: now,
        status: "present",
        check_in_lat: location.lat || null,
        check_in_lng: location.lng || null,
        check_in_accuracy_m: location.accuracy || null,
        tenant: tenantId,
        date_created: now
      };

      try {
        const res = await authService.protectedApi.post("/items/guard_attendance", payload);
        return res.data.data;
      } catch (e) {
        // Local state save
        const list = await this.getTodayAttendance();
        const newRecord = {
          ...payload,
          id: `att-${Date.now()}`,
          guard_name: `Guard ${guardId}`,
          site_name: `Site ${siteId}`
        };
        list.unshift(newRecord);
        localStorage.setItem(`accesseasy_attendance_${tenantId}`, JSON.stringify(list));
        return newRecord;
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      throw error;
    }
  }

  /**
   * Guard Clock-Out
   */
  async checkOut(attendanceId, location = {}) {
    try {
      const tenantId = authService.getTenantId();
      const now = new Date().toISOString();
      const payload = {
        check_out_time: now,
        status: "off_duty",
        check_out_lat: location.lat || null,
        check_out_lng: location.lng || null
      };

      try {
        const res = await authService.protectedApi.patch(`/items/guard_attendance/${attendanceId}`, payload);
        return res.data.data;
      } catch (e) {
        const list = await this.getTodayAttendance();
        const item = list.find(a => String(a.id) === String(attendanceId));
        if (item) {
          Object.assign(item, payload);
          localStorage.setItem(`accesseasy_attendance_${tenantId}`, JSON.stringify(list));
          return item;
        }
      }
    } catch (error) {
      console.error("Error during check-out:", error);
      throw error;
    }
  }

  /**
   * Pro: Start Break
   */
  async startBreak(attendanceId) {
    try {
      const tenantId = authService.getTenantId();
      const now = new Date().toISOString();
      const payload = {
        status: "on_break",
        break_started_at: now
      };

      try {
        const res = await authService.protectedApi.patch(`/items/guard_attendance/${attendanceId}`, payload);
        return res.data.data;
      } catch (e) {
        const list = await this.getTodayAttendance();
        const item = list.find(a => String(a.id) === String(attendanceId));
        if (item) {
          Object.assign(item, payload);
          localStorage.setItem(`accesseasy_attendance_${tenantId}`, JSON.stringify(list));
          return item;
        }
      }
    } catch (error) {
      console.error("Error starting break:", error);
      throw error;
    }
  }

  /**
   * Pro: End Break
   */
  async endBreak(attendanceId) {
    try {
      const tenantId = authService.getTenantId();
      const now = new Date().toISOString();
      const payload = {
        status: "present",
        break_ended_at: now
      };

      try {
        const res = await authService.protectedApi.patch(`/items/guard_attendance/${attendanceId}`, payload);
        return res.data.data;
      } catch (e) {
        const list = await this.getTodayAttendance();
        const item = list.find(a => String(a.id) === String(attendanceId));
        if (item) {
          Object.assign(item, payload);
          localStorage.setItem(`accesseasy_attendance_${tenantId}`, JSON.stringify(list));
          return item;
        }
      }
    } catch (error) {
      console.error("Error ending break:", error);
      throw error;
    }
  }

  /**
   * Pro: Request Guard Replacement
   */
  async requestGuardReplacement(absentGuardId, siteId, replacementGuardId, reason = "Absent / Unresponsive") {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenant: tenantId,
        site: siteId,
        absent_guard: absentGuardId,
        replacement_guard: replacementGuardId,
        reason,
        status: "assigned",
        timestamp: new Date().toISOString()
      };
      
      try {
        const res = await authService.protectedApi.post("/items/guard_replacements", payload);
        return res.data.data;
      } catch (e) {
        return { id: `rep-${Date.now()}`, ...payload };
      }
    } catch (error) {
      console.error("Error requesting replacement:", error);
      throw error;
    }
  }
}

export const attendanceService = new AttendanceService();

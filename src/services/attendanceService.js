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
      let query = `/items/guard_attendance?filter[tenant][_eq]=${tenantId}&filter[date_created][_gte]=${today}T00:00:00&sort=-check_in_time&fields=*,guard.*,guard.assignedUser.*,site.*,zone.*`;
      
      if (siteId) {
        query += `&filter[site][_eq]=${siteId}`;
      }

      try {
        const res = await authService.protectedApi.get(query);
        if (res.data?.data) {
          return res.data.data.map(r => {
            const guardName = r.guard?.assignedUser?.first_name
              ? `${r.guard.assignedUser.first_name} ${r.guard.assignedUser.last_name || ''}`.trim()
              : (r.guard?.first_name ? `${r.guard.first_name} ${r.guard.last_name || ''}`.trim() : (r.guard_name || 'Guard'));
            
            return {
              ...r,
              guard_name: guardName,
              site_name: r.site?.locName || r.site?.name || r.site_name || 'Main Site',
              zone_name: r.zone?.zoneName || r.zone?.name || r.zone_name || 'General Area'
            };
          });
        }
      } catch (err) {
        // Directus collection might not exist yet
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

      const res = await authService.protectedApi.post("/items/guard_attendance", payload);
      return res.data.data;
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

      const res = await authService.protectedApi.patch(`/items/guard_attendance/${attendanceId}`, payload);
      return res.data.data;
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

      const res = await authService.protectedApi.patch(`/items/guard_attendance/${attendanceId}`, payload);
      return res.data.data;
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

      const res = await authService.protectedApi.patch(`/items/guard_attendance/${attendanceId}`, payload);
      return res.data.data;
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

  /**
   * Fetch attendance history for specified date range, site, or guard
   */
  async getAttendanceHistory({ startDate = null, endDate = null, siteId = null, guardId = null } = {}) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      let query = `/items/guard_attendance?filter[tenant][_eq]=${tenantId}&sort=-check_in_time&fields=*,guard.*,guard.assignedUser.*,site.*,zone.*&limit=200`;
      
      if (startDate) {
        query += `&filter[date_created][_gte]=${startDate}T00:00:00`;
      }
      if (endDate) {
        query += `&filter[date_created][_lte]=${endDate}T23:59:59`;
      }
      if (siteId && siteId !== 'all') {
        query += `&filter[site][_eq]=${siteId}`;
      }
      if (guardId && guardId !== 'all') {
        query += `&filter[guard][_eq]=${guardId}`;
      }

      try {
        const res = await authService.protectedApi.get(query);
        if (res.data?.data) {
          return res.data.data.map(r => {
            const guardName = r.guard?.assignedUser?.first_name
              ? `${r.guard.assignedUser.first_name} ${r.guard.assignedUser.last_name || ''}`.trim()
              : (r.guard?.first_name ? `${r.guard.first_name} ${r.guard.last_name || ''}`.trim() : (r.guard_name || 'Security Guard'));
            
            return {
              ...r,
              guard_name: guardName,
              site_name: r.site?.locName || r.site?.name || r.site_name || 'Main Site',
              zone_name: r.zone?.zoneName || r.zone?.name || r.zone_name || 'General Area'
            };
          });
        }
      } catch (err) {}
      return [];
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();

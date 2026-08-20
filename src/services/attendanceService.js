import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class AttendanceService {
  /**
   * Mock default attendance roster when backend collection is empty
   */
  getDefaultAttendance() {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: "att-01",
        guard: { id: "g-01", first_name: "Kumar", last_name: "S", phone: "+91 98765 43210", avatar: null },
        guard_name: "Kumar S",
        site: { id: "site-01", name: "Chennai Tech Park" },
        site_name: "Chennai Tech Park",
        zone_name: "Main Entrance",
        check_in_time: `${today}T08:02:15`,
        check_out_time: null,
        status: "present", // 'present' | 'late' | 'absent' | 'on_break' | 'early_exit'
        check_in_lat: 12.9716,
        check_in_lng: 80.2435,
        check_in_accuracy_m: 6.5,
        shift_start: "08:00",
        shift_end: "16:00",
        is_late: false,
        break_duration_mins: 0,
        active_patrol: "PTR-101"
      },
      {
        id: "att-02",
        guard: { id: "g-02", first_name: "Ramesh", last_name: "K", phone: "+91 98765 43211", avatar: null },
        guard_name: "Ramesh K",
        site: { id: "site-01", name: "Chennai Tech Park" },
        site_name: "Chennai Tech Park",
        zone_name: "Perimeter North",
        check_in_time: `${today}T08:24:00`,
        check_out_time: null,
        status: "late",
        check_in_lat: 12.9718,
        check_in_lng: 80.2438,
        check_in_accuracy_m: 9.0,
        shift_start: "08:00",
        shift_end: "16:00",
        is_late: true,
        late_by_mins: 24,
        break_duration_mins: 0,
        active_patrol: "PTR-102"
      },
      {
        id: "att-03",
        guard: { id: "g-03", first_name: "Suresh", last_name: "M", phone: "+91 98765 43212", avatar: null },
        guard_name: "Suresh M",
        site: { id: "site-01", name: "Chennai Tech Park" },
        site_name: "Chennai Tech Park",
        zone_name: "Warehouse Bay",
        check_in_time: `${today}T07:55:10`,
        check_out_time: null,
        status: "on_break",
        break_started_at: new Date(Date.now() - 15 * 60000).toISOString(),
        check_in_lat: 12.9714,
        check_in_lng: 80.2430,
        check_in_accuracy_m: 5.2,
        shift_start: "08:00",
        shift_end: "16:00",
        is_late: false,
        break_duration_mins: 15,
        active_patrol: null
      },
      {
        id: "att-04",
        guard: { id: "g-04", first_name: "Vignesh", last_name: "P", phone: "+91 98765 43213", avatar: null },
        guard_name: "Vignesh P",
        site: { id: "site-01", name: "Chennai Tech Park" },
        site_name: "Chennai Tech Park",
        zone_name: "Not Assigned",
        check_in_time: null,
        check_out_time: null,
        status: "absent",
        shift_start: "08:00",
        shift_end: "16:00",
        is_late: false,
        active_patrol: null
      },
      {
        id: "att-05",
        guard: { id: "g-05", first_name: "Arun", last_name: "D", phone: "+91 98765 43214", avatar: null },
        guard_name: "Arun D",
        site: { id: "site-01", name: "Chennai Tech Park" },
        site_name: "Chennai Tech Park",
        zone_name: "Main Entrance",
        check_in_time: `${today}T00:00:00`,
        check_out_time: `${today}T08:00:00`,
        status: "off_duty",
        shift_start: "00:00",
        shift_end: "08:00",
        is_late: false,
        active_patrol: null
      }
    ];
  }

  /**
   * Fetch today's guard attendance records
   * @param {string|null} siteId
   */
  async getTodayAttendance(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultAttendance();

      const today = new Date().toISOString().split('T')[0];
      let query = `/items/guard_attendance?filter[tenant][_eq]=${tenantId}&filter[date_created][_gte]=${today}T00:00:00&sort=-check_in_time&fields=*,guard.first_name,guard.last_name,guard.phone,guard.avatar,site.name,zone.name`;
      
      if (siteId) {
        query += `&filter[site][_eq]=${siteId}`;
      }

      try {
        const res = await authService.protectedApi.get(query);
        if (res.data.data && res.data.data.length > 0) {
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

      const defaults = this.getDefaultAttendance();
      if (siteId) return defaults.filter(a => String(a.site?.id || a.site) === String(siteId));
      return defaults;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return this.getDefaultAttendance();
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

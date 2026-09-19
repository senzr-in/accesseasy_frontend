import { authService } from "@/services/authService";
import { siteService } from "@/services/siteService";
import { subscriptionService } from "@/services/subscriptionService";
import { currentUserTenant } from "@/utils/currentUserTenant";

class AttendanceService {
  constructor() {
    // In-memory cache to avoid repeated lookups every poll cycle
    this._userMapCache = null;
    this._siteMapCache = null;
    this._pmMapCache = null;
    this._userMapExpiry = 0;
    this._siteMapExpiry = 0;
    this._pmMapExpiry = 0;
    this._CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  async _resolveTenantSet() {
    let tid = authService.getTenantId();
    if (!tid) {
      try {
        tid = await currentUserTenant.getTenantIdAsync();
      } catch (_) {}
    }
    const tenantData = authService.getTenantData();
    const u = authService.getUserData();
    const userTid = u?.tenant?.tenantId || u?.tenant?.id || (typeof u?.tenant === 'string' ? u.tenant : null);
    return Array.from(new Set([tid, tenantData?.tenantId, tenantData?.id, userTid].filter(Boolean).map(String)));
  }

  async _resolveTenantId() {
    const set = await this._resolveTenantSet();
    return set[0] || null;
  }

  /**
   * Default mock roster fallback
   */
  getDefaultAttendance() {
    return [];
  }

  /**
   * Helper to normalize a guard attendance record
   */
  _mapAttendanceRecord(r, userMap = {}, siteMap = {}, pmMap = {}) {
    const guardUser = r.guard?.assignedUser || (typeof r.guard === 'object' ? r.guard : null);
    const guardIdStr = String(r.guard?.id || (typeof r.guard === 'string' ? r.guard : '') || '');
    const mappedUser = userMap[guardIdStr] || pmMap[guardIdStr];

    let guardName = 'Security Guard';
    if (guardUser?.first_name || guardUser?.last_name) {
      const lName = (guardUser.last_name && guardUser.last_name !== '-') ? guardUser.last_name : '';
      guardName = `${guardUser.first_name || ''} ${lName}`.trim();
    } else if (guardUser?.name) {
      guardName = guardUser.name;
    } else if (mappedUser?.name) {
      guardName = mappedUser.name;
    } else if (r.guard_name) {
      guardName = r.guard_name;
    } else if (guardUser?.username) {
      guardName = guardUser.username;
    } else if (guardUser?.email) {
      guardName = guardUser.email.split('@')[0];
    } else if (typeof r.guard === 'string' && r.guard.length > 0 && !r.guard.includes('-')) {
      guardName = r.guard;
    } else if (guardIdStr) {
      guardName = `Guard #${guardIdStr}`;
    }

    // Guard against JSON objects stored in site/zone fields
    const siteIdStr = String(r.site?.id || (typeof r.site === 'string' ? r.site : '') || '');
    const _rawSiteName = r.site?.locName || r.site?.name || r.site?.loc_name || siteMap[siteIdStr]
      || (typeof r.site_name === 'string' ? r.site_name : null) || '';
    const siteName = _rawSiteName || 'Main Site';
    const _rawZoneName = r.zone?.zoneName || r.zone?.name || r.zone?.zone_name
      || (typeof r.zone_name === 'string' ? r.zone_name : null)
      || (typeof r.zone === 'string' && !r.zone.includes('-') ? r.zone : '') || '';
    const zoneName = _rawZoneName;

    const phone = guardUser?.phone || guardUser?.phoneNumber || mappedUser?.phone || r.guard?.phone || r.guard_phone || r.phone || 'No phone';

    let verificationMode = r.verification_mode || (r.face_snapshot || r.confidence_score ? 'face_ai' : (r.nfc_uid ? 'nfc' : (r.pin_verified ? 'pin' : 'manual')));
    if (r.mode) {
      const mLower = String(r.mode).toLowerCase();
      if (mLower.includes('face')) verificationMode = 'face_ai';
      else if (mLower.includes('nfc') || mLower.includes('card') || mLower.includes('rfid')) verificationMode = 'nfc';
      else if (mLower.includes('finger') || mLower.includes('bio')) verificationMode = 'biometric_device';
      else if (mLower.includes('app') || mLower.includes('mobile')) verificationMode = 'mobile_app';
    }
    const confidenceScore = r.confidence_score != null ? Math.round(r.confidence_score * (r.confidence_score <= 1 ? 100 : 1)) : null;

    return {
      ...r,
      guard_name: guardName,
      site_name: siteName,
      zone_name: zoneName,
      phone: phone,
      guard: {
        ...(typeof r.guard === 'object' ? r.guard : {}),
        id: guardIdStr || r.guard?.id || r.guard,
        phone: phone
      },
      verification_mode: verificationMode,
      confidence_score: confidenceScore,
      face_snapshot: r.face_snapshot?.id || r.face_snapshot || null,
      device_name: r.device_name || r.device || (r.door ? `Device (${r.door})` : 'Access Terminal / App'),
      status: r.status || (r.check_out_time ? 'off_duty' : (r.check_in_time ? 'present' : 'absent'))
    };
  }

  /**
   * Fetch today's guard attendance records
   * @param {string|null} siteId
   */
  async getTodayAttendance(siteId = null) {
    try {
      const tenantIds = await this._resolveTenantSet();
      const primaryTenantId = tenantIds[0] || null;
      const now = Date.now();
      
      // 1. Fetch Users Map — cached for 5 minutes
      let userMap = {};
      if (this._userMapCache && now < this._userMapExpiry) {
        userMap = this._userMapCache;
      } else {
        try {
          for (const tid of tenantIds) {
            const usersUrl = `/users?filter[tenant][_eq]=${tid}&limit=500&fields=id,first_name,last_name,email,phone,avatar`;
            const usersRes = await authService.protectedApi.get(usersUrl).catch(() => null);
            if (usersRes?.data?.data) {
              usersRes.data.data.forEach(u => {
                const lName = (u.last_name && u.last_name !== '-') ? u.last_name : '';
                userMap[String(u.id)] = {
                  id: u.id,
                  name: `${u.first_name || ''} ${lName}`.trim() || u.email?.split('@')[0] || 'Guard',
                  phone: u.phone || '',
                  avatar: u.avatar || null
                };
              });
            }
          }
          this._userMapCache = userMap;
          this._userMapExpiry = now + this._CACHE_TTL;
        } catch (_) {}
      }

      // 2. Fetch Sites Map — cached for 5 minutes
      let siteMap = {};
      if (this._siteMapCache && now < this._siteMapExpiry) {
        siteMap = this._siteMapCache;
      } else {
        try {
          const sites = await siteService.fetchSites();
          if (sites && Array.isArray(sites)) {
            sites.forEach(s => {
              siteMap[String(s.id)] = s.name || s.locName;
            });
            this._siteMapCache = siteMap;
            this._siteMapExpiry = now + this._CACHE_TTL;
          }
        } catch (_) {}
      }

      // 3. Fetch personalModule Map — cached for 5 minutes
      let pmMap = {};
      if (this._pmMapCache && now < this._pmMapExpiry) {
        pmMap = this._pmMapCache;
      } else {
        try {
          for (const tid of tenantIds) {
            const pmUrl = `/items/personalModule?filter[tenant][_eq]=${tid}&limit=500&fields=id,employeeId,assignedUser.id,assignedUser.first_name,assignedUser.last_name,assignedUser.phone,assignedUser.email`;
            const pmRes = await authService.protectedApi.get(pmUrl).catch(() => null);
            if (pmRes?.data?.data) {
              pmRes.data.data.forEach(pm => {
                const u = pm.assignedUser || {};
                const lName = (u.last_name && u.last_name !== '-') ? u.last_name : '';
                const name = `${u.first_name || ''} ${lName}`.trim() || u.email?.split('@')[0] || `Employee #${pm.id}`;
                const entry = { id: pm.id, employeeId: pm.employeeId, name, phone: u.phone || '', userObj: u };
                pmMap[String(pm.id)] = entry;
                if (pm.employeeId) pmMap[String(pm.employeeId)] = entry;
                if (u.id) pmMap[String(u.id)] = entry;
              });
            }
          }
          this._pmMapCache = pmMap;
          this._pmMapExpiry = now + this._CACHE_TTL;
        } catch (_) {}
      }

      let allRecords = [];

      // 4. Query /items/guard_attendance across valid tenant IDs
      for (const tid of tenantIds) {
        try {
          let url = `/items/guard_attendance?filter[tenant][_eq]=${tid}&sort=-check_in_time&limit=100&fields=*`;
          if (siteId && siteId !== 'all') {
            url += `&filter[site][_eq]=${siteId}`;
          }
          const res = await authService.protectedApi.get(url, { timeout: 10000 });
          if (res.data?.data && Array.isArray(res.data.data)) {
            res.data.data.forEach(r => {
              if (!allRecords.some(item => String(item.id) === String(r.id))) {
                allRecords.push(r);
              }
            });
          }
        } catch (_) {}
      }

      // 5. Fetch live multi-session punch records from hardware device & mobile-app logs (/items/logs)
      try {
        const liveStates = await this.getLiveGuardStates();

        liveStates.forEach(ls => {
          if (ls.sessions && ls.sessions.length > 0) {
            ls.sessions.forEach(sess => {
              if (!allRecords.some(r => String(r.id) === String(sess.id))) {
                allRecords.push(sess);
              }
            });
          } else if (ls.checkInTime || ls.checkOutTime) {
            const sessId = `log-${ls.userId || ls.employeeId || 'sess'}`;
            if (!allRecords.some(r => String(r.id) === String(sessId))) {
              allRecords.push({
                id: sessId,
                guard: { id: ls.userId || ls.employeeId, assignedUser: ls.assignedUser },
                guard_name: ls.guardName,
                phone: ls.phone,
                site_name: ls.siteName || 'Device Access',
                zone_name: '',
                check_in_time: ls.checkInTime,
                check_out_time: ls.checkOutTime,
                status: ls.liveStatus === 'checked_out' ? 'off_duty' : (ls.liveStatus === 'on_break' ? 'on_break' : 'present'),
                verification_mode: ls.mode || 'face_ai',
                live_status: ls.liveStatus,
                last_log_time: ls.lastLogTime,
                last_log_action: ls.lastAction,
                date_created: ls.checkInTime || new Date().toISOString()
              });
            }
          }
        });
      } catch (_) {}



      if (allRecords && allRecords.length > 0) {
        return allRecords.map(r => this._mapAttendanceRecord(r, userMap, siteMap, pmMap));
      }

      return [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }
  }

  /**
   * Fetch live guard states from the /items/logs collection.
   * Recognizes all hardware biometric, face terminal, RFID card, turnstile, and mobile punch actions.
   */
  async getLiveGuardStates() {
    try {
      const tenantIds = await this._resolveTenantSet();
      const today = new Date().toISOString().split('T')[0];

      let logsData = [];
      for (const tid of tenantIds) {
        try {
          const url = `/items/logs?filter[tenant][_eq]=${tid}&sort=-date_created&limit=300&fields=*`;
          const res = await authService.protectedApi.get(url, { timeout: 10000 });
          if (res.data?.data && Array.isArray(res.data.data)) {
            res.data.data.forEach(l => {
              if (!logsData.some(item => String(item.id) === String(l.id))) {
                logsData.push(l);
              }
            });
          }
        } catch (_) {}
      }

      if (!logsData.length) return [];

      // Group all logs by employeeId or user
      const byEmployee = {};
      logsData.forEach(log => {
        const empId = typeof log.employeeId === 'object' ? log.employeeId?.id : (log.employeeId || log.personal_module_id || log.user || log.userId);
        if (!empId) return;
        const key = String(empId);
        if (!byEmployee[key]) byEmployee[key] = { logs: [], empObj: log.employeeId };
        byEmployee[key].logs.push(log);
      });

      // Ensure personalModule map is loaded across tenant IDs
      let pmMap = this._pmMapCache;
      if (!pmMap || Object.keys(pmMap).length === 0) {
        pmMap = {};
        for (const tid of tenantIds) {
          try {
            const pmUrl = `/items/personalModule?filter[tenant][_eq]=${tid}&limit=500&fields=id,employeeId,assignedUser.id,assignedUser.first_name,assignedUser.last_name,assignedUser.phone,assignedUser.email`;
            const pmRes = await authService.protectedApi.get(pmUrl, { timeout: 8000 }).catch(() => null);
            if (pmRes?.data?.data) {
              pmRes.data.data.forEach(pm => {
                const u = pm.assignedUser || {};
                const lName = (u.last_name && u.last_name !== '-') ? u.last_name : '';
                const name = `${u.first_name || ''} ${lName}`.trim() || u.email?.split('@')[0] || `Employee #${pm.id}`;
                const entry = { id: pm.id, employeeId: pm.employeeId, name, phone: u.phone || '', userObj: u, userId: u.id };
                pmMap[String(pm.id)] = entry;
                if (pm.employeeId) pmMap[String(pm.employeeId)] = entry;
                if (u.id) pmMap[String(u.id)] = entry;
              });
            }
          } catch (_) {}
        }
        this._pmMapCache = pmMap;
        this._pmMapExpiry = Date.now() + this._CACHE_TTL;
      }

      const userMap = this._userMapCache || {};

      // Device & App action classifications
      const isCheckInAction = (act) => {
        const a = (act || '').toLowerCase().trim();
        return [
          'in', 'entry', 'granted', 'access granted', 'access_granted', 'door open',
          'door_unlock', 'pass', 'clock_in', 'check_in', 'resume', 'break_end',
          'active', 'normal', 'swipe', 'face', 'card', 'finger', 'allow', 'success'
        ].some(k => a === k || a.includes('grant') || a.includes('entry') || a.includes('clock_in') || a.includes('check_in') || a === 'in');
      };

      const isCheckOutAction = (act) => {
        const a = (act || '').toLowerCase().trim();
        return [
          'out', 'exit', 'clock_out', 'check_out', 'off_duty', 'deny'
        ].some(k => a === k || a.includes('exit') || a.includes('clock_out') || a.includes('check_out') || a === 'out');
      };

      const isBreakAction = (act) => {
        const a = (act || '').toLowerCase().trim();
        return ['break', 'break_start', 'on_break', 'pause'].some(k => a.includes(k));
      };

      return Object.entries(byEmployee).map(([empId, { logs, empObj }]) => {
        // Sort chronologically (oldest to newest)
        const sortedLogs = [...logs].sort((a, b) => {
          const tA = (a.date || today) + 'T' + (a.timeStamp || '00:00:00');
          const tB = (b.date || today) + 'T' + (b.timeStamp || '00:00:00');
          return tA.localeCompare(tB);
        });

        const latestLog = sortedLogs[sortedLogs.length - 1];
        const rawAction = (latestLog?.action || '').toLowerCase().trim();

        let liveStatus = 'unknown';
        if (isCheckInAction(rawAction)) {
          liveStatus = 'checked_in';
        } else if (isCheckOutAction(rawAction)) {
          liveStatus = 'checked_out';
        } else if (isBreakAction(rawAction)) {
          liveStatus = 'on_break';
        }

        const toISO = (log) => {
          if (!log) return null;
          const d = log.date || today;
          let t = log.timeStamp || '';
          if (!t && log.date_created && log.date_created.includes('T')) {
            t = log.date_created.split('T')[1].slice(0, 8);
          }
          if (!t || t === '00:00:00') {
            if (log.date_created) return log.date_created;
            return `${d}T00:00:00`;
          }
          return `${d}T${t}`;
        };

        const mappedPm = pmMap[String(empId)] || {};
        const mappedUser = userMap[String(empId)] || {};
        const assignedUser = typeof empObj === 'object' ? empObj?.assignedUser : (mappedPm.userObj || null);
        const resolvedUserId = assignedUser?.id || mappedPm.userId || empId;
        const resolvedEmpId = mappedPm.employeeId || (typeof empObj === 'object' ? empObj?.employeeId : null) || empId;
        const firstName = assignedUser?.first_name || '';
        const lastName = (assignedUser?.last_name && assignedUser?.last_name !== '-') ? assignedUser.last_name : '';
        const guardName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (mappedPm.name || mappedUser.name || `Guard #${empId}`);
        const logSite = latestLog?.site_name || latestLog?.location || (typeof latestLog?.site === 'string' ? latestLog.site : null) || (latestLog?.door ? `Gate: ${latestLog.door}` : 'Access Terminal');

        // Build distinct session pairs
        const sessions = [];
        let cur = null;

        for (const l of sortedLogs) {
          const act = (l.action || '').toLowerCase().trim();
          const t = toISO(l);
          if (isCheckInAction(act)) {
            if (cur && !cur.check_out_time) {
              sessions.push(cur);
            }
            cur = {
              id: `log-s-${empId}-${l.id || Math.random()}`,
              guard: { id: resolvedUserId, assignedUser, employeeId: resolvedEmpId, personalModuleId: mappedPm.id },
              guard_name: guardName,
              phone: assignedUser?.phone || mappedPm.phone || mappedUser.phone || 'No phone',
              employee_id: resolvedEmpId,
              personalModuleId: mappedPm.id,
              site_name: logSite,
              zone_name: l.door || '',
              check_in_time: t,
              check_out_time: null,
              status: 'present',
              verification_mode: l.mode || 'face_ai',
              device_name: l.device_name || l.device || l.door || 'Biometric Device',
              live_status: 'checked_in',
              last_log_time: t,
              last_log_action: act,
              date_created: t
            };
          } else if (isCheckOutAction(act)) {
            if (cur) {
              cur.check_out_time = t;
              cur.status = 'off_duty';
              cur.live_status = 'checked_out';
              sessions.push(cur);
              cur = null;
            } else {
              sessions.push({
                id: `log-s-${empId}-${l.id || Math.random()}`,
                guard: { id: resolvedUserId, assignedUser, employeeId: resolvedEmpId, personalModuleId: mappedPm.id },
                guard_name: guardName,
                phone: assignedUser?.phone || mappedPm.phone || mappedUser.phone || 'No phone',
                employee_id: resolvedEmpId,
                personalModuleId: mappedPm.id,
                site_name: logSite,
                zone_name: l.door || '',
                check_in_time: null,
                check_out_time: t,
                status: 'off_duty',
                verification_mode: l.mode || 'face_ai',
                device_name: l.device_name || l.device || l.door || 'Biometric Device',
                live_status: 'checked_out',
                last_log_time: t,
                last_log_action: act,
                date_created: t
              });
            }
          }
        }
        if (cur) {
          sessions.push(cur);
        }

        const inLog = sortedLogs.find(l => isCheckInAction(l.action));
        const outLog = [...sortedLogs].reverse().find(l => isCheckOutAction(l.action));

        return {
          employeeId: empId,
          userId: assignedUser?.id || empId,
          assignedUser: assignedUser || null,
          guardName,
          phone: assignedUser?.phone || mappedPm.phone || mappedUser.phone || 'No phone',
          siteName: logSite,
          liveStatus,
          lastAction: rawAction,
          lastLogTime: toISO(latestLog),
          checkInTime: toISO(inLog),
          checkOutTime: toISO(outLog),
          mode: latestLog?.mode || 'face_ai',
          sessions,
          allLogs: sortedLogs.map(l => ({ id: l.id, action: l.action, time: toISO(l) }))
        };
      });
    } catch (error) {
      console.error('Error fetching live guard states:', error);
      return [];
    }
  }

  calculateStats(list = []) {
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

  async getAttendanceStats(siteId = null, existingList = null) {
    const list = existingList || await this.getTodayAttendance(siteId);
    return this.calculateStats(list);
  }

  /**
   * Guard Clock-In (App or Web Admin)
   */
  async checkIn(guardIdOrName, siteId, zoneId = null, location = {}) {
    try {
      const tenantId = authService.getTenantId();
      const now = new Date().toISOString();
      const payload = {
        guard: guardIdOrName,
        guard_name: typeof guardIdOrName === 'string' ? guardIdOrName : null,
        site: siteId,
        zone: zoneId,
        check_in_time: now,
        status: "present",
        check_in_lat: location.lat || location.latitude || null,
        check_in_lng: location.lng || location.longitude || null,
        check_in_accuracy_m: location.accuracy || null,
        date_created: now
      };

      if (tenantId) {
        payload.tenant = tenantId;
      }

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
      const now = new Date().toISOString();
      const payload = {
        check_out_time: now,
        status: "off_duty",
        check_out_lat: location.lat || location.latitude || null,
        check_out_lng: location.lng || location.longitude || null
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
      let query = `/items/guard_attendance?sort=-check_in_time,-date_created&fields=*,guard.*,guard.assignedUser.*,site.*,zone.*&limit=200`;
      
      if (tenantId) {
        query += `&filter[tenant][_eq]=${tenantId}`;
      }
      if (startDate) {
        query += `&filter[check_in_time][_gte]=${startDate}T00:00:00`;
      }
      if (endDate) {
        query += `&filter[check_in_time][_lte]=${endDate}T23:59:59`;
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
          return res.data.data.map(r => this._mapAttendanceRecord(r));
        }
      } catch (err) {
        console.error('[AttendanceService] Query failed — NOT falling back to prevent cross-tenant exposure:', err.message);
        throw err;
      }
      return [];
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();


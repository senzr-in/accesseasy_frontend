import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class AttendanceService {
  constructor() {
    // In-memory cache to avoid repeated lookups every poll cycle
    this._userMapCache = null;
    this._siteMapCache = null;
    this._userMapExpiry = 0;
    this._siteMapExpiry = 0;
    this._CACHE_TTL = 5 * 60 * 1000; // 5 minutes
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
  _mapAttendanceRecord(r, userMap = {}, siteMap = {}) {
    const guardUser = r.guard?.assignedUser || (typeof r.guard === 'object' ? r.guard : null);
    const guardIdStr = String(r.guard?.id || (typeof r.guard === 'string' ? r.guard : '') || '');
    const mappedUser = userMap[guardIdStr];

    let guardName = 'Security Guard';
    if (guardUser?.first_name || guardUser?.last_name) {
      guardName = `${guardUser.first_name || ''} ${guardUser.last_name || ''}`.trim();
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

    const verificationMode = r.verification_mode || (r.face_snapshot || r.confidence_score ? 'face_ai' : (r.nfc_uid ? 'nfc' : (r.pin_verified ? 'pin' : 'manual')));
    const confidenceScore = r.confidence_score != null ? Math.round(r.confidence_score * (r.confidence_score <= 1 ? 100 : 1)) : null;

    return {
      ...r,
      guard_name: guardName,
      site_name: siteName,
      zone_name: zoneName,
      phone: phone,
      guard: {
        ...(typeof r.guard === 'object' ? r.guard : {}),
        phone: phone
      },
      verification_mode: verificationMode,
      confidence_score: confidenceScore,
      face_snapshot: r.face_snapshot?.id || r.face_snapshot || null,
      device_name: r.device_name || r.device || 'Mobile Patrol App',
      status: r.status || (r.check_out_time ? 'off_duty' : (r.check_in_time ? 'present' : 'absent'))
    };
  }

  /**
   * Fetch today's guard attendance records
   * @param {string|null} siteId
   */
  async getTodayAttendance(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      const now = Date.now();
      
      // 1. Fetch Users Map — cached for 5 minutes to avoid repeated /users calls
      let userMap = {};
      if (this._userMapCache && now < this._userMapExpiry) {
        userMap = this._userMapCache;
      } else {
        try {
          const usersRes = await authService.protectedApi.get('/users?limit=500&fields=id,first_name,last_name,email,phone,avatar');
          if (usersRes.data?.data) {
            usersRes.data.data.forEach(u => {
              userMap[String(u.id)] = {
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email?.split('@')[0] || 'Guard',
                phone: u.phone || '',
                avatar: u.avatar || null
              };
            });
            this._userMapCache = userMap;
            this._userMapExpiry = now + this._CACHE_TTL;
          }
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

      let allRecords = [];

      // 3. Query /items/guard_attendance (fast flat query)
      if (tenantId) {
        try {
          let url = `/items/guard_attendance?filter[tenant][_eq]=${tenantId}&sort=-check_in_time&limit=100&fields=*`;
          if (siteId && siteId !== 'all') {
            url += `&filter[site][_eq]=${siteId}`;
          }
          const res = await authService.protectedApi.get(url, { timeout: 6000 });
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            allRecords = res.data.data;
          }
        } catch (_) {}
      }

      // 4. Fetch live multi-session punch records from mobile-app logs (/items/logs)
      //    Prioritized as source of truth for mobile patrol app punches
      try {
        const liveStates = await this.getLiveGuardStates();

        // Add actual live multi-sessions from mobile logs
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
                site_name: ls.siteName || 'App Check-In',
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

      // 5. Also check /items/attendance (workforce/general attendance collection)
      if (tenantId && allRecords.length === 0) {
        try {
          const attUrl = `/items/attendance?filter[tenant][_eq]=${tenantId}&sort=-date,-inTime&limit=100&fields=*`;
          const res = await authService.protectedApi.get(attUrl, { timeout: 6000 });
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const attMapped = res.data.data
              .filter(item => (item.inTime && item.inTime !== '00:00:00') || (item.outTime && item.outTime !== '00:00:00'))
              .map(item => {
                const empId = typeof item.employeeId === 'object' ? item.employeeId?.id : item.employeeId;
                const mappedUser = userMap[String(empId)] || {};
                const dateStr = item.date || new Date().toISOString().split('T')[0];
                const inTimeStr = item.inTime ? (item.inTime.includes('T') ? item.inTime : `${dateStr}T${item.inTime}`) : null;
                const outTimeStr = item.outTime ? (item.outTime.includes('T') ? item.outTime : `${dateStr}T${item.outTime}`) : null;
                const siteName = typeof item.location === 'string' ? item.location : (item.site_name || '');

                return {
                  id: `att-${item.id}`,
                  guard: empId,
                  guard_name: mappedUser.name || 'Security Guard',
                  phone: mappedUser.phone || 'No phone',
                  site_name: siteName || 'Main Site',
                  zone_name: typeof item.door === 'string' ? item.door : '',
                  check_in_time: inTimeStr,
                  check_out_time: outTimeStr,
                  status: item.attendance === 'present' || item.status === 'present' ? 'present' : (item.status || 'present'),
                  verification_mode: item.mode || 'manual',
                  date_created: inTimeStr || item.date_created || new Date().toISOString()
                };
              });

            attMapped.forEach(am => {
              if (!allRecords.some(r => String(r.id) === String(am.id))) {
                allRecords.push(am);
              }
            });
          }
        } catch (_) {}
      }

      if (allRecords && allRecords.length > 0) {
        return allRecords.map(r => this._mapAttendanceRecord(r, userMap, siteMap));
      }

      return [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }
  }

  /**
   * Fetch live guard states from the /items/logs collection.
   * Returns one entry per guard with their CURRENT state: checked_in | on_break | checked_out
   */
  async getLiveGuardStates() {
    try {
      const tenantId = authService.getTenantId();
      const today = new Date().toISOString().split('T')[0];

      let logsData = [];
      try {
        let url = `/items/logs?filter[tenant][_eq]=${tenantId}&filter[date][_eq]=${today}&sort=date_created,timeStamp&limit=200&fields=id,action,status,date,timeStamp,mode,date_created,employeeId,site_name,location`;
        if (!tenantId) {
          url = `/items/logs?filter[date][_eq]=${today}&sort=date_created,timeStamp&limit=200&fields=id,action,status,date,timeStamp,mode,date_created,employeeId,site_name,location`;
        }
        const res = await authService.protectedApi.get(url, { timeout: 6000 });
        if (res.data?.data && Array.isArray(res.data.data)) {
          logsData = res.data.data;
        }
      } catch (err) {
        // Fallback without date filter if date is stored with time
        try {
          const res = await authService.protectedApi.get(
            `/items/logs?filter[tenant][_eq]=${tenantId}&sort=-date_created&limit=100&fields=id,action,status,date,timeStamp,mode,date_created,employeeId,site_name,location`,
            { timeout: 5000 }
          );
          if (res.data?.data && Array.isArray(res.data.data)) {
            logsData = res.data.data;
          }
        } catch (_) {}
      }

      if (!logsData.length) return [];

      // Group all logs by employeeId (personalModule.id)
      const byEmployee = {};
      logsData.forEach(log => {
        const empId = typeof log.employeeId === 'object' ? log.employeeId?.id : log.employeeId;
        if (!empId) return;
        if (!byEmployee[empId]) byEmployee[empId] = { logs: [], empObj: log.employeeId };
        byEmployee[empId].logs.push(log);
      });

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
        if (['in', 'clock_in', 'check_in', 'resume', 'break_end', 'active'].includes(rawAction)) {
          liveStatus = 'checked_in';
        } else if (['out', 'clock_out', 'check_out', 'off_duty', 'exit'].includes(rawAction)) {
          liveStatus = 'checked_out';
        } else if (['break', 'break_start', 'on_break', 'pause'].includes(rawAction)) {
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

        const assignedUser = typeof empObj === 'object' ? empObj?.assignedUser : null;
        const firstName = assignedUser?.first_name || '';
        const lastName = assignedUser?.last_name || '';
        const guardName = `${firstName} ${lastName}`.trim() || `Employee #${empId}`;
        const logSite = latestLog?.site_name || latestLog?.location || (typeof latestLog?.site === 'string' ? latestLog.site : null);

        // Build distinct session pairs
        const sessions = [];
        let cur = null;

        for (const l of sortedLogs) {
          const act = (l.action || '').toLowerCase().trim();
          const t = toISO(l);
          if (['in', 'clock_in', 'check_in'].includes(act)) {
            if (cur && !cur.check_out_time) {
              sessions.push(cur);
            }
            cur = {
              id: `log-s-${empId}-${l.id || Math.random()}`,
              guard: { id: assignedUser?.id || empId, assignedUser },
              guard_name: guardName,
              phone: assignedUser?.phone || 'No phone',
              site_name: logSite || 'App Check-In',
              zone_name: '',
              check_in_time: t,
              check_out_time: null,
              status: 'present',
              verification_mode: l.mode || 'face_ai',
              live_status: 'checked_in',
              last_log_time: t,
              last_log_action: act,
              date_created: t
            };
          } else if (['out', 'clock_out', 'check_out'].includes(act)) {
            if (cur) {
              cur.check_out_time = t;
              cur.status = 'off_duty';
              cur.live_status = 'checked_out';
              sessions.push(cur);
              cur = null;
            } else {
              sessions.push({
                id: `log-s-${empId}-${l.id || Math.random()}`,
                guard: { id: assignedUser?.id || empId, assignedUser },
                guard_name: guardName,
                phone: assignedUser?.phone || 'No phone',
                site_name: logSite || 'App Check-In',
                zone_name: '',
                check_in_time: null,
                check_out_time: t,
                status: 'off_duty',
                verification_mode: l.mode || 'face_ai',
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

        const inLog = sortedLogs.find(l => ['in', 'clock_in', 'check_in'].includes((l.action || '').toLowerCase().trim()));
        const outLog = [...sortedLogs].reverse().find(l => ['out', 'clock_out', 'check_out'].includes((l.action || '').toLowerCase().trim()));

        return {
          employeeId: empId,
          userId: assignedUser?.id || null,
          assignedUser: assignedUser || null,
          guardName,
          phone: assignedUser?.phone || 'No phone',
          siteName: logSite || null,
          liveStatus,
          lastAction: rawAction,
          lastLogTime: toISO(latestLog),
          checkInTime: toISO(inLog),
          checkOutTime: toISO(outLog),
          mode: latestLog?.mode || 'app',
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
        // Fallback shallow query
        const fallbackRes = await authService.protectedApi.get(`/items/guard_attendance?sort=-check_in_time&limit=100&fields=*.*`);
        if (fallbackRes.data?.data) {
          return fallbackRes.data.data.map(r => this._mapAttendanceRecord(r));
        }
      }
      return [];
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();


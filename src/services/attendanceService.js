import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const attendanceService = {
  /**
   * Get attendance time-series analytics (Today, 7 Days, 30 Days, Custom) from live database
   */
  async getAttendanceAnalytics(timeframe = '7d', filter = {}) {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return this.getEmptyAnalytics(timeframe);
      }

      if (timeframe === 'today') {
        const today = new Date().toISOString().split('T')[0];
        const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        
        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;
        let leaveCount = 0;
        
        try {
          let attUrl = `${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=-1&fields=id,status,inTime,outTime,attendance`;
          if (activeTenantId) {
            attUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
          }
          let res = await fetch(attUrl, { headers: getHeaders() });
          if (!res.ok && activeTenantId) {
            res = await fetch(`${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=-1&fields=id,status,inTime,outTime,attendance`, { headers: getHeaders() });
          }
          if (res.ok) {
            const data = await res.json();
            const records = data.data || [];
            presentCount = records.length;
            lateCount = records.filter(r => r.lateBy || (r.inTime && r.inTime > '09:30:00')).length;
            leaveCount = records.filter(r => r.leaveType && r.leaveType !== 'none').length;
          }
        } catch (e) {
          console.warn('[attendanceService] error querying today attendance:', e);
        }

        const hourDist = hours.map((_, i) => (presentCount > 0 ? Math.round(presentCount / hours.length) : 0));

        return {
          categories: hours,
          series: [
            { name: 'Present', data: hourDist },
            { name: 'Late', data: hours.map(() => lateCount > 0 ? Math.round(lateCount / hours.length) : 0) },
            { name: 'Absent', data: hours.map(() => 0) },
            { name: 'Leave', data: hours.map(() => 0) },
            { name: 'Overtime', data: hours.map(() => 0) }
          ],
          summary: {
            presentTotal: presentCount,
            lateTotal: lateCount,
            absentTotal: absentCount,
            leaveTotal: leaveCount,
            overtimeHours: '0 hrs'
          }
        };
      }

      // 7 Days or 30 Days query
      const daysCount = timeframe === '30d' ? 30 : 7;
      const categories = [];
      const now = new Date();
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        categories.push(timeframe === '30d' ? `${d.getMonth() + 1}/${d.getDate()}` : d.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      let attRecords = [];
      try {
        let attUrl = `${API_URL}/items/attendance?limit=-1&sort[]=-date&fields=id,date,status,inTime,attendance`;
        if (activeTenantId) {
          attUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
        }
        let res = await fetch(attUrl, { headers: getHeaders() });
        if (!res.ok && activeTenantId) {
          res = await fetch(`${API_URL}/items/attendance?limit=-1&sort[]=-date&fields=id,date,status,inTime,attendance`, { headers: getHeaders() });
        }
        if (res.ok) {
          const data = await res.json();
          attRecords = data.data || [];
        }
      } catch (e) {
        console.warn('[attendanceService] query historical attendance error:', e);
      }

      const presentByDay = categories.map(() => 0);
      const lateByDay = categories.map(() => 0);

      attRecords.forEach(r => {
        if (!r.date) return;
        const rDate = new Date(r.date);
        const idx = categories.findIndex((cat, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() - (daysCount - 1 - i));
          return d.toISOString().split('T')[0] === r.date;
        });
        if (idx >= 0) {
          presentByDay[idx]++;
          if (r.inTime && r.inTime > '09:30:00') lateByDay[idx]++;
        }
      });

      const totalPres = presentByDay.reduce((a, b) => a + b, 0);
      const totalLate = lateByDay.reduce((a, b) => a + b, 0);

      return {
        categories,
        series: [
          { name: 'Present', data: presentByDay },
          { name: 'Late', data: lateByDay },
          { name: 'Absent', data: categories.map(() => 0) },
          { name: 'Leave', data: categories.map(() => 0) },
          { name: 'Overtime', data: categories.map(() => 0) }
        ],
        summary: {
          presentTotal: totalPres,
          lateTotal: totalLate,
          absentTotal: 0,
          leaveTotal: 0,
          overtimeHours: '0 hrs'
        }
      };
    } catch (err) {
      console.error('[attendanceService] Error loading analytics:', err);
      return this.getEmptyAnalytics(timeframe);
    }
  },

  getEmptyAnalytics(timeframe) {
    const categories = timeframe === 'today' 
      ? ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      categories,
      series: [
        { name: 'Present', data: categories.map(() => 0) },
        { name: 'Late', data: categories.map(() => 0) },
        { name: 'Absent', data: categories.map(() => 0) },
        { name: 'Leave', data: categories.map(() => 0) },
        { name: 'Overtime', data: categories.map(() => 0) }
      ],
      summary: {
        presentTotal: 0,
        lateTotal: 0,
        absentTotal: 0,
        leaveTotal: 0,
        overtimeHours: '0 hrs'
      }
    };
  },

  /**
   * Get regularisation requests pending from live database
   */
  async getRegularisationRequests() {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) return [];

      const tenantParam = activeTenantId ? `filter[tenant][tenantId][_eq]=${activeTenantId}&` : '';
      const res = await fetch(`${API_URL}/items/attendance?${tenantParam}filter[status][_eq]=pending&limit=10&fields=id,date,reason,employeeId.firstName,employeeId.lastName`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return (data.data || []).map(r => ({
          id: `REG-${r.id}`,
          employee: `${r.employeeId?.firstName || ''} ${r.employeeId?.lastName || ''}`.trim() || 'Employee',
          date: r.date || '—',
          reason: r.reason || 'Pending verification',
          status: 'Pending'
        }));
      }
    } catch (err) {
      console.warn('[attendanceService] getRegularisationRequests error:', err);
    }
    return [];
  }
};

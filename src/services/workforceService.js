import axios from 'axios';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const workforceService = {
  /**
   * Fetch aggregated workforce KPI metrics from live database
   */
  async getDashboardKPIs(filter = {}) {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return {
          totalEmployees: { value: 0, change: '0%', period: 'active', trend: 'neutral' },
          presentToday: { value: 0, rate: '0%', period: 'of workforce', trend: 'neutral' },
          currentlyOnSite: { value: 0, subtext: 'Live on-premise', trend: 'live' },
          attendanceRate: { value: '0%', change: '0%', period: 'compliance', trend: 'neutral' }
        };
      }

      // 1. Total Employees from personalModule
      let totalEmployeesCount = 0;
      try {
        let empUrl = `${API_URL}/items/personalModule?limit=1&aggregate[count]=id`;
        if (activeTenantId) {
          empUrl += `&filter[uniqueId][_icontains]=${encodeURIComponent(activeTenantId)}`;
        }
        let empRes = await fetch(empUrl, { headers: getHeaders() });
        if (!empRes.ok && activeTenantId) {
          empRes = await fetch(`${API_URL}/items/personalModule?limit=1&aggregate[count]=id`, { headers: getHeaders() });
        }
        if (empRes.ok) {
          const empData = await empRes.json();
          totalEmployeesCount = Number(empData?.data?.[0]?.count?.id) || 0;
        }
      } catch (e) {
        console.warn('[workforceService] Failed to fetch total employees count:', e);
      }

      // 2. Today's attendance from /items/attendance
      const today = new Date().toISOString().split('T')[0];
      let presentTodayCount = 0;
      try {
        let attUrl = `${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=1&aggregate[count]=id`;
        if (activeTenantId) {
          attUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
        }
        let attRes = await fetch(attUrl, { headers: getHeaders() });
        if (!attRes.ok && activeTenantId) {
          attRes = await fetch(`${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=1&aggregate[count]=id`, { headers: getHeaders() });
        }
        if (attRes.ok) {
          const attData = await attRes.json();
          presentTodayCount = Number(attData?.data?.[0]?.count?.id) || 0;
        }
      } catch (e) {
        console.warn('[workforceService] Failed to fetch today attendance:', e);
      }

      const presentRate = totalEmployeesCount > 0 
        ? ((presentTodayCount / totalEmployeesCount) * 100).toFixed(1) + '%' 
        : '0%';

      return {
        totalEmployees: { 
          value: totalEmployeesCount, 
          change: totalEmployeesCount > 0 ? `${totalEmployeesCount} enrolled` : '0', 
          period: 'in directory', 
          trend: 'up' 
        },
        presentToday: { 
          value: presentTodayCount, 
          rate: presentRate, 
          period: 'of workforce', 
          trend: presentTodayCount > 0 ? 'up' : 'neutral' 
        },
        currentlyOnSite: { 
          value: presentTodayCount, 
          subtext: 'Live on-premise', 
          trend: 'live' 
        },
        attendanceRate: { 
          value: presentRate, 
          change: presentTodayCount > 0 ? 'Normal' : '0%', 
          period: 'today', 
          trend: 'up' 
        }
      };
    } catch (error) {
      console.error('[workforceService] Error fetching KPIs:', error);
      return {
        totalEmployees: { value: 0, change: '0%', period: 'active', trend: 'neutral' },
        presentToday: { value: 0, rate: '0%', period: 'of workforce', trend: 'neutral' },
        currentlyOnSite: { value: 0, subtext: 'Live on-premise', trend: 'live' },
        attendanceRate: { value: '0%', change: '0%', period: 'compliance', trend: 'neutral' }
      };
    }
  },

  /**
   * Fetch workforce presence breakdown from live database
   */
  async getPresenceBreakdown(filter = {}) {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return { total: 0, onSite: 0, remote: 0, onLeave: 0, absent: 0, onSitePercentage: 0, departments: [] };
      }

      const today = new Date().toISOString().split('T')[0];

      // Fetch all employees for tenant
      let empUrl = `${API_URL}/items/personalModule?limit=-1&fields=id,status,department.id,department.departmentName`;
      if (activeTenantId) {
        empUrl += `&filter[uniqueId][_icontains]=${encodeURIComponent(activeTenantId)}`;
      }
      let empRes = await fetch(empUrl, { headers: getHeaders() });
      if (!empRes.ok && activeTenantId) {
        empRes = await fetch(`${API_URL}/items/personalModule?limit=-1&fields=id,status,department.id,department.departmentName`, { headers: getHeaders() });
      }
      const empData = empRes.ok ? await empRes.json() : { data: [] };
      const employees = empData.data || [];
      const total = employees.length;

      // Fetch today's attendance
      let attUrl = `${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=-1&fields=id,employeeId,status`;
      if (activeTenantId) {
        attUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
      }
      let attRes = await fetch(attUrl, { headers: getHeaders() });
      if (!attRes.ok && activeTenantId) {
        attRes = await fetch(`${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=-1&fields=id,employeeId,status`, { headers: getHeaders() });
      }
      const attData = attRes.ok ? await attRes.json() : { data: [] };
      const attendances = attData.data || [];

      const presentEmpIds = new Set();
      let onLeaveCount = 0;
      attendances.forEach(a => {
        const empId = typeof a.employeeId === 'object' ? a.employeeId?.id : a.employeeId;
        if (empId) presentEmpIds.add(String(empId));
        if (a.status && String(a.status).toLowerCase().includes('leave')) {
          onLeaveCount++;
        }
      });

      const onSite = presentEmpIds.size;
      const onLeave = onLeaveCount;
      const remote = 0;
      const absent = Math.max(0, total - onSite - onLeave - remote);
      const onSitePercentage = total > 0 ? Number(((onSite / total) * 100).toFixed(1)) : 0;

      // Group departments
      const deptMap = {};
      employees.forEach(e => {
        const deptName = e.department?.departmentName || 'General';
        if (!deptMap[deptName]) {
          deptMap[deptName] = { name: deptName, onSite: 0, remote: 0, total: 0 };
        }
        deptMap[deptName].total++;
        if (presentEmpIds.has(String(e.id))) {
          deptMap[deptName].onSite++;
        }
      });

      return {
        total,
        onSite,
        remote,
        onLeave,
        absent,
        onSitePercentage,
        departments: Object.values(deptMap)
      };
    } catch (err) {
      console.error('[workforceService] Error fetching presence breakdown:', err);
      return { total: 0, onSite: 0, remote: 0, onLeave: 0, absent: 0, onSitePercentage: 0, departments: [] };
    }
  },

  /**
   * Fetch filter options dynamically from tenant collections
   */
  async getFilterOptions() {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return { organizations: [], sites: [], departments: [], teams: [], shifts: [] };
      }

      const tenantParam = activeTenantId ? `filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}` : '';

      // 1. Departments
      let deptRes = await fetch(`${API_URL}/items/department?${tenantParam}&limit=-1&fields=id,departmentName`, {
        headers: getHeaders()
      });
      if (!deptRes.ok && activeTenantId) {
        deptRes = await fetch(`${API_URL}/items/department?limit=-1&fields=id,departmentName`, { headers: getHeaders() });
      }
      const deptData = deptRes.ok ? await deptRes.json() : { data: [] };
      const departments = (deptData.data || [])
        .filter(d => d.departmentName)
        .map(d => ({ id: d.id, name: d.departmentName }));

      // 2. Sites / Locations
      let siteRes = await fetch(`${API_URL}/items/locationManagement?${tenantParam}&limit=-1&fields=id,locName`, {
        headers: getHeaders()
      });
      if (!siteRes.ok && activeTenantId) {
        siteRes = await fetch(`${API_URL}/items/locationManagement?limit=-1&fields=id,locName`, { headers: getHeaders() });
      }
      const siteData = siteRes.ok ? await siteRes.json() : { data: [] };
      const sites = (siteData.data || [])
        .filter(s => s.locName)
        .map(s => ({ id: s.id, name: s.locName }));

      // 3. Access Levels / Teams
      let grpRes = await fetch(`${API_URL}/items/accesslevels?${tenantParam}&limit=-1&fields=id,accessLevelName`, {
        headers: getHeaders()
      });
      if (!grpRes.ok && activeTenantId) {
        grpRes = await fetch(`${API_URL}/items/accesslevels?limit=-1&fields=id,accessLevelName`, { headers: getHeaders() });
      }
      const grpData = grpRes.ok ? await grpRes.json() : { data: [] };
      const teams = (grpData.data || [])
        .filter(g => g.accessLevelName)
        .map(g => ({ id: g.id, name: g.accessLevelName }));

      // 4. Shifts / Attendance Cycle
      let shiftRes = await fetch(`${API_URL}/items/attendanceCycle?${tenantParam}&limit=-1&fields=id,name`, {
        headers: getHeaders()
      });
      if (!shiftRes.ok && activeTenantId) {
        shiftRes = await fetch(`${API_URL}/items/attendanceCycle?limit=-1&fields=id,name`, { headers: getHeaders() });
      }
      const shiftData = shiftRes.ok ? await shiftRes.json() : { data: [] };
      const shifts = (shiftData.data || [])
        .filter(s => s.name)
        .map(s => ({ id: s.id, name: s.name }));

      return {
        organizations: activeTenantId ? [{ id: activeTenantId, name: 'Current Organization' }] : [],
        sites: [{ id: 'all', name: 'All Sites' }, ...sites],
        departments: [{ id: 'all', name: 'All Departments' }, ...departments],
        teams: [{ id: 'all', name: 'All Access Groups' }, ...teams],
        shifts: [{ id: 'all', name: 'All Shifts' }, ...shifts]
      };
    } catch (err) {
      console.error('[workforceService] Error fetching filter options:', err);
      return { organizations: [], sites: [], departments: [], teams: [], shifts: [] };
    }
  }
};

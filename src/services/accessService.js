import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const accessService = {
  /**
   * Get overall access control counts from live database
   */
  async getAccessOverview() {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return {
          granted: 0,
          denied: 0,
          suspicious: 0,
          equipment: {
            doors: { online: 0, offline: 0, total: 0 },
            turnstiles: { online: 0, offline: 0, total: 0 },
            controllers: { online: 0, offline: 0, total: 0 }
          }
        };
      }

      const tenantParam = activeTenantId ? `filter[tenant][tenantId][_eq]=${activeTenantId}` : '';

      // 1. Fetch doors
      let totalDoors = 0;
      try {
        let dUrl = `${API_URL}/items/doors?limit=-1&fields=id`;
        if (activeTenantId) {
          dUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
        }
        let dRes = await fetch(dUrl, { headers: getHeaders() });
        if (!dRes.ok && activeTenantId) {
          dRes = await fetch(`${API_URL}/items/doors?limit=-1&fields=id`, { headers: getHeaders() });
        }
        if (dRes.ok) {
          const dData = await dRes.json();
          totalDoors = (dData.data || []).length;
        }
      } catch (e) {
        console.warn('[accessService] error loading doors:', e);
      }

      // 2. Fetch controllers
      let totalControllers = 0;
      let onlineControllers = 0;
      try {
        let cUrl = `${API_URL}/items/controllers?limit=-1&fields=id,status,controllerStatus`;
        if (activeTenantId) {
          cUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
        }
        let cRes = await fetch(cUrl, { headers: getHeaders() });
        if (!cRes.ok && activeTenantId) {
          cRes = await fetch(`${API_URL}/items/controllers?limit=-1&fields=id,status,controllerStatus`, { headers: getHeaders() });
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          const ctrls = cData.data || [];
          totalControllers = ctrls.length;
          onlineControllers = ctrls.filter(c => 
            String(c.status).toLowerCase() === 'online' || 
            String(c.status).toLowerCase() === 'approved' || 
            String(c.controllerStatus).toLowerCase() === 'online' ||
            c.status === 1
          ).length;
        }
      } catch (e) {
        console.warn('[accessService] error loading controllers:', e);
      }

      // 3. Today's attendance events (granted vs denied)
      const today = new Date().toISOString().split('T')[0];
      let grantedCount = 0;
      let deniedCount = 0;
      try {
        let attUrl = `${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=-1&fields=id,status`;
        if (activeTenantId) {
          attUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
        }
        let attRes = await fetch(attUrl, { headers: getHeaders() });
        if (!attRes.ok && activeTenantId) {
          attRes = await fetch(`${API_URL}/items/attendance?filter[date][_eq]=${today}&limit=-1&fields=id,status`, { headers: getHeaders() });
        }
        if (attRes.ok) {
          const attData = await attRes.json();
          const logs = attData.data || [];
          grantedCount = logs.length;
        }
      } catch (e) {
        console.warn('[accessService] error loading access events:', e);
      }

      return {
        granted: grantedCount,
        denied: deniedCount,
        suspicious: 0,
        equipment: {
          doors: { online: totalDoors, offline: 0, total: totalDoors },
          turnstiles: { online: 0, offline: 0, total: 0 },
          controllers: { online: onlineControllers, offline: Math.max(0, totalControllers - onlineControllers), total: totalControllers }
        }
      };
    } catch (err) {
      console.error('[accessService] Error getting access overview:', err);
      return {
        granted: 0,
        denied: 0,
        suspicious: 0,
        equipment: {
          doors: { online: 0, offline: 0, total: 0 },
          turnstiles: { online: 0, offline: 0, total: 0 },
          controllers: { online: 0, offline: 0, total: 0 }
        }
      };
    }
  },

  /**
   * Get initial live access events stream from real logs
   */
  async getLiveEvents({ limit = 15 } = {}) {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) return [];

      const today = new Date().toISOString().split('T')[0];

      let attUrl = `${API_URL}/items/attendance?filter[date][_eq]=${today}&sort[]=-id&limit=${limit}&fields=id,inTime,outTime,status,location,employeeId.id,employeeId.employeeId,employeeId.assignedUser.first_name,employeeId.assignedUser.last_name,employeeId.department.departmentName`;
      if (activeTenantId) {
        attUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
      }

      let res = await fetch(attUrl, { headers: getHeaders() });
      if (!res.ok && activeTenantId) {
        res = await fetch(`${API_URL}/items/attendance?filter[date][_eq]=${today}&sort[]=-id&limit=${limit}&fields=id,inTime,outTime,status,location,employeeId.id,employeeId.employeeId,employeeId.assignedUser.first_name,employeeId.assignedUser.last_name,employeeId.department.departmentName`, { headers: getHeaders() });
      }

      if (res.ok) {
        const data = await res.json();
        return (data.data || []).map(r => {
          const empName = `${r.employeeId?.assignedUser?.first_name || ''} ${r.employeeId?.assignedUser?.last_name || ''}`.trim() || `User #${r.employeeId?.employeeId || r.employeeId?.id || r.id}`;
          return {
            id: `ACC-${r.id}`,
            time: r.inTime || r.outTime || '—',
            employee: empName,
            department: r.employeeId?.department?.departmentName || 'Operations',
            location: typeof r.location === 'string' ? r.location : 'Main Gate',
            method: 'RFID / Biometric',
            result: r.status === 'denied' ? 'Denied' : 'Granted',
            avatar: null
          };
        });
      }
    } catch (err) {
      console.warn('[accessService] getLiveEvents error:', err);
    }
    return [];
  }
};

import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const deviceService = {
  /**
   * Get equipment and device statuses from live controllers & doors
   */
  async getDevices({ category = 'all', status = 'all' } = {}) {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) return [];

      let url = `${API_URL}/items/controllers?limit=-1&fields=id,sn,controllerName,controllerIP,status,controllerStatus,controllerType,date_updated`;
      if (activeTenantId) {
        url += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
      }

      let res = await fetch(url, { headers: getHeaders() });
      if (!res.ok && activeTenantId) {
        res = await fetch(`${API_URL}/items/controllers?limit=-1&fields=id,sn,controllerName,controllerIP,status,controllerStatus,controllerType,date_updated`, { headers: getHeaders() });
      }

      if (!res.ok) return [];

      const data = await res.json();
      const rawList = data.data || [];

      const devices = rawList.map(d => ({
        id: `DEV-${d.id || d.sn}`,
        name: d.controllerName || `Controller ${d.sn || d.id}`,
        type: d.controllerType === 2 ? 'Face Terminal' : (d.controllerType === 3 ? 'Fingerprint Terminal' : 'Door Controller'),
        ip: d.controllerIP || '—',
        status: String(d.status).toLowerCase() === 'online' || String(d.status).toLowerCase() === 'approved' || String(d.controllerStatus).toLowerCase() === 'online' || d.status === 1 ? 'Online' : 'Offline',
        firmware: 'v1.0',
        syncStatus: 'Synced',
        lastHeartbeat: d.date_updated ? new Date(d.date_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
      }));

      let filtered = [...devices];
      if (status !== 'all') {
        filtered = filtered.filter(d => d.status.toLowerCase() === status.toLowerCase());
      }
      return filtered;
    } catch (err) {
      console.error('[deviceService] Error getting devices:', err);
      return [];
    }
  },

  /**
   * Register a new access device
   */
  async registerDevice(payload) {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(`${API_URL}/items/controllers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify({
        name: payload.name,
        ip: payload.ip,
        sn: payload.uuid || `SN-${Date.now()}`,
        tenant: activeTenantId
      })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.errors?.[0]?.message || 'Failed to register device');
    }
    return await res.json();
  }
};

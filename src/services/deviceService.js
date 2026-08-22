import { authService } from "@/services/authService";

class DeviceService {
  getDefaultDevices() {
    return [];
  }

  /**
   * Fetch all registered guard patrol devices
   */
  async fetchDevices(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      try {
        let endpoint = `/items/patrol_devices?filter[tenant][_eq]=${tenantId}&sort=-last_heartbeat`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const res = await authService.protectedApi.get(endpoint);
        if (res.data?.data) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_devices_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(d => String(d.site) === String(siteId));
          return list;
        } catch (e) {}
      }

      return [];
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  }

  /**
   * Register a new device
   */
  async registerDevice(deviceData) {
    try {
      const tenantId = authService.getTenantId();
      const list = await this.fetchDevices();
      const newDev = {
        id: `dev-${Date.now()}`,
        tenant: tenantId,
        last_heartbeat: new Date().toISOString(),
        status: "online",
        battery_level: 100,
        ...deviceData
      };
      list.push(newDev);
      localStorage.setItem(`accesseasy_devices_${tenantId}`, JSON.stringify(list));
      return newDev;
    } catch (error) {
      console.error("Error registering device:", error);
      throw error;
    }
  }

  /**
   * Remote Unlink / Wipe device authorization
   */
  async unlinkDevice(deviceId) {
    try {
      const tenantId = authService.getTenantId();
      const list = await this.fetchDevices();
      const filtered = list.filter(d => String(d.id) !== String(deviceId));
      localStorage.setItem(`accesseasy_devices_${tenantId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error unlinking device:", error);
      throw error;
    }
  }
}

export const deviceService = new DeviceService();

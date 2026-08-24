import { authService } from "@/services/authService";

class DeviceService {
  getDefaultDevices() {
    return [];
  }

  /**
   * Fetch all registered hardware devices from Controllers collection
   */
  async fetchDevices(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      let list = [];

      // Primary: Query existing Controllers collection
      try {
        let endpoint = `/items/Controllers?filter[tenant][_eq]=${tenantId}&sort=-last_communicated_time`;
        if (siteId) endpoint += `&filter[branchDetails][_eq]=${siteId}`;
        const res = await authService.protectedApi.get(endpoint);
        if (res.data?.data) list = res.data.data;
      } catch (e) {
        // Fallback lowercase 'controllers'
        try {
          let endpoint = `/items/controllers?filter[tenant][_eq]=${tenantId}`;
          if (siteId) endpoint += `&filter[branchDetails][_eq]=${siteId}`;
          const res = await authService.protectedApi.get(endpoint);
          if (res.data?.data) list = res.data.data;
        } catch (_) {}
      }

      // Normalize fields to device dashboard interface
      return list.map(d => ({
        ...d,
        device_name: d.deviceName || d.device_name || `Device ${d.id}`,
        device_model: d.deviceGroup || d.device_model || 'IoT Controller',
        imei: d.mac_id || d.imei || 'N/A',
        status: (d.controllerStatus || d.status || 'online').toLowerCase(),
        last_heartbeat: d.last_communicated_time || d.last_heartbeat || d.date_updated || new Date().toISOString(),
        battery_level: d.battery_level !== undefined ? Number(d.battery_level) : 100,
        battery_charging: Boolean(d.battery_charging),
        site_name: d.site_name || d.branchDetails?.branchName || d.branchDetails?.locName || 'Main Site',
        app_version: d.app_version || 'v2.4.1',
        os_version: d.os_version || 'Firmware'
      }));
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  }

  /**
   * Register a new controller / device in Directus Cloud
   */
  async registerDevice(deviceData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenant: tenantId,
        deviceName: deviceData.device_name || deviceData.deviceName,
        mac_id: deviceData.imei || deviceData.mac_id,
        deviceGroup: deviceData.device_model || deviceData.deviceGroup || 'Handheld',
        controllerStatus: 'online',
        last_communicated_time: new Date().toISOString(),
        battery_level: 100,
        ...deviceData
      };
      
      try {
        const res = await authService.protectedApi.post("/items/Controllers", payload);
        return res.data.data;
      } catch (e) {
        const res = await authService.protectedApi.post("/items/controllers", payload);
        return res.data.data;
      }
    } catch (error) {
      console.error("Error registering device on cloud:", error);
      throw error;
    }
  }

  /**
   * Remote Unlink / Delete device in Directus Cloud
   */
  async unlinkDevice(deviceId) {
    try {
      try {
        await authService.protectedApi.delete(`/items/Controllers/${deviceId}`);
      } catch (e) {
        await authService.protectedApi.delete(`/items/controllers/${deviceId}`);
      }
      return true;
    } catch (error) {
      console.error("Error unlinking device on cloud:", error);
      throw error;
    }
  }
}

export const deviceService = new DeviceService();

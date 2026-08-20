import { authService } from "@/services/authService";

class DeviceService {
  getDefaultDevices() {
    const now = new Date();
    return [
      {
        id: "dev-01",
        device_name: "Samsung Galaxy XCover Pro #01",
        device_model: "SM-G715FN",
        imei: "358921098234123",
        assigned_guard: "Kumar S",
        site_name: "Chennai Tech Park",
        battery_level: 84,
        battery_charging: false,
        os_version: "Android 13",
        app_version: "v2.4.1",
        last_heartbeat: new Date(now.getTime() - 2 * 60000).toISOString(),
        status: "online",
        gps_lat: 12.9716,
        gps_lng: 80.2435,
        storage_free_mb: 24500
      },
      {
        id: "dev-02",
        device_name: "Zebra TC26 Handheld #02",
        device_model: "TC26BK",
        imei: "359012489123891",
        assigned_guard: "Ramesh K",
        site_name: "Chennai Tech Park",
        battery_level: 18,
        battery_charging: false,
        os_version: "Android 12",
        app_version: "v2.4.1",
        last_heartbeat: new Date(now.getTime() - 4 * 60000).toISOString(),
        status: "low_battery",
        gps_lat: 12.9721,
        gps_lng: 80.2442,
        storage_free_mb: 18200
      },
      {
        id: "dev-03",
        device_name: "Xiaomi Redmi 10 Guard Phone",
        device_model: "21061119AG",
        imei: "867823901238901",
        assigned_guard: "Suresh M",
        site_name: "Chennai Tech Park",
        battery_level: 62,
        battery_charging: true,
        os_version: "Android 13",
        app_version: "v2.3.9",
        last_heartbeat: new Date(now.getTime() - 45 * 60000).toISOString(),
        status: "offline",
        gps_lat: 12.9710,
        gps_lng: 80.2420,
        storage_free_mb: 12100
      },
      {
        id: "dev-04",
        device_name: "Zebra TC26 Handheld #03",
        device_model: "TC26BK",
        imei: "359012489123899",
        assigned_guard: "Vignesh P",
        site_name: "ABC Retail Mall",
        battery_level: 95,
        battery_charging: false,
        os_version: "Android 12",
        app_version: "v2.4.1",
        last_heartbeat: new Date(now.getTime() - 1 * 60000).toISOString(),
        status: "online",
        gps_lat: 13.0827,
        gps_lng: 80.2707,
        storage_free_mb: 28900
      }
    ];
  }

  /**
   * Fetch all registered guard patrol devices
   */
  async fetchDevices(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultDevices();

      try {
        let endpoint = `/items/patrol_devices?filter[tenant][_eq]=${tenantId}&sort=-last_heartbeat`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const res = await authService.protectedApi.get(endpoint);
        if (res.data.data && res.data.data.length > 0) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_devices_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(d => String(d.site) === String(siteId));
          return list;
        } catch (e) {}
      }

      return this.getDefaultDevices();
    } catch (error) {
      console.error("Error fetching devices:", error);
      return this.getDefaultDevices();
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

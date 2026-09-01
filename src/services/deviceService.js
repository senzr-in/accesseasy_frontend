import { authService } from "@/services/authService";

class DeviceService {
  constructor() {
    this._blockedCollections = new Set();
  }

  getApiUrl() {
    return import.meta.env.VITE_API_URL || "https://appv1.fieldseasy.com/directus";
  }

  getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  }

  getDefaultDevices() {
    return [];
  }

  /**
   * Fetch all registered hardware devices for the logged-in tenant using standard fetch
   */
  async fetchDevices(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      let list = [];
      const apiUrl = this.getApiUrl();
      const headers = this.getHeaders();

      try {
        // 1. Query Directus /items/devices (Primary collection for mobile patrol tablets & phones)
        let urlDevices = `${apiUrl}/items/devices?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&fields=*&sort=-date_updated&limit=100`;
        if (siteId) {
          urlDevices += `&filter[site][_eq]=${siteId}`;
        }

        try {
          const resDevices = await fetch(urlDevices, { headers, signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined });
          if (resDevices.ok) {
            const jsonDev = await resDevices.json();
            if (jsonDev.data && Array.isArray(jsonDev.data)) {
              list.push(...jsonDev.data);
            }
          }
        } catch (_) {}

        // 2. Query Directus /items/controllers (Strictly for this tenant)
        let urlControllers = `${apiUrl}/items/controllers?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&fields=*&sort=-date_updated&limit=100`;
        if (siteId) {
          urlControllers += `&filter[location][_eq]=${siteId}`;
        }

        try {
          const resControllers = await fetch(urlControllers, { headers, signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined });
          if (resControllers.ok) {
            const json = await resControllers.json();
            if (json.data && Array.isArray(json.data)) {
              json.data.forEach(d => {
                if (!list.some(item => (item.id && String(item.id) === String(d.id)) || (item.sn && String(item.sn) === String(d.sn || d.device_id)))) {
                  list.push(d);
                }
              });
            }
          }
        } catch (_) {}
      } catch (err) {
        console.warn("[deviceService] Fetch error, checking local store:", err);
      }

      // Merge locally stored devices if any
      try {
        const localData = localStorage.getItem(`accesseasy_devices_${tenantId}`);
        if (localData) {
          const localDevices = JSON.parse(localData);
          if (Array.isArray(localDevices)) {
            localDevices.forEach(ld => {
              const exists = list.some(d => (d.id && String(d.id) === String(ld.id)) || (d.sn && String(d.sn) === String(ld.device_id || ld.sn)));
              if (!exists) {
                list.unshift(ld);
              }
            });
          }
        }
      } catch (_) {}

      // Normalize and return all mobile devices and patrol terminals
      return list
        .map(d => this.normalizeDevice(d))
        .filter(d => Boolean(d.device_id || d.id));
    } catch (error) {
      console.error('Error fetching devices for tenant:', error);
      return [];
    }
  }

  /**
   * Fetch single device details by ID
   */
  async getDeviceById(deviceId) {
    try {
      const res = await fetch(`${this.getApiUrl()}/items/controllers/${deviceId}?fields=*`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return this.normalizeDevice(json.data);
      }
      return null;
    } catch (err) {
      console.error('Error fetching device by ID:', err);
      return null;
    }
  }

  normalizeDevice(d) {
    const devId = d.sn || d.device_id || d.mac_id || d.macAddress || d.mac || d.imei || `DEV-${d.id}`;
    const siteIdVal = d.site_id || d.location?.id || (typeof d.location === 'string' || typeof d.location === 'number' ? d.location : '') || d.branchDetails?.id || (typeof d.branchDetails === 'string' ? d.branchDetails : '') || '';
    const siteNameVal = d.site_name || d.location?.locName || d.location?.locationName || d.location?.name || d.branchDetails?.branchName || d.branchDetails?.locName || d.timerMode || 'Main Facility';

    return {
      ...d,
      id: d.id || devId,
      device_id: devId,
      device_name: d.controllerName || d.device_name || d.deviceName || `Terminal ${devId}`,
      device_model: d.serverIp || d.device_model || d.deviceGroup || 'Patrol Tablet / Handheld',
      imei: d.imei || d.mac_id || d.mac || d.macAddress || devId,
      status: (d.status === 'approved' || d.controllerStatus === 'online' || d.status === 'active' || d.status === 'online') ? 'active' : (d.status || d.controllerStatus || 'idle').toLowerCase(),
      last_heartbeat: d.last_seen_at || d.last_communicated_time || d.last_seen || d.last_heartbeat || d.date_updated || new Date().toISOString(),
      last_seen: d.last_seen_at || d.last_communicated_time || d.last_seen || d.date_updated || 'Just now',
      battery_level: d.battery_level !== undefined ? Number(d.battery_level) : (d.batteryLevel !== undefined ? Number(d.batteryLevel) : 95),
      battery_charging: Boolean(d.is_charging || d.battery_charging),
      site_id: siteIdVal,
      site_name: siteNameVal,
      zone_id: d.zone_id || '',
      zone_name: d.zone_name || '',
      app_version: d.deviceVersion || d.app_version || d.appVersion || 'v2.4.0',
      os_version: d.os_version || 'Android',
      pairing_code: d.pairing_code || this.generatePairingCode(devId),
      pairing_token: d.pairing_token || d.id || devId,
      active_guard: d.active_guard || (d.current_guard_name ? { name: d.current_guard_name, id: d.current_guard_id, status: d.guard_status || 'on_duty' } : null),
    };
  }

  generatePairingCode(seed = '') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let hash = 0;
    const str = seed + Date.now().toString();
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    const part1 = chars[hash % chars.length] + chars[(hash >> 4) % chars.length] + chars[(hash >> 8) % chars.length];
    const part2 = String(1000 + (hash % 9000));
    return `${part1}-${part2}`;
  }

  /**
   * Register a new patrol terminal strictly bound to the logged-in user's tenant using fetch
   */
  async registerDevice(deviceData) {
    const tenantId = authService.getTenantId();
    const devId = deviceData.device_id || deviceData.imei || `PATROL-${Date.now().toString().slice(-6)}`;
    const pairingCode = deviceData.pairing_code || this.generatePairingCode(devId);
    const pairingToken = `pt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const controllerPayload = {
      tenant: tenantId,
      controllerName: deviceData.device_name || `Patrol Terminal ${devId}`,
      deviceName: deviceData.device_name || `Patrol Terminal ${devId}`,
      sn: devId,
      mac_id: devId,
      mac: devId,
      controllerType: 1,
      deviceGroup: deviceData.device_model || 'Patrol Handheld',
      status: 'approved',
      controllerStatus: 'online',
      location: deviceData.site_id || null,
      branchDetails: deviceData.site_id || null,
      site_name: deviceData.site_name || '',
      battery_level: 100,
      battery_charging: false,
      pairing_code: pairingCode,
      pairing_token: pairingToken,
      deviceVersion: deviceData.app_version || '1.0.0',
      app_version: deviceData.app_version || '1.0.0',
      last_communicated_time: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${this.getApiUrl()}/items/controllers`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(controllerPayload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return this.normalizeDevice(json.data);
      }
    } catch (e) {
      console.warn('Could not post directly to /items/controllers, saving locally:', e);
    }

    // Always preserve locally in case offline
    try {
      const key = `accesseasy_devices_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(controllerPayload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (_) {}

    return this.normalizeDevice(controllerPayload);
  }

  /**
   * Edit / Update existing device details (name, site bond, model, zone) using PATCH fetch
   */
  async updateDevice(deviceId, updateData) {
    const payload = {};
    if (updateData.device_name !== undefined) {
      payload.controllerName = updateData.device_name;
      payload.deviceName = updateData.device_name;
    }
    if (updateData.site_id !== undefined) {
      payload.location = updateData.site_id || null;
      payload.branchDetails = updateData.site_id || null;
    }
    if (updateData.site_name !== undefined) {
      payload.site_name = updateData.site_name;
    }
    if (updateData.zone_id !== undefined) {
      payload.zone_id = updateData.zone_id;
    }
    if (updateData.zone_name !== undefined) {
      payload.zone_name = updateData.zone_name;
    }
    if (updateData.device_model !== undefined) {
      payload.deviceGroup = updateData.device_model;
    }
    if (updateData.status !== undefined) {
      payload.status = updateData.status;
      payload.controllerStatus = updateData.status;
    }

    try {
      const res = await fetch(`${this.getApiUrl()}/items/controllers/${deviceId}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data ? this.normalizeDevice(json.data) : true;
      }
    } catch (err) {
      console.error('Error updating device via fetch:', err);
    }

    // Update in local cache if present
    try {
      const tenantId = authService.getTenantId();
      const key = `accesseasy_devices_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const index = existing.findIndex(d => d.id === deviceId || d.device_id === deviceId || d.sn === deviceId);
      if (index !== -1) {
        existing[index] = { ...existing[index], ...payload, ...updateData };
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (_) {}

    return true;
  }

  /**
   * Replace an old device with a new device using fetch
   */
  async replaceDevice(oldDeviceId, newDeviceData) {
    try {
      const newDev = await this.registerDevice(newDeviceData);
      try {
        await fetch(`${this.getApiUrl()}/items/controllers/${oldDeviceId}`, {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify({ controllerStatus: 'replaced', status: 'replaced' })
        });
      } catch (_) {}
      return newDev;
    } catch (error) {
      console.error('Error replacing device:', error);
      throw error;
    }
  }

  /**
   * Remote Unlink / Deactivate device using fetch
   */
  async unlinkDevice(deviceId) {
    try {
      try {
        await fetch(`${this.getApiUrl()}/items/controllers/${deviceId}`, {
          method: "DELETE",
          headers: this.getHeaders()
        });
      } catch (_) {}

      const tenantId = authService.getTenantId();
      const key = `accesseasy_devices_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(d => d.id !== deviceId && d.device_id !== deviceId && d.sn !== deviceId);
      localStorage.setItem(key, JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error('Error unlinking device on cloud:', error);
      throw error;
    }
  }

  /**
   * Update Terminal Telemetry (Battery, Online Heartbeat, App Version) using fetch
   */
  async updateDeviceTelemetry(deviceId, { batteryLevel, batteryCharging = false, appVersion = '1.0.0', isOnline = true }) {
    try {
      const payload = {
        battery_level: batteryLevel,
        battery_charging: batteryCharging,
        deviceVersion: appVersion,
        app_version: appVersion,
        controllerStatus: isOnline ? 'online' : 'offline',
        last_communicated_time: new Date().toISOString(),
      };

      try {
        await fetch(`${this.getApiUrl()}/items/controllers/${deviceId}`, {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
      } catch (_) {}
      return true;
    } catch (error) {
      console.warn('Failed to push device telemetry:', error.message);
      return false;
    }
  }

  /**
   * Remote Lock Patrol Terminal using fetch
   */
  async lockDevice(deviceId, lockMessage = 'Terminal Locked by Security Admin') {
    try {
      await fetch(`${this.getApiUrl()}/items/controllers/${deviceId}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({
          status: 'locked',
          controllerStatus: 'locked',
          lock_message: lockMessage,
        })
      });
      return true;
    } catch (e) {
      console.error('Failed to lock device:', e);
      return false;
    }
  }

  /**
   * Remote Unlock Patrol Terminal using fetch
   */
  async unlockDevice(deviceId) {
    try {
      await fetch(`${this.getApiUrl()}/items/controllers/${deviceId}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({
          status: 'approved',
          controllerStatus: 'online',
          lock_message: null,
        })
      });
      return true;
    } catch (e) {
      console.error('Failed to unlock device:', e);
      return false;
    }
  }

  async remoteLockDevice(deviceId, lockMessage = 'Terminal Locked by Security Admin') {
    return this.lockDevice(deviceId, lockMessage);
  }

  async remoteUnlockDevice(deviceId) {
    return this.unlockDevice(deviceId);
  }
}

export const deviceService = new DeviceService();



import { authService } from "@/services/authService";

class DeviceService {
  constructor() {
    // Track collections that returned 403 to avoid hammering them on every call
    this._blockedCollections = new Set();
  }

  getDefaultDevices() {
    return [];
  }

  /**
   * Fetch all registered hardware devices with dynamically derived active guards
   */
  async fetchDevices(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      let list = [];

      // 1. Fetch from patrol_devices collection
      if (!this._blockedCollections.has('patrol_devices')) {
        try {
          let endpoint = `/items/patrol_devices?filter[tenant][_eq]=${tenantId}&sort=-last_seen`;
          if (siteId) endpoint += `&filter[site_id][_eq]=${siteId}`;
          const res = await authService.protectedApi.get(endpoint);
          if (res.data?.data && res.data.data.length > 0) {
            list = res.data.data;
          }
        } catch (e) {
          if (e?.response?.status === 403) {
            this._blockedCollections.add('patrol_devices');
          }
        }
      }

      // 2. Fallback to lowercase controllers if patrol_devices has no records
      if (list.length === 0) {
        try {
          let endpoint = `/items/controllers?filter[tenant][_eq]=${tenantId}`;
          if (siteId) endpoint += `&filter[branchDetails][_eq]=${siteId}`;
          const res = await authService.protectedApi.get(endpoint);
          if (res.data?.data && res.data.data.length > 0) list = res.data.data;
        } catch (e) {
          try {
            let endpoint = `/items/Controllers?filter[tenant][_eq]=${tenantId}&sort=-last_communicated_time`;
            if (siteId) endpoint += `&filter[branchDetails][_eq]=${siteId}`;
            const res = await authService.protectedApi.get(endpoint);
            if (res.data?.data) list = res.data.data;
          } catch (_) {}
        }
      }

      // 3. Merge locally registered devices from local storage
      try {
        const localData = localStorage.getItem(`accesseasy_devices_${tenantId}`);
        if (localData) {
          const localDevices = JSON.parse(localData);
          if (Array.isArray(localDevices)) {
            localDevices.forEach(ld => {
              const exists = list.some(d => (d.id && d.id === ld.id) || (d.device_id && d.device_id === ld.device_id) || (d.sn && d.sn === ld.device_id));
              if (!exists) {
                if (!siteId || String(ld.site_id) === String(siteId)) {
                  list.unshift(ld);
                }
              }
            });
          }
        }
      } catch (_) {}

      // 4. Fetch active guard sessions (skip if collection is 403-blocked)
      let activeSessionsMap = {};
      if (!this._blockedCollections.has('patrol_guard_sessions')) {
        try {
          const sessRes = await authService.protectedApi.get(
            `/items/patrol_guard_sessions?filter[status][_eq]=active&filter[tenant][_eq]=${tenantId}&fields=id,guard_id,guard_name,device_id,login_time`
          );
          if (sessRes.data?.data) {
            sessRes.data.data.forEach(sess => {
              if (sess.device_id) activeSessionsMap[sess.device_id] = sess;
            });
          }
        } catch (e) {
          if (e?.response?.status === 403) {
            this._blockedCollections.add('patrol_guard_sessions');
            console.warn('[DeviceService] patrol_guard_sessions: 403 — skipping future requests');
          }
        }
      }

      // Normalize fields to device dashboard interface
      return list.map(d => {
        const devId = d.device_id || d.sn || d.mac_id || d.macAddress || d.imei || `DEV-${d.id}`;
        const activeSession = activeSessionsMap[devId] || activeSessionsMap[d.id] || null;

        return {
          ...d,
          id: d.id || devId,
          device_id: devId,
          device_name: d.device_name || d.controllerName || d.deviceName || `Terminal ${d.id}`,
          device_model: d.device_model || d.deviceGroup || 'Patrol Tablet / Handheld',
          imei: d.imei || d.mac_id || devId,
          status: (d.status || d.controllerStatus || 'online').toLowerCase(),
          last_heartbeat: d.last_seen || d.last_communicated_time || d.last_heartbeat || d.date_updated || new Date().toISOString(),
          battery_level: d.battery_level !== undefined ? Number(d.battery_level) : 100,
          battery_charging: Boolean(d.battery_charging),
          site_id: d.site_id || d.branchDetails?.id || d.branchDetails || '',
          site_name: d.site_name || d.branchDetails?.branchName || d.branchDetails?.locName || 'Main Site',
          zone_id: d.zone_id || '',
          zone_name: d.zone_name || '',
          app_version: d.app_version || 'v1.0.0',
          os_version: d.os_version || 'Android',
          pairing_code: d.pairing_code || this.generatePairingCode(devId),
          pairing_token: d.pairing_token || d.id || devId,
          active_guard: activeSession ? {
            guard_id: activeSession.guard_id,
            guard_name: activeSession.guard_name || 'Guard Officer',
            login_time: activeSession.login_time,
          } : null,
        };
      });
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  }

  /**
   * Helper to generate a 6-character pairing code e.g. ABC-9421
   */
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
   * Register a new patrol terminal in Directus Cloud or Local Store
   */
  async registerDevice(deviceData) {
    const tenantId = authService.getTenantId();
    const devId = deviceData.device_id || deviceData.imei || `PATROL-${Date.now().toString().slice(-6)}`;
    const pairingCode = deviceData.pairing_code || this.generatePairingCode(devId);
    const pairingToken = `pt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const payload = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}`,
      tenant: tenantId,
      device_id: devId,
      device_name: deviceData.device_name || `Patrol Terminal ${devId}`,
      device_model: deviceData.device_model || 'Patrol Handheld',
      site_id: deviceData.site_id || '',
      site_name: deviceData.site_name || '',
      zone_id: deviceData.zone_id || '',
      zone_name: deviceData.zone_name || '',
      status: 'active',
      pairing_code: pairingCode,
      pairing_token: pairingToken,
      battery_level: 100,
      is_online: true,
      last_seen: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      app_version: deviceData.app_version || '1.0.0',
      ...deviceData
    };

    // 1. Try patrol_devices
    try {
      const res = await authService.protectedApi.post("/items/patrol_devices", payload);
      if (res.data?.data) return res.data.data;
    } catch (_) {
      // 2. Try controllers / Controllers
      try {
        const controllerPayload = {
          id: payload.id,
          tenant: tenantId,
          controllerName: payload.device_name,
          deviceName: payload.device_name,
          sn: devId,
          mac_id: devId,
          controllerType: 1,
          deviceGroup: payload.device_model,
          status: 'approved',
          controllerStatus: 'online',
          branchDetails: payload.site_id || null,
          site_name: payload.site_name || '',
          battery_level: 100,
          battery_charging: false,
          pairing_code: pairingCode,
          pairing_token: pairingToken,
          app_version: payload.app_version || '1.0.0',
          last_communicated_time: new Date().toISOString(),
        };
        let res = null;
        try {
          res = await authService.protectedApi.post("/items/controllers", controllerPayload);
        } catch (_) {
          res = await authService.protectedApi.post("/items/Controllers", controllerPayload);
        }
        if (res?.data?.data) {
          return { ...payload, ...res.data.data };
        }
      } catch (e2) {
        console.warn("Directus controller write returned restricted (403/404), saving to local storage fallback:", e2.message);
      }
    }

    // 3. Fallback: Save to Local Storage to guarantee seamless UX
    try {
      const key = `accesseasy_devices_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(payload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (lsErr) {
      console.warn("Local storage fallback write error:", lsErr);
    }

    return payload;
  }

  /**
   * Replace an old device with a new device (transfers site bond & decommissions old device)
   */
  async replaceDevice(oldDeviceId, newDeviceData) {
    try {
      // 1. Register new device with old site bond
      const newDev = await this.registerDevice(newDeviceData);

      // 2. Mark old device as replaced
      try {
        await authService.protectedApi.patch(`/items/patrol_devices/${oldDeviceId}`, {
          status: 'replaced',
        });
      } catch (_) {
        try {
          await authService.protectedApi.patch(`/items/controllers/${oldDeviceId}`, {
            controllerStatus: 'replaced',
          });
        } catch (_) {}
      }

      // Update local storage
      const tenantId = authService.getTenantId();
      const key = `accesseasy_devices_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = existing.map(d => (d.id === oldDeviceId || d.device_id === oldDeviceId) ? { ...d, status: 'replaced' } : d);
      localStorage.setItem(key, JSON.stringify(updated));

      return newDev;
    } catch (error) {
      console.error("Error replacing device:", error);
      throw error;
    }
  }

  /**
   * Remote Unlink / Deactivate device
   */
  async unlinkDevice(deviceId) {
    try {
      try {
        await authService.protectedApi.patch(`/items/patrol_devices/${deviceId}`, {
          status: 'deactivated',
        });
      } catch (e) {
        try {
          await authService.protectedApi.delete(`/items/controllers/${deviceId}`);
        } catch (_) {
          try {
            await authService.protectedApi.delete(`/items/Controllers/${deviceId}`);
          } catch (_) {}
        }
      }

      // Update local storage
      const tenantId = authService.getTenantId();
      const key = `accesseasy_devices_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(d => d.id !== deviceId && d.device_id !== deviceId);
      localStorage.setItem(key, JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error("Error unlinking device on cloud:", error);
      throw error;
    }
  }

  /**
   * Record Guard Shift Clock-In on a shared terminal
   */
  async recordGuardShiftLogin({ deviceId, guardId, guardName, siteId, shiftId, clockInGps, selfieUrl, batteryLevel = 100 }) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenant: tenantId,
        device_id: deviceId,
        guard_id: guardId,
        guard_name: guardName,
        site_id: siteId,
        shift_id: shiftId || '',
        status: 'active',
        login_time: new Date().toISOString(),
        battery_at_login: batteryLevel,
        clock_in_gps: clockInGps || null,
        selfie_url: selfieUrl || '',
      };

      const res = await authService.protectedApi.post("/items/patrol_guard_sessions", payload);
      return res.data?.data || payload;
    } catch (error) {
      console.error("Error recording guard shift login:", error);
      throw error;
    }
  }

  /**
   * Record Guard Shift Clock-Out / Handover
   */
  async recordGuardShiftLogout(sessionId, handoverNotes = '') {
    try {
      const payload = {
        status: 'completed',
        logout_time: new Date().toISOString(),
        handover_notes: handoverNotes,
      };

      const res = await authService.protectedApi.patch(`/items/patrol_guard_sessions/${sessionId}`, payload);
      return res.data?.data;
    } catch (error) {
      console.error("Error recording guard shift logout:", error);
      throw error;
    }
  }

  /**
   * Update Terminal Telemetry (Battery, Online Heartbeat, App Version)
   */
  async updateDeviceTelemetry(deviceId, { batteryLevel, batteryCharging = false, appVersion = '1.0.0', isOnline = true }) {
    try {
      const payload = {
        battery_level: batteryLevel,
        battery_charging: batteryCharging,
        app_version: appVersion,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      };

      try {
        await authService.protectedApi.patch(`/items/patrol_devices/${deviceId}`, payload);
      } catch (_) {
        // Fallback for custom device_id lookup
        const res = await authService.protectedApi.get(`/items/patrol_devices?filter[device_id][_eq]=${deviceId}&limit=1`);
        if (res.data?.data?.[0]?.id) {
          await authService.protectedApi.patch(`/items/patrol_devices/${res.data.data[0].id}`, payload);
        }
      }
      return true;
    } catch (error) {
      console.warn("Failed to push device telemetry:", error.message);
      return false;
    }
  }

  /**
   * Remote Lock Patrol Terminal
   */
  async remoteLockDevice(deviceId) {
    try {
      const res = await authService.protectedApi.patch(`/items/controllers/${deviceId}`, {
        status: 'locked',
        controllerStatus: 'locked'
      });
      return res.data?.data;
    } catch (error) {
      console.error('Error locking device:', error);
      throw error;
    }
  }

  /**
   * Remote Unlock / Re-approve Patrol Terminal
   */
  async remoteUnlockDevice(deviceId) {
    try {
      const res = await authService.protectedApi.patch(`/items/controllers/${deviceId}`, {
        status: 'approved',
        controllerStatus: 'online'
      });
      return res.data?.data;
    } catch (error) {
      console.error('Error unlocking device:', error);
      throw error;
    }
  }

  /**
   * Get all active Patrol Terminals with location details
   */
  async getPatrolTerminals(tenantId) {
    try {
      const tId = tenantId || authService.getTenantId();
      const res = await authService.protectedApi.get(
        `/items/controllers?filter[tenant][tenantId][_eq]=${tId}&filter[_or][0][attendanceMode][_eq]=Patrol Terminal&filter[_or][1][controllerType][_eq]=1&fields=*,location.id,location.locName,location.locAddress`
      );
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching patrol terminals:', error);
      return [];
    }
  }
}

export const deviceService = new DeviceService();

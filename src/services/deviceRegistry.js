import { ref } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

class DeviceRegistry {
  constructor() {
    this.registeredControllers = ref([]);
    this.registeredCameras = ref([]);
    this.allowedCameraNames = ref(new Set());
    this.allowedDeviceUuids = ref(new Set());
    this.isLoaded = ref(false);
    this.loading = ref(false);
  }

  /**
   * Fetch approved controllers and cameras for the current tenant from Directus.
   */
  async loadDevices(forceRefresh = false) {
    if (this.isLoaded.value && !forceRefresh) {
      return;
    }
    if (this.loading.value) {
      return;
    }

    this.loading.value = true;
    try {
      const token = authService.getToken();
      if (!token) {
        this.clear();
        return;
      }

      const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
      const apiUrl = import.meta.env.VITE_API_URL;
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch active controllers
      const ctrlUrl = new URL(`${apiUrl}/items/controllers`);
      ctrlUrl.searchParams.append('filter[status][_in]', 'online,active,Online,Active');
      if (tenantId) {
        ctrlUrl.searchParams.append('filter[tenant][_eq]', tenantId);
      }
      ctrlUrl.searchParams.append('limit', '500');

      let controllersList = [];
      try {
        const ctrlRes = await fetch(ctrlUrl.toString(), { headers });
        if (ctrlRes.ok) {
          const json = await ctrlRes.json();
          controllersList = json.data || [];
        }
      } catch (err) {
        console.warn('[DeviceRegistry] Error fetching controllers:', err);
      }

      // 2. Fetch configured cameras
      const camUrl = new URL(`${apiUrl}/items/cameras`);
      if (tenantId) {
        camUrl.searchParams.append('filter[tenant][_eq]', tenantId);
      }
      camUrl.searchParams.append('limit', '500');

      let camerasList = [];
      try {
        const camRes = await fetch(camUrl.toString(), { headers });
        if (camRes.ok) {
          const json = await camRes.json();
          camerasList = json.data || [];
        }
      } catch (err) {
        console.warn('[DeviceRegistry] Error fetching cameras:', err);
      }

      // Also check localStorage fallback for cameras configured in UI
      try {
        const localCams = localStorage.getItem('accesseasy_cameras');
        if (localCams) {
          const parsed = JSON.parse(localCams);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge unique by id or name
            parsed.forEach(lc => {
              if (!camerasList.some(c => c.id === lc.id || c.name === lc.name)) {
                camerasList.push(lc);
              }
            });
          }
        }
      } catch (e) {}

      this.registeredControllers.value = controllersList;
      this.registeredCameras.value = camerasList;

      // Build UUID and Camera whitelist sets
      const deviceSet = new Set();
      const cameraSet = new Set();

      controllersList.forEach(ctrl => {
        if (ctrl.sn) deviceSet.add(String(ctrl.sn).trim().toLowerCase());
        if (ctrl.uuid) deviceSet.add(String(ctrl.uuid).trim().toLowerCase());
        if (ctrl.id) deviceSet.add(String(ctrl.id).trim().toLowerCase());
        if (ctrl.linkedCamera) cameraSet.add(String(ctrl.linkedCamera).trim().toLowerCase());
      });

      camerasList.forEach(cam => {
        if (cam.name) cameraSet.add(String(cam.name).trim().toLowerCase());
        if (cam.cameraName) cameraSet.add(String(cam.cameraName).trim().toLowerCase());
        if (cam.id) cameraSet.add(String(cam.id).trim().toLowerCase());
        if (cam.linkedCamera) cameraSet.add(String(cam.linkedCamera).trim().toLowerCase());
      });

      this.allowedDeviceUuids.value = deviceSet;
      this.allowedCameraNames.value = cameraSet;
      this.isLoaded.value = true;

      console.log(
        `[DeviceRegistry] Loaded ${deviceSet.size} registered devices & ${cameraSet.size} registered cameras for tenant: ${tenantId || 'global'}`
      );
    } catch (error) {
      console.error('[DeviceRegistry] Failed to load registered devices:', error);
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Check if an access device UUID is registered and approved.
   */
  isDeviceRegistered(uuid) {
    if (!uuid) return false;
    const cleanUuid = String(uuid).trim().toLowerCase();
    return this.allowedDeviceUuids.value.has(cleanUuid);
  }

  /**
   * Check if a camera identifier is registered and approved.
   */
  isCameraRegistered(cameraName) {
    if (!cameraName) return false;
    const cleanName = String(cameraName).trim().toLowerCase();
    return this.allowedCameraNames.value.has(cleanName);
  }

  getRegisteredCameraList() {
    return Array.from(this.allowedCameraNames.value);
  }

  getRegisteredDeviceList() {
    return Array.from(this.allowedDeviceUuids.value);
  }

  clear() {
    this.registeredControllers.value = [];
    this.registeredCameras.value = [];
    this.allowedCameraNames.value = new Set();
    this.allowedDeviceUuids.value = new Set();
    this.isLoaded.value = false;
  }
}

export const deviceRegistry = new DeviceRegistry();
export default deviceRegistry;

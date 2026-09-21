import { ref } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

class DeviceRegistry {
  constructor() {
    this.registeredControllers = ref([]);
    this.allowedDeviceUuids = ref(new Set());
    this.isLoaded = ref(false);
    this.loading = ref(false);
  }

  /**
   * Fetch approved controllers for the current tenant from Directus.
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

      this.registeredControllers.value = controllersList;

      // Build UUID whitelist set
      const deviceSet = new Set();
      controllersList.forEach(ctrl => {
        if (ctrl.sn) deviceSet.add(String(ctrl.sn).trim().toLowerCase());
        if (ctrl.uuid) deviceSet.add(String(ctrl.uuid).trim().toLowerCase());
        if (ctrl.id) deviceSet.add(String(ctrl.id).trim().toLowerCase());
      });

      this.allowedDeviceUuids.value = deviceSet;
      this.isLoaded.value = true;

      console.log(
        `[DeviceRegistry] Loaded ${deviceSet.size} registered devices for tenant: ${tenantId || 'global'}`
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

  getRegisteredDeviceList() {
    return Array.from(this.allowedDeviceUuids.value);
  }

  clear() {
    this.registeredControllers.value = [];
    this.allowedDeviceUuids.value = new Set();
    this.isLoaded.value = false;
  }
}

export const deviceRegistry = new DeviceRegistry();
export default deviceRegistry;

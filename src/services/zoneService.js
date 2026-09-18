import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class ZoneService {
  constructor() {
    this._zonesCache = new Map(); // key: siteId || 'all' -> { data, expiry }
    this._inFlightPromises = new Map();
    this._workingStrategy = null;
  }

  /**
   * Invalidate cached zones
   */
  invalidateCache() {
    this._zonesCache.clear();
  }

  getDefaultZones() {
    return [];
  }

  /**
   * Fetch doors from Directus for access control binding
   */
  async fetchDoors() {
    const tenantId = authService.getTenantId();
    const cacheKey = `doors_${tenantId}`;
    const cached = this._zonesCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    if (this._inFlightPromises.has(cacheKey)) {
      return this._inFlightPromises.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const response = await authService.protectedApi.get(
          `/items/doors?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=doorNumber&fields[]=doorName`
        );
        const data = response.data?.data || [];
        this._zonesCache.set(cacheKey, { data, expiry: Date.now() + 5 * 60 * 1000 });
        return data;
      } catch (error) {
        console.warn("Error fetching doors:", error.message);
        return [];
      } finally {
        this._inFlightPromises.delete(cacheKey);
      }
    })();

    this._inFlightPromises.set(cacheKey, promise);
    return promise;
  }

  /**
   * Fetch all zones filtered by tenant and optionally by site ID
   * @param {string|null} siteId
   * @param {string|null} userId (for zone_access checking)
   * @param {boolean} forceRefresh
   * @returns {Promise<Array>}
   */
  async fetchZones(siteId = null, userId = null, forceRefresh = false) {
    const tenantId = authService.getTenantId();
    const cacheKey = `zones_${tenantId || 'all'}_${siteId || 'all'}`;
    const cached = this._zonesCache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    if (this._inFlightPromises.has(cacheKey)) {
      return this._inFlightPromises.get(cacheKey);
    }

    const promise = (async () => {
      try {
        if (!tenantId || !authService.getToken()) return [];

        let rawData = [];
        try {
          let q = `/items/zones?filter[tenant][_eq]=${tenantId}&sort=zoneName`;
          if (siteId && siteId !== 'all') q += `&filter[site][_eq]=${siteId}`;
          const res = await authService.protectedApi.get(q);
          rawData = res.data?.data || [];
        } catch (e) {
          console.warn('[zoneService] fetchZones error:', e?.message);
        }

        const mapped = rawData.map(z => ({
          ...z,
          name: z.zoneName || z.name || `Zone ${z.id}`,
          zoneName: z.zoneName || z.name || `Zone ${z.id}`
        }));

        try {
          const storedKey = `accesseasy_custom_zones_${tenantId}`;
          const localCustom = JSON.parse(localStorage.getItem(storedKey) || '[]');
          localCustom.forEach(cz => {
            if (!mapped.some(m => String(m.id) === String(cz.id))) {
              if (!siteId || siteId === 'all' || String(cz.site) === String(siteId) || String(cz.siteId) === String(siteId)) {
                mapped.unshift(cz);
              }
            }
          });
        } catch (_) {}

        this._zonesCache.set(cacheKey, { data: mapped, expiry: Date.now() + 30000 });
        return mapped;
      } catch (error) {
        console.error("Error fetching zones:", error);
        return [];
      } finally {
        this._inFlightPromises.delete(cacheKey);
      }
    })();

    this._inFlightPromises.set(cacheKey, promise);
    return promise;
  }

  /**
   * Fetch zones for a specific site
   */
  async fetchZonesBySite(siteId, forceRefresh = false) {
    return this.fetchZones(siteId, null, forceRefresh);
  }

  /**
   * Create a new zone with pre-flight plan limit validation
   */
  async createZone(zoneData) {
    try {
      const limitCheck = await subscriptionService.checkLimit('zones');
      if (!limitCheck.allowed) {
        const error = new Error(limitCheck.upgradeMessage || "Zone limit exceeded for current plan.");
        error.code = "PLAN_LIMIT_EXCEEDED";
        error.limitDetails = limitCheck;
        throw error;
      }

      const tenantId = authService.getTenantId();
      const zoneName = zoneData.name || zoneData.zoneName || 'New Zone';
      const payload = {
        name: zoneName,
        zoneName: zoneName,
        code: zoneData.code || zoneData.zoneCode || `ZN-${Math.floor(100 + Math.random() * 900)}`,
        description: zoneData.description || '',
        site: zoneData.site || zoneData.siteId || null,
        siteId: zoneData.siteId || zoneData.site || null,
        status: zoneData.status || 'active'
      };

      if (tenantId) {
        payload.tenant = tenantId;
      }

      let createdZone = null;
      try {
        const response = await authService.protectedApi.post("/items/zones", payload);
        createdZone = response.data?.data;
      } catch (apiErr) {
        console.warn("[ZoneService] Directus zones POST failed:", apiErr?.response?.status, apiErr?.message);
        // Fallback local persistence for permission-restricted environments
        const localId = `zone-loc-${Date.now()}`;
        createdZone = {
          id: localId,
          name: zoneName,
          zoneName: zoneName,
          code: payload.code,
          description: payload.description,
          site: payload.site,
          siteId: payload.siteId,
          status: 'active',
          tenant: tenantId
        };
        try {
          const storedKey = `accesseasy_custom_zones_${tenantId}`;
          const currentCustom = JSON.parse(localStorage.getItem(storedKey) || '[]');
          currentCustom.unshift(createdZone);
          localStorage.setItem(storedKey, JSON.stringify(currentCustom));
        } catch (_) {}
      }

      this.invalidateCache();
      subscriptionService.clearCache();
      return createdZone;
    } catch (error) {
      console.error("Error creating zone:", error);
      throw error;
    }
  }

  /**
   * Update an existing zone
   */
  async updateZone(zoneId, zoneData) {
    try {
      const payload = { ...zoneData };
      if (zoneData.name || zoneData.zoneName) {
        payload.name = zoneData.name || zoneData.zoneName;
        payload.zoneName = zoneData.zoneName || zoneData.name;
      }
      const response = await authService.protectedApi.patch(`/items/zones/${zoneId}`, payload);
      this.invalidateCache();
      return response.data.data;
    } catch (error) {
      console.error(`Error updating zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a zone
   */
  async deleteZone(zoneId) {
    try {
      await authService.protectedApi.delete(`/items/zones/${zoneId}`);
      this.invalidateCache();
      subscriptionService.clearCache();
    } catch (error) {
      console.error(`Error deleting zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Pro / Custom: Fetch users assigned to a zone
   */
  async getZoneAccess(zoneId) {
    try {
      const response = await authService.protectedApi.get(`/items/zones/${zoneId}?fields=assigned_users`);
      const users = response.data?.data?.assigned_users || [];
      return users.map(u => (typeof u === 'object' ? u : { user: u }));
    } catch (error) {
      console.warn("Could not fetch zone access:", error.message);
      return [];
    }
  }

  /**
   * Pro / Custom: Assign user to a zone
   */
  async assignZoneAccess(zoneId, userId) {
    try {
      const current = await authService.protectedApi.get(`/items/zones/${zoneId}?fields=assigned_users`);
      const users = current.data?.data?.assigned_users || [];
      if (!users.includes(userId)) {
        users.push(userId);
        const res = await authService.protectedApi.patch(`/items/zones/${zoneId}`, { assigned_users: users });
        this.invalidateCache();
        return res.data.data;
      }
      return current.data.data;
    } catch (error) {
      console.error("Error assigning zone access:", error);
      throw error;
    }
  }
}

export const zoneService = new ZoneService();

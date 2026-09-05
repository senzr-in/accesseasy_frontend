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
          `/items/doors?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=doorNumber&fields[]=doorName`
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
   */
  async fetchZones(siteId = null, userId = null, forceRefresh = false) {
    const cacheKey = siteId ? String(siteId) : 'all';

    // 1. Check in-memory cache
    const cached = this._zonesCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    // 2. In-flight request deduplication
    if (this._inFlightPromises.has(cacheKey)) {
      return this._inFlightPromises.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const tenantId = authService.getTenantId();
        if (!tenantId || !authService.getToken()) return [];

        let rawData = [];

        // Fast path: use previously verified working strategy
        if (this._workingStrategy) {
          try {
            let q = `/items/zones?sort=zoneName`;
            if (this._workingStrategy === 'or') {
              q = `/items/zones?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&sort=zoneName`;
            } else if (this._workingStrategy === 'tenant') {
              q = `/items/zones?filter[tenant][_eq]=${tenantId}&sort=zoneName`;
            } else if (this._workingStrategy === 'tenantId') {
              q = `/items/zones?filter[tenant][tenantId][_eq]=${tenantId}&sort=zoneName`;
            } else {
              this._workingStrategy = null;
              return [];
            }
            if (siteId && siteId !== 'all') q += `&filter[site][_eq]=${siteId}`;
            const res = await authService.protectedApi.get(q);
            rawData = res.data?.data || [];
          } catch (e) {
            this._workingStrategy = null;
          }
        }

        // Discovery path: attempt most specific filter first
        if (rawData.length === 0 && !this._workingStrategy) {
          try {
            let q = `/items/zones?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&sort=zoneName`;
            if (siteId && siteId !== 'all') q += `&filter[site][_eq]=${siteId}`;
            const res1 = await authService.protectedApi.get(q);
            rawData = res1.data?.data || [];
            this._workingStrategy = 'or';
          } catch (e1) {
            try {
              let q = `/items/zones?filter[tenant][_eq]=${tenantId}&sort=zoneName`;
              if (siteId && siteId !== 'all') q += `&filter[site][_eq]=${siteId}`;
              const res2 = await authService.protectedApi.get(q);
              rawData = res2.data?.data || [];
              this._workingStrategy = 'tenant';
            } catch (e2) {
              try {
                let q = `/items/zones?filter[tenant][tenantId][_eq]=${tenantId}&sort=zoneName`;
                if (siteId && siteId !== 'all') q += `&filter[site][_eq]=${siteId}`;
                const res3 = await authService.protectedApi.get(q);
                rawData = res3.data?.data || [];
                this._workingStrategy = 'tenantId';
              } catch (e3) {
                console.error('[ZoneService] All tenant filter strategies exhausted. Returning empty — no unfiltered fallback.');
                rawData = [];
              }
            }
          }
        }

        const mapped = rawData.map(z => ({
          ...z,
          name: z.zoneName || z.name || `Zone ${z.id}`,
          zoneName: z.zoneName || z.name || `Zone ${z.id}`
        }));

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
      const payload = {
        ...zoneData,
        name: zoneData.name || zoneData.zoneName,
        zoneName: zoneData.zoneName || zoneData.name,
        tenant: tenantId,
        date_created: new Date().toISOString()
      };

      const response = await authService.protectedApi.post("/items/zones", payload);
      this.invalidateCache();
      subscriptionService.clearCache();
      return response.data.data;
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

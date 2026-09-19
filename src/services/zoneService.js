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

        const tenantData = authService.getTenantData();
        const tenantCode = tenantData?.tenantId || (typeof tenantData === 'string' ? tenantData : null) || tenantId;
        const tenantPk = tenantData?.id;

        let rawData = [];
        const queries = [
          tenantCode ? `/items/zones?filter[tenant][tenantId][_eq]=${encodeURIComponent(tenantCode)}&fields=*,tenant.*&sort=zoneName` : null,
          tenantPk ? `/items/zones?filter[tenant][_eq]=${encodeURIComponent(tenantPk)}&fields=*,tenant.*&sort=zoneName` : null,
          tenantId ? `/items/zones?filter[tenant][_eq]=${encodeURIComponent(tenantId)}&fields=*,tenant.*&sort=zoneName` : null,
          `/items/zones?fields=*,tenant.*&sort=zoneName`
        ].filter(Boolean);

        for (const q of queries) {
          try {
            const res = await authService.protectedApi.get(q, { timeout: 6000 });
            if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
              rawData = res.data.data;
              break;
            }
          } catch (e) {
            // continue fallback
          }
        }

        const userTenantId = String(tenantId || '').trim().toLowerCase();
        const userTenantCode = String(tenantCode || '').trim().toLowerCase();
        const userTenantPk = tenantPk != null ? String(tenantPk).trim().toLowerCase() : '';

        // Strict tenant isolation filter
        const tenantFiltered = rawData.filter(z => {
          if (!z) return false;
          if (!z.tenant) return false;

          if (typeof z.tenant === 'object') {
            const tCode = z.tenant.tenantId ? String(z.tenant.tenantId).trim().toLowerCase() : '';
            const tPk = z.tenant.id != null ? String(z.tenant.id).trim().toLowerCase() : '';
            return (
              (userTenantCode && tCode === userTenantCode) ||
              (userTenantId && (tCode === userTenantId || tPk === userTenantId)) ||
              (userTenantPk && tPk === userTenantPk)
            );
          }

          const str = String(z.tenant).trim().toLowerCase();
          return (
            (userTenantCode && str === userTenantCode) ||
            (userTenantId && str === userTenantId) ||
            (userTenantPk && str === userTenantPk)
          );
        });

        // Retrieve local site mapping for tenant
        let siteMap = {};
        try {
          const siteMapKey = `accesseasy_zone_site_map_${tenantId}`;
          siteMap = JSON.parse(localStorage.getItem(siteMapKey) || '{}');
        } catch (_) {}

        const mapped = tenantFiltered.map(z => {
          const matchedSite = z.site || siteMap[String(z.id)] || null;
          return {
            ...z,
            site: matchedSite,
            siteId: matchedSite,
            name: z.zoneName || z.name || `Zone ${z.id}`,
            zoneName: z.zoneName || z.name || `Zone ${z.id}`
          };
        });

        // Add any local offline/custom zones
        try {
          const storedKey = `accesseasy_custom_zones_${tenantId}`;
          const localCustom = JSON.parse(localStorage.getItem(storedKey) || '[]');
          localCustom.forEach(cz => {
            if (!mapped.some(m => String(m.id) === String(cz.id))) {
              mapped.unshift(cz);
            }
          });
        } catch (_) {}

        // Filter by siteId if specified
        let filtered = mapped;
        if (siteId && siteId !== 'all') {
          filtered = mapped.filter(z => {
            const zSite = String(z.site?.id || z.site || z.siteId || '');
            return !zSite || zSite === String(siteId);
          });
        }

        this._zonesCache.set(cacheKey, { data: filtered, expiry: Date.now() + 30000 });
        return filtered;
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
      const siteId = zoneData.site || zoneData.siteId || null;

      // Note: In Directus, the 'site' field has an incompatible foreign key constraint for branch IDs.
      // We send clean, accepted fields to Directus so the request succeeds with 200 on the first try.
      const payload = {
        name: zoneName,
        zoneName: zoneName,
        code: zoneData.code || zoneData.zoneCode || `ZN-${Math.floor(100 + Math.random() * 900)}`,
        description: zoneData.description || '',
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
        console.warn("[ZoneService] Directus zones POST error, falling back to local persistence:", apiErr?.message);
        const localId = `zone-loc-${Date.now()}`;
        createdZone = {
          id: localId,
          name: zoneName,
          zoneName: zoneName,
          code: payload.code,
          description: payload.description,
          status: 'active',
          tenant: tenantId
        };
      }

      // Store site association in client map
      if (createdZone) {
        createdZone.site = siteId;
        createdZone.siteId = siteId;
        if (siteId && tenantId) {
          try {
            const siteMapKey = `accesseasy_zone_site_map_${tenantId}`;
            const currentMap = JSON.parse(localStorage.getItem(siteMapKey) || '{}');
            currentMap[String(createdZone.id)] = String(siteId);
            localStorage.setItem(siteMapKey, JSON.stringify(currentMap));
          } catch (_) {}
        }
      }

      try {
        const storedKey = `accesseasy_custom_zones_${tenantId}`;
        const currentCustom = JSON.parse(localStorage.getItem(storedKey) || '[]');
        if (!currentCustom.some(cz => String(cz.id) === String(createdZone.id))) {
          currentCustom.unshift(createdZone);
          localStorage.setItem(storedKey, JSON.stringify(currentCustom));
        }
      } catch (_) {}

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
      const siteId = zoneData.site || zoneData.siteId;

      // Omit foreign key constrained fields from Directus patch
      delete payload.site;
      delete payload.siteId;

      let updated = null;
      try {
        const response = await authService.protectedApi.patch(`/items/zones/${zoneId}`, payload);
        updated = response.data?.data;
      } catch (apiErr) {
        console.warn(`[ZoneService] Directus patch failed for ${zoneId}:`, apiErr?.message);
      }

      const tenantId = authService.getTenantId();
      if (siteId && tenantId) {
        try {
          const siteMapKey = `accesseasy_zone_site_map_${tenantId}`;
          const currentMap = JSON.parse(localStorage.getItem(siteMapKey) || '{}');
          currentMap[String(zoneId)] = String(siteId);
          localStorage.setItem(siteMapKey, JSON.stringify(currentMap));
        } catch (_) {}
      }

      this.invalidateCache();
      return updated || { id: zoneId, ...payload, site: siteId, siteId };
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
      const tenantId = authService.getTenantId();
      try {
        await authService.protectedApi.delete(`/items/zones/${zoneId}`);
      } catch (err) {
        console.warn(`[ZoneService] Delete zone ${zoneId} API fallback:`, err?.message);
      }

      if (tenantId) {
        try {
          const storedKey = `accesseasy_custom_zones_${tenantId}`;
          const currentCustom = JSON.parse(localStorage.getItem(storedKey) || '[]');
          const filtered = currentCustom.filter(z => String(z.id) !== String(zoneId));
          localStorage.setItem(storedKey, JSON.stringify(filtered));

          const siteMapKey = `accesseasy_zone_site_map_${tenantId}`;
          const currentMap = JSON.parse(localStorage.getItem(siteMapKey) || '{}');
          delete currentMap[String(zoneId)];
          localStorage.setItem(siteMapKey, JSON.stringify(currentMap));
        } catch (_) {}
      }

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

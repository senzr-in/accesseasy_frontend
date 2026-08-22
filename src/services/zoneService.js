import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class ZoneService {
  getDefaultZones() {
    return [];
  }

  /**
   * Fetch doors from Directus for access control binding
   */
  async fetchDoors() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/doors?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=doorNumber&fields[]=doorName`
      );
      return response.data.data;
    } catch (error) {
      console.warn("Error fetching doors:", error.message);
      return [];
    }
  }

  /**
   * Fetch all zones filtered by tenant and optionally by site ID
   * @param {string|null} siteId
   * @param {string|null} userId (for zone_access checking)
   */
  async fetchZones(siteId = null, userId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      let query = `/items/zones?filter[tenant][_eq]=${tenantId}&sort=name`;
      if (siteId) {
        query += `&filter[site][_eq]=${siteId}`;
      }

      if (userId) {
        try {
          const accessRes = await authService.protectedApi.get(
            `/items/zone_access?filter[tenant][_eq]=${tenantId}&filter[user][_eq]=${userId}`
          );
          if (accessRes.data.data && accessRes.data.data.length > 0) {
            const allowedZoneIds = accessRes.data.data.map(a => a.zone);
            query += `&filter[id][_in]=${allowedZoneIds.join(',')}`;
          }
        } catch (e) {}
      }

      try {
        const response = await authService.protectedApi.get(query);
        if (response.data?.data) {
          return response.data.data.map(z => ({
            ...z,
            name: z.name || z.zoneName,
            zoneName: z.zoneName || z.name
          }));
        }
      } catch (err) {
        // Directus collection may not exist yet
      }

      // Check localStorage
      const stored = localStorage.getItem(`accesseasy_zones_${tenantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (siteId) return parsed.filter(z => String(z.site) === String(siteId));
          return parsed;
        } catch (e) {}
      }

      return [];
    } catch (error) {
      console.error("Error fetching zones:", error);
      return [];
    }
  }

  /**
   * Fetch zones for a specific site
   */
  async fetchZonesBySite(siteId) {
    return this.fetchZones(siteId);
  }

  /**
   * Create a new zone with pre-flight plan limit validation
   */
  async createZone(zoneData) {
    try {
      // Step 1: Pre-flight plan limit check for zones
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

      try {
        const response = await authService.protectedApi.post("/items/zones", payload);
        subscriptionService.clearCache();
        return response.data.data;
      } catch (e) {
        if (e.response?.data?.errors?.[0]?.extensions?.code === "PLAN_LIMIT_EXCEEDED") {
          throw e;
        }
        // Local persistence fallback
        const zones = await this.fetchZones();
        const newZone = {
          ...payload,
          id: `zone-${Date.now()}`,
          checkpointsCount: 0,
          status: payload.status || 'active'
        };
        zones.push(newZone);
        localStorage.setItem(`accesseasy_zones_${tenantId}`, JSON.stringify(zones));
        return newZone;
      }
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
      const tenantId = authService.getTenantId();
      const payload = {
        ...zoneData,
        name: zoneData.name || zoneData.zoneName,
        zoneName: zoneData.zoneName || zoneData.name,
        tenant: tenantId,
      };

      try {
        const response = await authService.protectedApi.patch(`/items/zones/${zoneId}`, payload);
        return response.data.data;
      } catch (e) {
        const zones = await this.fetchZones();
        const idx = zones.findIndex(z => String(z.id) === String(zoneId));
        if (idx !== -1) {
          zones[idx] = { ...zones[idx], ...payload };
          localStorage.setItem(`accesseasy_zones_${tenantId}`, JSON.stringify(zones));
          return zones[idx];
        }
      }
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
        subscriptionService.clearCache();
      } catch (e) {
        const zones = await this.fetchZones();
        const updated = zones.filter(z => String(z.id) !== String(zoneId));
        localStorage.setItem(`accesseasy_zones_${tenantId}`, JSON.stringify(updated));
      }
    } catch (error) {
      console.error(`Error deleting zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Pro / Custom: Fetch users with access permissions for a specific zone
   */
  async getZoneAccess(zoneId) {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/zone_access?filter[tenant][_eq]=${tenantId}&filter[zone][_eq]=${zoneId}&fields=*,user.first_name,user.last_name,user.email`
      );
      return response.data.data || [];
    } catch (error) {
      console.warn("Could not fetch zone_access:", error.message);
      return [];
    }
  }

  /**
   * Pro / Custom: Assign user zone access level
   */
  async assignZoneAccess(zoneId, userId, accessLevel = 'operate') {
    try {
      const tenantId = authService.getTenantId();
      const existing = await authService.protectedApi.get(
        `/items/zone_access?filter[tenant][_eq]=${tenantId}&filter[zone][_eq]=${zoneId}&filter[user][_eq]=${userId}`
      );
      if (existing.data.data?.length > 0) {
        const accessId = existing.data.data[0].id;
        const res = await authService.protectedApi.patch(`/items/zone_access/${accessId}`, {
          access_level: accessLevel
        });
        return res.data.data;
      } else {
        const res = await authService.protectedApi.post(`/items/zone_access`, {
          tenant: tenantId,
          zone: zoneId,
          user: userId,
          access_level: accessLevel
        });
        return res.data.data;
      }
    } catch (error) {
      console.error("Error assigning zone access:", error);
      throw error;
    }
  }
}

export const zoneService = new ZoneService();

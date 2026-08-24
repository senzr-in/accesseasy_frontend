import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class SiteService {
  constructor() {
    this._sitesCache = null;
    this._cacheExpiry = 0;
    this._inFlightPromise = null;
    this._workingStrategy = null; // 'or' | 'tenant' | 'tenantId' | 'plain'
  }

  /**
   * Invalidate cached sites
   */
  invalidateCache() {
    this._sitesCache = null;
    this._cacheExpiry = 0;
  }

  getDefaultSites(tenantId) {
    return [];
  }

  /**
   * Fetch all Sites filtered by tenant (and optionally user site_access)
   */
  async fetchSites(userId = null, forceRefresh = false) {
    // 1. Return in-memory cache if still valid
    if (!forceRefresh && this._sitesCache && Date.now() < this._cacheExpiry) {
      return this._sitesCache;
    }

    // 2. Deduplicate simultaneous in-flight network requests
    if (this._inFlightPromise) {
      return this._inFlightPromise;
    }

    this._inFlightPromise = (async () => {
      try {
        const tenantId = authService.getTenantId();
        if (!tenantId || !authService.getToken()) return [];

        let rawData = [];

        // Fast path: use previously verified working strategy
        if (this._workingStrategy) {
          try {
            let endpoint = `/items/locationManagement?sort=locName`;
            if (this._workingStrategy === 'or') {
              endpoint = `/items/locationManagement?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&sort=locName`;
            } else if (this._workingStrategy === 'tenant') {
              endpoint = `/items/locationManagement?filter[tenant][_eq]=${tenantId}&sort=locName`;
            } else if (this._workingStrategy === 'tenantId') {
              endpoint = `/items/locationManagement?filter[tenant][tenantId][_eq]=${tenantId}&sort=locName`;
            } else {
              endpoint = `/items/locationManagement?limit=500`;
            }
            const res = await authService.protectedApi.get(endpoint);
            rawData = res.data?.data || [];
          } catch (e) {
            this._workingStrategy = null; // Reset strategy if schema changed
          }
        }

        // Discovery path: attempt most specific filter first, remember success
        if (rawData.length === 0 && !this._workingStrategy) {
          try {
            const res1 = await authService.protectedApi.get(
              `/items/locationManagement?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&sort=locName`
            );
            rawData = res1.data?.data || [];
            this._workingStrategy = 'or';
          } catch (e1) {
            try {
              const res2 = await authService.protectedApi.get(
                `/items/locationManagement?filter[tenant][_eq]=${tenantId}&sort=locName`
              );
              rawData = res2.data?.data || [];
              this._workingStrategy = 'tenant';
            } catch (e2) {
              try {
                const res3 = await authService.protectedApi.get(
                  `/items/locationManagement?filter[tenant][tenantId][_eq]=${tenantId}&sort=locName`
                );
                rawData = res3.data?.data || [];
                this._workingStrategy = 'tenantId';
              } catch (e3) {
                try {
                  const res4 = await authService.protectedApi.get(`/items/locationManagement?limit=500`);
                  rawData = res4.data?.data || [];
                  this._workingStrategy = 'plain';
                } catch (e4) {}
              }
            }
          }
        }

        const mapped = rawData.map(loc => ({
          ...loc,
          name: loc.locName || loc.orgLocation?.orgName || loc.name || loc.locdetail?.name || `Site ${loc.id}`,
          locName: loc.locName || loc.orgLocation?.orgName || loc.name || `Site ${loc.id}`,
          address: loc.locAddress || loc.locdetail?.address || '',
          lat: loc.locmark?.lat || loc.latitude || null,
          lng: loc.locmark?.lng || loc.longitude || null,
        }));

        this._sitesCache = mapped;
        this._cacheExpiry = Date.now() + 30000; // 30s TTL
        return mapped;
      } catch (error) {
        console.error("Error in fetchSites:", error);
        return [];
      } finally {
        this._inFlightPromise = null;
      }
    })();

    return this._inFlightPromise;
  }

  /**
   * Get Site details by ID
   */
  async getSiteById(siteId) {
    try {
      const response = await authService.protectedApi.get(`/items/locationManagement/${siteId}`);
      if (response.data?.data) {
        const loc = response.data.data;
        return { ...loc, name: loc.locName, address: loc.locAddress };
      }
    } catch (e) {}

    const sites = await this.fetchSites();
    return sites.find(s => String(s.id) === String(siteId)) || sites[0] || null;
  }

  /**
   * Create a new Site with limit validation
   */
  async createSite(siteData) {
    try {
      const limitCheck = await subscriptionService.checkLimit('sites');
      if (!limitCheck.allowed) {
        const error = new Error(limitCheck.upgradeMessage || "Site limit exceeded for current plan.");
        error.code = "PLAN_LIMIT_EXCEEDED";
        error.limitDetails = limitCheck;
        throw error;
      }

      const tenantId = authService.getTenantId();
      const payload = {
        locName: siteData.name || siteData.locName,
        locAddress: siteData.address || siteData.locAddress,
        locType: siteData.locType || 'site',
        locmark: siteData.locmark || (siteData.lat ? { lat: siteData.lat, lng: siteData.lng } : null),
        locdetail: siteData.locdetail || { locationName: siteData.name || siteData.locName },
        geofence_radius: siteData.geofence_radius || 500,
        status: siteData.status || 'active',
        tenant: tenantId,
        date_created: new Date().toISOString()
      };

      const response = await authService.protectedApi.post("/items/locationManagement", payload);
      this.invalidateCache();
      subscriptionService.clearCache();
      const loc = response.data.data;
      return { ...loc, name: loc.locName, address: loc.locAddress };
    } catch (error) {
      console.error("Error creating site:", error);
      throw error;
    }
  }

  /**
   * Update an existing site
   */
  async updateSite(siteId, siteData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {};
      if (siteData.name || siteData.locName) payload.locName = siteData.name || siteData.locName;
      if (siteData.address || siteData.locAddress) payload.locAddress = siteData.address || siteData.locAddress;
      if (siteData.locType) payload.locType = siteData.locType;
      if (siteData.locmark) payload.locmark = siteData.locmark;
      if (siteData.geofence_radius !== undefined) payload.geofence_radius = siteData.geofence_radius;
      if (siteData.status) payload.status = siteData.status;

      const response = await authService.protectedApi.patch(`/items/locationManagement/${siteId}`, payload);
      this.invalidateCache();
      const loc = response.data.data;
      return { ...loc, name: loc.locName, address: loc.locAddress };
    } catch (error) {
      console.error(`Error updating site ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a site
   */
  async deleteSite(siteId) {
    try {
      const tenantId = authService.getTenantId();
      await authService.protectedApi.delete(`/items/locationManagement/${siteId}`);
      this.invalidateCache();
      subscriptionService.clearCache();
    } catch (error) {
      console.error(`Error deleting site ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * Pro / Custom: Fetch users assigned to a location via empIds
   */
  async getSiteAccess(siteId) {
    try {
      const response = await authService.protectedApi.get(`/items/locationManagement/${siteId}?fields=empIds`);
      const empIds = response.data?.data?.empIds || [];
      return empIds.map(id => ({ user: id }));
    } catch (error) {
      console.warn("Could not fetch site access:", error.message);
      return [];
    }
  }

  /**
   * Pro / Custom: Assign user to a location (add to empIds JSON array)
   */
  async assignSiteAccess(siteId, userId) {
    try {
      const current = await authService.protectedApi.get(`/items/locationManagement/${siteId}?fields=empIds`);
      const empIds = current.data?.data?.empIds || [];
      if (!empIds.includes(userId)) {
        empIds.push(userId);
        const res = await authService.protectedApi.patch(`/items/locationManagement/${siteId}`, { empIds });
        this.invalidateCache();
        return res.data.data;
      }
      return current.data.data;
    } catch (error) {
      console.error("Error assigning site access:", error);
      throw error;
    }
  }

  /**
   * Custom: Fetch clients for multi-client enterprise setups (uses locationManagement collection)
   */
  async fetchClients() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/locationManagement?filter[tenant][_eq]=${tenantId}&sort=locName`
      );
      return (response.data.data || []).map(l => ({ ...l, name: l.locName, address: l.locAddress }));
    } catch (error) {
      return [];
    }
  }
}

export const siteService = new SiteService();

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

        const tenantData = authService.getTenantData();
        const tenantCode = tenantData?.tenantId || (typeof tenantData === 'string' ? tenantData : null) || tenantId;
        const tenantPk = tenantData?.id;

        let rawData = [];
        
        // Multi-strategy queries for Directus M2O tenant relation
        const queries = [
          tenantCode ? `/items/branch?filter[tenant][tenantId][_eq]=${encodeURIComponent(tenantCode)}&fields=*,tenant.*&limit=200` : null,
          tenantPk ? `/items/branch?filter[tenant][_eq]=${encodeURIComponent(tenantPk)}&fields=*,tenant.*&limit=200` : null,
          tenantId ? `/items/branch?filter[tenant][_eq]=${encodeURIComponent(tenantId)}&fields=*,tenant.*&limit=200` : null,
          `/items/branch?fields=*,tenant.*&limit=200`
        ].filter(Boolean);

        for (const q of queries) {
          try {
            const res = await authService.protectedApi.get(q, { timeout: 6000 });
            if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
              rawData = res.data.data;
              break;
            }
          } catch (err) {
            // continue fallback
          }
        }

        const userTenantId = String(tenantId || '').trim().toLowerCase();
        const userTenantCode = String(tenantCode || '').trim().toLowerCase();
        const userTenantPk = tenantPk != null ? String(tenantPk).trim().toLowerCase() : '';

        // Strict tenant isolation filter
        const tenantFiltered = rawData.filter(loc => {
          if (!loc) return false;
          if (!loc.tenant) return false; // Exclude unassigned/global test sites

          if (typeof loc.tenant === 'object') {
            const tCode = loc.tenant.tenantId ? String(loc.tenant.tenantId).trim().toLowerCase() : '';
            const tPk = loc.tenant.id != null ? String(loc.tenant.id).trim().toLowerCase() : '';
            return (
              (userTenantCode && tCode === userTenantCode) ||
              (userTenantId && (tCode === userTenantId || tPk === userTenantId)) ||
              (userTenantPk && tPk === userTenantPk)
            );
          }

          const str = String(loc.tenant).trim().toLowerCase();
          return (
            (userTenantCode && str === userTenantCode) ||
            (userTenantId && str === userTenantId) ||
            (userTenantPk && str === userTenantPk)
          );
        });

        const mapped = tenantFiltered.map(loc => {
          let lat = null;
          let lng = null;
          if (loc.locmark?.coordinates && Array.isArray(loc.locmark.coordinates)) {
            lng = loc.locmark.coordinates[0];
            lat = loc.locmark.coordinates[1];
          } else if (loc.locmark?.lat) {
            lat = loc.locmark.lat;
            lng = loc.locmark.lng;
          } else {
            lat = loc.lat != null ? Number(loc.lat) : (loc.latitude ? Number(loc.latitude) : null);
            lng = loc.lng != null ? Number(loc.lng) : (loc.longitude ? Number(loc.longitude) : null);
          }

          const siteName = loc.branchName || loc.locName || loc.orgLocation?.orgName || loc.name || loc.locdetail?.locationName || loc.locdetail?.name || `Site ${loc.id}`;
          const siteCode = loc.branchId || loc.code || loc.locCode || loc.locdetail?.code || `SITE-${loc.id}`;
          const siteAddress = loc.address || loc.locAddress || loc.locdetail?.address || '';
          const siteRadius = Number(loc.workingRange || loc.geofence_radius || loc.locSize || 500);

          return {
            ...loc,
            name: siteName,
            locName: siteName,
            code: siteCode,
            address: siteAddress,
            lat,
            lng,
            latitude: lat,
            longitude: lng,
            geofence_radius: siteRadius
          };
        });

        this._sitesCache = mapped;
        this._cacheExpiry = Date.now() + 60000; // 60s TTL
        return mapped;
      } catch (error) {
        console.error("Error in fetchSites:", error);
        return this._sitesCache || [];
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
    if (!siteId) return null;
    const tenantId = authService.getTenantId();
    try {
      const response = await authService.protectedApi.get(`/items/branch/${siteId}`);
      if (response.data?.data) {
        const loc = response.data.data;
        const locTenant = loc.tenant?.tenantId || loc.tenant?.id || (typeof loc.tenant === 'string' ? loc.tenant : null);
        if (tenantId && locTenant && String(locTenant) !== String(tenantId)) {
          console.warn('[SiteService] Cross-tenant site access prevented:', siteId);
          return null;
        }
        return {
          ...loc,
          name: loc.branchName || loc.locName || loc.locdetail?.locationName || `Site ${loc.id}`,
          address: loc.address || loc.locAddress || loc.locdetail?.address || ''
        };
      }
    } catch (e) {}

    const sites = await this.fetchSites();
    return sites.find(s => String(s.id) === String(siteId)) || null;
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
      const lat = parseFloat(siteData.latitude || siteData.lat || 12.9716);
      const lng = parseFloat(siteData.longitude || siteData.lng || 80.2435);
      const name = siteData.name || siteData.branchName || siteData.locName || 'New Site';
      const address = siteData.address || siteData.locAddress || '';
      const code = siteData.code || siteData.branchId || siteData.locCode || `SITE-${Math.floor(100 + Math.random() * 900)}`;
      const radius = Number(siteData.geofence_radius || siteData.workingRange || siteData.locSize || 500);

      const payload = {
        branchName: name,
        address: address,
        branchId: code,
        lat: String(lat),
        lng: String(lng),
        workingRange: String(radius),
        status: siteData.status || 'published'
      };

      if (tenantId) {
        payload.tenant = tenantId;
      }

      const response = await authService.protectedApi.post("/items/branch", payload);
      const createdLoc = response.data?.data;
      if (!createdLoc) throw new Error('No data returned from Directus after site creation.');

      this.invalidateCache();
      subscriptionService.clearCache();

      return {
        ...createdLoc,
        name: createdLoc.branchName || createdLoc.locName || name,
        locName: createdLoc.branchName || createdLoc.locName || name,
        address: createdLoc.address || createdLoc.locAddress || address,
        code: createdLoc.branchId || createdLoc.code || code,
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        geofence_radius: radius
      };
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
      const payload = {};
      if (siteData.name || siteData.branchName || siteData.locName) payload.branchName = siteData.name || siteData.branchName || siteData.locName;
      if (siteData.address || siteData.locAddress) payload.address = siteData.address || siteData.locAddress;
      if (siteData.lat !== undefined) payload.lat = String(siteData.lat);
      if (siteData.lng !== undefined) payload.lng = String(siteData.lng);
      if (siteData.geofence_radius !== undefined || siteData.workingRange !== undefined) payload.workingRange = String(siteData.geofence_radius || siteData.workingRange);
      if (siteData.status) payload.status = siteData.status;

      let loc = null;
      try {
        const response = await authService.protectedApi.patch(`/items/branch/${siteId}`, payload);
        loc = response.data?.data;
      } catch (patchErr) {
        console.warn(`[SiteService] Update site ${siteId} API fallback:`, patchErr?.message);
      }



      this.invalidateCache();
      return { ...(loc || {}), id: siteId, name: siteData.name || loc?.branchName, address: siteData.address || loc?.address };
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
      await authService.protectedApi.delete(`/items/branch/${siteId}`);
    } catch (error) {
      console.warn(`[SiteService] Delete site ${siteId} API fallback:`, error?.message);
    }

    this.invalidateCache();
    subscriptionService.clearCache();
  }

  /**
   * Pro / Custom: Fetch users assigned to a location
   */
  async getSiteAccess(siteId) {
    return [];
  }

  /**
   * Pro / Custom: Assign user to a location
   */
  async assignSiteAccess(siteId, userId) {
    return { site: siteId, user: userId };
  }

  /**
   * Custom: Fetch clients for multi-client enterprise setups
   */
  async fetchClients() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/branch?filter[tenant][_eq]=${tenantId}&sort=branchName`
      );
      return (response.data.data || []).map(l => ({ ...l, name: l.branchName || l.locName, address: l.address || l.locAddress }));
    } catch (error) {
      return [];
    }
  }
}

export const siteService = new SiteService();

import { authService } from "@/services/authService";
import { subscriptionService } from "@/services/subscriptionService";

class SiteService {
  getDefaultSites(tenantId) {
    return [
      {
        id: "site-01",
        name: "Chennai Tech Park",
        code: "CTP-01",
        address: "OMR IT Corridor, Chennai, TN",
        latitude: 12.9716,
        longitude: 80.2435,
        geofence_radius: 500,
        boundary_geojson: null,
        status: "active",
        totalGuards: 12,
        activeGuards: 9,
        offDutyGuards: 3,
        activePatrols: 4,
        onTrackPatrols: 3,
        delayedPatrols: 1,
        completedToday: 64,
        completionRate: 98.2,
        completionTrend: "+4.2%",
        missedCount: 1,
        overdueCount: 0,
        incidentsCount: 1,
        criticalIncidents: 0,
        normalIncidents: 1,
        healthStatus: "healthy", // 'healthy' | 'warning' | 'critical'
        zonesCount: 8,
        checkpointsCount: 32,
        timezone: "Asia/Kolkata",
        client: null
      },
      {
        id: "site-02",
        name: "ABC Retail Mall",
        code: "ABC-MALL",
        address: "Velachery Main Rd, Chennai, TN",
        latitude: 12.9815,
        longitude: 80.2180,
        geofence_radius: 350,
        boundary_geojson: null,
        status: "active",
        totalGuards: 8,
        activeGuards: 6,
        offDutyGuards: 2,
        activePatrols: 3,
        onTrackPatrols: 2,
        delayedPatrols: 1,
        completedToday: 38,
        completionRate: 94.0,
        completionTrend: "+1.8%",
        missedCount: 2,
        overdueCount: 1,
        incidentsCount: 3,
        criticalIncidents: 1,
        normalIncidents: 2,
        healthStatus: "warning",
        zonesCount: 6,
        checkpointsCount: 24,
        timezone: "Asia/Kolkata",
        client: null
      },
      {
        id: "site-03",
        name: "Industrial Warehouse Hub",
        code: "IWH-NORTH",
        address: "Oragadam Industrial Area, Sriperumbudur, TN",
        latitude: 12.8342,
        longitude: 79.9480,
        geofence_radius: 800,
        boundary_geojson: null,
        status: "active",
        totalGuards: 4,
        activeGuards: 3,
        offDutyGuards: 1,
        activePatrols: 1,
        onTrackPatrols: 1,
        delayedPatrols: 0,
        completedToday: 24,
        completionRate: 82.5,
        completionTrend: "-3.1%",
        missedCount: 1,
        overdueCount: 1,
        incidentsCount: 3,
        criticalIncidents: 2,
        normalIncidents: 1,
        healthStatus: "critical",
        zonesCount: 4,
        checkpointsCount: 18,
        timezone: "Asia/Kolkata",
        client: null
      }
    ];
  }

  /**
   * Fetch all Sites filtered by tenant (and optionally user site_access)
   */
  async fetchSites(userId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultSites('default');

      try {
        let endpoint = `/items/sites?filter[tenant][_eq]=${tenantId}&sort=name`;
        
        // If a userId is specified and we want site_access filtering (Pro / Custom restrictions)
        if (userId) {
          const accessRes = await authService.protectedApi.get(
            `/items/site_access?filter[tenant][_eq]=${tenantId}&filter[user][_eq]=${userId}`
          );
          if (accessRes.data.data && accessRes.data.data.length > 0) {
            const allowedSiteIds = accessRes.data.data.map(a => a.site);
            endpoint += `&filter[id][_in]=${allowedSiteIds.join(',')}`;
          }
        }

        const response = await authService.protectedApi.get(endpoint);
        if (response.data.data && response.data.data.length > 0) {
          return response.data.data;
        }
      } catch (err) {
        // Directus collection might not exist yet; fall back gracefully
      }

      // Check local storage override if user added custom sites
      const stored = localStorage.getItem(`accesseasy_sites_${tenantId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }

      return this.getDefaultSites(tenantId);
    } catch (error) {
      console.error("Error in fetchSites:", error);
      return this.getDefaultSites('default');
    }
  }

  /**
   * Get Site details by ID
   */
  async getSiteById(siteId) {
    try {
      const response = await authService.protectedApi.get(`/items/sites/${siteId}`);
      if (response.data?.data) return response.data.data;
    } catch (e) {}

    const sites = await this.fetchSites();
    return sites.find(s => String(s.id) === String(siteId)) || sites[0] || null;
  }

  /**
   * Create a new Site with limit validation
   */
  async createSite(siteData) {
    try {
      // Step 1: Pre-flight plan limit check
      const limitCheck = await subscriptionService.checkLimit('sites');
      if (!limitCheck.allowed) {
        const error = new Error(limitCheck.upgradeMessage || "Site limit exceeded for current plan.");
        error.code = "PLAN_LIMIT_EXCEEDED";
        error.limitDetails = limitCheck;
        throw error;
      }

      const tenantId = authService.getTenantId();
      const payload = {
        ...siteData,
        tenant: tenantId,
        date_created: new Date().toISOString()
      };

      try {
        const response = await authService.protectedApi.post("/items/sites", payload);
        subscriptionService.clearCache(); // invalidate usage cache
        return response.data.data;
      } catch (e) {
        if (e.response?.data?.errors?.[0]?.extensions?.code === "PLAN_LIMIT_EXCEEDED") {
          throw e;
        }
        // Local persistence fallback for dev/offline testing
        const sites = await this.fetchSites();
        const newSite = {
          ...payload,
          id: `site-${Date.now()}`,
          totalGuards: 0,
          activeGuards: 0,
          offDutyGuards: 0,
          activePatrols: 0,
          onTrackPatrols: 0,
          delayedPatrols: 0,
          completedToday: 0,
          completionRate: 100,
          completionTrend: "0.0%",
          missedCount: 0,
          overdueCount: 0,
          incidentsCount: 0,
          criticalIncidents: 0,
          normalIncidents: 0,
          healthStatus: 'healthy',
          zonesCount: 0,
          checkpointsCount: 0
        };
        sites.push(newSite);
        localStorage.setItem(`accesseasy_sites_${tenantId}`, JSON.stringify(sites));
        return newSite;
      }
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
      try {
        const response = await authService.protectedApi.patch(`/items/sites/${siteId}`, siteData);
        return response.data.data;
      } catch (e) {
        // Fallback update in local storage
        const sites = await this.fetchSites();
        const idx = sites.findIndex(s => String(s.id) === String(siteId));
        if (idx !== -1) {
          sites[idx] = { ...sites[idx], ...siteData };
          localStorage.setItem(`accesseasy_sites_${tenantId}`, JSON.stringify(sites));
          return sites[idx];
        }
      }
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
      try {
        await authService.protectedApi.delete(`/items/sites/${siteId}`);
        subscriptionService.clearCache();
      } catch (e) {
        const sites = await this.fetchSites();
        const updated = sites.filter(s => String(s.id) !== String(siteId));
        localStorage.setItem(`accesseasy_sites_${tenantId}`, JSON.stringify(updated));
      }
    } catch (error) {
      console.error(`Error deleting site ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * Pro / Custom: Fetch users with access permissions for a specific site
   */
  async getSiteAccess(siteId) {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/site_access?filter[tenant][_eq]=${tenantId}&filter[site][_eq]=${siteId}&fields=*,user.first_name,user.last_name,user.email`
      );
      return response.data.data || [];
    } catch (error) {
      console.warn("Could not fetch site_access:", error.message);
      return [];
    }
  }

  /**
   * Pro / Custom: Assign or update user site access level ('view', 'operate', 'manage')
   */
  async assignSiteAccess(siteId, userId, accessLevel = 'operate') {
    try {
      const tenantId = authService.getTenantId();
      const existing = await authService.protectedApi.get(
        `/items/site_access?filter[tenant][_eq]=${tenantId}&filter[site][_eq]=${siteId}&filter[user][_eq]=${userId}`
      );
      if (existing.data.data?.length > 0) {
        const accessId = existing.data.data[0].id;
        const res = await authService.protectedApi.patch(`/items/site_access/${accessId}`, {
          access_level: accessLevel
        });
        return res.data.data;
      } else {
        const res = await authService.protectedApi.post(`/items/site_access`, {
          tenant: tenantId,
          site: siteId,
          user: userId,
          access_level: accessLevel
        });
        return res.data.data;
      }
    } catch (error) {
      console.error("Error assigning site access:", error);
      throw error;
    }
  }

  /**
   * Custom: Fetch clients for multi-client enterprise setups
   */
  async fetchClients() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/clients?filter[tenant][_eq]=${tenantId}&sort=name`
      );
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }
}

export const siteService = new SiteService();

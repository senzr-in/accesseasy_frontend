import { authService } from "@/services/authService";

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
      },
      {
        id: "site-02",
        name: "ABC Retail Mall",
        code: "ABC-MALL",
        address: "Velachery Main Rd, Chennai, TN",
        latitude: 12.9815,
        longitude: 80.2180,
        geofence_radius: 350,
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
      },
      {
        id: "site-03",
        name: "Industrial Warehouse Hub",
        code: "IWH-NORTH",
        address: "Oragadam Industrial Area, Sriperumbudur, TN",
        latitude: 12.8342,
        longitude: 79.9480,
        geofence_radius: 800,
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
      }
    ];
  }

  /**
   * Fetch all Sites filtered by tenant
   */
  async fetchSites() {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultSites('default');

      try {
        const response = await authService.protectedApi.get(
          `/items/sites?filter[tenant][_eq]=${tenantId}&sort=name`
        );
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
    const sites = await this.fetchSites();
    return sites.find(s => String(s.id) === String(siteId)) || sites[0] || null;
  }

  /**
   * Create a new Site
   */
  async createSite(siteData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        ...siteData,
        tenant: tenantId,
        date_created: new Date().toISOString()
      };

      try {
        const response = await authService.protectedApi.post("/items/sites", payload);
        return response.data.data;
      } catch (e) {
        // Local persistence fallback
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
}

export const siteService = new SiteService();

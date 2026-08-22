import { authService } from "@/services/authService";

class GeofenceService {
  /**
   * Calculate distance between two GPS coordinates using Haversine formula (in meters)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * 4-Tier GPS Accuracy Evaluation Model
   *
   * @param {Object} params
   * @param {number} params.guardLat
   * @param {number} params.guardLng
   * @param {number} [params.guardAccuracy=10]
   * @param {number} params.cpLat
   * @param {number} params.cpLng
   * @param {number} [params.cpRadius=50]
   * @returns {{ status: 'VALID'|'WARNING'|'UNCERTAIN'|'VIOLATION', distanceM: number, accuracyM: number, message: string, confidencePct: number }}
   */
  evaluateGpsScan({ guardLat, guardLng, guardAccuracy = 10, cpLat, cpLng, cpRadius = 50 }) {
    const distanceM = this.calculateDistance(guardLat, guardLng, cpLat, cpLng);
    const accuracyM = Math.round(guardAccuracy);
    const radius = cpRadius || 50;

    // Condition 1: GPS signal is too noisy / indoor drift (accuracy >= 50% of radius or > 35m)
    if (accuracyM >= radius * 0.5 || accuracyM > 35) {
      return {
        status: "UNCERTAIN",
        distanceM,
        accuracyM,
        message: `GPS signal accuracy too weak (±${accuracyM}m) to definitively confirm perimeter. Scan accepted with UNCERTAIN flag.`,
        confidencePct: 45
      };
    }

    // Condition 2: Clear scan strictly within boundary
    if (distanceM <= radius && accuracyM <= 15) {
      return {
        status: "VALID",
        distanceM,
        accuracyM,
        message: `Verified on-site: scanned ${distanceM}m from checkpoint (within ${radius}m radius).`,
        confidencePct: 98
      };
    }

    // Condition 3: Slightly past boundary but within accuracy buffer (e.g. 55m with ±15m GPS error)
    if (distanceM <= radius + accuracyM * 0.6) {
      return {
        status: "WARNING",
        distanceM,
        accuracyM,
        message: `Scan close to perimeter edge (${distanceM}m away, radius: ${radius}m). Likely acceptable considering GPS margin.`,
        confidencePct: 75
      };
    }

    // Condition 4: Hard violation outside allowed geofence with solid GPS accuracy
    return {
      status: "VIOLATION",
      distanceM,
      accuracyM,
      message: `Geofence violation: checkpoint scanned ${distanceM}m away from allowed ${radius}m radius (GPS accuracy ±${accuracyM}m).`,
      confidencePct: 95
    };
  }

  getDefaultViolations() {
    return [];
  }

  /**
   * Fetch all logged geofence violations
   */
  async fetchViolations(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      try {
        let endpoint = `/items/geofence_violations?filter[tenant][_eq]=${tenantId}&sort=-timestamp`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const res = await authService.protectedApi.get(endpoint);
        if (res.data?.data) return res.data.data;
      } catch (e) {}

      const stored = localStorage.getItem(`accesseasy_violations_${tenantId}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (siteId) return list.filter(v => String(v.site) === String(siteId));
          return list;
        } catch (e) {}
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Log a new violation to backend and trigger SOC alert
   */
  async logViolation(violationData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        ...violationData,
        tenant: tenantId,
        timestamp: new Date().toISOString()
      };

      try {
        const res = await authService.protectedApi.post("/items/geofence_violations", payload);
        return res.data.data;
      } catch (e) {
        const list = await this.fetchViolations();
        const newViol = { id: `viol-${Date.now()}`, ...payload };
        list.unshift(newViol);
        localStorage.setItem(`accesseasy_violations_${tenantId}`, JSON.stringify(list));
        return newViol;
      }
    } catch (error) {
      console.error("Error logging violation:", error);
      throw error;
    }
  }
}

export const geofenceService = new GeofenceService();

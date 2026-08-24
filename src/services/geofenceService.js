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
   * Fetch all logged geofence violations from patrol_alerts
   */
  async fetchViolations(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      let endpoint = `/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&filter[type][_eq]=geofence&sort=-date_created`;
      if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
      
      const res = await authService.protectedApi.get(endpoint);
      if (res.data?.data) {
        return res.data.data.map(a => ({
          id: a.id,
          site: a.site,
          guard_name: a.guard_name || a.reported_by || 'Guard',
          checkpoint_name: a.title,
          geofence_status: 'VIOLATION',
          timestamp: a.date_created || a.timestamp,
          notes: a.notes,
          resolved: a.status === 'resolved' || a.status === 'closed'
        }));
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Log a new violation to patrol_alerts and trigger SOC alarm
   */
  async logViolation(violationData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenant: tenantId,
        title: `Geofence Breach: ${violationData.checkpoint_name || 'Checkpoint'} (${violationData.distance_m || 0}m out of bounds)`,
        type: "geofence",
        severity: "warning",
        status: "reported",
        site: violationData.site,
        guard_id: violationData.guard || violationData.guard_id || null,
        reported_by: violationData.guard_name || "Security Officer",
        notes: `GPS perimeter breach detected: Guard scanned ${violationData.distance_m || 0}m away from checkpoint station. GPS Precision: ±${violationData.accuracy_m || 10}m.`,
        action_log: [
          {
            stage: "reported",
            user: "Automated GPS Geofence Engine",
            time: new Date().toISOString(),
            notes: "Perimeter breach automatically logged by GPS geofence calibrator."
          }
        ],
        date_created: new Date().toISOString()
      };

      const res = await authService.protectedApi.post("/items/patrol_alerts", payload);
      return res.data.data;
    } catch (error) {
      console.error("Error logging violation to patrol_alerts:", error);
      throw error;
    }
  }
}

export const geofenceService = new GeofenceService();

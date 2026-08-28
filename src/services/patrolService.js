import { authService } from '@/services/authService';
import { subscriptionService } from '@/services/subscriptionService';

class PatrolService {
  constructor() {
    // Static data caches — refresh every 5 minutes
    this._cache = {};
    this._cacheExpiry = {};
    this._inFlight = new Map();
    this._TTL = 5 * 60 * 1000; // 5 minutes
  }

  _getCache(key) {
    if (this._cache[key] && Date.now() < (this._cacheExpiry[key] || 0)) {
      return this._cache[key];
    }
    return null;
  }

  _setCache(key, data, ttl = this._TTL) {
    this._cache[key] = data;
    this._cacheExpiry[key] = Date.now() + ttl;
  }

  invalidateCache(key = null) {
    if (key) {
      delete this._cache[key];
      delete this._cacheExpiry[key];
      this._inFlight.delete(key);
    } else {
      this._cache = {};
      this._cacheExpiry = {};
      this._inFlight.clear();
    }
  }

  async _fetchDeduplicated(cacheKey, fetchFn, ttl = this._TTL) {
    const cached = this._getCache(cacheKey);
    if (cached) return cached;

    if (this._inFlight.has(cacheKey)) {
      return this._inFlight.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const data = await fetchFn();
        if (data !== undefined && data !== null) {
          this._setCache(cacheKey, data, ttl);
        }
        return data;
      } finally {
        this._inFlight.delete(cacheKey);
      }
    })();

    this._inFlight.set(cacheKey, promise);
    return promise;
  }

  async getPatrols(siteId = null) {
    const tenantId = authService.getTenantId();
    const cacheKey = `patrols_${tenantId}_${siteId || 'all'}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        let endpoint = `/items/patrols?filter[tenant][_eq]=${tenantId}&sort=-scheduledTime&limit=100`;
        const response = await authService.protectedApi.get(endpoint);
        if (response.data?.data) {
          const patrols = response.data.data;
          if (siteId) {
            return patrols.filter(p => String(p.site || p.zoneId || '') === String(siteId));
          }
          return patrols;
        }
      } catch (error) {
        // Fallback to local storage
      }
      const stored = localStorage.getItem(`accesseasy_patrols_${tenantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (siteId) return parsed.filter(p => String(p.site) === String(siteId));
          return parsed;
        } catch (e) {}
      }
      return [];
    }, 30 * 1000); // 30s cache for active patrols
  }

  async fetchCheckpointGroups(siteId = null) {
    const tenantId = authService.getTenantId();
    const cacheKey = `checkpoint_groups_${tenantId}_${siteId || 'all'}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        let endpoint = `/items/checkpoint_groups?filter[tenant][_eq]=${tenantId}&sort=-date_created`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const response = await authService.protectedApi.get(endpoint);
        if (response.data?.data) {
          return response.data.data;
        }
      } catch (error) { /* Fallback to local storage */ }

      const stored = localStorage.getItem(`accesseasy_checkpoint_groups_${tenantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (siteId) return parsed.filter(g => String(g.site) === String(siteId));
          return parsed;
        } catch (e) {}
      }
      return [];
    });
  }

  async getMasterCheckpoints(siteId = null, zoneId = null) {
    const tenantId = authService.getTenantId();
    const cacheKey = `master_checkpoints_${tenantId}_${siteId || 'all'}_${zoneId || 'all'}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        let endpoint = `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[group_id][_null]=true&sort=-date_created`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        if (zoneId) endpoint += `&filter[zone][_eq]=${zoneId}`;
        
        const response = await authService.protectedApi.get(endpoint);
        if (response.data?.data) return response.data.data;
      } catch (error) {
        // Fallback to local storage
      }
      const stored = localStorage.getItem(`accesseasy_checkpoints_${tenantId}`);
      if (stored) {
        try {
          let parsed = JSON.parse(stored);
          if (siteId) parsed = parsed.filter(c => String(c.site) === String(siteId));
          if (zoneId) parsed = parsed.filter(c => String(c.zone) === String(zoneId));
          return parsed;
        } catch (e) {}
      }
      return [];
    });
  }

  async getCheckpoints(siteId = null) {
    const tenantId = authService.getTenantId();
    const cacheKey = `checkpoints_${tenantId}_${siteId || 'all'}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        let endpoint = `/items/checkpoints?filter[tenant][_eq]=${tenantId}&limit=250`;
        if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
        const response = await authService.protectedApi.get(endpoint);
        if (response.data?.data) {
          return response.data.data;
        }
      } catch (error) { /* Fallback to local storage */ }

      const stored = localStorage.getItem(`accesseasy_checkpoints_${tenantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (siteId) return parsed.filter(c => String(c.site) === String(siteId));
          return parsed;
        } catch (e) {}
      }
      return [];
    });
  }

  async getCheckpointsByZone(zoneId) {
    if (!zoneId) return [];
    const tenantId = authService.getTenantId();
    const cacheKey = `checkpoints_zone_${tenantId}_${zoneId}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        const response = await authService.protectedApi.get(
          `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[zone][_eq]=${zoneId}&sort=-date_created`
        );
        if (response.data?.data) return response.data.data;
      } catch (error) {
        // Fallback to local storage
      }
      const stored = localStorage.getItem(`accesseasy_checkpoints_${tenantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.filter(c => String(c.zone) === String(zoneId));
        } catch (e) {}
      }
      return [];
    });
  }

  async saveMasterCheckpoint(cpData) {
    const tenantId = authService.getTenantId();
    try {
      if (cpData.id) {
        const cleanPayload = { ...cpData };
        delete cleanPayload.zone;
        delete cleanPayload.expectedOffset;
        const res = await authService.protectedApi.patch(`/items/checkpoints/${cpData.id}`, cleanPayload);
        return res.data.data;
      } else {
        // Pre-flight plan limit check for checkpoints
        const limitCheck = await subscriptionService.checkLimit('checkpoints');
        if (!limitCheck.allowed) {
          const error = new Error(limitCheck.upgradeMessage || "Checkpoint limit exceeded for current plan.");
          error.code = "PLAN_LIMIT_EXCEEDED";
          error.limitDetails = limitCheck;
          throw error;
        }

        let instructions = cpData.instructions || '';
        if (cpData.zone) {
          const zId = typeof cpData.zone === 'object' && cpData.zone ? cpData.zone.id : cpData.zone;
          if (!instructions.includes('__ZONE_ASSIGNMENT__:')) {
            instructions = `__ZONE_ASSIGNMENT__:${zId} ${instructions}`.trim();
          }
        }

        const payload = {
          name: cpData.name,
          checkpoint_id: cpData.checkpoint_id || ('CP' + Math.floor(1000 + Math.random() * 9000)),
          group_id: null,
          tenant: tenantId,
          instructions: instructions,
          building_id: cpData.building_id || cpData.building || null,
          floor: cpData.floor || null,
          dwell_time: Number(cpData.dwell_time) || 0,
          status: cpData.status || 'active',
          allowed_radius_m: cpData.allowed_radius_m || 50,
          requires_nfc: Boolean(cpData.requires_nfc || cpData.nfc_uid || cpData.nfc_tag_id),
          requires_photo: Boolean(cpData.requires_photo)
        };

        if (cpData.nfc_uid || cpData.nfc_tag_id) {
          payload.nfc_uid = cpData.nfc_uid || cpData.nfc_tag_id;
        }

        const res = await authService.protectedApi.post("/items/checkpoints", payload);
        this.invalidateCache();
        subscriptionService.clearCache();
        return res.data.data;
      }
    } catch (error) {
      console.error("Error saving master checkpoint:", error?.response?.data || error);
      const errMsg = error.response?.data?.errors?.[0]?.message || error.message;
      throw new Error(errMsg);
    }
  }

  async deleteMasterCheckpoint(cpId) {
    const tenantId = authService.getTenantId();
    try {
      await authService.protectedApi.delete(`/items/checkpoints/${cpId}`);
      this.invalidateCache();
      subscriptionService.clearCache();
      return await this.getMasterCheckpoints();
    } catch (error) {
      console.error("Error deleting master checkpoint:", error);
      throw error;
    }
  }

  async createCheckpointGroup(payload) {
    const tenantId = authService.getTenantId();
    try {
      // Pre-flight limit check for patrol routes
      const limitCheck = await subscriptionService.checkLimit('patrol_routes');
      if (!limitCheck.allowed) {
        const error = new Error(limitCheck.upgradeMessage || "Patrol route limit exceeded for current plan.");
        error.code = "PLAN_LIMIT_EXCEEDED";
        error.limitDetails = limitCheck;
        throw error;
      }

      const data = { ...payload, tenant: tenantId, date_created: new Date().toISOString() };
      const response = await authService.protectedApi.post("/items/checkpoint_groups", data);
      subscriptionService.clearCache();
      return response.data.data;
    } catch (error) {
      console.error("Error creating checkpoint group:", error);
      throw error;
    }
  }

  async createPatrol(payload) {
    const tenantId = authService.getTenantId();
    try {
      const data = { ...payload, tenant: tenantId, date_created: new Date().toISOString() };
      const response = await authService.protectedApi.post("/items/patrols", data);
      return response.data.data;
    } catch (error) {
      console.error("Error scheduling patrol:", error);
      throw error;
    }
  }

  async createPatrolsBatch(patrolsList) {
    if (!patrolsList || patrolsList.length === 0) return [];
    const tenantId = authService.getTenantId();
    try {
      const now = new Date().toISOString();
      const payloadArray = patrolsList.map(p => ({
        ...p,
        tenant: tenantId,
        date_created: now
      }));
      const response = await authService.protectedApi.post("/items/patrols", payloadArray);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error batch scheduling patrols:", error);
      throw error;
    }
  }

  async getPatrolDetails(patrolId) {
    if (!patrolId) return { patrol: null, checkpoints: [], trackingPoints: [] };
    const cacheKey = `patrol_details_${patrolId}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        // Fetch details, tracking points, checkpoints for a patrol
        const response = await authService.protectedApi.get(`/items/patrols/${patrolId}?fields=*.*`);
        return {
          patrol: response.data.data,
          checkpoints: response.data.data.checkpoints || [],
          trackingPoints: response.data.data.tracking_points || []
        };
      } catch (error) {
        console.error("Error fetching patrol details:", error);
        return {
          patrol: null,
          checkpoints: [],
          trackingPoints: []
        };
      }
    }, 15 * 1000); // 15s cache for individual patrol detail
  }

  async getAlerts(siteId = null) {
    const tenantId = authService.getTenantId();
    const cacheKey = `patrol_alerts_${tenantId}_${siteId || 'all'}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        let endpoint = tenantId 
          ? `/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created`
          : `/items/patrol_alerts?sort=-date_created`;
        const response = await authService.protectedApi.get(endpoint);
        if (response.data?.data) {
          const alerts = response.data.data;
          if (siteId) {
            return alerts.filter(a => String(a.site || a.location || '') === String(siteId));
          }
          return alerts;
        }
      } catch (error) {
        // Fallback to local storage
      }
      const stored = localStorage.getItem(`accesseasy_patrol_alerts_${tenantId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (siteId) return parsed.filter(a => String(a.site) === String(siteId));
          return parsed;
        } catch (e) {}
      }
      return [];
    }, 10 * 1000);
  }

  async updateAlertStatus(alertId, status) {
    try {
      await authService.protectedApi.patch(`/items/patrol_alerts/${alertId}`, { status });
      this.invalidateCache();
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }

  async getCheckpointsForRoute(groupId) {
    if (!groupId) return [];
    const tenantId = authService.getTenantId();
    const cacheKey = `route_checkpoints_${tenantId}_${groupId}`;

    return this._fetchDeduplicated(cacheKey, async () => {
      try {
        const response = await authService.protectedApi.get(
          `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[group_id][_eq]=${groupId}&sort=sort_order&limit=50`
        );
        return response.data?.data || [];
      } catch (error) {
        console.error("Error fetching checkpoints:", error);
        return [];
      }
    });
  }

  async getTodayPatrolLogs(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      const today = new Date().toISOString().split('T')[0];
      let endpoint = `/items/patrol_logs?filter[tenant][_eq]=${tenantId}&filter[date_created][_gte]=${today}T00:00:00&sort=-date_created&limit=500`;
      if (siteId) {
        endpoint += `&filter[site_id][_eq]=${siteId}`;
      }
      try {
        const response = await authService.protectedApi.get(endpoint);
        return response.data?.data || [];
      } catch (e) {
        const res = await authService.protectedApi.get(`/items/patrol_logs?filter[date_created][_gte]=${today}T00:00:00&sort=-date_created&limit=500`);
        return res.data?.data || [];
      }
    } catch (error) {
      console.error("Error fetching today's patrol logs:", error);
      return [];
    }
  }

  async getPatrolLogs(patrolId) {
    if (!patrolId) return [];
    try {
      const response = await authService.protectedApi.get(
        `/items/patrol_logs?filter[patrol_id][_eq]=${patrolId}&sort=timestamp`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching patrol logs:", error);
      return [];
    }
  }

  async saveCheckpoint(groupId, cpData) {
    try {
      const tenantId = authService.getTenantId();
      
      // If the checkpoint already exists (has a DB id), update it
      if (cpData.id) {
        const cleanPayload = {
          group_id: groupId,
          name: cpData.name,
          status: cpData.status || 'active',
          sort_order: typeof cpData.sort_order === 'number' ? cpData.sort_order : 0
        };
        await authService.protectedApi.patch(`/items/checkpoints/${cpData.id}`, cleanPayload);
      } else {
        // Pre-flight check limit
        const limitCheck = await subscriptionService.checkLimit('checkpoints');
        if (!limitCheck.allowed) {
          const error = new Error(limitCheck.upgradeMessage || "Checkpoint limit exceeded for current plan.");
          error.code = "PLAN_LIMIT_EXCEEDED";
          error.limitDetails = limitCheck;
          throw error;
        }

        let instructions = cpData.instructions || '';
        if (cpData.zone) {
          const zId = typeof cpData.zone === 'object' && cpData.zone ? cpData.zone.id : cpData.zone;
          if (!instructions.includes('__ZONE_ASSIGNMENT__:')) {
            instructions = `__ZONE_ASSIGNMENT__:${zId} ${instructions}`.trim();
          }
        }

        // Create new
        const payload = {
          name: cpData.name,
          checkpoint_id: cpData.checkpoint_id || ('CP' + Math.floor(1000 + Math.random() * 9000)),
          group_id: groupId,
          tenant: tenantId,
          instructions: instructions,
          building_id: cpData.building_id || null,
          floor: cpData.floor || null,
          dwell_time: Number(cpData.dwell_time) || 0,
          status: cpData.status || 'active',
          sort_order: typeof cpData.sort_order === 'number' ? cpData.sort_order : 0,
          allowed_radius_m: cpData.allowed_radius_m || 50,
          requires_nfc: Boolean(cpData.requires_nfc || cpData.nfc_uid || cpData.nfc_tag_id),
          requires_photo: Boolean(cpData.requires_photo)
        };

        if (cpData.nfc_uid || cpData.nfc_tag_id) {
          payload.nfc_uid = cpData.nfc_uid || cpData.nfc_tag_id;
        }
        
        await authService.protectedApi.post("/items/checkpoints", payload);
      }
      
      this.invalidateCache();
      return await this.getCheckpointsForRoute(groupId);
    } catch (error) {
      console.error("Error saving checkpoint:", error?.response?.data || error);
      const errMsg = error.response?.data?.errors?.[0]?.message || error.message;
      throw new Error(errMsg);
    }
  }

  async saveCheckpointsBatch(groupId, list) {
    if (!list || list.length === 0) return [];
    const tenantId = authService.getTenantId();
    try {
      const payloadArray = list.map((cpData, index) => {
        let instructions = cpData.instructions || '';
        if (cpData.zone) {
          const zId = typeof cpData.zone === 'object' && cpData.zone ? cpData.zone.id : cpData.zone;
          if (!instructions.includes('__ZONE_ASSIGNMENT__:')) {
            instructions = `__ZONE_ASSIGNMENT__:${zId} ${instructions}`.trim();
          }
        }

        const item = {
          name: cpData.name,
          checkpoint_id: cpData.checkpoint_id || ('CP' + Math.floor(1000 + Math.random() * 9000)),
          group_id: groupId,
          tenant: tenantId,
          instructions: instructions,
          building_id: cpData.building_id || null,
          floor: cpData.floor || null,
          dwell_time: Number(cpData.dwell_time) || 0,
          status: cpData.status || 'active',
          sort_order: typeof cpData.sort_order === 'number' ? cpData.sort_order : index,
          allowed_radius_m: cpData.allowed_radius_m || 50,
          requires_nfc: Boolean(cpData.requires_nfc || cpData.nfc_uid || cpData.nfc_tag_id),
          requires_photo: Boolean(cpData.requires_photo)
        };

        if (cpData.nfc_uid || cpData.nfc_tag_id) {
          item.nfc_uid = cpData.nfc_uid || cpData.nfc_tag_id;
        }

        return item;
      });

      const response = await authService.protectedApi.post("/items/checkpoints", payloadArray);
      this.invalidateCache();
      return response.data?.data || [];
    } catch (error) {
      console.error("Error batch saving checkpoints:", error?.response?.data || error);
      const errMsg = error.response?.data?.errors?.[0]?.message || error.message;
      throw new Error(errMsg);
    }
  }

  async deleteCheckpoint(groupId, cpId) {
    try {
      const res = await authService.protectedApi.get(`/items/checkpoints?filter[group_id][_eq]=${groupId}&filter[checkpoint_id][_eq]=${cpId}`);
      if (res.data.data && res.data.data.length > 0) {
        const dbId = res.data.data[0].id;
        await authService.protectedApi.delete(`/items/checkpoints/${dbId}`);
      } else {
        await authService.protectedApi.delete(`/items/checkpoints/${cpId}`);
      }
      this.invalidateCache();
      subscriptionService.clearCache();
      return await this.getCheckpointsForRoute(groupId);
    } catch (error) {
      console.error("Error deleting checkpoint:", error);
      throw error;
    }
  }

  async reorderCheckpoints(groupId, newList) {
    try {
      const updates = newList.map((cp, index) => {
        return {
          id: cp.id,
          sort_order: index
        };
      }).filter(u => u.id);
      
      if (updates.length > 0) {
        await authService.protectedApi.patch("/items/checkpoints", updates);
      }
      
      this.invalidateCache();
      return await this.getCheckpointsForRoute(groupId);
    } catch (error) {
      console.error("Error reordering checkpoints:", error);
      throw error;
    }
  }
  
  async getTrackingPoints(patrolId) {
    if (!patrolId) return [];
    try {
      const response = await authService.protectedApi.get(
        `/items/tracking_points?filter[patrol_id][_eq]=${patrolId}&sort=date_created&limit=-1`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tracking points:", error);
      return [];
    }
  }
  
  async updatePatrolStatus(patrolId, status) {
    try {
      await authService.protectedApi.patch(`/items/patrols/${patrolId}`, { status });
    } catch (error) {
      console.error('Error updating patrol status:', error);
      throw error;
    }
  }

  async updatePatrol(patrolId, payload) {
    try {
      const response = await authService.protectedApi.patch(`/items/patrols/${patrolId}`, payload);
      return response.data.data;
    } catch (error) {
      console.error('Error updating patrol:', error);
      throw error;
    }
  }

  async deletePatrol(patrolId) {
    try {
      await authService.protectedApi.delete(`/items/patrols/${patrolId}`);
      subscriptionService.clearCache();
    } catch (error) {
      console.error('Error deleting patrol:', error);
      throw error;
    }
  }
  async getGuardHandovers(siteId = null) {
    const tenantId = authService.getTenantId();
    try {
      let endpoint = `/items/guard_handovers?filter[tenant][_eq]=${tenantId}&sort=-timestamp&limit=50`;
      const response = await authService.protectedApi.get(endpoint);
      const list = response.data?.data || [];
      if (siteId) {
        return list.filter(h => String(h.site_id || h.site || '') === String(siteId));
      }
      return list;
    } catch (error) {
      console.warn('Error fetching guard handovers (collection may be empty):', error);
      return [];
    }
  }

}

export const patrolService = new PatrolService();

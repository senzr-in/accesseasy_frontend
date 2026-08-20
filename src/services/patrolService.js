import { authService } from '@/services/authService';
import { subscriptionService } from '@/services/subscriptionService';

class PatrolService {
  async getPatrols(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      let endpoint = `/items/patrols?filter[tenant][_eq]=${tenantId}&sort=-scheduledTime&limit=100`;
      if (siteId) {
        endpoint += `&filter[site][_eq]=${siteId}`;
      }
      const response = await authService.protectedApi.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching patrols:", error);
      return [];
    }
  }

  async fetchCheckpointGroups(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      let endpoint = `/items/checkpoint_groups?filter[tenant][_eq]=${tenantId}&sort=-date_created`;
      if (siteId) {
        endpoint += `&filter[site][_eq]=${siteId}`;
      }
      const response = await authService.protectedApi.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching checkpoint groups:", error);
      return [];
    }
  }

  async getMasterCheckpoints(siteId = null, zoneId = null) {
    try {
      const tenantId = authService.getTenantId();
      let endpoint = `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[group_id][_null]=true&sort=-date_created`;
      if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
      if (zoneId) endpoint += `&filter[zone][_eq]=${zoneId}`;
      
      const response = await authService.protectedApi.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching master checkpoints:", error);
      return [];
    }
  }

  async getCheckpoints(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      let endpoint = `/items/checkpoints?filter[tenant][_eq]=${tenantId}&limit=250`;
      if (siteId) endpoint += `&filter[site][_eq]=${siteId}`;
      
      const response = await authService.protectedApi.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all checkpoints:", error);
      return [];
    }
  }

  async getCheckpointsByZone(zoneId) {
    if (!zoneId) return [];
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[zone][_eq]=${zoneId}&sort=-date_created`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching checkpoints by zone:", error);
      return [];
    }
  }

  async saveMasterCheckpoint(cpData) {
    try {
      const tenantId = authService.getTenantId();
      if (cpData.id) {
        await authService.protectedApi.patch(`/items/checkpoints/${cpData.id}`, cpData);
      } else {
        // Pre-flight plan limit check for checkpoints
        const limitCheck = await subscriptionService.checkLimit('checkpoints');
        if (!limitCheck.allowed) {
          const error = new Error(limitCheck.upgradeMessage || "Checkpoint limit exceeded for current plan.");
          error.code = "PLAN_LIMIT_EXCEEDED";
          error.limitDetails = limitCheck;
          throw error;
        }

        const payload = {
          ...cpData,
          group_id: null,
          tenant: tenantId,
          allowed_radius_m: cpData.allowed_radius_m || 50,
          requires_nfc: cpData.requires_nfc || false,
          requires_photo: cpData.requires_photo || false
        };
        await authService.protectedApi.post("/items/checkpoints", payload);
        subscriptionService.clearCache();
      }
      return await this.getMasterCheckpoints(cpData.site, cpData.zone);
    } catch (error) {
      console.error("Error saving master checkpoint:", error);
      throw error;
    }
  }

  async deleteMasterCheckpoint(cpId) {
    try {
      await authService.protectedApi.delete(`/items/checkpoints/${cpId}`);
      subscriptionService.clearCache();
      return await this.getMasterCheckpoints();
    } catch (error) {
      console.error("Error deleting master checkpoint:", error);
      throw error;
    }
  }

  async createCheckpointGroup(payload) {
    try {
      // Pre-flight limit check for patrol routes
      const limitCheck = await subscriptionService.checkLimit('patrol_routes');
      if (!limitCheck.allowed) {
        const error = new Error(limitCheck.upgradeMessage || "Patrol route limit exceeded for current plan.");
        error.code = "PLAN_LIMIT_EXCEEDED";
        error.limitDetails = limitCheck;
        throw error;
      }

      const tenantId = authService.getTenantId();
      const data = { ...payload, tenant: tenantId };
      const response = await authService.protectedApi.post("/items/checkpoint_groups", data);
      subscriptionService.clearCache();
      return response.data.data;
    } catch (error) {
      console.error("Error creating checkpoint group:", error);
      throw error;
    }
  }

  async createPatrol(payload) {
    try {
      // Pre-flight limit check for active patrols
      const limitCheck = await subscriptionService.checkLimit('active_patrols');
      if (!limitCheck.allowed) {
        const error = new Error(limitCheck.upgradeMessage || "Active patrol limit reached for today.");
        error.code = "PLAN_LIMIT_EXCEEDED";
        error.limitDetails = limitCheck;
        throw error;
      }

      const tenantId = authService.getTenantId();
      const data = { ...payload, tenant: tenantId };
      const response = await authService.protectedApi.post("/items/patrols", data);
      subscriptionService.clearCache();
      return response.data.data;
    } catch (error) {
      console.error("Error scheduling patrol:", error);
      throw error;
    }
  }

  async getPatrolDetails(patrolId) {
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
  }

  async getAlerts(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      let endpoint = `/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created`;
      if (siteId) {
        endpoint += `&filter[site][_eq]=${siteId}`;
      }
      const response = await authService.protectedApi.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  async updateAlertStatus(alertId, status) {
    try {
      await authService.protectedApi.patch(`/items/patrol_alerts/${alertId}`, { status });
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }

  async getCheckpointsForRoute(groupId) {
    if (!groupId) return [];
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[group_id][_eq]=${groupId}&sort=sort_order&limit=50`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching checkpoints:", error);
      return [];
    }
  }

  async getTodayPatrolLogs(siteId = null) {
    try {
      const tenantId = authService.getTenantId();
      const today = new Date().toISOString().split('T')[0];
      let endpoint = `/items/patrol_logs?filter[tenant][_eq]=${tenantId}&filter[date_created][_gte]=${today}T00:00:00&sort=timestamp`;
      if (siteId) {
        endpoint += `&filter[site][_eq]=${siteId}`;
      }
      const response = await authService.protectedApi.get(endpoint);
      return response.data.data;
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
        await authService.protectedApi.patch(`/items/checkpoints/${cpData.id}`, cpData);
      } else {
        // Pre-flight check limit
        const limitCheck = await subscriptionService.checkLimit('checkpoints');
        if (!limitCheck.allowed) {
          const error = new Error(limitCheck.upgradeMessage || "Checkpoint limit exceeded for current plan.");
          error.code = "PLAN_LIMIT_EXCEEDED";
          error.limitDetails = limitCheck;
          throw error;
        }

        // Create new
        const payload = {
          ...cpData,
          group_id: groupId,
          tenant: tenantId,
          allowed_radius_m: cpData.allowed_radius_m || 50,
          requires_nfc: cpData.requires_nfc || false,
          requires_photo: cpData.requires_photo || false
        };
        const currentList = await this.getCheckpointsForRoute(groupId);
        payload.sort_order = currentList.length;
        
        await authService.protectedApi.post("/items/checkpoints", payload);
        subscriptionService.clearCache();
      }
      
      return await this.getCheckpointsForRoute(groupId);
    } catch (error) {
      console.error("Error saving checkpoint:", error);
      throw error;
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
}

export const patrolService = new PatrolService();

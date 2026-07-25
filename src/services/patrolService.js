import { authService } from '@/services/authService';

class PatrolService {
  async getPatrols() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/patrols?filter[tenant][_eq]=${tenantId}&sort=-scheduledTime&limit=100`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching patrols:", error);
      return [];
    }
  }


  async fetchCheckpointGroups() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/checkpoint_groups?filter[tenant][_eq]=${tenantId}&sort=-date_created`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching checkpoint groups:", error);
      return [];
    }
  }

  async getMasterCheckpoints() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[group_id][_null]=true&sort=-date_created`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching master checkpoints:", error);
      return [];
    }
  }

  async getCheckpoints() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/checkpoints?filter[tenant][_eq]=${tenantId}&limit=250`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all checkpoints:", error);
      return [];
    }
  }

  async saveMasterCheckpoint(cpData) {
    try {
      const tenantId = authService.getTenantId();
      if (cpData.id) {
        await authService.protectedApi.patch(`/items/checkpoints/${cpData.id}`, cpData);
      } else {
        const payload = { ...cpData, group_id: null, tenant: tenantId };
        await authService.protectedApi.post("/items/checkpoints", payload);
      }
      return await this.getMasterCheckpoints();
    } catch (error) {
      console.error("Error saving master checkpoint:", error);
      throw error;
    }
  }

  async deleteMasterCheckpoint(cpId) {
    try {
      await authService.protectedApi.delete(`/items/checkpoints/${cpId}`);
      return await this.getMasterCheckpoints();
    } catch (error) {
      console.error("Error deleting master checkpoint:", error);
      throw error;
    }
  }

  async createCheckpointGroup(payload) {
    try {
      const tenantId = authService.getTenantId();
      const data = { ...payload, tenant: tenantId };
      const response = await authService.protectedApi.post("/items/checkpoint_groups", data);
      return response.data.data;
    } catch (error) {
      console.error("Error creating checkpoint group:", error);
      throw error;
    }
  }

  async createPatrol(payload) {
    try {
      const tenantId = authService.getTenantId();
      const data = { ...payload, tenant: tenantId };
      const response = await authService.protectedApi.post("/items/patrols", data);
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

  async getAlerts() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created`
      );
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

  async getTodayPatrolLogs() {
    try {
      const tenantId = authService.getTenantId();
      const today = new Date().toISOString().split('T')[0];
      const response = await authService.protectedApi.get(
        `/items/patrol_logs?filter[tenant][_eq]=${tenantId}&filter[date_created][_gte]=${today}T00:00:00&sort=timestamp`
      );
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
        // Create new
        const payload = { ...cpData, group_id: groupId, tenant: tenantId };
        // Ensure sort_order is set by taking count
        const currentList = await this.getCheckpointsForRoute(groupId);
        payload.sort_order = currentList.length;
        
        await authService.protectedApi.post("/items/checkpoints", payload);
      }
      
      // Fetch and return the updated list
      return await this.getCheckpointsForRoute(groupId);
    } catch (error) {
      console.error("Error saving checkpoint:", error);
      throw error;
    }
  }

  async deleteCheckpoint(groupId, cpId) {
    try {
      // Find the checkpoint DB id by checkpoint_id if cpId is not the DB id
      const res = await authService.protectedApi.get(`/items/checkpoints?filter[group_id][_eq]=${groupId}&filter[checkpoint_id][_eq]=${cpId}`);
      if (res.data.data && res.data.data.length > 0) {
        const dbId = res.data.data[0].id;
        await authService.protectedApi.delete(`/items/checkpoints/${dbId}`);
      } else {
        // Fallback: cpId might be the dbId
        await authService.protectedApi.delete(`/items/checkpoints/${cpId}`);
      }
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
          id: cp.id, // Directus requires the primary key for bulk updates
          sort_order: index
        };
      }).filter(u => u.id); // ensure we have db ids
      
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
    } catch (error) {
      console.error('Error deleting patrol:', error);
      throw error;
    }
  }
}

export const patrolService = new PatrolService();

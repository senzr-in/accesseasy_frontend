import { authService } from "@/services/authService";

class AntipassbackService {
  /**
   * Fetch all doors from the items/doors collection
   * @returns {Promise<Array>} List of doors
   */
  async fetchDoors() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/doors?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching doors:", error);
      throw error;
    }
  }

  /**
   * Create a new antipassback zone
   * @param {Object} zoneData - Zone configuration object
   * @returns {Promise<Object>} Created zone object
   */
  async createZone(zoneData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        ...zoneData,
        tenant: tenantId,
      };
      
      console.log("Creating zone payload:", JSON.stringify(payload, null, 2));

      const response = await authService.protectedApi.post(
        "/items/antiPassbackModeZones",
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating zone:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      throw error;
    }
  }

  /**
   * Update an antipassback zone
   * @param {number|string} zoneId - ID of the zone to update
   * @param {Object} zoneData - Zone configuration object
   * @returns {Promise<Object>} Updated zone object
   */
  async updateZone(zoneId, zoneData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        ...zoneData,
        tenant: tenantId,
      };

      const response = await authService.protectedApi.patch(
        `/items/antiPassbackModeZones/${zoneId}`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an antipassback zone
   * @param {number|string} zoneId - ID of the zone to delete
   * @returns {Promise<void>}
   */
  async deleteZone(zoneId) {
    try {
      await authService.protectedApi.delete(
        `/items/antiPassbackModeZones/${zoneId}`
      );
    } catch (error) {
      console.error(`Error deleting zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all antipassback zones
   * @returns {Promise<Array>} List of zones
   */
  async fetchZones() {
    try {
      const response = await authService.protectedApi.get(
        "/items/antiPassbackModeZones"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching zones:", error);
      throw error;
    }
  }
}

export const antipassbackService = new AntipassbackService();

import { authService } from "@/services/authService";

class InterlockService {
  /**
   * Fetch all interlock rules
   * @returns {Promise<Array>} List of interlock rules
   */
  async fetchRules() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/interlockMode?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching interlock rules:", error);
      throw error;
    }
  }

  /**
   * Create a new interlock rule
   * @param {Object} ruleData - Rule configuration object
   * @returns {Promise<Object>} Created rule object
   */
  async createRule(ruleData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        ...ruleData,
        tenant: tenantId,
      };

      const response = await authService.protectedApi.post(
        "/items/interlockMode",
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating interlock rule:", error);
      throw error;
    }
  }

  /**
   * Update an interlock rule
   * @param {number|string} ruleId - ID of the rule to update
   * @param {Object} ruleData - Rule configuration object
   * @returns {Promise<Object>} Updated rule object
   */
  async updateRule(ruleId, ruleData) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        ...ruleData,
        tenant: tenantId,
      };

      const response = await authService.protectedApi.patch(
        `/items/interlockMode/${ruleId}`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating interlock rule ${ruleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an interlock rule
   * @param {number|string} ruleId - ID of the rule to delete
   * @returns {Promise<void>}
   */
  async deleteRule(ruleId) {
    try {
      await authService.protectedApi.delete(`/items/interlockMode/${ruleId}`);
    } catch (error) {
      console.error(`Error deleting interlock rule ${ruleId}:`, error);
      throw error;
    }
  }
}

export const interlockService = new InterlockService();

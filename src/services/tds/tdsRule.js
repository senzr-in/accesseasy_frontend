import { ref } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

export const tdsRules = ref([]);

export const fetchTDSRules = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
    const token = authService.getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const params = {};

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsRules${queryString ? `?${queryString}` : ''}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    tdsRules.value = data?.data || [];
    console.log('Matched Phase:', tdsRules.value); 
  } catch (error) {
    console.error("Error fetching TDS rules:", error);
  }
};

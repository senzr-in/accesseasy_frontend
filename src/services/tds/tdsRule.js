import { ref } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

export const tdsRules = ref([]);

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

export const fetchTDSRules = async () => {
  try {
    const params = {
      // [`filter[tenant][tenantId][_eq]`]: tenantId,
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsRules?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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

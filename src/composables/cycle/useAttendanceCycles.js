// composables/cycle/useAttendanceCycles.js
import { ref } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";

export function useAttendanceCycles() {
  const cycles = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const recordId = ref(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = authService.getToken();

  const fetchCycles = async () => {
    loading.value = true;
    error.value = null;

    try {
      const tenantId = await currentUserTenant.getTenantIdAsync();
      if (!tenantId) throw new Error("Tenant ID not found");

      const queryParams = new URLSearchParams();
      const fields = [
        "multi_attendance_cycle",
        "id",
        "tenant.tenantId",
        "tenant.tenantName",
      ];
      fields.forEach((field) => queryParams.append("fields[]", field));

      const response = await fetch(
        `${API_BASE_URL}/items/attendanceCycle?${queryParams.toString()}&filter[tenant][tenantId]=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const cycleData = data.data[0];
        recordId.value = cycleData.id;
        cycles.value = cycleData.multi_attendance_cycle?.cycles || [];
      } else {
        recordId.value = null;
        cycles.value = [];
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching attendance cycles:", err);
    } finally {
      loading.value = false;
    }
  };

  const createCycle = async (cycleData) => {
    loading.value = true;
    error.value = null;

    try {
      const tenantId = await currentUserTenant.getTenantIdAsync();
      if (!tenantId) throw new Error("Tenant ID not found");

      const newCycleId = Math.max(...cycles.value.map((c) => c.cycleId), 0) + 1;
      const newCycle = { cycleId: newCycleId, ...cycleData };
      const updatedCycles = [...cycles.value, newCycle];

      if (recordId.value) {
        await fetch(`${API_BASE_URL}/items/attendanceCycle/${recordId.value}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            multi_attendance_cycle: { cycles: updatedCycles },
          }),
        });
      } else {
        const response = await fetch(`${API_BASE_URL}/items/attendanceCycle`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            multi_attendance_cycle: { cycles: updatedCycles },
            tenant: { tenantId },
          }),
        });

        const resData = await response.json();
        recordId.value = resData.data?.id || null;
      }

      cycles.value = updatedCycles;
    } catch (err) {
      error.value = err.message;
      console.error("Error creating attendance cycle:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCycle = async (cycleId, cycleData) => {
    loading.value = true;
    error.value = null;

    try {
      if (!recordId.value)
        throw new Error("No attendanceCycle record for tenant");

      const updatedCycles = cycles.value.map((cycle) =>
        cycle.cycleId === cycleId ? { ...cycle, ...cycleData } : cycle,
      );

      await fetch(`${API_BASE_URL}/items/attendanceCycle/${recordId.value}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          multi_attendance_cycle: { cycles: updatedCycles },
        }),
      });

      cycles.value = updatedCycles;
    } catch (err) {
      error.value = err.message;
      console.error("Error updating attendance cycle:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCycleById = async (cycleId) => {
    loading.value = true;
    error.value = null;

    try {
      if (!recordId.value)
        throw new Error("No attendanceCycle record for tenant");

      const updatedCycles = cycles.value.filter(
        (cycle) => cycle.cycleId !== cycleId,
      );

      await fetch(`${API_BASE_URL}/items/attendanceCycle/${recordId.value}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          multi_attendance_cycle: { cycles: updatedCycles },
        }),
      });

      cycles.value = updatedCycles;
    } catch (err) {
      error.value = err.message;
      console.error("Error deleting attendance cycle:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    cycles,
    loading,
    error,
    fetchCycles,
    createCycle,
    updateCycle,
    deleteCycleById,
  };
}

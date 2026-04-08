// @utils/taskexport/detchcycletype.js
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export async function fetchCycleTypes() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance cycles");
    }

    const data = await response.json();

    // Extract cycle types from multi_attendance_cycle field
    if (data.data && data.data.length > 0) {
      const multiAttendanceCycle = data.data[0].multi_attendance_cycle;

      // Check if multi_attendance_cycle has a cycles array
      if (
        multiAttendanceCycle &&
        multiAttendanceCycle.cycles &&
        Array.isArray(multiAttendanceCycle.cycles)
      ) {
        return multiAttendanceCycle.cycles.map((cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          includeWeekends: cycle.includeWeekends,
          includeHolidays: cycle.includeHolidays,
        }));
      } else {
        console.warn("No cycles found in multi_attendance_cycle");
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    throw error;
  }
}

// export function getCycleById(cycles, cycleId) {
//   return cycles.find((cycle) => cycle.cycleId === cycleId);
// }
export function getCycleById(cycles, cycleId) {
  const cycle = cycles.find((c) => c.cycleId === cycleId);
  if (!cycle && cycleId === 1) {
    return {
      cycleId: 1,
      cycleName: "Normal Employee",
      startDate: "1",
      endDate: "End of the month",
    };
  }
  return cycle;
}

export function formatCycleDates(cycle, selectedMonth, currentYear) {
  if (!cycle) return { start: null, end: null };

  const month = selectedMonth !== null ? selectedMonth : new Date().getMonth();
  const year = currentYear || new Date().getFullYear();

  // Form start date: year + month + cycle startDate
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(cycle.startDate).padStart(2, "0")}`;

  // Form end date: year + month + cycle endDate
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(cycle.endDate).padStart(2, "0")}`;

  return { start: startDate, end: endDate };
}

// src/composables/workorder/tasks/useTaskFilters.js
import { ref, reactive, computed } from "vue";

export function useTaskFilters() {
  const searchQuery = ref("");
  const filters = reactive({
    month: "",
    assignFormId: "",
    status: "",
    orgId: "",
    employeeUserId: "",
  });

  const hasActiveFilters = computed(() => {
    return (
      filters.month !== "" ||
      filters.assignFormId !== "" ||
      filters.status !== "" ||
      filters.orgId !== "" ||
      filters.employeeUserId !== "" ||
      searchQuery.value !== ""
    );
  });

  const buildTaskFilterParams = (excludeStatus = false) => {
    const params = {};
    let andIndex = 0;

    // ---------- SEARCH ----------
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const orBase = `filter[_and][${andIndex}][_or]`;
      params[`${orBase}[0][title][_icontains]`] = query;
      params[`${orBase}[1][description][_icontains]`] = query;
      params[`${orBase}[2][orgId][orgName][_icontains]`] = query;
      params[`${orBase}[3][employeeId][assignedUser][first_name][_icontains]`] =
        query;
      params[`${orBase}[4][employeeId][employeeId][_icontains]`] = query;
      params[`${orBase}[5][taskType][_icontains]`] = query;
      params[`${orBase}[6][status][_icontains]`] = query;
      andIndex++;
    }

    // Exclude archived
    params[`filter[_and][${andIndex}][status][_neq]`] = "archived";
    andIndex++;

    if (filters.month) {
      params[`filter[_and][${andIndex}][month(from)][_eq]`] = filters.month;
      andIndex++;
    }

    if (filters.assignFormId) {
      params[`filter[_and][${andIndex}][assignFormId][id][_eq]`] =
        filters.assignFormId;
      andIndex++;
    }

    if (filters.status && !excludeStatus) {
      params[`filter[_and][${andIndex}][status][_eq]`] = filters.status;
      andIndex++;
    }

    if (filters.orgId) {
      params[`filter[_and][${andIndex}][orgId][id][_eq]`] = filters.orgId;
      andIndex++;
    }

    if (filters.employeeUserId) {
      params[`filter[_and][${andIndex}][employeeId][assignedUser][id][_eq]`] =
        filters.employeeUserId;
      andIndex++;
    }

    return params;
  };

  const clearAllFilters = () => {
    filters.month = "";
    filters.assignFormId = "";
    filters.status = "";
    filters.orgId = "";
    filters.employeeUserId = "";
    searchQuery.value = "";
  };

  const clearMonthFilter = () => (filters.month = "");
  const clearTaskTypeFilter = () => (filters.assignFormId = "");
  const clearStatusFilter = () => (filters.status = "");
  const clearClientFilter = () => (filters.orgId = "");
  const clearEmployeeFilter = () => (filters.employeeUserId = "");

  // Debounced search
  let searchTimeout = null;
  const debouncedApplyFilters = (callback) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => callback?.(), 300);
  };

  return {
    searchQuery,
    filters,
    hasActiveFilters,
    buildTaskFilterParams,
    clearAllFilters,
    clearMonthFilter,
    clearTaskTypeFilter,
    clearStatusFilter,
    clearClientFilter,
    clearEmployeeFilter,
    debouncedApplyFilters,
  };
}

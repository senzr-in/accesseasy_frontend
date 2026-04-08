// src/composables/workorder/fieldTrips/usefieldTripsFilters.js
import { ref, reactive, computed } from "vue";

export function usefieldTripsFilters() {
  const searchQuery = ref("");
  const filters = reactive({
    month: "",
    tripType: "",
    employeeId: "",
    orgId: "",
    status: "",
    assignFormId: "",
  });

  const hasActiveFilters = computed(() => {
    return (
      filters.month !== "" ||
      filters.tripType !== "" ||
      filters.employeeId !== "" ||
      filters.orgId !== "" ||
      filters.status !== "" ||
      filters.assignFormId !== "" ||
      searchQuery.value !== ""
    );
  });

  const buildFieldTripFilterParams = (excludeStatus = false) => {
    const params = {};
    let andIndex = 0;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const orBase = `filter[_and][${andIndex}][_or]`;
      params[`${orBase}[0][title][_icontains]`] = query;
      params[`${orBase}[1][purpose][_icontains]`] = query;
      params[`${orBase}[2][orgId][orgName][_icontains]`] = query;
      params[`${orBase}[3][employeeId][assignedUser][first_name][_icontains]`] =
        query;
      params[`${orBase}[4][employeeId][employeeId][_icontains]`] = query;
      params[`${orBase}[5][tripType][_icontains]`] = query;
      params[`${orBase}[6][status][_icontains]`] = query;
      andIndex++;
    }

    params[`filter[_and][${andIndex}][status][_neq]`] = "archived";
    andIndex++;
    params[`filter[_and][${andIndex}][tripType][_nnull]`] = "true";
    andIndex++;

    if (filters.month) {
      params[`filter[_and][${andIndex}][month(from)][_eq]`] = filters.month;
      andIndex++;
    }

    if (filters.tripType) {
      params[`filter[_and][${andIndex}][tripType][_eq]`] = filters.tripType;
      andIndex++;
    }

    if (filters.employeeId) {
      params[`filter[_and][${andIndex}][employeeId][employeeId][_eq]`] =
        filters.employeeId;
      andIndex++;
    }

    if (filters.orgId) {
      params[`filter[_and][${andIndex}][orgId][id][_eq]`] = filters.orgId;
      andIndex++;
    }

    if (filters.status && !excludeStatus) {
      params[`filter[_and][${andIndex}][status][_eq]`] = filters.status;
      andIndex++;
    }

    if (filters.assignFormId) {
      params[`filter[_and][${andIndex}][assignFormId][id][_eq]`] =
        filters.assignFormId;
      andIndex++;
    }

    return params;
  };

  const filterByStatus = (status) => {
    filters.status = status; // Set the status filter
  };

  const clearAllFilters = () => {
    filters.month = "";
    filters.tripType = "";
    filters.employeeId = "";
    filters.orgId = "";
    filters.status = "";
    filters.assignFormId = "";
    searchQuery.value = "";
  };

  const clearMonthFilter = () => {
    filters.month = "";
  };

  const clearTripTypeFilter = () => {
    filters.tripType = "";
  };

  const clearEmployeeFilter = () => {
    filters.employeeId = "";
  };

  const clearOrgFilter = () => {
    filters.orgId = "";
  };

  const clearStatusFilter = () => {
    filters.status = "";
  };

  const clearAssignFormFilter = () => {
    filters.assignFormId = "";
  };

  let searchTimeout = null;
  const debouncedApplyFilters = (callback) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (callback) callback();
    }, 300);
  };

  return {
    searchQuery,
    filters,
    hasActiveFilters,
    buildFieldTripFilterParams,
    filterByStatus,
    clearAllFilters,
    clearMonthFilter,
    clearTripTypeFilter,
    clearEmployeeFilter,
    clearOrgFilter,
    clearStatusFilter,
    clearAssignFormFilter,
    debouncedApplyFilters,
  };
}

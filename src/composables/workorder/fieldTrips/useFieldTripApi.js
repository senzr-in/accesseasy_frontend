// src/composables/workorder/fieldTrips/useFieldTripApi.js
import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export function useFieldTripApi() {
  const API_TOKEN = authService.getToken();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
  const API_ENDPOINTS = {
    tasks: "/items/tasks",
    branches: "/items/branch",
    formTemplates: "/items/tenant_template",
  };

  const fieldTrips = ref([]);
  const branches = ref([]);
  const formTemplates = ref([]);
  const loading = ref(false);
  const error = ref("");
  const totalItems = ref(0);
  const fieldTripCounts = ref({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const encryptPolyline = (polyline) => {
    if (!polyline) return null;
    try {
      return btoa(polyline);
    } catch (e) {
      console.error("Error encrypting polyline:", e);
      return polyline;
    }
  };

  const decryptPolyline = (encryptedPolyline) => {
    if (!encryptedPolyline) return null;
    try {
      return atob(encryptedPolyline);
    } catch (e) {
      console.error("Error decrypting polyline:", e);
      return encryptedPolyline;
    }
  };

  const fetchFieldTripStatusCounts = async () => {
    try {
      if (!API_TOKEN) {
        throw new Error("Authentication token not found");
      }

      const tenantId = await currentUserTenant.getTenantIdAsync();
      if (!tenantId) {
        throw new Error("Tenant ID not found");
      }

      const params = {
        "aggregate[count]": "id",
        "groupBy[]": "status",
        "filter[tripType][_nnull]": true,
        "filter[tenant][tenantId][_eq]": tenantId,
        "filter[status][_neq]": "archived",
      };

      const queryString = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.tasks}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Reset counts
      fieldTripCounts.value = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
      };

      // Update counts based on API response
      data.data.forEach((item) => {
        const status = item.status.toLowerCase();
        const count = Number(item.count.id) || 0;
        if (status in fieldTripCounts.value) {
          fieldTripCounts.value[status] = count;
        }
        fieldTripCounts.value.total += count;
      });
    } catch (err) {
      console.error("Error fetching status counts:", err);
      error.value = "Failed to fetch status counts.";
    }
  };

  const fetchFieldTripAggregateCount = async (filters = {}) => {
    try {
      if (!API_TOKEN) {
        throw new Error("Authentication token not found");
      }

      const tenantId = await currentUserTenant.getTenantIdAsync();
      if (!tenantId) {
        throw new Error("Tenant ID not found");
      }

      const params = {
        "aggregate[count]": "id",
        "filter[tripType][_nnull]": true,
        "filter[tenant][tenantId][_eq]": tenantId,
        ...filters,
      };

      const queryString = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.tasks}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      totalItems.value = Number(data?.data?.[0]?.count?.id) || 0;
    } catch (err) {
      console.error("Error fetching aggregate count:", err);
      totalItems.value = 0;
    }
  };

  const fetchFieldTrips = async ({
    page = 1,
    itemsPerPage = 25,
    sortBy = "from",
    sortDirection = "desc",
    filters = {},
  } = {}) => {
    loading.value = true;
    error.value = "";

    try {
      const tenantId = await currentUserTenant.getTenantIdAsync();
      if (!tenantId) {
        throw new Error("Tenant ID not found. Please refresh and try again.");
      }

      await fetchFieldTripAggregateCount(filters);

      let url = `${API_BASE_URL}${API_ENDPOINTS.tasks}?filter[tenant][tenantId][_eq]=${tenantId}&filter[tripType][_nnull]=true`;
      url += `&fields[]=id&fields[]=title&fields[]=taskType&fields[]=dueTime&fields[]=from&fields[]=status&fields[]=purpose&fields[]=tripType&fields[]=distanceKm&fields[]=lat&fields[]=lng&fields[]=currentLat&fields[]=currentLng&fields[]=routePolyline`;
      url += `&fields[]=employeeId.employeeId&fields[]=employeeId.assignedUser.first_name&fields[]=orgId.orgName`;
      url += `&page=${page}&limit=${itemsPerPage}`;

      if (sortBy) {
        url += `&sort=${sortDirection === "desc" ? "-" : ""}${sortBy}`;
      }

      const queryString = Object.keys(filters)
        .map((key) => `${key}=${encodeURIComponent(filters[key])}`)
        .join("&");

      if (queryString) {
        url += `&${queryString}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        fieldTrips.value = data.data.map((trip) => {
          let employeeIdValue = "";
          let assignedUserName = "";
          if (trip.employeeId) {
            if (
              typeof trip.employeeId === "object" &&
              trip.employeeId.employeeId
            ) {
              employeeIdValue = trip.employeeId.employeeId;
              if (
                trip.employeeId.assignedUser &&
                trip.employeeId.assignedUser.first_name
              ) {
                assignedUserName = trip.employeeId.assignedUser.first_name;
              }
            } else if (typeof trip.employeeId === "string") {
              employeeIdValue = trip.employeeId;
            }
          }

          let orgName = "";
          if (trip.orgId) {
            if (typeof trip.orgId === "object" && trip.orgId.orgName) {
              orgName = trip.orgId.orgName;
            } else if (typeof trip.orgId === "string") {
              orgName = trip.orgId;
            }
          }

          return {
            id: trip.id || Math.random().toString(36).substr(2, 9),
            title: trip.title || "",
            employeeId: employeeIdValue,
            assignedUser: { first_name: assignedUserName },
            taskType: trip.taskType || "",
            dueTime: trip.dueTime || "",
            from: trip.from || "",
            status: trip.status || "pending",
            orgName: orgName,
            distanceKm: trip.distanceKm || 0,
            purpose: trip.purpose || "",
            tripType: trip.tripType || "",
            lat: trip.lat || 0,
            lng: trip.lng || 0,
            currentLat: trip.currentLat || 0,
            currentLng: trip.currentLng || 0,
            routePolyline: encryptPolyline(trip.routePolyline) || null,
          };
        });

        // Update counts after fetching trips
        await fetchFieldTripStatusCounts();
      } else {
        fieldTrips.value = [];
      }
    } catch (err) {
      console.error("Error fetching field trips:", err);
      error.value =
        err.message ||
        "Failed to load field trips. Please check your connection and try again.";
      fieldTrips.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchBranches = async () => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.branches}?fields[]=id&fields[]=branchName`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data) {
        branches.value = data.data.map((branch) => ({
          id: branch.id,
          branchName: branch.branchName || "",
        }));
      } else {
        branches.value = [];
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchFormTemplates = async () => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.formTemplates}?fields[]=id&fields[]=formName`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data) {
        formTemplates.value = data.data.map((form) => ({
          id: form.id,
          formName: form.formName || "",
        }));
      } else {
        formTemplates.value = [];
      }
    } catch (err) {
      console.error("Error fetching form templates:", err);
    }
  };

  const deleteSelectedFieldTrips = async (fieldTripIds) => {
    if (fieldTripIds.length === 0) {
      alert("No field trips selected for deletion.");
      return false;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${fieldTripIds.length} selected field trips?`,
      )
    ) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tasks}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fieldTripIds),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.errors?.[0]?.message || "Unknown error"}`,
        );
      }

      alert(`${fieldTripIds.length} field trips deleted successfully!`);
      return true;
    } catch (err) {
      console.error("Error deleting field trips:", err);
      alert(`Failed to delete field trips: ${err.message}. Please try again.`);
      return false;
    }
  };

  return {
    fieldTrips,
    branches,
    formTemplates,
    loading,
    error,
    totalItems,
    fieldTripCounts,
    fetchFieldTrips,
    fetchBranches,
    fetchFormTemplates,
    deleteSelectedFieldTrips,
    fetchFieldTripStatusCounts, // Expose the new method
  };
}

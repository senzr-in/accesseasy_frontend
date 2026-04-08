// src/composables/workorder/tasks/useTaskApi.js
import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useTaskFilters } from "@/composables/workorder/tasks/useTaskFilters";

export function useTaskApi() {
  const API_TOKEN = authService.getToken();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
  const API_ENDPOINTS = {
    tasks: "/items/tasks",
    branches: "/items/branch",
    formTemplates: "/items/tenant_template",
    organization: "/items/organization",
    personalModule: "/items/personalModule",
  };

  const { buildTaskFilterParams } = useTaskFilters();

  // State
  const tasks = ref([]);
  const branches = ref([]);
  const formTemplates = ref([]);
  const loading = ref(false);
  const error = ref("");
  const totalItems = ref(0);
  const taskCounts = ref({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overDue: 0,
    cancelled: 0,
  });
  const statusCounts = ref({
    total: 0,
    pending: 0,
    overDue: 0,
    completed: 0,
    cancelled: 0,
  });

  // NEW: Organizations & Employees
  const organizations = ref([]);
  const employees = ref([]);

  const validateCredentials = async () => {
    if (!API_TOKEN) {
      throw new Error("Authentication token not found. Please log in again.");
    }
    await currentUserTenant.initialize();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId) {
      await currentUserTenant.refresh();
      const retryTenantId = await currentUserTenant.getTenantIdAsync();
      if (!retryTenantId) {
        throw new Error("Tenant ID not found. Please check your session.");
      }
      return {
        tenantId: retryTenantId,
        role: await currentUserTenant.getRoleAsync(),
        userId: await currentUserTenant.getUserIdAsync(),
      };
    }
    const role = await currentUserTenant.getRoleAsync();
    const userId = await currentUserTenant.getUserIdAsync();
    return { tenantId, role, userId };
  };

  // Fetch task aggregate count
  const fetchTaskAggregateCount = async (filters = {}, role, userId) => {
    try {
      const { tenantId } = await validateCredentials();
      const params = {
        "aggregate[count]": "id",
        [`filter[tenant][tenantId][_eq]`]: tenantId,
        ...filters,
      };
      if (role === "Employee") {
        params["filter[_and][0][_and][0][employeeId][assignedUser][_eq]"] =
          userId;
      }
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
      const data = await response.json();
      totalItems.value = Number(data?.data?.[0]?.count?.id) || 0;
    } catch (err) {
      console.error("Error fetching aggregate count:", err);
      totalItems.value = 0;
      throw err;
    }
  };

  // Fetch status aggregate counts
  const fetchStatusAggregateCounts = async (filters = {}, role, userId) => {
    try {
      const { tenantId } = await validateCredentials();
      const params = {
        "aggregate[count]": "id",
        "groupBy[]": "status",
        [`filter[tenant][tenantId][_eq]`]: tenantId,
        ...filters,
      };
      if (role === "Employee") {
        params["filter[_and][0][_and][0][employeeId][assignedUser][_eq]"] =
          userId;
      }
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
      const data = await response.json();
      const groups = data?.data || [];
      const byStatus = Object.fromEntries(
        groups.map((g) => [g.status, Number(g?.count?.id) || 0]),
      );
      statusCounts.value = {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        pending: byStatus.pending || 0,
        overDue: byStatus.overDue || 0,
        completed: byStatus.completed || 0,
        cancelled: byStatus.cancelled || 0,
      };
    } catch (err) {
      console.error("Error fetching status aggregates:", err);
      statusCounts.value = {
        total: 0,
        pending: 0,
        overDue: 0,
        completed: 0,
        cancelled: 0,
      };
      throw err;
    }
  };

  // Fetch tasks
  const fetchTasks = async ({
    page = 1,
    itemsPerPage = 25,
    sortBy = "date_created",
    sortDirection = "desc",
    filters = {},
    skipAggregateCount = false,
  } = {}) => {
    loading.value = true;
    error.value = "";
    try {
      const { tenantId, role, userId } = await validateCredentials();
      if (!skipAggregateCount) {
        await Promise.all([
          fetchTaskAggregateCount(filters, role, userId),
          fetchStatusAggregateCounts(buildTaskFilterParams(true), role, userId),
        ]);
      }
      const fields = [
        "id",
        "radiusInMeters",
        "taskType",
        "status",
        "title",
        "description",
        "employeeId.employeeId",
        "employeeId.assignedUser.first_name",
        "tenant.tenantName",
        "dueTime",
        "from",
        "orgId.orgName",
        "orgLocation.locdetail",
        "orgLocation.locSize",
        "task_priority",
        "assignFormId",
        "amountExpected",
        "clientOtp",
        "client_HappyCode",
      ];
      let url = `${API_BASE_URL}${API_ENDPOINTS.tasks}?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=${fields.join(
        "&fields[]=",
      )}`;
      if (role === "Employee") {
        url += `&filter[_and][0][_and][0][employeeId][assignedUser][_eq]=${userId}`;
      }
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
      const data = await response.json();
      if (data && data.data) {
        tasks.value = data.data.map((task) => {
          if (!task.id) {
            console.error("Task missing ID:", task);
            throw new Error("Task ID is missing in API response");
          }
          return {
            id: task.id,
            title: task.title || "",
            description: task.description || "",
            taskType: task.taskType || "",
            status: task.status || "pending",
            assignFormId: task.assignFormId,
            employeeId: task.employeeId?.employeeId || "",
            assignedUser: task.employeeId?.assignedUser?.first_name || "",
            orgName: task.orgId?.orgName || "",
            dueTime: task.dueTime || "",
            from: task.from || "",
            tenantName: task.tenant?.tenantName || "",
            radiusInMeters: task.radiusInMeters || null,
            locationName: task.orgLocation?.locdetail?.locationName || "",
            address: task.orgLocation?.locdetail?.address || "",
            pincodes: task.orgLocation?.locdetail?.pincodes || [],
            locSize: task.orgLocation?.locSize || "",
            task_priority: task.task_priority || "medium",
            amountExpected: task.amountExpected || null,
            clientOtp: task.clientOtp || "",
            client_HappyCode: task.client_HappyCode || "",
          };
        });
        calculateTaskCounts();
      } else {
        tasks.value = [];
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      error.value =
        err.message ||
        "Failed to load tasks. Please check your connection and try again.";
      tasks.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update task: ${response.status}`,
        );
      }
      return await response.json();
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // Update multiple tasks
  const updateMultipleTasks = async (taskIds, updates) => {
    try {
      await Promise.all(taskIds.map((id) => updateTask(id, updates)));
      return true;
    } catch (err) {
      console.error("Error updating multiple tasks:", err);
      throw err;
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const { tenantId } = await validateCredentials();
      const url = `${API_BASE_URL}${API_ENDPOINTS.branches}?fields[]=id&fields[]=branchName&filter[tenant][tenantId][_eq]=${tenantId}`;
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
      branches.value = data.data
        ? data.data.map((branch) => ({
            id: branch.id,
            branchName: branch.branchName || "",
          }))
        : [];
    } catch (err) {
      console.error("Error fetching branches:", err);
      throw err;
    }
  };

  // Fetch form templates
  const fetchFormTemplates = async () => {
    try {
      const { tenantId } = await validateCredentials();
      const url = `${API_BASE_URL}${API_ENDPOINTS.formTemplates}?fields[]=id&fields[]=formName&filter[tenant][tenantId][_eq]=${tenantId}`;
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
      formTemplates.value = data.data
        ? data.data.map((form) => ({
            id: form.id,
            formName: form.formName || "",
          }))
        : [];
    } catch (err) {
      console.error("Error fetching form templates:", err);
      throw err;
    }
  };

  // NEW: Fetch Organizations
  const fetchOrganizations = async () => {
    try {
      const { tenantId } = await validateCredentials();
      const params = new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "id"],
        ["fields[]", "orgName"],
        ["fields[]", "orgType"],
        ["filter[_and][0][tenant][tenantId][_eq]", tenantId],
        ["filter[_and][1][status][_neq]", "archived"],
        ["sort", "orgName"],
      ]).toString();

      const url = `${API_BASE_URL}${API_ENDPOINTS.organization}?${params}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      organizations.value = (json?.data ?? []).map((o) => ({
        id: o.id,
        label: `${o.orgName} (${o.orgType ?? "—"})`,
      }));
    } catch (e) {
      console.error("fetchOrganizations error:", e);
      organizations.value = [];
    }
  };

  // NEW: Fetch Employees
  const fetchEmployees = async () => {
    try {
      const { tenantId } = await validateCredentials();
      const params = new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "employeeId"],
        ["fields[]", "assignedUser.id"],
        ["fields[]", "assignedUser.first_name"],
        ["filter[_and][0][assignedUser][tenant][tenantId][_eq]", tenantId],
      ]).toString();

      const url = `${API_BASE_URL}${API_ENDPOINTS.personalModule}?${params}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      const map = new Map();
      (json?.data ?? []).forEach((item) => {
        const user = item.assignedUser;
        if (user?.id && user?.first_name) {
          map.set(user.id, {
            id: user.id,
            label: user.first_name,
          });
        }
      });
      employees.value = Array.from(map.values());
    } catch (e) {
      console.error("fetchEmployees error:", e);
      employees.value = [];
    }
  };

  // ---------- SEARCH ORGANIZATIONS ----------
  const searchOrganizations = async (query = "") => {
    try {
      const { tenantId } = await validateCredentials();
      const params = new URLSearchParams([
        ["limit", "50"],
        ["fields[]", "id"],
        ["fields[]", "orgName"],
        ["fields[]", "orgType"],
        ["filter[_and][0][tenant][tenantId][_eq]", tenantId],
        ["filter[_and][1][status][_neq]", "archived"],
      ]);

      if (query) {
        params.append("filter[_and][2][orgName][_icontains]", query);
      } else {
        params.append("sort", "orgName");
      }

      const url = `${API_BASE_URL}${API_ENDPOINTS.organization}?${params}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      const results = (json?.data ?? []).map((o) => ({
        id: o.id,
        label: `${o.orgName} (${o.orgType ?? "—"})`,
      }));

      // DEDUPE: merge with staticOptions (already loaded in full list)
      const map = new Map();
      // 1. Add static (full list) first
      organizations.value.forEach((org) => {
        map.set(org.id, { id: org.id, label: org.label });
      });
      // 2. Add search results (overwrite if needed)
      results.forEach((r) => map.set(r.id, r));

      return Array.from(map.values());
    } catch (e) {
      console.error("searchOrganizations error:", e);
      return [];
    }
  };

  // ---------- SEARCH EMPLOYEES ----------
  const searchEmployees = async (query = "") => {
    try {
      const { tenantId } = await validateCredentials();
      const params = new URLSearchParams([
        ["limit", "50"],
        ["fields[]", "employeeId"],
        ["fields[]", "assignedUser.id"],
        ["fields[]", "assignedUser.first_name"],
        ["filter[_and][0][assignedUser][tenant][tenantId][_eq]", tenantId],
      ]);

      if (query) {
        params.append(
          "filter[_and][1][assignedUser][first_name][_icontains]",
          query,
        );
      } else {
        params.append("sort", "assignedUser.first_name");
      }

      const url = `${API_BASE_URL}${API_ENDPOINTS.personalModule}?${params}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      const results = (json?.data ?? [])
        .map((item) => {
          const user = item.assignedUser;
          return user?.id && user?.first_name
            ? { id: user.id, label: user.first_name }
            : null;
        })
        .filter(Boolean);

      // DEDUPE: merge with static employees list
      const map = new Map();
      employees.value.forEach((emp) => {
        map.set(emp.id, { id: emp.id, label: emp.label });
      });
      results.forEach((r) => map.set(r.id, r));

      return Array.from(map.values());
    } catch (e) {
      console.error("searchEmployees error:", e);
      return [];
    }
  };

  // Delete selected tasks
  const deleteSelectedTasks = async (taskIds) => {
    if (!taskIds || taskIds.length === 0) {
      error.value = "No tasks selected for deletion.";
      return false;
    }
    try {
      await validateCredentials();
      const payload = { keys: taskIds };
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tasks}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.errors?.[0]?.message ||
            `HTTP error! status: ${response.status}`,
        );
      }
      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Error deleting tasks:", err);
      error.value = err.message || "Failed to delete tasks. Please try again.";
      return false;
    }
  };

  // Calculate task counts
  const calculateTaskCounts = () => {
    const allTasks = tasks.value;
    taskCounts.value = {
      total: totalItems.value,
      pending: allTasks.filter((t) => t.status === "pending").length,
      inProgress: allTasks.filter((t) => t.status === "inprogress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      overDue: allTasks.filter((t) => t.status === "overDue").length,
      cancelled: allTasks.filter((t) => t.status === "cancelled").length,
    };
  };

  return {
    tasks,
    branches,
    formTemplates,
    loading,
    error,
    totalItems,
    taskCounts,
    statusCounts,
    organizations,
    employees,
    fetchTasks,
    fetchBranches,
    fetchFormTemplates,
    fetchOrganizations,
    fetchEmployees,
    deleteSelectedTasks,
    updateTask,
    updateMultipleTasks,
    fetchStatusAggregateCounts,
    searchOrganizations,
    searchEmployees,
  };
}

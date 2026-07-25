// /senzrfieldopsfrontend/src/composables/workorder/createWorkOrderForm/useFormApi.js
import { ref, computed } from "vue";
import { authService } from "../../../services/authService";
import { currentUserTenant } from "../../../utils/currentUserTenant";

export function useFormApi() {
  const formDetails = ref(null);
  const clients = ref([]);
  const users = ref([]);
  const departments = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const submissionError = ref(null);

  const token = ref(authService.getToken());
  const tenantId = computed(() => currentUserTenant.getTenantId());
  const userRole = computed(() => currentUserTenant.getRole());
  const userId = computed(() => currentUserTenant.getUserId());

  // Utility function to get the first present value from a list of keys
  const getFirstPresent = (obj, keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };

  const fetchFormDetails = async (formTemplateId) => {
    loading.value = true;
    error.value = null;

    try {
      if (!token.value)
        throw new Error("Authentication token not found. Please log in.");

      const params = {
        "fields[]": [
          "formName",
          "custom_FormTemplate",
          "tenant.tenantName",
          "assignedOrgnization.orgName",
          "id",
        ],
      };

      const queryString = Object.keys(params)
        .map((key) => {
          if (Array.isArray(params[key]))
            return params[key].map((field) => `${key}=${field}`).join("&");
          return `${key}=${params[key]}`;
        })
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${formTemplateId}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response for formDetails:", data);
      formDetails.value = data.data;
    } catch (err) {
      console.error("Error fetching form details:", err);
      error.value =
        err.message || "Failed to fetch form details. Please try again.";
    } finally {
      loading.value = false;
    }
  };

  const fetchDropdownData = async (limit = 100) => {
    if (!token.value || !tenantId.value) {
      console.warn(
        "Token or Tenant ID not available for fetching dropdown data.",
      );
      return;
    }

    try {
      // Clients - limit to 100 initially
      const clientParams = new URLSearchParams([
        ["limit", limit.toString()],
        ["fields[]", "orgName"],
        ["fields[]", "id"],
        ["fields[]", "orgId.email"],
        ["fields[]", "orgType"],
        ["filter[_and][0][_and][0][tenant][tenantId][_eq]", tenantId.value],
        ["filter[_and][1][status][_neq]", "archived"],
        ["sort", "orgName"],
      ]).toString();

      const clientsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/organization?${clientParams}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );
      if (!clientsResponse.ok) throw new Error("Failed to fetch clients");

      const clientsData = await clientsResponse.json();
      clients.value = clientsData.data.map((c) => ({
        orgName: c.orgName,
        id: c.id,
      }));

      // Employees (personalModule) - Adjust based on user role
      const employeeParams = new URLSearchParams([
        ["limit", limit.toString()],
        ["fields[]", "employeeId"],
        ["fields[]", "assignedUser.first_name"],
        ["fields[]", "assignedUser.last_name"],
        ["fields[]", "id"],
        [
          "filter[_and][0][assignedUser][tenant][tenantId][_eq]",
          tenantId.value,
        ],
        ["sort", "employeeId"],
      ]);

      if (userRole.value === "Employee") {
        employeeParams.append(
          "filter[_and][1][assignedUser][id][_eq]",
          userId.value,
        );
      }

      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?${employeeParams}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );
      if (!usersResponse.ok) throw new Error("Failed to fetch employees");

      const usersJson = await usersResponse.json();
      const pmList = usersJson.data || [];
      const personalIds = pmList.map((u) => u.id).filter(Boolean);

      const today = new Date().toISOString().slice(0, 10);
      const attendanceMap = new Map();
      if (personalIds.length > 0) {
        const attParams = new URLSearchParams([
          ["limit", "-1"],
          ["fields[]", "id"],
          ["fields[]", "status"],
          ["fields[]", "employeeId.id"],
          ["fields[]", "employeeId.employeeId"],
          ["filter[_and][0][date][_eq]", today],
          ["filter[_and][1][employeeId][id][_in]", personalIds.join(",")],
        ]).toString();

        const attRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance?${attParams}`,
          {
            headers: { Authorization: `Bearer ${token.value}` },
          },
        );

        if (attRes.ok) {
          const attJson = await attRes.json();
          (attJson.data || []).forEach((a) => {
            attendanceMap.set(a?.employeeId?.id, { status: a?.status || null });
          });
        } else {
          console.warn(
            "Attendance fetch failed, proceeding without status badges",
          );
        }
      }

      const statusLabel = (s) =>
        s === "in"
          ? "Punched In"
          : s === "out"
            ? "Punched Out"
            : "Not Punched In";
      const statusColor = (s) =>
        s === "in" ? "green" : s === "out" ? "red" : "orange";

      users.value = pmList.map((u) => {
        const first = u.assignedUser?.first_name || "";
        const last = u.assignedUser?.last_name || "";
        const empId = u.employeeId || "N/A";
        const name = `${first} ${last}`.trim();
        const display = `${name} (${empId})`;

        const att = attendanceMap.get(u.id) || { status: null };
        return {
          id: u.id,
          employeeId: empId,
          firstName: display,
          label: display,
          attendance: {
            status: att.status,
            label: statusLabel(att.status),
            color: statusColor(att.status),
          },
          assignedUser: u.assignedUser,
        };
      });

      const teamEnabled =
        formDetails.value?.custom_FormTemplate?.shared_properties?.booleans
          ?.team;
      if (teamEnabled) {
        await fetchDepartments(limit);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchDepartments = async (limit = 100) => {
    if (!token.value || !tenantId.value) {
      console.warn(
        "Token or Tenant ID not available for fetching departments.",
      );
      return [];
    }

    try {
      const params = new URLSearchParams([
        ["limit", limit.toString()],
        ["fields[]", "departmentName"],
        ["fields[]", "departmentId"],
        ["fields[]", "id"],
        ["sort[]", "sort"],
        ["page", "1"],
        ["filter[status][_neq]", "archived"],
        ["filter[_and][0][tenant][tenantId][_eq]", tenantId.value],
      ]).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/department?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch departments");

      const data = await response.json();
      departments.value = (data?.data || []).map((dept) => ({
        id: dept.id,
        departmentName: dept.departmentName,
        departmentId: dept.departmentId,
      }));

      console.log("[v0] Fetched departments:", departments.value.length);
      return departments.value;
    } catch (err) {
      console.error("Error fetching departments:", err);
      departments.value = [];
      return [];
    }
  };

  const searchDepartments = async (searchQuery) => {
    if (!token.value || !tenantId.value) {
      console.warn(
        "Token or Tenant ID not available for searching departments.",
      );
      return [];
    }

    try {
      const params = [
        ["limit", "100"],
        ["fields[]", "departmentName"],
        ["fields[]", "departmentId"],
        ["fields[]", "id"],
        ["sort[]", "sort"],
        ["filter[status][_neq]", "archived"],
        ["filter[_and][0][tenant][tenantId][_eq]", tenantId.value],
      ];

      // Add search filter for department name
      if (searchQuery && searchQuery.trim()) {
        params.push([
          "filter[_and][1][departmentName][_contains]",
          searchQuery.trim(),
        ]);
      }

      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/department?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to search departments");

      const data = await response.json();
      const results = (data?.data || []).map((dept) => ({
        id: dept.id,
        departmentName: dept.departmentName,
        departmentId: dept.departmentId,
      }));

      console.log("[v0] Department search results:", results.length);
      return results;
    } catch (err) {
      console.error("Error searching departments:", err);
      return [];
    }
  };

  const searchOrganizations = async (searchQuery, orgType = null) => {
    if (!token.value || !tenantId.value) {
      console.warn(
        "Token or Tenant ID not available for searching organizations.",
      );
      return [];
    }

    try {
      const params = [
        ["limit", "100"],
        ["fields[]", "orgName"],
        ["fields[]", "id"],
        ["fields[]", "orgType"],
        ["filter[_and][0][tenant][tenantId][_eq]", tenantId.value],
        ["filter[_and][1][status][_neq]", "archived"],
        ["sort", "orgName"],
      ];

      // Add search filter for organization name
      if (searchQuery && searchQuery.trim()) {
        params.push([
          "filter[_and][2][orgName][_contains]",
          searchQuery.trim(),
        ]);
      }

      // Add org type filter if specified
      if (orgType) {
        const orgTypeFilter = orgType === "Client" ? "clientorg" : "contact";
        params.push(["filter[_and][3][orgType][_contains]", orgTypeFilter]);
      }

      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/organization?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to search organizations");

      const data = await response.json();
      return (data?.data || []).map((org) => ({
        id: org.id,
        orgName: org.orgName,
        orgType: org.orgType,
      }));
    } catch (err) {
      console.error("Error searching organizations:", err);
      return [];
    }
  };

  const searchUsers = async (searchQuery) => {
    if (!token.value || !tenantId.value) {
      console.warn("Token or Tenant ID not available for searching users.");
      return [];
    }

    try {
      const params = [
        ["limit", "100"],
        ["fields[]", "employeeId"],
        ["fields[]", "assignedUser.first_name"],
        ["fields[]", "assignedUser.last_name"],
        ["fields[]", "id"],
        [
          "filter[_and][0][assignedUser][tenant][tenantId][_eq]",
          tenantId.value,
        ],
        ["sort", "employeeId"],
      ];

      if (userRole.value === "Employee") {
        params.push(["filter[_and][1][assignedUser][id][_eq]", userId.value]);
      } else if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim();
        params.push(["filter[_and][1][_or][0][employeeId][_contains]", query]);
        params.push([
          "filter[_and][1][_or][1][assignedUser][first_name][_contains]",
          query,
        ]);
        params.push([
          "filter[_and][1][_or][2][assignedUser][last_name][_contains]",
          query,
        ]);
      }

      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to search users");

      const usersJson = await response.json();
      const pmList = usersJson.data || [];
      const personalIds = pmList.map((u) => u.id).filter(Boolean);

      // Fetch attendance for search results
      const today = new Date().toISOString().slice(0, 10);
      const attendanceMap = new Map();
      if (personalIds.length > 0) {
        const attParams = new URLSearchParams([
          ["limit", "-1"],
          ["fields[]", "id"],
          ["fields[]", "status"],
          ["fields[]", "employeeId.id"],
          ["fields[]", "employeeId.employeeId"],
          ["filter[_and][0][date][_eq]", today],
          ["filter[_and][1][employeeId][id][_in]", personalIds.join(",")],
        ]).toString();

        const attRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance?${attParams}`,
          {
            headers: { Authorization: `Bearer ${token.value}` },
          },
        );

        if (attRes.ok) {
          const attJson = await attRes.json();
          (attJson.data || []).forEach((a) => {
            attendanceMap.set(a?.employeeId?.id, { status: a?.status || null });
          });
        }
      }

      const statusLabel = (s) =>
        s === "in"
          ? "Punched In"
          : s === "out"
            ? "Punched Out"
            : "Not Punched In";
      const statusColor = (s) =>
        s === "in" ? "green" : s === "out" ? "red" : "orange";

      return pmList.map((u) => {
        const first = u.assignedUser?.first_name || "";
        const last = u.assignedUser?.last_name || "";
        const empId = u.employeeId || "N/A";
        const name = `${first} ${last}`.trim();
        const display = `${name} (${empId})`;

        const att = attendanceMap.get(u.id) || { status: null };
        return {
          id: u.id,
          employeeId: empId,
          firstName: display,
          label: display,
          attendance: {
            status: att.status,
            label: statusLabel(att.status),
            color: statusColor(att.status),
          },
          assignedUser: u.assignedUser,
        };
      });
    } catch (err) {
      console.error("Error searching users:", err);
      return [];
    }
  };

  const normalizeDate = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === "string") {
      const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
    }
    console.warn(`Invalid date input: ${v}`);
    return null;
  };

  const toIsoMidday = (input, formDataContext = {}) => {
    if (!input) return null;
    if (typeof input === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(input)) {
        return input;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return `${input}T12:00:00`;
      }
      if (
        formDataContext[`${input}_date`] &&
        formDataContext[`${input}_time`]
      ) {
        const date = formDataContext[`${input}_date`];
        const time = formDataContext[`${input}_time`];
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) {
          return `${date}T${time}:00`;
        }
      }
    }
    if (input instanceof Date && !isNaN(input)) {
      return input.toISOString().slice(0, 19);
    }
    console.warn(`Invalid date input: ${input}`);
    return null;
  };

  const getWorkOrdersFolderId = async () => {
    try {
      const tokenValue = token.value;
      const tenantIdValue = tenantId.value;
      if (!tenantIdValue) throw new Error("Tenant ID not found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantIdValue}&fields[]=foldersId`,
        { headers: { Authorization: `Bearer ${tokenValue}` } },
      );

      if (!response.ok) throw new Error("Failed to fetch tenant data");

      const data = await response.json();
      if (data.data?.[0]?.foldersId) {
        const workordersFolder = data.data[0].foldersId.find(
          (folder) => folder.name === "Workorders",
        );
        if (workordersFolder) return workordersFolder.id;
      }
      return null;
    } catch (err) {
      console.error("Error fetching Workorders folder ID:", err);
      return null;
    }
  };

  const uploadImage = async (file) => {
    try {
      // If already a string ID, return it
      if (typeof file === "string") {
        return file;
      }

      // If not a File object, throw error
      if (!(file instanceof File)) {
        throw new Error("Invalid file input - must be a File object");
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, JPEG, or PNG files are allowed");
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 5MB");
      }

      const tenantIdValue = tenantId.value;
      if (!tenantIdValue) throw new Error("Tenant ID not found");

      const workOrdersFolderId = await getWorkOrdersFolderId();
      const tokenValue = token.value;

      const formData = new FormData();
      if (workOrdersFolderId) {
        formData.append("folder", workOrdersFolderId);
      }
      const fileExtension = file.name.split(".").pop();
      const customFileName = `task-${tenantIdValue}-${Date.now()}.${fileExtension}`;
      formData.append("file", file, customFileName);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenValue}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const result = await response.json();
      return result.data.id; // Return file ID
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const uploadImages = async (files) => {
    const uploadedIds = [];
    for (const file of files) {
      const id = await uploadImage(file); // Reuse uploadImage but support multiple
      uploadedIds.push(id);
    }
    return uploadedIds;
  };

  const submitForm = async (formData, formDetails, clients) => {
    try {
      const determinedInitialStatus = "pending";
      const tokenValue = token.value;
      const apiUrl = `${import.meta.env.VITE_API_URL}/items/tasks`;

      const payloads = Array.isArray(formData) ? formData : [formData];

      const processedPayloads = await Promise.all(
        payloads.map(async (data) => {
          console.log(
            "[DEBUG] Incoming data.dynamicFields:",
            JSON.stringify(data.dynamicFields, null, 2),
          );

          const payload = {
            assignFormId: formDetails?.id || null,
            status: determinedInitialStatus,
            tenant: tenantId.value || null,
            taskType: formDetails?.formName,
            title: data.title || formDetails?.formName,
            task_priority: data.task_priority,
            orgId: data.orgId || null,
            orgLocation: data.orgLocation || null,
            team: data.team || null,
            dynamicFields: data.dynamicFields || { tasks: [] },
          };

          const employeeIdAlt = getFirstPresent(data, [
            "UsersId",
            "employeeId",
            "empId",
            "assignedEmployee",
            "assignedUserId",
          ]);
          if (employeeIdAlt !== undefined) payload.employeeId = employeeIdAlt;

          const startDateAlt = getFirstPresent(data, [
            "from",
            "startDate",
            "start_date",
            "fromDate",
            "from_date",
            "expectedStartDate",
            "start",
          ]);
          if (startDateAlt !== undefined) {
            payload.from = toIsoMidday(startDateAlt, data);
          }

          const dueTimeAlt = getFirstPresent(data, [
            "dueTime",
            "due_time",
            "dueDate",
            "due_date",
            "endDate",
            "end_date",
            "toDate",
            "to_date",
            "expectedEndDate",
            "end",
          ]);
          if (dueTimeAlt !== undefined) {
            payload.dueTime = toIsoMidday(dueTimeAlt, data);
          }

          Object.keys(payload).forEach((key) => {
            if (payload[key] === undefined) delete payload[key];
          });

          return payload;
        }),
      );

      console.log(
        "Final Payload Sent:",
        JSON.stringify(processedPayloads, null, 2),
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenValue}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          processedPayloads.length === 1
            ? processedPayloads[0]
            : processedPayloads,
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to submit task: ${response.statusText} - ${errorData.message || "Unknown error"}`,
        );
      }

      const result = await response.json();
      return result;
    } catch (err) {
      submissionError.value =
        err.message || "Failed to submit form. Please try again.";
      throw err;
    }
  };

  return {
    formDetails,
    clients,
    users,
    departments,
    loading,
    error,
    submissionError,
    fetchFormDetails,
    fetchDropdownData,
    searchOrganizations,
    searchUsers,
    fetchDepartments,
    searchDepartments,
    submitForm,
    uploadImage,
    uploadImages,
    getFirstPresent,
  };
}

// senzrfieldopsfrontend/src/composables/workorder/completeWorkOrderForm/useTaskCompletionApi.js
import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export const useTaskCompletionApi = () => {
  const loading = ref(false);
  const error = ref(null);
  const locationError = ref(null);

  const getAuthToken = () => {
    const token = authService.getToken();
    if (!token)
      throw new Error("Authentication token not found. Please log in.");
    return token;
  };

  const getWorkOrdersFolderId = async () => {
    try {
      const token = getAuthToken();
      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
        { headers: { Authorization: `Bearer ${token}` } },
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

  const uploadTaskImage = async (file, taskId) => {
    try {
      const token = getAuthToken();

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file only");
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 10MB");
      }

      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const workOrdersFolderId = await getWorkOrdersFolderId();

      const formData = new FormData();
      if (workOrdersFolderId) {
        formData.append("folder", workOrdersFolderId);
      }

      const fileExtension = file.name.split(".").pop();
      const customFileName = `${taskId || "task"}-${tenantId}.${fileExtension}`;
      formData.append("file", file, customFileName);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Token might be expired.");
        }
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: {
          id: result.data.id,
          name: file.name,
          type: file.type,
          file,
          url: URL.createObjectURL(file),
        },
        message: "Image uploaded successfully!",
      };
    } catch (err) {
      console.error("Error uploading image:", err);
      return {
        success: false,
        error: err.message || "Failed to upload image",
      };
    }
  };

  const uploadTaskFiles = async (taskId, files) => {
    try {
      const token = getAuthToken();
      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const workOrdersFolderId = await getWorkOrdersFolderId();
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        if (workOrdersFolderId) {
          formData.append("folder", workOrdersFolderId);
        }

        const fileExtension = file.name.split(".").pop();
        const customFileName = `${taskId}-${tenantId}-${Date.now()}.${fileExtension}`;
        formData.append("file", file, customFileName);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to upload file ${file.name}: ${response.status}`,
          );
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      return {
        success: true,
        data: results,
        message: "Files uploaded successfully!",
      };
    } catch (err) {
      console.error("Error uploading files:", err);
      return {
        success: false,
        error: err.message || "Failed to upload files",
      };
    }
  };

  const isTaskOverdue = (dueTime) => {
    if (!dueTime) return false;
    const dueDateTime = new Date(dueTime);
    const now = new Date();
    return dueDateTime < now;
  };

  const completeInternalTask = async (completionData) => {
    loading.value = true;
    error.value = null;
    try {
      const token = getAuthToken();
      const status = isTaskOverdue(completionData.task.dueTime)
        ? "overdue"
        : "completed";

      const updateData = {
        status,
        complete_Task_Note: completionData.notes || "",
      };

      if (completionData.image && completionData.image.id) {
        updateData.taskimage = completionData.image.id;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${completionData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: `Internal task marked as ${status}!`,
      };
    } catch (err) {
      console.error("Error completing internal task:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to complete internal task",
      };
    } finally {
      loading.value = false;
    }
  };

  const saveTaskDraft = async (draftData) => {
    loading.value = true;
    error.value = null;
    try {
      const token = getAuthToken();
      const updateData = {
        complete_Task_Note: draftData.notes || "",
      };

      if (draftData.image && draftData.image.id) {
        updateData.taskimage = draftData.image.id;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${draftData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`Failed to save draft: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: "Task draft saved successfully!",
      };
    } catch (err) {
      console.error("Error saving task draft:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to save task draft",
      };
    } finally {
      loading.value = false;
    }
  };

  const completeWorkOrderTask = async (completionData) => {
    loading.value = true;
    error.value = null;

    try {
      const token = getAuthToken();
      const isOverdue =
        completionData.task?.dueTime &&
        new Date(completionData.task.dueTime) < new Date();
      const status = isOverdue ? "overdue" : "completed";

      const updateData = { status };

      if (completionData.notes) {
        updateData.completion_notes = completionData.notes;
      }

      const formData = completionData.formData || {};
      const imageFileIds = completionData.imageFileIds || {};

      const fieldMapping = {
        description: "description",
        taskType: "taskType",
        employeeId: "employeeId",
        UsersId: "employeeId",
        dueTime: "dueTime",
        from: "from",
        title: "title",
        amountExpected: "amountExpected",
        amountCollected: "amountCollected",
        eAmountCollected: "eAmountCollected",
        paymentMode: "paymentMode",
        referenceNumber: "referenceNumber",
        orgId: "orgId",
        orgLocation: "orgLocation",
        radiusInMeters: "radiusInMeters",
        snNumber: "snNumber",
        issueReport: "issueReport",
        partsReplaced: "partsReplaced",
        prodName: "prodName",
        deviceType: "deviceType",
        demo: "demo",
      };

      Object.entries(formData).forEach(([key, value]) => {
        const mappedField = fieldMapping[key] || key;
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !Array.isArray(value) &&
          typeof value !== "object"
        ) {
          updateData[mappedField] = value;
        }
      });

      Object.entries(imageFileIds).forEach(([key, fileId]) => {
        if (fileId) {
          updateData[key] = fileId;
        }
      });

      const currentLocation = completionData.currentLocation;
      if (currentLocation?.lat !== null && currentLocation?.lng !== null) {
        updateData.currentLat = currentLocation.lat;
        updateData.currentLng = currentLocation.lng;
      }

      if (completionData.payload) {
        Object.entries(completionData.payload).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !updateData.hasOwnProperty(key)
          ) {
            updateData[key] = value;
          }
        });
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${completionData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Token might be expired.");
        }
        const errorData = await response.json();
        throw new Error(
          `Failed to complete work order: ${response.status} - ${
            errorData.errors?.[0]?.message ||
            errorData.message ||
            "Unknown error"
          }`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: `Work order marked as ${status}!`,
      };
    } catch (err) {
      console.error("Error completing work order:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to complete work order",
      };
    } finally {
      loading.value = false;
    }
  };

  const saveWorkOrderDraft = async (draftData) => {
    loading.value = true;
    error.value = null;

    try {
      const token = getAuthToken();
      const updateData = {};

      if (draftData.notes) {
        updateData.completion_notes = draftData.notes;
      }

      const formData = draftData.formData || {};
      const imageFileIds = draftData.imageFileIds || {};

      const fieldMapping = {
        description: "description",
        taskType: "taskType",
        employeeId: "employeeId",
        UsersId: "employeeId",
        dueTime: "dueTime",
        from: "from",
        title: "title",
        amountExpected: "amountExpected",
        amountCollected: "amountCollected",
        eAmountCollected: "eAmountCollected",
        paymentMode: "paymentMode",
        referenceNumber: "referenceNumber",
        orgId: "orgId",
        orgLocation: "orgLocation",
        radiusInMeters: "radiusInMeters",
        snNumber: "snNumber",
        issueReport: "issueReport",
        partsReplaced: "partsReplaced",
        prodName: "prodName",
        deviceType: "deviceType",
        demo: "demo",
      };

      Object.entries(formData).forEach(([key, value]) => {
        const mappedField = fieldMapping[key] || key;
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !Array.isArray(value) &&
          typeof value !== "object"
        ) {
          updateData[mappedField] = value;
        }
      });

      Object.entries(imageFileIds).forEach(([key, fileId]) => {
        if (fileId) {
          updateData[key] = fileId;
        }
      });

      const currentLocation = draftData.currentLocation;
      if (currentLocation?.lat !== null && currentLocation?.lng !== null) {
        updateData.currentLat = currentLocation.lat;
        updateData.currentLng = currentLocation.lng;
      }

      if (draftData.payload) {
        Object.entries(draftData.payload).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !updateData.hasOwnProperty(key)
          ) {
            updateData[key] = value;
          }
        });
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${draftData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Token might be expired.");
        }
        const errorData = await response.json();
        throw new Error(
          `Failed to save work order draft: ${response.status} - ${
            errorData.errors?.[0]?.message ||
            errorData.message ||
            "Unknown error"
          }`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: "Work order draft saved successfully!",
      };
    } catch (err) {
      console.error("Error saving work order draft:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to save work order draft",
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchWorkOrderDetails = async (assignFormId) => {
    try {
      const token = getAuthToken();
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
        .map((key) =>
          Array.isArray(params[key])
            ? params[key].map((field) => `${key}=${field}`).join("&")
            : `${key}=${params[key]}`,
        )
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${assignFormId}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      return { success: true, data: data.data };
    } catch (err) {
      console.error("Error fetching work order details:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch work order details.",
      };
    }
  };

  const fetchTaskDetails = async (taskId) => {
    if (!taskId) {
      console.error("fetchTaskDetails called with undefined taskId");
      return { success: false, error: "Task ID is required" };
    }
    try {
      const token = getAuthToken();
      const fields = [
        "complete_Task_Note",
        "task_priority",
        "dueTime",
        "from",
        "taskimage",
        "status",
        "taskType",
        "description",
        "title",
        "employeeId.employeeId",
        "employeeId.assignedUser.first_name",
        "dynamicFields",
        "ratings",
        "signature",
        "orgLocation",
        "orgLocation.contactDetails",
        "radiusInMeters",
        "orgId",
        "verified_client_photo",
      ];

      const fieldsQuery = fields.map((field) => `fields[]=${field}`).join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${taskId}?${fieldsQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      return { success: true, data: data.data };
    } catch (err) {
      console.error("Error fetching task details:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch task details.",
      };
    }
  };

  const fetchTaskImageBlob = async (imageId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/assets/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      return {
        success: true,
        data: {
          id: imageId,
          url: imageUrl,
          blob: blob,
          type: blob.type,
          size: blob.size,
        },
      };
    } catch (err) {
      console.error("Error fetching task image blob:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch task image.",
      };
    }
  };

  const fetchOrganizationDetails = async (orgId) => {
    if (!orgId) {
      console.warn("orgId not provided for fetching organization details.");
      return { success: false, error: "Organization ID is required" };
    }
    try {
      const token = getAuthToken();
      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const params = new URLSearchParams([
        ["fields[]", "orgName"],
        ["filter[_and][0][id][_eq]", orgId],
        ["filter[_and][1][tenant][tenantId][_eq]", tenantId],
      ]).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/organization?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      if (data.data?.[0]) {
        return { success: true, data: data.data[0] };
      }
      return { success: false, error: "Organization not found" };
    } catch (err) {
      console.error("Error fetching organization details:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch organization details.",
      };
    }
  };

  const fetchLocationManagementData = async (clientOrgId) => {
    const token = getAuthToken();
    const tenantId = await currentUserTenant.getTenantId();
    if (!token || !tenantId || !clientOrgId) {
      locationError.value =
        "Missing authentication or organization details to fetch locations.";
      return { success: false, error: locationError.value };
    }

    try {
      const params = new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "locType"],
        ["fields[]", "locmark"],
        ["fields[]", "locdetail"],
        ["fields[]", "locSize"],
        ["fields[]", "orgLocation.orgName"],
        ["fields[]", "orgLocation.id"],
        ["fields[]", "tenant.tenantId"],
        ["fields[]", "contactDetails"],
        ["fields[]", "id"],
        ["filter[_and][0][_and][0][orgLocation][id][_eq]", clientOrgId],
        ["filter[_and][1][status][_neq]", "archived"],
      ]).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/locationManagement?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch location management data: ${response.status}`,
        );
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (err) {
      console.error("Error fetching location management data:", err);
      locationError.value =
        err.message || "Failed to fetch locations. Please try again.";
      return {
        success: false,
        error: locationError.value,
      };
    }
  };

  return {
    loading,
    error,
    locationError,
    completeInternalTask,
    completeWorkOrderTask,
    saveTaskDraft,
    uploadTaskImage,
    uploadTaskFiles,
    fetchWorkOrderDetails,
    fetchTaskDetails,
    fetchTaskImageBlob,
    getWorkOrdersFolderId,
    fetchOrganizationDetails,
    fetchLocationManagementData,
  };
};

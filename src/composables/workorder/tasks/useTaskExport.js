// senzrfieldopsfrontend/src/composables/workorder/tasks/useTaskExport.js
import {
  getFormattedExportData,
  generateFileName,
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "@/utils/Tasksexport/exportUtils";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export function useTaskExport() {
  const API_TOKEN = authService.getToken();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
  const API_ENDPOINTS = {
    tasks: "/items/tasks",
  };

  // Fetch tenantId for logged-in user
  const tenantId = currentUserTenant.getTenantId();

  const fetchExportData = async (filterParams = {}) => {
    try {
      if (!API_TOKEN) {
        throw new Error("Authentication token not found");
      }

      // Include the tenantId filter in the request if available
      const exportFields = [
        "id",
        "taskType", //show
        "status", //show
        "title", //show
        "description", //show
        "employeeId.employeeId", //show
        "employeeId.assignedUser.first_name", //show
        "tenant.tenantName",
        "dueTime", //show
        "from", //show
        "orgId.orgName", //show
        "orgLocation.locdetail", //show
        "orgLocation.locSize", //show
        "task_priority", //show
        "taskimage", //show
        "dynamicFields", //show this json field important one
        "ratings", //show
        "signature", //show
        "orgLocation.contactDetails", //show
      ];

      let url = `${API_BASE_URL}${API_ENDPOINTS.tasks}?fields[]=${exportFields.join(",")}`;

      // Add tenantId to the filterParams if tenantId is available
      if (tenantId) {
        filterParams["filter[_and][0][tenant][tenantId][_eq]"] = tenantId;
      }

      // Build the query string with the provided filters
      const queryString = Object.keys(filterParams)
        .filter((key) => key !== "sort")
        .map((key) => `${key}=${encodeURIComponent(filterParams[key])}`)
        .join("&");

      if (queryString) {
        url += `&${queryString}`;
      }

      url += `&limit=-1`;

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
      return data.data || [];
    } catch (err) {
      console.error("Error fetching export data:", err);
      alert("Failed to fetch data for export. Please try again.");
      return [];
    }
  };

  const exportData = async (type, filterParams = {}) => {
    alert(
      `Generating ${type.toUpperCase()} report... This might take a moment.`,
    );

    try {
      const dataToExport = await fetchExportData(filterParams);
      const formattedData = getFormattedExportData(dataToExport);

      if (formattedData.length === 0) {
        alert("No data to export with the current filters.");
        return;
      }

      const filename = generateFileName(type);

      if (type === "csv") {
        exportToCSV(formattedData, filename);
      } else if (type === "excel") {
        exportToExcel(formattedData, filename);
      } else if (type === "pdf") {
        exportToPDF(formattedData, filename);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate report. Please check console for details.");
    }
  };

  return {
    exportData,
  };
}

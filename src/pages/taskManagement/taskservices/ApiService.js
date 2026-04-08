/**
 * API Service for Task Management Application
 * Handles all API requests to the backend
 */
const API_TOKEN = authService.getToken();
const TENANT_ID = await currentUserTenant.getTenantId();
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

class ApiService {
  /**
   * Generic method to make API requests
   */
  static async request(endpoint, options = {}) {
    // Move inside so they are always fetched fresh
    const API_TOKEN = authService.getToken();
    const TENANT_ID = currentUserTenant.getTenantId(); // no need to await unless fetchLoginUserDetails not called yet
    const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

    console.log("🔐 API_TOKEN:", API_TOKEN);
    console.log("🏢 TENANT_ID:", TENANT_ID);

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
      ...options.headers,
    };

    try {
      console.log(`📤 API Request: ${options.method || "GET"} ${url}`);
      if (options.body) {
        console.log("📦 Request Body:", options.body);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error: ${response.status}`, errorData);
        throw new Error(
          errorData.message ||
            `API request failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Upload an image or file to the server
   * @param {File|Blob} file - The file object to upload
   * @returns {Promise<string>} - The ID of the uploaded file
   */
  static async uploadImage(file) {
    try {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds maximum limit of 5MB");
      }

      // Get file extension from name (if available) or assume based on type
      let extension = "";
      if (file.name) {
        extension = file.name
          .substring(file.name.lastIndexOf(".") + 1)
          .toLowerCase();
      } else if (file.type) {
        // Extract extension from MIME type
        extension = file.type.split("/")[1];
      }

      // Create FormData
      const formData = new FormData();

      // In Flutter, the file parameter name is 'file'
      formData.append("file", file);

      // Note: Using access_token in URL query parameter as in the Flutter code
      // Instead of using Authorization header
      const url = `${API_BASE_URL}/files?access_token=${API_TOKEN}`;

      console.log("📤 Uploading file to:", url);
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        // Don't include Authorization header if using token in URL
        // We also don't set Content-Type as the browser will set it with the boundary
      });

      // Log response status for debugging
      console.log("Upload response status:", response.status);

      // Get the response text for debugging
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Try to parse the response as JSON
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(
          `File upload failed with status ${response.status}. Response is not valid JSON.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          jsonResponse.message ||
            `File upload failed with status ${response.status}`,
        );
      }

      const fileId = jsonResponse.data?.id;
      if (!fileId) {
        console.error("No file ID in response:", jsonResponse);
        throw new Error("File upload succeeded but no file ID was returned");
      }

      console.log("✅ File uploaded successfully with ID:", fileId);
      return fileId;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Task-related API methods
   */
  static async fetchTasks(filters = {}) {
    const tenantId = currentUserTenant.getTenantId();

    let filterQuery = `filter[_and][0][tenant][_eq]=${tenantId}`;

    // Add additional filters if provided
    if (filters.status) {
      filterQuery += `&filter[_and][1][status][_eq]=${filters.status}`;
    }

    if (filters.employeeId) {
      filterQuery += `&filter[_and][2][employeeId][_eq]=${filters.employeeId}`;
    }

    if (filters.clientId) {
      filterQuery += `&filter[_and][3][clientId][_eq]=${filters.clientId}`;
    }

    if (filters.dateFrom) {
      filterQuery += `&filter[_and][4][from][_gte]=${filters.dateFrom}`;
    }

    if (filters.dateTo) {
      filterQuery += `&filter[_and][5][to][_lte]=${filters.dateTo}`;
    }

    const response = await this.request(`/items/tasks?${filterQuery}`);
    return response.data;
  }

  static async fetchTaskById(taskId) {
    const response = await this.request(
      `/items/tasks/${taskId}?filter[_and][0][tenant][_eq]=${TENANT_ID}`,
    );
    return response.data;
  }

  static async createTask(taskData) {
    // Ensure tenant ID is included in the task data
    const taskWithTenant = {
      ...taskData,
      tenant: TENANT_ID,
    };

    console.log("🔄 createTask called with data:", taskWithTenant);

    const response = await this.request("/items/tasks", {
      method: "POST",
      body: JSON.stringify(taskWithTenant),
    });

    console.log("✅ Task created successfully:", response.data);
    return response.data;
  }

  static async updateTask(taskId, taskData) {
    const response = await this.request(`/items/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(taskData),
    });
    console.log(" for the task response");
    console.log(response.body);

    return response.data;
  }

  static async deleteTask(taskId) {
    await this.request(`/items/tasks/${taskId}`, {
      method: "DELETE",
    });

    return true;
  }

  /**
   * Customer-related API methods
   */
  static async fetchCustomers(filters = {}) {
    const tenantId = currentUserTenant.getTenantId();

    let filterQuery = `filter[_and][1][tenant][tenantId][_eq]=${tenantId}`;

    if (filters.search) {
      filterQuery += `&filter[_or][0][customerName][_contains]=${filters.search}`;
      filterQuery += `&filter[_or][1][phone][_contains]=${filters.search}`;
    }

    const response = await this.request(`/items/customers?${filterQuery}`);
    return response.data;
  }

  /**
   * Fetch customers filtered by site type
   * This method is used in the task form to filter clients by task type
   */
  static async fetchCustomersBySiteType(siteType) {
    try {
      // Convert task type to site type format if needed
      const siteTypeFilter = siteType;

      // Log the URL for debugging
      const url = `/items/customers?limit=100&filter[_and][1][tenant][tenantId][_eq]=${TENANT_ID}`;
      console.log("📤 Fetching customers with URL:", url);

      const response = await this.request(url);

      console.log(
        `✅ Found ${response.data.length} customers for site type: ${siteTypeFilter}`,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching customers by site type:", error);
      throw error;
    }
  }

  static async fetchCustomerById(customerId) {
    try {
      const response = await this.request(
        `/items/customers/${customerId}?filter[_and][0][tenant][_eq]=${TENANT_ID}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(`❌ [fetchCustomerById] Error:`, error);
      throw error;
    }
  }

  static async fetchTaskCounts() {
    try {
      // Fetch tasks with different status filters
      const pendingTasks = await this.fetchTasks({ status: "pending" });
      const inProgressTasks = await this.fetchTasks({ status: "inprogress" });
      const completedTasks = await this.fetchTasks({ status: "completed" });

      // Calculate counts
      return {
        total:
          pendingTasks.length + inProgressTasks.length + completedTasks.length,
        active: pendingTasks.length + inProgressTasks.length,
        inProgress: inProgressTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
      };
    } catch (error) {
      console.error("❌ Error fetching task counts:", error);
      // Return default values in case of error
      return {
        total: 0,
        active: 0,
        inProgress: 0,
        completed: 0,
        pending: 0,
      };
    }
  }

  static async createCustomer(customerData) {
    // Ensure tenant ID is included in the customer data
    const customerWithTenant = {
      ...customerData,
      tenant: TENANT_ID,
    };

    const response = await this.request("/items/customers", {
      method: "POST",
      body: JSON.stringify(customerWithTenant),
    });

    return response.data;
  }

  static async updateCustomer(customerId, customerData) {
    const response = await this.request(`/items/customers/${customerId}`, {
      method: "PATCH",
      body: JSON.stringify(customerData),
    });

    return response.data;
  }

  static async deleteCustomer(customerId) {
    await this.request(`/items/customers/${customerId}`, {
      method: "DELETE",
    });

    return true;
  }

  /**
   * Employee-related API methods
   * Converted from Dart implementation to JavaScript
   */
  static async fetchEmployees(filters = {}, roleName = null) {
    // Build URL similar to the Dart implementation
    let url = "";
    const empId = filters?.currentEmployeeId || "";

    if (roleName === "Employee" && empId) {
      // If role is Employee, only fetch the current employee
      url = `/items/personalModule?limit=1000&filter[_and][0][id][_eq]=${empId}`;
    } else {
      // Otherwise fetch all employees
      url = `/items/personalModule?limit=1000`;
    }

    // Add fields to fetch, including the nested user details
    url += `&fields[]=id&fields[]=employeeId&fields[]=assignedUser.first_name&fields[]=assignedDepartment.department_id.id&fields[]=assignedBranch.branch_id.id`;

    // Add tenant filter
    url += `&filter[_and][0][_and][0][assignedUser][tenant][tenantId][_eq]=${TENANT_ID}`;

    // Add branch filter if provided
    if (filters && filters.branchId) {
      url += `&filter[_and][1][branchId][_eq]=${filters.branchId}`;
    }

    // Add department filter if provided
    if (filters && filters.departmentId) {
      url += `&filter[_and][2][departmentId][_eq]=${filters.departmentId}`;
    }

    // Debug Log
    console.log("📤 [fetchEmployees] Final URL:", url);

    try {
      const response = await this.request(url);

      // Debug Log
      console.log("✅ [fetchEmployees] Response:", response);

      // Transform the data to match the expected format
      return response.data.map((item) => ({
        id: item.id,
        employeeId: item.employeeId,
        firstName: item.assignedUser?.first_name || "Unknown",
        departmentId: item.assignedDepartment?.department_id?.id,
        branchId: item.assignedBranch?.branch_id?.id,
      }));
    } catch (error) {
      console.error("❌ [fetchEmployees] Error fetching employees:", error);
      throw error;
    }
  }

  static async fetchEmployeeById(employeeId) {
    const url = `/items/personalModule/${employeeId}?fields[]=id&fields[]=employeeId&fields[]=assignedUser.first_name&fields[]=assignedDepartment.department_id.id&fields[]=assignedBranch.branch_id.id&filter[_and][0][_and][0][assignedUser][tenant][tenantId][_eq]=${TENANT_ID}`;

    // Debug Log
    console.log(`📤 [fetchEmployeeById] URL:`, url);

    try {
      const response = await this.request(url);

      // Debug Log
      console.log(
        `✅ [fetchEmployeeById] Response for ID ${employeeId}:`,
        response,
      );

      return response.data;
    } catch (error) {
      console.error(
        `❌ [fetchEmployeeById] Error fetching employee ${employeeId}:`,
        error,
      );
      throw error;
    }
  }

  static async fetchBranches() {
    const url = `/items/branch?limit=100&fields[]=branchName&fields[]=id&filter[_and][0][_and][0][tenant][tenantId][_eq]=${TENANT_ID}`;

    console.log("📤 [fetchBranches] URL:", url);

    try {
      const response = await this.request(url);
      console.log("✅ [fetchBranches] Response:", response);

      // Transform the data to match the expected format
      return response.data.map((item) => ({
        id: item.id,
        branchName: item.branchName || "Unknown",
      }));
    } catch (error) {
      console.error("❌ [fetchBranches] Error:", error);
      throw error;
    }
  }

  static async fetchDepartments() {
    const url = `/items/department?limit=500&fields[]=departmentName&fields[]=id&filter[_and][0][_and][0][tenant][tenantId][_eq]=${TENANT_ID}`;

    console.log("📤 [fetchDepartments] URL:", url);

    try {
      const response = await this.request(url);
      console.log("✅ [fetchDepartments] Response:", response);

      // Transform the data to match the expected format
      return response.data.map((item) => ({
        id: item.id,
        departmentName: item.departmentName || "Unknown",
      }));
    } catch (error) {
      console.error("❌ [fetchDepartments] Error:", error);
      throw error;
    }
  }

  /**
   * Product-related API methods
   */
  static async fetchProducts() {
    try {
      const url = `/items/products?limit=25&fields[]=id&fields[]=productId&fields[]=productName&sort[]=id&page=1&filter[_and][0][tenant][tenantId][_eq]=${TENANT_ID}&filter[_and][1][serialNumber][_null]=true`;

      console.log("📤 [fetchProducts] URL:", url);

      const response = await this.request(url);
      console.log("✅ [fetchProducts] Response:", response);

      return response.data || [];
    } catch (error) {
      console.error("❌ [fetchProducts] Error:", error);
      return [];
    }
  }

  /**
   * Check for employee schedule conflicts
   * This checks if an employee already has tasks scheduled during the given time period
   */
  static async checkEmployeeScheduleConflict({ employeeId, from, dueTime }) {
    try {
      // Build the filter to find tasks for this employee that overlap with the given time range
      const filter =
        `filter[_and][0][employeeId][_eq]=${employeeId}&` +
        `filter[_and][1][_or][0][_and][0][from][_lte]=${from}&filter[_and][1][_or][0][_and][1][dueTime][_gte]=${from}]&` +
        `filter[_and][1][_or][1][_and][0][from][_lte]=${dueTime}&filter[_and][1][_or][1][_and][1][dueTime][_gte]=${dueTime}]&` +
        `filter[_and][1][_or][2][_and][0][from][_gte]=${from}&filter[_and][1][_or][2][_and][1][from][_lte]=${dueTime}]`;

      const url = `/items/tasks?${filter}`;
      console.log("📤 [checkEmployeeScheduleConflict] URL:", url);

      const response = await this.request(url);
      console.log("✅ [checkEmployeeScheduleConflict] Response:", response);

      // If there are any tasks in the response, there's a conflict
      return response.data && response.data.length > 0;
    } catch (error) {
      console.error("❌ [checkEmployeeScheduleConflict] Error:", error);
      throw error;
    }
  }

  /**
   * Check employee attendance
   * This checks if an employee is on leave or marked as absent during the given time period
   */
  static async checkEmployeeAttendance({ employeeId, startDate, endDate }) {
    try {
      // Format dates for the API (assuming they're in ISO format and need to be YYYY-MM-DD)
      const start = new Date(startDate).toISOString().split("T")[0];
      const end = new Date(endDate).toISOString().split("T")[0];

      // Check for leave
      const leaveUrl =
        `/items/attendance?filter[_and][0][date][_between][0]=${start}&` +
        `filter[_and][0][date][_between][1]=${end}&` +
        `filter[_and][1][employeeId][id][_eq]=${employeeId}&` +
        `filter[_and][0][attendance][_iends_with]=leave`;

      // Check for absent
      const absentUrl =
        `/items/attendance?filter[_and][0][date][_between][0]=${start}&` +
        `filter[_and][0][date][_between][1]=${end}&` +
        `filter[_and][1][employeeId][id][_eq]=${employeeId}&` +
        `filter[_and][1][attendance][_eq]=absent`;

      console.log("📤 [checkEmployeeAttendance] Leave URL:", leaveUrl);
      console.log("📤 [checkEmployeeAttendance] Absent URL:", absentUrl);

      // Make both requests
      const [leaveResponse, absentResponse] = await Promise.all([
        this.request(leaveUrl),
        this.request(absentUrl),
      ]);

      // Check if any leave or absent records were found
      const leaveRecords = leaveResponse.data || [];
      const absentRecords = absentResponse.data || [];

      console.log(
        "✅ [checkEmployeeAttendance] Leave records:",
        leaveRecords.length,
      );
      console.log(
        "✅ [checkEmployeeAttendance] Absent records:",
        absentRecords.length,
      );

      // If either list has records, the employee is unavailable
      // Return true if employee is available (no leave or absent records)
      return leaveRecords.length === 0 && absentRecords.length === 0;
    } catch (error) {
      console.error("❌ [checkEmployeeAttendance] Error:", error);
      throw error;
    }
  }
}

export default ApiService;

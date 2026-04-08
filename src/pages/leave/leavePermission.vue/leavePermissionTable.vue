<template>
  <div class="employee-container">
    <!-- Filter Panel -->
    <div class="filter-panel" v-if="showFilters && tenantId">
      <div class="filter-content">
        <FilterComponent
          :tenantId="tenantId"
          :initialFilters="initialFilters"
          :initiallyVisible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <!-- Filter Toggle Button -->

    <div
      class="main-content"
      :class="{ 'full-width': !showFilters, 'with-drawer': showAddForm }"
    >
      <!-- Add Request Button -->
      <div class="d-flex align-center py-2 px-4 header-actions">
        <button
          v-if="isAdmin"
          class="filter-toggle-static"
          @click="toggleFilters"
          :class="{ active: hasActiveFilters }"
          :title="showFilters ? 'Hide filters' : 'Show filters'"
          aria-label="Toggle filters"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
          </svg>
          <div v-if="hasActiveFilters" class="filter-indicator"></div>
        </button>
        <v-spacer></v-spacer>
        <BaseButton
          color="primary"
          :text="`Add request`"
          @click="toggleAddForm"
          size="md"
          :left-icon="Plus"
        />
      </div>

      <!-- Form Component -->
      <v-navigation-drawer
        v-model="showAddForm"
        temporary
        location="right"
        width="400"
        class="form-drawer"
      >
        <add
          v-if="showAddForm"
          @closeAddPage="toggleAddForm"
          @leaveApplied="handleLeaveApplied"
        />
      </v-navigation-drawer>

      <div v-if="loading" class="d-flex justify-center align-center py-2">
        <v-progress-linear indeterminate color="black"></v-progress-linear>
      </div>

      <!-- Table Container -->
      <div class="table-container-large">
        <DataTable
          :items="items"
          :columns="columns"
          :sort-by="sortBy[0]?.key || ''"
          :sort-direction="sortBy[0]?.order || 'asc'"
          :selected-items="selected"
          show-selection
          :row-clickable="false"
          item-key="id"
          @update:selected-items="selected = $event"
          @update:sort-by="handleSortByUpdate"
          @update:sort-direction="handleSortDirectionUpdate"
          @sort="handleSort"
        >
          <!-- Custom cell for employee name -->
          <template #cell-employeeName="{ item }">
            {{ item.requestedBy?.assignedUser?.first_name || "N/A" }}
          </template>

          <!-- Custom cell for date_created -->
          <template #cell-date_created="{ item }">
            {{ formatDate(item.date_created) }}
          </template>

          <!-- Custom cell for status -->
          <template #cell-status="{ item }">
            <div class="d-flex align-center">
              <span class="status-chip status-requested compact">
                <v-icon size="small" class="me-1" color="amber-darken-3">
                  mdi-clock-outline
                </v-icon>
                Requested
              </span>
              <div class="d-flex ms-2">
                <v-btn
                  size="x-small"
                  color="success"
                  class="me-2 status-btn compact"
                  @click.stop="updateStatus(item.id, 'approved')"
                >
                  <v-icon size="x-small" start>mdi-check</v-icon>
                  Accept
                </v-btn>
                <v-btn
                  size="x-small"
                  color="error"
                  class="status-btn compact"
                  @click.stop="updateStatus(item.id, 'declined')"
                >
                  <v-icon size="x-small" start>mdi-close</v-icon>
                  Reject
                </v-btn>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <template #empty-state>
            <div class="empty-content">
              <div class="empty-icon">📋</div>
              <h3>No pending leave requests found</h3>
              <p>There are no pending leave requests to display.</p>
            </div>
          </template>
        </DataTable>
      </div>

      <CustomPagination
        v-model:page="page"
        v-model:itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import DataTable from "@/components/common/table/DataTable.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue"; // Adjust path as needed
import add from "../leaveRequest.vue/add.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Plus, Filter } from "lucide-vue-next";

const emit = defineEmits(["showEditPage"]);

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showAddForm = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const attendanceConflicts = ref({});
const sortBy = ref([]);
const showFilters = ref(true);
const isAdmin = computed(() => userRole === "Admin");
// Filter options
const filters = reactive({
  request: "", // Add this

  fromDate: "",
  toDate: "",
});

const initialFilters = computed(() => ({
  request: filters.request,

  fromDate: filters.fromDate,
  toDate: filters.toDate,
}));

const pageFilters = ref([
  // {
  //   key: "request",
  //   label: "Request",
  //   type: "select",
  //   show: true,
  //   defaultValue: "",
  // },
  { key: "fromDate", label: "From Date", type: "date", show: true },
  { key: "toDate", label: "To Date", type: "date", show: true },
]);

const hasActiveFilters = computed(() => {
  return (
    filters.request !== "" || filters.fromDate || filters.toDate || search.value
  );
});

// Define columns for DataTable
const columns = ref([
  {
    key: "employeeName",
    label: "Employee Name",
    width: "150px",
  },

  { key: "leaveType", label: "Leave Type", width: "120px" },
  { key: "fromDate", label: "Leave From", width: "120px" },
  { key: "toDate", label: "Leave To", width: "120px" },
  { key: "date_created", label: "Applied On", width: "150px" },

  { key: "reason", label: "Reason", width: "200px" },

  { key: "status", label: "Status", width: "250px" },
]);

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  fetchData();
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = "";
  });
  search.value = "";
  page.value = 1;
  fetchData();
};

const handleLeaveApplied = async () => {
  showAddForm.value = false;
  await fetchData();
};

// Process items to flatten nested properties
const processItems = (rawItems) => {
  return rawItems.map((item) => ({
    ...item,
    employeeName: item.requestedBy?.assignedUser?.first_name || "N/A",
  }));
};

// Formatting and status handling functions
const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

// Handle sort events from DataTable
const handleSortByUpdate = (newSortBy) => {
  sortBy.value = newSortBy
    ? [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }]
    : [];
};

const handleSortDirectionUpdate = (newSortDirection) => {
  if (sortBy.value.length > 0) {
    sortBy.value = [{ key: sortBy.value[0].key, order: newSortDirection }];
  }
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchData();
};

const calculateDays = (fromDate, toDate, isHalfDay) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isHalfDay ? diffDays * 0.5 : diffDays;
};

const updateStatus = async (id, newStatus) => {
  console.log("Updating status for ID:", id, "to", newStatus);
  const hasConflict = hasAttendanceConflict(id);
  if (hasConflict && newStatus === "approved") {
    console.error("Attendance conflict exists for this leave request");
    return;
  }
  try {
    const token = getToken();

    const leaveRequestResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!leaveRequestResponse.ok) {
      throw new Error("Failed to fetch leave request details");
    }

    const leaveRequestData = await leaveRequestResponse.json();
    const {
      requestedBy,
      leaveType,
      fromDate,
      toDate,
      halfDay,
      timeFrom,
      timeTo,
      attendance: leaveAttendanceId,
    } = leaveRequestData.data;

    if (newStatus === "declined") {
      const numberOfDays = calculateDays(fromDate, toDate, halfDay);

      const personalModuleResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=leaves.id&fields[]=leaves.leaveBalance&fields[]=leaves.leaveTaken&fields[]=id&filter[_and][0][id][_eq]=${requestedBy}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!personalModuleResponse.ok) {
        throw new Error(`HTTP error! Status: ${personalModuleResponse.status}`);
      }

      const personalModuleData = await personalModuleResponse.json();
      const personalModuleInfo = personalModuleData.data?.[0];

      if (!personalModuleInfo || !personalModuleInfo.leaves) {
        throw new Error("Personal module or leave data not found");
      }

      const personalLeaveData = personalModuleInfo.leaves;
      const normalizedLeaveType = leaveType.toLowerCase().replace(/\s+/g, "");
      const balanceKey = normalizedLeaveType;
      const takenKey = `t${normalizedLeaveType}`;

      const updatedLeaveTaken = { ...personalLeaveData.leaveTaken };
      updatedLeaveTaken[takenKey] = Math.max(
        0,
        (updatedLeaveTaken[takenKey] || 0) - numberOfDays,
      );

      const updatedLeaveBalance = { ...personalLeaveData.leaveBalance };
      updatedLeaveBalance[balanceKey] =
        (updatedLeaveBalance[balanceKey] || 0) + numberOfDays;

      const updateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/leave/${personalLeaveData.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leaveTaken: updatedLeaveTaken,
          }),
        },
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update leave balance and taken data");
      }
    }

    // Handle attendance records update for approved/rejected status
    if (newStatus === "approved" || newStatus === "declined") {
      // Get existing attendance records for the date range
      const attendanceResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/attendance?filter[_and][0][employeeId][_eq]=${requestedBy}&filter[_and][2][date][_between][0]=${fromDate}&filter[_and][2][date][_between][1]=${toDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!attendanceResponse.ok) {
        throw new Error("Failed to fetch attendance records");
      }

      const attendanceData = await attendanceResponse.json();

      if (attendanceData.data && attendanceData.data.length > 0) {
        // Update each attendance record
        for (const attendanceRecord of attendanceData.data) {
          const updateAttendanceResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/attendance/${attendanceRecord.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: newStatus === "approved" ? "approved" : "rejected",
              }),
            },
          );

          if (!updateAttendanceResponse.ok) {
            console.error(
              `Failed to update attendance record ${attendanceRecord.id}`,
            );
          } else {
            console.log(
              `Successfully updated attendance record ${attendanceRecord.id} to ${newStatus}`,
            );
          }
        }
      } else {
        console.log("No attendance records found for the specified date range");
      }

      // Handle logs records update
      const logsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/logs?filter[_and][0][employeeId][_eq]=${requestedBy}&filter[_and][1][tenant][_eq]=${tenantId}&filter[_and][2][date][_between][0]=${fromDate}&filter[_and][2][date][_between][1]=${toDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!logsResponse.ok) {
        throw new Error("Failed to fetch logs records");
      }

      const logsData = await logsResponse.json();

      if (logsData.data && logsData.data.length > 0) {
        // Update each log record
        for (const logRecord of logsData.data) {
          const updateLogResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/logs/${logRecord.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: newStatus === "approved" ? "approved" : "rejected",
              }),
            },
          );

          if (!updateLogResponse.ok) {
            console.error(`Failed to update log record ${logRecord.id}`);
          } else {
            console.log(
              `Successfully updated log record ${logRecord.id} to ${newStatus}`,
            );
          }
        }
      } else {
        console.log("No log records found for the specified date range");
      }
    }

    // Handle abnormal leave type separately
    if (
      newStatus === "approved" &&
      leaveType.toLowerCase() === "abnormal" &&
      leaveAttendanceId
    ) {
      try {
        const extractTime = (datetime) => {
          if (!datetime) return null;
          const date = new Date(datetime);
          return date.toTimeString().split(" ")[0];
        };

        const attendanceUpdateResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance/${leaveAttendanceId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              outTime: extractTime(timeTo),
              status: "approved",
              mode: "abnormal",
            }),
          },
        );

        if (!attendanceUpdateResponse.ok) {
          console.error("Failed to update attendance for abnormal leave");
        }
      } catch (error) {
        console.error("Error updating attendance for abnormal leave:", error);
      }
    }

    // Update the main leave request status
    const statusResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      },
    );
    await fetchData();
    if (!statusResponse.ok) {
      throw new Error(`Failed to ${newStatus} request`);
    }
  } catch (error) {
    console.error("Error updating status:", error);
    showError.value = true;
    errorMessage.value = `Failed to ${newStatus} request and update leave data.`;
  }
};

const cancelRequest = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to cancel request");

    items.value = items.value.filter((item) => item.id !== id);
  } catch (error) {
    console.error("Error cancelling request:", error);
  }
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchReportingUsers = async () => {
  try {
    const token = getToken();
    if (!token || !userId) {
      console.warn("No token or userId, returning empty reporting users.");
      return [];
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=id,assignedUser.first_name,approver&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const reportingUsers = data.data.filter(
      (item) => item.approver && item.approver === userId,
    );

    const reportingUserIds = reportingUsers.map((item) => item.id);
    return reportingUserIds;
  } catch (error) {
    console.error("Error fetching reporting users:", error);
    return [];
  }
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      "filter[status][_eq]": "pending",
      ...filterParams(), // This will now include the request type logic
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${queryString}&limit=-1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 1;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchData = async () => {
  await aggregateCount();

  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;
  try {
    const params = {
      fields: [
        "id",
        "requestedBy.assignedUser.first_name",
        "requestedBy.id",
        "requestedBy.assignedUser.role.name",
        "requestedBy",
        "leaveType",
        "date_created",
        "fromDate",
        "toDate",
        "reason",
        "status",
        "tenant.tenantId",
        "tenant.tenantName",
        "timefrom",
        "timeTo",
        "attendance",
      ],
      limit: itemsPerPage.value,
      page: page.value,
      ...filterParams(), // This now handles all filtering including request type
    };

    // Build query string
    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key]
            .map((field) => `fields[]=${encodeURIComponent(field)}`)
            .join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = Array.isArray(data.data) ? data.data : [];
    if (items.value.length === 0 && page.value > 1) {
      page.value = 1;
      // Don't call fetchData() again here to avoid infinite loop
      // The page change watcher will handle it
    }
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch leave requests. Please try again.";
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {};
  let filterCount = 0;

  // Handle request type filtering
  if (filters.request === "myRequests") {
    // Filter by current user ID for "My Requests"
    params[`filter[_and][${filterCount}][requestedBy][assignedUser][_eq]`] =
      userId;
    filterCount++;
  } else {
    // For "All Requests", show all pending requests for the tenant (or reporting users for non-admins)
    if (userRole !== "Admin" && userRole !== "Dealer") {
      // For non-admins, still filter by reporting users
      params[`filter[_and][${filterCount}][requestedBy][approver][id][_eq]`] =
        userId;
      filterCount++;
    }
    // For admins, no additional user filter - they see all tenant requests
  }

  // Always filter by tenant
  params[
    `filter[_and][${filterCount}][requestedBy][assignedUser][tenant][_eq]`
  ] = tenantId;
  filterCount++;

  // Search filter
  if (search.value) {
    params[
      `filter[_and][${filterCount}][requestedBy][assignedUser][first_name][_icontains]`
    ] = search.value;
    filterCount++;
  }

  // Leave type filter
  if (filters.leaveType) {
    params[`filter[_and][${filterCount}][leaveType][_eq]`] = filters.leaveType;
    filterCount++;
  }

  // Date filters
  if (filters.fromDate) {
    params[`filter[_and][${filterCount}][fromDate][_gte]`] = filters.fromDate;
    filterCount++;
  }

  if (filters.toDate) {
    params[`filter[_and][${filterCount}][toDate][_lte]`] = filters.toDate;
    filterCount++;
  }

  // Status filter (always pending for this page)
  params[`filter[_and][${filterCount}][status][_eq]`] = "pending";
  filterCount++;

  // Sorting
  if (sortBy.value.length > 0) {
    const sortParam = sortBy.value
      .map((sortItem) => {
        const direction = sortItem.order === "desc" ? "-" : "";
        const sortKey =
          sortItem.key === "employeeName"
            ? "requestedBy.assignedUser.first_name"
            : sortItem.key;
        return `${direction}${sortKey}`;
      })
      .join(",");
    params["sort"] = sortParam;
  }

  return params;
};
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

const hasAttendanceConflict = (leaveId) => {
  return (
    attendanceConflicts.value[leaveId] &&
    attendanceConflicts.value[leaveId].length > 0
  );
};

watch(
  [search, sortBy, filters],
  async () => {
    page.value = 1;
    await fetchData();
  },
  { deep: true },
);
watch(page, (newPage) => {
  fetchData();
});
onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
.employee-container {
  display: flex;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: all 0.3s ease;
}

.main-content.with-drawer {
  margin-right: 400px;
}

.main-content.full-width {
  margin-right: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.form-drawer {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  top: 0 !important;
  overflow-y: auto;
}

:deep(.v-navigation-drawer__scrim) {
  background: transparent !important;
}

.table-container-large {
  width: 100%;
  max-height: calc(90vh - 100px);
  overflow: auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.filter-toggle-static {
  position: relative;
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #374151;
}

.filter-toggle-static:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-toggle-static.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.filter-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

.status-chip {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  text-transform: capitalize;
}

.status-chip.compact {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.status-requested {
  background-color: #fff8e1;
  color: #f57f17;
}

.status-approved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background-color: #ffebee;
  color: #c62828;
}

.add-request-btn {
  background: #1a1b5e !important;
  color: rgb(236, 236, 236) !important;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  padding: 8px 20px;
}

.status-btn {
  min-width: 90px !important;
  text-transform: none !important;
}

.status-btn.compact {
  min-width: 60px !important;
}

.status-btn:hover {
  opacity: 0.9;
}

.status-chip:hover {
  opacity: 0.9;
  cursor: default;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.empty-content p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .main-content.with-drawer {
    margin-right: 0;
  }

  .form-drawer {
    width: 100% !important;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .table-container-large {
    max-height: calc(100vh - 180px);
  }

  .data-table {
    font-size: 0.75rem;
  }

  .filter-panel {
    width: 100%;
    position: absolute;
    z-index: 10;
    height: 100%;
  }

  .main-content.full-width {
    margin-left: 0;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

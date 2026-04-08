<template>
  <div class="regularization-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Tab Navigation -->
      <div class="d-flex align-center py-2 px-4">
        <div class="left-tabs">
          <button
            @click="switchTab('activity')"
            :class="{ active: activeLeftTab === 'activity' }"
          >
            <i class="fas fa-clock"></i>
            Recent Activity
          </button>
          <button
            @click="switchTab('history')"
            :class="{ active: activeLeftTab === 'history' }"
          >
            <i class="fas fa-history"></i>
            History
          </button>
        </div>
        <v-spacer></v-spacer>
      </div>

      <div v-if="tabLoading" class="d-flex justify-center align-center py-2">
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
            {{ item.employeeName || "N/A" }}
          </template>

          <!-- Custom cell for Date -->
          <template #cell-Date="{ item }">
            {{ formatDate(item.Date) }}
          </template>

          <!-- Custom cell for status -->
          <template #cell-status="{ item }">
            <div class="d-flex align-center">
              <span
                v-if="item.status !== 'pending'"
                :class="getStatusClass(item.status)"
                class="status-chip compact"
              >
                <v-icon
                  size="small"
                  class="me-1"
                  :color="getIconColor(item.status)"
                >
                  {{ getStatusIcon(item.status) }}
                </v-icon>
                {{ formatStatus(item.status) }}
              </span>
              <div v-else class="d-flex align-center">
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
            </div>
          </template>

          <!-- Empty state -->
          <template #empty-state>
            <div class="empty-content">
              <div class="empty-icon">📋</div>
              <h3>No regularization requests found</h3>
              <p>There are no regularization requests to display.</p>
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
import { ref, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import DataTable from "@/components/common/table/DataTable.vue";

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const activeLeftTab = ref("activity");
const tabLoading = ref(false);
const attendanceConflicts = ref({});
const sortBy = ref([]);

// Define columns for DataTable
const columns = ref([
  { key: "employeeName", label: "Employee Name", width: "150px" },
  { key: "Date", label: "Date", width: "150px" },
  { key: "requestedInTime", label: "In Time", width: "120px" },
  { key: "requestedOutTime", label: "Out Time", width: "120px" },
  { key: "reason", label: "Reason", width: "200px" },
  { key: "status", label: "Status", width: "250px" },
]);

// Process items to include employeeName
const processItems = async (rawItems) => {
  const employeeIds = [...new Set(rawItems.map((item) => item.employeeId))];
  const employeeNames = await fetchEmployeeNames(employeeIds);
  return rawItems.map((item) => ({
    ...item,
    employeeName: employeeNames[item.employeeId] || "N/A",
  }));
};

// Fetch employee names based on employeeIds
const fetchEmployeeNames = async (employeeIds) => {
  try {
    const token = authService.getToken();
    const params = new URLSearchParams({
      "filter[id][_in]": employeeIds.join(","),
      "fields[]": "id,assignedUser.first_name",
    });
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch employee names");
    const data = await response.json();
    return data.data.reduce((acc, item) => {
      acc[item.id] = item.assignedUser?.first_name || "N/A";
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching employee names:", error);
    return {};
  }
};

// Formatting and status handling functions
const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: "mdi-clock-outline",
    approved: "mdi-check-circle",
    declined: "mdi-close-circle",
    cancelled: "mdi-cancel",
  };
  return iconMap[status] || "mdi-help-circle";
};

const getIconColor = (status) => {
  const colorMap = {
    pending: "amber-darken-3",
    approved: "green-darken-2",
    declined: "red-darken-2",
    cancelled: "grey-darken-2",
  };
  return colorMap[status] || "grey";
};

const formatStatus = (status) => {
  const statusMap = {
    pending: "Requested",
    approved: "Approved",
    declined: "Rejected",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusClassMap = {
    pending: "status-requested",
    approved: "status-approved",
    declined: "status-rejected",
    cancelled: "status-cancelled",
  };
  return statusClassMap[status] || "";
};

// Handle sort events
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

// Switch tabs
const switchTab = async (tab) => {
  if (activeLeftTab.value === tab || tabLoading.value) return;
  tabLoading.value = true;
  activeLeftTab.value = tab;
  try {
    await fetchData();
  } finally {
    setTimeout(() => {
      tabLoading.value = false;
    }, 500);
  }
};

// Check attendance conflicts
// const checkAttendanceConflicts = async () => {
//   try {
//     const token = authService.getToken();
//     const conflictsMap = {};
//     for (const item of items.value) {
//       const requestDate = new Date(item.Date);
//       const today = new Date();
//       if (
//         requestDate < today &&
//         (item.status === "pending" || item.status === "approved")
//       ) {
//         const params = new URLSearchParams({
//           "filter[_and][0][date][_eq]": item.Date,
//           "filter[_and][1][employeeId][_eq]": item.employeeId,
//           "filter[_and][2][attendance][_eq]": "present",
//         });
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/items/attendance?${params}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//         if (!response.ok)
//           throw new Error("Failed to check attendance conflicts");
//         const data = await response.json();
//         if (data.data && data.data.length > 0) {
//           conflictsMap[item.id] = data.data;
//         }
//       }
//     }
//     attendanceConflicts.value = conflictsMap;
//   } catch (error) {
//     console.error("Error checking attendance conflicts:", error);
//   }
// };

// Update status
const updateStatus = async (id, newStatus) => {
  try {
    const token = authService.getToken();
    // Fetch request details
    const requestResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!requestResponse.ok) throw new Error("Failed to fetch request details");
    const requestData = await requestResponse.json();
    const { employeeId, Date, requestedInTime, requestedOutTime } =
      requestData.data;

    if (newStatus === "approved") {
      // Generate unique ID
      const dateStr = formatDate(Date); // Assuming formatDate returns date in YYYY-MM-DD format
      const requestedBy = employeeId; // Using employeeId as requestedBy
      const uniqueId = `${dateStr}-${requestedBy}-${tenantId}`;

      // Prepare attendance payload with uniqueId
      const attendancePayload = {
        date: Date,
        attendance: "present",
        employeeId: employeeId,
        tenant: tenantId,
        inTime: requestedInTime,
        outTime: requestedOutTime,
        uniqueId: uniqueId, // Adding uniqueId to the payload
      };

      // Check if attendance record already exists for the same date and employee
      const params = new URLSearchParams({
        "filter[_and][0][date][_eq]": Date,
        "filter[_and][1][employeeId][_eq]": employeeId,
      });
      const existingAttendanceResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/attendance?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!existingAttendanceResponse.ok) {
        console.error("Failed to check existing attendance records");
      }
      const existingAttendance = await existingAttendanceResponse.json();

      let attendanceResponse;
      if (existingAttendance.data && existingAttendance.data.length > 0) {
        // Update existing attendance record (PATCH)
        const attendanceId = existingAttendance.data[0].id;
        attendanceResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance/${attendanceId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attendancePayload),
          },
        );
      } else {
        // Create new attendance record (POST)
        attendanceResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attendancePayload),
          },
        );
      }

      if (!attendanceResponse.ok) {
        console.error("Failed to update/create attendance record");
      }
    }

    // Update regularization request status
    const statusResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      },
    );
    if (!statusResponse.ok) throw new Error(`Failed to ${newStatus} request`);

    // Update items in the UI
    items.value = items.value.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
  } catch (error) {
    console.error("Error updating status:", error);
    showError.value = true;
    errorMessage.value = `Failed to ${newStatus} request.`;
  }
};

// Fetch reporting users
const fetchReportingUsers = async () => {
  try {
    const token = authService.getToken();
    if (!token || !userId) return [];
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=id,assignedUser.first_name,approver&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data.data
      .filter((item) => item.approver && item.approver === userId)
      .map((item) => item.id);
  } catch (error) {
    console.error("Error fetching reporting users:", error);
    return [];
  }
};

// Aggregate count
const aggregateCount = async () => {
  try {
    if (!token || !tenantId) throw new Error("Authentication required");
    const reportingUserIds = await fetchReportingUsers();
    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };
    if (reportingUserIds.length > 0) {
      params["filter[employeeId][_in]"] = reportingUserIds.join(",");
    } else {
      params["filter[tenant][tenantId][_eq]"] = tenantId;
    }
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!countResponse.ok)
      throw new Error(`HTTP error! Status: ${countResponse.status}`);
    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

// Fetch data
const fetchData = async () => {
  await aggregateCount();
  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }
  loading.value = true;
  try {
    const reportingUserIds = await fetchReportingUsers();
    const params = {
      fields: [
        "id",
        "employeeId",
        "Date",
        "requestedInTime",
        "requestedOutTime",
        "reason",
        "status",
        "tenant.tenantId",
      ],
      ...filterParams(),
      limit: itemsPerPage.value,
      page: page.value,
    };
    if (reportingUserIds.length > 0) {
      params["filter[employeeId][_in]"] = reportingUserIds.join(",");
    } else {
      params["filter[tenant][tenantId][_eq]"] = tenantId;
    }
    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized access");
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    items.value = Array.isArray(data.data) ? await processItems(data.data) : [];
    // await checkAttendanceConflicts();
  } catch (error) {
    console.error("Error fetching regularization requests:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch regularization requests.";
    items.value = [];
  } finally {
    loading.value = false;
  }
};

// Filter parameters
const filterParams = () => {
  const params = {};
  if (activeLeftTab.value === "activity") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    params["filter[date_created][_gte]"] = thirtyDaysAgo
      .toISOString()
      .split("T")[0];
  }
  if (activeLeftTab.value === "history") {
    params["filter[_or][0][status][_eq]"] = "approved";
    params["filter[_or][1][status][_eq]"] = "declined";
    params["filter[_or][2][status][_eq]"] = "cancelled";
  }
  if (userRole !== "Admin" && userRole !== "Dealer") {
    params["filter[employeeId][approver][id][_eq]"] = userId;
  }
  if (search.value) {
    params["filter[employeeId][assignedUser][first_name][_icontains]"] =
      search.value;
  }
  if (sortBy.value.length > 0) {
    const sortParam = sortBy.value
      .map((sortItem) => {
        const direction = sortItem.order === "desc" ? "-" : "";
        const sortKey =
          sortItem.key === "employeeName"
            ? "employeeId.assignedUser.first_name"
            : sortItem.key;
        return `${direction}${sortKey}`;
      })
      .join(",");
    params["sort"] = sortParam;
  }
  return params;
};

// Pagination handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

// Attendance conflict check
const hasAttendanceConflict = (regularizationId) => {
  return (
    attendanceConflicts.value[regularizationId] &&
    attendanceConflicts.value[regularizationId].length > 0
  );
};

watch(
  [search, sortBy],
  async () => {
    page.value = 1;
    await fetchData();
  },
  { deep: true },
);

onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
.regularization-container {
  display: flex;
  overflow: hidden;
  position: relative;
}
.employee-container {
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.search-field {
  max-width: 300px;
}

/* NEW: Specific table container class for width/height issues */
.table-container-large {
  width: 100%;

  max-height: calc(90vh - 100px);
  overflow: auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

/* Adjust column widths for better spacing */
.table-container-large :deep(.table-body > div > div) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status column specific adjustments */

/* DataTable styles */
.data-table {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-scroll-container {
  overflow: auto;
  position: relative;
}

.table-body {
  min-height: 0;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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

.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
}

.table-body {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.table-body > div {
  display: table-row;
}

.table-body > div > div {
  display: table-cell;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .table-container-large {
    max-height: calc(100vh - 180px);
  }

  .table-container-large :deep(.table-body) {
    min-width: 800px;
  }

  .data-table {
    font-size: 0.75rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}

/* Existing status and button styles */
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

.left-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  background: #68ade1;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.left-tabs button.active {
  background-color: rgb(21, 66, 124);
  color: white;
}

.left-tabs {
  display: flex;
  gap: 12px;
}
</style>

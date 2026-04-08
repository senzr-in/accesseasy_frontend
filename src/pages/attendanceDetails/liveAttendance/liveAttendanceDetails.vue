<template>
  <div class="attendance-dashboard-container">
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

    <!-- Main Content -->
    <div
      class="main-content"
      :class="{ 'full-width': !showFilters }"
      v-if="tenantId"
    >
      <DataTableWrapper
        v-model:searchQuery="searchQuery"
        :showSearch="true"
        :searchPlaceholder="'Search employees...'"
        :isEmpty="filteredAttendance.length === 0 && !searchQuery"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <template #before-search>
          <button
            v-if="tenantId"
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
        </template>
        <!-- Header Slot for Stats -->
        <template v-slot:toolbar-actions>
          <div class="stats-container">
            <div
              v-for="stat in stats"
              :key="stat.title"
              class="stat-item"
              :class="`${stat.color}--text`"
            >
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-title">{{ stat.title }}</span>
            </div>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="paginatedAttendance.length || 10"
            :columns="columns.length"
          />
        </div>

        <!-- Error State -->
        <div v-else-if="error">
          <ErrorState
            title="Unable to load attendance data"
            :message="error"
            @retry="fetchAttendanceData"
          />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAttendance.length === 0">
          <EmptyState
            title="No attendance data found"
            message="Try adjusting your filters or search criteria"
            :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            :items="paginatedAttendance"
            :columns="columns"
            :sortBy="sortBy"
            :sortDirection="sortDirection"
            :showSelection="false"
            :expandable="false"
            :rowClickable="true"
            @sort="handleSort"
            @rowClick="handleRowClick"
          >
            <!-- Employee Column -->
            <!-- Avatar column only -->
            <template #cell-profile="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="formatEmployeeName(item)"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </template>
            <template #cell-employee="{ item }">
              <div class="employee-details">
                <h3 class="employee-name">{{ formatEmployeeName(item) }}</h3>
              </div>
            </template>
            <!-- Employee ID Column -->
            <template #cell-employeeId="{ item }">
              <span class="employee-id">{{ item.employeeId || "N/A" }}</span>
            </template>

            <!-- Department Column -->
            <template #cell-department="{ item }">
              <span class="department-name">{{
                item.departmentName || "N/A"
              }}</span>
            </template>

            <!-- Location Column -->
            <template #cell-location="{ item }">
              <span class="location-name">{{ item.locationName || "-" }}</span>
            </template>

            <!-- Status Column -->
            <template #cell-status="{ item }">
              <span
                class="status-badge"
                :class="`status-${getStatusColor(item.status)}`"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    v-if="getStatusIcon(item.status) === 'mdi-check-circle'"
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  />
                  <path
                    v-if="getStatusIcon(item.status) === 'mdi-check-circle'"
                    d="m9 11 3 3L22 4"
                  />
                  <circle
                    v-if="getStatusIcon(item.status) === 'mdi-account-off'"
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    v-if="getStatusIcon(item.status) === 'mdi-account-off'"
                    d="M4.93 4.93l14.14 14.14"
                  />
                  <path
                    v-if="getStatusIcon(item.status) === 'mdi-home-circle'"
                    d="M12 2L2 9v13h20V9L12 2z"
                  />
                  <path
                    v-if="getStatusIcon(item.status) === 'mdi-briefcase-clock'"
                    d="M21 6h-3V5a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM8 5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1H8V5zm4 8l3 2"
                  />
                  <path
                    v-if="getStatusIcon(item.status) === 'mdi-clock-time-six'"
                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-8l3-3"
                  />
                </svg>
                {{ formatStatus(item.status) }}
              </span>
            </template>

            <!-- First Punch Column -->
            <template #cell-inTime="{ item }">
              <div class="time-info">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="
                    item.lateBy && item.lateBy !== '00:00:00'
                      ? 'text-error'
                      : 'text-success'
                  "
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <div class="time-value">{{ formatTime(item.inTime) }}</div>
                  <div
                    v-if="item.lateBy && item.lateBy !== '00:00:00'"
                    class="time-late"
                  >
                    Late by {{ item.lateBy }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Last Punch Column -->
            <template #cell-outTime="{ item }">
              <div class="time-info">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="
                    item.earlyDeparture && item.earlyDeparture !== '00:00:00'
                      ? 'text-warning'
                      : 'text-success'
                  "
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <div class="time-value">{{ formatTime(item.outTime) }}</div>
                  <div
                    v-if="
                      item.earlyDeparture && item.earlyDeparture !== '00:00:00'
                    "
                    class="time-early"
                  >
                    Early by {{ item.earlyDeparture }}
                  </div>
                </div>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="currentPage"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalFilteredItems"
            :is-searching="!!searchQuery"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
import { useRoute, useRouter } from "vue-router";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";

// Router and Route
const route = useRoute();
const router = useRouter();

// Core Data
const searchQuery = ref("");
const loading = ref(false);
const error = ref(null);
const tenantLoading = ref(true);
const attendanceData = ref([]);
const totalUsers = ref([]);
const tenantId = ref("");
const userId = ref(currentUserTenant.getUserId()); // Get logged-in user ID
const userRole = ref(currentUserTenant.getRole()); // Get logged-in user role
const token = authService.getToken();

// Filter Management
const showFilters = ref(true);
const filters = reactive({
  organization: "",
  branch: "",
  department: "",
  monthYear: new Date().toISOString().slice(0, 7),
});
const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];
const initialFilters = computed(() => ({
  organization: filters.organization,
  branch: filters.branch,
  department: filters.department,
  monthYear: filters.monthYear,
}));

// Sorting & Pagination
const sortBy = ref("");
const sortDirection = ref("asc");
const currentPage = ref(1);
const itemsPerPage = ref(25);

// DataTable Configuration - Updated columns
const columns = ref([
  { key: "profile", label: "Profile", sortable: true, width: 60 },
  { key: "employeeId", label: "Employee ID", sortable: true, width: 60 },
  { key: "employee", label: "Employee", sortable: true, width: 60 },

  { key: "department", label: "Department", sortable: true, width: 60 },
  { key: "location", label: "Branch", sortable: true, width: 60 },
  { key: "status", label: "Status", sortable: true, width: 60 },
  { key: "inTime", label: "First Punch", sortable: true, width: 60 },
  { key: "outTime", label: "Last Punch", sortable: true, width: 60 },
]);

// Date and Day Computed Properties
const currentFormattedDate = computed(() => {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

const currentDay = computed(() => {
  const today = new Date();
  return today.toLocaleDateString("en-US", { weekday: "long" });
});

// Utility Functions
const getTodayDateIST = () => {
  const now = new Date();
  const istOffset = 330; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
  return istTime.toISOString().split("T")[0];
};

const isEmployeeLeft = (employee) => {
  if (!employee.assignedUser?.dateOfLeaving) return false;
  const today = new Date();
  const leavingDate = new Date(employee.assignedUser.dateOfLeaving);
  today.setHours(0, 0, 0, 0);
  leavingDate.setHours(0, 0, 0, 0);
  return leavingDate <= today;
};

// Avatar Functions
const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// Computed Properties
const activeUsers = computed(() =>
  totalUsers.value.filter((user) => !isEmployeeLeft(user)),
);

const hasActiveFilters = computed(() =>
  Boolean(
    filters.organization ||
      filters.branch ||
      filters.department ||
      searchQuery.value,
  ),
);

const stats = computed(() => {
  const data = mergedAttendanceData.value;
  const presentCount = data.filter((item) =>
    ["present", "onDuty", "workFromHome", "halfDay"].includes(item.attendance),
  ).length;
  const absentCount = data.filter((item) =>
    ["absent", "holiday"].includes(item.attendance),
  ).length;

  return [
    { title: "Active Staff", value: data.length.toString(), color: "primary" },
    { title: "Present", value: presentCount.toString(), color: "success" },
    { title: "Absent", value: absentCount.toString(), color: "error" },
  ];
});

const mergedAttendanceData = computed(() => {
  const attendanceMap = new Map(
    attendanceData.value
      .map((record) => [record.employeeId?.id?.toString(), record])
      .filter(([key]) => key),
  );

  return activeUsers.value.map((user) => {
    const attendanceRecord = attendanceMap.get(user.id.toString());
    return {
      id: user.id,
      employeeId: user.employeeId,
      firstName: user.assignedUser?.first_name || "",
      lastName: user.assignedUser?.last_name || "",
      departmentName: user.department?.departmentName || "N/A",
      locationName: user.branchLocation?.locdetail?.locationName || "-", // Get location name from branchLocation

      status: attendanceRecord?.status || "out",
      attendance: attendanceRecord?.attendance || "absent",
      inTime: attendanceRecord?.inTime || null,
      outTime: attendanceRecord?.outTime || null,
      lateBy: attendanceRecord?.lateBy || null,
      earlyDeparture: attendanceRecord?.earlyDeparture || null,
      avatarImage: user.avatarImage || null, // Add avatar image
    };
  });
});

const filteredAttendance = computed(() => {
  let filtered = [...mergedAttendanceData.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        formatEmployeeName(item).toLowerCase().includes(query) ||
        item.employeeId?.toLowerCase().includes(query) ||
        item.departmentName.toLowerCase().includes(query) ||
        item.locationName?.toLowerCase().includes(query), // Include location in search
    );
  }

  // Apply sorting with priority for "in" status employees
  filtered.sort((a, b) => {
    if (a.status === "in" && b.status !== "in") return -1;
    if (b.status === "in" && a.status !== "in") return 1;

    if (sortBy.value) {
      const valueA = a[sortBy.value] || "";
      const valueB = b[sortBy.value] || "";
      const direction = sortDirection.value === "asc" ? 1 : -1;

      if (typeof valueA === "string") {
        return valueA.localeCompare(valueB) * direction;
      }
      return (valueA - valueB) * direction;
    }

    return formatEmployeeName(a).localeCompare(formatEmployeeName(b));
  });

  return filtered;
});

const totalFilteredItems = computed(() => filteredAttendance.value.length);

const paginatedAttendance = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAttendance.value.slice(start, end);
});

// API Functions
const buildPersonalModuleUrl = () => {
  if (!tenantId.value) {
    console.error("buildPersonalModuleUrl: tenantId is null or undefined");
    return null;
  }
  let url = `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId.value}&filter[_and][1][status][_neq]=archived&limit=-1`;
  let filterIndex = 2;

  // Add approver filter for Manager role
  if (userRole.value === "Manager") {
    url += `&filter[_and][${filterIndex}][_or][0][approver][id][_eq]=${userId.value}`;
    url += `&filter[_and][${filterIndex}][_or][1][assignedUser][id][_eq]=${userId.value}`;
    filterIndex++;
  }

  if (filters.organization) {
    url += `&filter[_and][${filterIndex}][assignedUser][organization][id][_eq]=${filters.organization}`;
    filterIndex++;
  }
  if (filters.department) {
    url += `&filter[_and][${filterIndex}][department][id][_eq]=${filters.department}`;
    filterIndex++;
  }
  if (filters.branch) {
    url += `&filter[_and][${filterIndex}][branchLocation][id][_eq]=${filters.branch}`;
    filterIndex++;
  }

  // Include all required fields including branchLocation.locdetail
  url += `&fields[]=assignedUser.first_name&fields[]=assignedUser.last_name&fields[]=assignedUser.dateOfLeaving&fields[]=id&fields[]=employeeId&fields[]=department.departmentName&fields[]=assignedUser.avatar.id&fields[]=branchLocation.locdetail`;

  console.log("Personal Module URL:", url);
  return url;
};

const buildAttendanceUrl = (activeUserIds, today) => {
  if (!tenantId.value) {
    console.error("buildAttendanceUrl: tenantId is null or undefined");
    return null;
  }
  let url = `${import.meta.env.VITE_API_URL}/items/attendance?filter[_and][0][date][_eq]=${today}&filter[_and][1][tenant][tenantId][_eq]=${tenantId.value}&filter[_and][2][employeeId][id][_in]=${activeUserIds.join(",")}&limit=-1`;

  url += `&sort[]=-date_updated`;
  url += `&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=employeeId.department.departmentName&fields[]=status&fields[]=attendance&fields[]=inTime&fields[]=outTime&fields[]=lateBy&fields[]=earlyDeparture`;

  console.log("Attendance URL:", url);
  return url;
};

const fetchData = async (url, errorMessage) => {
  if (!url) {
    throw new Error("Invalid URL: URL is null or undefined");
  }
  const token = authService.getToken();
  if (!token) {
    throw new Error("No authentication token available");
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`${errorMessage}: ${errorText}`);
    throw new Error(errorMessage);
  }
  return await response.json();
};

const fetchTenantId = async () => {
  tenantLoading.value = true;
  try {
    const id = await currentUserTenant.getTenantId();
    console.log("Fetched tenantId:", id);
    if (!id) {
      throw new Error("Tenant ID is null or undefined");
    }
    tenantId.value = id;
  } catch (error) {
    console.error("Error fetching tenantId:", error);
    error.value = error.message || "Failed to fetch tenant ID";
  } finally {
    tenantLoading.value = false;
  }
};

const fetchAttendanceData = async () => {
  if (!tenantId.value) {
    console.error("fetchAttendanceData: tenantId is not set");
    error.value = "Tenant ID is not set";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const today = getTodayDateIST();

    // Fetch users with approver filter for Manager role
    const personalModuleUrl = buildPersonalModuleUrl();
    if (!personalModuleUrl) {
      throw new Error("Invalid personal module URL due to missing tenantId");
    }
    const usersData = await fetchData(
      personalModuleUrl,
      "Failed to fetch users",
    );

    // Process users and fetch avatars
    totalUsers.value = await Promise.all(
      (usersData.data || []).map(async (user) => {
        const userWithAvatar = { ...user };
        if (user.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${
            user.assignedUser.avatar.id
          }`;
          userWithAvatar.avatarImage = await fetchAuthorizedImage(avatarUrl);
        } else {
          userWithAvatar.avatarImage = null;
        }
        return userWithAvatar;
      }),
    );

    // Get active user IDs
    const activeUserIds = activeUsers.value.map((user) => user.id);

    if (activeUserIds.length === 0) {
      attendanceData.value = [];
      console.log("No active users found");
      return;
    }

    // Fetch attendance data
    const attendanceUrl = buildAttendanceUrl(activeUserIds, today);
    if (!attendanceUrl) {
      throw new Error("Invalid attendance URL due to missing tenantId");
    }
    const attendanceResponseData = await fetchData(
      attendanceUrl,
      "Failed to fetch attendance",
    );
    attendanceData.value = attendanceResponseData.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    error.value = error.message || "Failed to load attendance data";
    totalUsers.value = [];
    attendanceData.value = [];
  } finally {
    loading.value = false;
  }
};

// Formatting Functions
const formatEmployeeName = (item) =>
  `${item.firstName} ${item.lastName}`.trim() || "Unknown Employee";

const formatStatus = (status) => {
  const statusMap = {
    in: "In",
    out: "Out",
    workFromHome: "Work From Home",
    onDuty: "On Duty",
    halfDay: "Half Day",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    in: "success",
    out: "error",
    workFromHome: "blue",
    onDuty: "indigo",
    halfDay: "amber",
  };
  return colors[status] || "grey";
};

const getStatusIcon = (status) => {
  const icons = {
    in: "mdi-check-circle",
    out: "mdi-account-off",
    workFromHome: "mdi-home-circle",
    onDuty: "mdi-briefcase-clock",
    halfDay: "mdi-clock-time-six",
  };
  return icons[status] || "mdi-help-circle";
};

const formatTime = (time) => {
  if (!time) return "-- : --";

  try {
    const timeObj = new Date(`2000-01-01T${time}`);
    return timeObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return "-- : --";
  }
};

// Event Handlers
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const clearFilters = () => {
  Object.assign(filters, {
    organization: "",
    branch: "",
    department: "",
    monthYear: new Date().toISOString().slice(0, 7),
  });
  searchQuery.value = "";
  currentPage.value = 1;
  router.replace({ query: {} });
  fetchAttendanceData();
};

const handleApplyFilters = (newFilters) => {
  console.log("Applying filters with tenantId:", tenantId.value);
  Object.assign(filters, newFilters);
  currentPage.value = 1;
  fetchAttendanceData();
};

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  fetchAttendanceData();
}, 300);

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
};

const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
  currentPage.value = 1;
};

const handleRowClick = (item) => {
  console.log("Row clicked:", item);
};

// Watchers
watch(searchQuery, debouncedSearch);

watch(
  () => route.query,
  () => {
    fetchAttendanceData();
  },
  { deep: true },
);

watch(tenantId, (newValue) => {
  console.log("tenantId updated:", newValue);
});

// Lifecycle
onMounted(async () => {
  await fetchTenantId();
  if (tenantId.value) {
    await fetchAttendanceData();
  } else {
    console.error("Failed to fetch tenantId, cannot fetch attendance data");
  }
});
</script>

<style scoped>
.attendance-dashboard-container {
  display: flex;
  height: 100vh;
  position: relative;
}

/* Filter Panel */
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

/* Filter Toggle Button */
.filter-toggle-static {
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

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-content.full-width {
  margin-left: 0;
}

/* Header Content */
.header-content {
  padding: 1rem 1rem 1rem 3.75rem; /* Space for toggle button */
}

/* Adjust header-left to reduce gap between search and stats */
:deep(.header-left) {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Reduced gap from 1.5rem to 0.75rem */
  flex: 1;
}

.header-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

/* Stats Container */
.stats-container {
  display: inline-flex; /* Inline-flex to align with search */
  gap: 1rem; /* Reduced gap from 1.5rem to 1rem */
  padding: 0.5rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.stat-title {
  color: #6b7280;
}

/* Table Cell Styles */
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-width: 200px;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.employee-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-id {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

/* .department-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #3b82f6;
} */

/* .location-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #6b7280;
} */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 100px;
  justify-content: center;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}
.status-error {
  background: #fee2e2;
  color: #991b1b;
}
.status-blue {
  background: #dbeafe;
  color: #1e40af;
}
.status-indigo {
  background: #e0e7ff;
  color: #312e81;
}
.status-amber {
  background: #fef3c7;
  color: #92400e;
}
.status-grey {
  background: #f3f4f6;
  color: #4b5563;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.time-value {
  font-weight: 500;
  font-size: 0.875rem;
}

.time-late {
  font-size: 0.75rem;
  color: #dc2626;
}

.time-early {
  font-size: 0.75rem;
  color: #f59e0b;
}

.text-error {
  color: #dc2626;
}
.text-warning {
  color: #f59e0b;
}
.text-success {
  color: #10b981;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .attendance-dashboard-container {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 50vh;
    position: relative;
    z-index: 100;
  }

  .filter-toggle-static {
    position: static;
    margin: 1rem;
    width: 40px;
    height: 40px;
  }

  .main-content {
    margin-left: 0 !important;
  }

  .header-content {
    padding-left: 1rem;
  }

  .header-row {
    flex-direction: column;
    gap: 1rem;
  }

  :deep(.header-left) {
    flex-direction: row; /* Keep search and stats in a row on

  .stats-container {
    gap: 0.75rem; /* Reduced gap for stats on smaller screens */
  }
}

@media (max-width: 480px) {
  .stats-container {
    gap: 0.5rem; /* Further reduced gap for very small screens */
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>

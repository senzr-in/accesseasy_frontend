<template>
  <div class="attendance-container">
    <div class="filter-panel" v-if="showFilters">
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

    <!-- Main Content -->
    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Employees...'"
        :isEmpty="filteredItems.length === 0 && hasActiveFilters && !loading"
        :hasError="false"
        @update:searchQuery="debounceSearchInput"
      >
        <!-- Toolbar Actions Slot -->
        <template #before-search>
          <button
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
        <!-- Table content states -->
        <div v-if="loading || initialLoading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="itemsPerPage"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="filteredItems.length === 0 && hasActiveFilters">
          <EmptyState
            title="No attendance records found"
            message="Try adjusting your filters or search terms"
            :primaryAction="{ text: 'Clear Filters', icon: X }"
            @primaryAction="clearAllFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredItems"
            :columns="columns"
            :selectedItems="selectedItems"
            :showSelection="false"
            :sortBy="sortBy[0]?.key || ''"
            :sortDirection="sortBy[0]?.order || 'asc'"
            :itemKey="'id'"
            :rowClickable="true"
            @update:selectedItems="selectedItems = $event"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @rowClick="handleRowClick"
            @sort="handleSort"
          >
            <!-- Profile Column -->
            <template #cell-profile="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="item.assignedUser?.first_name"
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

            <!-- Employee Name Column -->
            <template #cell-name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.assignedUser?.first_name || "N/A" }}
                </h3>
              </div>
            </template>

            <!-- Department Column -->
            <template #cell-department="{ item }">
              {{ item.department?.departmentName || "No Department" }}
            </template>

            <!-- Attendance Policy Column -->
            <template #cell-attendancePolicy="{ item }">
              {{ item.config?.configName || "N/A" }}
            </template>

            <!-- Status Column -->
            <template #cell-status="{ item }">
              <span :class="getStatusClass(item)">
                {{ getStatusText(item) }}
              </span>
            </template>

            <!-- Days Column -->
            <template #cell-days="{ item }">
              <div class="days-checkboxes">
                <label v-for="day in days" :key="day" class="day-checkbox">
                  <input
                    type="checkbox"
                    :checked="
                      !getDayShifts(item, day).isWeekOff &&
                      getDayShifts(item, day).shifts.length > 0
                    "
                    :class="getDayCheckboxClass(item, day)"
                    disabled
                    @click.stop="
                      showShiftDetails(getDayShifts(item, day), item)
                    "
                  />
                  {{ day.charAt(0).toUpperCase() }}
                </label>
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>

      <!-- Shift Details Dialog -->
      <div
        v-if="showShiftDialog"
        class="dialog-overlay"
        @click="showShiftDialog = false"
      >
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <div class="dialog-title">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              <h3>Shift Details</h3>
            </div>
            <button class="dialog-close" @click="showShiftDialog = false">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="dialog-body">
            <div class="shift-details-list">
              <div
                v-for="(shift, index) in selectedShifts"
                :key="index"
                class="shift-detail-item"
              >
                <div class="shift-header">
                  <span
                    class="shift-name"
                    :style="{
                      backgroundColor: getShiftColor(
                        shift.shifts_id?.shift || 'default',
                      ),
                    }"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {{ shift.shifts_id?.shift || "Unknown Shift" }}
                  </span>
                </div>
                <div class="shift-details">
                  <div class="shift-time">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>
                      {{ formatTime(shift.shifts_id?.entryTime) }} -
                      {{ formatTime(shift.shifts_id?.exitTime) }}
                    </span>
                  </div>
                  <div class="shift-break">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                    </svg>
                    <span>Break: {{ formatTime(shift.shifts_id?.break) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
import { useRouter } from "vue-router";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

// State Management
const router = useRouter();
const loading = ref(false);
const initialLoading = ref(true);
const search = ref("");
const items = ref([]);
const showFilters = ref(true);
const showShiftDialog = ref(false);
const selectedShifts = ref([]);
const selectedItems = ref([]);
const selectedStatus = ref("all");
const days = ref(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const shiftCache = ref({});
const tenantId = currentUserTenant.getTenantId();

// Filter Options
const shiftOptions = ref([]);
const configNameOptions = ref([]);
const filters = reactive({
  shift: [],
  configName: [],
  employeeStatus: [],
  organization: "",
  department: "",
  branch: "",
  role: "",
  gender: "",
  dateFrom: "",
  dateTo: "",
});

// Status Options
const statuses = ref([
  { text: "All", value: "all", color: "primary" },
  { text: "Working", value: "working", color: "primary" },
  { text: "Week Off", value: "weekoff", color: "error" },
]);

// Filter Schema for FilterComponent
const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

// Columns for DataTable
const columns = [
  // { key: "profile", label: "Profile", sortable: false, width: "60px" },
  { key: "name", label: "Name", sortable: false, width: "1.5" },
  { key: "department", label: "Department", sortable: false, width: "1.5" },
  // {
  //   key: "attendancePolicy",
  //   label: "Attendance Policy",
  //   sortable: false,
  //   width: "2px",
  // // },
  // { key: "status", label: "Status", sortable: false, width: "1.2" },
  { key: "days", label: "Shifts Assigned Days", sortable: false, width: "5" },
];

// Computed Properties
const initialFilters = computed(() => ({
  shift: filters.shift,
  configName: filters.configName,
  employeeStatus: filters.employeeStatus,
  organization: filters.organization,
  department: filters.department,
  role: filters.role,
  gender: filters.gender,
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
  branch: filters.branch,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.shift.length > 0 ||
    filters.configName.length > 0 ||
    filters.employeeStatus.length > 0 ||
    filters.organization ||
    filters.department ||
    filters.branch ||
    filters.role ||
    filters.gender ||
    filters.dateFrom ||
    filters.dateTo ||
    search.value !== ""
  );
});

const allItemsSelected = computed(() => {
  return (
    items.value.length > 0 && selectedItems.value.length === items.value.length
  );
});

const someItemsSelected = computed(() => {
  return (
    selectedItems.value.length > 0 &&
    selectedItems.value.length < items.value.length
  );
});

const filteredItems = computed(() => {
  return items.value;
});

// Helper Functions (Retained from Original)
const dayToSettingsKey = {
  mon: { isKey: "isMonday", shiftKey: "monJ" },
  tue: { isKey: "isTuesday", shiftKey: "tueJ" },
  wed: { isKey: "isWednesday", shiftKey: "wedJ" },
  thu: { isKey: "isThursday", shiftKey: "thuJ" },
  fri: { isKey: "isFriday", shiftKey: "friJ" },
  sat: { isKey: "isSaturday", shiftKey: "satJ" },
  sun: { isKey: "isSunday", shiftKey: "sunJ" },
};

const getDayShifts = (item, day) => {
  try {
    const settings = item.attendanceSettings || {};
    const { isKey, shiftKey } = dayToSettingsKey[day];
    const isWeekOff = settings[isKey] || false;
    const shifts = settings[shiftKey]?.shifts || [];
    return {
      isWeekOff,
      shifts: shifts.map((shiftId) => ({
        shifts_id: shiftCache.value[shiftId] || { id: shiftId },
      })),
    };
  } catch (error) {
    console.error(`Error getting shifts for ${day}:`, error);
    return { isWeekOff: false, shifts: [] };
  }
};

const getStatusText = (item) => {
  const hasAnyShifts = days.value.some(
    (day) =>
      !getDayShifts(item, day).isWeekOff &&
      getDayShifts(item, day).shifts.length > 0,
  );
  return hasAnyShifts ? "Assigned" : "Not Assigned";
};

const getStatusClass = (item) => {
  const status = getStatusText(item);
  return {
    "status-badge": true,
    "status-assigned": status === "Assigned",
    "status-not-assigned": status === "Not Assigned",
  };
};

const getDayCheckboxClass = (item, day) => {
  const { isWeekOff, shifts } = getDayShifts(item, day);
  return {
    "day-checkbox-input": true,
    "day-checkbox-assigned": !isWeekOff && shifts.length > 0,
    "day-checkbox-not-assigned": isWeekOff || shifts.length === 0,
  };
};

const getShiftColor = (shift) => {
  const shiftColors = JSON.parse(localStorage.getItem("shiftColors") || "{}");
  if (!shiftColors[shift]) {
    const hue = Math.floor(Math.random() * 360);
    shiftColors[shift] = `hsl(${hue}, 70%, 45%)`;
    localStorage.setItem("shiftColors", JSON.stringify(shiftColors));
  }
  return shiftColors[shift];
};

const formatTime = (time) => {
  if (!time) return "N/A";
  return time.slice(0, 5);
};

const getStatusCount = (status) => {
  if (!items.value.length) return 0;
  if (status === "all") return items.value.length;
  if (status === "working") {
    return items.value.filter((item) =>
      days.value.some((day) => !getDayShifts(item, day).isWeekOff),
    ).length;
  }
  if (status === "weekoff") {
    return items.value.filter((item) =>
      days.value.every((day) => getDayShifts(item, day).isWeekOff),
    ).length;
  }
  return 0;
};

// API Functions (Retained with Modifications)
const fetchShiftDetailsBatch = async (shiftIds) => {
  const token = authService.getToken();
  const tenantId = await currentUserTenant.getTenantId();
  if (!token || !tenantId) return {};

  const BATCH_SIZE = 100;
  const results = {};
  const uncachedShiftIds = shiftIds.filter((id) => !shiftCache.value[id]);

  if (uncachedShiftIds.length === 0) return shiftCache.value;

  try {
    for (let i = 0; i < uncachedShiftIds.length; i += BATCH_SIZE) {
      const batch = uncachedShiftIds.slice(i, i + BATCH_SIZE);
      const idsFilter = batch.join(",");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/shifts?filter[id][_in]=${idsFilter}&fields=id,shift,entryTime,exitTime,break&limit=${BATCH_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      data.data.forEach((shift) => {
        shiftCache.value[shift.id] = shift;
        results[shift.id] = shift;
      });
    }
    return { ...shiftCache.value, ...results };
  } catch (error) {
    console.error("Error fetching shift details in batch:", error);
    return shiftCache.value;
  }
};

const collectAllShiftIds = (attendanceData) => {
  const shiftIds = new Set();
  attendanceData.forEach((item) => {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    days.forEach((day) => {
      const settings = item.attendanceSettings || {};
      const { shiftKey } = dayToSettingsKey[day];
      const shifts = settings[shiftKey]?.shifts || [];
      shifts.forEach((shiftId) => shiftIds.add(shiftId));
    });
  });
  return Array.from(shiftIds);
};

const fetchAttendanceDetails = async () => {
  const token = authService.getToken();
  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const tenantId = currentUserTenant.getTenantId();
    const userRole = userDetails.role?.name;
    const userId = userDetails.id;

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    loading.value = true;

    const params = new URLSearchParams({
      fields: [
        "id",
        "employeeId",
        "assignedUser.first_name",
        "assignedUser.tenant",
        "assignedUser.status",
        "assignedUser.avatar.id",
        "assignedUser.avatar.type",
        "assignedUser.avatar.title",
        "department.id",
        "department.departmentName",
        "branch.id",
        "branch.branchName",
        "config.configName",
        "attendanceSettings.id",
        "attendanceSettings.sunJ",
        "attendanceSettings.monJ",
        "attendanceSettings.tueJ",
        "attendanceSettings.wedJ",
        "attendanceSettings.thuJ",
        "attendanceSettings.friJ",
        "attendanceSettings.satJ",
        "attendanceSettings.isMonday",
        "attendanceSettings.isTuesday",
        "attendanceSettings.isWednesday",
        "attendanceSettings.isThursday",
        "attendanceSettings.isFriday",
        "attendanceSettings.isSaturday",
        "attendanceSettings.isSunday",
      ].join(","),
      limit: itemsPerPage.value,
      sort: sortBy.value[0]
        ? `${sortBy.value[0].order === "desc" ? "-" : ""}${sortBy.value[0].key}`
        : "id",
      page: page.value,
    });

    // Role-based filtering
    if (["Admin", "Dealer"].includes(userRole)) {
      params.append("filter[assignedUser][tenant][tenantId][_eq]", tenantId);
    } else {
      params.append("filter[_or][0][approver][id][_eq]", userId);
      params.append("filter[_or][1][assignedUser][id][_eq]", userId);
    }

    // Search filters
    if (search.value) {
      const searchValue = search.value;
      params.append("filter[_or][0][employeeId][_icontains]", searchValue);
      params.append(
        "filter[_or][1][assignedUser][first_name][_icontains]",
        searchValue,
      );
      params.append(
        "filter[_or][2][department][departmentName][_icontains]",
        searchValue,
      );
      params.append(
        "filter[_or][3][config][configName][_icontains]",
        searchValue,
      );
    }

    // Apply filters from FilterComponent
    if (filters.shift.length > 0) {
      params.append(
        "filter[attendanceSettings][shifts][shift][_in]",
        filters.shift.join(","),
      );
    }
    if (filters.configName.length > 0) {
      params.append(
        "filter[config][configName][_in]",
        filters.configName.join(","),
      );
    }
    if (filters.employeeStatus.length) {
      if (
        filters.employeeStatus.includes("Active") &&
        !filters.employeeStatus.includes("Left")
      ) {
        params.append("filter[assignedUser][dateOfLeaving][_null]=true");
      } else if (
        filters.employeeStatus.includes("Left") &&
        !filters.employeeStatus.includes("Active")
      ) {
        params.append("filter[assignedUser][dateOfLeaving][_nnull]=true");
      }
    }
    if (filters.organization) {
      params.append(
        "filter[assignedUser][organization][id][_eq]",
        filters.organization,
      );
    }
    if (filters.branch) {
      params.append("filter[branchLocation][id][_eq]", filters.branch);
    }
    if (filters.department) {
      params.append("filter[department][id][_eq]=", filters.department);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Collect and fetch shift details
    const allShiftIds = collectAllShiftIds(data.data);
    if (allShiftIds.length > 0) {
      await fetchShiftDetailsBatch(allShiftIds);
    }

    // Process avatar images
    const processedItems = await Promise.all(
      data.data.map(async (employee) => {
        if (employee.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${employee.assignedUser.avatar.id}`;
          employee.avatarImage = await fetchAuthorizedImage(avatarUrl);
        }
        return employee;
      }),
    );

    items.value = processedItems;
  } catch (error) {
    console.error("Error fetching attendance details:", error);
    items.value = [];
  } finally {
    initialLoading.value = false;
    loading.value = false;
  }
};

const aggregateCount = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  try {
    if (!token || !tenantId)
      throw new Error("Authentication required or tenant not found");
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const userRole = userDetails.role?.name;
    const userId = userDetails.id;

    const params = new URLSearchParams();
    params.append("aggregate[count]", "id");

    // Role-based filtering
    if (["Admin", "Dealer"].includes(userRole)) {
      params.append("filter[assignedUser][tenant][tenantId][_eq]", tenantId);
    } else if (userRole === "Manager") {
      params.append("filter[_or][0][approver][id][_eq]", userId);
      params.append("filter[_or][1][assignedUser][id][_eq]", userId);
    } else {
      params.append("filter[assignedUser][id][_eq]", userId);
    }

    // Search filters
    if (search.value) {
      const searchValue = search.value;
      params.append("filter[_or][0][employeeId][_icontains]", searchValue);
      params.append(
        "filter[_or][1][assignedUser][first_name][_icontains]",
        searchValue,
      );
      params.append(
        "filter[_or][2][department][departmentName][_icontains]",
        searchValue,
      );
      params.append(
        "filter[_or][3][config][configName][_icontains]",
        searchValue,
      );
    }

    if (filters.shift.length > 0) {
      params.append(
        "filter[attendanceSettings][shifts][shift][_in]",
        filters.shift.join(","),
      );
    }
    if (filters.configName.length > 0) {
      params.append(
        "filter[config][configName][_in]",
        filters.configName.join(","),
      );
    }
    if (filters.employeeStatus.length) {
      if (
        filters.employeeStatus.includes("Active") &&
        !filters.employeeStatus.includes("Left")
      ) {
        params.append("filter[assignedUser][dateOfLeaving][_null]=true");
      } else if (
        filters.employeeStatus.includes("Left") &&
        !filters.employeeStatus.includes("Active")
      ) {
        params.append("filter[assignedUser][dateOfLeaving][_nnull]=true");
      }
    }
    if (filters.organization) {
      params.append(
        "filter[assignedUser][organization][orgName][_eq]",
        filters.organization,
      );
    }
    if (filters.department) {
      params.append(
        "filter[department][departmentName][_eq]",
        filters.department,
      );
    }
    if (filters.branch) {
      params.append("filter[branchLocation][id][_eq]", filters.branch);
    }

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!countResponse.ok)
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchFilterOptions = async () => {
  const token = authService.getToken();
  const tenantId = await currentUserTenant.getTenantId();
  if (!token || !tenantId) return;

  try {
    const [shiftRes, configRes, orgRes, deptRes] = await Promise.all([
      fetch(
        `${import.meta.env.VITE_API_URL}/items/shifts?fields=id,shift&filter[tenant][tenantId][_eq]=${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
      fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?fields=config.configName&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
      fetch(
        `${import.meta.env.VITE_API_URL}/items/organization?fields=orgName&filter[tenant][tenantId][_eq]=${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
      fetch(
        `${import.meta.env.VITE_API_URL}/items/department?fields=departmentName&filter[tenant][tenantId][_eq]=${tenantId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    ]);

    const [shiftData, configData, orgData, deptData] = await Promise.all([
      shiftRes.json(),
      configRes.json(),
      orgRes.json(),
      deptRes.json(),
    ]);

    shiftOptions.value = shiftData.data.map((s) => ({
      title: s.shift,
      value: s.shift,
    }));

    configNameOptions.value = [
      ...new Set(
        configData.data.map((item) => item.config?.configName).filter(Boolean),
      ),
    ].map((name) => ({
      title: name,
      value: name,
    }));

    // Update filter schema with dynamic options
    pageFilters.find((f) => f.key === "shift").options = shiftOptions.value;
    pageFilters.find((f) => f.key === "configName").options =
      configNameOptions.value;
    pageFilters.find((f) => f.key === "organization").options =
      orgData.data.map((o) => ({
        title: o.orgName,
        value: o.orgName,
      }));
    pageFilters.find((f) => f.key === "department").options = deptData.data.map(
      (d) => ({
        title: d.departmentName,
        value: d.departmentName,
      }),
    );
    pageFilters.find((f) => f.key === "employeeStatus").options = [
      { title: "Active", value: "Active" },
      { title: "Left", value: "Left" },
    ];
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
};

const getManagerBranchId = async (userId) => {
  const token = authService.getToken();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][id][_eq]=${userId}&fields=branch.id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    return data.data[0]?.branch?.id || null;
  } catch (error) {
    console.error("Error fetching manager branch ID:", error);
    return null;
  }
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const token = authService.getToken();
    const response = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// Event Handlers
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchData();
};

const clearSearch = () => {
  search.value = "";
  debounceSearchInput();
};

const toggleItemSelection = (itemId) => {
  if (selectedItems.value.includes(itemId)) {
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId);
  } else {
    selectedItems.value.push(itemId);
  }
};

const toggleSelectAll = () => {
  if (allItemsSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = items.value.map((item) => item.id);
  }
};

const clearAllFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  selectedItems.value = [];
  selectedStatus.value = "all";
  fetchData();
};

const handleRowClick = (item) => {
  if (item?.id) {
    router.push(`/employee-details/employee/${item.id}/attendancemodule`);
  }
};

const showShiftDetails = async (dayData, item) => {
  const { shifts } = dayData;
  if (shifts.length === 0) return;
  selectedShifts.value = shifts.map((shift) => ({
    shifts_id: shiftCache.value[shift.shifts_id.id],
  }));
  showShiftDialog.value = true;
};

const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newSortDirection) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newSortDirection }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchData();
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

const debounceSearchInput = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

const fetchData = async () => {
  loading.value = true;
  await aggregateCount();
  await fetchAttendanceDetails();
  loading.value = false;
};

// Lifecycle Hooks
onMounted(async () => {
  await currentUserTenant.fetchLoginUserDetails();
  await fetchData();
  await fetchFilterOptions();
});

watch(
  [search, () => ({ ...filters }), selectedStatus, sortBy],
  () => {
    page.value = 1;
    fetchData();
  },
  { deep: true },
);
</script>

<style scoped>
/* Attendance Container */
.attendance-container {
  display: flex;
  height: 100vh;
  position: relative;
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

/* Filter Panel */
.filter-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Attendance Counters */
.attendance-counters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.attendance-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
}

.attendance-pill.primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.attendance-pill.error {
  background: #fee2e2;
  color: #dc2626;
}

.attendance-label {
  font-weight: 500;
}

.attendance-count {
  font-weight: 600;
}

/* Profile Avatar */
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #64748b;
}

/* Employee Info */
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.employee-name {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}

/* Badges */
.department-badge,
.config-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.department-badge {
  background: #dbeafe;
  color: #1d4ed8;
}

.config-badge {
  background: #fef3c7;
  color: #92400e;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-assigned {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-not-assigned {
  background: #fee2e2;
  color: #dc2626;
}

/* Days Checkboxes */
.days-checkboxes {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1e293b;
}

.day-checkbox input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.day-checkbox input.day-checkbox-assigned {
  background-color: #22c55e;
  border-color: #22c55e;
}

.day-checkbox input.day-checkbox-assigned:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

.day-checkbox input.day-checkbox-not-assigned {
  background-color: #ef4444;
  border-color: #ef4444;
}

.day-checkbox input.day-checkbox-not-assigned:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

.day-checkbox input:disabled {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .attendance-container {
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
}
</style>

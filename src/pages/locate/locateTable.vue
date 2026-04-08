<!-- locatetable.vue -->
<template>
  <div class="logs-container">
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

    <!-- Main Content -->
    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <!-- Export Dropdown -->
      <data-table-wrapper
        v-model:searchQuery="search"
        :search-placeholder="'Search ...'"
        :show-search="true"
        :has-error="showError"
        wrapper-class="logs-table-wrapper"
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
        <template #toolbar-actions>
          <div class="export-dropdown d-flex justify-end mb-4">
            <DropdownButton
              text="Export"
              :items="exportItems"
              placement="bottom-right"
              @itemClick="handleExportClick"
            />
          </div>
        </template>
        <!-- Loading State -->
        <template v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="itemsPerPage || 10"
            :columns="columns.length"
          />
        </template>

        <!-- Error State -->
        <template v-else-if="showError">
          <ErrorState
            title="Unable to load attendance"
            :message="errorMessage"
            @retry="fetchData"
          />
        </template>

        <!-- Empty State -->
        <template v-else-if="items.length === 0 && !loading">
          <EmptyState
            title="No attendance data found"
            message="Try adjusting your filters or check back later"
            :primary-action="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </template>

        <!-- Table Content -->
        <template v-else>
          <DataTable
            :items="items"
            :columns="columns"
            :sort-by="sortBy.key"
            :sort-direction="sortBy.order"
            :row-clickable="true"
            @sort="handleSort"
            @rowClick="handleRowClick"
          >
            <!-- Custom Cell for Employee ID -->
            <template #cell-employeeId="{ item }">
              <span class="employee-code">{{ item.employeeId || "N/A" }}</span>
            </template>

            <!-- Custom Cell for Name -->
            <template #cell-name="{ item }">
              <div class="employee-info">
                <div class="employee-details">
                  <h3 class="employee-name">
                    {{ item.assignedUser?.first_name || "Unknown" }}
                  </h3>
                </div>
              </div>
            </template>

            <!-- Custom Cell for Date -->
            <template #cell-date="{ item }">
              <span>{{ item.attendance?.date || currentDate }}</span>
            </template>

            <!-- Custom Cell for In Time -->
            <template #cell-inTime="{ item }">
              <span>{{ item.attendance?.inTime || "-" }}</span>
            </template>

            <!-- Custom Cell for Out Time -->
            <template #cell-outTime="{ item }">
              <span>{{ item.attendance?.outTime || "-" }}</span>
            </template>

            <!-- Custom Cell for Work Hours -->
            <template #cell-workHours="{ item }">
              <span>{{ item.attendance?.workHours || "-" }}</span>
            </template>

            <!-- Action Button -->
            <template #cell-actions="{ item }">
              <ActionBtn
                class="action-btn"
                data-action="view-logs"
                :icon="CheckCircle"
                variant="ghost"
                size="sm"
                tooltip="View Logs"
                @click.stop="openLogsPopup(item)"
              />
            </template>
          </DataTable>
        </template>

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
      </data-table-wrapper>
    </div>

    <!-- Employee Logs Popup Dialog -->
    <EmployeeLogsPopup
      v-model="logsDialog"
      :selected-employee="selectedEmployee"
      :employee-logs="employeeLogs"
      :current-date="currentDate"
      :loading="logsLoading"
      @refresh="handleRefreshLogs"
      @close="closeLogsDialog"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, nextTick } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import { Filter, CheckCircle } from "lucide-vue-next";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import ActionBtn from "@/components/common/buttons/ActionButton.vue";
import EmployeeLogsPopup from "./employee-logs-popup.vue";
import DropdownButton from "@/components/common/buttons/DropdownButton.vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TOKEN_HEADER = { "Content-Type": "application/json" };
const PERSONAL_MODULE_FIELDS = [
  "assignedUser.first_name",
  "assignedUser.id",
  "assignedUser.avatar.id",
  "cycleType",
  "employeeId",
  "id",
];
const ATTENDANCE_FIELDS = [
  "date",
  "employeeId.id",
  "employeeId.employeeId",
  "inTime",
  "outTime",
  "status",
  "workHours",
  "mode",
  "id",
  "employeeId.branchLocation.orgLocation.orgName",
  "employeeId.branchLocation.locmark",
];
const LOG_FIELDS = [
  "employeeId.employeeId",
  "employeeId.assignedUser.first_name",
  "timeStamp",
  "action",
  "date",
  "id",
  "employeeId.id",
  "lng",
  "lat",
  "polyline",
  "idleDuration",
];

const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(true);
const showError = ref(false);
const errorMessage = ref("");
const selectedStatus = ref("all");
const statuses = ref([
  { value: "all", text: "All", color: "grey" },
  { value: "present", text: "Present", color: "success" },
  { value: "absent", text: "Absent", color: "error" },
]);

const logsDialog = ref(false);
const selectedEmployee = ref(null);
const employeeLogs = ref([]);
const logsLoading = ref(false);

const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = ref(null);
const token = authService.getToken();
const userRole = ref(null);
const userId = ref(null);
const sortBy = ref({ key: "date", order: "desc" });
const defaultDate = new Date().toISOString().split("T")[0];
const currentDate = ref(defaultDate);
const authInitialized = ref(false);
const baseApiUrl = import.meta.env.VITE_API_URL;

const exporting = ref(false);

// Export items for dropdown
const exportItems = ref([
  { label: "Export to Excel", value: "excel" },
  { label: "Export to PDF", value: "pdf" },
]);

// Filter options
const filters = reactive({
  status: "",
  mode: "",
  dateFrom: defaultDate,
});

const resolvedStatusFilter = computed(() => {
  if (filters.status) return filters.status;
  return selectedStatus.value !== "all" ? selectedStatus.value : "";
});

const initialFilters = computed(() => ({
  status: filters.status,
  mode: filters.mode,
  dateFrom: filters.dateFrom,
}));

const pageFilters = ref([
  { key: "dateFrom", label: "Date", type: "date", show: true },
]);

const columns = ref([
  { key: "employeeId", label: "EmpID", sortable: true, width: "120px" },
  { key: "name", label: "Name", sortable: true, width: "150px" },
  { key: "date", label: "Date", sortable: true, width: "150px" },
  { key: "inTime", label: "In Time", sortable: true, width: "100px" },
  { key: "outTime", label: "Out Time", sortable: true, width: "100px" },
  {
    key: "workHours",
    label: "Total Working Hours",
    sortable: true,
    width: "150px",
  },
  // { key: "actions", label: "Action", sortable: false, width: "100px" },
]);

const getActionColor = (action) => {
  switch (action?.toLowerCase()) {
    case "in":
      return "success";
    case "out":
      return "warning";
    default:
      return "grey";
  }
};

const getActionIcon = (action) => {
  switch (action?.toLowerCase()) {
    case "in":
      return "mdi-login";
    case "out":
      return "mdi-logout";
    default:
      return "mdi-help-circle";
  }
};

const initializeAuth = async () => {
  try {
    if (!authService.isAuthenticated()) {
      throw new Error("Please log in to continue");
    }
    if (!token) {
      throw new Error("Authentication token missing");
    }

    if (!currentUserTenant.initialized) {
      await currentUserTenant.initialize();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get values using synchronous getters (data should be ready now)
    tenantId.value = currentUserTenant.getTenantId();
    userRole.value = currentUserTenant.getRole();
    userId.value = currentUserTenant.getUserId();

    // Final verification
    if (!tenantId.value) {
      await currentUserTenant.refresh();
      tenantId.value = currentUserTenant.getTenantId();

      if (!tenantId.value) {
        throw new Error(
          "Tenant information not found. Please contact support.",
        );
      }
    }

    authInitialized.value = true;
  } catch (error) {
    console.error("❌ Error initializing auth:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to initialize. Please log in again.";
    authInitialized.value = false;

    // Logout on auth failure
    if (!authService.isAuthenticated()) {
      setTimeout(() => {
        authService.logout();
      }, 2000);
    }
  }
};

// build personal module query with filters and aggregate meta
const fetchPersonalModules = async (restrictedIds = []) => {
  try {
    if (!tenantId.value) {
      throw new Error("Tenant ID not available");
    }

    const params = new URLSearchParams();
    PERSONAL_MODULE_FIELDS.forEach((field) => params.append("fields[]", field));
    params.append("limit", String(itemsPerPage.value));
    params.append("page", String(page.value));
    params.append("meta", "filter_count");
    params.append(
      "filter[_and][0][assignedUser][tenant][tenantId][_eq]",
      tenantId.value,
    );
    // params.append("filter[_and][1][accessOn][_eq]", "true");

    let filterIndex = 2;
    if (restrictedIds.length > 0) {
      params.append(
        `filter[_and][${filterIndex}][id][_in]`,
        restrictedIds.join(","),
      );
      filterIndex += 1;
    }

    if (search.value) {
      params.append(
        `filter[_and][${filterIndex}][_or][0][employeeId][_icontains]`,
        search.value,
      );
      params.append(
        `filter[_and][${filterIndex}][_or][1][assignedUser][first_name][_icontains]`,
        search.value,
      );
    }

    const sortParam = resolveSortParam();
    if (sortParam) {
      params.append("sort", sortParam);
    }

    const response = await fetch(
      `${baseApiUrl}/items/personalModule?${params.toString()}`,
      {
        headers: { ...TOKEN_HEADER, Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return {
      modules: data?.data ?? [],
      total: data?.meta?.filter_count ?? data?.meta?.total ?? 0,
    };
  } catch (error) {
    console.error("Error fetching personal modules:", error);
    return { modules: [], total: 0 };
  }
};

const resolveSortParam = () => {
  if (!sortBy.value.key) return "";
  const prefix = sortBy.value.order === "desc" ? "-" : "";
  if (sortBy.value.key === "employeeId") {
    return `${prefix}employeeId`;
  }
  if (sortBy.value.key === "name") {
    return `${prefix}assignedUser.first_name`;
  }
  return "";
};

// fetch attendance with optional prefetch for filters
const fetchAttendances = async (date, employeeIds = [], fetchAll = false) => {
  try {
    if (!tenantId.value) {
      throw new Error("Tenant ID not available");
    }

    const params = new URLSearchParams();
    ATTENDANCE_FIELDS.forEach((field) => params.append("fields[]", field));
    params.append(
      "filter[_and][0][_and][0][tenant][tenantId][_eq]",
      tenantId.value,
    );
    params.append("filter[_and][0][_and][1][date][_eq]", date);

    let filterIndex = 2;
    if (!fetchAll && employeeIds.length > 0) {
      params.append(
        `filter[_and][0][_and][${filterIndex}][employeeId][_in]`,
        employeeIds.join(","),
      );
      filterIndex += 1;
    }

    const statusFilter = resolvedStatusFilter.value;
    if (statusFilter) {
      params.append(
        `filter[_and][0][_and][${filterIndex}][status][_eq]`,
        statusFilter,
      );
      filterIndex += 1;
    }

    if (filters.mode) {
      params.append(
        `filter[_and][0][_and][${filterIndex}][mode][_eq]`,
        filters.mode,
      );
      filterIndex += 1;
    }

    params.append("limit", "-1");

    const response = await fetch(
      `${baseApiUrl}/items/attendance?${params.toString()}`,
      {
        headers: { ...TOKEN_HEADER, Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data?.data ?? [];
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return [];
  }
};

const fetchData = async () => {
  loading.value = true;
  showError.value = false;
  errorMessage.value = "";

  try {
    if (!authInitialized.value) {
      await initializeAuth();
    }
    if (!tenantId.value) {
      throw new Error("Tenant ID not initialized");
    }

    const activeDate = filters.dateFrom || defaultDate;
    currentDate.value = activeDate;

    const requiresAttendancePrefetch =
      Boolean(resolvedStatusFilter.value) || Boolean(filters.mode);

    let attendanceUniverse = [];
    if (requiresAttendancePrefetch) {
      attendanceUniverse = await fetchAttendances(activeDate, [], true);
      if (attendanceUniverse.length === 0) {
        items.value = [];
        totalItems.value = 0;
        return;
      }
    }

    const restrictedIds = requiresAttendancePrefetch
      ? Array.from(
          new Set(
            attendanceUniverse
              .map((record) => record.employeeId?.id)
              .filter(Boolean),
          ),
        )
      : [];

    if (requiresAttendancePrefetch && restrictedIds.length === 0) {
      items.value = [];
      totalItems.value = 0;
      return;
    }

    const { modules, total } = await fetchPersonalModules(restrictedIds);

    if (modules.length === 0) {
      items.value = [];
      totalItems.value = total;
      return;
    }

    const moduleIds = modules.map((module) => module.id).filter(Boolean);

    let attendanceRecords = [];
    if (requiresAttendancePrefetch) {
      attendanceRecords = attendanceUniverse.filter((record) =>
        moduleIds.includes(record.employeeId?.id),
      );
    } else {
      attendanceRecords = await fetchAttendances(activeDate, moduleIds, false);
    }

    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.employeeId?.id, record]),
    );

    const combined = modules.map((module) => ({
      ...module,
      attendance: attendanceMap.get(module.id) ?? {},
    }));

    items.value = sortRecords(combined);
    totalItems.value = total;
  } catch (error) {
    console.error("Error fetching data:", error);
    showError.value = true;
    errorMessage.value = "Failed to fetch data. Please try again.";
  } finally {
    loading.value = false;
  }
};

// client-side sorting helper
const sortRecords = (records) => {
  const { key, order } = sortBy.value;
  if (!key) return records;
  const sorted = [...records].sort((a, b) => {
    const aValue = getComparableValue(a, key);
    const bValue = getComparableValue(b, key);
    if (aValue === bValue) return 0;
    return aValue > bValue ? 1 : -1;
  });
  return order === "desc" ? sorted.reverse() : sorted;
};

const getComparableValue = (item, key) => {
  switch (key) {
    case "name":
      return (item.assignedUser?.first_name || "").toLowerCase();
    case "date":
      return item.attendance?.date || "";
    case "inTime":
      return item.attendance?.inTime || "";
    case "outTime":
      return item.attendance?.outTime || "";
    case "workHours":
      return item.attendance?.workHours || "";
    case "employeeId":
      return item.employeeId || "";
    default:
      return item[key] ?? "";
  }
};

// streamline pagination handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

const handleSort = ({ field, direction }) => {
  sortBy.value = { key: field, order: direction };
  fetchData();
};

// ✅ NEW: Row Click Handler (SAME as taskTable.vue)
const handleRowClick = (item, event) => {
  // 1. Skip if clicking on button
  if (
    event &&
    (event.target.closest(".action-btn") ||
      event.target.closest('[data-action="view-logs"]'))
  ) {
    return; // Let button handle it
  }

  // 2. ✅ OPEN EmployeeLogsPopup on ROW CLICK
  openLogsPopup(item);
};
const getStatusCount = (status) => {
  if (status === "all") return items.value.length;
  return items.value.filter((item) => item.attendance?.status === status)
    .length;
};

const hasActiveFilters = computed(() => {
  return (
    filters.status ||
    filters.mode ||
    filters.dateFrom !== defaultDate ||
    search.value ||
    resolvedStatusFilter.value
  );
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  filters.status = newFilters.status || "";
  filters.mode = newFilters.mode || "";
  filters.dateFrom = newFilters.dateFrom || defaultDate;
  page.value = 1;
};

const clearFilters = () => {
  filters.status = "";
  filters.mode = "";
  filters.dateFrom = defaultDate;
  search.value = "";
  selectedStatus.value = "all";
  page.value = 1;
  fetchData();
};

const openLogsPopup = async (item) => {
  selectedEmployee.value = item;
  logsDialog.value = true;
  logsLoading.value = true;
  try {
    const logs = await fetchEmployeeLogs(item.id, currentDate.value);
    employeeLogs.value = logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    employeeLogs.value = [];
  } finally {
    logsLoading.value = false;
  }
};

const closeLogsDialog = () => {
  logsDialog.value = false;
  selectedEmployee.value = null;
  employeeLogs.value = [];
};

const fetchEmployeeLogs = async (employeeId, date) => {
  try {
    if (!tenantId.value) {
      throw new Error("Tenant ID not available");
    }
    const params = new URLSearchParams();
    LOG_FIELDS.forEach((field) => params.append("fields[]", field));
    params.append(
      "filter[_and][0][_and][0][tenant][tenantId][_eq]",
      tenantId.value,
    );
    params.append("filter[_and][0][_and][1][employeeId][_eq]", employeeId);
    params.append("filter[_and][0][_and][2][date][_eq]", date);
    params.append("sort", "-timeStamp");
    params.append("limit", "-1");
    params.append("page", "1");

    const response = await fetch(
      `${baseApiUrl}/items/logs?${params.toString()}`,
      {
        headers: { ...TOKEN_HEADER, Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data?.data ?? [];
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};

const handleRefreshLogs = async () => {
  if (selectedEmployee.value) {
    logsLoading.value = true;
    employeeLogs.value = await fetchEmployeeLogs(
      selectedEmployee.value.id,
      currentDate.value,
    );
    logsLoading.value = false;
  }
};

const handleExportClick = (item) => {
  if (item.value === "excel") {
    exportToExcel();
  } else if (item.value === "pdf") {
    exportToPDF();
  }
};

// Export Functions
const exportToExcel = async () => {
  exporting.value = true;
  try {
    const exportData = await prepareExportData();
    const header = "Employee Tracking Report";
    const dateLine = `Date: ${currentDate.value}`;

    const ws_data = [
      [header],
      [dateLine],
      [], // empty row
      Object.keys(exportData[0] || {}), // column headers
      ...exportData.map((row) => Object.values(row)),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Merge cells for header and date
    ws["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: Object.keys(exportData[0] || {}).length - 1 },
      },
      {
        s: { r: 1, c: 0 },
        e: { r: 1, c: Object.keys(exportData[0] || {}).length - 1 },
      },
    ];

    // Auto-size columns
    const colWidths = ws_data[3].map((_, colIndex) => ({
      wch: Math.max(
        ...ws_data.map((row) => String(row[colIndex] || "").length),
        15,
      ),
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Tracking - ${currentDate.value}`);
    const fileName = `employee_tracking_${currentDate.value}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Export to Excel failed:", error);
  } finally {
    exporting.value = false;
  }
};

const exportToPDF = async () => {
  const exportData = await prepareExportData();

  const doc = new jsPDF({
    orientation: "landscape", // 👈 important
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text("Employee Location Report", 40, 40);

  const headers = [Object.keys(exportData[0])];
  const rows = exportData.map((item) => Object.values(item));

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 60,
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save("location_report.pdf");
};

const prepareExportData = async () => {
  const data = [];
  for (const item of items.value) {
    const logs = await fetchEmployeeLogs(item.id, currentDate.value);
    const processed = getProcessedLogs(logs);
    const summary = getSummaryStats(logs, processed);
    const route = getRouteStats(logs);

    // take first log lat/lng (you can change to last if needed)
    const firstLog = logs.length > 0 ? logs[0] : {};
    const lat = firstLog.lat || "N/A";
    const lng = firstLog.lng || "N/A";

    data.push({
      EmployeeID: item.employeeId || "N/A",
      Name: item.assignedUser?.first_name || "Unknown",
      Date: item.attendance?.date || currentDate.value,
      InTime: item.attendance?.inTime || "-",
      OutTime: item.attendance?.outTime || "-",
      WorkHours: item.attendance?.workHours || "-",
      TotalDistance_km: summary.totalDistance,
      Travel_km: route.totalTravel,
      Idle_m: route.totalIdle,
      IdleDuration_mins: route.totalIdleDuration,
      // Latitude: lat,
      // Longitude: lng,
    });
  }
  return data;
};

// Helper functions copied and adapted from employee-logs-popup.vue
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours} hrs ${remainingMinutes} mins`;
};

const formatHours = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} hrs ${m} mins`;
};

const decodePolyline = (encoded) => {
  if (!encoded) return [];

  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const poly = [];

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return poly;
};

const getProcessedLogs = (logs) => {
  if (!logs || logs.length === 0) return [];

  const getSeconds = (timeStr) => {
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return new Date(timeStr).getTime() / 1000;
  };

  const sortedLogs = [...logs].sort(
    (a, b) => getSeconds(a.timeStamp) - getSeconds(b.timeStamp),
  );

  const processed = [];
  const STOP_THRESHOLD_KM = 3;
  const MIN_STOP_MINUTES = 5;

  for (let i = 0; i < sortedLogs.length; i++) {
    const currentLog = sortedLogs[i];
    processed.push({ ...currentLog, type: "log" });

    if (i < sortedLogs.length - 1) {
      const nextLog = sortedLogs[i + 1];

      if (
        currentLog.lat &&
        currentLog.lng &&
        currentLog.lat !== 0 &&
        currentLog.lng !== 0 &&
        nextLog.lat &&
        nextLog.lng &&
        nextLog.lat !== 0 &&
        nextLog.lng !== 0
      ) {
        const distance = calculateDistance(
          parseFloat(currentLog.lat),
          parseFloat(currentLog.lng),
          parseFloat(nextLog.lat),
          parseFloat(nextLog.lng),
        );

        const currentSeconds = getSeconds(currentLog.timeStamp);
        const nextSeconds = getSeconds(nextLog.timeStamp);
        const timeDiffSeconds = nextSeconds - currentSeconds;
        const minutesDiff = timeDiffSeconds / 60;

        if (distance >= STOP_THRESHOLD_KM && minutesDiff >= MIN_STOP_MINUTES) {
          const stopDuration = formatDuration(minutesDiff);

          processed.push({
            id: `stop_${i}`,
            type: "stop",
            lat: currentLog.lat,
            lng: currentLog.lng,
            startTime: currentLog.timeStamp,
            endTime: nextLog.timeStamp,
            duration: stopDuration,
            distance: distance.toFixed(2) + " km",
          });
        }
      }
    }
  }

  return processed;
};

const getSummaryStats = (logs, processed) => {
  if (!logs || logs.length === 0) {
    return {
      startTime: "N/A",
      endTime: "N/A",
      totalWorkingHours: "N/A",
      totalDistance: "0.00",
    };
  }

  const getSeconds = (timeStr) => {
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return new Date(timeStr).getTime() / 1000;
  };

  const sortedLogs = [...logs].sort((a, b) => {
    return getSeconds(a.timeStamp) - getSeconds(b.timeStamp);
  });

  const firstLog = sortedLogs.find((log) => log.action?.toLowerCase() === "in");
  const lastLog = [...sortedLogs]
    .reverse()
    .find((log) => log.action?.toLowerCase() === "out");

  const startTime = firstLog ? firstLog.timeStamp : "N/A";
  const endTime = lastLog ? lastLog.timeStamp : "N/A";

  let totalWorkingHours = "N/A";
  if (firstLog && lastLog) {
    const startSeconds = getSeconds(firstLog.timeStamp);
    const endSeconds = getSeconds(lastLog.timeStamp);
    const diffSeconds = endSeconds - startSeconds;

    const stopTime = processed
      .filter((item) => item.type === "stop")
      .reduce((total, stop) => {
        const stopStart = getSeconds(stop.startTime);
        const stopEnd = getSeconds(stop.endTime);
        return total + (stopEnd - stopStart);
      }, 0);

    const workingSeconds = diffSeconds - stopTime;
    const workingHours = workingSeconds / 3600;
    totalWorkingHours = workingHours > 0 ? formatHours(workingHours) : "N/A";
  }

  return {
    startTime,
    endTime,
    totalWorkingHours,
    totalDistance: getRouteStats(logs).totalDistance.toFixed(2),
  };
};

const getLogsWithStats = (logs) => {
  return logs.map((log) => {
    let travel = 0;
    let idle = 0;
    if (log.polyline) {
      const coords = decodePolyline(log.polyline);
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const current = coords[i];
        const dist = calculateDistance(
          prev.lat,
          prev.lng,
          current.lat,
          current.lng,
        );
        if (dist < 0.025) {
          idle += dist;
        } else {
          travel += dist;
        }
      }
    }
    return {
      ...log,
      travelDistance: travel,
      idleDistance: idle * 1000, // meters
    };
  });
};

const getRouteStats = (logs) => {
  const logsWithStats = getLogsWithStats(logs);
  let totalDistance = 0;
  let totalTravel = 0;
  let totalIdle = 0;
  let totalStops = getProcessedLogs(logs).filter(
    (item) => item.type === "stop",
  ).length;

  logsWithStats.forEach((log) => {
    totalTravel += log.travelDistance;
    totalIdle += log.idleDistance;
    totalDistance += log.travelDistance + log.idleDistance / 1000;
  });

  return {
    totalDistance,
    totalStops,
    totalTravel: totalTravel.toFixed(2),
    totalIdle: totalIdle.toFixed(2),
  };
};

// reduce duplicate fetch calls by consolidating watchers
const debouncedFetchData = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

watch(
  [
    search,
    () => filters.status,
    () => filters.mode,
    () => filters.dateFrom,
    () => selectedStatus.value,
  ],
  () => {
    debouncedFetchData();
  },
);

onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
.logs-container {
  display: flex;
  height: 100vh;
  position: relative;
  background-color: #f5f7fa;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.main-content.full-width {
  margin-right: 0;
}

.logs-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.employee-code {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.attendance-count {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.export-dropdown {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>

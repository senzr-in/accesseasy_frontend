<template>
  <div class="filter-wrapper">
    <div class="filter-header">
      <h2>Filters</h2>
      <BaseButton
        variant="secondary"
        size="sm"
        rounded="md"
        @click="resetFilters"
      >
        Reset
      </BaseButton>
    </div>
    <!-- Filter Content - Properly Collapsible -->
    <div
      class="filter-content-container"
      :class="{ collapsed: !isFilterVisible }"
    >
      <div class="filter-content">
        <div v-if="error" class="error-message">
          <svg
            class="error-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <path d="M12 8v4m0 4h.01" stroke-width="2" />
          </svg>
          {{ error }}
        </div>

        <div class="filter-grid">
          <div
            v-for="filter in visibleFilters"
            :key="filter.key"
            class="filter-item"
          >
            <label class="filter-label">
              <svg
                class="label-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <g v-html="getIconSvg(filter.key, filter.type)"></g>
              </svg>
              {{ filter.label }}
            </label>

            <!-- Month Input -->
            <input
              v-if="filter.type === 'month'"
              type="month"
              :value="localFilters[filter.key]"
              @change="handleMonthChange($event.target.value)"
              class="filter-input"
            />

            <!-- Organization Select -->
            <select
              v-else-if="filter.key === 'organization'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Organizations</option>
              <option
                v-for="org in organizations"
                :key="org.id"
                :value="org.id"
              >
                {{ org.orgName }}
              </option>
            </select>

            <!-- Branch Select - REMOVED DEPENDENCY -->
            <select
              v-else-if="filter.key === 'branch'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Branches</option>
              <option
                v-for="branch in branches"
                :key="branch.id"
                :value="branch.id"
              >
                {{ branch.locdetail?.locationName || "Unknown" }}
              </option>
            </select>

            <!-- Department Select - REMOVED DEPENDENCY -->
            <select
              v-else-if="filter.key === 'department'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Departments</option>
              <option
                v-for="dept in departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.departmentName }}
              </option>
            </select>

            <!-- Attendance Cycle Select -->
            <div
              v-else-if="filter.key === 'attendanceCycle'"
              class="attendance-cycle-container"
            >
              <select
                :value="localFilters[filter.key]"
                @change="handleAttendanceCycleChange($event.target.value)"
                class="filter-input"
                :disabled="isLoadingCycles"
              >
                <option value="">Select Attendance Cycle</option>
                <option
                  v-for="cycle in attendanceCycles"
                  :key="cycle.cycleId"
                  :value="cycle.cycleId"
                >
                  {{ cycle.cycleName }}
                </option>
              </select>

              <!-- Loading indicator for cycles -->
              <div v-if="isLoadingCycles" class="loading-indicator">
                Loading attendance cycles...
              </div>

              <!-- Display Dynamic Cycle Stats -->
              <div
                v-if="selectedCycleWithDates && !isLoadingCycles"
                class="cycle-stats"
              >
                <p>
                  <strong>Cycle Period:</strong>
                  {{ formatDate(selectedCycleWithDates.actualStartDate) }} to
                  {{ formatDate(selectedCycleWithDates.actualEndDate) }}
                </p>
                <p>
                  <strong>Include Weekends:</strong>
                  {{ selectedCycle?.includeWeekends ? "Yes" : "No" }}
                </p>
                <p>
                  <strong>Include Holidays:</strong>
                  {{ selectedCycle?.includeHolidays ? "Yes" : "No" }}
                </p>
              </div>
            </div>

            <!-- Employee Cycle Type -->
            <select
              v-else-if="filter.key === 'cycleType'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Cycle Types</option>
              <option
                v-for="type in cycleTypeOptions"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>

            <!-- Status Select -->
            <select
              v-else-if="filter.key === 'status'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Statuses</option>
              <option
                v-for="status in statusOptions"
                :key="status"
                :value="status"
              >
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
              </option>
            </select>

            <!-- Mode Select -->
            <select
              v-else-if="filter.key === 'mode'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Modes</option>
              <option
                v-for="option in modeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.title }}
              </option>
            </select>

            <!-- Attendance Select -->
            <select
              v-else-if="filter.key === 'attendance'"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">All Attendance Types</option>
              <option
                v-for="attendance in attendanceOptions"
                :key="attendance"
                :value="attendance"
              >
                {{
                  attendance.charAt(0).toUpperCase() +
                  attendance
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                }}
              </option>
            </select>

            <!-- Generic Select (for custom options) -->
            <select
              v-else-if="filter.type === 'select' && filter.options"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            >
              <option value="">
                {{ filter.placeholder || `All ${filter.label}` }}
              </option>
              <option
                v-for="option in filter.options"
                :key="option.id || option.value"
                :value="option.id || option.value"
              >
                {{ option.name || option.label }}
              </option>
            </select>

            <!-- Text Input -->
            <input
              v-else-if="filter.type === 'text'"
              type="text"
              :value="localFilters[filter.key]"
              @input="handleInputChange(filter.key, $event.target.value)"
              :placeholder="filter.placeholder || ''"
              class="filter-input"
            />

            <!-- Date Input -->
            <input
              v-else-if="filter.type === 'date'"
              type="date"
              :value="localFilters[filter.key]"
              @change="handleInputChange(filter.key, $event.target.value)"
              class="filter-input"
            />

            <!-- Number Input -->
            <input
              v-else-if="filter.type === 'number'"
              type="number"
              :value="localFilters[filter.key]"
              @input="handleInputChange(filter.key, $event.target.value)"
              :placeholder="filter.placeholder || ''"
              class="filter-input"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import {
  fetchCycleTypes,
  getCycleById,
  formatCycleDates,
} from "@/utils/Tasksexport/fetchCycleTypes";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { ref } from "vue";

export default {
  components: {
    BaseButton,
  },
  props: {
    tenantId: String,
    initialFilters: {
      type: Object,
      default: () => ({}),
    },
    initiallyVisible: {
      type: Boolean,
      default: false,
    },
    filterSchema: {
      type: Array,
      default: () => [
        { key: "monthYear", label: "Month & Year", type: "month", show: true },
        { key: "startDate", label: "Start Date", type: "date", show: true },
        { key: "endDate", label: "End Date", type: "date", show: true },
        {
          key: "organization",
          label: "Organization",
          type: "select",
          show: true,
        },
        { key: "branch", label: "Branch", type: "select", show: true },
        { key: "department", label: "Department", type: "select", show: true },
        {
          key: "attendanceCycle",
          label: "Attendance Cycle",
          type: "select",
          show: true,
        },
        {
          key: "cycleType",
          label: "Cycle Type",
          type: "select",
          show: true,
        },
        { key: "status", label: "Status", type: "select", show: true },
        { key: "mode", label: "Mode", type: "select", show: true },
        { key: "attendance", label: "Attendance", type: "select", show: true },
        {
          key: "request",
          label: "Request Type",
          type: "select",
          show: true,
          options: [
            { value: "", label: "All Requests" },
            { value: "myrequests", label: "My Requests" },
          ],
        },
      ],
    },
  },
  emits: ["apply-filters", "filters-changed", "filter-visibility-changed"],
  setup() {
    const statusOptions = ["in", "out", "notPunchedIn", "draft"];
    const attendanceOptions = [
      "present",
      "absent",
      "weekOff",
      "holiday",
      "onDuty",
      "workFromHome",
      "halfDay",
      "paidLeave",
      "unpaidLeave",
      "holidayPresent",
      "weekoffPresent",
      "earlyLeaving",
      "lateComing",
      "workingDayOT",
      "weekOffOT",
      "holidayOT",
      "workFromHomeOT",
      "unknown",
    ];
    const modeOptions = ref([
      { value: "manual", title: "Manual Entries" },
      { value: "import", title: "Import Entries" },
      { value: "throughApp", title: "Mobile based Entries" },
      { value: "systemUpdate", title: "Abnormalities" },
      { value: "rfid", title: "RFID" },
      { value: "face", title: "Face" },
    ]);

    return {
      statusOptions,
      attendanceOptions,
      modeOptions,
    };
  },
  data() {
    return {
      localFilters: {
        attendanceCycle: "",
        monthYear: new Date().toISOString().slice(0, 7), // Default to current month
        startDate: "",
        endDate: "",
      },
      organizations: [],
      branches: [],
      departments: [],
      attendanceCycles: [],
      isLoadingCycles: false,
      error: null,
      cycleTypeOptions: [],
      isFilterVisible: this.initiallyVisible,
    };
  },
  computed: {
    visibleFilters() {
      return this.filterSchema.filter((filter) => filter.show !== false);
    },
    selectedCycle() {
      if (
        !this.localFilters.attendanceCycle ||
        this.attendanceCycles.length === 0
      ) {
        return null;
      }
      return getCycleById(
        this.attendanceCycles,
        parseInt(this.localFilters.attendanceCycle)
      );
    },
    selectedCycleWithDates() {
      if (!this.selectedCycle || !this.localFilters.monthYear) {
        return null;
      }
      return this.calculateCycleDates(
        this.selectedCycle,
        this.localFilters.monthYear
      );
    },
  },
  watch: {
    initialFilters: {
      handler(newFilters) {
        if (newFilters) {
          this.localFilters = {
            ...newFilters,
            attendanceCycle: newFilters.attendanceCycle || "",
            monthYear:
              newFilters.monthYear || new Date().toISOString().slice(0, 7),
            startDate: newFilters.startDate || "",
            endDate: newFilters.endDate || "",
          };
        }
      },
      immediate: true,
      deep: true,
    },
    filterSchema: {
      handler() {
        this.initializeFiltersFromSchema();
      },
      immediate: true,
    },
  },
  async mounted() {
    this.initializeFiltersFromSchema();

    // Fetch all data in parallel without dependencies
    const promises = [
      this.fetchOrganizations(),
      this.fetchBranches(),
      this.fetchDepartments(),
    ];

    // Only fetch attendance cycles if the filter is visible
    if (this.hasFilter("attendanceCycle")) {
      promises.push(this.fetchAttendanceCycles());
    }

    await Promise.all(promises);

    // Set default cycle if cycles are loaded and no cycle is selected
    if (
      this.attendanceCycles.length > 0 &&
      !this.localFilters.attendanceCycle
    ) {
      this.localFilters.attendanceCycle =
        this.attendanceCycles[0].cycleId.toString();
      // Emit updated filters with calculated cycle dates
      this.$emit("filters-changed", this.getFiltersWithCycleDates());
      this.$emit("apply-filters", this.getFiltersWithCycleDates());
    } else if (
      this.localFilters.attendanceCycle &&
      this.localFilters.monthYear
    ) {
      // If a cycle and month are already selected, emit filters with calculated dates
      this.$emit("filters-changed", this.getFiltersWithCycleDates());
      this.$emit("apply-filters", this.getFiltersWithCycleDates());
    }
  },
  methods: {
    async fetchAttendanceCycles() {
      if (this.isLoadingCycles) return;

      this.isLoadingCycles = true;
      this.error = null;

      try {
        this.attendanceCycles = await fetchCycleTypes();
        console.log("Fetched attendance cycles:", this.attendanceCycles);
      } catch (error) {
        console.error("Failed to fetch attendance cycles:", error);
        this.error = "Failed to load attendance cycles. Please try again.";
        this.attendanceCycles = [];
      } finally {
        this.isLoadingCycles = false;
      }
    },
    calculateCycleDates(cycle, monthYear) {
      if (!cycle || !monthYear) return null;

      const [year, month] = monthYear.split("-").map(Number);

      // Default: start from previous month
      let startMonth = month - 1;
      let startYear = year;

      if (startMonth < 1) {
        startMonth = 12;
        startYear = year - 1;
      }

      let actualEndDate;
      let actualStartDate;

      if (
        cycle.endDate === "end of the month" ||
        cycle.endDate === "End of the month"
      ) {
        actualEndDate = new Date(year, month, 0);
        actualStartDate = new Date(year, month - 1, parseInt(cycle.startDate));
      } else {
        actualEndDate = new Date(year, month - 1, parseInt(cycle.endDate));
        actualStartDate = new Date(
          startYear,
          startMonth - 1,
          parseInt(cycle.startDate)
        );
      }

      const timeDiff = actualEndDate.getTime() - actualStartDate.getTime();
      const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      return {
        ...cycle,
        actualStartDate,
        actualEndDate,
        totalDays,
        monthYear,
      };
    },
    formatDate(date) {
      if (!date) return "";

      if (
        typeof date === "string" &&
        date.toLowerCase().includes("end of month")
      ) {
        return "End of Month";
      }

      const d = date instanceof Date ? date : new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      return `${day}-${month}-${year}`;
    },
    getFiltersWithCycleDates() {
      const filters = { ...this.localFilters };

      if (this.selectedCycleWithDates) {
        filters.cycleStartDate = this.formatDateForAPI(
          this.selectedCycleWithDates.actualStartDate
        );
        filters.cycleEndDate = this.formatDateForAPI(
          this.selectedCycleWithDates.actualEndDate
        );
        filters.cycleTotalDays = this.selectedCycleWithDates.totalDays;
        filters.cycleIncludeWeekends =
          this.selectedCycleWithDates.includeWeekends;
        filters.cycleIncludeHolidays =
          this.selectedCycleWithDates.includeHolidays;
        filters.cycleStartDateDisplay = this.formatDate(
          this.selectedCycleWithDates.actualStartDate
        );
        filters.cycleEndDateDisplay = this.formatDate(
          this.selectedCycleWithDates.actualEndDate
        );
      } else {
        // Clear cycle-related fields if no valid cycle is selected
        filters.cycleStartDate = "";
        filters.cycleEndDate = "";
        filters.cycleTotalDays = null;
        filters.cycleIncludeWeekends = null;
        filters.cycleIncludeHolidays = null;
        filters.cycleStartDateDisplay = "";
        filters.cycleEndDateDisplay = "";
      }

      return filters;
    },
    formatDateForAPI(date) {
      if (!date) return "";

      if (
        typeof date === "string" &&
        date.toLowerCase().includes("end of month")
      ) {
        return "end-of-month";
      }

      const d = date instanceof Date ? date : new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
    initializeFiltersFromSchema() {
      const newFilters = {
        attendanceCycle: "",
        monthYear: new Date().toISOString().slice(0, 7),
        startDate: "",
        endDate: "",
      };

      this.filterSchema.forEach((filter) => {
        if (
          filter.key !== "attendanceCycle" &&
          filter.key !== "monthYear" &&
          filter.key !== "startDate" &&
          filter.key !== "endDate"
        ) {
          if (
            this.initialFilters &&
            this.initialFilters[filter.key] !== undefined
          ) {
            newFilters[filter.key] = this.initialFilters[filter.key];
          } else {
            newFilters[filter.key] = filter.defaultValue || "";
          }
        } else if (filter.key === "monthYear") {
          newFilters[filter.key] =
            this.initialFilters && this.initialFilters[filter.key]
              ? this.initialFilters[filter.key]
              : new Date().toISOString().slice(0, 7);
        } else if (filter.key === "startDate" || filter.key === "endDate") {
          newFilters[filter.key] =
            this.initialFilters && this.initialFilters[filter.key]
              ? this.initialFilters[filter.key]
              : "";
        }
      });

      if (JSON.stringify(newFilters) !== JSON.stringify(this.localFilters)) {
        this.localFilters = newFilters;
      }
    },
    handleMonthChange(value) {
      this.localFilters.monthYear = value;
      // Recalculate cycle dates if an attendance cycle is selected
      if (this.localFilters.attendanceCycle) {
        this.$emit("filters-changed", this.getFiltersWithCycleDates());
        this.$emit("apply-filters", this.getFiltersWithCycleDates());
      }
    },
    handleAttendanceCycleChange(value) {
      this.localFilters.attendanceCycle = value;
      // Recalculate cycle dates using current monthYear
      if (this.localFilters.monthYear) {
        this.$emit("filters-changed", this.getFiltersWithCycleDates());
        this.$emit("apply-filters", this.getFiltersWithCycleDates());
      }
    },
    getIconSvg(key, type) {
      const iconMap = {
        monthYear:
          '<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/>',
        startDate:
          '<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/>',
        endDate:
          '<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/>',
        organization:
          '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke-width="2"/>',
        branch:
          '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>',
        department:
          '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke-width="2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke-width="2"/>',
        attendanceCycle:
          '<path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4.5-2.67V7z" stroke-width="2"/>',
        status:
          '<path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke-width="2"/>',
        mode: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h12v2H6V8zm0 3h12v2H6v-2zm0 3h6v2H6v-2z" stroke-width="2"/>',
        attendance:
          '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-2c0-1.66 1.34-3 3-3h8c1.66 0 3 1.34 3 3v2z" stroke-width="2"/>',
        text: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/><polyline points="14,2 14,8 20,8" stroke-width="2"/>',
        date: '<rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/>',
        number:
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/><polyline points="14,2 14,8 20,8" stroke-width="2"/>',
        request:
          '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" stroke-width="2"/>',
      };

      return iconMap[key] || iconMap[type] || iconMap.text;
    },
    handleInputChange(key, value) {
      this.localFilters[key] = value;

      const filter = this.filterSchema.find((f) => f.key === key);

      if (filter) {
        this.$emit("filters-changed", this.getFiltersWithCycleDates());
        if (filter.type === "select" || filter.type === "date") {
          this.$emit("apply-filters", this.getFiltersWithCycleDates());
        }
      } else {
        console.warn(`Key '${key}' not found in filterSchema.`);
      }
    },
    // REMOVED: handleOrganizationChange method since we don't need special handling anymore

    async fetchOrganizations() {
      try {
        const token = authService.getToken();
        console.log("Token being sent:", token);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/organization`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { "filter[_and][0][tenant][tenantId][_eq]": this.tenantId },
          }
        );

        this.organizations = res.data.data || [];
      } catch (e) {
        this.error = "Failed to load organizations";
        if (e.response) {
          console.error("API error:", e.response.status, e.response.data);
          console.error("Request headers:", e.config?.headers);
        } else {
          console.error("Network/other error:", e);
        }
      }
    },
    async fetchBranches() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/locationManagement`,
          {
            headers: { Authorization: `Bearer ${authService.getToken()}` },
            params: {
              "filter[_and][0][locType][_contains]": "branch",
              "filter[_and][1][tenant][tenantId][_eq]": this.tenantId,
            },
          }
        );
        this.branches = res.data.data || [];
      } catch (e) {
        console.error("Failed to fetch branches:", e);
      }
    },
    async fetchDepartments() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/department`,
          {
            headers: { Authorization: `Bearer ${authService.getToken()}` },
            params: {
              "filter[_and][0][tenant][tenantId][_eq]": this.tenantId,
            },
          }
        );
        this.departments = res.data.data || [];
      } catch (e) {
        console.error("Failed to fetch departments:", e);
      }
    },
    async resetFilters() {
      const resetData = {
        attendanceCycle: "",
        monthYear: new Date().toISOString().slice(0, 7),
        startDate: "",
        endDate: "",
      };

      this.filterSchema.forEach((filter) => {
        if (
          filter.key !== "attendanceCycle" &&
          filter.key !== "monthYear" &&
          filter.key !== "startDate" &&
          filter.key !== "endDate"
        ) {
          resetData[filter.key] = filter.defaultValue || "";
        }
      });

      this.localFilters = resetData;

      // Set default cycle if cycles are available
      if (this.attendanceCycles.length > 0) {
        this.localFilters.attendanceCycle =
          this.attendanceCycles[0].cycleId.toString();
      }

      this.$emit("filters-changed", this.getFiltersWithCycleDates());
      this.$emit("apply-filters", this.getFiltersWithCycleDates());
    },
    hasFilter(key) {
      return this.filterSchema.some(
        (filter) => filter.key === key && filter.show !== false
      );
    },
  },
};
</script>

<style scoped>
.filter-header {
  padding: 1rem 1.25rem;
  border: 1px solid red;
  background: #f5dcda;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  text-align: left;
  margin-left: 0.5rem;
}

.filter-wrapper {
  display: flex;
  flex-direction: column;
  background: white;
  overflow-y: auto;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.filter-content-container {
  overflow: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 800px;
  opacity: 1;
}

.filter-content-container.collapsed {
  max-height: 0;
  opacity: 0;
}

.filter-content {
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}

.error-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.label-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  color: #6b7280;
}

.filter-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  min-height: 44px;
}

.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.filter-wrapper {
  position: relative;
  z-index: 10;
}

.attendance-cycle-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cycle-stats {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0c4a6e;
}

.cycle-stats p {
  margin: 0.25rem 0;
}

.cycle-stats strong {
  color: #075985;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-content-container:not(.collapsed) .filter-content {
  animation: slideDown 0.3s ease-out;
}
</style>

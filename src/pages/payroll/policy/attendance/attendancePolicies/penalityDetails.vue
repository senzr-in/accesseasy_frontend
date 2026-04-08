<template>
  <div class="logs-container">
    <!-- Filter Panel -->
    <!-- <div class="filter-panel" v-if="showFilters && tenantId">
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
    </div> -->

    <!-- Filter Toggle Button -->
    <!-- <button
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
    </button> -->

    <!-- Main Content -->
    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <data-table-wrapper
        v-if="!showTabs"
        v-model:searchQuery="search"
        :search-placeholder="'Search Logs...'"
        :show-search="true"
        :has-error="showError"
        wrapper-class="logs-table-wrapper"
      >
        <template #toolbar-actions>
          <div class="d-flex align-center" style="gap: 8px">
            <BaseButton
              v-if="userRole === 'Admin'"
              variant="primary"
              size="md"
              text="Create Penalties"
              :leftIcon="Plus"
              @click="openDialog"
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
            title="Unable to load logs"
            :message="errorMessage"
            @retry="fetchData"
          />
        </template>

        <!-- Empty State -->
        <template v-else-if="items.length === 0 && !loading">
          <EmptyState
            title="No logs data found"
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
            item-key="id"
            @sort="handleSort"
            @rowClick="showTemplateConfig"
          >
            <!-- 💼 Salary Setting Table Custom Cells -->
            <template #cell-configName="{ item }">
              <span>{{ item.configName || "-" }}</span>
            </template>

            <template #cell-attendanceSettings="{ item }">
              <span>{{ item.attendanceSettings?.settingName || "-" }}</span>
            </template>

            <template #cell-locationCentric="{ item }">
              <span>{{ item.attendancePolicies?.locationCentric ?? "-" }}</span>
            </template>

            <template #cell-entryTimeLimit="{ item }">
              <span>{{ item.attendancePolicies?.entryTimeLimit ?? "-" }}</span>
            </template>

            <template #cell-setEntryTimeLimit="{ item }">
              <span>{{
                item.attendancePolicies?.setEntryTimeLimit ?? "-"
              }}</span>
            </template>

            <template #cell-lateEntryAllowed="{ item }">
              <span>{{
                item.attendancePolicies?.lateEntryAllowed ? "Yes" : "No"
              }}</span>
            </template>

            <template #cell-exitTimeLimit="{ item }">
              <span>{{ item.attendancePolicies?.exitTimeLimit ?? "-" }}</span>
            </template>

            <template #cell-setExitTimeLimit="{ item }">
              <span>{{
                item.attendancePolicies?.setExitTimeLimit ?? "-"
              }}</span>
            </template>

            <template #cell-earlyExitAllowed="{ item }">
              <span>{{
                item.attendancePolicies?.earlyExitAllowed ? "Yes" : "No"
              }}</span>
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
      <AttendancePolicyTabs
        v-if="selectedTemplate"
        :selectedConfig="selectedTemplate"
        :policyPatchId="selectedID"
        @save-changes="handleSaveChanges"
        :showSnackbar="showSnackbar"
        @close="handleClose"
        ref="policyTabs"
      />
    </div>
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create New Category</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTemplate.name"
            label="Category Name"
            variant="outlined"
            required
            :rules="[(v) => !!v || 'Category name is required']"
          ></v-text-field>
          <v-alert v-if="customTemplates.length >= 10" type="warning" dense>
            Maximum number of categories (10) reached. You cannot create more
            categories.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="createDialog = false">Cancel</v-btn>
          <v-btn
            @click="saveTemplate"
            :loading="isSaving"
            :disabled="isSaving"
            color="primary"
            class="save-button"
          >
            <template v-slot:loader>
              <v-progress-circular
                indeterminate
                size="20"
                width="2"
              ></v-progress-circular>
            </template>
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import AttendancePolicyTabs from "../attendancePolicyTabs.vue";
import { ref, onMounted, computed, reactive, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";

import BaseButton from "@/components/common/buttons/BaseButton.vue";

import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import Dropdown from "@/components/common/buttons/DropdownButton.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import { Filter, Upload, Plus } from "lucide-vue-next";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";

import debounce from "lodash/debounce";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { useRouter } from "vue-router";

const debouncedfetchData = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

const router = useRouter();
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(true);
const showError = ref(false);
const errorMessage = ref("");
const selectedStatus = ref("all");
const statuses = ref([]);

const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const sortBy = ref({ key: "date_created", order: "desc" });

// Filter options
const filters = reactive({
  status: "",
  mode: "",
  dateFrom: "",
});

const initialFilters = computed(() => ({
  status: filters.status,
  mode: filters.mode,
  dateFrom: filters.dateFrom,
}));
const customTemplates = ref([]);
const createDialog = ref(false);
const newTemplate = ref({ name: "" });
const pageFilters = ref([
  { key: "dateFrom", label: "From Date", type: "date", show: true },
  { key: "status", label: "Status", type: "select", show: true },
  { key: "mode", label: "Mode", type: "select", show: true },
]);

const columns = ref([
  {
    key: "configName",
    label: "Penalty Policies",
    sortable: true,
    width: "200px",
  },

  {
    key: "entryTimeLimit",
    label: "Entry Time Limit",
    sortable: false,
    width: "180px",
  },
  {
    key: "lateEntryAllowed",
    label: "Late Entry Allowed",
    sortable: false,
    width: "180px",
  },
  {
    key: "setEntryTimeLimit",
    label: "Set Entry Time Limit",
    sortable: false,
    width: "200px",
  },

  {
    key: "exitTimeLimit",
    label: "Exit Time Limit",
    sortable: false,
    width: "180px",
  },
  {
    key: "setExitTimeLimit",
    label: "Set Exit Time Limit",
    sortable: false,
    width: "200px",
  },
  {
    key: "earlyExitAllowed",
    label: "Early Exit Allowed",
    sortable: false,
    width: "180px",
  },
]);
const saveTemplate = async () => {
  isSaving.value = true;

  if (!newTemplate.value.name.trim()) {
    showSnackbar("Category name is required.", "warning");
    isSaving.value = false;
    return;
  }

  try {
    const existingTemplate = customTemplates.value.find(
      (template) =>
        template.name.toLowerCase() === newTemplate.value.name.toLowerCase(),
    );

    if (existingTemplate) {
      showSnackbar("A template with this name already exists.", "warning");
      return;
    }

    if (customTemplates.value.length >= 10) {
      showSnackbar(
        "Maximum number of categories (10) reached. You cannot create more categories.",
        "warning",
      );
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          configName: newTemplate.value.name.trim(),
          tenant: tenantId.value,
          attendanceSettings: { status: "draft" },
          attendancePolicies: {
            locationCentric: false,
            calculate_WithInBreak: false,
          },
          salarySettings: { status: "draft" },
          leaveSettings: [],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create template");
    }

    await loadTemplates();
    createDialog.value = false;
    newTemplate.value.name = "";
    showSnackbar("Category added successfully!", "success");
  } catch (error) {
    console.error("Error creating template:", error);
    showSnackbar(
      error.message || "Error creating category. Please try again.",
      "error",
    );
  } finally {
    isSaving.value = false;
  }
};
const showTabs = ref(false);
const selectedTemplate = ref("");
const selectedID = ref("");
const showTemplateConfig = async (item) => {
  try {
    const template = item.id;

    if (template) {
      selectedTemplate.value = item;
      selectedID.value = template;
      showTabs.value = true;
    } else {
      //   throw new Error("Template not found.");
    }
  } catch (error) {
    console.error("Error loading template details:", error);
    // showSnackbar("Error loading template details. Please try again.", "error");
  }
};
const aggregateCount = async (tabStatus = selectedStatus.value) => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    const params = {
      "aggregate[count]": "id",
      ...filterParams(tabStatus),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config?${queryString}`,
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
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchData = async () => {
  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;

  try {
    await aggregateCount();
    let params = {
      fields: [
        "id",
        "configName",
        "attendanceSettings",
        "attendancePolicies.locationCentric",
        "attendancePolicies.entryTimeLimit",
        "attendancePolicies.setEntryTimeLimit",
        "attendancePolicies.lateEntryAllowed",
        "attendancePolicies.exitTimeLimit",
        "attendancePolicies.setExitTimeLimit",
        "attendancePolicies.earlyExitAllowed",
        "tenant",
        "status",
        "configName",
        "id",
        "leaveSettings",
        "tenant.tenantId",
        "tenant.tenantName",
      ],
      sort:
        sortBy.value.key && sortBy.value.order === "desc"
          ? `-${sortBy.value.key}`
          : sortBy.value.key,
      limit: itemsPerPage.value,
      page: page.value,
      ...filterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }

        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const url = `${import.meta.env.VITE_API_URL}/items/config?${queryString}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = data.data || [];
  } catch (error) {
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch salary settings. Please try again.";
  } finally {
    loading.value = false;
  }
};

const filterParams = (tabStatus = selectedStatus.value) => {
  const params = {};
  let filterCount = 0;

  if (
    userRole === "Admin" ||
    userRole === "Dealer" ||
    userRole === "Administrator"
  ) {
    params[`filter[_and][${filterCount}][tenant][tenantId][_eq]`] = tenantId;
    filterCount++;
  }
  if (userRole === "Manager") {
    params[`filter[_and][${filterCount}][employeeId][approver][id][_eq]`] =
      userId;
    params[`filter[_and][${filterCount}][employeeId][assignedUser][id][_eq]`] =
      userId;
    filterCount++;
  }
  if (userRole === "Employee") {
    params[`filter[_and][${filterCount}][employeeId][assignedUser][id][_eq]`] =
      userId;
    filterCount++;
  }
  if (search.value) {
    let searchOrIndex = 0;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}][employeeId][employeeId][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}][employeeId][assignedUser][first_name][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}][employeeId][assignedUser][last_name][_icontains]`
    ] = search.value;
    searchOrIndex++;
    filterCount++;
  }
  if (filters.dateFrom) {
    params[`filter[_and][${filterCount}][date][_gte]`] = filters.dateFrom;
    filterCount++;
  }

  if (filters.status) {
    params[`filter[_and][${filterCount}][action][_in]`] = filters.status;
    filterCount++;
  }
  if (filters.mode) {
    params[`filter[_and][${filterCount}][mode][_in]`] = filters.mode;
    filterCount++;
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

const handleSort = ({ field, direction }) => {
  sortBy.value = { key: field, order: direction };
  fetchData();
};

const getStatusCount = (status) => {
  return 0; // Placeholder, implement if needed
};
const handleSaveChanges = async (settingsData) => {
  try {
    // Make API call to save settings
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config/${this.selectedTemplate.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(settingsData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save settings");
    }

    // this.showSnackbar("Settings saved successfully!", "success");
    await this.loadTemplates();
  } catch (error) {
    console.error("Error saving settings:", error);
    // this.showSnackbar(
    //   error.message || "Error saving settings. Please try again.",
    //   "error",
    // );
    throw error; // Re-throw to allow child component to handle it
  }
};

const hasActiveFilters = computed(() => {
  return filters.status || filters.mode || filters.dateFrom || search.value;
});

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
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  page.value = 1;
  fetchData();
};

const openDialog = () => {
  if (customTemplates.value.length >= 10) {
    showSnackbar(
      "Maximum number of categories (10) reached. You cannot create more categories.",
      "warning",
    );
    return;
  }

  newTemplate.value.name = `Attendance Category ${customTemplates.value.length + 1}`;
  createDialog.value = true;
};

watch(
  [search, filters, sortBy, selectedStatus],
  () => {
    debouncedfetchData();
  },
  { deep: true },
);
const handleClose = async () => {
  showTabs.value = false;
  await fetchData();
};
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

.image-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.thumbnail-image {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-cell:hover .image-overlay {
  opacity: 1;
}

.error-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #999;
  border: 2px solid #e0e0e0;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.error-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #999;
  text-align: center;
}

.loading-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
  text-align: center;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
    linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
}

.full-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.v-chip) {
  font-weight: 600;
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

.attendance-count.present {
  background: #dcfce7;
  color: #166534;
}
.attendance-count.absent {
  background: #fee2e2;
  color: #dc2626;
}
.attendance-count.weekoff,
.attendance-count.holiday {
  background: #e0e7ff;
  color: #3730a3;
}
.attendance-count.onduty,
.attendance-count.wfh {
  background: #dbeafe;
  color: #1d4ed8;
}
.attendance-count.halfday {
  background: #fef3c7;
  color: #92400e;
}
.attendance-count.total {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
}

.import-btn {
  background: #122f68 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transition: all 0.3s ease !important;
}

.import-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4) !important;
}

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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>

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

    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <!-- DataTableWrapper Implementation -->
      <DataTableWrapper
        :search-query="search"
        @update:searchQuery="onSearchChange($event)"
        :has-error="showError"
        wrapper-class="custom-table-wrapper"
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
        <!-- Error State -->
        <template v-if="showError">
          <ErrorState
            title="Unable to load imports"
            :message="errorMessage"
            @retry="fetchData"
          />
        </template>

        <!-- Empty State -->
        <template v-else-if="items.length === 0 && !loading">
          <EmptyState
            title="No imports found"
            message="Start by creating your first import"
            :primary-action="{ text: 'Clear filters', icon: 'mdi-filters' }"
            @primaryAction="clearFilters"
          />
        </template>

        <!-- Table Content -->
        <template v-else>
          <DataTable
            :items="paginatedItems"
            :columns="tableColumns"
            :show-selection="false"
            :selected-items="selectedItems"
            :sort-by="currentSortBy"
            :sort-direction="currentSortDirection"
            :expandable="false"
            :row-clickable="true"
            @update:selectedItems="selectedItems = $event"
            @update:sortBy="currentSortBy = $event"
            @update:sortDirection="currentSortDirection = $event"
            @rowClick="editItem"
            @sort="handleSort"
          >
            <!-- Custom cell content for file -->
            <template #cell-generatedFile="{ item }">
              <v-chip
                v-if="item.generatedFile"
                color="primary"
                class="text-white"
                style="cursor: pointer"
                @click.stop="viewFile(item.generatedFile)"
              >
                {{ item.generatedFile.title }}
              </v-chip>
              <span v-else class="text-grey-500">No file</span>
            </template>

            <!-- Custom cell content for status -->
            <template #cell-status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                :text-color="getStatusTextColor(item.status)"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Custom cell content for date -->
            <template #cell-date_created="{ item }">
              {{ formatDate(item.date_created) }}
            </template>
            <template #cell-action="{ item }">
              <BaseButton
                variant="primary"
                size="sm"
                text="reCheckLogs"
                @click="recheckLog(item)"
              />
            </template>
            <!-- Custom cell content for imported by -->
            <template #cell-user_created="{ item }">
              {{ item.user_created?.first_name || "Unknown" }}
            </template>

            <template #cell-processingCount="{ item }">
              {{ item.processingCount?.lastProcessedRow || 0 }}
            </template>
            <!-- Custom cell content for tenant -->
            <template #cell-tenant="{ item }">
              {{ item.tenant?.tenantName || "N/A" }}
            </template>
          </DataTable>
        </template>

        <!-- Pagination Slot -->
        <template #pagination>
          <PaginationComponent
            :page="currentPage"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
            @update:page="onPageChange"
            @update:itemsPerPage="onItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ImportReport from "./importReport.vue";
import { authService } from "@/services/authService";
import DataTable from "@/components/common/table/DataTable.vue";
import PaginationComponent from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import debounce from "lodash/debounce";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

// Reactive state

const token = authService.getToken();
const showImport = ref(false);
const editedItem = ref({});
const showEditPage = ref(false);
const userRole = ref("");
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(true);
const showError = ref(false);
const errorMessage = ref("");
const totalItems = ref(0);
const selectedItems = ref([]);
const searchTimeout = ref(null);
const tenantId = currentUserTenant.getTenantId();

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(25);
const isSearching = ref(false);

// Sorting state
const currentSortBy = ref("date_created");
const currentSortDirection = ref("desc");

// Filter state
const today = new Date().toISOString().split("T")[0];
const filters = reactive({
  startDate: today, // Default to today
});

// Only include startDate in initialFilters
const initialFilters = computed(() => ({
  startDate: filters.startDate,
}));

// Only include startDate in pageFilters
const pageFilters = ref([
  { key: "startDate", label: "Start Date", type: "date", show: true },
]);

// Helper function to build exact date filter using year, month, day
const buildExactDateFilter = (filterParams, field, dateStr, andIndex = 0) => {
  if (!dateStr) return;
  const date = new Date(dateStr);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString(); // Months are 0-based in JS
  const day = date.getDate().toString();
  filterParams.append(
    `filter[_and][${andIndex}][_and][0][year(${field})][_eq]`,
    year,
  );
  filterParams.append(
    `filter[_and][${andIndex}][_and][1][month(${field})][_eq]`,
    month,
  );
  filterParams.append(
    `filter[_and][${andIndex}][_and][2][day(${field})][_eq]`,
    day,
  );
};

// Table column configuration
const tableColumns = ref([
  {
    key: "collectionName",
    label: "Collection Name",
    sortable: false,
    width: "200px",
  },
  {
    key: "status",
    label: "Status",
    sortable: false,
    width: "120px",
  },
  {
    key: "user_created",
    label: "Imported By",
    sortable: false,
    width: "200px",
  },
  {
    key: "generatedFile",
    label: "Imported File",
    sortable: false,
    width: "400px",
  },
  {
    key: "processingCount",
    label: "ProcessingCount",
    sortable: false,
    width: "400px",
  },
  {
    key: "date_created",
    label: "Import Date",
    sortable: false,
    width: "200px",
  },
  {
    key: "action",
    label: "Action",
    sortable: false,
    width: "150px",
  },
]);

// Computed properties
const hasActiveFilters = computed(() => {
  return search.value || filters.startDate;
});

const paginatedItems = computed(() => {
  return items.value; // Server-side pagination
});

// Utility methods
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const recheckLog = async (item) => {
  try {
    // 1️⃣ Fetch the file from Assets collection (raw binary)
    const fileResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${item.processingCount.fileId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!fileResponse.ok)
      throw new Error(`Failed to fetch file ${item.generatedFile}`);

    const fileBlob = await fileResponse.blob();
    const fileName = `file_${item.generatedFile}.xlsx`;
    const formData = new FormData();
    formData.append("importID", item.id);
    formData.append(
      "lastProcessedRow",
      item.processingCount.lastProcessedRow || 0,
    );
    formData.append("file", new File([fileBlob], fileName));
    formData.append("tenantId", tenantId);
    // 3️⃣ POST to /recheckLog
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/rechecklogs`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("Recheck result:", data);
  } catch (err) {
    console.error("Recheck failed:", err);
  }
};
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    default:
      return "default";
  }
};

const getStatusTextColor = (status) => {
  return ["completed", "failed"].includes(status?.toLowerCase())
    ? "white"
    : "black";
};

const handleImportSuccess = () => {
  currentPage.value = 1;
  fetchData();
  showImport.value = false;
};

// Pagination event handlers
const onPageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

const onItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  fetchData();
};

// Search handling
const debouncedFetchData = debounce(() => {
  isSearching.value = true;
  currentPage.value = 1;
  fetchData().finally(() => {
    isSearching.value = false;
  });
}, 500);

const onSearchChange = (newSearch) => {
  search.value = newSearch;
  debouncedFetchData();
};

const buildFilterQuery = () => {
  const filterParams = new URLSearchParams();

  if (search.value) {
    const searchValue = search.value.trim();
    filterParams.append(
      "filter[_or][0][collectionName][_icontains]",
      searchValue,
    );
    filterParams.append(
      "filter[_or][1][tenant][tenantName][_icontains]",
      searchValue,
    );
    filterParams.append(
      "filter[_or][2][user_created][first_name][_icontains]",
      searchValue,
    );
  }

  if (filters.startDate) {
    buildExactDateFilter(filterParams, "date_created", filters.startDate);
  }

  return filterParams;
};

const fetchData = async () => {
  const token = authService.getToken();
  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  const userDetails = await currentUserTenant.fetchLoginUserDetails();
  const tenantId = currentUserTenant.getTenantId();
  userRole.value = userDetails.role?.name;
  loading.value = true;

  try {
    let params = {
      fields: [
        "id",
        "collectionName",
        "generatedFile.title",
        "generatedFile.id",
        "generatedFile.type",
        "status",
        "user_created.first_name",
        "tenant.tenantName",
        "date_created",
        "processingCount",
      ],
      sort:
        currentSortBy.value && currentSortDirection.value === "desc"
          ? `-${currentSortBy.value}`
          : currentSortBy.value,
      limit: itemsPerPage.value,
      page: currentPage.value,
      ...buildFilterQuery(),
    };

    // Add tenant filter for role-based access
    if (userRole.value === "Manager" || userRole.value === "Admin") {
      params["filter[tenant][tenantId][_eq]"] = tenantId;
    }

    // Construct query string
    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((f) => `fields[]=${f}`).join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const url = `${import.meta.env.VITE_API_URL}/items/import?${queryString}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Unauthorized access. Token might be expired.");
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = data.data || [];
    totalItems.value = data.meta?.total_count || 0;
  } catch (error) {
    console.error("Error fetching data:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch data. Please try again.";
  } finally {
    loading.value = false;
  }
};

const viewFile = (generatedFile) => {
  if (!generatedFile || !generatedFile.id) return;

  const token = authService.getToken();
  const fileUrl = `${import.meta.env.VITE_API_URL}/assets/${generatedFile.id}`;

  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
    <html>
    <head>
      <title>File Viewer</title>
    </head>
    <body>
      <iframe
        src="${fileUrl}?access_token=${token}"
        style="width: 100%; height: 100vh; border: none;"
      ></iframe>
    </body>
    </html>
  `);
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  currentPage.value = 1;
  fetchData();
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = "";
  });
  search.value = "";
  currentPage.value = 1;
  fetchData();
};

const editItem = (item) => {
  editedItem.value = { ...item };
  showEditPage.value = true;
};

const handleSort = (sortData) => {
  console.log("Sorting:", sortData);
  currentPage.value = 1;
  fetchData();
};

// Watchers
watch(
  [currentSortBy, currentSortDirection, filters],
  () => {
    debouncedFetchData();
  },
  { deep: true },
);

// Lifecycle
onMounted(async () => {
  try {
    await fetchData();
  } catch (error) {
    console.error("Error during initialization:", error);
    showError.value = true;
    errorMessage.value = "Failed to initialize data. Please refresh the page.";
  }
});
</script>

<style scoped>
.employee-container {
  display: flex;
  height: 100vh;
  position: relative;
  background-color: #f5f7fa;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 6px;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.main-content.full-width {
  margin-right: 0;
}

.custom-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
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

.empty-state,
.error-state {
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

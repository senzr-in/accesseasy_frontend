<template>
  <div class="card-management-container">
    <!-- Filter Panel -->
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

    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Card Details'"
        :isEmpty="filteredCardManagementData.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <!-- Filter Toggle Button -->
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
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="cardManagementData.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load card details"
            :message="error"
            @retry="fetchCardManagementData"
          />
        </div>

        <div v-else-if="filteredCardManagementData.length === 0">
          <EmptyState
            title="No card details found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters' }"
            @primaryAction="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredCardManagementData"
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
            <!-- Employee ID Column -->
            <template #cell-employeeId="{ item }">
              <span>{{ item.employeeId?.employeeId || "N/A" }}</span>
            </template>

            <!-- Employee Name Column -->
            <template #cell-employeeName="{ item }">
              <span>{{ item.employeeName || "N/A" }}</span>
            </template>

            <!-- RFID Card Column -->
            <template #cell-rfidCard="{ item }">
              <span>{{ item.rfidCard || "N/A" }}</span>
            </template>

            <!-- Type Column -->
            <template #cell-type="{ item }">
              <v-chip
                :color="getTypeColor(item.type)"
                size="small"
                label
                variant="tonal"
              >
                {{ item.type }}
              </v-chip>
            </template>

            <!-- Card Access Column -->
            <template #cell-cardAccess="{ item }">
              <v-chip
                :color="item.cardAccess ? 'success' : 'error'"
                size="small"
                label
              >
                {{ item.cardAccess ? "Enable" : "Disable" }}
              </v-chip>
            </template>

            <!-- Access Level Column -->
            <template #cell-accessLevelsId="{ item }">
              <span>{{ item.accessLevelsId || "N/A" }}</span>
            </template>
          </DataTable>
        </div>

        <!-- Pagination Info -->
        <template #before-pagination>
          <div
            class="pagination-info"
            v-if="
              !loading &&
              filteredCardManagementData.length > 0 &&
              totalItems > 0
            "
          >
            Showing {{ (page - 1) * itemsPerPage + 1 }} to
            {{ Math.min(page * itemsPerPage, totalItems) }} of
            {{ totalItems }} entries
          </div>
        </template>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            :loading="loading"
            :items-per-page-options="[10, 25, 50, 100]"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";

// State
const router = useRouter();
const loading = ref(false);
const error = ref(null);
const showFilters = ref(true);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const selectedItems = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// Card type options
const cardTypeOptions = ref(["rfid", "tag"]);

// Define columns for DataTable
const columns = computed(() => [
  {
    key: "employeeId",
    label: "EmpId",
    sortable: false,
    width: "120px",
  },
  {
    key: "employeeName",
    label: "Name",
    sortable: false,
    width: "150px",
  },
  {
    key: "rfidCard",
    label: "RFID Card",
    sortable: true,
    width: "150px",
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    width: "100px",
  },
  {
    key: "cardAccess",
    label: "Card Access",
    sortable: true,
    width: "120px",
  },
  {
    key: "accessLevelsId",
    label: "Access Level",
    sortable: false,
    width: "130px",
  },
]);

// Filters
const filters = reactive({
  type: [],
  cardAccess: "all",
  organization: "",
  department: "",
  branch: "",
});

// Filter schema for FilterComponent
const pageFilters = [
  // {
  //   key: "type",
  //   label: "Card Type",
  //   type: "multi-select",
  //   show: true,
  //   options: cardTypeOptions.value.map((type) => ({
  //     value: type,
  //     label: type.toUpperCase(),
  //   })),
  // },
  // {
  //   key: "cardAccess",
  //   label: "Card Access",
  //   type: "radio",
  //   show: true,
  //   options: [
  //     { value: "all", label: "All" },
  //     { value: true, label: "Enable" },
  //     { value: false, label: "Disable" },
  //   ],
  // },
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

const initialFilters = computed(() => ({
  type: filters.type,
  cardAccess: filters.cardAccess,
  organization: filters.organization,
  department: filters.department,
  branch: filters.branch,
}));

// Computed Properties
const hasActiveFilters = computed(() => {
  return (
    filters.type.length > 0 ||
    filters.cardAccess !== "all" ||
    filters.organization ||
    filters.branch ||
    filters.department ||
    search.value !== ""
  );
});

// Data
const cardManagementData = ref([]);

// Get color for card type
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "rfid":
      return "primary";
    case "tag":
      return "info";
    default:
      return "grey";
  }
};

// Row click handler
const handleRowClick = (item) => {
  console.log("Row clicked:", item);

  if (item && item.employeeId && item.employeeId.id) {
    console.log("Navigating to employee:", item.employeeId.id);
    router.push(
      `/employee-details/employee/${item.employeeId.id}/accessmodule`
    );
  } else {
    console.error("Invalid item or employee ID not found");
    console.log("Item structure:", item);
  }
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };

    // Remove pagination parameters for count
    delete params.page;
    delete params.limit;
    delete params.sort;

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
    console.log("Total items count:", totalItems.value);
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    error.value = "Failed to load card count";
    totalItems.value = 0;
  }
};

// Fetch Data with correct fields
const fetchCardManagementData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Reset to page 1 if current page would be empty
    if (page.value > 1 && totalItems.value > 0) {
      const maxPage = Math.ceil(totalItems.value / itemsPerPage.value);
      if (maxPage > 0 && page.value > maxPage) {
        page.value = 1;
      }
    }

    await aggregateCount();

    const params = {
      fields: [
        "id",
        "tenant.tenantId",
        "accessLevelsId",
        "cardAccessLevelArray",
        "cardAccessLevelHex",
        "employeeId.employeeId",
        "rfidCard",
        "employeeId.id",
        "employeeId.assignedUser.first_name",
        "type",
        "cardAccess",
      ],
      ...filterParams(),
      sort:
        sortBy.value.length > 0
          ? `${sortBy.value[0].key}${sortBy.value[0].order === "desc" ? "" : ""}`
          : "date_created",
      page: page.value,
      limit: itemsPerPage.value,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    console.log("Fetching data with params:", params);

    // Fetch data
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cardManagementData.value = data.data;
    console.log("Fetched card management data:", data.data);
  } catch (err) {
    console.error("Error fetching card management data:", err);
    error.value = err.message || "Failed to load card data";
    cardManagementData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {};
  params["filter[tenant][tenantId][_eq]"] = tenantId;

  // Search filter
  if (search.value) {
    if (!isNaN(search.value)) {
      params["filter[_or][0][rfidCard][_eq]"] = search.value;
      params["filter[_or][1][accessLevelsId][_eq]"] = search.value;
      params["filter[_or][2][employeeId][employeeId][_icontains]"] =
        search.value;
    } else {
      params["filter[_or][0][type][_icontains]"] = search.value;
      params[
        "filter[_or][1][employeeId][assignedUser][first_name][_icontains]"
      ] = search.value;
      params["filter[_or][2][employeeId][employeeId][_icontains]"] =
        search.value;
    }
  }

  // Card Type filter
  if (filters.type.length > 0) {
    params["filter[type][_in]"] = filters.type.join(",");
  }

  // Card Access filter (Enable/Disable)
  if (filters.cardAccess !== "all") {
    params["filter[cardAccess][_eq]"] = filters.cardAccess;
  }

  return params;
};

// Computed - Transform the data for display
const filteredCardManagementData = computed(() => {
  return cardManagementData.value.map((item) => {
    // Handle the nested employee data structure
    const employeeName = item.employeeId?.assignedUser?.first_name || "N/A";
    const employeeId = item.employeeId?.employeeId || "N/A";

    return {
      ...item,
      employeeName: employeeName,
      employeeId: { employeeId: employeeId, id: item.employeeId?.id }, // Ensure id is preserved
    };
  });
});

// Filter Methods
const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchCardManagementData();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

// Debounced search function
const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchCardManagementData();
}, 300);

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  filters.type = [];
  filters.cardAccess = "all";
  filters.organization = "";
  filters.department = "";
  filters.branch = "";
  search.value = "";
  page.value = 1;
  fetchCardManagementData();
};

// Sorting handlers
const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newSortDirection) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newSortDirection }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  page.value = 1;
  fetchCardManagementData();
};

// Enhanced pagination handlers
const handlePageChange = (newPage) => {
  console.log("Page changed to:", newPage);
  if (newPage !== page.value && !loading.value) {
    page.value = newPage;
    fetchCardManagementData();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  console.log("Items per page changed to:", newItemsPerPage);
  if (newItemsPerPage !== itemsPerPage.value) {
    itemsPerPage.value = newItemsPerPage;
    page.value = 1; // Reset to first page when items per page changes
    fetchCardManagementData();
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchCardManagementData();
});

// Watch for changes in search
watch(search, () => {
  debouncedSearch();
});

// Watch for data changes and adjust pagination if needed
watch([cardManagementData, totalItems], () => {
  // If no data but totalItems > 0, try going to page 1
  if (
    cardManagementData.value.length === 0 &&
    totalItems.value > 0 &&
    page.value > 1
  ) {
    console.log("No data on current page, resetting to page 1");
    page.value = 1;
    fetchCardManagementData();
  }
});
</script>

<style scoped>
.card-management-container {
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
  position: relative;
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

/* Make table rows clickable */
:deep(.data-table-row) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.data-table-row:hover) {
  background-color: #f8fafc;
}

/* Responsive */
@media (max-width: 768px) {
  .card-management-container {
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

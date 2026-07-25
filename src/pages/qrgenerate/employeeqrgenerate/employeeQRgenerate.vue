<template>
  <div class="qr-management-container">
    <!-- Filter Panel -->
    <div
      v-if="showFilters"
      class="filter-panel"
    >
      <div class="filter-content">
        <FilterComponent
          :tenant-id="tenantId"
          :initial-filters="initialFilters"
          :initially-visible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <div
      class="main-content"
      :class="{ 'full-width': !showFilters }"
    >
      <DataTableWrapper
        v-model:search-query="search"
        :show-search="true"
        :search-placeholder="'Search QR Details'"
        :is-empty="filteredQRManagementData.length === 0 && !search"
        :has-error="error"
        @update:search-query="debouncedSearch"
      >
        <!-- Filter Toggle Button -->
        <template #before-search>
          <button
            class="filter-toggle-static"
            :class="{ active: hasActiveFilters }"
            :title="showFilters ? 'Hide filters' : 'Show filters'"
            aria-label="Toggle filters"
            @click="toggleFilters"
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
            <div
              v-if="hasActiveFilters"
              class="filter-indicator"
            />
          </button>
        </template>

        <!-- Table content states -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="qrManagementData.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load QR details"
            :message="error"
            @retry="fetchQRManagementData"
          />
        </div>

        <div v-else-if="filteredQRManagementData.length === 0">
          <EmptyState
            title="No QR details found"
            message="Try adjusting your filters or search term"
            :primary-action="{ text: 'Clear Filters' }"
            @primary-action="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredQRManagementData"
            :columns="columns"
            :selected-items="selectedItems"
            :show-selection="false"
            :sort-by="sortBy[0]?.key || ''"
            :sort-direction="sortBy[0]?.order || 'asc'"
            :item-key="'id'"
            :row-clickable="true"
            @update:selected-items="selectedItems = $event"
            @update:sort-by="updateSortBy"
            @update:sort-direction="updateSortDirection"
            @row-click="handleRowClick"
            @sort="handleSort"
          >
            <!-- Employee Name Column -->
            <template #cell-employeeName="{ item }">
              <span>{{ item.employeeName || "N/A" }}</span>
            </template>

            <!-- QR Code Column -->
            <template #cell-qrcode="{ item }">
              <div
                class="qr-code-cell clickable"
                @click.stop="showQRPreview(item)"
              >
                <v-icon
                  color="primary"
                  size="20"
                  class="mr-1"
                >
                  mdi-qrcode
                </v-icon>
                <span class="qr-text">{{ truncateQRCode(item.qrcode) }}</span>
              </div>
            </template>

            <!-- Access Level Column -->
            <template #cell-accessLevelsId="{ item }">
              <span>{{ item.accessLevelsId || "N/A" }}</span>
            </template>

            <!-- QR Access Column -->
            <template #cell-qraccess="{ item }">
              <v-chip
                :color="item.qraccess ? 'success' : 'error'"
                size="small"
                label
              >
                {{ item.qraccess ? "Enable" : "Disable" }}
              </v-chip>
            </template>
          </DataTable>
        </div>

        <!-- Pagination Info -->
        <template #before-pagination>
          <div
            v-if="
              !loading && filteredQRManagementData.length > 0 && totalItems > 0
            "
            class="pagination-info"
          >
            Showing {{ (page - 1) * itemsPerPage + 1 }} to
            {{ Math.min(page * itemsPerPage, totalItems) }} of
            {{ totalItems }} entries
          </div>
        </template>

        <!-- Pagination Slot -->
        <template #pagination>
          <CustomPagination
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            :total-items="totalItems"
            :loading="loading"
            :items-per-page-options="[10, 25, 50, 100]"
            @update:page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>
  </div>
  <!-- Digital ID Card Modal (Holographic Rectangle) -->
  <div
    v-if="showQRPreviewDialog && selectedQR"
    class="fixed inset-0 z-[200] flex items-center justify-center p-4"
  >
    <!-- Dark backdrop -->
    <div
      class="absolute inset-0 bg-slate-950/90 backdrop-blur-md print:hidden"
      @click="showQRPreviewDialog = false"
    />
    
    <div class="relative flex flex-col items-center animate-in zoom-in-95 duration-300 w-full max-w-3xl">
      <!-- Print Header -->
      <div class="hidden print:block text-center mb-6 w-full">
        <h1 class="text-2xl font-black text-black">
          EMPLOYEE PASS
        </h1>
      </div>

      <!-- Animated glowing orb behind the card -->
      <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse print:hidden -z-10" />
      
      <!-- Glassmorphic Container -->
      <div class="relative bg-slate-900/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden p-6 sm:p-10 w-full print:bg-white dark:bg-slate-900 print:border-black print:shadow-none print:rounded-none">
        <!-- Top Section: Avatar + Name -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
          <!-- Avatar -->
          <div class="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shrink-0 print:bg-black">
            <div class="w-full h-full rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 print:border-white">
              <div class="w-full h-full flex items-center justify-center font-black text-4xl text-white bg-slate-800 print:text-black print:bg-white dark:bg-slate-900">
                {{ selectedQR.employeeName?.charAt(0).toUpperCase() || '?' }}
              </div>
            </div>
          </div>
          
          <!-- Name and Basic Info -->
          <div class="flex-1 mt-2 sm:mt-0">
            <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase print:text-black">
              {{ selectedQR.employeeName || 'N/A' }}
            </h2>
            <p class="text-lg font-bold text-slate-300 mt-1 uppercase tracking-widest print:text-slate-600 dark:text-slate-300">
              EMPLOYEE ID
            </p>
            <p class="text-sm text-cyan-400 mt-1 font-semibold uppercase tracking-widest print:text-slate-500 dark:text-slate-400">
              {{ selectedQR.employeeId || 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Middle Divider Info Row -->
        <div class="w-full text-[10px] sm:text-xs font-semibold text-slate-300 flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-2 uppercase tracking-widest border-y border-white/10 py-4 mb-8 print:border-slate-300 print:text-slate-600 dark:text-slate-300">
          <span>Employee ID: <strong class="text-white print:text-black">#{{ (selectedQR.employeeId || '000').toString().slice(0, 8) }}</strong></span>
          <span class="text-white/20 print:hidden">|</span>
          <span>Access: <strong class="text-white print:text-black">{{ selectedQR.accessLevelsId || 'General' }}</strong></span>
          <span class="text-white/20 print:hidden">|</span>
          <span>Status: <strong class="text-white print:text-black">{{ selectedQR.qraccess ? 'Enabled' : 'Disabled' }}</strong></span>
        </div>

        <!-- Bottom Section: QR Code & Status -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <!-- QR Code with glowing brackets -->
          <div class="relative p-1 shrink-0">
            <!-- Glowing corners (simulating high tech) -->
            <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 print:hidden" />
            <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 print:hidden" />
            <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500 print:hidden" />
            <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 print:hidden" />
             
            <div
              class="m-2 p-3 bg-white dark:bg-slate-900/95 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] print:shadow-none print:border print:border-black flex justify-center items-center"
              style="width: 144px; height: 144px;"
            >
              <canvas
                ref="qrCanvas"
                class="qr-canvas"
                style="width: 100% !important; height: 100% !important;"
              />
            </div>
          </div>

          <!-- Logo & Status -->
          <div class="flex flex-col items-center sm:items-end text-center sm:text-right">
            <div class="flex items-center gap-3 mb-4">
              <!-- Simple AccessEasy logo placeholder -->
              <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-black text-indigo-600 text-xl print:border print:border-black">
                A
              </div>
              <div class="text-left">
                <div class="text-lg font-black text-white leading-none print:text-black">
                  AccessEasy
                </div>
                <div class="text-[10px] text-slate-400 tracking-widest uppercase print:text-slate-500 dark:text-slate-400">
                  Employee Management
                </div>
              </div>
            </div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500 dark:text-slate-400">
              STATUS: 
              <span
                class="text-base ml-2"
                :class="selectedQR.qraccess ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] print:text-black' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] print:text-black'"
              >
                {{ selectedQR.qraccess ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- External Actions -->
      <div class="mt-6 flex justify-end gap-4 w-full print:hidden relative z-10">
        <button
          class="px-6 py-2.5 rounded-xl border border-white/20 font-bold text-xs uppercase tracking-widest text-slate-300 hover:bg-white dark:bg-slate-900/10 hover:text-white transition-all bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-sm"
          @click="downloadSingleQR(selectedQR)"
        >
          Download QR
        </button>
        <button
          class="px-6 py-2.5 rounded-xl border border-white/20 font-bold text-xs uppercase tracking-widest text-slate-300 hover:bg-white dark:bg-slate-900/10 hover:text-white transition-all bg-slate-900/50 backdrop-blur-sm"
          @click="showQRPreviewDialog = false"
        >
          Close
        </button>
      </div>
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
import QRCode from "qrcode";
import { saveAs } from "file-saver";
import { nextTick } from "vue";
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
const showQRPreviewDialog = ref(false);
const selectedQR = ref(null);
const qrCanvas = ref(null);

// Define columns for DataTable
const columns = computed(() => [
  {
    key: "employeeName",
    label: "Employee Name",
    sortable: false,
    width: "150px",
  },
  {
    key: "qrcode",
    label: "QR Code",
    sortable: true,
    width: "250px",
  },
  {
    key: "accessLevelsId",
    label: "Access Level",
    sortable: true,
    width: "120px",
  },
  {
    key: "qraccess",
    label: "QR Access",
    sortable: true,
    width: "120px",
  },
]);

// Filters
const filters = reactive({
  qraccess: "all",
  organization: "",
  department: "",
  branch: "",
});

// Filter schema for FilterComponent
const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

const initialFilters = computed(() => ({
  qraccess: filters.qraccess,
  organization: filters.organization,
  department: filters.department,
  branch: filters.branch,
}));

// Computed Properties
const hasActiveFilters = computed(() => {
  return (
    filters.qraccess !== "all" ||
    filters.organization ||
    filters.branch ||
    filters.department ||
    search.value !== ""
  );
});

// Data
const qrManagementData = ref([]);

const truncateQRCode = (code) => {
  if (!code) return "N/A";
  return code.length > 20 ? `${code.substring(0, 20)}...` : code;
};

const showQRPreview = async (item) => {
  selectedQR.value = item;
  showQRPreviewDialog.value = true;

  await nextTick();

  if (qrCanvas.value && item.qrcode) {
    try {
      const qrPayload = JSON.stringify({
        type: "EMPLOYEE",
        token: item.qrcode,
        name: item.employeeName || "",
        empId: item.employeeId || ""
      });
      QRCode.toCanvas(qrCanvas.value, qrPayload, {
        width: 250,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
    } catch (err) {
      console.error("Failed to render QR preview:", err);
    }
  }
};

const downloadSingleQR = async (qr) => {
  if (!qr || !qr.qrcode) return;

  try {
    const qrPayload = JSON.stringify({
      type: "EMPLOYEE",
      token: qr.qrcode,
      name: qr.employeeName || "",
      empId: qr.employeeId || ""
    });
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrPayload, {
      width: 500,
      margin: 4,
    });

    canvas.toBlob((blob) => {
      saveAs(blob, `${qr.qrcode}.png`);
    }, "image/png");

    showSuccessMessage("QR Code downloaded successfully");
  } catch (err) {
    showErrorMessage("Failed to download QR code");
  }
};
// Row click handler
const handleRowClick = (item) => {
  console.log("Row clicked:", item);

  if (item && item.employeeId) {
    console.log("Navigating to employee:", item.employeeId);
    router.push(`/employee-details/employee/${item.employeeId}/accessmodule`);
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
      "filter[_and][0][_and][0][tenant][_eq]": tenantId,
      "filter[_and][0][_and][1][employeeId][id][_nnull]": true,
    };

    // Add search filters if search term exists
    if (search.value) {
      if (!isNaN(search.value)) {
        params["filter[_or][0][accessLevelsId][_eq]"] = search.value;
        params["filter[_or][1][employeeId][id][_eq]"] = search.value;
      } else {
        params["filter[_or][0][qrcode][_icontains]"] = search.value;
        params[
          "filter[_or][1][employeeId][assignedUser][first_name][_icontains]"
        ] = search.value;
      }
    }

    // QR Access filter (Enable/Disable)
    if (filters.qraccess !== "all") {
      params["filter[qraccess][_eq]"] = filters.qraccess;
    }

    // Remove pagination parameters for count
    delete params.page;
    delete params.limit;
    delete params.sort;

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate?${queryString}`,
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
    error.value = "Failed to load QR count";
    totalItems.value = 0;
  }
};

// Fetch Data with correct fields
// Fetch Data with correct fields
const fetchQRManagementData = async () => {
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

    // Build the exact query parameters as specified
    const params = {
      "fields[]": "accessLevelsId",
      "fields[]": "qraccess",
      "fields[]": "tenant",
      "fields[]": "qrcode",
      "fields[]": "employeeId.assignedUser.first_name",
      "fields[]": "employeeId.id",
      "fields[]": "id",
      "fields[]": "employeeId",
      "filter[_and][0][_and][0][tenant][_eq]": tenantId,
      "filter[_and][0][_and][1][employeeId][id][_nnull]": true,
      sort:
        sortBy.value.length > 0
          ? `${sortBy.value[0].key}${sortBy.value[0].order === "desc" ? "" : ""}`
          : "date_created",
      page: page.value,
      limit: itemsPerPage.value,
    };

    // Add search filters if search term exists
    if (search.value) {
      if (!isNaN(search.value)) {
        params["filter[_or][0][accessLevelsId][_eq]"] = search.value;
        params["filter[_or][1][employeeId][id][_eq]"] = search.value;
      } else {
        params["filter[_or][0][qrcode][_icontains]"] = search.value;
        params[
          "filter[_or][1][employeeId][assignedUser][first_name][_icontains]"
        ] = search.value;
      }
    }

    // QR Access filter (Enable/Disable)
    if (filters.qraccess !== "all") {
      params["filter[qraccess][_eq]"] = filters.qraccess;
    }

    console.log("Fetching data with params:", params);

    // Build query string manually to handle duplicate field names
    const queryString = Object.keys(params)
      .map((key) => {
        if (key.startsWith("fields[]")) {
          // Handle fields separately since they have the same key
          const fieldValues = [
            "accessLevelsId",
            "qraccess",
            "tenant",
            "qrcode",
            "employeeId.assignedUser.first_name",
            "employeeId.id",
            "id",
          ];
          return fieldValues.map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    // Fetch data
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate?${queryString}`,
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
    qrManagementData.value = data.data;
    console.log("Fetched QR generation data:", data.data);
  } catch (err) {
    console.error("Error fetching QR generation data:", err);
    error.value = err.message || "Failed to load QR data";

    // Reset data on error
    qrManagementData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {};
  params["filter[_and][0][_and][0][tenant][_eq]"] = tenantId;

  // Search filter
  if (search.value) {
    if (!isNaN(search.value)) {
      params["filter[_or][0][accessLevelsId][_eq]"] = search.value;
      params["filter[_or][1][employeeId][id][_eq]"] = search.value;
    } else {
      params["filter[_or][0][qrcode][_icontains]"] = search.value;
      params[
        "filter[_or][1][employeeId][assignedUser][first_name][_icontains]"
      ] = search.value;
    }
  }

  // QR Access filter (Enable/Disable)
  if (filters.qraccess !== "all") {
    params["filter[qraccess][_eq]"] = filters.qraccess;
  }

  return params;
};

// Computed - Transform the data for display
const filteredQRManagementData = computed(() => {
  return qrManagementData.value.map((item) => {
    // Handle the nested employee data structure
    const employeeName = item.employeeId?.assignedUser?.first_name || "N/A";
    const employeeId = item.employeeId?.id || "N/A";

    return {
      ...item,
      employeeName: employeeName,
      employeeId: employeeId,
    };
  });
});

// Filter Methods
const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchQRManagementData();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

// Debounced search function
const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchQRManagementData();
}, 300);

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  filters.qraccess = "all";
  filters.organization = "";
  filters.department = "";
  filters.branch = "";
  search.value = "";
  page.value = 1;
  fetchQRManagementData();
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
  fetchQRManagementData();
};

// Enhanced pagination handlers
const handlePageChange = (newPage) => {
  console.log("Page changed to:", newPage);
  if (newPage !== page.value && !loading.value) {
    page.value = newPage;
    fetchQRManagementData();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  console.log("Items per page changed to:", newItemsPerPage);
  if (newItemsPerPage !== itemsPerPage.value) {
    itemsPerPage.value = newItemsPerPage;
    page.value = 1; // Reset to first page when items per page changes
    fetchQRManagementData();
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchQRManagementData();
});

// Watch for changes in search
watch(search, () => {
  debouncedSearch();
});

// Watch for data changes and adjust pagination if needed
watch([qrManagementData, totalItems], () => {
  // If no data but totalItems > 0, try going to page 1
  if (
    qrManagementData.value.length === 0 &&
    totalItems.value > 0 &&
    page.value > 1
  ) {
    console.log("No data on current page, resetting to page 1");
    page.value = 1;
    fetchQRManagementData();
  }
});
</script>

<style scoped>
.qr-management-container {
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
  .qr-management-container {
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

<template>
  <div class="dealer-container">
    <!-- Summary Cards -->
    <div class="summary-cards">
      <v-card class="summary-card" elevation="1">
        <div class="card-content">
          <div class="card-icon blue">
            <v-icon>mdi-account-group</v-icon>
          </div>
          <div class="card-info">
            <div class="card-label">Total Dealers</div>
            <div class="card-value">{{ totalDealersCount }}</div>
          </div>
        </div>
      </v-card>

      <v-card class="summary-card" elevation="1">
        <div class="card-content">
          <div class="card-icon green">
            <v-icon>mdi-check-circle</v-icon>
          </div>
          <div class="card-info">
            <div class="card-label">Approved Dealers</div>
            <div class="card-value">{{ approvedDealersCount }}</div>
          </div>
        </div>
      </v-card>

      <v-card class="summary-card" elevation="1">
        <div class="card-content">
          <div class="card-icon orange">
            <v-icon>mdi-clock-outline</v-icon>
          </div>
          <div class="card-info">
            <div class="card-label">Pending Requests</div>
            <div class="card-value">{{ pendingDealersCount }}</div>
          </div>
        </div>
      </v-card>

      <v-card class="summary-card" elevation="1">
        <div class="card-content">
          <div class="card-icon red">
            <v-icon>mdi-close-circle</v-icon>
          </div>
          <div class="card-info">
            <div class="card-label">Rejected Dealers</div>
            <div class="card-value">{{ rejectedDealersCount }}</div>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Dealer Details Section -->
    <v-card class="dealer-details-card" elevation="1">
      <div class="card-header">
        <div class="header-left">
          <h2 class="header-title">Dealer Access Management</h2>
          <v-text-field
            v-model="search"
            label="Search dealers..."
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            hide-details
            class="search-field-inline"
          ></v-text-field>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-plus"
            class="me-2"
            @click="openRegistrationDialog"
          >
            Add Tenant
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-export"
            class="me-2"
          >
            Export
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-filter"
            class="me-2"
            @click="toggleFilters"
            :class="{ 'position-relative': hasActiveFilters }"
          >
            Filters
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="refreshData"
            :loading="loading"
          >
            Refresh
          </v-btn>
        </div>
      </div>

      <!-- Table Container -->
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :items-per-page="-1"
          class="dealer-table"
          hide-default-footer
        >
          <template v-slot:item.tenantInfo="{ item }">
            <div class="tenant-info">
              <v-icon class="tenant-icon" color="primary">mdi-domain</v-icon>
              <div>
                <div class="tenant-name">
                  {{
                    item.requestedBy?.assignedUser?.tenant?.tenantName || "N/A"
                  }}
                </div>
                <div class="tenant-id">
                  {{
                    item.requestedBy?.assignedUser?.tenant?.tenantId || "No ID"
                  }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:item.contactPerson="{ item }">
            <div>{{ item.requestedBy?.assignedUser?.first_name || "N/A" }}</div>
          </template>

          <template v-slot:item.status="{ item }">
            <div class="status-container">
              <v-chip
                size="small"
                :color="getStatusColor(item.dealerAccess)"
                :class="getStatusClass(item.dealerAccess)"
                label
              >
                {{ item.dealerAccess || "pending" }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.email="{ item }">
            {{ item.requestedBy?.assignedUser?.email || "N/A" }}
          </template>

          <template v-slot:item.phone="{ item }">
            {{ item.requestedBy?.assignedUser?.phone || "N/A" }}
          </template>

          <template v-slot:item.role="{ item }">
            <v-chip size="small" color="secondary" variant="tonal" label>
              {{ item.requestedBy?.assignedUser?.role?.name || "N/A" }}
            </v-chip>
          </template>

          <template v-slot:item.created="{ item }">
            {{ formatDate(item.date_created) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="actions-cell">
              <v-btn
                icon
                size="small"
                color="primary"
                variant="text"
                @click="viewDealerDetails(item)"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>

              <v-btn
                v-if="item.dealerAccess === 'requested' && isEsslAdmin"
                icon
                size="small"
                color="success"
                variant="text"
                @click="approveDealerRequest(item)"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>

              <v-btn
                v-if="item.dealerAccess === 'requested' && isEsslAdmin"
                icon
                size="small"
                color="error"
                variant="text"
                @click="rejectDealerRequest(item)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>

              <v-btn icon size="small" color="secondary" variant="text">
                <v-icon>mdi-cog</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Custom Pagination -->
      <div class="pagination-wrapper">
        <div class="d-flex justify-space-between align-center pa-4">
          <div class="text-body-2">
            Showing {{ Math.min((page - 1) * itemsPerPage + 1, totalItems) }} to
            {{ Math.min(page * itemsPerPage, totalItems) }} of
            {{ totalItems }} entries
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn
              icon
              size="small"
              :disabled="page <= 1"
              @click="handlePageChange(page - 1)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="text-body-2"
              >{{ page }} of {{ Math.ceil(totalItems / itemsPerPage) }}</span
            >
            <v-btn
              icon
              size="small"
              :disabled="page >= Math.ceil(totalItems / itemsPerPage)"
              @click="handlePageChange(page + 1)"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Right Filter Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Advanced Filters</h3>
            <v-btn icon @click="toggleFilters">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="filter-content">
          <v-select
            v-model="filters.status"
            :items="['requested', 'approved', 'rejected']"
            label="Status"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
          ></v-select>

          <v-select
            v-model="filters.role"
            :items="roleOptions"
            label="Role"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
          ></v-select>

          <v-select
            v-model="filters.tenant"
            :items="tenantOptions"
            label="Tenant"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
          ></v-select>

          <div class="filter-actions">
            <v-btn color="error" variant="text" @click="clearFilters">
              Clear
            </v-btn>
            <v-btn color="primary" @click="applyFilters" class="ms-2">
              Apply
            </v-btn>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notifications -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.type"
      :timeout="5000"
      location="top right"
    >
      {{ toast.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="hideToast"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, reactive, ref, watch } from "vue";

// Table Headers
const headers = ref([
  {
    title: "Tenant Info",
    key: "tenantInfo",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Contact Person",
    key: "contactPerson",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Status",
    key: "status",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Email",
    key: "email",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Phone",
    key: "phone",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Role",
    key: "role",
    align: "start",
    sortable: true,
    width: "120px",
  },
  {
    title: "Created",
    key: "created",
    align: "start",
    sortable: true,
    width: "120px",
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
    sortable: false,
    width: "150px",
  },
]);

// Filter Options
const roleOptions = ref([]);
const tenantOptions = ref([]);

// State
const showFilters = ref(false);
const search = ref("");
const selected = ref([]);
const selectedStatus = ref("all");

// API Integration with your authentication pattern
const items = ref([]);
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const loading = ref(false);

// Get user role from currentUserTenant
const userRole = ref(null);
const isEsslAdmin = computed(() => userRole.value === "esslAdmin");

// Separate count states
const totalDealersCount = ref(0);
const approvedDealersCount = ref(0);
const pendingDealersCount = ref(0);
const rejectedDealersCount = ref(0);

const filters = reactive({
  status: [],
  role: [],
  tenant: [],
});

// Dialog states
const showRegistrationDialog = ref(false);
const showDetailsDialog = ref(false);
const selectedDealer = ref(null);

// Toast notification
const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    filters.status.length > 0 ||
    filters.role.length > 0 ||
    filters.tenant.length > 0
  );
});

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "requested":
    default:
      return "warning";
  }
};

const getStatusClass = (status) => {
  return `status-${status || "pending"}`;
};

// Function to get current user role using the correct method
const fetchCurrentUserRole = async () => {
  try {
    // Use the correct method from currentUserTenant
    const userData = await currentUserTenant.fetchLoginUserDetails();
    if (userData) {
      userRole.value = userData.role?.name || null;
      console.log("Current user role:", userRole.value);
    } else {
      console.error("No user data found");
      showToast("Failed to retrieve user role", "error");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    showToast("Authentication error: Failed to retrieve user role", "error");
  }
};

// API calls using your existing authService.protectedApi pattern
const fetchTotalDealersCount = async () => {
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();

    console.log(token, "token");
    console.log(tenantId, "tenantId");

    const response = await authService.protectedApi.get("/items/dealers", {
      params: {
        "aggregate[count]": "id",
      },
    });

    totalDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching total dealers count:", error);
    showToast("Failed to fetch total dealers count", "error");
  }
};

const fetchApprovedDealersCount = async () => {
  try {
    const response = await authService.protectedApi.get("/items/dealers", {
      params: {
        "aggregate[count]": "id",
        "filter[dealerAccess][_eq]": "approved",
      },
    });

    approvedDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching approved dealers count:", error);
    showToast("Failed to fetch approved dealers count", "error");
  }
};

const fetchPendingDealersCount = async () => {
  try {
    const response = await authService.protectedApi.get("/items/dealers", {
      params: {
        "aggregate[count]": "id",
        "filter[dealerAccess][_eq]": "requested",
      },
    });

    pendingDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching pending dealers count:", error);
    showToast("Failed to fetch pending dealers count", "error");
  }
};

const fetchRejectedDealersCount = async () => {
  try {
    const response = await authService.protectedApi.get("/items/dealers", {
      params: {
        "aggregate[count]": "id",
        "filter[dealerAccess][_eq]": "rejected",
      },
    });

    rejectedDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching rejected dealers count:", error);
    showToast("Failed to fetch rejected dealers count", "error");
  }
};

const fetchAllCounts = async () => {
  await Promise.all([
    fetchTotalDealersCount(),
    fetchApprovedDealersCount(),
    fetchPendingDealersCount(),
    fetchRejectedDealersCount(),
  ]);
};

const fetchDealerAggregateCount = async () => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    console.log(token, "token");

    const params = {
      "aggregate[count]": "id",
      ...buildFilterParams(),
    };

    const response = await authService.protectedApi.get("/items/dealers", {
      params,
    });

    console.log("countResponse", response);
    totalItems.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    showToast("Failed to fetch data count", "error");
  }
};

const fetchDealerData = async () => {
  await fetchDealerAggregateCount();

  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    loading.value = true;

    const params = {
      fields: [
        "id",
        "dealerAccess",
        "requestedBy",
        "status",
        "date_updated",
        "date_created",
        "requestedBy.assignedUser.first_name",
        "requestedBy.assignedUser.tenant.tenantId",
        "requestedBy.assignedUser.tenant.tenantName",
        "requestedBy.assignedUser.phone",
        "requestedBy.assignedUser.role.id",
        "requestedBy.assignedUser.role.name",
        "requestedBy.assignedUser.email",
        "requestedBy.assignedUser.id",
      ],
      ...buildFilterParams(),
      sort: "date_created",
      page: page.value,
      limit: itemsPerPage.value,
    };

    const response = await authService.protectedApi.get("/items/dealers", {
      params,
    });

    items.value = response.data.data || [];
  } catch (error) {
    console.error("Error fetching dealer data:", error);
    showToast("Failed to load dealer data", "error");

    if (error.response?.status === 401) {
      authService.logout();
    }
  } finally {
    loading.value = false;
  }
};

const buildFilterParams = () => {
  const params = {};

  // Search filter
  if (search.value) {
    params[
      "filter[_or][0][requestedBy][assignedUser][first_name][_icontains]"
    ] = search.value;
    params["filter[_or][1][requestedBy][assignedUser][email][_icontains]"] =
      search.value;
    params[
      "filter[_or][2][requestedBy][assignedUser][tenant][tenantName][_icontains]"
    ] = search.value;
    params["filter[_or][3][requestedBy][assignedUser][phone][_icontains]"] =
      search.value;
    params["filter[_or][4][dealerAccess][_icontains]"] = search.value;
  }

  // Status filter
  if (selectedStatus.value !== "all") {
    params["filter[dealerAccess][_eq]"] = selectedStatus.value;
  }

  // Advanced filters
  if (filters.status.length) {
    params["filter[dealerAccess][_in]"] = filters.status.join(",");
  }
  if (filters.role.length) {
    params["filter[requestedBy][assignedUser][role][name][_in]"] =
      filters.role.join(",");
  }
  if (filters.tenant.length) {
    params["filter[requestedBy][assignedUser][tenant][tenantName][_in]"] =
      filters.tenant.join(",");
  }

  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchDealerData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchDealerData();
};

const handleFilterChange = () => {
  page.value = 1;
  fetchDealerData();
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  selectedStatus.value = "all";
  handleFilterChange();
};

const applyFilters = () => {
  showFilters.value = false;
  handleFilterChange();
};

const refreshData = async () => {
  loading.value = true;
  await Promise.all([fetchDealerData(), fetchAllCounts()]);
  showToast("Data refreshed successfully", "success");
};

const openRegistrationDialog = () => {
  showRegistrationDialog.value = true;
};

const approveDealerRequest = async (dealer) => {
  try {
    if (!isEsslAdmin.value) {
      showToast(
        "You don't have permission to approve dealer requests",
        "error",
      );
      return;
    }

    await authService.protectedApi.patch(`/items/dealers/${dealer.id}`, {
      dealerAccess: "approved",
      status: "approved",
    });

    // Update local data
    const index = items.value.findIndex((d) => d.id === dealer.id);
    if (index !== -1) {
      items.value[index].dealerAccess = "approved";
      items.value[index].status = "approved";
    }

    // Refresh counts
    await fetchAllCounts();
    showToast("Dealer request approved successfully", "success");
  } catch (error) {
    console.error("Error approving dealer request:", error);
    showToast("Failed to approve dealer request", "error");

    if (error.response?.status === 401) {
      authService.logout();
    }
  }
};

const rejectDealerRequest = async (dealer) => {
  try {
    if (!isEsslAdmin.value) {
      showToast("You don't have permission to reject dealer requests", "error");
      return;
    }

    await authService.protectedApi.patch(`/items/dealers/${dealer.id}`, {
      dealerAccess: "rejected",
      status: "rejected",
    });

    // Update local data
    const index = items.value.findIndex((d) => d.id === dealer.id);
    if (index !== -1) {
      items.value[index].dealerAccess = "rejected";
      items.value[index].status = "rejected";
    }

    // Refresh counts
    await fetchAllCounts();
    showToast("Dealer request rejected", "info");
  } catch (error) {
    console.error("Error rejecting dealer request:", error);
    showToast("Failed to reject dealer request", "error");

    if (error.response?.status === 401) {
      authService.logout();
    }
  }
};

const viewDealerDetails = (dealer) => {
  selectedDealer.value = dealer;
  showDetailsDialog.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const showToast = (message, type = "success") => {
  toast.show = true;
  toast.message = message;
  toast.type = type;
};

const hideToast = () => {
  toast.show = false;
};

const fetchFilterOptions = async () => {
  try {
    // Fetch roles
    const roleResponse = await authService.protectedApi.get("/roles", {
      params: {
        "filter[_and][0][name][_neq]": "Administrator",
        "filter[_and][1][name][_neq]": "esslAdmin",
        "filter[_and][2][name][_neq]": "Dealer",
      },
    });
    roleOptions.value = roleResponse.data.data.map((r) => r.name);

    // Fetch tenants
    const tenantResponse = await authService.protectedApi.get("/items/tenant");
    tenantOptions.value = tenantResponse.data.data.map((t) => t.tenantName);
  } catch (error) {
    console.error("Error fetching filter options:", error);
    showToast("Failed to load filter options", "error");
  }
};

// Watch for changes
watch(
  [search, selectedStatus],
  () => {
    page.value = 1;
    fetchDealerData();
  },
  { deep: true },
);

// Initialize component
onMounted(async () => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      showToast("Please login to access this page", "error");
      return;
    }

    // First fetch the user role
    await fetchCurrentUserRole();

    // Then fetch the rest of the data
    await Promise.all([
      fetchDealerData(),
      fetchAllCounts(),
      fetchFilterOptions(),
    ]);
  } catch (error) {
    console.error("Error initializing component:", error);
    showToast("Failed to initialize component", "error");
  }
});
</script>

<style scoped>
.dealer-container {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  border-radius: 8px;
  overflow: hidden;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.card-icon.blue {
  background-color: #e3f2fd;
  color: #1976d2;
}

.card-icon.green {
  background-color: #e8f5e9;
  color: #4caf50;
}

.card-icon.orange {
  background-color: #fff3e0;
  color: #ff9800;
}

.card-icon.red {
  background-color: #ffebee;
  color: #f44336;
}

.card-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

/* Dealer Details Card */
.dealer-details-card {
  border-radius: 8px;
  overflow: hidden;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.search-field-inline {
  max-width: 350px;
  min-width: 250px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Status Container */
.status-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* Table Wrapper with Fixed Height */
.table-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dealer-table {
  flex: 1;
  height: 100%;
}

:deep(.v-data-table) {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.v-table__wrapper) {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 400px);
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: #333 !important;
  background-color: #f5f5f5 !important;
  text-transform: none !important;
  position: sticky;
  top: 0;
  z-index: 1;
}

/* Tenant Info Cell */
.tenant-info {
  display: flex;
  align-items: center;
}

.tenant-icon {
  margin-right: 12px;
}

.tenant-name {
  font-weight: 500;
  color: #333;
}

.tenant-id {
  font-size: 12px;
  color: #666;
}

/* Actions Cell */
.actions-cell {
  display: flex;
  justify-content: center;
  gap: 4px;
}

/* Pagination Wrapper */
.pagination-wrapper {
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
  background: white;
}

/* Filter Panel */
.position-relative {
  position: relative;
}

.filter-indicator {
  position: absolute;
  top: 2px;
  right: 3px;
  width: 14px;
  height: 14px;
  background-color: #ff0000;
  border-radius: 50%;
  border: 2px solid white;
  pointer-events: none;
}

.filter-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e0e0e0;
  position: fixed;
  right: 0;
  top: 64px;
  height: calc(100vh - 64px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

.filter-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
}

.filter-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  bottom: 0;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .search-field-inline {
    max-width: 100%;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .dealer-container {
    padding: 8px;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .dealer-details-card {
    height: calc(100vh - 150px);
  }

  :deep(.v-table__wrapper) {
    height: calc(100vh - 350px);
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .search-field-inline {
    width: 100%;
    max-width: none;
  }
}
</style>

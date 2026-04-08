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
          <h2 class="header-title">Dealer Details</h2>
          <!-- Search moved to same line as header -->
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
            v-if="currentUserRole === 'Admin'"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-handshake"
            class="me-2"
            @click="requestDealerAccess"
          >
            Request Access
          </v-btn>
          <v-btn
            v-if="currentUserRole === 'Dealer'"
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
            prepend-icon="mdi-refresh"
            @click="refreshData"
            :loading="loading"
          >
            Refresh
          </v-btn>
        </div>
      </div>
      <!-- Table Container with Fixed Height -->
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
              <!-- Cancel button with status-like design -->
              <v-chip
                v-if="canCancelRequest(item)"
                size="small"
                color="warning"
                variant="outlined"
                label
                class="cancel-chip ms-2"
                @click="cancelDealerRequest(item)"
              >
                <v-icon start size="small">mdi-cancel</v-icon>
                Cancel
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

              <!-- Approve/Reject buttons for esslAdmin -->
              <v-btn
                v-if="
                  currentUserRole === 'esslAdmin' &&
                  item.dealerAccess === 'requested'
                "
                icon
                size="small"
                color="success"
                variant="text"
                @click="approveDealerRequest(item)"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>

              <v-btn
                v-if="
                  currentUserRole === 'esslAdmin' &&
                  item.dealerAccess === 'requested'
                "
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
        <CustomPagination
          v-model:page="page"
          v-model:itemsPerPage="itemsPerPage"
          :total-items="totalItems"
          :is-searching="!!search"
          @update:page="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </div>
    </v-card>

    <!-- Right Filter Panel (only for esslAdmin) -->
    <transition name="slide">
      <div
        v-if="showFilters && currentUserRole === 'esslAdmin'"
        class="filter-panel"
      >
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

    <!-- New Registration Dialog with Icons and Light Colors -->
    <v-dialog v-model="showRegistrationDialog" max-width="700px" persistent>
      <v-card class="registration-card">
        <v-card-title class="registration-header">
          <div class="header-content">
            <div class="header-icon">
              <v-icon size="32" color="primary"
                >mdi-office-building-plus</v-icon
              >
            </div>
            <div>
              <h2 class="header-title">Register New Tenant</h2>
              <p class="header-subtitle">
                Create a new tenant account with ease
              </p>
            </div>
          </div>
          <v-btn icon variant="text" @click="closeRegistrationDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="registration-content">
          <!-- Progress Indicator -->
          <div class="progress-container">
            <div class="progress-steps">
              <div
                v-for="step in 3"
                :key="step"
                :class="[
                  'progress-step',
                  {
                    active: currentStep === step,
                    completed: currentStep > step,
                  },
                ]"
              >
                <div class="step-circle">
                  <v-icon v-if="currentStep > step" size="16">mdi-check</v-icon>
                  <span v-else>{{ step }}</span>
                </div>
                <span class="step-label">
                  {{
                    step === 1 ? "Company" : step === 2 ? "Access" : "Employee"
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="step-content">
            <!-- Step 1: Company Details -->
            <div v-if="currentStep === 1" class="step-panel">
              <div class="step-header">
                <v-icon color="primary" class="me-3">mdi-domain</v-icon>
                <div>
                  <h3>Company Information</h3>
                  <p class="text-caption text-medium-emphasis">
                    Enter your company details
                  </p>
                </div>
              </div>

              <v-row class="mt-4">
                <v-col cols="12">
                  <v-text-field
                    v-model="registrationForm.companyName"
                    label="Company Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-office-building"
                    required
                    :rules="[(v) => !!v || 'Company name is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="registrationForm.gstNumber"
                    label="GST Number"
                    variant="outlined"
                    prepend-inner-icon="mdi-file-document"
                    maxlength="15"
                    required
                    :rules="[
                      (v) => !!v || 'GST number is required',
                      (v) =>
                        v.length === 15 || 'GST number must be 15 characters',
                    ]"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <!-- Step 2: Dealer Access -->
            <div v-if="currentStep === 2" class="step-panel">
              <div class="step-header">
                <v-icon color="primary" class="me-3">mdi-handshake</v-icon>
                <div>
                  <h3>Dealer Access</h3>
                  <p class="text-caption text-medium-emphasis">
                    Configure dealer permissions
                  </p>
                </div>
              </div>

              <div class="access-option">
                <v-card variant="outlined" class="access-card">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-checkbox
                        v-model="registrationForm.enableDealerAccess"
                        color="primary"
                        hide-details
                      ></v-checkbox>
                      <div class="ms-3">
                        <h4>Enable Dealer Access</h4>
                        <p class="text-caption text-medium-emphasis mb-0">
                          Allow this tenant to access dealer features and
                          functionalities
                        </p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <v-alert
                  v-if="registrationForm.enableDealerAccess"
                  type="info"
                  variant="tonal"
                  class="mt-4"
                  icon="mdi-information"
                >
                  Dealer access will be requested and requires approval from
                  administrators.
                </v-alert>
              </div>
            </div>

            <!-- Step 3: Employee Details -->
            <div v-if="currentStep === 3" class="step-panel">
              <div class="step-header">
                <v-icon color="primary" class="me-3">mdi-account-plus</v-icon>
                <div>
                  <h3>Employee Details</h3>
                  <p class="text-caption text-medium-emphasis">
                    Add the primary contact person
                  </p>
                </div>
              </div>

              <v-row class="mt-4">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="registrationForm.fullName"
                    label="Full Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    required
                    :rules="[(v) => !!v || 'Full name is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="registrationForm.email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    required
                    :rules="[
                      (v) => !!v || 'Email is required',
                      (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                    ]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="registrationForm.phone"
                    label="Phone Number"
                    type="tel"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    required
                    :rules="[(v) => !!v || 'Phone number is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="registrationForm.employeeId"
                    label="Employee ID"
                    variant="outlined"
                    prepend-inner-icon="mdi-badge-account"
                    required
                    :rules="[(v) => !!v || 'Employee ID is required']"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Error/Success Messages -->
          <v-alert
            v-if="registrationError"
            type="error"
            variant="tonal"
            class="mt-4"
            icon="mdi-alert-circle"
          >
            {{ registrationError }}
          </v-alert>

          <v-alert
            v-if="registrationSuccess"
            type="success"
            variant="tonal"
            class="mt-4"
            icon="mdi-check-circle"
          >
            {{ registrationSuccess }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="registration-actions">
          <v-btn
            v-if="currentStep > 1"
            variant="outlined"
            @click="prevStep"
            prepend-icon="mdi-arrow-left"
          >
            Back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeRegistrationDialog" color="error">
            Cancel
          </v-btn>
          <v-btn
            v-if="currentStep < 3"
            color="primary"
            @click="nextStep"
            :disabled="!isStepValid"
            append-icon="mdi-arrow-right"
          >
            Continue
          </v-btn>
          <v-btn
            v-else
            color="primary"
            @click="submitRegistration"
            :loading="registering"
            :disabled="!isStepValid"
            prepend-icon="mdi-check"
          >
            Create Tenant
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

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
]);

// Filter Options
const roleOptions = ref([]);
const tenantOptions = ref([]);

// State
const showFilters = ref(false);
const search = ref("");
const selected = ref([]);
const selectedStatus = ref("all");

// API Integration
const items = ref([]);
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const loading = ref(false);
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const userId = currentUserTenant.getUserId();
const currentUserRole = ref(currentUserTenant.getRole());

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

// Registration form
const currentStep = ref(1);
const registering = ref(false);
const registrationError = ref("");
const registrationSuccess = ref("");
const registrationForm = reactive({
  companyName: "",
  gstNumber: "",
  enableDealerAccess: false,
  fullName: "",
  email: "",
  phone: "",
  employeeId: "",
});

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

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return (
        registrationForm.companyName &&
        registrationForm.gstNumber &&
        registrationForm.gstNumber.length === 15
      );
    case 2:
      return true;
    case 3:
      return (
        registrationForm.fullName &&
        registrationForm.email &&
        registrationForm.phone &&
        registrationForm.employeeId
      );
    default:
      return false;
  }
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

const canCancelRequest = (item) => {
  // Allow cancel if user is Admin or Dealer and the request is pending and belongs to them
  if (item.dealerAccess !== "requested") return false;

  if (currentUserRole.value === "Admin" || currentUserRole.value === "Dealer") {
    return item.requestedBy?.assignedUser?.id === userId;
  }

  return false;
};

// Separate API calls for each count
const fetchTotalDealersCount = async () => {
  try {
    const params = {
      "aggregate[count]": "id",
    };

    // Add role-specific filters for total count
    if (
      currentUserRole.value === "Dealer" ||
      currentUserRole.value === "Admin"
    ) {
      params["filter[requestedBy][assignedUser][id][_eq]"] = userId;
    }
    // For esslAdmin, no filter - get all

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const response = await authService.protectedApi.get(
      `/items/dealers?${queryString}`,
    );
    totalDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching total dealers count:", error);
  }
};

const fetchApprovedDealersCount = async () => {
  try {
    const params = {
      "aggregate[count]": "id",
      "filter[dealerAccess][_eq]": "approved",
    };

    // Add role-specific filters
    if (
      currentUserRole.value === "Dealer" ||
      currentUserRole.value === "Admin"
    ) {
      params["filter[_and][0][requestedBy][assignedUser][id][_eq]"] = userId;
    }

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const response = await authService.protectedApi.get(
      `/items/dealers?${queryString}`,
    );
    approvedDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching approved dealers count:", error);
  }
};

const fetchPendingDealersCount = async () => {
  try {
    const params = {
      "aggregate[count]": "id",
      "filter[dealerAccess][_eq]": "requested",
    };

    // Add role-specific filters
    if (
      currentUserRole.value === "Dealer" ||
      currentUserRole.value === "Admin"
    ) {
      params["filter[_and][0][requestedBy][assignedUser][id][_eq]"] = userId;
    }

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const response = await authService.protectedApi.get(
      `/items/dealers?${queryString}`,
    );
    pendingDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching pending dealers count:", error);
  }
};

const fetchRejectedDealersCount = async () => {
  try {
    const params = {
      "aggregate[count]": "id",
      "filter[dealerAccess][_eq]": "rejected",
    };

    // Add role-specific filters
    if (
      currentUserRole.value === "Dealer" ||
      currentUserRole.value === "Admin"
    ) {
      params["filter[_and][0][requestedBy][assignedUser][id][_eq]"] = userId;
    }

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const response = await authService.protectedApi.get(
      `/items/dealers?${queryString}`,
    );
    rejectedDealersCount.value = response.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching rejected dealers count:", error);
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
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      ...buildFilterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await authService.protectedApi.get(
      `/items/dealers?${queryString}`,
    );

    totalItems.value = countResponse.data?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};

const fetchDealerData = async () => {
  await fetchDealerAggregateCount();

  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
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

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await authService.protectedApi.get(
      `/items/dealers?${queryString}`,
    );

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

  // Role-specific filters
  if (currentUserRole.value === "Dealer" || currentUserRole.value === "Admin") {
    params["filter[_and][0][_and][0][requestedBy][assignedUser][id][_eq]"] =
      userId;
  }
  // For esslAdmin, show all requests (no additional filter needed)

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

const cancelDealerRequest = async (dealer) => {
  try {
    const response = await authService.protectedApi.delete(
      `/items/dealers/${dealer.id}`,
    );

    if (response.status === 200 || response.status === 204) {
      // Remove from local data
      const index = items.value.findIndex((d) => d.id === dealer.id);
      if (index !== -1) {
        items.value.splice(index, 1);
      }

      // Refresh counts
      await fetchAllCounts();
      await fetchDealerAggregateCount();

      showToast("Dealer request cancelled successfully", "success");
    }
  } catch (error) {
    console.error("Error cancelling dealer request:", error);
    showToast("Failed to cancel dealer request", "error");

    if (error.response?.status === 401) {
      authService.logout();
    }
  }
};

const openRegistrationDialog = () => {
  showRegistrationDialog.value = true;
  currentStep.value = 1;
  resetRegistrationForm();
};

const closeRegistrationDialog = () => {
  showRegistrationDialog.value = false;
  resetRegistrationForm();
};

const resetRegistrationForm = () => {
  Object.assign(registrationForm, {
    companyName: "",
    gstNumber: "",
    enableDealerAccess: false,
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
  });
  registrationError.value = "";
  registrationSuccess.value = "";
};

const nextStep = () => {
  if (currentStep.value < 3 && isStepValid.value) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const submitRegistration = async () => {
  if (!isStepValid.value) return;

  registering.value = true;
  registrationError.value = "";

  try {
    // Create tenant
    const tenantResponse = await authService.protectedApi.post(
      "/items/tenant",
      {
        tenantName: registrationForm.companyName,
        panOrGst: registrationForm.gstNumber,
      },
    );

    const tenantData = tenantResponse.data;
    const newTenantId = tenantData.data.tenantId;

    // Create personal module and user
    const personalModuleResponse = await authService.protectedApi.post(
      "/items/personalModule",
      {
        status: "active",
        accessOn: true,
        employeeId: registrationForm.employeeId,
        uniqueId: `${newTenantId}-${registrationForm.employeeId}`,
        assignedUser: {
          first_name: registrationForm.fullName,
          email: registrationForm.email,
          phone: registrationForm.phone,
          role:
            currentUserRole.value === "esslAdmin"
              ? registrationForm.enableDealerAccess
                ? "e6ba0483-3304-4240-b486-8a1dc845b67f"
                : "ea2303aa-1662-43ca-a7f7-ab84924a7e0a"
              : "ea2303aa-1662-43ca-a7f7-ab84924a7e0a",
          tenant: newTenantId,
          appAccess: true,
        },
      },
    );

    const personalData = personalModuleResponse.data;
    const personalModuleId = personalData.data.id;

    // Create dealer request if needed
    if (
      registrationForm.enableDealerAccess &&
      currentUserRole.value !== "esslAdmin"
    ) {
      await authService.protectedApi.post("/items/dealers", {
        dealerAccess: "requested",
        requestedBy: personalModuleId,
      });
    }

    registrationSuccess.value = "Tenant registered successfully!";
    await Promise.all([fetchDealerData(), fetchAllCounts()]);

    setTimeout(() => {
      closeRegistrationDialog();
    }, 2000);
  } catch (error) {
    console.error("Registration error:", error);
    registrationError.value = `Registration failed: ${error.message}`;

    if (error.response?.status === 401) {
      authService.logout();
    }
  } finally {
    registering.value = false;
  }
};

const requestDealerAccess = async () => {
  try {
    // First, get the employee ID from personal module using current user ID
    const personalModuleResponse = await authService.protectedApi.get(
      "/items/personalModule",
      {
        params: {
          filter: {
            _and: [{ assignedUser: { id: { _eq: userId } } }],
          },
          fields: "id",
        },
      },
    );

    const personalData = personalModuleResponse.data;
    const employeeId = personalData.data[0]?.id;

    if (!employeeId) {
      throw new Error("Employee record not found");
    }

    // Create dealer request
    await authService.protectedApi.post("/items/dealers", {
      dealerAccess: "requested",
      requestedBy: employeeId,
    });

    await Promise.all([fetchDealerData(), fetchAllCounts()]);
    showToast("Dealer access request submitted successfully", "success");
  } catch (error) {
    console.error("Error requesting dealer access:", error);
    showToast("Failed to submit dealer request", "error");

    if (error.response?.status === 401) {
      authService.logout();
    }
  }
};

const approveDealerRequest = async (dealer) => {
  try {
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

const closeDetailsDialog = () => {
  showDetailsDialog.value = false;
  selectedDealer.value = null;
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
    const roleResponse = await authService.protectedApi.get(
      "/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer",
    );
    roleOptions.value = roleResponse.data.data.map((r) => r.name);

    // Fetch tenants
    const tenantResponse = await authService.protectedApi.get(
      `/items/tenant?filter[tenantId][_neq]=${tenantId}`,
    );
    tenantOptions.value = tenantResponse.data.data.map((t) => t.tenantName);
  } catch (error) {
    console.error("Error fetching filter options:", error);
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

    // Fetch current user details if not already loaded
    if (!currentUserTenant.getTenantId() || !currentUserTenant.getUserId()) {
      await currentUserTenant.fetchLoginUserDetails();
    }

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

/* New header layout with search inline */
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

/* Status Container with Cancel Button */
.status-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.cancel-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Registration Dialog Styles */
.registration-card {
  border-radius: 16px;
  overflow: hidden;
}

.registration-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  padding: 24px;
  border-bottom: 1px solid #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #1565c0;
  margin: 0;
}

.header-subtitle {
  font-size: 14px;
  color: #64b5f6;
  margin: 4px 0 0 0;
}

.registration-content {
  padding: 32px;
  background: #fafbff;
}

.progress-container {
  margin-bottom: 32px;
}

.progress-steps {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 24px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #e0e0e0;
  color: #757575;
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-circle {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
}

.step-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
}

.progress-step.active .step-label {
  color: #1976d2;
  font-weight: 600;
}

.progress-step.completed .step-label {
  color: #4caf50;
  font-weight: 600;
}

.step-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.step-panel {
  min-height: 300px;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.step-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.step-header p {
  margin: 4px 0 0 0;
  color: #666;
}

.access-option {
  margin-top: 16px;
}

.access-card {
  border: 2px solid #e3f2fd;
  transition: all 0.3s ease;
}

.access-card:hover {
  border-color: #bbdefb;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.1);
}

.registration-actions {
  padding: 24px 32px;
  background: white;
  border-top: 1px solid #f0f0f0;
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

  .progress-steps {
    gap: 24px;
  }

  .registration-content {
    padding: 16px;
  }

  .registration-actions {
    padding: 16px;
  }

  .status-container {
    flex-direction: column;
    align-items: flex-start;
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

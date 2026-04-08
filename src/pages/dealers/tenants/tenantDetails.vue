<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-grey-darken-3">
          Tenant Management
        </h2>
        <p class="text-body-1 text-grey-600 mt-2">
          Manage tenant information and settings
        </p>
      </v-col>
    </v-row>

    <!-- Action Bar -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search tenants..."
          variant="outlined"
          density="compact"
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Filter by Status"
          variant="outlined"
          density="compact"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort by"
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
          block
        >
          Add Tenant
        </v-btn>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-blue-lighten-4 mr-4">
              <v-icon color="blue-darken-2" size="24">mdi-domain</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Total Tenants</p>
              <p class="text-h4 font-weight-bold text-grey-darken-3">
                {{ totalTenants }}
              </p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-green-lighten-4 mr-4">
              <v-icon color="green-darken-2" size="24">mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Active Tenants</p>
              <p class="text-h4 font-weight-bold text-green-darken-2">
                {{ activeTenants }}
              </p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-orange-lighten-4 mr-4">
              <v-icon color="orange-darken-2" size="24"
                >mdi-account-group</v-icon
              >
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Total Employees</p>
              <p class="text-h4 font-weight-bold text-orange-darken-2">
                {{ totalEmployees }}
              </p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-purple-lighten-4 mr-4">
              <v-icon color="purple-darken-2" size="24">mdi-devices</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Active Devices</p>
              <p class="text-h4 font-weight-bold text-purple-darken-2">
                {{ totalDevices }}
              </p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tenants Table -->
    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Tenant Details</span>
        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            size="small"
            @click="exportData"
          >
            Export
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-refresh"
            size="small"
            @click="refreshData"
          >
            Refresh
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="filteredTenants"
          :search="searchQuery"
          item-key="id"
          class="elevation-0"
          :loading="loading"
          :items-per-page="10"
        >
          <template v-slot:item.tenantInfo="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="40" class="mr-3 bg-primary-lighten-4">
                <v-icon color="primary">mdi-domain</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.tenantName }}</div>
                <div class="text-caption text-grey-600">
                  {{ item.tenantId }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              <v-icon start size="small">{{
                getStatusIcon(item.status)
              }}</v-icon>
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.employeeCount="{ item }">
            <div class="text-center">
              <div class="font-weight-medium">{{ item.employeeCount }}</div>
              <v-progress-linear
                :model-value="(item.employeeCount / 200) * 100"
                color="primary"
                height="4"
                class="mt-1"
              ></v-progress-linear>
            </div>
          </template>

          <template v-slot:item.devices="{ item }">
            <v-chip color="primary" size="small" variant="outlined">
              {{ item.devices }} Active
            </v-chip>
          </template>

          <template v-slot:item.subscription="{ item }">
            <v-chip
              :color="getSubscriptionColor(item.subscription.plan)"
              size="small"
              variant="flat"
            >
              {{ item.subscription.plan }}
            </v-chip>
            <div class="text-caption text-grey-600 mt-1">
              Expires: {{ formatDate(item.subscription.expiryDate) }}
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-1">
              <v-btn
                size="small"
                color="primary"
                variant="text"
                icon="mdi-eye"
                @click="viewTenant(item)"
              ></v-btn>
              <v-btn
                size="small"
                color="warning"
                variant="text"
                icon="mdi-pencil"
                @click="editTenant(item)"
              ></v-btn>
              <v-btn
                size="small"
                color="success"
                variant="text"
                icon="mdi-cog"
                @click="configureTenant(item)"
              ></v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    size="small"
                    color="grey"
                    variant="text"
                    icon="mdi-dots-vertical"
                    v-bind="props"
                  ></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="toggleStatus(item)">
                    <v-list-item-title>
                      {{ item.status === "active" ? "Deactivate" : "Activate" }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteTenant(item)" class="text-error">
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Tenant Dialog -->
    <v-dialog v-model="tenantDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ editingTenant ? "Edit Tenant" : "Add New Tenant" }}
        </v-card-title>
        <v-card-text>
          <v-form ref="tenantForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.tenantName"
                  label="Tenant Name"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Tenant name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.tenantId"
                  label="Tenant ID"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Tenant ID is required']"
                  :disabled="editingTenant"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.contactPerson"
                  label="Contact Person"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Contact person is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="[
                    (v) => !!v || 'Email is required',
                    (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                  ]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.phone"
                  label="Phone Number"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Phone number is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="tenantForm.subscriptionPlan"
                  :items="subscriptionPlans"
                  label="Subscription Plan"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Subscription plan is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.employeeLimit"
                  label="Employee Limit"
                  type="number"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Employee limit is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="tenantForm.deviceLimit"
                  label="Device Limit"
                  type="number"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Device limit is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="tenantForm.address"
                  label="Address"
                  variant="outlined"
                  rows="3"
                  :rules="[(v) => !!v || 'Address is required']"
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="tenantForm.notes"
                  label="Additional Notes"
                  variant="outlined"
                  rows="2"
                  placeholder="Any additional information..."
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeTenantDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="submitTenant"
            :loading="submitting"
            :disabled="!formValid"
          >
            {{ editingTenant ? "Update" : "Create" }} Tenant
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Tenant Dialog -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card v-if="selectedTenant">
        <v-card-title class="text-h6 font-weight-bold">
          Tenant Details - {{ selectedTenant.tenantName }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Tenant ID</div>
                <div class="font-weight-medium">
                  {{ selectedTenant.tenantId }}
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Status</div>
                <v-chip
                  :color="getStatusColor(selectedTenant.status)"
                  size="small"
                  variant="flat"
                >
                  {{ selectedTenant.status }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Contact Person</div>
                <div class="font-weight-medium">
                  {{ selectedTenant.contactPerson }}
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Email</div>
                <div class="font-weight-medium">{{ selectedTenant.email }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Phone</div>
                <div class="font-weight-medium">{{ selectedTenant.phone }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Subscription Plan</div>
                <v-chip
                  :color="
                    getSubscriptionColor(selectedTenant.subscription.plan)
                  "
                  size="small"
                  variant="flat"
                >
                  {{ selectedTenant.subscription.plan }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Employee Count</div>
                <div class="font-weight-medium">
                  {{ selectedTenant.employeeCount }} /
                  {{ selectedTenant.employeeLimit }}
                </div>
                <v-progress-linear
                  :model-value="
                    (selectedTenant.employeeCount /
                      selectedTenant.employeeLimit) *
                    100
                  "
                  color="primary"
                  height="4"
                  class="mt-1"
                ></v-progress-linear>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Active Devices</div>
                <div class="font-weight-medium">
                  {{ selectedTenant.devices }} /
                  {{ selectedTenant.deviceLimit }}
                </div>
                <v-progress-linear
                  :model-value="
                    (selectedTenant.devices / selectedTenant.deviceLimit) * 100
                  "
                  color="success"
                  height="4"
                  class="mt-1"
                ></v-progress-linear>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Address</div>
                <div class="font-weight-medium">
                  {{ selectedTenant.address }}
                </div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Created Date</div>
                <div class="font-weight-medium">
                  {{ formatDate(selectedTenant.dateCreated) }}
                </div>
              </div>
            </v-col>
            <v-col cols="12" v-if="selectedTenant.notes">
              <div class="mb-4">
                <div class="text-caption text-grey-600">Notes</div>
                <div class="font-weight-medium">{{ selectedTenant.notes }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="viewDialog = false">
            Close
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="editTenant(selectedTenant)"
          >
            Edit Tenant
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";

export default {
  name: "TenantDetails",
  setup() {
    const loading = ref(false);
    const searchQuery = ref("");
    const statusFilter = ref("");
    const sortBy = ref("tenantName");
    const tenantDialog = ref(false);
    const viewDialog = ref(false);
    const selectedTenant = ref(null);
    const editingTenant = ref(false);
    const formValid = ref(false);
    const submitting = ref(false);
    const snackbar = ref({
      show: false,
      message: "",
      color: "success",
    });

    const tenantForm = ref({
      tenantName: "",
      tenantId: "",
      contactPerson: "",
      email: "",
      phone: "",
      subscriptionPlan: "",
      employeeLimit: "",
      deviceLimit: "",
      address: "",
      notes: "",
    });

    const headers = [
      { title: "Tenant Info", key: "tenantInfo", sortable: false },
      { title: "Contact Person", key: "contactPerson", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Employees", key: "employeeCount", sortable: true },
      { title: "Devices", key: "devices", sortable: true },
      { title: "Subscription", key: "subscription", sortable: false },
      { title: "Created", key: "dateCreated", sortable: true },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const tenants = ref([
      {
        id: 1,
        tenantId: "TNT001",
        tenantName: "TechCorp Solutions",
        contactPerson: "Rahul Sharma",
        email: "rahul@techcorp.com",
        phone: "+919876543210",
        status: "active",
        employeeCount: 150,
        employeeLimit: 200,
        devices: 5,
        deviceLimit: 10,
        subscription: {
          plan: "Premium",
          expiryDate: "2024-12-31",
        },
        address: "123 Tech Street, Mumbai, Maharashtra 400001",
        dateCreated: "2024-01-15",
        notes: "Premium client with advanced features",
      },
      {
        id: 2,
        tenantId: "TNT002",
        tenantName: "InnovateTech",
        contactPerson: "Priya Patel",
        email: "priya@innovatetech.com",
        phone: "+919876543211",
        status: "active",
        employeeCount: 85,
        employeeLimit: 100,
        devices: 3,
        deviceLimit: 5,
        subscription: {
          plan: "Standard",
          expiryDate: "2024-10-15",
        },
        address: "456 Innovation Hub, Bangalore, Karnataka 560001",
        dateCreated: "2024-02-10",
        notes: "Growing startup with potential for upgrade",
      },
      {
        id: 3,
        tenantId: "TNT003",
        tenantName: "Digital Dynamics",
        contactPerson: "Amit Kumar",
        email: "amit@digitaldynamics.com",
        phone: "+919876543212",
        status: "inactive",
        employeeCount: 25,
        employeeLimit: 50,
        devices: 1,
        deviceLimit: 3,
        subscription: {
          plan: "Basic",
          expiryDate: "2024-08-20",
        },
        address: "789 Digital Plaza, Delhi, Delhi 110001",
        dateCreated: "2024-03-05",
        notes: "Subscription expired, pending renewal",
      },
    ]);

    const statusOptions = [
      { title: "Active", value: "active" },
      { title: "Inactive", value: "inactive" },
      { title: "Suspended", value: "suspended" },
    ];

    const sortOptions = [
      { title: "Tenant Name", value: "tenantName" },
      { title: "Date Created", value: "dateCreated" },
      { title: "Employee Count", value: "employeeCount" },
      { title: "Status", value: "status" },
    ];

    const subscriptionPlans = ["Basic", "Standard", "Premium", "Enterprise"];

    const filteredTenants = computed(() => {
      let filtered = tenants.value;

      if (statusFilter.value) {
        filtered = filtered.filter((t) => t.status === statusFilter.value);
      }

      // Sort by selected option
      filtered.sort((a, b) => {
        const aValue = a[sortBy.value];
        const bValue = b[sortBy.value];

        if (typeof aValue === "string") {
          return aValue.localeCompare(bValue);
        }
        return aValue - bValue;
      });

      return filtered;
    });

    const totalTenants = computed(() => tenants.value.length);
    const activeTenants = computed(
      () => tenants.value.filter((t) => t.status === "active").length,
    );
    const totalEmployees = computed(() =>
      tenants.value.reduce((sum, t) => sum + t.employeeCount, 0),
    );
    const totalDevices = computed(() =>
      tenants.value.reduce((sum, t) => sum + t.devices, 0),
    );

    const getStatusColor = (status) => {
      switch (status) {
        case "active":
          return "success";
        case "inactive":
          return "error";
        case "suspended":
          return "warning";
        default:
          return "grey";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "active":
          return "mdi-check-circle";
        case "inactive":
          return "mdi-close-circle";
        case "suspended":
          return "mdi-pause-circle";
        default:
          return "mdi-help-circle";
      }
    };

    const getSubscriptionColor = (plan) => {
      switch (plan) {
        case "Enterprise":
          return "purple";
        case "Premium":
          return "primary";
        case "Standard":
          return "success";
        case "Basic":
          return "warning";
        default:
          return "grey";
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const openAddDialog = () => {
      editingTenant.value = false;
      resetForm();
      tenantDialog.value = true;
    };

    const editTenant = (tenant) => {
      editingTenant.value = true;
      selectedTenant.value = tenant;
      tenantForm.value = {
        tenantName: tenant.tenantName,
        tenantId: tenant.tenantId,
        contactPerson: tenant.contactPerson,
        email: tenant.email,
        phone: tenant.phone,
        subscriptionPlan: tenant.subscription.plan,
        employeeLimit: tenant.employeeLimit.toString(),
        deviceLimit: tenant.deviceLimit.toString(),
        address: tenant.address,
        notes: tenant.notes,
      };
      tenantDialog.value = true;
      viewDialog.value = false;
    };

    const closeTenantDialog = () => {
      tenantDialog.value = false;
      resetForm();
    };

    const resetForm = () => {
      tenantForm.value = {
        tenantName: "",
        tenantId: "",
        contactPerson: "",
        email: "",
        phone: "",
        subscriptionPlan: "",
        employeeLimit: "",
        deviceLimit: "",
        address: "",
        notes: "",
      };
    };

    const submitTenant = async () => {
      submitting.value = true;
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (editingTenant.value) {
          // Update existing tenant
          const index = tenants.value.findIndex(
            (t) => t.id === selectedTenant.value.id,
          );
          if (index !== -1) {
            tenants.value[index] = {
              ...tenants.value[index],
              tenantName: tenantForm.value.tenantName,
              contactPerson: tenantForm.value.contactPerson,
              email: tenantForm.value.email,
              phone: tenantForm.value.phone,
              subscription: {
                ...tenants.value[index].subscription,
                plan: tenantForm.value.subscriptionPlan,
              },
              employeeLimit: parseInt(tenantForm.value.employeeLimit),
              deviceLimit: parseInt(tenantForm.value.deviceLimit),
              address: tenantForm.value.address,
              notes: tenantForm.value.notes,
            };
          }
          showSnackbar("Tenant updated successfully!", "success");
        } else {
          // Create new tenant
          const newTenant = {
            id: tenants.value.length + 1,
            tenantId: tenantForm.value.tenantId,
            tenantName: tenantForm.value.tenantName,
            contactPerson: tenantForm.value.contactPerson,
            email: tenantForm.value.email,
            phone: tenantForm.value.phone,
            status: "active",
            employeeCount: 0,
            employeeLimit: parseInt(tenantForm.value.employeeLimit),
            devices: 0,
            deviceLimit: parseInt(tenantForm.value.deviceLimit),
            subscription: {
              plan: tenantForm.value.subscriptionPlan,
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            },
            address: tenantForm.value.address,
            dateCreated: new Date().toISOString().split("T")[0],
            notes: tenantForm.value.notes,
          };
          tenants.value.push(newTenant);
          showSnackbar("Tenant created successfully!", "success");
        }

        closeTenantDialog();
      } catch (error) {
        showSnackbar("Failed to save tenant. Please try again.", "error");
      } finally {
        submitting.value = false;
      }
    };

    const viewTenant = (tenant) => {
      selectedTenant.value = tenant;
      viewDialog.value = true;
    };

    const configureTenant = (tenant) => {
      showSnackbar(`Opening configuration for ${tenant.tenantName}...`, "info");
      // Navigate to tenant configuration page
    };

    const toggleStatus = async (tenant) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newStatus = tenant.status === "active" ? "inactive" : "active";
        tenant.status = newStatus;

        showSnackbar(
          `Tenant ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
          "success",
        );
      } catch (error) {
        showSnackbar("Failed to update tenant status.", "error");
      }
    };

    const deleteTenant = async (tenant) => {
      if (
        confirm(
          `Are you sure you want to delete ${tenant.tenantName}? This action cannot be undone.`,
        )
      ) {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const index = tenants.value.findIndex((t) => t.id === tenant.id);
          if (index !== -1) {
            tenants.value.splice(index, 1);
          }
          showSnackbar("Tenant deleted successfully!", "success");
        } catch (error) {
          showSnackbar("Failed to delete tenant. Please try again.", "error");
        }
      }
    };

    const refreshData = async () => {
      loading.value = true;
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        showSnackbar("Data refreshed successfully!", "success");
      } catch (error) {
        showSnackbar("Failed to refresh data.", "error");
      } finally {
        loading.value = false;
      }
    };

    const exportData = () => {
      // Simulate export functionality
      showSnackbar(
        "Export started. You will receive an email when ready.",
        "info",
      );
    };

    const showSnackbar = (message, color) => {
      snackbar.value = {
        show: true,
        message,
        color,
      };
    };

    onMounted(() => {
      // Load initial data
    });

    return {
      loading,
      searchQuery,
      statusFilter,
      sortBy,
      tenantDialog,
      viewDialog,
      selectedTenant,
      editingTenant,
      formValid,
      submitting,
      snackbar,
      tenantForm,
      headers,
      tenants,
      statusOptions,
      sortOptions,
      subscriptionPlans,
      filteredTenants,
      totalTenants,
      activeTenants,
      totalEmployees,
      totalDevices,
      getStatusColor,
      getStatusIcon,
      getSubscriptionColor,
      formatDate,
      openAddDialog,
      editTenant,
      closeTenantDialog,
      submitTenant,
      viewTenant,
      configureTenant,
      toggleStatus,
      deleteTenant,
      refreshData,
      exportData,
    };
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-avatar {
  border-radius: 12px;
}
</style>

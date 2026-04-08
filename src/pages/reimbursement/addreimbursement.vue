<template>
  <div class="employee-container">
    <div class="main-content">
      <!-- Tab Navigation -->
      <div class="d-flex align-center py-2 px-4">
        <v-spacer></v-spacer>
        <BaseButton
          size="md"
          variant="primary"
          :leftIcon="Plus"
          @click="toggleAddDrawer"
          :text="'Add Expense'"
        />
      </div>

      <!-- DataTable Component -->
      <DataTable
        :items="items"
        :columns="columns"
        :show-selection="true"
        :selected-items="selected"
        :sort-by="sortBy"
        :sort-direction="sortDirection"
        :item-key="'id'"
        :row-clickable="true"
        :loading="loading"
        @update:selected-items="selected = $event"
        @update:sort-by="sortBy = $event"
        @update:sort-direction="sortDirection = $event"
        @row-click="handleRowClick"
        @sort="handleSort"
        class="data-table"
      >
        <!-- Custom Cell Content Slots -->
        <template v-slot:[`cell-date`]="{ item }">
          {{ formatDateOnly(item.date) }}
        </template>
        <template v-slot:[`cell-date_created`]="{ item }">
          {{ formatDateOnly(item.date_created) }}
        </template>
        <template v-slot:[`cell-totalReimbursement`]="{ item }">
          {{ currencySymbol
          }}{{ item.totalReimbursement?.toFixed(2) || "0.00" }}
        </template>
        <template v-slot:[`cell-subTotal`]="{ item }">
          {{ currencySymbol }}{{ item.subTotal?.toFixed(2) || "0.00" }}
        </template>
        <template v-slot:[`cell-ModeOfTransport.transportName`]="{ item }">
          <v-chip
            v-if="item.ModeOfTransport?.transportName"
            size="small"
            color="primary"
            variant="outlined"
          >
            <v-icon start size="small">mdi-car</v-icon>
            {{ item.ModeOfTransport.transportName }}
            <span v-if="item.ModeOfTransport.ratePerKm" class="ml-1">
              ({{ currencySymbol }}{{ item.ModeOfTransport.ratePerKm }}/km)
            </span>
          </v-chip>
          <span v-else class="text-muted">Not specified</span>
        </template>
        <template v-slot:[`cell-itemizedExpenses`]="{ item }">
          <div v-if="item.itemizedExpenses && item.itemizedExpenses.length > 0">
            <div
              v-for="(expense, index) in item.itemizedExpenses.slice(0, 2)"
              :key="index"
              class="expense-item"
            >
              <small
                >{{ expense.description }} - {{ currencySymbol
                }}{{ expense.cost }}</small
              >
            </div>
            <small v-if="item.itemizedExpenses.length > 2" class="text-muted">
              +{{ item.itemizedExpenses.length - 2 }} more items
            </small>
          </div>
          <span v-else class="text-muted">No expenses</span>
        </template>
        <template v-slot:[`cell-status`]="{ item }">
          <div class="status-cell">
            <span
              v-if="
                item.status !== 'submitted' ||
                item.reimbBy?.assignedUser?.id !== userId
              "
              :class="['status-chip', getStatusClass(item.status)]"
            >
              <v-icon size="14" class="me-1" :color="getIconColor(item.status)">
                {{ getStatusIcon(item.status) }}
              </v-icon>
              {{ formatStatus(item.status, item.reimbBy?.assignedUser?.id) }}
            </span>
          </div>
        </template>
      </DataTable>

      <CustomPagination
        v-model:page="page"
        v-model:itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
        class="pagination"
      />
    </div>

    <!-- Add Reimbursement Drawer -->
    <transition name="slide">
      <div v-if="showAddDrawer" class="add-drawer">
        <div class="drawer-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Add Expense</h3>
            <v-btn icon @click="toggleAddDrawer">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Tab Navigation for Reimbursement Type -->
        <div class="drawer-tabs">
          <button
            :class="{ active: activeTab === 'withTask' }"
            disabled
            @click="activeTab = 'withTask'"
          >
            With work order
          </button>
          <button
            :class="{ active: activeTab === 'withoutTask' }"
            @click="activeTab = 'withoutTask'"
          >
            Without work order
          </button>
        </div>
        <!--
        <div
          v-if="!hasFieldProFeature && activeTab === 'withTask'"
          class="premium-message"
        >
          <v-alert type="info" density="compact">
            Task-based reimbursements require a FieldPro plan. Please upgrade
            your plan.
          </v-alert>
        </div>
        -->

        <div class="drawer-content">
          <v-form @submit.prevent="handleAddReimbursement">
            <!--
            <v-select
              v-if="activeTab === 'withTask' && hasFieldProFeature"
              v-model="newReimbursement.selectedTaskId"
              :items="tasks"
              :item-title="(task) => `${task.title} (${task.status})`"
              item-value="id"
              label="Task Type"
              variant="outlined"
              density="compact"
              class="mb-4"
              required
              @update:modelValue="updateDistanceKm"
            ></v-select>
            -->

            <v-text-field
              v-model.number="newReimbursement.distanceKm"
              label="Distance Travelled (km)"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-4"
              :required="activeTab === 'withTask'"
            ></v-text-field>

            <v-select
              v-model="newReimbursement.transportId"
              :items="transportOptions"
              :item-title="
                (item) =>
                  `${item.transportName} ${item.ratePerKm ? '(' + currencySymbol + item.ratePerKm + '/km)' : ''}`
              "
              item-value="id"
              label="Transport Mode"
              variant="outlined"
              density="compact"
              class="mb-4"
              :loading="transportLoading"
            ></v-select>

            <v-text-field
              v-model.number="newReimbursement.subTotal"
              label="Sub Total"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-4"
              :prefix="currencySymbol"
              required
            ></v-text-field>

            <v-text-field
              v-model.number="newReimbursement.totalReimbursement"
              label="Total Reimbursement"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-4"
              :prefix="currencySymbol"
              required
            ></v-text-field>

            <v-textarea
              v-model="newReimbursement.notes"
              label="Notes"
              variant="outlined"
              density="compact"
              class="mb-4"
            ></v-textarea>

            <div class="mb-4">
              <p class="text-subtitle-2 mb-2">Expense Details</p>
              <v-text-field
                v-model.number="newReimbursement.taskExpense.travel_cost"
                label="Travel Cost"
                type="number"
                variant="outlined"
                density="compact"
                class="mb-2"
                :prefix="currencySymbol"
              ></v-text-field>
              <v-text-field
                v-model.number="newReimbursement.taskExpense.material_cost"
                label="Material Cost"
                type="number"
                variant="outlined"
                density="compact"
                class="mb-2"
                :prefix="currencySymbol"
              ></v-text-field>
              <v-text-field
                v-model.number="newReimbursement.taskExpense.food_allowance"
                label="Food Allowance"
                type="number"
                variant="outlined"
                density="compact"
                class="mb-2"
                :prefix="currencySymbol"
              ></v-text-field>
              <v-text-field
                v-model.number="newReimbursement.taskExpense.misc"
                label="Miscellaneous"
                type="number"
                variant="outlined"
                density="compact"
                class="mb-2"
                :prefix="currencySymbol"
              ></v-text-field>
              <v-textarea
                v-model="newReimbursement.taskExpense.remarks"
                label="Remarks"
                variant="outlined"
                density="compact"
                class="mb-2"
              ></v-textarea>
            </div>

            <div class="drawer-actions">
              <v-btn color="error" variant="text" @click="clearAddForm">
                Clear
              </v-btn>
              <BaseButton
                variant="primary"
                size="md"
                :loading="addLoading"
                :text="`Submit Expense`"
                @click="handleAddReimbursement"
              />
            </div>
          </v-form>
        </div>
      </div>
    </transition>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      top
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import { v4 as uuidv4 } from "uuid";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import { Plus } from "lucide-vue-next";

// Reactive data
const selected = ref([]);
const items = ref([]);
const expanded = ref([]);
const loading = ref(false);
const search = ref("");
const showAddDrawer = ref(false);
const addLoading = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = authService.getUserId();
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
// const tasks = ref([]);
const transportOptions = ref([]);
const transportLoading = ref(false);
const plan = currentUserTenant.getTenantPlan();
const accountSettings = currentUserTenant.getAccountSettings();
const activeTab = ref("withoutTask");
const sortBy = ref("");
const sortDirection = ref("asc");

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// New reimbursement form data
const newReimbursement = ref({
  // selectedTaskId: null,
  distanceKm: null,
  transportId: null,
  subTotal: null,
  totalReimbursement: null,
  notes: "",
  taskExpense: {
    travel_cost: null,
    material_cost: null,
    food_allowance: null,
    misc: null,
    remarks: "",
    total: computed(() => {
      const expenses = newReimbursement.value.taskExpense;
      return (
        (expenses.travel_cost || 0) +
        (expenses.material_cost || 0) +
        (expenses.food_allowance || 0) +
        (expenses.misc || 0)
      ).toFixed(2);
    }),
  },
});

// Columns for DataTable
const columns = ref([
  { key: "date", label: "Submitted On", width: "150px" },
  { key: "distanceKm", label: "Distance Travelled", width: "200px" },
  { key: "subTotal", label: "Sub Total", width: "120px" },
  { key: "totalReimbursement", label: "Total Reimbursement", width: "250px" },
  { key: "notes", label: "Notes", width: "100px" },
  {
    key: "ModeOfTransport.transportName",
    label: "Transport Mode",
    width: "200px",
  },
  // { key: "taskID.title", label: "Task Type", width: "200px" },
  { key: "status", label: "Status", width: "100px" },
]);

// Computed properties
const canApprove = computed(() => {
  return (
    userRole === "Manager" || userRole === "Admin" || userRole === "Dealer"
  );
});

/*
const hasFieldProFeature = computed(() => {
  try {
    const planData = typeof plan === "string" ? JSON.parse(plan) : plan;
    console.log("Plan Data for FieldPro Check:", planData);
    if (planData?.features && Array.isArray(planData.features)) {
      const hasFieldPro = planData.features.some(
        (feature) => feature.key === "fieldpro",
      );
      console.log("FieldPro Feature Found:", hasFieldPro);
      return hasFieldPro;
    }
    return false;
  } catch (error) {
    console.error("Error parsing plan data:", error);
    return false;
  }
});
*/

const currencySymbol = computed(() => {
  try {
    const currency = accountSettings?.currency || "USD";
    const settings =
      typeof accountSettings === "string"
        ? JSON.parse(accountSettings)
        : accountSettings;
    const actualCurrency = settings?.currency || currency;
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      AED: "د.إ",
      SAR: "﷼",
      CAD: "C$",
      AUD: "A$",
      JPY: "¥",
      CNY: "¥",
    };
    return symbols[actualCurrency] || "$";
  } catch (error) {
    console.error("Error determining currency symbol:", error);
    return "$";
  }
});

// Utility functions
const formatDateOnly = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getStatusIcon = (status) => {
  const iconMap = {
    draft: "mdi-file-document-outline",
    submitted: "mdi-clock-outline",
    approved: "mdi-check-circle",
    declined: "mdi-close-circle",
    paid: "mdi-currency-usd",
  };
  return iconMap[status] || "mdi-help-circle";
};

const getIconColor = (status) => {
  const colorMap = {
    draft: "grey",
    submitted: "amber-darken-3",
    approved: "green-darken-2",
    declined: "red-darken-2",
    paid: "blue-darken-2",
  };
  return colorMap[status] || "grey";
};

const getStatusClass = (status) => {
  const statusClassMap = {
    draft: "status-draft",
    submitted: "status-requested",
    approved: "status-approved",
    declined: "status-rejected",
    paid: "status-paid",
  };
  return statusClassMap[status] || "";
};

const formatStatus = (status, reimbUserId) => {
  const statusMap = {
    draft: "Draft",
    submitted: reimbUserId === userId ? "Pending" : "Requested",
    approved: "Approved",
    declined: "Declined",
    paid: "Paid",
  };
  return statusMap[status] || status;
};

const showNotification = (message, color = "success") => {
  snackbar.value = {
    show: true,
    message,
    color,
  };
};

// Drawer toggle
const toggleAddDrawer = async () => {
  showAddDrawer.value = !showAddDrawer.value;
  if (showAddDrawer.value) {
    // if (hasFieldProFeature.value) {
    //   await Promise.all([fetchTasks(), fetchTransportOptions()]);
    //   activeTab.value = "withTask";
    // } else {
    activeTab.value = "withoutTask";
    await fetchTransportOptions();
    // }
  } else {
    clearAddForm();
  }
};

// Clear form
const clearAddForm = () => {
  newReimbursement.value = {
    // selectedTaskId: null,
    distanceKm: null,
    transportId: null,
    subTotal: null,
    totalReimbursement: null,
    notes: "",
    taskExpense: {
      travel_cost: null,
      material_cost: null,
      food_allowance: null,
      misc: null,
      remarks: "",
    },
  };
  // activeTab.value = hasFieldProFeature.value ? "withTask" : "withoutTask";
  activeTab.value = "withoutTask";
};

/*
const updateDistanceKm = (value) => {
  const selectedTask = tasks.value.find((task) => task.id === value);
  newReimbursement.value.distanceKm = selectedTask
    ? selectedTask.distanceKm
    : null;
};
*/

// Fetch transport options
const fetchTransportOptions = async () => {
  try {
    transportLoading.value = true;
    const token = getToken();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/transport?filter[tenant][tenantId][_eq]=${tenantId}&fields=id,transportName,ratePerKm`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    transportOptions.value = data.data;
  } catch (error) {
    console.error("Error fetching transport options:", error);
    showNotification("Failed to fetch transport options.", "error");
  } finally {
    transportLoading.value = false;
  }
};

// Add reimbursement
const handleAddReimbursement = async () => {
  addLoading.value = true;
  try {
    const selectedTransport = transportOptions.value.find(
      (option) => option.id === newReimbursement.value.transportId,
    );

    const payload = {
      reimbBy: {
        assignedUser: {
          id: userId,
        },
      },
      date: new Date().toISOString().split("T")[0],
      distanceKm: newReimbursement.value.distanceKm,
      // taskID:
      //   activeTab.value === "withTask"
      //     ? newReimbursement.value.selectedTaskId
      //     : null,
      ModeOfTransport: newReimbursement.value.transportId,
      subTotal: newReimbursement.value.subTotal,
      totalReimbursement: newReimbursement.value.totalReimbursement,
      notes: newReimbursement.value.notes,
      status: "submitted",
      taskExpense: {
        ...newReimbursement.value.taskExpense,
        total: newReimbursement.value.taskExpense.total,
      },
      tenant: { tenantId: tenantId },
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/expenseReimbursement`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to add reimbursement");
    }

    const newItem = await response.json();
    items.value.unshift({ ...newItem.data, updating: false });
    totalItems.value += 1;

    showNotification("Reimbursement added successfully", "success");
    toggleAddDrawer();
  } catch (error) {
    console.error("Error adding reimbursement:", error);
    showNotification("Failed to add reimbursement. Please try again.", "error");
  } finally {
    addLoading.value = false;
  }
};

// Data fetching functions
const getToken = () => {
  return localStorage.getItem("userToken");
};

/*
const fetchTasks = async () => {
  try {
    const token = getToken();
    if (!token || !userId) {
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tasks?filter[_and][0][_and][0][employeeId][assignedUser][_eq]=${userId}&filter[_and][0][_and][1][status][_eq]=completed&fields=id,title,distanceKm,status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    tasks.value = data.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};
*/

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/expenseReimbursement?${queryString}`,
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
  }
};

const fetchData = async () => {
  if (!tenantId) {
    showError.value = true;
    errorMessage.value = "Tenant ID not found.";
    return;
  }

  await aggregateCount();

  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;
  try {
    const params = {
      fields: [
        "id",
        "reimbBy.assignedUser.first_name",
        "reimbBy.id",
        "reimbBy.assignedUser.role.name",
        "reimbBy",
        "date",
        "distanceKm",
        "toDate",
        // "taskID.title",
        "subTotal",
        "totalReimbursement",
        "notes",
        "status",
        "taskExpense",
        "ModeOfTransport.id",
        "ModeOfTransport.transportName",
        "ModeOfTransport.ratePerKm",
      ],
      ...filterParams(),
      sort: sortBy.value
        ? `${sortDirection.value === "desc" ? "-" : ""}${sortBy.value}`
        : "-date",
      limit: itemsPerPage.value,
      page: page.value,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key]
            .map((field) => `fields[]=${encodeURIComponent(field)}`)
            .join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/expenseReimbursement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = data.data.map((item) => ({
      ...item,
      "reimbBy.assignedUser.first_name":
        item.reimbBy?.assignedUser?.first_name || "—",
      updating: false,
    }));
  } catch (error) {
    console.error("Error fetching expense reimbursements:", error);
    showError.value = true;
    errorMessage.value =
      error.message ||
      "Failed to fetch expense reimbursements. Please try again.";
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {};

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const formattedDate = thirtyDaysAgo.toISOString().split("T")[0];
  params["filter[date_created][_gte]"] = formattedDate;
  params["filter[status][_nin]"] = "approved,paid";

  if (tenantId) {
    params["filter[tenant][tenantId][_eq]"] = tenantId;
  }

  if (userRole === "Manager") {
    params["filter[reimbBy][assignedUser][role][name][_eq]"] = "Employee";
  } else if (userRole === "Employee") {
    params["filter[reimbBy][assignedUser][id][_eq]"] = userId;
  }

  if (search.value && search.value.trim() !== "") {
    params["filter[reimbBy][assignedUser][first_name][_contains]"] =
      search.value.trim();
  }

  return params;
};

// Event handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

const handleRowClick = (item) => {
  console.log("Row clicked:", item);
};

const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
  fetchData();
};

// Watchers
watch(search, (newSearch, oldSearch) => {
  if (newSearch !== oldSearch) {
    page.value = 1;
    fetchData();
  }
});

// Lifecycle hooks
onMounted(async () => {
  await fetchData();
  console.log("Current Plan:", plan);
  console.log("Plan Type:", typeof plan);
  // console.log("Has FieldPro Feature:", hasFieldProFeature.value);
  console.log("Account Settings:", accountSettings);
  console.log("Currency Symbol:", currencySymbol.value);
});
</script>

<style scoped>
/* Unchanged styles */
.employee-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
  background: #f5f7f9;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: margin-right 0.3s ease;
  padding: 16px;
  background: #f5f7f9;
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 8px;
}

.data-table {
  height: calc(90vh - 190px) !important;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.pagination {
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  background: white;
}

.expense-item {
  margin-bottom: 2px;
}

/* Status Cell Styles */
.status-cell {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap !important;
  min-width: 100px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.status-draft {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.status-requested {
  background-color: #fff8e1;
  color: #f57f17;
  border: 1px solid #ffecb3;
}

.status-approved {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-paid {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.status-rejected {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

/* Drawer Styles */
.add-drawer {
  width: 400px;
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

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
}

.drawer-tabs {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.drawer-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f0f0;
  color: #666;
}

.drawer-tabs button.active {
  background-color: #059367;
  color: white;
}

.drawer-tabs button:disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.premium-message {
  padding: 16px;
}

.drawer-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.drawer-actions {
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

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.drawer-content::-webkit-scrollbar {
  width: 8px;
}

.drawer-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

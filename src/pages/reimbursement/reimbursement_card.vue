<template>
  <div class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Tab Navigation -->
      <div class="d-flex align-center py-2 px-4">
        <div class="left-tabs">
          <button
            @click="switchTab('activity')"
            :class="{ active: activeLeftTab === 'activity' }"
          >
            <i class="fas fa-clock"></i>
            Recent Activity
          </button>
          <button
            @click="switchTab('history')"
            :class="{ active: activeLeftTab === 'history' }"
          >
            <i class="fas fa-history"></i>
            History
          </button>
        </div>
        <v-spacer></v-spacer>
      </div>

      <div v-if="tabLoading" class="d-flex justify-center align-center py-2">
        <v-progress-linear indeterminate color="#059367"></v-progress-linear>
      </div>

      <!-- Main Content Area with proper spacing -->
      <div class="content-wrapper">
        <DataTable
          :items="items"
          :columns="columns"
          :show-selection="true"
          :selected-items="selected"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          :item-key="'id'"
          :row-clickable="true"
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
            ${{ item.totalReimbursement?.toFixed(2) || "0.00" }}
          </template>
          <template v-slot:[`cell-subTotal`]="{ item }">
            ${{ item.subTotal?.toFixed(2) || "0.00" }}
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
            </v-chip>
            <span v-else class="text-muted">Not specified</span>
          </template>
          <template v-slot:[`cell-itemizedExpenses`]="{ item }">
            <div
              v-if="item.itemizedExpenses && item.itemizedExpenses.length > 0"
            >
              <div
                v-for="(expense, index) in item.itemizedExpenses.slice(0, 2)"
                :key="index"
                class="expense-item"
              >
                <small>{{ expense.description }} - ${{ expense.cost }}</small>
              </div>
              <small v-if="item.itemizedExpenses.length > 2" class="text-muted">
                +{{ item.itemizedExpenses.length - 2 }} more items
              </small>
            </div>
            <span v-else class="text-muted">No expenses</span>
          </template>
          <template v-slot:[`cell-status`]="{ item }">
            <div class="status-cell">
              <!-- Status pill -->
              <span
                v-if="item.status !== 'submitted'"
                :class="['status-chip', `status-${item.status}`]"
              >
                <v-icon size="14" class="me-1">{{
                  getStatusIcon(item.status)
                }}</v-icon>
                {{ formatStatus(item.status) }}
              </span>

              <!-- "Requested" pill -->
              <span v-else class="status-chip status-requested">
                <v-icon size="14" class="me-1">mdi-clock-outline</v-icon>
                Requested
              </span>

              <!-- Approve / Reject mini-buttons -->
              <div
                v-if="item.status === 'submitted' && canApprove"
                class="action-buttons"
              >
                <v-btn
                  class="action-btn approve-btn"
                  color="success"
                  size="x-small"
                  :loading="item.updating"
                  @click.stop="handleStatusUpdate(item.id, 'approved')"
                  title="Approve"
                >
                  <v-icon size="16">mdi-check</v-icon>
                </v-btn>

                <v-btn
                  class="action-btn reject-btn"
                  color="error"
                  size="x-small"
                  :loading="item.updating"
                  @click.stop="handleStatusUpdate(item.id, 'rejected')"
                  title="Reject"
                >
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </div>
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
    </div>

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
import DataTable from "@/components/common/table/DataTable.vue";

const emit = defineEmits(["showEditPage"]);

// Reactive data
const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const userBranches = ref([]);

const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref("");
const sortDirection = ref("asc");

// Tab management
const activeLeftTab = ref("activity");
const tabLoading = ref(false);

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// Filters

const statusOptions = [
  { title: "Draft", value: "draft" },
  { title: "Pending", value: "submitted" },
  { title: "Approved", value: "approved" },
  { title: "Declined", value: "declined" },
  { title: "Paid", value: "paid" },
];

// Define columns for DataTable
const columns = ref([
  {
    key: "reimbBy.assignedUser.first_name",
    label: "Employee Name",
    width: "180px",
  },
  { key: "date", label: "Submitted On", width: "140px" },
  { key: "distanceKm", label: "Distance Travelled", width: "160px" },
  { key: "subTotal", label: "Sub Total", width: "120px" },
  { key: "totalReimbursement", label: "Total Reimbursement", width: "160px" },
  {
    key: "ModeOfTransport.transportName",
    label: "Transport Mode",
    width: "160px",
  },
  { key: "taskID.title", label: "Task Type", width: "180px" },

  { key: "notes", label: "Notes", width: "150px" },
  { key: "status", label: "Status", width: "280px" }, // Increased width for status column
]);

// Computed properties
const canApprove = computed(() => {
  return (
    userRole === "Manager" || userRole === "Admin" || userRole === "Dealer"
  );
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

const formatStatus = (status) => {
  const statusMap = {
    draft: "Draft",
    submitted: "Submitted",
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

// Tab switching
const switchTab = async (tab) => {
  if (activeLeftTab.value === tab || tabLoading.value) return;

  tabLoading.value = true;
  activeLeftTab.value = tab;

  try {
    await fetchData();
  } finally {
    setTimeout(() => {
      tabLoading.value = false;
    }, 500);
  }
};

// Status update function
const handleStatusUpdate = async (reimbursementId, newStatus) => {
  try {
    const itemIndex = items.value.findIndex(
      (item) => item.id === reimbursementId,
    );
    if (itemIndex === -1) return;

    items.value[itemIndex].updating = true;

    const updateData = {
      status: newStatus,
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/expenseReimbursement/${reimbursementId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to ${newStatus} request`);
    }

    items.value[itemIndex] = {
      ...items.value[itemIndex],
      status: newStatus,
      ...updateData,
      updating: false,
    };

    showNotification(
      `Reimbursement ${newStatus === "approved" ? "approved" : "rejected"} successfully`,
      "success",
    );
  } catch (error) {
    console.error("Error updating status:", error);
    showNotification(
      `Failed to ${newStatus} reimbursement. Please try again.`,
      "error",
    );

    const itemIndex = items.value.findIndex(
      (item) => item.id === reimbursementId,
    );
    if (itemIndex !== -1) {
      items.value[itemIndex].updating = false;
    }
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
        "taskID.title",
        "subTotal",
        "advancePayment",
        "totalReimbursement",
        "notes",
        "status",
        "taskExpense",
        "ModeOfTransport.transportName",
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
    console.log("Fetched items:", items.value);
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

  if (activeLeftTab.value === "activity") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split("T")[0];
    params["filter[date_created][_gte]"] = formattedDate;
    params["filter[status][_nin]"] = "approved,paid";
  }

  if (activeLeftTab.value === "history") {
    params["filter[_or][0][status][_eq]"] = "approved";
    params["filter[_or][1][status][_eq]"] = "declined";
    params["filter[_or][2][status][_eq]"] = "paid";
  }

  if (userRole === "Manager") {
    params["filter[reimbBy][assignedUser][role][name][_eq]"] = "Employee";
    params["filter[tenant][tenantId][_eq]"] = tenantId;
    if (userBranches.value.length > 0) {
      params["filter[reimbBy][assignedBranch][branch_id][id][_in]"] =
        userBranches.value.join(",");
    }
  } else if (userRole === "Admin" || userRole === "Dealer") {
    params["filter[tenant][tenantId][_eq]"] = tenantId;
  } else if (userRole === "Employee") {
    throw new Error(
      "Unauthorized access. Employees cannot access expense reimbursement permissions.",
    );
  }

  // if (search.value) {
  //   params["filter[reimbBy][assignedUser][first_name][_contains]"] =
  //     search.value;
  // }

  // if (filters.value.status.length > 0) {
  //   filters.value.status.forEach((status, index) => {
  //     params[`filter[_or][${index}][status][_eq]`] = status;
  //   });
  // }

  // if (filters.value.branch.length > 0) {
  //   params["filter[reimbBy][assignedBranch][branch_id][id][_in]"] =
  //     filters.value.branch.join(",");
  // }

  // if (filters.value.dateFrom) {
  //   params["filter[date][_gte]"] = filters.value.dateFrom;
  // }

  // if (filters.value.dateTo) {
  //   params["filter[date][_lte]"] = filters.value.dateTo;
  // }

  // if (filters.value.amountFrom) {
  //   params["filter[totalReimbursement][_gte]"] = filters.value.amountFrom;
  // }

  // if (filters.value.amountTo) {
  //   params["filter[totalReimbursement][_lte]"] = filters.value.amountTo;
  // }

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

// const handleRowClick = (item) => {
//   console.log("Row clicked:", item);
// };

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
});
</script>

<style scoped>
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

.main-content.with-filter {
  margin-right: 300px;
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 8px;
}

.data-table {
  height: calc(90vh - 250px) !important;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.pagination {
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  background: white;
}

.search-field {
  max-width: 300px;
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
  min-width: 160px; /* give enough room */
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

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
}

.action-btn {
  min-width: 32px !important;
  width: 32px;
  height: 32px;
  padding: 0 !important;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.approve-btn {
  background-color: #4caf50 !important;
}

.reject-btn {
  background-color: #f44336 !important;
}

/* Tab Navigation */
.left-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.left-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #e0e0e0;
}

.left-tabs button.active {
  background-color: #059367;
  color: white;
  border-color: #059367;
}

.left-tabs button:hover:not(.active) {
  background-color: #e0e0e0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .data-table {
    height: calc(90vh - 200px) !important;
  }

  /* keep everything else responsive, but force row layout */
  .status-cell {
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px;
  }

  .action-buttons {
    margin-left: auto !important;
    align-self: center !important;
  }
}

/* Scrollbar styling */
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

.gap-2 {
  gap: 8px;
}
</style>

<template>
  <div class="regularization-container">
    <!-- Main Content with Table -->
    <div class="main-content">
      <DataTableWrapper
        :searchQuery="search"
        @update:searchQuery="handleSearchUpdate"
        :showSearch="false"
        :isEmpty="items.length === 0"
        :hasError="showError"
        wrapperClass="regularization-table-wrapper"
      >
        <!-- Table Content -->
        <template #default>
          <SkeletonLoading
            v-if="loading"
            variant="data-table"
            :rows="6"
            :columns="columns.length"
            :animated="true"
          />
          <DataTable
            v-else
            :items="items"
            :columns="columns"
            :selected-items="selected"
            :show-selection="true"
            :row-clickable="false"
            @update:selected-items="selected = $event"
          >
            <!-- Custom Cell Content -->
            <template #cell-Date="{ item }">
              {{ formatDate(item.Date) }}
            </template>
            <template #cell-status="{ item }">
              <div class="d-flex align-center">
                <span class="status-chip" :class="getStatusClass(item.status)">
                  <v-icon
                    size="small"
                    class="me-1"
                    :color="getIconColor(item.status)"
                  >
                    {{ getStatusIcon(item.status) }}
                  </v-icon>
                  {{ formatStatus(item.status) }}
                </span>
                <BaseButton
                  v-if="item.status === 'pending'"
                  variant="danger"
                  size="sm"
                  text="Cancel"
                  @click.stop="cancelRequest(item.id)"
                />
              </div>
            </template>
            <template #empty>
              <div class="d-flex flex-column align-center pa-4">
                <v-icon size="large" color="grey" class="mb-2"
                  >mdi-calendar-blank</v-icon
                >
                <div class="text-subtitle-1 text-medium-emphasis">
                  No regularization requests found
                </div>
              </div>
            </template>
          </DataTable>
        </template>

        <!-- Pagination Slot -->
        <template #pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            :is-searching="!!search"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>

      <!-- Drawer for Add Form -->
      <v-navigation-drawer
        v-model="showAddForm"
        location="right"
        width="400"
        temporary
        class="form-drawer"
      >
        <add-form
          v-if="showAddForm"
          @closeAddPage="toggleAddForm"
          @requestApplied="handleRequestApplied"
        />
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Plus } from "lucide-vue-next";

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showError = ref(false);
const errorMessage = ref("");
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(25);
const showAddForm = ref(false);

const columns = [
  { key: "Date", label: "Date", width: 150, sortable: false },
  { key: "employeeId", label: "Employee ID", width: 120, sortable: false },
  { key: "requestedInTime", label: "In Time", width: 120, sortable: false },
  { key: "requestedOutTime", label: "Out Time", width: 120, sortable: false },
  { key: "reason", label: "Reason", width: 200, sortable: false },
  { key: "status", label: "Status", width: 250, sortable: false },
];

const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

const formatStatus = (status) => {
  const statusMap = {
    pending: "Pending",
    approved: "Approved",
    declined: "Declined",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: "status-pending",
    approved: "status-approved",
    declined: "status-declined",
    cancelled: "status-cancelled",
  };
  return classes[status] || "";
};

const getStatusIcon = (status) => {
  const icons = {
    pending: "mdi-clock-outline",
    approved: "mdi-check-circle",
    declined: "mdi-close-circle",
    cancelled: "mdi-cancel",
  };
  return icons[status] || "mdi-help-circle";
};

const getIconColor = (status) => {
  const colors = {
    pending: "#ff9800",
    approved: "#4caf50",
    declined: "#f44336",
    cancelled: "#757575",
  };
  return colors[status] || "#757575";
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
};

const handleRequestApplied = () => {
  fetchData();
};

let searchTimeout = null;
const handleSearchUpdate = (value) => {
  search.value = value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchData();
  }, 300);
};

const aggregateCount = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const currentTenantId = currentUserTenant.getTenantId();

    const filterParams = {
      "filter[_and][0][employeeId][assignedUser][id][_eq]": userDetails.id,
      "filter[_and][1][tenant][tenantId][_eq]": currentTenantId,
    };

    if (search.value) {
      filterParams["filter[_and][2][_or][0][reason][_contains]"] = search.value;
      filterParams["filter[_and][2][_or][1][status][_contains]"] = search.value;
    }

    filterParams["aggregate[countDistinct]"] = "id";

    const queryString = Object.keys(filterParams)
      .map((key) => `${key}=${encodeURIComponent(filterParams[key])}`)
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest?${queryString}`,
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

    const countData = await response.json();
    const count = countData?.data?.[0]?.count?.id || 0;
    totalItems.value = Number(count);
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchData = async () => {
  const token = getToken();
  if (!token) {
    return;
  }

  const userDetails = await currentUserTenant.fetchLoginUserDetails();
  const tenantId = currentUserTenant.getTenantId();

  loading.value = true;
  try {
    const params = new URLSearchParams({
      fields: [
        "id",
        "employeeId",
        "Date",
        "requestedInTime",
        "requestedOutTime",
        "reason",
        "status",
        "tenant.tenantId",
      ].join(","),
      sort: "-Date",
      page: page.value,
      limit: itemsPerPage.value,
    });

    params.append(
      "filter[_and][0][employeeId][assignedUser][id][_eq]",
      userDetails.id,
    );
    params.append("filter[_and][1][tenant][tenantId][_eq]", tenantId);

    if (search.value) {
      params.append("filter[_and][2][_or][0][reason][_contains]", search.value);
      params.append("filter[_and][2][_or][1][status][_contains]", search.value);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest?${params}`,
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
    items.value = data.data;
    await aggregateCount();
  } catch (error) {
    console.error("Error fetching regularization requests:", error);
    showError.value = true;
    errorMessage.value = "Failed to load regularization requests.";
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
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

const cancelRequest = async (id) => {
  try {
    const token = getToken();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/regularizationRequest/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to cancel request");
    }

    items.value = items.value.filter((item) => item.id !== id);
    await aggregateCount();
  } catch (error) {
    console.error("Error cancelling request:", error);
    showError.value = true;
    errorMessage.value = "Failed to cancel request.";
  }
};

onMounted(async () => {
  await aggregateCount();
  await fetchData();
});
</script>

<style scoped>
.d-flex.align-center {
  gap: 10px;
}
.regularization-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: all 0.3s ease;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}

:deep(.resizable-header) {
  position: relative;
  background: #f5f5f5;
  padding: 0 16px;
  height: 48px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
}

.status-pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-approved {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-declined {
  background-color: #ffebee;
  color: #c62828;
}

.status-cancelled {
  background-color: #f5f5f5;
  color: #757575;
}

.form-drawer {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  top: 0 !important;
  overflow-y: auto;
}

:deep(.v-navigation-drawer__scrim) {
  background: transparent !important;
}

@media (max-width: 960px) {
  .form-drawer {
    width: 100% !important;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

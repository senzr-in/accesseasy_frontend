<template>
  <div class="employee-container">
    <!-- Main Content with Table -->
    <div class="main-content" :class="{ 'drawer-open': showDrawer }">
      <DataTableWrapper
        :searchQuery="search"
        @update:searchQuery="handleSearchUpdate"
        :showSearch="false"
        :isEmpty="false"
        :hasError="showError"
        wrapperClass="employee-table-wrapper"
      >
        <!-- Toolbar Actions Slot -->
        <template #toolbar-actions>
          <div class="header-actions">
            <BaseButton
              variant="primary"
              size="md"
              text="Work Preference"
              :leftIcon="Plus"
              @click="showDrawer = true"
            />
          </div>
        </template>

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
            <template #cell-date_created="{ item }">
              {{ formatDate(item.date_created) }}
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
                  No work preference requests found
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
        v-model="showDrawer"
        location="right"
        temporary
        width="400"
        class="form-drawer"
      >
        <AddWorkPreferenceForm
          v-if="showDrawer"
          @closeAddPage="showDrawer = false"
          @saved="refreshData"
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
import AddWorkPreferenceForm from "./add.vue";

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showError = ref(false);
const errorMessage = ref("");
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(25);
const showDrawer = ref(false);

// Table columns for DataTable
const columns = [
  { key: "date_created", label: "Applied On", width: 150, sortable: false },
  { key: "leaveType", label: "Type", width: 120, sortable: false },
  { key: "fromDate", label: "From", width: 120, sortable: false },
  { key: "toDate", label: "To", width: 120, sortable: false },
  { key: "reason", label: "Reason", width: 200, sortable: false },
  { key: "status", label: "Status", width: 250, sortable: false },
];

// Date formatting
const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

// Status formatting
const formatStatus = (status) => {
  const statusMap = {
    pending: "Requested",
    approved: "Approved",
    declined: "Rejected",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: "status-requested",
    approved: "status-approved",
    declined: "status-rejected",
  };
  return classes[status] || "";
};

const getStatusIcon = (status) => {
  const icons = {
    pending: "mdi-clock-outline",
    approved: "mdi-check-circle",
    declined: "mdi-close-circle",
  };
  return icons[status] || "mdi-help-circle";
};

const getIconColor = (status) => {
  const colors = {
    pending: "#ff9800",
    approved: "#4caf50",
    declined: "#f44336",
  };
  return colors[status] || "#757575";
};

const getToken = () => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

let searchTimeout = null;
const handleSearchUpdate = (value) => {
  search.value = value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    refreshData();
  }, 300);
};

const aggregateCount = async () => {
  try {
    const token = getToken();
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const currentTenantId = currentUserTenant.getTenantId();
    const userRole = userDetails.role?.name;

    const filterParams = {};

    if (userRole === "Manager") {
      filterParams[
        "filter[_and][0][requestedBy][assignedUser][role][name][_eq]"
      ] = "Employee";
      filterParams["filter[_and][1][tenant][tenantId][_eq]"] = currentTenantId;
    } else if (userRole === "Employee") {
      filterParams["filter[_and][0][requestedBy][assignedUser][id][_eq]"] =
        userDetails.id;
      filterParams["filter[_and][1][tenant][tenantId][_eq]"] = currentTenantId;
    } else if (userRole === "Admin" || userRole === "accessManager") {
      filterParams["filter[_and][0][requestedBy][assignedUser][id][_eq]"] =
        userDetails.id;
    }

    filterParams["filter[_and][2][leaveType][_in]"] = "workFromHome,onDuty";

    if (search.value) {
      filterParams["filter[_or][0][reason][_contains]"] = search.value;
      filterParams["filter[_or][1][leaveType][_contains]"] = search.value;
      filterParams["filter[_or][2][status][_contains]"] = search.value;
    }

    filterParams["aggregate[countDistinct]"] = "id";

    const queryString = new URLSearchParams(filterParams).toString();

    const url = `${import.meta.env.VITE_API_URL}/items/leaveRequest?${queryString}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const countData = await response.json();
    totalItems.value = Number(countData.data?.[0]?.count?.id) || 0;
  } catch (error) {
    console.error("Error fetching total count:", error);
    totalItems.value = 0;
    showError.value = true;
    errorMessage.value = "Failed to fetch total count.";
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const token = getToken();
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const tenantId = currentUserTenant.getTenantId();
    const userRole = userDetails.role?.name;

    const params = new URLSearchParams({
      fields: [
        "id",
        "requestedBy.assignedUser.first_name",
        "requestedBy.id",
        "requestedBy.assignedUser.role.name",
        "requestedBy",
        "leaveType",
        "date_created",
        "fromDate",
        "toDate",
        "reason",
        "status",
        "tenant.tenantId",
        "tenant.tenantName",
      ].join(","),
      sort: "-date_created,-status",
      page: page.value.toString(),
      limit: itemsPerPage.value.toString(),
    });
    // ADDED: Filter for workFromHome and onDuty leave types
    params.append("filter[_and][2][leaveType][_in]", "workFromHome,onDuty");
    if (userRole === "Manager") {
      params.append(
        "filter[_and][0][requestedBy][assignedUser][role][name][_eq]",
        "Employee",
      );
      params.append("filter[_and][1][tenant][tenantId][_eq]", tenantId);
    } else if (userRole === "Employee") {
      params.append(
        "filter[_and][0][requestedBy][assignedUser][id][_eq]",
        userDetails.id,
      );
      params.append("filter[_and][1][tenant][tenantId][_eq]", tenantId);
    } else if (userRole === "Admin" || userRole === "accessManager") {
      params.append(
        "filter[_and][0][requestedBy][assignedUser][id][_eq]",
        userDetails.id,
      );
    }

    if (search.value) {
      params.append("filter[_or][0][reason][_contains]", search.value);
      params.append("filter[_or][1][leaveType][_contains]", search.value);
      params.append("filter[_or][2][status][_contains]", search.value);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${params}`,
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
    items.value = data.data || [];
  } catch (error) {
    console.error("Error fetching work preference requests:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch work preference requests.";
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await aggregateCount();
  await fetchData();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  refreshData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  refreshData();
};

const cancelRequest = async (id) => {
  try {
    const token = getToken();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
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

    refreshData();
  } catch (error) {
    console.error("Error cancelling request:", error);
    showError.value = true;
    errorMessage.value = "Failed to cancel request.";
  }
};

onMounted(refreshData);
</script>

<style scoped>
.employee-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  transition: width 0.3s ease;
  width: 100%;
}
.form-drawer {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  top: 0 !important;
  overflow-y: auto;
}
.main-content.drawer-open {
  width: calc(100% - 400px); /* Match the drawer width */
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

.status-chip {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  text-transform: none;
}

.status-requested {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-approved {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-rejected {
  background-color: #ffebee;
  color: #c62828;
}

:deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;
  text-align: start;
  z-index: 1;
}

@media (max-width: 960px) {
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

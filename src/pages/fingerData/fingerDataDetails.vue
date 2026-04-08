<template>
  <div class="mobile-finger-data-container">
    <div class="main-content">
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search by Employee ID or Name'"
        :isEmpty="items.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <!-- Delete Button -->
        <template #before-search>
          <v-btn
            v-if="selected.length > 0"
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete"
            @click="deleteSelectedItems"
            :disabled="deleting"
            :loading="deleting"
            class="delete-btn"
          >
            Delete Selected ({{ selected.length }})
          </v-btn>
        </template>

        <!-- Table content states -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="items.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load mobile finger data"
            :message="error"
            @retry="fetchFingerData"
          />
        </div>

        <div v-else-if="items.length === 0">
          <EmptyState
            :title="
              search
                ? 'No matching records found'
                : 'No mobile finger data found'
            "
            :message="
              search
                ? 'Try adjusting your search term'
                : 'No finger data available'
            "
            :primaryAction="{ text: 'Clear Search' }"
            @primaryAction="clearSearch"
          />
        </div>

        <div v-else>
          <DataTable
            :items="items"
            :columns="columns"
            :selectedItems="selected"
            :showSelection="true"
            :sortBy="sortBy[0]?.key || ''"
            :sortDirection="sortBy[0]?.order || 'asc'"
            :itemKey="'id'"
            :rowClickable="false"
            @update:selectedItems="selected = $event"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @sort="handleSort"
          >
            <!-- Employee Column -->
            <template #cell-assignedTo="{ item }">
              <div class="employee-info-compact">
                <div class="employee-name-small">
                  {{ getEmployeeName(item) }}
                </div>
                <div class="employee-id-small">
                  {{ item.assignedTo?.employeeId || "N/A" }}
                </div>
              </div>
            </template>

            <!-- Finger Data Column -->
            <template #cell-base64_UserFingers="{ item }">
              <div class="finger-data">
                <v-chip
                  size="small"
                  color="secondary"
                  variant="tonal"
                  v-if="item.base64_UserFingers"
                >
                  {{ truncateText(item.base64_UserFingers, 30) }}
                </v-chip>
                <span v-else class="null-value-small">No Data</span>
              </div>
            </template>

            <!-- Date Created Column -->
            <template #cell-date_created="{ item }">
              <div class="compact-date">
                {{ formatDate(item.date_created) }}
              </div>
            </template>

            <!-- Date Updated Column -->
            <template #cell-date_updated="{ item }">
              <div class="compact-date">
                {{ formatDate(item.date_updated) }}
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Pagination -->
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
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="error" class="mr-2">mdi-delete-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete {{ selected.length }} selected mobile
          finger data record(s)? <br /><br />
          <strong>This action cannot be undone.</strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            @click="confirmDelete"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import { debounce } from "lodash";

// State
const items = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const selected = ref([]);
const deleteDialog = ref(false);
const deleting = ref(false);
const sortBy = ref([]);

// Snackbar state
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  icon: "mdi-check-circle",
});

// Define columns for DataTable
const columns = computed(() => [
  {
    key: "assignedTo",
    label: "Employee",
    sortable: true,
    width: "150px",
  },
  {
    key: "base64_UserFingers",
    label: "Finger Data",
    sortable: true,
    width: "200px",
  },
  {
    key: "date_created",
    label: "Date Created",
    sortable: true,
    width: "150px",
  },
  {
    key: "date_updated",
    label: "Date Updated",
    sortable: true,
    width: "150px",
  },
]);

const showSnackbar = (
  message,
  color = "success",
  icon = "mdi-check-circle"
) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.icon = icon;
  snackbar.show = true;
};

const getEmployeeName = (item) => {
  if (!item?.assignedTo?.assignedUser) return "Unknown";
  return item.assignedTo.assignedUser.first_name || "Unknown";
};

const truncateText = (text, maxLength = 15) => {
  if (!text) return "";

  // Convert array to string if needed
  const textStr = Array.isArray(text) ? text.join(", ") : String(text);

  return textStr.length > maxLength
    ? textStr.substring(0, maxLength) + "..."
    : textStr;
};

const formatDate = (dateString) => {
  if (!dateString) return "-- / --";
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      "filter[tenant][tenantId][_eq]": tenantId,
      ...filterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/userFingers?${queryString}`,
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
  } catch (err) {
    console.error("Error fetching aggregate count:", err);
    error.value = "Failed to load data count";
    totalItems.value = 0;
  }
};

const fetchFingerData = async () => {
  await aggregateCount();

  if (!token) {
    showSnackbar(
      "Authentication required. Please login again.",
      "error",
      "mdi-alert-circle"
    );
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const params = {
      fields: [
        "base64_UserFingers",
        "date_created",
        "date_updated",
        "assignedTo.assignedUser.first_name",
        "assignedTo.employeeId",
        "assignedTo.id",
        "tenant.tenantName",
        "tenant.tenantId",
        "id",
      ],
      ...filterParams(),
      sort: getSortParam(),
      limit: itemsPerPage.value,
      page: page.value,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/userFingers?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    items.value = (result.data || []).map((item) => ({
      id: item.id,
      base64_UserFingers: item.base64_UserFingers,
      date_created: item.date_created,
      date_updated: item.date_updated,
      assignedTo: {
        id: item.assignedTo?.id,
        employeeId: item.assignedTo?.employeeId,
        assignedUser: {
          first_name: item.assignedTo?.assignedUser?.first_name,
        },
      },
      tenant: {
        tenantId: item.tenant?.tenantId,
        tenantName: item.tenant?.tenantName,
      },
    }));
  } catch (err) {
    console.error("Error fetching mobile finger data:", err);
    error.value =
      err.message || "Failed to fetch mobile finger data. Please try again.";
    showSnackbar(error.value, "error", "mdi-alert-circle");
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {
    "filter[tenant][tenantId][_eq]": tenantId,
  };

  if (search.value) {
    params["filter[_or][0][assignedTo][employeeId][_icontains]"] = search.value;
    params["filter[_or][1][assignedTo][assignedUser][first_name][_icontains]"] =
      search.value;
  }

  return params;
};

const getSortParam = () => {
  if (sortBy.value.length === 0) return "-date_created";

  return sortBy.value
    .map((sortItem) => {
      const direction = sortItem.order === "desc" ? "-" : "";
      return `${direction}${sortItem.key}`;
    })
    .join(",");
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
  fetchFingerData();
};

const clearSearch = () => {
  search.value = "";
  page.value = 1;
  fetchFingerData();
};

// Delete functionality
const deleteSelectedItems = () => {
  if (selected.value.length === 0) return;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (selected.value.length === 0) return;

  deleting.value = true;
  try {
    const ids = selected.value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.id;
        }
        return item;
      })
      .filter((id) => id !== undefined);

    if (ids.length === 0) {
      throw new Error("No valid IDs found for deletion");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/userFingers`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message ||
          `HTTP error! Status: ${response.status}`
      );
    }
    showSnackbar(
      `${ids.length} records deleted successfully`,
      "success",
      "mdi-check-circle"
    );

    selected.value = [];
    await fetchFingerData();
  } catch (err) {
    console.error("Error deleting records:", err);
    showSnackbar(
      err.message || "Failed to delete records",
      "error",
      "mdi-alert-circle"
    );
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchFingerData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchFingerData();
};

const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchFingerData();
}, 300);

watch(search, () => {
  debouncedSearch();
});

watch(
  sortBy,
  () => {
    fetchFingerData();
  },
  { deep: true }
);

onMounted(() => {
  fetchFingerData();
});
</script>

<style scoped>
.mobile-finger-data-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.delete-btn {
  animation: fadeIn 0.3s ease-in-out;
}

.employee-info-compact {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.employee-name-small {
  font-weight: 600;
  color: #1976d2;
  font-size: 0.875rem;
}

.employee-id-small {
  font-size: 0.75rem;
  color: #666;
}

.finger-data {
  font-size: 0.875rem;
}

.null-value-small {
  color: #999;
  font-style: italic;
  font-size: 0.75rem;
}

.compact-date {
  font-size: 0.875rem;
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Make sure the DataTableWrapper takes full height */
:deep(.data-table-wrapper) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Ensure proper spacing for the delete button in the header */
:deep(.table-header) {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>

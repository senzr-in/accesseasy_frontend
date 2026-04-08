<template>
  <div class="ai-face-embedding-container">
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
            title="Unable to load AI face embeddings"
            :message="error"
            @retry="fetchAiFaceData"
          />
        </div>

        <div v-else-if="items.length === 0">
          <EmptyState
            :title="
              search
                ? 'No matching records found'
                : 'No AI face embeddings found'
            "
            :message="
              search
                ? 'Try adjusting your search term'
                : 'No face embedding data available'
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
            <!-- Employee Info Column -->
            <template #cell-assignedTo="{ item }">
              <div class="employee-info">
                <div class="employee-name">{{ getEmployeeName(item) }}</div>
                <div class="employee-id">
                  {{ item.assignedTo?.employeeId || "N/A" }}
                </div>
              </div>
            </template>

            <!-- Base64 Data Column -->
            <template #cell-base64Data="{ item }">
              <div class="base64-data">
                <v-chip
                  size="small"
                  color="info"
                  variant="tonal"
                  v-if="item.base64Data"
                >
                  {{ truncateText(item.base64Data, 30) }}
                </v-chip>
                <span v-else class="null-value">No Data</span>
              </div>
            </template>

            <!-- Date Created Column -->
            <template #cell-date_created="{ item }">
              {{ formatDate(item.date_created) }}
            </template>

            <!-- Date Updated Column -->
            <template #cell-date_updated="{ item }">
              {{ formatDate(item.date_updated) }}
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
          Are you sure you want to delete {{ selected.length }} selected AI face
          embedding record(s)? <br /><br />
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
    label: "Employee Info",
    sortable: true,
    width: "200px",
  },
  {
    key: "base64Data",
    label: "Base64 Data",
    sortable: false,
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
  const firstName = item.assignedTo.assignedUser.first_name || "";
  return firstName || "Unknown";
};

const truncateText = (text, maxLength = 30) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
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
      ...(search.value && {
        "filter[_or][0][assignedTo][employeeId][_icontains]": search.value,
        "filter[_or][1][assignedTo][assignedUser][first_name][_icontains]":
          search.value,
        "filter[_or][2][assignedTo][assignedUser][last_name][_icontains]":
          search.value,
      }),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/aiFaceId?${queryString}`,
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
  }
};

const fetchAiFaceData = async () => {
  console.log("Starting fetchAiFaceData");

  // Fetch aggregate count
  await aggregateCount();
  console.log("Aggregate count fetched, totalItems:", totalItems.value);

  // Check for token
  if (!token) {
    console.log("No token found, showing error snackbar");
    showSnackbar(
      "Authentication required. Please login again.",
      "error",
      "mdi-alert-circle"
    );
    return;
  }

  // Set loading state
  loading.value = true;
  error.value = null;
  console.log("Loading set to true");

  try {
    // Build query parameters
    const params = {
      fields: [
        "id",
        "assignedTo.id",
        "assignedTo.employeeId",
        "assignedTo.assignedUser.id",
        "assignedTo.assignedUser.first_name",
        "assignedTo.assignedUser.last_name",
        "base64Data",
        "date_created",
        "date_updated",
        "tenant.tenantId",
      ],
      ...filterParams(),
      sort: sortBy.value.length > 0 ? getSortParam() : "-date_updated",
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
    console.log("Query string constructed:", queryString);

    // Make API request
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/aiFaceId?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse response data
    const result = await response.json();
    const rawData = result.data || [];
    console.log("Full rawData response:", JSON.stringify(rawData, null, 2));

    // Transform data without filtering
    items.value = rawData.map((item) => {
      const transformedItem = {
        id: item.id,
        base64Data: item.base64Data,
        date_created: item.date_created,
        date_updated: item.date_updated,
        assignedTo: item.assignedTo
          ? {
              id: item.assignedTo.id,
              employeeId: item.assignedTo.employeeId,
              assignedUser: {
                first_name: item.assignedTo.assignedUser?.first_name,
                last_name: item.assignedTo.assignedUser?.last_name,
              },
            }
          : null,
        tenant: {
          tenantId: item.tenant?.tenantId,
        },
      };
      console.log("Transformed item:", transformedItem);
      return transformedItem;
    });

    // Update totalItems
    console.log("Final transformed items:", items.value);
  } catch (err) {
    console.error("Error fetching AI face data:", err);
    error.value =
      err.message || "Failed to fetch AI face data. Please try again.";
    showSnackbar(error.value, "error", "mdi-alert-circle");
  } finally {
    loading.value = false;
    console.log("Loading set to false, fetchAiFaceData complete");
  }
};

const filterParams = () => {
  const params = {};

  // Filter by tenant
  params["filter[tenant][tenantId][_eq]"] = tenantId;

  // Search filter
  if (search.value) {
    params["filter[_or][0][assignedTo][employeeId][_icontains]"] = search.value;
    params["filter[_or][1][assignedTo][assignedUser][first_name][_icontains]"] =
      search.value;
    params["filter[_or][2][assignedTo][assignedUser][last_name][_icontains]"] =
      search.value;
  }

  return params;
};

const getSortParam = () => {
  if (sortBy.value.length === 0) return "-date_updated";

  return sortBy.value
    .map((sortItem) => {
      const direction = sortItem.order === "desc" ? "-" : "";
      return `${direction}${sortItem.key}`;
    })
    .join(",");
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchAiFaceData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchAiFaceData();
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
  fetchAiFaceData();
};

const clearSearch = () => {
  search.value = "";
  page.value = 1;
  fetchAiFaceData();
};

// Delete functionality
const deleteSelectedItems = () => {
  if (selected.value.length === 0) return;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
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

    // Step 1: For each aiFaceId, find and update the personalModule record
    for (const aiFaceId of ids) {
      try {
        // Find personalModule record with this assignedFaceEmbed
        const personalModuleResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][assignedFaceEmbed][_eq]=${aiFaceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (personalModuleResponse.ok) {
          const personalModuleData = await personalModuleResponse.json();

          // If personalModule record found, update it to remove the relationship
          if (personalModuleData.data && personalModuleData.data.length > 0) {
            const personalModuleId = personalModuleData.data[0].id;

            // Update personalModule to remove assignedFaceEmbed relationship
            const updateResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/items/personalModule/${personalModuleId}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  assignedFaceEmbed: null,
                }),
              }
            );

            if (!updateResponse.ok) {
              console.warn(
                `Failed to update personalModule ${personalModuleId} for aiFaceId ${aiFaceId}`
              );
            }
          }
        }
      } catch (error) {
        console.warn(
          `Error updating personalModule for aiFaceId ${aiFaceId}:`,
          error
        );
        // Continue with other deletions even if one fails
      }
    }

    // Step 2: Delete from aiFaceId collection
    const deleteResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/aiFaceId`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(
        errorData.errors?.[0]?.message ||
          `HTTP error! Status: ${deleteResponse.status}`
      );
    }

    showSnackbar(
      `Successfully deleted ${ids.length} AI face embedding(s)`,
      "success",
      "mdi-check-circle"
    );

    // Refresh the data
    await fetchAiFaceData();
    selected.value = [];
  } catch (err) {
    console.error("Error deleting AI face data:", err);
    showSnackbar(
      err.message || "Failed to delete AI face data. Please try again.",
      "error",
      "mdi-alert-circle"
    );
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
  }
};

const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchAiFaceData();
}, 300);

watch(search, () => {
  debouncedSearch();
});

watch(
  sortBy,
  () => {
    fetchAiFaceData();
  },
  { deep: true }
);

// Lifecycle hooks
onMounted(async () => {
  await fetchAiFaceData();
});
</script>

<style scoped>
.ai-face-embedding-container {
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
  margin-right: 16px;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #1976d2;
}

.employee-id {
  font-size: 0.875rem;
  color: #666;
}

.base64-data {
  font-size: 0.875rem;
}

.null-value {
  color: #999;
  font-style: italic;
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

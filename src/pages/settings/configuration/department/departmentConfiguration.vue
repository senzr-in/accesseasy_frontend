<template>
  <div class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Delete Confirmation Dialog -->
      <ConfirmDeleteModal
        :show="deleteDialog"
        title="Delete Confirmation"
        :confirmMessage="`Are you sure you want to delete ${selected.length} ${selected.length === 1 ? 'department' : 'departments'}?`"
        itemLabel="Department(s)"
        :itemName="
          selected.length === 1
            ? selected[0]?.departmentName
            : `${selected.length} departments`
        "
        description="This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        deletingText="Deleting..."
        :deleting="deleting"
        @close="closeDelete"
        @confirm="confirmDelete"
      />

      <!-- Add/Edit Department Dialog -->
      <v-dialog v-model="departmentDialog" max-width="400px" persistent>
        <v-card>
          <v-card-title class="text-h6 d-flex justify-center py-4">
            {{ isEditing ? "Edit Department" : "Add Department" }}
          </v-card-title>
          <v-card-text>
            <v-form ref="departmentForm" v-model="formValid">
              <v-text-field
                v-model="departmentFormData.departmentName"
                label="Department Name"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
              ></v-text-field>

              <!-- <v-col cols="12" md="6"> -->
              <!-- <v-text-field
              v-model="departmentFormData.departmentId"
              label="Department ID"
              :rules="[rules.required]"
              variant="outlined"
              density="compact"
              :disabled="isEditing"
            ></v-text-field> -->
              <!-- </v-col> -->

              <!-- <v-col cols="12" md="6">
            <v-select
              v-model="selectedOrgType"
              :items="orgTypeOptions"
              label="Organization Type"
              variant="outlined"
              density="compact"
              @update:model-value="onOrgTypeChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="departmentFormData.orgId"
              :items="organizationOptions"
              item-title="orgName"
              item-value="id"
              label="Organization"
              :rules="[rules.required]"
              variant="outlined"
              density="compact"
              :loading="loadingOrganizations"
            ></v-select>
          </v-col> -->
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="closeDepartmentDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="saveDepartment"
              :loading="saving"
              :disabled="!formValid"
            >
              {{ isEditing ? "Update" : "Save" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- DataTableWrapper with structured layout -->
      <DataTableWrapper
        :search-query="search"
        :has-error="false"
        search-placeholder="Search departments..."
        @update:searchQuery="updateSearchQuery"
      >
        <!-- Toolbar actions slot -->
        <template #toolbar-actions>
          <div class="toolbar-with-stats">
            <BaseButton
              variant="primary"
              text="Add Department"
              :leftIcon="Plus"
              width="100px"
              @click="openAddDialog"
            />
            <!-- Stats -->
            <div class="stats-container">
              <div class="stat-item total--text">
                <span class="stat-value">{{ totalItems }}</span>
                <span class="stat-title">Total Departments</span>
              </div>
            </div>
            <!-- Add Teams Button -->
          </div>
        </template>
        <!-- Main content slot -->
        <div class="teams-table-wrapper">
          <!-- Skeleton Loading or Data Table -->
          <SkeletonLoading
            v-if="loading"
            variant="data-table"
            :rows="itemsPerPage"
            :columns="columns.length"
          />
          <DataTable
            v-else
            :items="items"
            :columns="columns"
            :show-selection="false"
            :selected-items="selected"
            :sort-by="currentSortBy"
            :sort-direction="currentSortDirection"
            @update:selectedItems="updateSelectedItems"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @sort="handleSort"
            @rowClick="handleRowClick"
          >
            <!-- Custom cell for organization name -->
            <template #cell-orgName="{ item, value }">
              <span>{{ item.orgId?.orgName || "N/A" }}</span>
            </template>

            <!-- Custom cell for actions -->
            <template #cell-actions="{ item }">
              <div class="action-buttons">
                <ActionBtn
                  :icon="Edit"
                  variant="ghost"
                  size="sm"
                  tooltip="Edit Department"
                  @click.stop="editItem(item)"
                />
                <ActionBtn
                  :icon="Trash"
                  variant="ghost"
                  size="sm"
                  tooltip="Delete Department"
                  @click.stop="deleteItemSingle(item)"
                />
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Pagination slot -->
        <template #pagination>
          <CustomPagination
            :page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import ConfirmDeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Delete, Edit, Filter, HandMetal, Plus, Trash } from "lucide-vue-next";
import ActionBtn from "@/components/common/buttons/ActionButton.vue";
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// Reactive data
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const items = ref([]);
const loading = ref(true); // Initially set to true for loading state
const search = ref("");
const showFilters = ref(false);
const deleteDialog = ref(false);
const departmentDialog = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const saving = ref(false);
const loadingOrganizations = ref(false);
const deleting = ref(false);
const selectedOrgType = ref("all");
const organizationOptions = ref([]);
const orgTypeOptions = ref([
  { title: "All Organizations", value: "all" },
  { title: "Main Organization", value: "main tenant" },
  { title: "Sub Organization", value: "tenantorg" },
  { title: "Distributor Organization", value: "distributororg" },
]);
const departmentFormData = ref({
  departmentId: "",
  departmentName: "",
  orgId: null,
});

// Form validation rules
const rules = {
  required: (value) => !!value || "This field is required",
};

// Table columns
const columns = [
  // {
  //   key: "departmentId",
  //   label: "Department ID",
  //   width: "150px",
  //   sortable: true,
  // },
  {
    key: "departmentName",
    label: "Department Name",
    width: "200px",
    sortable: true,
  },
  // { key: "orgName", label: "Organization", width: "200px", sortable: true },
  { key: "actions", label: "Actions", sortable: false, width: "100px" },
];

// Fetch organizations based on type
const fetchOrganizations = async (orgType = "all") => {
  try {
    loadingOrganizations.value = true;
    let filterQuery = "";
    if (orgType !== "all") {
      filterQuery = `filter[_and][0][_and][0][orgType][_contains]=${orgType}`;
    }
    const params = {
      fields: ["id", "orgName", "orgType"],
      ...(filterQuery && {
        [filterQuery.split("=")[0]]: filterQuery.split("=")[1],
      }),
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
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&${queryString}`,
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
    organizationOptions.value = data.data || [];
  } catch (error) {
    console.error("Error fetching organizations:", error);
    organizationOptions.value = [];
  } finally {
    loadingOrganizations.value = false;
  }
};

// Handle organization type change
const onOrgTypeChange = (newOrgType) => {
  departmentFormData.value.orgId = null;
  fetchOrganizations(newOrgType);
};

// Aggregate count function
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
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${queryString}`,
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
    const countValue = countData?.data?.[0]?.count?.id;
    totalItems.value = countValue ? Number(countValue) : 0;
    return countValue;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    return 0;
  }
};

// Fetch departments data
const fetchData = async () => {
  try {
    loading.value = true;
    await aggregateCount();
    const sortParam =
      currentSortDirection.value === "desc"
        ? `-${currentSortBy.value}`
        : currentSortBy.value;
    const params = {
      fields: [
        "departmentId",
        "departmentName",
        "status",
        "id",
        "tenant.tenantId",
        "tenant.tenantName",
        "orgId.orgName",
        "orgId.id",
        "date_created",
      ],
      ...filterParams(),
      sort: sortParam,
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
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${queryString}`,
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
    selected.value = [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  } finally {
    loading.value = false;
  }
};

// Filter parameters
const filterParams = () => {
  const params = {
    "filter[tenant][tenantId][_eq]": tenantId,
    "filter[status][_neq]": "archived",
  };

  if (search.value) {
    // Check if the search value is numeric (likely a department ID)
    const isNumeric = /^\d+$/.test(search.value);

    if (isNumeric) {
      // If numeric, search only in departmentId field with exact match
      params["filter[departmentId][_eq]"] = search.value;
    } else {
      // If text, search in departmentName and orgName fields with partial match
      params["filter[_or][0][departmentName][_icontains]"] = search.value;
      params["filter[_or][1][orgId][orgName][_icontains]"] = search.value;
    }
  }
  return params;
};

// Event handlers
const updateSearchQuery = (value) => {
  search.value = value;
  updateSearch();
};

const updateSearch = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

const updateSelectedItems = (items) => {
  selected.value = items;
};

const currentSortBy = ref("date_created");
const currentSortDirection = ref("asc");

const updateSortBy = (field) => {
  currentSortBy.value = field;
};

const updateSortDirection = (direction) => {
  currentSortDirection.value = direction;
};

const handleSort = ({ field, direction }) => {
  page.value = 1;
  fetchData();
};

const handleRowClick = (item) => {
  // Handle row click if needed
};

// Pagination handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

// Dialog handlers
const openAddDialog = async () => {
  isEditing.value = false;
  const departmentCount = await aggregateCount();
  departmentFormData.value = {
    departmentId: `${departmentCount + 1}`,
    departmentName: "",
    orgId: null,
  };
  selectedOrgType.value = "all";
  fetchOrganizations("all");
  departmentDialog.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  departmentFormData.value = {
    id: item.id,
    departmentId: item.departmentId,
    departmentName: item.departmentName,
    orgId: item.orgId?.id || null,
  };
  if (item.orgId?.id) {
    const currentOrg = organizationOptions.value.find(
      (org) => org.id === item.orgId.id,
    );
    if (currentOrg) {
      selectedOrgType.value = currentOrg.orgType;
    } else {
      selectedOrgType.value = "all";
      fetchOrganizations("all");
    }
  } else {
    selectedOrgType.value = "all";
    fetchOrganizations("all");
  }
  departmentDialog.value = true;
};

const closeDepartmentDialog = () => {
  departmentDialog.value = false;
  departmentFormData.value = {
    departmentId: "",
    departmentName: "",
    orgId: null,
  };
  selectedOrgType.value = "all";
};

const saveDepartment = async () => {
  if (!formValid.value) return;
  try {
    saving.value = true;
    const payload = {
      // departmentId: departmentFormData.value.departmentId,
      departmentName: departmentFormData.value.departmentName,
      // orgId: departmentFormData.value.orgId,
      tenant: tenantId,
      status: "active",
    };
    let response;
    if (isEditing.value) {
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/department/${departmentFormData.value.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
    } else {
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/department`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    await fetchData();
    closeDepartmentDialog();
    console.log(
      `Department ${isEditing.value ? "updated" : "created"} successfully`,
    );
  } catch (error) {
    console.error(
      `Error ${isEditing.value ? "updating" : "creating"} department:`,
      error,
    );
  } finally {
    saving.value = false;
  }
};

// Delete handlers
const deleteItemSingle = (item) => {
  selected.value = [item];
  deleteDialog.value = true;
};

const closeDelete = () => {
  deleteDialog.value = false;
  selected.value = [];
};

const confirmDelete = async () => {
  try {
    deleting.value = true;
    const idsToDelete = selected.value.map((item) => item.id);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keys: idsToDelete,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    await fetchData();
    console.log(`Successfully deleted ${idsToDelete.length} department(s)`);
  } catch (error) {
    console.error("Error deleting departments:", error);
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    selected.value = [];
  }
};

// Watchers
watch(search, () => {
  updateSearch();
});

// Lifecycle
onMounted(async () => {
  await fetchOrganizations("all");
  await fetchData();
});
</script>

<style scoped>
/* .employee-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
} */
.team-count {
  font-size: 17px;
  font-weight: 500;
  color: #333;
  margin-left: 12px;
}

.main-content {
  flex: 1;

  transition: margin-right 0.3s ease;
} /* Toolbar with Stats */
.toolbar-with-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* Stats Container */
.stats-container {
  display: inline-flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.stat-title {
  color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .toolbar-with-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .stats-container {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .stat-item {
    min-width: 100px;
    padding: 0.375rem 0.5rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-title {
    font-size: 0.625rem;
  }
}

.main-content.with-filter {
  margin-right: 300px;
}

/* .teams-table-wrapper {
  height: calc(100vh - 100px);
} */

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* :deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
} */

/* Header Styles */
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

:deep(.resize-handle) {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
}

:deep(.resize-handle:hover) {
  background: rgba(0, 0, 0, 0.1);
}

/* Scrollbar Styling */
:deep(.v-data-table__wrapper::-webkit-scrollbar) {
  height: 8px;
  width: 8px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #888;
  border-radius: 4px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #555;
}

.employee-table :deep(tr th) {
  background-color: #ebeaea !important;
}

::v-deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background-color: #e8edff !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: #0f3b82 !important;
  text-align: start;
  z-index: 1;
}
</style>

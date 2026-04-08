<template>
  <div class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Delete Confirmation Dialog -->
      <ConfirmDeleteModal
        :show="deleteDialog"
        title="Delete Confirmation"
        :confirmMessage="`Are you sure you want to delete ${selected.length} ${selected.length === 1 ? 'designation' : 'designations'}?`"
        itemLabel="Designation(s)"
        :itemName="
          selected.length === 1
            ? selected[0]?.designations_name
            : `${selected.length} designations`
        "
        description="This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        deletingText="Deleting..."
        :deleting="deleting"
        @close="closeDelete"
        @confirm="confirmDelete"
      />

      <!-- Add/Edit Designation Dialog -->
      <v-dialog v-model="designationDialog" max-width="400px" persistent>
        <v-card>
          <v-card-title class="text-h6 d-flex justify-center py-4">
            {{ isEditing ? "Edit Designation" : "Add Designation" }}
          </v-card-title>
          <v-card-text>
            <v-form ref="designationForm" v-model="formValid">
              <v-text-field
                v-model="designationFormData.designations_name"
                label="Designation Name"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
              ></v-text-field>

              <v-text-field
                v-model="designationFormData.description"
                label="Description"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="closeDesignationDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="saveDesignation"
              :loading="saving"
              :disabled="!formValid"
            >
              {{ isEditing ? "Update" : "Save" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- DataTableWrapper -->
      <DataTableWrapper
        :search-query="search"
        :has-error="false"
        search-placeholder="Search designations..."
        @update:searchQuery="updateSearchQuery"
      >
        <!-- Toolbar actions -->
        <template #toolbar-actions>
          <div class="toolbar-with-stats">
            <BaseButton
              variant="primary"
              text="Add Designation"
              :leftIcon="Plus"
              width="100px"
              @click="openAddDialog"
            />
            <div class="stats-container">
              <div class="stat-item total--text">
                <span class="stat-value">{{ totalItems }}</span>
                <span class="stat-title">Total Designations</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Table -->
        <div class="teams-table-wrapper">
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
            <!-- Actions -->
            <template #cell-actions="{ item }">
              <div class="action-buttons">
                <ActionBtn
                  :icon="Edit"
                  variant="ghost"
                  size="sm"
                  tooltip="Edit Designation"
                  @click.stop="editItem(item)"
                />
                <ActionBtn
                  :icon="Trash"
                  variant="ghost"
                  size="sm"
                  tooltip="Delete Designation"
                  @click.stop="deleteItemSingle(item)"
                />
              </div>
            </template>
          </DataTable>
        </div>

        <!-- Pagination -->
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
import ActionBtn from "@/components/common/buttons/ActionButton.vue";
import { Delete, Edit, Plus, Trash } from "lucide-vue-next";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// Reactive state
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const items = ref([]);
const loading = ref(true);
const search = ref("");
const showFilters = ref(false);
const deleteDialog = ref(false);
const designationDialog = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const saving = ref(false);
const deleting = ref(false);

const designationFormData = ref({
  id: null,
  designations_name: "",
  description: "",
  status: "active",
  tenant: tenantId,
});

// Validation rules
const rules = {
  required: (v) => !!v || "This field is required",
};

// Table columns
const columns = [
  {
    key: "designations_name",
    label: "Designation Name",
    width: "250px",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
    width: "300px",
    sortable: false,
  },
  { key: "actions", label: "Actions", sortable: false, width: "100px" },
];

// Sort
const currentSortBy = ref("sort");
const currentSortDirection = ref("asc");

// --- API Helpers ---
const buildQuery = () => {
  const fields = ["id", "designations_name", "description", "status", "sort"];
  const params = {
    limit: itemsPerPage.value,
    page: page.value,
    "fields[]": fields,
    sort:
      currentSortDirection.value === "desc"
        ? `-${currentSortBy.value}`
        : currentSortBy.value,
    "filter[tenant][tenantId][_eq]": tenantId,
    "filter[status][_neq]": "archived",
  };

  if (search.value) {
    const isNumeric = /^\d+$/.test(search.value);
    if (isNumeric) {
    } else {
      params["filter[_or][0][designations_name][_icontains]"] = search.value;
      params["filter[_or][1][description][_icontains]"] = search.value;
    }
  }

  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
};

// Aggregate count
const aggregateCount = async () => {
  try {
    const countParams = {
      "aggregate[count]": "id",
      "filter[tenant][tenantId][_eq]": tenantId,
      "filter[status][_neq]": "archived",
    };
    if (search.value) {
      const isNumeric = /^\d+$/.test(search.value);
      if (isNumeric) {
      } else {
        countParams["filter[_or][0][designations_name][_icontains]"] =
          search.value;
        countParams["filter[_or][1][description][_icontains]"] = search.value;
      }
    }
    const query = Object.entries(countParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/designations?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    const count = data?.data?.[0]?.count?.id;
    totalItems.value = count ? Number(count) : 0;
  } catch (err) {
    console.error("Count error:", err);
    totalItems.value = 0;
  }
};

// Fetch data
const fetchData = async () => {
  try {
    loading.value = true;
    await aggregateCount();

    const query = buildQuery();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/designations?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    items.value = json.data || [];
    selected.value = [];
  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    loading.value = false;
  }
};

// Search debounce
const updateSearchQuery = (val) => {
  search.value = val;
  updateSearch();
};
const updateSearch = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

// Sort
const updateSortBy = (field) => (currentSortBy.value = field);
const updateSortDirection = (dir) => (currentSortDirection.value = dir);
const handleSort = () => {
  page.value = 1;
  fetchData();
};

// Pagination
const handlePageChange = (p) => {
  page.value = p;
  fetchData();
};
const handleItemsPerPageChange = (n) => {
  itemsPerPage.value = n;
  page.value = 1;
  fetchData();
};

// Selection
const updateSelectedItems = (arr) => (selected.value = arr);

// Dialogs
const openAddDialog = async () => {
  isEditing.value = false;
  await aggregateCount();
  designationFormData.value = {
    id: null,
    designations_name: "",
    description: "",
    status: "active",
    tenant: tenantId,
  };
  designationDialog.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  designationFormData.value = { ...item };
  designationDialog.value = true;
};

const closeDesignationDialog = () => {
  designationDialog.value = false;
  designationFormData.value = {
    id: null,
    designations_name: "",
    description: "",
    status: "active",
    tenant: tenantId,
  };
};

const saveDesignation = async () => {
  if (!formValid.value) return;
  try {
    saving.value = true;
    const payload = {
      designations_name: designationFormData.value.designations_name,
      description: designationFormData.value.description,
      status: "active",
      tenant: tenantId,
    };

    let res;
    if (isEditing.value) {
      res = await fetch(
        `${import.meta.env.VITE_API_URL}/items/designations/${designationFormData.value.id}`,
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
      res = await fetch(`${import.meta.env.VITE_API_URL}/items/designations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchData();
    closeDesignationDialog();
  } catch (err) {
    console.error("Save error:", err);
  } finally {
    saving.value = false;
  }
};

// Delete
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
    const ids = selected.value.map((i) => i.id);
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/designations`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keys: ids }),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchData();
  } catch (err) {
    console.error("Delete error:", err);
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    selected.value = [];
  }
};

// Watch search
watch(search, updateSearch);

// Mount
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.team-count {
  font-size: 17px;
  font-weight: 500;
  color: #333;
  margin-left: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
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

@media (max-width: 1024px) {
  .toolbar-with-stats {
    flex-direction: column;
    align-items: stretch;
  }
}
@media (max-width: 768px) {
  .stats-container {
    flex-wrap: wrap;
  }
}

.main-content.with-filter {
  margin-right: 300px;
}

:deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background-color: #e8edff !important;
  color: #0f3b82 !important;
}
</style>

<template>
  <div class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Delete Confirmation Dialog -->
      <ConfirmDeleteModal
        :show="deleteDialog"
        title="Delete Confirmation"
        :confirmMessage="`Are you sure you want to delete ${selected.length} ${selected.length === 1 ? 'team' : 'teams'}?`"
        itemLabel="Team(s)"
        :itemName="
          selected.length === 1
            ? selected[0]?.teams_name
            : `${selected.length} teams`
        "
        description="This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        deletingText="Deleting..."
        :deleting="deleting"
        @close="closeDelete"
        @confirm="confirmDelete"
      />

      <!-- Add/Edit Team Dialog -->
      <v-dialog v-model="teamDialog" max-width="460px" persistent>
        <v-card>
          <v-card-title class="text-h6 d-flex justify-center py-4">
            {{ isEditing ? "Edit Team" : "Add Team" }}
          </v-card-title>

          <v-card-text>
            <v-form ref="teamForm" v-model="formValid">
              <!-- Team Name -->
              <v-text-field
                v-model="teamFormData.teams_name"
                label="Team Name"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
                class="mb-3"
              ></v-text-field>

              <!-- ==== SELECT USER WITH SEARCH INSIDE ==== -->
              <v-select
                v-model="teamFormData.team_lead"
                :items="filteredUserOptions"
                item-title="title"
                item-value="value"
                label="Select Team Lead"
                placeholder="Choose a user"
                variant="outlined"
                density="compact"
                clearable
                :loading="loadingUsers"
                :menu-props="{ maxHeight: 300 }"
                no-data-text="No users match the search"
              >
                <!-- Search inside dropdown -->
                <template #prepend-item>
                  <v-list-item>
                    <v-text-field
                      v-model="userSearch"
                      placeholder="Search Team Lead (first name)..."
                      density="compact"
                      variant="outlined"
                      clearable
                      hide-details
                      autofocus
                      @click.stop
                      @update:modelValue="fetchUsers"
                      class="mx-2 mb-2"
                    ></v-text-field>
                  </v-list-item>
                  <v-divider></v-divider>
                </template>
              </v-select>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="closeTeamDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="saveTeam"
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
        search-placeholder="Search teams..."
        @update:searchQuery="updateSearchQuery"
      >
        <!-- Toolbar actions -->
        <template #toolbar-actions>
          <div class="toolbar-with-stats">
            <BaseButton
              variant="primary"
              text="Add Team"
              :leftIcon="Plus"
              width="100px"
              @click="openAddDialog"
            />
            <div class="stats-container">
              <div class="stat-item total--text">
                <span class="stat-value">{{ totalItems }}</span>
                <span class="stat-title">Total Teams</span>
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
            <!-- Team Lead Column -->
            <template #cell-team_lead="{ item }">
              <span class="text-no-wrap">
                {{ item.team_lead?.assignedUser?.first_name ?? "-" }}
              </span>
            </template>

            <!-- Actions -->
            <template #cell-actions="{ item }">
              <div class="action-buttons">
                <ActionBtn
                  :icon="Edit"
                  variant="ghost"
                  size="sm"
                  tooltip="Edit Team"
                  @click.stop="editItem(item)"
                />
                <ActionBtn
                  :icon="Trash"
                  variant="ghost"
                  size="sm"
                  tooltip="Delete Team"
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
import { ref, onMounted, watch, computed } from "vue";
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

const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const items = ref([]);
const loading = ref(true);
const search = ref("");
const showFilters = ref(false);
const deleteDialog = ref(false);
const teamDialog = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const saving = ref(false);
const deleting = ref(false);

const userOptions = ref([]);
const userSearch = ref("");
const loadingUsers = ref(false);

const filteredUserOptions = computed(() => {
  if (!userSearch.value) return userOptions.value;
  const term = userSearch.value.toLowerCase();
  return userOptions.value.filter((u) => u.title.toLowerCase().includes(term));
});

const fetchUsers = debounce(async () => {
  if (!teamDialog.value) return;
  loadingUsers.value = true;
  try {
    const fields = ["id", "assignedUser.id", "assignedUser.first_name"];
    const query = fields
      .map((f) => `fields[]=${encodeURIComponent(f)}`)
      .join("&");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${query}&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    userOptions.value = (json.data || [])
      .filter((u) => u.assignedUser?.id) // only valid users
      .map((u) => ({
        value: u.id, // personalModule.id
        title: u.assignedUser?.first_name || "—",
      }));
  } catch (err) {
    console.error("Fetch users error:", err);
    userOptions.value = [];
  } finally {
    loadingUsers.value = false;
  }
}, 300);

const teamFormData = ref({
  id: null,
  teams_name: "",
  status: "active",
  tenant: tenantId,
  team_lead: null, // will hold personalModule.id
});

const rules = {
  required: (v) => !!v || "This field is required",
};

const columns = [
  { key: "teams_name", label: "Team Name", width: "250px", sortable: true },
  { key: "team_lead", label: "Team Lead", width: "180px", sortable: false },
  { key: "actions", label: "Actions", width: "100px", sortable: false },
];

const currentSortBy = ref("sort");
const currentSortDirection = ref("asc");

const buildQuery = () => {
  const fields = [
    "id",
    "teams_name",
    "status",
    "sort",
    "team_lead.id",
    "team_lead.assignedUser.id",
    "team_lead.assignedUser.first_name",
  ];
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
    if (!isNumeric) {
      params["filter[_or][0][teams_name][_icontains]"] = search.value;
    }
  }
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
};

const aggregateCount = async () => {
  try {
    const countParams = {
      "aggregate[count]": "id",
      "filter[tenant][tenantId][_eq]": tenantId,
      "filter[status][_neq]": "archived",
    };
    if (search.value) {
      const isNumeric = /^\d+$/.test(search.value);
      if (!isNumeric) {
        countParams["filter[_or][0][teams_name][_icontains]"] = search.value;
      }
    }
    const query = Object.entries(countParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/teams?${query}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    const count = data?.data?.[0]?.count?.id;
    totalItems.value = count ? Number(count) : 0;
  } catch (err) {
    console.error("Count error:", err);
    totalItems.value = 0;
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    await aggregateCount();
    const query = buildQuery();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/teams?${query}`,
      { headers: { Authorization: `Bearer ${token}` } },
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

const updateSearchQuery = (val) => {
  search.value = val;
  updateSearch();
};
const updateSearch = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

const updateSortBy = (field) => (currentSortBy.value = field);
const updateSortDirection = (dir) => (currentSortDirection.value = dir);
const handleSort = () => {
  page.value = 1;
  fetchData();
};

const handlePageChange = (p) => {
  page.value = p;
  fetchData();
};
const handleItemsPerPageChange = (n) => {
  itemsPerPage.value = n;
  page.value = 1;
  fetchData();
};

const updateSelectedItems = (arr) => (selected.value = arr);

const openAddDialog = async () => {
  isEditing.value = false;
  await aggregateCount();
  teamFormData.value = {
    id: null,
    teams_name: "",
    status: "active",
    tenant: tenantId,
    team_lead: null,
  };
  userSearch.value = "";
  teamDialog.value = true;
  await fetchUsers();
};

const editItem = async (item) => {
  isEditing.value = true;
  teamFormData.value = {
    ...item,
    team_lead: item.team_lead?.id ?? null, // personalModule.id
  };
  userSearch.value = "";
  teamDialog.value = true;
  await fetchUsers();
};

const closeTeamDialog = () => {
  teamDialog.value = false;
  teamFormData.value = {
    id: null,
    teams_name: "",
    status: "active",
    tenant: tenantId,
    team_lead: null,
  };
  userSearch.value = "";
  userOptions.value = [];
};

const saveTeam = async () => {
  if (!formValid.value) return;
  try {
    saving.value = true;
    const payload = {
      teams_name: teamFormData.value.teams_name,
      status: "active",
      tenant: tenantId,
      team_lead: teamFormData.value.team_lead,
    };
    let res;
    if (isEditing.value) {
      res = await fetch(
        `${import.meta.env.VITE_API_URL}/items/teams/${teamFormData.value.id}`,
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
      res = await fetch(`${import.meta.env.VITE_API_URL}/items/teams`, {
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
    closeTeamDialog();
  } catch (err) {
    console.error("Save error:", err);
  } finally {
    saving.value = false;
  }
};

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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/teams`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keys: ids }),
    });
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

const handleRowClick = () => {
  /* optional */
};

watch(search, updateSearch);
onMounted(() => fetchData());
</script>

<style scoped>
.text-no-wrap {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.toolbar-with-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

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

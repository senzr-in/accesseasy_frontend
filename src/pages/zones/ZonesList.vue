<template>
  <div class="zones-container">
    <DataTableWrapper
      title="Zones Management"
      :searchQuery="search"
      @update:searchQuery="search = $event"
      searchPlaceholder="Search zones..."
      :isLoading="loading"
      :isEmpty="items.length === 0 && !loading"
    >
      <template #toolbar-actions>
        <BaseButton
          variant="primary"
          left-icon="plus"
          @click="showAddZoneDialog"
        >
          Create Zone
        </BaseButton>
      </template>

      <!-- Skeleton Loader -->
      <SkeletonLoading
        v-if="loading"
        variant="data-table"
        :rows="6"
        :columns="4"
      />

      <!-- Data Table -->
      <DataTable
        v-else-if="filteredItems.length > 0"
        :items="paginatedItems"
        :columns="tableColumns"
        :showSelection="true"
        v-model:selectedItems="selected"
        @rowClick="handleRowClick"
      >
        <!-- Entry Doors Column -->
        <template #cell-entry_doors="{ value }">
          <span>{{ formatDoors(value) }}</span>
        </template>

        <!-- Exit Doors Column -->
        <template #cell-exit_doors="{ value }">
          <span>{{ formatDoors(value) }}</span>
        </template>

        <!-- Actions Column -->
        <template #cell-actions="{ item }">
          <div class="actions-cell">
            <v-icon
              small
              class="mr-2"
              @click.stop="editItem(item)"
              color="primary"
            >
              mdi-pencil
            </v-icon>
            <v-icon small @click.stop="deleteItem(item)" color="error">
              mdi-delete
            </v-icon>
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <template #pagination>
        <CustomPagination
          :page="page"
          :itemsPerPage="itemsPerPage"
          :total-items="totalItems"
          :is-searching="!!search"
          @update:page="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </template>
    </DataTableWrapper>

    <!-- Zone Form Drawer -->
    <v-navigation-drawer
      v-model="showFormDialog"
      location="right"
      temporary
      width="400"
      class="zone-form-drawer"
    >
      <v-card class="h-100 d-flex flex-column" elevation="0">
        <v-card-title class="text-h5 pa-4 border-b">
          {{ isEditing ? "Edit Zone" : "Create Zone" }}
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4 flex-grow-1 overflow-y-auto">
          <ZoneForm
            :is-editing="isEditing"
            :zone-data="editedItem"
            @save-success="handleSaveSuccess"
            @cancel="closeDialog"
          />
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete the zone "{{ itemToDelete?.zoneName }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <BaseButton variant="secondary" @click="deleteDialog = false">
            Cancel
          </BaseButton>
          <BaseButton variant="danger" @click="confirmDelete">
            Delete
          </BaseButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { zoneService } from "@/services/zoneService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, ref, watch } from "vue";
import ZoneForm from "./ZoneForm.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";

// State management
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const showFormDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const items = ref([]);
const loading = ref(false);
const deleteDialog = ref(false);
const itemToDelete = ref(null);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
var userRole;

// Table columns configuration
const tableColumns = [
  {
    key: "zoneName",
    label: "Zone Name",
    sortable: true,
  },
  {
    key: "entry_doors",
    label: "Entry Doors",
    sortable: false,
  },
  {
    key: "exit_doors",
    label: "Exit Doors",
    sortable: false,
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
  },
];

/**
 * Format doors array to comma-separated string
 */
const formatDoors = (doors) => {
  if (!doors || !Array.isArray(doors) || doors.length === 0) {
    return "None";
  }
  return doors.map((door) => door.doorName).join(", ");
};

/**
 * Fetch zones data from API
 */
const fetchZonesData = async () => {
  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    userRole = userDetails.role?.name;

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    loading.value = true;
    const data = await zoneService.fetchZones();
    items.value = data;
    totalItems.value = data.length;
  } catch (error) {
    console.error("Error fetching zones data:", error);
  } finally {
    loading.value = false;
  }
};

/**
 * Handle page change
 */
const handlePageChange = (newPage) => {
  page.value = newPage;
};

/**
 * Handle items per page change
 */
const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
};

/**
 * Show add zone dialog
 */
const showAddZoneDialog = () => {
  isEditing.value = false;
  editedItem.value = {};
  showFormDialog.value = true;
};

/**
 * Edit zone item
 */
const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = { ...item };
  showFormDialog.value = true;
};

/**
 * Handle row click
 */
const handleRowClick = (item) => {
  if (userRole == "Admin" || userRole == "Manager") {
    editItem(item);
  }
};

/**
 * Delete zone item
 */
const deleteItem = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

/**
 * Confirm delete action
 */
const confirmDelete = async () => {
  try {
    await zoneService.deleteZone(itemToDelete.value.id);
    deleteDialog.value = false;
    itemToDelete.value = null;
    await fetchZonesData();
  } catch (error) {
    console.error("Error deleting zone:", error);
    alert("Error deleting zone");
  }
};

/**
 * Close dialog
 */
const closeDialog = () => {
  showFormDialog.value = false;
  editedItem.value = {};
};

/**
 * Handle save success
 */
const handleSaveSuccess = () => {
  closeDialog();
  fetchZonesData();
};

// Computed filtered items based on search
const filteredItems = computed(() => {
  if (!search.value) return items.value;
  return items.value.filter((item) =>
    item.zoneName?.toLowerCase().includes(search.value.toLowerCase())
  );
});

// Computed paginated items
const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

// Watch search to update filtered results
watch(search, () => {
  totalItems.value = filteredItems.value.length;
  page.value = 1; // Reset to first page on search
});

onMounted(async () => {
  await fetchZonesData();
});
</script>

<style scoped>
.zones-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.actions-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Drawer specific styles */
.zone-form-drawer {
  z-index: 9999;
}

.zone-form-drawer .v-card {
  border-radius: 0;
}

.zone-form-drawer .border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.v-dialog .v-card-text) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

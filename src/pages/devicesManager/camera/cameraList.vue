<template>
  <div class="camera-list-container">
    <DataTableWrapper
      :showSearch="true"
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
    >
      <template #toolbar-actions>
        <div class="d-flex align-center gap-4">
          <v-select
            v-model="selectedLocationFilter"
            :items="locations"
            item-title="locationName"
            item-value="id"
            label="Filter by Location"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            style="width: 200px; margin-right: 16px;"
          ></v-select>
          <BaseButton
            variant="primary"
            size="md"
            text="Add Camera"
            :leftIcon="Plus"
            @click="openAddCameraDialog"
          />
        </div>
      </template>

      <!-- Loading -->
      <SkeletonLoader
        v-if="loading"
        variant="data-table"
        :rows="5"
        :columns="5"
      />

      <!-- Table with Pagination -->
      <div v-else>
        <DataTable
          :items="paginatedCameras"
          :columns="headers"
          :showSelection="false"
          :expandable="false"
          show-header
          :row-clickable="true"
          @rowClick="handleRowClick"
        >
          <!-- Status Cell -->
          <template #cell-status="{ item }">
            <v-chip
              :color="item.status === 'online' ? 'success' : 'error'"
              size="small"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="action-buttons">
              <v-icon size="small" class="me-2" @click.stop="editCamera(item)">
                mdi-pencil
              </v-icon>
              <v-icon size="small" color="error" @click.stop="deleteCamera(item)">
                mdi-delete
              </v-icon>
            </div>
          </template>
        </DataTable>

        <!-- Pagination -->
        <CustomPagination
          v-if="filteredCameras.length > 0"
          :total-items="filteredCameras.length"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
          @items-per-page-change="handleItemsPerPageChange"
          class="mt-4"
        />
      </div>
    </DataTableWrapper>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedItem.name" label="Camera Name"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.ip" label="IP Address"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.locationId"
                  :items="locations"
                  item-title="locationName"
                  item-value="id"
                  label="Location"
                  @update:model-value="updateLocationName"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { Plus } from "lucide-vue-next";
import { authService } from "@/services/authService.js";

const loading = ref(false);
const dialog = ref(false);
const editedIndex = ref(-1);
const selectedLocationFilter = ref(null);
const searchQuery = ref("");
const debouncedSearch = ref("");

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(25);

let searchTimeout = null;

// Locations from API
const locations = ref([]);

// Cameras
const cameras = ref([]);

const headers = ref([
  { label: 'Camera Name', key: 'name', sortable: true, width: '200px' },
  { label: 'IP Address', key: 'ip', sortable: true, width: '150px' },
  { label: 'Location', key: 'locationName', sortable: true, width: '150px' },
  { label: 'Status', key: 'status', sortable: true, width: '120px' },
  { label: 'Actions', key: 'actions', sortable: false, width: '100px' },
]);

const editedItem = ref({
  name: '',
  ip: '',
  locationId: null,
  locationName: '',
});

const defaultItem = {
  name: '',
  ip: '',
  locationId: null,
  locationName: '',
};

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Camera' : 'Edit Camera';
});

const filteredCameras = computed(() => {
  const query = debouncedSearch.value;
  let filtered = cameras.value;

  // Apply location filter
  if (selectedLocationFilter.value) {
    filtered = filtered.filter(c => c.locationId === selectedLocationFilter.value);
  }

  // Apply search filter
  if (query) {
    filtered = filtered.filter(camera => {
      return (
        camera.name.toLowerCase().includes(query) ||
        camera.ip.toLowerCase().includes(query) ||
        camera.locationName.toLowerCase().includes(query) ||
        camera.status.toLowerCase().includes(query)
      );
    });
  }

  return filtered;
});

// Computed property for paginated cameras
const paginatedCameras = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredCameras.value.slice(startIndex, endIndex);
});

const openAddCameraDialog = () => {
  editedIndex.value = -1;
  editedItem.value = Object.assign({}, defaultItem);
  dialog.value = true;
};

const editCamera = (item) => {
  editedIndex.value = cameras.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteCamera = (item) => {
  const index = cameras.value.indexOf(item);
  confirm('Are you sure you want to delete this item?') && cameras.value.splice(index, 1);
};

const close = () => {
  dialog.value = false;
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
};

const updateLocationName = (locationId) => {
  const location = locations.value.find(l => l.id === locationId);
  if (location) {
    editedItem.value.locationName = location.locationName;
  }
};

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(cameras.value[editedIndex.value], editedItem.value);
  } else {
    cameras.value.push({ ...editedItem.value, id: Date.now(), status: 'offline' });
  }
  close();
};

// Pagination handlers
const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
};

// Row click handler
const handleRowClick = (item) => {
  editCamera(item);
};

// Fetch locations from API
const fetchLocations = async () => {
  try {
    loading.value = true;
    const tenantId = authService.getTenantId();
    
    const response = await authService.protectedApi.get('/items/locationManagement', {
      params: {
        'fields[]': ['locdetail', 'locType', 'id'],
        'filter[_and][0][_and][0][tenant][tenantId][_eq]': tenantId,
        'filter[_and][0][_and][1][locType][_contains]': 'branch'
      }
    });

    if (response.data && response.data.data) {
      // Map the response to extract locationName from locdetail
      const fetchedLocations = response.data.data.map(loc => ({
        id: loc.id,
        locationName: loc.locdetail?.locationName || 'Unknown Location'
      }));
      
      locations.value = fetchedLocations;
      
      // Generate cameras for the first 2 locations
      const locationsToUse = fetchedLocations.slice(0, 2);
      const generatedCameras = [];
      let cameraId = 1;
      
      // Status mapping for cameras
      const statusMapping = {
        1: 'online',   // Hyderabad Camera 1
        2: 'offline',  // Hyderabad Camera 2
        3: 'online',   // Hyderabad Camera 3
        4: 'online',   // NewTenant Camera 1
        5: 'offline',  // NewTenant Camera 2
      };
      
      locationsToUse.forEach((location, locIndex) => {
        // Add 3 cameras for first location (Hyderabad), 2 for second location (NewTenant)
        const camerasPerLocation = locIndex === 0 ? 3 : 2;
        
        for (let i = 1; i <= camerasPerLocation; i++) {
          generatedCameras.push({
            id: cameraId,
            name: `${location.locationName} Camera ${i}`,
            ip: `192.168.${locIndex + 1}.10${i}`,
            locationId: location.id,
            locationName: location.locationName,
            status: statusMapping[cameraId] || 'offline'
          });
          cameraId++;
        }
      });
      
      cameras.value = generatedCameras;
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for search query changes
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal.trim().toLowerCase();
    currentPage.value = 1; // Reset page on search
  }, 300);
});

// Watch for location filter changes
watch(selectedLocationFilter, () => {
  currentPage.value = 1; // Reset page on filter change
});

// Fetch locations on component mount
onMounted(() => {
  fetchLocations();
});
</script>

<style scoped>
.camera-list-container {
  padding: 20px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

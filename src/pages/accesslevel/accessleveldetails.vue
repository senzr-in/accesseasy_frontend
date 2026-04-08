<template>
  <div class="flex">
    <!-- Add/Edit Panel -->
    <div
      v-if="showAddPanel"
      class="w-1/3 p-2 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <AccessLevelAdd
        :is-editing="isEditing"
        :access-level-data="currentAccessLevelData"
        :tenant-id="tenantId"
        @save-success="handleSaveSuccess"
        @cancel="closeAddPanel"
      />
    </div>

    <!-- Main Table -->
    <div :class="showAddPanel ? 'w-2/3' : 'w-full'" class="p-2">
      <DataTableWrapper
        :showSearch="true"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
      >
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            text="Add New Access Level"
            :leftIcon="Plus"
            @click="openAddPanel"
          />
        </template>

        <!-- Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="3"
        />

        <!-- Table with Pagination -->
        <div v-else>
          <DataTable
            :items="paginatedAccessLevels"
            :columns="headers"
            :showSelection="false"
            :expandable="false"
            show-header
            :row-clickable="true"
            @rowClick="handleRowClick"
          >
            <!-- Status Switch -->
            <template #cell-type="{ item }">
              <v-switch
                v-model="item.type"
                color="primary"
                inset
                hide-details
                density="compact"
                @change="onToggleAccessType(item)"
              />
            </template>
            <!-- Access Timing Column - UPDATED -->
            <template #cell-accessTiming="{ item }">
              <div class="access-timing-cell">
                <v-chip
                  v-if="item.accessTimingDisplay === '24 Hours Access'"
                  size="small"
                  color="#059367"
                  variant="tonal"
                  class="mr-1"
                >
                  <v-icon icon="mdi-clock-time-four" size="12" class="mr-1" />
                  24 Hours Access
                </v-chip>
                <v-chip
                  v-else-if="item.accessTimingDisplay?.startsWith('Time Zone:')"
                  size="small"
                  color="#1976d2"
                  variant="tonal"
                  class="mr-1"
                >
                  <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                  {{ item.accessTimingDisplay }}
                </v-chip>
                <v-chip
                  v-else-if="
                    item.accessTimingDisplay?.startsWith('Max Work Hours:')
                  "
                  size="small"
                  color="#f57c00"
                  variant="tonal"
                  class="mr-1"
                >
                  <v-icon icon="mdi-timer-outline" size="12" class="mr-1" />
                  {{ item.accessTimingDisplay }}
                </v-chip>
                <v-chip
                  v-else-if="item.accessTimingDisplay === 'Holiday Access'"
                  size="small"
                  color="#7b1fa2"
                  variant="tonal"
                  class="mr-1"
                >
                  <v-icon icon="mdi-calendar-star" size="12" class="mr-1" />
                  Holiday Access
                </v-chip>
                <v-chip
                  v-else
                  size="small"
                  color="grey"
                  variant="tonal"
                  class="mr-1"
                >
                  <v-icon
                    icon="mdi-clock-alert-outline"
                    size="12"
                    class="mr-1"
                  />
                  {{ item.accessTimingDisplay || "Not Set" }}
                </v-chip>
              </div>
            </template>
            <!-- Doors Column: First + +N more -->
            <template #cell-assignDoorsGroup="{ item }">
              <div class="branch-chips">
                <!-- No Doors -->
                <v-chip
                  v-if="
                    !item.assignDoorsGroupNames ||
                    item.assignDoorsGroupNames.length === 0
                  "
                  size="small"
                  color="grey"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  No Doors Assigned
                </v-chip>

                <!-- 1 or More Doors -->
                <template v-else>
                  <!-- First Door -->
                  <v-chip
                    size="small"
                    color="#059367"
                    variant="tonal"
                    class="mr-1 mb-1"
                  >
                    <v-icon icon="mdi-door" size="12" class="mr-1" />
                    {{ item.assignDoorsGroupNames[0] }}
                  </v-chip>

                  <!-- +N more (only if >1) -->
                  <v-chip
                    v-if="item.assignDoorsGroupNames.length > 1"
                    size="small"
                    color="grey"
                    variant="tonal"
                    class="mr-1 mb-1 view-more-chip"
                    @click.stop="showDoorsDialog(item)"
                  >
                    +{{ item.assignDoorsGroupNames.length - 1 }} more
                  </v-chip>
                </template>
              </div>
            </template>

            <!-- Edit Button -->
            <template #actions="{ item }">
              <BaseButton
                variant="ghost"
                size="sm"
                text="Edit"
                @click.stop="handleEditAccessLevel(item)"
              />
            </template>
          </DataTable>

          <!-- Pagination - MOVED OUTSIDE DataTable -->
          <CustomPagination
            v-if="filteredAccessLevels.length > 0"
            :total-items="filteredAccessLevels.length"
            :items-per-page="itemsPerPage"
            :current-page="currentPage"
            @page-change="handlePageChange"
            @items-per-page-change="handleItemsPerPageChange"
            class="mt-4"
          />
        </div>
      </DataTableWrapper>

      <!-- Dialog: Show All Doors -->
      <v-dialog v-model="showDoorViewDialog" max-width="400px">
        <v-card>
          <v-card-title class="pa-6 pb-4 dialog-header">
            <div class="d-flex align-center justify-space-between w-100">
              <h3 class="text-h6 font-weight-bold dialog-title">
                Assigned Doors ({{
                  selectedAccessLevelForView?.assignDoorsGroupNames?.length ||
                  0
                }})
              </h3>
              <v-btn
                icon="mdi-close"
                @click="showDoorViewDialog = false"
                variant="text"
                size="small"
                class="rounded-lg dialog-close-btn"
              />
            </div>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(
                  door, index
                ) in selectedAccessLevelForView?.assignDoorsGroupNames"
                :key="index"
              >
                <v-list-item-title>
                  <v-icon icon="mdi-door" size="16" class="mr-2" />
                  {{ door }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="pa-6 pt-4 dialog-footer">
            <v-spacer />
            <BaseButton
              text="Close"
              variant="danger"
              color="grey-darken-1"
              size="md"
              @click="showDoorViewDialog = false"
              class="footer-btn"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import AccessLevelAdd from "@/pages/accesslevel/acessleveladd.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { Plus } from "lucide-vue-next";
import { VIcon } from "vuetify/components";

const loading = ref(true);
const showAddPanel = ref(false);
const isEditing = ref(false);
const currentAccessLevelData = ref(null);
const accessLevels = ref([]);
const searchQuery = ref("");
const debouncedSearch = ref("");

let searchTimeout = null;
// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(25);

// Dialog
const showDoorViewDialog = ref(false);
const selectedAccessLevelForView = ref(null);

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

const headers = ref([
  {
    label: "Access Level Number",
    key: "accessLevelNumber",
    sortable: true,
    width: "150px",
  },
  { label: "Access Level Name", key: "name", sortable: true, width: "200px" },
  {
    label: "Status",
    key: "type",
    sortable: true,
    width: "150px",
    type: "switch",
  },
  {
    label: "Access Timing",
    key: "accessTiming",
    sortable: true,
    width: "250px",
  },
  {
    label: "Assign Doors Group",
    key: "assignDoorsGroup",
    sortable: true,
    width: "300px",
  },
]);
// New: Filtered + Formatted Access Levels (with search)
const filteredAccessLevels = computed(() => {
  const query = debouncedSearch.value;

  if (!query) return accessLevels.value;

  return accessLevels.value.filter((item) => {
    const searchText = [
      item.name, // ← This is accessLevelName
      item.accessLevelNumber?.toString(),
      item.type,
      item.assignDoorsGroupNames?.join(" "),
      item.accessTimingDisplay, // Include access timing in search
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(query);
  });
});
// Computed property for paginated data
const paginatedAccessLevels = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredAccessLevels.value.slice(startIndex, endIndex);
});

// Fetch door names
const fetchDoorNames = async (doorIds) => {
  try {
    if (!doorIds || doorIds.length === 0) return [];
    const ids = Array.isArray(doorIds) ? doorIds : [doorIds];
    const validIds = ids.filter((id) => id != null);
    if (validIds.length === 0) return [];

    const fields = [
      "id",
      "doorNumber",
      "doorName",
      "doorType",
      "tenant.tenantName",
    ];
    const url = new URL(`${import.meta.env.VITE_API_URL}/items/doors`);
    fields.forEach((f) => url.searchParams.append("fields[]", f));
    validIds.forEach((id, i) =>
      url.searchParams.append(`filter[_or][${i}][id][_eq]`, id)
    );
    url.searchParams.append("filter[tenant][tenantId][_eq]", tenantId);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data.map((d) => d.doorName || `Door ${d.doorNumber}`);
  } catch (error) {
    console.error("Failed to fetch door names:", error);
    return [];
  }
};

// Fetch access levels
const fetchAccessLevels = async () => {
  try {
    loading.value = true;
    if (!token || !tenantId) throw new Error("Auth required");

    const fields = [
      "id",
      "accessLevelNumber",
      "accessLevelName",
      "accessType",
      "tenant.tenantId",
      "assignDoorsGroup",
      "_24hrs",
      "Valid_hours",
      "workingHours",
      "maxWorkHours",
      "holidays",
      "limitTime",
      
    ];

    const url = new URL(`${import.meta.env.VITE_API_URL}/items/accesslevels`);
    fields.forEach((f) => url.searchParams.append("fields[]", f));
    url.searchParams.append("filter[tenant][tenantId][_eq]", tenantId);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data?.data) throw new Error("Invalid response");

    const processed = [];
    for (const item of data.data) {
      const doorNames = item.assignDoorsGroup
        ? await fetchDoorNames(item.assignDoorsGroup)
        : [];

      // Determine access timing display - FIXED VERSION
      let accessTimingDisplay = "Not Set";

      if (item._24hrs || item.Valid_hours === "24_hours") {
        accessTimingDisplay = "24 Hours Access";
      } else if (item.Valid_hours === "HOLIDAY" || item.holidays) {
        accessTimingDisplay = "Holiday Access";
      } else if (item.Valid_hours && item.Valid_hours.includes(" - ")) {
        // Check if it's a time range (contains " - ")
        accessTimingDisplay = `Time Zone: ${item.Valid_hours}`;
      } else if (item.Valid_hours && !isNaN(parseInt(item.Valid_hours))) {
        // Check if Valid_hours is a number (like "40", "67", etc.)
        // This is for Max Work Hours
        accessTimingDisplay = `Max Work Hours: ${item.Valid_hours} hours`;
      } else if (item.Valid_hours) {
        // Fallback for any other Valid_hours value
        accessTimingDisplay = `Time Zone: ${item.Valid_hours}`;
      }

      processed.push({
        id: item.id,
        assignDoorsGroup: item.assignDoorsGroup,
        assignDoorsGroupNames: doorNames,
        name: item.accessLevelName,
        type: item.accessType,
        accessLevelNumber: item.accessLevelNumber,
        accessTimingDisplay: accessTimingDisplay,
        originalData: { ...item },
      });
    }
    accessLevels.value = processed;
  } catch (error) {
    console.error("Failed to fetch access levels:", error);
    showToast("Failed to load access levels.", "error");
  } finally {
    loading.value = false;
  }
};

// Pagination handlers
const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1; // Reset to first page
};

// Panel
const openAddPanel = () => {
  isEditing.value = false;
  currentAccessLevelData.value = null;
  showAddPanel.value = true;
};

const closeAddPanel = () => {
  showAddPanel.value = false;
  isEditing.value = false;
  currentAccessLevelData.value = null;
};

const handleRowClick = (item) => {
  if (item?.id) handleEditAccessLevel(item);
};

const fetchAccessLevelById = async (id) => {
  try {
    const url = new URL(`${import.meta.env.VITE_API_URL}/items/accesslevels/${id}`);
    const fields = [
      "id",
      "accessLevelNumber",
      "accessLevelName",
      "accessType",
      "tenant.tenantId",
      "assignDoorsGroup",
      "doorBitmap",
      "accessLevelBitmap",
      "_24hrs",
      "Valid_hours",
      "workingHours",
      "maxWorkHours",
      "holidays",
      "limitTime",
      "faceData",
      "fingerData",
      "qrdata",
      "dateValidity"
    ];
    fields.forEach((f) => url.searchParams.append("fields[]", f));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch access level details:", error);
    showToast("Failed to load access level details.", "error");
    return null;
  }
};

const handleEditAccessLevel = async (accessLevel) => {
  const fullData = await fetchAccessLevelById(accessLevel.id);
  
  if (fullData) {
    isEditing.value = true;
    currentAccessLevelData.value = fullData;
    showAddPanel.value = true;
    showToast(`Editing: ${fullData.accessLevelName}`, "info");
  }
};

const handleSaveSuccess = () => {
  fetchAccessLevels();
  closeAddPanel();
  showToast("Access level saved!", "success");
};

// Open dialog on +N more click
const showDoorsDialog = (accessLevel) => {
  selectedAccessLevelForView.value = accessLevel;
  showDoorViewDialog.value = true;
};

const onToggleAccessType = (item) => {
  showToast(`Status updated for ${item.name}`, "info");
};

const showToast = (msg, type = "success") => {
  console.log(`${type.toUpperCase()}: ${msg}`);
};
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal.trim().toLowerCase();
    currentPage.value = 1; // Reset to first page on search
  }, 300);
});
onMounted(() => {
  fetchAccessLevels();
});
</script>

<style scoped>
.branch-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.access-timing-cell {
  display: flex;
  align-items: center;
}

.view-more-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-more-chip:hover {
  background-color: #e0e0e0 !important;
}

/* Dialog Styling */
.dialog-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.dialog-close-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.dialog-footer {
  background: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.footer-btn {
  min-width: 100px;
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  height: 38px;
}
</style>

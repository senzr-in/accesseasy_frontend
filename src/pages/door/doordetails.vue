<template>
  <div class="flex">
    <!-- Left Panel for Add/Edit Door -->
    <div
      v-if="showAddDoorPanel"
      class="w-1/3 p-4 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <AddDoorDetails
        :is-editing="isEditing"
        :door-data="currentDoorData"
        :tenant-id="tenantId"
        @save-success="handleSaveSuccess"
        @cancel="closeAddDoorPanel"
      />
    </div>

    <!-- Main Content -->
    <div :class="showAddDoorPanel ? 'w-2/3' : 'w-full'" class="p-4">
      <DataTableWrapper
        :showSearch="true"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
      >
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            text="Add New Door"
            :leftIcon="Plus"
            @click="openAddDoorPanel"
          />
        </template>

        <!-- Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="6"
        />

        <!-- Table -->
        <div v-else>
          <DataTable
            :items="paginatedDoors"
            :columns="headers"
            :showSelection="false"
            :expandable="false"
            show-header
            :row-clickable="true"
            @rowClick="handleRowClick"
          >
            <!-- Departments Cell: First + +N more -->
            <template #cell-departments="{ item }">
              <div class="branch-chips">
                <!-- No Departments -->
                <v-chip
                  v-if="
                    !item.departmentNames || item.departmentNames.length === 0
                  "
                  size="small"
                  color="grey"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  No Departments Assigned
                </v-chip>

                <!-- 1 or More -->
                <template v-else>
                  <!-- First Department -->
                  <v-chip
                    size="small"
                    color="#059367"
                    variant="tonal"
                    class="mr-1 mb-1"
                  >
                    <v-icon icon="mdi-account-group" size="12" class="mr-1" />
                    {{ item.departmentNames[0] }}
                  </v-chip>

                  <!-- +N more -->
                  <v-chip
                    v-if="item.departmentNames.length > 1"
                    size="small"
                    color="grey"
                    variant="tonal"
                    class="mr-1 mb-1 view-more-chip"
                    @click.stop="showDepartmentsDialog(item)"
                  >
                    +{{ item.departmentNames.length - 1 }} more
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
                @click.stop="handleEditDoor(item)"
              />
            </template>
          </DataTable>

          <!-- Pagination -->
          <CustomPagination
            v-if="formattedDoors.length > 0"
            :total-items="formattedDoors.length"
            :items-per-page="itemsPerPage"
            :current-page="currentPage"
            @page-change="handlePageChange"
            @items-per-page-change="handleItemsPerPageChange"
            class="mt-4"
          />
        </div>
      </DataTableWrapper>

      <!-- Dialog: Show All Departments -->
      <v-dialog v-model="showDeptViewDialog" max-width="400px">
        <v-card>
          <v-card-title class="pa-6 pb-4 dialog-header">
            <div class="d-flex align-center justify-space-between w-100">
              <h3 class="text-h6 font-weight-bold dialog-title">
                Assigned Departments ({{
                  selectedDoorDepartments?.length || 0
                }})
              </h3>
              <v-btn
                icon="mdi-close"
                @click="showDeptViewDialog = false"
                variant="text"
                size="small"
                class="rounded-lg dialog-close-btn"
              />
            </div>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(dept, index) in selectedDoorDepartments"
                :key="index"
              >
                <v-list-item-title>
                  <v-icon icon="mdi-account-group" size="16" class="mr-2" />
                  {{ dept }}
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
              @click="showDeptViewDialog = false"
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
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import AddDoorDetails from "@/pages/door/adddoordetails.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { Plus } from "lucide-vue-next";
import { VIcon } from "vuetify/components";

const loading = ref(true);
const showAddDoorPanel = ref(false);
const isEditing = ref(false);
const currentDoorData = ref(null);
const doors = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const searchQuery = ref("");
const debouncedSearch = ref("");

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(25);

// Dialog
const showDeptViewDialog = ref(false);
const selectedDoorDepartments = ref([]);

// Table headers
const headers = ref([
  { label: "Door Number", key: "doorNumber", sortable: true, width: "150px" },
  { label: "Door Name", key: "doorName", sortable: true, width: "150px" },
  { label: "Door Type", key: "doorType", sortable: true, width: "150px" },
  { label: "Branch", key: "branch", sortable: true, width: "150px" },
  { label: "Location", key: "location", sortable: true, width: "150px" },
  { label: "Departments", key: "departments", sortable: false, width: "300px" },
]);

const departmentMap = ref(new Map());
const branchMap = ref(new Map());

// New computed — filters formatted doors by search query
const filteredDoors = computed(() => {
  const query = debouncedSearch.value;

  if (!query) return formattedDoors.value;

  return formattedDoors.value.filter((door) => {
    return (
      door.doorName?.toLowerCase().includes(query) ||
      door.doorNumber?.toLowerCase().includes(query) ||
      door.doorType?.toLowerCase().includes(query) ||
      door.branch?.toLowerCase().includes(query) ||
      door.location?.toLowerCase().includes(query) ||
      door.departments?.toLowerCase().includes(query)
    );
  });
});

const paginatedDoors = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredDoors.value.slice(startIndex, endIndex);
});

const totalItemsForPagination = computed(() => filteredDoors.value.length);
// Add this computed
const formattedDoors = computed(() => {
  return doors.value.map((door) => {
    const departmentNames = getDepartmentNamesFromIds(door.departmentIds);
    
    // Resolve branch name: try expanded object first, then map lookup
    let branchName = "N/A";
    if (door.branchLocation?.locdetail?.locationName) {
      branchName = door.branchLocation.locdetail.locationName;
    } else if (door.branchLocation && typeof door.branchLocation === 'object' && door.branchLocation.id) {
       branchName = branchMap.value.get(door.branchLocation.id) || "N/A";
    } else if (door.branchLocation && typeof door.branchLocation === 'string') {
       branchName = branchMap.value.get(door.branchLocation) || "N/A";
    }

    return {
      id: door.id,
      doorNumber: door.doorNumber,
      doorName: door.doorName,
      doorType: door.doorType,
      branch: branchName,
      location: door.location || "N/A",
      departmentNames: departmentNames,
      departments:
        departmentNames.length > 0
          ? departmentNames.join(", ")
          : "Not assigned",
      originalData: { ...door, departmentIds: door.departmentIds }, // keep raw for editing
    };
  });
});
let searchTimeout = null;

const fetchBranches = async () => {
  try {
    const url = new URL(
      `${import.meta.env.VITE_API_URL}/items/locationManagement`
    );
    // Filter for branches in this tenant
    const params = {
      "fields[]": ["id", "locdetail.locationName"],
      "filter[_and][0][_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][0][_and][1][locType][_contains]": "branch",
    };

    Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch branches");
    
    const data = await response.json();
    branchMap.value = new Map(
      data.data.map((b) => [b.id, b.locdetail?.locationName || `Branch ${b.id}`])
    );
  } catch (error) {
    console.error("Error fetching branches:", error);
  }
};

const fetchDepartments = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json();
    departmentMap.value = new Map(
      data.data.map((d) => [d.id, d.departmentName])
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

const getDepartmentNamesFromIds = (departmentIds) => {
  if (!departmentIds) return [];
  try {
    let ids = [];
    if (typeof departmentIds === "string") ids = JSON.parse(departmentIds);
    else if (Array.isArray(departmentIds)) ids = departmentIds;
    else if (typeof departmentIds === "number") ids = [departmentIds];

    return ids
      .map((id) => departmentMap.value.get(id) || `Unknown (ID: ${id})`)
      .filter(Boolean);
  } catch (error) {
    console.error("Error parsing departmentIds:", error);
    return [];
  }
};

const fetchDoors = async () => {
  try {
    loading.value = true;
    // Fetch dependencies first
    await Promise.all([fetchDepartments(), fetchBranches()]);

    const fields = [
      "id",
      "doorNumber",
      "doorName",
      "doorType",
      "departmentIds",
      "branchLocation", // Get raw ID as well
      "branchLocation.id",
      "branchLocation.locdetail",
      "location",
      "status",
    ];

    const url = new URL(`${import.meta.env.VITE_API_URL}/items/doors`);
    fields.forEach((f) => url.searchParams.append("fields[]", f));
    url.searchParams.append("filter[status][_neq]", "archived");
    url.searchParams.append("filter[tenant][_eq]", tenantId);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch doors");
    const data = await response.json();

    doors.value = (data.data || []).map((door) => {
      // Logic moved to formattedDoors computed property for consistency
      return door;
    });

    // Reset to first page when data changes
    currentPage.value = 1;
  } catch (error) {
    console.error("Error fetching doors:", error);
    showToast("Failed to load doors. Please try again.", "error");
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
  currentPage.value = 1; // Reset to first page when items per page changes
};

// Row click
const handleRowClick = (item) => {
  if (item?.id) handleEditDoor(item);
};

// Edit
const handleEditDoor = (door) => {
  isEditing.value = true;

  let departmentIds = [];
  if (door.originalData?.departmentIds) {
    try {
      departmentIds =
        typeof door.originalData.departmentIds === "string"
          ? JSON.parse(door.originalData.departmentIds)
          : Array.isArray(door.originalData.departmentIds)
            ? [...door.originalData.departmentIds]
            : [];
    } catch (e) {
      console.error(e);
    }
  }

  currentDoorData.value = {
    ...door.originalData,
    id: door.id,
    doorName: door.doorName,
    doorNumber: door.doorNumber,
    doorType: door.doorType,
    location: door.location,
    branchLocation: door.originalData?.branchLocation,
    assignedDepts: departmentIds,
  };

  showAddDoorPanel.value = true;
  showToast(`Editing door: ${door.doorName}`, "info");
};

// Panel
const openAddDoorPanel = () => {
  isEditing.value = false;
  currentDoorData.value = null;
  showAddDoorPanel.value = true;
};

const closeAddDoorPanel = () => {
  showAddDoorPanel.value = false;
  isEditing.value = false;
  currentDoorData.value = null;
};

const handleSaveSuccess = () => {
  fetchDoors();
  closeAddDoorPanel();
  showToast("Door saved successfully!", "success");
};

// Dialog
const showDepartmentsDialog = (item) => {
  selectedDoorDepartments.value = item.departmentNames;
  showDeptViewDialog.value = true;
};

const showToast = (msg, type = "success") => {
  console.log(`${type.toUpperCase()}: ${msg}`);
};
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal.trim().toLowerCase();
    currentPage.value = 1; // reset to first page on new search
  }, 300);
});
onMounted(() => {
  fetchDoors();
});
</script>

<style scoped>
.w-2\/3,
.w-full {
  transition: width 0.3s ease;
}

.branch-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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

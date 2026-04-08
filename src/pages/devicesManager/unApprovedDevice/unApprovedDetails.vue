<template>
  <div class="device-container">
    <div
      v-if="!showForm"
      class="main-content"
      :class="{ 'with-filter': showFilters }"
    >
      <v-data-table
        v-model="selected"
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="-1"
        class="border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm bg-white dark:bg-zinc-950 overflow-hidden"
        height="calc(90vh - 190px)"
        fixed-header
        show-select
        @click:row="
          (event, { item }) => {
            if (userRole == 'Admin' || userRole == 'Manager') {
              editItem(item);
            }
            toggleFiltersfalse();
          }
        "
      >
        <template v-slot:item.controllerImage="{ item }">
          <v-avatar size="40" v-if="item.controllerImage?.id">
            <v-img
              v-if="item.controllerImage?.id && item.controllerImage.url"
              :src="item.controllerImage.url"
              :alt="item.controllerName"
            ></v-img>
          </v-avatar>
          <v-avatar size="40" v-else>
            <v-img
              v-if="item.controllerName"
              :src="getDefaultImageForController(item.controllerName)"
              :alt="item.controllerName"
            ></v-img>
            <v-avatar v-else color="grey" class="text-uppercase">
              {{ item.controllerName?.charAt(0) }}
            </v-avatar>
          </v-avatar>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'approved' ? 'success' : 'error'"
            :text-color="item.status === 'approved' ? 'white' : 'white'"
            size="small"
          >
            <v-icon
              start
              small
              :icon="
                item.status === 'approved'
                  ? 'mdi-check-circle'
                  : 'mdi-clock-alert'
              "
            ></v-icon>
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.controllerStatus="{ item }">
          <v-chip
            :color="getControllerStatusColor(item.controllerStatus)"
            :text-color="'white'"
            size="small"
          >
            <v-icon
              start
              small
              :icon="getControllerStatusIcon(item.controllerStatus)"
            ></v-icon>
            {{ item.controllerStatus }}
          </v-chip>
        </template>
        <template v-slot:top>
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 gap-4 shrink-0">
            <!-- Left side tabs -->
            <div class="flex bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-xl shadow-sm">
              <button
                @click="activeTab = 'all'"
                :class="[
                  'px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center',
                  activeTab === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                ]"
              >
                <v-icon size="14" class="mr-1.5 opacity-70">mdi-format-list-bulleted</v-icon>
                All
              </button>
              <button
                @click="activeTab = 'unApproved'"
                :class="[
                  'px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center',
                  activeTab === 'unApproved'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                ]"
              >
                <v-icon size="14" class="mr-1.5 opacity-70">mdi-clock-alert</v-icon>
                Unapproved
              </button>
              <button
                @click="activeTab = 'approved'"
                :class="[
                  'px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center',
                  activeTab === 'approved'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                ]"
              >
                <v-icon size="14" class="mr-1.5 opacity-70">mdi-check-circle-outline</v-icon>
                Approved
              </button>
            </div>

            <!-- Search field and controls moved to right side -->
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <div class="relative w-full sm:w-64">
                <v-icon class="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" size="16">mdi-magnify</v-icon>
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search Device..."
                  class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div class="relative">
                <button 
                  @click="toggleFilters" 
                  class="flex items-center gap-2 h-10 px-4 text-xs font-bold uppercase tracking-widest rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 transition-colors shadow-sm bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-slate-300"
                >
                  <v-icon size="16">mdi-filter</v-icon>
                  Filters
                </button>
                <span v-if="hasActiveFilters" class="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-900 block"></span>
              </div>
            </div>
          </div>

          <!-- Removed extra buttons for standard tabular mapping -->
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-icon
              size="small"
              class="me-2"
              @click.stop="editItem(item)"
              title="Edit"
            >
              mdi-pencil
            </v-icon>
          </div>
        </template>
      </v-data-table>
      <CustomPagination
        v-model:page="page"
        v-model:itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>

    <!-- Right Filter Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Advanced Filters</h3>
            <v-btn icon @click="toggleFilters">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="filter-content">
          <v-select
            v-model="filters.branch"
            :items="branchOptions"
            label="Branch"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
            persistent-placeholder
          >
            <template v-slot:selection="{ item }">
              {{ item.title }}
            </template>
          </v-select>

          <v-select
            v-model="filters.controllerType"
            :items="['1', '2', '3', '4']"
            label="Controller Type"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
          ></v-select>
          <div class="filter-actions">
            <v-btn color="error" variant="text" @click="clearFilters">
              Clear
            </v-btn>
            <v-btn color="primary" @click="applyFilters" class="ms-2">
              Apply
            </v-btn>
          </div>
        </div>
      </div>
    </transition>

    <UnApprovedDevicesForm
      v-if="showForm"
      :is-editing="isEditing"
      :device-data="editedItem"
      :tenant-id="tenantId"
      @save-success="handleSaveSuccess"
      @cancel="showForm = false"
    />
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, reactive, ref, watch } from "vue";
import UnApprovedDevicesForm from "./unApprovedForm.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

const headers = ref([
  {
    title: "Image",
    key: "controllerImage",
    align: "start",
    sortable: false,
    width: "80px",
  },
  {
    title: "Device Name",
    key: "controllerName",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Status",
    key: "status",
    align: "start",
    sortable: true,
    width: "120px",
  },
  {
    title: "Controller Status",
    key: "controllerStatus",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Device Type",
    key: "controllerType",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Door Name",
    key: "assignedDoor.doors_id.doorName",
    align: "start",
    sortable: true,
    width: "150px",
    value: (item) => {
      const doorName = item.assignedDoor?.[0]?.doors_id?.doorName || "";
      const doorNumber = item.assignedDoor?.[0]?.doors_id?.doorNumber || "";
      return doorName && doorNumber
        ? `${doorName}-${doorNumber}`
        : doorName || doorNumber;
    },
  },

  {
    title: "Door Mode",
    key: "doorMode",
    align: "start",
    sortable: true,
    width: "120px",
  },
  {
    title: "Timer Mode",
    key: "timerMode",
    align: "start",
    sortable: true,
    width: "120px",
  },
  {
    title: "Interlock Mode",
    key: "interlockMode",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Serial Number",
    key: "sn",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Branch",
    key: "branch.branchName",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Device Group",
    key: "deviceGroup",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Company",
    key: "tenant.tenantName",
    align: "start",
    sortable: true,
    width: "150px",
  },
]);

const showFilters = ref(false);
const search = ref("");
const selected = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});

const items = ref([]);
const loading = ref(false);
const branchOptions = ref([]);
const activeTab = ref("all");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

var userRole;

const filters = reactive({
  branch: [],
  controllerStatus: [],
  controllerType: [],
  dateFrom: "",
  dateTo: "",
});
const aggregateCount = async (tabStatus) => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      ...filterParams(tabStatus),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?${queryString}`,
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
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};

const fetchDeviceData = async (tabStatus = "") => {
  await aggregateCount(tabStatus);

  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    userRole = userDetails.role?.name;

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    loading.value = true;
    const params = {
      fields: [
        "assignedDoor.doors_id.doorNumber",
        "assignedDoor.doors_id.doorName",
        "assignedDoor.doors_id.id",
        "id",
        "controllerIP",
        "serverIp",
        "controllerStatus",
        "controllerName",
        "controllerImage.id",
        "controllerImage.type",
        "controllerImage.title",
        "status",
        "controllerType",
        "assignedDoor.id",
        "doorMode",
        "timerMode",
        "interlockMode",
        "time_difference",
        "interval",
        "parkingMode",
        "attendanceMode",
        "sn",
        "antiPassbackMode",
        "tenant.tenantId",
        "tenant.tenantName",
        "branch.branchName",
        "branch.id",
        "deviceGroup",
        "date_created",
      ],
      ...filterParams(tabStatus),
      sort: "-date_created",
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
      `${import.meta.env.VITE_API_URL}/items/controllers?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const itemsWithImages = await Promise.all(
      data.data.map(async (item) => {
        if (item.controllerImage?.id) {
          item.controllerImage.url = await getImageUrl(item.controllerImage.id);
        }
        return item;
      }),
    );

    items.value = itemsWithImages;
  } catch (error) {
    console.error("Error fetching device data:", error);
  } finally {
    loading.value = false;
  }
};

const filterParams = (tabStatus) => {
  const params = { "filter[tenant][tenantId][_eq]": tenantId };

  if (tabStatus === "approved") {
    params["filter[status][_eq]"] = "approved";
  } else if (tabStatus === "unApproved") {
    params["filter[status][_eq]"] = "unApproved";
  }
  if (filters.branch.length) {
    params["filter[branch][branchName][_eq]"] = filters.branch;
  }
  if (filters.controllerType.length) {
    params["filter[controllerType][_eq]"] = filters.controllerType;
  }
  return params;
};
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchDeviceData(newPage);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;

  fetchDeviceData(newItemsPerPage);
};

const getStatusCount = (status) => {
  if (!hasActiveFilters.value && selectedStatus.value === "all") {
    return 0;
  }
};

const hasActiveFilters = computed(() => {
  return filters.branch.length > 0 || filters.controllerType.length > 0;
});

const getControllerStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "successful":
      return "success";
    case "failed":
      return "error";
    case "waiting":
      return "warning";
    default:
      return "grey";
  }
};

const getControllerStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "successful":
      return "mdi-check-circle";
    case "failed":
      return "mdi-alert-circle";
    case "waiting":
      return "mdi-clock-outline";
    default:
      return "mdi-help-circle";
  }
};
const getImageUrl = async (imageId) => {
  const token = authService.getToken();

  if (!token) {
    console.error("Authentication token is missing.");
    return null;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${imageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};
const toggleFiltersfalse = () => {
  showFilters.value = false;
};
const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
};

const applyFilters = () => {
  showFilters.value = false;
};

const showAddDeviceForm = () => {
  isEditing.value = false;
  editedItem.value = {};
  showForm.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = JSON.parse(JSON.stringify(item));
  showForm.value = true;
};
const handleSaveSuccess = () => {
  showForm.value = false;
  fetchDeviceData();
};

const deleteItem = async (item) => {
  if (confirm("Are you sure you want to delete this device?")) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/controllers/${item.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete device");
      }

      const index = deviceData.value.findIndex((dev) => dev.id === item.id);
      if (index !== -1) {
        deviceData.value.splice(index, 1);
      }

      alert("Device deleted successfully");
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("An error occurred while deleting the device");
    }
  }
};

const deleteSelected = async () => {
  if (!selected.value.length) {
    alert("Please select items to delete");
    return;
  }

  const itemsToDelete = selected.value
    .map((item) => {
      return typeof item === "number" ? item.id : item;
    })
    .filter((id) => id !== undefined);

  if (
    confirm(
      `Are you sure you want to delete ${itemsToDelete.length} selected device(s)?`,
    )
  ) {
    try {
      const deletePromises = itemsToDelete.map((id) =>
        fetch(`${import.meta.env.VITE_API_URL}/items/controllers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }),
      );

      const responses = await Promise.all(deletePromises);

      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        deviceData.value = deviceData.value.filter(
          (dev) => !itemsToDelete.includes(dev.id),
        );

        selected.value = [];
        alert("Selected devices deleted successfully");
      } else {
        throw new Error("Some devices could not be deleted");
      }
    } catch (error) {
      console.error("Error deleting selected devices:", error);
      alert("An error occurred while deleting the selected devices");
    }
  }
};

const fetchBranchOptions = async () => {
  const token = authService.getToken();
  const tenantId = await currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    console.error("Authentication required or tenant not found");
    return;
  }

  try {
    const params = new URLSearchParams({
      "filter[tenant][tenantId][_eq]": tenantId,
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch branch options");
    }

    const data = await response.json();
    branchOptions.value = data.data.map((b) => b.branchName);
  } catch (error) {
    console.error("Error fetching branch options:", error);
  }
};
watch(
  [search, filters],
  () => {
    fetchDeviceData();
  },
  {
    deep: true,
  },
);
watch(activeTab, (newTab) => {
  fetchDeviceData(newTab === "all" ? "" : newTab);
});
onMounted(async () => {
  fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value);
  fetchBranchOptions();
});
const getDefaultImageForController = (controllerName) => {
  switch (controllerName) {
    case "AI face":
      return "/deviceImages/Aiface.jpg";
    case "finger print":
      return "/deviceImages/FingerPrint.jpg";
    case "4 door device":
      return "/deviceImages/DoorDevice.jpg";
    default:
      return null;
  }
};
</script>

<style scoped>
.device-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.main-content.with-filter {
  margin-right: 300px;
}

.search-field {
  max-width: 300px;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}

/* #1e40b0 */
::v-deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;
  /* font-weight: bold; */
  text-align: start;
  z-index: 1;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
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

/* Left tabs styling */
.left-tabs {
  display: flex;
  gap: 8px;
}

.left-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f0f0;
  color: #666;
}

.left-tabs button.active {
  background-color: black;
  color: white;
}

/* filter design */
.v-chip {
  font-weight: 600;
}

.position-relative {
  position: relative;
}

.filter-indicator {
  position: absolute;
  top: 2px;
  right: 3px;
  width: 14px;
  height: 14px;
  background-color: #ff0000;
  border-radius: 50%;
  border: 2px solid white;
  pointer-events: none;
}

.filter-content::-webkit-scrollbar {
  width: 8px;
}

.filter-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.filter-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.filter-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.filter-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e0e0e0;
  position: fixed;
  right: 0;
  top: 64px;
  height: calc(100vh - 64px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

.filter-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
}

.filter-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  bottom: 0;
}
</style>

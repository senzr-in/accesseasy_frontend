<template>
  <div class="main-container">
    <!-- Main Content -->
    <div class="locations-container" :class="{ 'sidebar-open': showSidebar }">
      <DataTableWrapper
        :is-empty="!loading && !error && locations.length === 0"
        :has-error="!!error"
        :is-loading="loading"
        :search-query="searchQuery"
        @update:search-query="debouncedSearch"
        search-placeholder="Search Sites..."
        wrapper-class="attendance-table-wrapper"
      >
        <!-- Custom Toolbar with Stats and Create Button -->
        <template #toolbar-actions>
          <div class="toolbar-with-stats">
            <!-- Create Button -->
            <BaseButton
              variant="primary"
              text="Create Site"
              :leftIcon="Plus"
              width="100px"
              @click="toggleSidebar('add')"
            />
          </div>
        </template>

        <!-- Loading -->
        <SkeletonLoading
          v-if="loading"
          variant="data-table"
          :rows="6"
          :columns="8"
          :animated="true"
        />

        <!-- Non-loading content -->
        <template v-else>
          <!-- Error -->
          <ErrorState
            v-if="error"
            title="Unable to load locations"
            :message="error"
            :retry-action="{ text: 'Try Again', icon: RefreshCw }"
            @retry="fetchLocations"
          />

          <!-- Empty -->
          <EmptyState
            v-else-if="locations.length === 0"
            title="No locations available"
            message="No locations have been added yet."
            :show-default-actions="true"
          >
            <template #actions>
              <BaseButton
                variant="primary"
                text="Add Your First Location"
                width="200px"
                @click="toggleSidebar('add')"
              />
            </template>
          </EmptyState>

          <!-- Table -->
          <DataTable
            v-else
            :items="paginatedItems"
            :columns="columns"
            :selected-items="selected"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            item-key="id"
            :row-clickable="true"
            @update:selected-items="selected = $event"
            @update:sort-by="sortBy = $event"
            @update:sort-direction="sortDirection = $event"
            @row-click="editItem"
          >
            <!-- Location -->
            <template #cell-location="{ item }">
              <div class="location-info">
                <div class="location-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div class="location-details">
                  <span class="location-name">{{ item.locationName }}</span>
                  <span v-if="item.pincodes" class="location-pincode"
                    >PIN: {{ item.pincodes }}</span
                  >
                </div>
              </div>
            </template>

            <!-- Organization -->
            <template #cell-organization="{ item }">
              <span
                class="org-badge"
                :class="item.orgName ? 'org-assigned' : 'org-unassigned'"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <template v-if="item.orgName">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </template>
                  <template v-else>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </template>
                </svg>
                {{ item.orgName || "Unassigned" }}
              </span>
            </template>

            <!-- Address -->
            <template #cell-address="{ item }">
              <span class="address-text">{{
                item.address || "No address"
              }}</span>
            </template>

            <!-- Contact Person -->
            <template #cell-contactPerson="{ item }">
              <span class="contact-text">{{
                item.contactPerson || "No contact"
              }}</span>
            </template>

            <!-- Contact Number -->
            <template #cell-contactNumber="{ item }">
              <span class="contact-text">{{
                item.contactNumber || "No number"
              }}</span>
            </template>

            <!-- Radius -->
            <template #cell-radius="{ item }">
              <span class="radius-text">{{ item.radius || "N/A" }} m</span>
            </template>

            <!-- Coordinates -->
            <template #cell-coordinates="{ item }">
              <div class="coordinates-info">
                <span class="coordinate-badge lat">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {{ toFixedNumber(item.lat, 4) }}
                </span>
                <span class="coordinate-badge lng">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                    />
                  </svg>
                  {{ toFixedNumber(item.lng, 4) }}
                </span>
              </div>
            </template>

            <!-- Actions -->
            <template #cell-actions="{ item }">
              <ActionBtn
                :icon="Edit"
                variant="secondary"
                size="100px"
                tooltip="Edit Location"
                @click="editItem(item)"
              />
            </template>

            <!-- Optional slots for built-in states -->
            <template #empty-state>
              <EmptyState
                title="No locations found"
                message="Try adding a new location."
                :show-default-actions="true"
              >
                <template #actions>
                  <BaseButton
                    variant="primary"
                    text="Add Location"
                    width="160px"
                    @click="toggleSidebar('add')"
                  />
                </template>
              </EmptyState>
            </template>
          </DataTable>
        </template>

        <!-- Pagination -->
        <template #pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>

    <!-- Sidebar for Add/Edit Location -->
    <div class="sidebar" :class="{ active: showSidebar }">
      <div class="sidebar-content">
        <CreateSiteForm
          v-if="sidebarMode === 'add'"
          @close="toggleSidebar"
          @saved="handleAddSuccess"
        />
        <EditSiteForm
          v-if="sidebarMode === 'edit'"
          :location-id="selectedLocationId"
          @close="toggleSidebar"
          @update="handleEditSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/WorkOrdeForm_Components/form/ErrorState.vue";
import ActionBtn from "@/components/common/buttons/ActionButton.vue";
import { Edit, Plus, RefreshCw } from "lucide-vue-next";
import CreateSiteForm from "./org_addlocation.vue";
import EditSiteForm from "./org_editlocation.vue";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// State
const loading = ref(false);
const error = ref(null);
const locations = ref([]);
const searchQuery = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const sortBy = ref("");
const sortDirection = ref("asc");
const selected = ref([]);
const showSidebar = ref(false);
const sidebarMode = ref("add");
const selectedLocationId = ref(null);

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const API_ENDPOINT = `/items/locationManagement?fields[]=orgLocation.orgName,locSize,locType,locdetail,locmark,state,id,contactDetails&filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][locType][_null]=true`;

// Filters
const filters = ref({
  type: "",
  organization: "",
});

// Computed properties
const locationStats = computed(() => {
  const allLocations = locations.value;
  return {
    total: allLocations.length,
    branch: allLocations.filter((l) => l.locType === "branch").length,
    serviceable_area: allLocations.filter(
      (l) => l.locType === "serviceable_area",
    ).length,
  };
});

const filteredItems = computed(() => {
  let filtered = locations.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      return (
        (item.locationName &&
          item.locationName.toLowerCase().includes(query)) ||
        (item.locType && item.locType.toLowerCase().includes(query)) ||
        (item.orgName && item.orgName.toLowerCase().includes(query)) ||
        (item.address && item.address.toLowerCase().includes(query)) ||
        (item.pincodes && item.pincodes.toLowerCase().includes(query)) ||
        (item.contactPerson &&
          item.contactPerson.toLowerCase().includes(query)) ||
        (item.contactNumber &&
          item.contactNumber.toLowerCase().includes(query)) ||
        (item.radius && item.radius.toString().toLowerCase().includes(query))
      );
    });
  }

  if (sortBy.value) {
    filtered.sort((a, b) => {
      const valA = a[sortBy.value] || "";
      const valB = b[sortBy.value] || "";
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection.value === "desc"
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }
      return sortDirection.value === "desc" ? valB - valA : valA - valB;
    });
  }

  return filtered;
});

const totalItems = computed(() => filteredItems.value.length);

const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

// Columns
const columns = [
  {
    key: "orgName",
    label: "Clients",
    sortable: false,
    width: "180px",
  },
  {
    key: "locationName",
    label: "Site Name",
    sortable: false,
    width: "200px",
  },
  {
    key: "address",
    label: "Address",
    width: "300px",
  },
  {
    key: "contactPerson",
    label: "Contact Person",
    width: "150px",
  },
  {
    key: "contactNumber",
    label: "Contact Number",
    width: "150px",
  },
  {
    key: "radius",
    label: "Radius",
    width: "100px",
  },
  {
    key: "coordinates",
    label: "Coordinates",
    width: "200px",
  },
  {
    key: "actions",
    label: "Actions",
    width: "200px",
  },
];

// Utility Methods
const toFixedNumber = (num, digits = 4) => {
  const n = parseFloat(num);
  return Number.isFinite(n) ? n.toFixed(digits) : "--";
};

const toggleSidebar = (mode = "add") => {
  showSidebar.value = !showSidebar.value;
  sidebarMode.value = mode;
  if (!showSidebar.value) {
    selectedLocationId.value = null;
  }
};

const handleAddSuccess = () => {
  showSidebar.value = false;
  sidebarMode.value = "";
  fetchLocations();
};

const handleEditSuccess = () => {
  showSidebar.value = false;
  selectedLocationId.value = null;
  sidebarMode.value = "";
  fetchLocations();
};

const editItem = (item) => {
  selectedLocationId.value = item.id;
  sidebarMode.value = "edit";
  showSidebar.value = true;
};

const debouncedSearch = (value) => {
  searchQuery.value = value;
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    page.value = 1;
    fetchLocations();
  }, 300);
};

const searchTimeout = ref(null);

const clearSearch = () => {
  searchQuery.value = "";
  page.value = 1;
  fetchLocations();
};

// API Methods
const fetchLocations = async () => {
  loading.value = true;
  error.value = null;
  try {
    let url = `${API_BASE_URL}${API_ENDPOINT}`;
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();

      url += `&filter[_and][1][_or][1][locType][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][1][_or][2][orgLocation][orgName][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][1][_or][3][locdetail][address][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][1][_or][4][locdetail][pincodes][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][1][_or][5][contactDetails][contactPerson][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][1][_or][6][contactDetails][contactNumber][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][1][_or][7][locSize][_icontains]=${encodeURIComponent(query)}`;
    }

    url += `&limit=${itemsPerPage.value}`;
    url += `&offset=${(page.value - 1) * itemsPerPage.value}`;

    if (sortBy.value) {
      url += `&sort=${sortDirection.value === "desc" ? "-" : ""}${sortBy.value}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    locations.value = transformApiData(data.data || data);

    // Fetch total count
    let countUrl = `${API_BASE_URL}/items/locationManagement?`;
    countUrl += `filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`;
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();

      countUrl += `&filter[_and][1][_or][1][locType][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][1][_or][2][orgLocation][orgName][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][1][_or][3][locdetail][address][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][1][_or][4][locdetail][pincodes][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][1][_or][5][contactDetails][contactPerson][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][1][_or][6][contactDetails][contactNumber][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][1][_or][7][locSize][_icontains]=${encodeURIComponent(query)}`;
    }
    countUrl += `&aggregate[count]=id`;

    const countResponse = await fetch(countUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (countResponse.ok) {
      const countData = await countResponse.json();
      totalItems.value = countData?.data?.[0]?.count?.id || 0;
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    error.value = "Failed to fetch locations. Please try again.";
  } finally {
    loading.value = false;
  }
};

const deleteLocations = async (ids) => {
  try {
    const deletePromises = ids.map((id) =>
      fetch(`${API_BASE_URL}/items/locationManagement/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    );

    await Promise.all(deletePromises);
    locations.value = locations.value.filter(
      (location) => !ids.includes(location.id),
    );
    return true;
  } catch (error) {
    console.error("Error deleting locations:", error);
    throw error;
  }
};

const formatLocationType = (type) => {
  switch (type) {
    case "branch":
      return "Branch";
    case "serviceable_area":
      return "Serviceable Area";
    default:
      return "Unknown";
  }
};

const transformApiData = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.warn("API data is not an array:", apiData);
    return [];
  }

  return apiData.map((item) => ({
    id: item.id,
    // Add locationName from locdetail
    locationName: item.locdetail?.locationName || "Unnamed Location",
    locType: item.locType || null,
    state: item.state || "N/A",
    orgName: item.orgLocation?.orgName || "Unassigned",
    address: item.locdetail?.address || "N/A",
    pincodes: item.locdetail?.pincodes?.join(", ") || "N/A",
    contactPerson: item.contactDetails?.contactPerson || "N/A",
    contactNumber: item.contactDetails?.contactNumber || "N/A",
    radius: item.locSize || "N/A",
    lat: item.locmark?.coordinates?.[1] || 0,
    lng: item.locmark?.coordinates?.[0] || 0,
    dateCreated: item.date_created,
    tenant: item.tenant,
    orgLocation: item.orgLocation,
    empIds: item.empIds,
    locSize: item.locSize,
    originalData: item,
  }));
};

// Event Handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchLocations();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchLocations();
};

// Lifecycle
onMounted(() => {
  fetchLocations();
});

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});
</script>

<style scoped>
/* Main Container */
.main-container {
  display: flex;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

/* Locations Container (Main Content) */
.locations-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  transition: margin-right 0.3s ease;
}

.locations-container.sidebar-open {
  margin-right: 400px; /* Adjust based on sidebar width */
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 700px;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 10000;
  /* overflow-y: auto; */
}

.sidebar.active {
  transform: translateX(0);
}

.sidebar-content {
  padding: 20px;
}

/* Toolbar with Stats */
.toolbar-with-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* Location Info */
.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow: hidden;
}

.location-icon {
  display: flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 0px;
  min-width: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.location-name {
  font-weight: 600;
  color: #111827;
  font-size: 13px;
  line-height: 1.1;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-pincode {
  font-size: 10px;
  color: #6b7280;
  line-height: 1.1;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Type Badge */
.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid #e5e7eb;
  color: #111827;
  background: #f3f4f6;
  white-space: nowrap;
  margin: 0;
  height: 20px;
  box-sizing: border-box;
}

.type-badge.type-branch {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.type-badge.type-serviceable_area {
  background: #ecfeff;
  color: #0e7490;
  border-color: #a5f3fc;
}

.type-badge.type-null,
.type-badge.type-unknown {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}

/* Organization Badge */
.org-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  height: 20px;
  box-sizing: border-box;
}

.org-badge.org-unassigned {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #9f1239;
}

.org-badge.org-assigned {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #14532d;
}

.org-badge svg {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin: 0;
  padding: 0;
}

/* Address, Contact, and Radius Text */
.address-text,
.contact-text,
.radius-text {
  color: #374151;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  margin: 0;
  padding: 0;
}

.radius-text {
  max-width: 100px;
}

/* Coordinates Info */
.coordinates-info {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.coordinate-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  white-space: nowrap;
  margin: 0;
  height: 18px;
  box-sizing: border-box;
}

.coordinate-badge svg {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin: 0;
  padding: 0;
}

/* .coordinate-badge.lat {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.coordinate-badge.lng {
  background: #ddd6fe;
  border-color: #c4b5fd;
  color: #5b21b6;
} */

/* Responsive */
@media (max-width: 1024px) {
  .locations-container.sidebar-open {
    margin-right: 0;
  }

  .sidebar {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .toolbar-with-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .sidebar {
    width: 100%;
  }

  .sidebar-content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .locations-container {
    padding: 10px;
  }

  .sidebar-content {
    padding: 10px;
  }
}
</style>

```vue
<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <!-- Page Header -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
      <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
        Branches
      </h1>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search branches..."
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          @input="handleSearch"
        >
      </div>
      <button
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 dark:bg-white dark:bg-slate-900 text-white dark:text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shrink-0"
        @click="createLocation"
      >
        <Plus class="w-4 h-4" /> Create Branch
      </button>
    </div>

    <!-- Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto overflow-y-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative min-w-[800px]">
          <thead class="bg-slate-50 dark:hover:bg-zinc-800 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Location Name
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Address
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                State
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Coordinates
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <!-- Loading -->
            <tr v-if="loading">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </td>
            </tr>

            <!-- Error -->
            <tr v-else-if="error">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <AlertCircle class="w-10 h-10 text-rose-300 dark:text-rose-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">
                    {{ error }}
                  </p>
                  <button
                    class="text-xs font-bold text-blue-500 hover:underline"
                    @click="fetchLocations"
                  >
                    Try Again
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="locations.length === 0">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <Building2 class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    No branches found.
                  </p>
                  <button
                    v-if="searchQuery"
                    class="text-xs font-bold text-blue-500 hover:underline"
                    @click="searchQuery = ''; debouncedSearch = ''; handleSearch()"
                  >
                    Clear search
                  </button>
                  <button
                    v-else
                    class="h-9 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 dark:bg-slate-950 text-white dark:text-slate-900 dark:text-slate-100 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    @click="createLocation"
                  >
                    <Plus class="w-4 h-4 inline mr-1" /> Add First Branch
                  </button>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="item in paginatedItems"
              v-else
              :key="item.id"
              class="group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <td class="px-5 py-3 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0">
                    <MapPin class="h-4 w-4" />
                  </div>
                  <div>
                    <span class="text-[13px] font-semibold text-slate-800 dark:text-white block">{{ item.locationName || 'Unnamed' }}</span>
                    <p
                      v-if="item.pincodes"
                      class="text-[11px] text-slate-400 font-mono mt-0.5"
                    >
                      PIN: {{ item.pincodes }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 max-w-[250px] truncate">
                <span
                  class="text-[12px] font-medium text-slate-500 dark:text-slate-400 block truncate"
                  :title="item.address"
                >{{ item.address || '—' }}</span>
              </td>
              <td class="px-5 py-3 whitespace-nowrap">
                <span class="text-[12px] font-medium text-slate-500 dark:text-slate-400">{{ item.state || '—' }}</span>
              </td>
              <td class="px-5 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500" /> {{ toFixedNumber(item.lat, 4) }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500" /> {{ toFixedNumber(item.lng, 4) }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3 text-right whitespace-nowrap">
                <div class="flex justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                  <button
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-slate-200 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors shadow-sm"
                    @click="() => { selectedItem = item; handleEdit(); }"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:hover:bg-zinc-800 shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:bg-slate-900 dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-3">
          <span>Page {{ page }} of {{ totalPages || 1 }}</span>
          <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
          <span>{{ locations.length }} total</span>
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:bg-slate-900 dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
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
import { Edit, Plus, Search, Building2, MapPin, Loader2, AlertCircle } from "lucide-vue-next";

const tenantId = currentUserTenant.getTenantId();

const router = useRouter();
const token = authService.getToken();

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const API_ENDPOINT = `/items/locationManagement?fields[]=orgLocation.orgName,locSize,locType,locdetail,locmark,state,id&filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][locType][_eq]=branch`;

// Reactive variables
const page = ref(1);
const itemsPerPage = ref(25);
const selected = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const deleteDialog = ref(false);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const locations = ref([]);
const searchQuery = ref(""); // Change from search to searchQuery for clarity
const debouncedSearch = ref("");
// Sorting state
const sortBy = ref("locationName");
const sortDirection = ref("asc");
let searchTimeout = null;
// Filters
const filters = ref({
  type: "",
  organization: "",
});
const toFixedNumber = (num, digits = 4) => {
  const n = parseFloat(num);
  return Number.isFinite(n) ? n.toFixed(digits) : "--";
};
const dialogVisible = ref(false); // New: Controls dialog visibility
const selectedItem = ref(null);
const openDialog = (item) => {
  selectedItem.value = item; // Store the selected item
  dialogVisible.value = true; // Open the dialog
};
const handleSearch = () => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Set new timeout
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = searchQuery.value;
    page.value = 1; // Reset to first page when searching
  }, 300); // 300ms debounce
};
const handleEdit = () => {
  if (selectedItem.value) {
    router.push({
      name: "branch-configuration-edit",
      params: { id: selectedItem.value.id },
    });
    dialogVisible.value = false; // Close dialog after action
  }
};

// API Methods
const fetchLocations = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
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

    // 🔍 Log raw response from API
    console.log("Raw API data:", data);

    // Transform
    locations.value = transformApiData(data.data || data);

    // 🔍 Log transformed locType values
    console.log(
      "Transformed locTypes:",
      locations.value.map((l) => l.locType),
    );

    console.log("Locations fetched successfully:", locations.value.length);
  } catch (error) {
    console.error("Error fetching locations:", error);
    errorMessage.value = "Failed to fetch locations. Please try again.";
    showErrorAlert.value = true;
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

const columns = [
  {
    key: "locationName",
    label: "Location Name",
    sortable: false,
    width: "20px",
  },
  // {
  //   key: "locType",
  //   label: "Type",
  //   sortable: false,
  //   width: "120px",
  // },
  // {
  //   key: "orgName",
  //   label: "Organization",
  //   sortable: false,
  //   width: "180px",
  // },
  {
    key: "address",
    label: "Address",
    width: "30px",
  },
  {
    key: "state",
    label: "State",
    width: "30px",
  },
  {
    key: "coordinates",
    label: "Coordinates",
    width: "20px",
  },
  {
    key: "actions",
    label: "Actions",
    width: "20px",
  },
];

// Data transformation function
const transformApiData = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.warn("API data is not an array:", apiData);
    return [];
  }

  return apiData.map((item) => ({
    id: item.id,
    locationName: item.locdetail?.locationName || "N/A",
    locType: item.locType || "unknown",
    state: item.state || "N/A",
    orgName: item.orgLocation?.orgName || "Unassigned",
    address: item.locdetail?.address || "N/A",
    pincodes: item.locdetail?.pincodes?.join(", ") || "N/A", // Join pincodes array
    lat: item.locmark?.coordinates?.[1] || 0, // Latitude is the second value
    lng: item.locmark?.coordinates?.[0] || 0, // Longitude is the first value
    dateCreated: item.date_created,
    tenant: item.tenant,
    orgLocation: item.orgLocation,
    empIds: item.empIds,
    locSize: item.locSize,
    originalData: item,
  }));
};
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

const hasActiveFilters = computed(() => {
  return (
    filters.value.type !== "" ||
    filters.value.organization !== "" ||
    search.value !== ""
  );
});

const filteredItems = computed(() => {
  let filtered = locations.value;

  // Apply search filter from DataTableWrapper
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      // Search across multiple fields
      return (
        (item.locationName &&
          item.locationName.toLowerCase().includes(query)) ||
        (item.locType && item.locType.toLowerCase().includes(query)) ||
        (item.orgName && item.orgName.toLowerCase().includes(query)) ||
        (item.address && item.address.toLowerCase().includes(query)) ||
        (item.pincodes && item.pincodes.toLowerCase().includes(query))
      );
    });
  }

  // Apply type filter
  if (filters.value.type) {
    filtered = filtered.filter((item) => item.locType === filters.value.type);
  }

  // Apply organization filter
  if (filters.value.organization) {
    if (filters.value.organization === "assigned") {
      filtered = filtered.filter(
        (item) => item.orgName && item.orgName !== "Unassigned",
      );
    } else if (filters.value.organization === "unassigned") {
      filtered = filtered.filter(
        (item) => !item.orgName || item.orgName === "Unassigned",
      );
    }
  }

  // Apply sorting
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

// Utility Methods

const applyFilters = () => {
  page.value = 1;
};

const clearSearch = () => {
  searchQuery.value = "";
  debouncedSearch.value = "";
};
// Event Handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
};

const editItem = (item) => {
  router.push({
    name: "branch-configuration-edit",
    params: { id: item.id },
  });
};

const createLocation = () => {
  // Check if route exists
  const route = router.resolve({ name: "branch-configuration-add" });
  if (route) {
    router.push({ name: "branch-configuration-add" });
  } else {
    console.error("Route not found");
  }
};

// Lifecycle
onMounted(() => {
  fetchLocations();
});
</script>
```

<template>
  <div v-if="!showReport" class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :items-per-page="10"
        class="elevation-1 employee-table"
        height="calc(90vh - 190px)"
        show-select
        fixed-header
        @click:row="(event, { item }) => editItem(item)"
      >
        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <v-text-field
              v-model="search"
              label="Search Department"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <!-- <v-btn color="primary" @click="toggleFilters" class="ms-2">
                <v-icon start>mdi-filter</v-icon>
                Filters
              </v-btn> -->
            <v-btn color="black" class="ms-2" @click="showReport = true">
              <v-icon start>mdi-plus</v-icon>
              GenrateReport
            </v-btn>
          </div>
        </template>
      </v-data-table>
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
            v-model="filters.status"
            :items="statusOptions"
            label="Status"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
          ></v-select>

          <v-select
            v-model="filters.tenant"
            :items="tenantOptions"
            label="Tenant"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
          ></v-select>

          <v-select
            v-model="filters.branch"
            :items="branchOptions"
            label="Branch"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
          ></v-select>

          <p class="text-subtitle-2 mb-2">Date Range</p>
          <v-text-field
            v-model="filters.dateFrom"
            label="From"
            type="date"
            variant="outlined"
            density="compact"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="filters.dateTo"
            label="To"
            type="date"
            variant="outlined"
            density="compact"
            class="mb-4"
          ></v-text-field>

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
  </div>
  <generate-report v-else @closeAddPage="showReport = false" />
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import GenerateReport from "./employeeReportGen.vue";
const showReport = ref(false);
const editedItem = ref({});
const showEditPage = ref(false);
const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const totalItems = ref(0);
const options = ref({ page: 1, itemsPerPage: 50 });

// Filter options
const filters = ref({
  status: [],
  tenant: [],
  branch: [],
  dateFrom: "",
  dateTo: "",
});

// Status options
const statusOptions = ["assigned", "unassigned"];

// Table headers
const headers = [
  { title: "Collection Name", key: "collectionName", width: "200px" },
  { title: "Branch Name", key: "branch.branchName", width: "150px" },
  { title: "GenratedBy", key: "user_created.first_name", width: "200px" },
  { title: "Generated File Title", key: "generatedFile.title", width: "200px" },
  {
    title: "Generate Automatically",
    key: "generateAutomatically",
    width: "150px",
  },
  { title: "Exporting Days", key: "exportingDays", width: "150px" },
  { title: "Tenant Name", key: "tenant.tenantName", width: "150px" },
];

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchTotalCount = async () => {
  try {
    const token = getToken();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/export?aggregate%5BcountDistinct%5D=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.[0]?.countDistinct || 0;
  } catch (error) {
    console.error("Error fetching total count:", error);
    throw new Error("Failed to fetch total count.");
  }
};

const fetchData = async () => {
  const token = getToken();

  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }
  const userDetails = await currentUserTenant.fetchLoginUserDetails();
  const tenantId = currentUserTenant.getTenantId();
  const userRole = userDetails.role?.name;
  loading.value = true;
  try {
    const { page, itemsPerPage } = options.value;

    const params = new URLSearchParams();

    // Add fields[] parameters
    [
      "branch",
      "branch.branchName",
      "collectionName",
      "generatedFile.title",
      "generateAutomatically",
      "exportingDays",
      "status",
      "user_created.first_name",
      "tenant.tenantName",
    ].forEach((field) => params.append("fields[]", field));

    // Add sort[] and pagination parameters
    params.append("sort[]", "-date_created");
    params.append("limit", String(itemsPerPage || 50));
    params.append("page", String(page || 1));
    if (userRole === "Manager" || userRole === "Admin") {
      params.append("filter[tenant][tenantId][_eq]", tenantId);
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/export?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Handle the exported data as needed
    items.value = data.data;
  } catch (error) {
    console.error("Error exporting data:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to export data. Please try again.";
  } finally {
    loading.value = false;
  }
};
const editItem = (item) => {
  console.log("Raw item:", item);

  // The main change: Format assignedDoors properly
  const formattedItem = {
    ...item,
  };

  console.log("Formatted item:", formattedItem);
  editedItem.value = formattedItem;
  showEditPage.value = true;
  emit("showEditPage", formattedItem);
};

// Computed properties
const filteredItems = computed(() => {
  let filtered = items.value;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.departmentName.toLowerCase().includes(searchLower) ||
        item.tenant?.tenantName.toLowerCase().includes(searchLower) ||
        (item.branch?.branchName || "").toLowerCase().includes(searchLower)
    );
  }

  if (filters.value.status.length) {
    filtered = filtered.filter((item) =>
      filters.value.status.includes(item.status)
    );
  }

  if (filters.value.branch.length) {
    filtered = filtered.filter(
      (item) =>
        item.branch && filters.value.branch.includes(item.branch.branchName)
    );
  }

  if (filters.value.dateFrom && filters.value.dateTo) {
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date_created);
      const fromDate = new Date(filters.value.dateFrom);
      const toDate = new Date(filters.value.dateTo);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }

  return filtered;
});

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  filters.value = {
    status: [],
    tenant: [],
    branch: [],
    dateFrom: "",
    dateTo: "",
  };
};

const startResize = (event, header) => {
  // Add resize logic here
  console.log("Resizing", header);
};

const applyFilters = () => {
  // Add filter apply logic here
  console.log("Applying filters", filters.value);
};

// Lifecycle hooks
onMounted(async () => {
  try {
    const count = await fetchTotalCount();
    totalItems.value = count;
    await fetchData();
  } catch (error) {
    console.error("Error during initialization:", error);
    showError.value = true;
    errorMessage.value = "Failed to initialize data. Please refresh the page.";
  }
});
</script>

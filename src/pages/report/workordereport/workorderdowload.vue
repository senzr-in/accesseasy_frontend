<template>
  <div v-if="!showReport" class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <v-data-table
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="-1"
        class="elevation-1 employee-table"
        height="calc(90vh - 190px)"
        show-select
        fixed-header
        @click:row="(event, { item }) => editItem(item)"
      >
        <template v-slot:item.status="{ item }">
          <v-icon color="green" @click="download(item.generatedFile)"
            >mdi-download</v-icon
          >
          download
        </template>

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
            <v-btn color="black" class="ms-2" @click="showReport = true">
              <v-icon start>mdi-plus</v-icon>
              Report
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <CustomPagination
        :page="page"
        :itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>
  </div>
  <generate-report v-else @closeAddPage="showReport = false" />
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import GenerateReport from "./workordergenerate.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";

const showReport = ref(false);
const editedItem = ref({});
const showEditPage = ref(false);
const selected = ref([]);
const items = ref([]);
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

const headers = [
  { title: "Collection Name", key: "collectionName", width: "200px" },
  { title: "Status", key: "status", width: "200px" },
  { title: "Branch Name", key: "branch.branchName", width: "150px" },
  { title: "GenratedBy", key: "user_created.first_name", width: "200px" },
  { title: "Generated File Title", key: "generatedFile.title", width: "200px" },
];

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/export?${queryString}`,
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

const fetchData = async () => {
  await aggregateCount();

  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;
  try {
    const params = {
      fields: [
        "id",
        "branch",
        "branch.branchName",
        "collectionName",
        "generatedFile.id",
        "generatedFile.title",
        "generateAutomatically",
        "exportingDays",
        "status",
        "user_created.first_name",
        "tenant.tenantName",
      ],
      ...filterParams(),
      sort: "date_created",
      page: page.value,
      limit: itemsPerPage.value,
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
      `${import.meta.env.VITE_API_URL}/items/export?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

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

const filterParams = () => ({
  "filter[tenant][tenantId][_eq]": tenantId,
  "filter[reportType][_in]": "LeaveReport,AbsentReport,PresentReport",
});
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData(newPage);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;

  fetchData(newItemsPerPage);
};

const download = async (file) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${file.id}`,
      {
        methods: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to download the report.");
    }

    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("failed to download file");
  }
};
const editItem = (item) => {
  const formattedItem = {
    ...item,
  };

  editedItem.value = formattedItem;
  showEditPage.value = true;
  emit("showEditPage", formattedItem);
};

onMounted(async () => {
  await fetchData();
});
</script>
<style scoped>
.employee-table :deep(tr th) {
  background-color: #ebeaea !important;
}
</style>

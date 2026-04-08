<template>
  <div class="door-container">
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
        class="elevation-1 door-table"
        height="calc(90vh - 190px)"
        fixed-header
        show-select
        @click:row="
          (event, { item }) => {
            if (userRole == 'Admin' || userRole == 'Manager') {
              editItem(item);
            }
          }
        "
      >
        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <v-text-field
              v-model="search"
              label="Search Door"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="black" class="ms-2" @click="showAddDoorForm">
              <v-icon start>mdi-plus</v-icon>
              Add Door
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

    <doorManagementForm
      v-if="showForm"
      :is-editing="isEditing"
      :door-data="editedItem"
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
import doorManagementForm from "./doorForm.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

// State management
const showFilters = ref(false);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const items = ref([]);
const loading = ref(false);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
var userRole;

const headers = ref([
  {
    title: "Door Number",
    key: "doorNumber",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Door Name",
    key: "doorName",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Door Type",
    key: "doorType",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Door Group",
    key: "doorGroup",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Assigned Department",
    key: "assignedDepts.departmentName",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Access Levels",
    key: "accessLevels",
    align: "start",
    sortable: true,
    width: "200px",
    value: (item) => {
      return item.accesslevels?.[0]?.accesslevels_id?.accessLevelName || "";
    },
  },
  {
    title: "Tenant Name",
    key: "tenant.tenantName",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Branch Name",
    key: "branch.branchName",
    align: "start",
    sortable: true,
    width: "200px",
  },
]);

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
      `${import.meta.env.VITE_API_URL}/items/doors?${queryString}`,
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

const fetchDoorData = async () => {
  await aggregateCount();

  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    userRole = userDetails.role?.name;

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    loading.value = true;
    const params = {
      fields: [
        "id",
        "doorNumber",
        "doorName",
        "assignedDepts",
        "status",
        "doorType",
        "doorGroup",
        "accesslevels.accesslevels_id.id",
        "assignedDepts.departmentName",
        "assignedDepts.id",
        "assignedDepartment.departmentId",
        "accesslevels.accesslevels_id.accessLevelName",
        "assignedDepts.id",
        "assignedAccessLevels.id",
        "tenant.tenantId",
        "tenant.tenantName",
        "branch.branchName",
        "branch.branchId",
        "branch.id",
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
      `${import.meta.env.VITE_API_URL}/items/doors?${queryString}`,
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
    items.value = data.data;
  } catch (error) {
    console.error("Error fetching door data:", error);
  } finally {
    loading.value = false;
  }
};

const filterParams = () => ({
  "filter[tenant][tenantId][_eq]": tenantId,
});

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchDoorData(newPage);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  fetchDoorData(newItemsPerPage);
};

const showAddDoorForm = () => {
  isEditing.value = false;
  editedItem.value = {};
  showForm.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = item;
  showForm.value = true;
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchDoorData();
};

const deleteSelected = async () => {
  if (!selected.value.length) {
    alert("Please select items to delete");
    return;
  }

  if (confirm(`Delete ${selected.value.length} selected door(s)?`)) {
    try {
      const deletePromises = selected.value.map((item) =>
        fetch(`${import.meta.env.VITE_API_URL}/items/doors/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }),
      );

      await Promise.all(deletePromises);
      items.value = items.value.filter(
        (door) => !selected.value.some((item) => item.id === door.id),
      );
      selected.value = [];
      alert("Selected doors deleted successfully");
    } catch (error) {
      console.error("Error deleting doors:", error);
      alert("Error deleting doors");
    }
  }
};

onMounted(async () => {
  await fetchDoorData();
});
</script>

<style scoped>
.door-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.main-content.with-filter {
  margin-right: 300px;
}

.search-field {
  max-width: 300px;
}

::v-deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;

  text-align: start;
  z-index: 1;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>

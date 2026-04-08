<template>
  <v-container fluid class="pa-4">
    <v-card class="elevation-3 rounded-lg">
      <v-card-title class="d-flex flex-wrap align-center py-4 px-6 bg-white">
        <v-icon size="29" color="primary" class="mr-3"
          >mdi-account-group</v-icon
        >
        <span class="text-h5 font-weight-bold">Employee Details</span>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search employees..."
          single-line
          hide-details
          filled
          rounded
          variant="outlined"
          density="compact"
          dense
          class="mt-3 mt-sm-0 mx-sm-2"
          style="max-width: 300px"
          @input="debouncedFetchEmployees"
        ></v-text-field>

        <v-select
          v-model="selectedDepartment"
          :items="[{ id: null, departmentName: 'All' }, ...departments]"
          label="Department"
          item-title="departmentName"
          item-value="id"
          hide-details
          filled
          rounded
          variant="outlined"
          density="compact"
          dense
          style="max-width: 200px"
          class="mt-3 mt-sm-0"
          @update:modelValue="fetchEmployees"
        ></v-select>

        <v-select
          v-model="selectedOrganization"
          :items="[{ id: null, orgName: 'All' }, ...organizations]"
          label="Organization"
          item-title="orgName"
          item-value="id"
          hide-details
          filled
          rounded
          variant="outlined"
          density="compact"
          dense
          style="max-width: 200px"
          class="mt-3 mt-sm-0 ml-sm-2"
          @update:modelValue="fetchEmployees"
        ></v-select>
      </v-card-title>

      <v-tabs v-model="activeTab" @update:modelValue="fetchEmployees">
        <v-tab value="unassigned" style="text-transform: none"
          >Unassigned Employees</v-tab
        >
        <v-tab value="assigned" style="text-transform: none"
          >Assigned Employees</v-tab
        >
      </v-tabs>

      <v-data-table
        :headers="headers"
        :items="employees"
        height="calc(82vh - 250px)"
        :loading="loading"
        class="elevation-1"
        hide-default-footer
        show-select
        :header-props="{ style: 'background-color: #f5f5f5' }"
      >
        <template v-slot:item.employeeId="{ item }">
          {{ item.employeeId || "N/A" }}
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-2">
              <span class="white--text text-subtitle-2">{{
                item.first_name?.charAt(0) || ""
              }}</span>
            </v-avatar>
            {{ item.first_name || "" }}
          </div>
        </template>

        <template v-slot:item.departmentName="{ item }">
          <v-chip
            v-if="item.departmentName"
            :color="getRandomColor(item.departmentName)"
            text-color="white"
            small
          >
            {{ item.departmentName }}
          </v-chip>
          <span v-else>Not Assigned</span>
        </template>

        <template v-slot:item.orgName="{ item }">
          <v-chip
            v-if="item.orgName"
            :color="getRandomColor(item.orgName)"
            text-color="white"
            small
          >
            {{ item.orgName }} ({{ item.orgType || "N/A" }})
          </v-chip>
          <span v-else>N/A</span>
        </template>

        <template v-slot:item.assign="{ item }">
          <v-switch
            v-model="item.isAssigned"
            color="success"
            hide-details
            inset
            @change="updateAssignment(item)"
            :loading="item.updating"
          ></v-switch>
        </template>
      </v-data-table>

      <CustomPagination
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :total-items="totalEmployees"
        class="mt-4"
      />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "../../../../../utils/pagination/CustomPagination.vue";

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  gradeName: {
    type: String,
    required: true,
  },
  updateAlteredData: {
    type: Function,
    required: true,
  },
});

const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalEmployees = ref(0);
const selectedDepartment = ref(null);
const selectedOrganization = ref(null);
const loading = ref(false);
const departments = ref([]);
const organizations = ref([]);
const employees = ref([]);
const activeTab = ref("unassigned");

let searchTimeout = null;

const headers = [
  { title: "Employee ID", align: "start", key: "employeeId", sortable: true },
  { title: "Employee Name", align: "start", key: "name", sortable: true },
  {
    title: "Department",
    align: "start",
    key: "departmentName",
    sortable: true,
  },
  { title: "Organization", align: "start", key: "orgName", sortable: true },
  { title: "Assign Template", align: "center", key: "assign", sortable: false },
];

const buildFilterParams = async () => {
  const tenantId = await currentUserTenant.getTenantId();
  const params = {
    "filter[assignedUser][tenant][_eq]": tenantId,
  };

  if (activeTab.value === "unassigned") {
    params["filter[config][_null]"] = "true";
  } else {
    params["filter[_and][0][config][id][_eq]"] = props.config.id;
  }

  if (selectedDepartment.value) {
    params["filter[department][id][_eq]"] = selectedDepartment.value;
  }

  if (selectedOrganization.value) {
    params["filter[_and][0][assignedUser][organization][id][_eq]"] =
      selectedOrganization.value;
  }

  if (search.value) {
    params["filter[_or][0][assignedUser][first_name][_icontains]"] =
      search.value;
    params["filter[_or][1][employeeId][_icontains]"] = search.value;
  }

  return params;
};

const fetchEmployeeAggregateCount = async () => {
  try {
    const token = authService.getToken();
    const filterParams = await buildFilterParams();

    const params = new URLSearchParams({
      ...filterParams,
      "aggregate[count]": "id",
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch aggregate count");

    const data = await response.json();
    const countValue = data?.data?.[0]?.count?.id;
    totalEmployees.value = countValue ? Number(countValue) : 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalEmployees.value = 0;
  }
};

const fetchEmployees = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const filterParams = await buildFilterParams();

    const params = new URLSearchParams({
      ...filterParams,
      fields: [
        "config",
        "config.attendanceSettings",
        "salaryConfig",
        "config.attendancePolicies",
        "config.leave",
        "id",
        "employeeId",
        "assignedUser.first_name",
        "assignedUser.tenant",
        "assignedUser.organization.id",
        "assignedUser.organization.orgName",
        "assignedUser.organization.orgType",
        "department.id",
        "department.departmentName",
      ].join(","),
      sort: "id",
      page: page.value,
      limit: itemsPerPage.value,
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate API response
    if (!data || !Array.isArray(data.data)) {
      console.error("Invalid API response: data.data is not an array", data);
      employees.value = [];
      throw new Error("Invalid API response format");
    }

    employees.value = data.data
      .map((employee) => {
        if (!employee) {
          console.warn("Null employee record found in response");
          return null;
        }
        return {
          ...employee,
          first_name: employee.assignedUser?.first_name || "",
          departmentName: employee.department?.departmentName || "Not Assigned",
          orgName: employee.assignedUser?.organization?.orgName || "N/A",
          orgType: employee.assignedUser?.organization?.orgType || "N/A",
          isAssigned: !!employee.config,
          updating: false,
        };
      })
      .filter((employee) => employee !== null); // Remove any null entries

    await fetchEmployeeAggregateCount();
  } catch (error) {
    console.error("Error fetching employees:", error);
    employees.value = []; // Reset employees on error
  } finally {
    loading.value = false;
  }
};
const fetchDepartments = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch departments");

    const data = await response.json();
    departments.value = data.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

const fetchOrganizations = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch organizations");

    const data = await response.json();
    organizations.value = data.data;
  } catch (error) {
    console.error("Error fetching organizations:", error);
  }
};

const updateAssignment = async (employee) => {
  employee.updating = true;
  try {
    const token = authService.getToken();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${employee.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: employee.isAssigned ? props.config.id : null,
          attendanceSettings: employee.isAssigned
            ? props.config.attendanceSettings
            : null,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update assignment");
    }

    employee.config = employee.isAssigned ? { id: props.config.id } : null;

    await fetchEmployees();
  } catch (error) {
    console.error("Error updating assignment:", error);
    employee.isAssigned = !employee.isAssigned;
  } finally {
    employee.updating = false;
  }
};

const debouncedFetchEmployees = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchEmployees();
  }, 300);
};

const getRandomColor = (text) => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "error",
    "warning",
    "info",
    "success",
  ];
  const index = text
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

onMounted(() => {
  Promise.all([fetchDepartments(), fetchOrganizations(), fetchEmployees()]);
});

watch(
  [selectedDepartment, selectedOrganization, activeTab, search],
  () => {
    page.value = 1;
    fetchEmployees();
  },
  { deep: true },
);

watch([page, itemsPerPage], () => {
  fetchEmployees();
});
</script>

<style scoped>
.v-data-table :deep(.v-data-table__wrapper) {
  border-radius: 0 0 8px 8px;
}

.v-data-table :deep(.v-data-table-header) {
  background-color: #f5f5f5;
}

.v-data-table :deep(.v-data-table-header th) {
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.6);
}

.v-data-table
  :deep(
    .v-data-table__wrapper
      > table
      > tbody
      > tr:hover:not(.v-data-table__expanded__content):not(
        .v-data-table__empty-wrapper
      )
  ) {
  background: #f5f5f5 !important;
}

.v-card-title {
  border-radius: 8px 8px 0 0;
}
</style>

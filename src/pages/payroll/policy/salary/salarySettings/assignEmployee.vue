<template>
  <v-container fluid class="pa-4">
    <v-card class="elevation-3 rounded-lg">
      <v-card-title class="d-flex flex-wrap align-center py-4 px-6 bg-white">
        <v-icon size="32" color="primary" class="mr-3"
          >mdi-account-group</v-icon
        >
        <span class="text-h5 font-weight-bold">Employee Management</span>
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
          @input="fetchEmployees"
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
        v-model:page="page"
        :headers="headers"
        :items="employees"
        :items-per-page="itemsPerPage"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-2">
              <span class="white--text text-subtitle-2">{{
                item.assignedUser?.first_name?.charAt(0) || ""
              }}</span>
            </v-avatar>
            {{ item.assignedUser?.first_name || "" }}
          </div>
        </template>

        <template v-slot:item.department="{ item }">
          <v-chip
            v-if="item.assignedDepartment?.length > 0"
            :color="getRandomColor(item.departmentName)"
            text-color="white"
            small
          >
            {{ item.departmentName || "Not Assigned" }}
          </v-chip>
          <span v-else>Not Assigned</span>
        </template>
        <template v-slot:item.pfAccount="{ item }">
          <v-chip
            v-if="!item.assignedUser?.PFAccountNumber"
            color="red"
            text-color="white"
            small
            class="mr-1"
          >
            PF Not Available
          </v-chip>
          <v-chip v-else color="green" text-color="white" small>
            PF Available
          </v-chip>
        </template>

        <template v-slot:item.esiAccount="{ item }">
          <v-chip
            v-if="!item.assignedUser?.ESIAccountNumber"
            color="orange"
            text-color="white"
            small
          >
            ESI Not Available
          </v-chip>
          <v-chip v-else color="green" text-color="white" small>
            ESI Available
          </v-chip>
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
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const props = defineProps({
  category: {
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
const itemsPerPage = ref(5);
const selectedDepartment = ref(null);
const selectedBranch = ref(null);
const loading = ref(false);
const departments = ref([]);
const employees = ref([]);
const branches = ref([]);
const activeTab = ref("unassigned");

const headers = [
  {
    title: "Employee Name",
    align: "start",
    key: "name",
    sortable: true,
  },
  {
    title: "Department",
    align: "start",
    key: "department",
    sortable: true,
  },
  {
    title: "Assign Template",
    align: "center",
    key: "assign",
    sortable: false,
  },
  {
    title: "PF Account",
    align: "center",
    key: "pfAccount",
    sortable: false,
  },
  {
    title: "ESI Account",
    align: "center",
    key: "esiAccount",
    sortable: false,
  },
];

const fetchEmployees = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const params = new URLSearchParams({
      fields: [
        "config",
        "config.attendanceSettings",
        "salaryConfig",
        "config.holidaySettings",
        "config.attendancePolicies",
        "config.leave",
        "assignedUser.first_name",
        "assignedUser.tenant",
        "assignedDepartment.department_id.id",
        "assignedDepartment.department_id.departmentName",

        "id",
      ].join(","),
      sort: "id",
      page: "1",
      "filter[assignedUser][tenant][_eq]": tenantId,
    });

    if (activeTab.value === "unassigned") {
      params.append("filter[salaryConfig][_null]", "true");
    } else {
      params.append(
        "filter[_and][0][salaryConfig][id][_eq]",
        props.category.id,
      );
    }

    if (selectedDepartment.value && selectedDepartment.value !== "all") {
      params.append(
        "filter[assignedDepartment][department_id][id][_eq]",
        selectedDepartment.value,
      );
    }

    if (selectedBranch.value && selectedBranch.value !== "all") {
      params.append(
        "filter[assignedBranch][branch_id][id][_eq]",
        selectedBranch.value,
      );
    }

    if (search.value) {
      params.append(
        "filter[_or][0][assignedUser][first_name][_contains]",
        search.value,
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch employees");

    const data = await response.json();
    employees.value = data.data.map((employee) => ({
      ...employee,
      departmentName:
        employee.assignedDepartment?.[0]?.department_id?.departmentName ||
        "Not Assigned",
      branchName: employee.assignedBranch?.[0]?.branch_id?.branchName || "N/A",
      isAssigned: !!employee.salaryConfig,
      updating: false,
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
  } finally {
    loading.value = false;
  }
};

const fetchDepartments = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/department?filter[tenant][tenantId][_eq]=${tenantId}`,
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

const fetchBranches = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch branches");

    const data = await response.json();
    branches.value = data.data;
  } catch (error) {
    console.error("Error fetching branches:", error);
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
          salaryConfig: employee.isAssigned ? props.category.id : null,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update assignment");
    }
    // snackbar.value = true;
    // snackbarMessage.value = `Employee ${
    //   employee.isAssigned ? "assigned" : "unassigned"
    // } successfully`;
    await fetchEmployees();
  } catch (error) {
    console.error("Error updating assignment:", error);
    employee.isAssigned = !employee.isAssigned;
  } finally {
    employee.updating = false;
  }
};

const getRandomColor = (department) => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "error",
    "warning",
    "info",
    "success",
  ];

  const index = department
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

onMounted(() => {
  Promise.all([fetchDepartments(), fetchBranches(), fetchEmployees()]);
});

watch([search, selectedDepartment, selectedBranch, activeTab], () => {
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

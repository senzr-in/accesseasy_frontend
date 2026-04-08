<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          label="Search"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          @input="fetchEmployees"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedBranch"
          :items="branches"
          item-title="branchName"
          item-value="id"
          label="Branch"
          variant="outlined"
          @update:modelValue="fetchEmployees"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedDepartment"
          :items="departments"
          item-title="departmentName"
          item-value="id"
          label="Department"
          variant="outlined"
          @update:modelValue="fetchEmployees"
        ></v-select>
      </v-col>
    </v-row>

    <v-tabs v-model="activeTab" @update:modelValue="handleTabChange">
      <v-tab color="primary" value="unassigned" style="text-transform: none"
        >Unassigned Employees</v-tab
      >
      <v-tab color="primary" value="assigned" style="text-transform: none"
        >Assigned Employees</v-tab
      >
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="assigned">
        <v-data-table
          :headers="headers"
          :items="assignedEmployees"
          :loading="loading"
          class="elevation-1"
          height="calc(62vh - 170px)"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Assigned Employees</v-toolbar-title>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-switch
              color="success"
              hide-details
              inset
              v-model="item.assigned"
              @change="toggleAssignment(item)"
              :label="item.assigned ? 'Assigned' : 'Unassigned'"
            ></v-switch>
          </template>
        </v-data-table>
      </v-window-item>

      <v-window-item value="unassigned">
        <v-data-table
          :headers="headers"
          :items="unassignedEmployees"
          :loading="loading"
          class="elevation-1"
          height="calc(62vh - 170px)"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Unassigned Employees</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="assignToAllEmployees">
                Assign to All Employees
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-switch
              color="success"
              hide-details
              inset
              v-model="item.assigned"
              @change="toggleAssignment(item)"
              :label="item.assigned ? 'Assigned' : 'Unassigned'"
            ></v-switch>
          </template>
        </v-data-table>
      </v-window-item>
    </v-window>

    <v-snackbar
      v-model="snackbar"
      color="green"
      timeout="3000"
      bottom
      elevation="1"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";

const props = defineProps({
  accessLevelId: {
    type: Number,
    required: true,
  },
});

const activeTab = ref("unassigned");
const search = ref("");
const selectedBranch = ref(null);
const selectedDepartment = ref(null);
const assignedEmployees = ref([]);
const unassignedEmployees = ref([]);
const branches = ref([]);
const departments = ref([]);
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const headers = [
  { title: "Employee ID", key: "employeeId" },
  { title: "Name", key: "assignedUser.first_name" },
  {
    title: "Branch",
    key: "branch",
    value: (item) => item.assignedBranch?.branch_id?.branchName || "N/A",
  },
  {
    title: "Department",
    key: "department",
    value: (item) =>
      item.assignedDepartment?.department_id?.departmentName || "N/A",
  },
  { title: "Actions", key: "actions" },
];

onMounted(async () => {
  await fetchBranches();
  await fetchDepartments();
  await fetchEmployees();
});

const fetchBranches = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  branches.value = data.data;
};

const fetchDepartments = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/items/department?filter[tenant][tenantId][_eq]=${tenantId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  departments.value = data.data;
};

const fetchEmployees = async () => {
  loading.value = true;
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  let params = new URLSearchParams({
    fields: [
      "assignedUser.first_name",
      "assignedUser.tenant",
      "assignedBranch.branch_id.branchName",
      "assignedBranch.branch_id.id",
      "assignedDepartment.department_id.id",
      "assignedDepartment.department_id.departmentName",
      "assignedDepartment.department_id.departmentId",
      "assignedAccessLevels.accesslevels_id.accessLevelName",
      "assignedAccessLevels.accesslevels_id.id",
      "assignedAccessLevels.accesslevels_id",
      "assignedAccessLevels.id",
      "assignedAccessLevels",
      "assignedUser.tenant.tenantId",
      "assignedUser.tenant.tenantName",
      "assignedUser.role.name",
      "assignedUser.role.id",
      "assignedAccessLevels.accesslevels_id.accessLevelNumber",
      "employeeId",
      "id",
    ].join(","),
    "filter[assignedUser][tenant][tenantId][_eq]": tenantId,
  });

  if (search.value) {
    params.append(
      "filter[_or][0][assignedUser][first_name][_contains]",
      search.value,
    );
    params.append("filter[_or][1][employeeId][_contains]", search.value);
  }

  if (selectedBranch.value) {
    params.append(
      "filter[assignedBranch][branch_id][id][_eq]",
      selectedBranch.value,
    );
  }

  if (selectedDepartment.value) {
    params.append(
      "filter[assignedDepartment][department_id][id][_eq]",
      selectedDepartment.value,
    );
  }

  // Add filter based on the active tab
  if (activeTab.value === "assigned") {
    params.append(
      "filter[assignedAccessLevels][accesslevels_id][id][_eq]",
      props.accessLevelId,
    );
  } else {
    params.append(
      "filter[assignedAccessLevels][accesslevels_id][id][_null]",
      "true",
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
  const data = await response.json();
  if (activeTab.value === "assigned") {
    assignedEmployees.value = data.data.map((employee) => ({
      ...employee,
      assigned: true,
    }));
  } else {
    unassignedEmployees.value = data.data.map((employee) => ({
      ...employee,
      assigned: false,
    }));
  }

  loading.value = false;
};

const toggleAssignment = async (employee) => {
  const token = authService.getToken();
  let payload = {
    assignedAccessLevels: {
      create: [],
      update: [],
      delete: [],
    },
  };

  if (employee.assigned) {
    // Assigning: Create new access level entry
    payload.assignedAccessLevels.create.push({
      personalModule_id: "+",
      accesslevels_id: { id: props.accessLevelId },
    });
  } else {
    const accessLevelEntry = employee.assignedAccessLevels.find(
      (al) => al.accesslevels_id.id === props.accessLevelId,
    );
    if (accessLevelEntry) {
      payload.assignedAccessLevels.delete.push(accessLevelEntry.id);
    } else {
      console.error("No access level entry found for unassignment");
      return;
    }
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${employee.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      // Update the employee lists
      if (employee.assigned) {
        unassignedEmployees.value = unassignedEmployees.value.filter(
          (emp) => emp.id !== employee.id,
        );
        assignedEmployees.value.push({ ...employee, assigned: true });
      } else {
        assignedEmployees.value = assignedEmployees.value.filter(
          (emp) => emp.id !== employee.id,
        );
        unassignedEmployees.value.push({ ...employee, assigned: false });
      }

      // Show success snackbar
      snackbarMessage.value = `Successfully ${
        employee.assigned ? "assigned" : "unassigned"
      } access level to employee.`;
      snackbar.value = true;
    } else {
      console.error(
        `Failed to ${
          employee.assigned ? "assign" : "unassign"
        } access level to employee`,
      );
    }
  } catch (error) {
    console.error(
      `Error ${
        employee.assigned ? "assigning" : "unassigning"
      } access level to employee:`,
      error,
    );
  }
};

const assignToAllEmployees = async () => {
  const token = authService.getToken();
  const payload = {
    keys: unassignedEmployees.value.map((emp) => emp.id),
    data: {
      assignedAccessLevels: {
        create: [
          {
            personalModule_id: "+",
            accesslevels_id: { id: props.accessLevelId },
          },
        ],
        update: [],
        delete: [],
      },
    },
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      // Move all unassigned employees to assigned employees
      assignedEmployees.value = [
        ...assignedEmployees.value,
        ...unassignedEmployees.value.map((emp) => ({ ...emp, assigned: true })),
      ];
      unassignedEmployees.value = [];

      // Show success snackbar
      snackbarMessage.value =
        "Successfully assigned access level to all employees.";
      snackbar.value = true;
    } else {
      console.error("Failed to assign access level to all employees");
    }
  } catch (error) {
    console.error("Error assigning access level to all employees:", error);
  }
};

watch(activeTab, (newTab) => {
  fetchEmployees();
});

const handleTabChange = () => {
  fetchEmployees();
};
</script>

<style>
@media (min-width: 600px) {
  .v-col-sm-4 {
    flex: 0 0 33.3333333333%;
    max-width: 33.3333333333%;
    margin-top: 0.2rem;
  }
}
</style>

<template>
  <div>
    <v-card>
      <v-card-title>
        {{ isAssigned ? "Assigned Employees" : "Unassigned Employees" }}
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="employees"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
        }"
        class="elevation-1"
      >
        <template v-slot:item.assignedUser.first_name="{ item }">
          {{ item.assignedUser.first_name || "N/A" }}
        </template>
        <template v-slot:item.assignedDepartment="{ item }">
          {{ getDepartmentName(item) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-switch
            color="success"
            hide-details
            inset
            :model-value="isAssigned"
            @update:model-value="toggleAccess(item)"
            :label="isAssigned ? 'Assigned' : 'Unassigned'"
          ></v-switch>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  employees: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isAssigned: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["toggle-access"]);

const search = ref("");

const headers = computed(() => [
  {
    title: "Name",
    align: "start",
    key: "assignedUser.first_name",
    sortable: true,
  },
  {
    title: "Employee ID",
    align: "start",
    key: "employeeId",
    sortable: true,
  },
  {
    title: "Department",
    align: "start",
    key: "assignedDepartment",
    sortable: true,
  },
  {
    title: "Branch",
    align: "start",
    key: "assignedBranch",
    sortable: true,
  },
  {
    title: "Actions",
    align: "center",
    key: "actions",
    sortable: false,
  },
]);

const getDepartmentName = (item) => {
  const department = item.assignedDepartment.find(
    (dep) => dep.department_id && dep.department_id.departmentName,
  );
  return department ? department.department_id.departmentName : "N/A";
};

const getBranchName = (item) => {
  return item.assignedBranch && item.assignedBranch.branch_id
    ? item.assignedBranch.branch_id.branchName
    : "N/A";
};

const toggleAccess = (item) => {
  emit("toggle-access", item, props.isAssigned);
};
</script>

<style scoped>
.v-data-table {
  width: 100%;
}
</style>

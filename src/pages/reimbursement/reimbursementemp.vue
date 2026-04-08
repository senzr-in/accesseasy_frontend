<template>
  <v-app>
    <v-container>
      <!-- Search Input -->
      <v-text-field
        v-model="search"
        label="Search employees..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        class="mb-4"
      ></v-text-field>

      <!-- Employee Task Summary Cards -->
      <v-row>
        <v-col
          v-for="employee in filteredEmployees"
          :key="employee.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="elevation-2 mb-4">
            <v-card-title class="d-flex align-center">
              <v-avatar color="primary" class="mr-3">
                {{ getInitials(employee.assignedUser.first_name) }}
              </v-avatar>
              <div>
                <h3>{{ employee.assignedUser.first_name }}</h3>
                <v-chip
                  :color="getTotalTasksColor(employee.taskCounts.total)"
                  variant="flat"
                  size="small"
                  class="mt-1"
                >
                  Total: {{ employee.taskCounts.total }}
                </v-chip>
              </div>
            </v-card-title>

            <v-card-text>
              <v-row class="text-center">
                <v-col cols="4">
                  <div class="text-h6 text-orange">
                    {{ employee.taskCounts.inProgress || 0 }}
                  </div>
                  <div class="text-caption text-grey">In Progress</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-h6 text-red">
                    {{ employee.taskCounts.pending || 0 }}
                  </div>
                  <div class="text-caption text-grey">Pending</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-h6 text-green">
                    {{ employee.taskCounts.completed || 0 }}
                  </div>
                  <div class="text-caption text-grey">Completed</div>
                </v-col>
              </v-row>

              <!-- Additional status counts if they exist -->
              <v-row
                v-if="hasOtherStatuses(employee.taskCounts)"
                class="text-center mt-2"
              >
                <v-col
                  v-for="(count, status) in getOtherStatuses(
                    employee.taskCounts,
                  )"
                  :key="status"
                  cols="6"
                >
                  <div class="text-body-2 text-blue">{{ count }}</div>
                  <div class="text-caption text-grey">
                    {{ formatStatus(status) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-btn
                variant="text"
                color="primary"
                @click="viewEmployeeTasks(employee.id)"
              >
                TRIP View
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading" class="justify-center">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <div class="mt-2">Loading employees and task counts...</div>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-if="!loading && employees.length === 0" class="justify-center">
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="grey">mdi-account-off</v-icon>
          <h3 class="text-grey mt-2">No employees found</h3>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";

const router = useRouter();
const search = ref("");
const employees = ref([]);
const loading = ref(false);

const API_ENDPOINTS = {
  personalModule: "/items/personalModule",
  tasks: "/items/tasks",
};

// Computed property for filtered employees based on search
const filteredEmployees = computed(() => {
  if (!search.value) return employees.value;

  return employees.value.filter((employee) =>
    employee.assignedUser.first_name
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  );
});

// Utility functions
const getInitials = (name) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

const getTotalTasksColor = (total) => {
  if (total === 0) return "grey";
  if (total <= 5) return "green";
  if (total <= 15) return "pink";
  return "red";
};

const formatStatus = (status) => {
  return status
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const hasOtherStatuses = (taskCounts) => {
  const mainStatuses = ["total", "inProgress", "pending", "completed"];
  return Object.keys(taskCounts).some(
    (status) => !mainStatuses.includes(status),
  );
};

const getOtherStatuses = (taskCounts) => {
  const mainStatuses = ["total", "inProgress", "pending", "completed"];
  const otherStatuses = {};

  Object.keys(taskCounts).forEach((status) => {
    if (!mainStatuses.includes(status) && taskCounts[status] > 0) {
      otherStatuses[status] = taskCounts[status];
    }
  });

  return otherStatuses;
};

// Fetch employees from personalModule
const fetchEmployees = async () => {
  try {
    const token = await authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.personalModule}?fields[]=id&fields[]=assignedUser.first_name&filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    alert("Failed to load employees. Please try again.");
    return [];
  }
};

// Fetch task counts for each employee
const fetchTaskCountsForEmployee = async (employeeId) => {
  try {
    const token = await authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.tasks}?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][employeeId][id][_eq]=${employeeId}&fields[]=status&meta=total_count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const tasks = response.data.data || [];
    const total = response.data.data?.length || 0;

    // Count tasks by status
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      ...statusCounts,
    };
  } catch (error) {
    console.error(
      `Error fetching task counts for employee ${employeeId}:`,
      error,
    );
    return { total: 0 };
  }
};

// Main function to load employees and their task counts
const loadEmployeesWithTaskCounts = async () => {
  loading.value = true;

  try {
    // First, get all employees
    const employeeData = await fetchEmployees();

    // Then, get task counts for each employee
    const employeesWithCounts = await Promise.all(
      employeeData.map(async (employee) => {
        const taskCounts = await fetchTaskCountsForEmployee(employee.id);
        return {
          ...employee,
          taskCounts,
        };
      }),
    );

    employees.value = employeesWithCounts;
    console.log("Employees with task counts:", employees.value);
  } catch (error) {
    console.error("Error loading employee data:", error);
    alert("Failed to load employee task data. Please try again.");
  } finally {
    loading.value = false;
  }
};

// Navigation function
const viewEmployeeTasks = (employeeId) => {
  router.push({ name: "tripview", params: { employeeId } });
};

// Initialize data on component mount
onMounted(() => {
  loadEmployeesWithTaskCounts();
});
</script>

<style scoped>
.text-orange {
  color: #ff9800 !important;
}

.text-red {
  color: #f44336 !important;
}

.text-green {
  color: #4caf50 !important;
}

.text-blue {
  color: #2196f3 !important;
}

.text-grey {
  color: #757575 !important;
}

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>

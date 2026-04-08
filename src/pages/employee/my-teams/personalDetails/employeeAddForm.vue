<template>
  <div class="employee-form-container">
    <!-- Header -->
    <div class="form-header">
      <div class="header-content">
        <v-btn
          icon
          variant="text"
          @click="$router.push('/employee-details')"
          class="back-button"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h6">Add Employee</h2>
      </div>
      <div class="action-buttons">
        <v-btn color="error" variant="text" @click="cancelForm">CANCEL</v-btn>
        <v-btn color="primary" @click="saveEmployee">SAVE</v-btn>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="form-content-wrapper">
      <!-- Left Sidebar with Tabs -->
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="tab in tabs"
            :key="tab.path"
            :to="getTabRoute(tab.path)"
            :class="{ 'has-error': tabHasError(tab.id) }"
          >
            <template v-slot:prepend>
              <v-icon :color="tabHasError(tab.id) ? 'error' : 'default'">
                {{ tab.icon }}
              </v-icon>
            </template>

            <v-list-item-title>
              {{ tab.title }}
              <v-icon
                v-if="tabHasError(tab.id)"
                color="error"
                size="small"
                class="ms-2"
              >
                mdi-alert-circle
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Right Content Area -->
      <div class="form-content">
        <component
          :is="currentTabComponent"
          :employee-data="employeeData"
          @update:employee-data="updateEmployeeData"
        ></component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PersonalDetails from "@/pages/employee/my-teams/personalDetails/employeeAddForm/personalDetails.vue";
import CompanyDetails from "@/pages/employee/my-teams/personalDetails/employeeAddForm/companyDetails.vue";
import GovernmentIds from "@/pages/employee/my-teams/personalDetails/employeeAddForm/governmentIDs.vue";
import AttendanceCategory from "@/pages/employee/my-teams/personalDetails/employeeAddForm/attendanceCategory.vue";
import PayrollCategory from "@/pages/employee/my-teams/personalDetails/employeeAddForm/payrollCategory.vue";
import AccessManagement from "@/pages/employee/my-teams/personalDetails/employeeAddForm/accessManagement.vue";
import PastExperience from "@/pages/employee/my-teams/personalDetails/employeeAddForm/pastExperience.vue";
import BackgroundVerification from "@/pages/employee/my-teams/personalDetails/employeeAddForm/backgroundVerification.vue";
import BankDetails from "@/pages/employee/my-teams/personalDetails/employeeAddForm/bankForm.vue";

const route = useRoute();
const router = useRouter();
const currentModule = computed(() => route.params.module || "personalmodule");
const employeeData = ref({});

const tabs = [
  {
    id: "personal",
    title: "Personal Details",
    icon: "mdi-account",
    path: "personalmodule",
    component: PersonalDetails,
  },

  {
    id: "government",
    title: "Government IDs",
    icon: "mdi-card-account-details",
    path: "governmentmodule",
    component: GovernmentIds,
  },
  {
    id: "attendance",
    title: "Attendance Category",
    icon: "mdi-calendar-check",
    path: "attendancemodule",
    component: AttendanceCategory,
  },
  {
    id: "payroll",
    title: "Salary Details",
    icon: "mdi-cash",
    path: "payrollmodule",
    component: PayrollCategory,
  },
  {
    id: "access",
    title: "Access Management",
    icon: "mdi-key",
    path: "accessmodule",
    component: AccessManagement,
  },
  {
    id: "experience",
    title: "Past Experience",
    icon: "mdi-history",
    path: "experiencemodule",
    component: PastExperience,
  },
  {
    id: "verification",
    title: "Background Verification",
    icon: "mdi-shield-check",
    path: "verificationmodule",
    component: BackgroundVerification,
  },
  {
    id: "bank",
    title: "Bank Details",
    icon: "mdi-bank",
    path: "bankmodule",
    component: BankDetails,
  },
];

const currentTabComponent = computed(() => {
  const tab = tabs.find((tab) => tab.path === currentModule.value);
  return tab ? tab.component : PersonalDetails;
});

const getTabRoute = (tabPath) => {
  return { name: "AddEmployeeForm", params: { module: tabPath } };
};

const tabHasError = (tabId) => {
  // Implement error checking logic
  return false;
};

const updateEmployeeData = (newData) => {
  employeeData.value = { ...employeeData.value, ...newData };
};

const saveEmployee = async () => {
  try {
    // Implement save logic here
    console.log("Saving employee data:", employeeData.value);
    // After successful save, navigate back to employee list
    router.push("/employee-details");
  } catch (error) {
    console.error("Error saving employee:", error);
  }
};

const cancelForm = () => {
  router.push("/employee-details/employee");
};

onMounted(() => {
  // If no module is specified, default to personalmodule
  if (!route.params.module) {
    router.replace({
      name: "AddEmployeeForm",
      params: { module: "personalmodule" },
    });
  }
});
</script>

<style scoped>
.employee-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}

.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.form-content-wrapper {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: 80vh;
}

:deep(.v-list-item--active) {
  background-color: #f5f5f5;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

.has-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-list-item.has-error:not(.v-list-item--active)) {
  background-color: rgb(var(--v-theme-error), 0.1);
}
</style>

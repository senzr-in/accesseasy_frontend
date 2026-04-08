<template>
  <div class="employee-form-container">
    <!-- Header -->
    <div class="form-heade">
      <div class="header-left">
        <div class="breadcrumb">
          <span class="crumb" @click="$router.push('/employee-details')"
            >All Employees</span
          >
          <v-icon size="small">mdi-chevron-right</v-icon>
          <span class="crumb active">{{
            employeeData.assignedUser?.first_name || "New Employee"
          }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="form-content-wrapper">
      <!-- Top Tabs Section with v-tabs -->
      <div class="tab-section">
        <v-tabs
          v-model="currentTabIndex"
          bg-color="transparent"
          color="#059367"
          class="custom-tab"
          align-tabs="center"
          @update:model-value="handleTabChange"
          v-if="isTabReady"
        >
          <v-tab
            v-for="(tab, index) in filteredTabs"
            :key="index"
            :value="index"
            class="tab-item"
            :class="{
              'tab-item--active': currentTabIndex === index,
              'tab-item--error': tabHasError(tab.id),
            }"
          >
            <div class="tab-contet">
              <v-icon class="tab-icon" size="20">
                {{ tab.icon }}
              </v-icon>
              <span class="tab-text">{{ tab.title }}</span>
              <v-icon
                v-if="tabHasError(tab.id)"
                color="error"
                size="16"
                class="tab-error-icon"
              >
                mdi-alert-circle
              </v-icon>
            </div>
          </v-tab>
        </v-tabs>
      </div>

      <!-- Content Area -->
      <div class="form-content">
        <transition name="fade" mode="out-in">
          <div :key="currentModule" class="content-wrapper">
            <component
              :is="currentTabComponent"
              :employee-data="currentTabData"
              :id="id"
              @update:employee-data="updateTempData"
              :tenant-id="tenantId"
              ref="currentTabRef"
            ></component>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import PersonalDetails from "@/pages/employee/my-teams/personalDetails/employeeEditform/personalDetails.vue";
import CompanyDetails from "@/pages/employee/my-teams/personalDetails/employeeEditform/companyDetails.vue";
import GovernmentIds from "@/pages/employee/my-teams/personalDetails/employeeEditform/governmentIDs.vue";
import AttendancePolicy from "@/pages/employee/my-teams/personalDetails/employeeEditform/attendance/attendancePolicy.vue";
import AccessManagement from "@/pages/employee/my-teams/personalDetails/employeeEditform/accessManagement.vue";
import PastExperience from "@/pages/employee/my-teams/personalDetails/employeeEditform/pastExperience.vue";
import BackgroundVerification from "@/pages/employee/my-teams/personalDetails/employeeEditform/backgroundVerification.vue";
import EmergencyContact from "@/pages/employee/my-teams/personalDetails/employeeEditform/emergencyContact.vue";
import LeavePolicy from "@/pages/employee/my-teams/personalDetails/employeeEditform/leavePolicy.vue";
import Appaccess from "./employeeEditform/appaccess.vue";

const props = defineProps({
  isDialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save-success"]);

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const currentModule = computed(() => route.params.module);
const employeeData = ref({});
const modifiedEmployeeData = ref({});
const hasChanges = ref(false);
const isEditing = computed(() => !!id.value);
const userRole = ref("");
const isInitialized = ref(false);
const errorTabs = ref({});
const tenantId = ref(null);
const currentTabRef = ref(null);
const showErrorIcon = ref(false);

const currentTabIndex = ref(0);

const tabs = [
  {
    id: "overview",
    title: "Overview",
    icon: "mdi-view-dashboard",
    path: "overviewmodule",
    component: PersonalDetails,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },

  // {
  //   id: "company",
  //   title: "Company Details",
  //   icon: "mdi-domain",
  //   path: "companymodule",
  //   component: CompanyDetails,
  //   roles: ["Admin", "Manager", "accessManager", "Dealer"],
  // },
  // {
  //   id: "government",
  //   title: "Government IDs",
  //   icon: "mdi-card-account-details",
  //   path: "governmentmodule",
  //   component: GovernmentIds,
  //   roles: ["Admin", "Manager", "accessManager", "Employee", "Dealer"],
  // },

  {
    id: "attendance",
    title: "Assign Shifts",
    icon: "mdi-calendar-check",
    path: "attendancemodule",
    component: AttendancePolicy,
    roles: ["Admin", "Dealer", "Manager", "accessManager"],
  },
  {
    id: "LeavePolicy",
    title: "Leave Policy",
    icon: "mdi-calendar-account",
    path: "leavePolicy",
    component: LeavePolicy,
    roles: ["Admin", "Manager", "accessManager", "Dealers"],
  },

  {
    id: "access",
    title: "Access Management",
    icon: "mdi-key",
    path: "accessmodule",
    component: AccessManagement,
    roles: ["Admin", "Dealer", "Manager", "accessManager"],
  },
  /*
  {
    id: "experience",
    title: "Past Experience",
    icon: "mdi-history",
    path: "experiencemodule",
    component: PastExperience,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },

  {
    id: "Emergency Contact Details",
    title: "Emergency Contact Details",
    icon: "mdi-phone-in-talk",
    path: "emergencyContact",
    component: EmergencyContact,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },
  {
    id: "Employee Address",
    title: "Employee Address",
    icon: "mdi-map-marker",
    path: "employeeAddress",
    component: EmployeeAddress,
    roles: ["Admin", "Manager",'accessManager', "Employee", "Dealer"],
  },
  */
  {
    id: "Appaccess",
    title: "Mobile App Access",
    icon: "mdi-shield-check",
    path: "appaccess",
    component: Appaccess,
    roles: ["Admin", "Manager", "accessManager", "Employee", "Dealer"],
  },
];

// Filter tabs based on user role
const filteredTabs = computed(() => {
  const filtered = tabs.filter((tab) =>
    tab.roles.includes(userRole.value || "Employee")
  );
  return filtered;
});

const currentTabComponent = computed(() => {
  const tab = tabs.find((tab) => tab.path === currentModule.value);
  return tab ? tab.component : PersonalDetails;
});

const currentTabData = computed(() => {
  return {
    ...employeeData.value,
    ...modifiedEmployeeData.value[currentModule.value],
  };
});

const getTabRoute = (tabPath) => {
  if (props.isDialog) {
    return { name: "AddEmployeeForm", params: { module: tabPath } };
  }
  return `/employee-details/employee/${id.value}/${tabPath}`;
};

const tabHasError = (tabId) => {
  return !!errorTabs.value[tabId];
};

// Handle tab change
const handleTabChange = async (newIndex) => {
  const newTab = filteredTabs.value[newIndex];
  if (!newTab) return;

  // Prevent handling if we're already on this tab
  if (
    currentTabIndex.value === newIndex &&
    currentModule.value === newTab.path
  ) {
    return;
  }

  // Save current tab data before switching
  if (
    currentTabRef.value &&
    typeof currentTabRef.value.validateAndSave === "function"
  ) {
    try {
      await currentTabRef.value.validateAndSave();
    } catch (error) {
      console.warn("Error saving current tab data:", error);
    }
  }

  // Navigate to new tab
  try {
    if (props.isDialog) {
      await router.push({
        name: "AddEmployeeForm",
        params: { module: newTab.path },
      });
    } else {
      await router.push(
        `/employee-details/employee/${id.value}/${newTab.path}`
      );
    }
  } catch (error) {
    // Handle navigation errors (e.g., navigating to the same route)
    console.warn("Navigation error:", error);
  }
};

const updateTempData = (newData) => {
  const tabName = currentModule.value;
  modifiedEmployeeData.value[tabName] = {
    ...modifiedEmployeeData.value[tabName],
    ...newData,
  };
  hasChanges.value = true;
};

const mergeChanges = () => {
  Object.keys(modifiedEmployeeData.value).forEach((tabName) => {
    if (modifiedEmployeeData.value[tabName]) {
      employeeData.value = {
        ...employeeData.value,
        ...modifiedEmployeeData.value[tabName],
      };
    }
  });
};

async function fetchEmployeeDetails(employeeId) {
  const token = authService.getToken();
  try {
    await currentUserTenant.initialize();
    const tenantIdVal = currentUserTenant.getTenantId();
    if (!token || !tenantIdVal) {
      throw new Error("Authentication required or tenant not found");
    }
    tenantId.value = tenantIdVal;
    const fields = ["id", "assignedUser.first_name"];

    const queryString = fields
      .map((field) => `fields[]=${encodeURIComponent(field)}`)
      .join("&");
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule/${employeeId}?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
}

const getUserRole = async () => {
  try {
    await currentUserTenant.initialize();
    const role = await currentUserTenant.getRoleAsync();

    if (role) {
      userRole.value = role;
    } else {
      console.warn("No role found, defaulting to Employee");
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    userRole.value = "Employee";
  }
};

const cancelForm = () => {
  if (props.isDialog) {
    emit("close");
  } else {
    router.push("/employee-details/employee");
  }
};

const validateAndRedirectIfNeeded = () => {
  if (!isInitialized.value) return;

  const currentModuleValue = currentModule.value;
  const tabIndex = filteredTabs.value.findIndex(
    (tab) => tab.path === currentModuleValue
  );

  if (tabIndex !== -1) {
    currentTabIndex.value = tabIndex; // Update tab index based on route
  } else {
    // Redirect to default tab (overview) if module is invalid
    const defaultTab = filteredTabs.value[0]?.path || "overviewmodule";
    if (props.isDialog) {
      router.replace({
        name: "AddEmployeeForm",
        params: { module: defaultTab },
      });
    } else {
      router.replace(`/employee-details/employee/${id.value}/${defaultTab}`);
    }
    currentTabIndex.value = 0;
  }
};

onMounted(async () => {
  await getUserRole();

  if (id.value) {
    try {
      const data = await fetchEmployeeDetails(id.value);
      employeeData.value = data;
    } catch (error) {
      console.error("Error fetching employee data:", error);
      alert("Failed to load employee data. Please try again.");
    }
  }

  // Wait for next tick before setting initial state
  await nextTick();

  // Set initial tab index based on current route
  const currentModuleValue = currentModule.value;
  const tabIndex = filteredTabs.value.findIndex(
    (tab) => tab.path === currentModuleValue
  );

  if (tabIndex !== -1) {
    currentTabIndex.value = tabIndex;
  } else {
    // Redirect to default tab if current module is invalid
    const defaultTab = filteredTabs.value[0]?.path || "overviewmodule";
    currentTabIndex.value = 0;

    if (props.isDialog) {
      await router.replace({
        name: "AddEmployeeForm",
        params: { module: defaultTab },
      });
    } else {
      await router.replace(
        `/employee-details/employee/${id.value}/${defaultTab}`
      );
    }
  }

  isInitialized.value = true;
});
const isTabReady = computed(() => {
  return (
    isInitialized.value &&
    filteredTabs.value.some((tab) => tab.path === currentModule.value)
  );
});
// Watch for route changes
watch(
  () => route.params.module,
  (newModule) => {
    if (!isInitialized.value || !newModule) return;

    const tabIndex = filteredTabs.value.findIndex(
      (tab) => tab.path === newModule
    );

    if (tabIndex !== -1 && currentTabIndex.value !== tabIndex) {
      // Use nextTick to ensure DOM is ready before updating
      nextTick(() => {
        currentTabIndex.value = tabIndex;
      });
    }
  },
  { immediate: true }
);

watch(
  () => userRole.value,
  (newRole) => {
    if (isInitialized.value) {
      validateAndRedirectIfNeeded();
    }
  }
);

// Cleanup on unmount
onBeforeUnmount(() => {});
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

/* Header Styles */
.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.crumb {
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.crumb:hover {
  color: red;
  text-decoration: underline;
}

.crumb.active {
  color: red;
  font-weight: 500;
  cursor: default;
}

/* Form Content Wrapper */
.form-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* Tab Section */
.tab-section {
  background: #f8f9fa;
}

.custom-tab {
  background: transparent !important;
}

.custom-tab :deep(.v-slide-group__container) {
  background: transparent !important;
}

.custom-tab :deep(.v-slide-group__content) {
  background: white !important;
  padding: 0 !important;
  gap: 12px !important;
  width: fit-content;
  margin: 0 auto;
}

/* Individual tab as separate column with gaps */
.tab-item {
  background: #ffe7e6 !important;
  /* border: 1px solid #d1e7dd !important; */
  border-radius: 8px !important;
  min-height: 48px !important;
  min-width: 200px !important;
  padding: 0 20px !important;
  margin: 0 !important;
  text-transform: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

/* Selected tab state */
.tab-item--active {
  background: rgb(244, 84, 84) !important;
  border-color: rgb(244, 84, 84) !important;
  box-shadow: 0 2px 8px rgba(5, 147, 103, 0.3);
}

/* Hover state for unselected tabs */
.tab-item:not(.tab-item--active):hover {
  background: rgb(244, 84, 84) !important;
  border-color: rgb(244, 84, 84) !important;
  transform: translateY(-1px);
}
.tab-item:not(.tab-item--active):hover .tab-text {
  color: white !important;
}

.tab-item:not(.tab-item--active):hover .tab-icon {
  color: white !important;
}
.tab-contet {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.tab-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item--active .tab-text {
  color: white !important;
}

/* Unselected tab - black text and green icon */
.tab-item:not(.tab-item--active) .tab-icon {
  color: #122f68 !important;
  opacity: 0.8;
}

.tab-item:not(.tab-item--active) .tab-text {
  color: #122f68 !important;
  font-weight: 500;
}

/* Selected tab - white text and white icon */
.tab-item--active .tab-icon {
  color: white !important;
}

.tab-item--active .tab-text {
  color: white !important;
  font-weight: 600;
}

.tab-text {
  font-size: 14px;
  line-height: 1.2;
  letter-spacing: -0.1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-error-icon {
  position: relative;
  z-index: 2;
}

/* Error state styles */
.tab-item--error:not(.tab-item--active) .tab-text {
  color: #d32f2f !important;
}

.tab-item--error:not(.tab-item--active) .tab-icon {
  color: #d32f2f !important;
}

.tab-item--error.tab-item--active .tab-error-icon {
  color: white !important;
}

/* Remove default Vuetify tab styles */
.custom-tab:deep(.v-tab--selected) {
  color: transparent !important;
}

.custom-tab :deep(.v-tab__slider) {
  display: none !important;
}

/* Content Area */
.form-content {
  flex: 1;
  /* overflow-y: auto; */
  background: #fff;
}

.content-wrapper {
  min-height: 100%;
}

/* Fade Transition for Content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .custom-tab :deep(.v-slide-group__content) {
    gap: 8px !important;
  }

  .tab-item {
    min-width: 160px !important;
    padding: 0 16px !important;
    min-height: 44px !important;
  }

  .tab-text {
    font-size: 13px;
  }

  .tab-icon {
    font-size: 18px;
  }

  .form-header {
    padding: 8px 16px;
  }

  .tab-section {
    padding: 12px 16px;
  }

  .content-wrapper {
    padding: 16px;
  }
}

/* Focus states for accessibility */
.tab-item:focus-visible {
  outline: 2px solid #059367;
  outline-offset: 2px;
}

.tab-item--active:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>

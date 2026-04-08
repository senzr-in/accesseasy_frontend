<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <div v-if="!isFormRoute" class="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value; handleTabChange(tab.value)"
            :class="[
              'flex items-center gap-2 px-4 h-10 text-sm font-semibold transition-colors relative',
              activeTab === tab.value 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            ]"
          >
            <v-icon :icon="tab.icon" size="18" :color="activeTab === tab.value ? 'primary' : ''"></v-icon>
            {{ tab.title }}
            <!-- Active Indicator Line -->
            <div v-if="activeTab === tab.value" class="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>
          </button>
        </div>

        <!-- Tab Content (always rendered) -->
        <div
          :class="[
            'w-full',
            { 'pt-2': isFormRoute },
          ]"
        >
          <router-view></router-view>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const router = useRouter();
const route = useRoute();

const userRole = ref("");
const tabs = ref([]);
const activeTab = ref("employee");

// names of routes that should hide tabs
const FORM_ROUTE_NAMES = ["AddEmployeeForm", "EmployeeForm"];

// computed boolean: true when current route is a form (add/edit)
const isFormRoute = computed(() => {
  // route.name may be undefined briefly — coerce to string
  const rname = String(route.name || "");
  return FORM_ROUTE_NAMES.includes(rname);
});

// (optional) debug: uncomment to see the route names in console when navigating
// watch(() => route.name, (n) => console.log('route.name =>', n));

const handleTabChange = (newValue) => {
  router.push(`/employee-details/${newValue}`);
};

const updateActiveTabFromRoute = () => {
  const currentPath = route.path;
  const pathSegments = currentPath.split("/");
  const tabValue = pathSegments[pathSegments.length - 1];
  const currentTab = tabs.value.find((tab) => tab.value === tabValue);
  activeTab.value = currentTab ? currentTab.value : "employee";
};

const fetchrole = async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  userRole.value = userData.role.name;

  tabs.value = [
    { value: "employee", title: "All Employees", icon: "mdi-account-details" },
    { value: "leave", title: "Leave Balance", icon: "mdi-calendar-check" },
    {
      value: "attendance",
      title: "Shift Details",
      icon: "mdi-calendar-clock",
    },
    {
      value: "card",
      title: "Card Management",
      icon: "mdi-card-account-details",
    },
    // {
    //   value: "otherDetails",
    //   title: "Employee Other Details",
    //   icon: "mdi-card-account-details-outline",
    // },
  ];
};

watch(
  () => route.path,
  () => {
    updateActiveTabFromRoute();
  }
);

onMounted(async () => {
  await fetchrole();
  updateActiveTabFromRoute();
});
</script>

<style scoped>
.v-container {
  max-width: 100% !important;
  padding: 0 !important;
}
</style>

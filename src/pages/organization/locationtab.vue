<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Custom Styled Tabs -->
        <v-tabs
          v-model="currentTab"
          show-arrows
          background-color="transparent"
          @update:modelValue="navigateTo"
          class="custom-tabs"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.name"
            :value="tab.name"
            :disabled="!hasAccess(tab.meta.roles)"
            class="custom-tab"
          >
            {{ tab.label }}
          </v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <v-card class="tab-content-wrapper" elevation="0">
          <router-view></router-view>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const currentTab = ref("");
const userRoles = ref(["Admin"]); // Example: Replace with actual user roles from auth system
const tabs = ref([
  {
    path: "/organization/orgmainui",
    name: "orgmainui",
    label: "Clients",
    meta: { roles: ["Admin", "Manager", "Employee"] },
  },
  {
    path: "/organization/org_location",
    name: "org_location",
    label: "Sites",
    meta: { roles: ["Admin", "Manager", "Employee"] },
  },
  // {
  //   path: "/taskManagement/Map/livetracking",
  //   name: "livetrack",
  //   label: "Map View",
  //   meta: { roles: ["Admin", "Manager"] },
  // },
  // {
  //   path: "settings/configuration",
  //   name: "department-configuration",
  //   label: "Department Configuration",
  //   meta: { roles: ["Admin", "Dealer", "Manager"] },
  // },
]);

const hasAccess = (allowedRoles) => {
  return allowedRoles.some((role) => userRoles.value.includes(role));
};

const navigateTo = (tabName) => {
  const tab = tabs.value.find((t) => t.name === tabName);
  if (tab && hasAccess(tab.meta.roles)) {
    router.push({ name: tabName });
  }
};

const initializeCurrentTab = () => {
  const currentRouteName = route.name;
  console.log("Current route:", currentRouteName); // Debug log

  const matchingTab = tabs.value.find((tab) => tab.name === currentRouteName);

  if (matchingTab && hasAccess(matchingTab.meta.roles)) {
    currentTab.value = currentRouteName;
    console.log("Setting current tab to:", currentRouteName); // Debug log
  } else {
    // Default to 'org_location' if accessible
    const orgLocationTab = tabs.value.find(
      (tab) => tab.name === "org_location",
    );
    if (orgLocationTab && hasAccess(orgLocationTab.meta.roles)) {
      currentTab.value = "org_location";
      console.log("Defaulting to org_location tab"); // Debug log
      if (!matchingTab) {
        router.push({ name: "org_location" });
      }
    } else {
      // Fallback to first accessible tab
      const accessibleTab = tabs.value.find((tab) => hasAccess(tab.meta.roles));
      if (accessibleTab) {
        currentTab.value = accessibleTab.name;
        console.log("Falling back to:", accessibleTab.name); // Debug log
        router.push({ name: accessibleTab.name });
      }
    }
  }
};

watch(
  () => route.name,
  (newName) => {
    console.log("Route changed to:", newName); // Debug log
    if (tabs.value.some((tab) => tab.name === newName)) {
      currentTab.value = newName;
      console.log("Updating current tab to:", newName); // Debug log
    }
  },
);

onMounted(() => {
  console.log("LocationTabs mounted"); // Debug log
  initializeCurrentTab();
});
</script>

<style scoped>
/* tab design */

.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}

.custom-tabs {
  background-color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  border-radius: 10;
  background-color: #ecfdf5;
  color: #122f68 !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: #059367 !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* Icon styles */
.custom-tab .v-icon {
  color: #122f68 !important;
  opacity: 0.8;
}
.v-tab--selected .v-icon {
  color: white !important;
  opacity: 1;
}

/* Content below tabs */
.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
  padding: 16px;
}
::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>

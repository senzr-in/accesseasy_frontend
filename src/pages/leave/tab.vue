<template>
  <v-container fluid>
    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      class="custom-tabs"
    >
      <v-tab
        v-for="tab in visibleTabs"
        :key="tab.name"
        :value="tab.name"
        class="custom-tab"
        :disabled="loading"
        @click="navigateTo(tab.name)"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-card flat class="tab-content-wrapper">
      <v-card-text>
        <router-view v-if="!loading && activeTab"></router-view>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const router = useRouter();
const route = useRoute();
const activeTab = ref(null);
const userRole = ref(null);
const loading = ref(true);

const tabs = [
  {
    name: "leavePermission",
    label: "Leave Permissions",
    icon: "mdi-account-check",
    roles: ["Admin"],
  },
  {
    name: "table",
    label: "Leave Requests",
    icon: "mdi-calendar-clock",
    roles: ["Employee"],
  },
];

const visibleTabs = computed(() => {
  if (!userRole.value) return [];
  return tabs.filter((tab) => tab.roles.includes(userRole.value));
});

// Watch route changes to sync active tab
watch(
  () => route.name,
  (newName) => {
    // Only update activeTab if it's a child route, not the parent
    if (
      newName &&
      newName !== "leaveTab" &&
      tabs.find((t) => t.name === newName)
    ) {
      activeTab.value = newName;
    }
  },
);

const navigateTo = async (tabName) => {
  if (route.name === tabName) return;

  try {
    await router.push({ name: tabName });
  } catch (err) {
    if (err.name !== "NavigationDuplicated") {
      console.error("Navigation error:", err);
    }
  }
};

const getDefaultTabName = (role) => {
  return role === "Admin" ? "leavePermission" : "table";
};

const initializeTab = async () => {
  try {
    loading.value = true;

    // Fetch user details
    const userData = await currentUserTenant.fetchLoginUserDetails();
    userRole.value = userData.role?.name || "Employee";

    console.log("User Role:", userRole.value);
    console.log("Current Route:", route.name, route.path);

    // Get default tab for user role
    const defaultTabName = getDefaultTabName(userRole.value);

    // Wait for next tick to ensure DOM is ready
    await nextTick();

    // Check if we're on parent route or invalid child route
    if (route.name === "leaveTab" || !route.name) {
      // We're on parent route, navigate to default child
      console.log("Navigating to default tab:", defaultTabName);
      activeTab.value = defaultTabName;
      await router.replace({ name: defaultTabName });
    } else {
      // We're on a child route, check if user has access
      const currentTab = tabs.find((t) => t.name === route.name);

      if (currentTab && currentTab.roles.includes(userRole.value)) {
        // User has access to current route
        console.log("User has access to current route:", route.name);
        activeTab.value = route.name;
      } else {
        // User doesn't have access, redirect to default
        console.log("User lacks access, redirecting to:", defaultTabName);
        activeTab.value = defaultTabName;
        await router.replace({ name: defaultTabName });
      }
    }
  } catch (error) {
    console.error("Error initializing tabs:", error);
    userRole.value = "Employee";
    activeTab.value = "table";
    await router.replace({ name: "table" });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await initializeTab();
});
</script>

<style scoped>
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

.v-tab--selected.custom-tab {
  background-color: #059367 !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.custom-tab .v-icon {
  color: #122f68 !important;
  opacity: 0.8;
}

.v-tab--selected .v-icon {
  color: white !important;
  opacity: 1;
}

.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
}

::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>

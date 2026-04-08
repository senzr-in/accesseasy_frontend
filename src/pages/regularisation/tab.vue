<template>
  <v-container fluid>
    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      class="custom-tabs"
      @update:modelValue="handleTabChange"
    >
      <v-tab
        v-for="tab in visibleTabs"
        :key="tab.value"
        :value="tab.value"
        :to="tab.route"
        class="custom-tab"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Render Child Routes -->
    <router-view
      @showAddPage="() => navigateToAdd(activeTab.value)"
      @showEditPage="(item) => handleShowEdit(activeTab.value, item)"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const router = useRouter();
const route = useRoute();

const userRole = ref(null);
const tenantId = ref(null);

const tabs = ref([
  {
    value: "regularisationRequest",
    title: "Regularisation",
    icon: "mdi-calendar-check",
    route: "/regularisation/regularisationRequest",
    roles: ["Manager", "Employee", "Admin"],
  },
  {
    value: "regularisationPermission",
    title: "Regularisation Permission",
    icon: "mdi-account-check",
    route: "/regularisation/regularisationPermission",
    roles: ["Admin", "Manager", "Dealer", "accessManager", "Employee"],
  },
  {
    value: "requestFile",
    title: "My Request",
    icon: "mdi-file-document",
    route: "/regularisation/requestFile",
    roles: ["Admin", "Manager", "Employee"],
  },
]);

// Compute visible tabs based on user role
const visibleTabs = computed(() => {
  if (!userRole.value) return [];
  const allowedRoles = ["Admin", "Manager", "Employee", "accessManager"];
  if (allowedRoles.includes(userRole.value)) {
    return tabs.value.filter((tab) => tab.roles.includes(userRole.value));
  }
  return [];
});

// Sync active tab with current route
const activeTab = computed({
  get() {
    const currentRoute = route.path;
    const tab = tabs.value.find((tab) => tab.route === currentRoute);
    return tab ? tab.value : "regularisationRequest";
  },
  set(newValue) {
    const tab = tabs.value.find((tab) => tab.value === newValue);
    if (tab) {
      router.push(tab.route);
    }
  },
});

// Navigate to the add page for the tab
const navigateToAdd = (tabValue) => {
  if (tabValue === "regularisationRequest") {
    router.push("/regularisation/regularisationRequest/add");
  }
};

// Handle edit page (if needed)
const handleShowEdit = (tabValue, item) => {
  // Add logic for edit route if needed, e.g.:
  // router.push(`/regularisation/${tabValue}/edit/${item.id}`);
  console.log("Edit item:", item); // Placeholder for edit logic
};

// Fetch user role and tenant ID on mount
onMounted(async () => {
  try {
    const userData = await currentUserTenant.fetchLoginUserDetails();
    userRole.value = userData.role?.name || "Employee";
    tenantId.value = userData.tenantId;

    // Redirect to default tab if current route is invalid
    if (!tabs.value.some((tab) => tab.route === route.path)) {
      router.push("/regularisation/regularisationRequest");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    userRole.value = "Employee";
    router.push("/regularisation/regularisationRequest");
  }
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
  background-color: #e8edff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  background-color: white;
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
  background-color: #122f68 !important;
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
  padding: 16px;
}

::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>

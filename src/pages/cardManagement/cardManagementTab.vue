<template>
  <div class="card-management-tabs">
    <!-- Tabs Navigation -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      @update:modelValue="handleTabChange"
      class="custom-tabs"
    >
      <v-tab
        v-for="tab in availableTabs"
        :key="tab.name"
        :value="tab.value"
        class="custom-tab"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-card class="tab-content-wrapper" elevation="0">
      <v-window v-model="activeTab">
        <v-window-item
          v-for="tab in availableTabs"
          :key="tab.name"
          :value="tab.value"
        >
          <router-view />
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "CardManagementTabs",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const activeTab = ref(0);

    const tabs = [
      {
        title: "Employee Card Details",
        name: "card-details",
        route: "/card-management/cards",
        icon: "mdi-card-account-details",
        value: 0,
        roles: ["Admin", "Manager", "esslAdmin"],
      },
      {
        title: "Cards Details",
        name: "import-cards",
        route: "/card-management/import",
        icon: "mdi-import",
        value: 1,
        roles: ["Admin", "esslAdmin"],
      },
    ];

    const availableTabs = computed(() => {
      // Filter tabs based on user role (you'll need to get user role from your auth service)
      const userRole = "Admin"; // Replace with actual user role from your auth service
      return tabs.filter((tab) => tab.roles.includes(userRole));
    });

    const handleTabChange = (newValue) => {
      const tab = availableTabs.value.find((t) => t.value === newValue);
      if (tab && route.name !== tab.name) {
        router.push(tab.route);
      }
    };

    const updateActiveTabFromRoute = () => {
      const currentRouteName = route.name;
      const tab = availableTabs.value.find(
        (tab) => tab.name === currentRouteName
      );
      if (tab) {
        activeTab.value = tab.value;
      }
    };

    // Update active tab based on current route
    watch(
      () => route.name,
      () => {
        updateActiveTabFromRoute();
      }
    );

    onMounted(() => {
      updateActiveTabFromRoute();
    });

    return {
      activeTab,
      availableTabs,
      handleTabChange,
    };
  },
};
</script>

<style scoped>
.card-management-tabs {
  width: 100%;
  padding: 0;
}

.custom-tabs {
  background-color: transparent; /* Changed from white to transparent for a cleaner look */
  padding: 8px 0 8px; /* Adjusted padding */
  border-bottom: none;
}

.custom-tab {
  border-radius: 8px; /* Rounded all corners for pill shape */
  background-color: #fff; /* White background for inactive */
  color: #64748b !important; /* Softer text color */
  border: 1px solid #e2e8f0; /* Subtle border */
  margin-right: 12px;
  min-height: 36px; /* Reduced height */
  height: 36px;
  transition: all 0.2s ease;
  text-transform: capitalize;
  font-weight: 600;
  font-size: 13px; /* Reduced font size */
  letter-spacing: 0.3px;
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: #122f68 !important; /* Dark blue for active state */
  color: #ffffff !important;
  border-color: #122f68;
  box-shadow: 0 4px 12px rgba(18, 47, 104, 0.15);
  transform: translateY(-1px);
}

.custom-tab:hover {
  background-color: #f8fafc !important; /* Subtle hover effect */
  color: #122f68 !important;
}

.custom-tab:hover .v-icon {
  color: #122f68 !important;
  opacity: 1;
}

/* Icon styles */
.custom-tab .v-icon {
  color: #64748b !important;
  font-size: 18px; /* Smaller icons */
  opacity: 1;
}
.v-tab--selected .v-icon {
  color: #ffffff !important;
}

/* Content below tabs */
.tab-content-wrapper {
  border-radius: 12px;
  background: white;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* Subtle shadow */
  border: 1px solid #f1f5f9;
}

:deep(.v-tab.v-btn) {
  height: 36px !important; /* Force height */
  border-radius: 8px !important;
  min-width: auto !important; /* Allow smaller width */
  padding: 0 16px; /* Comfortable padding */
}

:deep(.v-window) {
  background: transparent;
}
</style>

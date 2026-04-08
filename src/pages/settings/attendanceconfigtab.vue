<template>
  <v-container fluid>
    <!-- Styled Tabs -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      class="custom-tabs"
      @update:modelValue="handleTabChange"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="custom-tab"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Router view for nested routes -->
    <router-view v-slot="{ Component }">
      <component
        :is="Component"
        @showAddPage="handleShowAdd"
        @showEditPage="handleShowEdit"
        @closeAddPage="handleClose"
        @closeEditPage="handleClose"
      />
    </router-view>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

/**
 * 🧭 Tabs configuration for Attendance, Holidays, and Shifts
 */
const tabs = [
  {
    value: "ShiftSettings",
    title: "Shift Settings",
    icon: "mdi-clock-outline",
    routeName: "ShiftSettings",
  },
  {
    value: "attendance-cycle",
    title: "Attendance Cycle",
    icon: "mdi-calendar-clock",
    routeName: "attendance-cycle",
  },

  {
    value: "HolidaySettings",
    title: "Holiday Settings",
    icon: "mdi-palm-tree",
    routeName: "HolidaySettings",
  },
];

const activeTab = ref("ShiftSettings");

/**
 * Ensure the correct tab highlights when page loads
 */
onMounted(() => {
  console.log("Route on mount:", route.name, route.path);
  updateActiveTabFromRoute();
});

/**
 * Update active tab based on current route
 */
const updateActiveTabFromRoute = () => {
  const currentRouteName = route.name;

  // Find the tab that matches the current route
  const matchingTab = tabs.find((tab) => tab.routeName === currentRouteName);

  if (matchingTab) {
    activeTab.value = matchingTab.value;
  } else if (route.name === "attendanceconfigtab") {
    // If we're at the parent route, redirect to first child
    router.push({ name: tabs[0].routeName });
  }
};

/**
 * Sync tab selection when user changes tabs
 */
watch(activeTab, (newValue) => {
  const matchingTab = tabs.find((tab) => tab.value === newValue);
  if (matchingTab && matchingTab.routeName !== route.name) {
    router.push({ name: matchingTab.routeName });
  }
});

watch(
  () => route.name,
  (newValue) => {
    console.log("Route changed to:", newValue);
    updateActiveTabFromRoute();
  },
  { immediate: true },
);

const handleTabChange = (newValue) => {
  const matchingTab = tabs.find((tab) => tab.value === newValue);
  if (matchingTab) {
    router.push({ name: matchingTab.routeName });
  }
};

const handleShowAdd = () => {
  router.push({ name: `${route.name}-add` });
};

const handleShowEdit = (item) => {
  router.push({ name: `${route.name}-edit`, params: { id: item.id } });
};

const handleClose = () => {
  // Go back to the current route's base view
  const currentRouteName = route.name;
  router.push({ name: currentRouteName });
};
</script>

<style scoped>
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}

.custom-tabs {
  background-color: #dee8f1;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  background-color: white;
  color: black !important;
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
  background-color: #122f68 !important;
  color: #ffffff !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* Disabled tab style */
.custom-tab.v-tab--disabled {
  color: #ccc !important;
  cursor: not-allowed;
  opacity: 0.6;
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

<!-- src/page/taskmanagmnet/task/workOrderTabs.vue -->
<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Styled Tabs -->
        <v-tabs
          v-model="activeTab"
          show-arrows
          background-color="transparent"
          class="custom-tabs"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="custom-tab"
            @click="handleTabClick(tab.value)"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <!-- Routed View -->
        <v-card class="tab-content-wrapper" elevation="0">
          <router-view></router-view>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = [
  {
    value: "workorder",
    title: "Work Orders",
    icon: "mdi-clipboard-check-outline",
  },
  // {
  //   value: "fieldtrip",
  //   title: "Field Trips",
  //   icon: "mdi-map-marker-radius-outline",
  // },
  // {
  //   value: "workflow",
  //   title: "Smart Forms",
  //   icon: "mdi-form-textbox",
  // },
];

const activeTab = ref("workorder");

const determineActiveTab = () => {
  const currentPath = route.path.toLowerCase();
  if (currentPath.includes("fieldtrip")) {
    return "fieldtrip";
  } else if (currentPath.includes("workflow")) {
    return "workflow";
  } else {
    return "workorder";
  }
};

const handleTabClick = (tabValue) => {
  console.log("[v0] Tab clicked:", tabValue);
  activeTab.value = tabValue;

  if (tabValue === "fieldtrip") {
    router.push({ name: "WorkOrderFieldTrip" });
  } else if (tabValue === "workflow") {
    router.push({ name: "workflow" });
  } else {
    router.push({ name: "WorkOrderTasks" });
  }
};

onMounted(() => {
  activeTab.value = determineActiveTab();
  console.log("[v0] Initial active tab set to:", activeTab.value);
});

watch(
  () => route.path,
  (newPath) => {
    const newActiveTab = determineActiveTab();
    if (activeTab.value !== newActiveTab) {
      activeTab.value = newActiveTab;
      console.log("[v0] Route changed, active tab updated to:", newActiveTab);
    }
  },
  { immediate: true },
);

watch(activeTab, (newValue, oldValue) => {
  console.log("[v0] Active tab changed from", oldValue, "to", newValue);
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
  font-size: medium;
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

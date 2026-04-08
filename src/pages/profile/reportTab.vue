<template>
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
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Routed View -->
    <v-card class="tab-content-wrapper" elevation="0">
      <router-view />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = [
  {
    value: "workordergenerate",
    title: "Download Report",
    icon: "mdi-file-chart",
  },
   {
    value: "CompanyReport",
    title: "Company Report",
    icon: "mdi-file-chart",
  },
];

const activeTab = ref(route.name);

// Watch for manual tab changes → update route
watch(activeTab, (newValue) => {
  if (newValue !== route.name) {
    router.push({ name: newValue });
  }
});

// Watch for route changes → update selected tab
watch(
  () => route.name,
  (newValue) => {
    activeTab.value = newValue;
  },
);
</script>

<style scoped>
/* Container reset */
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}

/* Tabs wrapper */
.custom-tabs {
  background-color: #dee8f1;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

/* Individual Tab */
.custom-tab {
  border-radius: 10px;
  background-color: #122f68;
  color: white !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
}

/* Selected Tab */
.v-tab--selected.custom-tab {
  background-color: white !important;
  color: #68ade1 !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* Icon styles */
.custom-tab .v-icon {
  color: white !important;
  opacity: 0.8;
}
.v-tab--selected .v-icon {
  color: #68ade1 !important;
  opacity: 1;
}

/* Routed content below tabs */
.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
  padding: 16px;
}

/* Deep tab padding */
::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>

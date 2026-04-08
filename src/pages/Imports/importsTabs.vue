<template>
  <v-container fluid>
    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      @update:modelValue="handleTabChange"
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

    <!-- Tab Content -->
    <v-card class="tab-content-wrapper" elevation="0">
      <router-view></router-view>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = ref([
  {
    value: "importDetails",
    title: "Imported Details",
    icon: "mdi-cash",
  },
]);

const activeTab = ref(route.name);

const handleTabChange = (newValue) => {
  if (newValue !== route.name) {
    router.push({ name: newValue });
  }
};

watch(
  () => route.name,
  (newValue) => {
    activeTab.value = newValue;
  },
  { immediate: true },
);
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

::v-deep(.v-tab.v-btn) {
  height: 36px !important; /* Force height */
  border-radius: 8px !important;
  min-width: auto !important; /* Allow smaller width */
  padding: 0 16px; /* Comfortable padding */
}
</style>

<template>
  <div class="face-embedding-container">
    <div class="tabs-container">
      <v-tabs
        v-model="activeTab"
        show-arrows
        background-color="transparent"
        class="custom-tabs"
      >
        <v-tab value="ai" class="custom-tab">
          <v-icon start>mdi-robot</v-icon>
          AI Face Embedding
        </v-tab>
        <v-tab value="mobile" class="custom-tab">
          <v-icon start>mdi-cellphone</v-icon>
          Mobile Face Embedding
        </v-tab>
      </v-tabs>
    </div>

    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const activeTab = ref("ai");

// Watch for route changes to update active tab
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes("mobile-face-embedding")) {
      activeTab.value = "mobile";
    } else if (newPath.includes("ai-face-embedding")) {
      activeTab.value = "ai";
    }
  },
  { immediate: true }
);

// Watch for tab changes to navigate
watch(activeTab, (newTab) => {
  if (newTab === "mobile") {
    router.push("/face-embedding/mobile-face-embedding");
  } else if (newTab === "ai") {
    router.push("/face-embedding/ai-face-embedding");
  } else if (newTab === "finger") {
    router.push("/face-embedding/finger-data");
  }
});
</script>

<style scoped>
.face-embedding-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.tabs-container {
  border-bottom: none;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 10;
  flex: none;
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
  min-width: 160px; /* Reduced min-width */
}

/* Active tab style */
:deep(.v-tab--selected.custom-tab) {
  background-color: #122f68 !important; /* Dark blue for active state */
  color: #ffffff !important;
  border-color: #122f68;
  box-shadow: 0 4px 12px rgba(18, 47, 104, 0.15);
  transform: translateY(-1px);
}

/* Icon styles */
:deep(.custom-tab .v-icon) {
  color: #64748b !important;
  font-size: 18px; /* Smaller icons */
  opacity: 1;
}

:deep(.v-tab--selected .v-icon) {
  color: #ffffff !important;
}

.tab-content {
  flex: 1;
  overflow: auto;
  border-radius: 12px;
  background: white;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* Subtle shadow */
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  margin: 0 16px 16px; /* Add margin to separate from edges */
}

/* Tab button styles */
:deep(.v-tab.v-btn) {
  height: 36px !important; /* Force height */
  border-radius: 8px !important;
  min-width: auto !important; /* Allow smaller width */
  padding: 0 16px; /* Comfortable padding */
}

/* Remove old tab styles */
:deep(.v-tab) {
  color: #64748b !important;
}

:deep(.v-tab--selected) {
  color: #ffffff !important;
}

:deep(.v-tabs-slider) {
  display: none; /* Hide slider for pill design */
}

/* Ensure router-view content starts from top */
:deep(.tab-content > *) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

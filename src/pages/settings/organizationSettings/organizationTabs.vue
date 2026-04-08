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
            :to="{ name: tab.value }"
            class="custom-tab"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <!-- Route-specific content -->
        <v-card class="tab-content-wrapper" elevation="0">
          <router-view />
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
   value: "organization-settings",
   title: "Organization Settings",
   icon: "mdi-calendar-clock",
  },
];

const activeTab = ref(null);

onMounted(() => {
  activeTab.value = route.name;
});

watch(activeTab, (newValue) => {
  if (newValue && newValue !== route.name) {
    router.push({ name: newValue });
  }
});

watch(
  () => route.name,
  (newValue) => {
    if (newValue && newValue !== activeTab.value) {
      activeTab.value = newValue;
    }
  }
);
</script>

<style scoped>
/* Container wrapper */
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
  background-color: white;
}

/* Tabs wrapper */
.custom-tabs {
  background-color: transparent; /* Changed from white to transparent for a cleaner look */
  padding: 8px 0 8px; /* Adjusted padding */
  border-bottom: none;
}

/* Individual Tab (inactive) */
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

/* Active Tab Styling */
.v-tab--selected.custom-tab {
  background-color: #122f68 !important; /* Dark blue for active state */
  color: #ffffff !important;
  border-color: #122f68;
  box-shadow: 0 4px 12px rgba(18, 47, 104, 0.15);
  transform: translateY(-1px);
}

/* Icon style */
.custom-tab .v-icon {
  color: #64748b !important;
  font-size: 18px; /* Smaller icons */
  opacity: 1;
}
.v-tab--selected .v-icon {
  color: #ffffff !important;
}

/* Routed content container */
.tab-content-wrapper {
  border-radius: 12px;
  background: white;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* Subtle shadow */
  border: 1px solid #f1f5f9;
  height: 85vh;
}

/* Optional: improve tab size consistency */
::v-deep(.v-tab.v-btn) {
  height: 36px !important; /* Force height */
  border-radius: 8px !important;
  min-width: auto !important; /* Allow smaller width */
  padding: 0 16px; /* Comfortable padding */
}
</style>

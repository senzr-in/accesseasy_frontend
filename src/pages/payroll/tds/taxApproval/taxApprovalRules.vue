<template>
  <v-main>
    <v-card flat class="tab-container">
      <v-card-text class="pa-0">
        <v-tabs
          v-model="activeTab"
          background-color="white"
          color="primary"
          class="professional-tabs"
          height="64"
          show-arrows
        >

        <v-btn
  icon
  @click="$router.push('/payroll/tds/approval')"
  class="ma-2"
>
  <v-icon>mdi-arrow-left</v-icon>
</v-btn>
          <v-tab
            v-for="tab in tabs"
            :key="tab.route"
            :value="tab.route"
            class="professional-tab text-none"
            @click="goTo(tab.route)"
          >
            <v-icon
              :color="activeTab === tab.route ? 'primary' : 'grey-darken-1'"
              size="20"
              start
            >
              {{ tab.icon }}
            </v-icon>
            <span
              class="tab-label"
              :class="{ 'active-label': activeTab === tab.route }"
            >
              {{ tab.label }}
            </span>
          </v-tab>
        </v-tabs>

        <v-divider class="tab-divider"></v-divider>
      </v-card-text>
    </v-card>

    <router-view />
  </v-main>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const id = route.params.id;
const activeTab = ref(route.path);

const tabs = [
  { label: "TDS Summary", route: `/payroll/tds/approval/${id}/tds-summary`, icon: "mdi-calculator" },
  { label: "Declare", route: `/payroll/tds/approval/${id}/declare`, icon: "mdi-plus" },
  // { label: "Review", route: `/payroll/tds/approval/${id}/review`, icon: "mdi-check-circle-outline" },
];

watch(
  () => route.path,
  (newPath) => {
    activeTab.value = newPath;
  },
  { immediate: true },
);

const goTo = (path) => {
  if (route.path !== path) {
    router.push(path);
  }
};
</script>

<style scoped>
.tab-container {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
}

.professional-tabs {
  border-bottom: none;
}

.professional-tab {
  min-height: 64px !important;
  padding: 0 24px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  border-radius: 0 !important;
  position: relative;
}

.professional-tab:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.professional-tab.v-tab--selected {
  background-color: rgba(25, 118, 210, 0.08) !important;
  color: #1976d2 !important;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #616161;
}

.active-label {
  color: #1976d2 !important;
  font-weight: 600 !important;
}

.tab-divider {
  border-color: #e0e0e0;
  opacity: 1;
}

.content-area {
  background-color: #fafafa;
  min-height: calc(100vh - 64px);
}

.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Custom tab indicator */
.v-tabs :deep(.v-slide-group__content) {
  border-bottom: 2px solid #e0e0e0;
}

.v-tabs :deep(.v-tab--selected) {
  border-bottom: 3px solid #1976d2;
}

/* Smooth transitions */
.v-fade-transition-enter-active,
.v-fade-transition-leave-active {
  transition: opacity 0.3s ease;
}

.v-fade-transition-enter-from,
.v-fade-transition-leave-to {
  opacity: 0;
}
</style>

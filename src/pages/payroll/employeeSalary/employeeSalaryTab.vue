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
        v-for="tab in filteredTabs"
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
      <router-view />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const router = useRouter();
const route = useRoute();
const userRole = ref("");
const activeTab = ref(route.name);

const allTabs = [
  {
    value: "SalaryDetailsTab",
    title: "Salary Details",
    icon: "mdi-clipboard-text-clock",
  },
  {
    value: "BankDetailsTab",
    title: "Bank Details",
    icon: "mdi-clipboard-text-clock",
  },
  {
    value: "PolicyTab",
    title: "Policy",
    icon: "mdi-file-document-box",
  },
];

const filteredTabs = computed(() => {
  if (userRole.value === "Manager" || userRole.value === "Employee") {
    return allTabs.filter((tab) => tab.value !== "userActivity-logs");
  }
  return allTabs;
});

onMounted(async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  userRole.value = userData.role.name;
  activeTab.value = route.name;
});

const handleTabChange = (newValue) => {
  if (newValue !== route.name) {
    router.push({ name: newValue });
  }
};

watch(
  () => route.name,
  (newValue) => {
    if (newValue !== activeTab.value) {
      activeTab.value = newValue;
    }
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

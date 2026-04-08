<template>
  <v-container fluid>
    <!-- Routed Component with Event Emission -->
    <v-card class="content-wrapper" elevation="0">
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          @showAddPage="handleShowAdd"
          @showEditPage="handleShowEdit"
          @closeAddPage="handleClose"
          @closeEditPage="handleClose"
        /> </router-view
    ></v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

/**
 * 🧭 Tabs order updated — Organization first, then Branch, then Department
 */
const tabs = [
  // {
  //   value: "organization-settings",
  //   title: "Organization Settings",
  //   icon: "mdi-office-building-cog",
  // },
];

const activeTab = ref("organization-settings");

/**
 * Ensure the correct tab highlights when page loads
 */
onMounted(() => {
  if (route.name) {
    activeTab.value = route.name;
  }
});

/**
 * Sync tab selection when user changes tabs
 */
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
  },
);

const handleTabChange = (newValue) => {
  router.push({ name: newValue });
};

const handleShowAdd = () => {
  router.push({ name: `${route.name}-add` });
};

const handleShowEdit = (item) => {
  router.push({ name: `${route.name}-edit`, params: { id: item.id } });
};

const handleClose = () => {
  router.push({ name: route.name });
};
</script>

/* Content wrapper */
.content-wrapper {
  border-radius: 12px;
  background: white;
  padding: 16px;
}


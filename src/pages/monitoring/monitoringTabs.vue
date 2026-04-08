<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-tabs v-model="activeTab" color="black" show-arrows>
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :to="{ name: tab.value }"
            style="text-transform: none"
            class="tab-text"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <router-view></router-view>
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
    value: "event-logs",
    title: "Event Logs",
    icon: "mdi-history",
  },
  {
    value: "live-feed",
    title: "Live Feed",
    icon: "mdi-cctv",
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
  },
);
</script>

<style scoped>
.v-container {
  padding: 16px;
}

.v-tabs {
  margin-bottom: 20px;
}

.tab-text {
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
}
</style>

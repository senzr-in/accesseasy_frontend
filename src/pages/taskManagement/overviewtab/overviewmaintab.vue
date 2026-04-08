<template>
  <div class="tabs-container">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="['tab-button', { active: currentTab === tab.name }]"
        @click="navigateTo(tab)"
        :disabled="!hasAccess(tab.meta.roles)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "Tabs",
  data() {
    return {
      currentTab: "", // Initialize as empty
      tabs: [
        {
          path: "/taskManagement/overviewtab/kpi",
          name: "kpi",
          label: "KPI VIEW",
          meta: { roles: ["Admin"] },
        },
        // {
        //   path: '/taskManagement/Map/livetracking',
        //   name: 'livetrack',
        //   label: 'Location management',
        //   meta: { roles: ['Admin'] }
        // }
      ],
    };
  },
  computed: {
    userRoles() {
      return ["Admin"]; // Example: assuming user has Admin role
    },
  },
  methods: {
    navigateTo(tab) {
      if (this.hasAccess(tab.meta.roles)) {
        this.currentTab = tab.name;
        this.$router.push({ name: tab.name });
      }
    },
    hasAccess(allowedRoles) {
      return allowedRoles.some((role) => this.userRoles.includes(role));
    },
    initializeCurrentTab() {
      // Check if current route is one of our tabs
      const currentRouteName = this.$route.name;
      const tabExists = this.tabs.some((tab) => tab.name === currentRouteName);

      if (
        tabExists &&
        this.hasAccess(
          this.tabs.find((tab) => tab.name === currentRouteName).meta.roles,
        )
      ) {
        this.currentTab = currentRouteName;
      } else {
        // Default to 'kpi' if user has access, otherwise to the first accessible tab
        const kpiTab = this.tabs.find((tab) => tab.name === "kpi");
        if (kpiTab && this.hasAccess(kpiTab.meta.roles)) {
          this.currentTab = "kpi";
          this.$router.push({ name: "kpi" });
        } else {
          // Find first accessible tab
          const accessibleTab = this.tabs.find((tab) =>
            this.hasAccess(tab.meta.roles),
          );
          if (accessibleTab) {
            this.currentTab = accessibleTab.name;
            this.$router.push({ name: accessibleTab.name });
          }
        }
      }
    },
  },
  watch: {
    "$route.name"(newName) {
      this.currentTab = newName;
    },
  },
  mounted() {
    this.initializeCurrentTab();
  },
};
</script>

<style scoped>
.tabs-container {
  overflow-y: auto;
  max-height: 80vh;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  font-weight: bold;
}

.tab-button:hover:not(:disabled) {
  color: #0056b3;
}

.tab-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.tab-content {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

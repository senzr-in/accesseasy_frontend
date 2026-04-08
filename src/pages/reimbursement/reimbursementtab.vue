<template>
  <v-container fluid>
    <!-- Styled Tabs -->
    <v-tabs
      v-model="currentTab"
      show-arrows
      background-color="transparent"
      class="custom-tabs"
    >
      <v-tab
        v-for="tab in accessibleTabs"
        :key="tab.name"
        :value="tab.name"
        class="custom-tab"
        @click="navigateTo(tab)"
      >
        <v-icon v-if="tab.icon" :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <!-- Routed Content -->
    <v-card class="tab-content-wrapper" elevation="0">
      <router-view></router-view>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "ReimbursementTab",

  data() {
    return {
      currentTab: "",
      tabs: [
        {
          path: "/reimbursement/reimbursementtab/reimbursement_card",
          name: "reimbursement_card",
          label: "Expense Approvals",
          meta: { roles: ["Admin"] },
          icon: "mdi-cash-multiple",
        },
        // {
        //   path: "/reimbursement/reimbursementtab/reimbursementemp",
        //   name: "reimbursementemp",
        //   label: "Reimbursement Management",
        //   meta: { roles: ["Admin", "Employee"] },
        //   icon: "mdi-account-cog",
        // },
        // {
        //   path: "/reimbursement/reimbursementtab/reimbursement_settings",
        //   name: "reimbursement_settings",
        //   label: "Expense Configuration",
        //   meta: { roles: ["Admin"] },
        //   icon: "mdi-cog",
        // },
        {
          path: "/reimbursement/reimbursementtab/addreimbursement",
          name: "addreimbursement",
          label: "Create Expense",
          meta: { roles: ["Admin", "Employee"] },
          icon: "mdi-cash-multiple",
        },
      ],
    };
  },

  computed: {
    userRoles() {
      return this.$store?.state?.auth?.userRoles || ["Admin"];
    },

    accessibleTabs() {
      return this.tabs.filter((tab) => this.hasAccess(tab.meta.roles));
    },

    currentRouteTab() {
      return this.tabs.find((tab) => tab.name === this.$route.name);
    },
  },

  watch: {
    // When route changes → update selected tab
    "$route.name": {
      handler(newRouteName) {
        this.updateCurrentTab(newRouteName);
      },
      immediate: true,
    },

    // When tab changes → update route
    currentTab(newTab) {
      if (newTab && newTab !== this.$route.name) {
        this.$router.push({ name: newTab });
      }
    },
  },

  mounted() {
    this.initializeTab();
  },

  methods: {
    hasAccess(allowedRoles) {
      if (!allowedRoles || allowedRoles.length === 0) return true;
      return allowedRoles.some((role) => this.userRoles.includes(role));
    },

    updateCurrentTab(routeName) {
      const tab = this.tabs.find((t) => t.name === routeName);
      if (tab && this.hasAccess(tab.meta.roles)) {
        this.currentTab = routeName;
      }
    },

    initializeTab() {
      if (
        this.currentRouteTab &&
        this.hasAccess(this.currentRouteTab.meta.roles)
      ) {
        this.currentTab = this.currentRouteTab.name;
        return;
      }

      const firstAccessibleTab = this.accessibleTabs[0];
      if (firstAccessibleTab) {
        this.currentTab = firstAccessibleTab.name;
        this.$router.push({ name: firstAccessibleTab.name });
        return;
      }

      this.handleNoAccessibleTabs();
    },

    handleNoAccessibleTabs() {
      console.warn("No accessible tabs found for user roles:", this.userRoles);
      this.$emit("no-accessible-tabs", this.userRoles);
    },
  },
};
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

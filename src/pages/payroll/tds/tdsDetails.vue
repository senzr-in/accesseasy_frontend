<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-tabs background-color="primary" dark>
          <v-tab
            v-for="(t, i) in filteredTabs"
            :key="i"
            :to="t.path"
            replace
            exact
          >
            {{ t.name }}
          </v-tab>
        </v-tabs>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const route = useRoute();
const router = useRouter();
const userRole = ref("");

const allTabs = [
  {
    name: "Tax Deduction",
    path: "/payroll/tds/deduction",
    roles: ["Admin", "Employee", "Dealer"],
  },
  // { name: "Tax Approval", path: "/payroll/tds/approval", roles: ["Admin","Dealer"] },
  { name: "Tax Settings", path: "/payroll/tds/taxSetting", roles: ["Admin","Dealer"] },
];

const filteredTabs = ref([]);

const fetchUserRole = async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  userRole.value = userData.role.name;

  filteredTabs.value = allTabs.filter((tab) =>
    tab.roles.includes(userRole.value),
  );
};

onMounted(async () => {
  await fetchUserRole();

  // Redirect to default if at base path
  if (route.path === "/payroll/tds" || route.path === "/payroll/tds/") {
    const defaultTab = filteredTabs.value[0];
    if (defaultTab) {
      router.replace(defaultTab.path);
    }
  }
});
</script>

<style>
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}
.scrollable-content {
  height: calc(100vh - 64px);
  overflow: hidden !important;
}
.tab-text {
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;

}
</style>

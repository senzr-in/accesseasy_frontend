<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col cols="3" class="sidebar">
        <v-list>
          <v-list-item
            v-for="(item, i) in sidebarItems"
            :key="i"
            :value="item"
            :to="
              item.value === 'settings'
                ? `/settings/payroll${item.value}/${lastActiveTab[item.value]}`
                : `/settings/payrollpolicies/${lastActiveTab[item.value]}`
            "
            :active="currentSection === item.value"
            color="black"
            @click="switchSection(item.value)"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="9" class="content">
        <v-card flat class="pa-4">
          <v-tabs
            :key="currentSection"
            v-model="activeTab"
            color="black"
            align-tabs="start"
            active-color="black"
          >
            <v-tab
              v-for="(tab, i) in getCurrentSectionTabs"
              :key="i"
              :value="tab.value"
              @click="switchTab(tab.value)"
            >
              {{ tab.title }}
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="mt-4">
            <v-window-item value="salary-structure">
              <SalaryStructure
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <v-window-item value="contribution">
              <Contribution
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <v-window-item value="deduction">
              <Deduction
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <v-window-item value="assign-employee">
              <AssignEmployee
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>

            <v-window-item value="policy-salary-structure">
              <PolicySalaryStructure
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <v-window-item value="policy-deduction">
              <PolicyDeduction
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <!-- <v-window-item value="bonus">
              <Bonus :key="`${currentSection}-${activeTab}`" />
            </v-window-item>
            <v-window-item value="bonusBenefits">
              <bonusBenefits
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <v-window-item value="incentive">
              <incentive
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item>
            <v-window-item value="retentionPay">
              <retentionPay
                :key="`${currentSection}-${activeTab}`"
                :category="category"
              />
            </v-window-item> -->
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SalaryStructure from "../salary/salarySettings/salaryStructure.vue";
import Contribution from "./salarySettings/contribution.vue";
import Deduction from "./salarySettings/deduction.vue";
import AssignEmployee from "./salarySettings/assignEmployee.vue";
import PolicySalaryStructure from "./salaryPolicy/policySalaryStructure.vue";
import PolicyDeduction from "./salaryPolicy/policyDeduction.vue";
import Bonus from "../salary/salaryPolicy/bonus.vue";
import incentive from "../salary/salaryPolicy/incentive.vue";
import retentionPay from "./salaryPolicy/retentionPay.vue";
import bonusBenefits from "./salaryPolicy/bonusBenefits.vue";

export default {
  name: "SalaryConfiguration",
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  components: {
    SalaryStructure,
    Contribution,
    Deduction,
    AssignEmployee,
    PolicySalaryStructure,
    PolicyDeduction,
    Bonus,
    incentive,
    retentionPay,
    bonusBenefits,
  },
  data() {
    return {
      currentSection: this.$route.params.section || "settings",
      activeTab: this.$route.params.tab || "salary-structure",
      lastActiveTab: {
        settings: "salary-structure",
        policies: "policy-salary-structure",
      },
      sidebarItems: [
        {
          title: "Payroll Settings",
          value: "settings",
          icon: "mdi-cog-outline",
        },
        // {
        //   title: "Payroll Policies",
        //   value: "policies",
        //   icon: "mdi-clipboard-text-outline",
        // },
      ],
      settingsTabs: [
        {
          title: "Payroll Structure",
          value: "salary-structure",
          icon: "mdi-cash",
        },
        {
          title: "Contribution",
          value: "contribution",
          icon: "mdi-account-cash",
        },
        { title: "Deduction", value: "deduction", icon: "mdi-cash-minus" },
        // {
        //   title: "Assign to Employee",
        //   value: "assign-employee",
        //   icon: "mdi-account-cog-outline",
        // },
      ],
      policiesTabs: [
        {
          title: "Payroll Structure",
          value: "policy-salary-structure",
          icon: "mdi-cash-multiple",
        },
        {
          title: "Deduction",
          value: "policy-deduction",
          icon: "mdi-cash-minus",
        },
        // { title: "Bonus & Gratuity",
        //   value: "bonus",
        //   icon: "mdi-gift"
        // },
        // { title: "Bonus", value: "bonusBenefits", icon: "mdi-gift" },
        // { title: "Incentive", value: "incentive", icon: "mdi-gift" },
        // { title: "retentionPay", value: "retentionPay", icon: "mdi-gift" },
      ],
    };
  },
  computed: {
    getCurrentSectionTabs() {
      return this.currentSection === "settings"
        ? this.settingsTabs
        : this.policiesTabs;
    },
  },
  methods: {
    switchSection(section) {
      this.lastActiveTab[this.currentSection] = this.activeTab;
      this.currentSection = section;
      this.activeTab = this.lastActiveTab[section];

      // Navigate to the correct route
      if (section === "settings") {
        this.$router.push({
          path: `/settings/payroll${section}/${this.activeTab}`,
        });
      } else if (section === "policies") {
        this.$router.push({
          path: `/settings/payroll${section}/${this.activeTab}`,
        });
      }
    },
    switchTab(tab) {
      this.activeTab = tab;
      this.lastActiveTab[this.currentSection] = tab;

      if (this.currentSection === "settings") {
        this.$router.push({
          path: `/settings/payroll${this.currentSection}/${tab}`,
        });
      } else if (this.currentSection === "policies") {
        this.$router.push({
          path: `/settings/payroll${this.currentSection}/${tab}`,
        });
      }
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const section = to.params.section;
        const tab = to.params.tab;

        if (section && section !== this.currentSection) {
          this.currentSection = section;
        }
        if (tab && tab !== this.activeTab) {
          this.activeTab = tab;
        }
      },
    },
  },
};
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  height: 100vh;
  overflow-y: auto;
}
.content {
  height: 100vh;
  overflow-y: auto;
}
.v-tab {
  text-transform: none !important;
}
</style>

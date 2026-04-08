<template>
  <v-card flat>
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    <v-card-text v-else>
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex align-center">
          <h3 class="text-h6">Employer Contributions</h3>
        </div>
        <!-- <div class="d-flex">
          <v-btn v-if="!isEditing" color="black" @click="startEdit">
            Edit
          </v-btn>
          <template v-else>
            <v-btn color="black" class="mr-2" @click="saveEdit">Save</v-btn>
            <v-btn color="black" @click="cancelEdit">Cancel</v-btn>
          </template>
        </div> -->
      </div>

      <div class="fields-container">
        <div class="mb-6">
          <!-- Employer PF -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-name">Employer PF</div>
            </v-col>

            <v-col cols="8">
              <v-row class="align-center" v-if="!hasPFAccount">
                <v-col cols="6" class="d-flex align-center">
                  <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
                  <span class="text-red font-weight-bold"
                    >PF Not Available</span
                  >
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-btn color="primary" small @click="this.addAccount()">
                    Add PF Account
                  </v-btn>
                </v-col>
              </v-row>
              <v-row v-if="hasPFAccount">
                <v-col cols="4">
                  <v-checkbox
                    v-model="employerPF.withinCTC"
                    label="Within CTC"
                    class="ml-4"
                    :disabled="!isEditing"
                    density="comfortable"
                    hide-details
                  ></v-checkbox>
                </v-col>

                <v-col cols="4">
                  <v-select
                    :items="[
                      { title: '12% No limit', value: 12 },
                      { title: '12% ₹1800 limit', value: 1800 },
                      { title: 'NoValue', value: null },
                    ]"
                    v-model="employerPF.selectedOption"
                    label="Value"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="ml-4 value-input"
                    :disabled="!isEditing"
                    item-title="title"
                    item-value="value"
                  ></v-select>
                </v-col>

                <v-col cols="4">
                  <v-select
                    :items="employerPF.component"
                    v-model="employerPF.calculations"
                    label="Component"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    multiple
                    :disabled="!isEditing"
                    item-title="title"
                    item-value="value"
                    @update:modelValue="updateCalculations('PF', $event)"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip
                        size="small"
                        label
                        color="grey-lighten-3"
                        class="mr-1"
                      >
                        {{ item.title }}
                      </v-chip>
                    </template>

                    <template v-slot:item="{ item }">
                      <v-list-item
                        class="px-4"
                        @click="toggleSelection('PF', item)"
                      >
                        <template v-slot:prepend>
                          <v-checkbox-btn
                            :model-value="isItemSelected('PF', item)"
                            color="primary"
                            hide-details
                            density="compact"
                          ></v-checkbox-btn>
                        </template>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Employer ESI -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-name">Employer ESI</div>
            </v-col>
            <v-col cols="8">
              <v-row class="align-center" v-if="!hasESIAccount">
                <v-col cols="6" class="d-flex align-center">
                  <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
                  <span class="text-red font-weight-bold"
                    >ESI Not Available</span
                  >
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-btn color="primary" small @click="this.addAccount()">
                    Add ESI Account
                  </v-btn>
                </v-col>
              </v-row>
              <v-row v-if="hasESIAccount">
                <v-col cols="4">
                  <v-checkbox
                    v-model="employerESI.withinCTC"
                    label="Within CTC"
                    class="ml-4"
                    :disabled="!isEditing"
                    density="comfortable"
                    hide-details
                  ></v-checkbox>
                </v-col>

                <v-col cols="4">
                  <v-select
                    :items="[
                      { title: '3.25%', value: 3.25 },
                      { title: 'None', value: null },
                    ]"
                    v-model="employerESI.selectedOption"
                    label="Value"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="ml-4 value-input"
                    :disabled="!isEditing"
                    item-title="title"
                    item-value="value"
                  ></v-select>
                </v-col>

                <v-col cols="4">
                  <v-select
                    :items="employerESI.component"
                    v-model="employerESI.calculations"
                    label="Component"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    multiple
                    :disabled="!isEditing"
                    item-title="title"
                    item-value="value"
                    @update:modelValue="updateCalculations('ESI', $event)"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip
                        size="small"
                        label
                        color="grey-lighten-3"
                        class="mr-1"
                      >
                        {{ item.title }}
                      </v-chip>
                    </template>

                    <template v-slot:item="{ item }">
                      <v-list-item
                        class="px-4"
                        @click="toggleSelection('ESI', item)"
                      >
                        <template v-slot:prepend>
                          <v-checkbox-btn
                            :model-value="isItemSelected('ESI', item)"
                            color="primary"
                            hide-details
                            density="compact"
                          ></v-checkbox-btn>
                        </template>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- PF EDLI & Admin Charges -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-name">PF EDLI & Admin Charges</div>
            </v-col>
            <v-col cols="8">
              <v-row>
                <v-col cols="6">
                  <v-switch
                    v-model="pfEdliEnabled"
                    hide-details
                    density="comfortable"
                    :disabled="!isEditing || employerPF.selectedOption === null"
                    color="success"
                    inset
                  ></v-switch>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-if="adminCharges.enable"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="component-input"
                    readonly
                    :value="adminCharges.charge"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Labour Welfare Fund -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-name">Labour Welfare Fund</div>
            </v-col>
            <v-col cols="8">
              <v-row class="align-center" v-if="!hasShopEstablishment">
                <v-col cols="6" class="d-flex align-center">
                  <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
                  <span class="text-red font-weight-bold"
                    >shopAccount Not Available</span
                  >
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-btn color="primary" small @click="this.addAccount()">
                    Add shop Account
                  </v-btn>
                </v-col>
              </v-row>
              <v-row class="align-center" v-else>
                <v-col cols="6" class="d-flex align-center">
                  <v-icon color="grey-darken-1" class="mr-2"
                    >mdi-information-outline</v-icon
                  >
                  <span class="text-grey-darken-1"
                    >value based on stateRules</span
                  >
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-card-text>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="2000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { onMounted } from "vue";

export default {
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    onMounted(() => {
      console.log(JSON.stringify(props.category));
    });
  },
  data() {
    return {
      lwfData: null,
      tenantId: null,
      hasPFAccount: false,
      hasESIAccount: true,
      hasShopEstablishment: false,
      lwfInfoDialog: false,
      pfEdliEnabled: false,
      apiData: null,
       loading: true,
      state: null,
      token: authService.getToken(),
      isEditing: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "error",
      employerPF: {
        options: [],
        calculations: [],
        selectedOption: null,
        component: [],
        initialCalculations: [],
      },
      employerESI: {
        options: [],
        calculations: [],
        selectedOption: null,
        component: [],
        initialCalculations: [],
      },
      adminCharges: {
        enable: false,
        charge: "1",
      },
      initiallySelectedOptions: {
        PF: [],
        ESI: [],
      },
      initialSelectedCalculations: {
        PF: [],
        ESI: [],
      },
    };
  },
  watch: {
    pfEdliEnabled(newValue) {
      this.adminCharges.enable = newValue;
    },
    "employerPF.selectedOption"(newVal) {
      if (newVal === null) {
        this.pfEdliEnabled = false;
      }
    },
  },

  computed: {
    lwfSummary() {
      if (!this.lwfData) return "Not available";
      const firstRule = this.lwfData.stateTaxRules[0];
      return `₹${firstRule.laborWelfareFund} (${this.lwfData.state})`;
    },
    lwfDetails() {
      if (!this.lwfData) return "LWF details not available";
      return this.lwfData.stateTaxRules
        .map(
          (rule) =>
            `${rule.salaryRange}: PT ₹${rule.professionalTax}, LWF ₹${rule.laborWelfareFund}`,
        )
        .join("\n");
    },
  },
  methods: {
    addAccount() {
      this.$router.push("/settings/organization/organization-settings");
    },
    showLWFInfoDialog() {
      this.lwfInfoDialog = true;
    },
    async user() {
      const userData = await currentUserTenant.getTenantId();
      this.tenantId = userData;
      console.log("Tenant ID:", this.tenantId);
      return userData;
    },
    async fetchTenant() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${
            this.tenantId
          }`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );
        const data = await response.json();
        this.hasPFAccount = data.data.some((tenant) => tenant.pfAccount);
        this.hasESIAccount = data.data.some((tenant) => {
          const esiAccountsFromApi = tenant.esiAccountNumber || [];

          return esiAccountsFromApi.some((acc) => acc.state === this.state);
        });

        this.hasShopEstablishment = data.data.some(
          (tenant) => tenant.shopAccount,
        );
      } catch (error) {
        console.error("Error fetching shop establishment data:", error);
      }
    },
    async fetchData() {
      
      try {
        this.loading= true;
        const fields = [
          "employersContributions",
          "adminCharges",
          "LWF.state",
          "LWF.stateTaxRules",

          "earnings",
          "basicPay",
          "id",
        ];

        const queryString = [
          ...fields.map((field) => `fields[]=${field}`),
          `filter[id][_eq]=${this.category.id}`,
        ].join("&");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting?${queryString}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        this.apiData = data.data;
        this.state = this.apiData[0].LWF?.state;

        this.processConfigData();
        await this.fetchTenant();
        this.loading= false;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    processConfigData() {
      if (!this.apiData || !this.apiData.length) {
        console.log("No API data available");
        return;
      }

      const config = this.apiData[0];
      if (config.adminCharges) {
        this.adminCharges = config.adminCharges;
        this.pfEdliEnabled = config.adminCharges.enable;
      }

      // Process EmployerPF component
      if (config.employersContributions?.EmployerPF) {
        if (config.earnings) {
          const uniqueComponents = new Map();
          config.earnings.forEach((earning) => {
            uniqueComponents.set(earning.name, {
              title: earning.name,
              value: earning.name,
            });
          });
          this.employerPF.component = Array.from(uniqueComponents.values());
        }

        const uniquePFNames = new Set();
        this.employerPF.calculations =
          config.employersContributions.EmployerPF.Calculations.filter(
            (calc) => {
              if (!uniquePFNames.has(calc.name)) {
                uniquePFNames.add(calc.name);
                return true;
              }
              return false;
            },
          ).map((calc) => calc.name);

        this.employerPF.selectedOption =
          config.employersContributions.EmployerPF.selectedOption || null;
        this.employerPF.withinCTC =
          config.employersContributions.EmployerPF.withinCTC ?? false;
        this.employerPF.initialCalculations = [...this.employerPF.calculations];
      }

      // ESI
      if (config.employersContributions?.EmployerESI) {
        if (config.earnings) {
          const uniqueComponents = new Map();
          config.earnings.forEach((earning) => {
            uniqueComponents.set(earning.name, {
              title: earning.name,
              value: earning.name,
            });
          });
          this.employerESI.component = Array.from(uniqueComponents.values());
        }

        const uniqueESINames = new Set();
        this.employerESI.calculations =
          config.employersContributions.EmployerESI.Calculations.filter(
            (calc) => {
              if (!uniqueESINames.has(calc.name)) {
                uniqueESINames.add(calc.name);
                return true;
              }
              return false;
            },
          ).map((calc) => calc.name);

        this.employerESI.selectedOption =
          config.employersContributions.EmployerESI.selectedOption || null;
        this.employerESI.withinCTC =
          config.employersContributions.EmployerESI.withinCTC ?? false;
        this.employerESI.initialCalculations = [
          ...this.employerESI.calculations,
        ];
      }

      if (config.LWF) {
        this.lwfData = config.LWF;
      }
    },
    async saveEdit() {
      try {
        const payload = {
          employersContributions: {
            EmployerPF: {
              selectedOption: this.employerPF.selectedOption,
              withinCTC: this.employerPF.withinCTC,
              options: [
                { label: "percentage", value: 12 },
                { label: "Minimum amount", value: 1800 },
                { label: "No Value", value: null },
              ],
              Calculations: this.removeDuplicateCalculations("PF"),
            },
            EmployerESI: {
              selectedOption: this.employerESI.selectedOption,
              withinCTC: this.employerESI.withinCTC,
              options: [
                { label: "percentage", value: 3.25 },
                { label: "No Value", value: null },
              ],
              Calculations: this.removeDuplicateCalculations("ESI"),
            },
          },
          adminCharges: {
            enable: this.pfEdliEnabled,
            charge: this.adminCharges.charge,
          },
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting/${
            this.category.id
          }`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }

        this.isEditing = false;
        this.snackbarText = "Changes saved successfully";
        this.snackbarColor = "success";
        this.snackbar = true;
        await this.fetchData();
      } catch (error) {
        console.error("Error saving data:", error);
      }
    },
    removeDuplicateCalculations(type) {
      const calculations =
        type === "PF"
          ? this.employerPF.calculations
          : this.employerESI.calculations;
      const uniqueNames = new Set();
      const filteredCalculations = calculations
        .map((name) => {
          const percentage = this.getPercentageFromEarnings(name);
          console.log(
            `${type} Calculation - Name: ${name}, Percentage: ${percentage}`,
          );
          return { name, percentage };
        })
        .filter((calc) => {
          if (!uniqueNames.has(calc.name)) {
            uniqueNames.add(calc.name);
            return true;
          }
          return false;
        });

      // Add Basic Pay calculation if not already included
      if (!uniqueNames.has("Basic Pay")) {
        filteredCalculations.push({
          name: "Basic Pay",
          percentage: this.apiData[0].basicPay,
        });
      }

      console.log("Final Filtered Calculations:", filteredCalculations);
      return filteredCalculations;
    },

    getPercentageFromEarnings(name) {
      if (name === "Basic Pay") {
        console.log(
          `getPercentageFromEarnings - Name: Basic Pay, Percentage: ${this.apiData[0].basicPay}`,
        );
        return this.apiData[0].basicPay;
      }

      if (
        !this.apiData[0].earnings ||
        !Array.isArray(this.apiData[0].earnings)
      ) {
        console.error(
          "Error: category.earnings is null or not an array",
          this.apiData[0].earnings,
        );
        return 0;
      }

      const earning = this.apiData[0].earnings.find((e) => e.name === name);
      const percentage = earning ? earning.percentage : 0;
      console.log(
        `getPercentageFromEarnings - Name: ${name}, Percentage: ${percentage}, Raw Earning:`,
        earning,
      );
      return percentage;
    },

    showInfo() {
      this.lwfInfoDialog = !this.lwfInfoDialog;
    },

    updateCalculations(type, newValues) {
      const calculations = type === "PF" ? this.employerPF : this.employerESI;
      calculations.calculations = [...newValues];
    },
    isItemSelected(type, item) {
      const calculations =
        type === "PF"
          ? this.employerPF.calculations
          : this.employerESI.calculations;
      return calculations.includes(item.value);
    },
    toggleSelection(type, item) {
      const calculations = type === "PF" ? this.employerPF : this.employerESI;
      const index = calculations.calculations.indexOf(item.value);

      if (index === -1) {
        calculations.calculations.push(item.value);
      } else {
        calculations.calculations.splice(index, 1);
      }

      this.updateCalculations(type, calculations.calculations);
    },
    startEdit() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.fetchData();
    },
    openAccountDialog(accountType) {
      console.log(`Opening ${accountType} account dialog`);
      this.$router.push("/settings/organization");
    },
  },
  async mounted() {
    await this.user();
    await this.fetchData();
    
  },
};
</script>

<style scoped>
.v-card .v-card-title {
  line-height: 1.6;
  margin-bottom: 10px;
  font-weight: bold;
  color: #000;
}

.field-name {
  width: 400px;
  color: #000;
  font-weight: 500;
}

/* Select field styles */
:deep(.v-select .v-field__input) {
  min-height: 40px !important;
  padding: 8px 12px !important;
  color: #000 !important;
  background: #fff !important;
  border-radius: 4px !important;
}

:deep(.v-field) {
  border-radius: 4px !important;
  background: #fff !important;
  border: 1px solid #dee2e6 !important;
}

:deep(.v-field__outline) {
  display: none !important;
}

:deep(.v-field__field) {
  color: #000 !important;
}

:deep(.v-list) {
  background: #fff !important;
  color: #000 !important;
  border-radius: 4px !important;
  margin-top: 4px !important;
  padding: 4px 0 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #dee2e6 !important;
}

:deep(.v-list-item) {
  min-height: 36px !important;
  color: #000 !important;
  padding: 0 12px !important;
}

:deep(.v-list-item-title) {
  color: #000 !important;
  font-size: 14px !important;
}

:deep(.v-select__selection) {
  color: #000 !important;
}

:deep(.v-select__content) {
  background: #fff !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-chip) {
  font-size: 13px !important;
  background-color: #f8f9fa !important;
  border-radius: 4px !important;
  color: #000 !important;
  height: 24px !important;
}

:deep(.v-label) {
  color: #6c757d !important;
  font-size: 0.875rem !important;
  font-weight: normal !important;
  transform: translateY(-22px) scale(0.75) !important;
  background: white !important;
  padding: 0 4px !important;
  margin-left: 8px !important;
}

:deep(.v-field--active .v-label),
:deep(.v-field--dirty .v-label) {
  transform: translateY(-22px) scale(0.75) !important;
}

:deep(.v-field__input .v-select__selection) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.v-select .v-field .v-field__append-inner) {
  padding-top: 6px !important;
}

:deep(.v-select .v-field .v-field__append-inner .v-icon) {
  color: #6c757d !important;
  font-size: 20px !important;
}

:deep(.v-list-item--active) {
  background-color: #f8f9fa !important;
}

:deep(.v-list-item:hover) {
  background-color: #f8f9fa !important;
}

.value-input :deep(.v-field__input) {
  background-color: #f8f9fa !important;
}

.component-input :deep(.v-field__input) {
  background-color: #fff !important;
}

.mb-4 {
  margin-bottom: 1.5rem !important;
}

:deep(.v-overlay__content) {
  border-radius: 4px !important;
  overflow: hidden !important;
}

:deep(.v-btn.success) {
  background-color: #4caf50 !important;
  color: white !important;
}

:deep(.v-btn.error) {
  background-color: #dc3545 !important;
  color: white !important;
}
</style>

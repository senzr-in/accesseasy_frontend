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
    <v-card-text v-else class="pa-0">
      <div class="sticky-header">
        <div class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center">
            <h3 class="text-h6">Deductions</h3>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-information"
                  variant="text"
                  size="small"
                  color="grey"
                  class="ml-2"
                  @click="showInfoDialog"
                ></v-btn>
              </template>
              <span>Click for more information about deductions</span>
            </v-tooltip>
          </div>
          <!-- <div class="d-flex">
            <v-btn v-if="!isEditing" color="black" @click="startEdit">
              Edit
            </v-btn>
            <template v-else>
              <v-btn color="black" class="mr-2" @click="saveEdit"> Save </v-btn>
              <v-btn color="black" @click="cancelEdit"> Cancel </v-btn>
            </template>
          </div> -->
        </div>
      </div>

      <div class="scroll-content">
        <div class="fields-container">
          <!-- Employee Deductions -->
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-subtitle-1 font-weight-medium">
              Employee Deductions
            </div>
          </div>

          <!-- Employee PF -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-label">Employee PF</div>
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
                  <v-btn color="primary" small @click="addAccount">
                    Add PF Account
                  </v-btn>
                </v-col>
              </v-row>

              <v-row v-if="hasPFAccount">
                <v-col cols="6">
                  <v-select
                    :items="employeePFOptions"
                    v-model="employeePF.value"
                    label="Value"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="ml-4 value-input"
                    :disabled="!isEditing"
                    item-title="text"
                    item-value="value"
                    @change="updateEmployeePF"
                  ></v-select>
                </v-col>

                <v-col cols="6">
                  <v-select
                    :items="employeePF.calculations"
                    v-model="employeePF.component"
                    label="Component"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="ml-4 component-input"
                    multiple
                    chips
                    :disabled="!isEditing"
                  ></v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Employee ESI -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-label">Employee ESI</div>
            </v-col>
            <v-row class="align-center" v-if="!hasESIAccount">
              <v-col cols="6" class="d-flex align-center">
                <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
                <span class="text-red font-weight-bold">ESI Not Available</span>
              </v-col>
              <v-col cols="6" class="text-right">
                <v-btn color="primary" small @click="this.addAccount()">
                  Add ESI Account
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="hasESIAccount">
              <v-col cols="4">
                <v-select
                  :items="employeeESIOptions"
                  v-model="employeeESI.value"
                  label="Value"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="ml-4 value-input"
                  :disabled="!isEditing"
                  item-title="text"
                  item-value="value"
                  @change="updateEmployeeESI"
                ></v-select>
              </v-col>

              <v-col cols="4">
                <v-select
                  :items="employeeESI.calculations"
                  v-model="employeeESI.component"
                  label="Component"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="ml-4 component-input"
                  multiple
                  chips
                  :disabled="!isEditing"
                ></v-select>
              </v-col>
            </v-row>
          </v-row>

          <!-- Voluntary PF -->
          <!-- <v-row class="mb-4 align-center">
  <v-col cols="4">
    <div class="field-label">Voluntary PF</div>
  </v-col>

  <v-col cols="8">
    <v-row class="align-center" v-if="!hasPFAccount">
      <v-col cols="6" class="d-flex align-center">
        <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
        <span class="text-red font-weight-bold">PF Not Available</span>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn color="primary" small @click="addAccount">
          Add PF Account
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="hasPFAccount">
      <v-col cols="6">
        <v-select
          :items="voluntaryPFOptions"
          v-model="voluntaryPF.value"
          label="Value"
          variant="outlined"
          density="comfortable"
          hide-details
          class="ml-4 value-input"
          :disabled="!isEditing"
          item-title="text"
          item-value="value"
          @change="updateVoluntaryPF"
        ></v-select>
      </v-col>

      <v-col cols="6">
        <v-select
          :items="voluntaryPF.calculations"
          v-model="voluntaryPF.component"
          label="Component"
          variant="outlined"
          density="comfortable"
          hide-details
          class="ml-4 component-input"
          multiple
          chips
          :disabled="!isEditing"
        ></v-select>
      </v-col>
    </v-row>
  </v-col>
</v-row> -->

          <!-- Professional Tax -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-label">Professional Tax</div>
            </v-col>
            <v-row class="align-center">
              <v-col cols="6" class="d-flex align-center">
                <v-icon color="grey-darken-1" class="mr-2"
                  >mdi-information-outline</v-icon
                >
                <span class="text-grey-darken-1">System Calculated</span>
              </v-col>
            </v-row>
          </v-row>

          <!-- Labour Welfare Fund -->
          <v-row class="mb-4 align-center">
            <v-col cols="4">
              <div class="field-label">Labour Welfare Fund</div>
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

          <!-- Dynamic Fields -->
          <v-row v-for="(field, index) in fields" :key="index" class="mb-4">
            <v-col cols="4">
              <div class="field-label">
                {{ field.label }}
              </div>
            </v-col>

            <v-col cols="3">
              <v-text-field
                v-model="field.value"
                variant="outlined"
                density="comfortable"
                hide-details
                type="number"
                class="ml-4 value-input"
                :prefix="getPrefix(field.type)"
                :placeholder="getPlaceholder(field.type)"
                :disabled="!isEditing"
                @input="validateFieldInput(field)"
              ></v-text-field>
            </v-col>

            <v-col cols="2">
              <div class="d-flex align-center justify-end">
                <v-btn
                  v-if="isEditing"
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  class="ml-2"
                  @click="deleteField(index)"
                ></v-btn>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="sticky-footer">
        <!-- Add Field Button -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <!-- <v-btn color="black" class="px-4 mt-4" v-bind="props">
              <v-icon start>mdi-plus</v-icon>
              Add Field
            </v-btn> -->
          </template>
          <v-list
            style="
              max-height: 200px;
              overflow-y: auto;
              justify-content: space-between;
            "
          >
            <v-list-item
              v-for="field in availableDefaultFields"
              :key="field.name"
              @click="addDefaultField(field)"
            >
              <v-list-item-title>{{ field.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-text>

    <!-- Snackbar for notifications -->
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

    <!-- Dialog for Professional Tax Information -->
    <v-dialog v-model="ptInfoDialog" max-width="500px">
      <v-card><strong>System calculated</strong></v-card>
    </v-dialog>

    <!-- Dialog for Labour Welfare Fund Information -->
    <v-dialog v-model="lwfInfoDialog" max-width="500px">
      <v-card>
        <v-card-title>Labour Welfare Fund Information</v-card-title>
        <v-card-text>
          <div v-if="lwfData">
            <p><strong>System calculated</strong></p>
          </div>
          <div v-else>
            <p>No Labour Welfare Fund data available.</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="lwfInfoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for General Deductions Information -->
    <v-dialog v-model="infoDialog" max-width="600px">
      <v-card>
        <v-card-title>Deductions Information</v-card-title>
        <v-card-text>
          <p>
            Deductions are amounts subtracted from an employee's gross pay.
            Common deductions include:
          </p>
          <ul>
            <li>
              <strong>Employee PF (Provident Fund):</strong> A retirement
              savings contribution.
            </li>
            <li>
              <strong>Employee ESI (Employee State Insurance):</strong> A health
              insurance scheme.
            </li>
            <li>
              <strong>Voluntary PF:</strong> Additional voluntary contribution
              to the Provident Fund.
            </li>
            <li>
              <strong>Professional Tax:</strong> A state-specific tax on
              professions, trades, and employments.
            </li>
            <li>
              <strong>Labour Welfare Fund:</strong> A contribution towards
              welfare activities for workers.
            </li>
          </ul>
          <p>
            Other deductions may include income tax, loans, or voluntary
            contributions to various schemes.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { onMounted } from "vue";

export default {
  name: "DeductionsManager",
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
      apiData: null,
      lwfData: null,
      ptData: null,
      ptValue: 0,
      state: null,
      loading: true,
      tenantId: null,
      configName: null,
      hasPFAccount: false,
      hasESIAccount: false,
      hasShopEstablishment: false,
      lwfValue: "",
      stateTaxData: [],
      staffEssentialsEnabled: false,
      staffEssentials: null,
      staffEssentialOptions: [],
      isEditing: false,
      token: authService.getToken(),
      employeePF: {
        value: null,
        component: [],
        calculations: [],
      },
      employeePFOptions: [
        { text: "12% No limit", value: 12 },
        { text: "12% ₹1800 limit", value: 1800 },
        { text: "No Value", value: null },
      ],
      voluntaryPF: {
        value: null,
        component: [],
        calculations: [],
      },
      voluntaryPFOptions: [
        { text: "13% No limit", value: 13 },
        { text: "13% ₹1800 limit", value: 1800 },
        { text: "No Value", value: null },
      ],
      employeeESI: {
        value: null,
        component: [],
        calculations: [],
      },
      employeeESIOptions: [
        { text: "0.75%", value: 0.75 },
        { text: "No Value", value: null },
      ],
      fields: [],
      deductionTypes: [
        { text: "Percentage", value: "percentage" },
        { text: "Fixed", value: "fixed" },
      ],
      availableDefaultFields: [
        {
          name: "Benevolent Fund",
          label: "Benevolent Fund",
          type: "fixed",
          value: "",
        },
        {
          name: "Term Insurance",
          label: "Term Insurance",
          type: "fixed",
          value: "",
        },
        {
          name: "Group Accidental Policy & WC",
          label: "Group Accidental Policy & WC",
          type: "fixed",
          value: "",
        },
        { name: "Gratuity", label: "Gratuity", type: "fixed", value: "" },
        {
          name: "Statutory Bonus Deduction",
          label: "Statutory Bonus Deduction",
          type: "fixed",
          value: "",
        },
        {
          name: "Security Deposit",
          label: "Security Deposit",
          type: "fixed",
          value: "",
        },
        {
          name: "Uniform Deduction",
          label: "Uniform Deduction",
          type: "fixed",
          value: "",
        },
        {
          name: "Transport Charges",
          label: "Transport Charges",
          type: "fixed",
          value: "",
        },
        {
          name: "Miscellaneous Deduction",
          label: "Miscellaneous Deduction",
          type: "fixed",
          value: "",
        },
        {
          name: "Food Deduction",
          label: "Food Deduction",
          type: "fixed",
          value: "",
        },
        {
          name: "Medical Insurance Premium",
          label: "Medical Insurance Premium",
          type: "fixed",
          value: "",
        },
      ],
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      addFieldMenu: false,
      selectedNewField: null,
      ptInfoDialog: false,
      lwfInfoDialog: false,
      infoDialog: false,
    };
  },
  async created() {
    await this.user();

    await this.fetchData();
  },
  watch: {
    staffEssentials(newState) {
      if (newState) {
        this.updateAmounts();
      }
    },
  },
  methods: {
    addAccount() {
      this.$router.push("/settings/organization/organization-settings");
    },
    addDefaultField(field) {
      const newField = {
        ...field,
        isEditing: true,
      };
      this.fields.push(newField);
      // Remove the added field from availableDefaultFields
      this.availableDefaultFields = this.availableDefaultFields.filter(
        (f) => f.name !== field.name,
      );
      this.startEdit();
    },
    openAccountDialog(type) {
      this.$router.push({
        path: "/settings/organization",
        query: { openDialog: type },
      });
    },
    async user() {
      const userData = await currentUserTenant.getTenantId();
      this.tenantId = userData;
      console.log("Tenant ID:", this.tenantId);
      return userData;
    },
    getOptionsForField(fieldName) {
      return this.stateOptions;
    },
    updateAmounts() {
      const selectedStateData = this.stateTaxData.find(
        (state) => state.state === this.staffEssentials,
      );

      if (selectedStateData) {
        const taxRules = selectedStateData.stateTaxRules;
        const finalAmounts = taxRules[taxRules.length - 1];

        this.lwfValue = finalAmounts.lwfAmount || 0;
        this.ptValue = finalAmounts.ptAmount || 0;
      }
    },
    async fetchStateData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tax`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );
        const data = await response.json();
        this.staffEssentialOptions = data.data.map((item) => item.state);
        this.stateTaxData = data.data;
      } catch (error) {
        console.error("Error fetching state data:", error);
        this.showSnackbar("Failed to fetch state data", "error");
      }
    },
    async fetchData() {
      try {
        this.loading = true;
        const fields = [
          "employeeDeductions",
          "id",
          "deductions",
          "earnings",
          "LWF.state",
          "LWF.stateTaxRules",
          "professionalTax.state",
          "professionalTax.stateTaxRules",
          "basicPay",
          "stateTaxes.state",
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
        this.state = this.apiData[0]?.LWF?.state;

        this.configName = this.apiData[0]?.stateTaxes?.state;
        await this.fetchTenant();
        await this.fetchStateData();
        this.processApiData();
        this.initializeAvailableFields();
        this.loading = false;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.showSnackbar("Failed to fetch salary settings", "error");
      }
    },
    processApiData() {
      if (!this.apiData || !this.apiData.length) {
        console.log("No API data available");
        return;
      }

      const salarySettings = this.apiData[0];

      // Prepare earnings options for dropdowns
      const earningsOptions = salarySettings.earnings
        ? salarySettings.earnings.map((earning) => earning.name)
        : [];

      // Handle Employee PF
      if (salarySettings.employeeDeductions?.EmployeePF) {
        const pfData = salarySettings.employeeDeductions.EmployeePF;
        this.employeePF = {
          value: pfData.selectedOption,
          calculations: earningsOptions,
          component: Array.isArray(pfData.Calculations)
            ? pfData.Calculations.map((calc) => calc.name)
            : [],
        };
      }

      // Handle Employee ESI
      if (salarySettings.employeeDeductions?.EmployeeESI) {
        const esiData = salarySettings.employeeDeductions.EmployeeESI;
        this.employeeESI = {
          value: esiData.selectedOption,
          calculations: earningsOptions,
          component: Array.isArray(esiData.Calculations)
            ? esiData.Calculations.map((calc) => calc.name)
            : [],
        };
      }

      // Handle Voluntary PF
      if (salarySettings.employeeDeductions?.VoluntaryPF) {
        const vpfData = salarySettings.employeeDeductions.VoluntaryPF;
        this.voluntaryPF = {
          value: vpfData.selectedOption,
          calculations: earningsOptions,
          component: Array.isArray(vpfData.Calculations)
            ? vpfData.Calculations.map((calc) => calc.name)
            : [],
        };
      }

      // Process PT data
      if (salarySettings.professionalTax) {
        this.ptData = salarySettings.professionalTax;
      }

      // Process LWF data
      if (salarySettings.LWF) {
        this.lwfData = salarySettings.LWF;
      }

      // Process other deductions
      if (salarySettings.deductions) {
        this.fields = salarySettings.deductions.map((deduction) => ({
          name: deduction.name,
          label: deduction.name,
          type: deduction.calculation.toLowerCase(),
          value: deduction.amount || deduction.percentage,
        }));
      }
    },
    initializeAvailableFields() {
      const existingFieldNames = this.fields.map((field) => field.name);
      this.availableDefaultFields = this.availableDefaultFields.filter(
        (defaultField) => !existingFieldNames.includes(defaultField.name),
      );
    },
    async fetchTenant() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${this.tenantId}`,
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
    async saveEdit() {
      try {
        const createCalculations = (components, earnings) => {
          if (!Array.isArray(earnings)) {
            console.error(
              "Error: earnings is not an array or is null",
              earnings,
            );
            return components.map((comp) => ({
              name: comp,
              percentage: this.apiData[0].basicPay,
            }));
          }
          return components.map((comp) => {
            if (comp === "Basic Pay") {
              return {
                name: comp,
                percentage: this.apiData[0].basicPay,
              };
            }
            const earning = earnings.find((e) => e.name === comp);
            return {
              name: comp,
              percentage: earning ? earning.percentage : 0,
            };
          });
        };

        const employeePFConfig = {
          selectedOption: this.employeePF.value,
          options: [
            { label: "percentage", value: 12 },
            { label: "Minimum amount", value: 1800 },
            { label: "No Value", value: null },
          ],
          Calculations: createCalculations(
            this.employeePF.component,
            this.apiData[0].earnings,
          ),
        };

        const employeeESIConfig = {
          selectedOption: this.employeeESI.value,
          options: [
            { label: "percentage", value: 3.25 },
            { label: "No Value", value: null },
          ],
          Calculations: createCalculations(
            this.employeeESI.component,
            this.apiData[0].earnings,
          ),
        };

        // const voluntaryPFConfig = {
        //   selectedOption: this.voluntaryPF.value,
        //   options: [
        //     { label: "percentage", value: 13 },
        //     { label: "Minimum amount", value: 1800 },
        //     { label: "No Value", value: null },
        //   ],
        //   Calculations: createCalculations(
        //     this.voluntaryPF.component,
        //     this.apiData[0].earnings,
        //   ),
        // };

        const deductions = this.fields.map((field) => ({
          name: field.name,
          amount: field.type === "fixed" ? parseFloat(field.value) : null,
          percentage:
            field.type === "percentage" ? parseFloat(field.value) : null,
          calculation: field.type === "percentage" ? "Percentage" : "Fixed",
        }));

        const payload = {
          deductions: deductions,
          employeeDeductions: {
            EmployeePF: employeePFConfig,
            EmployeeESI: employeeESIConfig,
            // VoluntaryPF: voluntaryPFConfig,
          },
          id: this.category.id,
          deduction: this.fields.map((field) => ({
            name: field.name,
            calculation: "On Attendance",
          })),
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting/${this.category.id}`,
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
        await this.fetchData();
        this.processApiData();
        this.showSnackbar("Changes saved successfully", "success");
      } catch (error) {
        console.error("Error saving data:", error);
        this.showSnackbar("Failed to save changes", "error");
      }
    },
    getPrefix(type) {
      return type === "percentage" ? "%" : "₹";
    },
    getPlaceholder(type) {
      return type === "percentage" ? "Enter percentage" : "Enter amount";
    },
    deleteField(index) {
      this.fields.splice(index, 1);
      this.initializeAvailableFields();
    },
    // addNewField() {
    //   if (this.selectedNewField) {
    //     const newField = this.availableDefaultFields.find(
    //       (f) => f.name === this.selectedNewField,
    //     );
    //     if (newField) {
    //       this.fields.push({ ...newField, isEditing: true });
    //       this.initializeAvailableFields();
    //     }
    //   }
    //   this.addFieldMenu = false;
    //   this.selectedNewField = null;
    // },
    showSnackbar(text, color) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    startEdit() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.fetchData();
    },

    validateFieldInput(field) {
      // Implement validation logic for field inputs
      if (field.type === "percentage" && parseFloat(field.value) > 100) {
        field.value = "100";
      }
    },
    onDeductionTypeChange(field) {
      // Reset the value when changing between percentage and fixed
      field.value = "";
    },
    showPTInfoDialog() {
      this.ptInfoDialog = true;
    },
    showLWFInfoDialog() {
      this.lwfInfoDialog = true;
    },
    showInfoDialog() {
      this.infoDialog = true;
    },
  },
};
</script>

<style scoped>
.field-row {
  display: flex;
  align-items: center;
}

.field-name,
.value-input,
.component-input,
.type-select {
  flex: 1;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid #e0e0e0;
}

.scroll-content {
  max-height: calc(75vh - 180px);
  overflow-y: auto;
  padding: 16px;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  background-color: white;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  z-index: 1;
}
</style>

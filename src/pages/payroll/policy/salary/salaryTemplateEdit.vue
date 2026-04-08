<template>
  <v-container fluid>
    <!-- Header Section -->
    <div
      class="d-flex align-center justify-space-between pa-4 mb-4"
      style="background-color: #f8fafc; border-radius: 8px"
    >
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="black"
          @click="goBack"
          class="mr-2"
        ></v-btn>
        <h2 class="text-h5 font-weight-bold text-black mb-0">
          View {{ categoryName }}
        </h2>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="loading-container d-flex flex-column align-center justify-center"
      style="height: 70vh"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <div class="loading-text mt-4">Loading data...</div>
    </div>

    <div v-else class="clean-layout" style="height: 70vh; overflow-y: auto">
      <!-- Earning Components -->
      <div class="section-header mb-4">
        <div
          class="section-indicator earning-indicator"
          style="background-color: #22c55e"
        ></div>
        <h3 class="section-title" style="color: #166534">Earning Components</h3>
      </div>

      <v-row
        v-for="(row, idx) in form.earning"
        :key="row.id"
        class="earning-row align-center mb-3 pb-2 border-bottom"
      >
        <!-- Column 1: Name -->
        <v-col cols="3">
          <span class="font-weight-medium">{{ row.label }}</span>
        </v-col>

        <!-- Column 2: Type -->
        <v-col cols="3">
          <v-select
            v-if="
              !['Basic Pay', 'HRA', 'Dearness Allowance'].includes(row.label)
            "
            v-model="row.unit"
            :items="unitItems"
            label="Type"
            variant="outlined"
            density="compact"
            hide-details
            hide-no-data
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>

        <!-- Column 3: Value -->
        <v-col cols="3">
          <v-text-field
            v-model.number="row.value"
            type="number"
            min="0"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            :prefix="row.unit === 'Percentage' ? '%' : '₹'"
            :placeholder="row.unit === 'Percentage' ? 'Percentage' : 'Fixed'"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>

        <!-- Column 4: Action (empty for view mode) -->
        <v-col cols="3" class="text-left">
          <!-- No action button in view mode -->
        </v-col>
      </v-row>

      <!-- Employer Contribution -->
      <div class="section-header mb-4">
        <div
          class="section-indicator employer-indicator"
          style="background-color: #3b82f6"
        ></div>
        <h3 class="section-title" style="color: #1e40af">
          Employer Contribution
        </h3>
      </div>

      <!-- Employer PF -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Employer PF </v-col>
        <v-col cols="3">
          <v-select
            :items="[
              { title: '12% No limit', value: 12 },
              { title: '12% ₹1800 limit', value: 1800 },
              { title: 'NoValue', value: null },
            ]"
            v-model="form.employerPF.value"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            item-title="title"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            :items="componentOptions"
            v-model="form.employerPF.calculations"
            label="Component"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            item-title="label"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <v-checkbox
            v-model="form.employerPF.withinCTC"
            label="Within CTC"
            density="compact"
            hide-details
            readonly
          />
        </v-col>
      </v-row>

      <!-- Employer ESI -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Employer ESI </v-col>
        <v-col cols="3">
          <v-select
            :items="[
              { title: '3.25%', value: 3.25 },
              { title: 'NoValue', value: null },
            ]"
            v-model="form.employerESI.value"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            item-title="title"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            :items="componentOptions"
            v-model="form.employerESI.calculations"
            label="Component"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            item-title="label"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <v-checkbox
            v-model="form.employerESI.withinCTC"
            label="Within CTC"
            density="compact"
            hide-details
            readonly
          />
        </v-col>
      </v-row>

      <!-- PF EDLI & Admin Charges -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> PF EDLI & Admin Charges </v-col>
        <v-col cols="3">
          <v-switch
            v-model="form.includeEdli"
            hide-details
            density="compact"
            color="success"
            inset
            readonly
          />
        </v-col>
        <v-col cols="3" v-if="form.includeEdli">
          <v-text-field
            variant="outlined"
            density="compact"
            hide-details
            value="1"
            suffix="%"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
      </v-row>

      <!-- Labour Welfare Fund -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Labour Welfare Fund </v-col>
        <v-col cols="3" class="d-flex align-center">
          <v-icon color="grey-darken-1" class="mr-2"
            >mdi-information-outline</v-icon
          >
          <span class="text-grey-darken-1">Value based on state rules</span>
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="selectedState"
            :items="states"
            item-title="text"
            item-value="value"
            label="Select State"
            variant="outlined"
            density="compact"
            readonly
            style="background-color: #f5f5f5"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- Deduction Components -->
      <div class="section-header mb-4">
        <div
          class="section-indicator deduction-indicator"
          style="background-color: #ef4444"
        ></div>
        <h3 class="section-title" style="color: #dc2626">
          Deduction Components
        </h3>
      </div>

      <!-- Employee PF -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Employee PF </v-col>
        <v-col cols="3">
          <v-select
            :items="[
              { title: '12% No limit', value: 12 },
              { title: '12% ₹1800 limit', value: 1800 },
              { title: 'NoValue', value: null },
            ]"
            v-model="form.employeePF.value"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            item-title="title"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            :items="componentOptions"
            v-model="form.employeePF.calculations"
            label="Component"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            item-title="label"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>

      <!-- Employee ESI -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Employee ESI </v-col>
        <v-col cols="3">
          <v-select
            :items="[
              { title: '0.75%', value: 0.75 },
              { title: 'NoValue', value: null },
            ]"
            v-model="form.employeeESI.value"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            item-title="title"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            :items="componentOptions"
            v-model="form.employeeESI.calculations"
            label="Component"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            item-title="label"
            item-value="value"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>

      <!-- Labour Welfare Fund -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Labour Welfare Fund </v-col>
        <v-col cols="3" class="d-flex align-center">
          <v-icon color="grey-darken-1" class="mr-2"
            >mdi-information-outline</v-icon
          >
          <span class="text-grey-darken-1">Value based on state rules</span>
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="selectedState"
            :items="states"
            item-title="text"
            item-value="value"
            label="Select State"
            variant="outlined"
            density="compact"
            readonly
            style="background-color: #f5f5f5"
            hide-details
          />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>

      <!-- Professional Tax -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Professional Tax </v-col>
        <v-col cols="3" class="d-flex align-center">
          <v-icon color="grey-darken-1" class="mr-2"
            >mdi-information-outline</v-icon
          >
          <span class="text-grey-darken-1">System Calculated</span>
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="selectedState"
            :items="states"
            item-title="text"
            item-value="value"
            label="Select State"
            variant="outlined"
            density="compact"
            readonly
            style="background-color: #f5f5f5"
            hide-details
          />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>

      <!-- Dynamic Deduction Rows -->
      <v-row
        v-for="(row, idx) in form.deduction"
        :key="row.id"
        class="align-center mb-3 border-bottom pb-2"
      >
        <v-col cols="3">
          <strong>{{ row.label }}</strong>
        </v-col>
        <v-col cols="3"></v-col>
        <v-col cols="3">
          <v-text-field
            v-model.number="row.value"
            type="number"
            min="0"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            prefix="₹"
            placeholder="Fixed"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-col>
        <v-col cols="3">
          <!-- No delete action in view mode -->
        </v-col>
      </v-row>
    </div>

    <!-- Professional Tax Dialog (keep existing) -->
    <v-dialog v-model="showProfessionalTaxDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold"
          >Professional Tax Rules</v-card-title
        >
        <v-card-text>
          <div style="max-width: 300px">
            <ul>
              <li v-for="rule in professionalTaxRules" :key="rule.salaryRange">
                Salary Range: {{ rule.salaryRange }} - Tax: ₹{{
                  rule.professionalTax
                }}
              </li>
            </ul>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showProfessionalTaxDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Disabled dialogs (keep existing but simplified) -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold"
          >Add ESI Account</v-card-title
        >
        <v-card-text>
          <v-text-field
            v-model="newAccount.number"
            label="ESI Number"
            variant="outlined"
            readonly
            style="background-color: #f5f5f5"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showAddDialog = false" disabled
            >Cancel</v-btn
          >
          <v-btn color="green" disabled>Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ToastContainer />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
// import { toast } from "better-vue-toast";

import {
  DownloadIcon,
  XCircle,
  Plus,
  Edit2,
  Check,
  Trash2,
} from "lucide-vue-next";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ActionButton from "@/components/common/buttons/ActionButton.vue";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const router = useRouter();
const route = useRoute();

const selectedNewAllowance = ref(null);
const selectedNewDeduction = ref(null);
const emit = defineEmits(["close"]);

const saving = ref(false);
const isLoading = ref(false);
const showAddDialog = ref(false);
const formValid = ref(false);

const newAccount = ref({
  number: "",
});
const showAddPfDialog = ref(false);
const pfNumber = ref(null);

const unitItems = ["Fixed", "Percentage"];
const states = ref([]);
const selectedState = ref(null);
const hasPFAccount = ref(false);
const hasESIAccount = ref(false);
const tenantData = ref(null);
const hasShopEstablishment = ref(false);
const salaryState = ref(null);
const state = ref("");

const showProfessionalTaxDialog = ref(false);
const professionalTaxRules = ref([]);

const addAccount = () => {
  router.push("/settings/organization");
};

const fetchTenant = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await response.json();

    tenantData.value = data.data[0];

    hasPFAccount.value = data.data.some((tenant) => tenant.pfAccount);
    hasShopEstablishment.value = data.data.some((tenant) => tenant.shopAccount);

    const esiMatch = data.data.some((tenant) => {
      const esiAccounts = tenant.esiAccountNumber || [];
      return esiAccounts.some((acc) => acc.state === salaryState.value);
    });

    hasESIAccount.value = esiMatch;

    if (esiMatch) {
      selectedState.value = salaryState.value;
    }
  } catch (error) {
    console.error("Error fetching tenant data:", error);
  }
};
const fetchTaxRules = async (state) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tax?filter[_and][0][state][_icontains]=${encodeURIComponent(state)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].stateTaxRules?.PT) {
      professionalTaxRules.value = data.data[0].stateTaxRules.PT;
    } else {
      professionalTaxRules.value = [];
    }
  } catch (error) {
    console.error("Error fetching tax rules:", error);
    professionalTaxRules.value = [];
  }
};
const allBranches = ref([]);
const areaTypes = ref([]);
const selectedAreaType = ref(null);

const skillLevels = ref([
  "Unskilled",
  "Semi-Skilled",
  "Skilled",
  "Highly Skilled",
]);
const selectedSkillLevels = ref(null);

const categoryName = ref("");

const form = ref({
  earning: [
    {
      label: "Basic Pay",
      value: 100,
      unit: "Percentage",
    },
  ],
  deduction: [],
  employerPF: {
    withinCTC: false,
    value: 1800,
    calculations: ["Basic Pay"],
  },
  employerESI: {
    withinCTC: false,
    value: 3.25,
    calculations: ["Basic Pay"],
  },
  employeePF: {
    value: 1800,
    calculations: ["Basic Pay"],
  },
  employeeESI: {
    value: 3.25,
    calculations: ["Basic Pay"],
  },

  includeEdli: false,
});

const earningOptions = [
  { name: "Basic Pay", type: "Percentage" },
  { name: "HRA", type: "Percentage" },
  { name: "Dearness Allowance", type: "Percentage" },
  { name: "Special Allowance", type: "Percentage" },
  { name: "Travel Allowance", type: "Percentage" },
  { name: "Accomodation and Food", type: "Fixed" },
  { name: "Bonus and Incentives", type: "Fixed" },
  { name: "Cash Allowance", type: "Fixed" },
  { name: "Conveyance Allowance", type: "Fixed" },
  { name: "Children Education Allowance", type: "Fixed" },
  { name: "Distance Allowance", type: "Fixed" },
  { name: "Transport Allowance", type: "Fixed" },
];

const deductionOptions = [
  {
    name: "Benevolent Fund",

    type: "Fixed",
  },
  {
    name: "Term Insurance",

    type: "Fixed",
  },
  {
    name: "Group Accidental Policy & WC",

    type: "Fixed",
  },
  { name: "Gratuity", type: "Fixed" },
  {
    name: "Statutory Bonus Deduction",

    type: "Fixed",
  },
  {
    name: "Security Deposit",

    type: "Fixed",
  },
  {
    name: "Uniform Deduction",

    type: "Fixed",
  },
  {
    name: "Transport Charges",

    type: "Fixed",
  },
  {
    name: "Miscellaneous Deduction",

    type: "Fixed",
  },
  {
    name: "Food Deduction",

    type: "Fixed",
  },
  {
    name: "Medical Insurance Premium",

    type: "Fixed",
  },
];

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

const componentOptions = computed(() => {
  return form.value.earning.map((e) => ({
    label: e.label,
    value: e.label,
    props: e.label === "Basic Pay" ? { disabled: true } : {},
  }));
});

const addSelectedDeduction = (item) => {
  form.value.deduction.push({
    id: Date.now(),
    label: item.name,
    value: 0,
    unit: "Fixed",
    type: item.type,
  });
  console.log("Deduction rows:", form.value.deduction);
};

function removeComponent(section, componentName) {
  if (componentName !== "Basic Pay") {
    form.value[section].calculations = form.value[section].calculations.filter(
      (calc) => calc !== componentName,
    );
  }
}
// Computed property to show only available earning options (excluding already selected ones)
const availableEarningOptions = computed(() => {
  const usedLabels = form.value.earning.map((item) => item.label);
  return earningOptions.filter((option) => !usedLabels.includes(option.name));
});

const rules = {
  required: (v) => (!!v && v.trim().length > 0) || "Required",
};

function addDeduction() {
  form.value.deduction.push({
    label: "",
    value: 0,
    unit: "Percentage",
  });
}

const goBack = () => {
  emit("close");
  router.push("/configuration/payroll-policy");
};

const fetchSettings = async (categoryData) => {
  isLoading.value = true;
  try {
    const categoryId = categoryData?.id || categoryData;

    const fields = [
      "basicPay",
      "earnings",
      "deductions",
      "employerContribution",
      "allowances",
      "deduction",
      "professionalTax",
      "LWF",
      "employersContributions",
      "employeeDeductions",
      "configName",
      "adminCharges",
      "stateTaxes.state",
    ];

    const query =
      fields.map((f) => `fields[]=${f}`).join("&") +
      `&filter[id][_eq]=${categoryId}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary settings");
    const data = await response.json();
    const salarySetting = data.data[0] || null;
    salaryState.value = salarySetting.stateTaxes?.state;

    if (salarySetting?.stateTaxes?.state) {
      await fetchTaxRules(salarySetting.stateTaxes.state);
    }
    if (!salarySetting) return null;

    const mappedEarnings = [
      {
        label: "Basic Pay",
        value: salarySetting.basicPay || 100,
        unit: "Percentage",
      },
      ...(salarySetting.earnings || []).map((item) => ({
        label: item.name,
        value:
          item.calculations === "Percentage" ? item.Percentage : item.Fixed,
        unit: item.calculations === "Percentage" ? "Percentage" : "Fixed",
      })),
    ];

    form.value.earning = mappedEarnings;

    form.value.deduction = (salarySetting.deductions || []).map((item) => ({
      label: item.name,
      value: item.amount,
      unit: "Fixed",
    }));

    form.value.employerPF.value =
      salarySetting.employersContributions?.EmployerPF?.selectedOption || 1800;
    form.value.employerPF.withinCTC =
      salarySetting.employersContributions?.EmployerPF?.withinCTC || false;
    form.value.employerPF.calculations =
      salarySetting.employersContributions?.EmployerPF?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.employerESI.value =
      salarySetting.employersContributions?.EmployerESI?.selectedOption || null;
    form.value.employerESI.withinCTC =
      salarySetting.employersContributions?.EmployerESI?.withinCTC || false;
    form.value.employerESI.calculations =
      salarySetting.employersContributions?.EmployerESI?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.employeePF.value =
      salarySetting.employeeDeductions?.EmployeePF?.selectedOption || 1800;
    form.value.employeePF.calculations =
      salarySetting.employeeDeductions?.EmployeePF?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.employeeESI.value =
      salarySetting.employeeDeductions?.EmployeeESI?.selectedOption || null;
    form.value.employeeESI.calculations =
      salarySetting.employeeDeductions?.EmployeeESI?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.includeEdli = salarySetting.adminCharges?.enable || false;

    categoryName.value = salarySetting.configName;
    selectedState.value = salarySetting.stateTaxes.state;

    await fetchTenant();
  } catch (error) {
    console.error("Error fetching salary settings:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const receivedCategory = route.params.categoryData;

  await fetchSettings(receivedCategory);
});
</script>

<style scoped>
.clean-layout {
  background: #fff;
}

.section-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.section-indicator {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  margin-right: 12px;
}

.earning-indicator {
  background-color: #22c55e;
}

.employer-indicator {
  background-color: #3b82f6;
}

.deduction-indicator {
  background-color: #ef4444;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.field-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.component-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.component-row:last-child {
  border-bottom: none;
}

.component-fields {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.earning-row,
.deduction-row {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #22c55e;
}

.deduction-row {
  border-left-color: #ef4444;
}

.alert-row {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  color: #dc2626;
}

.add-button-container {
  display: flex;
  justify-content: flex-start;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.gap-3 {
  gap: 12px;
}

.field-input {
  flex: 1;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.w-100 {
  width: 100%;
}

.loading-container {
  height: 100%;
  min-height: 400px;
}
</style>

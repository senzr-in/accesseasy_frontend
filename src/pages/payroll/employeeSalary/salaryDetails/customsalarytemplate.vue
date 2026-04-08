<template>
  <v-container fluid>
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
        <v-col cols="2">
          <span class="font-weight-medium">{{ row.label }}</span>
        </v-col>

        <!-- Column 2: Type -->
        <v-col cols="3">
          <!-- Empty column for layout -->
        </v-col>
        <v-col cols="3">
          <!-- Empty column for layout -->
        </v-col>
        <!-- Column 3: Value -->
        <v-col cols="2">
          <v-text-field
            v-model.number="row.value"
            type="number"
            min="0"
            label="Value"
            variant="outlined"
            density="compact"
            hide-details
            :prefix="'₹'"
            :placeholder="'Amount'"
          />
        </v-col>

        <!-- Column 4: Action -->
        <v-col cols="2" class="text-left">
          <ActionButton
            v-if="!['Basic Pay'].includes(row.label)"
            :icon="Trash2"
            variant="text"
            size="sm"
            color="red"
            @click="() => removeEarning(idx)"
          />
        </v-col>
      </v-row>

      <div class="add-button-container mb-6">
        <v-menu>
          <template v-slot:activator="{ props }">
            <BaseButton
              variant="primary"
              size="sm"
              color="black"
              :left-icon="Plus"
              v-bind="props"
              >Add allowance</BaseButton
            >
          </template>
          <v-list style="max-height: 200px; overflow-y: auto">
            <v-list-item
              v-for="(item, index) in availableEarningOptions"
              :key="index"
              @click="addSelectedEarning(item.name)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

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
        <v-col cols="2"> Employer PF </v-col>
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
          />
        </v-col>

        <v-col cols="2">
          <v-text-field
            v-model="form.employerPF.amount"
            label="Amount"
            variant="outlined"
            density="compact"
            hide-details
            readonly
            style="background-color: #f5f5f5"
            :prefix="'₹'"
          />
        </v-col>
        <v-col cols="2">
          <v-checkbox
            v-model="form.employerPF.withinCTC"
            label="Within CTC"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- Employer ESI -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="2"> Employer ESI </v-col>
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
          />
        </v-col>

        <v-col cols="2">
          <v-text-field
            v-model="form.employerESI.amount"
            label="Amount"
            variant="outlined"
            density="compact"
            hide-details
            readonly
            style="background-color: #f5f5f5"
            :prefix="'₹'"
          />
        </v-col>
        <v-col cols="2">
          <v-checkbox
            v-model="form.employerESI.withinCTC"
            label="Within CTC"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- PF EDLI & Admin Charges -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="2"> PF EDLI & Admin Charges </v-col>
        <v-col cols="3">
          <v-switch
            v-model="form.includeEdli"
            hide-details
            density="compact"
            color="success"
            inset
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
        <v-col cols="2">
          <v-text-field
            v-model="form.edliAmount"
            label="Amount"
            variant="outlined"
            density="compact"
            hide-details
            readonly
            style="background-color: #f5f5f5"
            :prefix="'₹'"
          />
        </v-col>
      </v-row>

      <!-- Labour Welfare Fund -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="2"> Labour Welfare Fund </v-col>
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
        <v-col cols="2"> Employee PF </v-col>
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
          />
        </v-col>

        <v-col cols="2">
          <v-text-field
            v-model="form.employeePF.amount"
            label="Amount"
            variant="outlined"
            density="compact"
            hide-details
            readonly
            style="background-color: #f5f5f5"
            :prefix="'₹'"
          />
        </v-col>
      </v-row>

      <!-- Employee ESI -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="2"> Employee ESI </v-col>
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
          />
        </v-col>

        <v-col cols="2">
          <v-text-field
            v-model="form.employeeESI.amount"
            label="Amount"
            variant="outlined"
            density="compact"
            hide-details
            readonly
            style="background-color: #f5f5f5"
            :prefix="'₹'"
          />
        </v-col>
      </v-row>

      <!-- Labour Welfare Fund -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="2"> Labour Welfare Fund </v-col>
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
            hide-details
          />
        </v-col>
        <v-col cols="3"></v-col>
      </v-row>

      <!-- Professional Tax -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="2"> Professional Tax </v-col>
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
        <v-col cols="2">
          <strong>{{ row.label }}</strong>
        </v-col>
        <v-col cols="3"></v-col>
        <v-col cols="3"></v-col>

        <v-col cols="2">
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
          />
        </v-col>
        <v-col cols="2" class="text-left">
          <ActionButton
            :icon="Trash2"
            variant="text"
            size="sm"
            color="red"
            @click="() => removeDeduction(idx)"
          />
        </v-col>
      </v-row>

      <div class="add-button-container">
        <v-menu>
          <template v-slot:activator="{ props }">
            <BaseButton
              variant="primary"
              size="sm"
              color="black"
              :left-icon="Plus"
              v-bind="props"
              >Add deduction</BaseButton
            >
          </template>
          <v-list style="max-height: 200px; overflow-y: auto">
            <v-list-item
              v-for="(item, index) in availableDeductionOptions"
              :key="index"
              @click="addSelectedDeduction(item)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Professional Tax Dialog -->
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

    <ToastContainer />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import { Plus, Trash2 } from "lucide-vue-next";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ActionButton from "@/components/common/buttons/ActionButton.vue";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const router = useRouter();
const route = useRoute();

const props = defineProps({
  id: { type: [String, Number], required: true },
  effectiveMonth: String,
});

const emit = defineEmits([
  "close",
  "update:formData",
  "update:monthlyCTC",
  "update:netSalary",
]);

const isLoading = ref(false);
const states = ref([]);
const selectedState = ref(null);
const showProfessionalTaxDialog = ref(false);
const professionalTaxRules = ref([]);

// ========== DEFAULT FORM STRUCTURE ==========
const getDefaultForm = () => ({
  earning: [
    {
      id: generateId(),
      label: "Basic Pay",
      value: 0,
      unit: "Percentage",
      isBasic: true,
    },
  ],
  deduction: [],
  employerPF: {
    withinCTC: false,
    value: 1800,
    calculations: ["Basic Pay"],
    amount: 0,
  },
  employerESI: {
    withinCTC: false,
    value: 3.25,
    calculations: ["Basic Pay"],
    amount: 0,
  },
  employeePF: {
    value: 1800,
    calculations: ["Basic Pay"],
    amount: 0,
  },
  employeeESI: {
    value: 0.75,
    calculations: ["Basic Pay"],
    amount: 0,
  },
  includeEdli: false,
  edliAmount: 0,
});

const form = ref(getDefaultForm());

// ========== UTILITY FUNCTIONS ==========
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function safeNumber(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

function safeArray(value, defaultValue = []) {
  return Array.isArray(value) ? value : defaultValue;
}

function safeBoolean(value, defaultValue = false) {
  return typeof value === "boolean" ? value : defaultValue;
}

// ========== EARNING OPTIONS ==========
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
  { name: "Benevolent Fund", type: "Fixed" },
  { name: "Term Insurance", type: "Fixed" },
  { name: "Group Accidental Policy & WC", type: "Fixed" },
  { name: "Gratuity", type: "Fixed" },
  { name: "Statutory Bonus Deduction", type: "Fixed" },
  { name: "Security Deposit", type: "Fixed" },
  { name: "Uniform Deduction", type: "Fixed" },
  { name: "Transport Charges", type: "Fixed" },
  { name: "Miscellaneous Deduction", type: "Fixed" },
  { name: "Food Deduction", type: "Fixed" },
  { name: "Medical Insurance Premium", type: "Fixed" },
];

// ========== COMPUTED PROPERTIES ==========
const availableEarningOptions = computed(() => {
  const usedLabels = form.value.earning.map((item) => item.label);
  return earningOptions.filter((option) => !usedLabels.includes(option.name));
});

const availableDeductionOptions = computed(() => {
  const usedLabels = form.value.deduction.map((item) => item.label);
  return deductionOptions.filter((option) => !usedLabels.includes(option.name));
});

const componentOptions = computed(() => {
  return form.value.earning.map((e) => ({
    label: e.label,
    value: e.label,
    props: e.label === "Basic Pay" ? { disabled: true } : {},
  }));
});

const calculatedMonthlyCTC = computed(() => {
  let total = 0;

  form.value.earning?.forEach((item) => {
    total += safeNumber(item.value);
  });

  if (form.value.employerPF?.withinCTC) {
    total += safeNumber(form.value.employerPF?.amount);
  }

  if (form.value.employerESI?.withinCTC) {
    total += safeNumber(form.value.employerESI?.amount);
  }

  return total;
});

const calculatedNetSalary = computed(() => {
  let netSalary = calculatedMonthlyCTC.value;

  form.value.deduction?.forEach((item) => {
    netSalary -= safeNumber(item.value);
  });

  netSalary -= safeNumber(form.value.employeePF?.amount);
  netSalary -= safeNumber(form.value.employeeESI?.amount);

  return netSalary;
});

// ========== CALCULATION FUNCTIONS ==========
const calculateEmployerPF = () => {
  const pf = form.value.employerPF;
  const earnings = form.value.earning || [];

  if (!pf?.value || !safeArray(pf.calculations).length) {
    if (pf) pf.amount = 0;
    return;
  }

  const total = pf.calculations.reduce((sum, label) => {
    const comp = earnings.find((e) => e.label === label);
    return sum + safeNumber(comp?.value);
  }, 0);

  if (pf.value === 12) {
    pf.amount = Math.round((total * 12) / 100);
  } else if (pf.value === 1800) {
    const val = Math.round((total * 12) / 100);
    pf.amount = val > 1800 ? 1800 : val;
  } else {
    pf.amount = 0;
  }
};

const calculateEmployerESI = () => {
  const esi = form.value.employerESI;
  const earnings = form.value.earning || [];

  if (!esi?.value || !safeArray(esi.calculations).length) {
    if (esi) esi.amount = 0;
    return;
  }

  const total = esi.calculations.reduce((sum, label) => {
    const comp = earnings.find((e) => e.label === label);
    return sum + safeNumber(comp?.value);
  }, 0);

  esi.amount = Math.round((total * esi.value) / 100);
};

const calculateEDLI = () => {
  if (!form.value?.includeEdli || !form.value?.employerPF) {
    if (form.value) form.value.edliAmount = 0;
    return;
  }

  form.value.edliAmount = Math.round(
    (safeNumber(form.value.employerPF.amount) * 1) / 100,
  );
};

const calculateEmployeePF = () => {
  const pf = form.value.employeePF;
  const earnings = form.value.earning || [];

  if (!pf?.value || !safeArray(pf.calculations).length) {
    if (pf) pf.amount = 0;
    return;
  }

  const total = pf.calculations.reduce((sum, label) => {
    const comp = earnings.find((e) => e.label === label);
    return sum + safeNumber(comp?.value);
  }, 0);

  if (pf.value === 12) {
    pf.amount = Math.round((total * 12) / 100);
  } else if (pf.value === 1800) {
    const val = Math.round((total * 12) / 100);
    pf.amount = val > 1800 ? 1800 : val;
  } else {
    pf.amount = 0;
  }
};

const calculateEmployeeESI = () => {
  const esi = form.value.employeeESI;
  const earnings = form.value.earning || [];

  if (!esi?.value || !safeArray(esi.calculations).length) {
    if (esi) esi.amount = 0;
    return;
  }

  const total = esi.calculations.reduce((sum, label) => {
    const comp = earnings.find((e) => e.label === label);
    return sum + safeNumber(comp?.value);
  }, 0);

  esi.amount = Math.round((total * esi.value) / 100);
};

const runAllCalculations = () => {
  calculateEmployerPF();
  calculateEmployerESI();
  calculateEDLI();
  calculateEmployeePF();
  calculateEmployeeESI();
};

// ========== ADD/REMOVE FUNCTIONS ==========
function addSelectedEarning(allowanceName) {
  if (allowanceName) {
    const selectedOption = earningOptions.find(
      (opt) => opt.name === allowanceName,
    );
    const defaultUnit =
      selectedOption?.type === "Percentage" ? "Percentage" : "Fixed";

    form.value.earning.push({
      id: generateId(),
      label: allowanceName,
      value: 0,
      unit: defaultUnit,
      isBasic: false,
    });
  }
}

function removeEarning(idx) {
  if (!form.value.earning[idx]?.isBasic) {
    form.value.earning.splice(idx, 1);
  }
}

function addSelectedDeduction(item) {
  form.value.deduction.push({
    id: generateId(),
    label: item.name,
    value: 0,
    unit: "Fixed",
    type: item.type,
  });
}

function removeDeduction(idx) {
  form.value.deduction.splice(idx, 1);
}

// ========== DATA MAPPING FUNCTION ==========
const mapApiDataToForm = (apiData) => {
  if (!apiData) return getDefaultForm();

  const defaultForm = getDefaultForm();

  // Map earnings
  const earnings = [];
  if (apiData.earnings && typeof apiData.earnings === "object") {
    Object.entries(apiData.earnings).forEach(([key, value]) => {
      const option = earningOptions.find((opt) => opt.name === key);
      earnings.push({
        id: generateId(),
        label: key,
        value: safeNumber(value),
        unit: option?.type === "Percentage" ? "Percentage" : "Fixed",
        isBasic: key === "Basic Pay",
      });
    });
  }

  // Ensure Basic Pay exists
  if (!earnings.some((e) => e.label === "Basic Pay")) {
    earnings.unshift({
      id: generateId(),
      label: "Basic Pay",
      value: safeNumber(apiData.basicPay),
      unit: "Percentage",
      isBasic: true,
    });
  }

  // Map deductions
  const deductions = [];
  if (
    apiData.employeeDeduction &&
    typeof apiData.employeeDeduction === "object"
  ) {
    Object.entries(apiData.employeeDeduction).forEach(([key, value]) => {
      const option = deductionOptions.find((opt) => opt.name === key);
      if (
        option &&
        !["PF", "ESI", "Professional Tax", "Labour Welfare Fund"].includes(key)
      ) {
        deductions.push({
          id: generateId(),
          label: key,
          value: safeNumber(value),
          unit: "Fixed",
          type: option.type,
        });
      }
    });
  }

  // Map employer contributions
  const employerPF = {
    withinCTC: safeBoolean(
      apiData.employersContribution?.PF?.withinCTC,
      defaultForm.employerPF.withinCTC,
    ),
    value:
      apiData.employersContribution?.PF?.value ?? defaultForm.employerPF.value,
    calculations: safeArray(
      apiData.employersContribution?.PF?.calculations,
      defaultForm.employerPF.calculations,
    ),
    amount: safeNumber(apiData.employersContribution?.PF?.amount),
  };

  const employerESI = {
    withinCTC: safeBoolean(
      apiData.employersContribution?.ESI?.withinCTC,
      defaultForm.employerESI.withinCTC,
    ),
    value:
      apiData.employersContribution?.ESI?.value ??
      defaultForm.employerESI.value,
    calculations: safeArray(
      apiData.employersContribution?.ESI?.calculations,
      defaultForm.employerESI.calculations,
    ),
    amount: safeNumber(apiData.employersContribution?.ESI?.amount),
  };

  // Map employee deductions
  const employeePF = {
    value: apiData.employeeDeduction?.PF?.value ?? defaultForm.employeePF.value,
    calculations: safeArray(
      apiData.employeeDeduction?.PF?.calculations,
      defaultForm.employeePF.calculations,
    ),
    amount: safeNumber(apiData.employeeDeduction?.PF?.amount),
  };

  const employeeESI = {
    value:
      apiData.employeeDeduction?.ESI?.value ?? defaultForm.employeeESI.value,
    calculations: safeArray(
      apiData.employeeDeduction?.ESI?.calculations,
      defaultForm.employeeESI.calculations,
    ),
    amount: safeNumber(apiData.employeeDeduction?.ESI?.amount),
  };

  return {
    earning: earnings,
    deduction: deductions,
    employerPF,
    employerESI,
    employeePF,
    employeeESI,
    includeEdli: safeBoolean(apiData.includeEdli, defaultForm.includeEdli),
    edliAmount: safeNumber(apiData.edliAmount),
  };
};

const fetchSalaryBreakdown = async (year, month) => {
  isLoading.value = true;

  const getMonthData = (data, year, month, fieldName) => {
    if (!data?.[year]) {
      console.log(`⚠️ ${fieldName}: No data for year ${year}, using 0`);
      return {};
    }

    // If requested month exists, use it directly
    if (data[year][month]) {
      console.log(`✅ ${fieldName}: Using data for requested month ${month}`);
      return data[year][month];
    }

    // Otherwise, pick closest previous month
    const months = Object.keys(data[year])
      .map((m) => parseInt(m, 10))
      .sort((a, b) => a - b); // ascending

    console.log(`🔹 ${fieldName}: Available months:`, months);

    for (let i = months.length - 1; i >= 0; i--) {
      if (months[i] < parseInt(month, 10)) {
        console.log(
          `✅ ${fieldName}: Using previous month ${months[i]} for requested ${month}`,
        );
        return data[year][months[i].toString().padStart(2, "0")] || {};
      }
    }

    console.log(`⚠️ ${fieldName}: No previous month found, using 0`);
    return {};
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[id][_eq]=${props.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      console.warn("Failed to fetch SalaryBreakdown, using defaults");
      form.value = getDefaultForm();
      return;
    }

    const data = await response.json();
    const salaryBreakdown = data.data?.[0];

    if (salaryBreakdown) {
      const monthData = {
        earnings: getMonthData(
          salaryBreakdown.earnings,
          year,
          month,
          "Earnings",
        ),
        employersContribution: getMonthData(
          salaryBreakdown.employersContribution,
          year,
          month,
          "Employer Contribution",
        ),
        employeeDeduction: getMonthData(
          salaryBreakdown.employeeDeduction,
          year,
          month,
          "Employee Deduction",
        ),
        deduction: getMonthData(
          salaryBreakdown.deduction,
          year,
          month,
          "Deduction",
        ),
      };

      // Ensure fallback to empty object if month data is empty
      const defaultZero = (obj) => (obj && Object.keys(obj).length ? obj : {});

      form.value = mapApiDataToForm({
        ...salaryBreakdown,
        earnings: defaultZero(monthData.earnings),
        employersContribution: defaultZero(monthData.employersContribution),
        employeeDeduction: defaultZero(monthData.employeeDeduction),
        deduction: defaultZero(monthData.deduction),
      });

      console.log(
        `✅ Loaded SalaryBreakdown for ${month}/${year}:`,
        form.value,
      );
    } else {
      console.warn("No salary breakdown found, using defaults");
      form.value = getDefaultForm();
    }
  } catch (error) {
    console.error("Error fetching SalaryBreakdown:", error);
    form.value = getDefaultForm();
  } finally {
    isLoading.value = false;
    runAllCalculations();
  }
};

// ========== WATCHERS ==========
watch(
  [
    () => form.value.employerPF?.calculations,
    () => form.value.employerPF?.value,
  ],
  () => {
    calculateEmployerPF();
    calculateEDLI();
  },
  { deep: true },
);

watch(
  [
    () => form.value.employerESI?.calculations,
    () => form.value.employerESI?.value,
  ],
  () => {
    calculateEmployerESI();
  },
  { deep: true },
);

watch(
  () => form.value.includeEdli,
  () => {
    calculateEDLI();
  },
);

watch(
  [
    () => form.value.employeePF?.calculations,
    () => form.value.employeePF?.value,
  ],
  () => {
    calculateEmployeePF();
  },
  { deep: true },
);

watch(
  [
    () => form.value.employeeESI?.calculations,
    () => form.value.employeeESI?.value,
  ],
  () => {
    calculateEmployeeESI();
  },
  { deep: true },
);

watch(
  () => form.value.earning,
  () => {
    runAllCalculations();
  },
  { deep: true },
);

watch(
  form,
  (newValue) => {
    emit("update:formData", newValue);
  },
  { deep: true },
);

watch(calculatedMonthlyCTC, (newValue) => {
  emit("update:monthlyCTC", newValue);
});

watch(calculatedNetSalary, (newValue) => {
  emit("update:netSalary", newValue);
});
watch(
  () => props.effectiveMonth,
  (newVal) => {
    if (newVal) {
      const [year, month] = newVal.split("-");
      console.log("📅 Effective Month Changed in Child:", { year, month });
      fetchSalaryBreakdown(year, month);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  if (date.value) {
    const [year, month] = date.value.split("-");
    fetchSalaryBreakdown(year, month);
  }

  // Emit initial values
  emit("update:formData", form.value);
  emit("update:monthlyCTC", calculatedMonthlyCTC.value);
  emit("update:netSalary", calculatedNetSalary.value);
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

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
          Create Payroll Policy
        </h2>
      </div>
      <div class="d-flex align-center ga-2">
        <BaseButton
          variant="danger"
          size="sm"
          color="grey"
          class="me-2 text-none"
          :left-icon="XCircle"
          @click="goBack"
          >Cancel</BaseButton
        >
        <BaseButton
          variant="primary"
          size="sm"
          color="#122f68"
          class="text-none text-white"
          :left-icon="Check"
          :loading="saving"
          @click="save"
          >Save
        </BaseButton>
      </div>
    </div>

    <!-- Category Name Section -->
    <div
      class="pa-4 mb-4"
      style="background-color: #f8fafc; border-radius: 8px"
    >
      <v-text-field
        v-model="categoryName"
        label="Category Name *"
        variant="outlined"
        density="compact"
        required
        class="w-100"
      />
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

      <v-row
        v-for="(row, idx) in form.earning"
        :key="row.id"
        class="earning-row align-center mb-3"
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
          />
        </v-col>

        <!-- Column 4: Action -->
        <v-col cols="3" class="text-left">
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
        <div class="section-indicator employer-indicator"></div>
        <h3 class="section-title">Employer Contribution</h3>
      </div>

      <!-- Employer PF -->
      <v-row class="align-center mb-4 pb-2 border-bottom">
        <v-col cols="3"> Employer PF </v-col>

        <!-- <div v-if="!hasPFAccount" class="d-flex align-center">
            <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
            <span class="text-red font-weight-bold">PF Not Available</span>
            <BaseButton
              variant="primary"
              size="sm"
              color="primary"
              :left-icon="Plus"
              class="ml-auto"
              @click="handleAddPfClick"
            >
              Add PF Account
            </BaseButton>
          </div> -->

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

        <v-col cols="3">
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

        <v-col cols="3">
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
        <v-col cols="3"> PF EDLI & Admin Charges </v-col>

        <v-col cols="3">
          <v-switch
            v-model="form.includeEdli"
            hide-details
            density="compact"
            color="success"
            inset
            :disabled="
              form.employerPF.value === '' || form.employerPF.value === null
            "
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
          />
        </v-col>
      </v-row>

      <!-- Deduction Components -->
      <div class="section-header mb-4">
        <div class="section-indicator deduction-indicator"></div>
        <h3 class="section-title">Deduction Components</h3>
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
          />
        </v-col>
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
          />
        </v-col>
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
          />
        </v-col>

        <v-col cols="3">
          <ActionButton
            text="Delete"
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

    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold"
          >Add ESI Account</v-card-title
        >
        <v-card-text>
          <v-form ref="addAccountForm" v-model="formValid">
            <v-text-field
              v-model="newAccount.number"
              label="ESI Number"
              variant="outlined"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="green" :disabled="!formValid" @click="saveAccount"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddPfDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Add PF Account</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="pfNumber"
            label="PF Account Number"
            variant="outlined"
            dense
            hide-details
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAccount">Save</v-btn>
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
const isLoading = ref(true);
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

const state = ref("");

const addAccount = () => {
  router.push("/settings/organization");
};

const fetchStateData = async () => {
  isLoading.value = true;

  try {
    await fetchTenant();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/tax`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    states.value = data.data
      .filter(
        (item) =>
          item.state &&
          ["Tamil Nadu", "Maharashtra", "Delhi", "Karnataka"].includes(
            item.state,
          ),
      )
      .map((item) => ({
        text: item.state,
        value: item.id,
      }));

    selectedState.value = null; // Reset selection if previous value is not valid
  } catch (error) {
    console.error("Error fetching state data:", error);
  }
  isLoading.value = false;
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

    hasESIAccount.value = data.data.some((tenant) => {
      const esiAccountsFromApi = tenant.esiAccountNumber || [];
      return esiAccountsFromApi.some(
        (acc) =>
          acc.state ===
          states.value.find((s) => s.value === selectedState.value)?.text,
      );
    });
  } catch (error) {
    console.error("Error fetching tenant data:", error);
  }
};
const handleAddPfClick = () => {
  if (!categoryName.value) {
    alert("Please select State and Category first");
    return;
  }
  showAddPfDialog.value = true;
};
const handleAddESIClick = () => {
  if (!selectedState.value || !categoryName.value) {
    alert("Please select State and Category first");
    return;
  }
  showAddDialog.value = true;
};
const save = async () => {
  if (!categoryName.value) {
    alert("Please  enter category name before saving.");
    return;
  }
  const percentageEarnings = form.value.earning.filter(
    (earning) => earning.unit === "Percentage",
  );
  if (percentageEarnings.length > 0) {
    const totalPercentage = percentageEarnings.reduce(
      (sum, earning) => sum + (earning.value || 0),
      0,
    );
    if (totalPercentage !== 100) {
      alert(
        `Total percentage of earnings must equal 100%. Current total: ${totalPercentage}%`,
      );
      return;
    }
  }
  saving.value = true;
  try {
    const earnings = form.value.earning
      .filter((earning) => earning.label !== "Basic Pay")
      .map((earning) => ({
        name: earning.label || earning.name || "Allowance",
        calculations: earning.unit === "Percentage" ? "Percentage" : "Fixed",
        Fixed: earning.unit === "Fixed" ? earning.value : 0,
        Percentage: earning.unit === "Percentage" ? earning.value : 0,
      }));

    const deductions = form.value.deduction.map((deduction) => ({
      name: deduction.label || deduction.name,
      calculations: deduction.unit === "Percentage" ? "Percentage" : "Fixed",
      Fixed: deduction.unit === "Fixed" ? deduction.value : 0,
      Percentage: deduction.unit === "Percentage" ? deduction.value : 0,
    }));

    const employersContributions = {
      EmployerPF: {
        selectedOption: form.value.employerPF.value,
        withinCTC: form.value.employerPF.withinCTC || false,
        options: [
          { label: "No Value", value: null },
          { label: "Minimum Amount", value: 1800 },
          { label: "Percentage", value: 12 },
        ],
        Calculations: form.value.employerPF.calculations.flat().map((name) => ({
          name,
          percentage: 100,
        })),
      },
      EmployerESI: {
        selectedOption: form.value.employerESI.value,
        withinCTC: form.value.employerESI.withinCTC || false,
        options: [
          { label: "No Value", value: null },
          { label: "Percentage", value: 3.25 },
        ],
        Calculations: form.value.employerESI.calculations
          .flat()
          .map((name) => ({
            name,
            percentage: 100,
          })),
      },
    };
    const employeeDeductions = {
      EmployeePF: {
        selectedOption: form.value.employeePF.value,

        options: [
          { label: "No Value", value: null },
          { label: "Minimum Amount", value: 1800 },
          { label: "Percentage", value: 12 },
        ],
        Calculations: form.value.employeePF.calculations.flat().map((name) => ({
          name,
          percentage: 100,
        })),
      },
      EmployeeESI: {
        selectedOption: form.value.employeeESI.value,

        options: [
          { label: "No Value", value: null },
          { label: "Percentage", value: 0.75 },
        ],
        Calculations: form.value.employeeESI.calculations
          .flat()
          .map((name) => ({
            name,
            percentage: 100,
          })),
      },
    };

    const payload = {
      configName: categoryName.value,
      stateTaxes: selectedState.value,
      basicPay:
        form.value.earning.find((row) => row.label === "Basic Pay")?.value || 0,
      employersContributions,
      earnings,
      employeeDeductions,
      adminCharges: {
        enable: form.value.includeEdli,
        charge: form.value.includeEdli ? "1" : "0",
      },

      LWF: selectedState.value,
      tenant: {
        tenantId: tenantId,
      },
      professionalTax: selectedState.value,
      deductions: deductions.length > 0 ? deductions : null,
      allowances: form.value.earning
        .filter((e) => e.isAllowance)
        .map((allowance) => ({
          name: allowance.label || allowance.name,
          calculation: "On Attendance",
        })),
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    console.log("Save successful", payload);
    alert("saved successfully");
  } catch (error) {
    console.error("Save failed", error);
  } finally {
    saving.value = false;
    goBack();
  }
};
const saveAccount = async () => {
  try {
    const stateText = states.value.find(
      (s) => s.value === selectedState.value,
    )?.text;

    const payload = {};

    if (newAccount.value.number) {
      payload.esiAccountNumber = [
        ...(tenantData.value?.esiAccountNumber || []),
        { esiAccount: newAccount.value.number, state: stateText },
      ];
    }

    if (pfNumber.value) {
      payload.pfAccount = pfNumber.value;
    }

    console.log("payload", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update Account");
    }

    await response.json();
    showAddDialog.value = false;
    newAccount.number = "";
    showAddPfDialog.value = false;
    pfNumber.value = "";
    await fetchTenant();
  } catch (error) {
    console.error("failed to update", error);
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
    value: 0.75,
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
const availableDeductionOptions = computed(() => {
  const usedLabels = form.value.deduction.map((item) => item.label);
  return deductionOptions.filter((option) => !usedLabels.includes(option.name));
});

// Computed property to show only available earning options (excluding already selected ones)
const availableEarningOptions = computed(() => {
  const usedLabels = form.value.earning.map((item) => item.label);
  return earningOptions.filter((option) => !usedLabels.includes(option.name));
});

const rules = {
  required: (v) => (!!v && v.trim().length > 0) || "Required",
};

function addSelectedEarning(allowanceName) {
  if (allowanceName) {
    const selectedOption = earningOptions.find(
      (opt) => opt.name === allowanceName,
    );
    const defaultUnit =
      selectedOption?.type === "Percentage" ? "Percentage" : "Fixed";

    form.value.earning.push({
      id: rid(),
      label: allowanceName,
      value: 0,
      unit: defaultUnit,
      isBasic: false,
    });
  }
}

function removeEarning(idx) {
  if (!form.value.earning[idx].isBasic) {
    form.value.earning.splice(idx, 1);
  }
}

function addDeduction() {
  form.value.deduction.push({
    label: "",
    value: 0,
    unit: "Percentage",
  });
}

function removeDeduction(idx) {
  form.value.deduction.splice(idx, 1);
}

const goBack = () => {
  emit("close");
  router.push({
    path: "/configuration/payroll-policy",
  });
};

watch(
  () => form.value.earning.map((e) => e.label),
  (newEarnings) => {
    form.value.employerPF.calculations =
      form.value.employerPF.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );

    form.value.employerESI.calculations =
      form.value.employerESI.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );

    form.value.employeePF.calculations =
      form.value.employeePF.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );

    form.value.employeeESI.calculations =
      form.value.employeeESI.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );
  },
  { deep: true },
);

// watch(selectedState, async (newVal) => {
//   const selectedItem = states.value.find((s) => s.value === newVal);
//   if (selectedItem) {
//     const res = await fetch(
//       `${import.meta.env.VITE_API_URL}/items/salarySetting?filter[stateTaxes][_eq]=${newVal}&filter[tenant][tenantId][_eq]=${tenantId}`,
//       { headers: { Authorization: `Bearer ${token}` } },
//     );
//     const data = await res.json();
//     categoryName.value = `${selectedItem.text} ${data.data.length + 1}`;
//     await fetchTenant();
//   }
// });

onMounted(async () => {
  await fetchStateData();
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

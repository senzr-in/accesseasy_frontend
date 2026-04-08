<template>
  <div class="payroll-category">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else-if="employeeData" class="pa-0">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3>Salary Details</h3>
        <div class="d-flex" style="gap: 16px">
          <v-btn
            v-if="!showVoluntaryPFSection && (PFAccount || switches.allowPF)"
            color="green"
            @click="addVoluntaryPF"
          >
            Add Voluntary PF
          </v-btn>

          <BaseButton
            v-if="!showVoluntaryPFSection"
            variant="primary"
            text="Update"
            :disabled="!hasChanges"
            @click="updatePayrollCatagory"
          />
          <v-btn
            v-if="showVoluntaryPFSection"
            color="green"
            @click="savePayrollCategory"
          >
            Save
          </v-btn>
          <v-btn v-if="showVoluntaryPFSection" color="black" @click="cancel">
            Cancel
          </v-btn>
        </div>
      </div>
      <br />
      <v-row v-if="showVoluntaryPFSection" class="mb-4 align-center">
        <v-col cols="2">
          <div class="field-label">Voluntary PF</div>
        </v-col>

        <v-col cols="10">
          <v-row class="align-center" v-if="!hasPFAccount">
            <v-col cols="6" md="4" class="d-flex align-center">
              <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
              <span class="text-red font-weight-bold">PF Not Available</span>
            </v-col>
            <v-col cols="6" md="4" class="text-right">
              <v-btn color="primary" small @click="addAccount">
                Add PF Account
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-if="hasPFAccount">
            <v-col cols="12" md="4">
              <v-select
                :items="voluntaryPFTypeOptions"
                v-model="voluntaryPF.calculationType"
                label="Calculation Type"
                variant="outlined"
                density="comfortable"
                hide-details
                class="ml-4 type-input"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              md="4"
              v-if="voluntaryPF.calculationType !== 'percentage'"
            >
              <v-text-field
                v-model="voluntaryPF.amount"
                label="Amount"
                variant="outlined"
                density="comfortable"
                hide-details
                class="ml-4 type-input"
                type="number"
              ></v-text-field>
            </v-col>

            <v-col
              cols="12"
              md="4"
              v-if="voluntaryPF.calculationType == 'percentage'"
            >
              <v-select
                :items="voluntaryPFOptions"
                v-model="voluntaryPF.value"
                label="Value"
                variant="outlined"
                density="comfortable"
                hide-details
                class="ml-4 value-input"
                item-title="text"
                item-value="value"
                @change="updateVoluntaryPF"
              ></v-select>
            </v-col>

            <v-col
              cols="12"
              md="4"
              v-if="voluntaryPF.calculationType == 'percentage'"
            >
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
              ></v-select>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <div v-if="!showVoluntaryPFSection">
        <v-card class="profile-card mb-6">
          <div class="salary-config pa-4">
            <v-row>
              <v-col cols="6" md="3">
                <label class="config-label">Effective Month</label>
                <v-text-field
                  v-model="date"
                  type="month"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="3">
                <label class="config-label">Payroll Category</label>

                <v-select
                  v-model="selectedCategory"
                  :items="salarySettingsArray"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  class="salary-select"
                  @update:model-value="
                    onSalarySettingChange(selectedCategory.id)
                  "
                  return-object
                />
              </v-col>

              <v-col cols="6" md="3">
                <label class="config-label">Monthly CTC</label>

                <v-text-field
                  v-model="monthlyCTC"
                  :disabled="!selectedCategory"
                  @input="calculateMonthlyCTC"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  type="number"
                  class="ctc-input"
                  prefix="₹"
                />
              </v-col>

              <!-- Net Salary -->
              <v-col cols="6" md="2">
                <label class="config-label">Net Salary</label>
                <div class="inline-salary">
                  <v-icon color="success" class="field-icon">mdi-wallet</v-icon>
                  <span class="salary-amount">₹{{ netSalary }}</span>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <div v-if="selectedCategory" class="salary-breakdown">
          <v-row>
            <v-col cols="12" lg="6">
              <!-- Earnings Card -->
              <v-card class="mb-4 earnings-card">
                <div class="card-header earnings">
                  <div class="header-content">
                    <v-icon size="28" color="white">mdi-cash-plus</v-icon>
                    <div class="header-text">
                      <h3>Earnings</h3>
                      <span class="amount">₹ {{ totalEarnings }}</span>
                    </div>
                    <v-icon
                      color="error"
                      class="mr-2"
                      v-if="basicPayValue < 0"
                      @click="showData"
                      >mdi-information</v-icon
                    >
                  </div>
                </div>
                <v-card-text>
                  <v-list>
                    <!-- Basic Pay -->
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-cash</v-icon>
                      </template>
                      <v-list-item-title>Basic Pay</v-list-item-title>
                      <template v-slot:append>
                        <div class="d-flex align-center">
                          <span class="percentage mr-2">{{ basicPay }}%</span>
                          <span class="amount">₹ {{ basicPayValue }}</span>
                        </div>
                      </template>
                    </v-list-item>

                    <!-- Other Earnings -->
                    <v-list-item v-for="(item, index) in earnings" :key="index">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-plus-circle</v-icon>
                      </template>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <template v-slot:append>
                        <div class="d-flex align-center">
                          <span class="percentage mr-2" v-if="item.percentage"
                            >{{ item.percentage }}%</span
                          >
                          <span class="amount">₹ {{ item.amount }}</span>
                        </div>
                      </template>
                    </v-list-item>
                    <!-- Bonus -->
                    <v-list-item v-if="bonusAmount > 0">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-plus-circle</v-icon>
                      </template>
                      <v-list-item-title>Bonus</v-list-item-title>
                      <template v-slot:append>
                        <span class="amount">₹ {{ bonusAmount }}</span>
                        <!-- <span v-if="!bonusConfig" style="color: red">(No Config)</span>
    <span v-else style="color: green">(Config Found)</span> -->
                      </template>
                    </v-list-item>

                    <!-- Incentive -->
                    <v-list-item v-if="incentiveAmount > 0">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-plus-circle</v-icon>
                      </template>
                      <v-list-item-title>Incentive</v-list-item-title>
                      <template v-slot:append>
                        <span class="amount">₹ {{ incentiveAmount }}</span>
                        <!-- <span v-if="!incentiveConfig" style="color: red">(No Config)</span>
    <span v-else style="color: green">(Config Found)</span> -->
                      </template>
                    </v-list-item>

                    <!-- Retention Pay -->
                    <v-list-item v-if="retentionPayAmount > 0">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-plus-circle</v-icon>
                      </template>
                      <v-list-item-title>Retention Pay</v-list-item-title>
                      <template v-slot:append>
                        <span class="amount">₹ {{ retentionPayAmount }}</span>
                        <!-- <span v-if="!retentionPayConfig" style="color: red">(No Config)</span>
    <span v-else style="color: green">(Config Found)</span> -->
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
              <!-- Employer Contributions Card -->
              <v-card class="mb-4 employer-card">
                <div class="card-header employer">
                  <div class="header-content">
                    <v-icon size="28" color="white">mdi-office-building</v-icon>
                    <div class="header-text">
                      <h3>Employer Contributions</h3>
                      <span class="amount">₹ {{ totalEmployer }}</span>
                    </div>
                  </div>
                </div>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in employerContributions"
                      :key="index"
                    >
                      <template v-slot:prepend>
                        <v-icon color="info">mdi-bank</v-icon>
                      </template>
                      <v-list-item-title>{{ item.name }} </v-list-item-title>
                      <v-checkbox
                        v-model="item.includedInCTC"
                        label="In CTC"
                        density="compact"
                        hide-details
                        class="mr-2"
                        @update:model-value="calculateMonthlyCTC"
                      />

                      <template v-slot:append>
                        <v-chip
                          size="small"
                          color="grey"
                          variant="flat"
                          class="mr-2"
                          >{{ item.amount }}</v-chip
                        >

                        <span class="amount">₹ {{ item.rupee }}</span>
                      </template>
                      <v-chip
                        size="small"
                        color="grey"
                        variant="flat"
                        class="mr-2"
                        >{{ item.component }}</v-chip
                      >
                    </v-list-item>
                    <v-list-item v-if="adminCharges.enable">
                      <template v-slot:prepend>
                        <v-icon color="warning">mdi-account-arrow-left</v-icon>
                      </template>
                      <v-list-item-title>Admin Charges</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          size="small"
                          color="grey"
                          variant="flat"
                          class="mr-2"
                          >{{ adminCharges.charge }}</v-chip
                        >
                        <span class="amount">{{ adminAmount }}</span>
                      </template>
                    </v-list-item>
                    <v-list-item v-if="shopAccount">
                      <template v-slot:prepend>
                        <v-icon color="warning">mdi-account-arrow-left</v-icon>
                      </template>
                      <v-list-item-title>LWF</v-list-item-title>
                      <template v-slot:append>
                        <v-list-item-title v-if="lwfDeduction"
                          >DeductionOn:</v-list-item-title
                        >
                        <v-chip
                          v-if="lwfDeduction"
                          size="small"
                          color="grey"
                          variant="flat"
                          class="mr-2"
                          >{{ lwfDeduction }}</v-chip
                        >
                        <span class="amount">{{ employerLWF }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="6">
              <div class="right-cards">
                <!-- Employee Contributions Card -->
                <v-card class="mb-4 employee-card">
                  <div class="card-header employee">
                    <div class="header-content">
                      <v-icon size="28" color="white">mdi-account-cash</v-icon>
                      <div class="header-text">
                        <h3>Employee Contributions</h3>
                        <span class="amount">₹ {{ totalEmployee }}</span>
                      </div>
                    </div>
                  </div>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="(item, index) in employeeContributions"
                        :key="index"
                      >
                        <template v-slot:prepend>
                          <v-icon color="warning"
                            >mdi-account-arrow-left</v-icon
                          >
                        </template>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <template v-slot:append>
                          <v-chip
                            size="small"
                            color="grey"
                            variant="flat"
                            class="mr-2"
                            >{{ item.amount }}</v-chip
                          >
                          <span class="amount">₹ {{ item.rupee }}</span>
                        </template>
                        <v-chip
                          size="small"
                          color="grey"
                          variant="flat"
                          class="mr-2"
                          >{{ item.component }}</v-chip
                        >
                      </v-list-item>
                    </v-list>

                    <v-list-item v-if="shopAccount">
                      <template v-slot:prepend>
                        <v-icon color="warning">mdi-account-arrow-left</v-icon>
                      </template>
                      <v-list-item-title>LWF</v-list-item-title>
                      <template v-slot:append>
                        <v-list-item-title v-if="lwfDeduction"
                          >DeductionOn:</v-list-item-title
                        >
                        <v-chip
                          v-if="lwfDeduction"
                          size="small"
                          color="grey"
                          variant="flat"
                          class="mr-2"
                          >{{ lwfDeduction }}</v-chip
                        >
                        <span class="amount">{{ employeeLWF }}</span>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="warning">mdi-account-arrow-left</v-icon>
                      </template>
                      <v-list-item-title>PT</v-list-item-title>
                      <template v-slot:append>
                        <span class="amount">{{ professionalTaxAmount }}</span>
                      </template>
                    </v-list-item>
                    <v-list-item v-if="voluntaryPF">
                      <template v-slot:prepend>
                        <v-icon color="warning">mdi-account-arrow-left</v-icon>
                      </template>
                      <v-list-item-title>Voluntary PF</v-list-item-title>
                      <template v-slot:append>
                        <span class="amount">₹ {{ voluntaryPFAmount }}</span>
                      </template>
                    </v-list-item>
                  </v-card-text>
                </v-card>

                <!-- Deductions Card -->
                <v-card class="mb-4 deductions-card">
                  <div class="card-header deductions">
                    <div class="header-content">
                      <v-icon size="28" color="white">mdi-cash-minus</v-icon>
                      <div class="header-text">
                        <h3>Deductions</h3>
                        <span class="amount">₹ {{ totalDeductions }}</span>
                      </div>
                    </div>
                  </div>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="(item, index) in deductions"
                        :key="index"
                      >
                        <template v-slot:prepend>
                          <v-icon color="error">mdi-minus-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <template v-slot:append>
                          <div class="d-flex align-center">
                            <span
                              class="percentage mr-2"
                              v-if="item.percentage"
                            >
                              {{ item.percentage }}%
                            </span>
                            <span class="amount">₹ {{ item.amount }}</span>
                          </div>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="info" class="mr-2">mdi-information</v-icon>
              <span class="text-info"
                >Want to modify the payroll configuration?</span
              >
            </div>
            <v-btn
              color="primary"
              variant="elevated"
              @click="redirectToPayrollConfig"
              prepend-icon="mdi-cog"
            >
              Payroll Category Settings
            </v-btn>
          </div>
        </v-card-text>
      </div>
    </v-container>
    <v-container v-else>
      <v-row>
        <v-col cols="12" class="text-center">
          <p>No employee data found.</p>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { generateCodeFrame } from "vue/compiler-sfc";
import dayjs from "dayjs";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const selectedCategory = ref(null);
const annualCTC = ref(null);
const monthlyCTC = ref(null);
const salaryBreakdownId = ref(null);
const originalCTC = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const voluntaryPF = ref({
  value: null,
  component: [],
  calculations: [],
  calculationType: "percentage",
});

const voluntaryPFAmount = ref(0);

const voluntaryPFOptions = [
  { text: "13% Nolimit", value: 13 },
  { text: "13% ₹1800 limit", value: 1800 },
  { text: "No Value", value: null },
];

const voluntaryPFTypeOptions = [
  { text: "Percentage", value: "percentage" },
  { text: "Fixed", value: "fixed" },
];

const showVoluntaryPFSection = ref(false);
const activeTab = ref("bonus");

const apiUrl = import.meta.env.VITE_API_URL;
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const hasPFAccount = ref(false);
const currentMonth = new Date().toISOString().slice(0, 7);
const date = ref(currentMonth);
// Salary breakdown components
const basicPay = ref(0);
const basicPayOption = ref("On Attendance");
const basicPayValue = ref(0);
const earnings = ref([]);
const deductions = ref([]);
const employerContributions = ref([]);
const employeeContributions = ref([]);
const totalEarnings = ref(0);
const totalEmployer = ref(0);
const totalEmployee = ref(0);
const totalDeductions = ref(0);
const adminCharges = ref({ enable: false, charge: "" });
const lwf = ref(0);
const pt = ref(0);
const employerLWF = ref(0);
const employeeLWF = ref(0);
const professionalTaxAmount = ref(0);
const adminAmount = ref(0);
const gender = ref(null);
const bonusConfig = ref(null);
const incentiveConfig = ref(null);
const retentionPayConfig = ref(null);
const bonusAmount = ref(0);
const incentiveAmount = ref(0);
const retentionPayAmount = ref(0);

const bonusManualConfig = ref({
  reason: "",
  value: 0,
  withinCTC: false,
  paymentDateType: "salary",
  specificDate: null,
  month: null,
});

const incentiveManualConfig = ref({
  reason: "",
  value: 0,
  withinCTC: false,
  paymentDateType: "salary",
  specificDate: null,
  month: null,
});

const retentionPayManualConfig = ref({
  reason: "",
  value: 0,
  withinCTC: false,
  paymentDateType: "salary",
  specificDate: null,
  month: null,
});

const addVoluntaryPF = () => {
  showVoluntaryPFSection.value = true;
};

const months = ref([
  { title: "January", value: 1 },
  { title: "February", value: 2 },
  { title: "March", value: 3 },
  { title: "April", value: 4 },
  { title: "May", value: 5 },
  { title: "June", value: 6 },
  { title: "July", value: 7 },
  { title: "August", value: 8 },
  { title: "September", value: 9 },
  { title: "October", value: 10 },
  { title: "November", value: 11 },
  { title: "December", value: 12 },
]);
const bonusTypes = ref([
  "Performance Bonus",
  "Festival Bonus",
  "Annual Bonus",
  "Retention Bonus",
  "Signing Bonus",
  "Referral Bonus",
]);

const incentiveTypes = ref([
  "Sales Incentive",
  "Performance Incentive",
  "Productivity Incentive",
  "Attendance Incentive",
  "Project Completion Incentive",
]);

const retentionPayTypes = ref([
  "Employee Retention",
  "Critical Skill Retention",
  "Project Retention",
  "Transition Retention",
]);

const salarySettingsArray = ref([]);

const switches = ref({
  allowPF: "",
  allowESI: "",
  allowLWF: "",
});
const PFAccount = ref();
const ESIAccount = ref();
const shopAccount = ref();
// Function to show success message
const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};
const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};
const currentMonthKey = dayjs().format("MM/YYYY");
const hasChanges = computed(() => {
  return (
    selectedCategory.value?.id !== props.employeeData?.salaryConfig?.id ||
    annualCTC.value !==
      breakdownValue.value?.salaryTracking?.[currentMonthKey] ||
    employerContributions.value.some(
      (item) =>
        item.includedInCTC !==
        breakdownValue.value?.employersContribution?.[item.name]?.includedInCTC,
    )
  );
});
const employee = ref(null);

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "salaryConfig.configName",
      "salaryConfig.id",
      "employeeId",
      "assignedUser.first_name",
      "assignedUser.avatar",
      "assignedUser.gender",
      "assignedUser.skilled",
      "assignedBranch.branch_id.areaType",
      "tdsDeduction.id",
      "allowPF",
      "allowESI",
      "allowLwf",
      "assignedUser.PFAccountNumber",
      "assignedUser.ESIAccountNumber",
      "salaryConfigTracking",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${apiUrl}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      employee.value = data.data[0];
      gender.value = employee.value.assignedUser.gender;
      if (employee.value) {
        switches.value.allowPF = employee.value.allowPF;
        switches.value.allowESI = employee.value.allowESI;
        switches.value.allowLWF = employee.value.allowLwf;
        const trimOrNull = (val) =>
          typeof val === "string" ? val.trim() || null : val;

        PFAccount.value = trimOrNull(
          employee.value.assignedUser.PFAccountNumber,
        );
        ESIAccount.value = trimOrNull(
          employee.value.assignedUser.ESIAccountNumber,
        );
        // shopAccount.value = trimOrNull(employee.assignedUser.shopAccount);
      }
      emit("update:employeeData", employee.value);
      await fetchSalaryBreakdown();
      const [selectedYear, selectedMonth] = date.value.split("-");

      const tracking = employee.value.salaryConfigTracking || {};

      const findCategoryId = () => {
        if (tracking[selectedYear]?.[selectedMonth]) {
          return tracking[selectedYear][selectedMonth];
        }

        const months = Object.keys(tracking[selectedYear] || {}).sort(
          (a, b) => b - a,
        );
        if (months.length) return tracking[selectedYear][months[0]];

        const years = Object.keys(tracking).sort((a, b) => b - a);
        for (const year of years) {
          const monthsInYear = Object.keys(tracking[year]).sort(
            (a, b) => b - a,
          );
          if (monthsInYear.length) return tracking[year][monthsInYear[0]];
        }

        return null;
      };

      const initialCategoryId = findCategoryId();
      if (initialCategoryId) {
        await onSalarySettingChange(initialCategoryId);
      }

      // Fetch salary breakdown
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
fetchEmployeeData().then(() => {
  console.log("Final gender value after fetch:", gender.value);
});
const fetchSalarySettings = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${apiUrl}/items/salarySetting?fields=basicPay&fields=earnings&fields=deductions&fields=employerContribution&fields=allowances&fields=deduction&fields=professionalTax&fields=LWF&fields[]=LWF.state&fields[]=LWF.stateTaxRules&fields[]=professionalTax.state&fields[]=professionalTax.stateTaxRules&fields=employersContributions&fields=employeeDeductions&fields=configName&fields=adminCharges&fields=stateTaxes&fields=deductions&fields=id&fields=professionalTax.id&fields=professionalTax.state&fields=professionalTax.stateTaxRules&fields=LWF.id&fields=LWF.state&fields=LWF.stateTaxRules&fields=advancedMode&fields=employerContribution&fields=bonusConfig&fields=incentiveConfig&fields=retentionPayConfig&filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary settings");

    const data = await response.json();
    salarySettingsArray.value = data.data.map((setting) => ({
      id: setting.id,
      name: setting.configName,
    }));
  } catch (error) {
    console.error("Error fetching salary settings:", error);
  }
};

const voluntary = ref(0);
const breakdownValue = ref(null);

const fetchSalaryBreakdown = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${apiUrl}/items/SalaryBreakdown?fields=id&fields=ctc&fields=voluntaryPF&fields=employersContribution&fields=salaryTracking&filter[tenant][tenantId][_eq]=${tenantId}&filter[employee][employeeId][_eq]=${props.employeeData.employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary breakdown");

    const data = await response.json();
    if (data.data.length > 0) {
      salaryBreakdownId.value = data.data[0].id;
      breakdownValue.value = data.data[0];
      console.log("breakdown", breakdownValue.value?.employersContribution);

      const tracking = breakdownValue.value?.salaryTracking || null;

      if (tracking && Object.keys(tracking).length > 0) {
        const now = new Date();
        const currentKey = `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

        date.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const [year, month] = date.value.split("-").map(Number); // FIX: Extract year & month

        if (tracking[currentKey]) {
          monthlyCTC.value = tracking[currentKey];
        } else {
          const sortedKeys = Object.keys(tracking).sort((a, b) => {
            const [ma, ya] = a.split("/").map(Number);
            const [mb, yb] = b.split("/").map(Number);
            return ya - yb || ma - mb;
          });

          for (let i = sortedKeys.length - 1; i >= 0; i--) {
            const [m, y] = sortedKeys[i].split("/").map(Number);
            if (y < year || (y === year && m < month)) {
              monthlyCTC.value = tracking[sortedKeys[i]];
              break;
            }
          }
        }
      } else {
        monthlyCTC.value = data.data[0].ctc;
      }

      originalCTC.value = data.data[0].ctc;
      voluntary.value = data.data[0].voluntaryPF;
      if (voluntary.value?.VoluntaryPF) {
        const vpf = voluntary.value.VoluntaryPF;

        voluntaryPF.value.calculationType = vpf.type;

        voluntaryPF.value.amount = vpf.amount ? Number(vpf.amount) : null;
        voluntaryPF.value.value = vpf.selectedOption;
        voluntaryPF.value.component =
          vpf.Calculations?.map((c) => c.name) || [];
      }

      if (data.data[0].benefitsDetails) {
        const benefits = data.data[0].benefitsDetails;
        if (benefits.bonus) {
          bonusAmount.value = benefits.bonus.amount;
          if (bonusConfig.value) {
            bonusConfig.value.frequency = benefits.bonus.frequency;
            bonusConfig.value.withinCTC = benefits.bonus.withinCTC;
          }
        }
        if (benefits.incentive) {
          incentiveAmount.value = benefits.incentive.amount;
          if (incentiveConfig.value) {
            incentiveConfig.value.frequency = benefits.incentive.frequency;
            incentiveConfig.value.withinCTC = benefits.incentive.withinCTC;
          }
        }
        if (benefits.retentionPay) {
          retentionPayAmount.value = benefits.retentionPay.amount;
          if (retentionPayConfig.value) {
            retentionPayConfig.value.frequency =
              benefits.retentionPay.frequency;
            retentionPayConfig.value.withinCTC =
              benefits.retentionPay.withinCTC;
          }
        }
      }

      calculateMonthlyCTC();
    }
  } catch (error) {
    console.error("Error fetching salary breakdown:", error);
  }
};
const fetchTenant = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    hasPFAccount.value = data.data.some((tenant) => tenant.pfAccount);
    shopAccount.value = data.data.some((tenant) => tenant.shopAccount);
  } catch (error) {
    console.error("Error fetching shop establishment data:", error);
  }
};
let lwfDeduction = 0;
const settingVolunteryPF = ref(null);
const onSalarySettingChange = async (id) => {
  alert("called");
  const settingId = id || selectedCategory.value?.id;
  console.log("id", id);
  if (!settingId) return;

  try {
    let params = {
      fields: [
        "basicPay",
        "earnings",
        "deductions",
        "employerContribution",
        "allowances",
        "deduction",
        "professionalTax",
        "LWF",
        "LWF.state",
        "LWF.stateTaxRules",
        "professionalTax.state",
        "professionalTax.stateTaxRules",
        "employersContributions",
        "employeeDeductions",
        "configName",
        "adminCharges",

        "stateTaxes",
        "deductions",
        "id",
        "professionalTax.id",
        "professionalTax.state",
        "professionalTax.stateTaxRules",
        "LWF.id",
        "LWF.state",
        "LWF.stateTaxRules",
        "bonusConfig",
        "incentiveConfig",
        "retentionPayConfig",
      ],
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${apiUrl}/items/salarySetting/${settingId}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary setting details");

    const data = await response.json();
    const setting = data.data;
    console.log("56", setting);
    if (setting.configName === "Custom") {
      alert("called");
      return CustomConfig;
    }

    selectedCategory.value = { id: setting.id, name: setting.configName };

    settingVolunteryPF.value = data.data;

    // Set basic pay
    basicPay.value = setting.basicPay || 0;
    basicPayOption.value = "On Attendance";

    // Set earnings
    earnings.value = (setting.earnings || []).map((item) => ({
      name: item.name,
      calculation: item.calculations,
      [item.calculations.toLowerCase()]: item[item.calculations] ?? null,
    }));

    // Set deductions
    deductions.value = (setting.deductions || []).map((item) => ({
      name: item.name,
      calculation: item.calculation,
      percentage: item.percentage || 0,
      amount: item.amount || 0,
    }));

    // Set employer contributions
    employerContributions.value = setting.employersContributions
      ? Object.entries(setting.employersContributions)
          .filter(([key]) => {
            if (key === "EmployerPF")
              return PFAccount.value || switches.value.allowPF;
            if (key === "EmployerESI")
              return ESIAccount.value || switches.value.allowESI;
            return true;
          })
          .map(([key, value]) => {
            const breakdownCTC =
              breakdownValue.value?.employersContribution?.[key]?.includedInCTC;
            const selectedId = selectedCategory.value?.id;
            const match = selectedId === props.employeeData?.salaryConfig?.id;
            const fallbackCTC = value.withinCTC ?? false;

            return {
              name: key,
              calculations: value.Calculations || [],
              component: (value.Calculations || [])
                .map((item) => item.name)
                .join(", "),
              amount: value.selectedOption || 0,
              includedInCTC: match ? breakdownCTC : fallbackCTC,
              rupee: 0,
              options: value.options
                ? value.options.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))
                : [],
            };
          })
      : [];

    employeeContributions.value = setting.employeeDeductions
      ? Object.entries(setting.employeeDeductions)
          .filter(([key]) => {
            if (key === "EmployeePF")
              return PFAccount.value || switches.value.allowPF;
            if (key === "EmployeeESI")
              return ESIAccount.value || switches.value.allowESI;
            return true;
          })
          .map(([key, value]) => ({
            name: key,
            calculations: value.Calculations || [],
            component: value.Calculations.map((item) => item.name).join(", "),
            amount: value.selectedOption || 0,
            rupee: 0,
            options: value.options
              ? value.options.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))
              : [],
          }))
      : [];

    //admin charge
    if (PFAccount.value || switches.value.allowPF) {
      adminCharges.value = setting.adminCharges || {};
    }

    lwf.value = setting.LWF?.stateTaxRules;
    lwfDeduction = lwf.value?.LWF?.Deduction?.join(", ");

    pt.value = setting.PT;
    calculateMonthlyCTC();
    processApiData(settingVolunteryPF.value);
  } catch (error) {
    console.error("Error fetching salary setting details:", error);
  }
};

const processApiData = (salarySettings) => {
  if (!salarySettings) {
    console.log("No salary settings available");
    return;
  }
  const earningsOptions = salarySettings.earnings
    ? salarySettings.earnings.map((earning) => earning.name)
    : [];
  console.log("salarySettings.voluntaryPF", breakdownValue.value?.voluntaryPF);
  if (breakdownValue.value?.voluntaryPF?.VoluntaryPF) {
    const vpf = breakdownValue.value?.voluntaryPF?.VoluntaryPF;

    voluntaryPF.value.calculationType = vpf.type;

    voluntaryPF.value.amount = vpf.amount ? Number(vpf.amount) : null;
    voluntaryPF.value.value = vpf.selectedOption;
    voluntaryPF.value.component = vpf.Calculations?.map((c) => c.name) || [];
  }

  if (voluntary.value) {
    const vpfData = voluntary.value;
    voluntaryPF.value = {
      value: vpfData.selectedOption,
      calculations: earningsOptions,
      component: Array.isArray(vpfData.Calculations)
        ? vpfData.Calculations.map((calc) => calc.name)
        : [],
    };
  } else {
    voluntaryPF.value = {
      calculations: earningsOptions,
    };
  }
  showVoluntaryPFSection.value = false;
};
const cancel = () => {
  showVoluntaryPFSection.value = false;
  fetchEmployeeData();
  fetchSalarySettings();
};
const savePayrollCategory = async () => {
  try {
    console.log("==> earnings before map:", earnings);
    const components = Array.isArray(earnings.value)
      ? earnings.value.map((e) => e.name)
      : [];
    console.log("==> components after map:", components);

    const createCalculations = (components, earnings) => {
      if (
        !earnings ||
        (!Array.isArray(earnings) &&
          !earnings.length &&
          typeof earnings[Symbol.iterator] !== "function")
      ) {
        console.error(
          "❌ Error: 'earnings' is not an array or is undefined/null",
          earnings,
        );
        return components.map((comp) => ({
          name: comp,
          percentage:
            comp === "Basic Pay"
              ? (settingVolunteryPF.value?.basicPay ?? 0)
              : 0,
        }));
      }

      if (
        !components ||
        (!Array.isArray(components) &&
          typeof components[Symbol.iterator] !== "function")
      ) {
        console.error(
          "❌ Error: 'components' is not an array or is undefined/null",
          components,
        );
        return [];
      }

      return components.map((comp) => {
        const earning = earnings.find((e) => e.name === comp);
        const percentage =
          comp === "Basic Pay"
            ? (settingVolunteryPF.value?.basicPay ?? 0)
            : (earning?.percentage ?? 0);

        if (comp === "Basic Pay") {
          console.log("✅ Using Basic Pay from apiData:", percentage);
        } else {
          console.log(`🔍 Component: ${comp}, Found earning:`, earning);
        }

        return {
          name: comp,
          percentage,
        };
      });
    };

    console.log(voluntaryPF?.value);
    const voluntaryPFConfig = {
      type: voluntaryPF.value?.calculationType,
      amount: voluntaryPF.value?.amount || 0,
      selectedOption: voluntaryPF.value?.value,
      options: [
        { label: "percentage", value: 13 },
        { label: "Minimum amount", value: 1800 },
        { label: "No Value", value: null },
      ],
      Calculations: createCalculations(components, earnings.value),
    };

    const payload = {
      voluntaryPF: {
        VoluntaryPF: voluntaryPFConfig,
      },
      id: props.id,
    };
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${salaryBreakdownId.value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save changes");
    }
    showVoluntaryPFSection.value = false;
    fetchEmployeeData();
    fetchSalarySettings();
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

const totalAmount = ref(0);

const calculateMonthlyCTC = () => {
  if (
    !monthlyCTC.value ||
    isNaN(monthlyCTC.value) ||
    Number(monthlyCTC.value) === 0
  ) {
    // Reset all values to 0
    monthlyCTC.value = 0;
    basicPayValue.value = 0;
    totalEarnings.value = 0;
    totalEmployer.value = 0;
    totalEmployee.value = 0;
    totalDeductions.value = 0;
    adminAmount.value = 0;
    employerLWF.value = 0;
    employeeLWF.value = 0;
    professionalTaxAmount.value = 0;
    netSalary.value = 0;

    earnings.value = earnings.value.map((item) => ({ ...item, amount: 0 }));
    employerContributions.value = employerContributions.value.map((item) => ({
      ...item,
      rupee: 0,
    }));
    employeeContributions.value = employeeContributions.value.map((item) => ({
      ...item,
      rupee: 0,
    }));

    return;
  }

  // Helper function to round to 1 decimal place - ONLY FOR FINAL DISPLAY
  const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

  // Constants for calculations
  const EMPLOYER_PF_RATE = 0.12;
  const EMPLOYER_ESI_RATE = 0.0325;
  const EMPLOYEE_PF_RATE = 0.12;
  const EMPLOYEE_ESI_RATE = 0.0075;
  const EPF_ADMIN_RATE = 0.01;
  const ESI_THRESHOLD = 21000;

  const monthlyCtcCalculated = Number(monthlyCTC.value);

  let fixedEarningsTotal = 0;

  earnings.value.forEach((item) => {
    if (item.calculation === "Fixed") {
      let fixedAmount = Number(item.fixed || 0);
      fixedEarningsTotal += fixedAmount;
      item.amount = fixedAmount;
    }
  });

  let remainingCTC = monthlyCtcCalculated - fixedEarningsTotal;

  let totalPercentageEarnings = 0;

  earnings.value.forEach((item) => {
    if (item.calculation === "Percentage") {
      if (item.name === "HRA" || item.name === "Dearness Allowance") {
        return;
      } else {
        let percentageAmount =
          (Number(item.percentage || 0) / 100) * remainingCTC;
        totalPercentageEarnings += percentageAmount;
        item.amount = percentageAmount;
      }
    }
  });

  // Now update the fixed earnings total
  fixedEarningsTotal += totalPercentageEarnings;

  employerLWF.value = lwf.value?.LWF?.EmployerLWF || 0;
  employeeLWF.value = lwf.value?.LWF?.EmployeeLWF || 0;

  // Step 3: Initialize components based on percentages
  const basicSalaryTarget = (basicPay.value / 100) * remainingCTC;

  const hraEntry = earnings.value.find((e) => e.name === "HRA");
  const daEntry = earnings.value.find((e) => e.name === "Dearness Allowance");

  const hraPercentage = hraEntry?.percentage || 0;
  const daPercentage = daEntry?.percentage || 0;

  const hraTarget = (hraPercentage / 100) * remainingCTC;
  const daTarget = (daPercentage / 100) * remainingCTC;

  basicPayValue.value = basicSalaryTarget;

  if (hraEntry) {
    hraEntry.amount = hraTarget;
  }

  if (daEntry) {
    daEntry.amount = daTarget;
  }

  // step 3: declare
  let pfCalculation = 0;
  let esiCalculation = 0;

  let employerPfTotal = 0;
  let employeresiTotal = 0;

  for (let iteration = 0; iteration < 5; iteration++) {
    // Calculate Gross Salary (keep full precision during calculations)
    const grossSalary =
      basicPayValue.value +
      (hraEntry ? hraEntry.amount : 0) +
      (daEntry ? daEntry.amount : 0) +
      fixedEarningsTotal;

    const employerPF = employerContributions.value.find(
      (item) => item.name === "EmployerPF",
    );
    const employerESI = employerContributions.value.find(
      (item) => item.name === "EmployerESI",
    );

    if (employerPF) {
      pfCalculation = employerPF.calculations.reduce((sum, calc) => {
        const earningName = earnings.value.find(
          (earn) => earn.name === calc.name,
        );
        const earningAmount = earningName ? earningName.amount : 0;
        return sum + earningAmount;
      }, 0);
    }
    if (employerESI) {
      esiCalculation = employerESI.calculations.reduce((sum, calc) => {
        const earningName = earnings.value.find(
          (earn) => earn.name === calc.name,
        );
        const earningAmount = earningName ? earningName.amount : 0;
        return sum + earningAmount;
      }, 0);
    }

    let pfBaseAmount = basicPayValue.value + pfCalculation;
    let esiBaseAmount = basicPayValue.value + esiCalculation;

    let employerPfTotal = 0,
      employeresiTotal = 0;

    if (employerPF && employerPF.includedInCTC) {
      if (Number(employerPF.amount) === 1800) {
        employerPfTotal = Math.min(pfBaseAmount * (12 / 100), 1800);
      } else {
        employerPfTotal = pfBaseAmount * (employerPF.amount / 100);
      }
    }

    if (employerESI) {
      if (employerESI && employerESI.includedInCTC) {
        if (monthlyCtcCalculated <= ESI_THRESHOLD) {
          if (Number(employerESI.amount) === 1800) {
            employeresiTotal = Math.min(esiBaseAmount * (3.25 / 100), 682.5);
          } else if (employerESI.amount) {
            employeresiTotal = esiBaseAmount * (employerESI.amount / 100);
          }
        }
      }
    }
    let epfAdmin = 0;
    if (employerPF && employerPF.includedInCTC) {
      epfAdmin = Math.min(
        adminCharges.value?.enable ? 0.01 * pfBaseAmount : 0,
        150,
      );
    }

    const employerContributionsTotal =
      employerPfTotal + epfAdmin + employeresiTotal;

    const currentCTC = grossSalary + employerContributionsTotal;

    if (Math.abs(currentCTC - monthlyCtcCalculated) < 0.01) {
      break;
    }

    if (currentCTC > monthlyCtcCalculated) {
      const excess = currentCTC - monthlyCtcCalculated;

      const hraImpact =
        1 +
        (monthlyCtcCalculated <= ESI_THRESHOLD ? EMPLOYER_ESI_RATE : 0) +
        EMPLOYER_PF_RATE +
        (adminCharges.value?.enable ? EPF_ADMIN_RATE : 0);
      const daImpact = hraImpact;
      const basicImpact = hraImpact;

      let remainingExcess = excess;

      if (hraEntry && hraEntry.amount > 0 && remainingExcess > 0) {
        const hraAvailable = hraEntry.amount;
        const reductionNeeded = remainingExcess / hraImpact;
        const hraReduction = Math.min(hraAvailable, reductionNeeded);

        hraEntry.amount -= hraReduction;
        remainingExcess -= hraReduction * hraImpact;
      }

      if (daEntry && daEntry.amount > 0 && remainingExcess > 0) {
        const daReduction = Math.min(
          daEntry.amount,
          remainingExcess / daImpact,
        );

        daEntry.amount -= daReduction;
        remainingExcess -= daReduction * daImpact;
      }

      if (basicPayValue.value > 0 && remainingExcess > 0) {
        const basicReduction = Math.min(
          basicPayValue.value,
          remainingExcess / basicImpact,
        );

        basicPayValue.value -= basicReduction;
        remainingExcess -= basicReduction * basicImpact;
      }
    } else {
      const shortage = monthlyCtcCalculated - currentCTC;

      if (shortage > 0) {
        const basicImpact =
          1 +
          (monthlyCtcCalculated <= ESI_THRESHOLD ? EMPLOYER_ESI_RATE : 0) +
          EMPLOYER_PF_RATE +
          (adminCharges.value?.enable ? EPF_ADMIN_RATE : 0);

        const basicIncrease = Math.min(
          shortage / basicImpact,
          basicSalaryTarget - basicPayValue.value,
        );

        basicPayValue.value += basicIncrease;

        let remainingShortageCovered = basicIncrease * basicImpact;
        let daIncrease = 0,
          hraIncrease = 0;

        // ✅ If DA exists and is below target, increase DA
        if (
          daEntry &&
          daEntry.amount < daTarget &&
          remainingShortageCovered < shortage
        ) {
          const remainingShortageToCover = shortage - remainingShortageCovered;

          daIncrease = Math.min(
            remainingShortageToCover / basicImpact,
            daTarget - daEntry.amount,
          );

          if (daIncrease > 0) {
            daEntry.amount += daIncrease;
            remainingShortageCovered += daIncrease * basicImpact;
          }
        }

        // ✅ If DA does not exist OR DA is already maxed out, increase HRA
        if (
          (!daEntry || daEntry.amount >= daTarget) &&
          remainingShortageCovered < shortage
        ) {
          const remainingShortageToCover = shortage - remainingShortageCovered;

          if (hraEntry && hraEntry.amount < hraTarget) {
            hraIncrease = Math.min(
              remainingShortageToCover / basicImpact,
              hraTarget - hraEntry.amount,
            );

            if (hraIncrease > 0) {
              hraEntry.amount += hraIncrease;
            }
          }
        }
      }
    }
  }

  // Step 5: Final adjustment to match CTC and deductions (aligned with Python)
  const finalGrossSalary =
    basicPayValue.value +
    (hraEntry ? hraEntry.amount : 0) +
    (daEntry ? daEntry.amount : 0) +
    fixedEarningsTotal;
  const finalpfBaseAmount = basicPayValue.value + pfCalculation;
  const finalesiBaseAmount = basicPayValue.value + esiCalculation;
  const finalEmployerPf = EMPLOYER_PF_RATE * finalpfBaseAmount;
  const finalEpfAdmin = adminCharges.value?.enable
    ? EPF_ADMIN_RATE * finalpfBaseAmount
    : 0;
  const finalEmployerEsi =
    monthlyCtcCalculated <= ESI_THRESHOLD
      ? EMPLOYER_ESI_RATE * finalesiBaseAmount
      : 0;
  const finalEmployerTotal = finalEmployerPf + finalEpfAdmin + finalEmployerEsi;
  const finalEmployeePf = EMPLOYEE_PF_RATE * finalpfBaseAmount;
  const finalEmployeeEsi =
    monthlyCtcCalculated <= ESI_THRESHOLD
      ? EMPLOYEE_ESI_RATE * finalesiBaseAmount
      : 0;
  const finalDeductions =
    finalEmployeePf +
    finalEmployeeEsi +
    employeeLWF.value +
    professionalTaxAmount.value;
  const finalCTC = finalGrossSalary + finalEmployerTotal;

  // Step 6: Calculate Professional Tax (unchanged, set to 0 for consistency)
  let professionalTaxCalculated = 0;
  if (lwf.value?.PT) {
    const hasGender = lwf.value.PT.some((entry) => entry.gender !== undefined);
    let filteredData = lwf.value.PT;
    if (hasGender && gender.value) {
      const formattedGender =
        gender.value.charAt(0).toUpperCase() +
        gender.value.slice(1).toLowerCase();
      filteredData = lwf.value.PT.filter(
        (entry) => entry.gender === formattedGender,
      );
    }
    const taxEntry = filteredData.find((entry) => {
      if (entry.salaryRange.includes("and above")) {
        return monthlyCtcCalculated >= parseInt(entry.salaryRange);
      }
      const [min, max] = entry.salaryRange.split("-").map(Number);
      return (
        monthlyCtcCalculated >= min && monthlyCtcCalculated <= (max || Infinity)
      );
    });
    professionalTaxCalculated = taxEntry ? Number(taxEntry.professionalTax) : 0;
  }

  // Step 7: Calculate final values for display
  const totalEarningsCalculated =
    earnings.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) +
    basicPayValue.value;

  employerContributions.value = employerContributions.value.map((item) => {
    const calculations = Array.isArray(item.Calculations)
      ? item.Calculations
      : item.calculations || [];

    if (item.amount === 0 || item.amount === undefined) {
      return { ...item, rupee: 0 };
    }

    const totalAmount = calculations.reduce((sum, calc) => {
      const earningName = earnings.value.find(
        (earn) => earn.name === calc.name,
      );
      const earningAmount = earningName ? earningName.amount : 0;
      return sum + earningAmount;
    }, 0);

    let finalValue = 0;

    if (item.name === "EmployerPF") {
      if (PFAccount.value) {
        if (Number(item.amount) === 1800) {
          finalValue = Math.min(
            (totalAmount + basicPayValue.value) * (12 / 100),
            1800,
          );
        } else {
          finalValue =
            (totalAmount + basicPayValue.value) * (item.amount / 100);
        }
      }
    } else if (item.name === "EmployerESI" && ESIAccount.value) {
      finalValue =
        monthlyCtcCalculated <= ESI_THRESHOLD
          ? Math.min((totalAmount + basicPayValue.value) * (3.25 / 100), 682.5)
          : 0;
    }

    return { ...item, rupee: finalValue };
  });

  let adminAmountCalculated = 0;
  if (adminCharges.value?.enable === true) {
    if (PFAccount.value || switches.value.allowPF) {
      adminAmountCalculated = Math.min(
        (pfCalculation + basicPayValue.value) * 0.01,
        150,
      );
    }
  }

  let voluntaryPFCalculated = 0;
  if (voluntary.value) {
    if (PFAccount.value || switches.value.allowPF) {
      const vp = voluntary.value.VoluntaryPF;

      if (vp.type === "percentage") {
        const totalAmount = vp.Calculations.reduce((sum, calc) => {
          const earningEntry = earnings.value.find(
            (earn) => earn.name === calc.name,
          );
          const earningAmount = earningEntry ? earningEntry.amount : 0;
          return sum + earningAmount;
        }, 0);

        if (Number(vp.selectedOption) === 1800) {
          const percentageOption = vp.options?.find(
            (opt) => opt.label === "percentage",
          );

          if (percentageOption) {
            const rawCalc = (totalAmount + basicPayValue.value) * (13 / 100);
            voluntaryPFCalculated = Math.min(rawCalc, 1800);
          }
        } else if (vp.selectedOption === null) {
          voluntaryPFCalculated = 0;
        } else {
          const percentageOption = vp.options?.find(
            (opt) => opt.label === "percentage",
          );

          if (percentageOption) {
            voluntaryPFCalculated =
              (totalAmount + basicPayValue.value) *
              (percentageOption.value / 100);
          }
        }
      } else {
        voluntaryPFCalculated = vp.amount;
      }
    }
  }

  employeeContributions.value = employeeContributions.value.map((item) => {
    const calculations = Array.isArray(item.Calculations)
      ? item.Calculations
      : item.calculations || [];

    if (item.amount === 0 || item.amount === undefined) {
      return { ...item, rupee: 0 };
    }

    const totalAmount = calculations.reduce((sum, calc) => {
      const earningName = earnings.value.find(
        (earn) => earn.name === calc.name,
      );
      const earningAmount = earningName ? earningName.amount : 0;
      return sum + earningAmount;
    }, 0);

    let finalValue = 0;

    if (
      item.name === "EmployeePF" &&
      (PFAccount.value || switches.value.allowPF)
    ) {
      if (Number(item.amount) === 1800) {
        const percentageOption = item.options?.find(
          (opt) => opt.label === "percentage",
        );
        if (percentageOption) {
          finalValue = Math.min(
            (totalAmount + basicPayValue.value) *
              (percentageOption.value / 100),
            1800,
          );
        }
      } else {
        finalValue = (totalAmount + basicPayValue.value) * 0.12;
      }
    } else if (
      item.name === "EmployeeESI" &&
      (ESIAccount.value || switches.value.allowESI)
    ) {
      finalValue =
        monthlyCtcCalculated <= ESI_THRESHOLD
          ? Math.min((totalAmount + basicPayValue.value) * (0.75 / 100), 157.5)
          : 0;
    }

    return { ...item, rupee: finalValue };
  });

  const totalEmployerCalculated =
    employerContributions.value.reduce(
      (sum, item) => sum + (Number(item.rupee) || 0),
      0,
    ) + adminAmountCalculated;

  const totalEmployeeCalculated =
    employeeContributions.value.reduce(
      (sum, item) => sum + (Number(item.rupee) || 0),
      0,
    ) +
    Number(professionalTaxCalculated || 0) +
    Number(voluntaryPFCalculated || 0);

  const totalDeductionsCalculated = deductions.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const netSalaryCalculated =
    totalEarningsCalculated +
    totalEmployerCalculated -
    totalEmployeeCalculated -
    totalDeductionsCalculated;

  // FINAL STEP: Apply rounding ONLY to the final display values
  monthlyCTC.value = roundToOneDecimal(monthlyCtcCalculated);
  basicPayValue.value = roundToOneDecimal(basicPayValue.value);
  if (hraEntry) hraEntry.amount = roundToOneDecimal(hraEntry.amount);
  if (daEntry) daEntry.amount = roundToOneDecimal(daEntry.amount);

  // Round earnings amounts
  earnings.value = earnings.value.map((item) => ({
    ...item,
    amount: roundToOneDecimal(item.amount),
  }));

  // Round employer contributions
  employerContributions.value = employerContributions.value.map((item) => ({
    ...item,
    rupee: roundToOneDecimal(item.rupee),
  }));

  // Round employee contributions
  employeeContributions.value = employeeContributions.value.map((item) => ({
    ...item,
    rupee: roundToOneDecimal(item.rupee),
  }));

  totalEarnings.value = Math.round(totalEarningsCalculated);
  totalEmployer.value = Math.round(totalEmployerCalculated);
  totalEmployee.value = Math.round(totalEmployeeCalculated);
  totalDeductions.value = Math.round(totalDeductionsCalculated);
  adminAmount.value = Math.round(adminAmountCalculated);
  employerLWF.value = Math.round(employerLWF.value);
  employeeLWF.value = roundToOneDecimal(employeeLWF.value);
  professionalTaxAmount.value = roundToOneDecimal(professionalTaxCalculated);
  voluntaryPFAmount.value = roundToOneDecimal(voluntaryPFCalculated);
};

const getMultiplier = (frequency) => {
  switch (frequency) {
    case "yearly":
      return 1;
    case "half-yearly":
      return 2;
    case "quarterly":
      return 4;
    case "monthly":
      return 12;
    default:
      return 1;
  }
};

const updatePayrollCatagory = async () => {
  if (!hasChanges.value) return;
  if (monthlyCTC.value) {
    if (totalAmount.value > monthlyCTC.value) {
      showErrorMessage("Cannot update! Fixed earnings exceed Monthly CTC.");
      return;
    }
  }
  const earningsPayload = earnings.value.reduce((acc, item) => {
    acc[item.name] = item.amount;
    return acc;
  }, {});
  const employerContributionsPayload = employerContributions.value.reduce(
    (acc, item) => {
      acc[item.name] = {
        amount: item.rupee,
        includedInCTC: item.includedInCTC,
      };
      return acc;
    },
    {},
  );

  const employeeContributionsPayload = employeeContributions.value.reduce(
    (acc, item) => {
      acc[item.name] = item.rupee;
      return acc;
    },
    {},
  );
  const deductionsPayload = deductions.value.reduce((acc, item) => {
    acc[item.name] = item.amount;
    return acc;
  }, {});

  const [year, month] = date.value.split("-");

  const updatedTracking = {
    ...(employee.value?.salaryConfigTracking || {}),
  };
  updatedTracking[year] = updatedTracking[year] || {};
  updatedTracking[year][month] = selectedCategory.value.id;
  try {
    const payload = {
      salaryConfigTracking: updatedTracking,
    };

    const personalModuleResponse = await fetch(
      `${apiUrl}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!personalModuleResponse.ok) {
      throw new Error("Failed to update personal module");
    }

    if (salaryBreakdownId.value) {
      const salaryBreakdownResponse = await fetch(
        `${apiUrl}/items/SalaryBreakdown/${salaryBreakdownId.value}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ctc: annualCTC.value || 0,
            earnings: earningsPayload,
            basicPay: basicPayValue.value || 0,
            basicSalary: monthlyCTC.value || 0,
            netSalary: netSalary.value || 0,
            employersContribution: employerContributionsPayload || 0,
            employeeDeduction: employeeContributionsPayload || 0,
            deduction: deductionsPayload || 0,
            profeesionalTax: professionalTaxAmount.value || 0,
            employerLwf: employerLWF.value || 0,
            employeeLwf: employeeLWF.value || 0,
            employeradmin: adminAmount.value || 0,
            totalDeductions: totalDeductions.value || 0,
            totalEarnings: totalEarnings.value || 0,

            salaryTracking: {
              ...(breakdownValue.value?.salaryTracking || {}),
              [`${date.value.split("-")[1]}/${date.value.split("-")[0]}`]:
                monthlyCTC.value || 0,
            },
          }),
        },
      );

      if (!salaryBreakdownResponse.ok) {
        throw new Error("Failed to update salary breakdown");
      }
      if (salaryBreakdownResponse.ok) {
        const salaryBreakdownData = await salaryBreakdownResponse.json();

        const earnings = salaryBreakdownData.data.id;
        console.log("ear", earnings);

        // await tdsDeduction(earnings);
      }
    } else {
      // Create new salary breakdown if it doesn't exist
      const newSalaryBreakdownResponse = await fetch(
        `${apiUrl}/items/SalaryBreakdown`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ctc: annualCTC.value,
            employee: props.id,
            tenant: currentUserTenant.getTenantId(),
          }),
        },
      );

      if (!newSalaryBreakdownResponse.ok) {
        throw new Error("Failed to create salary breakdown");
      }
    }

    // Refresh employee data
    await fetchEmployeeData();
    showSuccessMessage("Payroll category updated successfully!");
    console.log("Payroll category updated successfully");
  } catch (error) {
    console.error("Error updating payroll category:", error);
    showErrorMessage(`Error updating payroll category: ${error.message}`);
  }
};

const redirectToPayrollConfig = () => {
  router.push("/settings/payrollCatagory");
};
const getMonthName = (monthValue) => {
  const month = months.value.find((m) => m.value === monthValue);
  return month ? month.title : "";
};
const netSalary = computed(() => {
  return (
    totalEmployer.value +
    totalEarnings.value -
    (totalDeductions.value + totalEmployee.value + totalEmployer.value)
  );
});

onMounted(() => {
  fetchEmployeeData();
  fetchSalarySettings();
  fetchTenant();
});

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  },
);
watch(date, async (newVal) => {
  if (!newVal || !breakdownValue.value) return;

  const [year, month] = newVal.split("-");
  const selectedKey = `${month}/${year}`;
  const tracking = breakdownValue.value?.salaryTracking || {};

  if (tracking[selectedKey]) {
    monthlyCTC.value = tracking[selectedKey];
  } else {
    const sortedKeys = Object.keys(tracking).sort((a, b) => {
      const [ma, ya] = a.split("/").map(Number);
      const [mb, yb] = b.split("/").map(Number);
      return ya - yb || ma - mb;
    });

    for (let i = sortedKeys.length - 1; i >= 0; i--) {
      const [m, y] = sortedKeys[i].split("/").map(Number);
      if (y < parseInt(year) || (y === parseInt(year) && m < parseInt(month))) {
        monthlyCTC.value = tracking[sortedKeys[i]];
        break;
      }
    }
  }

  let categoryId = employee.value?.salaryConfigTracking?.[year]?.[month];

  if (!categoryId) {
    const years = Object.keys(employee.value?.salaryConfigTracking || {}).sort(
      (a, b) => b - a,
    );
    for (const y of years) {
      if (
        parseInt(y) < parseInt(year) ||
        (y === year &&
          Object.keys(employee.value.salaryConfigTracking[y] || {}).some(
            (m) => parseInt(m) < parseInt(month),
          ))
      ) {
        const months = Object.keys(employee.value.salaryConfigTracking[y]).sort(
          (a, b) => b - a,
        );
        const validMonth = months.find(
          (m) =>
            parseInt(y) < parseInt(year) ||
            (y === year && parseInt(m) < parseInt(month)),
        );
        if (validMonth) {
          categoryId = employee.value.salaryConfigTracking[y][validMonth];
          break;
        }
      }
    }
  }

  if (categoryId) {
    await onSalarySettingChange(categoryId);
  } else {
    selectedCategory.value = null;
  }
});

watch(monthlyCTC, (newValue) => {
  if (newValue && !isNaN(newValue)) {
    calculateMonthlyCTC();
  }
});
</script>

<style scoped>
.bonus-section {
  background: white;
  border-radius: 8px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}
.special-payment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  border-top: 1px solid #eee;
}
.special-payment-fullpage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 100;
  overflow-y: auto;
  padding: 20px;
}
.payroll-category {
  padding: 20px;
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
  position: relative;
}

.config-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-icon {
  margin-top: 4px;
}

.salary-select,
.ctc-input,
.net-salary-input {
  flex: 1;
  background-color: white;
  border-radius: 8px;
}

.card-header {
  padding: 20px;
  color: white;
}

.card-header.earnings {
  background: linear-gradient(135deg, #66cdaa 0%, #c4e17f 100%);
}

.card-header.employer {
  background: linear-gradient(135deg, #6faedb 0%, #b6e3f7 100%);
}

.card-header.employee {
  background: linear-gradient(135deg, #f9a17c 0%, #fbc28d 100%);
}

.card-header.deductions {
  background: linear-gradient(135deg, #f08d7d 0%, #f7a68f 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-text {
  flex: 1;
}

.header-text h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.amount {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.percentage {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.salary-breakdown {
  margin-bottom: 60px;
}

.net-salary-input {
  display: inline-block;
  margin-left: 16px;
  vertical-align: middle;
}

.salary-config .v-col {
  display: flex;
  align-items: center;
}

.salary-config .v-col > * {
  flex: 1;
}

@media (max-width: 960px) {
  .salary-config .v-col {
    flex-direction: column;
    align-items: stretch;
  }

  .net-salary-input {
    margin-left: 0;
    margin-top: 16px;
  }
}

:deep(.v-list-item) {
  padding: 16px;
  margin-bottom: 4px;
  border-radius: 8px;
}

:deep(.v-list-item:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}

@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-meta {
    justify-content: center;
  }
}

.net-salary-input {
  width: 100% !important;
  margin-left: 0 !important;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-input__prepend) {
  margin-right: 8px;
}
.inline-salary {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 8px 0;
}

.field-icon {
  margin-right: 6px;
}

.salary-amount {
  color: #2e7d32; /* Green color to match success theme */
}
</style>

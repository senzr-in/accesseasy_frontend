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
      <h3>Payroll Category</h3>
      <br />
      <!-- Employee Profile Card -->
      <v-card class="profile-card mb-6">
        <div class="salary-config pa-4">
          <v-row>
            <!-- Payroll Category -->
            <v-col cols="12" md="4">
              <label class="config-label">Payroll Category</label>
              <div class="input-wrapper">
                <v-icon color="primary" class="field-icon"
                  >mdi-cash-multiple</v-icon
                >
                <v-select
                  v-model="selectedCategory"
                  :items="salarySettingsArray"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  class="salary-select"
                  @update:model-value="onSalarySettingChange"
                  return-object
                />
              </div>
            </v-col>

            <!-- Annual CTC -->
            <v-col cols="12" md="4">
              <label class="config-label">Annual CTC</label>
              <div class="input-wrapper">
                <v-icon color="success" class="field-icon"
                  >mdi-currency-inr</v-icon
                >
                <v-text-field
                  v-model="annualCTC"
                  :disabled="!selectedCategory"
                  @input="calculateMonthlyCTC"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  type="number"
                  class="ctc-input"
                  prefix="₹"
                />
              </div>
            </v-col>

            <!-- Net Salary -->
            <v-col cols="12" md="4">
              <label class="config-label">Net Salary</label>
              <div class="input-wrapper">
                <v-icon color="success" class="field-icon">mdi-wallet</v-icon>
                <v-text-field
                  :value="netSalary"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="net-salary-input"
                  prefix="₹"
                />
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card>

      <!-- Salary Breakdown Section -->
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
                        <span class="percentage mr-2"
                          >{{ item.percentage }}%</span
                        >
                        <span class="amount">₹ {{ item.amount }}</span>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="right-cards">
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
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <template v-slot:append>
                        <div class="d-flex align-center">
                          <v-chip
                            size="small"
                            color="success"
                            variant="flat"
                            class="mr-2"
                            v-if="item.includedInCTC"
                          >
                            In CTC
                          </v-chip>
                          <span class="amount">₹ {{ item.rupee }}</span>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>

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
                        <v-icon color="warning">mdi-account-arrow-left</v-icon>
                      </template>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="amount">₹ {{ item.rupee }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
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
                          <span class="percentage mr-2" v-if="item.percentage">
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

      <!-- Action Footer -->
      <v-card class="mt-4 action-footer" flat>
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
      </v-card>
    </v-container>
    <v-container v-else>
      <v-row>
        <v-col cols="12" class="text-center">
          <p>No employee data found.</p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

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
const annualCTC = ref("");
const monthlyCTC = ref("");
const salaryBreakdownId = ref(null);
const originalCTC = ref(null);

const apiUrl = import.meta.env.VITE_API_URL;
const token = computed(() => authService.getToken());

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

const salarySettingsArray = ref([]);

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
      const employee = data.data[0];
      emit("update:employeeData", employee);

      // Set the selected category if salaryConfig exists
      if (employee.salaryConfig) {
        selectedCategory.value = {
          id: employee.salaryConfig.id,
          name: employee.salaryConfig.configName,
        };
        await onSalarySettingChange(employee.salaryConfig.id);
      }

      // Fetch salary breakdown
      await fetchSalaryBreakdown();
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

const fetchSalarySettings = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${apiUrl}/items/salarySetting?fields=basicPay&fields=earnings&fields=deductions&fields=employerContribution&fields=allowances&fields=deduction&fields=professionalTax&fields=LWF&fields=employersContributions&fields=employeeDeductions&fields=configName&fields=adminCharges&fields=payrollBranch&fields=stateTaxes&fields=deductions&fields=id&fields=professionalTax.id&fields=professionalTax.state&fields=professionalTax.stateTaxRules&fields=LWF.id&fields=LWF.state&fields=LWF.stateTaxRules&filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
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

const fetchSalaryBreakdown = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${apiUrl}/items/SalaryBreakdown?fields=id&fields=ctc&filter[tenant][tenantId][_eq]=${tenantId}&filter[employee][employeeId][_contains]=${props.employeeData.employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary breakdown");

    const data = await response.json();
    if (data.data.length > 0) {
      salaryBreakdownId.value = data.data[0].id;
      annualCTC.value = data.data[0].ctc || "";
      originalCTC.value = data.data[0].ctc || "";
      calculateMonthlyCTC();
    }
  } catch (error) {
    console.error("Error fetching salary breakdown:", error);
  }
};

const onSalarySettingChange = async (value) => {
  const settingId = typeof value === "object" ? value.id : value;
  if (!settingId) return;

  try {
    const response = await fetch(`${apiUrl}/items/salarySetting/${settingId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch salary setting details");

    const data = await response.json();
    const setting = data.data;

    // Set basic pay
    basicPay.value = setting.basicPay || 0;
    basicPayOption.value = "On Attendance";

    // Set earnings
    earnings.value = (setting.earnings || []).map((item) => ({
      name: item.name,
      calculation: "On Attendance",
      percentage: item.percentage || 0,
      amount: 0,
    }));

    // Set deductions
    deductions.value = (setting.deduction || []).map((item) => ({
      name: item.name,
      calculation: item.calculation,
      percentage: item.percentage || 0,
      amount: item.amount || 0,
    }));

    // Set employer contributions
    employerContributions.value = setting.employersContributions
      ? Object.entries(setting.employersContributions).map(([key, value]) => ({
          name: key,
          calculations: value.Calculations || [],
          amount: value.selectedOption || 0,
          includedInCTC: true,
          rupee: 0,
          options: value.options
            ? value.options.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))
            : [],
        }))
      : [];

    // Set employee contributions
    employeeContributions.value = setting.employeeDeductions
      ? Object.entries(setting.employeeDeductions).map(([key, value]) => ({
          name: key,
          calculations: value.Calculations || [],
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

    calculateMonthlyCTC();
  } catch (error) {
    console.error("Error fetching salary setting details:", error);
  }
};

const calculateMonthlyCTC = () => {
  if (!annualCTC.value || isNaN(annualCTC.value)) return;

  const monthly = Number(annualCTC.value) / 12;
  monthlyCTC.value = monthly;

  // Calculate basic pay
  basicPayValue.value = (monthly * basicPay.value) / 100;

  // Calculate earnings
  earnings.value = earnings.value.map((item) => ({
    ...item,
    amount: (monthly * item.percentage) / 100,
  }));

  // Calculate total earnings
  totalEarnings.value =
    earnings.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) +
    Number(basicPayValue.value);

  employerContributions.value = employerContributions.value.map((item) => {
    const calculations = Array.isArray(item.Calculations)
      ? item.Calculations
      : item.calculations || [];
    let finalValue;

    if (Number(item.amount) === 1800) {
      // Find the percentage option
      const percentageOption = item.options?.find(
        (opt) => opt.label === "percentage",
      );

      if (percentageOption) {
        // Use the percentage value from options for calculation
        const totalAmount = calculations.reduce((sum, calc) => {
          const percentage = calc.percentage || 0;
          const calculatedAmount = (monthly * percentage) / 100;
          return sum + calculatedAmount;
        }, 0);
        finalValue = Math.min(
          totalAmount * (percentageOption.value / 100),
          1800,
        );
      }
    } else {
      // Original calculation for other cases
      const totalAmount = calculations.reduce((sum, calc) => {
        const percentage = calc.percentage || 0;
        const calculatedAmount = (monthly * percentage) / 100;
        return sum + calculatedAmount;
      }, 0);
      finalValue = totalAmount * (item.amount / 100 || 1);
    }

    return {
      ...item,
      rupee: finalValue,
    };
  });

  // Calculate total employer contributions
  totalEmployer.value = employerContributions.value.reduce(
    (sum, item) => sum + (Number(item.rupee) || 0),
    0,
  );
  earnings.value.forEach((item) => {
    if (item.name === "Dearness Allowance") {
      item.amount -= totalEmployer.value;
    }
    totalEarnings.value =
      earnings.value.reduce((sum, item) => sum + (item.amount || 0), 0) +
      (basicPayValue.value || 0);
  });
  // Calculate employee contributions
  employeeContributions.value = employeeContributions.value.map((item) => {
    const calculations = Array.isArray(item.Calculations)
      ? item.Calculations
      : item.calculations || [];
    let finalValue;

    if (Number(item.amount) === 1800) {
      // Find the percentage option
      const percentageOption = item.options?.find(
        (opt) => opt.label === "percentage",
      );

      if (percentageOption) {
        // Use the percentage value from options for calculation
        const totalAmount = calculations.reduce((sum, calc) => {
          const percentage = calc.percentage || 0;
          const calculatedAmount = (monthly * percentage) / 100;
          return sum + calculatedAmount;
        }, 0);
        finalValue = Math.min(
          totalAmount * (percentageOption.value / 100),
          1800,
        );
      }
    } else {
      // Original calculation for other cases
      const totalAmount = calculations.reduce((sum, calc) => {
        const percentage = calc.percentage || 0;
        const calculatedAmount = (monthly * percentage) / 100;
        return sum + calculatedAmount;
      }, 0);
      finalValue = totalAmount * (item.amount / 100 || 1);
    }

    return {
      ...item,
      rupee: finalValue,
    };
  });

  // Calculate total employee contributions
  totalEmployee.value = employeeContributions.value.reduce(
    (sum, item) => sum + (Number(item.rupee) || 0),
    0,
  );

  // Calculate total deductions
  totalDeductions.value = deductions.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
};

const redirectToPayrollConfig = () => {
  router.push("/settings/payrollCatagory");
};

const netSalary = computed(() => {
  return (
    totalEmployer.value +
    totalEarnings.value -
    (totalDeductions.value + totalEmployee.value)
  );
});

onMounted(() => {
  fetchEmployeeData();
  fetchSalarySettings();
});

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  },
);

watch(annualCTC, (newValue) => {
  if (newValue && !isNaN(newValue)) {
    calculateMonthlyCTC();
  }
});
</script>

<style scoped>
.payroll-category {
  padding: 20px;
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
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

.action-footer {
  background: #f5f5f5;
  border-radius: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.salary-breakdown {
  margin-bottom: 60px; /* Add space for the fixed footer */
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
</style>

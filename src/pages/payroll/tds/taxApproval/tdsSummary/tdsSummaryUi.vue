<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <div class="d-flex align-center mb-2">
          <v-icon class="mr-2">mdi-file-document-outline</v-icon>
          <h2 class="text-h5 font-weight-bold">TDS Calculations Summary</h2>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1 mb-0">
          Annual Salary: {{ formatCurrency(totalYearlyEarnings) }}
        </p>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-end align-center">
        <div class="d-flex align-center">
          <span class="mr-3 text-body-1">Select Tax Regime:</span>
          <v-select
            v-model="selectedRegime"
            :items="regimeOptions"
            variant="outlined"
            density="compact"
            hide-details
            class="regime-select"
            style="min-width: 150px"
          ></v-select>
        </div>
      </v-col>
    </v-row>

    <v-card elevation="2" class="overflow-hidden">
      <v-table class="comparison-table">
        <thead>
          <tr>
            <th class="text-left font-weight-bold pa-4" style="width: 40%">
              Description
            </th>
            <th
              class="text-center font-weight-bold pa-4"
              :class="{
                'new-regime-header': selectedRegime === 'New Regime',
                'disabled-regime': selectedRegime !== 'New Regime',
              }"
            >
              New Regime
              <v-icon
                v-if="selectedRegime === 'New Regime'"
                color="success"
                class="ml-2"
                >mdi-check-circle</v-icon
              >
            </th>
            <th
              class="text-center font-weight-bold pa-4"
              :class="{
                'old-regime-header': selectedRegime === 'Old Regime',
                'disabled-regime': selectedRegime !== 'Old Regime',
              }"
            >
              Old Regime
              <v-icon
                v-if="selectedRegime === 'Old Regime'"
                color="primary"
                class="ml-2"
                >mdi-check-circle</v-icon
              >
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in calculatedTableData"
            :key="index"
            :class="getRowClass(row.type)"
          >
            <td class="pa-4 font-weight-medium">{{ row.description }}</td>
           
            <td
  class="pa-4 text-center font-weight-medium cursor-pointer"
  :class="[
    getValueClass(row.type, 'new'),
    { 'disabled-cell': selectedRegime !== 'New Regime' },
  ]"
  @click="row.type === 'tax-liability' ? openBreakdown('New Regime') : null"
>
  {{ row.newRegime }}
</td>
<td
  class="pa-4 text-center font-weight-medium cursor-pointer"
  :class="[
    getValueClass(row.type, 'old'),
    { 'disabled-cell': selectedRegime !== 'Old Regime' },
  ]"
  @click="row.type === 'tax-liability' ? openBreakdown('Old Regime') : null"
>
  {{ row.oldRegime }}
</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    
<v-dialog v-model="breakdownDialog" max-width="400" persistent>
  <v-card class="pa-4">
    <v-card-title class="text-center pb-4">
      <span class="text-h6 font-weight-semibold">{{ selectedBreakdownRegime }} Breakdown</span>
    </v-card-title>
    
    <v-card-text class="py-2">
      <div class="breakdown-content">
        <div 
          v-for="(slab, index) in breakdownSlabs" 
          :key="index"
          class="text-center py-3"
          :class="{ 'border-bottom': index < breakdownSlabs.length - 1 }"
        >
          <div class="text-body-2 font-weight-medium text-grey-darken-2 mb-1">
            {{ slab.range }}—{{ slab.amount }}{{ slab.percentage }}
          </div>
          <div class="text-body-2 text-grey-darken-1">→ Tax: {{ slab.tax }}</div>
        </div>
        
        <div class="pt-4 mt-4 border-top">
          <div class="text-center">
            <div class="text-body-1 font-weight-semibold">Total Tax: {{ breakdownTotalTax }}</div>
          </div>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions class="justify-center pt-0">
      <v-btn text @click="breakdownDialog = false">Close</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { authService } from "@/services/authService";

// Reactive data
const selectedRegime = ref(null);
const regimeOptions = ["New Regime", "Old Regime"];

const breakdownDialog = ref(false);
const selectedBreakdownRegime = ref('');
const breakdownSlabs = ref([]);
const breakdownTotalTax = ref('');

const totalYearlyEarnings = ref(0);
const totalEstimatedPF = ref(0);
const ctc = ref(0);
const employeePF = ref();

const approvedHraAmount = ref(0);
const approvedHomeLoan = ref(0);
const approvedHomeLoanInvestment = ref(0);
const approvedHomeLoanDeduction = ref(0);

// Section 80 deductions
const approved80C = ref(0);
const approved80CCD = ref(0);
const approved80D = ref(0);
const approved80DD = ref(0);
const approved80E = ref(0);
const approved80EEB = ref(0);
const approved80G = ref(0);
const approved80GG = ref(0);
const approved80GGA = ref(0);
const approved80GGC = ref(0);
const approved80DDB = ref(0);
const approved80CCD2 = ref(0);
const approved80U = ref(0);

const leaveApproved = ref(0);
const tdsRule = ref([]);

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const token = authService.getToken();

// Computed properties
const totalSection80Approved = computed(() => {
  return approved80C.value + approved80CCD.value + approved80D.value + 
         approved80DD.value + approved80E.value + approved80EEB.value + 
         approved80G.value + approved80GG.value + approved80GGA.value + 
         approved80GGC.value + approved80DDB.value + approved80U.value;
});

// Centralized tax calculation computed property
const taxCalculationData = computed(() => {
  if (!totalYearlyEarnings.value || !tdsRule.value.length) {
    return {
      newRegime: { taxableIncome: 0, taxData: { totalTax: 0, breakdown: [] } },
      oldRegime: { taxableIncome: 0, taxData: { totalTax: 0, breakdown: [] } },
      deductionData: {}
    };
  }

  const totalExemption = leaveApproved.value + approvedHraAmount.value;
  const totalOtherApprovedCalc = approvedHomeLoan.value + 
                                approvedHomeLoanInvestment.value + 
                                approvedHomeLoanDeduction.value + 
                                totalSection80Approved.value;

  const rule = tdsRule.value[0];
  const oldSlabs = rule?.oldRegime?.taxSlabs || [];
  const newSlabs = rule?.newRegime?.taxSlabs || [];
  const deductionData = rule?.deduction || {};

  const standardDeductionNew = deductionData.standardDeduction?.new || 0;
  const standardDeductionOld = deductionData.standardDeduction?.old || 0;

  const newRegimeTaxableIncome = totalYearlyEarnings.value - standardDeductionNew;
  const oldRegimeTaxableIncome = totalYearlyEarnings.value - 
                                (standardDeductionOld + totalExemption + totalOtherApprovedCalc + totalEstimatedPF.value);

  const newRegimeTaxData = calculateTax(newRegimeTaxableIncome, newSlabs);
  const oldRegimeTaxData = calculateTax(oldRegimeTaxableIncome, oldSlabs);

  return {
    newRegime: {
      taxableIncome: newRegimeTaxableIncome,
      taxData: newRegimeTaxData
    },
    oldRegime: {
      taxableIncome: oldRegimeTaxableIncome,
      taxData: oldRegimeTaxData
    },
    deductionData,
    totalExemption,
    totalOtherApprovedCalc
  };
});

// Table data computed property
const calculatedTableData = computed(() => {
  const calcData = taxCalculationData.value;
  
  if (!totalYearlyEarnings.value || !tdsRule.value.length) {
    return [];
  }

  const { newRegime, oldRegime, deductionData, totalExemption, totalOtherApprovedCalc } = calcData;
  
  const cessPercentage = deductionData.cess || 0;
  const newRegimeRebateThreshold = deductionData.rebate?.new || 0;
  const oldRegimeRebateThreshold = deductionData.rebate?.old || 0;
  const standardDeductionNew = deductionData.standardDeduction?.new || 0;
  const standardDeductionOld = deductionData.standardDeduction?.old || 0;

  // Calculate rebates
  const rebateNewAmount = newRegime.taxableIncome < newRegimeRebateThreshold ? newRegime.taxData.totalTax : 0;
  const newRebate = newRegime.taxData.totalTax - rebateNewAmount;

  const rebateOldAmount = oldRegime.taxableIncome < oldRegimeRebateThreshold ? oldRegime.taxData.totalTax : 0;
  const oldRebate = oldRegime.taxData.totalTax - rebateOldAmount;

  // Calculate health and education cess
  const healthNew = newRebate * (cessPercentage / 100);
  const healthOld = oldRebate * (cessPercentage / 100);
  
  // Calculate final tax
  const paidTaxNew = newRebate + healthNew;
  const paidTaxOld = oldRebate + healthOld;

  return [
    {
      description: "Annual Earnings",
      newRegime: formatCurrency(totalYearlyEarnings.value),
      oldRegime: formatCurrency(totalYearlyEarnings.value),
      type: "normal",
    },
    {
      description: "Annual Deductions",
      newRegime: formatCurrency(approved80CCD2.value),
      oldRegime: formatCurrency(totalOtherApprovedCalc + totalEstimatedPF.value),
      type: "normal",
    },
    {
      description: "Standard Deduction",
      newRegime: formatCurrency(standardDeductionNew),
      oldRegime: formatCurrency(standardDeductionOld),
      type: "normal",
    },
    {
      description: "Exemption",
      newRegime: formatCurrency(0),
      oldRegime: formatCurrency(totalExemption),
      type: "normal",
    },
    {
      description: "Taxable Income",
      newRegime: formatCurrency(newRegime.taxableIncome),
      oldRegime: formatCurrency(oldRegime.taxableIncome),
      type: "highlight",
    },
    {
      description: "Tax Liability",
      newRegime: `${formatCurrency(newRegime.taxData.totalTax)} ▼`,
      oldRegime: `${formatCurrency(oldRegime.taxData.totalTax)} ▼`,
      type: "tax-liability",
    },
    {
      description: "Less: Rebate Under Section 87A(a)",
      newRegime: formatCurrency(rebateNewAmount),
      oldRegime: formatCurrency(rebateOldAmount),
      type: "normal",
    },
    {
      description: "Health and Education Cess (4% of Tax on taxable Income + Surcharge)",
      newRegime: formatCurrency(healthNew),
      oldRegime: formatCurrency(healthOld),
      type: "normal",
    },
    {
      description: "Total Tax to be Paid",
      newRegime: formatCurrency(paidTaxNew),
      oldRegime: formatCurrency(paidTaxOld),
      type: "total",
    },
  ];
});

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₹ 0.00";
  return `₹ ${Number(amount).toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

const getRowClass = (type) => {
  const classMap = {
    highlight: "highlight-row",
    "tax-liability": "tax-liability-row",
    total: "total-row"
  };
  return classMap[type] || "";
};

const getValueClass = (type) => {
  const classMap = {
    "tax-liability": "tax-liability-value",
    total: "total-value"
  };
  return classMap[type] || "";
};

// Tax calculation function
const calculateTax = (amount, slabs) => {
  if (amount <= 0 || !slabs.length) {
    return { totalTax: 0, breakdown: [] };
  }

  let remaining = amount;
  let totalTax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    const { range, percentage } = slab;
    let lower = 0, upper = 0;

    try {
      if (range.includes("above") || range.includes("and above")) {
        lower = parseInt(range.replace(/\D/g, ""));
        upper = Infinity;
      } else {
        [lower, upper] = range.split("-").map((v) => parseInt(v.trim()));
      }

      if (amount > lower) {
        const incomeInSlab = Math.min(remaining, upper === Infinity ? remaining : upper - lower);
        const taxForSlab = Math.round(incomeInSlab * (percentage / 100));

        if (incomeInSlab > 0) {
          breakdown.push({
            range: `₹${lower.toLocaleString()} - ${isFinite(upper) ? `₹${upper.toLocaleString()}` : "Above"}`,
            income: incomeInSlab,
            percentage,
            tax: taxForSlab,
          });

          totalTax += taxForSlab;
          remaining -= incomeInSlab;
        }

        if (remaining <= 0) break;
      }
    } catch (error) {
      console.error(`Error processing slab: ${range}`, error);
    }
  }

  return {
    totalTax: Math.round(totalTax),
    breakdown,
  };
};

// Fixed breakdown methods
const openBreakdown = (regime) => {
  selectedBreakdownRegime.value = regime;
  const calcData = taxCalculationData.value;
  
  if (regime === 'New Regime') {
    const newSlabs = tdsRule.value[0]?.newRegime?.taxSlabs || [];
    breakdownSlabs.value = formatSlabsForBreakdown(newSlabs, calcData.newRegime.taxableIncome);
    breakdownTotalTax.value = formatCurrency(calcData.newRegime.taxData.totalTax);
  } else {
    const oldSlabs = tdsRule.value[0]?.oldRegime?.taxSlabs || [];
    breakdownSlabs.value = formatSlabsForBreakdown(oldSlabs, calcData.oldRegime.taxableIncome);
    breakdownTotalTax.value = formatCurrency(calcData.oldRegime.taxData.totalTax);
  }
  
  breakdownDialog.value = true;
};

const formatSlabsForBreakdown = (slabs, taxableIncome) => {
  return slabs.map(slab => {
    const { range, percentage } = slab;
    let lower = 0, upper = 0;

    try {
      if (range.includes("above") || range.includes("and above")) {
        const matches = range.match(/(\d+)/);
        lower = matches ? parseInt(matches[1]) : 0;
        upper = Infinity;
      } else {
        const parts = range.split("-").map(part => part.trim());
        lower = parseInt(parts[0]);
        upper = parseInt(parts[1]);
      }

      // Calculate applicable amount for this slab
      let applicableAmount = 0;
      if (taxableIncome > lower) {
        if (upper === Infinity) {
          applicableAmount = taxableIncome - lower;
        } else if (taxableIncome <= upper) {
          applicableAmount = taxableIncome - lower;
        } else {
          applicableAmount = upper - lower;
        }
      }

      const tax = (applicableAmount * percentage) / 100;

      return {
        range: `₹${lower.toLocaleString()} - ${isFinite(upper) ? `₹${upper.toLocaleString()}` : 'Above'}`,
        amount: `₹${applicableAmount.toLocaleString()}`,
        percentage: `${percentage}%`,
        tax: formatCurrency(tax)
      };
    } catch (error) {
      console.error(`Error formatting slab: ${range}`, error);
      return null;
    }
  }).filter(slab => slab && slab.amount !== '₹0');
};

// API functions
const fetchTDSRule = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsRules`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    tdsRule.value = data.data;
  } catch (error) {
    console.error("Error fetching TDS rules:", error);
  }
};

const fetchItemData = async () => {
  if (!id) return;

  try {
    const params = {
      fields: [
        "regime",
        "status",
        "taxableIncome",
        "employer.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "exemption",
        "taxLiabilties",
        "standardDeduction",
        "totalEarnings",
        "totalDeductions",
        "id",
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
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const employeeId = data.data.employer.id;
    await fetchPayrollVerificationData(employeeId);
    
    processDeductionData(data.data);
  } catch (error) {
    console.error("Error fetching item data:", error);
  }
};

const fetchPayrollVerificationData = async (employeeId) => {
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-04-01`;
  const endDate = `${currentYear + 1}-03-31`;

  try {
    const params = {
      fields: [
        "complienceDeduction",
        "totalBenefits",
        "totalEarnings",
        "finalizeDate",
        "tdsAmount",
        "id",
        "endDate",
        "startDate",
      ],
    };

    const queryString = [
      ...params.fields.map((field) => `fields[]=${field}`),
      `filter[_and][0][_and][0][finalizeDate][_gte]=${startDate}`,
      `filter[_and][0][_and][1][finalizeDate][_lte]=${endDate}`,
      `filter[employee][_eq]=${employeeId}`,
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const { data } = await response.json();

    // Ensure CTC and PF is ready
    if (!ctc.value || !employeePF.value) await fetchSalaryBreakdown(employeeId);

    const earningsByMonth = {};
    const pfByMonth = {};
    const today = new Date();
    const finalDate = new Date(endDate);

    // Preprocess fetched data into a Map for quick lookup
    const dataByMonth = new Map();

    // Process fetched data and group by month
    data.forEach((item) => {
      const itemDate = new Date(item.endDate);
      const key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`;

      dataByMonth.set(key, {
        totalEarnings: item.totalEarnings ? parseFloat(item.totalEarnings) : null,
        totalBenefits: item.totalBenefits ? parseFloat(item.totalBenefits) : 0,
        complienceDeduction: item.complienceDeduction ? parseFloat(item.complienceDeduction) : null,
        endDate: item.endDate,
      });
    });

    // Loop through months in range and calculate earnings/PF
    let current = new Date(startDate);
    while (current <= finalDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      const isPastOrCurrent = current <= today;

      // Get the record for this month
      const record = dataByMonth.get(key);

      // Check if this month has actual payroll data (based on endDate availability)
      const hasActualData = record && record.endDate;

      if (hasActualData && record.totalEarnings !== null) {
        earningsByMonth[key] = Number(record.totalEarnings) + Number(record.totalBenefits);
      } else if (isPastOrCurrent) {
        const benefits = record?.totalBenefits || 0;
        earningsByMonth[key] = Number(ctc.value) + Number(benefits);
      } else {
        const benefits = record?.totalBenefits || 0;
        earningsByMonth[key] = Number(ctc.value) + Number(benefits);
      }

      if (hasActualData && record.complienceDeduction !== null) {
        pfByMonth[key] = Number(record.complienceDeduction);
      } else if (isPastOrCurrent) {
        pfByMonth[key] = Number(employeePF.value);
      } else {
        pfByMonth[key] = Number(employeePF.value);
      }

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    // Calculate final totals
    const totalEarnings = Object.values(earningsByMonth).reduce((sum, val) => sum + Number(val), 0);
    const totalPF = Object.values(pfByMonth).reduce((sum, val) => sum + Number(val), 0);

    totalYearlyEarnings.value = totalEarnings;
    totalEstimatedPF.value = totalPF;

    return {
      earningsByMonth,
      pfByMonth,
      totalEarnings,
      totalPF,
    };
  } catch (error) {
    console.error("Error fetching payroll verification data:", error);
    throw error;
  }
};

const fetchSalaryBreakdown = async (employeeId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[employee][_eq]=${employeeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    ctc.value = data?.data?.[0]?.basicSalary || 0;
    employeePF.value = data?.data?.[0]?.employeeDeduction?.EmployeePF || 0;
  } catch (error) {
    console.error("Error fetching salary breakdown:", error);
  }
};

const processDeductionData = (data) => {
  if (data.regime) {
    // Convert API response format to display format
    const regimeValue = data.regime === "newRegime" ? "New Regime" : "Old Regime";
    selectedRegime.value = regimeValue;
  }

  const hraRentData = data?.hraRent?.hraRent || [];
  approvedHraAmount.value = hraRentData
    .filter(item => item.status === "approved")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  // Process Home Loan data
  const homeLoanData = data?.homeLoan?.homeLoan || [];
  approvedHomeLoan.value = homeLoanData
    .filter(item => item.status === "approved")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  // Process Home Loan Investment data
  const homeLoanInvestmentData = data?.homeLoanInvestment?.homeLoanInvestment || [];
  approvedHomeLoanInvestment.value = homeLoanInvestmentData
    .filter(item => item.status === "approved")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  // Process Home Loan Deduction data
  const homeLoanDeductionData = data?.homeLoanDeduction?.homeLoanDeduction || [];
  approvedHomeLoanDeduction.value = homeLoanDeductionData
    .filter(item => item.status === "approved")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  // Process Section 80 deductions
  const section80Data = Array.isArray(data?.section80Deduction) ? data.section80Deduction : [];
  
  // Reset all section 80 values
  const section80Fields = {
    '80C': approved80C,
    '80CCD': approved80CCD,
    '80D': approved80D,
    '80DD': approved80DD,
    '80E': approved80E,
    '80EEB': approved80EEB,
    '80G': approved80G,
    '80GG': approved80GG,
    '80GGA': approved80GGA,
    '80GGC': approved80GGC,
    '80DDB': approved80DDB,
    '80U': approved80U,
  };

  // Reset all values
  Object.values(section80Fields).forEach(field => field.value = 0);

  // Process approved section 80 deductions
  section80Data
    .filter(item => item.status === "approved")
    .forEach(item => {
      const field = section80Fields[item.section];
      if (field) {
        field.value += item.amount || 0;
      }
    });

  // Process Leave Travel data
  const leaveTravelData = Array.isArray(data?.leaveTravel) ? data.leaveTravel : [];
  leaveApproved.value = leaveTravelData
    .filter(item => item.status === "approved")
    .reduce((sum, item) => sum + (item.amount || 0), 0);
};

// Lifecycle
onMounted(async () => {
  try {
    await fetchTDSRule();
    await fetchItemData();
  } catch (error) {
    console.error("Error during component initialization:", error);
  }
});
</script>

<style scoped>
.regime-select :deep(.v-field) {
  background-color: white;
}

.comparison-table {
  border-collapse: separate;
  border-spacing: 0;
}

.comparison-table th {
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.new-regime-header {
  background-color: #e8f5e8 !important;
  color: #2e7d32;
}

.old-regime-header {
  background-color: #e3f2fd !important;
  color: #1976d2;
}

.disabled-regime {
  background-color: #f5f5f5 !important;
  color: #9e9e9e !important;
}

.comparison-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
}

.comparison-table tbody tr:hover {
  background-color: #fafafa;
}

.highlight-row {
  background-color: #fff3e0;
}

.tax-liability-row {
  background-color: #ffebee;
}

.total-row {
  background-color: #f3e5f5;
  font-weight: bold;
}

.tax-liability-value {
  color: #d32f2f;
  font-weight: bold;
}

.total-value {
  color: #1976d2;
  font-weight: bold;
}

.disabled-cell {
  color: #9e9e9e !important;
  background-color: rgba(245, 245, 245, 0.5) !important;
}

.comparison-table td:nth-child(2):not(.disabled-cell) {
  background-color: rgba(232, 245, 232, 0.3);
}

.comparison-table td:nth-child(3):not(.disabled-cell) {
  background-color: rgba(227, 242, 253, 0.3);
}

.comparison-table tbody tr:nth-child(5) td:nth-child(2):not(.disabled-cell),
.comparison-table tbody tr:nth-child(5) td:nth-child(3):not(.disabled-cell) {
  background-color: #fff3e0;
}

.comparison-table tbody tr:nth-child(6) td:nth-child(2):not(.disabled-cell),
.comparison-table tbody tr:nth-child(6) td:nth-child(3):not(.disabled-cell) {
  background-color: #ffebee;
}

.comparison-table tbody tr:nth-child(9) td:nth-child(2):not(.disabled-cell),
.comparison-table tbody tr:nth-child(9) td:nth-child(3):not(.disabled-cell) {
  background-color: #f3e5f5;
}
.cursor-pointer {
  cursor: pointer;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

.breakdown-content {
  min-height: 200px;
}
@media (max-width: 768px) {
  .comparison-table {
    font-size: 0.875rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 8px !important;
  }
}
</style>

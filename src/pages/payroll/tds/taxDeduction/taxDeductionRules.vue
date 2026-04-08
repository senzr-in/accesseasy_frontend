<template>
  <div class="tds-container">
    <!-- Main Toolbar -->
    <v-toolbar density="compact" color="grey-lighten-4" v-if="!showForm">
      <v-btn icon color="black" @click="handleClose">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="ml-4">Add TDSDetails</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
        CANCEL
      </v-btn>
      <v-btn
        style="background-color: black"
        color="white"
        @click="handleSave"
        :loading="isSaving"
      >
        SAVE
      </v-btn>
    </v-toolbar>
    <router-view></router-view>

    <div class="content-wrapper" v-if="!showForm">
      <div class="summary-card" v-if="userRole === 'Admin'">
        <div class="header">
          <span class="icon">📋</span>
          <h2>TDS Calculations Summary</h2>
        </div>

        <div class="table-row header-row">
          <div class="col description">Description</div>
          <div class="col regime">New Regime</div>
          <div class="col regime">Old Regime</div>
        </div>

        <div
          v-for="(item, index) in calculationItems"
          :key="index"
          class="table-row"
        >
          <div class="col description">{{ item.description }}</div>

          <div class="col regime">
            <span v-if="item.description !== 'Tax Liability'">
              {{ formatCurrency(item.newRegime) }}
            </span>
            <div v-else class="relative">
              <button @click="toggleDropdown('new')">
                {{ formatCurrency(item.newRegime) }} ▼
              </button>
              <div
                v-if="showNewDropdown"
                class="bg-white rounded-lg shadow-md border border-slate-200 w-full max-w-md"
              >
                <div class="px-4 py-3 border-b">
                  <p class="font-bold text-lg">New Regime Breakdown</p>
                </div>
                <div class="p-4">
                  <div class="space-y-3">
                    <div
                      v-for="(slab, i) in newBreakdown"
                      :key="i"
                      class="rounded-lg bg-slate-50 p-3"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="bg-green-50 text-green-700 border border-green-200 h-6 w-6 rounded-full flex items-center justify-center"
                        >
                          <div class="h-3 w-3 rounded-full bg-green-500"></div>
                        </span>
                        <span class="font-medium">{{ slab.range }}</span>
                        <span class="text-slate-500">—</span>
                        <span>₹{{ slab.income.toLocaleString() }}</span>
                        <span
                          class="ml-auto bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {{ slab.percentage }}%
                        </span>
                      </div>
                      <div class="mt-2 pl-8 flex items-center text-sm">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="mr-1.5 text-slate-400"
                        >
                          <path
                            d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <span class="text-slate-600">Tax:</span>
                        <span class="ml-1.5 font-semibold"
                          >₹{{ slab.tax.toLocaleString() }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div
                    class="mt-4 pt-3 border-t flex justify-between items-center"
                  >
                    <span class="font-medium">Total Tax:</span>
                    <span class="text-lg font-bold">
                      ₹{{
                        newBreakdown
                          .reduce((sum, slab) => sum + slab.tax, 0)
                          .toLocaleString()
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col regime">
            <span v-if="item.description !== 'Tax Liability'">
              {{ formatCurrency(item.oldRegime) }}
            </span>
            <div v-else class="relative">
              <button @click="toggleDropdown('old')">
                {{ formatCurrency(item.oldRegime) }} ▼
              </button>
              <div
                v-if="showOldDropdown"
                class="bg-white rounded-lg shadow-md border border-slate-200 w-full max-w-md"
              >
                <div class="px-4 py-3 border-b">
                  <p class="font-bold text-lg">Old Regime Breakdown</p>
                </div>
                <div class="p-4">
                  <div class="space-y-3">
                    <div
                      v-for="(slab, i) in oldBreakdown"
                      :key="i"
                      class="rounded-lg bg-slate-50 p-3"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="bg-yellow-50 text-yellow-700 border border-yellow-200 h-6 w-6 rounded-full flex items-center justify-center"
                        >
                          <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
                        </span>
                        <span class="font-medium">{{ slab.range }}</span>
                        <span class="text-slate-500">—</span>
                        <span>₹{{ slab.income.toLocaleString() }}</span>
                        <span
                          class="ml-auto bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {{ slab.percentage }}%
                        </span>
                      </div>
                      <div class="mt-2 pl-8 flex items-center text-sm">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="mr-1.5 text-slate-400"
                        >
                          <path
                            d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <span class="text-slate-600">Tax:</span>
                        <span class="ml-1.5 font-semibold"
                          >₹{{ slab.tax.toLocaleString() }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div
                    class="mt-4 pt-3 border-t flex justify-between items-center"
                  >
                    <span class="font-medium">Total Tax:</span>
                    <span class="text-lg font-bold">
                      ₹{{
                        oldBreakdown
                          .reduce((sum, slab) => sum + slab.tax, 0)
                          .toLocaleString()
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <v-row v-for="item in taxSettings" :key="item.id">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-chip :color="item.isDeclarationOpen ? 'green' : 'red'" dark>
                {{ item.declarationStatusLabel }}
              </v-chip>
              <v-chip v-if="item.isReconcileOpen" color="blue" dark>
                {{ item.reconcileStatusLabel }}
              </v-chip>
              <v-chip v-if="item.isProofOpen" color="orange" dark>
                {{ item.proofStatusLabel }}
              </v-chip>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>

      <!-- Info Cards Grid -->
      <div class="info-cards-container">
        <!-- Past TDS Card -->
        <div class="info-card"  v-if="userRole === 'Admin'">
          <div class="info-header">
            <div class="info-title">
              <span class="icon"><i class="fas fa-receipt"></i></span>
              <h3>Past TDS in FY</h3>
            </div>
            <button class="edit-button" @click="pastTds">
              <span class="edit-icon"><i class="fas fa-pen"></i></span>
            </button>
          </div>

          <div
            style="
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              padding: 12px 16px;
              border-bottom: 1px solid #eee;
            "
          >
            <span style="grid-column: 1">Taxable salary : </span>

            <span style="grid-column: 3">₹{{ pastTaxSalary }}</span>
          </div>
          <div
            style="
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              padding: 12px 16px;
              border-bottom: 1px solid #eee;
            "
          >
            <span style="grid-column: 1">Tax Paid : </span>

            <span style="grid-column: 3">₹{{ pastTaxPaid }}</span>
          </div>
        </div>

        <!-- Tax Regime Card -->
        <div class="info-card"  v-if="userRole === 'Admin'">
          <div class="info-header">
            <div class="info-title">
              <span class="icon"><i class="fas fa-receipt"></i></span>
              <h3>Tax Regime</h3>
            </div>
            <button class="edit-button" @click="regime">
              <span class="edit-icon"><i class="fas fa-pen"></i></span>
            </button>
          </div>
          <div class="info-content">
            <p class="regime-text">Your current chosen regime is</p>
            <button class="regime-button">
              {{ currentRegime }}
            </button>
          </div>
        </div>

        <!-- Home Rent Card -->
        <div class="info-card">
          <div class="info-header">
            <div class="info-title">
              <span class="icon">🏠</span>
              <h3>Home Rent</h3>
            </div>
           
            <button class="edit-button" @click="hraRent">
              <span class="edit-icon"><i class="fas fa-pen"></i></span>
            </button>
          </div>
          <div
            style="background-color: #f9f9f9; border-radius: 4px; width: 100%"
          >
            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
                font-weight: 500;
              "
            >
              <span style="grid-column: 2">Declared Amount</span>
              <span style="grid-column: 3">Approved Amount</span>
            </div>

            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="grid-column: 1">Total Home Rent</span>
              <span style="grid-column: 2">₹{{ declaredHraRent }}</span>
              <span style="grid-column: 3">₹{{ approvedHraAmount }}</span>
            </div>

            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="grid-column: 1">Latest Monthly Rent</span>
              <span style="grid-column: 2">₹{{ declaredHraRent }}</span>
              <span style="grid-column: 3">₹{{ approvedHraAmount }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="info-cards-investment">
        <!-- Interest On Home Loan Card -->
        <div class="info-card">
          <div class="info-header">
            <div class="info-title">
              <span class="icon">🏠</span>
              <h3>Interest On Home Loan</h3>
            </div>
            <!-- <span v-if="showNotificationIcon" class="notification-icon">
              <i
                class="fas fa-bell"
                style="
                  color: red;
                  font-size: 24px;
                  margin-left: 10px;
                  cursor: pointer;
                "
              ></i>
            </span> -->
            <button class="edit-button" @click="hraLoan">
              <span class="edit-icon"><i class="fas fa-pen"></i></span>
            </button>
          </div>
          <div
            style="background-color: #f9f9f9; border-radius: 4px; width: 100%"
          >
            <!-- Header Section -->
            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
                font-weight: 500;
              "
            >
              <span style="grid-column: 1">Description</span>
              <span style="grid-column: 2; text-align: center"
                >Declared Amount</span
              >
              <span style="grid-column: 3; text-align: center"
                >Approved Amount</span
              >
            </div>

            <!-- Table Data Section -->
            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="grid-column: 1">Annual interest payable</span>
              <span style="grid-column: 2; text-align: center"
                >₹{{ declaredHomeLoan }}</span
              >
              <span style="grid-column: 3; text-align: center"
                >₹{{ approvedHomeLoan }}</span
              >
            </div>

            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="grid-column: 1"
                >Additional benefit under Section 80EE</span
              >
              <span style="grid-column: 2; text-align: center"
                >₹{{ declaredHomeLoanInvestment }}</span
              >
              <span style="grid-column: 3; text-align: center"
                >₹{{ approvedHomeLoanInvestment }}</span
              >
            </div>

            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="grid-column: 1">Section 80EEA</span>
              <span style="grid-column: 2; text-align: center"
                >₹{{ declaredHomeLoanDeduction }}</span
              >
              <span style="grid-column: 3; text-align: center"
                >₹{{ approvedHomeLoanDeduction }}</span
              >
            </div>
          </div>
        </div>

        <!-- Leave Travel Allowance Card -->
        <div class="info-card">
          <div class="info-header">
            <div class="info-title">
              <span class="icon">✈️</span>
              <h3>Leave Travel Allowance</h3>
            </div>
            <!-- <span v-if="showNotificationIcon" class="notification-icon">
              <i
                class="fas fa-bell"
                style="
                  color: red;
                  font-size: 24px;
                  margin-left: 10px;
                  cursor: pointer;
                "
              ></i>
            </span> -->
            <button class="edit-button" @click="leaveTravel">
              <span class="edit-icon"><i class="fas fa-pen"></i></span>
            </button>
          </div>
          <div
            style="background-color: #f9f9f9; border-radius: 4px; width: 100%"
          >
            <!-- Header Section -->
            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
                font-weight: 500;
              "
            >
              <span style="grid-column: 1">Description</span>
              <span style="grid-column: 2; text-align: center"
                >Declared Amount</span
              >
              <span style="grid-column: 3; text-align: center"
                >Approved Amount</span
              >
            </div>

            <!-- Table Data Section -->
            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="grid-column: 1">LTA Amount</span>
              <span style="grid-column: 2; text-align: center"
                >₹{{ leaveDeclared }}</span
              >
              <span style="grid-column: 3; text-align: center"
                >₹{{ leaveApproved }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Section 80 Deductions -->
      <div class="section-80-container">
        <div class="section-header">
          <div class="header-left">
            <span class="icon">📄</span>
            <h2>
              Section 80 Deductions (investments, education loans, medical
              insurance etc.)
            </h2>
          </div>
          <!-- <span v-if="showNotificationIcon" class="notification-icon">
            <i
              class="fas fa-bell"
              style="
                color: red;
                font-size: 24px;
                margin-left: 10px;
                cursor: pointer;
              "
            ></i>
          </span> -->
          <div class="header-actions">
            <button class="edit-button" @click="deduction">
              <span class="edit-icon"><i class="fas fa-pen"></i></span>
            </button>
          </div>
        </div>

        <div class="deductions-table">
          <div class="table-header">
            <div class="col section-col">Section</div>
            <div class="col amount-col">Declared Amount</div>
            <div class="col amount-col">Approved Amount</div>
          </div>

          <div class="table-content">
            <div
              v-for="(item, index) in section80Items"
              :key="index"
              class="table-row"
            >
              <div class="col section-col">{{ item.section }}</div>
              <div class="col amount-col">{{ item.declared }}</div>
              <div class="col amount-col">{{ item.approved }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Select Tax Regime</v-card-title>
        <v-card-text>
          <v-select
            v-model="tdsRegime"
            :items="regimes"
            label="Choose a regime"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveRegime">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { tdsRules, fetchTDSRules } from "@/services/tds/tdsRule";
import dayjs from "dayjs";

const route = useRoute();

const router = useRouter();

const id = route.params.id;
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();
const showForm = ref(false);
const tdsRule = ref([]);
const tdsRegime = ref([]);
const showNotificationIcon = ref(false);

const newBreakdown = ref([]);
const oldBreakdown = ref([]);
const showNewDropdown = ref(false);
const showOldDropdown = ref(false);
const matchedPhase = ref("");

const fetchItemData = async () => {
  if (!id) return;
const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-04-01`;
    const endDate = `${currentYear + 1}-03-31`;
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
        "hraRent",
        "homeLoan",
        "homeLoanInvestment",
        "homeLoanDeduction",
        "section80Deduction",
        "leaveTravel",
        "pastTds",
      ],
       "filter[_and][0][startDate][_gte]": startDate,
    "filter[_and][1][endDate][_lte]": endDate,
  
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

    await fetchTDSRules();

    if (!tdsRules.value || !tdsRules.value.length) {
      console.warn("TDS rules not loaded yet.");
      return;
    }
    const { declaration, reconcile, proofVerification } =
      tdsRules.value[0].duration;
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

    if (String(declaration).padStart(2, "0") === currentMonth) {
      matchedPhase.value = "declaration";
    } else if (String(reconcile).padStart(2, "0") === currentMonth) {
      matchedPhase.value = "reconcile";
    } else if (String(proofVerification).split("-").includes(currentMonth)) {
      matchedPhase.value = "proofVerification";
    }
    console.log("Matched Phase:", matchedPhase.value);
    tdsRegime.value = data.data.regime;
    // totalYearlyEarnings.value = data.data.totalEarnings;

    calculationItems.value = processEarningsAndDeductions(data);

    const hraRentData = data?.data?.hraRent?.hraRent || [];
    const isHraPending = hraRentData.some((item) => item.status === "pending");

    // Check Home Loan status
    const homeLoanData = data?.data?.homeLoan?.homeLoan || [];
    const isHomeLoanPending = homeLoanData.some(
      (item) => item.status === "pending",
    );

    // Check Home Loan Investment status
    const homeLoanInvestmentData =
      data?.data?.homeLoanInvestment?.homeLoanInvestment || [];
    const isHomeLoanInvestmentPending = homeLoanInvestmentData.some(
      (item) => item.status === "pending",
    );

    // Check Home Loan Deduction status
    const homeLoanDeductionData =
      data?.data?.homeLoanDeduction?.homeLoanDeduction || [];
    const isHomeLoanDeductionPending = homeLoanDeductionData.some(
      (item) => item.status === "pending",
    );

    // Check Section 80 Deduction status
    const section80Data = Array.isArray(data?.data?.section80Deduction)
      ? data.data.section80Deduction
      : [];

    const isSection80Pending = section80Data.some(
      (item) => item.status === "pending",
    );

    // Check Leave Travel status
    const leaveTravelData = Array.isArray(data?.data?.leaveTravel)
      ? data.data.leaveTravel
      : [];

    const isLeaveTravelPending = leaveTravelData.some(
      (item) => item.status === "pending",
    );

    // Update the notification icon condition if any section has 'pending' status
    showNotificationIcon.value =
      isHraPending ||
      isHomeLoanPending ||
      isHomeLoanInvestmentPending ||
      isHomeLoanDeductionPending ||
      isSection80Pending ||
      isLeaveTravelPending;

    // const isAnyPending = JSON.stringify(
    //   data?.data?.tdsDeduction || {},
    // ).includes('"status":"pending"');

    // showNotificationIcon.value = isAnyPending;

    // console.log("STATUS:", isAnyPending);

    console.log("Notification Icon Should Show:", showNotificationIcon.value);
  } catch (error) {
    console.error("Error fetching item data:", error);
  }
};
const totalYearlyEarnings = ref(0);
const totalEstimatedPF = ref(0);
const ctc = ref(0);
const getFinancialYearDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  const startDate = `${startYear}-04-01`;
  const endDate = `${endYear}-03-31`;

  return { startDate, endDate };
};
const employeePF = ref();
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
      `filter[_and][0][_and][0][endDate][_gte]=${startDate}`,
      `filter[_and][0][_and][1][endDate][_lte]=${endDate}`,
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

      console.log(`Processing item:`, item);
      console.log(`Generated key: ${key}`);

      // Store the complete record for this month
      dataByMonth.set(key, {
        totalEarnings: item.totalEarnings
          ? parseFloat(item.totalEarnings)
          : null,
        totalBenefits: item.totalBenefits ? parseFloat(item.totalBenefits) : 0,
        complienceDeduction: item.complienceDeduction
          ? parseFloat(item.complienceDeduction)
          : null,
        endDate: item.endDate,
      });

      console.log(`Data stored for ${key}:`, dataByMonth.get(key));
    });

    // Debug: Log the dataByMonth Map to check its contents
    console.log("DataByMonth Map:", [...dataByMonth.entries()]);

    // Loop through months in range and calculate earnings/PF
    let current = new Date(startDate);
    while (current <= finalDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
     const isSameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isPastOrCurrent = current < today && !isSameMonth(current, today);



      // Get the record for this month
      const record = dataByMonth.get(key);

      // Check if this month has actual payroll data (based on endDate availability)
      const hasActualData = record && record.endDate;

      console.log(`Processing month ${key}:`, {
        hasActualData,
        isPastOrCurrent,
        record,
      });

      if (hasActualData && record.totalEarnings !== null) {
  earningsByMonth[key] =
    Number(record.totalEarnings) + Number(record.totalBenefits);
} else if (!isPastOrCurrent) {
  const benefits = record?.totalBenefits || 0;
  earningsByMonth[key] = Number(ctc.value) + Number(benefits);
} else {
  earningsByMonth[key] = 0;
}

if (hasActualData && record.complienceDeduction !== null) {
  pfByMonth[key] = Number(record.complienceDeduction);
} else if (!isPastOrCurrent) {
  pfByMonth[key] = Number(employeePF.value);
} else {
  pfByMonth[key] = 0;
}

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    // Calculate final totals
    const totalEarnings = Object.values(earningsByMonth).reduce(
      (sum, val) => sum + Number(val),
      0,
    );
    const totalPF = Object.values(pfByMonth).reduce(
      (sum, val) => sum + Number(val),
      0,
    );

    totalYearlyEarnings.value = totalEarnings;
    totalEstimatedPF.value = totalPF;

    console.log("📊 Final Earnings By Month:", earningsByMonth);
    console.log("🏦 Final PF By Month:", pfByMonth);
    console.log("🧮 Total Yearly Earnings:", totalEarnings);
    console.log("🧮 Total Employee PF:", totalPF);

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
    tdsRule.value = data?.data || [];
  } catch (error) {
    console.error("Error fetching TDS rules:", error);
  }
};
const taxSettings = ref([]);

const fetchTaxSettings = async () => {
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-04-01`;
  const endDate = `${currentYear + 1}-03-31`;
  const params = {
    fields: [
      "decalarationEndDate",
      "decalarationStartDate",
      "financialYear",
      "status",
      "tenant",
      "financialStartDate",
      "financialEndDate",
      "reconcileStartDate",
      "reconcileEndDate",
      "proofStartDate",
      "proofEndDate",
      "id",
    ],
    "filter[_and][0][tenant][_eq]": tenantId,
    "filter[_and][1][financialStartDate][_gte]": startDate,
    "filter[_and][2][financialEndDate][_lte]": endDate,
  };

  const queryString = Object.keys(params)
    .map((key) => {
      if (key === "fields") {
        return params[key].map((field) => `fields[]=${field}`).join("&");
      }
      return `${key}=${encodeURIComponent(params[key])}`;
    })
    .join("&");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/taxSettings?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch tax settings");
      return;
    }

    const data = await response.json();
    const today = dayjs();
    const resultWithStatus = (data.data || []).map((item) => {
      const isDeclarationOpen =
        today.isAfter(dayjs(item.decalarationStartDate)) &&
        today.isBefore(dayjs(item.decalarationEndDate).add(1, "day"));

      const isReconcileOpen =
        today.isAfter(dayjs(item.reconcileStartDate)) &&
        today.isBefore(dayjs(item.reconcileEndDate).add(1, "day"));

      const isProofOpen =
        today.isAfter(dayjs(item.proofStartDate)) &&
        today.isBefore(dayjs(item.proofEndDate).add(1, "day"));

      return {
        ...item,
        declarationStatusLabel: isDeclarationOpen
          ? "Declaration is Open"
          : "Declaration is Closed",
        isDeclarationOpen,

        reconcileStatusLabel: isReconcileOpen
          ? "Reconcile is Open"
          : "Reconcile is Closed",
        isReconcileOpen,

        proofStatusLabel: isProofOpen ? "Proof is Open" : "Proof is Closed",
        isProofOpen,
      };
    });

    taxSettings.value = resultWithStatus;
  } catch (error) {
    console.error("Error fetching tax settings:", error);
  }
};

const currentRegime = ref("");
const tdsDeductionId = ref("");
const homeRent = ref({
  total: 0,
  approved: 0,
  latest: 0,
});
const declaredHraRent = ref("");
const approvedHraAmount = ref(0);
const declaredHomeLoan = ref(0);
const approvedHomeLoan = ref(0);
const declaredHomeLoanInvestment = ref(0);
const approvedHomeLoanInvestment = ref(0);
const declaredHomeLoanDeduction = ref(0);
const approvedHomeLoanDeduction = ref(0);
const declared80C = ref(0);
const approved80C = ref(0);

const declared80CCD = ref(0);
const approved80CCD = ref(0);

const declared80D = ref(0);
const approved80D = ref(0);
const declared80DD = ref(0);
const approved80DD = ref(0);

const declared80E = ref(0);
const approved80E = ref(0);

const declared80EEB = ref(0);
const approved80EEB = ref(0);

const declared80G = ref(0);
const approved80G = ref(0);

const declared80GG = ref(0);
const approved80GG = ref(0);

const declared80GGA = ref(0);
const approved80GGA = ref(0);

const declared80GGC = ref(0);
const approved80GGC = ref(0);
const declared80DDB = ref(0);
const approved80DDB = ref(0);

const declared80CCD2 = ref(0);
const approved80CCD2 = ref(0);

const declared80U = ref(0);
const approved80U = ref(0);

const leaveApproved = ref(0);
const leaveDeclared = ref(0);
const pastTaxSalary = ref(0);
const pastTaxPaid = ref(0);
const totalOtherApproved = ref(0);
const totalTaxNewRegime = ref(0);
const totalTaxOldRegime = ref(0);
const oldRegimeSlabs = ref(0);
const newRegimeSlabs = ref(0);
const processEarningsAndDeductions = (data) => {
  const tds = data?.data || {};
  const section80 = tds?.section80Deduction || {};

  pastTaxSalary.value = tds?.pastTds?.taxableSalary || 0;

  pastTaxPaid.value = tds?.pastTds?.tdsDeducted || 0;

  const earnings = tds?.earnings?.totalEarnings || 0;
  const deductions = tds?.earnings?.totalDeductions || 0;
  const exemption = tds?.exemption || 0;
  const taxableIncome = tds?.taxableIncome || 0;
  const taxLiability = tds?.taxLiabilties || 0;
  currentRegime.value = tds?.regime || 0;
  tdsDeductionId.value = tds?.id;

  declaredHraRent.value = tds?.hraRent?.totalDeclaredAmount || 0;
  approvedHraAmount.value = tds?.hraRent?.totalApprovedAmount || 0;
  declaredHomeLoan.value = tds?.homeLoan?.homeLoan[0]?.amountPaid;

  approvedHomeLoan.value = tds?.homeLoan?.homeLoan[0]?.approvedAmount || 0;

  declaredHomeLoanInvestment.value =
    tds?.homeLoanInvestment?.totalDeclaredAmount || 0;
  approvedHomeLoanInvestment.value =
    tds?.homeLoanInvestment?.totalApprovedAmount || 0;
  declaredHomeLoanDeduction.value =
    tds?.homeLoanDeduction?.totalDeclaredAmount || 0;
  approvedHomeLoanDeduction.value =
    tds?.homeLoanDeduction?.totalApprovedAmount || 0;

  declared80C.value =
    tds?.section80Deduction?.["80C"]?.totalDeclaredAmount || 0;
  approved80C.value =
    tds?.section80Deduction?.["80C"]?.totalApprovedAmount || 0;

  declared80CCD.value =
    tds?.section80Deduction?.["80CCD"]?.totalDeclaredAmount || 0;
  approved80CCD.value =
    tds?.section80Deduction?.["80CCD"]?.totalApprovedAmount || 0;

  declared80D.value =
    tds?.section80Deduction?.["80D"]?.totalDeclaredAmount || 0;
  approved80D.value =
    tds?.section80Deduction?.["80D"]?.totalApprovedAmount || 0;

  declared80DD.value =
    tds?.section80Deduction?.["80DD"]?.totalDeclaredAmount || 0;
  approved80DD.value =
    tds?.section80Deduction?.["80DD"]?.totalApprovedAmount || 0;

  declared80E.value =
    tds?.section80Deduction?.["80E"]?.totalDeclaredAmount || 0;
  approved80E.value =
    tds?.section80Deduction?.["80E"]?.totalApprovedAmount || 0;

  declared80EEB.value =
    tds?.section80Deduction?.["80EEB"]?.totalDeclaredAmount || 0;
  approved80EEB.value =
    tds?.section80Deduction?.["80EEB"]?.totalApprovedAmount || 0;

  declared80G.value =
    tds?.section80Deduction?.["80G"]?.totalDeclaredAmount || 0;
  approved80G.value =
    tds?.section80Deduction?.["80G"]?.totalApprovedAmount || 0;

  declared80GG.value =
    tds?.section80Deduction?.["80GG"]?.totalDeclaredAmount || 0;
  approved80GG.value =
    tds?.section80Deduction?.["80GG"]?.totalApprovedAmount || 0;

  declared80GGA.value =
    tds?.section80Deduction?.["80GGA"]?.totalDeclaredAmount || 0;
  approved80GGA.value =
    tds?.section80Deduction?.["80GGA"]?.totalApprovedAmount || 0;

  declared80CCD2.value =
    tds?.section80Deduction?.["80CCD2"]?.totalDeclaredAmount || 0;
  approved80CCD2.value =
    tds?.section80Deduction?.["80CCD2"]?.totalApprovedAmount || 0;

  declared80GGC.value =
    tds?.section80Deduction?.["80GGC"]?.totalDeclaredAmount || 0;
  approved80GGC.value =
    tds?.section80Deduction?.["80GGC"]?.totalApprovedAmount || 0;

  declared80DDB.value =
    tds?.section80Deduction?.["80DDB"]?.totalDeclaredAmount || 0;
  approved80DDB.value =
    tds?.section80Deduction?.["80DDB"]?.totalApprovedAmount || 0;

  declared80U.value =
    tds?.section80Deduction?.["80U"]?.totalDeclaredAmount || 0;
  approved80U.value =
    tds?.section80Deduction?.["80U"]?.totalApprovedAmount || 0;

  leaveApproved.value = tds?.leaveTravel?.totalApprovedAmount || 0;
  leaveDeclared.value = tds?.leaveTravel?.totalDeclaredAmount || 0;

  const totalSection80Approved = Object.values(section80).reduce(
    (sum, sec) => sum + (sec?.totalApprovedAmount || 0),
    0,
  );

  totalOtherApproved.value =
    approvedHomeLoan.value +
    approvedHomeLoanInvestment.value +
    approvedHomeLoanDeduction.value +
    totalSection80Approved;

  const totalExemption = leaveApproved.value + approvedHraAmount.value;

  totalTaxNewRegime.value = totalYearlyEarnings.value - 75000;
  totalTaxOldRegime.value =
    totalYearlyEarnings.value -
    (50000 +
      totalExemption +
      totalOtherApproved.value +
      totalEstimatedPF.value);

  const rule = tdsRule.value[0];

  oldRegimeSlabs.value = rule?.oldRegime?.taxSlabs || [];
  newRegimeSlabs.value = rule?.newRegime?.taxSlabs || [];

  const oldSlabMatch = calculateTax(
    totalTaxOldRegime.value,
    oldRegimeSlabs.value,
  );
  const newSlabMatch = calculateTax(
    totalTaxNewRegime.value,
    newRegimeSlabs.value,
  );
  const rebateNewAmount =
    totalTaxNewRegime.value < 1200000 ? newSlabMatch.totalTax : 0;
  const newRebate = newSlabMatch.totalTax - rebateNewAmount;

  const rebateOldAmount =
    totalTaxOldRegime.value < 500000 ? oldSlabMatch.totalTax : 0;
  const oldRebate = oldSlabMatch.totalTax - rebateOldAmount;

  const healthNew = newRebate * (4 / 100);
  const healthOld = oldRebate * (4 / 100);
  const paidTaxNew = newRebate + healthNew;
  const paidTaxOld = oldRebate + healthOld;

  return [
    {
      description: "Annual Earnings",
      newRegime: totalYearlyEarnings.value,
      oldRegime: totalYearlyEarnings.value,
    },
    {
      description: "Annual Deductions",
      newRegime: approved80CCD2.value,
      oldRegime: totalOtherApproved.value + totalEstimatedPF.value,
    },
    {
      description: "Standard Deduction",
      newRegime: 75000,
      oldRegime: 50000,
    },
    {
      description: "Exemption",
      newRegime: "0",
      oldRegime: totalExemption,
    },
    {
      description: "Taxable Income",
      newRegime: totalTaxNewRegime.value,
      oldRegime: totalTaxOldRegime.value,
    },
    {
      description: "Tax Liability",
      newRegime: newSlabMatch.totalTax,
      oldRegime: oldSlabMatch.totalTax,
    },
    {
      description: "Less: Rebate Under Section 87A(a)",
      newRegime: rebateNewAmount,
      oldRegime: rebateOldAmount,
    },
    // {
    //   description: "Less: Relief Under Section 87A(b)",
    //   newRegime: 0.00,
    //   oldRegime: 59575.00,
    // },
    // {
    //   description: "Total Tax on Income",
    //   newRegime: 180150.00,
    //   oldRegime: 500.00,
    // },

    {
      description:
        "Health and Education Cess (4% of Tax on taxable Income + Surcharge)",
      newRegime: healthNew,
      oldRegime: healthOld,
    },
    {
      description: "Total Tax to be Paid",
      newRegime: paidTaxNew,
      oldRegime: paidTaxOld,
    },
  ];
};
const toggleDropdown = (type) => {
  if (type === "new") {
    showNewDropdown.value = !showNewDropdown.value;
    showOldDropdown.value = false;

    if (showNewDropdown.value) {
      const result = calculateTax(
        totalTaxNewRegime.value,
        newRegimeSlabs.value,
      );
      newBreakdown.value = result.breakdown;
    }
  } else {
    showOldDropdown.value = !showOldDropdown.value;
    showNewDropdown.value = false;

    if (showOldDropdown.value) {
      const result = calculateTax(
        totalTaxOldRegime.value,
        oldRegimeSlabs.value,
      );
      oldBreakdown.value = result.breakdown;
    }
  }
};
const calculateTax = (amount, slabs) => {
  let remaining = amount;
  let totalTax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    const { range, percentage } = slab;
    let lower = 0,
      upper = 0;

    if (range.includes("above") || range.includes("and above")) {
      lower = parseInt(range.replace(/\D/g, ""));
      upper = Infinity;
    } else {
      [lower, upper] = range.split("-").map((v) => parseInt(v.trim()));
    }

    if (amount > lower) {
      const incomeInSlab = Math.min(remaining, upper - lower);
      const taxForSlab = Math.round(incomeInSlab * (percentage / 100));

      breakdown.push({
        range: `₹${lower.toLocaleString()} - ${isFinite(upper) ? `₹${upper.toLocaleString()}` : "∞"}`,
        income: incomeInSlab,
        percentage,
        tax: taxForSlab,
      });

      totalTax += taxForSlab;
      remaining -= incomeInSlab;
      if (remaining <= 0) break;
    }
  }

  return {
    totalTax: Math.round(totalTax),
    breakdown,
  };
};

const dialog = ref(false);
const selectedRegime = ref(null);
const regimes = ["oldRegime", "newRegime"];

const saveRegime = async () => {
  const payload = {
    id: tdsDeductionId.value,
    regime: tdsRegime.value,
  };

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}?`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) throw new Error("Failed to update");

    console.log("TDS updated");
    dialog.value = false;
    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
  }
};
onMounted(async () => {
  await fetchTDSRule();
  await fetchItemData();
  await fetchTaxSettings();
});

const pastTds = () => {
  router.push({ path: `${id}/pastTds` });
};
const hraRent = () => {
  router.push({ path: `${id}/hraRent` });
  showForm.value = true;
};
const hraLoan = () => {
  router.push({ path: `${id}/hraLoan` });
  showForm.value = true;
};
const leaveTravel = () => {
  router.push({ path: `${id}/travelAllowence` });
  showForm.value = true;
};

const deduction = () => {
  router.push({ path: `${id}/deduction` });
  showForm.value = true;
};
const regime = () => {
  dialog.value = true;
};

const isSaving = ref(false);

const calculationItems = ref([]);

const section80Items = computed(() => [
  {
    section: "Section 80C",
    declared: declared80C.value,
    approved: approved80C.value,
  },
  {
    section: "Section 80CCD(1B)",
    declared: declared80CCD.value,
    approved: approved80CCD.value,
  },
  {
    section: "Section 80CCD(2)",
    declared: declared80CCD2.value,
    approved: approved80CCD2.value,
  },

  {
    section: "Section 80D",
    declared: declared80D.value,
    approved: approved80D.value,
  },
  {
    section: "Section 80DD",
    declared: declared80DD.value,
    approved: approved80DD.value,
  },
  {
    section: "Section 80E",
    declared: declared80E.value,
    approved: approved80E.value,
  },
  {
    section: "Section 80EEB",
    declared: declared80EEB.value,
    approved: approved80EEB.value,
  },
  {
    section: "Section 80G",
    declared: declared80G.value,
    approved: approved80G.value,
  },
  {
    section: "Section 80GG",
    declared: declared80GG.value,
    approved: approved80GG.value,
  },
  {
    section: "Section 80GGA",
    declared: declared80GGA.value,
    approved: approved80GGA.value,
  },
  {
    section: "Section 80GGC",
    declared: declared80GGC.value,
    approved: approved80GGC.value,
  },
  {
    section: "Section 80DDB",
    declared: declared80DDB.value,
    approved: approved80DDB.value,
  },
  {
    section: "Section 80U",
    declared: declared80U.value,
    approved: approved80U.value,
  },
]);

const handleClose = () => {
  router.push({ name: "TdsDeductionRoot" });
};

const handleSave = async () => {
  isSaving.value = true;

  try {
    if (!calculationItems.value || !id) return;

    const activeRegime = tdsRegime.value || "newRegime";

    const valueMap = calculationItems.value.reduce((acc, item) => {
      if (activeRegime === "oldRegime") {
        acc[item.description] = item.oldRegime;
      } else {
        acc[item.description] = item.newRegime;
      }
      return acc;
    }, {});
    const status = showNotificationIcon.value ? "requested" : "accepted";
    const payload = {
      taxableIncome: valueMap["Taxable Income"],
      taxLiabilties: valueMap["Tax Liability"],
      standardDeduction: valueMap["Standard Deduction"],
      exemption: valueMap["Exemption"],
      regime: activeRegime,
      status,
      totalEarnings: valueMap["Annual Earnings"],
      totalDeductions: valueMap["Annual Deductions"],
      deduction: totalOtherApproved.value,
      id: tdsDeductionId.value,
      paidTax: valueMap["Total Tax to be Paid"],
      healthEducation:
        valueMap[
          "Health and Education Cess (4% of Tax on taxable Income + Surcharge)"
        ],
      rebate: valueMap["Less: Rebate Under Section 87A(a)"],
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error(error);
  } finally {
    isSaving.value = false;
    handleClose();
  }
};

/**
 * Format amount as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  if (amount === 0) return "₹ 0.00";

  if (typeof amount === "string") return amount;

  // Format the number with commas for thousands separator and fixed to 2 decimal places
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `₹ ${formattedAmount}`;
};
</script>

<style scoped>
.tds-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Content wrapper with single scroll for entire page */
.content-wrapper {
  height: calc(90vh - 190px);
  overflow-y: auto;
  padding: 1rem;
}

.summary-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.icon {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.header-row {
  background-color: #f9f9f9;
  font-weight: 600;
}

.col {
  padding: 1rem;
}

.description {
  flex: 1;
  font-weight: 500;
}

.regime {
  flex: 1;
  text-align: right;
}
.info-cards-investment {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  gap: 1rem;
  margin-bottom: 1.5rem;
}
.info-cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.info-title {
  display: flex;
  align-items: center;
}

h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  padding: 1rem;
}

.info-text {
  color: #777;
  font-style: italic;
}

.regime-text {
  margin-bottom: 1rem;
  text-align: center;
}

.regime-button {
  display: block;
  width: 80%;
  margin: 0 auto;
  padding: 0.75rem;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.rent-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.approved-text {
  color: #777;
}

.section-80-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  font-size: 0.875rem;
}

.action-button.primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.deductions-table {
  width: 100%;
  overflow-x: auto;
}

.table-header {
  display: flex;
  background-color: #f9f9f9;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}

.table-content {
  width: 100%;
}

.section-col {
  flex: 2;
  font-weight: 500;
}

.amount-col {
  flex: 1;
  text-align: right;
}

/* Make the component responsive */
@media (max-width: 768px) {
  .info-cards-container {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

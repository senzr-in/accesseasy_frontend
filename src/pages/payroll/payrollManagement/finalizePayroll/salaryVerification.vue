<template>
  <div class="payroll-dashboard">
    <!-- Modern Gradient Header -->
    <div class="header-banner">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </button>
        <div class="title-section">
          <h1 class="main-title">
            <v-icon size="32" class="title-icon">mdi-account-cash</v-icon>
            Multi-Employee Salary Verification
          </h1>
          <div class="subtitle-wrapper">
            <span class="employee-count">
              <v-icon size="18">mdi-account-group</v-icon>
              {{ selectedEmployees.length }} Employees
            </span>
            <span class="date-badge">
              <v-icon size="18">mdi-calendar</v-icon>
              {{ formatDate(payrollDate.start) }} -
              {{ formatDate(payrollDate.end) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Stepper -->
    <div class="stepper-container">
      <div class="stepper">
        <div class="step completed">
          <div class="step-icon">
            <v-icon>mdi-check-circle</v-icon>
          </div>
          <div class="step-label">Attendance Verification</div>
        </div>

        <div class="step-connector completed"></div>

        <div class="step active">
          <div class="step-icon">
            <span>2</span>
          </div>
          <div class="step-label">Salary Calculation</div>
        </div>
        <div class="step-connector"></div>

        <div class="step disabled">
          <div class="step-icon">
            <span>3</span>
          </div>
          <div class="step-label">Review</div>
        </div>
      </div>
    </div>
    <div class="content-section">
      <div class="section-header">
        <v-icon color="primary" class="mr-2">mdi-currency-inr</v-icon>
        <h2>Salary Overview</h2>
      </div>
      <!-- Main Content Area -->
      <template v-if="isLoadingEmployees">
        <SkeletonLoader
          variant="table-body-only"
          :rows="itemsPerPage || 10"
          :columns="7"
        />
      </template>

      <!-- Table Wrapper -->
      <template v-else>
        <data-table-wrapper
          :show-search="true"
          v-model:searchQuery="searchEmployee"
          :search-placeholder="'Search employee salary...'"
          :is-empty="employeeSalaryData.length === 0"
        >
          <template v-if="employeeSalaryData.length > 0">
            <DataTable
              :items="employeeSalaryData"
              :columns="columns"
              item-key="employee.employeeId"
              wrapper-class="salary-table compact-table"
              style="height: calc(80vh - 160px); overflow-y: auto"
            >
              <!-- Expanded Section (optional detailed view) -->
              <template #expanded-content="{ item }">
                <tr>
                  <td colspan="8" style="color: yellow; background: #222">
                    Expanded row active — {{ item?.employee?.employeeId }}
                    {{ console.log("Expanded item triggered:", item) }}
                  </td>
                  <td class="expanded-content-wrapper" colspan="8">
                    <div class="expanded-details">
                      <h3 class="section-title">Detailed Salary Breakdown</h3>
                      <div v-if="logExpanded(item)"></div>
                      <div class="details-grid">
                        <div class="detail-row">
                          <span class="detail-label">Payable Amount</span>
                          <span class="detail-value">
                            ₹{{ formatAmount(item.totalPayableAmount) || "" }}
                          </span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Paid Amount</span>
                          <span class="detail-value success-text">
                            ₹{{ formatAmount(item.totalPaidAmount) || "" }}
                          </span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Remaining Amount</span>
                          <span class="detail-value warning-text">
                            ₹{{ formatAmount(item.totalRemainingAmount) || "" }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Employee Name -->
              <template #cell-name="{ item }">
                <div class="employee-info">
                  <div class="employee-details">
                    <h3 class="employee-name">
                      {{ item?.employee?.assignedUser?.first_name || "N/A" }}
                    </h3>
                  </div>
                </div>
              </template>

              <!-- Employee ID -->
              <template #cell-id="{ item }">
                {{ item?.employee?.employeeId || "SZR1108" }}
              </template>

              <!-- Monthly CTC -->
              <template #cell-monthlyCTC="{ item }">
                ₹{{ formatAmount(item?.monthlyCTC || 0) }}
              </template>

              <!-- Total Earnings -->
              <template #cell-totalEarnings="{ item }">
                <span class="success-text">
                  ₹{{ formatAmount(item?.totalEarnings || 0) }}
                </span>
              </template>

              <!-- Total Deductions -->
              <template #cell-totalDeductions="{ item }">
                <span class="error-text">
                  ₹{{ formatAmount(item?.totalDeductions || 0) }}
                </span>
              </template>

              <!-- Total Benefits -->
              <template #cell-totalBenefits="{ item }">
                <span class="info-text">
                  ₹{{ formatAmount(item?.totalBenefits || 0) }}
                </span>
              </template>

              <!-- Net Salary -->
              <template #cell-netSalary="{ item }">
                <strong>₹{{ formatAmount(item?.netSalary || 0) }}</strong>
              </template>

              <!-- Actions -->
              <template #cell-actions="{ item }">
                <v-btn
                  small
                  color="primary"
                  text
                  @click="
                    () => {
                      console.log('item:', item);
                      viewEmployeeDetails(item);
                    }
                  "
                >
                  <v-icon left size="16">mdi-eye</v-icon>
                  View
                </v-btn>
              </template>
            </DataTable>
          </template>

          <!-- Empty State -->
          <template v-else>
            <EmptyState
              title="No salary data found"
              message="Try refreshing or check your filters"
              :primary-action="{ text: 'Reload', icon: 'mdi-reload' }"
              @primaryAction="fetchEmployeeSalaryData"
            />
          </template>
        </data-table-wrapper>
        <CustomPagination
          v-model:page="currentPage"
          v-model:itemsPerPage="itemsPerPage"
          :total-items="totalEmployees"
          @update:page="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </template>
    </div>
    <!-- Action Buttons -->
    <div class="action-footer">
      <BaseButton
        variant="primary"
        size="md"
        :left-icon="SidebarClose"
        @click="goBack"
        class="ms-2"
      >
        Back
      </BaseButton>

      <BaseButton
        variant="primary"
        size="md"
        :left-icon="CheckCircle"
        @click="SalariesVerification"
        class="ms-2"
      >
        Finalize Salaries
      </BaseButton>
    </div>

    <!-- Employee Details Dialog -->
    <v-dialog
      v-model="showEmployeeDetails"
      max-width="800"
      content-class="employee-details-dialog"
    >
      <v-card>
        <v-card-title class="dialog-header">
          <v-icon size="24" color="primary" class="mr-2">mdi-account</v-icon>
          {{
            selectedEmployeeDetail?.employee?.assignedUser?.first_name ||
            "Employee"
          }}
          Details
          <v-spacer></v-spacer>
        </v-card-title>

        <v-card-text class="dialog-content">
          <div v-if="selectedEmployeeDetail">
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              color="primary"
              grow
            >
              <v-tab value="earnings" class="tab-item">
                <v-icon left>mdi-cash-plus</v-icon>
                Earnings
              </v-tab>
              <v-tab value="deductions" class="tab-item">
                <v-icon left>mdi-cash-minus</v-icon>
                Deductions
              </v-tab>
              <v-tab value="benefits" class="tab-item">
                <v-icon left>mdi-cash-check</v-icon>
                Penalties & Benefits
              </v-tab>
              <v-tab value="attendance" class="tab-item">
                <v-icon left>mdi-calendar-check</v-icon>
                Attendance
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="mt-4">
              <v-window-item value="earnings">
                <div class="detail-list">
                  <div
                    v-for="(value, key) in selectedEmployeeDetail.earnings"
                    :key="key"
                    class="detail-item"
                  >
                    <div class="detail-item-label">{{ key }}</div>
                    <div class="detail-item-value">
                      ₹{{ formatAmount(value) }}
                    </div>
                  </div>

                  <div
                    v-if="selectedEmployeeDetail.pendingEarnings"
                    class="pending-earnings-section"
                  >
                    <div
                      v-for="(
                        value, key
                      ) in selectedEmployeeDetail.pendingEarnings"
                      :key="'pending-' + key"
                      class="detail-item"
                    >
                      <div class="detail-item-label">{{ key }}</div>
                      <div class="detail-item-value">
                        ₹{{ formatAmount(value) }}
                      </div>
                    </div>
                  </div>

                  <div class="detail-item total">
                    <div class="detail-item-label">Total Earnings</div>
                    <div class="detail-item-value earnings">
                      ₹{{ formatAmount(selectedEmployeeDetail.totalEarnings) }}
                    </div>
                  </div>
                </div>
              </v-window-item>

              <v-window-item value="deductions">
                <div class="detail-list">
                  <div
                    v-for="(value, key) in selectedEmployeeDetail.deductions"
                    :key="key"
                    class="detail-item"
                  >
                    <div class="detail-item-label">{{ key }}</div>
                    <div class="detail-item-value">
                      ₹{{ formatAmount(value) }}
                    </div>
                  </div>

                  <div
                    v-for="(
                      value, key
                    ) in selectedEmployeeDetail.otherDeductions"
                    :key="key"
                    class="detail-item"
                  >
                    <div class="detail-item-label">{{ key }}</div>
                    <div class="detail-item-value">
                      ₹{{ formatAmount(value) }}
                    </div>
                  </div>

                  <div class="detail-item total">
                    <div class="detail-item-label">Total Deductions</div>
                    <div class="detail-item-value deductions">
                      ₹{{
                        formatAmount(selectedEmployeeDetail.totalDeductions)
                      }}
                    </div>
                  </div>
                </div>
              </v-window-item>

              <!-- In the benefits tab section of the dialog -->
              <!-- In the benefits tab section of the dialog -->
              <v-window-item value="benefits">
                <div class="detail-list">
                  <!-- Penalties -->
                  <div class="sub-section-title">Penalties</div>
                  <div
                    v-for="(value, key) in selectedEmployeeDetail.penalties"
                    :key="key"
                    class="detail-item"
                  >
                    <div class="detail-item-label">{{ key }}</div>
                    <div class="detail-item-value">
                      ₹{{ formatAmount(value) }}
                    </div>
                  </div>
                  <div class="detail-item total">
                    <div class="detail-item-label">Total Penalities</div>
                    <div class="detail-item-value benefits">
                      ₹{{
                        formatAmount(selectedEmployeeDetail.totalPenalities)
                      }}
                    </div>
                  </div>
                  <!-- Benefits -->
                  <div class="sub-section-title">Benefits</div>
                  <div
                    class="detail-item"
                    v-if="selectedEmployeeDetail.benefitsDetails.overtime"
                  >
                    <div class="detail-item-label">Overtime</div>
                    <div class="detail-item-value">
                      ₹{{
                        formatAmount(
                          selectedEmployeeDetail.benefitsDetails.overtime,
                        )
                      }}
                    </div>
                  </div>

                  <div
                    class="detail-item"
                    v-if="selectedEmployeeDetail.benefitsDetails.bonus?.amount"
                  >
                    <div class="detail-item-label">Bonus</div>
                    <div class="detail-item-value">
                      ₹{{
                        formatAmount(
                          selectedEmployeeDetail.benefitsDetails.bonus.amount,
                        )
                      }}
                    </div>
                  </div>

                  <div
                    class="detail-item"
                    v-if="
                      selectedEmployeeDetail.benefitsDetails.incentive?.amount
                    "
                  >
                    <div class="detail-item-label">Incentive</div>
                    <div class="detail-item-value">
                      ₹{{
                        formatAmount(
                          selectedEmployeeDetail.benefitsDetails.incentive
                            .amount,
                        )
                      }}
                    </div>
                  </div>

                  <div
                    class="detail-item"
                    v-if="
                      selectedEmployeeDetail.benefitsDetails.retentionPay
                        ?.amount
                    "
                  >
                    <div class="detail-item-label">Retention Pay</div>
                    <div class="detail-item-value">
                      ₹{{
                        formatAmount(
                          selectedEmployeeDetail.benefitsDetails.retentionPay
                            .amount,
                        )
                      }}
                    </div>
                  </div>

                  <!-- Manual Benefits -->
                  <!-- Bonus (Manual) -->
                  <div
                    class="detail-item"
                    v-if="
                      (selectedEmployeeDetail.benefitsDetails.bonusManual || [])
                        .length
                    "
                  >
                    <div class="detail-item-label">Bonus (Manual)</div>
                    <div class="detail-item-value">
                      <div
                        v-for="(b, index) in selectedEmployeeDetail
                          .benefitsDetails.bonusManual"
                        :key="index"
                      >
                        {{ b.reason }}: ₹{{ formatAmount(b.amount) }}
                      </div>
                    </div>
                  </div>

                  <!-- Incentive (Manual) -->
                  <div
                    class="detail-item"
                    v-if="
                      (
                        selectedEmployeeDetail.benefitsDetails
                          .incentiveManual || []
                      ).length
                    "
                  >
                    <div class="detail-item-label">Incentive (Manual)</div>
                    <div class="detail-item-value">
                      <div
                        v-for="(i, index) in selectedEmployeeDetail
                          .benefitsDetails.incentiveManual"
                        :key="index"
                      >
                        {{ i.reason }}: ₹{{ formatAmount(i.amount) }}
                      </div>
                    </div>
                  </div>

                  <!-- Retention Pay (Manual) -->
                  <div
                    class="detail-item"
                    v-if="
                      (
                        selectedEmployeeDetail.benefitsDetails
                          .retentionPayManual || []
                      ).length
                    "
                  >
                    <div class="detail-item-label">Retention Pay (Manual)</div>
                    <div class="detail-item-value">
                      <div
                        v-for="(r, index) in selectedEmployeeDetail
                          .benefitsDetails.retentionPayManual"
                        :key="index"
                      >
                        {{ r.reason }}: ₹{{ formatAmount(r.amount) }}
                      </div>
                    </div>
                  </div>

                  <div class="detail-item total">
                    <div class="detail-item-label">Total Benefits</div>
                    <div class="detail-item-value benefits">
                      ₹{{ formatAmount(selectedEmployeeDetail.totalBenefits) }}
                    </div>
                  </div>
                </div>
              </v-window-item>

              <v-window-item value="attendance">
                <div class="attendance-summary">
                  <div class="attendance-item total">
                    <div class="attendance-label">Total Payable Days</div>
                    <div class="attendance-value">
                      {{ selectedEmployeeDetail.attendance?.totalPayable || 0 }}
                    </div>
                  </div>
                </div>
              </v-window-item>
            </v-window>

            <div class="salary-summary">
              <div class="summary-item">
                <div class="summary-label">Total Earnings</div>
                <div class="summary-value earnings">
                  ₹{{ formatAmount(selectedEmployeeDetail.totalEarnings) }}
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-label">Total Deductions</div>
                <div class="summary-value deductions">
                  ₹{{ formatAmount(selectedEmployeeDetail.totalDeductions) }}
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-label">Total Benefits</div>
                <div class="summary-value benefits">
                  ₹{{ formatAmount(selectedEmployeeDetail.totalBenefits) }}
                </div>
              </div>

              <div class="summary-item net">
                <div class="summary-label">Net Salary</div>
                <div class="summary-value">
                  ₹{{ formatAmount(selectedEmployeeDetail.netSalary) }}
                </div>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showEmployeeDetails = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Add the loading indicators -->
    <!-- <LoadingProgressIndicator
      v-model:show="showInitialLoading"
      :progress="loadingProgress"
      :status-text="finalizationText"
      title="Finalizing Salaries"
      icon="mdi-currency-inr"
      @complete="onInitialLoadComplete"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import LoadingProgressIndicator from "@/components/loadingProgresss/loadingProgressIndicator.vue";
import { fetchPayrollVerification } from "../../../../services/payrollManagemnet/tdsCalculation";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { SidebarClose, CheckCircle } from "lucide-vue-next";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";

// import { fetchTdsDeduction } from "../../../../services/payrollManagemnet/tdsCalculation";

const router = useRouter();
const route = useRoute();
const selectedEmployees = ref([]);
const payrollDate = ref({
  start: route.query.start,
  end: route.query.end,
});
const token = authService.getToken();
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const processing = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
// const employeeSalaryData = ref([]);
const showEmployeeDetails = ref(false);
const selectedEmployeeDetail = ref(null);
const activeTab = ref("earnings");
const totalPaidAmount = ref(0);
const daysInAttendanceCycle = ref(0);
const tdsDeduction = ref(0);
const tenantId = currentUserTenant.getTenantId();

// Loading progress indicators
const showInitialLoading = ref(false);
const loadingProgress = ref(0);
const showFinalizationLoading = ref(false);
const finalizationProgress = ref(0);
const finalizationStatus = ref("");

const columns = [
  { key: "id", label: "Employee ID", width: "150px" },
  { key: "name", label: "Employee Name", width: "180px" },
  { key: "monthlyCTC", label: "Monthly CTC", width: "150px" },
  { key: "totalEarnings", label: "Total Earnings", width: "150px" },
  { key: "totalDeductions", label: "Total Deductions", width: "150px" },
  { key: "totalBenefits", label: "Total Benefits", width: "150px" },
  { key: "netSalary", label: "Net Salary", width: "150px" },
  { key: "actions", label: "Actions", width: "150px" },
];

const onInitialLoadComplete = () => {};

const onFinalizationComplete = () => {};

const formatPayrollDate = (dateString) => {
  const date = new Date(dateString + "-01");
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// Computed properties
const totalMonthlyCTC = computed(() => {
  if (
    !Array.isArray(employeeSalaryData.value) ||
    !employeeSalaryData.value.length
  )
    return 0;
  return employeeSalaryData.value.reduce((sum, emp) => {
    return sum + (parseFloat(emp.monthlyCTC) || 0);
  }, 0);
});

const totalPayableAmount = computed(() => {
  if (
    !Array.isArray(employeeSalaryData.value) ||
    !employeeSalaryData.value.length
  )
    return 0;
  return employeeSalaryData.value.reduce((sum, emp) => {
    return sum + (parseFloat(emp.netSalary) || 0);
  }, 0);
});

const totalRemainingAmount = computed(() => {
  return (totalPayableAmount.value || 0) - (totalPaidAmount.value || 0);
});

const selectedYear = computed(() => payrollDate.value.end.split("-")[0]);
const selectedMonth = computed(() => payrollDate.value.end.split("-")[1]);
const switches = ref({
  allowPF: "",
  allowESI: "",
  allowLWF: "",
});
const PFAccount = ref();
const ESIAccount = ref();
const shopAccount = ref();

const isAnniversaryMonth = (
  dateOfJoining,
  frequency,
  currentMonth,
  currentYear,
) => {
  if (!dateOfJoining || !frequency) {
    return false;
  }

  const joinDate = new Date(dateOfJoining);
  const joinMonth = joinDate.getMonth() + 1; // JavaScript months are 0-indexed
  const joinYear = joinDate.getFullYear();

  // Calculate years since joining
  const yearsDiff = currentYear - joinYear;

  switch (frequency.toLowerCase()) {
    case "yearly":
      return currentMonth === joinMonth && yearsDiff >= 1;
    case "half-yearly":
      const halfYearMonth =
        joinMonth + 6 > 12 ? joinMonth + 6 - 12 : joinMonth + 6;
      return (
        (currentMonth === joinMonth || currentMonth === halfYearMonth) &&
        yearsDiff >= 1
      );
    case "quarterly":
      const quarterMonths = [
        joinMonth,
        joinMonth + 3 > 12 ? joinMonth + 3 - 12 : joinMonth + 3,
        joinMonth + 6 > 12 ? joinMonth + 6 - 12 : joinMonth + 6,
        joinMonth + 9 > 12 ? joinMonth + 9 - 12 : joinMonth + 9,
      ];
      return quarterMonths.includes(currentMonth) && yearsDiff >= 1;
    case "monthly":
      return true;
    default:
      return false;
  }
};
let month;
const loadEmployeeData = async () => {
  try {
    const storedEmployees = localStorage.getItem("selectedEmployees");

    if (storedEmployees) {
      selectedEmployees.value = JSON.parse(storedEmployees);
      console.log(
        "✅ selectedEmployees loaded from 'selectedEmployees':",
        selectedEmployees.value,
      );
    } else {
      const storedEmployee = localStorage.getItem("selectedEmployee");

      if (storedEmployee) {
        selectedEmployees.value = [JSON.parse(storedEmployee)];
        console.log(
          "✅ selectedEmployees loaded from 'selectedEmployee':",
          selectedEmployees.value,
        );
      } else {
        console.warn(
          "❌ No selected employee found in localStorage, redirecting...",
        );
        router.push("/payroll");
        return;
      }
    }
    const startDate = new Date(payrollDate.value.start);
    const endDate = new Date(payrollDate.value.end);
    month = payrollDate.value.end.slice(0, 7);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    daysInAttendanceCycle.value = diffDays;
  } catch (error) {
    console.error("❌ Error loading employee data:", error);
    showSnackbar.value = true;
    snackbarMessage.value = `Error loading employee data: ${error.message}`;
    snackbarColor.value = "error";
  }
};

const formatAmount = (value) => {
  if (!value) return "0.00";
  return parseFloat(value)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
// Get current month and year from payroll date
const currentMonth = computed(() => {
  if (!payrollDate.value.end) return null;
  const date = new Date(payrollDate.value.end);
  return date.getMonth() + 1; // JavaScript months are 0-indexed
});

const currentYear = computed(() => {
  if (!payrollDate.value.end) return null;
  const date = new Date(payrollDate.value.end);
  return date.getFullYear();
});
const goBack = () => {
  router.push("/payroll/attendance-verification");
};

const onDateChange = () => {
  showInitialLoading.value = true;
  employeeSalaryData.value = [];
  loadEmployeeData();
};

const bonusAmount = ref(0);
const incentiveAmount = ref(0);
const retentionPayAmount = ref(0);

const salaryVerificationData = ref([]);
let excessLeaveMap = {};
const fetchLeaveData = async () => {
  try {
    const token = authService.getToken();
    const employeeIds = selectedEmployees.value
      .filter((e) => e?.employee?.id)
      .map((e) => e.employee.id);

    const employeeBatchSize = 100;
    const allLeaveData = [];

    for (let i = 0; i < employeeIds.length; i += employeeBatchSize) {
      const employeeIdBatch = employeeIds.slice(i, i + employeeBatchSize);

      const params = {
        "filter[assignedTo][_in]": employeeIdBatch.join(","),
        fields: "id,assignedTo,leaveTaken,leaveBalance",
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/items/leave`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      allLeaveData.push(...(response.data.data || []));
    }

    return allLeaveData;
  } catch (error) {
    console.error("Error fetching leave data:", error);
    return [];
  }
};
const logExpanded = (item) => {
  console.log("Expanded row data:", item);
  return true; // ensures v-if renders the div
};

const fetchSalaryBreakdowns = async () => {
  try {
    const token = authService.getToken();
    const employeeIds = selectedEmployees.value
      .filter((e) => e?.employee?.id)
      .map((e) => e.employee.id);

    const employeeBatchSize = 100;
    const allBreakdownData = [];
    const endDate = payrollDate.value.end;

    for (let i = 0; i < employeeIds.length; i += employeeBatchSize) {
      const employeeIdBatch = employeeIds.slice(i, i + employeeBatchSize);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/breakdown`,
        {
          params: {
            "filter[employee][_in]": employeeIdBatch.join(","),
            date: endDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const batchData = response.data.data || [];
      allBreakdownData.push(...batchData);
    }
    if (allBreakdownData.length) {
      await patchSalaryBreakdown(allBreakdownData);
    }
  } catch (error) {
    console.error("Error fetching salary breakdown:", error);
    showSnackbar.value = true;
    snackbarMessage.value = "Error loading salary breakdown data";
    snackbarColor.value = "error";
  }
};
const patchSalaryBreakdown = async (breakdowns) => {
  const token = authService.getToken();
  const batchSize = 100;

  // 🗓️ Extract year and month from payrollDate.value.end (format: YYYY-MM-DD)
  const [year, month] = payrollDate.value.end.split("-");

  const transform = (breakdown) => {
    const earningsData =
      breakdown.earnings?.reduce((acc, item) => {
        const [key, value] = item.split(": ");
        acc[key] = Number(value) || 0;
        return acc;
      }, {}) || {};

    const employeeDeductionData =
      breakdown.employeeContributions?.reduce((acc, item) => {
        const [key, value] = item.split(": ");
        acc[key] = Number(value) || 0;
        return acc;
      }, {}) || {};

    const deductionData =
      breakdown.deductionsList?.reduce((acc, item) => {
        const [key, value] = item.split(": ");
        acc[key] = Number(value) || 0;
        return acc;
      }, {}) || {};

    const employersContributionData = Object.entries(
      breakdown.employerContributions || {},
    ).reduce((acc, [key, value]) => {
      acc[key] = {
        amount: Number(value.amount) || 0,
        includedInCTC: !!value.includedInCTC,
      };
      return acc;
    }, {});

    // 🧩 Final structured format (no salaryTracking)
    return {
      id: breakdown.id,

      earnings: {
        [year]: {
          [month]: {
            ...earningsData,
            "Basic Pay": breakdown.basicPayValue || 0,
          },
        },
      },
      employeeDeduction: {
        [year]: {
          [month]: employeeDeductionData,
        },
        ...employeeDeductionData, // keep flat-level copy
      },
      deduction: {
        [year]: {
          [month]: deductionData,
        },
      },
      employersContribution: {
        [year]: {
          [month]: employersContributionData,
        },
        ...employersContributionData, // keep flat-level copy
      },

      basicSalary: breakdown.monthlyCTC,
      basicPay: breakdown.basicPayValue,
      totalEarnings: breakdown.totalEarnings,
      totalDeductions: breakdown.totalDeductions,
      netSalary: breakdown.netSalary,
      employerLwf: breakdown.employerLWF,
      employeeLwf: breakdown.employeeLWF,
      employeradmin: breakdown.adminAmount,
      voluntaryPFAmount: breakdown.voluntaryPFAmount || 0,
      profeesionalTax: breakdown.profeesionalTax || 0,
    };
  };

  for (let i = 0; i < breakdowns.length; i += batchSize) {
    const batch = breakdowns
      .slice(i, i + batchSize)
      .filter((b) => b?.id)
      .map(transform);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
        batch,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(
        `✅ Patched batch ${i / batchSize + 1} (${batch.length} items)`,
      );
    } catch (error) {
      console.error(`❌ Patch failed for batch ${i / batchSize + 1}:`, error);
    }
  }
};

const fetchSalaryVerification = async () => {
  try {
    showInitialLoading.value = true;
    await loadEmployeeData();
    await fetchSalaryBreakdowns();
    loadingProgress.value = 0;

    const token = authService.getToken();
    const employeeIds = selectedEmployees.value
      .filter((e) => e?.employee?.id)
      .map((e) => e.employee.id);

    loadingProgress.value = 30;

    const employeeBatchSize = 100;
    const allData = [];

    for (let i = 0; i < employeeIds.length; i += employeeBatchSize) {
      const employeeIdBatch = employeeIds.slice(i, i + employeeBatchSize);

      const params = {
        startDate: payrollDate.value.start,
        endDate: payrollDate.value.end,
        totalDays: daysInAttendanceCycle.value,
        "filter[employeeIds][_in]": employeeIdBatch.join(","),
      };

      loadingProgress.value = 30 + (i / employeeIds.length) * 50;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/salaryVerification`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      allData.push(...(response.data.data || []));
    }

    loadingProgress.value = 80;
    const leaveData = await fetchLeaveData();
    salaryVerificationData.value = await calculation(allData);
    await calculateLeaveBalances(salaryVerificationData.value, leaveData);

    loadingProgress.value = 100;
  } catch (error) {
    console.error("Error fetching salary verification:", error);
    showSnackbar.value = true;
    snackbarMessage.value = "Error loading salary verification data";
    snackbarColor.value = "error";
  } finally {
    showInitialLoading.value = false;
  }
};

const calculation = async (salaryVerificationArray) => {
  const dataArray = Array.isArray(salaryVerificationArray)
    ? salaryVerificationArray
    : [];

  // const tdsMap = await fetchPayrollVerification(
  //   dataArray.map((item) => {
  //     const employeePf =
  //       (item.employeeDeductions || []).find((d) => d.name === "EmployeePF")
  //         ?.rupee || 0;

  //     return {
  //       employeeId: item.id,
  //       monthlyCTC: item.monthlyCtc || 0,
  //       employeePF: item.employeePf || 0,
  //       currentEarnings: item.totalEarnings || 0,
  //       currentPF: parseFloat(employeePf) || 0,
  //       currentBenefits: item.totalBenefits || 0,
  //     };
  //   }),
  //   payrollDate.value.end,
  // );

  return dataArray.map((item) => {
    const earnings = {};
    const deductions = {};
    const complianceDetails = {};

    for (const [key, value] of Object.entries(item.earnings || {})) {
      earnings[key] = parseFloat(value) || 0;
    }

    earnings["Weekoff OT"] = item.weekOffOTPay;
    earnings["Holiday OT"] = item.holidayOTPay;
    earnings["workingHours OT"] = item.workingHoursOTPay;
    earnings["Admin Charge"] = item.adminCharge?.rupee || 0;
    earnings["EmployerLwf"] = item.employerLwf || 0;
    earnings["Loan Credits"] = Object.values(
      item.loanCreditAmounts || {},
    ).reduce((sum, val) => sum + (Number(val) || 0), 0);
    earnings["Advance"] = Object.values(item.advanceAmounts || {}).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0,
    );

    (item.employerContributions || []).forEach(({ name, rupee }) => {
      const val = parseFloat(rupee) || 0;
      earnings[name] = val;
      deductions[name] = val;
    });

    (item.employerContributionsFull || []).forEach(({ name, rupee }) => {
      complianceDetails[name] = parseFloat(rupee) || 0;
    });

    complianceDetails["Admin Charge"] = item.admin?.rupee || 0;

    for (const [key, value] of Object.entries(item.deduction || {})) {
      deductions[key] = parseFloat(value) || 0;
    }

    (item.employeeDeductions || []).forEach((ded) => {
      deductions[ded.name] = parseFloat(ded.rupee) || 0;
    });

    if (item.pt) {
      deductions["Professional Tax"] = parseFloat(item.pt) || 0;
    }

    deductions["Admin Charge"] = item.adminCharge?.rupee || 0;
    deductions["EmployerLwf"] = item.employerLwf || 0;
    deductions["employeeLwf"] = item.employeeLwf || 0;
    // deductions["TDS"] = tdsMap[item.id]?.tdsPerMonth || 0;
    deductions["VoluntaryPF"] = item.voluntaryPFAmount || 0;
    deductions["Loan Debits"] = Object.values(
      item.loanDebitAmounts || {},
    ).reduce((sum, val) => sum + (Number(val) || 0), 0);

    const monthlyCTC = item.monthlyCtc || 0;
    const employeePf = item.employeePf || 0;

    const salaryArrearsTotal = Object.values(item.salaryArrears || {}).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0,
    );

    const otherDeductionsTotal = Object.values(
      item.otherDeductions || {},
    ).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const filteredEarnings = Object.fromEntries(
      Object.entries(earnings).filter(([, val]) => val !== 0),
    );

    const filteredDeductions = Object.fromEntries(
      Object.entries(deductions).filter(([, val]) => val !== 0),
    );

    const filteredCompliance = Object.fromEntries(
      Object.entries(complianceDetails).filter(([, val]) => val !== 0),
    );

    const filteredPendingEarnings = Object.fromEntries(
      Object.entries(item.salaryArrears || {}).filter(
        ([, val]) => parseFloat(val) !== 0,
      ),
    );

    const filteredOtherDeductions = Object.fromEntries(
      Object.entries(item.otherDeductions || {}).filter(
        ([, val]) => parseFloat(val) !== 0,
      ),
    );

    const totalEarnings =
      Object.values(filteredEarnings).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0,
      ) + salaryArrearsTotal;

    const totalDeductions =
      Object.values(filteredDeductions).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0,
      ) + otherDeductionsTotal;

    const totalPenalities =
      item.latePenalty + item.earlyLeavingPenalty + item.workingHourPenalty;

    const netSalary =
      totalEarnings - totalDeductions - totalPenalities + item.totalBenefits;
    const excessLeaveCount = excessLeaveMap[item.id] || 0;

    return {
      payrollId: item.payrollId,
      employee: {
        id: item.id,
        employeeId: item.id,
        assignedUser: {
          first_name: item.name || `Employee ${item.id}`,
        },
      },
      monthlyCTC,
      totalEarnings,
      totalDeductions,
      totalPenalities,
      totalBenefits: item.totalBenefits,
      netSalary,
      earnings: filteredEarnings,
      deductions: filteredDeductions,
      otherDeductions: filteredOtherDeductions,
      pendingEarnings: filteredPendingEarnings,
      complianceDetails: filteredCompliance,
      penalties: {
        latePenalty: item.latePenalty || 0,
        earlyLeavingPenalty: item.earlyLeavingPenalty || 0,
        workingHourPenalty: item.workingHourPenalty || 0,
      },
      attendance: {
        totalPayable: (item.payableDays || 0) - excessLeaveCount,
      },
      employerContributions: item.employerContributions || [],
      employerContributionsFull: item.employerContributionsFull,
      employeeDeductions: item.employeeDeductions,
      benefitsDetails: {
        bonusManual: (item.bonusDetails || []).map((b) => ({
          reason: b.reason,
          amount: b.amount,
        })),
        incentiveManual: (item.incentiveDetails || []).map((i) => ({
          reason: i.reason,
          amount: i.amount,
        })),
        retentionPayManual: (item.retentionDetails || []).map((r) => ({
          reason: r.reason,
          amount: r.amount,
        })),
      },

      penalityLeaveCount: item.lateLeave.count,
      penalityLeave: item.lateLeave.leave,
    };
  });
};

const calculateLeaveBalances = async (salaryVerificationArray, leaveData) => {
  excessLeaveMap = {};
  const pendingLeaveUpdates = [];
  for (const item of salaryVerificationArray) {
    const leaveType = item.penalityLeave;
    const leaveCount = item.penalityLeaveCount;

    if (!leaveType || !leaveCount) {
      continue;
    }

    const leaveRecord = leaveData.find(
      (leave) => leave.assignedTo === item.employee.id,
    );

    const matchedLeaveKey = leaveRecord
      ? Object.keys(leaveRecord.leaveBalance || {}).find(
          (key) =>
            key.toLowerCase().replace(/\s+/g, "") ===
            leaveType.toLowerCase().replace(/\s+/g, ""),
        )
      : null;

    if (leaveRecord && matchedLeaveKey) {
      const currentBalance = leaveRecord.leaveBalance[matchedLeaveKey];
      if (currentBalance === 0) {
        console.log("⛔ Leave balance already zero", {
          employeeId: item.employee.id,
          leaveType: matchedLeaveKey,
        });
        excessLeaveMap[item.employee.id] = leaveCount;
        continue;
      }

      const usedLeave = Math.min(currentBalance, leaveCount);
      const remainingLeave = leaveCount - usedLeave;
      const newBalance = Math.max(currentBalance - leaveCount, 0);

      const updatedBalance = {
        ...leaveRecord.leaveBalance,
        [matchedLeaveKey]: newBalance,
      };

      const updatedTaken = {
        ...leaveRecord.leaveTaken,
        [`t${matchedLeaveKey}`]:
          (leaveRecord.leaveTaken?.[`t${matchedLeaveKey}`] || 0) + usedLeave,
      };

      const updatePayload = {
        id: leaveRecord.id,
        leaveBalance: updatedBalance,
        leaveTaken: updatedTaken,
      };

      excessLeaveMap[item.employee.id] = remainingLeave;

      pendingLeaveUpdates.push(updatePayload);
    }
  }

  window.pendingLeaveUpdates = pendingLeaveUpdates;

  return excessLeaveMap;
};
const employeeSalaryData = computed(() => {
  return salaryVerificationData.value || [];
});

const patchAllSalaryVerifications = async (salaryVerificationList) => {
  const token = authService.getToken();

  const parseEntries = (obj) =>
    Object.fromEntries(
      Object.entries(obj || {}).map(([k, v]) => [k, parseFloat(v) || 0]),
    );

  const batchPayload = salaryVerificationList
    .filter((emp) => emp.payrollId)
    .map((employeeData) => {
      return {
        id: employeeData.payrollId,
        tenant: tenantId,
        payableAmount: employeeData.netSalary,
        ctc: employeeData.monthlyCTC,
        netSalary: employeeData.netSalary,
        totalEarnings: employeeData.totalEarnings,
        totalPenality: employeeData.totalPenalities,
        totalBenefits: employeeData.totalBenefits,
        employerContribution: employeeData.complianceDetails,
        individualDeduction: Object.entries(
          employeeData.otherDeductions || {},
        ).reduce((acc, [key, value], index) => {
          acc[`deduction${index + 1}`] = { [key]: parseFloat(value) || 0 };
          return acc;
        }, {}),
        finalizeDate: new Date().toISOString().split("T")[0],
        tdsAmount: employeeData.deductions["TDS"] || 0,
        totalOtherDeduction: employeeData.totalDeductions,
        salaryArrears: Object.entries(
          employeeData.pendingEarnings || {},
        ).reduce((acc, [key, value], index) => {
          acc[`earning${index + 1}`] = { [key]: parseFloat(value) || 0 };
          return acc;
        }, {}),

        earnings: parseEntries(employeeData.earnings),
        penalties: parseEntries(employeeData.penalties),
        benefits: {
          Overtime: parseFloat(employeeData.overtimeAmount || 0),

          BonusManual: parseFloat(
            employeeData.benefitsDetails?.bonusManual || 0,
          ),
          IncentiveManual: parseFloat(
            employeeData.benefitsDetails?.incentiveManual || 0,
          ),
          RetentionPayManual: parseFloat(
            employeeData.benefitsDetails?.retentionPayManual || 0,
          ),
        },
        complienceDeduction: employeeData.deductions["EmployeePF"] || 0,
        salaryVerification: true,
        deductions: parseEntries(employeeData.deductions),
        employerPF: employeeData.earnings["employerPF"] || 0,
        employerESI: employeeData.earnings["employerESI"] || 0,
        employerPF: employeeData.deductions["employerPF"] || 0,
        employerESI: employeeData.deductions["employerESI"] || 0,
        employeePF: employeeData.deductions["employeePF"] || 0,
        employeeESI: employeeData.deductions["employeeESI"] || 0,
        professionalTax: employeeData.deductions["Professional Tax"] || 0,
        laborWelfareFund: 0,
        employerLWF: employeeData.deductions["Employer Lwf"] || 0,
        employeeLWF: employeeData.deductions["Employee Lwf"] || 0,
        adminCharge: employeeData.earnings["Admin Charge"] || 0,
        employerBase: employeeData.employerContributionsFull?.reduce(
          (acc, item) => {
            acc[item.name] = item.totalAmount;
            return acc;
          },
          {},
        ),
        employeeBase: employeeData.employeeDeductions?.reduce((acc, item) => {
          acc[item.name] = item.totalAmount;
          return acc;
        }, {}),
      };
    });

  const verificationBatchSize = 100;

  if (batchPayload.length > 0) {
    try {
      for (let i = 0; i < batchPayload.length; i += verificationBatchSize) {
        const batch = batchPayload.slice(i, i + verificationBatchSize);

        await axios.patch(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          batch,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log(
          `✅ Batch PATCH successful for records ${i + 1} to ${i + batch.length}`,
        );
      }
    } catch (err) {
      console.error("❌ Error during batch PATCH:", err);
    }
  } else {
    console.warn("⚠️ No verificationId found, skipping batch PATCH.");
  }
};

const patchLeaveBalances = async () => {
  const token = authService.getToken();
  const updatedLeaveData = window.pendingLeaveUpdates || [];

  if (updatedLeaveData.length > 0) {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/items/leave`,
      updatedLeaveData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }
};
const SalariesVerification = async () => {
  try {
    processing.value = true;
    showFinalizationLoading.value = true;
    finalizationStatus.value = "Starting finalization process...";
    finalizationProgress.value = 10;

    finalizationStatus.value = "Updating leave balances...";
    finalizationProgress.value = 20;
    await patchLeaveBalances();

    finalizationStatus.value = "Finalizing salary records...";
    finalizationProgress.value = 50;
    await patchAllSalaryVerifications(salaryVerificationData.value);

    finalizationProgress.value = 80;
    finalizationStatus.value = "Completing payroll process...";

    showSnackbar.value = true;
    snackbarMessage.value = "All salaries finalized successfully";
    snackbarColor.value = "success";

    finalizationProgress.value = 100;
    finalizationStatus.value = "Payroll finalized successfully!";

    setTimeout(() => {
      router.push({
        name: "review",
        query: {
          start: payrollDate.value.start,
          end: payrollDate.value.end,
        },
      });
    }, 1500);
  } catch (error) {
    console.error("Error finalizing salaries:", error);
    showSnackbar.value = true;
    snackbarMessage.value = "Error finalizing salaries";
    snackbarColor.value = "error";
  } finally {
    setTimeout(() => {
      processing.value = false;
      showFinalizationLoading.value = false;
    }, 1000);
  }
};

const viewEmployeeDetails = (employee) => {
  selectedEmployeeDetail.value = employee;
  showEmployeeDetails.value = true;
};

onMounted(async () => {
  await fetchSalaryVerification();
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1rem;
  color: #4a5568;
}
.payroll-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding-bottom: 80px;
}

/* Header Styles */
.header-banner {
  background: #ecfdf5;
  padding: 1.5rem;
  color: rgb(0, 0, 0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
}

.cycle-type-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.cycle-type-badge.fixed-cycle {
  background: rgba(72, 187, 120, 0.2);
  color: #2f855a;
}

.cycle-type-badge:not(.fixed-cycle) {
  background: rgba(237, 137, 54, 0.2);
  color: #c05621;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 0.75rem;
}

.subtitle-wrapper {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.employee-count,
.date-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.date-selector {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

/* Stepper Styles */
.stepper-container {
  width: 100%;
  margin: 0 auto 1rem;
  padding: 0 1rem;
}

.stepper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  position: relative;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #6c757d;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.step.active .step-icon {
  background: #4776e6;
  color: white;
}

.step.completed .step-icon {
  background: #48bb78;
  color: white;
}

.step.disabled {
  opacity: 0.6;
}

.step-label {
  font-weight: 500;
  color: #4a5568;
}

.step.active .step-label {
  color: #4776e6;
  font-weight: 600;
}

.step.completed .step-label {
  color: #48bb78;
  font-weight: 600;
}

.step-connector {
  flex: 1;
  height: 3px;
  background: #e9ecef;
  margin: 0 1rem;
}

.step-connector.completed {
  background: #48bb78;
}

/* Main Content */
.main-content {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 1rem;
}

.content-wrapper {
  height: calc(100vh - 350px);
  overflow-y: auto;
  padding: 0 1rem;
}

.content-section {
  background: white;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

/* Salary Overview Grid */
.salary-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.overview-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.overview-label {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.overview-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

/* Salary Grid */
.salary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  max-height: calc(100vh - 350px);
  overflow-y: auto;
}

.salary-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e9ecef;
  height: 100%;
}

.salary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.salary-card-header {
  padding: 1.25rem;
  background: #d5ddf1;
  color: #2d3748;
}

.salary-card-body {
  padding: 1.25rem;
}

.salary-detail {
  margin-bottom: 1rem;
}

.salary-detail:last-child {
  margin-bottom: 0;
  padding-top: 0.75rem;
  border-top: 1px dashed #e9ecef;
}

.detail-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.detail-value.earnings {
  color: #38a169;
}

.detail-value.deductions {
  color: #e53e3e;
}

.detail-value.benefits {
  color: #805ad5;
}

.net-salary .detail-value {
  font-size: 1.3rem;
  color: #4776e6;
}

.salary-card-footer {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

/* Action Footer */
.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.action-btn {
  min-width: 180px;
}

/* Dialog Styles */
.employee-details-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  background: #4b6097;
  color: white;
}

.dialog-content {
  padding: 1.5rem;
}

.tab-item {
  text-transform: none;
  font-weight: 500;
}

.detail-list {
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item.total {
  border-top: 2px solid #e9ecef;
  border-bottom: none;
  margin-top: 1rem;
  padding-top: 1rem;
}

.detail-item-label {
  color: #4a5568;
  font-weight: 500;
}

.detail-item-value {
  font-weight: 600;
  color: #2d3748;
}

.detail-item-value.earnings {
  color: #38a169;
}

.detail-item-value.deductions {
  color: #e53e3e;
}

.detail-item-value.benefits {
  color: #805ad5;
}

.sub-section-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.875rem;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.12);
}

.attendance-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.attendance-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.attendance-item.total {
  background: #4776e6;
  color: white;
  grid-column: 1 / -1;
}

.attendance-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #718096;
}

.attendance-item.total .attendance-label {
  color: rgba(255, 255, 255, 0.9);
}

.attendance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.attendance-item.total .attendance-value {
  color: white;
}

.salary-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.5rem;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.summary-value.earnings {
  color: #38a169;
}

.summary-value.deductions {
  color: #e53e3e;
}

.summary-value.benefits {
  color: #805ad5;
}

.summary-value.net {
  color: #4776e6;
  font-size: 1.5rem;
}

.dialog-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e9ecef;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .salary-grid,
  .salary-overview-grid {
    grid-template-columns: 1fr;
  }

  .salary-summary {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .action-footer {
    flex-direction: column;
    padding: 1rem;
  }

  .action-btn,
  .cancel-btn {
    width: 100%;
  }
}
/* new */
.expanded-content-wrapper {
  background-color: #f8f9fa;
  padding: 0 !important;
}

.expanded-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
  background-color: #f8f9fa;
}

.details-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-label {
  font-size: 13px;
  color: #6c757d;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.success-text {
  color: #28a745 !important;
}

.warning-text {
  color: #ffc107 !important;
}

.info-text {
  color: #17a2b8 !important;
}

.error-text {
  color: #dc3545 !important;
}

.purple-text {
  color: #9c27b0 !important;
}

.total-row {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #e0e0e0;
}

.total-label {
  font-weight: 600;
  color: #2c3e50 !important;
}

.total-value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50 !important;
}
</style>

<template>
  <div class="payroll-dashboard">
    <div class="header-banner">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </button>
        <div class="title-section">
          <h1 class="main-title">
            <v-icon size="32" class="title-icon">mdi-account-cash</v-icon>
            Payroll Summary
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

        <div class="step completed">
          <div class="step-icon">
            <span>2</span>
          </div>
          <div class="step-label">Salary Calculation</div>
        </div>
        <div class="step-connector"></div>

        <div class="step active">
          <div class="step-icon">
            <span>3</span>
          </div>
          <div class="step-label">Review</div>
        </div>
      </div>
    </div>
    <LoadingState
      v-if="isLoading"
      title="Fetching Data..."
      message="Please wait while we load your records."
      :showProgress="true"
      :progress="60"
    />
    <!-- Main Content -->
    <div v-else class="main-content">
      <div class="content-wrapper">
        <div class="content-grid">
          <!-- Left Side - Summary -->
          <div class="content-section">
            <h3 class="section-title">Payroll Review</h3>

            <!-- Total Earnings -->
            <div class="deduction-item">
              <div class="deduction-info">
                <h4 class="deduction-name">Total Earnings</h4>
              </div>
              <div class="deduction-amount positive">
                ₹{{ totalspaymentTotal?.totalEarnings }}
              </div>
            </div>

            <!-- Total Deductions -->
            <div class="deduction-item">
              <div class="deduction-info">
                <h4 class="deduction-name">Total Deductions</h4>
              </div>
              <div class="deduction-amount deduction">
                ₹{{ totalspaymentTotal?.totalDeductions }}
              </div>
            </div>
            <div class="deduction-item">
              <div class="deduction-info">
                <h4 class="deduction-name">Total Benifits</h4>
              </div>
              <div class="deduction-amount deduction">
                ₹ {{ totalspaymentTotal?.totalBenefits }}
              </div>
            </div>
            <div class="deduction-item">
              <div class="deduction-info">
                <h4 class="deduction-name">Total penalities</h4>
              </div>
              <div class="deduction-amount deduction">
                ₹ {{ totalspaymentTotal?.totalPenalties }}
              </div>
            </div>
            <div class="deduction-item">
              <div class="deduction-info">
                <h4 class="deduction-name">Total TDS</h4>
              </div>
              <div class="deduction-amount deduction">
                ₹ {{ totalspaymentTotal?.totalTDS }}
              </div>
            </div>
            <!-- Net Salary -->
            <div class="total-row net-salary">
              <div class="total-label">Total Net Salary Paid</div>
              <div class="total-amount positive">
                ₹ {{ totalspaymentTotal?.totalNetSalary }}
              </div>
            </div>
          </div>

          <!-- Right Side - Reports (unchanged) -->
          <div class="content-section">
            <h3 class="section-title">Reports</h3>

            <div class="report-list">
              <div class="report-item" @click="downloadReport('payslips')">
                <div class="report-icon">
                  <v-icon color="primary">mdi-file-document-multiple</v-icon>
                </div>
                <div class="report-info">
                  <div class="report-name">Payslips</div>
                </div>
                <ActionButton
                  text="Download"
                  :icon="DownloadIcon"
                  variant="edit"
                  size="sm"
                  @click="handleDownload"
                  class="action-btn edit-btn"
                />
              </div>

              <!-- <div class="report-item" @click="downloadReport('bank')">
                <div class="report-icon">
                  <v-icon color="primary">mdi-bank</v-icon>
                </div>
                <div class="report-info">
                  <div class="report-name">Bank Payment Report</div>
                </div>
                <ActionButton
                  text="Download"
                  :icon="DownloadIcon"
                  variant="edit"
                  size="sm"
                  @click="handleDownload"
                  class="action-btn edit-btn"
                />
              </div> -->

              <!-- PF Report -->
              <div class="report-item" @click="downloadReport('pf')">
                <div class="report-icon">
                  <v-icon color="teal">mdi-clipboard-text</v-icon>
                </div>
                <div class="report-info">
                  <div class="report-name">PF Report</div>
                </div>
                <ActionButton
                  text="Download"
                  :icon="DownloadIcon"
                  variant="edit"
                  size="sm"
                  @click="handleDownloadPF"
                  class="action-btn edit-btn"
                />
              </div>

              <!-- ESI Report -->
              <div class="report-item" @click="downloadReport('esi')">
                <div class="report-icon">
                  <v-icon color="deep-orange">mdi-file-document</v-icon>
                </div>
                <div class="report-info">
                  <div class="report-name">ESI Report</div>
                </div>
                <ActionButton
                  text="Download"
                  :icon="DownloadIcon"
                  variant="edit"
                  size="sm"
                  @click="handleDownloadESI"
                  class="action-btn edit-btn"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Footer -->
    <div class="action-footer">
      <BaseButton
        varient="grey"
        size="md"
        :left-icon="SidebarClose"
        @click="goBack"
        class="ms-2"
      >
        back
      </BaseButton>

      <BaseButton
        variant="primary"
        size="md"
        :left-icon="XCircle"
        @click="handleNext"
        class="ms-2"
      >
        Close
      </BaseButton>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import LoadingState from "@/components/common/states/LoadingState.vue";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import { VIcon } from "vuetify/components";
import { DownloadIcon, SidebarClose, XCircle } from "lucide-vue-next";
import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";

const router = useRouter();
const route = useRoute();
const payrollDate = ref({
  start: route.query.start,
  end: route.query.end,
});
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const totalPayrollData = ref([]);
const totalspaymentTotal = ref();
const selectedEmployees = ref([]);

const isLoading = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

const goBack = () => {
  router.push(
    `/payroll/salary-verification?start=${payrollDate.value.start}&end=${payrollDate.value.end}`,
  );
};

const loadEmployeeData = async () => {
  try {
    isLoading.value = true;
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
    await paymentTotal();
  } catch (error) {
    console.error("❌ Error loading employee data:", error);
    showSnackbar.value = true;
    snackbarMessage.value = `Error loading employee data: ${error.message}`;
    snackbarColor.value = "error";
  } finally {
    isLoading.value = false;
  }
};
const paymentTotal = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    const sumFields = [
      "id",
      "employee.id",
      "attendaceVerification",
      "salaryVerification",
      "ctc",
      "payableDays",
      "netSalary",
      "earnings",
      "deductions",
      "penalties",
      "benefits",
      "startDate",
      "endDate",

      "individualDeduction",
      "salaryArrears",
      "totalEarnings",
      "totalBenefits",
      "tdsAmount",
      "totalPenality",
      "totalOtherDeduction",
      "finalizeDate",
      "employee.assignedUser.UAN",
      "employee.assignedUser.role.name",
      "employee.assignedUser.first_name",
      "employee.branch.state",
      "employee.branch.branchName",
      "employee.assignedUser.ESIAccountNumber",
      "employee.assignedUser.tenant.tenantName",
      "employee.assignedUser.tenant.logo",
      "employee.assignedUser.tenant.companyAddress",
      "employee.department.departmentName",
      "employee.employeeId",
      "employee.assignedUser.designation",
    ];

    const query = [
      ...sumFields.map((f) => `fields[]=${f}`),
      `filter[_and][0][employee][assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      "filter[_and][1][employee][status][_neq]=archived",
      `filter[_and][2][startDate]=${payrollDate.value.start}`,
      `filter[_and][3][endDate]=${payrollDate.value.end}`,
      `filter[_and][4][employee][id][_in]=${selectedEmployees.value.map((e) => e.employee.id).join(",")}`,
      "limit=-1",
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data?.data) {
      for (const item of data.data) {
        if (item.employee?.assignedUser?.tenant?.logo) {
          const logoId = item.employee.assignedUser.tenant.logo;
          const logoUrl = `${import.meta.env.VITE_API_URL}/assets/${logoId}`;
          const logoResponse = await fetch(logoUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const blob = await logoResponse.blob();
          item.tenantLogoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      }
    }

    totalPayrollData.value = data?.data;

    totalspaymentTotal.value = {
      totalEarnings: data?.data?.reduce(
        (sum, item) => sum + Number(item.totalEarnings || 0),
        0,
      ),
      totalDeductions: data?.data?.reduce(
        (sum, item) => sum + Number(item.totalOtherDeduction || 0),
        0,
      ),
      totalBenefits: data?.data?.reduce(
        (sum, item) => sum + Number(item.totalBenefits || 0),
        0,
      ),
      totalTDS: data?.data?.reduce(
        (sum, item) => sum + Number(item.tdsAmount || 0),
        0,
      ),
      totalPenalties: data?.data?.reduce(
        (sum, item) => sum + Number(item.totalPenality || 0),
        0,
      ),
      totalNetSalary: data?.data?.reduce(
        (sum, item) => sum + Number(item.netSalary || 0),
        0,
      ),
    };

    console.log("✅ Employee Totals:", totalspaymentTotal.value);
  } catch (error) {
    console.error("❌ Error fetching employee totals:", error);
  }
};

const handleDownload = () => {
  const doc = new jsPDF();

  // Check if responseData is an array (multiple users) or single user
  const users = Array.isArray(totalPayrollData.value)
    ? totalPayrollData.value
    : [totalPayrollData.value];

  users.forEach((userData, userIndex) => {
    if (userIndex > 0) doc.addPage();

    let currentY = 15;
    const pageHeight = 297;
    const marginBottom = 30;

    const checkPageBreak = (requiredSpace = 20) => {
      if (currentY + requiredSpace > pageHeight - marginBottom) {
        doc.addPage();
        currentY = 15;
        return true;
      }
      return false;
    };

    const drawTableBorder = (x, y, width, height) => {
      doc.setLineWidth(0.3);
      doc.setDrawColor(0, 0, 0);
      doc.rect(x, y, width, height);
    };

    const drawSectionBorder = (x, y, width, height) => {
      doc.setLineWidth(0.5);
      doc.setDrawColor(100, 100, 100);
      doc.rect(x, y, width, height);
    };

    // Company Header Section
    checkPageBreak(35);
    drawSectionBorder(10, currentY, 190, 30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    if (userData.tenantLogoBase64) {
      doc.addImage(userData.tenantLogoBase64, "PNG", 15, currentY + 2, 25, 25);
    }
    doc.text(
      userData.employee.assignedUser.tenant.tenantName || "-",
      105,
      currentY + 10,
      { align: "center" },
    );

    // Company Address
    if (userData.employee.assignedUser.tenant.companyAddress) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const companyAddress = `${userData.employee.assignedUser.tenant.companyAddress.house}, ${userData.employee.assignedUser.tenant.companyAddress.street}, ${userData.employee.assignedUser.tenant.companyAddress.vtc}, ${userData.employee.assignedUser.tenant.companyAddress.dist}, ${userData.employee.assignedUser.tenant.companyAddress.state}, ${userData.employee.assignedUser.tenant.companyAddress.zip}, Landmark: ${userData.employee.assignedUser.tenant.companyAddress.landmark}`;
      doc.text(companyAddress, 105, currentY + 18, { align: "center" });
    }

    // Payslip Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const payPeriod = new Date(userData.endDate).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    doc.text(`PAYSLIP FOR ${payPeriod}`, 105, currentY + 26, {
      align: "center",
    });

    currentY += 40;

    // Employee Details Section
    checkPageBreak(50);
    const employeeDetailsHeight = 45;
    drawSectionBorder(10, currentY, 190, employeeDetailsHeight);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, currentY, 190, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Employee Details", 15, currentY + 6);

    currentY += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const employeeDetails = [
      [
        "Employee Name:",
        userData.employee?.assignedUser?.first_name || "-",
        "Employee ID:",
        userData.employee?.employeeId || "-",
      ],
      [
        "Role:",
        userData.employee?.assignedUser?.role?.name || "-",
        "Designation:",
        userData.employee?.assignedUser?.designation || "-",
      ],
      [
        "PF(UAN) Number:",
        userData.employee?.assignedUser?.UAN || "-",
        "ESI Number:",
        userData.employee?.assignedUser?.ESIAccountNumber || "-",
      ],
      ["Pay Period:", payPeriod, "Payable Days:", userData.payableDays || "-"],
    ];

    employeeDetails.forEach((row, index) => {
      const rowY = currentY + index * 8;
      drawTableBorder(10, rowY - 2, 95, 8);
      drawTableBorder(105, rowY - 2, 95, 8);
      doc.setFont("helvetica", "bold");
      doc.text(String(row[0] ?? ""), 12, rowY + 3);
      doc.text(String(row[2] ?? ""), 107, rowY + 3);
      doc.setFont("helvetica", "normal");
      doc.text(String(row[1] ?? ""), 50, rowY + 3);
      doc.text(String(row[3] ?? ""), 145, rowY + 3);
    });

    currentY += 40;

    // Salary Details Section
    checkPageBreak(80);
    const salaryStartY = currentY;

    // Left Column - Earnings
    const leftColX = 10;
    const leftColWidth = 92;
    let leftY = currentY;

    doc.setFillColor(230, 230, 230);
    doc.rect(leftColX, leftY, leftColWidth, 8, "F");
    drawTableBorder(leftColX, leftY, leftColWidth, 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Earnings", leftColX + 3, leftY + 6);
    leftY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    let earningsTotal = 0;

    // Regular Earnings
    if (userData.earnings) {
      Object.entries(userData.earnings).forEach(([key, value]) => {
        const amount = Math.round(Number(value || 0));
        earningsTotal += amount;

        drawTableBorder(leftColX, leftY, leftColWidth, 7);
        drawTableBorder(leftColX, leftY, 60, 7);
        drawTableBorder(leftColX + 60, leftY, 32, 7);

        doc.text(key, leftColX + 2, leftY + 5);
        doc.text(String(amount), leftColX + leftColWidth - 2, leftY + 5, {
          align: "right",
        });
        leftY += 7;
      });
    }

    // Salary Arrears
    if (
      userData.salaryArrears &&
      Object.keys(userData.salaryArrears).length > 0
    ) {
      doc.setFillColor(245, 245, 245);
      doc.rect(leftColX, leftY, leftColWidth, 6, "F");
      drawTableBorder(leftColX, leftY, leftColWidth, 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Salary Arrears", leftColX + 3, leftY + 4);
      leftY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      Object.entries(userData.salaryArrears).forEach(([key, value]) => {
        if (typeof value === "object") {
          Object.entries(value).forEach(([innerKey, innerValue]) => {
            const amount = Math.round(Number(innerValue || 0));
            earningsTotal += amount;

            drawTableBorder(leftColX, leftY, leftColWidth, 7);
            drawTableBorder(leftColX, leftY, 60, 7);
            drawTableBorder(leftColX + 60, leftY, 32, 7);

            doc.text(innerKey, leftColX + 2, leftY + 5);
            doc.text(`${amount}`, leftColX + leftColWidth - 2, leftY + 5, {
              align: "right",
            });
            leftY += 7;
          });
        }
      });
    }

    // Benefits
    let benefitsTotal = 0;
    if (userData.benefits && Object.keys(userData.benefits).length > 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(leftColX, leftY, leftColWidth, 6, "F");
      drawTableBorder(leftColX, leftY, leftColWidth, 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Benefits", leftColX + 3, leftY + 4);
      leftY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      Object.entries(userData.benefits).forEach(([key, value]) => {
        const amount = Math.round(Number(value || 0));
        benefitsTotal += amount;

        drawTableBorder(leftColX, leftY, leftColWidth, 7);
        drawTableBorder(leftColX, leftY, 60, 7);
        drawTableBorder(leftColX + 60, leftY, 32, 7);

        doc.text(key, leftColX + 2, leftY + 5);
        doc.text(String(amount), leftColX + leftColWidth - 2, leftY + 5, {
          align: "right",
        });
        leftY += 7;
      });
    }

    // Total Earnings
    doc.setFillColor(220, 220, 220);
    doc.rect(leftColX, leftY, leftColWidth, 8, "F");
    drawTableBorder(leftColX, leftY, leftColWidth, 8);
    drawTableBorder(leftColX, leftY, 60, 8);
    drawTableBorder(leftColX + 60, leftY, 32, 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total Earnings", leftColX + 2, leftY + 6);
    doc.text(
      String(Math.round(earningsTotal + benefitsTotal)),
      leftColX + leftColWidth - 2,
      leftY + 6,
      { align: "right" },
    );

    // Right Column - Deductions
    const rightColX = 108;
    const rightColWidth = 92;
    let rightY = salaryStartY;
    doc.setFillColor(230, 230, 230);
    doc.rect(rightColX, rightY, rightColWidth, 8, "F");
    drawTableBorder(rightColX, rightY, rightColWidth, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Deductions", rightColX + 3, rightY + 6);
    rightY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let deductionsTotal = 0;

    const handleDeductions = (data, label) => {
      if (data && Object.keys(data).length > 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(rightColX, rightY, rightColWidth, 6, "F");
        drawTableBorder(rightColX, rightY, rightColWidth, 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(label, rightColX + 3, rightY + 4);
        rightY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        Object.entries(data).forEach(([key, value]) => {
          const amount = Math.round(Number(value || 0));
          deductionsTotal += amount;

          drawTableBorder(rightColX, rightY, rightColWidth, 7);
          drawTableBorder(rightColX, rightY, 60, 7);
          drawTableBorder(rightColX + 60, rightY, 32, 7);

          doc.text(key, rightColX + 2, rightY + 5);
          doc.text(String(amount), rightColX + rightColWidth - 2, rightY + 5, {
            align: "right",
          });
          rightY += 7;
        });
      }
    };

    handleDeductions(userData.deductions, "Deductions");
    handleDeductions(userData.penalties, "Penalties");
    handleDeductions(userData.otherDeduction, "Other Deductions");

    // Total Deductions
    doc.setFillColor(220, 220, 220);
    doc.rect(rightColX, rightY, rightColWidth, 8, "F");
    drawTableBorder(rightColX, rightY, rightColWidth, 8);
    drawTableBorder(rightColX, rightY, 60, 8);
    drawTableBorder(rightColX + 60, rightY, 32, 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total Deductions", rightColX + 2, rightY + 6);
    doc.text(
      String(Math.round(deductionsTotal)),
      rightColX + rightColWidth - 2,
      rightY + 6,
      { align: "right" },
    );

    // Net Salary
    currentY = Math.max(leftY, rightY) + 15;
    checkPageBreak(20);
    const netSalary = Math.round(Number(userData.netSalary) || 0);
    drawSectionBorder(10, currentY, 190, 15);
    doc.setFillColor(240, 248, 255);
    doc.rect(10, currentY, 190, 15, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Net Salary (in words):", 12, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(String(netSalary), 198, currentY + 6, { align: "right" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "This is a computer-generated document and does not require a signature.",
      105,
      285,
      { align: "center" },
    );
  });

  doc.save("payslip.pdf`");
};

const generateExcelWorkbook = async (data, totals) => {
  if (!data || data.length === 0) return null;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("PF_Data");

  const headers = [
    "EmployeeId",
    "Name",
    "Role",
    "Designation",
    // "Branch",
    "Department",
    // "State",
    "PF Account No",
    "EmployerPF",
    "EmployeePF",
    "FinalizeDate",
  ];

  worksheet.addRow(headers);

  // Add data rows
  data.forEach((item) => {
    worksheet.addRow([
      item.employee?.employeeId || "",
      item.employee?.assignedUser?.first_name || "",
      item.employee?.assignedUser?.role?.name || "",
      item.employee?.assignedUser?.designation || "",
      // item.employee?.branch?.branchName || "",
      item.employee?.department?.departmentName || "",
      // item.employee?.branch?.state || "",
      item.employee?.assignedUser?.PFAccountNumber || "",
      item.deductions?.EmployerPF || 0,
      item.deductions?.EmployeePF || 0,
      item.finalizeDate || "",
    ]);
  });

  // Column widths
  worksheet.columns.forEach((col, i) => {
    col.width = [15, 25, 20, 20, 25, 25, 20, 20, 15, 15, 20][i];
  });

  // Apply styling and alignment
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: rowNumber === 1 ? "center" : "left",
      };
      cell.font = {
        bold: rowNumber === 1 || rowNumber === worksheet.rowCount,
        size: rowNumber === 1 ? 12 : 11,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });
  });

  worksheet.getRow(1).height = 40;

  return workbook;
};

const generateESIWorkbook = async (data, totals) => {
  if (!data || data.length === 0) return null;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ESI_Data");

  const headers = [
    "EmployeeId",
    "Name",
    "Role",
    "Designation",
    "Department",
    "ESI Number",
    "EmployerESI",
    "EmployeeESI",
    "FinalizeDate",
  ];

  worksheet.addRow(headers);

  // Add data rows
  data.forEach((item) => {
    worksheet.addRow([
      item.employee?.employeeId || "",
      item.employee?.assignedUser?.first_name || "",
      item.employee?.assignedUser?.role?.name || "",
      item.employee?.assignedUser?.designation || "",
      item.employee?.department?.departmentName || "",
      item.employee?.assignedUser?.ESINumber || "", // replace with actual field
      item.deductions?.EmployerESI || 0,
      item.deductions?.EmployeeESI || 0,
      item.finalizeDate || "",
    ]);
  });

  // Column widths
  worksheet.columns.forEach((col, i) => {
    col.width = [15, 25, 20, 20, 25, 25, 20, 20, 20][i];
  });

  // Styling and alignment
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: rowNumber === 1 ? "center" : "left",
      };
      cell.font = {
        bold: rowNumber === 1 || rowNumber === worksheet.rowCount,
        size: rowNumber === 1 ? 12 : 11,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });
  });

  worksheet.getRow(1).height = 40;

  return workbook;
};

const downloadWorkbook = async (workbook, filename = "PF_Data") => {
  if (!workbook) return;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleDownloadPF = async () => {
  if (!totalPayrollData.value.length) {
    console.warn("No data available to download.");
    return;
  }

  const workbook = await generateExcelWorkbook(
    totalPayrollData.value,
    totalspaymentTotal.value,
  );
  await downloadWorkbook(workbook, "PF_Report");
};
const handleDownloadESI = async () => {
  if (!totalPayrollData.value.length) {
    console.warn("No data available to download.");
    return;
  }

  const workbook = await generateESIWorkbook(
    totalPayrollData.value,
    totalspaymentTotal.value,
  );
  await downloadWorkbook(workbook, "ESI_Report");
};

const handleNext = () => {
  showSnackbar.value = true;
  snackbarMessage.value = "Proceeding to next step...";
  router.push("/payroll/management");
};

const downloadReport = (type) => {
  showSnackbar.value = true;
  snackbarMessage.value = `Downloading ${type} report...`;
  snackbarColor.value = "info";
};
onMounted(async () => {
  await loadEmployeeData();
});
</script>

<style scoped>
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
  padding: 26px;
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

/* Deductions */
.deduction-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
}

.deduction-item:last-of-type {
  border-bottom: none;
}

.deduction-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
}

.deduction-info p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.deduction-amount {
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  min-height: calc(100vh - 8rem);
}

.total-row.net-salary {
  margin: 16px -24px -24px -24px;
  padding: 20px 24px;
  border-radius: 0 0 12px 12px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
}

.total-amount.deduction {
  color: #dc2626;
}

.total-amount.positive {
  color: #059669;
}

/* Reports */
.report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-item:hover {
  background: #e2e3e3;
  border-color: #3b82f6;
}

.report-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
}

.report-info {
  flex: 1;
}

.report-name {
  font-weight: 500;
  color: #374151;
}

.report-action {
  color: #6b7280;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  gap: 16px;
}

.loading-text {
  color: #6b7280;
  font-size: 16px;
}

/* Footer */
.action-footer {
  background: white;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.cancel-btn,
.action-btn {
  border-radius: 10px;
  text-transform: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stepper {
    padding: 0 16px;
  }

  .step-connector {
    width: 60px;
  }

  .subtitle-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
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

.section-title {
  font-weight: 600;
  color: #0554d3; /* modern dark blue-gray */
  font-size: 1.5rem;
  margin: 20px 0 12px;
  padding-bottom: 6px;
  position: relative;
  letter-spacing: 0.3px;
}

/* Decorative underline */
.section-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px; /* small accent line */
  height: 3px;
  border-radius: 2px;
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
  gap: 1.5rem;
  margin-top: 2rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.summary-item {
  text-align: center;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.summary-label {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 0.4rem;
  font-weight: 500;
}

.summary-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
}

.summary-value.earnings {
  color: #16a34a; /* modern green */
}

.summary-value.deductions {
  color: #dc2626; /* modern red */
}

.summary-value.benefits {
  color: #7c3aed; /* purple */
}

.summary-value.net {
  color: #2563eb; /* blue */
  font-size: 1.6rem;
  font-weight: 800;
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
</style>

<template>
  <div class="generate-report-container">
    <!-- Modern Header -->
    <v-toolbar flat class="header-toolbar px-4" height="64">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium">Generate Report</span>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <v-btn
          color="white"
          style="background-color: black !important"
          prepend-icon="mdi-check"
          @click="generateReport"
          elevation="0"
        >
          Generate
        </v-btn>
      </div>
    </v-toolbar>

    <div class="d-flex layout-container">
      <!-- Modern Content Area -->
      <div class="content-area pa-8">
        <v-form ref="form">
          <div class="form-grid">
            <div class="form-group">
              <v-select
                v-model="reportType"
                label="Report Type"
                :items="reportTypeOptions"
                variant="outlined"
                hide-details="auto"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Report Type is required']"
              ></v-select>
            </div>

            <!-- <div class="form-group">
              <v-select
                v-model="selectedBranch"
                :items="branchOptions"
                label="Select Branch"
                variant="outlined"
                hide-details="auto"
                item-title="title"
                item-value="value"
                return-object
                density="comfortable"
                class="mb-4"
                :loading="loadingBranches"
                :rules="[(v) => !!v || 'Branch is required']"
              ></v-select>
            </div> -->

            <!-- <div class="form-group">
              <v-select
                v-model="selectedDepartment"
                :items="departmentOptions"
                multiple
                chips
                label="Select Department"
                variant="outlined"
                hide-details="auto"
                item-title="title"
                item-value="value"
                return-object
                density="comfortable"
                class="mb-4"
                :loading="loadingDepartments"
                :rules="[(v) => !!v || 'Department is required']"
              ></v-select>
            </div> -->

            <div class="form-group">
              <v-select
                v-model="selectedState"
                :items="stateOptions"
                item-title="title"
                item-value="value"
                label="Select State"
                variant="outlined"
                hide-details="auto"
                density="comfortable"
                class="mb-4"
              ></v-select>
            </div>

            <div class="form-group">
              <v-text-field
                label="Date"
                v-model="duration"
                type="month"
                variant="outlined"
                hide-details="auto"
                density="comfortable"
                class="mb-4"
                :disabled="payrollAttendanceCycle"
              ></v-text-field>
            </div>

            <!-- <div class="form-group">
              <v-select
                v-model="format"
                :items="formatOptions"
                label="Format"
                variant="outlined"
                hide-details="auto"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Format is required']"
              ></v-select>
            </div> -->

            <!-- <div class="checkbox-row">
              <v-checkbox
                v-model="payrollAttendanceCycle"
                label="Payroll Attendance Cycle"
                hide-details="auto"
                @update:model-value="handlePayrollCycleChange"
              >
              </v-checkbox>
            </div> -->

            <div
              v-if="payrollAttendanceCycle && attendanceCycleDates"
              density="comfortable"
              class="mb-4"
            >
              Using payroll cycle:
              {{
                formatDuration(
                  attendanceCycleDates.startDate,
                  attendanceCycleDates.endDate,
                )
              }}
            </div>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';

import { defineEmits } from "vue";

const emit = defineEmits(["closePopup"]);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const reportTypeOptions = [
  "Labour Welfare Fund",
  "Annual Return Form",
  "ESI Report",
  "PF Report",
  "ESI Chellan Report",
  // "PF Chellan Report",
  "PF_ECR Report",
  "salaryTDS Report",
  // "Bank Report",

  // "Consolidate Report",

  // 'SalaryBreakdown Report'
];

const selectedState = ref(null);

const stateOptions = [
  { title: "All States", value: null },
  { title: "Delhi", value: "Delhi" },
  { title: "Maharashtra", value: "Maharashtra" },
  { title: "Karnataka", value: "Karnataka" },
  { title: "Tamil Nadu", value: "Tamil Nadu" },
];

const branchOptions = ref();
const departmentOptions = ref();
const formatOptions = ["Pdf", "Excel"];
const reportType = ref(null);
const selectedBranch = ref([]);
const selectedDepartment = ref([]);
const duration = ref();
const format = ref(null);
const payrollAttendanceCycle = ref(false);
const loadingBranches = ref(false);
const generatingReport = ref(false);
const loadingDepartments = ref(false);
const refreshingReports = ref(false);
const attendanceCycleDates = ref(null);
const loadingAttendanceCycle = ref(false);

const cancelPopup = () => {
  emit("closePopup");
};
let startDate, endDate;
const date = () => {
  if (payrollAttendanceCycle.value && attendanceCycleDates.value) {
    startDate = attendanceCycleDates.value.startDate;
    endDate = attendanceCycleDates.value.endDate;
  } else {
    const dates = getMonthDates(duration.value);
    startDate = dates.startDate;
    endDate = dates.endDate;
  }
};

const aggregateBranch = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["aggregate[count]"]: "id",
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }
    const countData = await countResponse.json();
    return countData.data[0]?.count?.id ?? 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};
const generateReport = async () => {
  if (reportType.value == "Labour Welfare Fund") {
    await lwf();
  }
  if (reportType.value == "PF_ECR Report") {
    await pf();
  }
  if (reportType.value == "salaryTDS Report") {
    await salaryDetails();
  }
  if (reportType.value == "Annual Return Form") {
    await annualForm();
  }

  if (reportType.value == "PF Report") {
    await pFData();
  }
  if (reportType.value == "ESI Report") {
    await eSIData();
  }
  if (reportType.value == "Bank Report") {
    await generate();
  }
  if (reportType.value == "Consolidate Report") {
    await generate();
  }
  if (reportType.value == "SalaryBreakdown Report") {
    await generate();
  }
  if (reportType.value === "ESI Chellan Report") {
    await eSIChellanData();
  }

  if (reportType.value === "PF Chellan Report") {
    await pFChellanData();
  }
};
const adminData = async () => {
  try {
    const params = {
      ["filter[_and][0][_and][0][assignedUser][tenant][tenantId][_eq]"]:
        tenantId,
      ["filter[_and][1][assignedUser][role][name][_eq]"]: "Admin",

      fields: ["assignedUser.role.name", "assignedUser.first_name"],

      limit: -1,
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
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch  data");
    }
    const data = await response.json();

    if (data.data.length === 0) {
      alert("No reports Available");
      return;
    }
    return data.data.map((item) => ({
      name: item.assignedUser?.first_name || "",
    }));
  } catch (error) {
    console.error("failed to get the data", error);
  }
};
const getStateTaxRules = async () => {
  try {
    if (!selectedState.value) {
      alert("Please select a specific state .");
      return;
    }

    const params = {
      ["filter[state][_eq]"]: selectedState.value,
      fields: ["stateTaxRules"],
      limit: -1,
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
      `${import.meta.env.VITE_API_URL}/items/tax?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch state tax rules");
    }

    const data = await response.json();
    return data.data.map((item) => ({
      deduction: item.stateTaxRules?.LWF?.Deduction || [],
      returns: item.stateTaxRules?.LWF?.Returns || [],
      lwf: item.stateTaxRules?.LWF || [],
    }));
  } catch (error) {
    console.error("Error fetching state tax rules:", error);
  }
};

const lwf = async () => {
  try {
    const [year, month] = duration.value.split("-");

    const branchCount = await aggregateBranch();
    const admin = await adminData();
    const rules = await getStateTaxRules();
    console.log("rules", rules);

    const returnMonths = rules?.[0]?.returns || [];

    const isReturnMonth = returnMonths.find((returnDate) => {
      const [, returnMonth] = returnDate.split("-");
      return returnMonth === month;
    });

    const prevMonth = String(Number(month) - 1 || 12).padStart(2, "0");

    const deductionMonths = rules?.[0]?.deduction || [];

    const isDeductionMonth = deductionMonths.find((deductionDate) => {
      const [, deductionMonth] = deductionDate.split("-");
      return deductionMonth === prevMonth;
    });

    const employerlwf = rules?.[0]?.lwf.EmployerLWF || [];
    const employeelwf = rules?.[0]?.lwf.EmployeeLWF || [];

    if (!isReturnMonth) {
      alert("LWF return month will not available for this month.");
      return;
    }

    const params = {
      // ["filter[_or][0][_and][0][month(finalizeDate)][_eq]"]: month,
      // ["filter[_or][0][_and][1][year(finalizeDate)][_eq]"]: year,
      ["filter[_or][1][_and][0][month(endDate)][_eq]"]: month,
      ["filter[_or][1][_and][1][year(endDate)][_eq]"]: year,
      ...(selectedState.value
        ? {
            ["filter[_and][0][_and][2][employee][branch][state][_eq]"]:
              selectedState.value,
          }
        : {}),
      ...(selectedBranch.value?.value !== "__all__"
        ? {
            ["filter[_and][0][_and][2][employee][assignedBranch][branch_id][_eq]"]:
              selectedBranch.value?.value,
          }
        : {}),
      // ["filter[_and][0][_and][3][employee][assignedDepartment][department_id][id][_in]"]:
      //   selectedDepartment.value.map(b => b.value).join(","),
      ["filter[_and][0][_and][4][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",
      fields: [
        "tenant.tenantName",
        "employee.assignedBranch.branch_id.id",
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
        "deductions",
      ],
      limit: -1,
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
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    if (data.data.length === 0) {
      alert("No reports Available");
      return;
    }

    // Process LWF totals from same dataset
    let employerLwfSum = 0;
    let employeeLwfSum = 0;

    for (const [index, item] of data.data.entries()) {
      const employerLwf = item.deductions?.["Employer Lwf"] || 0;
      const employeeLwf = item.deductions?.["Employee Lwf"] || 0;

      console.log(
        `Item ${index + 1} - Employer Lwf:`,
        employerLwf,
        ", Employee Lwf:",
        employeeLwf,
      );

      employerLwfSum += employerLwf;
      employeeLwfSum += employeeLwf;
    }

    console.log("Total Employer Lwf Sum:", employerLwfSum);
    console.log("Total Employee Lwf Sum:", employeeLwfSum);

    const lwfCount = { employerLwfSum, employeeLwfSum };

    transformedlwf(
      data,
      branchCount,
      lwfCount,
      admin,
      isReturnMonth,
      isDeductionMonth,
      employerlwf,
      employeelwf,
    );
  } catch (error) {
    console.error("Failed to get the data", error);
  }
};
const eSIData = async () => {
  try {
    console.log("Duration value:", duration);
    const [year, month] = duration.value.split("-");
    console.log("Parsed year:", year, "month:", month);

    const params = {
      // ["filter[_or][0][_and][0][month(finalizeDate)][_eq]"]: month,
      // ["filter[_or][0][_and][1][year(finalizeDate)][_eq]"]: year,
      ["filter[_or][1][_and][0][month(endDate)][_eq]"]: month,
      ["filter[_or][1][_and][1][year(endDate)][_eq]"]: year,
      ...(selectedState.value
        ? {
            ["filter[_and][0][_and][2][employee][branch][state][_eq]"]:
              selectedState.value,
          }
        : {}),
      ...(selectedBranch.value?.value !== "__all__"
        ? {
            ["filter[_and][0][_and][2][employee][assignedBranch][branch_id][_eq]"]:
              selectedBranch.value?.value,
          }
        : {}),
      // ["filter[_and][0][_and][3][employee][assignedDepartment][department_id][id][_in]"]:
      //   selectedDepartment.value.map(b => b.value).join(","),
      ["filter[_and][0][_and][3][employee][assignedUser][ESIAccountNumber][_nempty]"]: true,
      ["filter[_and][0][_and][4][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",
      fields: [
        "id",
        "deductions",
        "finalizeDate",
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
        "employee.branch.state",
        "employee.branch.branchName",
        "employee.assignedUser.ESIAccountNumber",
        "employee.department.departmentName",
        "employee.employeeId",
        "employee.assignedUser.designation",
        "endDate",
        "startDate",
      ],
      limit: -1,
    };

    const queryString = Object.keys(params)
      .map((key) =>
        key === "fields"
          ? params[key].map((f) => `fields[]=${f}`).join("&")
          : `${key}=${params[key]}`,
      )
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch ESI data");

    const { data } = await response.json();
    if (!data || data.length === 0) {
      alert("No ESI data available for the selected duration.");
      return;
    }
    downloadAsExcel(data, `ESIData_${year}_${month}`);
  } catch (error) {
    console.error("Error fetching ESI data:", error);
  }
};
const eSIChellanData = async () => {
  try {
    console.log("Duration value:", duration);
    const [year, month] = duration.value.split("-");
    console.log("Parsed year:", year, "month:", month);

    const params = {
      ["filter[_or][0][_and][0][month(finalizeDate)][_eq]"]: month,
      ["filter[_or][0][_and][1][year(finalizeDate)][_eq]"]: year,
      ["filter[_or][1][_and][0][month(endDate)][_eq]"]: month,
      ["filter[_or][1][_and][1][year(endDate)][_eq]"]: year,
      ...(selectedState.value
        ? {
            ["filter[_and][0][_and][2][employee][branch][state][_eq]"]:
              selectedState.value,
          }
        : {}),
      ...(selectedBranch.value?.value !== "__all__"
        ? {
            ["filter[_and][0][_and][2][employee][assignedBranch][branch_id][_eq]"]:
              selectedBranch.value?.value,
          }
        : {}),

      // ["filter[_and][0][_and][3][employee][assignedDepartment][department_id][id][_in]"]:
      //   selectedDepartment.value.map(b => b.value).join(","),
      ["filter[_and][0][_and][3][employee][assignedUser][ESIAccountNumber][_nempty]"]: true,
      ["filter[_and][0][_and][4][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",
      fields: [
        "deductions",
        "finalizeDate",
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
        "employee.branch.state",
        "employee.branch.branchName",
        "employee.assignedUser.ESIAccountNumber",
        "employee.department.departmentName",
        "employee.employeeId",
        "payableDays",
        "netSalary",
        "employee.assignedUser.dateOfLeaving",
        "employee.assignedUser.designation",
        "endDate",
        "startDate",
      ],
      limit: -1,
    };

    const queryString = Object.keys(params)
      .map((key) =>
        key === "fields"
          ? params[key].map((f) => `fields[]=${f}`).join("&")
          : `${key}=${params[key]}`,
      )
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch ESI data");

    const { data } = await response.json();

    if (!data || data.length === 0) {
      alert("No ESI data available for the selected duration.");
      return;
    }

    downloadAsExcelChellan(data, `ESIData_${year}_${month}`);
  } catch (error) {
    console.error("Error fetching ESI data:", error);
  }
};

const downloadAsExcel = async (data, filename = "ESI_Data") => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ESI_Data');

  const headers = [
    "EmployeeId",
    "Name",
    "Role",
    "Designation",
    "Branch",
    "Department",
    "State",
    "ESI Account No",
    "EmployerESI",
    "EmployeeESI",
    "FinalizeDate",
  ];

  const rows = data.map((item) => [
    item.employee?.employeeId || "",
    item.employee?.assignedUser?.first_name || "",
    item.employee?.assignedUser?.role?.name || "",
    item.employee?.assignedUser?.designation || "",
    item.employee?.branch?.branchName || "",
    item.employee?.department?.departmentName || "",
    item.employee?.branch?.state || "",
    item.employee?.assignedUser?.ESIAccountNumber || "",
    item.deductions?.EmployerESI || 0,
    item.deductions?.EmployeeESI || 0,
    item.finalizeDate || "",
  ]);

  // Add headers
  worksheet.addRow(headers);

  // Add data rows
  rows.forEach(row => worksheet.addRow(row));

  // Set column widths
  worksheet.columns = [
    { width: 15 }, // EmployeeId
    { width: 25 }, // Name
    { width: 20 }, // Role
    { width: 20 }, // Designation
    { width: 25 }, // Branch
    { width: 25 }, // Department
    { width: 20 }, // State
    { width: 20 }, // ESI Account No
    { width: 15 }, // EmployerESI
    { width: 15 }, // EmployeeESI
    { width: 20 }, // FinalizeDate
  ];

  // Set header row height
  worksheet.getRow(1).height = 40;

  // Apply styles to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: rowNumber === 1 ? 'center' : 'left',
      };
      cell.font = {
        bold: rowNumber === 1,
        size: rowNumber === 1 ? 12 : 11,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });
  });

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadAsExcelChellan = async (data, filename = "ESIChellan_Data") => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ESIChellan_Data');

  const headers = [
    "ESI Account No",
    "Name",
    "Payable During the Month",
    "Total Monthly Wages",
    "Last Working Day",
  ];

  const rows = data.map((item) => [
    item.employee?.assignedUser?.ESIAccountNumber || "",
    item.employee?.assignedUser?.first_name || "",
    item.payableDays || "",
    item.netSalary || 0,
    item.employee?.assignedUser?.dateOfLeaving || "",
  ]);

  // Add headers
  worksheet.addRow(headers);

  // Add data rows
  rows.forEach(row => worksheet.addRow(row));

  // Set column widths
  worksheet.columns = [
    { width: 20 }, // ESI Account No
    { width: 25 }, // Name
    { width: 20 }, // Payable During the Month
    { width: 20 }, // Total Monthly Wages
    { width: 20 }, // Last Working Day
  ];

  // Set header row height
  worksheet.getRow(1).height = 40;

  // Apply styles to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: rowNumber === 1 ? 'center' : 'left',
      };
      cell.font = {
        bold: rowNumber === 1,
        size: rowNumber === 1 ? 12 : 11,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });
  });

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

const pFData = async () => {
  try {
    console.log("Duration value:", duration);
    const [year, month] = duration.value.split("-");
    console.log("Parsed year:", year, "month:", month);

    const params = {
      // ["filter[_or][0][_and][0][month(finalizeDate)][_eq]"]: month,
      // ["filter[_or][0][_and][1][year(finalizeDate)][_eq]"]: year,
      ["filter[_or][1][_and][0][month(endDate)][_eq]"]: month,
      ["filter[_or][1][_and][1][year(endDate)][_eq]"]: year,
      ...(selectedState.value
        ? {
            ["filter[_and][0][_and][2][employee][branch][state][_eq]"]:
              selectedState.value,
          }
        : {}),

      ...(selectedBranch.value?.value !== "__all__"
        ? {
            ["filter[_and][0][_and][2][employee][assignedBranch][branch_id][_eq]"]:
              selectedBranch.value?.value,
          }
        : {}),
      // ["filter[_and][0][_and][3][employee][assignedDepartment][department_id][id][_in]"]: selectedDepartment.value.map(b => b.value).join(","),
      ["filter[_and][0][_and][3][employee][assignedUser][PFAccountNumber][_nempty]"]: true,
      ["filter[_and][0][_and][4][tenant][tenantId][_eq]"]: tenantId,

      ["filter[_and][1][status][_neq]"]: "archived",
      fields: [
        "id",
        "deductions",
        "finalizeDate",
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
        "employee.branch.state",
        "employee.branch.branchName",
        "employee.assignedUser.PFAccountNumber",
        "employee.department.departmentName",
        "employee.employeeId",
        "employee.assignedUser.designation",
        "endDate",
        "startDate",
      ],
      limit: -1,
    };

    const queryString = Object.keys(params)
      .map((key) =>
        key === "fields"
          ? params[key].map((f) => `fields[]=${f}`).join("&")
          : `${key}=${params[key]}`,
      )
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch PF data");

    const { data } = await response.json();

    if (!data || data.length === 0) {
      alert("No PF data available for the selected duration.");
      return;
    }

    downloadAsExcelPF(data, `PFData_${year}_${month}`);
  } catch (error) {
    console.error("Error fetching PF data:", error);
  }
};

const downloadAsExcelPF = async (data, filename = "PF_Data") => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('PF_Data');

  const headers = [
    "EmployeeId",
    "Name",
    "Role",
    "Designation",
    "Branch",
    "Department",
    "State",
    "PF Account No",
    "EmployerPF",
    "EmployeePF",
    "FinalizeDate",
  ];

  const rows = data.map((item) => [
    item.employee?.employeeId || "",
    item.employee?.assignedUser?.first_name || "",
    item.employee?.assignedUser?.role?.name || "",
    item.employee?.assignedUser?.designation || "",
    item.employee?.branch?.branchName || "",
    item.employee?.department?.departmentName || "",
    item.employee?.branch?.state || "",
    item.employee?.assignedUser?.PFAccountNumber || "",
    item.deductions?.EmployerPF || 0,
    item.deductions?.EmployeePF || 0,
    item.finalizeDate || "",
  ]);

  // Add headers
  worksheet.addRow(headers);

  // Add data rows
  rows.forEach(row => worksheet.addRow(row));

  // Set column widths
  worksheet.columns = [
    { width: 15 }, // EmployeeId
    { width: 25 }, // Name
    { width: 20 }, // Role
    { width: 20 }, // Designation
    { width: 25 }, // Branch
    { width: 25 }, // Department
    { width: 20 }, // State
    { width: 20 }, // PF Account No
    { width: 15 }, // EmployerPF
    { width: 15 }, // EmployeePF
    { width: 20 }, // FinalizeDate
  ];

  // Set header row height
  worksheet.getRow(1).height = 40;

  // Apply styles to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: rowNumber === 1 ? 'center' : 'left',
      };
      cell.font = {
        bold: rowNumber === 1,
        size: rowNumber === 1 ? 12 : 11,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });
  });

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

const pf = async () => {
  try {
    date();
    const [year, month] = duration.value.split("-");

    const params = {
      // ["filter[_or][0][_and][0][month(finalizeDate)][_eq]"]: month,
      // ["filter[_or][0][_and][1][year(finalizeDate)][_eq]"]: year,
      ["filter[_or][1][_and][0][month(endDate)][_eq]"]: month,
      ["filter[_or][1][_and][1][year(endDate)][_eq]"]: year,

      ...(selectedState.value
        ? {
            ["filter[_and][0][_and][2][employee][branch][state][_eq]"]:
              selectedState.value,
          }
        : {}),
      // ["filter[_and][0][_and][3][employee][assignedUser][PFAccountNumber][_nnull]"]: true,
      ["filter[_and][0][_and][4][employee][assignedUser][PFAccountNumber][_nempty]"]: true,

      ["filter[_and][0][_and][5][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",
      fields: [
        "id",
        "employee.assignedUser.UAN",
        "netSalary",
        "deductions",
        "totalEarnings",
        "finalizeDate",
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
        "employee.branch.state",
        "employee.branch.branchName",
        "employee.assignedUser.PFAccountNumber",
        "employee.department.departmentName",
        "employee.employeeId",
        "employee.assignedUser.designation",
        "employee.salaryConfig.employersContributions",
        "endDate",
        "startDate",
      ],
      limit: -1,
    };

    const queryString = Object.keys(params)
      .map((key) =>
        key === "fields"
          ? params[key].map((f) => `fields[]=${f}`).join("&")
          : `${key}=${params[key]}`,
      )
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch payroll data");

    const { data } = await response.json();

    if (!data || data.length === 0) {
      alert("No payroll reports available for the selected duration.");
      return;
    }

    downloadPfFile(data);
  } catch (error) {
    console.error("Failed to get payroll data:", error);
  }
};

const downloadPfFile = async (data, filename = "PF_ECR_Report") => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('PF_ECR_Report');

  const headers = [
    "UAN PF Account No",
    "EmployeeId",
    "Gross Wages",
    "EPF Wages",
    "EPS Wages",
    "EDLI Wages",
    "EPF Contribution Remitted",
    "EPS Contribution Remitted",
    "EPF and EPS Diff Remitted",
  ];

  const rows = data.map((item) => {
    const employerPFOption =
      item.employee?.salaryConfig?.employersContributions?.EmployerPF
        ?.selectedOption;
    let employerPF = 0;

    if (Number(employerPFOption) === 12) {
      employerPF = 15000 * 0.12;
    } else if (Number(employerPFOption) === 1800) {
      employerPF = Math.min(15000 * 0.12, 1800);
    } else {
      employerPF = 0;
    }

    const epsContribution = Math.round(employerPF * 0.6944);
    const pfDifference = Math.round(employerPF * 0.3056);

    return [
      item.employee?.assignedUser?.PFAccountNumber || "",
      item.employee?.assignedUser?.first_name || "",
      15000,
      15000,
      15000,
      15000,
      employerPF,
      epsContribution,
      pfDifference,
    ];
  });

  // Add headers
  worksheet.addRow(headers);

  // Add data rows
  rows.forEach(row => worksheet.addRow(row));

  // Set column widths
  worksheet.columns = [
    { width: 20 }, // UAN PF Account No
    { width: 25 }, // EmployeeId
    { width: 15 }, // Gross Wages
    { width: 15 }, // EPF Wages
    { width: 15 }, // EPS Wages
    { width: 15 }, // EDLI Wages
    { width: 20 }, // EPF Contribution Remitted
    { width: 20 }, // EPS Contribution Remitted
    { width: 20 }, // EPF and EPS Diff Remitted
  ];

  // Set header row height
  worksheet.getRow(1).height = 40;

  // Apply styles to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: rowNumber === 1 ? 'center' : 'left',
      };
      cell.font = {
        bold: rowNumber === 1,
        size: rowNumber === 1 ? 12 : 11,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });
  });

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
const annualForm = async () => {
  try {
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new jsPDF("p", "mm", "a4");

    // EXACT HEADER DESIGN FROM YOUR IMAGE
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FORM-U", 105, 20, { align: "center" });
    doc.text("COMBINED ANNUAL RETURN", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("[See Rule 24(9-C)]", 105, 38, { align: "center" });
    doc.text(
      "of Karnataka Shops and Commercial Establishment Rules, 1963) in lieu of",
      105,
      45,
      { align: "center" },
    );

    doc.setFontSize(8);
    doc.text(
      "1. Form XXV Rules 82(2) of Contract Labour (Regulation & Abolition ) Karnataka Rules, 1974.",
      15,
      52,
    );
    doc.text(
      "2. Form III Rule 22(4) Karnataka Minimum Wages Rules, 1958.",
      15,
      57,
    );
    doc.text(
      "3. Form XX Rule 20(1) of Karnataka Payment of Wages Rules, 1963.",
      15,
      62,
    );
    doc.text(
      "4.Form 20 Rule 16 of Karnataka Maternity Benefits Rules, 1963.",
      15,
      67,
    );

    // SECTION 1: Name of Establishment (EXACT LAYOUT)
    doc.rect(15, 75, 180, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("1.Name of the Establishment", 20, 85);

    doc.rect(15, 90, 180, 15);
    doc.setFont("helvetica", "normal");
    doc.text(hardcodedData.establishmentName, 20, 100);

    // SECTION 2: Full Postal Address (EXACT LAYOUT)
    doc.rect(15, 105, 180, 15);
    doc.setFont("helvetica", "bold");
    doc.text("2.Full Postal Address:", 20, 115);

    doc.rect(15, 120, 180, 20);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(hardcodedData.postalAddress, 170);
    doc.text(addressLines, 20, 130);

    // ESTABLISHMENT DETAILS TABLE (EXACT LAYOUT FROM IMAGE)
    const startY = 145;

    // Left column headers
    doc.rect(15, startY, 90, 12);
    doc.setFont("helvetica", "bold");
    doc.text("1. Establishment", 20, startY + 8);

    doc.rect(15, startY + 12, 90, 12);
    doc.text("Location", 20, startY + 20);

    doc.rect(15, startY + 24, 90, 12);
    doc.text("Address", 20, startY + 32);

    doc.rect(15, startY + 36, 90, 12);
    doc.text("2. Registered office/ Head office", 20, startY + 44);

    doc.rect(15, startY + 48, 90, 12);
    doc.text("Location", 20, startY + 56);

    doc.rect(15, startY + 60, 90, 12);
    doc.text("Address", 20, startY + 68);

    // Right column data
    doc.rect(105, startY, 60, 12);
    doc.setFont("helvetica", "normal");
    doc.text(hardcodedData.establishment, 110, startY + 8);

    doc.rect(105, startY + 12, 60, 12);
    doc.text(hardcodedData.establishmentLocation, 110, startY + 20);

    doc.rect(105, startY + 24, 60, 12);
    doc.text(hardcodedData.establishmentAddress, 110, startY + 32);

    doc.rect(105, startY + 36, 60, 12);
    doc.text(hardcodedData.headOffice, 110, startY + 44);

    doc.rect(105, startY + 48, 60, 12);
    doc.text(hardcodedData.headOfficeLocation, 110, startY + 56);

    doc.rect(105, startY + 60, 60, 12);
    doc.text(hardcodedData.headOfficeAddress, 110, startY + 68);

    // Contact details (right side)
    doc.rect(165, startY, 30, 12);
    doc.setFont("helvetica", "bold");
    doc.text("Telephone", 170, startY + 8);

    doc.rect(165, startY + 12, 30, 12);
    doc.text("Fax", 170, startY + 20);

    doc.rect(165, startY + 24, 30, 12);
    doc.text("e-mail", 170, startY + 32);

    // Contact values
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(hardcodedData.telephone, 170, startY + 44);
    doc.text(hardcodedData.fax, 170, startY + 56);
    doc.text(hardcodedData.email, 170, startY + 68);

    // PAGE 2: EMPLOYMENT PARTICULARS (EXACT TABLE FROM IMAGE)
    doc.addPage();

    // Section 3: Employer Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.rect(15, 20, 180, 12);
    doc.text(
      "3. Name & residential address of the Employer or a person responsible for Conduct & control of Business",
      20,
      28,
    );

    // Employer details table
    const empY = 35;
    doc.rect(15, empY, 45, 25);
    doc.text("Name", 20, empY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(hardcodedData.employerName, 20, empY + 15);

    doc.rect(60, empY, 45, 25);
    doc.setFont("helvetica", "bold");
    doc.text("Designation", 65, empY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(hardcodedData.employerDesignation, 65, empY + 15);

    doc.rect(105, empY, 45, 25);
    doc.setFont("helvetica", "bold");
    doc.text("Residential Address", 110, empY + 8);
    doc.setFont("helvetica", "normal");
    const empAddr = doc.splitTextToSize(hardcodedData.employerAddress, 40);
    doc.text(empAddr, 110, empY + 15);

    doc.rect(150, empY, 45, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Telephone", 155, empY + 5);
    doc.text("Office", 155, empY + 10);
    doc.text("Residence", 155, empY + 15);
    doc.text("Mobile", 155, empY + 20);
    doc.text("e-mail", 155, empY + 25);

    // Section 4: Manager Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.rect(15, 65, 180, 12);
    doc.text(
      "4. Name and Residential Address of the Manager/Authorized Signatory:",
      20,
      73,
    );

    // Manager details table (same structure as employer)
    const mgY = 80;
    doc.rect(15, mgY, 45, 25);
    doc.text("Name", 20, mgY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(hardcodedData.managerName, 20, mgY + 15);

    doc.rect(60, mgY, 45, 25);
    doc.setFont("helvetica", "bold");
    doc.text("Designation", 65, mgY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(hardcodedData.managerDesignation, 65, mgY + 15);

    doc.rect(105, mgY, 45, 25);
    doc.setFont("helvetica", "bold");
    doc.text("Residential Address", 110, mgY + 8);
    doc.setFont("helvetica", "normal");
    const mgAddr = doc.splitTextToSize(hardcodedData.managerAddress, 40);
    doc.text(mgAddr, 110, mgY + 15);

    doc.rect(150, mgY, 45, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Telephone", 155, mgY + 5);
    doc.text("Office", 155, mgY + 10);
    doc.text("Residence", 155, mgY + 15);
    doc.text("Mobil", 155, mgY + 20);
    doc.text("e-mail", 155, mgY + 25);

    // Section 5: Nature of Business
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.rect(15, 110, 180, 12);
    doc.text("5. Nature of business of the Establishment:", 20, 118);

    doc.rect(15, 122, 180, 20);
    doc.setFont("helvetica", "normal");
    const businessLines = doc.splitTextToSize(
      hardcodedData.businessNature,
      170,
    );
    doc.text(businessLines, 20, 130);

    // EXACT EMPLOYMENT TABLE FROM YOUR IMAGE
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.rect(15, 150, 180, 12);
    doc.text("6. A) Particulars of Employment", 20, 158);

    // Employment table headers (EXACT LAYOUT)
    const tableY = 165;
    const colWidths = [25, 25, 25, 25, 25, 25, 50];
    const headers = [
      "No. of\npersons on roll\nas on\n1-1-200\n(Year\ncommencement\ndate)",
      "No. of\npersons on\nRoll as on\n31-12-200\n(Year end\ndate)",
      "No. of days\nestablishment\nworked",
      "No. of Man days\nworked during the\nyear",
      "No. of man hours\nworked including O.T.\nduring the year",
      "Total amount of\nsalary/wages paid\nincluding O.T. wages\nand allowances (in Rs",
    ];

    // Draw employment table exactly like the image
    doc.autoTable({
      startY: tableY,
      head: [["", ...headers]],
      body: [
        [
          "Men",
          hardcodedData.employment.men.startRoll,
          hardcodedData.employment.men.endRoll,
          hardcodedData.employment.men.daysWorked,
          hardcodedData.employment.men.manDays,
          hardcodedData.employment.men.manHours,
          hardcodedData.employment.men.totalSalary,
        ],
        [
          "Women",
          hardcodedData.employment.women.startRoll,
          hardcodedData.employment.women.endRoll,
          hardcodedData.employment.women.daysWorked,
          hardcodedData.employment.women.manDays,
          hardcodedData.employment.women.manHours,
          hardcodedData.employment.women.totalSalary,
        ],
        [
          "Total",
          hardcodedData.employment.men.startRoll +
            hardcodedData.employment.women.startRoll,
          hardcodedData.employment.men.endRoll +
            hardcodedData.employment.women.endRoll,
          hardcodedData.employment.men.daysWorked +
            hardcodedData.employment.women.daysWorked,
          hardcodedData.employment.men.manDays +
            hardcodedData.employment.women.manDays,
          hardcodedData.employment.men.manHours +
            hardcodedData.employment.women.manHours,
          hardcodedData.employment.men.totalSalary +
            hardcodedData.employment.women.totalSalary,
        ],
      ],
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold" },
      },
    });

    // PAGE 3: CONTINUATION (EXACT LAYOUT)
    doc.addPage();

    // Employment cessation table (EXACT FROM IMAGE)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("6. B) No. of employees whose employment is ceased:", 20, 25);

    doc.autoTable({
      startY: 35,
      head: [
        [
          "No. of employees discharged/ dismissed/\nterminated/ retrenched/ resigned/ retired during\nthe year",
          "Amount of\ncompensation paid",
          "No. of employees\nsuspended during\nthe year",
          "Amount of\nsubsistence\nallowance paid",
        ],
      ],
      body: [
        ["1", "2", "3", "4"],
        [
          hardcodedData.cessation.discharged,
          hardcodedData.cessation.compensation,
          hardcodedData.cessation.suspended,
          hardcodedData.cessation.subsistence,
        ],
      ],
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fontStyle: "bold",
      },
    });

    // Earned Leave section (EXACT LAYOUT)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      "7. Particulars of Earned Leave with Wages",
      20,
      doc.lastAutoTable.finalY + 20,
    );

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [
        [
          "Category of\nemployees",
          "Total no. of persons\nemployed",
          "No. of employees\neligible for earned\nleave",
          "No. of employees\navailed\\Granted\nearned leave",
          "No. of employees paid\nwages/salary in lieu of\nearned leave.",
        ],
      ],
      body: [
        ["", "1", "2", "3", "4", "5"],
        [
          "i) Men",
          hardcodedData.earnedLeave.men.totalEmployed,
          hardcodedData.earnedLeave.men.eligible,
          hardcodedData.earnedLeave.men.availed,
          hardcodedData.earnedLeave.men.paidWages,
        ],
        [
          "ii)Women",
          hardcodedData.earnedLeave.women.totalEmployed,
          hardcodedData.earnedLeave.women.eligible,
          hardcodedData.earnedLeave.women.availed,
          hardcodedData.earnedLeave.women.paidWages,
        ],
      ],
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "left" },
      },
    });

    // PAGE 4: WELFARE & MATERNITY (EXACT LAYOUT)
    doc.addPage();

    // Welfare measures (EXACT FROM IMAGE)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("8. Whether the following Welfare measures are provided?", 20, 25);

    const welfareY = 35;
    doc.setFont("helvetica", "normal");
    doc.text("1. Canteen", 20, welfareY);
    doc.text("2. Creches", 20, welfareY + 10);
    doc.text("3. Shelters, Rest rooms and Lunch rooms", 20, welfareY + 20);
    doc.text("4. Transport facility", 20, welfareY + 30);

    // Maternity Benefits (EXACT LAYOUT)
    doc.setFont("helvetica", "bold");
    doc.text("9. Maternity Benefit :", 20, welfareY + 50);
    doc.text("A) Particulars of Maternity Benefits:", 20, welfareY + 60);

    // Maternity table (EXACT FROM IMAGE)
    const matY = welfareY + 70;
    doc.rect(15, matY, 120, 12);
    doc.setFontSize(9);
    doc.text(
      "1. Total No. of women workers who worked for a period of 160 days in the last 12 months",
      20,
      matY + 8,
    );
    doc.text("immediately preceding the date of delivery", 20, matY + 15);

    doc.rect(135, matY, 60, 12);
    doc.text(
      hardcodedData.maternity.totalWomen160Days.toString(),
      140,
      matY + 8,
    );

    doc.rect(15, matY + 12, 120, 12);
    doc.text(
      "2. No. of women workers discharged/dismissed in the last 12 months",
      20,
      matY + 20,
    );

    doc.rect(135, matY + 12, 60, 12);
    doc.text(hardcodedData.maternity.discharged.toString(), 140, matY + 20);

    doc.rect(15, matY + 24, 120, 12);
    doc.text(
      "3. No. of women workers for whom pre-natal confinement and post-natal confinement is",
      20,
      matY + 32,
    );
    doc.text("provided by the employer at free of cost.", 20, matY + 39);

    doc.rect(135, matY + 24, 60, 12);
    doc.text(
      hardcodedData.maternity.confinementProvided.toString(),
      140,
      matY + 32,
    );

    doc.rect(15, matY + 36, 120, 12);
    doc.text("4. No. of women workers died", 20, matY + 44);

    doc.rect(135, matY + 36, 30, 12);
    doc.setFont("helvetica", "bold");
    doc.text("a. Before delivery", 140, matY + 44);

    doc.rect(165, matY + 36, 30, 12);
    doc.text("b. After delivery", 170, matY + 44);

    // Deductions section (EXACT LAYOUT)
    doc.setFont("helvetica", "bold");
    doc.text(
      "10. Particulars of deductions made from salary(wages)",
      20,
      matY + 80,
    );

    doc.autoTable({
      startY: matY + 90,
      head: [
        ["", "No of employees involved", "Total amount of deductions made"],
      ],
      body: [
        [
          "i) Fines",
          hardcodedData.deductions.fines.employees,
          hardcodedData.deductions.fines.amount,
        ],
        [
          "ii) Damages/ Loss",
          hardcodedData.deductions.damages.employees,
          hardcodedData.deductions.damages.amount,
        ],
        [
          "iii) Breach of contract",
          hardcodedData.deductions.breach.employees,
          hardcodedData.deductions.breach.amount,
        ],
        [
          "iv) Others",
          hardcodedData.deductions.others.employees,
          hardcodedData.deductions.others.amount,
        ],
        [
          "Total",
          hardcodedData.deductions.fines.employees +
            hardcodedData.deductions.damages.employees +
            hardcodedData.deductions.breach.employees +
            hardcodedData.deductions.others.employees,
          hardcodedData.deductions.fines.amount +
            hardcodedData.deductions.damages.amount +
            hardcodedData.deductions.breach.amount +
            hardcodedData.deductions.others.amount,
        ],
      ],
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "left" },
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        "Generated on: " + new Date().toLocaleDateString(),
        15,
        doc.internal.pageSize.height - 10,
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10,
      );
    }

    doc.save("Karnataka_Annual_Return_Form_U.pdf");
    console.log("Karnataka Annual Return PDF generated successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
};
const hardcodedData = {
  establishmentName: "ABC Manufacturing Industries Pvt Ltd",
  postalAddress:
    "123, Industrial Area, Phase-2, Bangalore - 560058, Karnataka, India",
  establishment: "ABC Manufacturing Industries",
  establishmentLocation: "Bangalore, Karnataka",
  establishmentAddress: "123, Industrial Area, Phase-2",
  headOffice: "ABC Corporate Office",
  headOfficeLocation: "Mumbai, Maharashtra",
  headOfficeAddress: "456, Business District, Mumbai - 400001",
  telephone: "+91-80-12345678",
  fax: "+91-80-12345679",
  email: "info@abcmanufacturing.com",
  employerName: "Rajesh Kumar Sharma",
  employerDesignation: "Managing Director",
  employerAddress: "789, Residential Complex, Koramangala, Bangalore - 560034",
  employerPhoneOffice: "+91-80-11111111",
  employerPhoneResidence: "+91-80-22222222",
  employerMobile: "+91-9876543210",
  employerEmail: "rajesh.sharma@abcmanufacturing.com",
  managerName: "Priya Nair",
  managerDesignation: "HR Manager",
  managerAddress: "321, Garden City, Whitefield, Bangalore - 560066",
  managerPhoneOffice: "+91-80-33333333",
  managerPhoneResidence: "+91-80-44444444",
  managerMobile: "+91-9876543211",
  managerEmail: "priya.nair@abcmanufacturing.com",
  businessNature:
    "Manufacturing of Electronic Components, Assembly of Consumer Electronics, Export of Electronic Goods",
  employment: {
    men: {
      startRoll: 150,
      endRoll: 165,
      daysWorked: 300,
      manDays: 49500,
      manHours: 396000,
      totalSalary: 12500000,
    },
    women: {
      startRoll: 85,
      endRoll: 92,
      daysWorked: 300,
      manDays: 27600,
      manHours: 220800,
      totalSalary: 6900000,
    },
  },
  cessation: {
    discharged: 8,
    compensation: 450000,
    suspended: 2,
    subsistence: 25000,
  },
  welfare: { canteen: true, creches: true, shelters: true, transport: true },
  earnedLeave: {
    men: { totalEmployed: 165, eligible: 158, availed: 142, paidWages: 850000 },
    women: { totalEmployed: 92, eligible: 88, availed: 79, paidWages: 475000 },
  },
  maternity: {
    totalWomen160Days: 12,
    discharged: 1,
    confinementProvided: 11,
    womenDied: { beforeDelivery: 0, afterDelivery: 0 },
    leaveDetails: {
      miscarriage: { applied: 2, sanctioned: 2, rejected: 0 },
      illness: { applied: 5, sanctioned: 4, rejected: 1 },
    },
    benefits: {
      confinement: { claims: 11, sanctioned: 11, rejected: 0, amount: 165000 },
      miscarriage: { claims: 2, sanctioned: 2, rejected: 0, amount: 20000 },
      illness: { claims: 4, sanctioned: 4, rejected: 0, amount: 40000 },
      medical: { claims: 8, sanctioned: 7, rejected: 1, amount: 105000 },
    },
  },
  deductions: {
    fines: { employees: 5, amount: 15000 },
    damages: { employees: 3, amount: 25000 },
    breach: { employees: 2, amount: 50000 },
    others: { employees: 1, amount: 5000 },
  },
};

const salaryDetails = async () => {
  try {
    date();

    const params = {
      ["filter[_and][0][_and][0][startDate][_between][0]"]: startDate,
      ["filter[_and][0][_and][0][startDate][_between][1]"]: endDate,
      ["filter[_and][0][_and][1][employee][assignedBranch][branch_id][id][_eq]"]:
        selectedBranch.value.value,
      ["filter[_and][0][_and][2][employee][assignedDepartment][department_id][id][_eq]"]:
        selectedDepartment.value.value,
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",

      fields: [
        "employee.assignedUser.UAN",
        "employee.assignedUser.first_name",
        "ctc",
        "payableDays",
      ],

      limit: -1,
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
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payroll data");
    }

    const data = await response.json();

    if (data.data.length === 0) {
      alert("No payroll reports available");
      return;
    }

    downloadsalaryDetails(data.data);
  } catch (error) {
    console.error("Failed to get payroll data", error);
  }
};
const SalaryBreakdown = async () => {
  try {
    date();

    const params = {
      ["filter[_and][0][_and][0][startDate][_between][0]"]: startDate,
      ["filter[_and][0][_and][0][startDate][_between][1]"]: endDate,
      ["filter[_and][0][_and][1][employee][assignedBranch][branch_id][id][_eq]"]:
        selectedBranch.value.value,
      ["filter[_and][0][_and][2][employee][assignedDepartment][department_id][id][_eq]"]:
        selectedDepartment.value.value,
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",

      fields: [
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
        "employee.employeeId",
        "ctc",
        "basicSalary",
        "basicPay",
        "earnings",
        "employersContribution",
        "totalEarnings",
        "employeeDeduction",
        "deduction",
        "netSalary",
        "employeradmin",
        "totalDeductions",
      ],

      limit: -1,
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
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payroll data");
    }

    const data = await response.json();

    if (data.data.length === 0) {
      alert("No payroll reports available");
      return;
    }

    downloadsalaryDetails(data.data);
  } catch (error) {
    console.error("Failed to get payroll data", error);
  }
};

const transformedlwf = (
  data,
  branchCount,
  lwfCount,
  admin,
  returns,
  deduction,
  employerlwf,
  employeelwf,
) => {
  console.log("employeelwf", employeelwf);
  const processedData = data.data.map((item) => ({
    CompanyName: item.tenant.tenantName,
    BranchCount: branchCount,
    Employerlwf: employerlwf,
    Employeelwf: employeelwf,
    AdminName: admin.map((user) => user.name).join(", "),
    EmployeesCount: Array.isArray(item.employee) ? item.employee.length : 1,
    EmployerLwf: lwfCount.employerLwfSum,
    EmployeeLwf: lwfCount.employeeLwfSum,
    Returns: returns,
    Deduction: deduction,
  }));
  console.log("processedData", processedData);
  downloadLwf(processedData);
};
const downloadLwf = async (data) => {
  console.log("data", data);
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(
    "STATEMENT OF EMPLOYER'S AND EMPLOYEE'S CONTRIBUTION TO BE SENT BY",
    105,
    12,
    { align: "center" },
  );
  doc.text(`THE EMPLOYER BY 15th ${data[0].Returns}`, 105, 18, {
    align: "center",
  });

  doc.setFontSize(10);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  const consolidatedData = [
    [
      1,
      "Name & Address of the Establishment\nTotal no. of units to be mentioned",
      data[0].CompanyName + ` (Branches: ${data[0].BranchCount})`,
    ],
    [
      2,
      "Name of the Employers",
      [...new Set(data.map((item) => item.AdminName).filter(Boolean))].join(
        ", ",
      ),
    ],
    [
      3,
      `Total No. of the Employees Whose\nName & stand in the Establishment Register as on ${data[0].Deduction}`,
      data
        .reduce(
          (total, item) =>
            total + (Array.isArray(item.employee) ? item.employee.length : 1),
          0,
        )
        .toString(),
    ],

    [
      4,
      `Employees Contribution @ ${data[0].Employeelwf}`,
      data.reduce((sum, item) => parseFloat(item.EmployeeLwf), 0).toFixed(2),
    ],
    [
      5,
      `Employer's Contribution @ ${data[0].Employerlwf}`,
      data.reduce((sum, item) => parseFloat(item.EmployerLwf), 0).toFixed(2),
    ],
    [
      6,
      "Total No. of Employees & Employer's Contribution",
      data
        .reduce(
          (sum, item) =>
            parseFloat(item.EmployeeLwf) + parseFloat(item.EmployerLwf),
          0,
        )
        .toFixed(2),
    ],
    [
      7,
      "Whether the Contribution is sent by\nPayment in favour of the Welfare\nCommissioner, Banglore",
      `Amount: ${data.reduce((sum, item) => parseFloat(item.EmployeeLwf) + parseFloat(item.EmployerLwf), 0).toFixed(2)}\nInterest: \nPayment ID: \nDate: `,
    ],
  ];

  // Prepare table data
  doc.autoTable({
    startY: 50,
    head: [["S.No", "Title", "Description"]],
    body: consolidatedData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
      lineWidth: 0.5,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 },
    },
  });

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "Generated on: " + new Date().toLocaleDateString(),
      15,
      doc.internal.pageSize.height - 10,
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10,
    );
  }

  doc.save("LWF_Report.pdf");
};

const downloadsalaryDetails = async (data) => {
  const epfHeaders = [
    "Sr. No.",
    "UAN",
    "Employee Name",
    "MonthlyCtc",
    "PayableDays",
  ];

  const processedData = data.map((item, index) => ({
    "Sr. No.": index + 1,
    UAN: item.employee.assignedUser.UAN || "",
    "Employee Name": item.employee.assignedUser.first_name || "",
    MonthlyCtc: item.ctc || "0.00",
    PayableDays: item.payableDays || "0.00",
  }));

  if (format.value === "Excel") {
    const worksheet = XLSX.utils.json_to_sheet(processedData);

    worksheet["!cols"] = epfHeaders.map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Salary Wages Contribution",
    );

    const fileBlob = new Blob(
      [XLSX.write(workbook, { type: "array", bookType: "xlsx", raw: true })],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );

    await fileUpload(fileBlob, "xlsx");
  } else if (format.value === "Pdf") {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Salary Wages Contribution Report", 105, 15, { align: "center" });

    doc.autoTable({
      startY: 25,
      head: [epfHeaders],
      body: processedData.map((item) => Object.values(item)),
      theme: "grid",
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        15,
        doc.internal.pageSize.height - 10,
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10,
      );
    }

    const fileBlob = doc.output("blob");

    await fileUpload(fileBlob, "pdf");
  } else {
    alert("Invalid format selected. Please choose either Excel or PDF.");
  }
};

const downloadform = async (data) => {
  let fileBlob;
  let fileType;
  if (format.value === "Pdf") {
    const doc = new jsPDF();

    // Set up document styling to match Form-U
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    // Add header similar to Form-U
    doc.setFillColor(0, 51, 102); // Dark blue background
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("COMBINED ANNUAL RETURN", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("Karnataka Shops and Commercial Establishment Rules", 105, 22, {
      align: "center",
    });

    // Reset text color and font
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    // Prepare consolidated data sections
    const sections = [
      {
        title: "1. Name of the Establishment",
        content: "CompanyName",
      },
      {
        title: "2. Full Postal Address",
        content: "",
      },
      {
        title: "3. Name & Residential Address of Employer",
        content: "",
      },
      {
        title: "5. Nature of Business",
        content: "Not Specified",
      },
      {
        title: "6. Employees Ceased/Terminated",
        content: "",
      },
    ];

    // Add sections to PDF
    let yPosition = 50;
    sections.forEach((section, index) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 15, yPosition);

      doc.setFont("helvetica", "normal");
      doc.text(section.content, 15, yPosition + 7, { maxWidth: 180 });

      yPosition += 30;
    });

    // Add welfare measures section
    const welfareMeasures = [
      "Canteen",
      "Creches",
      "Shelters, Rest Rooms and Lunch Rooms",
      "Transport Facility",
    ];

    doc.setFont("helvetica", "bold");
    doc.text("8. Welfare Measures Provided:", 15, yPosition);

    doc.setFont("helvetica", "normal");
    welfareMeasures.forEach((measure, index) => {
      doc.text(`□ ${measure}`, 15, yPosition + 7 + index * 6);
    });

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "Generated on: " + new Date().toLocaleDateString(),
      15,
      doc.internal.pageSize.height - 20,
    );
    doc.text(
      "Certified that the information is correct to the best of my knowledge",
      15,
      doc.internal.pageSize.height - 10,
    );

    // Save the PDF
    doc.save("LWF_Annual_Return.pdf");
  }
  await fileUpload(fileBlob, fileType);
};

const fileUpload = async (fileBlob, fileType) => {
  const formData = new FormData();
  formData.append("file", fileBlob, `attendance_report.${fileType}`);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("failed to post file");
    }
    const responseData = await response.json();
    const fileId = responseData.data;
    await handleSave(fileId);
  } catch (error) {
    console.error("fetticng attendance data");
  }
};

const payload = (fileId) => {
  return {
    startDate: startDate.value,
    endDate: endDate.value,
    reportType: reportType.value,
    collectionName: "PayrollVerfication",
    fileFormat: format.value,
    status: "generated",
    generatedFile: fileId.id,
    tenant: { tenantId },
    branch: selectedBranch.value.value,
    department: selectedDepartment.value.value,
  };
};

const handleSave = async (fileId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/export`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload(fileId)),
      },
    );

    if (response.ok) {
      alert("Report generated and exported successfully!");
      emit("closePopup");
    } else {
      throw new Error("Export failed");
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    alert("Failed to export report. Please try again.");
  }
};
const generate = async () => {
  generatingReport.value = true;

  try {
    // Get branch and department IDs
    const branchID =
      selectedBranch.value?.value === "all"
        ? null
        : selectedBranch.value?.value;
    const departmentID =
      selectedDepartment.value?.value === "all"
        ? null
        : selectedDepartment.value?.value;

    // Get dates based on whether payroll attendance cycle is enabled
    let startDate, endDate;

    if (payrollAttendanceCycle.value && attendanceCycleDates.value) {
      // Use attendance cycle dates if checkbox is checked and dates are available
      startDate = attendanceCycleDates.value.startDate;
      endDate = attendanceCycleDates.value.endDate;
    } else {
      // Otherwise use manually selected dates
      const dates = getMonthDates(duration.value);
      startDate = dates.startDate;
      endDate = dates.endDate;
    }

    if (!startDate || !endDate) {
      throw new Error("Invalid duration selected");
    }

    const collectionName = getCollectionName(reportType.value);

    // Prepare payload for API
    const payload = {
      status: "requested",
      startDate: startDate,
      endDate: endDate,
      collectionName: collectionName,
      branch: branchID,
      generateAutomatically: false,
      department: departmentID,
      reportType: reportType.value,
      fileFormat: format.value,
      tenant: { tenantId },
    };

    console.log("Sending export request with payload:", payload);

    // Make API call to generate report
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/export`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate report");
    }

    const data = await response.json();
    const exportId = data.data.id;
    console.log("Export response:", exportId);

    // Fetch Payroll Verification Data
    let reportFields = [];
    if (reportType.value === "ESI Report") {
      reportFields = ["employerESI", "employeeESI"];
    } else if (reportType.value === "PF Report") {
      reportFields = ["employerPF", "employeePF"];
    }
    let payrollData;
    let params = {};
    if (reportType.value === "Consolidate Report") {
      // First API call for aggregate data
      const aggregateParams = {
        ["filter[_and][0][_and][0][startDate][_between][0]"]: startDate,
        ["filter[_and][0][_and][0][startDate][_between][1]"]: endDate,
        ["filter[_and][0][_and][1][employee][assignedBranch][branch_id][id][_eq]"]:
          branchID,
        ["filter[_and][0][_and][2][employee][assignedDepartment][department_id][id][_eq]"]:
          departmentID,
        ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
        ["filter[_and][1][status][_neq]"]: "archived",
        limit: -1,
        ["aggregate[sum]"]: [
          "ctc",
          "laborWelfareFund",
          "employerlwf",
          "employeelwf",
          "professionalTax",
          "employeeESI",
          "employeePF",
          "employerESI",
          "employerPF",
          "payableAmount",
          "pending",
          "loanRepayment",
          "payableDays",
          "BasicPay",
        ],
        ["aggregate[count]"]: "id",
        "sort[]": "sort",
        page: 1,
      };

      const aggregateQueryString = Object.keys(aggregateParams)
        .map((key) =>
          Array.isArray(aggregateParams[key])
            ? aggregateParams[key]
                .map((value) => `${key}=${encodeURIComponent(value)}`)
                .join("&")
            : `${key}=${encodeURIComponent(aggregateParams[key])}`,
        )
        .join("&");

      const aggregateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/payrollVerification?${aggregateQueryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!aggregateResponse.ok) {
        const aggregateError = await aggregateResponse.ok;
        throw new Error(
          aggregateError.message || "Failed to fetch aggregate data",
        );
      }

      const aggregateData = await aggregateResponse.json();

      // Second API call for field data
      const fieldsParams = {
        ["filter[_and][0][_and][0][startDate][_between][0]"]: startDate,
        ["filter[_and][0][_and][0][startDate][_between][1]"]: endDate,
        ["filter[_and][0][_and][1][employee][assignedBranch][branch_id][id][_eq]"]:
          branchID,
        ["filter[_and][0][_and][2][employee][assignedDepartment][department_id][id][_eq]"]:
          departmentID,
        ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
        ["filter[_and][1][status][_neq]"]: "archived",
        limit: -1,
        "fields[]": [
          "employee.assignedUser.designation",
          "employee.assignedDepartment.department_id.departmentName",
          "employee.assignedBranch.branch_id.branchName",
        ],
        "sort[]": "sort",
        page: 1,
      };

      const fieldsQueryString = Object.keys(fieldsParams)
        .map((key) =>
          Array.isArray(fieldsParams[key])
            ? fieldsParams[key]
                .map((value) => `${key}=${encodeURIComponent(value)}`)
                .join("&")
            : `${key}=${encodeURIComponent(fieldsParams[key])}`,
        )
        .join("&");

      const fieldsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/payrollVerification?${fieldsQueryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!fieldsResponse.ok) {
        const fieldsError = await fieldsResponse.json();
        throw new Error(fieldsError.message || "Failed to fetch fields data");
      }

      const fieldsData = await fieldsResponse.json();

      // Combine the two responses
      payrollData = {
        aggregateData: aggregateData.data,
        fieldsData: fieldsData.data,
      };
      if (
        (!payrollData.aggregateData ||
          payrollData.aggregateData.length === 0) &&
        (!payrollData.fieldsData || payrollData.fieldsData.length === 0)
      ) {
        alert("No data found in that url");
        return;
      }
    } else if (reportType.value === "Bank Report") {
      params = {
        ["filter[_and][0][_and][0][tenantBankDetails][tenantId][_eq]"]:
          tenantId,
        "fields[]": [
          "tenantBankDetails.tenantName",
          "tenantBankDetails.accountNumber",
          "tenantBankDetails.bankName",
          "tenantBankDetails.ifscCode",
        ],
        "sort[]": "sort",
      };

      const queryString = Object.keys(params)
        .map((key) =>
          Array.isArray(params[key])
            ? params[key]
                .map((value) => `${key}=${encodeURIComponent(value)}`)
                .join("&")
            : `${key}=${encodeURIComponent(params[key])}`,
        )
        .join("&");

      const payrollResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/payment?${queryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!payrollResponse.ok) {
        const payrollError = await payrollResponse.json();
        throw new Error(payrollError.message || "Failed to fetch payroll data");
      }

      payrollData = await payrollResponse.json();
      if (!payrollData.data || payrollData.data.length === 0) {
        alert("No data found in that url");
        return;
      }
    } else {
      params = {
        ["filter[_and][0][_and][0][startDate][_between][0]"]: startDate,
        ["filter[_and][0][_and][0][startDate][_between][1]"]: endDate,
        ["filter[_and][0][_and][1][employee][assignedBranch][branch_id][id][_eq]"]:
          branchID,
        ["filter[_and][0][_and][2][employee][assignedDepartment][department_id][id][_eq]"]:
          departmentID,
        ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
        ["filter[_and][1][status][_neq]"]: "archived",
        limit: 25,
        "fields[]": [
          "employee.employeeId",
          "employee.assignedUser.first_name",
          ...reportFields,
          "employee.assignedUser.designation",
          "employee.assignedDepartment.department_id.departmentName",
          "employee.assignedBranch.branch_id.branchName",
          "employee.assignedUser.phone",
        ],
        "sort[]": "sort",
        page: 1,
      };

      const queryString = Object.keys(params)
        .map((key) =>
          Array.isArray(params[key])
            ? params[key]
                .map((value) => `${key}=${encodeURIComponent(value)}`)
                .join("&")
            : `${key}=${encodeURIComponent(params[key])}`,
        )
        .join("&");

      const payrollResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!payrollResponse.ok) {
        const payrollError = await payrollResponse.json();
        throw new Error(payrollError.message || "Failed to fetch payroll data");
      }

      payrollData = await payrollResponse.json();
      if (!payrollData.data || payrollData.data.length === 0) {
        alert("No data found in that url");
        return;
      }
    }

    // In your generateReport function, make sure you're passing the selected fileFormat to downloadFile
    downloadFile(
      payrollData,
      format.value,
      exportId,
      reportFields,
      reportType.value,
      startDate,
      endDate,
    );

    alert("Report generation requested successfully", "success");
  } catch (error) {
    console.error("Error generating report:", error);
    alert("Error generating report: " + error.message, "error");
  } finally {
    generatingReport.value = false;
  }
};

const downloadFile = (
  payrollData,
  fileFormat,
  exportId,
  reportFields,
  reportType,
  startDate,
  endDate,
) => {
  if (fileFormat === "Pdf" && reportType === "Consolidate Report") {
    alert("Pdf will not supported for Consolidate Report ");
    return;
  }
  if (fileFormat === "Excel" && reportType === "Bank Report") {
    const columns = [
      { header: "Company Name", dataKey: "tenantName" },
      { header: "Account Number", dataKey: "accountNumber" },
      { header: "Bank Name", dataKey: "bankName" },
      { header: "IFSC Code", dataKey: "ifscCode" },
      { header: "Payment Date", dataKey: "payment" },
    ];

    const filteredRows = payrollData.data.map((item) => ({
      tenantName: item.tenantBankDetails?.tenantName || "",
      accountNumber: item.tenantBankDetails?.accountNumber || "",
      bankName: item.tenantBankDetails?.bankName || "",
      ifscCode: item.tenantBankDetails?.ifscCode || "",
    }));

    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [columns.map((col) => col.header)], {
      origin: "A1",
    });
    XLSX.utils.sheet_add_json(ws, filteredRows, {
      origin: "A2",
      skipHeader: true,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bank Report");

    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    const fileName = `Bank_Report_${formattedStartDate}_to_${formattedEndDate}.xlsx`;

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const xlsxBlob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    uploadFile(
      new File([xlsxBlob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      exportId,
    );
  } else if (fileFormat === "Pdf" && reportType === "Bank Report") {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text("Bank Report", doc.internal.pageSize.width / 2, 15, {
      align: "center",
    });

    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    doc.setFontSize(10);
    doc.text(
      `Period: ${formattedStartDate} to ${formattedEndDate}`,
      doc.internal.pageSize.width / 2,
      25,
      { align: "center" },
    );

    const columns = [
      { header: "Tenant Name", dataKey: "tenantName" },
      { header: "Account Number", dataKey: "accountNumber" },
      { header: "Bank Name", dataKey: "bankName" },
      { header: "IFSC Code", dataKey: "ifscCode" },
    ];

    const filteredRows = payrollData.data.map((item) => ({
      tenantName: item.tenantBankDetails?.tenantName || "",
      accountNumber: item.tenantBankDetails?.accountNumber || "",
      bankName: item.tenantBankDetails?.bankName || "",
      ifscCode: item.tenantBankDetails?.ifscCode || "",
    }));

    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: filteredRows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: "auto" },
      },
      tableWidth: "wrap",
    });

    const pdfBlob = doc.output("blob");
    const fileName = `Bank_Report_${formattedStartDate}_to_${formattedEndDate}.pdf`;

    uploadFile(
      new File([pdfBlob], fileName, { type: "application/pdf" }),
      exportId,
    );
  } else if (fileFormat === "Pdf" && reportType !== "Bank Report") {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text(`${reportType}`, doc.internal.pageSize.width / 2, 15, {
      align: "center",
    });

    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    doc.setFontSize(10);
    doc.text(
      `Period: ${formattedStartDate} to ${formattedEndDate}`,
      doc.internal.pageSize.width / 2,
      25,
      { align: "center" },
    );

    const columns = [
      { header: "Employee ID", dataKey: "employeeId" },
      { header: "Employee Name", dataKey: "employeeName" },
      { header: "Designation", dataKey: "designation" },
      { header: "Department", dataKey: "department" },
      { header: "Branch", dataKey: "branch" },
      { header: "Start Date", dataKey: "startDate" },
      { header: "End Date", dataKey: "endDate" },
      { header: "Employer PF", dataKey: "employerPF" },
      { header: "Employee PF", dataKey: "employeePF" },
      { header: "Employer ESI", dataKey: "employerESI" },
      { header: "Employee ESI", dataKey: "employeeESI" },
      { header: "Employer LWF", dataKey: "employerlwf" },
      { header: "Employee LWF", dataKey: "employeelwf" },
      { header: "Basic Pay", dataKey: "BasicPay" },
      { header: "CTC", dataKey: "ctc" },
      { header: "Labour Welfare Fund", dataKey: "laborWelfareFund" },
      { header: "Professional Tax", dataKey: "professionalTax" },
      { header: "Loan Repayment", dataKey: "loanRepayment" },
      { header: "Payable Amount", dataKey: "payableAmount" },
      { header: "Payable Days", dataKey: "payableDays" },
      { header: "Penalties", dataKey: "penalties" },
      { header: "Pending", dataKey: "pending" },
    ];

    const filteredColumns = columns.filter(
      (col) =>
        reportFields.length === 0 ||
        reportFields.includes(col.dataKey) ||
        [
          "employeeId",
          "employeeName",
          "designation",
          "department",
          "branch",
        ].includes(col.dataKey),
    );

    const filteredRows = payrollData.data.map((item) => {
      let filteredItem = {
        employeeName: item.employee?.assignedUser?.first_name || "",
        employeeId: item.employee?.employeeId || "",
        designation: item.employee?.assignedUser?.designation || "",
        department:
          item.employee?.assignedDepartment?.[0]?.department_id
            ?.departmentName || "",
        branch: item.employee?.assignedBranch?.[0]?.branch_id?.branchName || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
      };

      if (reportFields.includes("employerPF"))
        filteredItem.employerPF = item.employerPF || "";
      if (reportFields.includes("employeePF"))
        filteredItem.employeePF = item.employeePF || "";
      if (reportFields.includes("employerESI"))
        filteredItem.employerESI = item.employerESI || "";
      if (reportFields.includes("employeeESI"))
        filteredItem.employeeESI = item.employeeESI || "";
      if (reportFields.includes("penalties"))
        filteredItem.penalties = item.penalties || "";
      if (reportFields.includes("pending"))
        filteredItem.pending = item.pending || "";
      if (reportFields.includes("employerlwf"))
        filteredItem.employerlwf = item.employerlwf || "";
      if (reportFields.includes("employeelwf"))
        filteredItem.employeelwf = item.employeelwf || "";
      if (reportFields.includes("BasicPay"))
        filteredItem.BasicPay = item.BasicPay || "";
      if (reportFields.includes("ctc")) filteredItem.ctc = item.ctc || "";
      if (reportFields.includes("laborWelfareFund"))
        filteredItem.laborWelfareFund = item.laborWelfareFund || "";
      if (reportFields.includes("professionalTax"))
        filteredItem.professionalTax = item.professionalTax || "";
      if (reportFields.includes("loanRepayment"))
        filteredItem.loanRepayment = item.loanRepayment || "";
      if (reportFields.includes("payableAmount"))
        filteredItem.payableAmount = item.payableAmount || "";
      if (reportFields.includes("payableDays"))
        filteredItem.payableDays = item.payableDays || "";

      return filteredItem;
    });

    doc.autoTable({
      head: [filteredColumns.map((col) => col.header)],
      body: filteredRows.map((row) =>
        filteredColumns.map((col) => row[col.dataKey]),
      ),
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: "auto" },
      },
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === "body") {
          data.cell.styles.cellWidth = "wrap";
        }
      },
      tableWidth: "wrap",
    });

    const pdfBlob = doc.output("blob");
    const fileName = `${reportType}_${formattedStartDate}_to_${formattedEndDate}.pdf`;

    uploadFile(
      new File([pdfBlob], fileName, { type: "application/pdf" }),
      exportId,
    );
  } else if (fileFormat === "Excel" && reportType !== "Bank Report") {
    const columns = [
      { header: "Staff Count", dataKey: "id" },
      { header: "Employee ID", dataKey: "employeeId" },
      { header: "Employee Name", dataKey: "employeeName" },
      { header: "Designation", dataKey: "designation" },
      { header: "Department", dataKey: "department" },
      { header: "Branch", dataKey: "branch" },
      { header: "Start Date", dataKey: "startDate" },
      { header: "End Date", dataKey: "endDate" },
      { header: "CTC", dataKey: "ctc" },
      { header: "Employer LWF", dataKey: "employerlwf" },
      { header: "Employee LWF", dataKey: "employeelwf" },
      { header: "Professional Tax", dataKey: "professionalTax" },
      { header: "Employer ESI", dataKey: "employerESI" },
      { header: "Employee ESI", dataKey: "employeeESI" },
      { header: "Employer PF", dataKey: "employerPF" },
      { header: "Employee PF", dataKey: "employeePF" },
      { header: "Payable Amount", dataKey: "payableAmount" },
      { header: "Pending", dataKey: "pending" },

      { header: "Loan Repayment", dataKey: "loanRepayment" },
      { header: "Payable Days", dataKey: "payableDays" },
      { header: "BasicPay", dataKey: "BasicPay" },
    ];

    const filteredColumns = columns.filter(
      (col) =>
        (reportType === "Consolidate Report" &&
          !["employeeId", "employeeName"].includes(col.dataKey)) ||
        (reportType !== "Consolidate Report" &&
          (reportFields.length === 0 ||
            reportFields.includes(col.dataKey) ||
            [
              "employeeId",
              "employeeName",
              "designation",
              "department",
              "branch",
            ].includes(col.dataKey))),
    );
    const filteredRows =
      reportType === "Consolidate Report"
        ? [
            {
              branch:
                payrollData.fieldsData[0]?.employee?.assignedBranch?.[0]
                  ?.branch_id?.branchName || "",
              department:
                payrollData.fieldsData[0]?.employee?.assignedDepartment?.[0]
                  ?.department_id?.departmentName || "",
              designation:
                payrollData.fieldsData[0]?.employee?.assignedUser
                  ?.designation || "",
              startDate: item.startDate || "",
              endDate: item.endDate || "",
              ctc: payrollData.aggregateData[0]?.sum?.ctc || 0,

              employerlwf: payrollData.aggregateData[0]?.sum?.employerlwf || 0,
              employeelwf: payrollData.aggregateData[0]?.sum?.employeelwf || 0,
              professionalTax:
                payrollData.aggregateData[0]?.sum?.professionalTax || 0,
              employeeESI: payrollData.aggregateData[0]?.sum?.employeeESI || 0,
              employeePF: payrollData.aggregateData[0]?.sum?.employeePF || 0,
              employerESI: payrollData.aggregateData[0]?.sum?.employerESI || 0,
              employerPF: payrollData.aggregateData[0]?.sum?.employerPF || 0,
              payableAmount:
                payrollData.aggregateData[0]?.sum?.payableAmount || 0,
              pending: payrollData.aggregateData[0]?.sum?.pending || 0,
              loanRepayment:
                payrollData.aggregateData[0]?.sum?.loanRepayment || 0,
              payableDays: payrollData.aggregateData[0]?.sum?.payableDays || 0,
              BasicPay: payrollData.aggregateData[0]?.sum?.BasicPay || 0,
            },
          ]
        : payrollData.data.map((item) => {
            let filteredItem = {
              employeeName: item.employee?.assignedUser?.first_name || "",
              employeeId: item.employee?.employeeId || "",
              designation: item.employee?.assignedUser?.designation || "",
              department:
                item.employee?.assignedDepartment?.[0]?.department_id
                  ?.departmentName || "",
              branch:
                item.employee?.assignedBranch?.[0]?.branch_id?.branchName || "",
              startDate: item.startDate || "",
              endDate: item.endDate || "",
            };

            if (
              reportFields.includes("employerPF") ||
              reportType === "PF Report"
            )
              filteredItem.employerPF = item.employerPF || "";
            if (
              reportFields.includes("employeePF") ||
              reportType === "PF Report"
            )
              filteredItem.employeePF = item.employeePF || "";
            if (
              reportFields.includes("employerESI") ||
              reportType === "ESI Report"
            )
              filteredItem.employerESI = item.employerESI || "";
            if (
              reportFields.includes("employeeESI") ||
              reportType === "ESI Report"
            )
              filteredItem.employeeESI = item.employeeESI || "";
            if (reportFields.includes("penalties"))
              filteredItem.penalties = item.penalties || "";
            if (reportFields.includes("pending"))
              filteredItem.pending = item.pending || "";
            if (
              reportFields.includes("employerlwf") ||
              reportType === "Labour Welfare Fund"
            )
              filteredItem.employerlwf = item.employerlwf || "";
            if (
              reportFields.includes("employeelwf") ||
              reportType === "Labour Welfare Fund"
            )
              filteredItem.employeelwf = item.employeelwf || "";
            if (reportFields.includes("BasicPay"))
              filteredItem.BasicPay = item.BasicPay || "";
            if (reportFields.includes("ctc")) filteredItem.ctc = item.ctc || "";
            if (reportFields.includes("professionalTax"))
              filteredItem.professionalTax = item.professionalTax || "";
            if (reportFields.includes("loanRepayment"))
              filteredItem.loanRepayment = item.loanRepayment || "";
            if (reportFields.includes("payableAmount"))
              filteredItem.payableAmount = item.payableAmount || "";
            if (reportFields.includes("payableDays"))
              filteredItem.payableDays = item.payableDays || "";

            return filteredItem;
          });

    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [filteredColumns.map((col) => col.header)], {
      origin: "A1",
    });
    XLSX.utils.sheet_add_json(ws, filteredRows, {
      origin: "A2",
      skipHeader: true,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);

    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    const fileName = `${reportType}_${formattedStartDate}_to_${formattedEndDate}.xlsx`;

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const xlsxBlob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    uploadFile(
      new File([xlsxBlob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      exportId,
    );
  }
};

const uploadFile = (file, exportId) => {
  const formData = new FormData();
  formData.append("file", file);

  fetch(`${import.meta.env.VITE_API_URL}/files`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok");
    })
    .then((data) => {
      const fileData = data.data;

      return fetch(`${import.meta.env.VITE_API_URL}/items/export/${exportId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generatedFile: fileData.id,
          status: "generated",
        }),
      });
    })
    .then((patchResponse) => {
      if (!patchResponse.ok) {
        throw new Error("Failed to update generatedFile");
      }
      return patchResponse.json();
    })
    .then(() => {
      console.log("Generated file ID patched successfully");
      alert("File uploaded and linked successfully");
      cancelPopup();
    })

    .catch((error) => {
      console.error("Error processing file:", error);
      alert("Error processing file");
    });
};
const fetchBranches = async () => {
  loadingBranches.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,branchName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch branch data");
    }

    const data = await response.json();

    branchOptions.value = [
      { title: "All Branches", value: "__all__" },
      ...data.data.map((branch) => ({
        title: branch.branchName,
        value: branch.id,
      })),
    ];
    selectedBranch.value = { title: "All Branches", value: "__all__" };
  } catch (error) {
    console.error("Error fetching branches:", error);
  } finally {
    loadingBranches.value = false;
  }
};
const fetchDepartments = async () => {
  loadingDepartments.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch department data");
    }

    const data = await response.json();

    departmentOptions.value = [
      { title: "All Departments", value: "__all__" },
      ...data.data.map((department) => ({
        title: department.departmentName,
        value: department.id,
      })),
    ];
    allDepartmentIds.value = data.data.map((dep) => dep.id);
  } catch (error) {
    console.error("Error fetching departments:", error);
  } finally {
    loadingDepartments.value = false;
  }
};

// Get start and end date of the selected month
const getMonthDates = (monthYear) => {
  if (!monthYear || !monthYear.includes("-")) {
    return { startDate: null, endDate: null };
  }

  const [year, month] = monthYear.split("-").map(Number);

  // Create start date (first day of month)
  const startDate = new Date(year, month - 1, 1);

  // Create end date (last day of month)
  const endDate = new Date(year, month, 0);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

watch(selectedDepartment, (val) => {
  if (val.some((v) => v.value === "__all__")) {
    selectedDepartment.value = allDepartmentIds.value.map((id) => ({
      title: "",
      value: id,
    }));
  }
});

const getCollectionName = (reportType) => {
  if (reportType === "Consolidate Report") {
    return "salarySetting";
  }

  return "payrollVerification";
};
onMounted(() => {
  fetchBranches();
  fetchDepartments();
});
</script>

<style scoped>
.generate-report-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.header-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: white;
}

.layout-container {
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background-color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 900px;
}

/* Modern Form Styling */
:deep(.v-field) {
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-field__input) {
  min-height: 44px !important;
  padding: 0 12px !important;
}

:deep(.v-label) {
  font-size: 0.875rem;
  opacity: 0.8;
}

:deep(.v-messages) {
  min-height: 18px;
  font-size: 12px;
  color: rgb(var(--v-theme-error));
}

/* Responsive Design */
@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .content-area {
    padding: 16px;
  }
}
</style>

<template>
  <div class="generate-report-container">
    <!-- Modern Header -->
    <v-toolbar flat class="header-toolbar px-4" height="64">
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-2"
          @click="cancelPopup"
        ></v-btn>
        <v-icon color="primary" class="mr-2">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium">Generate Report</span>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <v-btn
          prepend-icon="mdi-close"
          variant="text"
          color="white"
          style="background-color: black !important"
          class="mr-2"
          @click="cancelPopup"
        >
          Cancel
        </v-btn>
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
          <div class="form-header mb-6">
            <h2 class="text-h6 font-weight-medium">Report Details</h2>
          </div>

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

            <div class="form-group">
              <v-select
                v-model="selectedBranch"
                :items="branchOptions"
                multiple
                chips
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
            </div>

            <div class="form-group">
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

            <div class="form-group">
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
            </div>

            <div class="checkbox-row">
              <v-checkbox
                v-model="payrollAttendanceCycle"
                label="Payroll Attendance Cycle"
                hide-details="auto"
                @update:model-value="handlePayrollCycleChange"
              >
              </v-checkbox>
            </div>

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
import { ref, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { defineEmits } from "vue";

const emit = defineEmits(["closePopup"]);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const reportTypeOptions = [
  "Labour Welfare Fund",
  "EmployeeContribution Report",
  "salaryDetails",
  "Bank Report",
  "ESI Report",
  "PF Report",

  // "Consolidate Report",

  // 'SalaryBreakdown Report'
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

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      ["filter[_and][0][_and][0][startDate][_between][0]"]: startDate,
      ["filter[_and][0][_and][0][startDate][_between][1]"]: endDate,
      ["filter[_and][0][_and][1][employee][assignedBranch][branch_id][id][_eq]"]:
        selectedBranch.value.value,
      ["filter[_and][0][_and][2][employee][assignedDepartment][department_id][id][_eq]"]:
        selectedDepartment.value.value,
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][status][_neq]"]: "archived",
      ["aggregate[count]"]: "id",
      ["aggregate[sum]"]: ["employerlwf", "employeelwf"],
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
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
    return {
      employerLwfSum: countData.data[0]?.sum?.employerlwf,
      employeeLwfSum: countData.data[0]?.sum?.employeelwf,
    };
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
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
  if (reportType.value == "EmployeeContribution Report") {
    await pf();
  }
  if (reportType.value == "salaryDetails") {
    await salaryDetails();
  }
  if (reportType.value == "PF Report") {
    await generate();
  }
  if (reportType.value == "ESI Report") {
    await generate();
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
};
const adminData = async () => {
  try {
    const params = {
      ["filter[_and][0][_and][0][assignedUser][tenant][tenantId][_eq]"]:
        tenantId,
      ["filter[_and][1][assignedUser][role][name][_in]"]: "Admin,Dealer",

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
const lwf = async () => {
  try {
    date();
    const lwfCount = await aggregateCount();
    const branchCount = await aggregateBranch();
    const admin = await adminData();

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
        "tenant.tenantName",
        "employee.assignedBranch.branch_id.id",
        "employee.assignedUser.role.name",
        "employee.assignedUser.first_name",
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
      throw new Error("Failed to fetch  data");
    }
    const data = await response.json();

    if (data.data.length === 0) {
      alert("No reports Available");
      return;
    }

    transformedlwf(data, branchCount, lwfCount, admin);
  } catch (error) {
    console.error("failed to get the data", error);
  }
};
const pf = async () => {
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
        "netSalary",
        "employeePF",
        "employeeESI",
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

    downloadPfFile(data.data);
  } catch (error) {
    console.error("Failed to get payroll data", error);
  }
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

const transformedlwf = (data, branchCount, lwfCount, admin) => {
  const processedData = data.data.map((item) => ({
    CompanyName: item.tenant.tenantName,
    BranchCount: branchCount,

    AdminName: admin.map((user) => user.name).join(", "),
    EmployeesName: item.employee.assignedUser.first_name,
    EmployerLwf: lwfCount.employerLwfSum,
    EmployeeLwf: lwfCount.employeeLwfSum,
  }));
  downloadLwf(processedData);
};
const downloadLwf = async (data) => {
  let fileBlob;
  let fileType;

  if (format.value === "Excel") {
    alert(
      "Excel format is not supported. The report will be generated in PDF format.",
    );
  }

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("STATEMENT OF EMPLOYER'S AND EMPLOYEE'S CONTRIBUTION", 105, 15, {
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
      "Total No. of the Employees Whose\nName & stand in the Establishment",
      [...new Set(data.map((item) => item.EmployeesName))].join(", "),
    ],
    [
      4,
      "Employees Contribution",
      data.reduce((sum, item) => parseFloat(item.EmployeeLwf), 0).toFixed(2),
    ],
    [
      5,
      "Employer's Contribution",
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

  fileBlob = doc.output("blob");
  fileType = "pdf";

  await fileUpload(fileBlob, fileType);
};
const downloadPfFile = async (data) => {
  const epfHeaders = [
    "Sr. No.",
    "UAN",
    "Employee Name",
    "Net Wages",
    "PF Wages",
    "ESI Wages",
    "EDLI Wages",
    "PF & ESI remitted diff",
  ];

  const processedData = data.map((item, index) => ({
    "Sr. No.": index + 1,
    UAN: item.employee.assignedUser.UAN || "",
    "Employee Name": item.employee.assignedUser.first_name || "",
    "Net Wages": item.netSalary || "0.00",
    "PF Wages": item.employeePF || "0.00",
    "ESI Wages": item.employeeESI || "0.00",
    "EDLI Wages": "0.00",
    "PF & ESI remitted diff": (
      parseFloat(item.employeePF || 0) - parseFloat(item.employeeESI || 0)
    ).toFixed(2),
  }));

  if (format.value === "Excel") {
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(processedData);

    // Set column widths
    worksheet["!cols"] = epfHeaders.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Contribution");

    // Generate Excel file
    const fileBlob = new Blob(
      [XLSX.write(workbook, { type: "array", bookType: "xlsx", raw: true })],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );

    // Upload Excel file
    await fileUpload(fileBlob, "xlsx");
  } else if (format.value === "Pdf") {
    alert("this will not support in pdf format so it will downloaded in excel");
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(processedData);

    // Set column widths
    worksheet["!cols"] = epfHeaders.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Contribution");

    // Generate Excel file
    const fileBlob = new Blob(
      [XLSX.write(workbook, { type: "array", bookType: "xlsx", raw: true })],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );

    // Upload Excel file
    await fileUpload(fileBlob, "xlsx");
  } else {
    alert("Invalid format selected. Please choose either Excel or PDF.");
  }
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

      return fetch(
        `${import.meta.env.VITE_API_URL}/items/export/${exportId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            generatedFile: fileData.id,
            status: "generated",
          }),
        },
      );
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

    // Add "All Branches" option at the beginning and format branch data for v-select
    branchOptions.value = [
      ...data.data.map((branch) => ({
        title: branch.branchName,
        value: branch.id,
      })),
    ];
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

    // Add "All Departments" option at the beginning and format department data for v-select
    departmentOptions.value = [
      ...data.data.map((department) => ({
        title: department.departmentName,
        value: department.id,
      })),
    ];
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

// Function to determine the correct collectionName based on report type
const getCollectionName = (reportType) => {
  // For Consolidate Report, use "salarySetting"
  if (reportType === "Consolidate Report") {
    return "salarySetting";
  }
  // For ESI Report, PF Report, Labour Welfare Fund, Bank Report, use "payrollVerification"
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

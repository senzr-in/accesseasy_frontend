<template>
  <div
    v-if="loadingDepartments"
    class="d-flex justify-center align-center pa-6"
  >
    <v-progress-circular
      indeterminate
      color="#68ade1"
      size="48"
      width="5"
    ></v-progress-circular>
  </div>
  <div v-else class="generate-report-container">
    <!-- Modern Header -->
    <v-toolbar flat class="header-toolbar px-4" height="64">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium">Generate Report</span>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <BaseButton
          variant="primary"
          size="md"
          text="Generate"
          :leftIcon="Check"
          @click="generateReport"
        />
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

            <div class="form-group">
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
          </div>
        </v-form>

        <!-- Access Level Assigned Employees Table Section -->
        <div
          v-if="reportType === 'Access Level Assigned Employees'"
          class="access-level-table-container mt-6"
        >
          <!-- Filters -->
          <div class="filter-section mb-4">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="selectedBranchForAccessLevel"
                  :items="branchOptions"
                  label="Select Branch"
                  variant="outlined"
                  hide-details="auto"
                  density="comfortable"
                  :loading="loadingBranches"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="selectedDepartmentForAccessLevel"
                  :items="departmentOptions"
                  label="Select Department"
                  variant="outlined"
                  hide-details="auto"
                  density="comfortable"
                  :loading="loadingDepartments"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="d-flex align-center">
                <BaseButton
                  variant="primary"
                  size="md"
                  text="Fetch Employees"
                  :leftIcon="RefreshCw"
                  @click="fetchAccessLevelEmployees"
                  :loading="loadingAccessLevelData"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Data Table -->
          <div class="table-section">
            <v-card elevation="1" class="pa-4">
              <v-data-table
                :headers="accessLevelHeaders"
                :items="accessLevelEmployees"
                :loading="loadingAccessLevelData"
                class="elevation-1"
                v-model="selectedEmployees"
              >
                <!-- UPDATED TOP TOOLBAR WITH SELECT ALL & BULK GENERATE -->
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title
                      >Access Level Assigned Employees</v-toolbar-title
                    >

                    <!-- Select All Checkbox -->
                    <v-checkbox
                      v-model="selectAll"
                      class="ml-4"
                      hide-details
                      density="compact"
                      @change="toggleSelectAll"
                    ></v-checkbox>

                    <v-spacer></v-spacer>

                    <!-- Generate Selected Button -->
                    <BaseButton
                      variant="primary"
                      size="md"
                      text="Generate Selected"
                      :leftIcon="Check"
                      @click="generateSelectedReports"
                      :disabled="!selectedEmployees.length"
                      class="mr-2"
                    />
                    <!-- Export to Excel -->
                    <BaseButton
                      variant="primary"
                      size="md"
                      text="Export to Excel"
                      :leftIcon="Download"
                      @click="exportAccessLevelToExcel"
                      :disabled="accessLevelEmployees.length === 0"
                    />
                  </v-toolbar>
                </template>

                <!-- Checkbox Column -->
                <template v-slot:item.select="{ item }">
                  <v-checkbox
                    v-model="selectedEmployees"
                    :value="item"
                    hide-details
                    class="mt-1"
                    @click.stop
                  ></v-checkbox>
                </template>

                <template v-slot:item.employeeId="{ item }">
                  {{ item.employeeId || "N/A" }}
                </template>

                <template v-slot:item.assignedUser.first_name="{ item }">
                  {{ item.assignedUser?.first_name || "N/A" }}
                </template>

                <template v-slot:item.accessLevelNumber="{ item }">
                  {{
                    item.assignedAccessLevel?.accessLevelNumber ||
                    "Not Assigned"
                  }}
                </template>

                <template v-slot:item.rfidCards="{ item }">
                  <v-chip
                    v-if="item.cardDetails && item.cardDetails.length > 0"
                    size="small"
                    color="primary"
                    variant="outlined"
                  >
                    {{ item.cardDetails.length }} Card(s)
                  </v-chip>
                  <span v-else class="text-caption text-grey">No Cards</span>
                </template>

                <template v-slot:item.actions="{ item }">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    text="Generate"
                    @click="generateEmployeeReport(item)"
                    :disabled="!item.assignedAccessLevel"
                  />
                </template>

                <template v-slot:loading>
                  <v-row justify="center" align="center" class="pa-6">
                    <v-progress-circular
                      indeterminate
                      color="#68ade1"
                      size="32"
                      width="3"
                    ></v-progress-circular>
                    <span class="ml-3">Loading employees data...</span>
                  </v-row>
                </template>

                <template v-slot:no-data>
                  <div class="text-center pa-6">
                    <v-icon size="64" color="grey lighten-2"
                      >mdi-account-off</v-icon
                    >
                    <div class="text-h6 mt-2">No employees found</div>
                    <div class="text-body-2 mt-1">
                      Click "Fetch Employees" to load data
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ExcelJS from "exceljs";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Check, RefreshCw, Download } from "lucide-vue-next";
import { defineEmits } from "vue";

const emit = defineEmits(["closePopup"]);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const loading = ref(false);

const reportTypeOptions = ["Access Level Assigned Employees"];

const branchOptions = ref();
const departmentOptions = ref();
const reportType = ref(null);
const selectedBranch = ref([]);
const selectedDepartment = ref([]);
const loadingBranches = ref(false);
const loadingDepartments = ref(false);

// Access Level Employees Data
const accessLevelEmployees = ref([]);
const loadingAccessLevelData = ref(false);
const selectedBranchForAccessLevel = ref(null);
const selectedDepartmentForAccessLevel = ref(null);

// NEW: Selection Logic
const selectedEmployees = ref([]); // Holds selected employee objects
const selectAll = ref(false); // Header checkbox

// UPDATED HEADERS WITH CHECKBOX COLUMN
const accessLevelHeaders = [
  { title: "", key: "select", sortable: false, width: "50px", align: "center" },
  { title: "Employee ID", key: "employeeId", sortable: true },
  { title: "Employee Name", key: "assignedUser.first_name", sortable: true },
  { title: "Access Level Number", key: "accessLevelNumber", sortable: true },
  { title: "RFID Cards", key: "rfidCards", sortable: false, align: "center" },
  { title: "Actions", key: "actions", sortable: false, align: "center" },
];

const cancelPopup = () => {
  emit("closePopup");
};
// ---------------------------------------------------------------
// NEW: Export ONLY the selected employees (one sheet per employee)
// ---------------------------------------------------------------
const exportSelectedToExcel = async () => {
  if (!selectedEmployees.value.length) {
    alert("Please select at least one employee to export.");
    return;
  }

  try {
    loadingAccessLevelData.value = true;

    const workbook = new ExcelJS.Workbook();

    // One sheet per selected employee
    for (const employee of selectedEmployees.value) {
      // ---- reuse the same logic you already have in generateEmployeeReport ----
      const accessLevelDetails = await fetchAccessLevelDetails(
        employee.assignedAccessLevel.id
      );

      const doorDetails = accessLevelDetails?.assignDoorsGroup?.length
        ? await fetchAllDoorDetails(accessLevelDetails.assignDoorsGroup)
        : [];

      const worksheet = workbook.addWorksheet(`Emp_${employee.employeeId}`);

      // ---- (copy-paste the whole worksheet building part from generateEmployeeReport) ----
      // (Only the parts that build rows – keep the same styling)
      // -----------------------------------------------------------------------
      worksheet.mergeCells("A1:I1");
      worksheet.getCell("A1").value = "Employee Access Level Detailed Report";
      worksheet.getCell("A1").font = { bold: true, size: 16 };
      worksheet.getCell("A1").alignment = { horizontal: "center" };

      worksheet.addRow([]); // empty
      worksheet.addRow(["Employee Details"]);
      worksheet.getCell(`A${worksheet.rowCount}`).font = {
        bold: true,
        size: 14,
      };

      worksheet.addRow(["Employee ID:", employee.employeeId || "N/A"]);
      worksheet.addRow([
        "Employee Name:",
        employee.assignedUser?.first_name || "N/A",
      ]);
      worksheet.addRow([
        "Tenant Name:",
        employee.assignedUser?.tenant?.tenantName || "N/A",
      ]);

      worksheet.addRow([]); // empty
      worksheet.addRow(["Access Level Details"]);
      worksheet.getCell(`A${worksheet.rowCount}`).font = {
        bold: true,
        size: 14,
      };

      worksheet.addRow([
        "Access Level Number:",
        accessLevelDetails?.accessLevelNumber || "N/A",
      ]);
      worksheet.addRow([
        "Access Level Name:",
        accessLevelDetails?.accessLevelName || "N/A",
      ]);
      worksheet.addRow([
        "Access Type:",
        accessLevelDetails?.accessType ? "Active" : "Inactive",
      ]);
      worksheet.addRow([
        "24 Hours Access:",
        accessLevelDetails?._24hrs ? "Yes" : "No",
      ]);
      worksheet.addRow([
        "Working Hours:",
        accessLevelDetails?.workingHours ? "Enabled" : "Disabled",
      ]);
      worksheet.addRow([
        "Max Work Hours:",
        accessLevelDetails?.maxWorkHours || "Not Set",
      ]);
      worksheet.addRow([
        "Valid Hours:",
        accessLevelDetails?.Valid_hours || "Not Set",
      ]);
      worksheet.addRow(["Assigned Doors Count:", doorDetails.length || "0"]);

      // ---- RFID Cards -------------------------------------------------
      if (employee.cardDetails?.length) {
        worksheet.addRow([]); // empty
        worksheet.addRow(["RFID Cards Assigned"]);
        worksheet.getCell(`A${worksheet.rowCount}`).font = {
          bold: true,
          size: 14,
        };

        const rfidHeaders = [
          "RFID Card Number",
          "Card Type",
          "Access Level ID",
          "Card Access",
          "Card Access Level Array",
          "Card Access Level Hex",
        ];
        worksheet.addRow(rfidHeaders);
        const hdrRow = worksheet.getRow(worksheet.rowCount);
        hdrRow.eachCell((c) => {
          c.font = { bold: true };
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0E6F6" },
          };
          c.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        employee.cardDetails.forEach((card) => {
          worksheet.addRow([
            card.rfidCard || "N/A",
            card.type || "N/A",
            card.accessLevelsId || "N/A",
            card.cardAccess ? "Active" : "Inactive",
            card.cardAccessLevelArray || "N/A",
            card.cardAccessLevelHex || "N/A",
          ]);
        });
        // border for data rows
        for (
          let i = worksheet.rowCount - employee.cardDetails.length + 1;
          i <= worksheet.rowCount;
          i++
        ) {
          worksheet
            .getRow(i)
            .eachCell(
              (c) =>
                (c.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                })
            );
        }
      } else {
        worksheet.addRow([]);
        worksheet.addRow(["RFID Cards: No cards assigned"]);
      }

      // ---- Assigned Doors ---------------------------------------------
      if (doorDetails.length) {
        worksheet.addRow([]); // empty
        worksheet.addRow(["Assigned Doors"]);
        worksheet.getCell(`A${worksheet.rowCount}`).font = {
          bold: true,
          size: 14,
        };

        const doorHeaders = [
          "Door Name",
          "Door Number",
          "Door Type",
          "Device ID",
          "Door Open Timer",
          "Sensor Mode",
          "Passive Mode",
          "Schedule Time",
        ];
        worksheet.addRow(doorHeaders);
        const hdrRow = worksheet.getRow(worksheet.rowCount);
        hdrRow.eachCell((c) => {
          c.font = { bold: true };
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE6E6FA" },
          };
          c.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        doorDetails.forEach((d) => {
          const sch = d.doorsConfigure?.scheduleTime
            ? `${d.doorsConfigure.scheduleTime.entryTime} - ${d.doorsConfigure.scheduleTime.exitTime}`
            : "Not Set";
          worksheet.addRow([
            d.doorName || "N/A",
            d.doorNumber || "N/A",
            d.doorType || "N/A",
            d.doorsConfigure?.deviceId || "N/A",
            d.doorsConfigure?.doorOpenTimer || "N/A",
            d.doorsConfigure?.sensorMode ? "Yes" : "No",
            d.doorsConfigure?.passiveMode ? "Yes" : "No",
            sch,
          ]);
        });
        // border for data rows
        for (
          let i = worksheet.rowCount - doorDetails.length + 1;
          i <= worksheet.rowCount;
          i++
        ) {
          worksheet
            .getRow(i)
            .eachCell(
              (c) =>
                (c.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                })
            );
        }
      } else {
        worksheet.addRow([]);
        worksheet.addRow(["Assigned Doors: No doors assigned"]);
      }

      // ---- Footer ----------------------------------------------------
      worksheet.addRow([]);
      worksheet.addRow(["Report Generated On:", new Date().toLocaleString()]);

      // ---- Column widths ---------------------------------------------
      worksheet.columns = [
        { width: 25 },
        { width: 35 },
        { width: 20 },
        { width: 20 },
        { width: 25 },
        { width: 25 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 25 },
      ];
    }

    // ---- Download ----------------------------------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Selected_Employees_Report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export selected error:", err);
    alert("Failed to export selected employees.");
  } finally {
    loadingAccessLevelData.value = false;
  }
};
// Fetch Card Management Details for an employee
const fetchCardManagementDetails = async (employeeId) => {
  try {
    console.log(`Fetching card details for employee ID: ${employeeId}`);

    const params = {
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][0][_and][1][employeeId][id][_eq]"]: employeeId,
      fields: [
        "id",
        "tenant.tenantId",
        "accessLevelsId",
        "cardAccessLevelArray",
        "cardAccessLevelHex",
        "employeeId.employeeId",
        "rfidCard",
        "employeeId.id",
        "employeeId.assignedUser.first_name",
        "type",
        "cardAccess",
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
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch card management details");
    }

    const data = await response.json();
    console.log(`Card details for employee ${employeeId}:`, data.data);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching card management details:", error);
    return [];
  }
};

// Access Level Employees Functions
const fetchAccessLevelEmployees = async () => {
  console.log("Starting fetchAccessLevelEmployees function...");
  loadingAccessLevelData.value = true;
  accessLevelEmployees.value = [];
  selectedEmployees.value = []; // Clear selection on new fetch
  selectAll.value = false;

  try {
    console.log("Building filter parameters...");

    const params = {
      ["filter[_and][0][assignedUser][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][1][assignedAccessLevel][id][_nnull]"]: true,
      fields: [
        "employeeId",
        "id",
        "assignedUser.first_name",
        "assignedUser.tenant.tenantName",
        "assignedUser.id",
        "assignedUser.tenant.tenantId",
        "assignedAccessLevel.id",
        "assignedAccessLevel.accessLevelNumber",
        "assignedAccessLevel.accessLevelName",
        "assignedAccessLevel.accessType",
      ],
      limit: -1,
    };

    if (
      selectedBranchForAccessLevel.value?.value &&
      selectedBranchForAccessLevel.value.value !== "__all__"
    ) {
      params["filter[_and][2][assignedBranch][branch_id][_eq]"] =
        selectedBranchForAccessLevel.value.value;
    }

    if (
      selectedDepartmentForAccessLevel.value?.value &&
      selectedDepartmentForAccessLevel.value.value !== "__all__"
    ) {
      params["filter[_and][3][assignedDepartment][department_id][_eq]"] =
        selectedDepartmentForAccessLevel.value.value;
    }

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const apiUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch access level employees data");
    }

    const data = await response.json();
    const employeesWithAccessLevels = data.data.filter(
      (emp) => emp.assignedAccessLevel !== null
    );

    for (const employee of employeesWithAccessLevels) {
      employee.cardDetails = await fetchCardManagementDetails(employee.id);
    }

    accessLevelEmployees.value = employeesWithAccessLevels;
  } catch (error) {
    console.error("Error fetching access level employees:", error);
    alert("Failed to fetch employees data. Please try again.");
  } finally {
    loadingAccessLevelData.value = false;
  }
};

// Toggle Select All
const toggleSelectAll = (val) => {
  selectedEmployees.value = val ? [...accessLevelEmployees.value] : [];
};

// Keep "Select All" in sync
watch(
  accessLevelEmployees,
  () => {
    const allSelected =
      accessLevelEmployees.value.length > 0 &&
      selectedEmployees.value.length === accessLevelEmployees.value.length &&
      selectedEmployees.value.every((emp) =>
        accessLevelEmployees.value.includes(emp)
      );
    selectAll.value = allSelected;
  },
  { immediate: true }
);

// NEW: Generate reports for all selected employees
const generateSelectedReports = async () => {
  if (!selectedEmployees.value.length) return;

  loadingAccessLevelData.value = true;
  try {
    for (const employee of selectedEmployees.value) {
      await generateEmployeeReport(employee);
    }
    alert(
      `${selectedEmployees.value.length} report(s) generated successfully!`
    );
    selectedEmployees.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error("Error in bulk report generation:", error);
    alert("Some reports failed to generate.");
  } finally {
    loadingAccessLevelData.value = false;
  }
};

// [Your existing fetchAccessLevelDetails, fetchDoorDetails, fetchAllDoorDetails, generateEmployeeReport, exportAccessLevelToExcel remain UNCHANGED]
const fetchAccessLevelDetails = async (accessLevelId) => {
  try {
    const params = {
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][0][_and][1][id][_eq]"]: accessLevelId,
      fields: [
        "id",
        "accessLevelNumber",
        "accessLevelName",
        "accessType",
        "_24hrs",
        "workingHours",
        "maxWorkHours",
        "assignDoorsGroup",
        "Valid_hours",
        "tenant.tenantId",
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
      `${import.meta.env.VITE_API_URL}/items/accesslevels?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch access level details");
    }

    const data = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error("Error fetching access level details:", error);
    return null;
  }
};

const fetchDoorDetails = async (doorId) => {
  try {
    const params = {
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]"]: tenantId,
      ["filter[_and][0][_and][1][id][_eq]"]: doorId,
      fields: [
        "id",
        "doorNumber",
        "doorName",
        "doorType",
        "doorsConfigure",
        "tenant.tenantName",
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
      `${import.meta.env.VITE_API_URL}/items/doors?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch door details");
    }

    const data = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error("Error fetching door details:", error);
    return null;
  }
};

const fetchAllDoorDetails = async (doorIds) => {
  if (!doorIds || doorIds.length === 0) {
    return [];
  }

  try {
    const doorDetails = [];
    for (const doorId of doorIds) {
      const doorDetail = await fetchDoorDetails(doorId);
      if (doorDetail) {
        doorDetails.push(doorDetail);
      }
    }
    return doorDetails;
  } catch (error) {
    console.error("Error fetching all door details:", error);
    return [];
  }
};

const generateEmployeeReport = async (employee) => {
  if (!employee.assignedAccessLevel) {
    alert("This employee doesn't have an assigned access level.");
    return;
  }

  try {
    loadingAccessLevelData.value = true;

    // Fetch access level details
    const accessLevelDetails = await fetchAccessLevelDetails(
      employee.assignedAccessLevel.id
    );

    if (!accessLevelDetails) {
      alert("Failed to fetch access level details.");
      return;
    }

    // Fetch door details if assignDoorsGroup has IDs
    let doorDetails = [];
    if (
      accessLevelDetails.assignDoorsGroup &&
      accessLevelDetails.assignDoorsGroup.length > 0
    ) {
      doorDetails = await fetchAllDoorDetails(
        accessLevelDetails.assignDoorsGroup
      );
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Employee_${employee.employeeId}`);

    // Add main title
    worksheet.mergeCells("A1:I1");
    worksheet.getCell("A1").value = "Employee Access Level Detailed Report";
    worksheet.getCell("A1").font = { bold: true, size: 16 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add employee details section
    worksheet.addRow([]); // Empty row
    worksheet.addRow(["Employee Details"]);
    worksheet.getCell("A3").font = { bold: true, size: 14 };

    worksheet.addRow(["Employee ID:", employee.employeeId || "N/A"]);
    worksheet.addRow([
      "Employee Name:",
      employee.assignedUser?.first_name || "N/A",
    ]);
    worksheet.addRow([
      "Tenant Name:",
      employee.assignedUser?.tenant?.tenantName || "N/A",
    ]);

    // Add access level details section
    worksheet.addRow([]); // Empty row
    worksheet.addRow(["Access Level Details"]);
    worksheet.getCell("A7").font = { bold: true, size: 14 };

    worksheet.addRow([
      "Access Level Number:",
      accessLevelDetails.accessLevelNumber || "N/A",
    ]);
    worksheet.addRow([
      "Access Level Name:",
      accessLevelDetails.accessLevelName || "N/A",
    ]);
    worksheet.addRow([
      "Access Type:",
      accessLevelDetails.accessType ? "Active" : "Inactive",
    ]);
    worksheet.addRow([
      "24 Hours Access:",
      accessLevelDetails._24hrs ? "Yes" : "No",
    ]);
    worksheet.addRow([
      "Working Hours:",
      accessLevelDetails.workingHours ? "Enabled" : "Disabled",
    ]);
    worksheet.addRow([
      "Max Work Hours:",
      accessLevelDetails.maxWorkHours || "Not Set",
    ]);
    worksheet.addRow([
      "Valid Hours:",
      accessLevelDetails.Valid_hours || "Not Set",
    ]);
    worksheet.addRow(["Assigned Doors Count:", doorDetails.length || "0"]);

    // Add RFID Cards section if available
    if (employee.cardDetails && employee.cardDetails.length > 0) {
      worksheet.addRow([]); // Empty row
      worksheet.addRow(["RFID Cards Assigned"]);
      const rfidTitleRow = worksheet.rowCount;
      worksheet.getCell(`A${rfidTitleRow}`).font = {
        bold: true,
        size: 14,
      };

      // Add RFID card headers
      const rfidHeaders = [
        "RFID Card Number",
        "Card Type",
        "Access Level ID",
        "Card Access",
        "Card Access Level Array",
        "Card Access Level Hex",
      ];
      worksheet.addRow(rfidHeaders);

      // Style RFID headers
      const rfidHeaderRow = worksheet.getRow(worksheet.rowCount);
      rfidHeaderRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0E6F6" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Add RFID card data
      employee.cardDetails.forEach((card) => {
        worksheet.addRow([
          card.rfidCard || "N/A",
          card.type || "N/A",
          card.accessLevelsId || "N/A",
          card.cardAccess ? "Active" : "Inactive",
          card.cardAccessLevelArray || "N/A",
          card.cardAccessLevelHex || "N/A",
        ]);
      });

      // Style RFID data rows
      for (
        let i = worksheet.rowCount - employee.cardDetails.length + 1;
        i <= worksheet.rowCount;
        i++
      ) {
        const row = worksheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    } else {
      worksheet.addRow([]);
      worksheet.addRow(["RFID Cards: No cards assigned"]);
    }

    // Add assigned doors section if available
    if (doorDetails.length > 0) {
      worksheet.addRow([]); // Empty row
      worksheet.addRow(["Assigned Doors"]);
      const doorTitleRow = worksheet.rowCount;
      worksheet.getCell(`A${doorTitleRow}`).font = {
        bold: true,
        size: 14,
      };

      // Add door headers
      const doorHeaders = [
        "Door Name",
        "Door Number",
        "Door Type",
        "Device ID",
        "Door Open Timer",
        "Sensor Mode",
        "Passive Mode",
        "Schedule Time",
      ];
      worksheet.addRow(doorHeaders);

      // Style door headers
      const doorHeaderRow = worksheet.getRow(worksheet.rowCount);
      doorHeaderRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6E6FA" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Add door data
      doorDetails.forEach((door) => {
        const scheduleTime = door.doorsConfigure?.scheduleTime
          ? `${door.doorsConfigure.scheduleTime.entryTime} - ${door.doorsConfigure.scheduleTime.exitTime}`
          : "Not Set";

        worksheet.addRow([
          door.doorName || "N/A",
          door.doorNumber || "N/A",

          door.doorType || "N/A",
          door.doorsConfigure?.deviceId || "N/A",
          door.doorsConfigure?.doorOpenTimer || "N/A",
          door.doorsConfigure?.sensorMode ? "Yes" : "No",
          door.doorsConfigure?.passiveMode ? "Yes" : "No",
          scheduleTime,
        ]);
      });

      // Style door data rows
      for (
        let i = worksheet.rowCount - doorDetails.length + 1;
        i <= worksheet.rowCount;
        i++
      ) {
        const row = worksheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    } else {
      worksheet.addRow([]);
      worksheet.addRow(["Assigned Doors: No doors assigned"]);
    }

    // Add report metadata
    worksheet.addRow([]);
    worksheet.addRow(["Report Generated On:", new Date().toLocaleString()]);

    // Style the employee and access level details
    for (let i = 4; i <= 14; i++) {
      const row = worksheet.getRow(i);
      if (row.getCell(1).value) {
        row.getCell(1).font = { bold: true };
      }
    }

    // Auto-fit columns
    worksheet.columns = [
      { width: 25 },
      { width: 35 },
      { width: 20 },
      { width: 20 },
      { width: 25 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 25 },
    ];

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Employee_Access_Report_${employee.employeeId}_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(
      `Generated detailed report for employee: ${employee.assignedUser?.first_name}`
    );
  } catch (error) {
    console.error("Error generating employee report:", error);
    alert("Failed to generate employee report. Please try again.");
  } finally {
    loadingAccessLevelData.value = false;
  }
};

const exportAccessLevelToExcel = async () => {
  if (accessLevelEmployees.value.length === 0) {
    alert("No data to export");
    return;
  }

  try {
    loadingAccessLevelData.value = true;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Access Level Employees");

    // Define headers - Added "Assigned Door Names" column
    const headers = [
      "Employee ID",
      "Employee Name",
      "Access Level Number",
      "Access Level Name",
      "Access Type",
      "24 Hours Access",
      "Working Hours",
      "Valid Hours",
      "Assigned Doors Count",
      "Assigned Door Names", // New column for door names
      "RFID Cards Count",
      "RFID Card Numbers",
    ];

    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6FA" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Add data rows with enhanced details
    for (const employee of accessLevelEmployees.value) {
      let accessLevelDetails = null;
      let doorCount = 0;
      let doorNames = [];
      let rfidCardNumbers = [];

      if (employee.assignedAccessLevel?.id) {
        accessLevelDetails = await fetchAccessLevelDetails(
          employee.assignedAccessLevel.id
        );

        // Fetch door details if available
        if (
          accessLevelDetails?.assignDoorsGroup &&
          accessLevelDetails.assignDoorsGroup.length > 0
        ) {
          doorCount = accessLevelDetails.assignDoorsGroup.length;
          const doorDetails = await fetchAllDoorDetails(
            accessLevelDetails.assignDoorsGroup
          );
          doorNames = doorDetails
            .map((door) => door.doorName || "N/A")
            .filter((name) => name !== "N/A");
        }
      }

      // Get RFID card numbers
      if (employee.cardDetails && employee.cardDetails.length > 0) {
        rfidCardNumbers = employee.cardDetails
          .map((card) => card.rfidCard)
          .filter(Boolean);
      }

      worksheet.addRow([
        employee.employeeId || "N/A",
        employee.assignedUser?.first_name || "N/A",
        accessLevelDetails?.accessLevelNumber || "Not Assigned",
        accessLevelDetails?.accessLevelName || "Not Assigned",
        accessLevelDetails?.accessType ? "Active" : "Inactive",
        accessLevelDetails?._24hrs ? "Yes" : "No",
        accessLevelDetails?.workingHours ? "Enabled" : "Disabled",
        accessLevelDetails?.Valid_hours || "Not Set",
        doorCount,
        doorNames.join(", ") || "No Doors", // Add door names
        employee.cardDetails?.length || 0,
        rfidCardNumbers.join(", ") || "No Cards",
      ]);
    }

    // Style data rows
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    // Auto-fit columns - Adjusted widths for new column
    worksheet.columns = [
      { width: 15 },
      { width: 25 },
      { width: 20 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 30 }, // Width for door names
      { width: 15 },
      { width: 30 },
    ];

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Access_Level_Employees_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to export data. Please try again.");
  } finally {
    loadingAccessLevelData.value = false;
  }
};
// Watch for report type change
watch(reportType, (newType) => {
  if (newType === "Access Level Assigned Employees") {
    selectedBranchForAccessLevel.value = selectedBranch.value;
    selectedDepartmentForAccessLevel.value = selectedDepartment.value[0] || {
      title: "All Departments",
      value: "__all__",
    };
  }
});

const generateReport = async () => {
  loading.value = true;
  if (reportType.value === "Access Level Assigned Employees") {
    await fetchAccessLevelEmployees();
    loading.value = false;
    return;
  }
  loading.value = false;
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
      }
    );

    if (!response.ok) throw new Error("Failed to fetch branch data");
    const data = await response.json();

    branchOptions.value = [
      { title: "All Branches", value: "__all__" },
      ...data.data.map((branch) => ({
        title: branch.branchName,
        value: branch.id,
      })),
    ];
    selectedBranch.value = { title: "All Branches", value: "__all__" };
    selectedBranchForAccessLevel.value = {
      title: "All Branches",
      value: "__all__",
    };
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
      }
    );

    if (!response.ok) throw new Error("Failed to fetch department data");
    const data = await response.json();

    departmentOptions.value = [
      { title: "All Departments", value: "__all__" },
      ...data.data.map((department) => ({
        title: department.departmentName,
        value: department.id,
      })),
    ];

    selectedDepartmentForAccessLevel.value = {
      title: "All Departments",
      value: "__all__",
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
  } finally {
    loadingDepartments.value = false;
  }
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

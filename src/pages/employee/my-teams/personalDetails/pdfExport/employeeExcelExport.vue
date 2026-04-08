<template>
  <div class="excel-export-container">
    <v-btn
      color="primary"
      :loading="isDownloading"
      @click="startDownload"
      class="download-btn"
      variant="text"
      size="large"
      title="Download Excel"
    >
      <v-icon class="mr-1">mdi-microsoft-excel</v-icon>
      Excel
    </v-btn>

    <v-dialog v-model="showProgressDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h6">Generating Excel</v-card-title>
        <v-card-text>
          <p class="mb-2">{{ progressMessage }}</p>
          <v-progress-linear
            :value="progressPercentage"
            height="25"
            color="primary"
            striped
          >
            <template v-slot:default>
              <strong>{{ progressPercentage }}%</strong>
            </template>
          </v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: String,
    default: "",
  },
});

const isDownloading = ref(false);
const showProgressDialog = ref(false);
const progressPercentage = ref(0);
const progressMessage = ref("Initializing...");
const batchSize = 100;
const processedRecords = ref(0);
const tenantName = ref("Company");

const startDownload = async () => {
  try {
    isDownloading.value = true;
    showProgressDialog.value = true;
    progressMessage.value = "Starting download...";

    await fetchTenantName();
    await fetchAndProcessData();
  } catch (error) {
    console.error("Error generating Excel:", error);
    progressMessage.value = "Error generating Excel. Please try again.";
  } finally {
    setTimeout(() => {
      isDownloading.value = false;
      showProgressDialog.value = false;
      progressPercentage.value = 0;
      processedRecords.value = 0;
    }, 1000);
  }
};

const fetchTenantName = async () => {
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();

    progressMessage.value = "Fetching tenant information...";

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}`,
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
    if (data.data && data.data.length > 0) {
      tenantName.value =
        data.data[0].tenantName || data.data[0].companyName || "Company";
    }
  } catch (error) {
    console.error("Error fetching tenant name:", error);
  }
};

const fetchSalaryBreakdownBatch = async (employeeIds, token) => {
  try {
    if (!employeeIds || employeeIds.length === 0) {
      return {};
    }

    // Build batch filter using _in operator
    const employeeIdsString = employeeIds.join(",");
    const queryString = `filter[_and][0][_and][0][employee][id][_in]=${employeeIdsString}&fields[]=ctc&fields[]=employee.id`;

    const salaryBreakdownResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!salaryBreakdownResponse.ok) {
      console.warn(
        `Failed to fetch salary breakdown: ${salaryBreakdownResponse.status}`,
      );
      return {};
    }

    const salaryData = await salaryBreakdownResponse.json();

    // Create a map of employee ID to CTC
    const salaryMap = {};
    if (salaryData.data && Array.isArray(salaryData.data)) {
      salaryData.data.forEach((item) => {
        if (item.employee && item.employee.id) {
          salaryMap[item.employee.id] = item.ctc || 0;
        }
      });
    }

    return salaryMap;
  } catch (error) {
    console.error("Error fetching salary breakdown batch:", error);
    return {};
  }
};

const fetchAndProcessData = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  try {
    let currentPage = 1;
    let allData = [];
    let hasMoreData = true;

    while (hasMoreData) {
      progressMessage.value = `Fetching batch ${currentPage}...`;

      const params = {
        fields: getFieldsArray(),
        ...buildFilterParams(),
        sort: "date_created",
        page: currentPage,
        limit: batchSize,
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
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const batchData = data.data || [];

      if (batchData.length === 0) {
        hasMoreData = false;
        break;
      }

      // Extract employee IDs for batch salary breakdown fetch
      const employeeIds = batchData
        .map((employee) => employee.id)
        .filter((id) => id);

      // Fetch salary breakdown data for the entire batch
      progressMessage.value = `Fetching salary data for batch ${currentPage}...`;
      const salaryMap = await fetchSalaryBreakdownBatch(employeeIds, token);

      // Map salary data back to employees
      batchData.forEach((employee) => {
        if (employee.id && salaryMap[employee.id] !== undefined) {
          employee.ctc = salaryMap[employee.id];
        } else {
          employee.ctc = 0; // Default value if no salary data found
        }
      });

      allData = [...allData, ...batchData];
      processedRecords.value += batchData.length;

      // Update progress percentage based on batch size
      progressPercentage.value = Math.min(
        ((currentPage * batchSize) /
          Math.max(processedRecords.value, batchSize)) *
          100,
        100,
      );
      progressMessage.value = `Processing ${processedRecords.value} records...`;

      currentPage++;

      // If we got less than batchSize, we're done
      if (batchData.length < batchSize) {
        hasMoreData = false;
      }
    }

    progressMessage.value = "Generating Excel document...";
    await generateExcel(allData);
  } catch (error) {
    console.error("Error fetching and processing data:", error);
    throw error;
  }
};

const generateExcel = async (data) => {
  try {
    progressMessage.value = "Creating Excel workbook...";

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Employee Management System";
    workbook.lastModifiedBy = "System";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("Employees", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
      },
    });

    // Add CTC to headers if not already present
    const customHeaders = [...props.headers].filter(
      (header) => header.key !== "avatarImage" && header.key !== "actions",
    );

    // Check if CTC header already exists
    if (!customHeaders.some((header) => header.key === "ctc")) {
      customHeaders.push({
        title: "Annual CTC",
        key: "ctc",
        align: "start",
        sortable: true,
        width: "150px",
      });
    }

    const tableHeaders = customHeaders.map((header) => header.title);

    const currentDate = new Date().toLocaleDateString();

    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${tenantName.value} - Employee Report - Generated: ${currentDate}`;
    titleCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
    };
    titleCell.alignment = {
      horizontal: "left",
      vertical: "middle",
    };

    const headerRow = worksheet.addRow(tableHeaders);
    headerRow.font = {
      name: "Arial",
      size: 12,
      bold: true,
    };

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "EBEAEA" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });

    data.forEach((item) => {
      const rowData = customHeaders.map((header) => {
        if (header.value && typeof header.value === "function") {
          return header.value(item) || "";
        }

        if (header.key === "ctc") {
          return item.ctc || "";
        }

        // Handle nested properties like department.departmentName and branch.branchName
        if (header.key.includes(".")) {
          const keys = header.key.split(".");
          let value = item;
          for (const key of keys) {
            value = value?.[key];
            if (value === undefined) break;
          }
          return value || "";
        }

        return item[header.key] || "";
      });

      const dataRow = worksheet.addRow(rowData);

      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    tableHeaders.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(header.length * 1.5, 15);
      column.alignment = {
        horizontal: "left",
        vertical: "middle",
      };
    });

    worksheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: tableHeaders.length },
    };

    progressMessage.value = "Saving Excel file...";
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${tenantName.value}_Employees_${currentDate.replace(/\//g, "-")}.xlsx`;

    saveAs(new Blob([buffer]), fileName);

    progressMessage.value = "Download complete!";
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
};

const buildFilterParams = () => {
  const params = {};
  const tenantId = currentUserTenant.getTenantId();
  const userRole = currentUserTenant.getRole();
  const userId = currentUserTenant.getUserId();

  params["filter[assignedUser][tenant][tenantId][_eq]"] = tenantId;

  if (userRole === "Manager") {
    params["filter[assignedUser][role][name][_eq]"] = "Employee";
  }

  if (userRole === "Employee") {
    params["filter[assignedUser][id][_eq]"] = userId;
  }

  if (props.search) {
    params["filter[_or][0][employeeId][_eq]"] = props.search;
    params["filter[_or][1][assignedUser][first_name][_icontains]"] =
      props.search;
    params["filter[_or][2][assignedUser][email][_icontains]"] = props.search;
    params["filter[_or][3][assignedUser][role][name][_icontains]"] =
      props.search;
    params["filter[_or][4][department][departmentName][_icontains]"] =
      props.search;
    params["filter[_or][5][branch][branchName][_icontains]"] = props.search;
    params["filter[_or][6][assignedUser][phone][_icontains]"] = props.search;
    params["filter[_or][7][assignedUser][officeEmail][_icontains]"] =
      props.search;
    params["filter[_or][8][assignedUser][gender][_icontains]"] = props.search;
    params["filter[_or][9][config][configName][_icontains]"] = props.search;
    params["filter[_or][10][salaryConfig][configName][_icontains]"] =
      props.search;
    params["filter[_or][11][assignedUser][aadhar][_icontains]"] = props.search;
    params["filter[_or][12][assignedUser][ESIAccountNumber][_icontains]"] =
      props.search;
    params["filter[_or][13][assignedUser][PFAccountNumber][_icontains]"] =
      props.search;
    params["filter[_or][14][assignedUser][pan][_icontains]"] = props.search;
    params[
      "filter[_or][15][assignedAccessLevel][accessLevelName][_icontains]"
    ] = props.search;
    params["filter[_or][16][controllerStatus][_icontains]"] = props.search;
  }

  if (props.filters) {
    if (props.filters.branch?.length) {
      params["filter[branch][branchName][_in]"] =
        props.filters.branch.join(",");
    }
    if (props.filters.department?.length) {
      params["filter[department][departmentName][_in]"] =
        props.filters.department.join(",");
    }
    if (props.filters.role?.length) {
      params["filter[assignedUser][role][name][_in]"] =
        props.filters.role.join(",");
    }
    if (props.filters.accessLevel?.length) {
      params["filter[assignedAccessLevel][accessLevelName][_in]"] =
        props.filters.accessLevel.join(",");
    }
    if (props.filters.gender?.length) {
      params["filter[assignedUser][gender][_in]"] =
        props.filters.gender.join(",");
    }
    if (props.filters.dateFrom) {
      params["filter[assignedUser][dateOfJoining][_gte]"] =
        props.filters.dateFrom;
    }
    if (props.filters.dateTo) {
      params["filter[assignedUser][dateOfJoining][_lte]"] =
        props.filters.dateTo;
    }
  }

  return params;
};

const getFieldsArray = () => {
  return [
    "id",
    "employeeId",
    "controllerStatus",
    "assignedUser.first_name",
    "assignedUser.role.name",
    "department.departmentName",
    "branch.branchName",
    "assignedUser.phone",
    "assignedUser.email",
    "assignedUser.officeEmail",
    "assignedUser.gender",
    "config.configName",
    "salaryConfig.configName",
    "assignedUser.aadhar",
    "assignedUser.ESIAccountNumber",
    "assignedUser.PFAccountNumber",
    "assignedUser.pan",
    "assignedAccessLevel.accessLevelName",
  ];
};
</script>

<style scoped>
.excel-export-container {
  display: inline-block;
}

.download-btn {
  margin: 0;
}
</style>

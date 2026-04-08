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
import CryptoJS from "crypto-js";

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
const totalRecords = ref(0);
const processedRecords = ref(0);
const tenantName = ref("Company");

// Encryption/Decryption functions
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
}

function decryptData(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      return encryptedText || "";
    }

    if (!checkIfEncrypted(encryptedText)) {
      return encryptedText;
    }

    const textParts = encryptedText.split(":");
    const iv = textParts[0];
    const encryptedData = textParts[1];

    const ivWordArray = CryptoJS.enc.Hex.parse(iv);
    const keyWordArray = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedData);

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  }
}

// Fields that need decryption
const encryptedFields = [
  "assignedUser.aadhar",
  "assignedUser.pan",
  "assignedUser.voter_ID",
  "assignedUser.driving_License",
  "assignedUser.UAN",
  "assignedUser.IFSC",
];

const progressPercentageComputed = computed(() => {
  if (totalRecords.value === 0) return 0;
  return Math.round((processedRecords.value / totalRecords.value) * 100);
});

watch(progressPercentageComputed, (newValue) => {
  progressPercentage.value = newValue;
});

const startDownload = async () => {
  try {
    isDownloading.value = true;
    showProgressDialog.value = true;
    progressMessage.value = "Counting total records...";

    await fetchTenantName();
    await getTotalRecordCount();
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

const getTotalRecordCount = async () => {
  const token = authService.getToken();

  try {
    const params = {
      "aggregate[count]": "id",
      ...buildFilterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
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
    totalRecords.value = data?.data?.[0]?.count?.id || 0;
    progressMessage.value = `Found ${totalRecords.value} records. Starting download...`;
  } catch (error) {
    console.error("Error getting total record count:", error);
    throw error;
  }
};

const fetchAndProcessData = async () => {
  const token = authService.getToken();

  try {
    const totalPages = Math.ceil(totalRecords.value / batchSize);
    let currentPage = 1;
    let allData = [];

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Employee Management System";
    workbook.lastModifiedBy = "System";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("Employee Other Details", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
      },
    });

    const tableHeaders = props.headers
      .filter(
        (header) => header.key !== "avatarImage" && header.key !== "actions",
      )
      .map((header) => header.title);

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

    while (processedRecords.value < totalRecords.value) {
      progressMessage.value = `Fetching batch ${currentPage} of ${totalPages}...`;

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

      progressMessage.value = `Processing batch ${currentPage} of ${totalPages}...`;

      for (const item of batchData) {
        const rowData = props.headers
          .filter(
            (header) =>
              header.key !== "avatarImage" && header.key !== "actions",
          )
          .map((header) => {
            if (header.value && typeof header.value === "function") {
              return header.value(item) || "";
            }

            if (header.key === "rfidStatus") {
              const rfidCardCount =
                item.assignedCards?.filter(
                  (card) => card.cardManagement_id.type === "rfid",
                ).length || 0;
              return `${rfidCardCount} RFID Cards`;
            }

            if (header.key === "tagStatus") {
              const tagCard = item.assignedCards?.find(
                (card) => card.cardManagement_id.type === "tag",
              );
              if (tagCard) {
                return `${tagCard.cardManagement_id.rfidCard} (${tagCard.cardManagement_id.cardAccess ? "Enabled" : "Disabled"})`;
              }
              return "";
            }

            if (header.key === "controllerStatus") {
              return item.controllerStatus || "N/A";
            }

            if (header.key === "branchName") {
              return item.assignedBranch?.[0]?.branch_id?.branchName || "";
            }

            if (header.key.includes(".")) {
              const keys = header.key.split(".");
              let value = item;
              for (const key of keys) {
                value = value?.[key];
                if (value === undefined) break;
              }

              // Check if this field needs decryption
              if (encryptedFields.includes(header.key) && value) {
                value = decryptData(value);
              }

              return value || "";
            }

            let cellValue = item[header.key] || "";

            // Check if this field needs decryption
            if (encryptedFields.includes(header.key) && cellValue) {
              cellValue = decryptData(cellValue);
            }

            return cellValue;
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
      }

      processedRecords.value += batchData.length;
      progressMessage.value = `Processed ${processedRecords.value} of ${totalRecords.value} records...`;

      currentPage++;

      if (batchData.length < batchSize) {
        break; // No more data to fetch
      }
    }

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
    const fileName = `${tenantName.value}_Employee_Other_Details_${currentDate.replace(/\//g, "-")}.xlsx`;

    saveAs(new Blob([buffer]), fileName);

    progressMessage.value = "Download complete!";
  } catch (error) {
    console.error("Error fetching and processing data:", error);
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
    params["filter[_or][0][employeeId][_contains]"] = props.search;
    params["filter[_or][1][assignedUser][first_name][_contains]"] =
      props.search;
    params["filter[_or][2][assignedUser][email][_contains]"] = props.search;
    params["filter[_or][3][assignedUser][role][name][_contains]"] =
      props.search;
    params[
      "filter[_or][4][assignedDepartment][department_id][departmentName][_contains]"
    ] = props.search;
    params["filter[_or][5][assignedBranch][branch_id][branchName][_contains]"] =
      props.search;
    params["filter[_or][6][assignedUser][phone][_contains]"] = props.search;
    params["filter[_or][7][assignedUser][officeEmail][_contains]"] =
      props.search;
    params["filter[_or][8][assignedUser][gender][_contains]"] = props.search;
    params["filter[_or][9][config][configName][_contains]"] = props.search;
    params["filter[_or][10][salaryConfig][configName][_contains]"] =
      props.search;
    params["filter[_or][11][assignedUser][aadhar][_contains]"] = props.search;
    params["filter[_or][12][assignedUser][ESIAccountNumber][_contains]"] =
      props.search;
    params["filter[_or][13][assignedUser][PFAccountNumber][_contains]"] =
      props.search;
    params["filter[_or][14][assignedUser][pan][_contains]"] = props.search;
    params[
      "filter[_or][15][assignedAccessLevels][accesslevels_id][accessLevelName][_contains]"
    ] = props.search;
    params["filter[_or][16][controllerStatus][_contains]"] = props.search;
  }

  if (props.filters) {
    if (props.filters.branch?.length) {
      params["filter[assignedBranch][branch_id][branchName][_in]"] =
        props.filters.branch.join(",");
    }
    if (props.filters.department?.length) {
      params["filter[assignedDepartment][department_id][departmentName][_in]"] =
        props.filters.department.join(",");
    }
    if (props.filters.role?.length) {
      params["filter[assignedUser][role][name][_in]"] =
        props.filters.role.join(",");
    }
    if (props.filters.accessLevel?.length) {
      params[
        "filter[assignedAccessLevels][accesslevels_id][accessLevelName][_in]"
      ] = props.filters.accessLevel.join(",");
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
    "accessOn",
    "status",
    "assignedUser.first_name",
    "assignedUser.role.name",
    "assignedDepartment.department_id.departmentName",
    "assignedBranch.branch_id.branchName",
    "assignedUser.phone",
    "assignedUser.email",
    "assignedUser.officeEmail",
    "assignedUser.gender",
    "assignedUser.DOB",
    "assignedUser.bloodGroup",
    "assignedUser.maritalStatus",
    "assignedUser.tenant.tenantName",
    "assignedCards.cardManagement_id.type",
    "assignedCards.cardManagement_id.rfidCard",
    "assignedCards.cardManagement_id.cardAccess",
    "assignedUser.dateOfLeaving",
    "assignedUser.dateOfJoining",
    "assignedUser.ESIAccountNumber",
    "assignedUser.PFAccountNumber",
    "assignedUser.aadhar",
    "assignedUser.pan",
    "assignedUser.gst",
    "assignedUser.permanent_Address",
    "assignedUser.current_Address",
    "assignedUser.emergency_Contact_Name",
    "assignedUser.emergency_Contact_Mobile_Number",
    "assignedUser.emergency_Contact_Relationship",
    "assignedUser.guardians_Name",
    "assignedUser.voter_ID",
    "assignedUser.driving_License",
    "assignedUser.UAN",
    "assignedUser.IFSC",
    "config.configName",
    "salaryConfig.configName",
    "assignedAccessLevels.accesslevels_id.accessLevelName",
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

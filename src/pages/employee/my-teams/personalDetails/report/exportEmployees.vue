<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Export Employee Data</h3>
      </div>
      <div class="modal-body">
        <div class="export-options mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Export Format:</label
          >
          <v-select
            v-model="selectedExportFormat"
            :items="exportFormats"
            label="Select Format"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </div>

        <input
          type="checkbox"
          v-model="selectAll"
          @change="toggleAllSelection"
        />
        <span>Select All</span>

        <!-- Collapsible Sections -->
        <div class="sections">
          <div
            v-for="(section, index) in sections"
            :key="index"
            class="section"
          >
            <div class="section-header" @click="toggleSection(section.title)">
              <input
                type="checkbox"
                :checked="isSectionSelected(section.title)"
                @change="toggleSectionSelection(section.title)"
                @click.stop
              />
              <span>{{ section.title }}</span>
              <ChevronDown
                :class="{ rotate: openSections[section.title] }"
                class="chevron"
              />
            </div>
            <div v-show="openSections[section.title]" class="section-content">
              <div
                v-for="field in section.fields"
                :key="field.key"
                class="field"
              >
                <input type="checkbox" v-model="selectedFields[field.key]" />
                <span>{{ field.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-row">
            <!-- <v-select
              v-model="selectedBranch"
              :items="branches"
              item-title="branchName"
              item-value="id"
              label="Branch"
              clearable
              variant="outlined"
              density="compact"
              hide-details
            ></v-select> -->
            <v-select
              v-model="selectedDepartment"
              :items="departments"
              item-title="departmentName"
              item-value="id"
              label="Department"
              clearable
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </div>
          <div class="filter-row">
            <v-select
              v-model="selectedRole"
              :items="roleOptions"
              label="Role"
              clearable
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
            <v-select
              v-model="selectedGender"
              :items="genderOptions"
              label="Gender"
              clearable
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="export-btn" @click="exportData" :disabled="isExporting">
          {{ isExporting ? "Exporting..." : "Export Data" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import crypto from "crypto-js";

const props = defineProps({
  filters: Object,
  search: String,
  sortBy: Array,
  selectedIds: Array,
  exportFormat: String,
});

const emit = defineEmits(["close"]);

const ALL_EXPORT_FIELDS = [
  { label: "Employee ID", key: "employeeId" },
  { label: "First Name", key: "assignedUser.first_name" },
  { label: "Middle Name", key: "assignedUser.middleName" },
  { label: "Last Name", key: "assignedUser.last_name" },
  { label: "Access On", key: "accessOn" },
  { label: "Working Range", key: "workingRange" },
  { label: "Email", key: "assignedUser.email" },
  { label: "Phone", key: "assignedUser.phone" },
  { label: "PAN", key: "assignedUser.pan", sensitive: true },
  { label: "App Access", key: "assignedUser.appAccess" },
  { label: "IFSC Code", key: "assignedUser.IFSC", sensitive: true },
  { label: "Gender", key: "assignedUser.gender" },
  { label: "Blood Group", key: "assignedUser.bloodGroup" },
  { label: "UPI ID", key: "assignedUser.UPI" },
  { label: "Date of Leaving", key: "assignedUser.dateOfLeaving" },
  { label: "Date of Joining", key: "assignedUser.dateOfJoining" },
  { label: "Date of Birth (DOB)", key: "assignedUser.DOB" },
  { label: "Office Email", key: "assignedUser.officeEmail" },
  { label: "PF Account Number", key: "assignedUser.PFAccountNumber" },
  { label: "ESI Account Number", key: "assignedUser.ESIAccountNumber" },
  { label: "Bank Name", key: "assignedUser.bankName" },
  { label: "Account Status", key: "assignedUser.accountStatus" },
  { label: "Role Name", key: "assignedUser.role.name" },
  { label: "Account Details", key: "assignedUser.accountDetails" },
  { label: "Guardian's Name", key: "assignedUser.guardians_Name" },
  {
    label: "Emergency Contact Name",
    key: "assignedUser.emergency_Contact_Name",
  },
  {
    label: "Emergency Contact Mobile",
    key: "assignedUser.emergency_Contact_Mobile_Number",
  },
  {
    label: "Emergency Contact Relationship",
    key: "assignedUser.emergency_Contact_Relationship",
  },
  {
    label: "Emergency Contact Address",
    key: "assignedUser.emergency_Contact_Address",
  },
  {
    label: "Driving License",
    key: "assignedUser.driving_License",
    sensitive: true,
  },
  { label: "Voter ID", key: "assignedUser.voter_ID" },
  { label: "Current Address", key: "assignedUser.current_Address" },
  { label: "Permanent Address", key: "assignedUser.permanent_Address" },
  { label: "Designation", key: "assignedUser.designation" },
  { label: "Aadhar", key: "assignedUser.aadhar", sensitive: true },
  { label: "Account Number", key: "assignedUser.accountNumber" },
  { label: "Shop Account", key: "assignedUser.shopAccount" },
  {
    label: "UAN (Universal Account Number)",
    key: "assignedUser.UAN",
    sensitive: true,
  },
  // { label: "Branch Name", key: "branch.branchName" },
  { label: "Department Name", key: "department.departmentName" },
  {
    label: "Access Level Name",
    key: "assignedAccessLevel.accessLevelName",
  },
  { label: "Attendance Category", key: "config.configName" },
  { label: "ID", key: "id" },
];
const RFID_FIELD = {
  label: "RFID Card",
  key: "rfidCard",
  external: true,
};
const sections = [
  {
    title: "Employee Core Details",
    fields: ALL_EXPORT_FIELDS.filter((f) =>
      [
        "employeeId",
        "assignedUser.first_name",
        "assignedUser.last_name",
        "assignedUser.email",
        "assignedUser.phone",
        "assignedUser.gender",
        "assignedUser.DOB",
        "assignedUser.dateOfJoining",
        "assignedUser.dateOfLeaving",
        "assignedUser.officeEmail",
        "assignedUser.designation",
        "id",
      ].includes(f.key)
    ),
  },
  {
    title: "Company & Access Details",
    fields: [
      RFID_FIELD,
      ...ALL_EXPORT_FIELDS.filter((f) =>
        [
          "accessOn",
          "workingRange",
          "locationCentric",
          "department.departmentName",
          "assignedAccessLevel.accessLevelName",
          "config.configName",
          "assignedUser.role.name",
          "assignedUser.appAccess",
        ].includes(f.key)
      ),
    ],
  },
  {
    title: "Financial & Government IDs",
    fields: ALL_EXPORT_FIELDS.filter((f) =>
      [
        "assignedUser.pan",
        "assignedUser.aadhar",
        "assignedUser.voter_ID",
        "assignedUser.driving_License",
        "assignedUser.UAN",
        "assignedUser.PFAccountNumber",
        "assignedUser.ESIAccountNumber",
        "assignedUser.bankName",
        "assignedUser.accountNumber",
        "assignedUser.IFSC",
        "assignedUser.UPI",
        "assignedUser.shopAccount",
        "assignedUser.accountStatus",
        "assignedUser.accountDetails",
      ].includes(f.key)
    ),
  },
  {
    title: "Contact & Personal Info",
    fields: ALL_EXPORT_FIELDS.filter((f) =>
      [
        "assignedUser.bloodGroup",
        "assignedUser.maritalStatus",
        "assignedUser.current_Address",
        "assignedUser.permanent_Address",
        "assignedUser.guardians_Name",
        "assignedUser.emergency_Contact_Name",
        "assignedUser.emergency_Contact_Mobile_Number",
        "assignedUser.emergency_Contact_Relationship",
        "assignedUser.emergency_Contact_Address",
        "assignedUser.middleName",
      ].includes(f.key)
    ),
  },
];

const openSections = reactive({});
const selectedFields = reactive({});
const selectedBranch = ref("");
const selectedDepartment = ref("");
const selectedRole = ref("");
const selectedGender = ref("");
const departments = ref([]);
const branches = ref([]);
const roleOptions = ref([]);
const genderOptions = ["Male", "Female", "Other", "null"];

const loadingBranches = ref(false);
const tenantId = currentUserTenant.getTenantId();
const loadingDepartments = ref(false);
const isExporting = ref(false);
const selectAll = ref(false);
const selectedFieldKeys = ref([]); // Declare the variable
const flattenedData = ref([]); // Declare the variable

const selectedExportFormat = ref(props.exportFormat || "excel");
const exportFormats = ["excel", "csv", "pdf"];

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchBranches = async () => {
  loadingBranches.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch branches");
    const data = await response.json();
    branches.value = data.data || [];
  } catch (error) {
    console.error("Error fetching branches:", error);
  } finally {
    loadingBranches.value = false;
  }
};

const fetchDepartments = async () => {
  loadingDepartments.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      ` ${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json();
    departments.value = data.data || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
  } finally {
    loadingDepartments.value = false;
  }
};

const fetchRoles = async () => {
  const token = getToken();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error("Failed to fetch roles");
    const data = await response.json();
    roleOptions.value = data.data.map((r) => r.name) || [];
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};
const fetchRFIDData = async (employeeIds) => {
  const token = getToken();

  if (!employeeIds || employeeIds.length === 0) {
    return {};
  }

  try {
    const params = new URLSearchParams({
      fields: "employeeId.id,rfidCard",
      "filter[tenant][tenantId][_eq]": tenantId,
      "filter[employeeId][id][_in]": employeeIds.join(","),
      "filter[cardAccess][_eq]": true,
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.warn("No permission to access cardManagement collection");
        return {};
      }
      throw new Error("Failed to fetch RFID data");
    }

    const data = await response.json();

    // Create a mapping of employeeId to RFID cards
    const rfidMap = {};

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((card) => {
        const employeeId = card.employeeId?.id;
        if (employeeId && card.rfidCard) {
          if (!rfidMap[employeeId]) {
            rfidMap[employeeId] = [];
          }
          rfidMap[employeeId].push(card.rfidCard);
        }
      });

      // Convert arrays to comma-separated strings
      Object.keys(rfidMap).forEach((employeeId) => {
        rfidMap[employeeId] = rfidMap[employeeId].join(", ");
      });
    }

    return rfidMap;
  } catch (error) {
    console.error("Error fetching RFID data:", error);
    return {};
  }
};
onMounted(() => {
  fetchBranches();
  fetchDepartments();
  fetchRoles();

  sections.forEach((section) => {
    openSections[section.title] = true;
    section.fields.forEach((field) => {
      selectedFields[field.key] = true;
    });
  });
  selectAll.value = true;
});

const toggleSection = (title) => {
  openSections[title] = !openSections[title];
};

const isSectionSelected = (title) => {
  return sections
    .find((s) => s.title === title)
    ?.fields.every((field) => selectedFields[field.key]);
};

const toggleSectionSelection = (title) => {
  const section = sections.find((s) => s.title === title);
  const newValue = !isSectionSelected(title);
  section?.fields.forEach((field) => {
    selectedFields[field.key] = newValue;
  });
  updateSelectAll();
};

const updateSelectAll = () => {
  selectAll.value = sections.every((section) =>
    section.fields.every((field) => selectedFields[field.key])
  );
};

const toggleAllSelection = () => {
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      selectedFields[field.key] = selectAll.value;
    });
  });
};

watch(
  selectedFields,
  () => {
    updateSelectAll();
  },
  { deep: true }
);

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const checkIfEncrypted = (text) => {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
};

const decryptData = async (encryptedText) => {
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

    const ivWordArray = crypto.enc.Hex.parse(iv);
    const keyWordArray = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const ciphertext = crypto.enc.Hex.parse(encryptedData);

    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.AES.decrypt(cipherParams, keyWordArray, {
      iv: ivWordArray,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    });

    return decrypted.toString(crypto.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  }
};

const exportData = async () => {
  isExporting.value = true;
  const token = getToken();

  // Get selected fields excluding external ones for the main API call
  let selectedFieldKeys = Object.keys(selectedFields).filter(
    (key) => selectedFields[key] && key !== RFID_FIELD.key
  );

  // Check if RFID is selected
  const includeRFID = selectedFields[RFID_FIELD.key];

  // If no fields selected, use all available fields from personalModule
  if (selectedFieldKeys.length === 0 && !includeRFID) {
    selectedFieldKeys = ALL_EXPORT_FIELDS.map((field) => field.key);
  }

  if (selectedFieldKeys.length === 0 && !includeRFID) {
    alert(
      "No fields available for export. Please define fields in ALL_EXPORT_FIELDS."
    );
    isExporting.value = false;
    return;
  }

  try {
    let allData = [];
    const limit = 100;

    const baseFilterParams = {
      "filter[assignedUser][tenant][tenantId][_eq]": tenantId,
    };

    if (props.search) {
      baseFilterParams["filter[_or][0][employeeId][_eq]"] = props.search;
      baseFilterParams["filter[_or][1][assignedUser][first_name][_icontains]"] =
        props.search;
      baseFilterParams["filter[_or][2][assignedUser][email][_icontains]"] =
        props.search;
      baseFilterParams["filter[_or][3][assignedUser][role][name][_icontains]"] =
        props.search;
      baseFilterParams[
        "filter[_or][4][department][departmentName][_icontains]"
      ] = props.search;
      baseFilterParams["filter[_or][5][assignedUser][phone][_icontains]"] =
        props.search;
      baseFilterParams[
        "filter[_or][6][assignedUser][officeEmail][_icontains]"
      ] = props.search;
      baseFilterParams["filter[_or][7][assignedUser][gender][_icontains]"] =
        props.search;
      baseFilterParams["filter[_or][8][config][configName][_icontains]"] =
        props.search;
      baseFilterParams["filter[_or][9][assignedUser][aadhar][_icontains]"] =
        props.search;
      baseFilterParams[
        "filter[_or][10][assignedUser][ESIAccountNumber][_icontains]"
      ] = props.search;
      baseFilterParams[
        "filter[_or][11][assignedUser][PFAccountNumber][_icontains]"
      ] = props.search;
      baseFilterParams["filter[_or][12][assignedUser][pan][_icontains]"] =
        props.search;
      baseFilterParams["filter[_or][13][controllerStatus][_icontains]"] =
        props.search;
    }

    if (props.filters) {
      if (props.filters.department?.length) {
        baseFilterParams["filter[department][departmentName][_in]"] =
          props.filters.department.join(",");
      }
      if (props.filters.role?.length) {
        baseFilterParams["filter[assignedUser][role][name][_in]"] =
          props.filters.role.join(",");
      }
      if (props.filters.accessLevel?.length) {
        baseFilterParams["filter[assignedAccessLevel][accessLevelName][_in]"] =
          props.filters.accessLevel.join(",");
      }
      if (props.filters.gender?.length) {
        baseFilterParams["filter[assignedUser][gender][_eq]"] =
          props.filters.gender.join(",");
      }
      if (props.filters.employeeStatus?.length) {
        const today = new Date().toISOString().split("T")[0];
        if (
          props.filters.employeeStatus.includes("Active") &&
          !props.filters.employeeStatus.includes("Left")
        ) {
          baseFilterParams[
            "filter[_or][0][assignedUser][dateOfLeaving][_null]"
          ] = true;
          baseFilterParams["filter[_or][1][assignedUser][dateOfLeaving][_gt]"] =
            today;
        } else if (
          props.filters.employeeStatus.includes("Left") &&
          !props.filters.employeeStatus.includes("Active")
        ) {
          baseFilterParams["filter[assignedUser][dateOfLeaving][_lte]"] = today;
        }
      }
    }

    if (selectedDepartment.value) {
      baseFilterParams["filter[department][id][_eq]"] =
        selectedDepartment.value;
    }
    if (selectedRole.value) {
      baseFilterParams["filter[assignedUser][role][name][_eq]"] =
        selectedRole.value;
    }
    if (selectedGender.value) {
      baseFilterParams["filter[assignedUser][gender][_eq]"] =
        selectedGender.value;
    }

    // Replace the sortParam assignment code with this:
    let sortParam = "";
    if (Array.isArray(props.sortBy) && props.sortBy.length > 0) {
      sortParam = props.sortBy
        .map((sortItem) => {
          const direction = sortItem.order === "desc" ? "-" : "";
          return `${direction}${sortItem.key}`;
        })
        .join(",");
    } else {
      sortParam = "-employeeId";
    }

    const fieldsToRequest = selectedFieldKeys.join(",");

    if (props.selectedIds && props.selectedIds.length > 0) {
      const selectedIdsString = props.selectedIds.join(",");
      const params = new URLSearchParams({
        ...baseFilterParams,
        "filter[id][_in]": selectedIdsString,
        fields: fieldsToRequest,
      });
      if (sortParam) params.append("sort", sortParam);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch selected employee data");
      const data = await response.json();
      allData = data.data || [];
    } else {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          ...baseFilterParams,
          fields: fieldsToRequest,
          limit: limit,
          page: page,
        });
        if (sortParam) params.append("sort", sortParam);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch employee data batch");
        const data = await response.json();
        allData = allData.concat(data.data || []);
        hasMore = data.data && data.data.length === limit;
        page++;
      }
    }

    // Fetch RFID data if selected
    let rfidMap = {};
    if (includeRFID) {
      const employeeIds = allData
        .map((employee) => employee.id)
        .filter((id) => id);
      rfidMap = await fetchRFIDData(employeeIds);
    }

    const flattenedDataPromises = allData.map(async (item) => {
      const row = {};

      // Process regular fields from personalModule
      for (const key of selectedFieldKeys) {
        const fieldDef = ALL_EXPORT_FIELDS.find((f) => f.key === key);
        const label = fieldDef?.label || key;
        let value = getNestedValue(item, key);

        if (fieldDef?.sensitive) {
          value = await decryptData(value);
        }
        row[label] = value;
      }

      // Add RFID data if selected
      if (includeRFID) {
        row[RFID_FIELD.label] = rfidMap[item.id] || "";
      }

      return row;
    });

    const flattenedData = await Promise.all(flattenedDataPromises);

    if (flattenedData.length === 0) {
      alert("No data found for the selected criteria.");
      isExporting.value = false;
      return;
    }

    if (
      selectedExportFormat.value === "excel" ||
      selectedExportFormat.value === "csv"
    ) {
      // Create a new workbook and worksheet using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Employee Data");

      // Define headers
      const headers = Object.keys(flattenedData[0] || {});
      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.min(Math.max(header.length + 2, 8), 50), // Initial width
      }));

      // Add rows
      flattenedData.forEach((row) => {
        worksheet.addRow(row);
      });

      // Header row styling
      const headerRow = worksheet.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" }, // Blue background
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      });

      // Data rows styling
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        row.eachCell((cell) => {
          const isNumber = !isNaN(cell.value) && cell.value !== null;
          const isDate = cell.value instanceof Date;
          cell.border = {
            top: { style: "thin", color: { argb: "FFD9D9D9" } },
            bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
            left: { style: "thin", color: { argb: "FFD9D9D9" } },
            right: { style: "thin", color: { argb: "FFD9D9D9" } },
          };
        });
      });

      // Adjust column widths based on content
      worksheet.columns.forEach((column, colIndex) => {
        let maxLength = column.header.length;
        worksheet.eachRow((row) => {
          const cellValue = row.getCell(colIndex + 1).value;
          if (cellValue) {
            const length =
              typeof cellValue === "string"
                ? cellValue
                    .split("\n")
                    .reduce((max, line) => Math.max(max, line.length), 0) * 1.2
                : String(cellValue).length;
            maxLength = Math.max(maxLength, length);
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 8), 50);
      });

      // Save the file
      const fileExtension =
        selectedExportFormat.value === "excel" ? "xlsx" : "csv";
      const fileName = `employee_data_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
      const buffer = await workbook[fileExtension].writeBuffer();
      const blob = new Blob([buffer], {
        type:
          fileExtension === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      alert(
        `Employee data exported successfully to ${selectedExportFormat.value.toUpperCase()}!`
      );
    } else if (selectedExportFormat.value === "pdf") {
      const doc = new jsPDF({ orientation: "landscape" });

      // Add title
      doc.setFontSize(16);
      doc.text("Employee Data Export", 14, 20);

      // Group fields by sections
      const selectedSections = sections.filter((section) =>
        section.fields.some(
          (field) =>
            selectedFields[field.key] ||
            (field.key === RFID_FIELD.key && includeRFID)
        )
      );

      let currentY = 30;

      selectedSections.forEach((section, index) => {
        // Ensure all selected fields in the section are included
        const sectionFields = section.fields.filter(
          (field) =>
            selectedFields[field.key] ||
            (field.key === RFID_FIELD.key && includeRFID)
        );
        if (sectionFields.length === 0) return;

        // Add section title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, 14, currentY);
        currentY += 8;

        // Prepare headers and data for this section
        const headers = sectionFields.map((field) => field.label);
        const data = flattenedData.map((row) =>
          sectionFields.map((field) => {
            // Map the row data using the field label to ensure correct value retrieval
            const value = row[field.label] || "";
            return value;
          })
        );

        // Add table for this section
        doc.autoTable({
          startY: currentY,
          head: [headers],
          body: data,
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: "linebreak",
            halign: "left",
            valign: "middle",
          },
          headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "left",
          },
          columnStyles: headers.reduce((styles, header, idx) => {
            styles[idx] = {
              cellWidth:
                header.includes("Email") || header.includes("Address")
                  ? 50
                  : 25,
            };
            return styles;
          }, {}),
          margin: { top: 10, right: 10, bottom: 30, left: 14 },
          didDrawPage: function (data) {
            // Add page number in footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(
              `Page ${pageCount}`,
              doc.internal.pageSize.width - 20,
              doc.internal.pageSize.height - 10,
              { align: "right" }
            );
          },
        });

        // Update Y position for next section
        currentY = doc.lastAutoTable.finalY + 15;

        // Add page break if not the last section and content might overflow
        if (
          index < selectedSections.length - 1 &&
          currentY > doc.internal.pageSize.height - 50
        ) {
          doc.addPage();
          currentY = 20;
        }
      });

      doc.save("employee_data.pdf");
      alert("Employee data exported successfully to PDF!");
    }
  } catch (error) {
    console.error("Error during export:", error);
    alert(`An error occurred during export: ${error.message}`);
  } finally {
    isExporting.value = false;
    emit("close");
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 4px;
  width: 670px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
}
.export-options {
  margin-bottom: 16px;
}
.sections {
  margin-bottom: 16px;
}
.section {
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
}
.section-header {
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.section-header input[type="checkbox"] {
  margin-right: 8px;
}
.section-header span {
  flex: 1;
}
.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}
.chevron.rotate {
  transform: rotate(180deg);
}
.section-content {
  padding: 8px 12px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}
.field {
  padding: 4px 0;
  display: flex;
  align-items: center;
}
.field input[type="checkbox"] {
  margin-right: 8px;
}
.filters {
  margin-bottom: 16px;
}
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.filter-row select,
.filter-row input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.date-input {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.date-input label {
  font-size: 12px;
  margin-bottom: 4px;
  color: #666;
}
.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
}
.export-btn {
  width: 100%;
  padding: 10px;
  background: #000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.export-btn:hover {
  background: #333;
}
/* Checkbox styling */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
}
</style>

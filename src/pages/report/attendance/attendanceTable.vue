<template>
  <v-app>
    <v-container class="app-wrapper" fluid>
      <div v-if="loading" class="d-flex justify-center align-center pa-6">
        <v-progress-circular
          indeterminate
          color="#68ade1"
          size="48"
          width="5"
        ></v-progress-circular>
      </div>
      <div v-else>
        <div class="d-flex justify-end mb-4">
          <BaseButton
            variant="primary"
            size="md"
            text="Generate All Access Levels Report"
            :leftIcon="Shield"
            :loading="isGeneratingAll"
            :disabled="isGeneratingAll || loadingAccessLevels"
            @click="generateAllAccessLevelsReport"
          />
        </div>
        <!-- Access Levels Table -->
        <DataTableWrapper title="Access Levels" :showSearch="true">
          <!-- Loading State -->
          <SkeletonLoader
            v-if="loadingAccessLevels"
            variant="data-table"
            :rows="5"
            :columns="4"
          />

          <!-- Error State -->
          <div
            v-else-if="accessLevelsError"
            class="text-center p-8 text-red-500"
          >
            Failed to load access levels: {{ accessLevelsError }}
            <div class="mt-4">
              <BaseButton
                text="Retry"
                variant="primary"
                size="sm"
                @click="fetchAccessLevels"
              />
            </div>
          </div>

          <!-- Table -->
          <DataTable
            v-else
            :items="formattedAccessLevels"
            :columns="accessLevelHeaders"
            :showSelection="false"
            :expandable="false"
            show-header
            :row-clickable="false"
          >
            <!-- Actions Cell -->
            <template #cell-actions="{ item }">
              <BaseButton
                variant="primary"
                size="sm"
                text="Generate Report"
                :leftIcon="Shield"
                :loading="isGenerating && selectedAccessLevel === item.id"
                :disabled="isGenerating"
                @click="() => generateAccessLevelReport(item.id)"
              />
            </template>

            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey" class="mb-4"
                  >mdi-shield-account-outline</v-icon
                >
                <p class="text-grey mb-4">No access levels found</p>
                <BaseButton
                  text="Refresh"
                  variant="primary"
                  size="md"
                  @click="fetchAccessLevels"
                />
              </div>
            </template>
          </DataTable>
        </DataTableWrapper>

        <!-- Dialog for Report Configuration -->
        <v-dialog v-model="dialog" max-width="600px" persistent>
          <v-card>
            <v-card-title class="text-h6">
              {{
                dialogType === "AccessLevel"
                  ? "Access Level Report Configuration"
                  : ""
              }}
            </v-card-title>
            <v-card-text>
              <v-form ref="form" @submit.prevent="generateReport">
                <!-- Access Level Selection -->
                <div v-if="dialogType === 'AccessLevel'" class="select-wrapper">
                  <v-select
                    v-model="selectedAccessLevel"
                    :items="availableAccessLevels"
                    item-title="accessLevelName"
                    item-value="id"
                    label="Access Level *"
                    :loading="loadingAccessLevels"
                    :disabled="loadingAccessLevels"
                    variant="outlined"
                    dense
                    required
                  >
                    <template v-slot:prepend-inner>
                      <v-icon v-if="!loadingAccessLevels"
                        >mdi-shield-account</v-icon
                      >
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                    </template>
                  </v-select>
                </div>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <BaseButton
                variant="danger"
                size="md"
                text="Cancel"
                :leftIcon="XCircle"
                @click="dialog = false"
              />

              <BaseButton
                variant="primary"
                size="md"
                :text="isGenerating ? 'Generating...' : 'Generate Report'"
                :leftIcon="isGenerating ? null : Check"
                :loading="isGenerating"
                :disabled="isGenerating"
                @click="generateReport"
              />
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Error Snackbar -->
        <v-snackbar v-model="showError" color="error" :timeout="5000">
          {{ errorMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showError = false">Close</v-btn>
          </template>
        </v-snackbar>

        <!-- Success Snackbar -->
        <v-snackbar v-model="showSuccess" color="success" :timeout="3000">
          {{ successMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showSuccess = false"
              >Close</v-btn
            >
          </template>
        </v-snackbar>
        <!-- Warning Snackbar (Yellow) -->
        <v-snackbar v-model="showWarning" color="warning" :timeout="4000">
          {{ warningMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showWarning = false"
              >Close</v-btn
            >
          </template>
        </v-snackbar>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import * as XLSX from "xlsx";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { XCircle, Check, Shield, RefreshCw } from "lucide-vue-next";

const emit = defineEmits(["closeAddPage"]);
const loading = ref(false);
const showWarning = ref(false);
const warningMessage = ref("");
const form = ref(null);
const dialog = ref(false);
const dialogType = ref("");
const isGenerating = ref(false);
const isGeneratingAll = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const showSuccess = ref(false);
const successMessage = ref("");
const accessLevels = ref([]);
const loadingAccessLevels = ref(false);
const accessLevelsError = ref(null);
const selectedAccessLevel = ref(null);
const doors = ref([]);
const loadingDoors = ref(false);
const availableAccessLevels = computed(() => accessLevels.value);

// Table headers for access levels - updated for DataTable component
const accessLevelHeaders = ref([
  {
    label: "Access Level Number",
    key: "accessLevelNumber",
    sortable: true,
    width: "180px",
  },
  {
    label: "Access Level Name",
    key: "accessLevelName",
    sortable: true,
    width: "200px",
  },
  { label: "Access Type", key: "accessType", sortable: true, width: "150px" },
  {
    label: "Actions",
    key: "actions",
    sortable: false,
    width: "200px",
    align: "center",
  },
]);

// Format access levels for DataTable
const formattedAccessLevels = computed(() => {
  return accessLevels.value.map((level) => ({
    accessLevelNumber: level.accessLevelNumber || "N/A",
    accessLevelName: level.accessLevelName || "N/A",
    accessType: level.accessType ? "True" : "False",
    actions: "", // This will be handled by the template slot
    id: level.id,
  }));
});

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const showErrorToast = (message) => {
  errorMessage.value = message;
  showError.value = true;
};

const showSuccessToast = (message) => {
  successMessage.value = message;
  showSuccess.value = true;
};

const showWarningToast = (message) => {
  warningMessage.value = message;
  showWarning.value = true;
};

const openDialog = (type) => {
  dialogType.value = type;
  dialog.value = true;

  if (type === "AccessLevel") {
    selectedAccessLevel.value = null;
  }
};
const generateAllAccessLevelsReport = async () => {
  if (accessLevels.value.length === 0) {
    showErrorToast("No access levels available to generate report");
    return;
  }

  isGeneratingAll.value = true;
  try {
    await fetchAllAccessLevelsData();
  } catch (error) {
    console.error("Error generating all access levels report:", error);
    showErrorToast(
      "Failed to generate all access levels report. Please try again."
    );
  } finally {
    isGeneratingAll.value = false;
  }
};

// New function to fetch data for all access levels
const fetchAllAccessLevelsData = async () => {
  try {
    const allAccessLevelsData = [];

    // Process each access level
    for (const accessLevel of accessLevels.value) {
      // Fetch door details for assigned doors
      const assignedDoors = accessLevel.assignDoorsGroup || [];
      const doorDetails = await fetchDoorDetails(assignedDoors);

      // Transform data for this access level
      const processedData = await transformAccessLevelData(
        accessLevel,
        doorDetails
      );

      allAccessLevelsData.push({
        accessLevel: accessLevel,
        data: processedData,
        doorDetails: doorDetails,
      });
    }

    if (allAccessLevelsData.length === 0) {
      showErrorToast("No access level data available");
      return;
    }

    downloadAllAccessLevelsExcel(
      allAccessLevelsData,
      "All_Access_Levels_Report"
    );
  } catch (error) {
    console.error("Error fetching all access levels data:", error);
    throw error;
  }
};
const downloadAllAccessLevelsExcel = (allAccessLevelsData, reportTitle) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Create a worksheet for each access level
    allAccessLevelsData.forEach((accessLevelData, index) => {
      const accessLevel = accessLevelData.accessLevel;
      const data = accessLevelData.data;

      // Create sheet name (limit to 31 characters for Excel)
      const sheetName =
        `AL_${accessLevel.accessLevelNumber || index + 1}`.substring(0, 31);

      const worksheet = XLSX.utils.json_to_sheet(data);

      // Set column widths for better readability
      worksheet["!cols"] = [
        { wch: 30 }, // Column A width
        { wch: 30 }, // Column B width
        { wch: 30 }, // Column C width
      ];

      // Apply styling
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];

          if (cell) {
            // Apply left alignment to all cells
            if (!cell.s) cell.s = {};
            if (!cell.s.alignment) cell.s.alignment = {};
            cell.s.alignment.horizontal = "left";

            // Additional styling for headers
            if (cell.v && typeof cell.v === "string") {
              // Style main section headers
              if (
                cell.v.includes("ACCESS LEVEL BASIC INFORMATION") ||
                cell.v.includes("ASSIGNED DOORS DETAILS")
              ) {
                cell.s.font = { bold: true, sz: 14 };
                cell.s.fill = { fgColor: { rgb: "DDEBF7" } };
              }
              // Style door section headers
              else if (cell.v.includes("--- Door")) {
                cell.s.font = { bold: true };
                cell.s.fill = { fgColor: { rgb: "F2F2F2" } };
              }
              // Style field names (left column)
              else if (C === 0 && !cell.v.includes("---")) {
                cell.s.font = { bold: true };
              }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Create summary sheet
    createSummarySheet(workbook, allAccessLevelsData);

    const fileName = `${reportTitle}_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    showSuccessToast(
      `${reportTitle.replace(/_/g, " ")} downloaded successfully!`
    );
    emit("closeAddPage");
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    throw error;
  }
};
const createSummarySheet = (workbook, allAccessLevelsData) => {
  const summaryData = [];

  // Summary header
  summaryData.push({
    A: "ACCESS LEVELS SUMMARY REPORT",
    B: "",
    C: "",
    D: "",
    E: "",
  });
  summaryData.push({
    A: `Generated on: ${new Date().toLocaleString()}`,
    B: "",
    C: "",
    D: "",
    E: "",
  });
  summaryData.push({
    A: `Total Access Levels: ${allAccessLevelsData.length}`,
    B: "",
    C: "",
    D: "",
    E: "",
  });
  summaryData.push({ A: "", B: "", C: "", D: "", E: "" }); // Empty row

  // Summary headers
  summaryData.push({
    A: "Access Level Number",
    B: "Access Level Name",
    C: "Access Type",
    D: "24 Hours Access",
    E: "Total Assigned Doors",
  });

  // Summary data for each access level
  allAccessLevelsData.forEach((accessLevelData) => {
    const level = accessLevelData.accessLevel;
    summaryData.push({
      A: level.accessLevelNumber || "N/A",
      B: level.accessLevelName || "N/A",
      C: level.accessType ? "True" : "False",
      D: level._24hrs ? "True" : "False",
      E: accessLevelData.doorDetails.length,
    });
  });

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);

  // Set column widths for summary
  summaryWorksheet["!cols"] = [
    { wch: 25 }, // Column A
    { wch: 25 }, // Column B
    { wch: 15 }, // Column C
    { wch: 15 }, // Column D
    { wch: 20 }, // Column E
  ];

  // Style summary sheet
  const range = XLSX.utils.decode_range(summaryWorksheet["!ref"]);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = summaryWorksheet[cellAddress];

      if (cell) {
        if (!cell.s) cell.s = {};
        if (!cell.s.alignment) cell.s.alignment = {};
        cell.s.alignment.horizontal = "left";

        // Style header row
        if (R === 4) {
          // Summary headers row
          cell.s.font = { bold: true };
          cell.s.fill = { fgColor: { rgb: "E6F3FF" } };
        }
        // Style main title
        else if (R === 0) {
          cell.s.font = { bold: true, sz: 16 };
          cell.s.fill = { fgColor: { rgb: "DDEBF7" } };
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
};
const fetchAccessLevels = async () => {
  loadingAccessLevels.value = true;
  accessLevelsError.value = null;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=accessLevelNumber&fields[]=accessLevelName&fields[]=accessType&fields[]=_24hrs&fields[]=workingHours&fields[]=maxWorkHours&fields[]=assignDoorsGroup&fields[]=Valid_hours`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch access levels");
    const data = await response.json();
    accessLevels.value = data.data || [];
  } catch (error) {
    console.error("Error fetching access levels:", error);
    accessLevelsError.value = error.message;
    showErrorToast("Failed to load access levels");
  } finally {
    loadingAccessLevels.value = false;
  }
};

const fetchDoorDetails = async (doorIds) => {
  if (!doorIds || doorIds.length === 0) return [];

  loadingDoors.value = true;
  try {
    const doorPromises = doorIds.map(async (doorId) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/doors?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][id][_eq]=${doorId}&fields[]=id&fields[]=doorNumber&fields[]=doorName&fields[]=doorType&fields[]=doorsConfigure`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Failed to fetch door ${doorId}`);
      const data = await response.json();
      return data.data[0] || null;
    });

    const doorResults = await Promise.all(doorPromises);
    return doorResults.filter((door) => door !== null);
  } catch (error) {
    console.error("Error fetching door details:", error);
    showErrorToast("Failed to load door details");
    return [];
  } finally {
    loadingDoors.value = false;
  }
};

const generateReport = async () => {
  if (dialogType.value === "AccessLevel" && !selectedAccessLevel.value) {
    showErrorToast("Please select an access level");
    return;
  }

  isGenerating.value = true;
  try {
    if (dialogType.value === "AccessLevel") {
      await fetchAccessLevelData();
    }
    dialog.value = false;
  } catch (error) {
    console.error("Error generating report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const generateAccessLevelReport = async (accessLevelId) => {
  selectedAccessLevel.value = accessLevelId;
  isGenerating.value = true;
  try {
    await fetchAccessLevelData();
  } catch (error) {
    console.error("Error generating access level report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const fetchAccessLevelData = async () => {
  try {
    // Find the selected access level
    const selectedAccessLevelData = accessLevels.value.find(
      (level) => level.id === selectedAccessLevel.value
    );

    if (!selectedAccessLevelData) {
      throw new Error("Selected access level not found");
    }

    // Fetch door details for assigned doors
    const assignedDoors = selectedAccessLevelData.assignDoorsGroup || [];
    const doorDetails = await fetchDoorDetails(assignedDoors);

    // Transform data for Excel
    const processedData = await transformAccessLevelData(
      selectedAccessLevelData,
      doorDetails
    );

    if (processedData.length === 0) {
      showErrorToast("No access level data available");
      return;
    }

    downloadAccessLevelExcel(processedData, "Access_Level_Report");
  } catch (error) {
    console.error("Error fetching access level data:", error);
    throw error;
  }
};

const transformAccessLevelData = async (accessLevelData, doorDetails) => {
  const processedData = [];

  // SECTION 1: ACCESS LEVEL BASIC INFORMATION
  processedData.push({
    A: "ACCESS LEVEL BASIC INFORMATION",
    B: "",
    C: "",
  });

  // Access Level Basic Information in key-value format
  const basicInfo = [
    {
      Field: "Access Level Number",
      Value: accessLevelData.accessLevelNumber || "N/A",
    },
    {
      Field: "Access Level Name",
      Value: accessLevelData.accessLevelName || "N/A",
    },
    {
      Field: "Access Type",
      Value: accessLevelData.accessType ? "True" : "False",
    },
    {
      Field: "24 Hours Access",
      Value: accessLevelData._24hrs ? "True" : "False",
    },
    {
      Field: "Working Hours",
      Value: accessLevelData.workingHours ? "True" : "False",
    },
    {
      Field: "Max Work Hours",
      Value: accessLevelData.maxWorkHours || "Not Set",
    },
    { Field: "Valid Hours", Value: accessLevelData.Valid_hours || "Not Set" },
    { Field: "Total Assigned Doors", Value: doorDetails.length },
  ];

  // Add basic information to processed data
  basicInfo.forEach((info) => {
    processedData.push({
      A: info.Field,
      B: info.Value,
      C: "",
    });
  });

  // SECTION 2: ASSIGNED DOORS DETAILS
  if (doorDetails.length > 0) {
    processedData.push({ A: "", B: "", C: "" }); // Empty row for spacing
    processedData.push({
      A: "ASSIGNED DOORS DETAILS",
      B: "",
      C: "",
    });

    // Add door details headers
    processedData.push({
      A: "Door Details",
      B: "Values",
      C: "",
    });

    // Add each door's details in a structured way
    doorDetails.forEach((door, index) => {
      processedData.push({
        A: `--- Door ${index + 1} ---`,
        B: "",
        C: "",
      });
      processedData.push({
        A: "Door Number",
        B: door.doorNumber || "N/A",
        C: "",
      });
      processedData.push({
        A: "Door Name",
        B: door.doorName || "N/A",
        C: "",
      });
      processedData.push({
        A: "Door Type",
        B: door.doorType || "N/A",
        C: "",
      });
      processedData.push({
        A: "Device ID",
        B: door.doorsConfigure?.deviceId || "Not Set",
        C: "",
      });
      processedData.push({
        A: "Door Open Timer (sec)",
        B: door.doorsConfigure?.doorOpenTimer || "Not Set",
        C: "",
      });
      processedData.push({
        A: "Delay Timer",
        B: door.doorsConfigure?.delayTimer || "Not Set",
        C: "",
      });
      processedData.push({
        A: "Sensor Mode",
        B: door.doorsConfigure?.sensorMode ? "Enabled" : "Disabled",
        C: "",
      });
      processedData.push({
        A: "Passive Mode",
        B: door.doorsConfigure?.passiveMode ? "Enabled" : "Disabled",
        C: "",
      });
      processedData.push({
        A: "Schedule Entry Time",
        B: door.doorsConfigure?.scheduleTime?.entryTime || "Not Set",
        C: "",
      });
      processedData.push({
        A: "Schedule Exit Time",
        B: door.doorsConfigure?.scheduleTime?.exitTime || "Not Set",
        C: "",
      });
      processedData.push({ A: "", B: "", C: "" }); // Empty row between doors
    });
  } else {
    processedData.push({ A: "", B: "", C: "" }); // Empty row for spacing
    processedData.push({
      A: "ASSIGNED DOORS DETAILS",
      B: "",
      C: "",
    });
    processedData.push({
      A: "Status",
      B: "No doors assigned to this access level",
      C: "",
    });
  }

  return processedData;
};

const downloadAccessLevelExcel = (data, reportTitle) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 30 }, // Column A width
      { wch: 30 }, // Column B width
      { wch: 30 }, // Column C width
    ];

    // Apply styling - set all cells to left alignment
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];

        if (cell) {
          // Apply left alignment to all cells
          if (!cell.s) cell.s = {};
          if (!cell.s.alignment) cell.s.alignment = {};
          cell.s.alignment.horizontal = "left";

          // Additional styling for headers
          if (cell.v && typeof cell.v === "string") {
            // Style main section headers
            if (
              cell.v.includes("ACCESS LEVEL BASIC INFORMATION") ||
              cell.v.includes("ASSIGNED DOORS DETAILS")
            ) {
              cell.s.font = { bold: true, sz: 14 };
              cell.s.fill = { fgColor: { rgb: "DDEBF7" } };
            }
            // Style door section headers
            else if (cell.v.includes("--- Door")) {
              cell.s.font = { bold: true };
              cell.s.fill = { fgColor: { rgb: "F2F2F2" } };
            }
            // Style field names (left column)
            else if (C === 0 && !cell.v.includes("---")) {
              cell.s.font = { bold: true };
            }
          }
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);

    // Get the access level name for filename
    const selectedAccessLevelData = accessLevels.value.find(
      (level) => level.id === selectedAccessLevel.value
    );
    const accessLevelName =
      selectedAccessLevelData?.accessLevelName || "AccessLevel";

    const fileName = `${reportTitle}_${accessLevelName.replace(/\s+/g, "_")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    showSuccessToast(
      `${reportTitle.replace(/_/g, " ")} downloaded successfully!`
    );
    emit("closeAddPage");
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    throw error;
  }
};

onMounted(() => {
  fetchAccessLevels();
});
</script>

<style scoped>
.app-wrapper {
  height: 80vh;
  background-color: white;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;
  box-sizing: border-box;
  overflow-y: auto;
}

.select-wrapper {
  position: relative;
  max-width: 24rem;
}
</style>

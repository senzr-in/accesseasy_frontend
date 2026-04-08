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
        <!-- Device Report Table -->
        <DataTableWrapper title="Device Reports" :showSearch="true">
          <template #toolbar-actions>
            <BaseButton
              variant="primary"
              size="md"
              text="Generate All Devices Report"
              :leftIcon="Download"
              @click="generateAllDevicesReport"
              :loading="isGeneratingAll"
              :disabled="isGenerating || devices.length === 0"
              class="mr-2"
            />
            <!-- <BaseButton
              variant="primary"
              size="md"
              text="Refresh Devices"
              :leftIcon="RefreshCw"
              @click="fetchDevices"
              :loading="loadingDevices"
            /> -->
          </template>

          <!-- Loading State -->
          <SkeletonLoader
            v-if="loadingDevices"
            variant="data-table"
            :rows="5"
            :columns="4"
          />

          <!-- Error State -->
          <div v-else-if="devicesError" class="text-center p-8 text-red-500">
            Failed to load devices: {{ devicesError }}
            <div class="mt-4">
              <BaseButton
                text="Retry"
                variant="primary"
                size="sm"
                @click="fetchDevices"
              />
            </div>
          </div>

          <!-- Table -->
          <DataTable
            v-else
            :items="formattedDevices"
            :columns="deviceHeaders"
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
                :leftIcon="Wrench"
                :loading="isGenerating && selectedDevice === item.id"
                :disabled="isGenerating || isGeneratingAll"
                @click="() => generateDeviceReport(item.rawData)"
              />
            </template>

            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey" class="mb-4"
                  >mdi-devices-off</v-icon
                >
                <p class="text-grey mb-4">No devices found</p>
                <BaseButton
                  text="Refresh"
                  variant="primary"
                  size="md"
                  @click="fetchDevices"
                />
              </div>
            </template>
          </DataTable>
        </DataTableWrapper>

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
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import { Wrench, RefreshCw, Download } from "lucide-vue-next";

const emit = defineEmits(["closeAddPage"]);
const loading = ref(false);
const showWarning = ref(false);
const warningMessage = ref("");
const form = ref(null);

const isGenerating = ref(false);
const isGeneratingAll = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const showSuccess = ref(false);
const successMessage = ref("");

const devices = ref([]);
const loadingDevices = ref(false);
const devicesError = ref(null);
const selectedDevice = ref(null);

// Table headers for devices - updated for DataTable component
const deviceHeaders = ref([
  { label: "Device Name", key: "deviceName", sortable: true, width: "200px" },
  {
    label: "Serial Number",
    key: "serialNumber",
    sortable: true,
    width: "180px",
  },
  {
    label: "Controller Name",
    key: "controllerName",
    sortable: true,
    width: "200px",
  },
  {
    label: "Actions",
    key: "actions",
    sortable: false,
    width: "200px",
    align: "center",
  },
]);

// Format devices for DataTable
const formattedDevices = computed(() => {
  return devices.value.map((device) => ({
    deviceName: device.deviceName || "N/A",
    serialNumber: device.sn || "N/A",
    controllerName: device.controllerName || "N/A",
    actions: "", // This will be handled by the template slot
    rawData: device,
    id: device.id,
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

const fetchDevices = async () => {
  loadingDevices.value = true;
  devicesError.value = null;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=controllerName&fields[]=id&fields[]=selectedDoors&fields[]=deviceName&fields[]=sn`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch devices");

    const data = await response.json();
    devices.value = data.data || [];
  } catch (error) {
    console.error("Error fetching devices:", error);
    devicesError.value = error.message;
    showErrorToast("Failed to load devices");
  } finally {
    loadingDevices.value = false;
  }
};

// Individual device report generation
const generateDeviceReport = async (device) => {
  selectedDevice.value = device.id;
  isGenerating.value = true;

  try {
    await fetchDeviceData(device);
  } catch (error) {
    console.error("Error generating report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
    selectedDevice.value = null;
  }
};

// All devices report generation
const generateAllDevicesReport = async () => {
  if (devices.value.length === 0) {
    showWarningToast("No devices available to generate report");
    return;
  }

  isGeneratingAll.value = true;

  try {
    const allDevicesData = [];

    // Fetch data for all devices sequentially to avoid overwhelming the API
    for (const device of devices.value) {
      try {
        const deviceData = await fetchDeviceDataForAll(device);
        if (deviceData) {
          allDevicesData.push(deviceData);
        }
      } catch (error) {
        console.error(`Error fetching data for device ${device.id}:`, error);
        // Continue with other devices even if one fails
      }
    }

    if (allDevicesData.length > 0) {
      transformAllDevicesData(allDevicesData);
    } else {
      showErrorToast("Failed to generate report for any devices");
    }
  } catch (error) {
    console.error("Error generating all devices report:", error);
    showErrorToast("Failed to generate all devices report");
  } finally {
    isGeneratingAll.value = false;
  }
};

const fetchDeviceData = async (device) => {
  try {
    const doorDetails = await fetchDoorDetails(device.selectedDoors);
    transformDeviceData(device, doorDetails, "individual");
  } catch (error) {
    console.error("Error fetching device data:", error);
    throw error;
  }
};

const fetchDeviceDataForAll = async (device) => {
  try {
    const doorDetails = await fetchDoorDetails(device.selectedDoors);
    return {
      device,
      doorDetails,
    };
  } catch (error) {
    console.error(`Error fetching data for device ${device.id}:`, error);
    return null;
  }
};

const fetchDoorDetails = async (selectedDoors) => {
  const doorDetails = [];

  if (selectedDoors && selectedDoors.length > 0) {
    for (const doorId of selectedDoors) {
      try {
        const doorResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/doors?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][id][_eq]=${doorId}&fields[]=id&fields[]=doorNumber&fields[]=doorName&fields[]=doorType&fields[]=doorsConfigure&fields[]=tenant.tenantName`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!doorResponse.ok) {
          console.warn(`Failed to fetch details for door ${doorId}`);
          continue;
        }

        const doorData = await doorResponse.json();
        if (doorData.data && doorData.data.length > 0) {
          doorDetails.push(doorData.data[0]);
        }
      } catch (error) {
        console.error(`Error fetching door ${doorId}:`, error);
      }
    }
  }

  return doorDetails;
};

// Individual device data transformation
const transformDeviceData = (
  deviceData,
  doorDetails,
  reportType = "individual"
) => {
  const processedData = [];

  // Add device information
  processedData.push({
    Category: "Device Information",
    Field: "Device Name",
    Value: deviceData.deviceName || "N/A",
  });
  processedData.push({
    Category: "",
    Field: "Controller Name",
    Value: deviceData.controllerName || "N/A",
  });
  processedData.push({
    Category: "",
    Field: "Serial Number",
    Value: deviceData.sn || "N/A",
  });

  // Add separator
  processedData.push({
    Category: "",
    Field: "",
    Value: "",
  });

  // Add door configuration header
  processedData.push({
    Category: "Door Configuration",
    Field: "Total Doors",
    Value: doorDetails.length,
  });

  // Add door information
  if (doorDetails.length > 0) {
    doorDetails.forEach((door, index) => {
      processedData.push({
        Category: `Door ${index + 1} Configuration`,
        Field: "Door Name",
        Value: door.doorName || "N/A",
      });

      if (door.doorsConfigure) {
        const config = door.doorsConfigure;

        processedData.push({
          Category: ``,
          Field: "Door Open Timer",
          Value:
            config.doorOpenTimer !== null
              ? `${config.doorOpenTimer} seconds`
              : "N/A",
        });
        processedData.push({
          Category: ``,
          Field: "Delay Timer",
          Value:
            config.delayTimer !== null ? `${config.delayTimer} seconds` : "N/A",
        });
        processedData.push({
          Category: ``,
          Field: "Sensor Mode",
          Value: config.sensorMode ? "Enabled" : "Disabled",
        });
        processedData.push({
          Category: ``,
          Field: "Passive Mode",
          Value: config.passiveMode ? "Enabled" : "Disabled",
        });

        if (config.scheduleTime) {
          processedData.push({
            Category: ``,
            Field: "Entry Time",
            Value: config.scheduleTime.entryTime || "N/A",
          });
          processedData.push({
            Category: ``,
            Field: "Exit Time",
            Value: config.scheduleTime.exitTime || "N/A",
          });
        }
      } else {
        processedData.push({
          Category: `Door ${index + 1} Configuration`,
          Field: "Configuration",
          Value: "No configuration available",
        });
      }

      if (index < doorDetails.length - 1) {
        processedData.push({
          Category: "",
          Field: "",
          Value: "",
        });
      }
    });
  } else {
    processedData.push({
      Category: "Door Configuration",
      Field: "Doors",
      Value: "No doors configured",
    });
  }

  if (reportType === "individual") {
    downloadExcel(processedData, "Device_Report", deviceData.id);
  }

  return processedData;
};

// All devices data transformation
const transformAllDevicesData = (allDevicesData) => {
  const allProcessedData = [];

  allDevicesData.forEach((deviceData, deviceIndex) => {
    const { device, doorDetails } = deviceData;

    // Add device header with separator
    if (deviceIndex > 0) {
      // Add separator between devices
      allProcessedData.push({
        Category: "",
        Field: "",
        Value: "",
      });
      allProcessedData.push({
        Category: "════════════════════════════════════════",
        Field: "════════════════════════════════════════",
        Value: "════════════════════════════════════════",
      });
      allProcessedData.push({
        Category: "",
        Field: "",
        Value: "",
      });
    }

    // Add device information
    allProcessedData.push({
      Category: `DEVICE ${deviceIndex + 1}`,
      Field: "Device Name",
      Value: device.deviceName || "N/A",
    });
    allProcessedData.push({
      Category: "",
      Field: "Controller Name",
      Value: device.controllerName || "N/A",
    });
    allProcessedData.push({
      Category: "",
      Field: "Serial Number",
      Value: device.sn || "N/A",
    });

    // Add separator
    allProcessedData.push({
      Category: "",
      Field: "",
      Value: "",
    });

    // Add door configuration header
    allProcessedData.push({
      Category: "Door Configuration",
      Field: "Total Doors",
      Value: doorDetails.length,
    });

    // Add door information
    if (doorDetails.length > 0) {
      doorDetails.forEach((door, doorIndex) => {
        allProcessedData.push({
          Category: `Door ${doorIndex + 1} Configuration`,
          Field: "Door Name",
          Value: door.doorName || "N/A",
        });

        if (door.doorsConfigure) {
          const config = door.doorsConfigure;

          allProcessedData.push({
            Category: ``,
            Field: "Door Open Timer",
            Value:
              config.doorOpenTimer !== null
                ? `${config.doorOpenTimer} seconds`
                : "N/A",
          });
          allProcessedData.push({
            Category: ``,
            Field: "Delay Timer",
            Value:
              config.delayTimer !== null
                ? `${config.delayTimer} seconds`
                : "N/A",
          });
          allProcessedData.push({
            Category: ``,
            Field: "Sensor Mode",
            Value: config.sensorMode ? "Enabled" : "Disabled",
          });
          allProcessedData.push({
            Category: ``,
            Field: "Passive Mode",
            Value: config.passiveMode ? "Enabled" : "Disabled",
          });

          if (config.scheduleTime) {
            allProcessedData.push({
              Category: ``,
              Field: "Entry Time",
              Value: config.scheduleTime.entryTime || "N/A",
            });
            allProcessedData.push({
              Category: ``,
              Field: "Exit Time",
              Value: config.scheduleTime.exitTime || "N/A",
            });
          }
        } else {
          allProcessedData.push({
            Category: `Door ${doorIndex + 1} Configuration`,
            Field: "Configuration",
            Value: "No configuration available",
          });
        }

        // Add separator between doors (except after the last door of the last device)
        if (doorIndex < doorDetails.length - 1) {
          allProcessedData.push({
            Category: "",
            Field: "",
            Value: "",
          });
        }
      });
    } else {
      allProcessedData.push({
        Category: "Door Configuration",
        Field: "Doors",
        Value: "No doors configured",
      });
    }
  });

  downloadExcel(allProcessedData, "All_Devices_Report", "all_devices");
};

const downloadExcel = (data, reportTitle, deviceId) => {
  try {
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Add headers
    XLSX.utils.sheet_add_aoa(worksheet, [["Category", "Field", "Value"]], {
      origin: "A1",
    });

    // Add data
    if (data.length > 0) {
      XLSX.utils.sheet_add_json(worksheet, data, {
        origin: "A2",
        skipHeader: true,
      });
    }

    // Set column widths
    worksheet["!cols"] = [
      { wch: 30 }, // Category
      { wch: 25 }, // Field
      { wch: 30 }, // Value
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);

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

onMounted(() => {
  fetchDevices();
});
</script>

<style scoped>
.app-wrapper {
  max-height: 80vh;
  background-color: white;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;
  box-sizing: border-box;
  overflow-y: auto;
}

.select-wrapper {
  position: relative;
}

.month-input-wrapper {
  position: relative;
  max-width: 24rem;
}

.date-input-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 24rem;
}

.mr-2 {
  margin-right: 8px;
}
</style>

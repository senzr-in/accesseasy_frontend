<template>
  <div class="generate-report-container">
    <v-toolbar flat class="header-toolbar px-4" height="64">
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-2"
          @click="$emit('closeAddPage')"
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
          @click="$emit('closeAddPage')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="white"
          style="background-color: black !important"
          prepend-icon="mdi-check"
          @click="fetchAttendanceData"
          elevation="0"
        >
          Generate
        </v-btn>
      </div>
    </v-toolbar>

    <div class="d-flex layout-container">
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
                :items="['AbsentReport', 'PresentReport']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Report Type is required']"
                hide-details="auto"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" size="20"
                    >mdi-file-document-outline</v-icon
                  >
                </template>
              </v-select>
            </div>

            <div class="form-group">
              <v-select
                v-model="branch"
                label="Branch"
                :items="availableBranches"
                item-title="branchName"
                item-value="id"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :loading="loadingBranches"
                :rules="[(v) => !!v || 'Branch is required']"
                hide-details="auto"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" size="20">mdi-office-building</v-icon>
                </template>
              </v-select>
            </div>

            <div class="form-group">
              <v-select
                v-model="selectedDepartment"
                :items="departmentOptions"
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
                v-model="startDate"
                label="Start Date"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Start Date is required']"
                hide-details="auto"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" size="20">mdi-calendar-start</v-icon>
                </template>
              </v-text-field>
            </div>

            <div class="form-group">
              <v-text-field
                v-model="endDate"
                label="End Date"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'End Date is required']"
                hide-details="auto"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" size="20">mdi-calendar-end</v-icon>
                </template>
              </v-text-field>
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
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const emit = defineEmits(["closeAddPage"]);
const form = ref(null);
const formatOptions = ["Pdf", "Excel"];
const format = ref(null);
const branches = ref([]);
const loadingBranches = ref(false);
const departmentOptions = ref();
const selectedDepartment = ref(null);
const branch = ref();
const startDate = ref();
const endDate = ref();
const reportType = ref();
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const fetchBranches = async () => {
  loadingBranches.value = true;

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
      ...data.data.map((department) => ({
        title: department.departmentName,
        value: department.id,
      })),
    ];
  } catch (error) {
    console.error("Error fetching departments:", error);
    showSnackbar("Error fetching departments: " + error.message, "error");
  } finally {
    loadingDepartments.value = false;
  }
};

const attendance = () => {
  if (reportType.value == "AbsentReport") {
    return "absent";
  }
  if (reportType.value == "PresentReport") {
    return "present";
  }
};

const fetchAttendanceData = async () => {
  const attendanceType = attendance();
  try {
    const params = {
      "filter[_and][0][date][_between][0]": startDate.value,
      "filter[_and][0][date][_between][1]": endDate.value,
      "filter[_and][1][attendance][_eq]": attendanceType,
      "filter[_and][2][employeeId][assignedBranch][branch_id][_eq]":
        branch.value,
      fields: [
        "employeeId.assignedUser.first_name",
        "employeeId.employeeId",
        "employeeId.assignedDepartment.department_id.departmentName",
        "employeeId.assignedBranch.branch_id.branchName",
        "attendance",
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
      `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance data");
    }

    const data = await response.json();

    if (data.data.length === 0) {
      alert("No reports Available");
      return;
    }

    transformedData(data);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  }
};

const transformedData = (data) => {
  const processedData = data.data.map((item) => ({
    Name: item.employeeId?.assignedUser?.first_name,
    EmployeeID: item.employeeId?.employeeId,
    Department: item.employeeId?.assignedDepartment[0]?.department_id?.departmentName,
    Branch: item.employeeId?.assignedBranch[0]?.branch_id?.branchName,
    Attendance: item.attendance,
  }));

  downloadFormat(processedData);
};

const downloadFormat = async (data) => {
  let fileBlob;
  let fileType;

  if (format.value === "Pdf") {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Attendance Report", 105, 22, { align: "center" });

    doc.setFontSize(10);
    doc.text(`From: ${startDate.value} To: ${endDate.value}`, 105, 30, {
      align: "center",
    });

    doc.autoTable({
      startY: 40,
      head: [["Name", "Employee ID", "Department", "Branch", "Attendance"]],
      body: data.map((item) => [
        item.Name,
        item.EmployeeID,
        item.Department,
        item.Branch,
        item.Attendance,
      ]),
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "center",
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        fontStyle: "bold",
      },
    });
    fileBlob = doc.output("blob");
    fileType = "pdf";
  } else if (format.value === "Excel") {
    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = Object.keys(data[0]).map(() => ({ wch: 15 }));

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = { alignment: { horizontal: "center" } };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    fileBlob = new Blob(
      [XLSX.write(workbook, { type: "array", bookType: "xlsx", raw: true })],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );
    fileType = "xlsx";
  } else {
    throw new Error("Invalid report type");
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
    collectionName: "Attendance",
    fileFormat: format.value,
    status: "generated",
    generatedFile: fileId.id,
    tenant: { tenantId },
    branch: branch.value,
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
      emit("closeAddPage");
    } else {
      throw new Error("Export failed");
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    alert("Failed to export report. Please try again.");
  }
};



onMounted(() => {
  fetchBranches();
  fetchDepartments();
});

const availableBranches = computed(() => branches.value);
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

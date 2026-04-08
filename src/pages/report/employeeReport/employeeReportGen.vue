# Department Add Form
<template>
  <div>
    <v-form ref="form">
      <v-toolbar density="compact" color="grey-lighten-4">
        <v-btn icon color="black" @click="$emit('closeAddPage')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4">Generate Report</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          class="mr-2"
          @click="$emit('closeAddPage')"
          >CANCEL</v-btn
        >
        <v-btn color="black" @click="handleSave">SAVE</v-btn>
      </v-toolbar>

      <div class="d-flex content-wrapper">
        <!-- Side Navigation -->
        <div class="side-nav pa-4">
          <v-list density="compact" nav>
            <v-list-item
              v-for="(item, i) in menuItems"
              :key="i"
              :value="item"
              :active="selectedTab === item.value"
              @click="selectedTab = item.value"
              color="black"
              rounded
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <h2 class="text-h6 mb-4">Basic Details</h2>

            <v-window v-model="selectedTab">
              <!-- Basic Details -->
              <v-window-item value="basic">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="formData.collectionName"
                      label="Collection Name *"
                      :items="['Employee Details']"
                      variant="outlined"
                      :rules="[(v) => !!v || 'Collection Name is required']"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      v-model="formData.branch"
                      label="Branch *"
                      :items="availableBranches"
                      item-title="branchName"
                      item-value="id"
                      variant="outlined"
                      :loading="loadingBranches"
                      :rules="[(v) => !!v || 'Branch is required']"
                      required
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.startDate"
                      label="Start Date *"
                      type="date"
                      variant="outlined"
                      :rules="[(v) => !!v || 'Start Date is required']"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.endDate"
                      label="End Date *"
                      type="date"
                      variant="outlined"
                      :rules="[(v) => !!v || 'End Date is required']"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </v-card>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";

const emit = defineEmits(["closeAddPage"]);
const form = ref(null);
const selectedTab = ref("basic");
const branches = ref([]);
const loadingBranches = ref(false);
const tenantId = currentUserTenant.getTenantId();

const formData = ref({
  collectionName: "",
  branch: null,
  startDate: "",
  endDate: "",
});

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchBranches = async () => {
  loadingBranches.value = true;
  const token = getToken();

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
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

const fetchAttendanceData = async () => {
  const token = getToken();

  try {
    // Debug: Log the form data
    console.log("FormData Value:", formData.value);

    // Get and validate branch value
    const branchValue = formData.value.branch;
    const branch =
      typeof branchValue === "string" ? branchValue.trim() : branchValue;

    console.log("Branch Value:", branch);

    // Construct the API URL with query parameters
    const apiUrl = new URL(
      `${import.meta.env.VITE_API_URL}/items/personalModule`
    );

    // Add date range filters if provided
    if (formData.value.startDate && formData.value.endDate) {
      apiUrl.searchParams.append(
        "filter[_and][0][assignedUser][dateOfJoining][_between][0]",
        formData.value.startDate
      );
      apiUrl.searchParams.append(
        "filter[_and][0][assignedUser][dateOfJoining][_between][1]",
        formData.value.endDate
      );
    }

    // Add branch filter
    apiUrl.searchParams.append(
      "filter[_and][1][assignedBranch][branch_id][_eq]",
      branch
    );

    // Add all required fields
    const fields = [
      "employeeId",
      "accessOn",
      "status",
      "assignedCards.cardManagement_id.id",
      "assignedCards.cardManagement_id.rfidCard",
      "assignedCards.cardManagement_id.type",
      "assignedCards.cardManagement_id.cardAccess",
      "assignedTag.cardManagement_id.rfidCard",
      "assignedTag.cardManagement_id.type",
      "assignedTag.cardManagement_id.cardAccess",
      "assignedDepartment.department_id.id",
      "assignedDepartment.department_id.departmentName",
      "assignedDepartment.department_id.departmentId",
      "assignedAccessLevels.accesslevels_id.accessLevelName",
      "assignedAccessLevels.accesslevels_id.id",
      "assignedAccessLevels.accesslevels_id.accessLevelNumber",
      "id",
      "assignedCards.id",
      "assignedTag.id",
      "assignedDepartment.id",
      "assignedAccessLevels.id",
      "assignedBranch.branch_id.branchName",
      "assignedBranch.branch_id.id",
      "assignedBranch.id",
      "assignedUser.first_name",
      "assignedUser.phone",
      "assignedUser.email",
      "assignedUser.avatar.id",
      "assignedUser.avatar.type",
      "assignedUser.avatar.title",
      "assignedUser.tenant.tenantId",
      "assignedUser.tenant.tenantName",
      "assignedUser.role.name",
      "assignedUser.role.id",
      "assignedUser.id",
      "date_created",
      "assignedUser.accountNumber",
      "assignedUser.aadhar",
      "assignedUser.IFSC",
      "assignedUser.gender",
      "assignedUser.UPI",
      "assignedUser.dateOfLeaving",
      "assignedUser.dateOfJoining",
      "assignedUser.DOB",
      "assignedUser.PFAccountNumber",
      "assignedUser.maritalStatus",
      "assignedUser.ESIAccountNumber",
      "assignedUser.officeEmail",
      "assignedUser.pan",
      "assignedUser.bloodGroup",
      "assignedUser.gst",
    ];

    apiUrl.searchParams.append("fields", fields.join(","));

    console.log("Constructed API URL:", apiUrl.toString());

    // Make the API request
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch employee data");
    }

    const data = await response.json();
    console.log("Fetched data:", data);

    // Process the data if any records exist
    if (data.data && data.data.length > 0) {
      const processedData = data.data.map((record) => ({
        employeeId: record.employeeId || "N/A",
        accessOn: record.accessOn || "N/A",
        status: record.status || "N/A",
        cardId: record.assignedCards?.[0]?.cardManagement_id?.id || "N/A",
        rfidCard:
          record.assignedCards?.[0]?.cardManagement_id?.rfidCard || "N/A",
        cardType: record.assignedCards?.[0]?.cardManagement_id?.type || "N/A",
        cardAccess:
          record.assignedCards?.[0]?.cardManagement_id?.cardAccess || "N/A",
        departmentName:
          record.assignedDepartment?.department_id?.departmentName || "N/A",
        departmentId:
          record.assignedDepartment?.department_id?.departmentId || "N/A",
        accessLevelName:
          record.assignedAccessLevels?.[0]?.accesslevels_id?.accessLevelName ||
          "N/A",
        branchName: record.assignedBranch?.branch_id?.branchName || "N/A",
        firstName: record.assignedUser?.first_name || "N/A",
        phone: record.assignedUser?.phone || "N/A",
        email: record.assignedUser?.email || "N/A",
        tenantId: record.assignedUser?.tenant?.tenantId || "N/A",
        tenantName: record.assignedUser?.tenant?.tenantName || "N/A",
        roleName: record.assignedUser?.role?.name || "N/A",
        dateCreated: record.date_created || "N/A",
        accountNumber: record.assignedUser?.accountNumber || "N/A",
        aadhar: record.assignedUser?.aadhar || "N/A",
        IFSC: record.assignedUser?.IFSC || "N/A",
        gender: record.assignedUser?.gender || "N/A",
        UPI: record.assignedUser?.UPI || "N/A",
        dateOfLeaving: record.assignedUser?.dateOfLeaving || "N/A",
        dateOfJoining: record.assignedUser?.dateOfJoining || "N/A",
        DOB: record.assignedUser?.DOB || "N/A",
        PFAccountNumber: record.assignedUser?.PFAccountNumber || "N/A",
        maritalStatus: record.assignedUser?.maritalStatus || "N/A",
        ESIAccountNumber: record.assignedUser?.ESIAccountNumber || "N/A",
        officeEmail: record.assignedUser?.officeEmail || "N/A",
        pan: record.assignedUser?.pan || "N/A",
        bloodGroup: record.assignedUser?.bloodGroup || "N/A",
        gst: record.assignedUser?.gst || "N/A",
      }));

      console.log("Processed Data for Download:", processedData);
      downloadCSV(processedData);
    } else {
      console.log("No matching records found");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
};

const downloadCSV = (data) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute(
    "download",
    `attendance_report_${formData.value.startDate}_${formData.value.endDate}.csv`
  );
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const handleSave = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    console.error("Form validation failed");
    return;
  }

  await fetchAttendanceData();

  // Make POST call to export endpoint
  const token = getToken();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/export`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: formData.value.startDate,
          endDate: formData.value.endDate,
          collectionName: formData.value.collectionName,
          status: "Requested",
          tenant: { tenantId },
          branch: formData.value.branch ? formData.value.branch : null,
        }),
      }
    );

    if (response.ok) {
      alert("Report generated and exported successfully!");
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
});

const availableBranches = computed(() => branches.value);

const menuItems = [
  {
    title: "Basic Details",
    icon: "mdi-card-text-outline",
    value: "basic",
  },
];
</script>

<style scoped>
.side-nav {
  width: 240px;
  border-right: 1px solid #e0e0e0;
  background-color: white;
}

.content-area {
  flex: 1;
}
</style>

<template>
  <v-container>
    <v-toolbar density="compact" color="grey-lighten-4">
      <v-btn icon color="black" @click="handleClose">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="ml-4">Add TDSDetails</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
        CANCEL
      </v-btn>
    </v-toolbar>

    <!-- LTA Rules Section -->
    <v-card class="mb-6">
      <v-card-title class="text-h5 font-weight-bold">
        Leave Travel Allowance Tax Exemption
      </v-card-title>
      <v-card-text>
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Rules regarding LTA:
        </div>
        <ul class="ml-6">
          <li>
            You can claim LTA exemption for a maximum of 2 trips in one block of
            4 calendar years.
          </li>
          <li>
            Current block started from 01 Jan 2022 and is upto 31 Dec 2025.
          </li>
          <li>You can claim LTA exemption for only one trip in one year.</li>
          <li>
            In case you are unable to claim the LTA exemption twice in one
            block, you can carry forward one journey to the next block.
          </li>
          <li>
            However, the carried forward LTA eligibility has to be utilised in
            the first year of the next block (applicable this year).
          </li>
          <li>
            The day of journey should not be a holiday in your organization.
          </li>
        </ul>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="rentEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.fileId="{ item }">
          <td>
            <v-btn
              icon
              :disabled="!item.fileId"
              @click="downloadFile(item.fileId)"
              title="Download Proof Document"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </td>
        </template>

        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending' && userRole === 'Admin'">
              <v-btn small color="green" class="mr-2" @click="acceptItem(item)">
                Accept
              </v-btn>
              <v-btn small color="red" @click="rejectItem(item)">
                Reject
              </v-btn>
            </div>
            <div v-else>
              <v-chip color="pink lighten-4">
                {{ item.status }}
              </v-chip>
            </div>
          </td>
        </template>

        <template v-slot:item.documentVerified="{ item }">
          <td>
            <div
              v-if="item.documentVerified === 'pending' && userRole === 'Admin'"
            >
              <v-btn
                small
                color="green"
                class="mr-2"
                @click="acceptItem(item, 'document')"
              >
                Verify
              </v-btn>
              <v-btn small color="red" @click="rejectItem(item, 'document')">
                Reject
              </v-btn>
            </div>
            <div v-else>
              <v-chip
                :color="
                  item.documentVerified === 'verified'
                    ? 'green lighten-4'
                    : item.documentVerified === 'rejected'
                      ? 'red lighten-4'
                      : 'grey lighten-4'
                "
                dark
              >
                {{ item.documentVerified }}
              </v-chip>
            </div>
          </td>
        </template>

        <template v-slot:item.actions="{ item }">
          <td>
            <v-icon small @click="deleteItem(item)" class="cursor-pointer"  :disabled="!canEdit">
              mdi-delete
            </v-icon>
          </td>
        </template>
      </v-data-table>

      <v-card-actions class="px-4 pb-4" :disabled="!activeDeclaration?.isDeclarationOpen">
        <v-btn color="primary" variant="outlined" @click="openDialog">
          Add LTA Claim
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- LTA Form Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>New LTA Declaration</span>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="travelForm.amount"
                  label="Amount Paid"
                  prefix="₹"
                  type="number"
                  required
                  :rules="[(v) => !!v || 'Amount is required']"
                  variant="outlined"
                  density="comfortable"
                  :disabled="activeProof?.isProofOpen"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="travelForm.travelStartDate"
                  label="Travel Start Date"
                  type="date"
                  required
                  :rules="[(v) => !!v || 'Start date is required']"
                  variant="outlined"
                  density="comfortable"
                  :disabled="activeProof?.isProofOpen"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="travelForm.travelEndDate"
                  label="Travel End Date"
                  type="date"
                  required
                  :rules="[(v) => !!v || 'End date is required']"
                  variant="outlined"
                  density="comfortable"
                  :disabled="activeProof?.isProofOpen"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="travelForm.origin"
                  label="Origin"
                  required
                  :rules="[(v) => !!v || 'Origin is required']"
                  variant="outlined"
                  density="comfortable"
                  :disabled="activeProof?.isProofOpen"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="travelForm.destination"
                  label="Destination"
                  required
                  :rules="[(v) => !!v || 'Destination is required']"
                  variant="outlined"
                  density="comfortable"
                  :disabled="activeProof?.isProofOpen"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="travelForm.comments"
                  label="Comments"
                  variant="outlined"
                  rows="2"
                  density="comfortable"
                  :disabled="activeProof?.isProofOpen"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  :loading="uploading"
                  @change="(event) => uploadFile(event, travelForm)"
                  label="Upload Proof Document"
                  variant="outlined"
                  color="black"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="save"
            
          >
            Add LTA
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { authService } from "@/services/authService";
import { useRouter, useRoute } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const tenantId = currentUserTenant.getTenantId();

const handleClose = () => {
  router.push({ name: "TdsDeductionDefault", params: { id } });
};

const dialog = ref(false);
const isFormValid = ref(false);
const form = ref(null);

// Form fields
const travelForm = reactive({
  amount: "",
  travelStartDate: "",
  travelEndDate: "",
  origin: "",
  destination: "",
  comments: "",
  document: null,
});

const headers = [
  { title: "Amount Paid", key: "amount" },
  { title: "Travel Start Date", key: "travelStartDate" },
  { title: "Travel End Date", key: "travelEndDate" },
  { title: "Origin", key: "origin" },
  { title: "Destination", key: "destination" },
  { title: "Documents", key: "fileId" },
  { title: "Status", key: "status" },
  { title: "DocumentVerification", key: "documentVerified" },
  { title: "Action", key: "actions" },
];

const fetchItemData = async () => {
  try {
    const params = {
      fields: ["leaveTravel", "id"],
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
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    processEarningsAndDeductions(data);
  } catch (error) {
    console.error("Error fetching item data:", error);
  }
};

const tdsDeductionId = ref("");
const rentEntries = ref([]);
const declaredTravel = ref(0);
const approvedTravel = ref(0);

const processEarningsAndDeductions = (data) => {
  const tds = data?.data || {};
  tdsDeductionId.value = tds?.id;

  rentEntries.value = tds?.leaveTravel?.travelData || [];

  declaredTravel.value = tds?.leaveTravel?.totalDeclaredAmount || 0;
  approvedTravel.value = tds?.leaveTravel?.totalApprovedAmount || 0;
};

// Notification state
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// LTA claims array
const ltaClaims = ref([]);

const openDialog = () => {
  dialog.value = true;
};

const closeDialog = () => {
  // Reset form
  Object.keys(travelForm).forEach((key) => {
    if (key === "amount") {
      travelForm[key] = "";
    } else {
      travelForm[key] = "";
    }
  });
  dialog.value = false;
};

const save = async () => {
  const mandatoryFields = [
    "amount",
    "travelStartDate",
    "travelEndDate",
    "origin",
    "destination",
  ];
  const fieldsToValidate = [...mandatoryFields];

  const missingFields = fieldsToValidate.filter((field) => !travelForm[field]);

  if (missingFields.length > 0) {
    showNotification("Please fill all required fields.", "error");
    return;
  }

  try {
    let updatedTravels = JSON.parse(JSON.stringify(rentEntries.value));

    if (!updatedTravels) {
      updatedTravels = [];
    }

    const maxId = updatedTravels.length
      ? Math.max(...updatedTravels.map((item) => item.id || 0))
      : 0;

    updatedTravels.push({
      id: maxId + 1,
      amount: travelForm.amount,
      travelStartDate: travelForm.travelStartDate,
      travelEndDate: travelForm.travelEndDate,
      origin: travelForm.origin,
      destination: travelForm.destination,
      fileId: travelForm.document,
      comments: travelForm.comments || "",
      status: "pending",
      documentVerified: "pending",
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveTravel: {
            travelData: updatedTravels,
            totalDeclaredAmount: updatedTravels.reduce(
              (sum, travel) => sum + (travel.amount || 0),
              0,
            ),
            totalApprovedAmount: approvedTravel.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update item");

    closeDialog();
    await fetchItemData();
    showNotification("LTA claim added successfully!");
  } catch (err) {
    console.error("PATCH error:", err);
    showNotification("Failed to add LTA claim. Please try again.", "error");
  }
};

const deleteItem = async (item) => {
  try {
    // Remove the item by filtering
    const updatedTravelEntries = rentEntries.value.filter(
      (entry) => entry.id !== item.id,
    );

    // Recalculate totals
    const totalDeclaredAmount = updatedTravelEntries.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0,
    );

    const totalApprovedAmount = Math.min(
      updatedTravelEntries.reduce(
        (sum, entry) => sum + (entry.approvedAmount || 0),
        0,
      ),
      200000,
    );

    // Patch updated entries
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveTravel: {
            travelData: updatedTravelEntries,
            totalDeclaredAmount,
            totalApprovedAmount,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to delete item");

    await fetchItemData();
    showNotification("Item deleted successfully!");
  } catch (err) {
    console.error("Delete item error:", err);
    showNotification("Failed to delete item. Please try again.", "error");
  }
};

const uploading = ref(false);

const downloadFile = async (fileId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${fileId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to download the report.");
    }

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download file:", error);
    showNotification("Failed to download file. Please try again.", "error");
  }
};

const tdsFolderId = ref(null);

const fetchTDSFolderId = async () => {
  try {
    const token = authService.getToken();

    if (!tenantId) {
      console.error("Tenant ID not found in employee data");
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?limit=25&fields[]=tenantName&fields[]=tenantId&fields[]=foldersId&filter[_and][0][_and][0][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the TDS folder
      const tdsFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "TDS Documents",
      );

      if (tdsFolder) {
        tdsFolderId.value = tdsFolder.id;
        console.log("TDS folder ID:", tdsFolder.id);
        return tdsFolder.id;
      } else {
        console.error("TDS folder not found in tenant data");
        return null;
      }
    } else {
      console.error("No folder structure found for tenant");
      return null;
    }
  } catch (error) {
    console.error("Error fetching TDS folder ID:", error);
    return null;
  }
};

const uploadFile = async (event, deductionData) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Check if we have the TDS folder ID
    if (!tdsFolderId.value) {
      await fetchTDSFolderId();
      if (!tdsFolderId.value) {
        console.log(
          "Could not find TDS folder. Using default upload location.",
        );
      }
    }

    const formData = new FormData();

    // Use TDS folder if available
    if (tdsFolderId.value) {
      formData.append("folder", tdsFolderId.value);
    }

    // Include original file
    formData.append("file", file);

    uploading.value = true;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    const data = await response.json();
    deductionData.document = data.data.id;
    showNotification("Document uploaded successfully!");
  } catch (err) {
    console.error("File upload failed:", err);
    showNotification("Failed to upload document. Please try again.", "error");
  } finally {
    uploading.value = false;
  }
};

const acceptItem = async (item, mode = "status") => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));

    const updatedEntries = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        const updatedEntry = { ...entry };

        if (mode === "status") {
          updatedEntry.status = "accepted";
          updatedEntry.approvedAmount = Number(entry.amount);
        } else if (mode === "document") {
          updatedEntry.documentVerified = "verified";
        }

        return updatedEntry;
      }
      return entry;
    });

    const approvedSum = updatedEntries.reduce(
      (sum, entry) => sum + (Number(entry.approvedAmount) || 0),
      0,
    );
    const totalApprovedAmount = Math.min(approvedSum, 200000);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveTravel: {
            travelData: updatedEntries,
            totalApprovedAmount,
            totalDeclaredAmount: declaredTravel.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
    showNotification(
      `Item ${mode === "status" ? "accepted" : "verified"} successfully!`,
    );
  } catch (err) {
    console.error("Accept item error:", err);
    showNotification("Failed to update item. Please try again.", "error");
  }
};

const rejectItem = async (item, mode = "status") => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));

    const updatedEntries = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        const updatedEntry = { ...entry };
        if (mode === "status") {
          updatedEntry.status = "rejected";
          updatedEntry.approvedAmount = 0;
        } else if (mode === "document") {
          updatedEntry.documentVerified = "rejected";
        }
        return updatedEntry;
      }
      return entry;
    });

    const totalApprovedAmount = updatedEntries.reduce(
      (sum, entry) => sum + (Number(entry.approvedAmount) || 0),
      0,
    );

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveTravel: {
            travelData: updatedEntries,
            totalApprovedAmount,
            totalDeclaredAmount: declaredTravel.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
    showNotification(
      `Item ${mode === "status" ? "rejected" : "document rejected"} successfully!`,
    );
  } catch (err) {
    console.error("Reject item error:", err);
    showNotification("Failed to update item. Please try again.", "error");
  }
};

// Show notification
const showNotification = (text, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Check if max claims reached for current block
const canAddMoreClaims = computed(() => {
  const currentYear = new Date().getFullYear();
  const claimsInCurrentBlock = ltaClaims.value.filter((claim) => {
    const claimYear = new Date(claim.travelStartDate).getFullYear();
    return claimYear >= 2022 && claimYear <= 2025;
  });

  return claimsInCurrentBlock.length < 2;
});

const taxSettings = ref([]);
const activeDeclaration = ref(null);
const activeReconcile = ref(null);
const activeProof = ref(null);
const canEdit = ref(false);


const fetchTaxSettings = async () => {
  
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-04-01`;
  const endDate = `${currentYear + 1}-03-31`;
  const params = {
    fields: [
      "decalarationEndDate",
      "decalarationStartDate",
      "financialYear",
      "status",
      "tenant",
      "financialStartDate",
      "financialEndDate",
      "reconcileStartDate",
      "reconcileEndDate",
      "proofStartDate",
      "proofEndDate",
      "id",
    ],
    "filter[_and][0][tenant][_eq]": tenantId,
    "filter[_and][1][financialStartDate][_gte]": startDate,
    "filter[_and][2][financialEndDate][_lte]": endDate,
  };

  const queryString = Object.keys(params)
    .map((key) => {
      if (key === "fields") {
        return params[key].map((field) => `fields[]=${field}`).join("&");
      }
      return `${key}=${encodeURIComponent(params[key])}`;
    })
    .join("&");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/taxSettings?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch tax settings");
      return;
    }

    const data = await response.json();
    const today = dayjs();
    const resultWithStatus = (data.data || []).map((item) => {
      const isDeclarationOpen =
        today.isAfter(dayjs(item.decalarationStartDate)) &&
        today.isBefore(dayjs(item.decalarationEndDate).add(1, "day"));

      const isReconcileOpen =
        today.isAfter(dayjs(item.reconcileStartDate)) &&
        today.isBefore(dayjs(item.reconcileEndDate).add(1, "day"));

      const isProofOpen =
        today.isAfter(dayjs(item.proofStartDate)) &&
        today.isBefore(dayjs(item.proofEndDate).add(1, "day"));

      return {
        ...item,
        declarationStatusLabel: isDeclarationOpen
          ? "Declaration is Open"
          : "Declaration is Closed",
        isDeclarationOpen,

        reconcileStatusLabel: isReconcileOpen
          ? "Reconcile is Open"
          : "Reconcile is Closed",
        isReconcileOpen,

        proofStatusLabel: isProofOpen ? "Proof is Open" : "Proof is Closed",
        isProofOpen,
      };
    });

    taxSettings.value = resultWithStatus;

    activeDeclaration.value =
      resultWithStatus.find((item) => item.isDeclarationOpen) || null;

    activeReconcile.value =
      resultWithStatus.find((item) => item.isReconcileOpen) || null;

    activeProof.value =
      resultWithStatus.find((item) => item.isProofOpen) || null;
  } catch (error) {
    console.error("Error fetching tax settings:", error);
  }
};
canEdit.value =
  !activeDeclaration.value?.isDeclarationOpen ||
  !activeReconcile.value?.isReconcileOpen ||
  !activeProof.value?.isProofOpen;


onMounted(async () => {
  await fetchItemData();
  await fetchTaxSettings();
});
</script>

<style>
.v-card-title {
  font-weight: 500 !important;
}

ul li {
  margin-bottom: 8px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>

<template>
  <v-container fluid class="pa-4">
    <v-toolbar density="compact" color="grey-lighten-4">
      <v-btn icon color="black" @click="handleClose">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="ml-4">HRA Exemptions</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
        CANCEL
      </v-btn>
    </v-toolbar>

    <div class="pa-4">
      <div class="mb-4">
        <p class="text-subtitle-1 font-weight-medium mb-2">
          To be eligible for HRA exemption, you must meet the following
          criteria:
        </p>
        <ul class="pl-5 text-body-1 text-grey-darken-1">
          <li class="mb-1">You must be living in a rented accommodation</li>
          <li class="mb-1">You must be paying rent to the landlord</li>
          <li class="mb-1">
            You must be able to provide the rent receipts and/or rent agreement
            as proof
          </li>
          <li class="mb-1">
            If your rent is above Rs 1 lakh per annum, you must submit your
            landlord's PAN
          </li>
        </ul>
      </div>

      <div class="mb-4">
        <v-sheet
          color="amber-lighten-5"
          rounded="md"
          border
          class="pa-3 border-amber-lighten-3"
        >
          <p class="text-body-1 text-grey-darken-2">
            <span class="font-weight-medium">Note:</span> For your current
            rented accommodation, leave the "to month" blank. To enter multiple
            rents, enter the first, press Continue and come back to this page.
          </p>
          <p class="text-body-1 text-grey-darken-2 mt-2">
            A metro city implies Chennai, Kolkata, Mumbai or Delhi. All other
            cities in India including Gurgaon, Hyderabad and Bengaluru are
            non-metros.
          </p>
        </v-sheet>
      </div>
    </div>

    <v-data-table
      :headers="headers"
      :items="rentEntries"
      :item-key="id"
      class="elevation-1 mb-6"
      hide-default-footer
      ><template v-slot:item.fileId="{ item }">
        <td v-if="item.fileId">
          <v-btn
            @click="downloadFile(item.fileId)"
            title="Download Proof Document"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </td>
        <td v-else>
          <v-chip color="orange lighten-4" dark>Not Uploaded</v-chip>
        </td>
      </template>

      <template v-slot:item.actions="{ item }">
        <td>
          <v-icon small @click="editItem(item)" class="mr-2 cursor-pointer"  :disabled="!canEdit"
            >mdi-pencil</v-icon
          >
          <v-icon
            small
            @click="deleteItem(item)"
            class="cursor-pointer"
            :disabled="!canEdit"
            >mdi-delete</v-icon
          >
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
                    : item.documentVerified === 'draft'
                      ? 'orange lighten-4'
                      : 'grey lighten-4'
              "
              dark
            >
              {{
                item.documentVerified === "draft"
                  ? "pending"
                  : item.documentVerified
              }}
            </v-chip>
          </div>
        </td>
      </template>
      <template v-slot:item.status="{ item }">
        <td>
          <div v-if="item.status === 'pending' && userRole === 'Admin'">
            <v-btn small color="green" class="mr-2" @click="acceptItem(item)"
              >Accept</v-btn
            >
            <v-btn small color="red" @click="rejectItem(item)">Reject</v-btn>
          </div>
          <div v-else>
            <v-chip color="pink lighten-4">
              {{ item.status }}
            </v-chip>
          </div>
        </td>
      </template>
    </v-data-table>
    <div class="action-buttons">
      <v-btn
        color="primary"
        outlined
        class="mb-6"
        @click="openAddRentDialog"
        :disabled="!activeDeclaration?.isDeclarationOpen"
      >
        ADD HOUSE RENT
      </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.monthlyRent"
                  label="Monthly Rent"
                  prefix="₹"
                  type="number"
                  variant="outlined"
                  color="black"
                  :rules="[(v) => !!v || 'Monthly Rent is required']"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.fromMonth"
                  label="From Month"
                  type="date"
                  variant="outlined"
                  color="black"
                  :rules="[(v) => !!v || 'Monthly Rent is required']"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.toMonth"
                  label="To Month"
                  type="date"
                  variant="outlined"
                  color="black"
                  :rules="[(v) => !!v || 'Monthly Rent is required']"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.city"
                  :items="cities"
                  label="City"
                  variant="outlined"
                  color="black"
                  :rules="[(v) => !!v || 'Monthly Rent is required']"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.landlordName"
                  label="Landlord Name"
                  variant="outlined"
                  color="black"
                  :rules="landlordRules"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.landlordPAN"
                  label="Landlord PAN"
                  variant="outlined"
                  color="black"
                  :rules="landlordRules"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.landlordAddress"
                  label="Landlord Address"
                  variant="outlined"
                  color="black"
                  :rules="landlordRules"
                   :disabled="activeProof?.isProofOpen"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-file-input
                  v-model="editedFile"
                  :loading="uploading"
                  @change="uploadFile"
                  @click:clear="deleteFile"
                  label="Upload Proof Document"
                  variant="outlined"
                  color="black"
                />
              </v-col>
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4 bg-grey-lighten-5">
                  <v-checkbox
                    v-model="editedItem.disclaimer"
                    color="black"
                    :rules="[(v) => !!v || 'You must accept the disclaimer']"
                  >
                    <template v-slot:label>
                      <div>
                        <strong>Disclaimer:</strong> I hereby declare that all
                        the information provided and documents uploaded are true
                        and correct to the best of my knowledge. I understand
                        that any false statement may result in disciplinary
                        action.
                      </div>
                    </template>
                  </v-checkbox>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="blue-darken-1" variant="text" @click="close"
            >Cancel</v-btn
          >
          <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, ref, reactive, computed, nextTick } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";
import { tdsRules, fetchTDSRules } from "@/services/tds/tdsRule";

const route = useRoute();
const router = useRouter();

const id = route.params.id;
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const tenantId = currentUserTenant.getTenantId();

const matchedPhase = ref(null);

const dialog = ref(false);

const headers = [
  { title: "Monthly Rent", key: "monthlyRent" },
  { title: "From Month", key: "fromMonth" },
  { title: "To Month", key: "toMonth" },
  { title: "City", key: "city" },
  { title: "Landlord Name", key: "landlordName" },
  { title: "Landlord PAN", key: "landlordPAN" },
  { title: "Landlord Address", key: "landlordAddress" },
  { title: "Doccuments", key: "fileId" },
  { title: "Status", key: "status" },
  { title: "DocumentVerification", key: "documentVerified" },
  { title: "Action", key: "actions" },
];
const handleClose = () => {
  router.push({ name: "TdsDeductionDefault", params: { id } });
};
const uploading = ref(false);
const downloadFile = async (fileId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${fileId}`,
      {
        methods: "GET",
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
    console.error("failed to download file");
  }
};

const rentEntries = ref([]);
const editedIndex = ref(-1);

const cities = [
  "Chennai",
  "Kolkata",
  "Mumbai",
  "Delhi",
  "Gurgaon",
  "Hyderabad",
  "Bengaluru",
];

const defaultItem = {
  monthlyRent: "",
  fromMonth: "",
  toMonth: "",
  city: "",
  landlordName: "",
  landlordPAN: "",
  landlordAddress: "",
  fileId: null,
  comments: "",
  adminRemark: "",
  status: "",
  id: null,
  disclaimer: "",
};

let editedItem = reactive({
  monthlyRent: "",
  fromMonth: "",
  toMonth: "",
  city: "",
  landlordName: "",
  landlordPAN: "",
  landlordAddress: "",
  fileId: null,
  comments: "",
  adminRemark: "",
  disclaimer: "",
  id: null,
});

// Computed form title
const formTitle = computed(() =>
  editedIndex.value === -1 ? "Add House Rent" : "Edit House Rent",
);
const landlordRules = computed(() => {
  return editedItem.monthlyRent * 12 > 100000
    ? [(v) => !!v || "Landlord Name is required"]
    : [];
});

const fetchItemData = async () => {
  try {
    const params = {
      fields: ["hraRent", "id"],
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

const declaredHraRent = ref(0);
const approvedHraRent = ref(0);
const processEarningsAndDeductions = (data) => {
  const tds = data?.data || {};
  tdsDeductionId.value = tds?.id;
  const hraRentData = tds?.hraRent?.hraRent || [];
  rentEntries.value = hraRentData.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id),
  );
  declaredHraRent.value = tds?.hraRent?.totalDeclaredAmount || 0;
  approvedHraRent.value = tds?.hraRent?.totalApprovedAmount || 0;
};

const openAddRentDialog = () => {
  dialog.value = true;
};

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

const close = () => {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
  deleteFile();
};
const save = async () => {
  const mandatoryFields = ["monthlyRent", "fromMonth", "toMonth", "city"];
  const fieldsToValidate = [...mandatoryFields];

  if (editedItem.monthlyRent * 12 > 100000) {
    fieldsToValidate.push("landlordName", "landlordPAN", "landlordAddress");
  }

  const missingFields = fieldsToValidate.filter((field) => !editedItem[field]);

  if (missingFields.length > 0) {
    alert("Please fill all required fields");
    return;
  }

  try {
    let updatedRents = [...rentEntries.value];

    const newEntry = {
      id:
        editedItem.id ||
        (updatedRents.length
          ? Math.max(...updatedRents.map((i) => i.id || 0)) + 1
          : 1),
      monthlyRent: editedItem.monthlyRent,
      fromMonth: editedItem.fromMonth,
      toMonth: editedItem.toMonth,
      city: editedItem.city,
      landlordName: editedItem.landlordName,
      landlordPAN: editedItem.landlordPAN,
      landlordAddress: editedItem.landlordAddress,
      fileId: editedItem.document,
      status: "pending",
      documentVerified: editedItem.document ? "pending" : "draft",
      disclaimer: editedItem.disclaimer,
    };

    const existingIndex = updatedRents.findIndex(
      (item) => item.id === editedItem.id,
    );
    if (existingIndex !== -1) {
      updatedRents[existingIndex] = newEntry;
    } else {
      if (!updatedRents.find((item) => item.id === newEntry.id)) {
        updatedRents.push(newEntry);
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hraRent: {
            hraRent: updatedRents,
            totalDeclaredAmount: updatedRents.reduce(
              (sum, rent) => sum + rent.monthlyRent,
              0,
            ),
            totalApprovedAmount: approvedHraRent.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update item");

    close();
    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
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
const uploadFile = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    if (!tdsFolderId.value) {
      await fetchTDSFolderId();
      if (!tdsFolderId.value) {
        console.log(
          "Could not find TDS folder. Using default upload location.",
        );
      }
    }

    const formData = new FormData();

    if (tdsFolderId.value) {
      formData.append("folder", tdsFolderId.value);
    }

    formData.append("file", file);

    uploading.value = true;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    editedItem.document = data.data.id;
  } catch (err) {
    console.error("File upload failed:", err);
  } finally {
    uploading.value = false;
  }
};
const acceptItem = async (item, mode = "status") => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));
    const entries = updatedDeductions;

    const updatedEntries = entries.map((entry) => {
      if (entry.id === item.id) {
        const updatedEntry = { ...entry };

        if (mode === "status") {
          updatedEntry.status = "accepted";
          updatedEntry.approvedAmount = entry.monthlyRent;
        } else if (mode === "document") {
          updatedEntry.documentVerified = "verified";
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
          hraRent: {
            hraRent: updatedEntries,
            totalDeclaredAmount: declaredHraRent.value,
            totalApprovedAmount,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");
    await fetchItemData();
  } catch (err) {
    console.error("Accept item error:", err);
  }
};

const deleteFile = async () => {
  const fileId = editedItem.document;

  if (!fileId) {
    console.warn("No file ID found to delete.");
    return;
  }

  try {
    uploading.value = true;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }

    console.log("File deleted successfully:", fileId);
    editedItem.document = null; // Clear the reference
  } catch (err) {
    console.error("File deletion failed:", err);
  } finally {
    uploading.value = false;
  }
};

const editedFile = ref(null);
const editItem = async (item) => {
  Object.assign(editedItem, item);

  dialog.value = true;

  await nextTick();

  if (item.fileId) {
    try {
      const token = authService.getToken();
      const fileUrl = `${import.meta.env.VITE_API_URL}/files/${item.fileId}`;

      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fileMeta = data.data;
        await new Promise((r) => setTimeout(r, 100));

        const fileInput = document.querySelector('input[type="file"]');

        if (!fileInput) {
          console.warn(
            "⚠️ File input element not found — likely not rendered or inside a v-if.",
          );
        } else {
          const dataTransfer = new DataTransfer(); // ✅ Declare before use
          const fakeFile = new File(
            ["placeholder content"],
            fileMeta.filename_download,
            {
              type: fileMeta.type || "application/octet-stream",
            },
          );
          editedFile.value = fakeFile;

          try {
            console.log(
              "✅ fileInput.files set successfully:",
              fileInput.files,
            );
          } catch (err) {
            console.error("❌ Error while setting fileInput.files:", err);
          }
          if (fileInput.files.length === 0) {
            console.warn(
              "⚠️ fileInput.files is still empty — browser may block programmatic assignment.",
            );
          } else {
            console.log("🎉 File successfully shown in file input");
          }
        }
      } else {
        console.error(
          "❌ Failed to fetch file metadata. HTTP Status:",
          response.status,
        );
      }
    } catch (err) {
      console.error("🔥 Exception while fetching file metadata:", err);
    }
  } else {
    console.log("ℹ️ No fileId found on item, skipping file input population.");
  }
};

const deleteItem = async (item) => {
  try {
    const updatedDeductions = rentEntries.value.filter(
      (entry) => entry.id !== item.id,
    );

    const approvedSum = updatedDeductions.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );

    const totalApprovedAmount = Math.min(approvedSum);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hraRent: {
            hraRent: updatedDeductions,
            totalDeclaredAmount: declaredHraRent.value,
            totalApprovedAmount,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to delete item");

    await fetchItemData();
  } catch (err) {
    console.error("Delete item error:", err);
  }
};

const rejectItem = async (item, mode = "status") => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));

    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        const updatedEntry = { ...entry };

        if (mode === "status") {
          updatedEntry.status = "rejected";
          updatedEntry.documentVerified = "rejected";
          updatedEntry.approvedAmount = 0;
        } else if (mode === "document") {
          updatedEntry.documentVerified = "rejected";
          updatedEntry.status = "rejected";
          updatedEntry.approvedAmount = 0;
        }

        return updatedEntry;
      }
      return entry;
    });

    const approvedSum = updatedHraRent.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );

    const totalApprovedAmount = Math.min(approvedSum);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hraRent: {
            hraRent: updatedHraRent,
            totalDeclaredAmount: declaredHraRent.value,
            totalApprovedAmount,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Reject item error:", err);
  }
};

onMounted(async () => {
  await fetchItemData();
  await fetchTaxSettings();
});
</script>

<style scoped></style>

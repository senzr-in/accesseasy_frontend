<template>
  <div class="bank-form">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6"></h3>
      <v-btn
        style="background-color: white"
        color="black"
        @click="showAddDetailsDialog"
        class="add-bank-btn"
      >
        Add Details
      </v-btn>
    </div>

    <div
      v-if="!formData.bankName && !formData.UPI"
      class="text-center empty-state"
    >
      <img
        src="/images/bank.png"
        style="width: 300px; height: 300px; margin: 0 auto"
      />

      <p class="mt-4 empty-state-text">
        No bank or UPI details added yet. Click the button above to add details.
      </p>
    </div>

    <v-row v-else>
      <!-- Bank Details -->
      <v-col cols="12" v-if="formData.bankName">
        <h4 class="text-h6 mb-4">Bank Account Details</h4>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.bankName"
              label="Bank Name"
              variant="outlined"
              density="comfortable"
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.accountNumber"
              label="Account Number"
              type="number"
              variant="outlined"
              density="comfortable"
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-text-field
                v-model="formData.IFSC"
                label="IFSC Code"
                variant="outlined"
                density="comfortable"
                :readonly="formData.IFSCStatus === 'verified'"
                class="flex-grow-1 mr-2"
              ></v-text-field>
              <v-btn
                style="background-color: black"
                color="white"
                @click="showVerifyDialog('IFSC')"
                :disabled="formData.IFSCStatus === 'verified'"
              >
                Verify
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-chip
              :color="
                formData.IFSCStatus === 'verified' ? 'success' : 'warning'
              "
            >
              {{
                formData.IFSCStatus === "verified" ? "Verified" : "Unverified"
              }}
            </v-chip>
          </v-col>
        </v-row>
      </v-col>

      <!-- UPI Details -->
      <v-col cols="12" v-if="formData.UPI">
        <h4 class="text-h6 mb-4">UPI Details</h4>
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-text-field
                v-model="formData.UPI"
                label="UPI ID"
                variant="outlined"
                density="comfortable"
                :readonly="formData.UPIStatus === 'verified'"
                class="flex-grow-1 mr-2"
              ></v-text-field>
              <!-- <v-btn
                style="background-color: black"
                color="white"
                @click="showVerifyDialog('UPI')"
                :disabled="formData.UPIStatus === 'verified'"
              >
                Verify
              </v-btn> -->
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-chip
              :color="formData.UPIStatus === 'verified' ? 'success' : 'warning'"
            >
              {{
                formData.UPIStatus === "verified" ? "Verified" : "Unverified"
              }}
            </v-chip>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Add Details Dialog -->
    <v-dialog v-model="addDetailsDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 pa-4">Add Details</v-card-title>
        <v-card-text>
          <v-checkbox
            v-model="addBankDetails"
            label="Add Bank Account Details"
          ></v-checkbox>
          <v-checkbox
            v-model="addUPIDetails"
            label="Add UPI Details"
          ></v-checkbox>

          <v-form v-if="addBankDetails">
            <h4 class="text-h6 mb-4">Bank Account Details</h4>
            <v-text-field
              v-model="tempFormData.bankName"
              label="Bank Name"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
            <v-text-field
              v-model="tempFormData.accountNumber"
              label="Account Number"
              required
              type="number"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
            <v-text-field
              v-model="tempFormData.IFSC"
              label="IFSC Code"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-form>

          <v-form v-if="addUPIDetails">
            <h4 class="text-h6 mb-4">UPI Details</h4>
            <div class="d-flex align-center gap-2">
              <v-text-field
                v-model="tempFormData.UPI"
                label="UPI ID"
                required
                variant="outlined"
                density="comfortable"
                class="flex-grow-1"
              ></v-text-field>
              <v-select
                v-model="tempFormData.upiSuffix"
                :items="upiOptions"
                label="UPI Type"
                variant="outlined"
                density="comfortable"
                style="min-width: 140px"
              ></v-select>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            style="background-color: black"
            color="white"
            variant="text"
            @click="closeAddDetailsDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            style="background-color: black"
            color="white"
            @click="saveDetails"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Verify Dialog -->
    <v-dialog v-model="verifyDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4"
          >Verify {{ verifyType }}</v-card-title
        >
        <v-card-text>
          <p>
            {{ verifyType }} Code:
            {{ verifyType === "IFSC" ? formData.IFSC : formData.UPI }}
          </p>
          <p>Click Verify to confirm this {{ verifyType }} code.</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            style="background-color: black"
            color="white"
            variant="text"
            @click="closeVerifyDialog"
          >
            Cancel
          </v-btn>
          <!-- <v-btn
            style="background-color: black"
            color="white"
            @click="verifyCode"
          >
            Verify
          </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const formData = reactive({
  bankName: props.initialData.bankName || "",
  accountNumber: props.initialData.accountNumber || "",
  IFSC: props.initialData.IFSC || "",
  IFSCStatus: props.initialData.IFSCStatus || "unverified",
  UPI: props.initialData.UPI || "",
  UPIStatus: props.initialData.UPIStatus || "unverified",
});

const addDetailsDialog = ref(false);
const verifyDialog = ref(false);
const verifyType = ref("");
const addBankDetails = ref(false);
const addUPIDetails = ref(false);
const tempFormData = reactive({
  bankName: "",
  accountNumber: "",
  IFSC: "",
  UPI: "",
  upiSuffix: "",
});

const upiOptions = [
  "@oksbi",
  "@okicici",
  "@okaxis",
  "@okhdfcbank",
  "@okhdfc",
  "@oksbi",
  "@ybl",
  "@upi",
  "@paytm",
  "@ibl",
];

const showAddDetailsDialog = () => {
  addDetailsDialog.value = true;
};

const closeAddDetailsDialog = () => {
  addDetailsDialog.value = false;
  addBankDetails.value = false;
  addUPIDetails.value = false;
  Object.keys(tempFormData).forEach((key) => (tempFormData[key] = ""));
};

const saveDetails = () => {
  if (addBankDetails.value) {
    formData.bankName = tempFormData.bankName;
    formData.accountNumber = tempFormData.accountNumber;
    formData.IFSC = tempFormData.IFSC;
    formData.IFSCStatus = "unverified";
  }
  if (addUPIDetails.value) {
    formData.UPI = `${tempFormData.UPI}${tempFormData.upiSuffix}`;
    formData.UPIStatus = "unverified";
  }
  emit("update:modelValue", formData);
  closeAddDetailsDialog();
};

const showVerifyDialog = (type) => {
  verifyType.value = type;
  verifyDialog.value = true;
};

const closeVerifyDialog = () => {
  verifyDialog.value = false;
};

const verifyCode = () => {
  // Implement verification logic here
  if (verifyType.value === "IFSC") {
    formData.IFSCStatus = "verified";
  } else if (verifyType.value === "UPI") {
    formData.UPIStatus = "verified";
  }
  emit("update:modelValue", formData);
  closeVerifyDialog();
};
</script>

<style scoped>
.first-name-container,
.config-name-container {
  display: flex;
  align-items: right;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: white;
}

.first-name-container {
  margin-left: 16px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
}

.add-bank-btn {
  background-color: #000 !important;
  color: white !important;
}
.bank-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 200%;
  max-width: 100%;
}

.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.form-section {
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.has-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-list-item--active) {
  background-color: #eee;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}
</style>

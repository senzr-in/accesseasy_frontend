<template>
  <div class="bank-form">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3>Bank Account Details</h3>
      <BaseButton
        v-if="!hasBankDetails"
        variant="primary"
        text="Add Details"
        class="add-bank-btn"
        @click="showAddDetailsDialog"
      />
    </div>

    <div v-if="!hasBankDetails" class="text-center empty-state">
      <img
        src="/images/bank.png"
        alt="Bank icon"
        style="width: 300px; height: 300px; margin: 0 auto"
      />
      <p class="mt-4 empty-state-text">
        No bank details added yet. Click the button above to add details.
      </p>
    </div>

    <v-card v-else class="bank-details-card">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.bankName"
              label="Bank Name"
              readonly
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.accountNumber"
              label="Account Number"
              readonly
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <div class="d-flex align-center gap-2">
              <SensitiveDataInput
                class="w-100"
                v-model="formData.IFSC"
                label="IFSC Code"
                readonly
                variant="outlined"
                density="comfortable"
              />
              <div class="verification-status">
                <v-chip
                  v-if="isVerified('IFSC')"
                  color="success"
                  size="small"
                  class="verification-chip"
                >
                  VERIFIED
                </v-chip>
                <!-- <v-btn
                  v-else
                  color="black"
                  height="40px"
                  @click="verifyField('IFSC')"
                >
                  VERIFY
                </v-btn> -->
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="d-flex align-center gap-2">
              <div
                class="upi-input-group d-flex align-center gap-2 flex-grow-1"
              >
                <v-text-field
                  v-model="formData.UPIPrefix"
                  label="UPI ID"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
                <v-select
                  v-model="formData.UPISuffix"
                  :items="upiOptions"
                  label="UPI Type"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  style="min-width: 140px"
                ></v-select>
              </div>
              <div class="verification-status">
                <v-chip
                  v-if="isVerified('UPI')"
                  color="success"
                  size="small"
                  class="verification-chip"
                >
                  VERIFIED
                </v-chip>
                <!-- <v-btn
                  v-else
                  color="black"
                  height="40px"
                  @click="verifyField('UPI')"
                >
                  VERIFY
                </v-btn> -->
              </div>
            </div>
          </v-col>
        </v-row>
        <BaseButton
          variant="primary"
          text="Edit Details"
          class="mt-4"
          @click="showEditDetailsDialog"
        />
      </v-card-text>
    </v-card>

    <!-- Add/Edit Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ isEditing ? "Edit" : "Add" }} Bank Details
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="isFormValid"
            @submit.prevent="saveDetails"
          >
            <v-text-field
              v-model="tempFormData.bankName"
              label="Bank Name *"
              :rules="[(v) => !!v || 'Bank Name is required']"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
            <v-text-field
              v-model="tempFormData.accountNumber"
              label="Account Number *"
              :rules="[(v) => !!v || 'Account Number is required']"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
            <v-text-field
              v-model="tempFormData.IFSC"
              label="IFSC Code *"
              :rules="[(v) => !!v || 'IFSC Code is required']"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
            <div class="d-flex align-center gap-2">
              <v-text-field
                v-model="tempFormData.UPIPrefix"
                label="UPI ID"
                variant="outlined"
                density="comfortable"
                class="flex-grow-1"
              ></v-text-field>
              <v-select
                v-model="tempFormData.UPISuffix"
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
          <BaseButton
            variant="secondary"
            text="Cancel"
            @click="closeDetailsDialog"
          />
          <BaseButton
            variant="primary"
            text="Save"
            @click="saveDetails"
            :disabled="!isFormValid"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Verify Dialog -->
    <v-dialog v-model="verifyDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Verify {{ verifyingField }}
        </v-card-title>
        <v-card-text>
          <p>{{ verifyingField }} Code: {{ getFieldValue(verifyingField) }}</p>
          <p>Click Verify to confirm this {{ verifyingField }} code.</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <BaseButton
            variant="secondary"
            text="Cancel"
            @click="closeVerifyDialog"
          />
          <BaseButton
            variant="primary"
            text="Verify"
            @click="confirmVerification"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import SensitiveDataInput from "@/components/sensitiveData/sensitiveDataInput.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employee-data"]);

const formData = reactive({
  bankName: "",
  accountNumber: "",
  IFSC: "",
  UPIPrefix: "",
  UPISuffix: "",
});

const tempFormData = reactive({
  bankName: "",
  accountNumber: "",
  IFSC: "",
  UPIPrefix: "",
  UPISuffix: "",
});

const upiOptions = [
  "@oksbi",
  "@okicici",
  "@okaxis",
  "@okhdfcbank",
  "@okhdfc",
  "@ybl",
  "@upi",
  "@paytm",
  "@ibl",
];

const detailsDialog = ref(false);
const verifyDialog = ref(false);
const verifyingField = ref("");
const isFormValid = ref(true);
const form = ref(null);
const isEditing = ref(false);

const hasBankDetails = computed(() => !!formData.bankName);

// Helper function to get assignedUser.id safely
const assignedUserId = ref(null);

const getAssignedUserId = () => {
  return assignedUserId.value || props.employeeData?.assignedUser?.id || null;
};

const getFieldValue = (field) => {
  if (field === "UPI") {
    return `${formData.UPIPrefix}${formData.UPISuffix}`;
  }
  return formData[field];
};

const showAddDetailsDialog = () => {
  isEditing.value = false;
  Object.assign(tempFormData, formData);
  detailsDialog.value = true;
};

const showEditDetailsDialog = () => {
  isEditing.value = true;
  Object.assign(tempFormData, formData);
  detailsDialog.value = true;
};

const closeDetailsDialog = () => {
  detailsDialog.value = false;
  Object.keys(tempFormData).forEach((key) => (tempFormData[key] = ""));
};

const saveDetails = async () => {
  if (!form.value.validate()) return;

  try {
    // Always include assignedUser.id in the payload, even if it's null/undefined
    const updatedData = {
      assignedUser: {
        id: getAssignedUserId(), // This will be null if not available
        bankName: tempFormData.bankName,
        accountNumber: tempFormData.accountNumber,
        IFSC: tempFormData.IFSC,
        UPI: `${tempFormData.UPIPrefix}${tempFormData.UPISuffix}`,
        accountDetails: "bankAccount",
      },
    };

    console.log("Saving bank details with payload:", updatedData); // Debug log

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    Object.assign(formData, tempFormData);
    emit("update:employee-data", {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        ...updatedData.assignedUser,
      },
    });
    closeDetailsDialog();
  } catch (error) {
    console.error("Error saving bank details:", error);
    alert("Failed to save bank details. Please try again.");
  }
};

const verifyField = (field) => {
  verifyingField.value = field;
  verifyDialog.value = true;
};

const closeVerifyDialog = () => {
  verifyDialog.value = false;
  verifyingField.value = "";
};

const confirmVerification = async () => {
  try {
    const updatedVerification = [
      ...(props.employeeData?.assignedUser?.verification || []),
    ];
    if (!updatedVerification.includes(verifyingField.value)) {
      updatedVerification.push(verifyingField.value);
    }

    // Always include assignedUser.id in the payload, even if it's null/undefined
    const verificationPayload = {
      assignedUser: {
        id: getAssignedUserId(), // This will be null if not available
        verification: updatedVerification,
      },
    };

    console.log("Verifying field with payload:", verificationPayload); // Debug log

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationPayload),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    emit("update:employee-data", {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        verification: updatedVerification,
      },
    });
    closeVerifyDialog();
  } catch (error) {
    console.error("Error verifying field:", error);
    alert("Failed to verify. Please try again.");
  }
};

const isVerified = (field) => {
  return (
    props.employeeData?.assignedUser?.verification?.includes(field) || false
  );
};

const fetchBankDetails = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?fields=assignedUser.id,assignedUser.bankName,assignedUser.accountNumber,assignedUser.IFSC,assignedUser.UPI,assignedUser.verification`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched bank details:", data); // Debug log

    if (data.data && data.data.assignedUser) {
      // Store the assignedUser.id
      assignedUserId.value = data.data.assignedUser.id;

      const { UPI, id, verification, ...rest } = data.data.assignedUser;
      Object.assign(formData, rest);
      if (UPI) {
        const upiSuffix = upiOptions.find((opt) => UPI.endsWith(opt));
        if (upiSuffix) {
          formData.UPIPrefix = UPI.slice(0, -upiSuffix.length);
          formData.UPISuffix = upiSuffix;
        } else {
          formData.UPIPrefix = UPI;
          formData.UPISuffix = "";
        }
      }
    }
  } catch (error) {
    console.error("Error fetching bank details:", error);
    alert("Failed to load bank details. Please try again.");
  }
};

onMounted(() => {
  fetchBankDetails();
});

watch(
  () => props.employeeData?.assignedUser?.id,
  (newId) => {
    if (newId && !assignedUserId.value) {
      assignedUserId.value = newId;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.bank-form {
  margin: 0 auto;
}

.empty-state {
  padding: 2rem;
  text-align: center;
}

.empty-state-text {
  font-size: 1.2rem;
  color: #666;
}

.bank-details-card {
  margin-top: 2rem;
}

.add-bank-btn {
  margin-bottom: 1rem;
}

.verification-status {
  display: flex;
  align-items: center;
  min-width: 100px;
}

.verification-chip {
  height: 40px;
  margin-bottom: 20px;
}

.gap-2 {
  gap: 8px;
}

.upi-input-group {
  flex: 1;
}
</style>

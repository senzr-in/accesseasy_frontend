<template>
  <div class="background-verification">
    <v-row>
      <v-col
        cols="12"
        md="6"
        v-for="doc in verificationFields"
        :key="doc.field"
      >
        <v-card
          class="verification-card"
          :class="{ 'verified-card': isVerified(doc.field) }"
          flat
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-h6">{{ doc.title }}</div>
              <v-chip
                v-if="isVerified(doc.field)"
                color="success"
                size="small"
                class="verified-chip"
              >
                <v-icon start size="small">mdi-check-circle</v-icon>
                Verified
              </v-chip>
              <v-chip
                v-else
                color="warning"
                size="small"
                variant="outlined"
                class="pending-chip"
              >
                Pending
              </v-chip>
            </div>
            <div class="text-subtitle-2 text-grey-darken-1 mb-4">
              {{ doc.description }}
            </div>
            <div class="verification-field-container">
              <div class="verification-field-label">{{ doc.title }}</div>
              <div class="verification-input-group">
                <v-text-field
                  v-model="formData[doc.field]"
                  :placeholder="doc.placeholder"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules[doc.field]]"
                  :error-messages="errors[doc.field]"
                  class="verification-input"
                  :readonly="isVerified(doc.field)"
                  bg-color="white"
                  @input="clearError(doc.field)"
                >
                  <template v-slot:append>
                    <v-icon
                      v-if="isVerified(doc.field)"
                      color="success"
                      size="small"
                    >
                      mdi-sync
                    </v-icon>
                  </template>
                </v-text-field>
                <v-btn
                  v-if="!isVerified(doc.field)"
                  color="primary"
                  class="verify-btn"
                  @click="verifyDocument(doc.field)"
                  :disabled="!isFieldValid(doc.field)"
                >
                  VERIFY
                </v-btn>
              </div>
            </div>
            <div
              v-if="isVerified(doc.field)"
              class="verification-success-message"
            >
              <v-icon color="success" size="small" class="mr-1">
                mdi-check-circle
              </v-icon>
              <span>Verification successful</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import axios from 'axios';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  verification: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:verification", "verification-complete"]);

const userId = ref(null);
const token = authService.getToken();

const formData = reactive({
  aadhaar: "",
  pan: "",
  voterId: "",
  uan: "",
  gst: "",
});

const errors = reactive({
  aadhaar: "",
  pan: "",
  voterId: "",
  uan: "",
  gst: "",
});

const verification = ref(props.verification);

const rules = {
  aadhaar: (v) => /^\d{12}$/.test(v) || "Aadhaar must be 12 digits",
  pan: (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) || "Invalid PAN format",
  voterId: (v) => /^[A-Z]{3}\d{7}$/.test(v) || "Invalid Voter ID format",
  uan: (v) => /^\d{12}$/.test(v) || "UAN must be 12 digits",
  gst: (v) =>
    /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(v) ||
    "Invalid GST format",
};

const verificationFields = [
  {
    field: "aadhaar",
    title: "Aadhaar Verification",
    description: "Enter your 12-digit Aadhaar number",
    placeholder: "Enter 12-digit Aadhaar number",
  },
  {
    field: "pan",
    title: "PAN Verification",
    description: "Enter your PAN card number",
    placeholder: "Enter PAN number",
  },
  {
    field: "voterId",
    title: "Voter ID Verification",
    description: "Enter your Voter ID number",
    placeholder: "Enter Voter ID number",
  },
  {
    field: "uan",
    title: "UAN Verification",
    description: "Enter your 12-digit UAN number",
    placeholder: "Enter 12-digit UAN",
  },
  {
    field: "gst",
    title: "GST Verification",
    description: "Enter your GST number",
    placeholder: "Enter GST number",
  },
];

const fieldToApiMap = {
  aadhaar: { key: "aadhar", verificationKey: "aadhar" },
  pan: { key: "pan", verificationKey: "PAN" },
  voterId: { key: "voter_ID", verificationKey: "voterID" },
  uan: { key: "UAN", verificationKey: "UAN" },
  gst: { key: "gst", verificationKey: "GST" },
};

const isVerified = (field) => {
  const verificationKey = fieldToApiMap[field].verificationKey;
  return verification.value.includes(verificationKey);
};

const isFieldValid = (field) => {
  return rules[field](formData[field]) === true;
};

const clearError = (field) => {
  errors[field] = "";
};

const verifyDocument = async (field) => {
  try {
    const { key, verificationKey } = fieldToApiMap[field];
    if (!formData[field]) {
      errors[field] = `Please enter ${verificationKey} to verify`;
      return;
    }
    if (!isFieldValid(field)) {
      errors[field] = rules[field](formData[field]);
      return;
    }
    if (formData[field] && !verification.value.includes(verificationKey)) {
      const updatedVerification = [...verification.value, verificationKey];

      // Prepare the payload with only the currently verified field
      const verifiedData = {
        [key]: formData[field],
        verification: updatedVerification,
      };

      // Make the PATCH request to update the user data
      await axios.patch(`${import.meta.env.VITE_API_URL}/users/${userId.value}`, verifiedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Update the verification array
      verification.value = updatedVerification;

      // Emit the complete verified data
      emit("verification-complete", verifiedData);
    }
  } catch (error) {
    console.error("Verification failed:", error);
  }
};

onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
      params: {
        'filter[_and][0][phone][_contains]': props.initialData.phone
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const userData = response.data.data[0];
      userId.value = userData.id;
      verification.value = userData.verification || [];
      // Initialize form data with fetched values
      Object.keys(fieldToApiMap).forEach((field) => {
        const { key } = fieldToApiMap[field];
        formData[field] = userData[key] || "";
      });
      
      // Emit the updated verification status
      emit("update:verification", verification.value);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});

// Watch for changes in the verification prop
watch(() => props.verification, (newVerification) => {
  verification.value = newVerification;
}, { immediate: true });
</script>

<style scoped>
.verification-card {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0 !important;
  margin-bottom: 16px;
}

.verified-card {
  background-color: #f1f8e9 !important;
  border-color: #4caf50 !important;
}

.verification-field-container {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
}

.verification-field-label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.verification-input-group {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.verification-input {
  flex: 1;
}

.verify-btn {
  margin-top: 4px;
  height: 40px;
}

.verification-success-message {
  display: flex;
  align-items: center;
  color: #4caf50;
  font-size: 0.875rem;
  margin-top: 8px;
  padding-left: 16px;
}

.verified-chip {
  background-color: #4caf50 !important;
  color: white !important;
}

.pending-chip {
  border-color: #fb8c00 !important;
  color: #fb8c00 !important;
}

:deep(.v-field) {
  border-color: #e0e0e0 !important;
}

:deep(.v-field--focused) {
  border-color: #4caf50 !important;
}

.text-h6 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
}

.text-subtitle-2 {
  font-size: 0.875rem;
  color: #666;
}
</style>
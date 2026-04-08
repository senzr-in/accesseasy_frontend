<template>
  <div class="verification-container">
    <div class="verification-header">
      <h2 class="verification-title">Background Verification</h2>
      <p class="verification-subtitle">
        Verify your identity documents securely
      </p>
    </div>

    <div class="verification-progress">
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          :style="{ width: `${verificationProgress}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ completedVerifications }} of
        {{ verificationFields.length }} verifications complete
      </div>
    </div>

    <div class="verification-grid">
      <div
        v-for="doc in verificationFields"
        :key="doc.field"
        class="verification-card-wrapper"
      >
        <div
          class="verification-card"
          :class="{
            'verified-card': getDocumentStatus(doc.field) === 'verified',
            'failed-card': getDocumentStatus(doc.field) === 'failed',
            'pending-card': getDocumentStatus(doc.field) === 'pending',
          }"
        >
          <div class="card-header">
            <div class="card-title-area">
              <div class="card-icon">
                <component :is="getDocumentIcon(doc.field)" />
              </div>
              <div class="card-title-content">
                <h3 class="card-title">{{ doc.title }}</h3>
                <p class="card-description">{{ doc.description }}</p>
              </div>
            </div>
            <div class="card-status">
              <span
                v-if="getDocumentStatus(doc.field) === 'verified'"
                class="status-badge verified"
              >
                <CheckCircleIcon size="16" />
                Verified
              </span>
              <span
                v-else-if="getDocumentStatus(doc.field) === 'failed'"
                class="status-badge failed"
              >
                <XCircleIcon size="16" />
                Failed
              </span>
              <span
                v-else-if="getDocumentStatus(doc.field) === 'pending'"
                class="status-badge pending"
              >
                <ClockIcon size="16" />
                Pending
              </span>
              <span v-else class="status-badge not-started">
                <CircleIcon size="16" />
                Not Started
              </span>
            </div>
          </div>

          <div class="card-content">
            <div v-if="doc.field === 'aadhaar'">
              <div v-if="!isAadhaarSubmitted" class="aadhaar-verification-form">
                <div class="input-group">
                  <label for="aadhaar-name" class="input-label"
                    >AadhaarNumber</label
                  >
                  <input
                    id="aadhaar-name"
                    v-model="aadhaarFormData.number"
                    type="text"
                    class="verification-input"
                    :disabled="isVerifyButtonDisabled(doc.field)"
                  />
                </div>

                <button
                  class="verify-button submit-button"
                  @click="handleAadhaarVerification"
                  :disabled="isVerifyButtonDisabled(doc.field)"
                  :class="{
                    'button-disabled': isVerifyButtonDisabled(doc.field),
                  }"
                >
                  {{
                    getButtonText(doc.field) === "Verify"
                      ? "Verify"
                      : getButtonText(doc.field)
                  }}
                </button>
              </div>
              <div
                v-if="showAadhaarDetails && aadhaarDetails"
                class="aadhaar-details-box"
              >
                <h3>Aadhaar Details</h3>
                <p>
                  <strong>Name:</strong>
                  {{ aadhaarDetails.full_name }}
                </p>
                <p>
                  <strong>Gender:</strong>
                  {{ aadhaarDetails.gender }}
                </p>
                <p>
                  <strong>DOB:</strong>
                  {{ aadhaarDetails.dob }}
                </p>
                <p>
                  <strong>Care Of:</strong>
                  {{ aadhaarDetails.care_of }}
                </p>
                <p>
                  <strong>ZIP Code:</strong>
                  {{ aadhaarDetails.zip }}
                </p>

                <button class="ok-button" @click="handleAadhaarOk">OK</button>
              </div>

              <!-- <div v-else class="verification-success-content">
                <div class="success-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="#10B981"
                      fill-opacity="0.2"
                    />
                    <path
                      d="M34 18L20 32L14 26"
                      stroke="#10B981"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <h2>Verification Request Submitted</h2>
                <p>
                  Your Aadhaar verification request has been processed
                  successfully. Complete the verification using the official
                  UIDAI portal.
                </p>

                <button
                  class="complete-verification-btn"
                  @click="completeVerification"
                >
                  Complete Verification
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3L11 8L6 13"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <p class="redirect-text">
                  You will be redirected to the official UIDAI website
                </p>
              </div> -->
            </div>

            <div v-else class="input-group">
              <label :for="doc.field" class="input-label">{{
                doc.inputLabel || doc.title
              }}</label>
              <div class="input-with-button">
                <input
                  :id="doc.field"
                  :value="userData[doc.field]"
                  :type="doc.inputType || 'text'"
                  class="verification-input"
                  disabled
                />
                <button
                  class="verify-button"
                  @click="handleVerification(doc)"
                  :disabled="isVerifyButtonDisabled(doc.field)"
                >
                  {{ getButtonText(doc.field) }}
                </button>
              </div>
            </div>

            <!-- <div
              v-if="getDocumentStatus(doc.field) === 'failed'"
              class="verification-failed"
            >
              <div class="failed-icon">
                <XCircleIcon size="24" />
              </div>
              <div class="failed-details">
                <p class="failed-message">Verification failed</p>
                <p class="failed-reason">
                  Please check the document number and try again
                </p>
              </div>
            </div>

            <div
              v-if="getDocumentStatus(doc.field) === 'pending'"
              class="verification-pending"
            >
              <div class="pending-icon">
                <ClockIcon size="24" />
              </div>
              <div class="pending-details">
                <p class="pending-message">Verification pending</p>
                <p class="pending-reason">Your document is being processed</p>
              </div>
            </div> -->
            <div
              v-if="getDocumentStatus(doc.field) !== 'not_started'"
              class="verification-status"
              :class="{
                'verification-success':
                  getDocumentStatus(doc.field) === 'verified',
                'verification-failed':
                  getDocumentStatus(doc.field) === 'failed',
                'verification-pending':
                  getDocumentStatus(doc.field) === 'pending',
              }"
            >
              <div class="status-icon">
                <CheckCircleIcon
                  v-if="getDocumentStatus(doc.field) === 'verified'"
                  size="24"
                />
                <XCircleIcon
                  v-else-if="getDocumentStatus(doc.field) === 'failed'"
                  size="24"
                />
                <ClockIcon
                  v-else-if="getDocumentStatus(doc.field) === 'pending'"
                  size="24"
                />
              </div>
              <div class="status-details">
                <p class="status-message">
                  {{
                    getDocumentStatus(doc.field) === "verified"
                      ? "Verification successful"
                      : getDocumentStatus(doc.field) === "failed"
                        ? "Verification failed"
                        : "Verification pending"
                  }}
                </p>
                <p class="status-reason">
                  {{
                    getDocumentStatus(doc.field) === "verified"
                      ? `Verified on ${formatDate(getVerificationDate(doc.field))}`
                      : getDocumentStatus(doc.field) === "failed"
                        ? verificationErrors[doc.field] ||
                          "Please check the document number and try again"
                        : "Your document is being processed"
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import {
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  Circle as CircleIcon,
  CreditCard as CardIcon,
  User as UserIcon,
  Building as BuildingIcon,
  Car as CarIcon,
} from "lucide-vue-next";
import { authService } from "@/services/authService";
import crypto from "crypto-js";

const token = authService.getToken();
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
const isAadhaarSubmitted = ref(false);

const userData = ref({
  pan: "",
  aadhaar: "",
  uan: "",
  bank_account: "",
  panVerification: "",
  panVerification: "",
  gstVerification: "",
  employeeId: "",
});
const verificationErrors = ref({});
const verificationStatuses = ref({});
const verificationDates = ref({});
const bgVerificationData = ref(null);
const verificationFields = [
  {
    field: "pan",
    title: "PAN Verification",
    description: "Verify your Permanent Account Number",
    inputLabel: "PAN Number",
  },

  // {
  //   field: "uan",
  //   title: "UAN Verification",
  //   description: "Verify your Universal Account Number",
  //   inputLabel: "UAN Number",
  // },
  // {
  //   field: "bank_account",
  //   title: "Bank Account Verification",
  //   description: "Verify your Bank Account",
  //   inputLabel: "Bank Account Number",
  // },
  {
    field: "aadhaar",
    title: "Aadhaar Verification",
    description: "Verify your 12-digit Aadhaar number",
    inputLabel: "Aadhaar Number",
  },
];

const completedVerifications = computed(() => 2);
const verificationProgress = computed(
  () => (completedVerifications.value / verificationFields.length) * 100,
);

// Add these functions at the top of your script
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
}

function decryptData(encryptedText) {
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
}

const aadhaarFormData = ref({
  number: "",
});
const digilockerURL = ref("");
const showVerificationSuccess = ref(false);
const clientId = ref("");
const aadhaarDetails = ref(null);
const showAadhaarDetails = ref(false);
const aadhaarStatus = ref(null);

const handleAadhaarVerification = async () => {
  try {
    const payload = {
      employeeId: String(props.employeeData.id),
      documents: [
        {
          documentType: "aadhaar",

          status: "Pending",
        },
      ],
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/backgroundVerification`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();
    digilockerURL.value = result?.results?.[0]?.digilocker?.url || "";
    clientId.value = result?.results?.[0]?.digilocker?.client_id;
    if (clientId.value) {
      localStorage.setItem("aadhaarClientId", clientId.value);
    }
    
    completeVerification();
  } catch (error) {
    console.error("Verification failed", error);
  }
};
const handleAadhaarOk = async () => {
  showAadhaarDetails.value = false;

  const updatePayload = {
    employeeId: String(props.employeeData.id),
    documents: [
      {
        documentType: "aadhaar",
        status: aadhaarStatus.value?.message === "Success" ? "verified" : "failed",
      },
    ],
  };

  try {
    await fetch(
      `${import.meta.env.VITE_API_URL}/backgroundVerification/update-status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      },
    );
    
  } catch (error) {
    console.error("Failed to update Aadhaar status", error);
  }
};

const completeVerification = () => {
  window.open(digilockerURL.value, "_blank");
};

function closeVerificationModal() {
  showVerificationSuccess.value = false;
}

const fetchPersonalModuleData = async () => {
  if (!token) {
    return;
  }

  try {
    const params = {
      fields: [
        "id",
        "employeeId",
        "assignedUser.id",
        "assignedUser.voter_ID",
        "assignedUser.driving_License",
        "assignedUser.UAN",
        "assignedUser.gst",
        "assignedUser.pan",
        "assignedUser.aadhar",
        "assignedUser.aadharVerification",
        "assignedUser.panVerification",
        "assignedUser.gstVerification",
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
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`,
      {
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

    const user = data.data.assignedUser || {};
    userData.value.pan = decryptData(user.pan) || "";
    userData.value.aadhaar = decryptData(user.aadhar) || "";
    userData.value.uan = decryptData(user.UAN) || "";
    userData.value.bank_account = decryptData(user.bank_account) || "";
    userData.value.panVerification = user.panVerification || "";
    userData.value.aadhaarVerification = user.aadharVerification || "";
    userData.value.gstVerification = user.gstVerification || "";
    aadhaarFormData.value = {
      number: user.aadhar || "",
    };
  } catch (error) {
    console.error("Error fetching personal module data:", error);
  }
};

const fetchBgVerification = async () => {
  if (!token) return;

  try {
    const params = {
      fields: ["employee", "verifiedData", "id"],
      filter: {
        employee: { _eq: props.id },
      },
    };

    const queryString = [
      ...params.fields.map((f) => `fields[]=${f}`),
      ...Object.entries(params.filter).map(([key, val]) => {
        const [op] = Object.keys(val);
        return `filter[${key}][${op}]=${val[op]}`;
      }),
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/bgVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("Fetched bgVerification:", data);

    // Store the bg verification data
    if (data.data && data.data.length > 0) {
      bgVerificationData.value = data.data[0];
    }

    return data;
  } catch (err) {
    console.error("Error fetching bgVerification:", err);
  }
};

const getDocumentIcon = (field) => {
  switch (field) {
    case "pan":
      return CardIcon;
    case "aadhaar":
      return UserIcon;
    case "uan":
      return BuildingIcon;
    case "bank_account":
      return CardIcon;
    default:
      return UserIcon;
  }
};

const getDocumentStatus = (field) => {
  // Check from bgVerification API response only
  if (bgVerificationData.value?.verifiedData?.[field]) {
    return bgVerificationData.value.verifiedData[field].status;
  }

  // Default status if not found in API
  return "not_started";
};

const isVerifyButtonDisabled = (field) => {
  const status = getDocumentStatus(field);
  return status === "verified" || status === "pending";
};

// Add function to get button text based on status
const getButtonText = (field) => {
  const status = getDocumentStatus(field);
  switch (status) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending";
    case "failed":
      return "Retry";
    default:
      return "Verify";
  }
};

const getVerificationDate = (field) => {
  if (bgVerificationData.value && bgVerificationData.value.verifiedData) {
    const verifiedData = bgVerificationData.value.verifiedData;
    if (verifiedData[field] && verifiedData[field].verifiedAt) {
      return verifiedData[field].verifiedAt;
    }
  }

  return verificationDates.value[field] || new Date().toISOString();
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const handleVerification = async (doc) => {
  if (isVerifyButtonDisabled(doc.field)) {
    return;
  }

  const payload = {
    employeeId: String(props.employeeData.id),
    documents: [
      {
        documentType: doc.field,
        documentNumber: String(userData.value[doc.field]),
        status: "Pending",
      },
    ],
  };

  try {
    if (!token) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/backgroundVerification`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      finalStatus = "failed";
      finalError = result?.message || result?.error || "Verification failed";
    }

    console.log("Verification result:", result);

    const updatePayload = {
      employeeId: String(props.employeeData.id),
      documents: (result?.results || []).map((docResult) => ({
        documentType: docResult.documentType,
        status: docResult.status ,
      })),
    };

    await fetch(
      `${import.meta.env.VITE_API_URL}/backgroundVerification/update-status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      },
    );

    await fetchBgVerification();
  } catch (error) {
    verificationStatuses.value[doc.field] = "failed";
    verificationErrors.value[doc.field] = error.message;
    console.error("Verification failed:", error);
  }
};

onMounted(async () => {
  await fetchPersonalModuleData();  
  await fetchBgVerification();
  const storedClientId = localStorage.getItem("aadhaarClientId");
  if (storedClientId) {
    clientId.value = storedClientId;
  }
  if (clientId.value) {
    try {
      const statusRes = await fetch(
        `${import.meta.env.VITE_API_URL}/backgroundVerification/aadhaar/status?client_id=${clientId.value}`,
      );
      const statusJson = await statusRes.json();
      aadhaarDetails.value = statusJson.digilockerStatus.data.aadhaar_xml_data;
      aadhaarStatus.value = statusJson.digilockerStatus;
      console.log(aadhaarDetails.value);
      showAadhaarDetails.value = true;
    } catch (error) {
      console.error("Failed to fetch Aadhaar status", error);
    }
  }
});
</script>

<style scoped>
.aadhaar-details-box {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  color: #d1d5db;
}

.ok-button {
  margin-top: 12px;
  background-color: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.verification-success-content {
  text-align: center;
  padding: 32px 24px;
  background: white;
  border-radius: 8px;
}

.success-icon {
  margin-bottom: 16px;
}

.verification-success-content h2 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.verification-success-content p {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.complete-verification-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto 12px auto;
}

.redirect-text {
  color: #9ca3af;
  font-size: 12px;
  margin: 0;
}
.aadhaar-verification-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.submit-button {
  margin-top: 1rem;
  align-self: flex-start;
}
.button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f3f4f6;
  color: #9ca3af;
}

.button-disabled:hover {
  background-color: #f3f4f6;
  color: #9ca3af;
}
.future-feature-container {
  position: relative;
  height: calc(90vh - 200px);
  overflow: hidden;
  border-radius: 8px;
}

.blurred-content {
  filter: blur(4px);
  opacity: 0.2;
  pointer-events: none;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.future-feature-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 20px;
}

.future-feature-content {
  text-align: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  padding: 30px;
  overflow: hidden;
}

.future-feature-icon {
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.future-feature-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.future-feature-subtitle {
  font-size: 20px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 16px;
}

.future-feature-description {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
}

.future-feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  text-align: left;
  flex-shrink: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.future-feature-button {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.future-feature-eta {
  font-size: 12px;
  color: #999;
  font-style: italic;
  flex-shrink: 0;
}

/* Original verification styles (blurred background) */
.verification-container {
  margin: 0 auto;
}

.verification-header {
  margin-bottom: 32px;
  text-align: center;
}

.verification-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.verification-subtitle {
  font-size: 16px;
  color: #666;
}

.verification-progress {
  margin-bottom: 32px;
}

.progress-bar-container {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #666;
  text-align: right;
}

.verification-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  gap: 24px;
}

.verification-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: white;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.verified-card {
  border-color: #4caf50;
  background-color: #f9fff9;
}

.failed-card {
  border-color: #f44336;
  background-color: #fff5f5;
}

.pending-card {
  border-color: #ff9800;
  background-color: #fffaf0;
}

.card-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f0f0f0;
}

.card-title-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.card-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.verified {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-badge.failed {
  background-color: #ffebee;
  color: #f44336;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-badge.not-started {
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.card-content {
  padding: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.verification-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.verify-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #4caf50;
  background-color: #4caf50;
  color: white;
}

.verify-button:hover {
  background-color: #45a049;
}

.verify-button:disabled,
.button-disabled {
  background-color: #cccccc !important;
  color: #666666 !important;
  cursor: not-allowed !important;
  border-color: #cccccc !important;
}

.verify-button:disabled:hover,
.button-disabled:hover {
  background-color: #cccccc !important;
  transform: none !important;
  box-shadow: none !important;
}

.verification-success,
.verification-failed,
.verification-pending {
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.verification-success {
  background-color: #e8f5e9;
}

.verification-failed {
  background-color: #ffebee;
}

.verification-pending {
  background-color: #fff3e0;
}

@media (max-width: 768px) {
  .future-feature-content {
    padding: 20px;
  }

  .future-feature-title {
    font-size: 24px;
  }

  .future-feature-subtitle {
    font-size: 18px;
  }

  .future-feature-list {
    grid-template-columns: 1fr;
  }
}
</style>

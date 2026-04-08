<template>
  <div class="government-id">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <v-container
      v-else-if="employeeData"
      style="height: calc(90vh - 170px); overflow: auto"
    >
      <v-card class="fill-height">
        <v-dialog v-model="kycAgreementDialog" max-width="500">
          <v-card>
            <v-card-title class="bg-primary">
              <span class="text-h5">KYC Verification Agreement</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-checkbox
                v-model="agreed"
                label=" I agree to do KYC and store the details for company records and
                Payroll application"
                class="mt-2"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red" variant="text" @click="cancelVerification">
                Cancel
              </v-btn>
              <v-btn
                color="green"
                variant="flat"
                :disabled="!agreed"
                @click="proceedWithVerification"
              >
                Submit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-card-title>
          <div class="d-flex justify-space-between align-center w-100">
            <div>
              <h3 class="d-flex justify-space-between align-center mb-4">
                Government ID Verification
              </h3>
            </div>
          </div>
        </v-card-title>
        <v-alert
          v-if="employeeData?.assignedUser?.verificationDisclaimer"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          You have already agreed to the disclaimer for storing your KYC details
          securely for company records and payroll processing.
        </v-alert>

        <v-card-text
          class="pa-6"
          style="height: calc(90vh - 300px); overflow-y: auto"
        >
          <div class="verification-container">
            <!-- Aadhaar Section -->
            <div
              class="verification-row border-l-blue"
              :class="{ 'bg-grey-lighten-5': true }"
            >
              <div class="row-content">
                <div class="input-section">
                  <div class="section-header">
                    <div class="icon-wrapper bg-blue-lighten-4">
                      <span class="icon-text">10</span>
                    </div>
                    <h4 class="section-title">Aadhaar</h4>
                  </div>
                  <div class="input-controls aadhaar-controls">
                    <v-text-field
                      v-model="employeeData.assignedUser.aadhar"
                      label="Aadhar"
                      type="text"
                      :rules="[rules.aadharFormat]"
                      @update:model-value="
                        (val) => handleInputChange('aadhar', val)
                      "
                      @blur="checkAadharExists"
                      variant="outlined"
                      density="comfortable"
                      placeholder="Enter Aadhar number"
                      class="flex-grow-1"
                    />
                    <v-btn
                      :color="
                        ['verified'].includes(verificationStatuses?.aadhaar)
                          ? 'grey'
                          : 'green'
                      "
                      size="large"
                      :disabled="
                        ['verified'].includes(verificationStatuses?.aadhaar)
                      "
                      @click="handleAadhaarVerification"
                      class="verify-btn"
                    >
                      {{
                        ["verified"].includes(verificationStatuses?.aadhaar)
                          ? "Verified"
                          : "Verify"
                      }}
                    </v-btn>
                  </div>
                </div>

                <div class="details-section">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="d-flex align-center">
                        <v-icon color="green" size="small" class="mr-2">
                          mdi-check-circle
                        </v-icon>
                        <span class="verification-status"
                          >Verification Details</span
                        >
                      </div>
                      <div class="d-flex ga-2" v-if="userRole === 'Admin'">
                        <v-btn
                          color="black"
                          size="small"
                          :loading="isUpdating"
                          @click="updateAadhaar"
                        >
                          UPDATE
                        </v-btn>
                        <v-btn
                          color="red"
                          size="small"
                          :loading="isRejecting"
                          @click="rejectDocument('aadhaar')"
                        >
                          REJECT
                        </v-btn>
                      </div>
                    </div>
                    <div class="aadhaar-details-grid">
                      <div class="detail-section-title">Personal Details</div>

                      <div class="personal-details-row">
                        <div class="photo-section">
                          <label class="detail-label">Photo:</label>
                          <img
                            v-if="aadhaarDetails?.profile_image"
                            :src="`data:image/jpeg;base64,${aadhaarDetails.profile_image}`"
                            alt="Aadhaar Photo"
                            class="aadhaar-photo"
                          />
                        </div>

                        <div class="personal-info-grid">
                          <div class="detail-item">
                            <label class="detail-label">Full Name:</label>
                            <p class="detail-value">
                              {{ aadhaarDetails?.full_name || "—" }}
                            </p>
                          </div>
                          <div class="detail-item">
                            <label class="detail-label">Gender:</label>
                            <p class="detail-value">
                              {{ aadhaarDetails?.gender || "—" }}
                            </p>
                          </div>
                          <div class="detail-item">
                            <label class="detail-label">Date of Birth:</label>
                            <p class="detail-value">
                              {{ aadhaarDetails?.dob || "—" }}
                            </p>
                          </div>
                          <div class="detail-item">
                            <label class="detail-label"
                              >Care Of / Father's Name:</label
                            >
                            <p class="detail-value">
                              {{
                                aadhaarDetails?.father_name ||
                                aadhaarDetails?.care_of ||
                                "—"
                              }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="detail-section-title address-title">
                        📍 Address Details
                      </div>
                      <div class="address-section">
                        <label class="detail-label">Full Address:</label>
                        <p class="detail-value">
                          {{
                            aadhaarDetails?.full_address
                              ? `${aadhaarDetails.address.house},${aadhaarDetails.address.street},${aadhaarDetails.address.vtc},${aadhaarDetails.zip}, ${aadhaarDetails.address.dist}, ${aadhaarDetails.address.state}, ${aadhaarDetails.address.country}`
                              : "—"
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- UAN Section -->
            <div
              v-if="verificationStatuses?.aadhaar === 'verified'"
              class="verification-row border-l-orange"
              :class="{ 'bg-grey-lighten-5': true }"
            >
              <div class="row-content">
                <div class="input-section">
                  <div
                    class="section-header d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center">
                      <div class="icon-wrapper bg-orange-lighten-4">
                        <v-icon color="orange-darken-2" size="small"
                          >mdi-credit-card</v-icon
                        >
                      </div>
                      <h4 class="section-title mb-0">UAN</h4>
                    </div>
                    <v-chip
                      class="px-4"
                      rounded="0"
                      color="black-darken-4"
                      size="large"
                    >
                      {{
                        employeeData.assignedUser.PFAccountNumber ||
                        "NotVerified"
                      }}
                    </v-chip>
                  </div>

                  <div class="input-controls">
                    <v-text-field
                      label="Aadhaar Number"
                      v-model="employeeData.assignedUser.aadhar"
                      variant="outlined"
                      density="comfortable"
                      color="black"
                      disabled
                    />

                    <v-btn
                      :color="
                        ['verified'].includes(verificationStatuses?.uan)
                          ? 'grey'
                          : 'green'
                      "
                      size="small"
                      :disabled="
                        ['verified'].includes(verificationStatuses?.uan)
                      "
                      @click="
                        verifyDocument('uan', employeeData.assignedUser?.aadhar)
                      "
                      class="verify-btn"
                    >
                      {{
                        ["verified"].includes(verificationStatuses?.uan)
                          ? "Verified"
                          : "Verify"
                      }}
                    </v-btn>
                  </div>
                </div>

                <div class="details-section">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="d-flex align-center">
                        <v-icon color="green" size="small" class="mr-2"
                          >mdi-check-circle</v-icon
                        >
                        <span class="verification-status"
                          >Verification Details</span
                        >
                      </div>
                      <div class="d-flex ga-2" v-if="userRole === 'Admin'">
                        <v-btn
                          color="black"
                          size="small"
                          @click="
                            () => {
                              changedFields.PFAccountNumber =
                                uanDetails?.uan || '';
                              updateGovernmentIds();
                            }
                          "
                        >
                          UPDATE
                        </v-btn>
                        <v-btn
                          color="red"
                          size="small"
                          :loading="isRejecting"
                          @click="rejectDocument('uan')"
                        >
                          REJECT
                        </v-btn>
                      </div>
                    </div>
                    <div class="details-grid">
                      <div class="detail-item">
                        <label class="detail-label">UAN Number:</label>
                        <p class="detail-value">
                          {{ uanDetails?.uan || "-" }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="verification-row border-l-orange"
              :class="{ 'bg-grey-lighten-5': true }"
            >
              <div class="row-content d-flex align-center justify-center pa-6">
                <v-icon color="red" size="40" class="mr-3"
                  >mdi-alert-circle</v-icon
                >
                <div>
                  <h4 class="text-lg font-semibold mb-1">
                    UAN Verification Locked
                  </h4>
                  <p class="text-grey-darken-1 mb-0">
                    Please complete <strong>Aadhaar verification</strong> before
                    you can proceed with <strong>UAN verification</strong>.
                  </p>
                </div>
              </div>
            </div>
            <!-- PAN Section -->
            <div
              class="verification-row border-l-purple"
              :class="{ 'bg-grey-lighten-5': false }"
            >
              <div class="row-content">
                <div class="input-section">
                  <div class="section-header">
                    <div class="icon-wrapper bg-purple-lighten-4">
                      <v-icon color="purple-darken-2" size="small"
                        >mdi-file-document</v-icon
                      >
                    </div>
                    <h4 class="section-title">PAN</h4>
                  </div>
                  <div class="input-controls">
                    <v-text-field
                      v-model="employeeData.assignedUser.pan"
                      label="PAN"
                      :rules="[rules.panFormat]"
                      @update:model-value="
                        (val) => handleInputChange('pan', val)
                      "
                      @blur="checkPanExists"
                      variant="outlined"
                      density="comfortable"
                      placeholder="Enter PAN details"
                      class="flex-grow-1"
                    />
                    <v-btn
                      :color="
                        ['verified'].includes(verificationStatuses?.pan)
                          ? 'grey'
                          : 'green'
                      "
                      :disabled="
                        ['verified'].includes(verificationStatuses?.pan)
                      "
                      size="large"
                      @click="
                        verifyDocument('pan', employeeData.assignedUser?.pan)
                      "
                      class="verify-btn"
                    >
                      {{
                        ["verified"].includes(verificationStatuses?.pan)
                          ? "Verified"
                          : "Verify"
                      }}
                    </v-btn>
                  </div>
                </div>

                <div class="details-section">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="d-flex align-center">
                        <v-icon color="green" size="small" class="mr-2"
                          >mdi-check-circle</v-icon
                        >
                        <span class="verification-status"
                          >Verification Details</span
                        >
                      </div>
                      <div class="d-flex ga-2" v-if="userRole === 'Admin'">
                        <v-btn
                          color="black"
                          size="small"
                          @click="
                            () => {
                              changedFields.pan = panDetails?.pan_number || '';
                              updateGovernmentIds();
                            }
                          "
                        >
                          UPDATE
                        </v-btn>
                        <v-btn
                          color="red"
                          size="small"
                          :loading="isRejecting"
                          @click="rejectDocument('pan')"
                        >
                          REJECT
                        </v-btn>
                      </div>
                    </div>
                    <div class="details-grid">
                      <div class="detail-item">
                        <label class="detail-label">PAN Number:</label>
                        <p class="detail-value">
                          {{ panDetails?.pan_number || "N/A" }}
                        </p>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">Name:</label>
                        <p class="detail-value">
                          {{ panDetails?.full_name || "N/A" }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Bank Account Section -->
            <div
              class="verification-row border-l-green"
              :class="{ 'bg-grey-lighten-5': false }"
            >
              <div class="row-content">
                <div class="input-section">
                  <div class="section-header">
                    <div class="d-flex align-center">
                      <div class="icon-wrapper bg-blue-lighten-4">
                        <v-icon color="blue-darken-2" size="small"
                          >mdi-bank</v-icon
                        >
                      </div>
                      <h4 class="section-title mb-0">Bank Account</h4>
                    </div>
                  </div>
                  <v-text-field
                    v-model="employeeData.assignedUser.accountNumber"
                    label="Bank Account Number"
                    @update:model-value="
                      (val) => handleInputChange('accountNumber', val)
                    "
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter bank account number"
                    class="flex-grow-1 mr-2"
                  />
                  <v-text-field
                    v-model="employeeData.assignedUser.IFSC"
                    label="IFSC Code"
                    @update:model-value="
                      (val) => handleInputChange('IFSC', val)
                    "
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter IFSC code"
                    class="flex-grow-1 mr-2"
                  />
                  <v-btn
                    :color="
                      ['verified'].includes(verificationStatuses?.bank_account)
                        ? 'grey'
                        : 'green'
                    "
                    size="large"
                    :disabled="
                      ['verified'].includes(verificationStatuses?.bank_account)
                    "
                    @click="
                      verifyDocument(
                        'bank_account',
                        `${employeeData.assignedUser.accountNumber}-${employeeData.assignedUser.IFSC}`,
                      )
                    "
                    class="verify-btn"
                  >
                    {{
                      ["verified"].includes(verificationStatuses?.bank_account)
                        ? "Verified"
                        : "Verify"
                    }}
                  </v-btn>
                </div>

                <div class="details-section">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="d-flex align-center">
                        <v-icon color="green" size="small" class="mr-2"
                          >mdi-check-circle</v-icon
                        >
                        <span class="verification-status"
                          >Verification Details</span
                        >
                      </div>
                      <div class="d-flex ga-2" v-if="userRole === 'Admin'">
                        <v-btn
                          color="black"
                          size="small"
                          @click="
                            () => {
                              changedFields.bankName =
                                bankDetails?.ifsc_details?.bank_name || '';
                              changedFields.bankBranch =
                                bankDetails?.ifsc_details?.branch || '';
                              updateGovernmentIds();
                            }
                          "
                        >
                          UPDATE
                        </v-btn>
                        <v-btn
                          color="red"
                          size="small"
                          :loading="isRejecting"
                          @click="rejectDocument('bank_account')"
                        >
                          REJECT
                        </v-btn>
                      </div>
                    </div>
                    <div class="details-grid">
                      <div class="detail-item">
                        <label class="detail-label">Full Name:</label>
                        <p class="detail-value">
                          {{ bankDetails?.full_name || "—" }}
                        </p>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">IFSC Code:</label>
                        <p class="detail-value">
                          {{ bankDetails?.ifsc_details?.ifsc || "—" }}
                        </p>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">Bank Name:</label>
                        <p class="detail-value">
                          {{ bankDetails?.ifsc_details?.bank_name || "—" }}
                        </p>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">Branch:</label>
                        <p class="detail-value">
                          {{ bankDetails?.ifsc_details?.branch || "—" }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="verification-row border-l-blue"
              :class="{ 'bg-grey-lighten-5': true }"
            >
              <div class="row-content">
                <div class="input-section">
                  <div class="section-header">
                    <div class="icon-wrapper bg-blue-lighten-4">
                      <span class="icon-text">11</span>
                    </div>
                    <h4 class="section-title">ESIC</h4>
                  </div>
                  <div class="input-controls aadhaar-controls">
                    <v-text-field
                      v-model="employeeData.assignedUser.ESIAccountNumber"
                      label="ESIC Number"
                      type="text"
                      :rules="[rules.esicFormat]"
                      @update:model-value="
                        (val) => handleInputChange('ESIAccountNumber', val)
                      "
                      variant="outlined"
                      density="comfortable"
                      placeholder="Enter ESIC number"
                      class="flex-grow-1"
                    />
                    <v-btn
                      :color="
                        ['verified'].includes(verificationStatuses?.esic)
                          ? 'grey'
                          : 'green'
                      "
                      :disabled="
                        ['verified'].includes(verificationStatuses?.esic)
                      "
                      size="large"
                      @click="
                        verifyDocument(
                          'esic',
                          employeeData.assignedUser?.ESIAccountNumber,
                        )
                      "
                      class="verify-btn"
                    >
                      {{
                        ["verified"].includes(
                          verificationStatuses?.ESIAccountNumber,
                        )
                          ? "Verified"
                          : "Verify"
                      }}
                    </v-btn>
                  </div>
                </div>

                <div class="details-section">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="d-flex align-center">
                        <v-icon color="green" size="small" class="mr-2"
                          >mdi-check-circle</v-icon
                        >
                        <span class="verification-status"
                          >Verification Details</span
                        >
                      </div>
                      <div class="d-flex ga-2" v-if="userRole === 'Admin'">
                        <v-btn
                          color="black"
                          size="small"
                          @click="
                            () => {
                              changedFields.ESIAccountNumber =
                                esicDetails?.id_number || '';
                              updateGovernmentIds();
                            }
                          "
                        >
                          UPDATE
                        </v-btn>
                        <v-btn
                          color="red"
                          size="small"
                          :loading="isRejecting"
                          @click="rejectDocument('esic')"
                        >
                          REJECT
                        </v-btn>
                      </div>
                    </div>
                    <div class="details-grid esic-details">
                      <div class="detail-section-title">ESIC Details</div>
                      <div class="detail-item">
                        <label class="detail-label">ESIC Name:</label>
                        <p class="detail-value">
                          {{ esicDetails?.name || "-" }}
                        </p>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">ESIC Number:</label>
                        <p class="detail-value">
                          {{ esicDetails?.id_number || "-" }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- <div
              class="verification-row border-l-blue"
              :class="{ 'bg-grey-lighten-5': true }"
            >
              <div class="row-content">
                <div class="input-section">
                  <div class="section-header">
                    <div class="icon-wrapper bg-blue-lighten-4">
                      <span class="icon-text">12</span>
                    </div>
                    <h4 class="section-title">Additional Details</h4>
                  </div>
                  <div class="input-controls aadhaar-controls">
                    <v-btn
                      color="blue-darken-2"
                      size="large"
                      @click="downloadAdditionalDetails"
                      class="verify-btn"
                    >
                      DOWNLOAD
                    </v-btn>
                  </div>
                </div>

                <div class="details-section">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="d-flex align-center">
                        <v-icon color="blue" size="small" class="mr-2"
                          >mdi-information-outline</v-icon
                        >
                        <span class="verification-status">Additional Info</span>
                      </div>
                    </div>
                    <div class="details-grid aadhaar-details">
                      <div class="detail-section-title">File Will Contain</div>
                      <div class="detail-item detail-full">
                        <label class="detail-label">Included Data:</label>
                        <p class="detail-value">
                          Employee Name, Aadhaar, ESIC, Address, and Department
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <v-container v-else>
      <v-row>
        <v-col cols="12" class="text-center">
          <p>No employee data found.</p>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import crypto from "crypto-js";

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
const kycAgreementDialog = ref(false);
const agreed = ref(false);
const employeeData = ref(null);
const userRole = currentUserTenant.getRole();
const tenantId = currentUserTenant.getTenantId();
const emit = defineEmits(["update:employeeData", "has-unsaved-changes"]);
const loading = ref(true);
const error = ref(null);
const originalData = ref(null);
const changedFields = ref({});
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const token = authService.getToken();
const hasChanges = computed(() => Object.keys(changedFields.value).length > 0);

// New verification state
const showVerification = ref(false);

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

const verificationStatuses = ref({});
const bgVerificationRecordId = ref(null);
const bgVerificationData = ref(null);
const aadhaarDetails = ref({});
const panDetails = ref({});
const clientId = ref(null);
const esicDetails = ref({});
const uanDetails = ref({});
const bankDetails = ref({});

const proceedWithVerification = async () => {
  if (!agreed.value) {
    kycAgreementDialog.value = false;
    return;
  }

  await fetch(
    `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assignedUser: {
          id: props.employeeData.assignedUser.id,
          verificationDisclaimer: true,
        },
      }),
    },
  );

  kycAgreementDialog.value = false;
};
const cancelVerification = () => {
  kycAgreementDialog.value = false;
  pendingVerificationType.value = null;
  pendingVerificationValue.value = null;
};
const verifyDocument = async (type, number) => {
  loading.value = true;
  let payloadDocuments;

  if (type === "bank_account") {
    const [accountNumber, ifsc] = number.split("-");
    payloadDocuments = {
      documentType: type,
      documentNumber: accountNumber,
      ifsc: ifsc || "",
      status: "Pending",
    };
  } else {
    payloadDocuments = {
      documentType: type,
      documentNumber: number,
      status: "Pending",
    };
  }

  const payload = {
    employeeId: props.id,
    documents: [payloadDocuments],
  };

  try {
    await updateGovernmentIds();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/backgroundVerification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await res.json();

    if (!res.ok) {
      console.error("Verification failed:", result);
      return;
    }
    if (
      result?.results?.[0]?.status === "failed" &&
      result?.results?.[0]?.verificationDetails?.message
    ) {
      showErrorMessage(result.results[0].verificationDetails.message);
      loading.value = false;
      return;
    }
    // 1. Update status
    const updatePayload = {
      employeeId: props.id,
      documents: (result?.results || []).map((docResult) => ({
        documentType: docResult.documentType,
        status: docResult.status,
      })),
    };

    await fetch(
      `${import.meta.env.VITE_API_URL}/backgroundVerification/update-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(updatePayload),
      },
    );

    // 2. PATCH relevant details to bgVerification record
    const docType = result?.results?.[0]?.documentType;
    const docData = result?.results?.[0]?.verificationDetails?.data || {};
    let patchPayload = {};

    if (docType === "pan") {
      patchPayload.panDetails = docData;
    } else if (docType === "uan") {
      patchPayload.uanDetails = docData;
    } else if (docType === "bank_account") {
      patchPayload.bankDetails = docData;
    } else if (docType === "esic") {
      patchPayload.esicDetails = docData;
    }

    await fetch(
      `${import.meta.env.VITE_API_URL}/items/bgVerification/${bgVerificationRecordId.value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchPayload),
      },
    );

    await fetchBgVerification();
    showSuccessMessage("Verification completed successfully!");
    loading.value = false;
  } catch (err) {
    console.error("❌ Verification failed:", err);
    loading.value = false;
  }
};

const fetchBgVerification = async () => {
  if (!token) return;

  try {
    const params = {
      fields: [
        "employee",
        "verifiedData",
        "id",
        "aadharDetails",
        "panDetails",
        "uanDetails",
        "bankDetails",
        "clientId",
        "esicDetails",
      ],
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

    if (data.data && data.data.length > 0) {
      const result = data.data[0];
      bgVerificationData.value = result;
      bgVerificationRecordId.value = result.id;
      aadhaarDetails.value = result.aadharDetails || {};
      panDetails.value = result.panDetails || {};
      clientId.value = result.clientId || null;
      esicDetails.value = result.esicDetails || {};
      uanDetails.value = result.uanDetails || {};
      bankDetails.value = result.bankDetails || {};

      // extract and store document status info like: pan, aadhar, etc.
      const verifiedData = result.verifiedData || {};

      verificationStatuses.value = Object.fromEntries(
        Object.entries(verifiedData).map(([key, doc]) => [
          key,
          doc?.status || "",
        ]),
      );
    }

    return data;
  } catch (err) {
    console.error("Error fetching bgVerification:", err);
  }
};
const isRejecting = ref(false);

const rejectDocument = async (docType) => {
  if (!bgVerificationRecordId.value || !token) return;

  isRejecting.value = true;

  const updatedVerifiedData = {
    ...(bgVerificationData.value.verifiedData || {}),
  };
  const detailsPatch = {};
  if (docType === "uan") detailsPatch.uanDetails = null;
  if (docType === "pan") detailsPatch.panDetails = null;
  if (docType === "bank_account") detailsPatch.bankDetails = null;
  if (docType === "esic") detailsPatch.esicDetails = null;
  if (docType === "aadhaar") detailsPatch.aadharDetails = null;
  if (updatedVerifiedData[docType]) {
    updatedVerifiedData[docType].status = "failed";
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/bgVerification/${bgVerificationRecordId.value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verifiedData: updatedVerifiedData,
          ...detailsPatch,
        }),
      },
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    showSuccessMessage("Changes Updated successfully.");
    await fetchBgVerification();
  } catch (err) {
    showErrorMessage("Failed to update Changes.");
    console.error(`❌ Error rejecting ${docType} verification:`, err);
  } finally {
    isRejecting.value = false;
  }
};

const downloadAdditionalDetails = async () => {
  if (!clientId.value) {
    console.warn("Client ID not available");
    return;
  }

  const url = `${import.meta.env.VITE_API_URL}/backgroundVerification/list-documents?digilocker_client_id=${clientId.value}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log("Fetched additional details:", result);

    // Extract file_ids from documents
    const fileIds = result?.documents?.data?.documents || [];

    // 🔁 PATCH call to save fileId
    const patchUrl = `${import.meta.env.VITE_API_URL}/items/bgVerification/${bgVerificationRecordId.value}`;

    const patchResponse = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify({
        data: {
          fileId: fileIds,
        },
      }),
    });

    if (!patchResponse.ok) {
      throw new Error(
        `Patch request failed with status ${patchResponse.status}`,
      );
    }

    console.log("Successfully updated fileId in bgVerification");
  } catch (err) {
    console.error("Error:", err);
  }
};

const handleAadhaarVerification = async () => {
  try {
    await updateGovernmentIds();
    const payload = {
      employeeId: String(props.id),
      frontEndURL: import.meta.env.VITE_UI_URL,
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

    if (
      result?.results?.[0]?.status === "failed" &&
      result?.results?.[0]?.error
    ) {
      showErrorMessage(result.results[0].error);
      return;
    }

    digilockerURL.value = result?.results?.[0]?.digilocker?.url || "";
    clientId.value = result?.results?.[0]?.digilocker?.client_id;

    if (clientId.value) {
      localStorage.setItem("aadhaarClientId", clientId.value);

      // 🔁 PATCH call to update clientId in bgVerification record
      const patchPayload = {
        clientId: clientId.value,
      };

      await fetch(
        `${import.meta.env.VITE_API_URL}/items/bgVerification/${bgVerificationRecordId.value}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        },
      );
    }

    if (clientId.value) {
      localStorage.setItem("aadhaarClientId", clientId.value);
    }

    if (digilockerURL.value) {
      window.open(digilockerURL.value, "_self");
    }
  } catch (error) {
    console.error("Verification failed", error);
  }
};

const refreshData = async () => {
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

      if (!statusJson.success) {
        console.error("Aadhaar status fetch failed:", statusJson.message);
        return;
      }

      aadhaarDetails.value =
        statusJson.digilockerStatus?.data?.aadhaar_xml_data || {};
      aadhaarStatus.value = statusJson.digilockerStatus || {};

      await handleAadhaarOk();
    } catch (error) {
      console.error("Failed to fetch Aadhaar status", error);
    }
  }
};

const handleAadhaarOk = async () => {
  const updatePayload = {
    employeeId: String(props.id),
    documents: [
      {
        documentType: "aadhaar",
        status:
          aadhaarStatus.value?.message === "Success" ? "verified" : "failed",
      },
    ],
  };

  try {
    // 1. Update status
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

    await fetch(
      `${import.meta.env.VITE_API_URL}/items/bgVerification/${bgVerificationRecordId.value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadharDetails: {
            full_name: aadhaarDetails.value?.full_name || "",
            care_of: aadhaarDetails.value?.care_of || "",
            dob: aadhaarDetails.value?.dob || "",
            yob: aadhaarDetails.value?.yob || "",
            zip: aadhaarDetails.value?.zip || "",
            profile_image: aadhaarDetails.value?.profile_image || "",
            gender: aadhaarDetails.value?.gender || "",
            masked_aadhaar: aadhaarDetails.value?.masked_aadhaar || "",
            full_address: aadhaarDetails.value?.full_address || "",
            father_name: aadhaarDetails.value?.father_name || "",
            address: {
              country: aadhaarDetails.value?.address?.country || "",
              dist: aadhaarDetails.value?.address?.dist || "",
              state: aadhaarDetails.value?.address?.state || "",
              po: aadhaarDetails.value?.address?.po || "",
              house: aadhaarDetails.value?.address?.house || "",
              loc: aadhaarDetails.value?.address?.loc || "",
              vtc: aadhaarDetails.value?.address?.vtc || "",
              subdist: aadhaarDetails.value?.address?.subdist || "",
              street: aadhaarDetails.value?.address?.street || "",
              landmark: aadhaarDetails.value?.address?.landmark || "",
            },
          },
        }),
      },
    );

    await fetchBgVerification();
    await downloadAdditionalDetails();
  } catch (error) {
    console.error("❌ Failed to update Aadhaar status", error);
  }
};
const isUpdating = ref(false);
const updateAadhaar = async () => {
  if (!token || !props.id || !bgVerificationData.value?.aadharDetails) return;

  const aadhaar = bgVerificationData.value.aadharDetails;

  const payload = {
    assignedUser: {
      id: props.employeeData?.assignedUser?.id,
      first_name: aadhaar.full_name,
      gender:
        aadhaar.gender === "M"
          ? "Male"
          : aadhaar.gender === "F"
            ? "Female"
            : "Others",
      DOB: aadhaar.dob,
      guardians_Name: aadhaar.care_of,
      permanentAddress: {
        country: "India",
        dist: aadhaar.address?.dist || "",
        state: aadhaar.address?.state || "",
        house: aadhaar.address?.house || "",
        vtc: aadhaar.address?.vtc || "",
        street: aadhaar.address?.street || "",
        landmark: aadhaar.address?.landmark || "",
        zip: aadhaar.zip || "",
      },
    },
  };
  isUpdating.value = true;
  try {
    await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    showSuccessMessage("Aadhaar details updated successfully.");
  } catch (error) {
    showErrorMessage("Failed to update Aadhaar details.");
    console.error("❌ Error updating personalModule with Aadhaar data:", error);
  } finally {
    isUpdating.value = false;
  }
};

const toggleVerification = async () => {
  showVerification.value = !showVerification.value;

  if (showVerification.value) {
    const { aadhar, pan, UAN } = employeeData.assignedUser;
    const employeeId = props.id;

    const documents = [];

    if (pan)
      documents.push({
        documentType: "pan",
        documentNumber: pan,
        status: "Pending",
      });

    if (UAN)
      documents.push({
        documentType: "uan",
        documentNumber: UAN,
        status: "Pending",
      });

    if (voter_id)
      documents.push({
        documentType: "voter_id",
        documentNumber: voter_id,
        status: "Pending",
      });

    if (driving_license)
      documents.push({
        documentType: "driving_license",
        documentNumber: driving_license,
        dob: DOB,
        status: "Pending",
      });

    if (documents.length === 0 || !employeeId) return;

    const payload = {
      employeeId,
      documents,
    };

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/items/bgVerification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Verification POST failed:", error);
    }
  }
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const selectedFields = ref([]);

const rules = {
  voter_IDFormat: (v) =>
    !v || /^[A-Z]{3}\d{7}$/.test(v) || "Invalid Voter ID format",
  driving_LicenseFormat: (v) =>
    !v || /^[A-Z]{2}\d{13}$/.test(v) || "Invalid Driving License format",
  UANFormat: (v) => !v || /^\d{12}$/.test(v) || "Invalid UAN format",
  panFormat: (v) =>
    !v ||
    /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.trim().toUpperCase()) ||
    "Invalid PAN format",
  aadharFormat: (v) => !v || /^\d{12}$/.test(v) || "Invalid Aadhar format",
};

const digilockerURL = ref("");

const aadhaarStatus = ref(null);
const showAadharDialog = ref(false);
const verifiedGovData = ref(null);

const viewAadhar = () => {
  if (verifiedGovData.value) {
    showAadharDialog.value = true;
  } else {
    console.warn("Aadhar data not available");
  }
};

const verifyAadhar = async () => {
  try {
    const payload = {
      employeeId: String(props.employeeData.id),
      frontEndURL: import.meta.env.VITE_UI_URL,
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
  } catch (error) {
    console.error("Verification failed", error);
  }
};

const updateSelectedFields = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const assignedUserPayload = {
      id: employeeData.value?.assignedUser?.id || "",
    };

    // Add selected fields to assignedUser object
    selectedFields.value.forEach((field) => {
      switch (field) {
        case "full_name":
          assignedUserPayload.first_name =
            verifiedGovData.value.aadharDetails?.full_name ||
            verifiedGovData.value.full_name ||
            "";
          break;
        case "gender":
          assignedUserPayload.gender =
            verifiedGovData.value.aadharDetails?.gender ||
            verifiedGovData.value.gender ||
            "";
          break;
        case "dob":
          assignedUserPayload.DOB =
            verifiedGovData.value.aadharDetails?.dob ||
            verifiedGovData.value.dob ||
            "";
          break;
        case "care_of":
          assignedUserPayload.guardians_Name =
            verifiedGovData.value.aadharDetails?.care_of ||
            verifiedGovData.value.care_of ||
            "";
          break;
        default:
          // Handle any other fields that might be selected
          if (
            verifiedGovData.value.aadharDetails &&
            verifiedGovData.value.aadharDetails[field]
          ) {
            assignedUserPayload[field] =
              verifiedGovData.value.aadharDetails[field];
          } else if (verifiedGovData.value[field]) {
            assignedUserPayload[field] = verifiedGovData.value[field];
          }
          break;
      }
    });

    // Final payload structure
    const payload = {
      assignedUser: assignedUserPayload,
    };

    console.log("Payload to be sent:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    showSuccessMessage(
      `Successfully updated ${selectedFields.value.length} fields`,
    );
    closeDialog();
  } catch (err) {
    console.error("Error updating selected fields:", err);
    showErrorMessage("Failed to update selected fields");
  }
};

const closeDialog = () => {
  showAadharDialog.value = false;
  selectedFields.value = [];
};

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.voter_ID",
      "assignedUser.driving_License",
      "assignedUser.UAN",
      "assignedUser.gst",
      "assignedUser.pan",
      "assignedUser.aadhar",
      "verifiedData.aadharDetails",
      "verifiedData.panDetails",
      "verifiedData.id",
      "assignedUser.accountNumber",
      "assignedUser.ESIAccountNumber",
      "assignedUser.IFSC",
      "assignedUser.bankName",
      "assignedUser.bankBranch",
      "assignedUser.PFAccountNumber",
      "assignedUser.verificationDisclaimer",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("emplyee", employeeData);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];

      if (employee.assignedUser?.uan && !employee.assignedUser.UAN) {
        employee.assignedUser.UAN = employee.assignedUser.uan;
        delete employee.assignedUser.uan;
      }
      console.log("PAN before check:", employeeData.assignedUser?.pan);

      if (
        employee.assignedUser?.drivingLicense &&
        !employee.assignedUser.driving_License
      ) {
        employee.assignedUser.driving_License =
          employee.assignedUser.drivingLicense;
        delete employee.assignedUser.drivingLicense;
      }

      // Initialize bankAccount if it doesn't exist
      if (!employee.assignedUser?.bankAccount) {
        employee.assignedUser.bankAccount = "";
      }

      employeeData.value = employee;
      console.log("emplyee", employeeData.value);
      if (employeeData.value?.assignedUser?.pan) {
        employeeData.value.assignedUser.pan = decryptData(
          employeeData.value.assignedUser.pan,
        );
      }
      if (employeeData.value?.assignedUser?.aadhar) {
        employeeData.value.assignedUser.aadhar = decryptData(
          employeeData.value.assignedUser.aadhar,
        );
      }

      if (employeeData.value?.assignedUser?.UAN) {
        employeeData.value.assignedUser.UAN = decryptData(
          employeeData.value.assignedUser.UAN,
        );
      }
      if (
        employeeData.value?.assignedUser?.verificationDisclaimer === null ||
        employeeData.value?.assignedUser?.verificationDisclaimer === false
      ) {
        kycAgreementDialog.value = true;
      }

      emit("update:employeeData", employee);
      originalData.value = JSON.parse(JSON.stringify(employee));
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
    error.value = err.message;
    showErrorMessage("Failed to load employee data");
  } finally {
    loading.value = false;
  }
};

const getFieldErrorMessage = (field) => {
  if (!props.employeeData?.assignedUser) return "";
  const value = props.employeeData.assignedUser[field];
  if (value) {
    switch (field) {
      case "voter_ID":
        return rules.voter_IDFormat(value) === true
          ? ""
          : rules.voter_IDFormat(value);
      case "driving_License":
        return rules.driving_LicenseFormat(value) === true
          ? ""
          : rules.driving_LicenseFormat(value);
      case "UAN":
        return rules.UANFormat(value) === true ? "" : rules.UANFormat(value);
      case "pan":
        return rules.panFormat(value) === true ? "" : rules.panFormat(value);
      case "aadhar":
        return rules.aadharFormat(value) === true
          ? ""
          : rules.aadharFormat(value);
    }
  }
  return "";
};

const toUpperCase = (field) => {
  if (props.employeeData && props.employeeData.assignedUser) {
    props.employeeData.assignedUser[field] =
      props.employeeData.assignedUser[field]?.toUpperCase() ?? "";
  }
};

const handleInputChange = (field) => {
  if (
    JSON.stringify(props.employeeData.assignedUser[field]) !==
    JSON.stringify(originalData.value.assignedUser[field])
  ) {
    changedFields.value[field] = props.employeeData.assignedUser[field];
  } else {
    delete changedFields.value[field];
  }

  if (
    [
      "voter_ID",
      "driving_License",
      "PFAccountNumber",
      "gst",
      "pan",
      "ESIAccountNumber",
      "bankName ",
      "bankBranch",
      "IFSC",
    ].includes(field)
  ) {
    toUpperCase(field);
  }

  emit("has-unsaved-changes", hasChanges.value);
};

const updateGovernmentIds = async () => {
  if (!hasChanges.value) {
    // showErrorMessage("No changes to update.");
    return;
  }

  // Validate all fields
  const validationFields = [
    { name: "voter_ID", rule: "voter_IDFormat" },
    { name: "driving_License", rule: "driving_LicenseFormat" },
    { name: "UAN", rule: "UANFormat" },
    { name: "pan", rule: "panFormat" },
    { name: "aadhar", rule: "aadharFormat" },
    { name: "aadhar", rule: "aadharFormat" },
  ];

  const invalidFields = validationFields
    .filter(({ name, rule }) => {
      const value = props.employeeData.assignedUser[name];
      return value && rules[rule](value) !== true;
    })
    .map(({ name }) => name);

  if (invalidFields.length > 0) {
    showErrorMessage(
      `Please correct the following fields: ${invalidFields.join(", ")}`,
    );
    return;
  }

  try {
    const payload = {
      assignedUser: {
        id: props.employeeData.assignedUser.id,
        ...Object.keys(changedFields.value).reduce((acc, key) => {
          acc[key] = changedFields.value[key];
          return acc;
        }, {}),
      },
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    originalData.value = JSON.parse(JSON.stringify(props.employeeData));
    changedFields.value = {};
    emit("has-unsaved-changes", false);
    showSuccessMessage("Government IDs updated successfully!");
  } catch (err) {
    console.error("Error updating government IDs:", err);
    showErrorMessage(
      `Failed to update government IDs. Please try again: ${err.message}`,
    );
  }
};
// const forceUpdateGovernmentIds = async () => {
//   try {
//     const payload = {
//       assignedUser: {
//         id: props.employeeData.assignedUser.id,
//         ...(employeeData.assignedUser?.aadhar !==
//         originalData.value?.assignedUser?.aadhar
//           ? { aadhar: employeeData.assignedUser?.aadhar }
//           : {}),
//         ...changedFields.value,
//       },
//     };

//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
//       {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${authService.getToken()}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     originalData.value = JSON.parse(JSON.stringify(props.employeeData));
//     changedFields.value = {};
//     emit("has-unsaved-changes", false);
//     showSuccessMessage("Government ID updated successfully!");
//   } catch (err) {
//     console.error("Error force updating government ID:", err);
//     showErrorMessage(`Failed to update. Please try again: ${err.message}`);
//   }
// };

onMounted(async () => {
  fetchEmployeeData();
  await fetchBgVerification();
  await refreshData();
});

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  },
);
</script>

<style scoped>
.field-container {
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #424242;
}

.field-disabled {
  opacity: 0.6;
}

.v-text-field--disabled {
  background-color: #f5f5f5;
}

.elevation-8 {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}

.verification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-field {
  margin-bottom: 12px;
}

.verification-field .field-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  display: block;
}

.verification-field .field-value {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.font-mono {
}

.overflow-y-auto {
  overflow-y: auto;
}

.fill-height {
  height: calc(90vh - 170px);
}

.flex-grow-1 {
  flex-grow: 1;
}
.verification-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.verification-row {
  border-left: 4px solid;
  border-bottom: 1px solid #e0e0e0;
  padding: 24px;
}

.verification-row:last-child {
  border-bottom: none;
}

.border-l-green {
  border-left-color: #4caf50;
}

.border-l-orange {
  border-left-color: #ff9800;
}

.border-l-purple {
  border-left-color: #9c27b0;
}

.border-l-blue {
  border-left-color: #2196f3;
}

.row-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1024px) {
  .row-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 14px;
  font-weight: bold;
  color: #1976d2;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.input-controls {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.aadhaar-controls {
  flex-wrap: wrap;
}

.verify-btn {
  min-width: 100px;
  height: 40px;
}

.details-section {
  display: flex;
  flex-direction: column;
}

.details-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 16px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.verification-status {
  font-weight: 600;
  color: #2e7d32;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.aadhaar-details {
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin: 0;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
  word-break: break-word;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 8px 0 4px 0;
  grid-column: 1 / -1;
}

.bg-grey-lighten-5 {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Ensure proper spacing for Vuetify components */
:deep(.v-text-field) {
  flex: 1;
}

:deep(.v-btn) {
  text-transform: uppercase;
  font-weight: 600;
}

.aadhaar-details-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.address-title {
  margin-top: 8px;
}

.personal-details-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
  align-items: start;
}

.photo-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.aadhaar-photo {
  width: 100px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.personal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  align-items: start;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
}

.address-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-section .detail-value {
  font-size: 15px;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .personal-details-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .personal-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .photo-section {
    align-items: center;
  }
}
</style>

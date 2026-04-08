<template>
  <div class="access-management">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Main Content -->
    <div v-else-if="employeeData" class="content-container">
      <!-- Header -->
      <div class="header">
        <div class="title">
          <v-icon size="24" color="primary" class="mr-2">mdi-shield-key</v-icon>
          <h1>Access Management</h1>
        </div>
        <v-btn
          color="black"
          variant="elevated"
          @click="updateAccessCatagory"
          :disabled="!hasChanges"
          class="save-btn"
        >
          SAVE CHANGES
        </v-btn>
      </div>

      <!-- Warning Message -->
      <div v-if="!accessOn" class="warning-message">
        <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
        <span
          >To assign cards, please enable access or check the Access Level's
          access type.</span
        >
      </div>

      <!-- Main Content Columns -->
      <div class="main-content">
        <!-- Access Level Details -->
        <div class="left-column">
          <div class="access-details">
            <!-- Access Level Selection - Moved here -->
            <div class="access-controls">
              <div class="access-level-container">
                <div class="access-level-label">Access Level Category</div>
                <v-select
                  v-model="selectedAccessLevel"
                  :items="accessLevelOptions"
                  item-title="accessLevelName"
                  item-value="id"
                  return-object
                  @update:model-value="handleAccessLevelChange"
                  variant="outlined"
                  hide-details
                  class="access-level-select"
                >
                  <template v-slot:item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      :disabled="!item.raw.accessType"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          :color="item.raw.accessType ? 'success' : 'error'"
                        >
                          {{
                            item.raw.accessType
                              ? "mdi-shield-check"
                              : "mdi-shield-off"
                          }}
                        </v-icon>
                      </template>
                      <template v-slot:append>
                        <span
                          :class="
                            item.raw.accessType ? 'text-success' : 'text-error'
                          "
                        >
                          ({{ item.raw.accessType ? "Enabled" : "Disabled" }})
                        </span>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <div class="access-toggle">
                <v-switch
                  v-model="accessOn"
                  color="success"
                  hide-details
                  @change="handleAccessToggle"
                >
                  <template v-slot:label>
                    <span class="access-label"
                      >Access: {{ accessOn ? "Enabled" : "Disabled" }}</span
                    >
                  </template>
                </v-switch>
              </div>
            </div>

            <div v-if="accessLevelDetails" class="details-content">
              <div class="tabs">
                <div
                  class="tab"
                  :class="{ active: activeTab === 'general' }"
                  @click="activeTab = 'general'"
                >
                  <v-icon size="18" class="mr-1">mdi-information</v-icon>
                  GENERAL
                </div>
                <div
                  class="tab"
                  :class="{ active: activeTab === 'doors' }"
                  @click="activeTab = 'doors'"
                >
                  <v-icon size="18" class="mr-1">mdi-door</v-icon>
                  ASSIGNED DOORS
                </div>
              </div>

              <div v-if="activeTab === 'general'" class="general-info">
                <div
                  class="info-card"
                  :class="{ 'disabled-card': !accessLevelDetails._24hrs }"
                >
                  <div class="info-header">
                    <v-icon
                      :color="accessLevelDetails._24hrs ? 'success' : 'error'"
                      size="24"
                      class="mr-2"
                    >
                      mdi-clock-time-four
                    </v-icon>
                    <span class="info-title">24 Hours Access</span>
                  </div>
                  <div class="info-value">
                    {{ accessLevelDetails._24hrs ? "Enabled" : "Disabled" }}
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-header">
                    <v-icon color="primary" size="24" class="mr-2"
                      >mdi-timer-outline</v-icon
                    >
                    <span class="info-title">Max Hours</span>
                  </div>
                  <div class="info-value">
                    {{ accessLevelDetails.maxWorkHours }} hours
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-header">
                    <v-icon color="primary" size="24" class="mr-2"
                      >mdi-calendar-clock</v-icon
                    >
                    <span class="info-title">Working Hours</span>
                  </div>
                  <div class="info-value">
                    {{ accessLevelDetails.workingHours || "Not set" }}
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-header">
                    <v-icon color="primary" size="24" class="mr-2"
                      >mdi-calendar-star</v-icon
                    >
                    <span class="info-title">Holidays</span>
                  </div>
                  <div class="info-value">
                    {{
                      accessLevelDetails.holidays ? "Allowed" : "Not Allowed"
                    }}
                  </div>
                </div>
              </div>

              <!-- In the doors-info section -->
              <div v-if="activeTab === 'doors'" class="doors-info">
                <EmptyState
                  v-if="
                    !accessLevelDetails.assignedDoors ||
                    accessLevelDetails.assignedDoors.length === 0
                  "
                  title="No doors assigned"
                  message="No doors assigned to this access level"
                  :show-default-actions="false"
                  :icon-size="40"
                >
                  <template #icon>
                    <v-icon size="40" color="grey" class="mb-2">mdi-door</v-icon>
                  </template>
                </EmptyState>

                <div v-else class="doors-grid">
                  <div
                    v-for="door in accessLevelDetails.assignedDoors"
                    :key="door.doors_id.id"
                    class="door-item"
                  >
                    <v-icon color="primary" size="20" class="mr-2"
                      >mdi-door</v-icon
                    >
                    <div>
                      <div class="door-number">
                        {{ door.doors_id.doorNumber }}
                      </div>
                      <div class="door-name">{{ door.doors_id.doorName }}</div>
                      <div class="door-type">{{ door.doors_id.doorType }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <EmptyState
              v-else
              title="No access level selected"
              :show-default-actions="false"
              class="no-access-level"
            >
              <template #icon>
                <v-icon size="40" color="grey" class="mb-2">mdi-shield-off</v-icon>
              </template>
            </EmptyState>
          </div>

          <!-- Configure Access Levels Link -->
          <div
            class="configure-access-card"
            @click="redirectToAccessLevelCategory"
          >
            <span class="configure-text">Configure Access Levels</span>
            <v-icon color="#D32F2F">mdi-arrow-right</v-icon>
          </div>
        </div>

        <!-- Credentials & Biometrics Section -->
        <div class="credentials-biometrics-section">
          <div class="credentials-grid">
            <!-- RFID Card Card -->
            <div class="credential-card">
              <div class="card-header">
                <div class="header-left">
                  <div class="icon-box blue-bg">
                    <v-icon color="#1976D2">mdi-credit-card</v-icon>
                  </div>
                  <div class="header-text">
                    <h3>RFID Card</h3>
                    <p>Physical access card management</p>
                  </div>
                </div>
                <div
                  class="status-dot"
                  :class="{ active: assignedCards.length > 0 }"
                ></div>
              </div>

              <div class="card-content">
                <EmptyState
                  v-if="assignedCards.length === 0"
                  title="No active cards assigned"
                  :show-default-actions="false"
                  class="empty-state-small"
                />
                <div v-else class="assigned-list">
                  <div
                    v-for="card in assignedCards"
                    :key="card.id"
                    class="list-item"
                  >
                    <span class="card-number">{{ card.rfidCard }}</span>
                    <v-btn
                      icon="mdi-close"
                      variant="text"
                      size="x-small"
                      color="grey"
                      @click="removeCard(card.id)"
                      :disabled="!accessOn"
                    ></v-btn>
                  </div>
                </div>

                <div class="action-row">
                  <v-text-field
                    v-model="cardInput"
                    placeholder="Card Number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="card-input"
                    append-inner-icon="mdi-credit-card-scan"
                    @focus="handleCardFocus"
                    :disabled="!accessOn"
                  ></v-text-field>
                  <v-btn
                    color="#2563EB"
                    class="add-btn"
                    @click="addNewCard"
                    :disabled="!cardInput || !accessOn"
                  >
                    + Add
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- Fingerprint Card -->
            <div class="credential-card">
              <div class="card-header">
                <div class="header-left">
                  <div class="icon-box purple-bg">
                    <v-icon color="#9333EA">mdi-fingerprint</v-icon>
                  </div>
                  <div class="header-text">
                    <h3>Fingerprint</h3>
                    <p>Biometric security data</p>
                  </div>
                </div>
                <div
                  class="status-dot"
                  :class="{ active: hasFingerData }"
                ></div>
              </div>

              <div class="card-content centered">
                <div class="status-display">
                  <v-icon
                    size="48"
                    :color="hasFingerData ? '#9333EA' : '#E5E7EB'"
                  >
                    {{
                      hasFingerData ? "mdi-fingerprint" : "mdi-fingerprint-off"
                    }}
                  </v-icon>
                  <span class="status-text">{{
                    hasFingerData ? "Enrolled" : "Not enrolled"
                  }}</span>
                </div>

                <v-btn
                  variant="outlined"
                  block
                  class="action-btn"
                  prepend-icon="mdi-plus-circle"
                  :disabled="true"
                >
                  Enroll Fingerprint
                </v-btn>
              </div>
            </div>

            <!-- Face ID Card -->
            <div class="credential-card">
              <div class="card-header">
                <div class="header-left">
                  <div class="icon-box orange-bg">
                    <v-icon color="#F59E0B">mdi-face-recognition</v-icon>
                  </div>
                  <div class="header-text">
                    <h3>Face ID</h3>
                    <p>Facial recognition profile</p>
                  </div>
                </div>
                <div class="status-dot" :class="{ active: hasFaceData }"></div>
              </div>

              <div class="card-content centered">
                <div class="status-display">
                  <v-icon
                    size="48"
                    :color="hasFaceData ? '#F59E0B' : '#E5E7EB'"
                  >
                    {{ hasFaceData ? "mdi-face-man" : "mdi-face-man-shimmer" }}
                  </v-icon>
                  <span class="status-text">{{
                    hasFaceData ? "Face Data Active" : "No face data"
                  }}</span>
                </div>

                <v-btn
                  variant="outlined"
                  block
                  class="action-btn"
                  prepend-icon="mdi-camera"
                  :disabled="true"
                >
                  Capture Face
                </v-btn>
              </div>
            </div>

            <!-- Mobile QR Card -->
            <div class="credential-card">
              <div class="card-header">
                <div class="header-left">
                  <div class="icon-box green-bg">
                    <v-icon color="#10B981">mdi-qrcode</v-icon>
                  </div>
                  <div class="header-text">
                    <h3>Mobile QR</h3>
                    <p>Temporary visitor access</p>
                  </div>
                </div>
                <v-switch
                  v-model="qrAccessEnabled"
                  color="success"
                  hide-details
                  density="compact"
                  inset
                  :disabled="!accessOn || !hasQRCode"
                  @change="handleQRAccessToggle"
                ></v-switch>
              </div>

              <div class="card-content centered">
                <div class="status-display">
                  <v-icon size="48" :color="hasQRCode ? '#10B981' : '#E5E7EB'">
                    {{ hasQRCode ? "mdi-qrcode" : "mdi-qrcode-scan" }}
                  </v-icon>
                  <span class="status-text">{{
                    hasQRCode ? "Active" : "Generate to activate"
                  }}</span>
                </div>

                <v-btn
                  color="#ECFDF5"
                  variant="flat"
                  block
                  class="action-btn green-text"
                  prepend-icon="mdi-refresh"
                  @click="generateQRCode"
                  :loading="generatingQR"
                  :disabled="!accessOn"
                >
                  {{ hasQRCode ? "Regenerate QR" : "Generate New QR" }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <EmptyState
      v-else
      title="No Employee Data Found"
      message="The requested employee information could not be found"
      :show-default-actions="false"
      class="no-data"
    >
      <template #icon>
        <v-icon size="64" color="grey" class="mb-4">mdi-account-question</v-icon>
      </template>
    </EmptyState>

    <!-- Notifications -->
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
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  defineProps,
  defineEmits,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex";
import QRCode from "qrcode";
import EmptyState from "@/components/common/states/EmptyState.vue";

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

const emit = defineEmits(["update:employeeData"]);
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const accessLevelOptions = ref([]);
const accessLevelDetails = ref(null);
const activeTab = ref("general");
const cardInput = ref("");
const selectedCardType = ref("rfid");
const assignedCards = ref([]);
const selectedAccessLevel = ref(null);
const accessOn = ref(true);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Track original state for change detection
const originalAccessLevel = ref(null);
const originalAccessOn = ref(true);
const originalCards = ref([]);
const removedCardIds = ref([]);
const faceEmbedData = ref(null);
const fingerData = ref(null);
const qrCodeData = ref(null);
const qrCodeImage = ref(null);
const generatingQR = ref(false);
const qrAccessEnabled = ref(true);

// Computed properties
const hasFaceData = computed(() => {
  if (!faceEmbedData.value) return false;

  const data = faceEmbedData.value.base64Data;
  if (!data || typeof data !== "string") return false;

  const trimmed = data.trim();
  return trimmed !== "" && trimmed !== "<base64_string_here>";
});

const hasFingerData = computed(() => {
  if (!fingerData.value) return false;
  const base64 = fingerData.value.base64_UserFingers;
  return base64 && typeof base64 === "string" && base64.trim() !== "";
});
const hasQRCode = computed(() => {
  return qrCodeData.value && qrCodeData.value.qrcode;
});
let cardListener = null;

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const hasChanges = computed(() => {
  // Check if access level changed
  const accessLevelChanged =
    selectedAccessLevel.value?.id !== originalAccessLevel.value?.id;

  const accessToggleChanged = accessOn.value !== originalAccessOn.value;
  const cardsChanged = assignedCards.value.some(
    (card) => card.isNew || card.isChanged
  );
  const cardsRemoved = removedCardIds.value.length > 0;

  return (
    accessLevelChanged || accessToggleChanged || cardsChanged || cardsRemoved
  );
});
const generateUniqueQRCode = () => {
  // Define allowed characters: numbers 0-9 and uppercase letters A-Z
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < 8; i++) {
    // Get random index from 0 to chars.length - 1
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};

// Add truncate helper for display
const truncateQRCode = (code) => {
  if (!code) return "N/A";
  return code.length > 20 ? `${code.substring(0, 20)}...` : code;
};
const updateFaceAccessInAccessLevel = async () => {
  if (!selectedAccessLevel.value || !accessLevelDetails.value) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${selectedAccessLevel.value.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceData: accessLevelDetails.value.faceData,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        err.errors?.[0]?.message || "Failed to update face access"
      );
    }

    showSuccessMessage(
      `Face recognition ${accessLevelDetails.value.faceData ? "enabled" : "disabled"} for this access level`
    );

    await fetchAccessLevels();
  } catch (error) {
    console.error("Error updating faceData in access level:", error);
    showErrorMessage("Failed to update face recognition setting");
    accessLevelDetails.value.faceData = !accessLevelDetails.value.faceData;
  }
};
const updateFingerAccessInAccessLevel = async () => {
  if (!selectedAccessLevel.value || !accessLevelDetails.value) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${selectedAccessLevel.value.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fingerData: accessLevelDetails.value.fingerData,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        err.errors?.[0]?.message || "Failed to update fingerprint access"
      );
    }

    showSuccessMessage(
      `Fingerprint access ${accessLevelDetails.value.fingerData ? "enabled" : "disabled"} for this access level`
    );

    await fetchAccessLevels(); // refresh the list to get updated fingerData flag
  } catch (error) {
    console.error("Error updating fingerData in access level:", error);
    showErrorMessage("Failed to update fingerprint access setting");
    accessLevelDetails.value.fingerData = !accessLevelDetails.value.fingerData;
  }
};
const generateQRCode = async () => {
  if (!selectedAccessLevel.value) {
    showErrorMessage("Please select an access level first");
    return;
  }

  generatingQR.value = true;

  try {
    const tenantId = currentUserTenant.getTenantId();
    const accessLevelsId = selectedAccessLevel.value.id;

    // Check if QR code already exists for this employee and access level
    const checkResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate?filter[_and][0][_and][0][tenant][_eq]=${tenantId}&filter[_and][0][_and][1][employeeId][id][_eq]=${props.id}&filter[_and][0][_and][2][accessLevelsId][_eq]=${accessLevelsId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    let existingQRCode = null;
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      existingQRCode = checkData.data?.[0];
    }

    // Generate unique QR code value
    const qrCodeValue = generateUniqueQRCode();

    // Get the employeeId field value - FIXED LOGIC
    let employeeIdFieldValue = null;
    
    // Try different possible locations for the employee ID field
    if (props.employeeData?.employeeId) {
      // Case 1: employeeId is a direct string (like "67091")
      if (typeof props.employeeData.employeeId === 'string') {
        employeeIdFieldValue = props.employeeData.employeeId;
      }
      // Case 2: employeeId is an object with employeeId property
      else if (typeof props.employeeData.employeeId === 'object' && props.employeeData.employeeId.employeeId) {
        employeeIdFieldValue = props.employeeData.employeeId.employeeId;
      }
      // Case 3: employeeId is an object with direct id property
      else if (typeof props.employeeData.employeeId === 'object' && props.employeeData.employeeId.id) {
        employeeIdFieldValue = props.employeeData.employeeId.id;
      }
    }
    
    // If we still don't have the value, check the employeeId field directly on employeeData
    if (!employeeIdFieldValue && props.employeeData?.employeeIdField) {
      employeeIdFieldValue = props.employeeData.employeeIdField;
    }

    const payload = {
      employeeId: props.id, // This is the personalModule ID (12412)
      accessLevelsId: accessLevelsId,
      qraccess: qrAccessEnabled.value,
      tenant: tenantId,
      qrcode: qrCodeValue,
    };

    // Only add employeeIdField to payload if it's a field in your API
    // Check if your Directus collection has this field
    if (employeeIdFieldValue) {
      // If your API expects "employeeIdField", use this:
      // payload.employeeIdField = employeeIdFieldValue;
      
      // But based on your response, it seems like the API doesn't have this field
      // The response shows employeeId: 12412, which is the personalModule ID
      // If you need to store the employee ID (67091), you might need:
      payload.employeeIdField = employeeIdFieldValue;
    }

    let response;
    if (existingQRCode) {
      // Update existing QR code
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/qrgenerate/${existingQRCode.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    } else {
      // Create new QR code
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/qrgenerate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to generate QR code"
      );
    }

    const result = await response.json();
    qrCodeData.value = result.data;

    // Generate QR code image for preview/download
    await generateQRCodeImage();

    showSuccessMessage(
      existingQRCode
        ? "QR code updated successfully!"
        : "QR code generated successfully!"
    );

    // Fetch the updated QR code data
    await fetchQRCodeData();
  } catch (error) {
    console.error("Error generating QR code:", error);
    showErrorMessage(`Failed to generate QR code: ${error.message}`);
  } finally {
    generatingQR.value = false;
  }
};
const fetchQRCodeData = async () => {
  if (!selectedAccessLevel.value) return;

  try {
    const tenantId = currentUserTenant.getTenantId();
    // Include employeeId.employeeId in the fields
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate?fields=*,employeeId.employeeId&filter[_and][0][_and][0][tenant][_eq]=${tenantId}&filter[_and][0][_and][1][employeeId][id][_eq]=${props.id}&filter[_and][0][_and][2][accessLevelsId][_eq]=${selectedAccessLevel.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        qrCodeData.value = data.data[0];
        qrAccessEnabled.value = qrCodeData.value.qraccess || true;

        // Now qrCodeData.value should have employeeId.employeeId
        console.log('QR Data with employeeId:', qrCodeData.value);
        
        // Generate QR code image when data is loaded
        if (qrCodeData.value.qrcode) {
          await generateQRCodeImage();
        }
      } else {
        qrCodeData.value = null;
        qrAccessEnabled.value = true;
        qrCodeImage.value = null;
      }
    }
  } catch (error) {
    console.error("Error fetching QR code data:", error);
    qrCodeData.value = null;
    qrAccessEnabled.value = true;
    qrCodeImage.value = null;
  }
};
// Add method to handle QR access toggle
const handleQRAccessToggle = async () => {
  if (!qrCodeData.value) {
    showErrorMessage("Please generate a QR code first");
    qrAccessEnabled.value = true;
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate/${qrCodeData.value.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qraccess: qrAccessEnabled.value,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update QR code access");
    }

    showSuccessMessage(
      `QR code access ${qrAccessEnabled.value ? "enabled" : "disabled"} successfully!`
    );
  } catch (error) {
    console.error("Error updating QR code access:", error);
    showErrorMessage("Failed to update QR code access");
    qrAccessEnabled.value = !qrAccessEnabled.value;
  }
};
const generateQRCodeImage = async (size = 200) => {
  if (!qrCodeData.value?.qrcode) return;

  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrCodeData.value.qrcode, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    qrCodeImage.value = canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Failed to generate QR image:", err);
    showErrorMessage("Failed to generate QR code image");
  }
};
// Add method to download QR code
const downloadQRCode = async () => {
  if (!qrCodeImage.value) {
    // Generate image if not already generated
    await generateQRCodeImage();
  }

  if (!qrCodeImage.value) {
    showErrorMessage("No QR code available to download");
    return;
  }

  const link = document.createElement("a");
  link.href = qrCodeImage.value;
  link.download = `qr-code-${props.employeeData?.first_name || "employee"}-${qrCodeData.value.qrcode}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showSuccessMessage("QR code downloaded successfully!");
};
const fetchEmployeeData = async () => {
  console.log("[fetchEmployeeData] started");
  const token = authService.getToken();

  try {
    const tenantId = currentUserTenant.getTenantId();

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "assignedAccessLevel.id",
      "assignedAccessLevel.accessLevelName",
      "assignedAccessLevel.accessLevelNumber",
      "assignedAccessLevel._24hrs",
      "assignedAccessLevel.holidays",
      "assignedAccessLevel.maxWorkHours",
      "assignedAccessLevel.workingHours",
      "assignedAccessLevel.assignDoorsGroup",
      "assignedFaceEmbed.id",
      "assignedFaceEmbed.base64Data",
      "assignedFaceEmbed.assignedTo.id",
      "id",
      "accessOn",
      "employeeId",
      "employeeId.employeeId"
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

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      emit("update:employeeData", employee);

      // === FACE DATA (already working) ===
      if (employee.assignedFaceEmbed) {
        faceEmbedData.value = employee.assignedFaceEmbed;
      } else {
        faceEmbedData.value = null;
      }

      try {
        const fingerFields = [
          "tenant",
          "assignedTo.employeeId",
          "id",
          "assignedTo.assignedUser.first_name",
          "base64_UserFingers",
        ];

        const fingerQueryParams = new URLSearchParams();
        fingerFields.forEach((field) => {
          fingerQueryParams.append("fields[]", field);
        });
        fingerQueryParams.append(
          "filter[_and][0][_and][0][tenant][tenantId][_eq]",
          tenantId
        );
        fingerQueryParams.append(
          "filter[_and][0][_and][1][assignedTo][id][_eq]",
          props.id
        );

        const fingerResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/userFingers?${fingerQueryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (fingerResponse.ok) {
          const fingerJson = await fingerResponse.json();
          if (fingerJson.data && fingerJson.data.length > 0) {
            fingerData.value = fingerJson.data[0];
            console.log(
              "Fingerprint data loaded:",
              fingerData.value.base64_UserFingers ? "Present" : "Empty"
            );
          } else {
            fingerData.value = null;
            console.log("No fingerprint record found");
          }
        } else {
          console.error("Failed to fetch usersFingers:", fingerResponse.status);
          fingerData.value = null;
        }
      } catch (err) {
        console.error("Error fetching fingerprint data:", err);
        fingerData.value = null;
      }
      // === END FINGERPRINT FETCH ===

      // === REST OF YOUR EXISTING CODE (cards, access level, etc.) ===
      const cardsUrl = `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${props.id}`;
      const cardsResponse = await fetch(cardsUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        const cards = (cardsData.data || []).map((card) => ({
          id: card.id,
          rfidCard: card.rfidCard,
          type: card.type,
          enabled: card.cardAccess,
          isNew: false,
          isChanged: false,
          originalId: card.id,
        }));

        assignedCards.value = cards;
        originalCards.value = JSON.parse(JSON.stringify(cards));
      }

      if (employee.assignedAccessLevel) {
        selectedAccessLevel.value = employee.assignedAccessLevel;
        originalAccessLevel.value = employee.assignedAccessLevel;
        await handleAccessLevelChange(selectedAccessLevel.value);
      }

      accessOn.value = employee.accessOn;
      originalAccessOn.value = employee.accessOn;
      removedCardIds.value = [];
    } else {
      throw new Error("No employee data found");
    }
    await fetchQRCodeData();
  } catch (err) {
    console.error("[fetchEmployeeData] Error:", err);
    error.value = err.message || String(err);
  } finally {
    loading.value = false;
  }
};

const fetchAccessLevels = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&fields=*,assignDoorsGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );
    const data = await response.json();
    accessLevelOptions.value = data.data.map((level) => ({
      id: level.id,
      accessLevelName: level.accessLevelName,
      accessLevelNumber: level.accessLevelNumber,
      accessType: level.accessType,
      _24hrs: level._24hrs,
      holidays: level.holidays,
      maxWorkHours: level.maxWorkHours,
      workingHours: level.workingHours,
      assignDoorsGroup: level.assignDoorsGroup,
      faceData: level.faceData || false,
    }));
  } catch (error) {
    console.error("Error fetching access levels:", error);
  }
};

const handleAccessLevelChange = async (value) => {
  if (!value) {
    accessLevelDetails.value = null;
    qrCodeData.value = null;
    qrAccessEnabled.value = true;
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${value.id}?fields=*,assignDoorsGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch access level details");
    }

    const data = await response.json();

    // Fetch door details for the assigned door IDs
    let assignedDoors = [];
    if (data.data.assignDoorsGroup && data.data.assignDoorsGroup.length > 0) {
      const doorIds = data.data.assignDoorsGroup.join(",");
      const doorsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/doors?filter[id][_in]=${doorIds}&fields=id,doorNumber,doorName,doorType,doorsConfigure,tenant.tenantName`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      if (doorsResponse.ok) {
        const doorsData = await doorsResponse.json();
        assignedDoors = doorsData.data || [];
      }
    }

    accessLevelDetails.value = {
      ...data.data,
      faceData: data.data.faceData || false,
      _24hrs: data.data._24hrs,
      holidays: data.data.holidays,
      maxWorkHours: data.data.maxWorkHours,
      workingHours: data.data.workingHours,
      assignedDoors: assignedDoors.map((door) => ({
        doors_id: {
          id: door.id,
          doorNumber: door.doorNumber,
          doorName: door.doorName,
          doorType: door.doorType,
          doorsConfigure: door.doorsConfigure,
          tenant: door.tenant,
        },
      })),
    };
    await fetchQRCodeData();
  } catch (error) {
    console.error("Error fetching access level details:", error);
    showErrorMessage("Failed to load access level details");
  }
};

const updateAccessCatagory = async () => {
  if (!hasChanges.value) return;

  try {
    const payload = {
      accessOn: accessOn.value,
      status: accessOn.value ? "active" : "inactive",
    };

    const accessLevelNumber = selectedAccessLevel.value?.accessLevelNumber || 0;

    if (selectedAccessLevel.value) {
      payload.assignedAccessLevel = selectedAccessLevel.value.id;
    }
    for (const card of assignedCards.value) {
      const cardAccess = accessOn.value ? card.enabled : false;

      const cardPayload = {
        rfidCard: card.rfidCard,
        type: card.type.toLowerCase(),
        enabled: cardAccess,
        cardAccess: cardAccess,
        accessLevelsId: accessLevelNumber,
        cardAccessLevelArray: `${card.rfidCard}:${cardAccess ? 1 : 0}:${accessLevelNumber}`,
        cardAccessLevelHex: convertToCardAccessHex(
          card.rfidCard,
          cardAccess,
          accessLevelNumber
        ),
        employeeId: props.id,
      };

      if (card.isNew) {
        cardPayload.tenant = currentUserTenant.getTenantId();

        await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cardPayload),
        });
      } else {
        await fetch(
          `${import.meta.env.VITE_API_URL}/items/cardManagement/${card.originalId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cardPayload),
          }
        );
      }
    }

    // Delete removed cards
    for (const removedCardId of removedCardIds.value) {
      await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement/${removedCardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update access category"
      );
    }

    assignedCards.value = assignedCards.value.map((card) => ({
      ...card,
      isNew: false,
      isChanged: false,
      enabled: accessOn.value ? card.enabled : false,
    }));

    removedCardIds.value = [];
    originalAccessLevel.value = selectedAccessLevel.value;
    originalAccessOn.value = accessOn.value;

    showSuccessMessage("Access level has been updated successfully!");
    await fetchEmployeeData();
  } catch (error) {
    console.error("Error updating access category:", error);
    showErrorMessage(`Error updating access level: ${error.message}`);
  }
};

const addNewCard = async () => {
  if (!cardInput.value) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${cardInput.value}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check card existence");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      showErrorMessage("This card already exists in the system.");
      return;
    }

    const newCard = {
      id: `new_${Date.now()}_${Math.random()}`,
      rfidCard: cardInput.value,
      type: selectedCardType.value,
      enabled: accessOn.value,
      isNew: true,
      isChanged: false,
      originalId: null,
    };

    assignedCards.value.push(newCard);
    cardInput.value = "";
    showSuccessMessage(`Card ${newCard.rfidCard} added successfully!`);
  } catch (error) {
    console.error("Error adding new card:", error);
    showErrorMessage(`Failed to add new card: ${error.message}`);
  }
};

const updateCardAccess = async (card) => {
  if (!card.isNew) {
    card.isChanged = true;
  }
  showSuccessMessage(
    `Card ${card.rfidCard} ${card.enabled ? "enabled" : "disabled"} successfully!`
  );
};

const handleCardFocus = () => {
  cardListener = window.addEventListener("keypress", handleCardSwipe);
};

const handleCardInput = (event) => {
  if (cardInput.value.length > 10) {
    cardInput.value = cardInput.value.slice(0, 10);
  }
};

const handleCardSwipe = (event) => {
  if (event.keyCode === 13) {
    window.removeEventListener("keypress", handleCardSwipe);
    processCardData(cardInput.value);
  }
};

const processCardData = (cardData) => {
  const existingCard = assignedCards.value.find(
    (card) => card.rfidCard === cardData
  );
  if (existingCard) {
    showErrorMessage("This card is already assigned");
    cardInput.value = "";
    return;
  }
  addNewCard();
};

const removeCard = async (cardId) => {
  const cardToRemove = assignedCards.value.find((card) => card.id === cardId);

  if (cardToRemove) {
    if (!cardToRemove.isNew && cardToRemove.originalId) {
      removedCardIds.value.push(cardToRemove.originalId);
    }

    assignedCards.value = assignedCards.value.filter(
      (card) => card.id !== cardId
    );

    showSuccessMessage(`Card ${cardToRemove.rfidCard} removed successfully!`);
  }
};

const handleAccessToggle = async () => {
  assignedCards.value = assignedCards.value.map((card) => ({
    ...card,
    enabled: accessOn.value,
    isChanged: !card.isNew,
  }));

  showSuccessMessage(
    `Access ${accessOn.value ? "enabled" : "disabled"} successfully! All cards have been ${accessOn.value ? "enabled" : "disabled"}.`
  );
};

const redirectToAccessLevelCategory = () => {
  router.push("/configuration/accesslevel-configurator");
};

onMounted(() => {
  fetchEmployeeData();
  fetchAccessLevels();
});

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  }
);

onUnmounted(() => {
  if (cardListener) {
    window.removeEventListener("keypress", handleCardSwipe);
  }
});
</script>

<style scoped>
.face-assignment-section {
  margin-top: 24px;
}

.face-status-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.face-status-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.face-status-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.face-status-text {
  margin-left: 8px;
}

.face-status-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.face-status-description {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.face-toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.face-assignment-hint {
  display: flex;
  align-items: center;
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #1565c0;
}

.face-toggle-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
.access-management {
  margin: 0 auto;
  padding: 0;
  color: #333;
  overflow-y: auto;
  height: calc(80vh - 64px);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  display: flex;
  align-items: center;
}

.title h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.save-btn {
  font-weight: 500;
}

/* Warning Message */
.warning-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff3e0;
  border-radius: 8px;
  color: #e65100;
  font-size: 14px;
  margin-bottom: 16px;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 24px;
  min-height: 0vh !important;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

/* Card Management */
.card-management {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.card-input {
  flex: 3;
}

.card-type {
  flex: 1;
}

.add-card-btn {
  width: 100%;
  margin-bottom: 20px;
}

.assigned-cards {
  margin-top: 20px;
}

.assigned-cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-count {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.cards-list {
  max-height: 170px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 4px;
}



.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.card-item:last-child {
  border-bottom: none;
}

.card-info {
  display: flex;
  align-items: center;
}

.card-number {
  font-weight: 500;
  font-size: 16px;
}

.card-type-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Access Details */
.access-details {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Access Controls - New section for the moved elements */
.access-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.access-level-container {
  flex: 1;
  max-width: 300px;
}

.access-level-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.access-toggle {
  display: flex;
  align-items: center;
}

.access-label {
  font-weight: 500;
  margin-left: 8px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: #666;
}

.tab.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}

.general-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.2s;
  background-color: #eeee;
}

.disabled-card {
  border-left: 3px solid #f44336;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-title {
  font-weight: 500;
  font-size: 16px;
}

.info-value {
  font-size: 14px;
  color: #666;
}

.doors-info {
  max-height: 300px;
  overflow-y: auto;
}



.doors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.door-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  background-color: #eeee;
  border-radius: 6px;
}

.door-number {
  font-weight: 500;
  font-size: 14px;
}

.door-name {
  font-size: 12px;
  color: #666;
}



/* No Data */


/* Responsive */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .access-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .access-level-container {
    width: 100%;
    max-width: none;
  }

  .general-info {
    grid-template-columns: 1fr;
  }

  .footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .settings-btn {
    width: 100%;
  }
}
/* Credentials & Biometrics Section */
.credentials-biometrics-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.user-id-badge {
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.credentials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.credential-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 280px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  gap: 16px;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blue-bg {
  background: #eff6ff;
}
.purple-bg {
  background: #f3e8ff;
}
.orange-bg {
  background: #fff7ed;
}
.green-bg {
  background: #ecfdf5;
}

.header-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.header-text p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
}

.status-dot.active {
  background: #ef4444; /* Red for active/alert, or green depending on design */
}

/* For fingerprint/face/QR active states, maybe green or specific color */
.credential-card:nth-child(2) .status-dot.active,
.credential-card:nth-child(3) .status-dot.active,
.credential-card:nth-child(4) .status-dot.active {
  background: #10b981; /* Green */
}
/* Override for RFID to match design image (red dot) */
.credential-card:nth-child(1) .status-dot.active {
  background: #ef4444;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content.centered {
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* RFID Specific */
.empty-state-small {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  margin-bottom: auto;
  min-height: auto !important;
}

.empty-state-small :deep(.empty-title) {
  font-size: 14px;
  font-weight: normal;
  font-style: italic;
  color: #9ca3af;
}

.empty-state-small :deep(.empty-content) {
  gap: 0;
  min-height: 0;
}

.assigned-list {
  margin-bottom: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.card-number {
  font-family: monospace;
  font-weight: 500;
  color: #374151;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.card-input {
  flex: 1;
}

.add-btn {
  height: 40px;
  text-transform: none;
  font-weight: 600;
}

/* Biometrics Specific */
.status-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.status-text {
  font-size: 14px;
  color: #6b7280;
}

.action-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  border-radius: 8px;
  height: 44px;
}

.green-text {
  color: #059669 !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .credentials-grid {
    grid-template-columns: 1fr;
  }
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.configure-access-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border: 1px solid transparent;
}

.configure-access-card:hover {
  background-color: #f8f9fa;
  border-color: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.configure-text {
  color: #d32f2f;
  font-weight: 500;
  font-size: 14px;
}
</style>

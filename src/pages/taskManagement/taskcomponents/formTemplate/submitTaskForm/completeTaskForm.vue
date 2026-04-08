<template>
  <v-container fluid class="pa-6 bg-grey-lighten-4 min-h-screen">
    <!-- Toast Notification -->
    <div v-if="showToast" :class="['toast-notification', toastType]">
      <v-icon v-if="toastType === 'success'" class="toast-icon" color="success"
        >mdi-check-circle</v-icon
      >
      <v-icon v-if="toastType === 'error'" class="toast-icon" color="error"
        >mdi-alert-circle</v-icon
      >
      <span class="toast-message">{{ toastMessage }}</span>
    </div>

    <v-row class="align-center">
      <v-col cols="" class="d-flex align-center">
        <v-btn icon variant="flat" color="primary" @click="goBack" class="mr-4">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4 font-weight-bold text-grey-darken-4">
          Complete Work Order: {{ formDetails?.formName || "Form Details" }}
        </h1>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          width="6"
        ></v-progress-circular>
        <p class="mt-4 text-h6 text-grey-darken-2">Loading task details...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12" class="text-center py-12">
        <v-alert
          type="error"
          prominent
          border="start"
          variant="tonal"
          class="rounded-lg"
        >
          <v-alert-title class="font-weight-bold"
            >Error Loading Task</v-alert-title
          >
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="formDetails && taskData">
      <v-col cols="12">
        <v-card class="design">
          <v-card-title
            class="text-h5 font-weight-bold text-grey-darken-3 mb-2"
          >
            <v-icon left color="teal-darken-1"
              >mdi-file-document-edit-outline</v-icon
            >
            Task Information - Step {{ currentFormStep }} of
            {{ totalFormSteps }}
          </v-card-title>
          <v-card-subtitle class="text-body-2 text-red mb-4">
            Current Status: {{ formatStatus(taskData.status) }}
            <v-chip
              v-if="isOverdue"
              color="error"
              variant="elevated"
              size="small"
              class="ml-2"
            >
              <v-icon start size="small">mdi-clock-alert</v-icon>
              OVERDUE
            </v-chip>
          </v-card-subtitle>
          <v-card-text class="form-scroll-area">
            <!-- Display "creation" fields as details -->
            <v-card
              class="mb-6 rounded-lg elevation-1"
              v-if="creationFields.length > 0"
            >
              <v-card-title class="text-h6 font-weight-bold text-grey-darken-3">
                <v-icon left>mdi-information-outline</v-icon>
                Task Creation Details
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="field in creationFields"
                    :key="field.key"
                    cols="12"
                    md="6"
                  >
                    <p class="text-subtitle-1 text-grey-darken-3">
                      <strong class="text-grey-darken-2 mr-2"
                        >{{ field.label }}:</strong
                      >
                      <span class="font-weight-medium">{{
                        getCreationFieldValue(field)
                      }}</span>
                    </p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-form
              ref="formRef"
              v-model="formValid"
              @submit.prevent="nextFormStep"
            >
              <v-row>
                <v-col
                  v-for="field in currentStepFields"
                  :key="field.key"
                  cols="12"
                  :md="getFieldColSize(field.type)"
                >
                  <v-label
                    class="mb-2 d-block text-body-1 font-weight-medium text-grey-darken-2"
                  >
                    {{ field.label }}
                    <span v-if="isFieldMandatory(field)" class="text-error ml-1"
                      >*</span
                    >
                  </v-label>

                  <!-- Dynamic Field Rendering -->
                  <component
                    :is="getFieldComponent(field)"
                    v-bind="getFieldProps(field)"
                    :model-value="formData[field.key]"
                    @update:model-value="
                      (value) => updateFieldValue(field.key, value)
                    "
                    :rules="getValidationRules(field)"
                    @click:append-inner="handleFieldAction(field, $event)"
                    @change="handleFieldChange(field, $event)"
                    :error-messages="getFieldErrorMessages(field)"
                  />

                  <!-- Field-specific additional content -->
                  <template
                    v-if="field.type === 'otp' || field.type === 'happy-code'"
                  >
                    <v-btn
                      class="mt-2"
                      color="orange-darken-1"
                      block
                      variant="tonal"
                      @click="generateCode(field)"
                    >
                      <v-icon start>mdi-key-variant</v-icon>
                      Generate/Resend Code
                    </v-btn>
                  </template>

                  <!-- Unsupported field type warning -->
                  <template v-if="!isFieldTypeSupported(field.type)">
                    <v-chip
                      color="warning"
                      variant="tonal"
                      size="small"
                      class="mt-2"
                    >
                      <v-icon start size="small"
                        >mdi-alert-circle-outline</v-icon
                      >
                      Unsupported field type:
                      {{ getFieldTypeDisplay(field.type) }}
                    </v-chip>
                  </template>

                  <template
                    v-if="
                      getFieldTypeString(field.type) === 'gps-currentLocation'
                    "
                  >
                    <v-progress-linear
                      v-if="currentLocation.loading"
                      indeterminate
                      color="primary"
                      class="mt-2"
                    ></v-progress-linear>
                    <v-alert
                      v-else-if="currentLocation.error"
                      type="error"
                      variant="tonal"
                      class="mt-2"
                      closable
                    >
                      {{ currentLocation.error }}
                    </v-alert>
                    <v-chip
                      v-else-if="formData[field.key]"
                      color="success"
                      variant="tonal"
                      class="mt-2"
                    >
                      <v-icon start>mdi-crosshairs-gps</v-icon>
                      Location Captured
                    </v-chip>
                  </template>
                </v-col>
              </v-row>

              <v-card-actions class="justify-end mt-8 px-0">
                <v-btn
                  v-if="currentFormStep > 1"
                  color="grey-darken-1"
                  variant="outlined"
                  @click="prevFormStep"
                  class="mr-4"
                  size="large"
                >
                  <v-icon left>mdi-arrow-left</v-icon> Back
                </v-btn>
                <v-btn
                  color="grey-darken-1"
                  variant="outlined"
                  @click="handleSaveDraft"
                  class="mr-4"
                  size="large"
                >
                  <v-icon left>mdi-content-save</v-icon> Save Draft
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :disabled="!formValid"
                  size="large"
                >
                  {{
                    currentFormStep === totalFormSteps
                      ? "Submit Task"
                      : "Next Step"
                  }}
                  <v-icon right v-if="currentFormStep !== totalFormSteps"
                    >mdi-arrow-right</v-icon
                  >
                  <v-icon right v-else>mdi-check-circle</v-icon>
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- QR Scanner Dialog -->
    <v-dialog v-model="showQrScannerDialog" max-width="500px" persistent>
      <v-card class="rounded-lg elevation-8">
        <v-card-title
          class="text-h5 font-weight-bold text-primary d-flex align-center"
        >
          <v-icon left>mdi-qrcode-scan</v-icon>
          QR Code Scanner
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeQrScanner">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="py-4">
          <v-alert v-if="qrScanError" type="error" class="mb-4" closable>
            {{ qrScanError }}
          </v-alert>
          <v-file-input
            label="Upload QR Code Image"
            v-model="qrImageFile"
            accept="image/*"
            prepend-icon="mdi-camera"
            variant="outlined"
            density="comfortable"
            show-size-counter
          ></v-file-input>
          <v-text-field
            v-if="decodedQrContent"
            label="Decoded QR Content"
            v-model="decodedQrContent"
            variant="outlined"
            density="comfortable"
            readonly
            class="mt-4"
          ></v-text-field>
          <canvas ref="qrCanvas" style="display: none"></canvas>
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="closeQrScanner"
            size="large"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="applyQrContent"
            :disabled="!decodedQrContent"
            size="large"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Location Selector Dialog -->
    <v-dialog v-model="showLocationSelectorDialog" max-width="800px" persistent>
      <v-card class="rounded-lg elevation-8">
        <v-card-title
          class="text-h5 font-weight-bold text-primary d-flex align-center"
        >
          <v-icon left>mdi-map-marker</v-icon> Select Location
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeLocationSelector">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="py-4">
          <v-alert v-if="locationError" type="error" class="mb-4" closable>
            {{ locationError }}
          </v-alert>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                label="Select Location Type"
                v-model="selectedLocType"
                :items="locationTypes"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                clearable
                class="mb-4"
              ></v-select>
              <v-card
                v-if="displayLocationDetails"
                class="pa-4 rounded-lg elevation-2"
              >
                <v-card-title
                  class="text-h6 font-weight-medium text-grey-darken-3 mb-2"
                >
                  Location Details
                </v-card-title>
                <v-card-text>
                  <p>
                    <strong>Name:</strong>
                    {{
                      displayLocationDetails.locdetail?.locationName || "N/A"
                    }}
                  </p>
                  <p>
                    <strong>Address:</strong>
                    {{ displayLocationDetails.locdetail?.address || "N/A" }}
                  </p>
                  <p>
                    <strong>Pincode:</strong>
                    {{
                      displayLocationDetails.locdetail?.pincodes?.[0] || "N/A"
                    }}
                  </p>
                  <p>
                    <strong>Size:</strong>
                    {{ displayLocationDetails.locSize || "N/A" }}
                  </p>
                  <p>
                    <strong>Latitude:</strong>
                    {{
                      displayLocationDetails.locmark?.lat?.toFixed(4) || "N/A"
                    }}
                  </p>
                  <p>
                    <strong>Longitude:</strong>
                    {{
                      displayLocationDetails.locmark?.lng?.toFixed(4) || "N/A"
                    }}
                  </p>
                  <p v-if="reverseGeocodedAddress">
                    <strong>Geocoded Address:</strong>
                    {{ reverseGeocodedAddress }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="map-card" elevation="2">
                <v-card-title class="pa-3 pb-2">
                  <span class="text-h6">Map View</span>
                </v-card-title>
                <v-card-text class="pa-3">
                  <div class="map-wrapper">
                    <div ref="mapContainer" class="map-container"></div>
                    <div class="coordinates-display">
                      <v-chip
                        v-if="
                          displayLocationDetails?.locmark?.lat &&
                          displayLocationDetails?.locmark?.lng
                        "
                        color="primary"
                        variant="elevated"
                        size="small"
                      >
                        <v-icon start>mdi-crosshairs-gps</v-icon>
                        {{
                          parseFloat(
                            displayLocationDetails.locmark.lat,
                          ).toFixed(4)
                        }},
                        {{
                          parseFloat(
                            displayLocationDetails.locmark.lng,
                          ).toFixed(4)
                        }}
                      </v-chip>
                    </div>
                  </div>
                  <div class="text-caption mt-2 text-grey-darken-1">
                    <v-icon size="small" class="mr-1">mdi-information</v-icon>
                    Location displayed based on selected type.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="closeLocationSelector"
            size="large"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="applyLocation"
            :disabled="!displayLocationDetails"
            size="large"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  reactive,
  watch,
  nextTick,
  onUnmounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import jsQR from "jsqr";

// Toast notification state
const route = useRoute();
const router = useRouter();

// Core reactive data
const currentTaskStatus = ref(null);
const currentFormStep = ref(1);
const clients = ref([]);
const users = ref([]);
const formDetails = ref(null);
const taskData = ref(null);
const loading = ref(true);
const error = ref(null);
const submissionError = ref(null);
const formData = reactive({});
const formValid = ref(false);
const formRef = ref(null);

// Authentication
const token = ref(authService.getToken());
const userRole = computed(() => currentUserTenant.getRole());
const tenantId = computed(() => currentUserTenant.getTenantId());
const userId = computed(() => currentUserTenant.getUserId());
const taskId = computed(() => route.params.taskId);
const assignFormId = computed(() => route.params.assignFormId);

// QR Scanner
const showQrScannerDialog = ref(false);
const qrImageFile = ref([]);
const decodedQrContent = ref("");
const qrScanError = ref("");
const qrCanvas = ref(null);
const currentQrFieldKey = ref("");

// Location Selector
const showLocationSelectorDialog = ref(false);
const locationTypes = ref([]);
const allLocationsData = ref([]);
const selectedLocType = ref(null);
const selectedClientBranchId = ref(null);
const selectedClientBranchSize = ref(null);
const selectedClientLat = ref(null);
const selectedClientLng = ref(null);
const mapContainer = ref(null);
let mapInstance = null;
let markerInstance = null;
const geocoder = ref(null);
const reverseGeocodedAddress = ref(null);
const currentGpsFieldKey = ref("");
const locationError = ref("");

// Image handling
const profilesFolderId = ref(null);
const imageFieldFileIds = reactive({});
const imageFieldDisplayUrls = reactive({});
const initialImageFileIds = new Set();

// Current location
const currentLocation = reactive({
  lat: null,
  lng: null,
  error: null,
  loading: false,
});

const GOOGLE_MAPS_API_KEY = "AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g";

// Field type support mapping
const SUPPORTED_FIELD_TYPES = {
  text: true,
  number: true,
  bigtext: true,
  dropdown: true,
  boolean: true,
  image: true,
  gps: true,
  "gps-currentLocation": true,
  clientSelector: true,
  otp: true,
  "happy-code": true,
  date: true,
};

// Status transitions and field mapping
const orderedStatuses = [
  { key: "pending", label: "Pending", icon: "mdi-timer-sand" },
  { key: "assigned", label: "Assigned", icon: "mdi-account-check" },
  { key: "in_progress", label: "In Progress", icon: "mdi-progress-wrench" },
  { key: "completed", label: "Completed", icon: "mdi-check-circle" },
  { key: "cancelled", label: "Cancelled", icon: "mdi-cancel" },
  { key: "overdue", label: "Overdue", icon: "mdi-clock-alert" },
];

const requiredFieldKeyToFormDataKeyMap = {
  clientId: "orgId",
  UsersId: "UsersId",
  startDate: "from",
  serial_number: "snNumber",
  issue_reported: "issueReport",
  description: "description",
  amount_expected: "amountExpected",
  amount_collected: "amountCollected",
  payment_mode: "paymentMode",
  reference_number: "referenceNumber",
  // user_location: "user_location",
  // client_location: "client_location",
  site_photo_upload: "taskimage",
  // otp: "otp",
  // happy_code: "happy_code",
  title: "title",
  radiusInMeters: "radiusInMeters",
  taskType: "taskType",
  employeeId: "UsersId",
  dueTime: "dueTime",
  from: "from",
  demo: "demo",
  currentLat: "lat",
  currentLng: "lng",
  eAmountCollected: "eAmountCollected",
  partsReplaced: "partsReplaced",
  prodName: "prodName",
  orgId: "orgId",
  orgLocation: "orgLocation",
  snNumber: "snNumber",
};

// Dynamic field component mapping
const getFieldComponent = (field) => {
  const fieldType = getFieldTypeString(field.type);

  switch (fieldType) {
    case "text":
    case "number":
    case "date":
    case "gps":
    case "gps-currentLocation":
    case "otp":
    case "happy-code":
      return "v-text-field";
    case "bigtext":
      return "v-textarea";
    case "dropdown":
    case "clientSelector":
      return "v-select";
    case "boolean":
      return "v-checkbox";
    case "image":
      return "v-file-input";
    default:
      return "v-text-field";
  }
};

// Get field type as string for consistent handling
const getFieldTypeString = (fieldType) => {
  if (typeof fieldType === "object" && fieldType.date === true) {
    return "date";
  }
  return fieldType;
};

// Get field type display name
const getFieldTypeDisplay = (fieldType) => {
  return getFieldTypeString(fieldType);
};

// Check if field type is supported
const isFieldTypeSupported = (fieldType) => {
  const typeString = getFieldTypeString(fieldType);
  return SUPPORTED_FIELD_TYPES[typeString] || false;
};

// Check if field is start date
const isStartDateField = (field) => {
  return field.key === "from" || field.label.toLowerCase().includes("start");
};

// Check if field is end date
const isEndDateField = (field) => {
  return (
    field.key === "dueTime" ||
    field.label.toLowerCase().includes("end") ||
    field.label.toLowerCase().includes("due")
  );
};

// Get dynamic field properties
const getFieldProps = (field) => {
  const fieldType = getFieldTypeString(field.type);
  const baseProps = {
    label: field.placeholder || field.label,
    variant: "outlined",
    density: "comfortable",
    clearable: true,
  };

  switch (fieldType) {
    case "number":
      return {
        ...baseProps,
        type: "number",
        onkeypress: (e) => {
          // Only allow numbers, decimal point, and control keys
          if (
            !/[0-9.]/.test(e.key) &&
            ![
              "Backspace",
              "Delete",
              "Tab",
              "Escape",
              "Enter",
              "Home",
              "End",
              "ArrowLeft",
              "ArrowRight",
            ].includes(e.key)
          ) {
            e.preventDefault();
          }
        },
      };

    case "date":
      return {
        ...baseProps,
        type: "date",
      };

    case "bigtext":
      return {
        ...baseProps,
        rows: 3,
        autoGrow: true,
      };

    case "dropdown":
      return {
        ...baseProps,
        items: getDropdownItems(field.key, field.options),
        itemTitle: getDropdownItemTitle(field.key),
        itemValue: getDropdownItemValue(field.key),
      };

    case "clientSelector":
      return {
        ...baseProps,
        items: clients.value,
        itemTitle: "orgName",
        itemValue: "id",
        appendInnerIcon: field.input_modes?.qr ? "mdi-qrcode-scan" : undefined,
      };

    case "boolean":
      return {
        label: field.label,
        density: "comfortable",
        color: "primary",
        hideDetails: false,
      };

    case "image":
      return {
        ...baseProps,
        accept: getImageAcceptTypes(field),
        prependIcon: "mdi-camera",
        showSizeCounter: true,
      };

    case "gps":
      return {
        ...baseProps,
        readonly: true,
        appendInnerIcon: "mdi-map-marker",
      };
    case "gps-currentLocation":
      return {
        ...baseProps,
        readonly: true,
        appendInnerIcon: "mdi-map-marker",
      };

    case "otp":
    case "happy-code":
      return {
        ...baseProps,
        type: field.input_modes?.number !== false ? "number" : "text",
        maxlength: field.validations?.length,
        onkeypress:
          field.input_modes?.number !== false
            ? (e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  !["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(
                    e.key,
                  )
                ) {
                  e.preventDefault();
                }
              }
            : undefined,
      };

    default:
      return {
        ...baseProps,
        disabled: !isFieldTypeSupported(field.type),
      };
  }
};

// Handle field-specific actions
const handleFieldAction = (field, event) => {
  const fieldType = getFieldTypeString(field.type);

  if (fieldType === "clientSelector" && field.input_modes?.qr) {
    openQrScanner(field.key);
  } else if (fieldType === "gps") {
    // GPS field opens location selector popup
    openLocationSelector(field.key);
  } else if (fieldType === "gps-currentLocation") {
    // GPS current location gets user's actual location
    getCurrentLocation(field.key);
  }
};

// Handle field changes
const handleFieldChange = (field, event) => {
  const fieldType = getFieldTypeString(field.type);

  if (fieldType === "image") {
    const file = event.target.files?.[0] || event;
    handleImageFieldChange(field.key, file);
  }
};

// Get image accept types based on validation
const getImageAcceptTypes = (field) => {
  if (field.validations?.fileTypeAllowed?.length > 0) {
    return field.validations.fileTypeAllowed
      .map((type) => `image/${type}`)
      .join(",");
  }
  return "image/*";
};

// Get dropdown item title property
const getDropdownItemTitle = (fieldKey) => {
  if (
    fieldKey === "clientId" ||
    fieldKey === "client" ||
    fieldKey === "orgId"
  ) {
    return "orgName";
  }
  if (["employeeId", "assignTo", "Collector", "UsersId"].includes(fieldKey)) {
    return "firstName";
  }
  return undefined;
};

// Get dropdown item value property
const getDropdownItemValue = (fieldKey) => {
  if (
    [
      "clientId",
      "client",
      "orgId",
      "employeeId",
      "assignTo",
      "Collector",
      "UsersId",
    ].includes(fieldKey)
  ) {
    return "id";
  }
  return undefined;
};

// Computed properties
const locationBranches = computed(() => {
  if (!selectedLocType.value || !allLocationsData.value) return [];
  const filtered = allLocationsData.value.filter(
    (loc) => loc.locType === selectedLocType.value,
  );
  return filtered.map((loc) => ({
    title:
      loc.locdetail?.locationName ||
      loc.orgLocation?.orgName ||
      `ID: ${loc.id}`,
    value: loc.id,
    data: loc,
  }));
});

const displayLocationDetails = computed(() => {
  if (selectedLocType.value && locationBranches.value.length > 0) {
    const location = locationBranches.value[0].data;
    return {
      ...location,
      locmark: {
        ...location.locmark,
        lat: location.locmark.coordinates[1],
        lng: location.locmark.coordinates[0],
      },
    };
  }
  return null;
});

const currentStepIndex = computed(() => {
  if (!currentTaskStatus.value) return -1;
  const index = orderedStatuses.findIndex(
    (s) => s.key === currentTaskStatus.value,
  );
  return index;
});

// Check if task is overdue
const isOverdue = computed(() => {
  if (!taskData.value?.dueTime) return false;
  const dueDate = new Date(taskData.value.dueTime);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && taskData.value.status !== "completed";
});

// Form step management
const formFieldSteps = computed(() => {
  if (!formDetails.value?.custom_FormTemplate?.fields) return [];

  const allVisibleFields = formDetails.value.custom_FormTemplate.fields
    .filter(
      (field) =>
        field.field_type === "completion" ||
        field.field_type === "creation/completion",
    )
    .filter(isFieldVisible);

  const steps = [];
  let currentStepFields = [];
  const fieldsPerStep = 7;

  for (const field of allVisibleFields) {
    currentStepFields.push(field);
    if (currentStepFields.length === fieldsPerStep) {
      steps.push(currentStepFields);
      currentStepFields = [];
    }
  }

  if (currentStepFields.length > 0) {
    steps.push(currentStepFields);
  }

  return steps;
});

const currentStepFields = computed(() => {
  return formFieldSteps.value[currentFormStep.value - 1] || [];
});

const totalFormSteps = computed(() => formFieldSteps.value.length);

// Creation fields for display
const creationFields = computed(() => {
  if (!formDetails.value?.custom_FormTemplate?.fields) return [];
  return formDetails.value.custom_FormTemplate.fields
    .filter((field) => field.field_type === "creation")
    .filter(isFieldVisible);
});

// Field visibility and validation
const isFieldVisible = (field) => {
  const visibility = field.rolesVisibility;
  if (!visibility) return true;

  if (Array.isArray(visibility)) {
    return visibility.includes(userRole.value);
  } else if (typeof visibility === "object") {
    return visibility[userRole.value];
  }
  return true;
};

const isFieldMandatory = (field) => {
  const mandatory = field.roleBasedMandatory;
  const required = field.roleBasedRequired;
  const validationRequired = field.validations?.required;

  if (
    mandatory &&
    typeof mandatory === "object" &&
    mandatory[userRole.value] !== undefined
  ) {
    return mandatory[userRole.value];
  }

  if (
    required &&
    typeof required === "object" &&
    required[userRole.value] !== undefined
  ) {
    return required[userRole.value];
  }

  return validationRequired || false;
};

const getDropdownItems = (fieldKey, defaultOptions) => {
  let items;

  if (
    fieldKey === "clientId" ||
    fieldKey === "client" ||
    fieldKey === "orgId"
  ) {
    items = clients.value;
  } else if (
    ["employeeId", "assignTo", "Collector", "UsersId"].includes(fieldKey)
  ) {
    items = users.value;
  } else {
    items = defaultOptions || [];
  }

  return items;
};

const getValidationRules = (field) => {
  const rules = [];
  const validations = field.validations;
  const mandatory = isFieldMandatory(field);
  const fieldType = getFieldTypeString(field.type);

  // Required validation
  if (mandatory || validations?.required) {
    rules.push((v) => {
      if (!v || v === null || v === undefined || v === "") {
        return validations?.message || `${field.label} is required.`;
      }
      return true;
    });
  }

  if (validations) {
    // Text/BigText validations
    if (fieldType === "text" || fieldType === "bigtext") {
      if (validations.minLength) {
        rules.push((v) => {
          if (v && v.length < validations.minLength) {
            return (
              validations.message || `Min length is ${validations.minLength}.`
            );
          }
          return true;
        });
      }
      if (validations.maxLength) {
        rules.push((v) => {
          if (v && v.length > validations.maxLength) {
            return (
              validations.message || `Max length is ${validations.maxLength}.`
            );
          }
          return true;
        });
      }
    }

    // Number validations
    if (fieldType === "number") {
      if (validations.min !== undefined) {
        rules.push((v) => {
          if (v !== null && v !== "" && v < validations.min) {
            return (
              validations.message ||
              `Value must be at least ${validations.min}.`
            );
          }
          return true;
        });
      }
      if (validations.max !== undefined) {
        rules.push((v) => {
          if (v !== null && v !== "" && v > validations.max) {
            return (
              validations.message || `Value must be at most ${validations.max}.`
            );
          }
          return true;
        });
      }
    }

    // Date validations - Updated for Start/End Date specific validation
    if (fieldType === "date") {
      // Date format validation
      if (validations.format) {
        rules.push((v) => {
          if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
            return (
              validations.message ||
              `Date format must be ${validations.format}.`
            );
          }
          return true;
        });
      }

      // Start Date Specific Validations
      if (isStartDateField(field)) {
        // Past dates validation for start date
        if (validations.allowPastDates === false) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate < today) {
                return (
                  validations.message ||
                  "Past dates are not allowed for start date."
                );
              }
            }
            return true;
          });
        }

        // Future dates validation for start date
        if (validations.allowFutureDates === false) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate > today) {
                return (
                  validations.message ||
                  "Future dates are not allowed for start date."
                );
              }
            }
            return true;
          });
        }

        // Min days validation for start date
        if (validations.isMinDay && validations.minDay) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffTime = selectedDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const minDays = parseInt(validations.minDay);

              if (diffDays < minDays) {
                return (
                  validations.message ||
                  `Start date must be at least ${minDays} days from today.`
                );
              }
            }
            return true;
          });
        }
      }

      // End Date Specific Validations
      else if (isEndDateField(field)) {
        // Past dates validation for end date
        if (validations.allowPastDates === false) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate < today) {
                return (
                  validations.message ||
                  "Past dates are not allowed for end date."
                );
              }
            }
            return true;
          });
        }

        // Future dates validation for end date
        if (validations.allowFutureDates === false) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate > today) {
                return (
                  validations.message ||
                  "Future dates are not allowed for end date."
                );
              }
            }
            return true;
          });
        }

        // Max days validation for end date
        if (validations.isMaxDay && validations.maxDay) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffTime = selectedDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const maxDays = parseInt(validations.maxDay);

              if (diffDays > maxDays) {
                return (
                  validations.message ||
                  `End date must be within ${maxDays} days from today.`
                );
              }
            }
            return true;
          });
        }

        // Must be after field validation for end date
        if (validations.mustBeAfterField) {
          rules.push((v) => {
            if (v) {
              const refFieldValue = formData[validations.mustBeAfterField];
              if (refFieldValue) {
                const selectedDate = new Date(v);
                const refDate = new Date(refFieldValue);
                if (selectedDate <= refDate) {
                  return (
                    validations.message ||
                    `End date must be after ${validations.mustBeAfterField}.`
                  );
                }
              }
            }
            return true;
          });
        }
      }

      // General Date Fields (not start/end specific) - keep all validations
      else {
        // Past dates validation
        if (validations.allowPastDates === false) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate < today) {
                return validations.message || "Past dates are not allowed.";
              }
            }
            return true;
          });
        }

        // Future dates validation
        if (validations.allowFutureDates === false) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate > today) {
                return validations.message || "Future dates are not allowed.";
              }
            }
            return true;
          });
        }

        // Min date validation
        if (validations.isMinDate && validations.minDate) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const minDate = new Date(validations.minDate);
              if (selectedDate < minDate) {
                return (
                  validations.message ||
                  `Date must be after ${validations.minDate}.`
                );
              }
            }
            return true;
          });
        }

        // Max date validation
        if (validations.isMaxDate && validations.maxDate) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const maxDate = new Date(validations.maxDate);
              if (selectedDate > maxDate) {
                return (
                  validations.message ||
                  `Date must be before ${validations.maxDate}.`
                );
              }
            }
            return true;
          });
        }

        // Min days validation
        if (validations.isMinDay && validations.minDay) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffTime = selectedDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const minDays = parseInt(validations.minDay);

              if (diffDays < minDays) {
                return (
                  validations.message ||
                  `Date must be at least ${minDays} days from today.`
                );
              }
            }
            return true;
          });
        }

        // Max days validation
        if (validations.isMaxDay && validations.maxDay) {
          rules.push((v) => {
            if (v) {
              const selectedDate = new Date(v);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffTime = selectedDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const maxDays = parseInt(validations.maxDay);

              if (diffDays > maxDays) {
                return (
                  validations.message ||
                  `Date must be within ${maxDays} days from today.`
                );
              }
            }
            return true;
          });
        }

        // Must be after field validation
        if (validations.mustBeAfterField) {
          rules.push((v) => {
            if (v) {
              const refFieldValue = formData[validations.mustBeAfterField];
              if (refFieldValue) {
                const selectedDate = new Date(v);
                const refDate = new Date(refFieldValue);
                if (selectedDate <= refDate) {
                  return (
                    validations.message ||
                    `Date must be after ${validations.mustBeAfterField}.`
                  );
                }
              }
            }
            return true;
          });
        }
      }
    }

    // Image validations
    if (fieldType === "image") {
      if (validations.maxSizeMB) {
        rules.push((v) => {
          if (v && v.size > validations.maxSizeMB * 1024 * 1024) {
            return (
              validations.message ||
              `Image size must be less than ${validations.maxSizeMB} MB.`
            );
          }
          return true;
        });
      }
      if (
        validations.fileTypeAllowed &&
        validations.fileTypeAllowed.length > 0
      ) {
        rules.push((v) => {
          if (v) {
            const fileExtension = v.name.split(".").pop().toLowerCase();
            if (!validations.fileTypeAllowed.includes(fileExtension)) {
              return (
                validations.message ||
                `Allowed types: ${validations.fileTypeAllowed.join(", ")}.`
              );
            }
          }
          return true;
        });
      }
    }

    // OTP/Happy Code validations
    if (
      (fieldType === "otp" || fieldType === "happy-code") &&
      validations.length
    ) {
      rules.push((v) => {
        if (v && String(v).length !== validations.length) {
          return (
            validations.message ||
            `Must be exactly ${validations.length} digits.`
          );
        }
        return true;
      });
    }
  }

  return rules;
};

const getFieldErrorMessages = (field) => {
  // This will be handled by Vuetify's built-in validation system
  return [];
};

const getFieldColSize = (type) => {
  const fieldType = getFieldTypeString(type);
  if (fieldType === "boolean") return 6;
  if (fieldType === "image") return 12;
  if (fieldType === "bigtext") return 12;
  return 6;
};

const getCreationFieldValue = (field) => {
  if (!taskData.value) return "N/A";

  // Handle nested fields and specific types for display
  switch (field.key) {
    case "orgId":
      return taskData.value.orgId?.orgName || "N/A";
    case "UsersId":
      return taskData.value.employeeId?.assignedUser?.first_name || "N/A";
    case "from":
    case "dueTime":
      return taskData.value[field.key]
        ? new Date(taskData.value[field.key]).toLocaleDateString()
        : "N/A";
    case "orgLocation":
      const locDetail = taskData.value.orgLocation?.locdetail?.locationName;
      const locMarkLat = taskData.value.orgLocation?.locmark?.lat;
      const locMarkLng = taskData.value.orgLocation?.locmark?.lng;
      if (locDetail) return locDetail;
      if (locMarkLat && locMarkLng)
        return `Lat: ${locMarkLat}, Lng: ${locMarkLng}`;
      return "N/A";
    case "amountExpected":
      return taskData.value[field.key] !== undefined &&
        taskData.value[field.key] !== null
        ? `Rs. ${taskData.value[field.key].toFixed(2)}`
        : "N/A";
    case "demo":
      return taskData.value[field.key] ? "Yes" : "No";
    case "radiusInMeters":
      return taskData.value[field.key] !== undefined &&
        taskData.value[field.key] !== null
        ? `${taskData.value[field.key]} meters`
        : "N/A";
    case "prodName":
      return taskData.value.prodName?.productName || "N/A";
    default:
      return taskData.value[field.key] !== undefined &&
        taskData.value[field.key] !== null
        ? taskData.value[field.key]
        : "N/A";
  }
};

// API Functions
const fetchFormDetails = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (!token.value) {
      throw new Error("Authentication token not found. Please log in.");
    }
    if (!assignFormId.value) {
      throw new Error("Form Template ID not provided.");
    }

    const params = {
      "fields[]": [
        "formName",
        "custom_FormTemplate",
        "tenant.tenantName",
        "assignedOrgnization.orgName",
        "id",
      ],
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (Array.isArray(params[key])) {
          return params[key].map((field) => `${key}=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant_template/${assignFormId.value}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
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
    formDetails.value = data.data;
  } catch (err) {
    console.error("Error fetching form details:", err);
    error.value =
      err.message || "Failed to fetch form details. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchTaskDetails = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (!token.value) {
      throw new Error("Authentication token not found. Please log in.");
    }
    if (!taskId.value) {
      throw new Error("Task ID not provided.");
    }

    // Construct the fields array for the GET request
    const fieldsToFetch = [
      "radiusInMeters",
      "orgId.orgName",
      "orgId.orgNumber",
      "orgId.orgAddress",
      "orgLocation.locType",
      "orgLocation.locdetail",
      "orgLocation.locSize",
      "orgLocation.locmark",
      "title",
      "description",
      "lat",
      "lng",
      "taskType",
      "employeeId.employeeId",
      "employeeId.assignedUser.first_name",
      "employeeId.assignedUser.last_name",
      "dueTime",
      "from",
      "amountExpected",
      "amountCollected",
      "referenceNumber",
      "paymentMode",
      "deviceType",
      "snNumber",
      "demo",
      "currentLat",
      "currentLng",
      "eAmountCollected",
      "issueReport",
      "taskimage.id",
      "partsReplaced",
      "prodName.productName",
      "id",
      "status",
    ];

    const queryString = fieldsToFetch
      .map((field) => `fields[]=${field}`)
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tasks/${taskId.value}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
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
    taskData.value = data.data;
    currentTaskStatus.value = taskData.value.status;

    // Initialize formData with existing task values for relevant fields
    if (formDetails.value?.custom_FormTemplate?.fields && taskData.value) {
      // Clear previous form data and image states
      for (const key in formData) {
        delete formData[key];
      }
      for (const key in imageFieldFileIds) {
        delete imageFieldFileIds[key];
        delete imageFieldDisplayUrls[key];
      }
      initialImageFileIds.clear();

      for (const field of formDetails.value.custom_FormTemplate.fields) {
        if (
          field.field_type === "completion" ||
          field.field_type === "creation/completion"
        ) {
          const fieldType = getFieldTypeString(field.type);

          if (fieldType === "image") {
            const fileId =
              taskData.value[field.key]?.id || taskData.value[field.key];
            if (fileId) {
              imageFieldFileIds[field.key] = fileId;
              imageFieldDisplayUrls[field.key] = await fetchAuthorizedImage(
                `${import.meta.env.VITE_API_URL}/assets/${fileId}`,
              );
              formData[field.key] = new File([], "existing_image.jpg", {
                type: "image/jpeg",
              });
              initialImageFileIds.add(fileId);
            } else {
              formData[field.key] = null;
            }
          } else if (fieldType === "gps-currentLocation") {
            currentLocation.lat =
              taskData.value.currentLat !== undefined &&
              taskData.value.currentLat !== null
                ? parseFloat(taskData.value.currentLat)
                : null;
            currentLocation.lng =
              taskData.value.currentLng !== undefined &&
              taskData.value.currentLng !== null
                ? parseFloat(taskData.value.currentLng)
                : null;

            if (currentLocation.lat !== null && currentLocation.lng !== null) {
              formData[field.key] =
                `${currentLocation.lat},${currentLocation.lng}`;
            } else {
              formData[field.key] = null;
            }
          } else if (fieldType === "gps") {
            if (taskData.value.lat && taskData.value.lng) {
              formData[field.key] =
                `${taskData.value.lat},${taskData.value.lng}`;
              selectedClientLat.value = taskData.value.lat;
              selectedClientLng.value = taskData.value.lng;
            } else {
              formData[field.key] = null;
            }

            selectedClientBranchId.value =
              taskData.value.orgLocation?.id || null;
            selectedClientBranchSize.value =
              taskData.value.orgLocation?.locSize ||
              taskData.value.radiusInMeters ||
              null;
          } else if (taskData.value[field.key] !== undefined) {
            formData[field.key] = taskData.value[field.key];
          } else if (fieldType === "boolean") {
            formData[field.key] = false;
          } else if (fieldType === "number") {
            formData[field.key] = null;
          } else {
            formData[field.key] = "";
          }

          console.log(
            `Initialized formData[${field.key}] (type: ${fieldType}) with taskData:`,
            formData[field.key],
          );
        }
      }
    }
  } catch (err) {
    console.error("Error fetching task details:", err);
    error.value =
      err.message || "Failed to fetch task details. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchDropdownData = async () => {
  if (!token.value || !tenantId.value) {
    console.warn(
      "Token or Tenant ID not available for fetching dropdown data. Skipping API calls.",
    );
    return;
  }

  try {
    // Fetch clients
    const clientParams = new URLSearchParams([
      ["limit", "-1"],
      ["fields[]", "orgName"],
      ["fields[]", "id"],
      ["filter[_and][0][_and][0][tenant][tenantId][_eq]", tenantId.value],
      ["filter[_and][1][status][_neq]", "archived"],
    ]).toString();

    const clientsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?${clientParams}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );

    if (!clientsResponse.ok)
      throw new Error("Failed to fetch clients (organizations)");

    const clientsData = await clientsResponse.json();
    clients.value = clientsData.data.map((c) => ({
      orgName: c.orgName,
      id: c.id,
    }));

    // Fetch employees
    const employeeParams = new URLSearchParams([
      ["limit", "-1"],
      ["fields[]", "employeeId"],
      ["fields[]", "assignedUser.first_name"],
      ["fields[]", "assignedUser.last_name"],
      ["fields[]", "id"],
      ["filter[_and][0][assignedUser][tenant][tenantId][_eq]", tenantId.value],
    ]).toString();

    const usersResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${employeeParams}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );

    if (!usersResponse.ok) throw new Error("Failed to fetch employees");

    const usersData = await usersResponse.json();
    users.value = usersData.data.map((u) => ({
      id: u.id,
      firstName:
        `${u.assignedUser?.first_name || ""} ${u.assignedUser?.last_name || ""} (${u.employeeId || "N/A"})`.trim(),
    }));
  } catch (err) {
    console.error("Error fetching dropdown data:", err);
  }
};

// Form navigation
const nextFormStep = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) {
    showValidationToast(
      "Please correct the form errors before proceeding.",
      "error",
    );
    return;
  }

  submissionError.value = null;

  if (currentFormStep.value < totalFormSteps.value) {
    currentFormStep.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
    showValidationToast("Step completed successfully!", "success");
  } else {
    handleSubmit();
  }
};

const prevFormStep = () => {
  if (currentFormStep.value > 1) {
    currentFormStep.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// Utility functions
const parseLatLng = (latLngString) => {
  if (typeof latLngString === "string" && latLngString.includes(",")) {
    const parts = latLngString.split(",").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
  }
  return null;
};

const parseLocSizeToMeters = (locSizeValue) => {
  if (typeof locSizeValue === "number") {
    return locSizeValue;
  }
  if (typeof locSizeValue === "string") {
    const numValue = parseFloat(locSizeValue);
    if (!isNaN(numValue)) {
      return numValue;
    }
    if (locSizeValue.toLowerCase().endsWith("km")) {
      const kmValue = parseFloat(locSizeValue.toLowerCase().replace("km", ""));
      if (!isNaN(kmValue)) {
        return kmValue * 1000;
      }
    }
  }
  return null;
};

// Generate code for OTP/Happy Code fields
const generateCode = (field) => {
  const length = field.validations?.length || (field.type === "otp" ? 6 : 4);
  const isNumeric = field.input_modes?.number !== false;

  let code = "";
  const chars = isNumeric
    ? "0123456789"
    : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  formData[field.key] = code;
  console.log(`Generated ${field.type} code:`, code);
};

// Add new function for getting current location:
const getCurrentLocation = (fieldKey) => {
  if (!navigator.geolocation) {
    showValidationToast(
      "Geolocation is not supported by this browser.",
      "error",
    );
    return;
  }

  currentLocation.loading = true;
  currentLocation.error = null;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation.lat = position.coords.latitude;
      currentLocation.lng = position.coords.longitude;
      currentLocation.loading = false;
      formData[fieldKey] =
        `${currentLocation.lat.toFixed(6)},${currentLocation.lng.toFixed(6)}`;
      showValidationToast("Current location captured successfully!", "success");
    },
    (error) => {
      currentLocation.loading = false;
      let errorMessage = "Unable to retrieve your location.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      }
      currentLocation.error = errorMessage;
      showValidationToast(errorMessage, "error");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    },
  );
};

const buildPayload = () => {
  const payload = {
    ...(formData.description && { description: formData.description }),
    ...(formData.taskType && { taskType: formData.taskType }),
    ...(formData.UsersId && { employeeId: formData.UsersId }),
    ...(formData.dueTime && { dueTime: formData.dueTime }),
    ...(formData.from && { from: formData.from }),
    ...(formData.amountExpected && { amountExpected: formData.amountExpected }),
    ...(formData.amountCollected && {
      amountCollected: formData.amountCollected,
    }),
    ...(formData.demo !== undefined && { demo: formData.demo }),
    ...(formData.eAmountCollected && {
      eAmountCollected: formData.eAmountCollected,
    }),
    ...(formData.issueReport && { issueReport: formData.issueReport }),
    ...(formData.partsReplaced && { partsReplaced: formData.partsReplaced }),
    ...(formData.prodName && { prodName: formData.prodName }),
    ...(formData.orgId && { orgId: formData.orgId }),
    ...(formData.snNumber && { snNumber: formData.snNumber }),
    ...(formData.referenceNumber && {
      referenceNumber: formData.referenceNumber,
    }),
    ...(formData.paymentMode && { paymentMode: formData.paymentMode }),
    ...(formData.deviceType && { deviceType: formData.deviceType }),
    ...(formData.title && { title: formData.title }),
  };

  // Add image file IDs to payload
  for (const fieldKey in imageFieldFileIds) {
    if (imageFieldFileIds[fieldKey]) {
      payload[fieldKey] = imageFieldFileIds[fieldKey];
    }
  }

  // Add GPS data
  const gpsPayload = (() => {
    const payloadGps = {};

    if (selectedClientBranchId.value) {
      payloadGps.orgLocation = selectedClientBranchId.value;
    }
    if (selectedClientLat.value !== null && selectedClientLng.value !== null) {
      payloadGps.lat = selectedClientLat.value;
      payloadGps.lng = selectedClientLng.value;
    }

    const radius = parseLocSizeToMeters(selectedClientBranchSize.value);
    if (radius !== null) {
      payloadGps.radiusInMeters = radius;
    }

    // For gps-currentLocation, use the currentLocation state
    if (currentLocation.lat !== null && currentLocation.lng !== null) {
      payloadGps.currentLat = currentLocation.lat;
      payloadGps.currentLng = currentLocation.lng;
    }

    return payloadGps;
  })();

  // Merge GPS data
  Object.assign(payload, gpsPayload);

  // Remove undefined values
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};

// Save draft with "in_progress" status
const handleSaveDraft = async () => {
  submissionError.value = null;

  const payload = {
    ...buildPayload(),
    status: "in_progress", // Set status to in_progress for draft
  };

  console.log("Saving Draft Payload:", payload);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tasks/${taskId.value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to save draft: ${response.statusText} - ${errorData.message || "Unknown error"}`,
      );
    }

    const result = await response.json();
    console.log("Task draft saved:", result);
    showValidationToast("Task draft saved successfully!", "success");

    // Update current task status
    currentTaskStatus.value = "in_progress";
    taskData.value.status = "in_progress";
  } catch (err) {
    submissionError.value =
      err.message || "Failed to save draft. Please try again.";
    showValidationToast("Failed to save draft. Please try again.", "error");
  }
};

// Form submission with dynamic status calculation
const handleSubmit = async () => {
  submissionError.value = null;

  // First validate the form
  const { valid } = await formRef.value.validate();
  if (!valid) {
    submissionError.value = "Please correct the form errors before submitting.";
    showValidationToast(
      "Please correct the form errors before submitting.",
      "error",
    );
    return;
  }

  console.log("Starting form submission...");

  // Determine final status based on due date and transitions
  let finalStatus = null;
  const statusTransitions =
    formDetails.value.custom_FormTemplate.status_transitions;

  // 1. First check if task is overdue
  if (isOverdue.value) {
    console.log("Task is overdue, setting status to overdue");
    finalStatus = "overdue";
  }
  // 2. If not overdue, proceed with completed status checks
  else {
    console.log("Task is not overdue, checking for completed status");

    // Default to completed if no transitions defined
    if (!statusTransitions || !statusTransitions.completed) {
      console.log(
        "No completed status in transitions, defaulting to completed",
      );
      finalStatus = "completed";
    } else {
      console.log(
        "Found completed in status transitions:",
        statusTransitions.completed,
      );

      // Check if user role can set to completed
      if (
        !statusTransitions.completed.can_set_by_roles?.includes(userRole.value)
      ) {
        submissionError.value =
          "Your role cannot set the status to 'completed'.";
        showValidationToast(
          "Your role cannot complete this task. Please contact administrator.",
          "error",
        );
        return;
      }

      // Validate required fields for completed status
      const requiredFieldsForTargetStatus =
        statusTransitions.completed.required_fields?.[userRole.value] || [];

      console.log(
        "Required fields for completed status:",
        requiredFieldsForTargetStatus,
      );

      let allRequiredFieldsFilled = true;
      const missingFields = [];

      for (const requiredFieldKeyFromConfig of requiredFieldsForTargetStatus) {
        const actualFormDataKey =
          requiredFieldKeyToFormDataKeyMap[requiredFieldKeyFromConfig] ||
          requiredFieldKeyFromConfig;

        const fieldDef = formDetails.value.custom_FormTemplate.fields.find(
          (f) => f.key === actualFormDataKey,
        );

        if (!fieldDef) {
          console.warn(
            `Field definition for key '${actualFormDataKey}' not found.`,
          );
          continue;
        }

        if (!isFieldVisible(fieldDef)) {
          console.log(
            `Field ${actualFormDataKey} is not visible for current role, skipping.`,
          );
          continue;
        }

        let fieldValue = formData[actualFormDataKey];
        if (getFieldTypeString(fieldDef.type) === "image") {
          fieldValue = imageFieldFileIds[actualFormDataKey];
        }

        if (
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue === "" ||
          (Array.isArray(fieldValue) && fieldValue.length === 0)
        ) {
          allRequiredFieldsFilled = false;
          missingFields.push(fieldDef?.label || fieldDef.key);
        }
      }

      if (!allRequiredFieldsFilled) {
        submissionError.value = `Missing required fields for completion: ${missingFields.join(", ")}.`;
        showValidationToast(
          `Missing required fields: ${missingFields.join(", ")}`,
          "error",
        );
        return;
      }

      finalStatus = "completed";
    }
  }

  // Build and submit payload
  const payload = {
    ...buildPayload(),
    status: finalStatus,
  };

  console.log("Final submission payload:", payload);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tasks/${taskId.value}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to submit task: ${response.statusText} - ${errorData.errors?.[0]?.message || errorData.message || "Unknown error"}`,
      );
    }

    const result = await response.json();
    console.log("Task submitted successfully:", result);
    showValidationToast("Task submitted successfully!", "success");

    setTimeout(() => {
      router.push("/taskManagement/taskcomponents/TasksPage");
    }, 1500);
  } catch (err) {
    console.error("Submit error:", err);
    submissionError.value =
      err.message || "Failed to submit form. Please try again.";
    showValidationToast(
      err.message || "Failed to submit form. Please try again.",
      "error",
    );
  }
};

// Add new function to handle field updates:
const updateFieldValue = (fieldKey, value) => {
  formData[fieldKey] = value;
};

// Helper to fetch image with authorization
const fetchAuthorizedImage = async (url) => {
  const authToken = authService.getToken();
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

// Helper to upload file
const uploadFile = async (file, folderId) => {
  try {
    const formData = new FormData();
    if (folderId) {
      formData.append("folder", folderId);
    }
    formData.append("file", file, file.name);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to upload file: ${response.statusText} - ${errorData.message || "Unknown error"}`,
      );
    }

    const result = await response.json();
    return result.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    submissionError.value = `Failed to upload image: ${error.message}`;
    return null;
  }
};

// Helper to delete file
const deleteFile = async (fileId) => {
  if (!fileId) return;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    if (!response.ok) {
      console.error(`Failed to delete old file: ${response.status}`);
    } else {
      console.log(`File ${fileId} deleted successfully.`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

// Fetch the Profiles folder ID from tenant data
const fetchProfilesFolderId = async () => {
  try {
    const authToken = authService.getToken();
    const currentTenantId = currentUserTenant.getTenantId();
    if (!authToken || !currentTenantId) {
      console.warn("Token or Tenant ID not available for fetching folder ID.");
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${currentTenantId}&fields[]=foldersId`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      const profilesFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Profiles",
      );
      if (profilesFolder) {
        profilesFolderId.value = profilesFolder.id;
        return profilesFolder.id;
      } else {
        console.warn("Profiles folder not found in tenant data.");
        return null;
      }
    } else {
      console.warn("No folder structure found for tenant");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profiles folder ID:", error);
    return null;
  }
};

const handleImageFieldChange = async (fieldKey, file) => {
  if (!file) {
    formData[fieldKey] = null;
    imageFieldFileIds[fieldKey] = null;
    imageFieldDisplayUrls[fieldKey] = null;
    return;
  }

  submissionError.value = null;
  const newFileId = await uploadFile(file, profilesFolderId.value);

  if (newFileId) {
    // Store the file ID for the payload
    imageFieldFileIds[fieldKey] = newFileId;
    imageFieldDisplayUrls[fieldKey] = await fetchAuthorizedImage(
      `${import.meta.env.VITE_API_URL}/assets/${newFileId}`,
    );
    formData[fieldKey] = file; // Keep file for form validation
    showValidationToast("Image uploaded successfully!", "success");
  } else {
    formData[fieldKey] = null;
    imageFieldFileIds[fieldKey] = null;
    imageFieldDisplayUrls[fieldKey] = null;
    showValidationToast("Failed to upload image. Please try again.", "error");
  }
};

// QR Scanner functions
const openQrScanner = (fieldKey) => {
  currentQrFieldKey.value = fieldKey;
  showQrScannerDialog.value = true;
  qrImageFile.value = [];
  decodedQrContent.value = "";
  qrScanError.value = "";
};

const closeQrScanner = () => {
  showQrScannerDialog.value = false;
  qrImageFile.value = [];
  decodedQrContent.value = "";
  qrScanError.value = "";
  currentQrFieldKey.value = "";
};

const applyQrContent = () => {
  if (decodedQrContent.value && currentQrFieldKey.value) {
    formData[currentQrFieldKey.value] = decodedQrContent.value;
    closeQrScanner();
  } else {
    qrScanError.value = "No QR content to apply or target field not set.";
  }
};

// Location selector functions
const googleMapsApiReady = ref(false);
let googleMapsApiPromiseResolve = null;
let googleMapsApiPromiseReject = null;

window.initGoogleMapsAPI = () => {
  googleMapsApiReady.value = true;
  if (googleMapsApiPromiseResolve) {
    googleMapsApiPromiseResolve();
  }
  console.log("Google Maps API script loaded and ready.");
};

const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (googleMapsApiReady.value) {
      resolve();
      return;
    }

    googleMapsApiPromiseResolve = resolve;
    googleMapsApiPromiseReject = reject;

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&callback=initGoogleMapsAPI`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onerror = (e) => {
      console.error("Error loading Google Maps script:", e);
      locationError.value =
        "Failed to load Google Maps. Check API key or network.";
      if (googleMapsApiPromiseReject) {
        googleMapsApiPromiseReject(e);
      }
    };
  });
};

const openLocationSelector = async (fieldKey) => {
  currentGpsFieldKey.value = fieldKey;
  showLocationSelectorDialog.value = true;
  selectedLocType.value = null;
  reverseGeocodedAddress.value = null;
  locationError.value = "";

  console.log("Opening location selector for field:", fieldKey);

  // Clear existing map
  if (mapInstance && markerInstance) {
    markerInstance.setMap(null);
    mapInstance = null;
    markerInstance = null;
  }
  if (mapContainer.value) {
    mapContainer.value.innerHTML = "";
  }

  let clientOrgId = formDetails.value?.assignedOrgnization?.id;
  const clientField = formDetails.value?.custom_FormTemplate?.fields.find(
    (f) => f.type === "clientSelector",
  );
  if (clientField && formData[clientField.key]) {
    clientOrgId = formData[clientField.key];
  }

  await fetchLocationManagementData(clientOrgId);

  try {
    await loadGoogleMapsScript();
    await nextTick();
    if (locationTypes.value.length > 0) {
      selectedLocType.value = locationTypes.value[0].value;
    } else {
      await initMap(NaN, NaN);
    }
  } catch (e) {
    console.error("Error loading Google Maps:", e);
    locationError.value = "Failed to load map: " + e.message;
  }
};

const closeLocationSelector = () => {
  showLocationSelectorDialog.value = false;
  selectedLocType.value = null;
  reverseGeocodedAddress.value = null;
  currentGpsFieldKey.value = "";
  if (mapInstance && markerInstance) {
    markerInstance.setMap(null);
    markerInstance = null;
    mapInstance = null;
  }
  if (mapContainer.value) {
    mapContainer.value.innerHTML = "";
    mapContainer.value.style.backgroundColor = "";
  }
};

const fetchLocationManagementData = async (clientOrgId) => {
  if (!token.value || !tenantId.value || !clientOrgId) {
    locationError.value =
      "Missing authentication or organization details to fetch locations.";
    return;
  }

  try {
    const params = new URLSearchParams([
      ["limit", "-1"],
      ["fields[]", "locType"],
      ["fields[]", "locmark"],
      ["fields[]", "locdetail"],
      ["fields[]", "locSize"],
      ["fields[]", "orgLocation.orgName"],
      ["fields[]", "orgLocation.id"],
      ["fields[]", "tenant.tenantId"],
      ["fields[]", "id"],
      ["filter[_and][0][_and][0][orgLocation][id][_eq]", clientOrgId],
      ["filter[_and][1][status][_neq]", "archived"],
    ]).toString();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${params}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );

    if (!response.ok)
      throw new Error("Failed to fetch location management data.");

    const data = await response.json();
    allLocationsData.value = data.data;

    const uniqueLocTypes = [...new Set(data.data.map((loc) => loc.locType))];
    locationTypes.value = uniqueLocTypes.map((type) => ({
      title: type,
      value: type,
    }));
  } catch (err) {
    console.error("Error fetching location management data:", err);
    locationError.value =
      err.message || "Failed to fetch locations. Please try again.";
  }
};

const initMap = async (lat, lng) => {
  console.log("Initializing map with lat:", lat, "lng:", lng);

  try {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps API not loaded.");
    }
    if (!mapContainer.value) {
      throw new Error("Map container not found.");
    }

    await new Promise((resolve) => {
      const checkDimensions = () => {
        if (
          mapContainer.value.offsetWidth > 0 &&
          mapContainer.value.offsetHeight > 0
        ) {
          console.log("Map container dimensions:", {
            width: mapContainer.value.offsetWidth,
            height: mapContainer.value.offsetHeight,
          });
          resolve();
        } else {
          setTimeout(checkDimensions, 50);
        }
      };
      checkDimensions();
    });

    if (isNaN(lat) || isNaN(lng)) {
      locationError.value = "Invalid coordinates provided.";
      mapContainer.value.innerHTML =
        '<div class="flex items-center justify-center h-full text-muted-foreground">Invalid location data.</div>';
      return;
    }

    const mapOptions = {
      center: { lat, lng },
      zoom: 15,
      gestureHandling: "cooperative",
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    };

    if (mapInstance) {
      mapInstance.setOptions(mapOptions);
      mapInstance.setCenter({ lat, lng });
    } else {
      mapInstance = new window.google.maps.Map(mapContainer.value, mapOptions);
      geocoder.value = new window.google.maps.Geocoder();
    }

    if (markerInstance) {
      markerInstance.setPosition({ lat, lng });
    } else {
      markerInstance = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title: "Selected Location",
      });
    }

    locationError.value = "";
    await nextTick();
    window.google.maps.event.trigger(mapInstance, "resize");
    console.log("Map initialized successfully");
  } catch (e) {
    console.error("Error initializing map:", e);
    locationError.value = "Failed to initialize map: " + e.message;
  }
};

const fetchReverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/branchLocation/location/reverse-geocode`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      },
    );

    if (!response.ok) throw new Error("Failed to reverse geocode location.");

    const data = await response.json();
    reverseGeocodedAddress.value = data.address || "Address not found.";
  } catch (err) {
    console.error("Error reverse geocoding:", err);
    reverseGeocodedAddress.value = "Could not retrieve address.";
  }
};

const applyLocation = () => {
  if (displayLocationDetails.value && currentGpsFieldKey.value) {
    const { lat, lng } = displayLocationDetails.value.locmark;
    formData[currentGpsFieldKey.value] = `${lat.toFixed(6)},${lng.toFixed(6)}`;

    if (
      currentGpsFieldKey.value === "orgLocation" ||
      currentGpsFieldKey.value === "client_location"
    ) {
      selectedClientBranchId.value = displayLocationDetails.value.id;
      selectedClientBranchSize.value = displayLocationDetails.value.locSize;
      selectedClientLat.value = lat;
      selectedClientLng.value = lng;
      console.log("Applied location:", {
        id: selectedClientBranchId.value,
        size: selectedClientBranchSize.value,
        lat: selectedClientLat.value,
        lng: selectedClientLng.value,
      });
    } else if (currentGpsFieldKey.value === "user_location") {
      console.log("User location applied:", formData[currentGpsFieldKey.value]);
    }

    closeLocationSelector();
  } else {
    locationError.value = "No location selected to apply.";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  switch (status.toLowerCase()) {
    case "inprogress":
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    case "created":
      return "Created";
    case "serviced":
      return "Serviced";
    case "visitedby":
      return "Visited By";
    case "verifiedby":
      return "Verified By";
    case "initiated":
      return "Initiated";
    case "collected":
      return "Collected";
    case "overdue":
      return "Overdue";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Toast notification function
const showValidationToast = (message, type) => {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
    toastMessage.value = "";
  }, 3000);
};

// Watchers
watch(
  [token, tenantId],
  ([newToken, newTenantId]) => {
    if (newToken && newTenantId) {
      fetchDropdownData();
    }
  },
  { immediate: true },
);

watch(qrImageFile, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    const file = newFiles[0];
    decodedQrContent.value = "";
    qrScanError.value = "";

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = qrCanvas.value;
        if (!canvas) {
          qrScanError.value = "Canvas element not found.";
          return;
        }

        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            decodedQrContent.value = code.data;
            qrScanError.value = "";
          } else {
            qrScanError.value = "No QR code found in the image.";
            decodedQrContent.value = "";
          }
        } catch (e) {
          qrScanError.value = `Error processing image: ${e.message}`;
          decodedQrContent.value = "";
        }
      };

      img.onerror = () => {
        qrScanError.value =
          "Could not load image. Please ensure it's a valid image file.";
        decodedQrContent.value = "";
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  } else {
    decodedQrContent.value = "";
    qrScanError.value = "";
  }
});

watch(
  selectedLocType,
  async (newVal) => {
    console.log("selectedLocType changed:", newVal);
    reverseGeocodedAddress.value = null;

    if (displayLocationDetails.value?.locmark?.coordinates) {
      const [lng, lat] = displayLocationDetails.value.locmark.coordinates;
      console.log("Initializing map with coordinates:", { lat, lng });
      try {
        await initMap(lat, lng);
        await fetchReverseGeocode(lat, lng);
      } catch (e) {
        console.error("Error in watch handler:", e);
        locationError.value = "Failed to display map or address: " + e.message;
      }
    } else {
      console.log("No valid location data, initializing empty map");
      await initMap(NaN, NaN);
    }
  },
  { immediate: true },
);

// Lifecycle
onMounted(async () => {
  await fetchProfilesFolderId();
  await fetchDropdownData();
  await fetchFormDetails();
  await fetchTaskDetails();
});

onUnmounted(() => {
  // Clean up newly uploaded images that were not saved
  for (const fieldKey in imageFieldFileIds) {
    const fileId = imageFieldFileIds[fieldKey];
    if (fileId && !initialImageFileIds.has(fileId)) {
      console.log(`Deleting unsaved file: ${fileId}`);
      deleteFile(fileId);
    }
  }
  if (mapInstance) {
    mapInstance = null;
  }
  if (markerInstance) {
    markerInstance.setMap(null);
    markerInstance = null;
  }
});
// Toast notification state
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
let toastTimeout = null;

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.bg-grey-lighten-4 {
  background: rgb(177, 175, 175);
  color: #0f3b82;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.font-weight-bold {
  font-weight: 700 !important;
}

.design {
  height: 80vh;
}

.text-h4 {
  font-size: 2.125rem !important;
  font-weight: 400;
  line-height: 1.175;
  letter-spacing: 0.0073529412em !important;
  text-transform: none !important;
}

.text-grey-darken-4 {
  color: #0f3b82 !important;
}

.v-btn.v-btn--variant-flat.v-btn--color-primary {
  background-color: var(--v-theme-primary) !important;
  color: white !important;
}

.v-btn.v-btn--variant-flat.v-btn--color-blue-grey-darken-1 {
  background-color: #546e7a !important;
  color: white !important;
}

.v-btn.v-btn--variant-tonal.v-btn--color-blue-grey-darken-1 {
  color: #546e7a !important;
  background-color: rgba(84, 110, 122, 0.1) !important;
}

.v-btn.v-btn--variant-tonal.v-btn--color-teal-darken-1 {
  color: #00897b !important;
  background-color: rgba(0, 137, 123, 0.1) !important;
}

.v-btn.v-btn--variant-tonal.v-btn--color-orange-darken-1 {
  color: #fb8c00 !important;
  background-color: rgba(251, 140, 0, 0.1) !important;
}

.v-checkbox .v-selection-control__wrapper {
  color: var(--v-theme-primary) !important;
}

.map-card {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  z-index: 1;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
}

.coordinates-display {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  pointer-events: none;
}

.map-container > div.flex {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
}

.map-card .text-h6 {
  font-weight: 600;
  color: #1976d2;
}

.form-scroll-area {
  max-height: calc(80vh - 200px);
  overflow-y: auto;
  padding-right: 16px;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease-in-out;
}

.toast-notification.success {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.toast-notification.error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.toast-message {
  font-size: 0.9rem;
}
</style>

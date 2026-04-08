```vue
<template>
  <div>
    <!-- Toast Notifications -->
    <ToastNotification
      v-if="showSuccessAlert"
      :show="showSuccessAlert"
      message="Location updated successfully!"
      type="success"
      @close="showSuccessAlert = false"
    />
    <ToastNotification
      v-if="showErrorAlert"
      :show="showErrorAlert"
      :message="errorMessage"
      type="error"
      @close="showErrorAlert = false"
    />

    <v-form ref="form">
      <v-toolbar density="compact" color="grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn
          style="background-color: #059367"
          color="white"
          @click="handleSave"
          :loading="isSaving"
        >
          SAVE
        </v-btn>
      </v-toolbar>
      <div class="content-wrapper">
        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <v-row>
              <!-- Location Name -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.locdetail.locationName"
                  label="Branch Name *"
                  variant="outlined"
                  density="comfortable"
                  :rules="locationNameRules"
                  :error-messages="locationNameError"
                  required
                  @input="handleLocationNameInput"
                ></v-text-field>
              </v-col>

              <!-- State -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.state"
                  :items="stateOptions"
                  label="State *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || 'State is required']"
                  @change="updateState"
                ></v-select>
              </v-col>

              <!-- Multiple Pincodes with Index Display -->
              <v-col cols="12" sm="6">
                <!-- Display Existing Pincodes with Index -->
                <v-card
                  class="pa-3 mb-3"
                  elevation="1"
                  v-if="
                    formData.locdetail.pincodes &&
                    formData.locdetail.pincodes.length > 0
                  "
                >
                  <v-card-title class="text-subtitle-2 pa-0 mb-2">
                    <v-icon class="mr-2" color="primary" size="small"
                      >mdi-map-marker-multiple</v-icon
                    >
                    Current Pincodes ({{ formData.locdetail.pincodes.length }})
                  </v-card-title>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="(pincode, index) in formData.locdetail.pincodes"
                      :key="index"
                      color="primary"
                      variant="flat"
                      size="small"
                      closable
                      @click:close="removePincode(index)"
                    >
                      <v-icon start size="small"
                        >mdi-numeric-{{ index }}-circle</v-icon
                      >
                      Index {{ index }}: {{ pincode }}
                    </v-chip>
                  </div>
                </v-card>

                <!-- Manual Pincode Input -->
                <v-text-field
                  v-model="newPincode"
                  :label="`Add New Pincode (Index ${formData.locdetail.pincodes ? formData.locdetail.pincodes.length : 0})`"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  maxlength="6"
                  @keyup.enter="addPincode"
                  append-inner-icon="mdi-plus"
                  @click:append-inner="addPincode"
                  :hint="`Enter 6-digit pincode. Will be stored at index ${formData.locdetail.pincodes ? formData.locdetail.pincodes.length : 0}`"
                  persistent-hint
                  :rules="newPincodeRules"
                ></v-text-field>

                <!-- Validation Display -->
                <v-alert
                  v-if="pincodeValidationMessage"
                  :type="pincodeValidationType"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  {{ pincodeValidationMessage }}
                </v-alert>

                <!-- Legacy Pincode Display (if exists) -->
                <v-alert
                  v-if="
                    formData.locdetail.pincode && !formData.locdetail.pincodes
                  "
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  <div class="d-flex align-center justify-space-between">
                    <span
                      >Legacy Pincode: {{ formData.locdetail.pincode }}</span
                    >
                    <v-btn
                      size="small"
                      color="primary"
                      variant="text"
                      @click="migrateLegacyPincode"
                    >
                      Convert to Array
                    </v-btn>
                  </div>
                </v-alert>
              </v-col>

              <!-- Map Container with Search -->
              <v-col cols="12">
                <v-card class="map-card" elevation="2">
                  <v-card-title class="pa-3 pb-2">
                    <v-icon class="mr-2" color="blue">mdi-map-marker</v-icon>
                    <span class="text-h6">Location Selection</span>
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <!-- Search Bar -->
                    <div class="search-container mb-3">
                      <v-text-field
                        v-model="searchQuery"
                        label="Search location..."
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-magnify"
                        clearable
                        @click:clear="clearSearch"
                        :loading="searchLoading"
                      ></v-text-field>
                      <!-- Search Results -->
                      <v-list
                        v-if="searchResults.length > 0"
                        class="search-results"
                        elevation="4"
                      >
                        <v-list-item
                          v-for="(result, index) in searchResults"
                          :key="index"
                          @click="selectSearchResult(result)"
                          class="search-result-item"
                        >
                          <v-list-item-title>{{
                            result.description
                          }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>
                    <!-- Map Container -->
                    <div class="map-wrapper">
                      <div id="map" class="map-container"></div>
                      <!-- Coordinates Display -->
                      <div class="coordinates-display">
                        <v-chip
                          v-if="formData.locmark.lat && formData.locmark.lng"
                          color="primary"
                          variant="elevated"
                          size="small"
                        >
                          <v-icon start>mdi-crosshairs-gps</v-icon>
                          {{ parseFloat(formData.locmark.lat).toFixed(6) }},
                          {{ parseFloat(formData.locmark.lng).toFixed(6) }}
                        </v-chip>
                      </div>
                    </div>
                    <div class="text-caption mt-2 text-grey-darken-1">
                      <v-icon size="small" class="mr-1">mdi-information</v-icon>
                      Click on the map to select location or use the search
                      above
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Address Display -->
              <v-col cols="12">
                <v-textarea
                  v-model="formData.locdetail.address"
                  label="Selected Address"
                  variant="outlined"
                  rows="3"
                  readonly
                  auto-grow
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </div>

      <!-- Loading Overlay -->
      <v-overlay v-model="isLoading" class="align-center justify-center">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </v-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
const tenantId = currentUserTenant.getTenantId();

const route = useRoute();
const router = useRouter();
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const form = ref(null);
const originalFormData = ref(null);
const locationNameError = ref("");
const locationNameTimeout = ref(null);
const isSaving = ref(false);
const isLoading = ref(false);
const token = authService.getToken();

// Search related
const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const searchDebounceTimeout = ref(null);

// Pincode related
const newPincode = ref("");
const pincodeValidationMessage = ref("");
const pincodeValidationType = ref("info");

// State options
const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Form data
const formData = ref({
  id: null,
  status: "active",
  sort: null,
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  orgLocation: null,
  state: null,
  empIds: null,
  tenant: null,
  locSize: "",
  locType: "branch",
  locdetail: {
    locationName: "",
    pincode: "", // Legacy single pincode
    pincodes: [], // New multiple pincodes array
    address: "",
  },
  locmark: {
    lat: null,
    lng: null,
  },
  workingRange: 5,
});

// Computed property for radius in meters
const radiusInMeters = computed(() => {
  return formData.value.workingRange * 1000;
});

// Computed property for data preview
const previewPayload = computed(() => {
  if (!formData.value.locmark.lat || !formData.value.locmark.lng) return {};

  return {
    locdetail: {
      locationName: formData.value.locdetail.locationName,
      pincodes: formData.value.locdetail.pincodes || [],
      address: formData.value.locdetail.address,
    },
    locType: formData.value.locType,
    locSize: formData.value.locSize,
    locmark: {
      type: "Point",
      coordinates: [
        parseFloat(formData.value.locmark.lng),
        parseFloat(formData.value.locmark.lat),
      ],
    },
    orgLocation: formData.value.orgLocation,
    status: formData.value.status,
    qrDetails: `${tenantId}|${formData.value.locmark.lng}|${formData.value.locmark.lat}`,
  };
});

// Validation rules
const locationNameRules = [
  (v) => !!v || "Location name is required",
  (v) => (v && v.length >= 3) || "Location name must be at least 3 characters",
  () => !locationNameError.value || locationNameError.value,
];

const newPincodeRules = [
  (v) => !v || /^\d{6}$/.test(v) || "Pincode must be exactly 6 digits",
];

const pincodeRules = computed(() => {
  return [
    (v) => (v && v.length > 0) || "At least one pincode is required",
    (v) =>
      !v ||
      v.every((pincode) => /^\d{6}$/.test(pincode)) ||
      "All pincodes must be 6 digits",
  ];
});

// Map variables
let map = null;
let marker = null;
let autocompleteService = null;
let placesService = null;
let geocoder = null;
const apiKey = `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

// Auto-close toast notifications
watch(showSuccessAlert, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showSuccessAlert.value = false;
    }, 2000); // Matches v-snackbar timeout for success
  }
});

watch(showErrorAlert, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showErrorAlert.value = false;
    }, 3000); // Matches v-snackbar timeout for error
  }
});

// ==================== PINCODE FUNCTIONALITY ====================
const addPincode = () => {
  if (!newPincode.value) {
    pincodeValidationMessage.value = "Please enter a pincode";
    pincodeValidationType.value = "warning";
    return;
  }

  if (!/^\d{6}$/.test(newPincode.value)) {
    pincodeValidationMessage.value = "Please enter a valid 6-digit pincode";
    pincodeValidationType.value = "error";
    return;
  }

  if (!formData.value.locdetail.pincodes) {
    formData.value.locdetail.pincodes = [];
  }

  if (formData.value.locdetail.pincodes.includes(newPincode.value)) {
    pincodeValidationMessage.value = "Pincode already exists";
    pincodeValidationType.value = "warning";
    return;
  }

  const newIndex = formData.value.locdetail.pincodes.length;
  formData.value.locdetail.pincodes.push(newPincode.value);
  newPincode.value = "";

  pincodeValidationMessage.value = `Pincode added successfully at index ${newIndex}`;
  pincodeValidationType.value = "success";

  setTimeout(() => {
    pincodeValidationMessage.value = "";
  }, 3000);

  console.log(
    "Updated pincodes:",
    JSON.stringify(formData.value.locdetail.pincodes, null, 2),
  );
};

const removePincode = (index) => {
  if (!formData.value.locdetail.pincodes) return;

  const removedPincode = formData.value.locdetail.pincodes[index];
  formData.value.locdetail.pincodes.splice(index, 1);

  pincodeValidationMessage.value = `Pincode ${removedPincode} removed from index ${index}`;
  pincodeValidationType.value = "info";

  setTimeout(() => {
    pincodeValidationMessage.value = "";
  }, 3000);

  console.log(
    "Updated pincodes after removal:",
    JSON.stringify(formData.value.locdetail.pincodes, null, 2),
  );
};

const migrateLegacyPincode = () => {
  if (
    formData.value.locdetail.pincode &&
    !/^\s*$/.test(formData.value.locdetail.pincode)
  ) {
    if (!formData.value.locdetail.pincodes) {
      formData.value.locdetail.pincodes = [];
    }

    施;

    System: if (
      !formData.value.locdetail.pincodes.includes(
        formData.value.locdetail.pincode,
      )
    ) {
      formData.value.locdetail.pincodes.push(formData.value.locdetail.pincode);
      pincodeValidationMessage.value = `Legacy pincode ${formData.value.locdetail.pincode} converted to array format`;
      pincodeValidationType.value = "success";
      setTimeout(() => {
        pincodeValidationMessage.value = "";
      }, 3000);
    }
    formData.value.locdetail.pincode = "";
  }
};

const extractPincodeFromAddress = (address) => {
  const pincodeRegex = /\b\d{6}\b/g;
  const matches = address.match(pincodeRegex);
  return matches ? matches : [];
};

// API Functions
const fetchLocationData = async (locationId) => {
  try {
    isLoading.value = true;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement/${locationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error("Error fetching location data:", error);
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const updateLocationData = async (locationData) => {
  try {
    isSaving.value = true;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement/${locationData.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update location");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  } finally {
    isSaving.value = false;
  }
};

// Functions
const loadLocationData = async () => {
  const locationId = route.params.id;

  if (!locationId) {
    errorMessage.value = "Location ID not found";
    showErrorAlert.value = true;
    return;
  }

  try {
    const locationData = await fetchLocationData(locationId);
    console.log("Fetched location data:", locationData);

    originalFormData.value = { ...locationData };

    formData.value = {
      id: locationData.id,
      status: locationData.status || "active",
      sort: locationData.sort,
      user_created: locationData.user_created,
      date_created: locationData.date_created,
      user_updated: locationData.user_updated,
      date_updated: locationData.date_updated,
      orgLocation: locationData.orgLocation,
      empIds: locationData.empIds,
      state: locationData.state,
      tenant: locationData.tenant,
      locSize: locationData.locSize || "",
      locType: "branch",
      locdetail: {
        locationName: locationData.locdetail?.locationName || "",
        pincode: locationData.locdetail?.pincode || "",
        pincodes: locationData.locdetail?.pincodes || [],
        address: locationData.locdetail?.address || "",
      },
      locmark: {
        lat: locationData.locmark?.coordinates
          ? locationData.locmark.coordinates[1]
          : null,
        lng: locationData.locmark?.coordinates
          ? locationData.locmark.coordinates[0]
          : null,
      },
      workingRange: 5,
    };

    if (formData.value.locSize) {
      const match = formData.value.locSize.match(/(\d+)/);
      if (match) {
        formData.value.workingRange = parseInt(match[1]);
      }
    }

    if (
      formData.value.locdetail.pincode &&
      (!formData.value.locdetail.pincodes ||
        formData.value.locdetail.pincodes.length === 0)
    ) {
      formData.value.locdetail.pincodes = [formData.value.locdetail.pincode];
      console.log("Auto-migrated legacy pincode to array format");
    }

    console.log("Mapped form data:", formData.value);
    console.log("Extracted coordinates:", {
      lat: formData.value.locmark.lat,
      lng: formData.value.locmark.lng,
    });
    console.log("Available pincodes:", formData.value.locdetail.pincodes);

    nextTick(() => {
      initMap();
    });
  } catch (error) {
    errorMessage.value = error.message || "Failed to load location data";
    showErrorAlert.value = true;
  }
};

const initMap = () => {
  if (map) {
    map = null;
  }

  const lat = parseFloat(formData.value.locmark.lat) || 20.5937;
  const lng = parseFloat(formData.value.locmark.lng) || 78.9629;
  const zoom = formData.value.locmark.lat ? 13 : 5;

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom,
    mapTypeId: "roadmap",
  });

  map.addListener("click", handleMapClick);

  autocompleteService = new google.maps.places.AutocompleteService();
  placesService = new google.maps.places.PlacesService(map);
  geocoder = new google.maps.Geocoder();

  if (formData.value.locmark.lat && formData.value.locmark.lng) {
    marker = new google.maps.Marker({
      position: {
        lat: parseFloat(formData.value.locmark.lat),
        lng: parseFloat(formData.value.locmark.lng),
      },
      map,
    });
  }
};

const validateWorkingRange = () => {
  let value = formData.value.workingRange;
  if (value > 500) formData.value.workingRange = 500;
  if (value < 1) formData.value.workingRange = 1;
  updateLocationSize();
};

const checkLocationNameExists = (locationName) => {
  if (
    !locationName ||
    (originalFormData.value &&
      locationName === originalFormData.value.locdetail?.locationName)
  ) {
    locationNameError.value = "";
    return false;
  }

  locationNameError.value = "";
  return false;
};

const handleLocationNameInput = (event) => {
  const value = event.target.value;
  formData.value.locdetail.locationName = value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if (locationNameTimeout.value) {
    clearTimeout(locationNameTimeout.value);
  }

  locationNameTimeout.value = setTimeout(() => {
    checkLocationNameExists(formData.value.locdetail.locationName);
  }, 500);
};

// Search functionality
const searchLocation = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  try {
    const request = {
      input: searchQuery.value,
      componentRestrictions: { country: "IN" },
      types: ["geocode"],
    };
    const { predictions } =
      await autocompleteService.getPlacePredictions(request);
    searchResults.value = predictions;
  } catch (error) {
    console.error("Search error:", error);
    errorMessage.value = "Failed to search location";
    showErrorAlert.value = true;
  } finally {
    searchLoading.value = false;
  }
};

const selectSearchResult = async (prediction) => {
  placesService.getDetails(
    { placeId: prediction.place_id },
    (place, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        place.geometry
      ) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;
        updateMapAndAddress(lat, lng, address);
      } else {
        console.error("Place details failed:", status);
      }
    },
  );
  searchResults.value = [];
  searchQuery.value = "";
};

const clearSearch = () => {
  searchResults.value = [];
  searchQuery.value = "";
};

async function handleMapClick(e) {
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results[0]) {
      const address = results[0].formatted_address;
      updateMapAndAddress(lat, lng, address);
    } else {
      updateMapAndAddress(lat, lng);
      formData.value.locdetail.address = "Address not found";
      console.error("Geocode failed:", status);
    }
  });
}

async function updateMapAndAddress(lat, lng, address = null) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  formData.value.locmark.lat = lat.toFixed(6);
  formData.value.locmark.lng = lng.toFixed(6);

  if (marker) {
    marker.setPosition({ lat, lng });
  } else {
    marker = new google.maps.Marker({
      position: { lat, lng },
      map,
    });
  }

  map.setCenter({ lat, lng });
  map.setZoom(13);

  if (address) {
    formData.value.locdetail.address = address;

    const extractedPincodes = extractPincodeFromAddress(address);
    if (extractedPincodes.length > 0) {
      if (!formData.value.locdetail.pincodes) {
        formData.value.locdetail.pincodes = [];
      }

      let addedCount = 0;
      extractedPincodes.forEach((pincode) => {
        if (!formData.value.locdetail.pincodes.includes(pincode)) {
          const newIndex = formData.value.locdetail.pincodes.length;
          formData.value.locdetail.pincodes.push(pincode);
          addedCount++;
          console.log(
            `Auto-added pincode ${pincode} from address at index ${newIndex}`,
          );
        }
      });

      if (addedCount > 0) {
        pincodeValidationMessage.value = `Auto-added ${addedCount} pincode(s) from address: ${extractedPincodes.join(", ")}`;
        pincodeValidationType.value = "success";

        setTimeout(() => {
          pincodeValidationMessage.value = "";
        }, 4000);

        console.log(
          "Current pincodes:",
          JSON.stringify(formData.value.locdetail.pincodes, null, 2),
        );
      }
    }
  }
}

const encodeToBase64 = (string) => {
  if (typeof string !== "string") {
    throw new Error("Input must be a string");
  }
  return btoa(string); // Encodes the string to base64
};

const handleSave = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    errorMessage.value = "Please fill all required fields correctly";
    showErrorAlert.value = true;
    return;
  }

  const locationExists = checkLocationNameExists(
    formData.value.locdetail.locationName,
  );
  if (locationExists) {
    errorMessage.value = "Location name already exists";
    showErrorAlert.value = true;
    return;
  }

  if (!formData.value.locmark.lat || !formData.value.locmark.lng) {
    errorMessage.value = "Please select a location on the map";
    showErrorAlert.value = true;
    return;
  }

  if (
    !formData.value.locdetail.pincodes ||
    formData.value.locdetail.pincodes.length === 0
  ) {
    errorMessage.value = "Please add at least one pincode for branch location";
    showErrorAlert.value = true;
    return;
  }

  try {
    // Construct the original qrDetails string
    const originalQrDetails = `${tenantId}|${formData.value.locmark.lng}|${formData.value.locmark.lat}`;

    // Encode it to base64 using the helper function
    const encodedQrDetails = encodeToBase64(originalQrDetails);

    const updateData = {
      id: formData.value.id,
      status: formData.value.status,
      sort: formData.value.sort,
      user_created: formData.value.user_created,
      date_created: formData.value.date_created,
      date_updated: new Date().toISOString(),
      orgLocation: formData.value.orgLocation,
      state: formData.value.state,
      empIds: formData.value.empIds,
      tenant: formData.value.tenant,
      locSize: formData.value.locSize,
      locType: formData.value.locType,
      locdetail: {
        locationName: formData.value.locdetail.locationName,
        pincodes: formData.value.locdetail.pincodes || [],
        address: formData.value.locdetail.address,
      },
      locmark: {
        type: "Point",
        coordinates: [
          parseFloat(formData.value.locmark.lng),
          parseFloat(formData.value.locmark.lat),
        ],
      },
      workingRange: formData.value.workingRange,
      qrDetails: encodedQrDetails, // Use the base64-encoded version
    };

    console.log("Update payload:", JSON.stringify(updateData, null, 2));

    await updateLocationData(updateData);

    showSuccessAlert.value = true;
    setTimeout(() => {
      router.push({ name: "branch-configuration" });
    }, 500);
  } catch (error) {
    errorMessage.value = error.message || "Failed to update location";
    showErrorAlert.value = true;
  }
};

// Watchers
watch(searchQuery, (newQuery) => {
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value);
  }
  if (newQuery.length > 2) {
    searchDebounceTimeout.value = setTimeout(() => {
      searchLocation();
    }, 300);
  } else {
    searchResults.value = [];
  }
});

// Lifecycle hooks
const loadGoogleMaps = () => {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = async () => {
    await loadLocationData();
  };
  document.head.appendChild(script);
};

onMounted(() => {
  loadGoogleMaps();
});

onUnmounted(() => {
  if (map) {
    map = null;
  }
  if (locationNameTimeout.value) {
    clearTimeout(locationNameTimeout.value);
  }
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value);
  }
});
</script>

<style scoped>
.content-area {
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
  background-color: white;
  padding: 8px;
}

.v-row {
  margin-top: 1rem;
}

.map-card {
  border-radius: 12px;
  overflow: visible;
}

.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.map-wrapper {
  position: relative;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  z-index: 1;
}

.coordinates-display {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  pointer-events: none;
}

.text-h6 {
  font-weight: 600;
  color: #1976d2;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.v-col {
  padding: 8px 12px;
}

.v-label--active {
  color: #1976d2 !important;
}

:deep(.v-chip) {
  margin: 2px;
}

/* Position the toast notifications at the top */
.toast-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 8px;
  }

  .content-area {
    padding: 8px;
  }

  .map-container {
    height: 300px;
  }
}
</style>
```

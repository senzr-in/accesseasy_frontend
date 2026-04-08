<template>
  <div>
    <ToastNotification
      v-if="showSuccessAlert"
      :show="showSuccessAlert"
      message="Location added successfully!"
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
        <BaseButton
          color="primary"
          @click="handleSave"
          :loading="isSaving"
          :text="`save`"
        ></BaseButton>
      </v-toolbar>

      <div class="content-wrapper">
        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <v-row>
              <!-- Location Name -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.locationName"
                  label="Branch Name *"
                  variant="outlined"
                  density="comfortable"
                  :rules="locationNameRules"
                  required
                ></v-text-field>
              </v-col>

              <!-- Multiple Pincodes with Index Display -->
              <v-col cols="12" sm="6">
                <v-card
                  class="pa-3 mb-3"
                  elevation="1"
                  v-if="formData.pincodes.length > 0"
                >
                  <v-card-title class="text-subtitle-1 pa-0 mb-2">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                    Added Pincodes ({{ formData.pincodes.length }})
                  </v-card-title>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="(pincode, index) in formData.pincodes"
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
                      {{ pincode }}
                    </v-chip>
                  </div>
                </v-card>

                <!-- Pincode Input with Validation -->
                <v-text-field
                  v-model="newPincode"
                  label="Add New Pincode"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  maxlength="6"
                  @keyup.enter="addPincode"
                  append-inner-icon="mdi-plus"
                  @click:append-inner="addPincode"
                  :rules="[
                    (v) =>
                      !v ||
                      /^\d{6}$/.test(v) ||
                      'Pincode must be exactly 6 digits',
                    (v) =>
                      !formData.pincodes.includes(v) || 'Pincode already added',
                  ]"
                  :hint="`Enter 6-digit pincode (${formData.pincodes.length} added)`"
                  persistent-hint
                ></v-text-field>

                <v-alert
                  v-if="pincodeValidationMessage"
                  :type="pincodeValidationType"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  {{ pincodeValidationMessage }}
                </v-alert>
              </v-col>

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

              <v-col cols="12">
                <v-card class="map-card" elevation="2">
                  <v-card-title class="pa-3 pb-2">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
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
                          v-if="formData.lat && formData.lng"
                          color="primary"
                          variant="elevated"
                          size="small"
                        >
                          <v-icon start>mdi-crosshairs-gps</v-icon>
                          {{ parseFloat(formData.lat).toFixed(6) }},
                          {{ parseFloat(formData.lng).toFixed(6) }}
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
                  v-model="formData.address"
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

      <!-- Toast Notifications -->
    </v-form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";

const tenantId = currentUserTenant.getTenantId();
const router = useRouter();
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const form = ref(null);
const isSaving = ref(false);

// Auto-close toast notifications after a timeout
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

// Search related
const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const searchDebounceTimeout = ref(null);

// Pincode related
const newPincode = ref("");
const pincodeValidationMessage = ref("");
const pincodeValidationType = ref("info");

// ==================== API CONFIGURATION ====================
const token = authService.getToken();
const apiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
};

// Generic API request function
const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
  const config = {
    headers: apiHeaders,
    ...options,
  };
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// ==================== FORM DATA & VALIDATION ====================
// Form data
const formData = ref({
  locationName: "",
  locationType: "branch",
  pincodes: [],
  radiusKm: 5,
  lat: null,
  lng: null,
  address: "",
  state: null,
});

// Computed property for radius in meters
const radiusInMeters = computed(() => {
  return formData.value.radiusKm * 1000;
});

// Computed property for data preview with proper JSON format
const previewPayload = computed(() => {
  if (!formData.value.lat || !formData.value.lng) return {};

  return {
    locdetail: {
      locationName: formData.value.locationName,
      pincodes: formData.value.pincodes,
      address: formData.value.address,
    },
    locType: formData.value.locationType,
    locSize: `${formData.value.radiusKm}`,
    locmark: {
      type: "Point",
      coordinates: [
        parseFloat(formData.value.lng),
        parseFloat(formData.value.lat),
      ],
    },
    status: "draft",
  };
});

// Validation rules
const locationNameRules = [
  (v) => !!v || "Location name is required",
  (v) => (v && v.length >= 3) || "Location name must be at least 3 characters",
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

// ==================== PINCODE FUNCTIONALITY ====================
const validatePincode = (pincode) => {
  if (!pincode)
    return { valid: false, message: "Please enter a pincode", type: "warning" };
  if (!/^\d{6}$/.test(pincode))
    return {
      valid: false,
      message: "Pincode must be exactly 6 digits",
      type: "error",
    };
  if (formData.value.pincodes.includes(pincode))
    return { valid: false, message: "Pincode already exists", type: "warning" };
  return { valid: true, message: "Pincode is valid", type: "success" };
};

const addPincode = () => {
  const validation = validatePincode(newPincode.value);
  if (!validation.valid) {
    pincodeValidationMessage.value = validation.message;
    pincodeValidationType.value = validation.type;
    return;
  }

  formData.value.pincodes.push(newPincode.value);
  newPincode.value = "";

  pincodeValidationMessage.value = "Pincode added successfully";
  pincodeValidationType.value = "success";

  setTimeout(() => {
    pincodeValidationMessage.value = "";
  }, 3000);
};

const removePincode = (index) => {
  const removedPincode = formData.value.pincodes[index];
  formData.value.pincodes.splice(index, 1);

  pincodeValidationMessage.value = `Pincode ${removedPincode} removed`;
  pincodeValidationType.value = "info";

  setTimeout(() => {
    pincodeValidationMessage.value = "";
  }, 3000);
};

const extractPincodeFromAddress = (address) => {
  const pincodeRegex = /\b\d{6}\b/g;
  const matches = address.match(pincodeRegex);
  return matches || [];
};

// ==================== MAP FUNCTIONALITY ====================
let map = null;
let marker = null;
let autocompleteService = null;
let placesService = null;
let geocoder = null;
const apiKey = `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

const initMap = () => {
  const lat = parseFloat(formData.value.lat) || 20.5937;
  const lng = parseFloat(formData.value.lng) || 78.9629;
  const zoom = formData.value.lat ? 13 : 5;

  if (map) {
    map = null;
  }

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom,
    mapTypeId: "roadmap",
  });

  map.addListener("click", handleMapClick);

  autocompleteService = new google.maps.places.AutocompleteService();
  placesService = new google.maps.places.PlacesService(map);
  geocoder = new google.maps.Geocoder();

  if (formData.value.lat && formData.value.lng) {
    marker = new google.maps.Marker({
      position: {
        lat: parseFloat(formData.value.lat),
        lng: parseFloat(formData.value.lng),
      },
      map,
    });
  }
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
      formData.value.address = "Address not found";
      console.error("Geocode failed:", status);
    }
  });
}

async function updateMapAndAddress(lat, lng, address = null) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  formData.value.lat = lat.toFixed(6);
  formData.value.lng = lng.toFixed(6);

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
    formData.value.address = address;

    const extractedPincodes = extractPincodeFromAddress(address);
    let addedCount = 0;
    extractedPincodes.forEach((pincode) => {
      if (!formData.value.pincodes.includes(pincode)) {
        formData.value.pincodes.push(pincode);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      pincodeValidationMessage.value = `Added ${addedCount} new pincode(s) from address`;
      pincodeValidationType.value = "success";
    } else if (extractedPincodes.length > 0) {
      pincodeValidationMessage.value =
        "All pincodes from address already added";
      pincodeValidationType.value = "info";
    } else {
      pincodeValidationMessage.value = "No pincode found in address";
      pincodeValidationType.value = "info";
    }

    setTimeout(() => {
      pincodeValidationMessage.value = "";
    }, 3000);
  }
}

// ==================== SEARCH FUNCTIONALITY ====================
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

// ==================== FORM HANDLERS ====================
// Save Location
const saveLocationToApi = async (locationData) => {
  try {
    console.log(
      "Saving location with data:",
      JSON.stringify(locationData, null, 2),
    );
    const result = await makeApiRequest("/items/locationManagement", {
      method: "POST",
      body: JSON.stringify(locationData),
    });

    console.log("Location saved successfully:", result);
    return result;
  } catch (error) {
    console.error("Error saving location:", error);
    throw error;
  }
};
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

  if (!formData.value.lat || !formData.value.lng) {
    errorMessage.value = "Please select a location on the map";
    showErrorAlert.value = true;
    return;
  }

  if (formData.value.pincodes.length === 0) {
    errorMessage.value = "Please add at least one pincode";
    showErrorAlert.value = true;
    return;
  }

  const invalidPincodes = formData.value.pincodes.filter(
    (p) => !/^\d{6}$/.test(p),
  );
  if (invalidPincodes.length > 0) {
    errorMessage.value = `Invalid pincodes found: ${invalidPincodes.join(", ")}`;
    showErrorAlert.value = true;
    return;
  }

  isSaving.value = true;
  try {
    // First, construct the original qrDetails string
    const originalQrDetails = `${tenantId}|${formData.value.lng}|${formData.value.lat}`;

    // Encode it to base64 using the helper function
    const encodedQrDetails = encodeToBase64(originalQrDetails);

    const locationPayload = {
      locdetail: {
        locationName: formData.value.locationName,
        pincodes: [...new Set(formData.value.pincodes)],
        address: formData.value.address,
      },
      state: formData.value.state,
      locType: "branch",
      locSize: formData.value.radiusKm.toString(),
      locmark: {
        type: "Point",
        coordinates: [
          parseFloat(formData.value.lng),
          parseFloat(formData.value.lat),
        ],
      },
      status: "active",
      tenant: tenantId,
      qrDetails: encodedQrDetails, // Use the base64-encoded version
    };

    console.log("Final payload:", JSON.stringify(locationPayload, null, 2));

    const result = await saveLocationToApi(locationPayload);
    console.log("API response:", result);

    showSuccessAlert.value = true;
  } catch (error) {
    errorMessage.value =
      error.message || "Failed to add location. Please try again.";
    showErrorAlert.value = true;
  } finally {
    isSaving.value = false;
  }
};

// ==================== LIFECYCLE HOOKS ====================
const loadGoogleMaps = () => {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    nextTick(() => {
      initMap();
    });
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
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value);
  }
});
</script>

<style scoped>
.content-wrapper {
  height: calc(100vh - 64px);
  padding: 16px;
}

.content-area {
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
  background-color: white;
  padding: 16px;
}

.v-row {
  margin-top: 1rem;
}
.toast-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
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

:deep(.v-combobox .v-field__input) {
  min-height: 40px;
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

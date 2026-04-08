<template>
  <div class="edit-site-container">
    <!-- Main Form Heading -->
    <h1 class="text-h4 mb-6">Edit Site</h1>

    <v-form ref="form">
      <!-- Header -->
      <v-toolbar flat color="white" class="mb-4" elevation="1">
        <v-btn icon @click="handleClose">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>Edit Site</v-toolbar-title>
        <v-spacer></v-spacer>
        <BaseButton
          variant="danger"
          @click="handleClose"
          :text="'Cancel'"
          class="mr-2"
        />
        <BaseButton
          variant="primary"
          :loading="isSaving"
          @click="handleSave"
          :text="'Update'"
          class="mr-2"
        />
      </v-toolbar>

      <div class="form-container pa-4">
        <v-row>
          <!-- Left Column: Form Fields -->
          <v-col cols="12" md="6">
            <v-card flat class="pa-4" elevation="2">
              <v-card-title class="text-h6 pa-0 mb-4" style="color: #059367"
                >Site Details</v-card-title
              >
              <!-- Organization Selection (Mandatory) -->
              <v-select
                v-model="formData.orgLocation"
                :items="organizationOptions"
                label="Client *"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'Client is required']"
                :loading="organizationsLoading"
                required
              >
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <span class="mr-2">{{ getOrgName(item.value) }}</span>
                    <v-chip
                      :color="getOrgTypeColor(item.value)"
                      size="small"
                      variant="flat"
                    >
                      {{ getOrgType(item.value) }}
                    </v-chip>
                  </div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:append>
                      <v-chip
                        :color="getOrgTypeColor(item.value)"
                        size="small"
                        variant="flat"
                      >
                        {{ getOrgType(item.value) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              <!-- Site Name (Mandatory) -->
              <v-text-field
                v-model="formData.locationName"
                label="Site Name *"
                variant="outlined"
                density="comfortable"
                :rules="locationNameRules"
                class="mt-4"
                required
              ></v-text-field>
              <!-- Contact Person (Optional) -->
              <v-text-field
                v-model="formData.contactPerson"
                label="Contact Person"
                variant="outlined"
                density="comfortable"
                :rules="contactPersonRules"
                class="mt-4"
              ></v-text-field>
              <!-- Contact Number (Optional) -->
              <v-text-field
                v-model="formData.contactNumber"
                label="Contact Number"
                variant="outlined"
                density="comfortable"
                type="tel"
                :rules="contactNumberRules"
                class="mt-4"
                maxlength="10"
              ></v-text-field>
            </v-card>
          </v-col>
          <!-- Right Column: Pincode, Radius, Address, and Map -->
          <v-col cols="12" md="6">
            <v-card flat class="pa-4" elevation="2">
              <v-card-title class="text-h6 pa-0 mb-4" style="color: #059367"
                >Location Details</v-card-title
              >
              <!-- Address (Mandatory) -->
              <v-textarea
                v-model="formData.address"
                label="Address *"
                variant="outlined"
                rows="3"
                auto-grow
                class="mb-4"
                :rules="addressRules"
                required
              ></v-textarea>
              <!-- Pincode (Optional) -->
              <v-text-field
                v-model="formData.pincodes[0]"
                label="Pincode"
                variant="outlined"
                density="comfortable"
                type="number"
                maxlength="6"
                :rules="pincodeRules"
                class="mb-4"
                @input="validateSinglePincode"
              ></v-text-field>
              <!-- Radius -->
              <v-slider
                v-model="formData.radiusM"
                label="Radius (m)"
                min="50"
                max="5000"
                step="10"
                thumb-label="always"
                :rules="radiusRules"
                color="#059367"
                class="mb-2"
              ></v-slider>
              <div class="text-caption text-grey-darken-1 mb-4">
                Selected: {{ formData.radiusM }} meters
              </div>
              <!-- New BaseButton for Resetting Map Coordinates -->
              <!-- <BaseButton
                variant="secondary"
                @click="resetMapCoordinates"
                :text="'Reset Map'"
                class="mb-4"
              /> -->
            </v-card>
          </v-col>
        </v-row>
        <v-card flat class="mt-4" elevation="2">
          <v-card-title class="text-h6 pa-4" style="color: #059367">
            <v-icon class="mr-2" color="#059367">mdi-map-marker</v-icon>
            Location
          </v-card-title>
          <v-card-text>
            <v-text-field
              id="search-input"
              v-model="searchQuery"
              label="Search location..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              @click:clear="clearSearch"
              :loading="searchLoading"
              class="mb-2"
            ></v-text-field>
            <v-list
              v-if="searchResults.length > 0"
              class="search-results"
              elevation="2"
            >
              <v-list-item
                v-for="(result, index) in searchResults"
                :key="index"
                @click="selectSearchResult(result)"
                class="search-result-item"
              >
                <v-list-item-title>{{ result.description }}</v-list-item-title>
              </v-list-item>
            </v-list>
            <div class="map-wrapper">
              <div id="map" class="map-container"></div>
              <div class="coordinates-display">
                <v-chip
                  v-if="formData.lat && formData.lng"
                  color="primary"
                  size="small"
                >
                  <v-icon start>mdi-crosshairs-gps</v-icon>
                  {{ parseFloat(formData.lat).toFixed(6) }},
                  {{ parseFloat(formData.lng).toFixed(6) }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <!-- Alerts -->
        <v-snackbar
          v-model="showSuccessAlert"
          color="success"
          timeout="2000"
          location="top"
        >
          Location updated successfully!
        </v-snackbar>
        <v-snackbar
          v-model="showErrorAlert"
          color="error"
          timeout="3000"
          location="top"
        >
          {{ errorMessage }}
          <template v-slot:actions>
            <v-btn color="white" variant="text" @click="showErrorAlert = false">
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Loader } from "@googlemaps/js-api-loader";

const props = defineProps({ locationId: [String, Number], default: null });

const emit = defineEmits(["close", "update"]);
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
const tenantId = currentUserTenant.getTenantId();
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const form = ref(null);
const isSaving = ref(false);
const organizationsLoading = ref(false);
const mapLoaded = ref(false);

// Search related
const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);

// Pincode related
const pincodeValidationMessage = ref("");
const pincodeValidationType = ref("info");

// Organizations data
const organizations = ref([]);
const organizationOptions = ref([]);

// API CONFIGURATION
const token = authService.getToken();
const apiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
};

// FORM DATA & VALIDATION
const formData = ref({
  id: null,
  locationName: "",
  contactPerson: "",
  contactNumber: "",
  orgLocation: "",
  pincodes: [""],
  radiusM: 200,
  lat: null,
  lng: null,
  address: "",
  status: "active",
  tenant: tenantId,
  locationId: props.locationId || null,
});

// Validation rules
const locationNameRules = [
  (v) => !!v || "Location name is required",
  (v) => (v && v.length >= 3) || "Location name must be at least 3 characters",
];

const addressRules = [
  (v) => !!v || "Address is required",
  (v) => (v && v.length >= 5) || "Address must be at least 5 characters",
];

const contactPersonRules = [
  (v) => !v || v.length >= 2 || "Contact person must be at least 2 characters",
];

const contactNumberRules = [
  (v) => !v || /^\d{10}$/.test(v) || "Contact number must be exactly 10 digits",
];

const pincodeRules = [
  (v) => !v || /^\d{6}$/.test(v) || "Pincode must be exactly 6 digits",
];

const radiusRules = [
  (v) =>
    !v || (v >= 10 && v <= 5000) || "Radius must be between 10-5000 meters",
];

// Helper functions for organization dropdown
const getOrgName = (orgId) => {
  const org = organizations.value.find((o) => o.id === orgId);
  return org ? org.orgName : "";
};

const getOrgType = (orgId) => {
  const org = organizations.value.find((o) => o.id === orgId);
  if (!org || !org.orgType) return "";
  const orgType = org.orgType.toLowerCase();
  if (orgType.includes("client")) return "clients-company";
  if (orgType.includes("contact")) return "individuals";
  if (orgType.includes("maintenant")) return "MainOrg";
  return "";
};

const getOrgTypeColor = (orgId) => {
  const org = organizations.value.find((o) => o.id === orgId);
  if (!org || !org.orgType) return "grey";
  const orgType = org.orgType.toLowerCase();
  if (orgType.includes("client")) return "transparent";
  if (orgType.includes("contact")) return "transparent";
  if (orgType.includes("maintenant")) return "transparent";
  return "grey";
};

// PINCODE FUNCTIONALITY
const validateSinglePincode = () => {
  if (formData.value.pincodes.length === 0) {
    formData.value.pincodes = [""];
  } else if (formData.value.pincodes.length > 1) {
    formData.value.pincodes = [formData.value.pincodes[0]];
  }
};

const extractPincodeFromAddress = (address) => {
  const pincodeRegex = /\b\d{6}\b/g;
  const matches = address.match(pincodeRegex);
  return matches || [];
};

// MAP FUNCTIONALITY
let map = null;
let marker = null;
let circle = null;
let searchBox = null;

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const initMap = async () => {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found; cannot initialize map.");
    errorMessage.value = "Map container not ready. Please refresh.";
    showErrorAlert.value = true;
    return;
  }

  const loader = new Loader({
    apiKey,
    version: "weekly",
    libraries: ["places"],
  });

  try {
    const google = await loader.load();
    mapLoaded.value = true;

    const lat = formData.value.lat ? parseFloat(formData.value.lat) : 20.5937;
    const lng = formData.value.lng ? parseFloat(formData.value.lng) : 78.9629;
    const zoom = formData.value.lat && formData.value.lng ? 13 : 5;

    console.log("Initializing map with:", { lat, lng, zoom });

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom,
      mapTypeId: "roadmap",
    });

    // Initialize SearchBox
    const searchInput = document.getElementById("search-input");
    if (!searchInput) {
      console.error("Search input element not found");
      // errorMessage.value = "Search input not found";
      // showErrorAlert.value = true;
      return;
    }
    searchBox = new google.maps.places.SearchBox(searchInput);

    // Bias the SearchBox results towards current map's viewport
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });

    // Listen for search results
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) {
        console.log("No places found");
        return;
      }

      const place = places[0];
      if (!place.geometry || !place.geometry.location) {
        console.log("No geometry available for place");
        return;
      }

      // Clear previous marker and circle
      if (marker) marker.setMap(null);
      if (circle) circle.setMap(null);

      // Add new marker
      marker = new google.maps.Marker({
        map,
        title: place.name,
        position: place.geometry.location,
        draggable: true,
      });

      // Update form data
      formData.value.lat = place.geometry.location.lat().toFixed(6);
      formData.value.lng = place.geometry.location.lng().toFixed(6);
      formData.value.address = place.formatted_address || "";

      // Update pincode
      const extractedPincodes = extractPincodeFromAddress(
        place.formatted_address,
      );
      if (extractedPincodes.length > 0) {
        formData.value.pincodes = [extractedPincodes[0]];
        pincodeValidationMessage.value = `Pincode updated from address: ${extractedPincodes[0]}`;
        pincodeValidationType.value = "success";
        setTimeout(() => {
          pincodeValidationMessage.value = "";
        }, 3000);
      } else {
        formData.value.pincodes = [""];
      }

      // Update circle
      updateCircle();

      // Adjust map bounds
      const bounds = new google.maps.LatLngBounds();
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
      map.fitBounds(bounds);

      // Handle marker drag
      marker.addListener("dragend", (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        updateMapAndAddress(newLat, newLng);
      });
    });

    // Handle map click
    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updateMapAndAddress(lat, lng);
    });

    // Initialize marker and circle if coordinates exist
    if (formData.value.lat && formData.value.lng) {
      addMarker(parseFloat(formData.value.lat), parseFloat(formData.value.lng));
      updateCircle();
    }

    google.maps.event.trigger(map, "resize");
  } catch (error) {
    console.error("Failed to load Google Maps API:", error);
    errorMessage.value = "Failed to load maps. Please refresh the page.";
    showErrorAlert.value = true;
  }
};

const addMarker = (lat, lng) => {
  if (!map) {
    console.error("Cannot add marker: map is not initialized");
    return;
  }

  if (marker) {
    marker.setPosition({ lat, lng });
  } else {
    marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
    });

    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      updateMapAndAddress(newLat, newLng);
    });
  }
};

const updateCircle = () => {
  if (!map) {
    console.error("Cannot update circle: map is not initialized");
    return;
  }

  if (circle) {
    circle.setMap(null);
  }

  if (formData.value.lat && formData.value.lng) {
    circle = new google.maps.Circle({
      map: map,
      center: {
        lat: parseFloat(formData.value.lat),
        lng: parseFloat(formData.value.lng),
      },
      radius: parseFloat(formData.value.radiusM),
      strokeColor: "#059367",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#c6e4dc",
      fillOpacity: 0.35,
    });
  }
};

const updateMapAndAddress = (lat, lng, address = null) => {
  if (lat !== null && lng !== null) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    formData.value.lat = lat.toFixed(6);
    formData.value.lng = lng.toFixed(6);

    addMarker(lat, lng);
    updateCircle();

    if (map) {
      map.setCenter({ lat, lng });
      map.setZoom(13);
    }
  }

  if (address) {
    formData.value.address = address;
    const extractedPincodes = extractPincodeFromAddress(address);
    if (extractedPincodes.length > 0) {
      formData.value.pincodes = [extractedPincodes[0]];
      pincodeValidationMessage.value = `Pincode updated from address: ${extractedPincodes[0]}`;
      pincodeValidationType.value = "success";
      setTimeout(() => {
        pincodeValidationMessage.value = "";
      }, 3000);
    } else {
      formData.value.pincodes = [""];
    }
  }
};

// FORM HANDLERS
const handleClose = () => {
  emit("close");
};

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    organizationsLoading.value = true;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        method: "GET",
        headers: apiHeaders,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch organizations");
    }

    const result = await response.json();
    organizations.value = result.data || [];

    const filteredOrganizations = organizations.value.filter(
      (org) =>
        org.orgType &&
        ["clientorg", "contact", "maintenant"].includes(
          org.orgType.toLowerCase(),
        ),
    );

    organizationOptions.value = filteredOrganizations.map((org) => ({
      title: org.orgName,
      value: org.id,
    }));

    const mainTenant = filteredOrganizations.find(
      (org) => org.orgType && org.orgType.toLowerCase() === "clientorg",
    );

    if (mainTenant && !formData.value.orgLocation) {
      formData.value.orgLocation = mainTenant.id;
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    errorMessage.value = "Failed to load organizations";
    showErrorAlert.value = true;
  } finally {
    organizationsLoading.value = false;
  }
};

// Fetch location data
const fetchLocationData = async (locationId) => {
  try {
    const response = await makeApiRequest(
      `/items/locationManagement/${locationId}`,
      { method: "GET" },
    );
    return response.data || response;
  } catch (error) {
    console.error("Error fetching location data:", error);
    throw error;
  }
};

// Update location
const updateLocationToApi = async (locationData) => {
  try {
    const result = await makeApiRequest(
      `/items/locationManagement/${locationData.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(locationData),
      },
    );
    console.log("Location updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

// Load location data
const loadLocationData = async (locationId) => {
  if (!locationId) {
    console.log("No location ID provided - creating new location");
    if (mapLoaded.value) {
      initMap();
    }
    return;
  }

  try {
    const locationData = await fetchLocationData(locationId);
    console.log("Fetched location data:", locationData);

    formData.value = {
      id: locationData.id,
      locationName: locationData.locdetail?.locationName || "",
      contactPerson: locationData.contactDetails?.contactPerson || "",
      contactNumber: locationData.contactDetails?.contactNumber || "",
      orgLocation: locationData.orgLocation || "",
      pincodes:
        Array.isArray(locationData.locdetail?.pincodes) &&
        locationData.locdetail.pincodes.length > 0
          ? [locationData.locdetail.pincodes[0]]
          : [""],
      radiusM: parseInt(locationData.locSize) || 200,
      lat: locationData.locmark?.coordinates
        ? locationData.locmark.coordinates[1]
        : null,
      lng: locationData.locmark?.coordinates
        ? locationData.locmark.coordinates[0]
        : null,
      address: locationData.locdetail?.address || "",
      status: locationData.status || "active",
      tenant: locationData.tenant || tenantId,
    };

    console.log("Form data after loading:", formData.value);

    await nextTick();

    if (mapLoaded.value && map) {
      if (formData.value.lat && formData.value.lng) {
        addMarker(
          parseFloat(formData.value.lat),
          parseFloat(formData.value.lng),
        );
        updateCircle();
        map.setCenter({
          lat: parseFloat(formData.value.lat),
          lng: parseFloat(formData.value.lng),
        });
        map.setZoom(13);
      }
    } else {
      console.warn("Map not ready yet; skipping marker/circle update.");
    }
  } catch (error) {
    console.error("Error loading location:", error);
    errorMessage.value = error.message || "Failed to load location data";
    showErrorAlert.value = true;
  }
};

// Save handler
const handleSave = async () => {
  if (!form.value) {
    console.log("form.value is falsy:", form.value);
    return;
  }

  const { valid } = await form.value.validate();
  if (!valid) {
    errorMessage.value =
      "Please fill all required fields correctly (Site Name, Client, and Address)";
    showErrorAlert.value = true;
    return;
  }

  if (
    !formData.value.locationName ||
    !formData.value.orgLocation ||
    !formData.value.address
  ) {
    errorMessage.value = "Site Name, Client, and Address are required";
    showErrorAlert.value = true;
    return;
  }

  isSaving.value = true;
  try {
    const locationPayload = {
      locdetail: {
        locationName: formData.value.locationName,
        pincodes: formData.value.pincodes[0]
          ? [formData.value.pincodes[0]]
          : [],
        address: formData.value.address,
      },
      locSize: formData.value.radiusM
        ? formData.value.radiusM.toString()
        : "200",
      locmark:
        formData.value.lat && formData.value.lng
          ? {
              type: "Point",
              coordinates: [
                parseFloat(formData.value.lng) || 0,
                parseFloat(formData.value.lat) || 0,
              ],
            }
          : null,
      orgLocation: formData.value.orgLocation,
      status: formData.value.status,
      tenant: formData.value.tenant,
      qrDetails:
        formData.value.lat && formData.value.lng
          ? `${tenantId}|${formData.value.lng}|${formData.value.lat}`
          : null,
      contactDetails: {
        contactPerson: formData.value.contactPerson || "",
        contactNumber: formData.value.contactNumber || "",
      },
    };

    let result;
    if (formData.value.id) {
      locationPayload.id = formData.value.id;
      result = await updateLocationToApi(locationPayload);
    } else {
      result = await makeApiRequest("/items/locationManagement", {
        method: "POST",
        body: JSON.stringify(locationPayload),
      });
    }

    showSuccessAlert.value = true;
    emit("update", result);
    setTimeout(() => {
      showSuccessAlert.value = false;
      emit("close");
    }, 2000);
  } catch (error) {
    errorMessage.value =
      error.message || "Failed to update location. Please try again.";
    showErrorAlert.value = true;
  } finally {
    isSaving.value = false;
  }
};

// LIFECYCLE HOOKS
const loadGoogleMaps = async () => {
  console.log("Starting Google Maps load");
  try {
    await initMap();
    console.log("Map initialized successfully");
    await fetchOrganizations();
    if (props.locationId) {
      await loadLocationData(props.locationId);
    }
  } catch (error) {
    console.error("Error in loadGoogleMaps:", error);
    errorMessage.value = "Failed to load maps.";
    showErrorAlert.value = true;
  }
};

onMounted(() => {
  console.log("EditSite component mounted");
  if (props.locationId) {
    console.log("Initial locationId found on mount:", props.locationId);
  }
  loadGoogleMaps();
});

onUnmounted(() => {
  if (marker) {
    marker.setMap(null);
    marker = null;
  }
  if (circle) {
    circle.setMap(null);
    circle = null;
  }
  if (map) {
    google.maps.event.clearInstanceListeners(map);
    map = null;
  }
  searchBox = null;
});

watch(
  () => formData.value.radiusM,
  () => {
    nextTick(() => {
      updateCircle();
    });
  },
  { immediate: false },
);

watch(
  () => props.locationId,
  (newId) => {
    console.log("EditSite: locationId changed to", newId);
    if (newId) {
      loadLocationData(newId);
    }
  },
);
</script>

<style scoped>
.edit-site-container {
  width: 100%;
  margin: 0 auto;
}

.form-container {
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.map-wrapper {
  position: relative;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.coordinates-display {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
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

.search-result-item:hover {
  background-color: #f5f5f5;
}

.v-card {
  border-radius: 8px;
}

.v-btn {
  text-transform: none;
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
}
</style>

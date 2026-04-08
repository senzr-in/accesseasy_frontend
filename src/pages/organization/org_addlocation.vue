<template>
  <div class="add-site-container">
    <!-- Main Form Heading -->
    <h1 class="text-h4 mb-6">Add New Site</h1>

    <v-form ref="form">
      <!-- Header -->
      <v-toolbar flat color="white" class="mb-4" elevation="1">
        <v-btn icon @click="handleClose">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>Add Site</v-toolbar-title>
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
          :text="'Save'"
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
                min="10"
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
              label="Search for address..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              @click:clear="clearSearch"
              :loading="searchLoading"
              class="mb-2"
            ></v-text-field>
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
          Location added successfully!
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

const emit = defineEmits(["close", "saved"]);

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

// FORM DATA & VALIDATION
const formData = ref({
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
  if (orgType.includes("client")) return "Client-Company";
  if (orgType.includes("contact")) return "Individual";
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

const apiKey = `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

const initMap = () => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps API not loaded");
    errorMessage.value = "Failed to load Google Maps API";
    showErrorAlert.value = true;
    return;
  }

  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found, retrying...");
    setTimeout(initMap, 100);
    return;
  }

  if (mapElement.offsetHeight === 0 || mapElement.offsetWidth === 0) {
    console.warn("Map container has zero dimensions, retrying...");
    setTimeout(initMap, 100);
    return;
  }

  const lat = formData.value.lat ? parseFloat(formData.value.lat) : 20.5937;
  const lng = formData.value.lng ? parseFloat(formData.value.lng) : 78.9629;
  const zoom = formData.value.lat && formData.value.lng ? 13 : 5;

  if (map) {
    google.maps.event.clearInstanceListeners(map);
  }

  map = new google.maps.Map(mapElement, {
    center: { lat, lng },
    zoom,
    mapTypeId: "roadmap",
  });

  // Initialize SearchBox
  const searchInput = document.getElementById("search-input");
  searchBox = new google.maps.places.SearchBox(searchInput);

  // Bias the SearchBox results towards current map's viewport
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the search to finish
  searchBox.addListener("places_changed", () => {
    searchLoading.value = true;
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      searchLoading.value = false;
      return;
    }

    // Clear the previous marker and circle
    if (marker) {
      marker.setMap(null);
      marker = null;
    }
    if (circle) {
      circle.setMap(null);
      circle = null;
    }

    const place = places[0]; // Use the first place
    if (!place.geometry || !place.geometry.location) {
      console.log("No geometry available for place");
      searchLoading.value = false;
      return;
    }

    // Create a marker for the place
    marker = new google.maps.Marker({
      map,
      title: place.name,
      position: place.geometry.location,
      draggable: true, // Enable dragging
    });

    // Update formData with address and coordinates
    formData.value.address = place.formatted_address || "";
    formData.value.lat = place.geometry.location.lat().toFixed(6);
    formData.value.lng = place.geometry.location.lng().toFixed(6);

    // Extract pincode from address
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
      pincodeValidationMessage.value = "";
      pincodeValidationType.value = "info";
    }

    // Update map bounds
    const bounds = new google.maps.LatLngBounds();
    if (place.geometry.viewport) {
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);

    // Update circle
    updateCircle();

    // Add dragend listener for marker
    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat().toFixed(6);
      const newLng = e.latLng.lng().toFixed(6);
      formData.value.lat = newLat;
      formData.value.lng = newLng;
      updateCircle();
      // Optionally, reverse geocode to update address
      if (window.google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: parseFloat(newLat), lng: parseFloat(newLng) } },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
              formData.value.address = results[0].formatted_address;
              const extractedPincodes = extractPincodeFromAddress(
                results[0].formatted_address,
              );
              if (extractedPincodes.length > 0) {
                formData.value.pincodes = [extractedPincodes[0]];
                pincodeValidationMessage.value = `Pincode updated from address: ${extractedPincodes[0]}`;
                pincodeValidationType.value = "success";
                setTimeout(() => {
                  pincodeValidationMessage.value = "";
                }, 3000);
              } else {
                pincodeValidationMessage.value = "";
                pincodeValidationType.value = "info";
              }
            } else {
              console.error("Geocode failed:", status);
            }
          },
        );
      }
    });

    searchLoading.value = false;
    searchQuery.value = "";
  });

  // Handle map click to place marker
  map.addListener("click", (e) => {
    const lat = e.latLng.lat().toFixed(6);
    const lng = e.latLng.lng().toFixed(6);
    if (marker) {
      marker.setMap(null);
      marker = null;
    }
    marker = new google.maps.Marker({
      map,
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      draggable: true,
    });
    formData.value.lat = lat;
    formData.value.lng = lng;
    map.setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
    map.setZoom(13);
    updateCircle();
    // Reverse geocode to update address
    if (window.google.maps.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: parseFloat(lat), lng: parseFloat(lng) } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results[0]) {
            formData.value.address = results[0].formatted_address;
            const extractedPincodes = extractPincodeFromAddress(
              results[0].formatted_address,
            );
            if (extractedPincodes.length > 0) {
              formData.value.pincodes = [extractedPincodes[0]];
              pincodeValidationMessage.value = `Pincode updated from address: ${extractedPincodes[0]}`;
              pincodeValidationType.value = "success";
              setTimeout(() => {
                pincodeValidationMessage.value = "";
              }, 3000);
            } else {
              pincodeValidationMessage.value = "";
              pincodeValidationType.value = "info";
            }
          } else {
            console.error("Geocode failed:", status);
          }
        },
      );
    }
    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat().toFixed(6);
      const newLng = e.latLng.lng().toFixed(6);
      formData.value.lat = newLat;
      formData.value.lng = newLng;
      updateCircle();
      if (window.google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: parseFloat(newLat), lng: parseFloat(newLng) } },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
              formData.value.address = results[0].formatted_address;
              const extractedPincodes = extractPincodeFromAddress(
                results[0].formatted_address,
              );
              if (extractedPincodes.length > 0) {
                formData.value.pincodes = [extractedPincodes[0]];
                pincodeValidationMessage.value = `Pincode updated from address: ${extractedPincodes[0]}`;
                pincodeValidationType.value = "success";
                setTimeout(() => {
                  pincodeValidationMessage.value = "";
                }, 3000);
              } else {
                pincodeValidationMessage.value = "";
                pincodeValidationType.value = "info";
              }
            } else {
              console.error("Geocode failed:", status);
            }
          },
        );
      }
    });
  });

  if (formData.value.lat && formData.value.lng) {
    marker = new google.maps.Marker({
      map,
      position: {
        lat: parseFloat(formData.value.lat),
        lng: parseFloat(formData.value.lng),
      },
      draggable: true,
    });
    updateCircle();
    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat().toFixed(6);
      const newLng = e.latLng.lng().toFixed(6);
      formData.value.lat = newLat;
      formData.value.lng = newLng;
      updateCircle();
      if (window.google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: parseFloat(newLat), lng: parseFloat(newLng) } },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
              formData.value.address = results[0].formatted_address;
              const extractedPincodes = extractPincodeFromAddress(
                results[0].formatted_address,
              );
              if (extractedPincodes.length > 0) {
                formData.value.pincodes = [extractedPincodes[0]];
                pincodeValidationMessage.value = `Pincode updated from address: ${extractedPincodes[0]}`;
                pincodeValidationType.value = "success";
                setTimeout(() => {
                  pincodeValidationMessage.value = "";
                }, 3000);
              } else {
                pincodeValidationMessage.value = "";
                pincodeValidationType.value = "info";
              }
            } else {
              console.error("Geocode failed:", status);
            }
          },
        );
      }
    });
  }

  google.maps.event.trigger(map, "resize");
};

const updateCircle = () => {
  if (!map) {
    console.error("Cannot update circle: map is not initialized");
    return;
  }

  if (circle) {
    circle.setMap(null);
    circle = null;
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

const clearSearch = () => {
  searchQuery.value = "";
  if (marker) {
    marker.setMap(null);
    marker = null;
  }
  if (circle) {
    circle.setMap(null);
    circle = null;
  }
  formData.value.lat = null;
  formData.value.lng = null;
  formData.value.address = "";
  formData.value.pincodes = [""];
  map.setCenter({ lat: 20.5937, lng: 78.9629 });
  map.setZoom(5);
};

watch(
  () => formData.value.radiusM,
  () => {
    nextTick(() => {
      updateCircle();
    });
  },
);

// FORM HANDLERS
const handleClose = () => {
  emit("close");
};

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    organizationsLoading.value = true;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&limit=-1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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

// Save Location
const saveLocationToApi = async (locationData) => {
  try {
    const result = await makeApiRequest("/items/locationManagement", {
      method: "POST",
      body: JSON.stringify(locationData),
    });
    return result;
  } catch (error) {
    console.error("Error saving location:", error);
    throw error;
  }
};

const handleSave = async () => {
  if (!form.value) return;

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

    const result = await saveLocationToApi(locationPayload);
    showSuccessAlert.value = true;
    emit("saved", result);
    setTimeout(() => {
      showSuccessAlert.value = false;
      emit("close");
    }, 2000);
  } catch (error) {
    errorMessage.value =
      error.message || "Failed to add location. Please try again.";
    showErrorAlert.value = true;
  } finally {
    isSaving.value = false;
  }
};

// LIFECYCLE HOOKS
const loadGoogleMaps = () => {
  if (window.google && window.google.maps && window.google.maps.places) {
    mapLoaded.value = true;
    nextTick(() => {
      fetchOrganizations();
      initMap();
    });
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;

  let loadTimeout = setTimeout(() => {
    console.error("Google Maps loading timeout");
    errorMessage.value = "Maps loading taking too long. Please refresh.";
    showErrorAlert.value = true;
  }, 10000);

  script.onload = () => {
    console.log("Google Maps script loaded successfully");
    if (window.google && window.google.maps && window.google.maps.places) {
      mapLoaded.value = true;
      nextTick(() => {
        fetchOrganizations();
        initMap();
      });
    } else {
      console.error("Google Maps objects not available after load");
      errorMessage.value =
        "Maps API loaded but objects unavailable. Check key/libraries.";
      showErrorAlert.value = true;
    }
  };

  script.onerror = () => {
    clearTimeout(loadTimeout);
    console.error("Failed to load Google Maps API");
    errorMessage.value = "Failed to load maps. Please refresh the page.";
    showErrorAlert.value = true;
  };

  document.head.appendChild(script);
};

onMounted(() => {
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
</script>

<style scoped>
.add-site-container {
  max-width: 1200px;
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

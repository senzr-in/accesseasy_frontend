<template>
  <v-dialog :model-value="show" max-width="900px" persistent>
    <v-card class="location-selector-card" elevation="12">
      <v-card-title class="location-selector-header">
        <v-icon class="header-icon mr-3" size="28">mdi-map-marker</v-icon>
        <span class="header-title">Select Location</span>
      </v-card-title>

      <v-card-text class="location-selector-content">
        <v-alert
          v-if="locationError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
        >
          {{ locationError }}
        </v-alert>

        <v-row>
          <!-- Location Selection Panel -->
          <v-col cols="12" md="5">
            <div class="selection-panel">
              <h3 class="panel-title">
                <v-icon class="mr-2" color="primary"
                  >mdi-format-list-bulleted</v-icon
                >
                Location Types
              </h3>

              <v-select
                :model-value="selectedLocType"
                @update:model-value="$emit('update:selected-loc-type', $event)"
                label="Select Location Type"
                :items="locationTypes"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                clearable
                class="location-select"
                prepend-inner-icon="mdi-map-marker-outline"
              ></v-select>

              <!-- Location Details Card -->
              <v-card
                v-if="displayLocationDetails"
                class="location-details-card"
                variant="tonal"
                color="primary"
              >
                <v-card-title class="details-title">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  Location Details
                </v-card-title>
                <v-card-text class="details-content">
                  <div class="detail-item">
                    <v-icon class="detail-icon">mdi-home</v-icon>
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">
                      {{
                        displayLocationDetails.locdetail?.locationName || "N/A"
                      }}
                    </span>
                  </div>

                  <div class="detail-item">
                    <v-icon class="detail-icon">mdi-map-marker</v-icon>
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">
                      {{ displayLocationDetails.locdetail?.address || "N/A" }}
                    </span>
                  </div>

                  <div class="detail-item">
                    <v-icon class="detail-icon">mdi-mailbox</v-icon>
                    <span class="detail-label">Pincode:</span>
                    <span class="detail-value">
                      {{
                        displayLocationDetails.locdetail?.pincodes?.[0] || "N/A"
                      }}
                    </span>
                  </div>

                  <div class="detail-item">
                    <v-icon class="detail-icon">mdi-resize</v-icon>
                    <span class="detail-label">Size:</span>
                    <span class="detail-value">
                      {{ displayLocationDetails.locSize || "N/A" }}
                    </span>
                  </div>

                  <div class="detail-item">
                    <v-icon class="detail-icon">mdi-crosshairs-gps</v-icon>
                    <span class="detail-label">Coordinates:</span>
                    <span class="detail-value">
                      {{
                        displayLocationDetails.locmark?.lat?.toFixed(4) ||
                        "N/A"
                      }},
                      {{
                        displayLocationDetails.locmark?.lng?.toFixed(4) || "N/A"
                      }}
                    </span>
                  </div>

                  <div v-if="reverseGeocodedAddress" class="detail-item">
                    <v-icon class="detail-icon">mdi-map-search</v-icon>
                    <span class="detail-label">Geocoded Address:</span>
                    <span class="detail-value">{{
                      reverseGeocodedAddress
                    }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <!-- Map Panel -->
          <v-col cols="12" md="7">
            <div class="map-panel">
              <h3 class="panel-title">
                <v-icon class="mr-2" color="primary">mdi-map</v-icon>
                Map View
              </h3>

              <v-card class="map-card" elevation="4">
                <div class="map-wrapper">
                  <div ref="mapContainer" class="map-container"></div>
                  <div class="coordinates-overlay">
                    <v-chip
                      v-if="
                        displayLocationDetails?.locmark?.lat &&
                        displayLocationDetails?.locmark?.lng
                      "
                      color="primary"
                      variant="elevated"
                      size="small"
                      prepend-icon="mdi-crosshairs-gps"
                    >
                      {{
                        parseFloat(displayLocationDetails.locmark.lat).toFixed(
                          4,
                        )
                      }},
                      {{
                        parseFloat(displayLocationDetails.locmark.lng).toFixed(
                          4,
                        )
                      }}
                    </v-chip>
                  </div>
                </div>
                <v-card-text class="map-info">
                  <v-icon size="16" class="mr-1" color="grey-darken-1"
                    >mdi-information</v-icon
                  >
                  <span class="info-text"
                    >Location displayed based on selected type.</span
                  >
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="location-selector-actions">
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="$emit('close')"
          size="large"
          class="action-btn"
        >
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          @click="$emit('apply')"
          :disabled="!displayLocationDetails"
          size="large"
          class="action-btn apply-btn"
          append-icon="mdi-check"
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";

const props = defineProps({
  show: Boolean,
  locationTypes: Array,
  selectedLocType: String,
  displayLocationDetails: Object,
  reverseGeocodedAddress: String,
  locationError: String,
});

const emit = defineEmits(["close", "apply", "update:selected-loc-type"]);

const mapContainer = ref(null);
let mapInstance = null;
let markerInstance = null;

// Prefer env variable; fall back to existing key pattern if provided in project
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g";

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve(window.google.maps);
    const existing = document.querySelector("script[data-google-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function getCenter() {
  const lat = props.displayLocationDetails?.locmark?.lat;
  const lng = props.displayLocationDetails?.locmark?.lng;
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (isFinite(latNum) && isFinite(lngNum)) return { lat: latNum, lng: lngNum };
  return { lat: 12.9716, lng: 77.5946 }; // default center
}

async function ensureMap() {
  try {
    const maps = await loadGoogleMapsScript();
    const center = getCenter();
    mapInstance = new maps.Map(mapContainer.value, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    markerInstance = new maps.Marker({ position: center, map: mapInstance });
  } catch (e) {
    // keep UI graceful if script fails
  }
}

function updateMarker() {
  if (!mapInstance || !markerInstance) return;
  const pos = getCenter();
  markerInstance.setPosition(pos);
  mapInstance.setCenter(pos);
}

function triggerResizeAndCenter() {
  try {
    const maps = window.google?.maps;
    if (maps && mapInstance) {
      maps.event?.trigger?.(mapInstance, "resize");
      updateMarker();
    }
  } catch {}
}

watch(
  () => props.show,
  async (val) => {
    if (val) {
      await nextTick();
      if (!mapInstance && mapContainer.value) {
        await ensureMap();
      } else {
        updateMarker();
      }
      triggerResizeAndCenter();
      setTimeout(() => {
        triggerResizeAndCenter();
      }, 50);
    } else {
      if (markerInstance) {
        try {
          markerInstance.setMap(null);
        } catch {}
        markerInstance = null;
      }
      mapInstance = null;
    }
  },
);

watch(
  () => props.selectedLocType,
  async () => {
    await nextTick();
    updateMarker();
    triggerResizeAndCenter();
  },
);

watch(
  () => props.displayLocationDetails,
  async (val) => {
    if (!val) return;
    await nextTick();
    updateMarker();
    triggerResizeAndCenter();
  },
);

onMounted(async () => {
  if (props.show) {
    await nextTick();
    await ensureMap();
    setTimeout(() => {
      triggerResizeAndCenter();
    }, 50);
  }
});
</script>

<style scoped>
.location-selector-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.location-selector-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 24px;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  color: rgba(255, 255, 255, 0.8);
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.location-selector-content {
  padding: 32px;
}

.selection-panel,
.map-panel {
  height: 100%;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.location-select {
  margin-bottom: 24px;
}

.location-details-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.details-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 20px 8px 20px;
}

.details-content {
  padding: 8px 20px 20px 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.detail-icon {
  color: #1976d2;
  font-size: 18px;
  min-width: 18px;
}

.detail-label {
  font-weight: 600;
  color: #37474f;
  min-width: 80px;
}

.detail-value {
  color: #546e7a;
  flex: 1;
  word-break: break-word;
}

.map-card {
  border-radius: 16px !important;
  overflow: hidden;
  position: relative;
}

.map-wrapper {
  position: relative;
}

.map-container {
  height: 400px;
  width: 100%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #546e7a;
  font-weight: 500;
}

.coordinates-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  pointer-events: none;
}

.map-info {
  padding: 12px 16px;
  background: rgba(25, 118, 210, 0.05);
  border-top: 1px solid rgba(25, 118, 210, 0.1);
}

.info-text {
  font-size: 0.875rem;
  color: #546e7a;
}

.location-selector-actions {
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  min-width: 140px;
  transition: all 0.3s ease;
}

.apply-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

:deep(.v-select .v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Responsive Design */
@media (max-width: 768px) {
  .location-selector-content {
    padding: 16px;
  }

  .map-container {
    height: 300px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-label {
    min-width: auto;
  }
}
</style>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1100"
    persistent
    content-class="elevation-0"
    @update:model-value="onDialogToggle"
  >
    <v-card class="logs-card">
      <v-card-title class="card-header">
        <div class="employee-meta">
          <v-avatar size="48" class="employee-avatar">
            <span class="avatar-initials">{{ employeeInitials }}</span>
          </v-avatar>

          <div class="employee-text">
            <div class="employee-name">Name : {{ employeeName }}</div>
            <div class="employee-details">
              <span>Employee ID : {{ employeeCode }}</span>
              <span class="separator">|</span>
              <span>Start : {{ startTimeLabel }}</span>
              <v-icon size="16" class="icon-arrow">mdi-arrow-right</v-icon>
              <span>End : {{ endTimeLabel }}</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <div class="last-activity" v-if="lastActivityLabel">
            Last activity : {{ lastActivityLabel }}
          </div>

          <v-btn
            class="action-btn"
            variant="outlined"
            height="40"
            @click="$emit('refresh')"
          >
            <v-icon start size="18">mdi-refresh</v-icon>
          </v-btn>

          <v-btn
            class="action-btn"
            color="primary"
            height="40"
            width="20"
            :loading="exporting"
            @click="handleExport"
          >
            <v-icon start size="18">mdi-download</v-icon>
          </v-btn>

          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="card-body">
        <div class="layout-grid">
          <section class="timeline-panel">
            <div class="panel-header">
              <div>
                <div class="panel-title">Timeline</div>
                <div class="panel-date">{{ formattedDate }}</div>
              </div>

              <div class="metrics-group">
                <div class="metric-item">
                  <div class="metric-value">
                    {{ totalDistanceKm.toFixed(2) }} km
                  </div>
                  <div class="metric-label">Travelled</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ totalWorkingHours }}</div>
                  <div class="metric-label">Working hours</div>
                </div>
              </div>
            </div>

            <v-divider />

            <div class="timeline-scroll" v-if="timelineLogs.length">
              <v-timeline density="compact" side="start" align="start">
                <v-timeline-item
                  v-for="(log, index) in timelineLogs"
                  :key="log.id ?? index"
                  :dot-color="statusDotColor(log.status)"
                  size="16"
                >
                  <template #opposite>
                    <div class="timeline-time">
                      {{ formatTime(log.timeStamp) }}
                    </div>
                  </template>

                  <div class="timeline-card">
                    <div class="status-chip" :class="statusClass(log.status)">
                      {{ statusLabel(log.status) }}
                    </div>

                    <div class="timeline-location">
                      <v-icon size="16" color="primary" class="me-1">
                        mdi-map-marker
                      </v-icon>
                      <span>
                        Lat {{ formatCoordinate(log.lat) }}, Lng
                        {{ formatCoordinate(log.lng) }}
                      </span>
                    </div>

                    <div v-if="log.address" class="timeline-address">
                      {{ log.address }}
                    </div>

                    <div
                      v-if="segmentDistances[index]"
                      class="segment-distance"
                    >
                      Segment: {{ segmentDistances[index].toFixed(2) }} km
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </div>

            <div v-else class="empty-state">
              <v-icon size="36" color="primary">mdi-map-marker-off</v-icon>
              <p>No logs available for this date.</p>
            </div>
          </section>

          <section class="map-panel">
            <div class="panel-header map-header">
              <div class="map-tabs">
                <v-btn-toggle
                  v-model="mapType"
                  rounded="lg"
                  color="primary"
                  density="compact"
                  class="map-toggle"
                >
                  <v-btn value="roadmap">Map</v-btn>
                  <v-btn value="satellite">Satellite</v-btn>
                </v-btn-toggle>
              </div>
            </div>

            <div ref="mapContainer" class="map-container">
              <div v-if="mapError" class="map-error">
                <v-icon size="24" color="primary" class="me-2"
                  >mdi-alert-circle</v-icon
                >
                {{ mapError }}
              </div>

              <div v-else-if="!mapReady" class="map-loader">
                <v-progress-circular indeterminate color="primary" size="32" />
                <span class="loader-text">Loading map…</span>
              </div>
            </div>
          </section>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import * as XLSX from "xlsx";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  employee: { type: Object, default: () => ({}) },
  logs: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "refresh"]);

const mapContainer = ref(null);
const mapInstance = ref(null);
const mapReady = ref(false);
const mapError = ref("");
const markers = ref([]);
const routePolyline = ref(null);
const exporting = ref(false);
const mapType = ref("roadmap");

let googleLoader = null;

const employeeName = computed(
  () => props.employee?.assignedUser?.first_name ?? "Unknown",
);
const employeeCode = computed(() => props.employee?.employeeId ?? "—");
const employeeInitials = computed(() => {
  const name = employeeName.value.trim();
  if (!name) return "NA";
  const words = name.split(" ");
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();
});

const attendanceDate = computed(
  () =>
    props.employee?.attendance?.date ??
    props.logs?.[0]?.date ??
    new Date().toISOString().split("T")[0],
);

const formattedDate = computed(() => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(attendanceDate.value));
  } catch {
    return attendanceDate.value;
  }
});

const startTimeLabel = computed(() => {
  const attendanceStart = props.employee?.attendance?.inTime;
  if (attendanceStart) return attendanceStart;
  const firstLog = timelineLogs.value[0];
  return firstLog ? formatTime(firstLog.timeStamp) : "—";
});

const endTimeLabel = computed(() => {
  const attendanceEnd = props.employee?.attendance?.outTime;
  if (attendanceEnd) return attendanceEnd;
  const lastLog = timelineLogs.value.at(-1);
  return lastLog ? formatTime(lastLog.timeStamp) : "—";
});

const totalWorkingHours = computed(() => {
  const attendanceHours = props.employee?.attendance?.workHours;
  if (attendanceHours) return attendanceHours;
  const first = timelineLogs.value[0];
  const last = timelineLogs.value.at(-1);
  if (!first || !last) return "—";
  const diffMs =
    new Date(last.timeStamp).getTime() - new Date(first.timeStamp).getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) return "—";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m`;
});

const lastActivityLabel = computed(() => {
  const lastLog = timelineLogs.value.at(-1);
  if (!lastLog?.timeStamp) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(lastLog.timeStamp));
  } catch {
    return lastLog.timeStamp;
  }
});

const timelineLogs = computed(() =>
  [...props.logs]
    .filter((log) => log?.timeStamp)
    .sort(
      (a, b) =>
        new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
    ),
);

const segmentDistances = computed(() =>
  computeSegmentDistances(timelineLogs.value),
);

const totalDistanceKm = computed(() =>
  segmentDistances.value.reduce((sum, value) => sum + value, 0),
);

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      await ensureGoogleMaps();
      initializeMap();
    } else {
      teardownMap();
    }
  },
);

watch(
  () => props.logs,
  async () => {
    if (props.modelValue && mapReady.value) {
      await nextTick();
      updateMap();
    }
  },
  { deep: true },
);

watch(mapType, (type) => {
  if (!mapInstance.value || !window.google?.maps) return;
  const mapTypeId =
    type === "satellite"
      ? window.google.maps.MapTypeId.SATELLITE
      : window.google.maps.MapTypeId.ROADMAP;
  mapInstance.value.setMapTypeId(mapTypeId);
});

onBeforeUnmount(() => {
  teardownMap();
});

function onDialogToggle(value) {
  emit("update:modelValue", value);
}

function closeDialog() {
  emit("update:modelValue", false);
}

function statusLabel(status) {
  if (!status) return "Unavailable";
  const normalized = status.toString().toLowerCase();
  if (normalized === "in") return "Checked In";
  if (normalized === "out") return "Checked Out";
  return status;
}

function statusClass(status) {
  const normalized = status?.toString().toLowerCase();
  return normalized === "in" ? "status-in" : "status-out";
}

function statusDotColor(status) {
  const normalized = status?.toString().toLowerCase();
  return normalized === "in" ? "primary" : "accent";
}

function formatTime(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatCoordinate(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "—";
  return numeric.toFixed(4);
}

async function ensureGoogleMaps() {
  mapError.value = "";
  if (window.google?.maps) return;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    mapError.value = "Google Maps API key is not configured.";
    return;
  }

  if (!googleLoader) {
    googleLoader = new Promise((resolve, reject) => {
      const existing = document.getElementById("google-maps-sdk");
      if (existing) {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Failed to load Google Maps SDK"));
      document.head.appendChild(script);
    });
  }

  try {
    await googleLoader;
  } catch (error) {
    console.error(error);
    mapError.value = "Unable to load Google Maps.";
  }
}

function initializeMap() {
  if (!window.google?.maps || !mapContainer.value) return;
  if (!mapInstance.value) {
    mapInstance.value = new window.google.maps.Map(mapContainer.value, {
      center: { lat: 12.9716, lng: 77.5946 },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      backgroundColor: "#ffffff",
    });
    mapReady.value = true;
  }
  updateMap();
}

function teardownMap() {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
  if (routePolyline.value) {
    routePolyline.value.setMap(null);
    routePolyline.value = null;
  }
  mapReady.value = false;
}

function updateMap() {
  if (!mapInstance.value || !window.google?.maps) return;

  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];

  if (routePolyline.value) {
    routePolyline.value.setMap(null);
    routePolyline.value = null;
  }

  const path = [];
  const bounds = new window.google.maps.LatLngBounds();

  timelineLogs.value.forEach((log) => {
    const lat = Number(log.lat);
    const lng = Number(log.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const position = { lat, lng };
    const marker = new window.google.maps.Marker({
      position,
      map: mapInstance.value,
    });

    const infoContent = `
      <div style="font-size:13px;color:#1f2933">
        <strong>${statusLabel(log.status)}</strong><br/>
        ${formatTime(log.timeStamp)}<br/>
        Lat ${formatCoordinate(lat)}, Lng ${formatCoordinate(lng)}
      </div>
    `;
    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent,
    });
    marker.addListener("click", () =>
      infoWindow.open(mapInstance.value, marker),
    );

    markers.value.push(marker);
    path.push(position);
    bounds.extend(position);
  });

  if (path.length > 1) {
    routePolyline.value = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#2563eb",
      strokeOpacity: 0.85,
      strokeWeight: 3,
    });
    routePolyline.value.setMap(mapInstance.value);
  }

  if (path.length) {
    mapInstance.value.fitBounds(bounds, 48);
  }
}

function computeSegmentDistances(logs) {
  if (!Array.isArray(logs) || logs.length < 2) return [];
  const distances = [0];
  for (let i = 1; i < logs.length; i += 1) {
    const previous = logs[i - 1];
    const current = logs[i];
    const distance = haversineDistance(previous, current);
    distances.push(distance);
  }
  return distances;
}

function haversineDistance(pointA, pointB) {
  const lat1 = Number(pointA.lat);
  const lng1 = Number(pointA.lng);
  const lat2 = Number(pointB.lat);
  const lng2 = Number(pointB.lng);

  if (
    Number.isNaN(lat1) ||
    Number.isNaN(lng1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lng2)
  ) {
    return 0;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

async function handleExport() {
  if (!timelineLogs.value.length) return;
  exporting.value = true;
  try {
    const rows = timelineLogs.value.map((log, index) => ({
      "Employee Name": employeeName.value,
      "Employee ID": employeeCode.value,
      Date: attendanceDate.value,
      "Start Time": startTimeLabel.value,
      "End Time": endTimeLabel.value,
      "Total Working Hours": totalWorkingHours.value,
      "Total Distance (km)": totalDistanceKm.value.toFixed(2),
      "Log Timestamp": log.timeStamp ?? "",
      Status: statusLabel(log.status),
      Latitude: formatCoordinate(log.lat),
      Longitude: formatCoordinate(log.lng),
      "Segment Distance (km)": segmentDistances.value[index]
        ? segmentDistances.value[index].toFixed(2)
        : "0.00",
      Address: log.address ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    const filename = `${employeeCode.value || "employee"}-${attendanceDate.value}-logs.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error("Failed to export Excel", error);
  } finally {
    exporting.value = false;
  }
}
</script>

<style scoped>
:root {
  --color-primary: #2563eb;
  --color-surface: #ffffff;
  --color-muted: #f5f7fa;
  --color-text: #1f2933;
  --color-accent: #10b981;
}

.logs-card {
  border-radius: 18px;
  background-color: white;
  color: var(--color-text);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  gap: 24px;
}

.employee-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.employee-avatar {
  background-color: rgba(37, 99, 235, 0.08);
  color: var(--color-primary);
  font-weight: 600;
}

.avatar-initials {
  font-size: 16px;
  letter-spacing: 0.4px;
}

.employee-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.employee-name {
  font-size: 18px;
  font-weight: 600;
}

.employee-details {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  color: rgba(107, 114, 128, 0.5);
}

.icon-arrow {
  color: rgba(107, 114, 128, 0.6);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.last-activity {
  font-size: 13px;
  color: #6b7280;
  padding-right: 12px;
  border-right: 1px solid rgba(107, 114, 128, 0.3);
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

.card-body {
  padding: 0;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 0;
  min-height: 560px;
}

.timeline-panel {
  border-right: 1px solid rgba(229, 231, 235, 0.8);
  display: flex;
  flex-direction: column;
  background-color: var(--color-muted);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  background-color: var(--color-surface);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.panel-date {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.metrics-group {
  display: flex;
  gap: 20px;
}

.metric-item {
  text-align: right;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.timeline-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 18px 28px;
}

.timeline-card {
  background-color: var(--color-surface);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-time {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 12px;
  border-radius: 999px;
}

.status-in {
  background-color: rgba(16, 185, 129, 0.12);
  color: var(--color-accent);
}

.status-out {
  background-color: rgba(37, 99, 235, 0.12);
  color: var(--color-primary);
}

.timeline-location {
  font-size: 13px;
  display: flex;
  align-items: center;
  color: var(--color-text);
}

.timeline-address {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.segment-distance {
  font-size: 12px;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
  padding: 48px 16px;
}

.map-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
}

.map-header {
  padding: 20px 24px 10px;
  display: flex;
  justify-content: flex-end;
}

.map-toggle {
  background-color: rgba(37, 99, 235, 0.08);
  padding: 4px;
}

.map-container {
  flex: 1;
  position: relative;
  min-height: 520px;
  margin: 0 24px 24px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.map-container :deep(> div) {
  height: 100%;
}

.map-loader,
.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  font-size: 13px;
}

.loader-text {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .timeline-panel {
    border-right: none;
    border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  }

  .map-container {
    margin: 0 16px 16px;
    min-height: 420px;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .last-activity {
    border-right: none;
    padding-right: 0;
  }
}
</style>

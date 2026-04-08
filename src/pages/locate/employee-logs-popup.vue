<template>
  <v-dialog
    v-model="dialog"
    max-width="1300px"
    max-height="900px"
    persistent
    :fullscreen="$vuetify.display.xs"
  >
    <v-card class="employee-logs-card">
      <!-- Header -->
      <v-card-title class="pa-6 text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center gap-2">
            <!-- Employee Avatar -->
            <v-avatar size="40" class="profile-avatar">
              <v-img
                v-if="employeeAvatar"
                :src="employeeAvatar"
                :loading="isLoadingAvatar"
                alt="Employee Profile"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <v-icon size="40" color="white">mdi-account-circle</v-icon>
                <!-- Fallback SVG placeholder like in employeeDetails.vue -->
                <!-- <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg> -->
              </div>
            </v-avatar>
            <!-- Employee Name and ID -->
            <div>
              <div class="text-body-4" v-if="selectedEmployee">
                {{
                  selectedEmployee.assignedUser?.first_name ||
                  "Unknown Employee"
                }}
                ({{ selectedEmployee.employeeId || "N/A" }}) -
                {{ currentDate }}
              </div>
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn
              @click="refreshData"
              :loading="refreshing"
              icon="mdi-refresh"
              variant="text"
              color="white"
              size="small"
            />
            <v-btn
              @click="exportToExcel"
              :loading="exporting"
              icon="mdi-microsoft-excel"
              variant="text"
              color="white"
              size="small"
            />
            <v-btn
              @click="closeDialog"
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
            />
          </div>
        </div>
      </v-card-title>

      <!-- Header Info Bar -->
      <v-card-text class="pa-4 bg-grey-lighten-5 border-b">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <!-- Legend aligned to colors -->
          <div class="d-flex align-center gap-4">
            <div class="d-flex align-center gap-2">
              <v-icon :style="{ color: COLORS.start }" size="16"
                >mdi-map-marker</v-icon
              >
              <span class="text-body-2">Start</span>
            </div>
            <div class="d-flex align-center gap-2">
              <v-icon :style="{ color: COLORS.branch }" size="16"
                >mdi-map-marker</v-icon
              >
              <span class="text-body-2">Branch Location</span>
            </div>
            <div class="d-flex align-center gap-2">
              <v-icon :style="{ color: COLORS.end }" size="16"
                >mdi-map-marker</v-icon
              >
              <span class="text-body-2">End</span>
            </div>
            <div class="d-flex align-center gap-2">
              <v-icon :style="{ color: '#00A884' }" size="16"
                >mdi-road-variant</v-icon
              >
              <span class="text-body-2">Travel</span>
            </div>
            <div class="d-flex align-center gap-2">
              <v-icon :style="{ color: COLORS.idle }" size="16"
                >mdi-pause</v-icon
              >
              <span class="text-body-2">Idle</span>
            </div>
          </div>

          <!-- Summary chips: clearer/eye-visible -->
          <div class="d-flex align-center gap-2 flex-wrap">
            <div color="success" variant="elevated" size="small">
              <v-icon start>mdi-timer</v-icon>
              {{ summaryStats.totalWorkingHours }}
            </div>
            <div
              v-if="routeStats.totalStops > 0"
              color="warning"
              variant="flat"
              size="small"
            >
              <v-icon start>mdi-pause</v-icon>
              {{ routeStats.totalStops }} Stops
            </div>
            <div
              v-if="routeStats.totalDistance > 0"
              color="primary"
              variant="flat"
              size="small"
            >
              <v-icon start>mdi-map-marker-distance</v-icon>
              {{ routeStats.totalDistance.toFixed(2) }} km Total
            </div>
            <div color="success" variant="flat" size="small">
              <v-icon start>mdi-car</v-icon>
              {{ routeStats.totalTravel }} km Travel
            </div>
            <div color="error" variant="flat" size="small">
              <v-icon start>mdi-stop</v-icon>
              {{ routeStats.totalIdle }} m Idle
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Content -->
      <v-card-text class="pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Timeline Section (Left) -->
          <v-col cols="12" md="5" lg="4" class="logs-section">
            <div class="logs-header pa-4 bg-grey-lighten-5 border-b">
              <h3 class="text-h6 text-primary">Timeline</h3>
              <div class="text-caption mt-1 d-flex align-center gap-2">
                <span
                  >{{ currentDate }} | {{ summaryStats.totalDistance }} km</span
                >
              </div>
            </div>

            <div class="logs-content pa-4">
              <v-progress-linear
                v-if="loading"
                indeterminate
                color="primary"
                class="mb-4"
              />

              <div
                v-if="processedLogs.length === 0 && !loading"
                class="empty-state text-center pa-8"
              >
                <v-icon size="64" color="grey-lighten-2"
                  >mdi-map-marker-off</v-icon
                >
                <h4 class="text-h6 mt-4 mb-2 text-grey">No Location Data</h4>
                <p class="text-body-2 text-grey">
                  No tracking logs found for this employee on the selected date.
                </p>
              </div>

              <!-- Timeline Items -->
              <div v-else class="timeline-container">
                <div
                  v-for="(item, index) in processedLogs"
                  :key="item.id || index"
                  class="timeline-item mb-4"
                >
                  <!-- Regular Log Entry (Start/Stop/Break) -->
                  <div v-if="item.type !== 'stop'" class="log-entry">
                    <div class="d-flex align-center mb-2">
                      <div class="time-badge">
                        {{ formatTime(item.timeStamp) }}
                      </div>
                      <v-icon
                        :style="{ color: getActionMarkerColor(item.action) }"
                        class="mx-2"
                        size="20"
                      >
                        {{ getActionIcon(item.action) }}
                      </v-icon>
                      <span class="action-text">
                        {{
                          item.action?.toLowerCase() === "in"
                            ? "Check In"
                            : item.action?.toLowerCase() === "out"
                              ? "Check Out"
                              : "Break"
                        }}
                      </span>
                      <v-spacer />
                      <!-- Session duration shown on Stop -->
                      <v-chip
                        v-if="item.action?.toLowerCase() === 'out'"
                        color="success"
                        size="x-small"
                        variant="elevated"
                      >
                        <v-icon start size="14">mdi-timer-outline</v-icon>
                        {{ getSessionDurationForOut(item) }}
                      </v-chip>
                    </div>

                    <div class="location-details ml-16">
                      <div class="text-body-2 text-grey mb-1">
                        <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
                        {{ formatCoordinates(item.lat, item.lng) }}
                      </div>
                    </div>

                    <!-- Travel + IdleDuration shown clearly on Stop -->
                    <div
                      v-if="item.action?.toLowerCase() === 'out'"
                      class="stats-details ml-16 mt-2 text-body-2"
                    >
                      <span style="font-weight: bold; margin-right: 12px">
                        <v-icon start size="14">mdi-map-marker-distance</v-icon>
                        Travel: {{ getLogStats(item.id).travel }} km
                      </span>

                      <span
                        style="
                          font-weight: bold;
                          margin-right: 12px;
                          color: #d32f2f;
                        "
                      >
                        <v-icon start size="14">mdi-stop</v-icon>
                        Idle: {{ formatIdleDuration(item) }}
                      </span>
                    </div>
                    <br />
                  </div>

                  <!-- Stop Entry (detected) -->
                  <div v-else class="stop-entry">
                    <div class="d-flex align-center mb-2">
                      <div class="time-badge">
                        {{ formatTime(item.startTime) }}
                      </div>
                      <v-icon color="warning" class="mx-2" size="20">
                        mdi-pause
                      </v-icon>
                      <span class="action-text">
                        Stop ({{ formatTime(item.startTime) }})
                      </span>
                      <v-spacer />
                      <v-chip
                        color="success"
                        variant="flat"
                        size="small"
                        class="ml-2"
                      >
                        {{ item.duration }}
                      </v-chip>
                    </div>

                    <div class="location-details ml-16">
                      <div
                        v-if="
                          item.lat &&
                          item.lng &&
                          item.lat !== 0 &&
                          item.lng !== 0
                        "
                        class="text-body-2 text-grey mb-1"
                      >
                        <span class="font-weight-medium">Latitude:</span>
                        {{ parseFloat(item.lat).toFixed(6) }}
                        <span class="ml-4 font-weight-medium">Longitude:</span>
                        {{ parseFloat(item.lng).toFixed(6) }}
                      </div>
                      <div v-else class="text-body-2 text-grey-darken-1 mb-1">
                        <v-icon size="16" class="mr-1"
                          >mdi-map-marker-off</v-icon
                        >
                      </div>
                      <div class="d-flex align-center text-body-2 text-grey">
                        <v-icon size="16" class="mr-1">mdi-play</v-icon>
                        Tracking started ({{ formatTime(item.endTime) }})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Map Section (Right) -->
          <v-col cols="12" md="7" lg="8" class="map-section">
            <div class="map-header pa-4 bg-grey-lighten-5 border-b">
              <div class="d-flex align-center justify-space-between flex-wrap">
                <h3 class="text-h6 text-primary">Route Tracking</h3>

                <!-- Branch info visible in header -->
                <div
                  class="d-flex gap-2 align-center flex-wrap"
                  v-if="branchInfo"
                >
                  <div color="grey" size="small" variant="elevated">
                    <v-icon start>mdi-office-building-marker</v-icon>
                    {{ branchInfo.orgName }}
                  </div>
                </div>
              </div>
            </div>
            <div id="google-map" ref="mapContainer" class="google-map" />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="pa-4 bg-grey-lighten-5 border-t">
        <v-spacer />
        <v-btn
          @click="exportToExcel"
          :loading="exporting"
          color=" #059367"
          variant="elevated"
          prepend-icon="mdi-microsoft-excel"
        >
          Export to Excel
        </v-btn>
        <v-btn @click="closeDialog" color="grey" variant="text"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import * as XLSX from "xlsx";
import { authService } from "@/services/authService";

const COLORS = {
  start: "#FFC107", // amber (warning)
  branch: "#E53935", // red-600 (error)
  end: "#2196F3", // blue-500 (info)
  idle: "#FF0000", // red for idle segments
};

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedEmployee: { type: Object, default: () => ({}) },
  employeeLogs: { type: Array, default: () => [] },
  currentDate: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "refresh", "close"]);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const mapContainer = ref(null);
const googleMap = ref(null);
const markers = ref([]);
const polylines = ref([]);
const refreshing = ref(false);
const exporting = ref(false);
const employeeAvatar = ref(null);
const isLoadingAvatar = ref(false);

/* Fetch authorized image helper */
const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

/* Fetch employee avatar */
const fetchEmployeeAvatar = async () => {
  if (
    props.selectedEmployee?.assignedUser?.avatar?.id &&
    !employeeAvatar.value
  ) {
    isLoadingAvatar.value = true;
    try {
      const imageUrl = `${
        import.meta.env.VITE_API_URL
      }/assets/${props.selectedEmployee.assignedUser.avatar.id}`;
      employeeAvatar.value = await fetchAuthorizedImage(imageUrl);
    } catch (error) {
      console.error("Error loading employee avatar:", error);
      employeeAvatar.value = null;
    } finally {
      isLoadingAvatar.value = false;
    }
  }
};

/* Branch info */
const branchInfo = computed(() => {
  const orgName =
    props.selectedEmployee?.attendance?.employeeId?.branchLocation?.orgLocation
      ?.orgName ||
    props.selectedEmployee?.employeeId?.branchLocation?.orgLocation?.orgName ||
    null;

  const locmark =
    props.selectedEmployee?.attendance?.employeeId?.branchLocation?.locmark ||
    props.selectedEmployee?.employeeId?.branchLocation?.locmark ||
    null;

  if (
    locmark &&
    locmark.type === "Point" &&
    Array.isArray(locmark.coordinates) &&
    locmark.coordinates.length === 2
  ) {
    return {
      orgName: orgName || "Branch",
      position: {
        lat: Number(locmark.coordinates[1]),
        lng: Number(locmark.coordinates[0]),
      },
    };
  }
  return null;
});

/* Processed logs */
const processedLogs = computed(() => {
  if (!props.employeeLogs || props.employeeLogs.length === 0) return [];

  const getSeconds = (timeStr) => {
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return new Date(timeStr).getTime() / 1000;
  };

  const sortedLogs = [...props.employeeLogs].sort(
    (a, b) => getSeconds(a.timeStamp) - getSeconds(b.timeStamp),
  );

  const processed = [];
  const STOP_THRESHOLD_KM = 3;
  const MIN_STOP_MINUTES = 5;

  for (let i = 0; i < sortedLogs.length; i++) {
    const currentLog = sortedLogs[i];
    processed.push({ ...currentLog, type: "log" });

    if (i < sortedLogs.length - 1) {
      const nextLog = sortedLogs[i + 1];

      if (
        currentLog.lat &&
        currentLog.lng &&
        currentLog.lat !== 0 &&
        currentLog.lng !== 0 &&
        nextLog.lat &&
        nextLog.lng &&
        nextLog.lat !== 0 &&
        nextLog.lng !== 0
      ) {
        const distance = calculateDistance(
          parseFloat(currentLog.lat),
          parseFloat(currentLog.lng),
          parseFloat(nextLog.lat),
          parseFloat(nextLog.lng),
        );

        const currentSeconds = getSeconds(currentLog.timeStamp);
        const nextSeconds = getSeconds(nextLog.timeStamp);
        const minutesDiff = (nextSeconds - currentSeconds) / 60;

        if (distance >= STOP_THRESHOLD_KM && minutesDiff >= MIN_STOP_MINUTES) {
          const stopDuration = formatDuration(minutesDiff);
          processed.push({
            id: `stop_${i}`,
            type: "stop",
            lat: currentLog.lat,
            lng: currentLog.lng,
            startTime: currentLog.timeStamp,
            endTime: nextLog.timeStamp,
            duration: stopDuration,
            distance: distance.toFixed(2) + " km",
          });
        }
      }
    }
  }

  return processed;
});

const logsWithStats = computed(() => {
  return props.employeeLogs.map((log) => {
    let travel = 0;
    let idle = 0;
    if (log.polyline) {
      const coords = decodePolyline(log.polyline);
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const current = coords[i];
        const dist = calculateDistance(
          prev.lat,
          prev.lng,
          current.lat,
          current.lng,
        );
        if (dist < 0.025) idle += dist;
        else travel += dist;
      }
    }
    return {
      ...log,
      travelDistance: travel,
      idleDistance: idle * 1000,
    };
  });
});

const getLogStats = (id) => {
  const log = logsWithStats.value.find((l) => l.id === id);
  return {
    travel: log?.travelDistance?.toFixed(2) || "0.00",
    idle: log?.idleDistance?.toFixed(0) || "0",
  };
};

const routeStats = computed(() => {
  let totalDistance = 0;
  let totalTravel = 0;
  let totalIdle = 0;
  let totalStops = processedLogs.value.filter((i) => i.type === "stop").length;

  logsWithStats.value.forEach((log) => {
    totalTravel += log.travelDistance;
    totalIdle += log.idleDistance;
    totalDistance += log.travelDistance + log.idleDistance / 1000;
  });

  return {
    totalDistance,
    totalStops,
    totalTravel: totalTravel.toFixed(2),
    totalIdle: totalIdle.toFixed(0),
  };
});

const summaryStats = computed(() => {
  if (!props.employeeLogs || props.employeeLogs.length === 0) {
    return {
      startTime: "N/A",
      endTime: "N/A",
      totalWorkingHours: "N/A",
      totalDistance: "0.00",
    };
  }

  const getSeconds = (timeStr) => {
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      const [h, m, s] = timeStr.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    }
    return new Date(timeStr).getTime() / 1000;
  };

  const sorted = [...props.employeeLogs].sort(
    (a, b) => getSeconds(a.timeStamp) - getSeconds(b.timeStamp),
  );
  const firstLog = sorted.find((l) => l.action?.toLowerCase() === "in");
  const lastLog = [...sorted]
    .reverse()
    .find((l) => l.action?.toLowerCase() === "out");

  const startTime = firstLog ? formatTime(firstLog.timeStamp) : "N/A";
  const endTime = lastLog ? formatTime(lastLog.timeStamp) : "N/A";

  let totalWorkingHours = "N/A";
  if (firstLog && lastLog) {
    const diffSeconds =
      getSeconds(lastLog.timeStamp) - getSeconds(firstLog.timeStamp);
    const stopTime = processedLogs.value
      .filter((i) => i.type === "stop")
      .reduce(
        (t, s) => t + (getSeconds(s.endTime) - getSeconds(s.startTime)),
        0,
      );
    const working = diffSeconds - stopTime;
    totalWorkingHours = working > 0 ? formatHours(working / 3600) : "N/A";
  }

  return {
    startTime,
    endTime,
    totalWorkingHours,
    totalDistance: routeStats.value.totalDistance.toFixed(2),
  };
});

/* UI helpers */
const getActionIcon = (action) => {
  switch ((action || "").toLowerCase()) {
    case "in":
      return "mdi-login";
    case "out":
      return "mdi-logout";
    case "break":
      return "mdi-coffee";
    default:
      return "mdi-map-marker";
  }
};

const getActionMarkerColor = (action) => {
  switch ((action || "").toLowerCase()) {
    case "in":
      return COLORS.start;
    case "out":
      return COLORS.end;
    default:
      return "#9e9e9e";
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    if (/^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      const [hours, minutes] = timestamp.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

const formatCoordinates = (lat, lng) => {
  if (!lat || !lng || lat === 0 || lng === 0) return "Location unavailable";
  return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
};

const formatDuration = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} mins`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h} hrs ${m} mins`;
};

const formatHours = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} hrs ${m} mins`;
};

const formatIdleDuration = (log) => {
  if (log?.idleDuration != null && log.idleDuration !== "") {
    return `${log.idleDuration} m`;
  }
  const fallback = getLogStats(log.id)?.idle || "0";
  return `${fallback} m`;
};

const getSessionDurationForOut = (outItem) => {
  if (!outItem?.timeStamp) return "";
  const idx = sortedLogsForSessions.value.findIndex((l) => l.id === outItem.id);
  if (idx < 0) return "";
  for (let i = idx - 1; i >= 0; i--) {
    const it = sortedLogsForSessions.value[i];
    if ((it.action || "").toLowerCase() === "in") {
      const start = new Date(mergeDateTime(it.timeStamp));
      const end = new Date(mergeDateTime(outItem.timeStamp));
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
      const diffMin = Math.max(0, (end.getTime() - start.getTime()) / 60000);
      return formatDuration(diffMin);
    }
  }
  return "";
};

const mergeDateTime = (timeOrDateTime) => {
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeOrDateTime) && props.currentDate) {
    return `${props.currentDate}T${timeOrDateTime}`;
  }
  return timeOrDateTime;
};

const sortedLogsForSessions = computed(() => {
  const getSeconds = (t) => {
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    }
    return new Date(t).getTime() / 1000;
  };
  return [...props.employeeLogs].sort(
    (a, b) => getSeconds(a.timeStamp) - getSeconds(b.timeStamp),
  );
});

/* Distance & polylines */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const decodePolyline = (encoded) => {
  if (!encoded) return [];
  let index = 0,
    lat = 0,
    lng = 0;
  const poly = [];
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return poly;
};

/* Map setup */
const loadGoogleMapsScript = () =>
  new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

const initGoogleMap = async () => {
  if (!window.google || !window.google.maps) return;

  let tries = 0;
  while (!mapContainer.value && tries++ < 20)
    await new Promise((r) => setTimeout(r, 100));
  if (!mapContainer.value) return;

  const defaultCenter = { lat: 0, lng: 0 };
  let center = defaultCenter;

  if (props.employeeLogs.length > 0) {
    const first = props.employeeLogs[0];
    if (first.lat && first.lng)
      center = { lat: parseFloat(first.lat), lng: parseFloat(first.lng) };
  } else if (branchInfo.value) {
    center = branchInfo.value.position;
  }

  googleMap.value = new google.maps.Map(mapContainer.value, {
    center,
    zoom: props.employeeLogs.length > 0 ? 13 : 4,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  });

  google.maps.event.addListenerOnce(googleMap.value, "idle", async () => {
    await addMarkersAndRoutes();
  });
};

const addMarkersAndRoutes = async () => {
  if (!googleMap.value) return;

  markers.value.forEach((m) => m.setMap(null));
  polylines.value.forEach((p) => p.setMap(null));
  markers.value = [];
  polylines.value = [];

  const bounds = new google.maps.LatLngBounds();
  let hasValidLocation = false;

  const getSeconds = (timeStr) => {
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return new Date(timeStr).getTime() / 1000;
  };

  const sortedLogs = [...props.employeeLogs].sort(
    (a, b) => getSeconds(a.timeStamp) - getSeconds(b.timeStamp),
  );

  const STOP_THRESHOLD_KM = 3;
  const MIN_STOP_MINUTES = 5;

  // Plot logs markers & polylines
  sortedLogs.forEach((log, i) => {
    if (log.lat && log.lng && log.lat !== 0 && log.lng !== 0) {
      hasValidLocation = true;
      const position = { lat: parseFloat(log.lat), lng: parseFloat(log.lng) };

      const marker = new google.maps.Marker({
        position,
        map: googleMap.value,
        title: `${(log.action || "").toUpperCase()} - ${formatTime(log.timeStamp)}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getActionMarkerColor(log.action),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale:
            (log.action || "").toLowerCase() === "in" ||
            (log.action || "").toLowerCase() === "out"
              ? 12
              : 8,
        },
      });

      const stats = getLogStats(log.id);
      const idleText =
        log?.idleDuration != null && log.idleDuration !== ""
          ? `${log.idleDuration} m`
          : `${stats.idle} m`;

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:8px; font-size:12px;">
            <strong>${(log.action || "UNKNOWN").toUpperCase()}</strong><br>
            Time: ${formatTime(log.timeStamp)}<br>
            Location: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}<br>
            Travel: ${stats.travel} km<br>
            Idle: ${idleText}
          </div>
        `,
      });
      marker.addListener("click", () =>
        infoWindow.open(googleMap.value, marker),
      );
      markers.value.push(marker);
      bounds.extend(position);

      // Connect to previous log with straight line if not a stop
      if (i > 0) {
        const prevLog = sortedLogs[i - 1];
        if (
          prevLog.lat &&
          prevLog.lng &&
          prevLog.lat !== 0 &&
          prevLog.lng !== 0
        ) {
          const prevPosition = {
            lat: parseFloat(prevLog.lat),
            lng: parseFloat(prevLog.lng),
          };
          const distance = calculateDistance(
            prevPosition.lat,
            prevPosition.lng,
            position.lat,
            position.lng,
          );
          const prevSeconds = getSeconds(prevLog.timeStamp);
          const currentSeconds = getSeconds(log.timeStamp);
          const minutesDiff = (currentSeconds - prevSeconds) / 60;

          if (distance < STOP_THRESHOLD_KM || minutesDiff < MIN_STOP_MINUTES) {
            const connectLine = new google.maps.Polyline({
              path: [prevPosition, position],
              geodesic: true,
              strokeColor: "#00A884", // green for travel
              strokeOpacity: 0.7,
              strokeWeight: 3,
            });
            connectLine.setMap(googleMap.value);
            polylines.value.push(connectLine);
            bounds.extend(prevPosition);
            bounds.extend(position);
          }
        }
      }

      // Polylines per log with idle/travel segments and YELLOW DOTS for idle points
      if (log.polyline) {
        const routeCoordinates = decodePolyline(log.polyline);
        if (routeCoordinates.length > 1) {
          let currentPath = [routeCoordinates[0]];
          let prevIsIdle = null;
          for (let j = 1; j < routeCoordinates.length; j++) {
            const prev = routeCoordinates[j - 1];
            const current = routeCoordinates[j];
            const dist = calculateDistance(
              prev.lat,
              prev.lng,
              current.lat,
              current.lng,
            );
            const isIdle = dist < 0.025;

            // ADD YELLOW DOT for idle point
            if (isIdle) {
              const idleMarker = new google.maps.Marker({
                position: current,
                map: googleMap.value,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 4,
                  fillColor: "#FFEB3B", // BRIGHT YELLOW
                  fillOpacity: 1,
                  strokeWeight: 0,
                },
              });
              markers.value.push(idleMarker);
              bounds.extend(current);
            }

            if (prevIsIdle !== null && isIdle !== prevIsIdle) {
              const polyline = new google.maps.Polyline({
                path: currentPath,
                geodesic: true,
                strokeColor: prevIsIdle ? COLORS.idle : "#00A884",
                strokeOpacity: 0.9,
                strokeWeight: 3,
              });
              polyline.setMap(googleMap.value);
              polylines.value.push(polyline);
              currentPath = [prev];
            }
            currentPath.push(current);
            prevIsIdle = isIdle;
          }
          // Final segment
          if (currentPath.length > 1 && prevIsIdle !== null) {
            const polyline = new google.maps.Polyline({
              path: currentPath,
              geodesic: true,
              strokeColor: prevIsIdle ? COLORS.idle : "#00A884",
              strokeOpacity: 0.9,
              strokeWeight: 3,
            });
            polyline.setMap(googleMap.value);
            polylines.value.push(polyline);
          }
          routeCoordinates.forEach((c) => bounds.extend(c));
        }
      }
    }
  });

  // Plot derived stop markers
  processedLogs.value
    .filter(
      (i) => i.type === "stop" && i.lat && i.lng && i.lat !== 0 && i.lng !== 0,
    )
    .forEach((stop, idx) => {
      hasValidLocation = true;
      const position = { lat: parseFloat(stop.lat), lng: parseFloat(stop.lng) };
      const stopMarker = new google.maps.Marker({
        position,
        map: googleMap.value,
        title: `Stop - ${stop.duration}`,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: "#FF9800",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 6,
        },
      });
      const stopInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:8px; font-size:12px;">
            <strong>STOP ${idx + 1}</strong><br>
            Duration: ${stop.duration}<br>
            From: ${formatTime(stop.startTime)}<br>
            To: ${formatTime(stop.endTime)}<br>
            Location: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}
          </div>
        `,
      });
      stopMarker.addListener("click", () =>
        stopInfoWindow.open(googleMap.value, stopMarker),
      );
      markers.value.push(stopMarker);
      bounds.extend(position);
    });

  // Plot Branch marker
  if (branchInfo.value) {
    hasValidLocation = true;
    const branchMarker = new google.maps.Marker({
      position: branchInfo.value.position,
      map: googleMap.value,
      title: `Branch: ${branchInfo.value.orgName}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: COLORS.branch,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 10,
      },
      label: { text: "B", color: "#fff", fontWeight: "700" },
    });
    const branchInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding:8px; font-size:12px;">
          <strong>Branch</strong><br>
          ${branchInfo.value.orgName}<br>
          ${branchInfo.value.position.lat.toFixed(6)}, ${branchInfo.value.position.lng.toFixed(6)}
        </div>
      `,
    });
    branchMarker.addListener("click", () =>
      branchInfoWindow.open(googleMap.value, branchMarker),
    );
    markers.value.push(branchMarker);
    bounds.extend(branchInfo.value.position);
  }

  if (hasValidLocation && !bounds.isEmpty()) {
    googleMap.value.fitBounds(bounds);
    google.maps.event.addListenerOnce(googleMap.value, "bounds_changed", () => {
      if (googleMap.value.getZoom() > 16) googleMap.value.setZoom(16);
    });
  } else {
    googleMap.value.setCenter(
      branchInfo.value ? branchInfo.value.position : { lat: 0, lng: 0 },
    );
    googleMap.value.setZoom(branchInfo.value ? 12 : 2);
  }
};

const refreshData = async () => {
  refreshing.value = true;
  try {
    emit("refresh");
    await nextTick();
    await addMarkersAndRoutes();
  } finally {
    refreshing.value = false;
  }
};

const exportToExcel = async () => {
  exporting.value = true;
  try {
    const aoa = [];

    aoa.push(["Employee Tracking Report"]);
    aoa.push([]);

    aoa.push(["Summary"]);
    aoa.push([]);

    aoa.push(["Key", "Value"]);

    const summaryData = {
      "Employee Name":
        props.selectedEmployee?.assignedUser?.first_name || "Unknown",
      "Employee ID": props.selectedEmployee?.employeeId || "N/A",
      Date: props.currentDate || "N/A",
      "Start Time": summaryStats.value.startTime,
      "End Time": summaryStats.value.endTime,
      "Total Working Hours": summaryStats.value.totalWorkingHours,
      "Total Distance (km)": summaryStats.value.totalDistance,
      "Branch Name": branchInfo.value?.orgName || "N/A",
    };

    Object.entries(summaryData).forEach(([key, value]) => {
      aoa.push([key, value]);
    });

    aoa.push([]);
    aoa.push([]);

    aoa.push([`Logs for ${props.currentDate || "Today"}`]);
    aoa.push([]);

    const logHeaders = [
      "Date",
      "Employee ID",
      "Timestamp",
      "End Time",
      "Duration",
      "Action",
      "Latitude",
      "Longitude",
      "Distance",
      "Travel (km)",
      "Idle (m)",
      "Session Worked",
      "Polyline",
    ];
    aoa.push(logHeaders);

    processedLogs.value.forEach((item) => {
      if (item.type === "stop") {
        aoa.push([
          props.currentDate || "N/A",
          "STOP",
          formatTime(item.startTime),
          formatTime(item.endTime),
          item.duration,
          "STOP",
          item.lat ? parseFloat(item.lat).toFixed(6) : "N/A",
          item.lng ? parseFloat(item.lng).toFixed(6) : "N/A",
          item.distance || "N/A",
          "", // Travel
          "", // Idle
          "", // Session Worked
          "", // Employee ID
          "", // Polyline
        ]);
      } else {
        const stats = getLogStats(item.id);
        aoa.push([
          props.currentDate || "N/A",
          item.employeeId?.employeeId ||
            props.selectedEmployee?.employeeId ||
            "N/A",
          formatTime(item.timeStamp),
          "",
          "",
          (item.action || "").toLowerCase() === "in"
            ? "CheckIn"
            : (item.action || "").toLowerCase() === "out"
              ? "CheckOut"
              : (item.action || "N/A").toUpperCase(),
          item.lat ? parseFloat(item.lat).toFixed(6) : "N/A",
          item.lng ? parseFloat(item.lng).toFixed(6) : "N/A",
          "",
          stats.travel,
          item?.idleDuration != null && item.idleDuration !== ""
            ? item.idleDuration
            : stats.idle,
          (item.action || "").toLowerCase() === "out"
            ? getSessionDurationForOut(item)
            : "",
          item.polyline || "",
        ]);
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws["!cols"] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
    ];

    ws["!rows"] = [];
    ws["!rows"][0] = { hpt: 30 };
    ws["!rows"][2] = { hpt: 24 };
    ws["!rows"][4] = { hpt: 24 };
    ws["!rows"][14] = { hpt: 24 };
    ws["!rows"][16] = { hpt: 24 };

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } },
      { s: { r: 14, c: 0 }, e: { r: 14, c: 13 } },
    ];

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = ws[cellAddress].s || {};

        if (R === 4 || R === 16) {
          ws[cellAddress].s.font = { bold: true, sz: 12 };
          ws[cellAddress].s.fill = { fgColor: { rgb: "D3D3D3" } };
          ws[cellAddress].s.alignment = {
            horizontal: "center",
            vertical: "center",
          };
        }

        if (
          (R >= 4 && R <= 4 + Object.keys(summaryData).length) ||
          (R >= 16 && R <= range.e.r)
        ) {
          ws[cellAddress].s.alignment = ws[cellAddress].s.alignment || {};
          ws[cellAddress].s.alignment.horizontal = "center";
          ws[cellAddress].s.alignment.vertical = "center";
        }

        if (
          (R >= 4 && R <= 4 + Object.keys(summaryData).length) ||
          (R >= 16 && R <= range.e.r)
        ) {
          ws[cellAddress].s.border = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Employee Tracking");
    const fileName = `employee_tracking_${props.selectedEmployee?.employeeId || "unknown"}_${props.currentDate || "today"}.xlsx`;
    XLSX.writeFile(wb, fileName, { bookSST: true, compression: true });
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    exporting.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
  emit("close");
};

/* Watchers */
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      await nextTick();
      try {
        await loadGoogleMapsScript();
        await initGoogleMap();
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    }
  },
);

watch(
  () => props.employeeLogs,
  async () => {
    if (props.modelValue && googleMap.value) {
      await addMarkersAndRoutes();
    }
  },
  { deep: true },
);

watch(
  () => props.selectedEmployee,
  async (newEmployee) => {
    if (newEmployee?.assignedUser?.avatar?.id) {
      await fetchEmployeeAvatar();
    } else {
      employeeAvatar.value = null;
    }
  },
  { immediate: true, deep: true },
);

onUnmounted(() => {
  if (employeeAvatar.value) {
    URL.revokeObjectURL(employeeAvatar.value);
  }
  markers.value.forEach((m) => m.setMap(null));
  polylines.value.forEach((p) => p.setMap(null));
});
</script>

<style scoped>
.employee-logs-card {
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.map-section,
.logs-section {
  height: calc(70vh - 120px);
  display: flex;
  flex-direction: column;
}

.google-map {
  flex: 1;
  min-height: 200px;
}

.logs-content {
  flex: 1;
  overflow-y: auto;
  background-color: #fafafa;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.pa-6 {
  background-color: #059367;
}

.gap-2 {
  gap: 8px;
}

.logs-header,
.map-header {
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 960px) {
  .map-section,
  .logs-section {
    height: auto;
    min-height: 400px;
  }

  .employee-logs-card {
    height: 95vh;
  }
}

.time-badge {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #424242;
  min-width: 70px;
  text-align: center;
}

.timeline-container {
  position: relative;
}

.timeline-item {
  position: relative;
  padding-left: 0;
}

.log-entry,
.stop-entry {
  border-left: 3px solid #e0e0e0;
  padding-left: 16px;
  position: relative;
}

.log-entry {
  border-left-color: #4caf50;
}

.stop-entry {
  border-left-color: #ff9800;
}

.action-text {
  font-weight: 500;
  color: #424242;
}

.location-details {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}

.stats-details {
  background: rgba(255, 235, 59, 0.1);
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #ffeb3b;
}

.profile-avatar {
  flex-shrink: 0;
  border: 2px solid #ffffff;
  margin-right: 8px;
}

.d-flex.align-center.gap-2 {
  align-items: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: inherit;
}

.w-100 {
  width: 100%;
}
</style>

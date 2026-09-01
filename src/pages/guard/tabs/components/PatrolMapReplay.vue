<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-900 text-white rounded-b-[24px]">
    <!-- Left Column: Hybrid Map/Blueprint Area -->
    <div class="flex-1 relative bg-slate-950 border-r border-slate-800 flex flex-col">
      <!-- Mode Indicator Bar -->
      <div class="absolute top-4 left-4 z-10 flex gap-2">
        <span
          class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 backdrop-blur-md shadow-lg"
          :class="currentTrackingMode === 'outdoor'
            ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="currentTrackingMode === 'outdoor' ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400 animate-pulse'"
          />
          {{ currentTrackingMode === 'outdoor' ? 'Outdoor: GPS Active' : 'Indoor: Dead Reckoning' }}
        </span>

        <span
          v-if="currentPoints.length > 0 && currentPointIndex < currentPoints.length"
          class="px-3 py-1 bg-slate-800/80 border border-slate-700/50 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl backdrop-blur-md shadow-lg"
        >
          ACCURACY: {{ currentAccuracy }}
        </span>
      </div>

      <!-- Main Map/Grid Containers -->
      <div class="flex-1 relative overflow-hidden flex items-center justify-center min-h-[300px]">
        <!-- OUTDOOR MAP (Google Maps) -->
        <div
          v-show="currentTrackingMode === 'outdoor'"
          ref="mapContainer"
          class="w-full h-full"
        />

        <!-- INDOOR MAP (Dynamic Blueprint Grid) -->
        <div
          v-show="currentTrackingMode === 'indoor'"
          class="w-full h-full relative flex items-center justify-center bg-[#070e17] overflow-hidden"
          @mousedown="startDrag"
          @mousemove="dragGrid"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
        >
          <!-- Grid Background lines -->
          <div 
            class="absolute inset-0 pointer-events-none opacity-20"
            :style="{
              backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '20px 20px, 40px 40px, 40px 40px',
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }"
          />

          <!-- Blueprint SVG Canvas -->
          <svg
            class="w-full h-full select-none cursor-grab active:cursor-grabbing"
            viewBox="-500 -500 1000 1000"
            style="overflow: visible;"
          >
            <!-- Center coordinate indicator -->
            <g :transform="`translate(${panOffset.x}, ${panOffset.y})`">
              <!-- Grid path -->
              <path
                :d="indoorPathD"
                fill="none"
                stroke="url(#neon-blue-gradient)"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              />

              <!-- Plotted Checkpoints -->
              <g
                v-for="cp in indoorCheckpoints"
                :key="cp.checkpoint_id"
                :transform="`translate(${cp.x * 3}, ${-cp.y * 3})`"
              >
                <!-- Outer Ring Glow -->
                <circle
                  r="18"
                  fill="none"
                  :stroke="cp.status === 'scanned' ? '#10b981' : cp.status === 'missed' ? '#ef4444' : '#64748b'"
                  stroke-width="2"
                  class="opacity-40 animate-pulse"
                />
                <!-- Inner Circle -->
                <circle
                  r="10"
                  :fill="cp.status === 'scanned' ? '#10b981' : cp.status === 'missed' ? '#ef4444' : '#334155'"
                  class="transition-colors duration-300"
                />
                <!-- Checkpoint Label -->
                <text
                  y="-26"
                  text-anchor="middle"
                  fill="#94a3b8"
                  class="font-black uppercase tracking-widest pointer-events-none fill-slate-300"
                  style="font-size: 14px;"
                >
                  {{ cp.name }} ({{ cp.x }},{{ cp.y }})
                </text>
              </g>

              <!-- Animated Guard Avatar Indicator -->
              <g
                v-if="currentPoints.length > 0 && currentIndoorPosition"
                :transform="`translate(${currentIndoorPosition.x * 3}, ${-currentIndoorPosition.y * 3})`"
                class="transition-transform duration-100 ease-out"
              >
                <circle
                  r="24"
                  fill="rgba(16, 185, 129, 0.2)"
                  class="animate-ping"
                />
                <circle
                  r="14"
                  fill="#10b981"
                />
                <!-- Small compass arrow pointing to heading direction -->
                <polygon
                  points="0,-12 -6,6 6,6"
                  fill="#ffffff"
                  :transform="`rotate(${currentHeading})`"
                />
              </g>
            </g>

            <!-- SVG Defs for Neon Gradients -->
            <defs>
              <linearGradient
                id="neon-blue-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stop-color="#38bdf8"
                />
                <stop
                  offset="100%"
                  stop-color="#059669"
                />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Playback Controls Overlays -->
      <div v-if="!hideControls" class="p-6 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-col gap-4">
        <!-- Progress Bar -->
        <div class="flex items-center gap-4">
          <span class="text-xs font-mono text-slate-400">{{ formatTime(elapsedSeconds) }}</span>
          <div
            class="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
            @click="seekPlayback"
          >
            <div
              class="h-full bg-indigo-500 rounded-full transition-all duration-100 relative"
              :style="{ width: `${progressPercentage}%` }"
            >
              <!-- Glowing head -->
              <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 shadow-lg border-2 border-indigo-500" />
            </div>
          </div>
          <span class="text-xs font-mono text-slate-400">{{ formatTime(totalDurationSeconds) }}</span>
        </div>

        <!-- Controls Action Panel -->
        <div class="flex items-center justify-between">
          <!-- Play / Pause / Reset -->
          <div class="flex items-center gap-4">
            <button
              class="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-colors"
              @click="togglePlay"
            >
              <Pause
                v-if="isPlaying"
                class="w-5 h-5"
              />
              <Play
                v-else
                class="w-5 h-5 fill-white"
              />
            </button>

            <button
              class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              @click="resetPlayback"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
          </div>

          <!-- Live telemetry stats -->
          <div class="hidden sm:flex items-center gap-6 text-xs bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
            <div>
              <p class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black">
                Steps
              </p>
              <p class="font-mono font-bold">
                {{ currentTelemetry.steps }}
              </p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black">
                Heading
              </p>
              <p class="font-mono font-bold">
                {{ currentTelemetry.heading }}°
              </p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black">
                Speed
              </p>
              <p class="font-mono font-bold">
                {{ currentTelemetry.speed }} m/s
              </p>
            </div>
          </div>

          <!-- Speed multipliers -->
          <div class="flex items-center gap-2">
            <button
              v-for="sp in [1, 2, 4]"
              :key="sp"
              class="px-3 h-8 rounded-lg text-xs font-black uppercase transition-all"
              :class="speedMultiplier === sp
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-md'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
              @click="speedMultiplier = sp"
            >
              {{ sp }}x
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Checkpoint Timeline / Log -->
    <div
      v-if="!hideTimeline"
      class="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 border-slate-800 flex flex-col max-h-[400px] lg:max-h-none overflow-hidden"
    >
      <div class="p-6 border-b border-slate-800 shrink-0">
        <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">
          Scan Timeline
        </h3>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          Verified checkpoints order
        </p>
      </div>

      <div class="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
        <div
          v-for="(cp, index) in checkpoints"
          :key="cp.checkpoint_id"
          class="relative flex gap-4 items-start group"
        >
          <!-- Sequential connector line -->
          <div
            v-if="index < checkpoints.length - 1"
            class="absolute left-[13px] top-[26px] w-[2px] h-[calc(100%+8px)] bg-slate-800 transition-colors"
            :class="{ 'bg-emerald-500/50': (cp.status === 'scanned' || cp.status === 'completed') && checkpoints[index+1].status !== 'pending' }"
          />

          <div class="relative z-10 mt-1">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm"
              :class="(cp.status === 'scanned' || cp.status === 'completed')
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : cp.status === 'missed'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500 dark:text-slate-400'"
            >
              <Check
                v-if="cp.status === 'scanned' || cp.status === 'completed'"
                class="w-3.5 h-3.5"
              />
              <X
                v-else-if="cp.status === 'missed'"
                class="w-3.5 h-3.5"
              />
              <Clock
                v-else
                class="w-3.5 h-3.5"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <h4 class="text-xs font-bold text-slate-200 truncate pr-2">
                {{ cp.name }}
              </h4>
              <span
                v-if="cp.scanTime"
                class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest"
              >
                {{ cp.scanTime }}
              </span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span v-if="cp.latitude && cp.longitude">
                GPS: {{ parseFloat(cp.latitude).toFixed(4) }}, {{ parseFloat(cp.longitude).toFixed(4) }}
              </span>
              <span v-else>
                Floor: {{ cp.floor }} • Grid: ({{ cp.x }}, {{ cp.y }})
              </span>
            </p>
            <span
              class="inline-block mt-1 text-[9px] font-black uppercase tracking-widest"
              :class="(cp.status === 'scanned' || cp.status === 'completed')
                ? 'text-emerald-500'
                : cp.status === 'missed'
                  ? 'text-rose-500'
                  : 'text-slate-500 dark:text-slate-400'"
            >
              {{ cp.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Play, Pause, RotateCcw, Check, X, Clock } from 'lucide-vue-next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  patrolDetails: {
    type: Object,
    required: true
  },
  hideTimeline: {
    type: Boolean,
    default: false
  },
  hideControls: {
    type: Boolean,
    default: false
  }
});

// Playback state
const isPlaying = ref(false);
const currentPointIndex = ref(0);
const elapsedSeconds = ref(0);
const speedMultiplier = ref(1);
const playTimer = ref(null);

// Pan state for Blueprint SVG
const panOffset = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startPanPosition = ref({ x: 0, y: 0 });

// Google Map state
const mapContainer = ref(null);
let googleMap = null;
let pathPolyline = null;
let hoverPolyline = null; // Invisible wider line for easier hovering
let hoverInfoWindow = null;
let clickInfoWindow = null;
let guardMarker = null;
let mapMarkers = [];

const patrol = computed(() => props.patrolDetails?.patrol || {});
const checkpoints = computed(() => props.patrolDetails?.checkpoints || []);
const trackingPoints = computed(() => props.patrolDetails?.trackingPoints || []);

const currentPoints = computed(() => trackingPoints.value);

const currentTrackingMode = computed(() => {
  if (currentPoints.value.length > 0) {
    const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
    return currentPoints.value[idx]?.mode || 'outdoor';
  }
  
  // Fallback if no tracking points: look at the checkpoints themselves
  // Note: We ignore exactly (0,0) as this is a common DB default for unset coordinates
  const hasIndoorCheckpoints = checkpoints.value.some(cp => 
    cp.x != null && cp.y != null && cp.x !== '' && cp.y !== '' && !(Number(cp.x) === 0 && Number(cp.y) === 0)
  );
  const hasOutdoorCheckpoints = checkpoints.value.some(cp => 
    cp.latitude != null && cp.longitude != null && cp.latitude !== '' && cp.longitude !== '' && !(Number(cp.latitude) === 0 && Number(cp.longitude) === 0)
  );
  
  if (hasIndoorCheckpoints && !hasOutdoorCheckpoints) {
    return 'indoor';
  }
  return 'outdoor';
});

const currentAccuracy = computed(() => {
  if (currentPoints.value.length === 0) return 'N/A';
  const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
  const acc = currentPoints.value[idx]?.accuracy;
  return acc ? `${acc}m` : 'N/A';
});

const progressPercentage = computed(() => {
  if (currentPoints.value.length === 0) return 0;
  return (currentPointIndex.value / currentPoints.value.length) * 100;
});

const totalDurationSeconds = computed(() => {
  return currentPoints.value.length * 2; // Assume 2 seconds per data tick
});

// Telemetry values interpolated
const currentTelemetry = computed(() => {
  if (currentPoints.value.length === 0) return { steps: 0, heading: 0, speed: 0 };
  const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
  const pt = currentPoints.value[idx];
  return {
    steps: pt.steps || 0,
    heading: pt.heading || 0,
    speed: pt.speed || 0
  };
});

const currentHeading = computed(() => currentTelemetry.value.heading);

// Indoor positions mapping helper
const indoorCheckpoints = computed(() => {
  return checkpoints.value.filter(cp => 
    cp.x != null && cp.y != null && cp.x !== '' && cp.y !== '' && !(Number(cp.x) === 0 && Number(cp.y) === 0)
  );
});

const indoorPathD = computed(() => {
  const indoorPts = currentPoints.value.filter(pt => pt.mode === 'indoor');
  if (indoorPts.length === 0) return '';
  return indoorPts.reduce((acc, pt, idx) => {
    // scale coordinates slightly so they look spread out on the grid
    const svgX = pt.x * 3;
    const svgY = -pt.y * 3;
    return idx === 0 ? `M ${svgX} ${svgY}` : `${acc} L ${svgX} ${svgY}`;
  }, '');
});

const currentIndoorPosition = computed(() => {
  if (currentPoints.value.length === 0) return { x: 0, y: 0 };
  const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
  const pt = currentPoints.value[idx];
  return { x: pt.x || 0, y: pt.y || 0 };
});

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// SVG Drag panning logic
const startDrag = (e) => {
  isDragging.value = true;
  startPanPosition.value = {
    x: e.clientX - panOffset.value.x,
    y: e.clientY - panOffset.value.y
  };
};

const dragGrid = (e) => {
  if (!isDragging.value) return;
  panOffset.value = {
    x: e.clientX - startPanPosition.value.x,
    y: e.clientY - startPanPosition.value.y
  };
};

const stopDrag = () => {
  isDragging.value = false;
};

// Playback core ticker
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startPlaybackTimer();
  } else {
    clearInterval(playTimer.value);
  }
};

const startPlaybackTimer = () => {
  clearInterval(playTimer.value);
  playTimer.value = setInterval(() => {
    if (currentPointIndex.value < currentPoints.value.length) {
      currentPointIndex.value++;
      elapsedSeconds.value = currentPointIndex.value * 2;
      updateMapMarkerPosition();
    } else {
      isPlaying.value = false;
      clearInterval(playTimer.value);
    }
  }, 1000 / speedMultiplier.value);
};

// Speed watch to dynamically re-adjust timer
watch(speedMultiplier, () => {
  if (isPlaying.value) {
    startPlaybackTimer();
  }
});

const seekPlayback = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = clickX / rect.width;
  currentPointIndex.value = Math.floor(percentage * currentPoints.value.length);
  elapsedSeconds.value = currentPointIndex.value * 2;
  updateMapMarkerPosition();
};

const resetPlayback = () => {
  isPlaying.value = false;
  clearInterval(playTimer.value);
  currentPointIndex.value = 0;
  elapsedSeconds.value = 0;
  updateMapMarkerPosition();
};

// Map implementation (Leaflet 100% Reliable, Zero Quotas)
let leafletMap = null;
let leafletMarkers = [];
let guardMarkerLeaflet = null;
let leafletPolyline = null;

const initGoogleMap = async () => {
  if (!mapContainer.value) return;

  try {
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
      leafletMarkers = [];
      guardMarkerLeaflet = null;
      leafletPolyline = null;
    }

    // Get the first location from the GPS tracking or any outdoor checkpoint
    const firstGpsPoint = currentPoints.value.find(pt => pt.latitude !== null && pt.longitude !== null);
    const firstOutdoorCp = checkpoints.value.find(cp => cp.latitude && cp.longitude);
    
    let fallbackCenter = [12.9716, 77.5946];
    if (patrol.value.currentLat && patrol.value.currentLng) {
      fallbackCenter = [parseFloat(patrol.value.currentLat), parseFloat(patrol.value.currentLng)];
    }
    
    const centerPos = firstGpsPoint 
      ? [parseFloat(firstGpsPoint.latitude), parseFloat(firstGpsPoint.longitude)]
      : (firstOutdoorCp ? [parseFloat(firstOutdoorCp.latitude), parseFloat(firstOutdoorCp.longitude)] : fallbackCenter);

    leafletMap = L.map(mapContainer.value, {
      center: centerPos,
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc',
      keepBuffer: 6,
      updateWhenIdle: true,
      updateWhenZooming: false
    }).addTo(leafletMap);

    // Draw GPS path polyline
    leafletPolyline = L.polyline([], {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.95,
      smoothFactor: 1
    }).addTo(leafletMap);

    // Checkpoint markers
    checkpoints.value.forEach((cp, index) => {
      if (cp.latitude && cp.longitude) {
        const isScanned = (cp.status === 'scanned' || cp.status === 'completed');
        const iconHtml = `
          <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; color: white; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); background: ${isScanned ? '#10b981' : '#64748b'}; cursor: pointer;">
            ${index + 1}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-checkpoint-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const timeHtml = isScanned 
          ? `<p style="color: #10b981; font-weight: 800; font-size: 11px; margin: 4px 0 0 0;">Scanned: ${cp.scanTime || 'Yes'}</p>` 
          : `<p style="color: #ef4444; font-weight: 800; font-size: 11px; margin: 4px 0 0 0;">Status: ${cp.status}</p>`;

        const marker = L.marker([parseFloat(cp.latitude), parseFloat(cp.longitude)], { icon: customIcon })
          .addTo(leafletMap)
          .bindPopup(`
            <div style="padding: 4px; font-family: 'Inter', sans-serif; min-width: 130px;">
              <h4 style="margin: 0; font-size: 13px; font-weight: 900; color: #0f172a;">${cp.name}</h4>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Checkpoint #${index + 1}</p>
              ${timeHtml}
            </div>
          `);

        leafletMarkers.push(marker);
      }
    });

    // Moving Guard marker (glowing avatar)
    const guardIconHtml = `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <span style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: #6366f1; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); z-index: 10;">
          ${(patrol.value.guardName || 'G').charAt(0).toUpperCase()}
        </div>
      </div>
    `;

    const guardIcon = L.divIcon({
      html: guardIconHtml,
      className: 'guard-replay-pin',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const startPos = firstGpsPoint ? [parseFloat(firstGpsPoint.latitude), parseFloat(firstGpsPoint.longitude)] : centerPos;
    guardMarkerLeaflet = L.marker(startPos, { icon: guardIcon })
      .addTo(leafletMap)
      .bindPopup(`
        <div style="padding: 6px; font-family: 'Inter', sans-serif; min-width: 150px;">
          <h4 style="margin: 0; font-size: 13px; font-weight: 900; color: #0f172a;">${patrol.value.guardName || 'Guard'}</h4>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800;">Security Officer</p>
          <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px; color: #475569;">
            <p style="margin: 0;">Zone: <b>${patrol.value.zoneName || 'N/A'}</b></p>
            <p style="margin: 3px 0 0 0;">Route: <b>${patrol.value.routeName || 'Standard'}</b></p>
          </div>
        </div>
      `);

    // Center bounds to fit all points & checkpoints
    const allValidCoords = [
      ...currentPoints.value.filter(p => p.latitude && p.longitude).map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]),
      ...checkpoints.value.filter(c => c.latitude && c.longitude).map(c => [parseFloat(c.latitude), parseFloat(c.longitude)])
    ];

    if (allValidCoords.length > 1) {
      leafletMap.fitBounds(L.latLngBounds(allValidCoords), { padding: [40, 40] });
    }
  } catch (err) {
    console.error('Error loading Map for Replay:', err);
  }
};

const updateMapMarkerPosition = () => {
  if (!leafletMap || !guardMarkerLeaflet || currentPoints.value.length === 0) return;
  const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
  const pt = currentPoints.value[idx];
  
  if (pt.latitude && pt.longitude) {
    const newPos = [parseFloat(pt.latitude), parseFloat(pt.longitude)];
    guardMarkerLeaflet.setLatLng(newPos);
    leafletMap.panTo(newPos);
    
    // Progressively draw the tracking line
    if (leafletPolyline) {
      const pathCoords = currentPoints.value
        .slice(0, idx + 1)
        .filter(p => p.latitude && p.longitude)
        .map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
      leafletPolyline.setLatLngs(pathCoords);
    }
  }
};

watch(() => props.patrolDetails, (newVal) => {
  if (newVal) {
    resetPlayback();
    initGoogleMap();
  }
}, { deep: true });

onMounted(() => {
  initGoogleMap();
});

onUnmounted(() => {
  clearInterval(playTimer.value);
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
});
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 99px;
}
</style>

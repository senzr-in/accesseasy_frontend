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
      <div class="p-6 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-col gap-4">
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
    <div class="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 border-slate-800 flex flex-col max-h-[400px] lg:max-h-none overflow-hidden">
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
import { Loader } from '@googlemaps/js-api-loader';

const props = defineProps({
  patrolDetails: {
    type: Object,
    required: true
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
  const hasIndoorCheckpoints = checkpoints.value.some(cp => cp.x !== null && cp.y !== null);
  const hasOutdoorCheckpoints = checkpoints.value.some(cp => cp.latitude !== null && cp.longitude !== null);
  
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
  return checkpoints.value.filter(cp => cp.x !== null && cp.y !== null);
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

// Map implementation
const initGoogleMap = async () => {
  if (!mapContainer.value) return;
  const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
  const loader = new Loader({ apiKey, version: 'weekly' });

  try {
    await loader.load();
    if (!mapContainer.value) return; // Check again in case component unmounted during load
    
    // Get the first location from the GPS tracking or any outdoor checkpoint
    const firstGpsPoint = currentPoints.value.find(pt => pt.latitude !== null && pt.longitude !== null);
    const firstOutdoorCp = checkpoints.value.find(cp => cp.latitude && cp.longitude);
    
    let fallbackCenter = { lat: 12.9716, lng: 77.5946 };
    if (patrol.value.currentLat && patrol.value.currentLng) {
      fallbackCenter = { lat: parseFloat(patrol.value.currentLat), lng: parseFloat(patrol.value.currentLng) };
    }
    
    const centerPos = firstGpsPoint 
      ? { lat: parseFloat(firstGpsPoint.latitude), lng: parseFloat(firstGpsPoint.longitude) }
      : (firstOutdoorCp ? { lat: parseFloat(firstOutdoorCp.latitude), lng: parseFloat(firstOutdoorCp.longitude) } : fallbackCenter);

    googleMap = new google.maps.Map(mapContainer.value, {
      center: centerPos,
      zoom: 17,
      mapId: 'REPLAY_MAP_ID',
      mapTypeId: 'roadmap',
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Draw GPS path trail
    pathPolyline = new google.maps.Polyline({
      path: [], // Start empty, fills progressively during playback
      geodesic: true,
      strokeColor: '#38bdf8',
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: googleMap
    });

    // Fat invisible polyline for much easier mouse hovering
    hoverPolyline = new google.maps.Polyline({
      path: [],
      strokeOpacity: 0.0,
      strokeWeight: 20,
      zIndex: 10,
      map: googleMap
    });

    hoverInfoWindow = new google.maps.InfoWindow({ disableAutoPan: true });

    hoverPolyline.addListener('mousemove', (e) => {
      const hoverLat = e.latLng.lat();
      const hoverLng = e.latLng.lng();
      
      const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
      const visiblePoints = currentPoints.value.slice(0, idx + 1).filter(p => p.latitude && p.longitude);
      
      if (visiblePoints.length === 0) return;

      let closestPoint = null;
      let minDistance = Infinity;
      let closestGlobalIndex = 0;
      
      visiblePoints.forEach((p, i) => {
        const dLat = parseFloat(p.latitude) - hoverLat;
        const dLng = parseFloat(p.longitude) - hoverLng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = p;
          closestGlobalIndex = i;
        }
      });
      
      if (closestPoint) {
         let timeLabel = '';
         if (closestPoint.timestamp) {
            timeLabel = new Date(closestPoint.timestamp).toLocaleTimeString();
         } else {
            // Calculate simulated time offset for playback
            const patrolStartStr = patrol.value.startTime || patrol.value.scheduledTime;
            // Fake a base date if only time is provided (e.g. '08:00')
            let baseTime = new Date();
            if (patrolStartStr && patrolStartStr.includes(':')) {
               const parts = patrolStartStr.split(':');
               baseTime.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
            }
            const pointTime = new Date(baseTime.getTime() + (closestGlobalIndex * 2000)); // 2 seconds per tick
            timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
         }

         const content = `
           <div style="padding: 2px 6px; font-family: 'Inter', sans-serif; color: #0f172a; text-align: center; min-width: 90px;">
             <div style="font-size: 9px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Recorded Time</div>
             <div style="font-size: 13px; font-weight: 800; margin-top: 1px;">${timeLabel}</div>
           </div>
         `;
         hoverInfoWindow.setContent(content);
         hoverInfoWindow.setPosition(e.latLng);
         hoverInfoWindow.open(googleMap);
      }
    });

    hoverPolyline.addListener('mouseout', () => {
      hoverInfoWindow.close();
    });

    // Import AdvancedMarkerElement to create rich HTML markers
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    clickInfoWindow = new google.maps.InfoWindow();

    // Checkpoint markers
    checkpoints.value.forEach((cp, index) => {
      if (cp.latitude && cp.longitude) {
        const el = document.createElement('div');
        el.className = `w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shadow-lg border-[2px] border-white cursor-pointer hover:scale-110 transition-transform ${
          (cp.status === 'scanned' || cp.status === 'completed') ? 'bg-emerald-500' : 'bg-slate-400'
        }`;
        el.innerText = (index + 1).toString();

        const marker = new AdvancedMarkerElement({
          position: { lat: parseFloat(cp.latitude), lng: parseFloat(cp.longitude) },
          map: googleMap,
          title: cp.name,
          content: el
        });
        
        marker.addListener('click', () => {
          const timeHtml = (cp.status === 'scanned' || cp.status === 'completed') 
            ? `<p style="color: #10b981; font-weight: 800; font-size: 11px; margin-top: 4px;">Scanned: ${cp.scanTime || 'Yes'}</p>` 
            : `<p style="color: #ef4444; font-weight: 800; font-size: 11px; margin-top: 4px;">Status: ${cp.status}</p>`;
          
          clickInfoWindow.setContent(`
            <div style="padding: 6px; font-family: 'Inter', sans-serif; color: #0f172a; min-width: 120px;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 900;">${cp.name}</h4>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Checkpoint #${index + 1}</p>
              ${timeHtml}
            </div>
          `);
          clickInfoWindow.open({ anchor: marker, map: googleMap, shouldFocus: false });
        });

        mapMarkers.push(marker);
      }
    });

    // Moving Guard marker (glowing avatar)
    let avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    if (patrol.value.avatarUrl) {
      avatarHtml = `<img src="${patrol.value.avatarUrl}" class="w-full h-full object-cover" />`;
    }

    const guardEl = document.createElement('div');
    guardEl.className = 'relative flex items-center justify-center -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform';
    guardEl.innerHTML = `
      <span class="animate-ping absolute h-12 w-12 rounded-full opacity-50 bg-indigo-500 pointer-events-none"></span>
      <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-xl bg-indigo-600 text-white flex items-center justify-center z-10 overflow-hidden transition-transform duration-300">
        ${avatarHtml}
      </div>
    `;

    // Find the first valid GPS point to place the guard initially
    const firstGps = currentPoints.value.find(pt => pt.latitude !== null && pt.longitude !== null);
    const startPos = firstGps ? { lat: parseFloat(firstGps.latitude), lng: parseFloat(firstGps.longitude) } : centerPos;

    guardMarker = new AdvancedMarkerElement({
      position: startPos,
      map: googleMap,
      content: guardEl
    });

    guardMarker.addListener('gmp-click', () => {
      const statusColor = patrol.value.status === 'active' ? '#10b981' : (patrol.value.status === 'completed' ? '#3b82f6' : '#f59e0b');
      clickInfoWindow.setContent(`
        <div style="padding: 8px; font-family: 'Inter', sans-serif; color: #0f172a; min-width: 160px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold;">
              ${patrol.value.guardName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h4 style="margin: 0; font-size: 14px; font-weight: 900; line-height: 1;">${patrol.value.guardName || 'Unknown Guard'}</h4>
              <p style="margin: 3px 0 0 0; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Security Officer</p>
            </div>
          </div>
          <div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <p style="margin: 0; font-size: 11px; color: #475569;">Zone: <b style="color: #0f172a;">${patrol.value.zoneName || 'N/A'}</b></p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">Route: <b style="color: #0f172a;">${patrol.value.routeName || 'Standard Group'}</b></p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">Status: <b style="color: ${statusColor}; text-transform: uppercase;">${patrol.value.status}</b></p>
          </div>
        </div>
      `);
      clickInfoWindow.open({ anchor: guardMarker, map: googleMap, shouldFocus: false });
    });
  } catch (err) {
    console.error('Error loading Google Map for Replay:', err);
  }
};

const updateMapMarkerPosition = () => {
  if (!googleMap || !guardMarker || currentPoints.value.length === 0) return;
  const idx = Math.min(currentPointIndex.value, currentPoints.value.length - 1);
  const pt = currentPoints.value[idx];
  
  if (pt.latitude && pt.longitude) {
    const newPos = { lat: parseFloat(pt.latitude), lng: parseFloat(pt.longitude) };
    guardMarker.position = newPos; 
    googleMap.panTo(newPos);
    
    // Progressively draw the tracking line
    if (pathPolyline) {
      const pathCoords = currentPoints.value
        .slice(0, idx + 1)
        .filter(p => p.latitude && p.longitude)
        .map(p => ({ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }));
      pathPolyline.setPath(pathCoords);
      if (hoverPolyline) hoverPolyline.setPath(pathCoords);
    }
  }
};

onMounted(() => {
  initGoogleMap();
});

onUnmounted(() => {
  clearInterval(playTimer.value);
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

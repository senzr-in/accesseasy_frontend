<template>
  <div class="space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Visual Monitoring
            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Video class="w-5 h-5" />
            </div>
          </h1>
          <p class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time surveillance matrix & automated perimeter feeds.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <!-- Live Status Badge -->
        <div class="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span>SYSTEM SECURE ({{ onlineCount }}/{{ cameras.length }} ONLINE)</span>
        </div>

        <!-- Relay / Refresh Button -->
        <button 
          class="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
          :disabled="refreshing"
          @click="refreshFeeds"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': refreshing }" />
          <span>{{ refreshing ? 'Relaying...' : 'Relay Feeds' }}</span>
        </button>
      </div>
    </div>

    <!-- Filter & View Controls -->
    <div class="bg-white dark:bg-[#151c2c] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <!-- Location Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
        <button
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          :class="selectedLocation === 'all' 
            ? 'bg-indigo-600 text-white shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="selectedLocation = 'all'"
        >
          All Feeds ({{ cameras.length }})
        </button>
        <button
          v-for="loc in locations"
          :key="loc.id"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          :class="selectedLocation === loc.id 
            ? 'bg-indigo-600 text-white shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="selectedLocation = loc.id"
        >
          {{ loc.locationName }}
        </button>
      </div>

      <!-- Right Controls: Status & Grid Size -->
      <div class="flex items-center gap-2.5 ml-auto">
        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="h-8 px-2.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </select>

        <!-- Grid Layout Buttons -->
        <div class="hidden sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            class="p-1 rounded cursor-pointer transition-colors"
            :class="gridCols === 2 ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
            title="2 Columns"
            @click="gridCols = 2"
          >
            <Grid2X2 class="w-4 h-4" />
          </button>
          <button
            class="p-1 rounded cursor-pointer transition-colors"
            :class="gridCols === 3 ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
            title="3 Columns"
            @click="gridCols = 3"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && cameras.length === 0" class="py-20 flex flex-col items-center justify-center">
      <Loader2 class="w-8 h-8 text-indigo-500 animate-spin mb-3" />
      <p class="text-xs font-bold text-slate-500">Connecting to RTSP / ONVIF Surveillance Grid...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCameras.length === 0" class="py-16 text-center bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center">
      <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
        <Camera class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No Surveillance Cameras Match Filter</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        Try selecting "All Feeds" or reset your filter criteria to view online streams.
      </p>
      <button 
        class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
        @click="selectedLocation = 'all'; statusFilter = 'all'"
      >
        Reset Filters
      </button>
    </div>

    <!-- Video Surveillance Grid -->
    <div 
      v-else 
      class="grid gap-6"
      :class="gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'"
    >
      <div 
        v-for="cam in filteredCameras" 
        :key="cam.id" 
        class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c2c] shadow-sm group flex flex-col hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-200"
      >
        <!-- Card Header -->
        <div class="px-4 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <span 
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :class="isCamOnline(cam) 
                ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                : 'bg-rose-400 dark:bg-rose-500'"
            />
            <h3 class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ cam.name }}
            </h3>
          </div>
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded shrink-0">
            {{ cam.group || 'Node' }}
          </span>
        </div>

        <!-- Video Stream Player Container -->
        <div class="aspect-video bg-black relative flex items-center justify-center overflow-hidden group/screen">
          <template v-if="isCamOnline(cam)">
            <!-- Actual Video Element if videoUrl is available -->
            <video 
              v-if="cam.videoUrl"
              :src="cam.videoUrl"
              autoplay 
              loop 
              muted 
              playsinline
              class="w-full h-full object-cover"
            />
            <!-- Fallback Canvas / Simulated Stream -->
            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
              <Video class="w-10 h-10 opacity-30 text-indigo-400" />
              <span class="text-[10px] font-mono mt-2 tracking-widest uppercase">Live IP Stream Active</span>
            </div>

            <!-- CCTV On-Screen Display (OSD) Overlay -->
            <div class="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between text-[10px] font-mono text-white/90 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span class="font-bold tracking-wider">REC</span>
                <span class="opacity-75">CAM-0{{ cam.id }}</span>
              </div>
              <div class="font-mono text-emerald-400 font-bold">
                {{ liveTimestamp }}
              </div>
            </div>

            <div class="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between text-[9px] font-mono text-white/70 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <span>{{ cam.ip || '192.168.1.10' + cam.id }}</span>
              <span>{{ cam.fps || 30 }} FPS · {{ cam.resolution || '1080p' }}</span>
            </div>
          </template>

          <template v-else>
            <!-- Signal Lost UI -->
            <div class="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 space-y-2">
              <Camera class="w-8 h-8 opacity-40 text-rose-400 animate-pulse" />
              <p class="text-xs font-mono font-bold text-rose-400/90 tracking-widest uppercase">SIGNAL LOST</p>
              <p class="text-[10px] font-mono opacity-50">Attempting auto-reconnect...</p>
            </div>
          </template>

          <!-- Hover Action Overlay -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/screen:opacity-100 transition-opacity gap-2">
            <button 
              class="h-9 px-4 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
              @click="openExpandModal(cam)"
            >
              <Maximize2 class="w-3.5 h-3.5 text-indigo-600" />
              <span>EXPAND FEED</span>
            </button>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-4 py-2.5 flex items-center justify-between bg-white dark:bg-[#151c2c] border-t border-slate-100 dark:border-slate-800 text-xs">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
            <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="truncate">{{ cam.locationName || cam.location || 'Main Zone' }}</span>
          </span>

          <div class="flex items-center gap-1">
            <button 
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Snapshot View"
              @click="openExpandModal(cam)"
            >
              <Camera class="w-3.5 h-3.5" />
            </button>
            <button 
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Stream"
              @click="refreshFeeds"
            >
              <RefreshCw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Expanded Fullscreen CCTV Modal -->
    <Teleport to="body">
      <div 
        v-if="selectedCamera" 
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
        @click.self="selectedCamera = null"
      >
        <div class="w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95 flex flex-col">
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-wider">{{ selectedCamera.name }}</h3>
                <p class="text-xs font-mono text-slate-400">{{ selectedCamera.locationName }} · IP: {{ selectedCamera.ip || '192.168.1.101' }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer" @click="selectedCamera = null">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Video Player -->
          <div class="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
            <video 
              v-if="selectedCamera.videoUrl && isCamOnline(selectedCamera)"
              :src="selectedCamera.videoUrl"
              autoplay 
              loop 
              muted 
              playsinline
              class="w-full h-full object-cover"
            />
            <div v-else class="text-center text-slate-500 font-mono text-sm">
              <Camera class="w-12 h-12 mx-auto mb-2 opacity-50 text-rose-400" />
              <span>Feed Standby / Offline</span>
            </div>

            <!-- OSD Overlays -->
            <div class="absolute inset-x-0 top-0 p-4 flex justify-between font-mono text-xs text-white/90 bg-gradient-to-b from-black/80 to-transparent">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span class="font-bold text-red-400">● LIVE 4K MONITORING</span>
              </div>
              <div class="text-emerald-400 font-bold text-sm">
                {{ liveTimestamp }}
              </div>
            </div>
          </div>

          <!-- PTZ & Controls Bar -->
          <div class="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-300">
            <div class="flex items-center gap-2">
              <span class="text-slate-500 text-[11px] uppercase tracking-wider font-bold">PTZ Control:</span>
              <button class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer" @click="showToast('Pan Left adjusted')">◀ Left</button>
              <button class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer" @click="showToast('Pan Right adjusted')">Right ▶</button>
              <button class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer" @click="showToast('Zoom In adjusted')">Zoom +</button>
              <button class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer" @click="showToast('Zoom Out adjusted')">Zoom -</button>
            </div>

            <div class="flex items-center gap-2">
              <button 
                class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                @click="showToast('CCTV snapshot captured and saved to evidence log')"
              >
                <Camera class="w-3.5 h-3.5" />
                <span>Take Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Camera, Maximize2, RefreshCw, Shield, Video, MapPin, Loader2, 
  X, Grid2X2, LayoutGrid
} from 'lucide-vue-next';
import { useCameraData } from '@/composables/useCameraData';

const { locations, cameras, loading, fetchLocations, resetCache } = useCameraData();

const selectedLocation = ref('all');
const statusFilter = ref('all');
const gridCols = ref(3);
const refreshing = ref(false);
const selectedCamera = ref(null);
const liveTimestamp = ref('');
let timeInterval = null;

const isCamOnline = (cam) => {
  return (cam.status || '').toLowerCase() === 'online';
};

const onlineCount = computed(() => {
  return (cameras.value || []).filter(c => isCamOnline(c)).length;
});

const filteredCameras = computed(() => {
  let list = cameras.value || [];
  
  if (selectedLocation.value !== 'all') {
    list = list.filter(c => String(c.locationId) === String(selectedLocation.value));
  }

  if (statusFilter.value === 'online') {
    list = list.filter(c => isCamOnline(c));
  } else if (statusFilter.value === 'offline') {
    list = list.filter(c => !isCamOnline(c));
  }

  return list;
});

const refreshFeeds = async () => {
  refreshing.value = true;
  resetCache();
  await fetchLocations();
  setTimeout(() => {
    refreshing.value = false;
  }, 600);
};

const openExpandModal = (cam) => {
  selectedCamera.value = cam;
};

const showToast = (msg) => {
  alert(msg);
};

const updateTimestamp = () => {
  const now = new Date();
  liveTimestamp.value = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
};

onMounted(async () => {
  await fetchLocations();
  updateTimestamp();
  timeInterval = setInterval(updateTimestamp, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>


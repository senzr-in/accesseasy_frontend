<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-zinc-950 min-h-screen">
    <!-- Header with statistics -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
            <ScanFace class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          AI Cam Events
        </h1>
        <p class="text-xs font-semibold text-slate-500 mt-1">
          Monitor real-time AI object detections and snapshots across all NVR controllers.
        </p>
      </div>
      
      <!-- Stats Summary & Actions -->
      <div class="flex gap-4">
        <button 
          @click="fetchEvents"
          class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          :disabled="loading"
        >
          <RefreshCcw class="h-4 w-4 text-blue-600 dark:text-blue-400" :class="{ 'animate-spin': loading }" />
          <span class="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Refresh</span>
        </button>

        <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Activity class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Detections</p>
            <p class="text-lg font-black text-slate-900 dark:text-white mt-1">{{ events.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- NVR Device Filter -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Video class="h-3.5 w-3.5" />
            NVR Controller
          </label>
          <select 
            v-model="selectedNvr" 
            @change="fetchEvents"
            class="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Controllers</option>
            <option v-for="nvr in nvrs" :key="nvr.id" :value="nvr.sn">{{ nvr.controllerName || nvr.sn }}</option>
          </select>
        </div>

        <!-- Camera Filter -->
        <!-- Device Selection -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Cpu class="h-3.5 w-3.5" />
            Linked Device
          </label>
          <div class="relative">
            <select 
              v-model="selectedDeviceFilter"
              @change="handleDeviceSelection"
              class="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
            >
              <option value="">All Devices</option>
              <option v-for="d in linkedControllers" :key="d.id" :value="d.id">
                {{ d.controllerName || `Device ${d.sn}` }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Search class="h-3.5 w-3.5" />
            Camera Name
          </label>
          <input 
            v-model="cameraSearch" 
            @input="debounceFetch"
            type="text" 
            placeholder="e.g. laptop_cam" 
            class="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <!-- Label Selector -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <SlidersHorizontal class="h-3.5 w-3.5" />
            Object Class
          </label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="l in ['all', 'person', 'car', 'dog', 'cat']" 
              :key="l" 
              @click="setLabel(l)" 
              :class="[ 
                'px-4 h-10 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5', 
                selectedLabel === l 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10' 
                  : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50' 
              ]"
            >
              <User v-if="l === 'person'" class="h-3.5 w-3.5" />
              <Car v-else-if="l === 'car'" class="h-3.5 w-3.5" />
              <Dog v-else-if="l === 'dog'" class="h-3.5 w-3.5" />
              <Cat v-else-if="l === 'cat'" class="h-3.5 w-3.5" />
              {{ l }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Grid -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
      <Loader2 class="h-8 w-8 animate-spin mb-4 text-blue-500" />
      <p class="text-xs font-black uppercase tracking-widest text-slate-500">Loading Live Feed...</p>
    </div>

    <div v-else-if="events.length === 0" class="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      <div class="h-16 w-16 bg-slate-100 dark:bg-zinc-950 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 dark:border-zinc-800">
        <VideoOff class="h-8 w-8 text-slate-400" />
      </div>
      <p class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">No Detection Logs Found</p>
      <p class="text-xs text-slate-500 mt-1">Wait for the camera NVRs to report object detection events.</p>
    </div>

    <div v-else class="w-full flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      <div 
        v-for="event in events" 
        :key="event.event_id" 
        @click="openEventImage(event)"
        class="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer"
      >
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <!-- Class Icon Indicator (no image thumbnail) -->
          <div class="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border shadow-sm animate-in fade-in duration-200"
               :class="[
                 event.label === 'person' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/55 text-blue-600 dark:text-blue-400' :
                 event.label === 'car' ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/55 text-orange-600 dark:text-orange-400' :
                 event.label === 'dog' ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-100 dark:border-yellow-900/55 text-yellow-600 dark:text-yellow-400' :
                 event.label === 'cat' ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/55 text-purple-600 dark:text-purple-400' :
                 'bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-700 text-slate-500'
               ]"
          >
            <User v-if="event.label === 'person'" class="h-5 w-5" />
            <Car v-else-if="event.label === 'car'" class="h-5 w-5" />
            <Dog v-else-if="event.label === 'dog'" class="h-5 w-5" />
            <Cat v-else-if="event.label === 'cat'" class="h-5 w-5" />
            <Box v-else class="h-5 w-5" />
          </div>

          <!-- Event Details -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 flex-1 min-w-0 items-center">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Object Class</p>
              <h3 class="text-sm font-black text-slate-900 dark:text-white capitalize truncate mt-0.5">
                {{ event.label || 'Unknown' }}
              </h3>
            </div>
            
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Camera Source</p>
              <p class="text-xs font-semibold text-slate-600 dark:text-slate-350 truncate mt-0.5">
                {{ event.camera || 'Unknown Camera' }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detection Time</p>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock class="h-3.5 w-3.5 text-slate-400" />
                {{ formatDate(event.start_time) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action / Score & Button -->
        <div class="flex items-center gap-6 shrink-0 pl-4">
          <div class="text-right hidden sm:block">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</p>
            <p class="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {{ Math.round((event.score||0)*100) }}%
            </p>
          </div>

          <button 
            @click.stop="openEventImage(event)"
            class="h-9 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-blue-100 dark:border-blue-900/50 transition-all shadow-sm"
          >
            <Eye class="h-3.5 w-3.5" />
            View Image
          </button>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="isModalOpen && selectedEvent && selectedEvent.snapshot_file" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" @click="isModalOpen = false">
      <div class="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" @click.stop>
        <button 
          @click="isModalOpen = false" 
          class="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white border border-white/10 transition-colors"
        >
          <X class="h-6 w-6" />
        </button>
        <img 
          :src="resolveSnapshotUrl(selectedEvent.snapshot_file)" 
          class="rounded-2xl max-w-full max-h-[85vh] object-contain shadow-2xl border border-zinc-800" 
          alt="Full Snapshot"
        />
        <div class="absolute bottom-4 bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 shadow-sm text-center">
          <p class="text-xs font-black text-white uppercase tracking-wider capitalize">{{ selectedEvent.label }} - {{ selectedEvent.camera }}</p>
          <p class="text-[10px] text-zinc-400 mt-0.5">{{ formatDate(selectedEvent.start_time) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  ScanFace, Loader2, VideoOff, Camera, Clock, 
  User, Car, Box, X, Search, Video, SlidersHorizontal, Activity, Dog, Cat, RefreshCcw, Cpu,
  Eye, EyeOff
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;
const systemToken = import.meta.env.VITE_API_TOKEN || 'p2pJHhZAjca6jQea0RbPVwNWRyrJG29X';

const resolveSnapshotUrl = (snapshotFile) => {
  if (!snapshotFile) return '';
  if (snapshotFile.endsWith('.jpg') || snapshotFile.includes('.')) {
    const knUrl = import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn';
    return `${knUrl}/frigate-mqtt?file=${encodeURIComponent(snapshotFile)}`;
  }
  return `${apiUrl}/assets/${snapshotFile}?access_token=${systemToken}`;
};

const events = ref([]);
const nvrs = ref([]);
const linkedControllers = ref([]);
const loading = ref(false);

const selectedNvr = ref('');
const selectedDeviceFilter = ref('');
const cameraSearch = ref('');
const selectedLabel = ref('all');
const selectedEvent = ref(null);

const showImage = ref(false);
const isModalOpen = ref(false);

let debounceTimer = null;

const setLabel = (label) => {
  selectedLabel.value = label;
  fetchEvents();
};

const debounceFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchEvents();
  }, 400);
};

const handleDeviceSelection = () => {
  if (selectedDeviceFilter.value) {
    const dev = linkedControllers.value.find(d => d.id === selectedDeviceFilter.value);
    if (dev && dev.linkedCamera) {
      cameraSearch.value = dev.linkedCamera;
    } else {
      cameraSearch.value = 'NO_CAMERA_LINKED';
    }
  } else {
    cameraSearch.value = '';
  }
  fetchEvents();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Time';
  // Directus datetime fields often drop the 'Z' (UTC specifier).
  // We append it so the browser converts it correctly to your local time.
  const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit'
  }).format(date);
};

const openEventImage = (event) => {
  selectedEvent.value = event;
  isModalOpen.value = true;
};

const fetchNvrs = async () => {
  if (!token) return;
  try {
    const url = new URL(`${apiUrl}/items/controllers`);
    url.searchParams.append('filter[controllerType][_eq]', 'frigate_nvr');
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${systemToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      nvrs.value = data.data || [];
    }
  } catch (err) {
    console.error('Error fetching NVR controllers:', err);
  }
};

const fetchLinkedControllers = async () => {
  if (!token) return;
  try {
    const res = await fetch(`${apiUrl}/items/controllers?fields[]=id&fields[]=controllerName&fields[]=sn&fields[]=linkedCamera&filter[linkedCamera][_nnull]=true`, {
      headers: { Authorization: `Bearer ${systemToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      linkedControllers.value = data.data || [];
    }
  } catch (err) {
    console.error('Error fetching controllers:', err);
  }
};

const fetchEvents = async () => {
  if (!token) return;
  loading.value = true;
  try {
    const url = new URL(`${apiUrl}/items/frigateEvents`);
    url.searchParams.append('sort', '-start_time');
    url.searchParams.append('limit', '2000');
    url.searchParams.append('filter[start_time][_nnull]', 'true');
    url.searchParams.append('filter[score][_gt]', '0');

    // Add filter logic
    if (selectedLabel.value !== 'all') {
      url.searchParams.append('filter[label][_eq]', selectedLabel.value);
    }
    if (cameraSearch.value.trim() !== '') {
      url.searchParams.append('filter[camera][_contains]', cameraSearch.value.trim());
    }
    // If selectedNvr is set, we can theoretically filter by it if directus tracks NVR relations.
    // For now we filter events since frigate_events contains the camera label.

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${systemToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      events.value = data.data || [];
      // No automatic selection to prevent unwanted image downloads or modal popups
      if (selectedEvent.value && !events.value.find(e => e.id === selectedEvent.value.id)) {
        selectedEvent.value = null;
        isModalOpen.value = false;
      }
    }
  } catch (err) {
    console.error('Error fetching AI events:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNvrs();
  fetchLinkedControllers();
  fetchEvents();
});
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-zinc-950 min-h-screen">
    <!-- Value Header -->
    <ValueHeader
      title="Camera Events"
      valueStatement="Get notified before security becomes a problem."
      :benefits="['AI object detection', 'Real-time timeline', 'Link camera controllers', 'Class filters']"
      valueBadge="Respond instantly to security incidents."
      actionText="Refresh Feed"
      :actionIcon="RefreshCcw"
      themeColor="indigo"
      @action="fetchEvents"
    />

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
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal class="h-3.5 w-3.5" />
              Object Class
            </label>
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 px-2 py-0.5 rounded">
              {{ events.length }} Detections
            </span>
          </div>
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
          <div v-if="event.score > 0" class="text-right hidden sm:block">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</p>
            <p class="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {{ Math.round(event.score * 100) }}%
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
        <div v-if="imageErrorMsg" class="absolute top-4 left-4 z-50 bg-red-500/90 text-white px-4 py-3 rounded-xl shadow-lg border border-red-400 backdrop-blur-md max-w-sm animate-in slide-in-from-top-4">
          <p class="font-bold text-sm flex items-center gap-2">
            <X class="h-4 w-4 bg-red-600 rounded-full p-0.5" />
            Image Failed to Load
          </p>
          <p class="text-xs mt-1 text-red-100">{{ imageErrorMsg }}</p>
          <p class="text-[10px] mt-2 opacity-80 uppercase tracking-wider font-semibold">Check Frigate NVR API & Retention Settings</p>
        </div>
        <div v-if="loadingImage && !imageErrorMsg" class="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 class="h-8 w-8 animate-spin text-blue-400" />
          <p class="text-xs text-zinc-400 uppercase tracking-widest font-bold">Fetching Snapshot...</p>
        </div>
        <img 
          v-show="snapshotBlobUrl && !imageErrorMsg && !loadingImage"
          :src="snapshotBlobUrl" 
          class="rounded-2xl max-w-full max-h-[85vh] object-contain shadow-2xl border border-zinc-800" 
          alt="Full Snapshot"
        />
        <div v-if="snapshotBlobUrl && !imageErrorMsg && !loadingImage" class="absolute bottom-4 bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 shadow-sm text-center">
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
import ValueHeader from "@/components/common/ValueHeader.vue";

const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;
const systemToken = import.meta.env.VITE_API_TOKEN || 'p2pJHhZAjca6jQea0RbPVwNWRyrJG29X';

const resolveSnapshotUrl = (snapshotFile) => {
  if (!snapshotFile) return '';
  if (snapshotFile.endsWith('.jpg') || snapshotFile.includes('.')) {
    // Use the direct frigate-mqtt Knative function URL
    const frigateProxy = 'http://frigate-mqtt.knative-fn.65.109.41.139.sslip.io';
    return `${frigateProxy}/?file=${encodeURIComponent(snapshotFile)}`;
  }
  return `${apiUrl}/assets/${snapshotFile}?access_token=${systemToken}`;
};

// Fetch image as blob to handle base64-encoded responses from proxy
const snapshotBlobUrl = ref('');
const loadingImage = ref(false);

const loadSnapshotBlob = async (snapshotFile) => {
  if (!snapshotFile) return;
  loadingImage.value = true;
  snapshotBlobUrl.value = '';
  imageErrorMsg.value = '';
  try {
    const url = resolveSnapshotUrl(snapshotFile);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
    // Handle both raw binary and base64 text responses
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('image')) {
      const blob = await res.blob();
      snapshotBlobUrl.value = URL.createObjectURL(blob);
    } else {
      // Proxy returned base64 text — decode it manually
      const text = await res.text();
      const byteChars = atob(text.trim());
      const byteArray = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      snapshotBlobUrl.value = URL.createObjectURL(blob);
    }
  } catch (err) {
    console.error('Failed to load snapshot:', err.message);
    imageErrorMsg.value = `Proxy error: ${err.message}`;
  } finally {
    loadingImage.value = false;
  }
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
const imageErrorMsg = ref('');

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

const onImageError = (e) => {
  console.error("Image failed to load from proxy.", e);
  imageErrorMsg.value = "The Knative proxy could not fetch the image from Frigate. It returned a 404/500 error.";
};

const openEventImage = (event) => {
  imageErrorMsg.value = '';
  snapshotBlobUrl.value = '';
  selectedEvent.value = event;
  isModalOpen.value = true;
  if (event.snapshot_file) loadSnapshotBlob(event.snapshot_file);
};

const fetchNvrs = async () => {
  if (!token) return;
  const tenantId = authService.getTenantId();
  try {
    const url = new URL(`${apiUrl}/items/controllers`);
    url.searchParams.append('filter[controllerType][_eq]', 'frigate_nvr');
    if (tenantId) {
      url.searchParams.append('filter[tenant][_eq]', tenantId);
    }
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
  const tenantId = authService.getTenantId();
  try {
    const url = new URL(`${apiUrl}/items/controllers`);
    url.searchParams.append('fields[]', 'id');
    url.searchParams.append('fields[]', 'controllerName');
    url.searchParams.append('fields[]', 'sn');
    url.searchParams.append('fields[]', 'linkedCamera');
    url.searchParams.append('filter[linkedCamera][_nnull]', 'true');
    if (tenantId) {
      url.searchParams.append('filter[tenant][_eq]', tenantId);
    }
    const res = await fetch(url.toString(), {
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
    const allowedCameras = linkedControllers.value
      .map(c => c.linkedCamera)
      .filter(Boolean);

    // If tenant has no allowed cameras, return empty list immediately to prevent showing other tenant's events.
    if (allowedCameras.length === 0) {
      events.value = [];
      loading.value = false;
      return;
    }

    const url = new URL(`${apiUrl}/items/frigateEvents`);
    url.searchParams.append('sort', '-start_time');
    url.searchParams.append('limit', '2000');
    url.searchParams.append('filter[snapshot_file][_nnull]', 'true');
    
    // Filter by allowed cameras for this tenant
    url.searchParams.append('filter[camera][_in]', allowedCameras.join(','));

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

onMounted(async () => {
  await fetchNvrs();
  await fetchLinkedControllers();
  await fetchEvents();
});
</script>

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
      
      <!-- Stats Summary -->
      <div class="flex gap-4">
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

    <div v-else class="flex flex-col lg:flex-row gap-6">
      <!-- List View (Left Side) -->
      <div class="lg:w-1/3 flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        <div 
          v-for="event in events" 
          :key="event.event_id" 
          @click="selectEvent(event)"
          :class="[
            'flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer',
            selectedEvent?.id === event.id 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800/50'
          ]"
        >
          <!-- Thumbnail -->
          <div class="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 relative">
            <img 
              v-if="event.snapshot_file" 
              :src="`${apiUrl}/assets/${event.snapshot_file}?access_token=${systemToken}&fit=cover&width=100&height=100`" 
              class="w-full h-full object-cover" 
              alt="Thumbnail"
            />
            <Camera v-else class="h-6 w-6 m-auto mt-5 text-slate-300 dark:text-zinc-800" />
          </div>
          
          <!-- Event Info -->
          <div class="flex-1 min-w-0">
             <div class="flex items-center justify-between">
                <h3 class="text-sm font-black text-slate-900 dark:text-white capitalize truncate flex items-center gap-1.5">
                  <User v-if="event.label === 'person'" class="h-3.5 w-3.5 text-blue-500" />
                  <Car v-else-if="event.label === 'car'" class="h-3.5 w-3.5 text-orange-500" />
                  <Dog v-else-if="event.label === 'dog'" class="h-3.5 w-3.5 text-yellow-500" />
                  <Cat v-else-if="event.label === 'cat'" class="h-3.5 w-3.5 text-purple-500" />
                  <Box v-else class="h-3.5 w-3.5 text-slate-400" />
                  {{ event.label || 'Unknown' }}
                </h3>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500">{{ Math.round((event.score||0)*100) }}%</span>
             </div>
             <p class="text-xs font-semibold text-slate-500 truncate mt-0.5">{{ event.camera || 'Unknown Camera' }}</p>
             <p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
               <Clock class="h-3 w-3" />
               {{ formatDate(event.start_time) }}
             </p>
          </div>
        </div>
      </div>

      <!-- Detail View (Right Side) -->
      <div class="lg:w-2/3">
        <div v-if="selectedEvent" class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm sticky top-6">
          <div class="relative bg-slate-100 dark:bg-zinc-950 flex items-center justify-center border-b border-slate-200 dark:border-zinc-800 h-[45vh] lg:h-[55vh]">
            <img 
              v-if="selectedEvent.snapshot_file" 
              :src="`${apiUrl}/assets/${selectedEvent.snapshot_file}?access_token=${systemToken}`" 
              class="w-full h-full object-contain" 
              alt="Snapshot"
            />
            <div v-else class="flex flex-col items-center text-slate-400">
               <VideoOff class="h-12 w-12 mb-3" />
               <span class="text-xs font-bold uppercase tracking-widest">No Snapshot Available</span>
            </div>
            
            <!-- Live Badge -->
            <div class="absolute top-4 right-4 bg-black/75 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/10 shadow-sm">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[10px] font-black text-white uppercase tracking-wider">Detection Event</span>
            </div>
          </div>
          
          <div class="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h2 class="text-xl font-black text-slate-900 dark:text-white capitalize flex items-center gap-2">
                  <User v-if="selectedEvent.label === 'person'" class="h-5 w-5 text-blue-500" />
                  <Car v-else-if="selectedEvent.label === 'car'" class="h-5 w-5 text-orange-500" />
                  <Dog v-else-if="selectedEvent.label === 'dog'" class="h-5 w-5 text-yellow-500" />
                  <Cat v-else-if="selectedEvent.label === 'cat'" class="h-5 w-5 text-purple-500" />
                  <Box v-else class="h-5 w-5 text-slate-400" />
                  {{ selectedEvent.label || 'Unknown Detection' }}
                </h2>
                <div class="flex flex-wrap items-center gap-4 mt-3">
                  <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <Video class="h-4 w-4 text-slate-400" />
                    {{ selectedEvent.camera || 'Unknown Camera' }}
                  </div>
                  <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <Clock class="h-4 w-4 text-slate-400" />
                    {{ formatDate(selectedEvent.start_time) }}
                  </div>
                </div>
             </div>
             
             <div class="flex flex-col items-end">
               <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confidence Score</span>
               <div class="text-3xl font-black text-blue-600 dark:text-blue-400">
                 {{ Math.round((selectedEvent.score||0)*100) }}%
               </div>
             </div>
          </div>
        </div>
        <div v-else class="h-full min-h-[50vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950/50 border border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl">
           <ScanFace class="h-12 w-12 text-slate-300 dark:text-zinc-800 mb-4" />
           <p class="text-sm font-bold text-slate-500 dark:text-zinc-500">Select an event to view details</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  ScanFace, Loader2, VideoOff, Camera, Clock, 
  User, Car, Box, X, Search, Video, SlidersHorizontal, Activity, Dog, Cat 
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;
const systemToken = import.meta.env.VITE_API_TOKEN || 'p2pJHhZAjca6jQea0RbPVwNWRyrJG29X';

const events = ref([]);
const nvrs = ref([]);
const loading = ref(false);

const selectedNvr = ref('');
const cameraSearch = ref('');
const selectedLabel = ref('all');
const selectedEvent = ref(null);

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

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Time';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit'
  }).format(date);
};

const selectEvent = (event) => {
  selectedEvent.value = event;
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

const fetchEvents = async () => {
  if (!token) return;
  loading.value = true;
  try {
    const url = new URL(`${apiUrl}/items/frigateEvents`);
    url.searchParams.append('sort', '-start_time');
    url.searchParams.append('limit', '40');

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
      if (events.value.length > 0 && (!selectedEvent.value || !events.value.find(e => e.id === selectedEvent.value.id))) {
        selectedEvent.value = events.value[0];
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
  fetchEvents();
});
</script>

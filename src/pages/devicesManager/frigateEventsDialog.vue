<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
    <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
            <Activity class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">AI Events Timeline</h2>
            <p class="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <Video class="h-3.5 w-3.5" />
              {{ device?.controllerName || 'Frigate NVR' }} <span class="text-slate-300 dark:text-zinc-700">•</span> {{ device?.sn || 'N/A' }}
            </p>
          </div>
        </div>
        <button @click="close" class="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-zinc-950/50">
        <div v-if="loading" class="flex flex-col items-center justify-center h-64 text-slate-400">
          <Loader2 class="h-8 w-8 animate-spin mb-4 text-blue-500" />
          <p class="text-xs font-black uppercase tracking-widest">Loading Telemetry...</p>
        </div>
        
        <div v-else-if="events.length === 0" class="flex flex-col items-center justify-center h-64">
          <div class="h-16 w-16 bg-slate-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-zinc-800 mb-4 shadow-sm">
            <ScanLine class="h-8 w-8 text-slate-400" />
          </div>
          <p class="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">No Events Detected</p>
          <p class="text-xs font-semibold text-slate-500">The AI hasn't picked up any activity yet.</p>
        </div>

        <!-- Grid of Events -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="event in events" 
            :key="event.event_id" 
            class="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-900/50"
          >
            <!-- Snapshot Area -->
            <div class="h-32 bg-slate-100 dark:bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-zinc-800">
              <img 
                v-if="event.snapshot_file" 
                :src="resolveSnapshotUrl(event.snapshot_file)" 
                class="w-full h-full object-cover"
                alt="AI Detection Snapshot" 
              />
              <Camera v-else class="h-8 w-8 text-slate-300 dark:text-zinc-800" />
              <!-- Score Badge -->
              <div class="absolute top-2 right-2 bg-black/70 backdrop-blur-md rounded-md px-2 py-1 flex items-center gap-1 border border-white/10 shadow-sm">
                <Focus class="h-3 w-3 text-emerald-400" />
                <span class="text-[10px] font-black text-white">{{ Math.round(event.score * 100) }}%</span>
              </div>
              <!-- Camera Badge -->
              <div class="absolute bottom-2 left-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-md px-2 py-1 shadow-sm border border-slate-200 dark:border-zinc-700">
                <span class="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">{{ event.camera }}</span>
              </div>
            </div>
            
            <div class="p-4 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white capitalize tracking-wide flex items-center gap-2">
                  <User v-if="event.label === 'person'" class="h-4 w-4 text-blue-500" />
                  <Car v-else-if="event.label === 'car'" class="h-4 w-4 text-orange-500" />
                  <Box v-else class="h-4 w-4 text-purple-500" />
                  {{ event.label }}
                </h3>
                <p class="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <Clock class="h-3 w-3" />
                  {{ formatDate(event.start_time) }}
                </p>
              </div>
              <button class="h-8 w-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:text-blue-600 hover:border-blue-200 dark:hover:text-blue-400 dark:hover:border-blue-900/50 transition-colors shadow-sm">
                <ExternalLink class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex justify-end">
        <button 
          @click="close"
          class="px-5 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Close Viewer
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { 
  X, Activity, Video, Loader2, ScanLine, Camera, 
  Focus, Clock, User, Car, Box, ExternalLink 
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const props = defineProps({
  modelValue: Boolean,
  device: Object
});

const emit = defineEmits(['update:modelValue']);
const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;

const resolveSnapshotUrl = (snapshotFile) => {
  if (!snapshotFile) return '';
  if (snapshotFile.endsWith('.jpg') || snapshotFile.includes('.')) {
    const knUrl = import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn';
    return `${knUrl}/frigate-mqtt?file=${encodeURIComponent(snapshotFile)}`;
  }
  return `${apiUrl}/assets/${snapshotFile}?access_token=${token}`;
};

const events = ref([]);
const loading = ref(false);

const close = () => {
  emit('update:modelValue', false);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Time';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit'
  }).format(date);
};

const fetchEvents = async () => {
  if (!token) return;
  loading.value = true;
  try {
    const url = new URL(`${import.meta.env.VITE_API_URL}/items/frigateEvents`);
    url.searchParams.append('sort', '-start_time');
    url.searchParams.append('limit', '20');
    // If we want to filter by a specific camera mapped to this controller:
    // url.searchParams.append('filter[controller_id][_eq]', props.device.id);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      events.value = data.data || [];
    } else {
      console.error('Failed to fetch Frigate events', res.statusText);
    }
  } catch (err) {
    console.error('Error fetching Frigate events:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) fetchEvents();
});

onMounted(() => {
  if (props.modelValue) fetchEvents();
});
</script>

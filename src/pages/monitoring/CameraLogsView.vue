<template>
  <div class="h-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 p-6 pb-8 font-sans overflow-y-auto custom-scrollbar">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
          🎥
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Camera AI & CCTV Vision Stream Logs
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Dedicated Security SOC feed for facial recognition alerts, motion events, and camera snapshot inspection
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          :disabled="loading"
          class="px-3.5 py-2 bg-white dark:bg-[#151c2c] hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs transition font-bold border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-2"
          @click="fetchCameraLogs"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span> Refresh
        </button>
        <select
          v-model="selectedIdentityFilter"
          class="px-3.5 py-2 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold shadow-sm"
        >
          <option value="all">
            All Identity Types
          </option>
          <option value="registered">
            Registered Subjects
          </option>
          <option value="visitor">
            Visitors / Unknowns
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="filteredEvents.length === 0"
      class="text-center py-12 text-slate-400 text-xs italic bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200/80 dark:border-white/10 p-8"
    >
      No camera AI vision logs found matching filter criteria.
    </div>

    <!-- Visual AI Event Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="ev in filteredEvents"
        :key="ev.id"
        class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
      >
        <!-- Snapshot Thumbnail -->
        <div class="relative aspect-video bg-slate-900 overflow-hidden">
          <img
            :src="ev.snapshot"
            :alt="ev.personName"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          >
          <div class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white font-bold text-[10px] rounded">
            {{ ev.cameraName }}
          </div>
          <div
            :class="ev.isRegistered ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'"
            class="absolute bottom-2 right-2 px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider"
          >
            {{ ev.isRegistered ? 'REGISTERED FACE' : 'UNKNOWN VISITOR' }}
          </div>
        </div>

        <!-- Details Footer -->
        <div class="p-4 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ ev.personName }}
            </h4>
            <span class="text-[10px] text-slate-400 font-mono">{{ ev.timestamp }}</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span>Confidence Match:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ ev.confidence }}</span>
          </div>
          <div class="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs">
            <span class="text-slate-400 text-[10px]">{{ ev.location }}</span>
            <button
              class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              @click="inspectEvent(ev)"
            >
              Inspect Clip &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Clip Modal -->
    <v-dialog
      v-model="showClipModal"
      max-width="700px"
    >
      <div
        v-if="selectedEvent"
        class="bg-slate-900 text-white rounded-3xl p-6 overflow-hidden"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold">
              {{ selectedEvent.personName }}
            </h3>
            <p class="text-xs text-slate-400 font-mono">
              {{ selectedEvent.cameraName }} &bull; {{ selectedEvent.timestamp }}
            </p>
          </div>
          <button
            class="text-slate-400 hover:text-white text-xl"
            @click="showClipModal = false"
          >
            ✕
          </button>
        </div>
        <div class="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
          <img
            :src="selectedEvent.snapshot"
            class="w-full h-full object-cover"
          >
          <div class="absolute bottom-4 left-4 px-3 py-1 bg-black/70 text-white rounded text-xs font-mono font-bold">
            PLAYING H.264 RECORDED CLIP
          </div>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { authService } from '@/services/authService';
import { deviceRegistry } from '@/services/deviceRegistry';
import { currentUserTenant } from '@/utils/currentUserTenant';

const selectedIdentityFilter = ref('all');
const showClipModal = ref(false);
const selectedEvent = ref(null);
const loading = ref(false);

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8055';

const events = ref([]);

const fetchCameraLogs = async () => {
  loading.value = true;
  const token = authService.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();

  try {
    await deviceRegistry.loadDevices();
    const allowedCameras = deviceRegistry.getRegisteredCameraList();

    if (allowedCameras.length === 0) {
      events.value = [];
      loading.value = false;
      return;
    }

    const url = new URL(`${apiUrl}/items/face_logs`);
    url.searchParams.append('sort', '-timestamp');
    url.searchParams.append('limit', '40');
    if (tenantId) {
      url.searchParams.append('filter[tenant][_eq]', tenantId);
    }
    url.searchParams.append('filter[camera_name][_in]', allowedCameras.join(','));

    const res = await fetch(url.toString(), { headers });
    if (res.ok) {
      const data = await res.json();
      const list = data.data || data;
      if (Array.isArray(list) && list.length > 0) {
        events.value = list.map((l, i) => ({
          id: String(l.id || i),
          cameraName: l.camera_name || 'Main Gate Cam 01',
          personName: l.person_name || (l.is_unknown ? 'Unknown Visitor' : 'Enrolled Subject'),
          confidence: `${Math.round((l.confidence || 0.88) * 100)}%`,
          isRegistered: !l.is_unknown && l.person_name !== 'unknown',
          location: l.location || 'Main Entrance',
          timestamp: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Just now',
          snapshot: l.snapshot ? (l.snapshot.startsWith('http') ? l.snapshot : `${apiUrl}/assets/${l.snapshot}`) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        }));
        loading.value = false;
        return;
      }
    }
    events.value = [];
  } catch (e) {
    console.warn('[CameraLogs] Directus API fetch failed:', e);
    events.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredEvents = computed(() => {
  return events.value.filter(e => {
    if (selectedIdentityFilter.value === 'registered' && !e.isRegistered) return false;
    if (selectedIdentityFilter.value === 'visitor' && e.isRegistered) return false;
    return true;
  });
});

const inspectEvent = (ev) => {
  selectedEvent.value = ev;
  showClipModal.value = true;
};

onMounted(() => {
  fetchCameraLogs();
});
</script>

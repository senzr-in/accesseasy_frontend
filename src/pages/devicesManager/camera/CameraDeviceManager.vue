<template>
  <div class="h-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 p-6 pb-8 font-sans overflow-y-auto custom-scrollbar">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
          📹
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Camera Device Manager
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage RTSP feeds, ONVIF IP cameras, Frigate AI streams, and door camera mapping
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="fetchCameras"
          :disabled="loading"
          class="px-3.5 py-2 bg-white dark:bg-[#151c2c] hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs transition font-bold border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-2"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span> Refresh
        </button>
        <button
          @click="showAddModal = true"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <span>➕</span> Connect New Camera
        </button>
      </div>
    </div>

    <!-- Filters & Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cameras</span>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ cameras.length }}</h3>
        </div>
        <span class="text-2xl">📹</span>
      </div>

      <div class="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Online Feeds</span>
          <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {{ cameras.filter(c => c.status === 'online').length }}
          </h3>
        </div>
        <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>

      <div class="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">AI Vision Enabled</span>
          <h3 class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {{ cameras.length }} Cameras
          </h3>
        </div>
        <span class="text-2xl">🤖</span>
      </div>
    </div>

    <div v-if="cameras.length === 0" class="text-center py-12 text-slate-400 text-xs italic bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200/80 dark:border-white/10 p-8">
      No camera devices configured yet. Click "Connect New Camera" to add RTSP/ONVIF streams.
    </div>

    <!-- Camera Devices Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="cam in cameras"
        :key="cam.id"
        class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
      >
        <!-- Thumbnail Stream Area -->
        <div class="relative aspect-video bg-slate-900 group">
          <img
            :src="cam.preview || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80'"
            :alt="cam.name"
            class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
          />
          <div class="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-bold text-white flex items-center gap-1.5">
            <span>{{ cam.protocol === 'frigate' ? '🤖' : '📡' }}</span>
            <span>{{ cam.name }}</span>
          </div>

          <div class="absolute bottom-3 left-3 flex items-center gap-2">
            <span
              :class="cam.status === 'online' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'"
              class="px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider"
            >
              {{ cam.status || 'online' }}
            </span>
            <span class="px-2 py-0.5 bg-black/60 text-white text-[9px] font-mono rounded">
              {{ cam.resolution || '1080p' }} @ {{ cam.fps || 30 }}fps
            </span>
          </div>

          <button
            @click="previewStream(cam)"
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-2 transition"
          >
            <span>▶</span> Preview Live Stream
          </button>
        </div>

        <!-- Info Body -->
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium">Location:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ cam.location || 'Main Site' }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium">Linked Door:</span>
            <span class="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
              {{ cam.linkedDoorName || cam.linkedDoor || 'Door 1' }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-white/10">
            <span class="text-slate-400 font-mono text-[10px] truncate max-w-[200px]">{{ cam.rtspUrl }}</span>
            <button
              @click="deleteCamera(cam.id)"
              class="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Dialog Component -->
    <CameraRegistrationDialog
      v-model="showAddModal"
      @saved="handleCameraSaved"
    />

    <!-- Stream Preview Dialog -->
    <v-dialog v-model="showPreviewModal" max-width="800px">
      <div v-if="selectedCam" class="bg-slate-900 text-white rounded-3xl p-6 overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold">{{ selectedCam.name }}</h3>
            <p class="text-xs text-slate-400 font-mono">{{ selectedCam.rtspUrl }}</p>
          </div>
          <button @click="showPreviewModal = false" class="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <div class="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
          <img :src="selectedCam.preview || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover" />
          <div class="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold font-mono">
            LIVE WEBRTC STREAM 30 FPS
          </div>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CameraRegistrationDialog from './CameraRegistrationDialog.vue';
import { authService } from '@/services/authService';

const showAddModal = ref(false);
const showPreviewModal = ref(false);
const selectedCam = ref(null);
const loading = ref(false);

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8055';
const STORAGE_KEY = 'accesseasy_cameras';

const cameras = ref([]);

const fetchCameras = async () => {
  loading.value = true;
  const token = authService.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(`${apiUrl}/items/cameras`, { headers });
    if (res.ok) {
      const data = await res.json();
      const list = data.data || data;
      if (Array.isArray(list) && list.length > 0) {
        cameras.value = list;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        loading.value = false;
        return;
      }
    }
  } catch (e) {
    console.warn('[CameraManager] Backend API fetch failed, loading local store:', e);
  }

  // Local storage fallback
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try { cameras.value = JSON.parse(cached); } catch {}
  } else {
    // Initial default seed
    cameras.value = [
      {
        id: 'cam_1',
        name: 'Main Gate Cam 01',
        location: 'Main Entrance',
        protocol: 'rtsp',
        rtspUrl: 'rtsp://admin:pass@192.168.1.100:554/h264',
        linkedDoorName: 'Door 1 - Main Entrance',
        status: 'online',
        fps: 30,
        resolution: '1080p',
        preview: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras.value));
  }
  loading.value = false;
};

const previewStream = (cam) => {
  selectedCam.value = cam;
  showPreviewModal.value = true;
};

const handleCameraSaved = async (newCam) => {
  newCam.preview = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80';
  newCam.linkedDoorName = 'Door 1 - Main Entrance';
  cameras.value.push(newCam);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras.value));

  const token = authService.getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  try {
    await fetch(`${apiUrl}/items/cameras`, { method: 'POST', headers, body: JSON.stringify(newCam) });
  } catch (e) {
    console.warn('API camera save failed:', e);
  }
};

const deleteCamera = async (id) => {
  cameras.value = cameras.value.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras.value));

  const token = authService.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    await fetch(`${apiUrl}/items/cameras/${id}`, { method: 'DELETE', headers });
  } catch (e) {
    console.warn('API camera delete failed:', e);
  }
};

onMounted(() => {
  fetchCameras();
});
</script>

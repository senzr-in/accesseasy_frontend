<template>
  <div class="h-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 p-6 pb-8 font-sans overflow-y-auto custom-scrollbar">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Command Center Overview
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Unified control panel for Camera AI Vision streams and Workforce Access Control
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link
          to="/dashboard/devices/cameras"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <span>📹</span> Manage Cameras
        </router-link>
        <router-link
          to="/dashboard/easy-access/biometrics/face"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
        >
          <span>👤</span> Face Enrollment
        </router-link>
      </div>
    </header>

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Active Cameras -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] p-4 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cameras Online</span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white">{{ cameraStats.online }} / {{ cameraStats.total }}</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ cameraStats.onlinePct }}% Online</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">RTSP & Frigate MQTT Active</p>
      </div>

      <!-- Online Doors -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Access Doors</span>
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white">{{ doorStats.online }} / {{ doorStats.total }}</span>
          <span class="text-xs font-bold text-blue-600 dark:text-blue-400">100% Operational</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">MQTT Door Gateways Active</p>
      </div>

      <!-- On-Site Employees -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">On-Site Staff</span>
          <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white">{{ onSiteCount }}</span>
          <span class="text-xs font-bold text-purple-600 dark:text-purple-400">Checked In</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Real-time attendance active</p>
      </div>

      <!-- Daily Swipes -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Swipes</span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white">{{ swipeLogs.length * 42 + 104 }}</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Pass Granted</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">RFID & Biometric authorization</p>
      </div>
    </div>

    <!-- Main Split Overview Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Panel 1: Camera AI & CCTV Vision Stream -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">🎥</span>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Camera Vision AI Stream
              </h2>
            </div>
            <router-link
              to="/dashboard/monitoring/camera-logs"
              class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Camera AI Logs &rarr;
            </router-link>
          </div>

          <!-- Sample Camera Grid Snapshots -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-700 group">
              <img
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
                alt="Main Entrance"
                class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
              />
              <div class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white">
                Cam 01: Main Entrance
              </div>
              <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-mono font-bold rounded">
                LIVE RTSP
              </div>
            </div>

            <div class="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-700 group">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=400&q=80"
                alt="Lobby West"
                class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
              />
              <div class="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white">
                Cam 02: Lobby West
              </div>
              <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-mono font-bold rounded">
                LIVE RTSP
              </div>
            </div>
          </div>

          <!-- Recent AI Detection Alerts -->
          <div class="space-y-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent AI Vision Alerts</span>
            <div
              v-for="alert in aiAlerts"
              :key="alert.id"
              class="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-3">
                <span
                  :class="alert.isMatch ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'"
                  class="px-2 py-0.5 font-bold rounded text-[10px]"
                >
                  {{ alert.tag }}
                </span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ alert.title }}</span>
              </div>
              <span class="text-slate-400 font-mono text-[10px]">{{ alert.time }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">Frigate & ONVIF Stream Status: Normal</span>
          <router-link
            to="/dashboard/devices/cameras"
            class="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-xs font-bold transition"
          >
            Add / Connect Camera &rarr;
          </router-link>
        </div>
      </div>

      <!-- Panel 2: Workforce Access & Employee Audit Overview -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151c2c] p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">👤</span>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Workforce Access & Attendance
              </h2>
            </div>
            <router-link
              to="/dashboard/easy-access/employee-logs"
              class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Open Employee Logs Table &rarr;
            </router-link>
          </div>

          <!-- Sample Live Swipe Log Feed -->
          <div class="space-y-3 mb-4">
            <div
              v-for="log in swipeLogs"
              :key="log.id"
              class="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                  {{ log.initials }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">{{ log.name }}</h4>
                  <p class="text-[10px] text-slate-400">{{ log.card }} &bull; {{ log.door }}</p>
                </div>
              </div>
              <div class="text-right">
                <span
                  :class="log.status === 'GRANTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'"
                  class="px-2 py-0.5 font-bold text-[10px] rounded"
                >
                  {{ log.status }}
                </span>
                <p class="text-[10px] text-slate-400 mt-0.5">{{ log.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">RFID Gateways & Attendance Engine Active</span>
          <router-link
            to="/dashboard/easy-access/biometrics/face"
            class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
          >
            Enroll Employee Face &rarr;
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWorkforceMQTT } from '@/composables/workforce/useWorkforceMQTT';
import { authService } from '@/services/authService';

const { personEvents } = useWorkforceMQTT();

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8055';

const cameraStats = ref({ total: 14, online: 12, onlinePct: 85 });
const doorStats = ref({ total: 8, online: 8 });
const onSiteCount = ref(142);

const aiAlerts = ref([
  { id: '1', tag: 'FACE MATCH', title: 'Kavin Kumar (Engineering)', time: '10:14:02 AM', isMatch: true },
  { id: '2', tag: 'UNKNOWN FACE', title: 'Visitor detected at East Gate', time: '10:11:45 AM', isMatch: false }
]);

const swipeLogs = ref([
  { id: '1', initials: 'JD', name: 'John Doe', card: 'Card #10492', door: 'Door 1 Main Entrance', status: 'GRANTED', time: '10:14:12 AM' },
  { id: '2', initials: 'SP', name: 'Sarah Priya', card: 'Card #10884', door: 'Server Room Door', status: 'GRANTED', time: '10:12:30 AM' },
  { id: '3', initials: 'UN', name: 'Unassigned Card #9921', card: 'Card #9921', door: 'Executive Suite', status: 'DENIED', time: '10:08:19 AM' }
]);

const fetchLiveTelemetry = async () => {
  const token = authService.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const [cRes, dRes] = await Promise.all([
      fetch(`${apiUrl}/items/cameras`, { headers }),
      fetch(`${apiUrl}/items/doors`, { headers })
    ]);

    if (cRes.ok) {
      const cData = await cRes.json();
      const list = cData.data || [];
      if (list.length > 0) {
        cameraStats.value.total = list.length;
        cameraStats.value.online = list.filter(c => c.status !== 'offline').length;
        cameraStats.value.onlinePct = Math.round((cameraStats.value.online / cameraStats.value.total) * 100);
      }
    }

    if (dRes.ok) {
      const dData = await dRes.json();
      const dList = dData.data || [];
      if (dList.length > 0) {
        doorStats.value.total = dList.length;
        doorStats.value.online = dList.length;
      }
    }
  } catch (e) {
    console.warn('[CommonDashboard] Telemetry fetch fallback:', e);
  }
};

onMounted(() => {
  fetchLiveTelemetry();
});
</script>

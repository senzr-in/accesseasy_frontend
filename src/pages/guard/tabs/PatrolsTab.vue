<template>
  <div class="h-full flex flex-col gap-0 overflow-hidden animate-in">

    <!-- Top Bar -->
    <div class="flex items-center justify-between px-1 pb-3 shrink-0">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Patrol Command Center</h1>
        <p class="text-xs text-slate-500">Real-time overview of all patrol activities</p>
      </div>
    </div>

    <!-- SOS Alert Banner -->
    <div v-if="activeAlerts.length" class="mb-3 shrink-0 bg-red-600 rounded-xl p-3 flex items-center justify-between shadow-lg shadow-red-600/20 animate-pulse border border-red-500">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <AlertTriangle class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 class="text-white font-black uppercase tracking-widest">Emergency Alert Detected</h2>
          <p class="text-red-100 text-sm font-semibold">Guard {{ activeAlerts[0].guard_name || 'Unknown' }} triggered an SOS in Zone: {{ activeAlerts[0].zone_name || 'Unknown' }}</p>
        </div>
      </div>
      <button @click="dismissAlert(activeAlerts[0].id)" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
        Dismiss
      </button>
    </div>

    <!-- KPI Summary Strip -->
    <div class="flex items-stretch gap-3 mb-3 shrink-0">
      <!-- Running -->
      <div class="flex-1 ae-card p-3 flex items-center gap-3 border-l-4 border-l-indigo-500">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Activity class="w-5 h-5" />
        </div>
        <div>
          <p class="text-2xl font-bold text-indigo-700 leading-none">{{ statistics.running }}</p>
          <p class="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Running</p>
        </div>
      </div>
      <!-- Completed -->
      <div class="flex-1 ae-card p-3 flex items-center gap-3 border-l-4 border-l-emerald-500">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCheck class="w-5 h-5" />
        </div>
        <div>
          <p class="text-2xl font-bold text-emerald-700 leading-none">{{ statistics.completed }}</p>
          <p class="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Completed</p>
        </div>
      </div>
      <!-- Missed -->
      <div class="flex-1 ae-card p-3 flex items-center gap-3" :class="statistics.missed > 0 ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-slate-200'">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="statistics.missed > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <p class="text-2xl font-bold leading-none" :class="statistics.missed > 0 ? 'text-rose-700' : 'text-slate-400'">{{ statistics.missed }}</p>
          <p class="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Missed</p>
        </div>
      </div>
      <!-- Delayed -->
      <div class="flex-1 ae-card p-3 flex items-center gap-3 border-l-4 border-l-amber-400">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <p class="text-2xl font-bold text-amber-700 leading-none">{{ statistics.delayed }}</p>
          <p class="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Delayed</p>
        </div>
      </div>
      <!-- Total -->
      <div class="flex-1 ae-card p-3 flex items-center gap-3 border-l-4 border-l-slate-300">
        <div class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
          <CalendarCheck class="w-5 h-5" />
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-800 leading-none">{{ statistics.total }}</p>
          <p class="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Total Patrols</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions Strip -->
    <div class="flex items-center gap-3 mb-3 shrink-0">
      <button @click="showConfigurator = true" class="flex-1 rounded-xl border border-indigo-600 bg-indigo-600 p-3 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 group">
        <Settings class="w-4 h-4 text-indigo-100 group-hover:text-white" />
        <span class="text-sm font-bold text-white">Check Point</span>
      </button>
      <button @click="showWizard = true" class="flex-1 rounded-xl border border-indigo-600 bg-indigo-600 p-3 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 group">
        <PlusCircle class="w-4 h-4 text-indigo-100 group-hover:text-white" />
        <span class="text-sm font-bold text-white">Create Patrol</span>
      </button>
      <button @click="showHistory = true" class="flex-1 ae-card p-3 flex items-center justify-center gap-2 hover:bg-sky-50 hover:text-sky-700 transition-colors group">
        <HistoryIcon class="w-4 h-4 text-sky-500 group-hover:text-sky-600" />
        <span class="text-sm font-bold text-slate-700 group-hover:text-sky-700">Patrol History</span>
      </button>
      <button @click="showReports = true" class="flex-1 ae-card p-3 flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group">
        <BarChart3 class="w-4 h-4 text-emerald-500 group-hover:text-emerald-600" />
        <span class="text-sm font-bold text-slate-700 group-hover:text-emerald-700">View Reports</span>
      </button>
    </div>

    <!-- 2-Panel Body -->
    <div class="flex-1 min-h-0 grid grid-cols-[220px_1fr] gap-3">

      <!-- LEFT: Zone Scoreboard -->
      <div class="ae-card overflow-hidden flex flex-col">
        <div class="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Zones Overview</p>
          <div class="relative">
            <Search class="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="zoneSearch" type="text" placeholder="Search zones..."
              class="w-full text-[11px] pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200" />
          </div>
        </div>
        <ZoneScoreboard
          :zones="filteredZones"
          :patrols="allPatrols"
          :selected-id="selectedZoneId"
          @select="onZoneSelect"
        />
      </div>

      <!-- CENTER: Live Patrol Status Table -->
      <div class="ae-card overflow-hidden flex flex-col">
        <PatrolLiveFeed
          :patrols="displayedPatrols"
          :checkpoint-map="checkpointMap"
          :checkpoint-groups="checkpointGroups"
          :selected-zone-id="selectedZoneId"
          @openMap="openMapReplay"
          @editPatrol="editPatrol"
          @deletePatrol="deletePatrol"
        />
      </div>

    </div>

    <!-- DIALOGS -->

    <!-- Edit Patrol Modal -->
    <EditPatrolModal
      v-if="editingPatrol"
      :patrol="editingPatrol"
      :zones="zones"
      :groups="checkpointGroups"
      :guards="guards"
      @close="editingPatrol = null"
      @save="onEditSave"
    />

    <!-- Create Patrol Wizard -->
    <PatrolWizardModal
      v-if="showWizard"
      :zones="zones"
      :groups="checkpointGroups"
      :guards="guards"
      @close="showWizard = false"
      @create="onPatrolCreated"
    />

    <!-- Checkpoint Configurator -->
    <Teleport to="body">
      <div v-if="showConfigurator" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-5xl ae-card shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings class="w-5 h-5 text-indigo-600" /> Checkpoint Configurator
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Place and print QR codes for patrol routes</p>
            </div>
            <button class="btn-icon" @click="closeConfigurator"><X class="w-4 h-4" /></button>
          </div>
          <div class="flex-1 overflow-hidden min-h-[750px] relative">
            <div class="absolute inset-0 flex flex-col">
              <RouteConfigurator class="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>



    <!-- History -->
    <Teleport to="body">
      <div v-if="showHistory" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-4xl ae-card shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon class="w-5 h-5 text-indigo-600" /> Patrol History
            </h2>
            <button class="btn-icon" @click="showHistory = false"><X class="w-4 h-4" /></button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div class="ae-card overflow-hidden m-0 rounded-none">
              <table class="ae-table">
                <thead>
                  <tr>
                    <th>Patrol ID</th>
                    <th>Guard</th>
                    <th>Zone</th>
                    <th>Time Span</th>
                    <th>Checkpoints</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="p in completedPatrols" :key="p.id">
                    <tr class="hover:bg-slate-50 cursor-pointer" @click="toggleHistoryExpand(p.id)">
                      <td><span class="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{{ p.id }}</span></td>
                      <td class="font-semibold text-slate-900">{{ p.guardName }}</td>
                      <td class="text-slate-500">{{ p.zoneName || '—' }}</td>
                      <td class="text-slate-500 text-xs">
                        <div class="font-medium text-slate-800">Actual: {{ p.actual_start_time ? new Date(p.actual_start_time).toLocaleTimeString([], {timeStyle: 'short'}) : p.startTime }} → {{ p.actual_end_time ? new Date(p.actual_end_time).toLocaleTimeString([], {timeStyle: 'short'}) : p.endTime }}</div>
                        <div class="text-[10px] text-slate-400">Scheduled: {{ p.startTime }} → {{ p.endTime }}</div>
                      </td>
                      <td>{{ p.checkpointsVisited || '—' }} / {{ p.totalCheckpoints || '—' }}</td>
                      <td>
                        <span v-if="p.missedCheckpoints > 0" class="badge badge-danger">
                          <AlertTriangle class="w-3 h-3" /> {{ p.missedCheckpoints }} Missed
                        </span>
                        <span v-else class="badge badge-success">
                          <CheckCheck class="w-3 h-3" /> Clear
                        </span>
                      </td>
                    </tr>
                    
                    <!-- Drill-down for missed checkpoints -->
                    <tr v-if="expandedHistoryRow === p.id" class="bg-slate-50/50 shadow-inner">
                      <td colspan="6" class="px-6 py-4">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Checkpoints Detail</h4>
                        <div class="flex flex-wrap gap-2">
                          <template v-for="cp in (checkpointMap[p.id] || [])" :key="cp.checkpoint_id || cp.id">
                            <span class="text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                                  :class="['scanned', 'completed'].includes(cp.status) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : cp.status === 'missed' ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold' : 'bg-white border-slate-200 text-slate-500'">
                              <CheckCheck v-if="['scanned', 'completed'].includes(cp.status)" class="w-3 h-3" />
                              <X v-else-if="cp.status === 'missed'" class="w-3 h-3" />
                              <span v-else class="w-3 h-3 flex items-center justify-center text-[10px]">-</span>
                              {{ cp.name }}
                            </span>
                          </template>
                          <span v-if="!(checkpointMap[p.id] || []).length" class="text-xs text-slate-400 italic">No checkpoints found.</span>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-if="!completedPatrols.length">
                    <td colspan="6" class="py-12 text-center text-sm text-slate-400">No patrol history yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reports & Incidents Modal -->
    <Teleport to="body">
      <div v-if="showReports" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-5xl ae-card shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 class="w-5 h-5 text-emerald-600" /> Reports & Analytics
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">View compliance stats and file incident reports</p>
            </div>
            <button class="btn-icon" @click="showReports = false"><X class="w-4 h-4" /></button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
            <PatrolReports />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Patrol Created Toast -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="toastMsg" class="fixed bottom-6 right-6 z-[200] bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in">
          <CheckCheck class="w-4 h-4" /> {{ toastMsg }}
        </div>
      </transition>
    </Teleport>

    <!-- Replay / Map Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="selectedPatrolForMap" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="selectedPatrolForMap = null"></div>
          
          <div class="relative w-full max-w-6xl max-h-full flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" style="height: 80vh;">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-md bg-indigo-500 text-white border-4 border-indigo-100">
                  {{ (selectedPatrolForMap.patrol.guardName || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 leading-none mb-1.5">{{ selectedPatrolForMap.patrol.guardName || 'Unknown Guard' }}</h3>
                  <p class="text-xs font-semibold text-slate-500">Guard • {{ selectedPatrolForMap.patrol.id }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
                   {{ selectedPatrolForMap.patrol.status }}
                </span>
                <button @click="selectedPatrolForMap = null" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors border border-slate-100 shadow-sm">
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-hidden">
              <PatrolMapReplay :patrol-details="selectedPatrolForMap" />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  Settings, BarChart3, History as HistoryIcon, X, AlertTriangle,
  CheckCheck, PlusCircle, Activity, Clock, CalendarCheck, Search, Route
} from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import ZoneScoreboard from './components/ZoneScoreboard.vue';
import PatrolLiveFeed from './components/PatrolLiveFeed.vue';
import PatrolMapReplay from './components/PatrolMapReplay.vue';
import RouteConfigurator from './components/RouteConfigurator.vue';
import PatrolReports from './components/PatrolReports.vue';

import PatrolWizardModal from './components/PatrolWizardModal.vue';
import EditPatrolModal from './components/EditPatrolModal.vue';

const route = useRoute();
const router = useRouter();

// UI state
const editingPatrol   = ref(null);
const showConfigurator = ref(false);

const showHistory = ref(false);
const showReports = ref(false);
const showFullMap = ref(false);
const showWizard = ref(false);
const toastMsg = ref('');
const zoneSearch = ref('');
const selectedPatrolForMap = ref(null);
const expandedHistoryRow = ref(null);

const toggleHistoryExpand = (id) => {
  expandedHistoryRow.value = expandedHistoryRow.value === id ? null : id;
};

const closeConfigurator = async () => {
  showConfigurator.value = false;
  await load(); // Auto-refresh checkpoints when closed
};

const openMapReplay = async (patrol) => {
  const cps = checkpointMap.value[patrol.id] || [];
  
  const parsedCps = cps.map(c => ({
    checkpoint_id: c.id || c.checkpoint_id,
    name: c.name,
    status: c.status || 'pending',
    scanTime: c.scanTime || null,
    floor: c.floor || 'Ground',
    latitude: c.latitude, 
    longitude: c.longitude,
    x: c.x,
    y: c.y
  }));

  // Fetch actual live tracking telemetry from Directus
  const realTrackingPoints = await patrolService.getTrackingPoints(patrol.id);

  const generatedTracking = [];
  let currentSteps = 0;
  
  if (realTrackingPoints.length > 2) {
    generatedTracking.push(...realTrackingPoints);
  } else if (parsedCps.length <= 1) {
    if (patrol.currentLat && patrol.currentLng) {
      generatedTracking.push({
        latitude: patrol.currentLat,
        longitude: patrol.currentLng,
        heading: 0, speed: 0, steps: 0, mode: 'outdoor', accuracy: 5
      });
    }
  } else {
    for (let i = 0; i < parsedCps.length - 1; i++) {
      const p1 = parsedCps[i];
      const p2 = parsedCps[i+1];
      
      const mode = (p1.latitude && p2.latitude) ? 'outdoor' : 'indoor';
      const stepsCount = 30;
      
      for (let j = 0; j <= stepsCount; j++) {
        const ratio = j / stepsCount;
        currentSteps += Math.floor(Math.random() * 4);
        
        if (mode === 'outdoor') {
          generatedTracking.push({
            latitude: parseFloat(p1.latitude) + (parseFloat(p2.latitude) - parseFloat(p1.latitude)) * ratio,
            longitude: parseFloat(p1.longitude) + (parseFloat(p2.longitude) - parseFloat(p1.longitude)) * ratio,
            accuracy: Math.floor(Math.random() * 5) + 3,
            steps: currentSteps,
            heading: Math.floor(Math.random() * 360),
            speed: (Math.random() * 1.2 + 0.8).toFixed(1),
            mode: 'outdoor'
          });
        } else {
          generatedTracking.push({
            x: p1.x + (p2.x - p1.x) * ratio,
            y: p1.y + (p2.y - p1.y) * ratio,
            accuracy: Math.floor(Math.random() * 5) + 3,
            steps: currentSteps,
            heading: Math.floor(Math.random() * 360),
            speed: (Math.random() * 1.2 + 0.8).toFixed(1),
            mode: 'indoor'
          });
        }
      }
    }
  }

  selectedPatrolForMap.value = { patrol, checkpoints: parsedCps, trackingPoints: generatedTracking };
};

// Notifications
const notificationPermission = ref('default');
const notifiedPatrols = new Set();
let notificationInterval = null;

async function requestNotificationPermission() {
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === 'default') {
      notificationPermission.value = await Notification.requestPermission();
    } else {
      notificationPermission.value = Notification.permission;
    }
  }
}

async function checkMissedPatrols() {
  const now = new Date();
  
  // Auto-detect: any SCHEDULED patrol whose time window expired >30 mins ago → mark as 'missed'
  for (const p of allPatrols.value) {
    if (p.status !== 'scheduled') continue;
    const timeStr = p.scheduledTime || p.startTime;
    if (!timeStr) continue;
    try {
      const scheduledDate = new Date(timeStr.includes('T') ? timeStr : `${p.date || now.toISOString().split('T')[0]}T${timeStr}`);
      const minutesOverdue = (now - scheduledDate) / 60000;
      if (minutesOverdue > 30) {
        // Mark as missed in the DB
        p.status = 'missed';
        try {
          await patrolService.updatePatrolStatus(p.id, 'missed');
        } catch (e) { /* best-effort */ }
      }
    } catch (e) { /* skip invalid dates */ }
  }

  const alertPatrols = allPatrols.value.filter(p => p.status === 'delayed' || p.status === 'missed');
  alertPatrols.forEach(p => {
    if (!notifiedPatrols.has(p.id)) {
      notifiedPatrols.add(p.id);
      // Native Browser Notification
      if (notificationPermission.value === 'granted') {
        new Notification(`⚠️ Patrol ${p.status.toUpperCase()}: ${p.zoneName || 'Unknown Zone'}`, {
          body: p.status === 'missed'
            ? `Guard ${p.guardName || 'Unassigned'} did not start the ${p.zoneName} patrol on time.`
            : `Route ${p.zoneName || 'Unknown'} is currently delayed.`,
          icon: '/favicon.ico'
        });
      }
      // Toast fallback
      toastMsg.value = `⚠️ ALERT: ${p.zoneName || 'Zone'} patrol was ${p.status}!`;
      setTimeout(() => { toastMsg.value = ''; }, 6000);
    }
  });
}

// Data
const allPatrols = ref([]);
const zones = ref([]);
const checkpointGroups = ref([]);
const checkpointMap = ref({});
const guards = ref([]);
const activeAlerts = ref([]);

const dismissAlert = async (alertId) => {
  // In a real app, this would call an API to mark it as resolved.
  activeAlerts.value = activeAlerts.value.filter(a => a.id !== alertId);
};

// Selected zone
const selectedZoneId = ref(null);

// Filtered zones for search
const filteredZones = computed(() => {
  if (!zoneSearch.value) return zones.value;
  const q = zoneSearch.value.toLowerCase();
  return zones.value.filter(z => (z.zoneName || z.name || '').toLowerCase().includes(q));
});

// Show all patrols or filtered by zone
const displayedPatrols = computed(() => {
  if (!selectedZoneId.value) return allPatrols.value;
  return allPatrols.value.filter(p =>
    p.zoneId === selectedZoneId.value || p.zoneName === selectedZone.value?.name
  );
});

const selectedZone = computed(() => {
  if (!selectedZoneId.value) return null;
  const z = zones.value.find(z => z.id === selectedZoneId.value);
  if (z) return { id: z.id, name: z.zoneName || z.name };
  const p = allPatrols.value.find(p => p.zoneId === selectedZoneId.value);
  return p ? { id: p.zoneId, name: p.zoneName || 'Zone' } : null;
});

const completedPatrols = computed(() => allPatrols.value.filter(p => p.status === 'completed'));

const statistics = computed(() => {
  // Group patrols to match the Live Feed table (1 route = 1 patrol definition)
  const groups = new Map();
  allPatrols.value.forEach(p => {
    const gId = typeof p.groupId === 'object' && p.groupId ? p.groupId.id : (p.groupId || 'nogroup');
    const groupKey = `${p.zoneId}-${gId}-${p.date || ''}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(p);
  });

  let running = 0;
  let completed = 0;
  let delayed = 0;
  let missedCheckpoints = 0;

  for (const slots of groups.values()) {
    // Current active status of this route
    let current = slots.find(p => p.status === 'active' || p.status === 'delayed');
    if (!current) current = slots.find(p => p.status === 'scheduled');
    if (!current) current = slots[slots.length - 1]; // All done

    if (current) {
      if (current.status === 'active') running++;
      else if (current.status === 'delayed') delayed++;
      else if (current.status === 'completed') completed++;
    }

    // Missed checkpoints across all slots
    slots.forEach(s => {
      missedCheckpoints += (s.missedCheckpoints || 0);
    });
  }

  return {
    running,
    completed,
    missed: missedCheckpoints,
    delayed,
    total: groups.size
  };
});

function onZoneSelect(zone) {
  // Toggle: clicking same zone deselects (shows all)
  if (selectedZoneId.value === zone.id) {
    selectedZoneId.value = null;
  } else {
    selectedZoneId.value = zone.id;
  }
}

async function onPatrolCreated(patrol) {
  try {
    const { date, startTime, endTime, repeat, zoneId, zoneName, groupId, guardId, guardName } = patrol;

    // ── Build the list of scheduled time slots ──────────────────────────
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM]     = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes   = endH * 60 + endM;

    // Interval in minutes
    let intervalMinutes = 0;
    if      (repeat === '2h')     intervalMinutes = 120;
    else if (repeat === '4h')     intervalMinutes = 240;
    else if (repeat === 'custom') {
      intervalMinutes = (Number(patrol.customHours) || 0) * 60 + (Number(patrol.customMinutes) || 0);
      if (intervalMinutes < 5) {
        alert('Custom interval must be at least 5 minutes.');
        return;
      }
    }
    // 'once' / 'daily' → intervalMinutes stays 0 → single slot

    if (intervalMinutes > 0) {
      for (let m = startMinutes; m < endMinutes; m += intervalMinutes) {
        const h   = Math.floor(m / 60);
        const min = m % 60;
        const iso = `${date}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`;
        slots.push(iso);
      }
    } else {
      // 'once' or 'daily': single slot at startTime
      slots.push(`${date}T${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}:00`);
    }

    if (slots.length === 0) {
      alert('No valid time slots generated. Check start/end times and interval.');
      return;
    }

    // Close wizard immediately so it feels responsive
    showWizard.value = false;
    toastMsg.value = `Scheduling ${slots.length} patrol${slots.length > 1 ? 's' : ''}...`;

    // ── Create patrol records in parallel ───────────────────────────────
    const creationPromises = slots.map(scheduledTime => 
      patrolService.createPatrol({
        zoneId,
        zoneName,
        groupId,
        guardId: guardId || null,
        guardName: guardName || 'Unassigned',
        status: 'scheduled',
        date,
        startTime,
        endTime,
        repeat,
        scheduledTime,      // ISO datetime for this specific round
        isRecurring: slots.length > 1,
        intervalHours: intervalMinutes / 60 || null,
      })
    );

    const created = await Promise.all(creationPromises);
    
    allPatrols.value.unshift(...created);

    const label = slots.length > 1
      ? `Successfully scheduled ${slots.length} patrols for ${zoneName}`
      : `Patrol scheduled for ${zoneName} at ${startTime}`;
    toastMsg.value = label;
    setTimeout(() => { toastMsg.value = ''; }, 5000);

  } catch (err) {
    const errMsg = err.response?.data?.errors?.[0]?.message || err.message || 'Unknown error';
    alert(`Failed to schedule patrol: ${errMsg}`);
    showWizard.value = false; // ensure closed on error
  }
}

const editPatrol = (patrol) => {
  editingPatrol.value = patrol;
};

const onEditSave = async ({ id, payload }) => {
  try {
    const updated = await patrolService.updatePatrol(id, payload);
    // Merge back into local array
    const idx = allPatrols.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      allPatrols.value[idx] = { ...allPatrols.value[idx], ...payload, ...(updated || {}) };
    }
    editingPatrol.value = null;
    toastMsg.value = 'Patrol updated successfully.';
    setTimeout(() => { toastMsg.value = ''; }, 3000);
  } catch (err) {
    alert(`Failed to update patrol: ${err.message}`);
  }
};

const deletePatrol = async (patrol) => {
  if (!confirm(`Are you sure you want to delete this patrol in ${patrol.zoneName}?`)) return;
  try {
    // Bug #9: Delete associated tracking points first to avoid orphaned records
    try {
      await authService.protectedApi.delete(`/items/tracking_points?filter[patrol_id][_eq]=${patrol.id}`);
    } catch (e) { /* best-effort cleanup */ }
    await patrolService.deletePatrol(patrol.id);
    allPatrols.value = allPatrols.value.filter(p => p.id !== patrol.id);
    toastMsg.value = `Patrol deleted successfully.`;
    setTimeout(() => { toastMsg.value = ''; }, 3000);
  } catch (err) {
    alert(`Failed to delete patrol: ${err.message}`);
  }
};

async function load() {
  try {
    const [patrols, groups, alerts] = await Promise.all([
      patrolService.getPatrols(),
      patrolService.fetchCheckpointGroups(),
      patrolService.getAlerts()
    ]);
    
    const todayStr = new Date().toISOString().split('T')[0];
    // Client-side safety: only keep today's patrols regardless of server filter quirks
    const todayPatrols = patrols.filter(p => {
      if (p.date) return p.date === todayStr;
      if (p.scheduledTime) return p.scheduledTime.startsWith(todayStr);
      if (p.date_created) return p.date_created.startsWith(todayStr);
      return false;
    });
    
    allPatrols.value = todayPatrols;
    checkpointGroups.value = groups;
    // Keep only active/unresolved alerts
    activeAlerts.value = alerts.filter(a => a.status !== 'resolved');

    // Load checkpoints for today's patrols (todayPatrols already computed above)
    const cpMap = {};
    
    // Deduplicate API calls for routes
    const routeCache = {};

    await Promise.all(todayPatrols.map(async p => {
      const gId = typeof p.groupId === 'object' && p.groupId ? p.groupId.id : p.groupId;
      if (!gId) return;

      if (!routeCache[gId]) {
        routeCache[gId] = patrolService.getCheckpointsForRoute(gId);
      }
      const staticCps = await routeCache[gId];
      
      // Bug #5: Scope checkpoint scan state to this patrol's time window.
      // If a checkpoint was scanned before this patrol's scheduled start, treat it
      // as 'pending' (it belongs to a previous round on the same route).
      cpMap[p.id] = staticCps.map(cp => {
        const isScanned = cp.status === 'scanned' || cp.status === 'completed';
        let effectiveStatus = cp.status;
        if (isScanned && p.scheduledTime && cp.scanned_at) {
          const scannedAt = new Date(cp.scanned_at.includes('T') ? cp.scanned_at : cp.scanned_at.replace(' ', 'T'));
          const patrolStart = new Date(p.scheduledTime);
          if (scannedAt < patrolStart) {
            effectiveStatus = 'pending'; // scan belongs to a previous patrol round
          }
        }
        let scanTime = null;
        if (effectiveStatus === 'scanned' || effectiveStatus === 'completed') {
          if (cp.scanned_at) {
            const d = new Date(cp.scanned_at);
            scanTime = !isNaN(d) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : cp.scanned_at;
          }
        }
        return { ...cp, status: effectiveStatus, scanTime };
      });

      // Auto-detect: if checkpoint(s) are scanned but patrol is still "scheduled", fix it
      const hasScannedCps = cpMap[p.id].some(c => c.status === 'scanned' || c.status === 'completed');
      if (p.status === 'scheduled' && hasScannedCps) {
        p.status = 'active';
      }
    }));
    checkpointMap.value = cpMap;
    // Use todayPatrols (filtered), NOT the original patrols array
    allPatrols.value = [...todayPatrols];
  } catch (e) { console.error(e); }

  try {
    zones.value = await zoneService.fetchZones();
  } catch (e) { /* zones may not be available */ }

  // Fetch guards for pre-assignment dropdown
  try {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    const apiUrl = import.meta.env.VITE_API_URL;

    // First, find the guard role ID
    const roleRes = await fetch(
      `${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    let guardRoleId = null;
    if (roleRes.ok) {
      const roleData = await roleRes.json();
      guardRoleId = roleData.data?.[0]?.id || null;
    }

    // Fetch users with that role
    let filterStr = `filter[tenant][_eq]=${tenantId}`;
    if (guardRoleId) filterStr += `&filter[accesseasyRole][_eq]=${guardRoleId}`;

    const res = await fetch(
      `${apiUrl}/users?${filterStr}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=phone&fields[]=status`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      guards.value = (data.data || []).map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.phone || 'Guard',
        full_name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        status: u.status
      }));
    }
  } catch (e) { console.error('Failed to fetch guards:', e); }
}

let pollInterval = null;
let isPolling = false;

onMounted(async () => {
  await requestNotificationPermission();
  await load();
  if (route.query.action === 'configurator') showConfigurator.value = true;
  
  notificationInterval = setInterval(() => {
    checkMissedPatrols();
  }, 10000);

  pollInterval = setInterval(async () => {
    if (isPolling) return;
    if (!showWizard.value && !showConfigurator.value && !showHistory.value && !showReports.value && !selectedPatrolForMap.value) {
      isPolling = true;
      try {
        await load();
      } finally {
        isPolling = false;
      }
    }
  }, 5000);
});

onUnmounted(() => {
  if (notificationInterval) clearInterval(notificationInterval);
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }
</style>

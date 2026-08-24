
<template>
  <div class="h-full flex flex-col bg-[#F5F4F1]/80 dark:bg-[#0b0f19] p-4 lg:p-6 overflow-hidden relative">
    <!-- Glassmorphism Glowing Orbs -->
    <div
      class="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[hsl(220,60%,70%)]/35 dark:bg-blue-600/20 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 0s;"
    />
    <div
      class="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[hsl(260,50%,72%)]/30 dark:bg-indigo-600/20 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 1.5s;"
    />
    <div
      class="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-[hsl(300,40%,78%)]/20 dark:bg-purple-600/10 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 3s;"
    />
    
    <!-- MAIN GRID (12 columns) -->
    <div class="flex-1 grid grid-cols-12 gap-6 min-h-0 mb-6 relative z-10">
      
      <!-- LEFT HALF: VISITOR MANAGEMENT -->
      <div  class="col-span-12 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2 min-h-0 animate-slide-up stagger-1">
        <!-- Header -->
        <div class="flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Users class="w-4 h-4 text-indigo-500" /> VISITOR MANAGEMENT
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time overview of visitor registrations, gate entries, and logs.
            </p>
          </div>
        </div>

                <!-- TWO COLUMN LAYOUT -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          
          <!-- LEFT COLUMN (Main Data) -->
          <div class="lg:col-span-8 flex flex-col gap-5 min-h-0">
<!-- Visitor KPI Stats -->
        <div class="grid grid-cols-4 gap-3 shrink-0">
          <div
            class="bg-[hsl(155,30%,97%)] dark:bg-emerald-500/5 border border-[#E5E1D8]/80 dark:border-emerald-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-500/40 hover:shadow-md transition-all animate-fade-in"
            @click="router.push('/dashboard/visitors')"
          >
            <span class="text-3xl font-black text-[#35A673] leading-none shrink-0">{{ stats.visitorsInside }}</span>
            <div class="min-w-0">
              <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Inside</p>
              <p class="text-[9px] text-[#35A673] font-bold mt-0.5">Active</p>
            </div>
          </div>

          <div
            class="bg-[hsl(220,30%,97%)] dark:bg-blue-500/5 border border-[#E5E1D8]/80 dark:border-blue-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-200 dark:hover:border-blue-500/40 hover:shadow-md transition-all animate-fade-in"
            @click="router.push('/dashboard/visitors')"
          >
            <span class="text-3xl font-black text-[#3E7DD4] leading-none shrink-0">{{ stats.visitorsToday }}</span>
            <div class="min-w-0">
              <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Expected</p>
              <p class="text-[9px] text-slate-450 dark:text-slate-500 font-medium mt-0.5">Today</p>
            </div>
          </div>

          <div
            class="bg-[hsl(38,35%,97%)] dark:bg-amber-500/5 border border-[#E5E1D8]/80 dark:border-amber-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-amber-200 dark:hover:border-amber-500/40 hover:shadow-md transition-all animate-fade-in"
            @click="router.push('/dashboard/visitors')"
          >
            <span class="text-3xl font-black text-[#D4900A] leading-none shrink-0">{{ visitorsWaiting.length }}</span>
            <div class="min-w-0">
              <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Pending</p>
              <p class="text-[9px] text-slate-450 dark:text-slate-500 font-medium mt-0.5">Approvals</p>
            </div>
          </div>

          <div
            class="bg-[hsl(348,30%,97%)] dark:bg-rose-500/5 border border-[#E5E1D8]/80 dark:border-rose-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 hover:border-rose-200 dark:hover:border-rose-500/40 hover:shadow-md transition-all animate-fade-in"
          >
            <span class="text-3xl font-black text-[#D44B62] leading-none shrink-0">{{ stats.overstaying }}</span>
            <div class="min-w-0">
              <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Overstay</p>
              <p class="text-[9px] text-[#D44B62] font-medium mt-0.5">Attention</p>
            </div>
          </div>
        </div>

        <!-- Smart Queue Tabbed Panel -->
        <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl rounded-[20px] border border-[#E5E1D8]/80 dark:border-white/10 shadow-sm flex flex-col flex-1 min-h-[300px]">
          <div class="p-4 border-b border-white/40 dark:border-white/5 shrink-0 flex items-center justify-between">
            <h3 class="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              Active Visitors & Smart Queue
            </h3>
            <div class="flex gap-1.5">
              <button
                v-for="tab in ['All Visitors', 'Waiting Approval', 'Check-in Pending']"
                :key="tab"
                :class="activeQueueTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-white/5 bg-transparent border-transparent'"
                class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-colors"
                @click="activeQueueTab = tab"
              >
                {{ tab }}
              </button>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
            <div
              v-for="visitor in filteredSmartQueue"
              :key="visitor.name"
              class="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-[#151c2c]/40 backdrop-blur-xl border border-slate-100/50 dark:border-white/5 rounded-xl transition-colors cursor-pointer group"
              @click="router.push('/dashboard/visitors')"
            >
              <img
                :src="visitor.avatar"
                class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 object-cover shrink-0"
              >
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {{ visitor.name }}
                </p>
                <p class="text-[11px] font-medium text-slate-450 dark:text-slate-500 truncate mt-0.5">
                  {{ visitor.company }}
                </p>
              </div>
              <div class="w-24 shrink-0">
                <p class="text-[11px] font-semibold text-slate-450 dark:text-slate-400 truncate">
                  {{ visitor.purpose }}
                </p>
              </div>
              <div class="w-16 shrink-0 text-right">
                <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {{ visitor.time }}
                </p>
              </div>
              <div class="w-16 shrink-0 flex justify-end">
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-md uppercase"
                  :class="visitor.statusClass"
                >{{ visitor.status }}</span>
              </div>
              <button class="w-6 h-6 flex items-center justify-center text-slate-455 hover:text-slate-650 dark:text-slate-350 shrink-0">
                <MoreVertical class="w-4 h-4" />
              </button>
            </div>
            <div
              v-if="!filteredSmartQueue.length"
              class="h-32 flex flex-col items-center justify-center text-slate-450 text-xs"
            >
              No visitors found in queue.
            </div>
          </div>
        </div>

                  </div>
          
          <!-- RIGHT COLUMN (Actions & Logs) -->
          <div class="lg:col-span-4 flex flex-col gap-5 min-h-0">
<!-- Quick Actions & Search bar -->
        <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl border border-[#E5E1D8]/80 dark:border-white/10 p-4 rounded-3xl shadow-xl shadow-slate-200/5 dark:shadow-none flex flex-col gap-3 shrink-0">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="visitorSearchQuery"
              type="text"
              placeholder="Search Visitor by name, email, mobile..."
              class="w-full pl-9 pr-4 h-10 text-xs bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 border border-[#E5E1D8]/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm"
              @keydown.enter="handleVisitorSearch"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="item in visitorActions"
              :key="item.label"
              class="flex flex-col items-center justify-start gap-2 p-2.5 rounded-xl border border-[#E5E1D8]/80 dark:border-white/10 bg-[#FDFCFA]/75 dark:bg-[#151c2c]/50 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none hover:border-slate-350 dark:hover:border-white/20 transition-all group"
              @click="item.action ? handleAction(item.action) : router.push(item.href)"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                :class="item.bg"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5"
                  :class="item.color"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">{{ item.label }}</span>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 text-center leading-tight">{{ item.sub }}</span>
            </button>
          </div>
        </div>

        <!-- Recent Visitor Logs / Gate Activity -->
        <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl border border-[#E5E1D8]/80 dark:border-white/10 rounded-[20px] p-4 shadow-sm flex flex-col flex-1 min-h-[250px]">
          <div class="flex items-center justify-between mb-3 shrink-0">
            <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Gate Activity & Visitor Logs
            </h3>
            <button
              class="text-xs font-bold text-blue-600 hover:underline"
              @click="router.push('/dashboard/visitors')"
            >
              View Logs
            </button>
          </div>
          <div class="flex-1 overflow-y-auto space-y-3.5 custom-scrollbar pr-1">
            <div
              v-for="event in liveEvents.filter(e => e.type === 'visitor' || e.label.toLowerCase().includes('visitor') || e.sub.toLowerCase().includes('visitor'))"
              :key="event.label"
              class="flex items-start gap-3 group"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-150/40 dark:border-white/5"
                :class="event.iconBg"
              >
                <component
                  :is="event.icon"
                  class="w-3.5 h-3.5"
                  :class="event.iconColor"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ event.label }}
                  </p>
                  <span class="text-[10px] text-slate-400 font-semibold">{{ event.time }}</span>
                </div>
                <p class="text-[11px] text-slate-450 dark:text-slate-400 truncate mt-0.5">
                  {{ event.sub }}
                </p>
              </div>
            </div>
            <div
              v-if="!liveEvents.length"
              class="h-full flex items-center justify-center text-slate-400 text-xs"
            >
              No recent gate activity.
            </div>
          </div>
          </div>
          
        </div>
        </div>
      </div>
    </div>

    <!-- Onboarding Wizard -->
    <GettingStartedWizard
      :is-open="showOnboarding"
      @close="showOnboarding = false"
    />
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  MoreVertical, Settings, Maximize, AlertCircle, Plus,
  Users, Shield, AlertTriangle, UserCheck, UserPlus, QrCode, Search, Clock,
  PlayCircle, Radio, Contact, Lock, DoorOpen, LayoutGrid, LayoutDashboard,
  SlidersHorizontal, Battery, MoreHorizontal, User, Calendar,
  MapPin, Globe, Building2, Download, Loader2, X, Mic, ArrowLeft
} from 'lucide-vue-next';
import PatrolMapReplay from '@/pages/guard/tabs/components/PatrolMapReplay.vue';
import GettingStartedWizard from '../GettingStartedWizard.vue';
import QrcodeVue from 'qrcode.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { useDashboardState } from '@/composables/useDashboardState';
import { useZoneFilter } from '@/composables/useZoneFilter';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { Loader } from '@googlemaps/js-api-loader';

let cachedGuardRoleId = null;

const router = useRouter();
const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;

const showOnboarding = ref(false);
const showQrModal = ref(false);
const availablePortals = ref([]);
const activePortalIndex = ref(-1);
const isDownloadingQr = ref(false);
const windowOrigin = window.location.origin;

const qrDownloadUrl = computed(() => {
  if (availablePortals.value.length === 0 || activePortalIndex.value === -1) return window.location.origin + '/visit/default';
  return window.location.origin + '/visit/' + availablePortals.value[activePortalIndex.value].id;
});

const activePortalTitle = computed(() => {
  if (availablePortals.value.length === 0 || activePortalIndex.value === -1) return 'Visitor Registration';
  return availablePortals.value[activePortalIndex.value].Title || 'Visitor Registration';
});

const showCheckpointQrModal = ref(false);
const availableCheckpointGroups = ref([]);
const activeGroupIndex = ref(-1);
const groupCheckpoints = ref([]);
const isFetchingCheckpoints = ref(false);

const activeGroupTitle = computed(() => {
  if (availableCheckpointGroups.value.length === 0 || activeGroupIndex.value === -1) return 'Checkpoint Group';
  return availableCheckpointGroups.value[activeGroupIndex.value].name || 'Checkpoint Group';
});

const generateSignedQr = (id) => {
  const tenantId = authService.getTenantId();
  const signature = btoa(`${id}-${tenantId}-AccessEasy2026`).replace(/=/g, '');
  return `ACPT::${id}::${signature}`;
};

const handleAction = async (action) => {
  if (action === 'downloadQR') {
    activePortalIndex.value = availablePortals.value.length === 1 ? 0 : -1;
    showQrModal.value = true;
  }
  if (action === 'downloadCheckpointQR') {
    try {
      const tenantId = authService.getTenantId();
      const res = await fetch(`${apiUrl}/items/checkpoint_groups?filter[tenant][_eq]=${tenantId}&sort=-date_created`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        availableCheckpointGroups.value = d.data || [];
      }
    } catch (e) { console.error(e); }
    activeGroupIndex.value = -1;
    showCheckpointQrModal.value = true;
  }
};

const selectGroup = async (idx) => {
  activeGroupIndex.value = idx;
  isFetchingCheckpoints.value = true;
  try {
    const groupId = availableCheckpointGroups.value[idx].id;
    const res = await fetch(`${apiUrl}/items/checkpoints?filter[group_id][_eq]=${groupId}&sort=sort_order`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const d = await res.json();
      groupCheckpoints.value = d.data || [];
    }
  } catch (e) { console.error(e); } finally {
    isFetchingCheckpoints.value = false;
  }
};

const downloadCheckpointQrAction = async () => {
  const area = document.getElementById('checkpoint-qr-area');
  if (!area) return;
  isDownloadingQr.value = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: '#ffffff', pixelRatio: 2 });
    const link = document.createElement('a');
    const filename = activeGroupTitle.value.replace(/\s+/g, '-');
    link.download = `${filename}-Checkpoints-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    isDownloadingQr.value = false;
  }
};

const downloadIndividualCheckpointQr = async (cp) => {
  const area = document.getElementById('cp-qr-' + cp.id);
  if (!area) return;
  isDownloadingQr.value = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: '#f8fafc', pixelRatio: 3 });
    const link = document.createElement('a');
    const filename = (cp.name || cp.checkpoint_id).replace(/\s+/g, '-');
    link.download = `${filename}-Checkpoint-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    isDownloadingQr.value = false;
  }
};

const downloadDashboardQr = async () => {
  const area = document.getElementById('dashboard-qr-area');
  if (!area) return;
  isDownloadingQr.value = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: '#ffffff', pixelRatio: 3 });
    const link = document.createElement('a');
    const filename = activePortalTitle.value.replace(/\s+/g, '-');
    link.download = `${filename}-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    isDownloadingQr.value = false;
  }
};

const downloadFromCard = async (idx) => {
  activePortalIndex.value = idx;
  await nextTick();
  setTimeout(() => {
    downloadDashboardQr();
  }, 100);
};

const { selectedZone, zones } = useZoneFilter();

const currentZoneName = computed(() => {
  if (selectedZone.value === 'all') return 'Global Workspace';
  const z = zones.value.find(z => z.id === selectedZone.value);
  return z ? z.zoneName : 'Global Workspace';
});

const loading = ref(false);
const activeGuards = ref([]);


const visitorSearchQuery = ref('');
const handleVisitorSearch = () => {
  if (visitorSearchQuery.value.trim()) {
    router.push({
      path: '/dashboard/visitors',
      query: { search: visitorSearchQuery.value.trim() }
    });
  } else {
    router.push('/dashboard/visitors');
  }
};

const visitorActions = [
  { label: 'Register Visitor', sub: 'Add walk-in visitor', href: '/dashboard/visitors', icon: UserPlus, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { label: 'Download Visitor Management QR', sub: 'Visitor registration', action: 'downloadQR', icon: QrCode, bg: 'bg-emerald-50', color: 'text-emerald-600' },
];

const guardActions = [
  { label: 'Schedule Patrol', sub: 'Create new patrol', href: '/dashboard/patrols', icon: PlayCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Checkpoint QR', sub: 'Download QR Codes', action: 'downloadCheckpointQR', icon: QrCode, bg: 'bg-purple-50', color: 'text-purple-600' },
  { label: 'Manage Guards', sub: 'Duty & assignments', href: '/dashboard/guards', icon: UserCheck, bg: 'bg-blue-50', color: 'text-blue-600' },
];

const { 
  recentLogs, startPolling, stopPolling, loadDashboardData,
  visitorsWaiting, visitorsInside, visitorsExpected, timelineEvents
} = useDashboardState();

const activeQueueTab = ref('All Visitors');
const activeSection = ref('visitor');

watch(activeSection, async (newVal) => {
  if (newVal === 'patrol') {
    await nextTick();
    if (!dashboardMap) {
      await initDashboardMap();
    }
    centerMapOnActiveGuards();
  }
});

const smartQueue = computed(() => {
  let all = [...visitorsInside.value, ...visitorsWaiting.value, ...visitorsExpected.value];
  return all.map(v => ({
    ...v,
    name: v.personName || 'Unknown',
    company: v.company || 'N/A',
    purpose: v.reasonForVisit || 'Visit',
    time: v.startTime || (v.startDate ? new Date(v.startDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'N/A'),
    status: v.status === 'active' ? 'Checked In' : (visitorsWaiting.value.find(w => w.id === v.id) ? 'Waiting' : 'Expected'),
    statusClass: v.status === 'active' ? 'bg-emerald-100 text-emerald-600' : (visitorsWaiting.value.find(w => w.id === v.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'),
    avatar: v.photo ? `${apiUrl}/assets/${v.photo}?access_token=${token}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(v.personName || 'V')
  }));
});

const filteredSmartQueue = computed(() => {
  if (activeQueueTab.value === 'Waiting Approval') return smartQueue.value.filter(v => v.status === 'Waiting');
  if (activeQueueTab.value === 'Check-in Pending') return smartQueue.value.filter(v => v.status === 'Expected');
  return smartQueue.value;
});

const refGuardsList = computed(() => {
  return activeGuards.value.map(g => ({
    name: g.guardName,
    loc: g.userLocation || 'On Patrol',
    bat: g.bat,
    batColor: g.batColor,
    patrolling: true,
    avatar: g.directusAvatar ? `${apiUrl}/assets/${g.directusAvatar}?access_token=${token}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(g.guardName || 'G')
  }));
});

const liveEvents = computed(() => {
  return timelineEvents.value.map(e => ({
    label: e.text.split(' at ')[0] || e.text,
    sub: e.text.split(' at ')[1] || 'Site Activity',
    time: e.time,
    icon: e.type === 'success' ? UserCheck : (e.type === 'danger' ? AlertTriangle : User),
    iconBg: e.type === 'success' ? 'bg-emerald-50 border-emerald-100' : (e.type === 'danger' ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'),
    iconColor: e.type === 'success' ? 'text-emerald-600' : (e.type === 'danger' ? 'text-rose-600' : 'text-blue-600'),
    urgent: e.type === 'danger'
  }));
});

const stats = ref({
  visitorsToday: 0,
  visitorsInside: 0,
  guardsOnDuty: 0,
  patrolCompletion: 0,
  patrolsCompleted: 0,
  overstaying: 0,
  missedCheckpoints: 0,
  checkpointGroups: 0,
  accessPoints: 0,
  zones: 0,
});

const patrolList = computed(() => {
  return []; // We don't have detailed live patrol progress easily accessible without refactoring patrolService, but we can clear the mock data.
});



const recentIncidents = ref([]);

const loadIncidents = async () => {
  try {
    const { patrolService } = await import('@/services/patrolService');
    const rawAlerts = await patrolService.getAlerts();
    recentIncidents.value = rawAlerts.map(a => {
      let finalImageUrl = a.image_url || null;
      if (finalImageUrl && !finalImageUrl.includes('access_token')) {
        const joiner = finalImageUrl.includes('?') ? '&' : '?';
        finalImageUrl = `${finalImageUrl}${joiner}access_token=${token}`;
      }
        
        let finalDescription = a.description || 'No additional details provided.';
        let parsedAudioUrl = null;
        if (finalDescription.includes('[AUDIO_URL]:')) {
          const parts = finalDescription.split('[AUDIO_URL]:');
          finalDescription = parts[0].trim();
          parsedAudioUrl = parts[1].trim();
          if (!parsedAudioUrl.includes('access_token')) {
            parsedAudioUrl = `${parsedAudioUrl}${parsedAudioUrl.includes('?') ? '&' : '?'}access_token=${token}`;
          }
        }
        
        return {
          id: a.id,
          title: a.title || a.type || 'Incident Reported',
          reportedBy: a.reported_by || 'Guard',
          time: new Date(a.date_created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          severity: (a.severity || 'medium').toLowerCase(),
          location: a.location || 'Unknown Zone',
          description: finalDescription,
          imageUrl: finalImageUrl,
          audioUrl: parsedAudioUrl
        };
    });
  } catch (e) {
    console.error("Failed to load incidents", e);
  }
};

const sosAlerts = computed(() => {
  return recentIncidents.value.filter(i => 
    i.title.toUpperCase().includes('SOS') || 
    (i.description && i.description.toUpperCase().includes('SOS'))
  );
});

const selectedIncident = ref(null);

const openIncidentDetails = (incident) => {
  selectedIncident.value = incident;
};

// Guard Details & Replay Modal Logic
const selectedGuard = ref(null);
const mockPatrolDetails = ref(null);

const openGuardDetails = async (guard) => {
  const possibleAvatars = [
    guard.directusAvatar?.id,
    guard.directusAvatar,
    guard.guardId?.avatar?.id,
    guard.guardId?.avatar,
    guard.assignedGuard?.assignedUser?.avatar?.id,
    guard.assignedGuard?.assignedUser?.avatar,
    guard.avatar?.id,
    guard.avatar,
    guard.guardAvatar
  ];
  const avatarId = possibleAvatars.find(a => a && typeof a === 'string');
  
  let finalAvatarUrl = null;
  if (avatarId) {
    finalAvatarUrl = `${apiUrl}/assets/${avatarId}?access_token=${token}`;
  }

  const formatTimeStr = (dateStr) => {
    if (!dateStr) return 'N/A';
    // Check if it's just a time string like "12:00" or "12:00:00"
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      const [hh, mm] = dateStr.split(':');
      let hour = parseInt(hh, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour.toString().padStart(2, '0')}:${mm} ${ampm}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const shiftStart = formatTimeStr(guard.startTime || guard.date_created);
  const shiftEnd = guard.endTime ? formatTimeStr(guard.endTime) : (guard.status === 'active' ? 'Active' : 'N/A');

  selectedGuard.value = {
    id: guard.id,
    name: guard.guardName || 'Unknown',
    role: 'Guard',
    status: guard.status,
    zoneName: guard.userLocation || guard.zoneName || 'Field Patrol',
    avatar: (guard.guardName || '?').charAt(0).toUpperCase(),
    avatarUrl: finalAvatarUrl,
    color: 'indigo',
    shift: `${shiftStart} - ${shiftEnd}`,
    battery: guard.batteryLevel ? `${guard.batteryLevel}% - Active` : 'Online',
    contact: guard.mobile_number || guard.email || 'N/A'
  };
  
  // Initially empty while loading
  mockPatrolDetails.value = {
    patrol: { 
      id: guard.id, 
      guardName: guard.guardName, 
      status: guard.status, 
      avatarUrl: finalAvatarUrl,
      currentLat: guard.currentLat,
      currentLng: guard.currentLng
    },
    checkpoints: [],
    trackingPoints: []
  };

  try {
    const { patrolService } = await import('@/services/patrolService');
    const cps = await patrolService.getCheckpointsForRoute(guard.groupId || guard.id);
    
    const parsedCps = cps.map(c => ({
      checkpoint_id: c.id || c.checkpoint_id,
      name: c.name,
      status: c.status || 'pending',
      scanTime: c.scanTime || null,
      floor: c.floor || 'Ground',
      latitude: c.latitude, // keep real GPS if available
      longitude: c.longitude,
      x: c.x,
      y: c.y
    }));

    // Fetch actual live tracking telemetry from Directus
    const realTrackingPoints = await patrolService.getTrackingPoints(guard.id);
    
    // Fallback to generating mock tracking breadcrumbs if real ones don't exist yet
    const generatedTracking = [];
    let currentSteps = 0;
    
    if (realTrackingPoints.length > 2) {
      generatedTracking.push(...realTrackingPoints);
    } else
    
    if (parsedCps.length === 1) {
      const p = parsedCps[0];
      generatedTracking.push({
        latitude: p.latitude, longitude: p.longitude, x: p.x, y: p.y,
        accuracy: 5, steps: 0, heading: 0, speed: 0,
        mode: p.latitude ? 'outdoor' : 'indoor'
      });
    } else {
      for (let i = 0; i < parsedCps.length - 1; i++) {
        const p1 = parsedCps[i];
        const p2 = parsedCps[i+1];
        
        // If both points have GPS, route outdoors
        const mode = (p1.latitude && p2.latitude) ? 'outdoor' : 'indoor';
        const stepsCount = 30; // Number of breadcrumbs between checkpoints
        
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

    mockPatrolDetails.value = {
      patrol: { id: guard.id, guardName: guard.guardName, status: guard.status },
      checkpoints: parsedCps,
      trackingPoints: generatedTracking
    };
  } catch (e) {
    console.error("Failed to fetch checkpoints for replay", e);
  }
};

const closeGuardDetails = () => {
  selectedGuard.value = null;
};

// We already imported the shared dashboard state above

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

const currentTime = ref('');
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}, 1000);

const quickActions = [
  { label: 'Visitors', href: '/dashboard/visitors', icon: UserCheck, iconBg: 'bg-blue-50 group-hover:bg-blue-100', iconColor: 'text-blue-600' },
  { label: 'Register Visitor', href: '/dashboard/visitors', icon: Users, iconBg: 'bg-indigo-50 group-hover:bg-indigo-100', iconColor: 'text-indigo-600' },
  { label: 'Access Points', href: '/dashboard/access-control/doors', icon: MapPin, iconBg: 'bg-emerald-50 group-hover:bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Patrols', href: '/dashboard/patrols', icon: Shield, iconBg: 'bg-amber-50 group-hover:bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Registration Links', href: '/dashboard/visitor-portals', icon: Globe, iconBg: 'bg-purple-50 group-hover:bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Zones', href: '/dashboard/settings/zones', icon: Building2, iconBg: 'bg-slate-50 group-hover:bg-slate-100:bg-white:bg-white', iconColor: 'text-slate-600' },
];

const loadStats = async (isBackground = false) => {
  if (isBackground !== true) loading.value = true;
  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId || !token) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // Visitors today
    const [vTodayRes, vInsideRes, doorsRes] = await Promise.all([
      authService.protectedApi.get(`/items/visitor`, {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'filter[startDate][_eq]': today,
          'meta': 'filter_count',
          'limit': 0
        }
      }),
      authService.protectedApi.get(`/items/visitor`, {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'filter[status][_eq]': 'active',
          'meta': 'filter_count',
          'fields': 'id,endDate,endTime',
          'limit': 100
        }
      }),
      authService.protectedApi.get(`/items/doors`, {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'meta': 'filter_count',
          'limit': 0
        }
      })
    ]);

    if (vTodayRes.status === 200) {
      const d = vTodayRes.data;
      stats.value.visitorsToday = d.meta?.filter_count ?? 0;
    }

    if (vInsideRes.status === 200) {
      const d = vInsideRes.data;
      const activeVisitors = d.data || [];
      stats.value.visitorsInside = d.meta?.filter_count ?? activeVisitors.length;

      // Overstay: active visitors past endTime on today
      stats.value.overstaying = activeVisitors.filter(v => {
        if (!v.endTime || v.endDate !== today) return false;
        return v.endTime < nowTime;
      }).length;
    }

    if (doorsRes.status === 200) {
      const d = doorsRes.data;
      stats.value.accessPoints = d.meta?.filter_count ?? 0;
    }

    // Patrol stats from service
    try {
      const patrols = await patrolService.getPatrols();
      const cpGroups = await patrolService.fetchCheckpointGroups();
      
      stats.value.checkpointGroups = cpGroups.length;
      const active = patrols.filter(p => p.status === 'active');
      
      // Global Guard Tracking: Fetch all guards who are "On Duty" (status === 'active')
      try {
        if (!cachedGuardRoleId) {
          const roleRes = await fetch(
            `${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_in]=accessEasy,accesseasy_patrol,patrol&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            cachedGuardRoleId = roleData.data?.[0]?.id || null;
          }
        }

        let filterStr = `filter[tenant][_eq]=${tenantId}&filter[status][_eq]=active`;
        if (cachedGuardRoleId) filterStr += `&filter[accesseasyRole][_eq]=${cachedGuardRoleId}`;

        const usersRes = await fetch(`${apiUrl}/users?${filterStr}&fields=id,first_name,last_name,avatar,phone,email,location,currentLat,currentLng`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const usersList = usersData.data || [];
          
          activeGuards.value = usersList
            .filter(u => u.currentLat && u.currentLng)
            .map(u => {
              const pseudoBat = (u.id.charCodeAt(0) + (u.id.charCodeAt(1) || 0)) % 40 + 60; // 60 to 99
              const finalBat = u.battery || pseudoBat;
              return {
                guardId: u.id,
                id: u.id,
                guardName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown Guard',
                directusAvatar: u.avatar,
                mobile_number: u.phone,
                email: u.email,
                userLocation: u.location,
                currentLat: u.currentLat,
                currentLng: u.currentLng,
                status: 'active',
                bat: finalBat,
                batColor: finalBat > 30 ? 'emerald' : 'amber'
              };
            });
        } else {
          activeGuards.value = [];
        }
      } catch (e) {
        console.error("Failed to fetch global guard locations", e);
        activeGuards.value = [];
      }
      
      const completed = patrols.filter(p => p.status === 'completed');
      stats.value.guardsOnDuty = active.length;
      stats.value.patrolsCompleted = completed.length;

      const totalCheckpoints = patrols.reduce((s, p) => s + (p.totalCheckpoints || 8), 0);
      const completedCheckpoints = completed.reduce((s, p) => s + (p.checkpointsVisited || 0), 0);
      stats.value.patrolCompletion = totalCheckpoints > 0
        ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
        : 0;
      stats.value.missedCheckpoints = completed.reduce((s, p) => s + (p.missedCheckpoints || 0), 0);
    } catch (e) {
      // patrol service may not have real data yet
    }

    // Zone count
    try {
      const zones = await zoneService.fetchZones();
      stats.value.zones = zones.length;
    } catch (e) { /* zone service fallback */ }

  } catch (err) {
    console.error('Failed to load dashboard stats', err);
  } finally {
    loading.value = false;
  }
};

const formatTime = (timeStr, fallback) => {
  if (!timeStr && fallback) {
    return new Date(fallback).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (!timeStr) return '--:--';
  try {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return timeStr.slice(0, 5); }
};

let refreshInterval;

const dashboardMapContainer = ref(null);
let dashboardMap = null;


const lightMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }
];

const initDashboardMap = async () => {
  const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
  const loader = new Loader({ apiKey, version: 'weekly' });
  try {
    await loader.load();
    if (dashboardMapContainer.value) {
      dashboardMap = new google.maps.Map(dashboardMapContainer.value, {
        center: { lat: 12.9716, lng: 77.5946 }, // Default fallback
        zoom: 18,
        disableDefaultUI: true,
        zoomControl: true, // Allow user to click +/-
        gestureHandling: 'auto', // Allow scroll to zoom
        mapId: 'DASHBOARD_MAP_ID',
        mapTypeId: 'roadmap',
        styles: lightMapStyles
      });

      // Try browser geolocation as a backup
      if (navigator.geolocation && activeGuards.value.length === 0) {
        navigator.geolocation.getCurrentPosition((pos) => {
          dashboardMap?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard Google Map', err);
  }
};

let googleMarkers = [];

const centerMapOnActiveGuards = async () => {
  if (!dashboardMap || activeGuards.value.length === 0) return;
  
  try {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    // Clear existing markers
    googleMarkers.forEach(m => m.map = null);
    googleMarkers = [];

    // Plot all active guards with real GPS coordinates
    activeGuards.value.forEach(guard => {
      if (guard.currentLat && guard.currentLng) {
        let avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        
        const possibleAvatars = [
          guard.directusAvatar?.id,
          guard.directusAvatar,
          guard.guardId?.avatar?.id,
          guard.guardId?.avatar,
          guard.assignedGuard?.assignedUser?.avatar?.id,
          guard.assignedGuard?.assignedUser?.avatar,
          guard.avatar?.id,
          guard.avatar,
          guard.guardAvatar
        ];
        const avatarId = possibleAvatars.find(a => a && typeof a === 'string');
        
        if (avatarId) {
          avatarHtml = `<img src="${apiUrl}/assets/${avatarId}?access_token=${token}" class="w-full h-full object-cover" />`;
        }

        const el = document.createElement('div');
        el.className = 'w-10 h-10 rounded-full border-2 border-white shadow-lg object-cover bg-white';
        
        el.innerHTML = `
          <div class="relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-indigo-500" style="left:0;top:0;"></span>
            <div class="w-8 h-8 border-[3px] border-white rounded-full flex items-center justify-center shadow-md bg-indigo-500 text-white z-10 relative overflow-hidden">
              ${avatarHtml}
            </div>
            
            <!-- 3D Hover Tooltip Popup (Right Side) -->
            <div class="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none z-50 origin-left [transform:perspective(500px)_rotateY(-20deg)_translateX(-15px)_scale(0.9)] group-hover:[transform:perspective(500px)_rotateY(0deg)_translateX(0)_scale(1)]">
              
              <!-- 3D Card Body -->
              <div class="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-2xl p-3.5 w-max min-w-[190px] text-left flex flex-col gap-2 shadow-[20px_20px_50px_-10px_rgba(0,0,0,0.8)] border border-slate-700/80 ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                
                <!-- Glossy Highlight -->
                <div class="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                <div class="flex items-center gap-3 border-b border-slate-700/50 pb-3 relative z-10">
                  <div class="w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-slate-700 flex items-center justify-center text-slate-400 ring-2 ring-slate-800/50">
                    ${avatarHtml}
                  </div>
                  <div>
                    <p class="text-[14px] font-black text-white leading-tight mb-1 shadow-black drop-shadow-md">
                      ${guard.guardName || 'Unknown Guard'}
                    </p>
                    <span class="text-[9px] px-1.5 py-0.5 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] bg-gradient-to-b from-emerald-400/30 to-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-wider drop-shadow">Live Tracking</span>
                  </div>
                </div>

                <div class="relative z-10 pt-1">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full ${guard.batColor === 'amber' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'} border border-white/20"></div>
                      <p class="text-[11px] font-bold text-slate-300">Status</p>
                    </div>
                    <span class="text-white text-[11px] font-black">Active Patrol</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg class="w-3 h-3 text-slate-400 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect><line x1="6" y1="6" x2="18" y2="6"></line><line x1="6" y1="18" x2="18" y2="18"></line></svg>
                      <p class="text-[11px] font-bold text-slate-300">Battery</p>
                    </div>
                    <span class="text-white text-[11px] font-black">${guard.bat}%</span>
                  </div>
                </div>

              </div>
              <!-- Futuristic AR Connecting Line -->
              <div class="absolute top-1/2 -left-[16px] -translate-y-1/2 w-[16px] h-[1px] bg-emerald-500/40"></div>
              <div class="absolute top-1/2 -left-[16px] -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]"></div>
            </div>
          </div>
          <div class="mt-1 bg-white/60 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-[11px] font-bold text-slate-700 dark:text-slate-200">${guard.guardName || 'Unknown Guard'}</div>
        `;
        
        const marker = new AdvancedMarkerElement({
          map: dashboardMap,
          position: { lat: parseFloat(guard.currentLat), lng: parseFloat(guard.currentLng) },
          content: el,
        });

        marker.addListener('click', () => {
          openGuardDetails(guard);
        });

        googleMarkers.push(marker);
      }
    });

    const firstActive = activeGuards.value[0];
    
    // 1. Prioritize LIVE GPS streaming from the Mobile App
    if (firstActive.currentLat && firstActive.currentLng) {
      dashboardMap.panTo({ lat: parseFloat(firstActive.currentLat), lng: parseFloat(firstActive.currentLng) });
      dashboardMap.setZoom(18);
      return;
    }

    // 2. Fallback to the outdoor checkpoint locations if GPS stream hasn't started
    const { patrolService } = await import('@/services/patrolService');
    const cps = await patrolService.getCheckpointsForRoute(firstActive.groupId || firstActive.id);
    const outdoorCp = cps.find(cp => cp.latitude && cp.longitude);
    
    if (outdoorCp && dashboardMap) {
      dashboardMap.panTo({ lat: outdoorCp.latitude, lng: outdoorCp.longitude });
      dashboardMap.setZoom(18);
    }
  } catch (e) {
    console.error("Could not fetch checkpoints to center map", e);
  }
};

onMounted(async () => {
  if (!localStorage.getItem('has_completed_onboarding')) {
    showOnboarding.value = true;
  }
  await loadStats();
  await loadIncidents();
  loadDashboardData();
  startPolling(15000); // Polling for metrics and logs
  refreshInterval = setInterval(async () => {
    await loadStats(true);
    await loadIncidents();
    centerMapOnActiveGuards();
  }, 15000); // Coordinated 15s refresh
  if (activeSection.value === 'patrol') {
    await initDashboardMap();
    centerMapOnActiveGuards();
  }

  try {
    const tenantId = authService.getTenantId();
    if (tenantId) {
      const res = await fetch(`${apiUrl}/items/BrandedPages?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        if (d.data && d.data.length > 0) {
          availablePortals.value = d.data;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch portal URL', e);
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
});

const handleVisibilityChange = async () => {
  if (document.hidden) {
    stopPolling();
    clearInterval(refreshInterval);
  } else {
    loadDashboardData();
    startPolling(15000);
    refreshInterval = setInterval(async () => {
      await loadStats(true);
      await loadIncidents();
      if (activeSection.value === 'patrol') {
        centerMapOnActiveGuards();
      }
    }, 15000);
  }
};

onUnmounted(() => {
  stopPolling();
  clearInterval(refreshInterval);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>

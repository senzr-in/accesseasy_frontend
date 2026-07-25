<template>
  <div class="h-full flex flex-col gap-0 overflow-hidden animate-in">
    <!-- Header Teleport -->
    <Teleport v-if="isMounted" to="#header-title-slot">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Patrol Management
            </h1>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time overview of all patrol activities
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Action buttons moved to KPI strip line -->
        </div>
      </div>
    </Teleport>

    <!-- Action buttons moved to KPI strip -->
    <!-- SOS Alert Banner -->
    <div
      v-if="activeAlerts.length"
      class="mb-3 shrink-0 bg-red-600 rounded-xl p-3 flex items-center justify-between shadow-lg shadow-red-600/20 animate-pulse border border-red-500"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
          <AlertTriangle class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 class="text-white font-black uppercase tracking-widest">
            Emergency Alert Detected
          </h2>
          <p class="text-red-100 text-sm font-semibold">
            Guard {{ activeAlerts[0].guard_name || 'Unknown' }} triggered an SOS in Zone: {{ activeAlerts[0].zone_name || 'Unknown' }}
          </p>
        </div>
      </div>
      <button
        class="bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
        @click="dismissAlert(activeAlerts[0].id)"
      >
        Dismiss
      </button>
    </div>

    <!-- KPI Strip and Action Buttons -->
    <div class="flex flex-nowrap items-center gap-2 shrink-0 mb-3 overflow-x-auto custom-scrollbar pb-1">
      <!-- Total -->
      <div class="flex-1 min-w-[60px] ae-card py-1.5 px-2.5 flex items-center justify-center gap-1.5 border-l-4 border-l-slate-300 cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('all')">
        <div class="min-w-0 text-center">
          <p class="text-base font-bold text-slate-800 dark:text-slate-200 leading-none">{{ statistics.total }}</p>
          <p class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">Total</p>
        </div>
      </div>
      <!-- Running -->
      <div class="flex-1 min-w-[60px] ae-card py-1.5 px-2.5 flex items-center justify-center gap-1.5 border-l-4 border-l-indigo-500 cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('running')">
        <div class="min-w-0 text-center">
          <p class="text-base font-bold text-indigo-700 leading-none">{{ statistics.running }}</p>
          <p class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">Running</p>
        </div>
      </div>
      <!-- Completed -->
      <div class="flex-1 min-w-[60px] ae-card py-1.5 px-2.5 flex items-center justify-center gap-1.5 border-l-4 border-l-emerald-500 cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('completed')">
        <div class="min-w-0 text-center">
          <p class="text-base font-bold text-emerald-700 leading-none">{{ statistics.completed }}</p>
          <p class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">Completed</p>
        </div>
      </div>
      <!-- Missed -->
      <div class="flex-1 min-w-[60px] ae-card py-1.5 px-2.5 flex items-center justify-center gap-1.5 border-l-4 border-l-rose-500 cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('missed')">
        <div class="min-w-0 text-center">
          <p class="text-base font-bold text-rose-700 leading-none">{{ statistics.missed }}</p>
          <p class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">Missed</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 ml-1">
        <button
          class="btn-primary text-xs flex items-center gap-1.5 h-[42px] whitespace-nowrap"
          @click="$router.push('/dashboard/patrols/create')"
        >
          <PlusCircle class="w-4 h-4" />
          Patrol Creator
        </button>
        <button
          class="btn-secondary text-xs flex items-center gap-1.5 h-[42px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
          @click="$router.push('/dashboard/patrols/history')"
        >
          <HistoryIcon class="w-4 h-4 text-slate-400" />
          History
        </button>

        <!-- Overflow Dropdown Menu -->
        <div class="relative">
          <button
            ref="overflowButtonRef"
            class="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative z-[145] cursor-pointer"
            @click="toggleOverflowMenu"
            title="More Options"
          >
            <MoreVertical class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          </button>
          
          <Teleport to="body">
            <div
              v-if="showOverflowMenu"
              class="fixed inset-0 z-[140]"
              @click="showOverflowMenu = false"
            />
            <div
              v-if="showOverflowMenu"
              :style="dropdownStyle"
              class="w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[150] overflow-hidden py-1 animate-in slide-in-from-top-1 duration-100"
            >
              <!-- Patrol Checkpoints -->
              <button
                class="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent"
                @click="$router.push('/dashboard/patrols/checkpoints'); showOverflowMenu = false;"
              >
                <MapPin class="w-4 h-4 text-slate-400" />
                Patrol Checkpoints
              </button>
              
              <!-- Download Checkpoint QR -->
              <button
                class="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent"
                :disabled="downloadingQRs"
                @click="downloadCheckpointQRs(); showOverflowMenu = false;"
              >
                <Loader2 v-if="downloadingQRs" class="w-4 h-4 animate-spin text-slate-400" />
                <Download v-else class="w-4 h-4 text-slate-400" />
                {{ downloadingQRs ? 'Downloading...' : 'Download Checkpoint QR' }}
              </button>
            </div>
          </Teleport>
        </div>
      </div>
    </div>    <!-- 1-Panel Body -->
    <div class="flex-1 min-h-0 flex flex-col gap-3">
      <!-- CENTER: Live Patrol Status Table -->
      <div class="ae-card overflow-hidden flex flex-col h-full">
        <PatrolLiveFeed
          :patrols="displayedPatrols"
          :checkpoint-map="checkpointMap"
          :checkpoint-groups="checkpointGroups"
          :selected-zone-id="selectedZoneId"
          :zones="zones"
          :status-filter="statusFilter"
          @update:selectedZoneId="selectedZoneId = $event"
          @update:statusFilter="setFilter($event)"
          @open-map="openMapReplay"
          @edit-patrol="editPatrol"
          @delete-patrol="deletePatrol"
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

    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Delete Patrol"
      confirmMessage="Are you sure you want to delete this patrol?"
      itemLabel="Patrol"
      :itemName="patrolToDelete ? (patrolToDelete.guardName ? `${patrolToDelete.guardName} (${patrolToDelete.zoneName})` : patrolToDelete.zoneName) : ''"
      description="This action cannot be undone and will permanently remove this patrol round along with all associated logs, alerts, and tracking data."
      :deleting="isDeleting"
      @close="showDeleteModal = false; patrolToDelete = null;"
      @confirm="confirmDelete"
    />

    <PatrolCreator
      v-if="showWizard"
      :zones="zones"
      :guards="guards"
      @close="showWizard = false"
      @open-library="showWizard = false; showLibrary = true"
      @create="load"
    />






    <!-- Reports & Incidents Modal -->
    <Teleport to="body">
      <div
        v-if="showReports"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <div class="relative w-full max-w-5xl ae-card shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 class="w-5 h-5 text-emerald-600" /> Reports & Analytics
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                View compliance stats and file incident reports
              </p>
            </div>
            <button
              class="btn-icon"
              @click="showReports = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 dark:bg-slate-900/50">
            <PatrolReports />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Patrol Created Toast -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="toastMsg"
          class="fixed bottom-6 right-6 z-[200] bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in"
        >
          <CheckCheck class="w-4 h-4" /> {{ toastMsg }}
        </div>
      </transition>
    </Teleport>

    <!-- Replay / Map Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="selectedPatrolForMap"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8"
        >
          <div
            class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            @click="selectedPatrolForMap = null"
          />
          
          <div
            class="relative w-full max-w-6xl max-h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style="height: 80vh;"
          >
            <!-- Header -->
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-md bg-indigo-500 text-white border-4 border-indigo-100">
                  {{ (selectedPatrolForMap.patrol.guardName || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1.5">
                    {{ selectedPatrolForMap.patrol.guardName || 'Unknown Guard' }}
                  </h3>
                  <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Guard • {{ selectedPatrolForMap.patrol.id }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
                  {{ selectedPatrolForMap.patrol.status }}
                </span>
                <button
                  class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 rounded-full transition-colors border border-slate-100 dark:border-slate-700 shadow-sm"
                  @click="selectedPatrolForMap = null"
                >
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
import QRCode from 'qrcode';
import {
  ArrowLeft, AlertTriangle, ShieldAlert, Users,
  MapPin, Clock, CheckCircle, XCircle, Search, Calendar,
  MoreVertical, ShieldCheck, ChevronRight, Play, CheckCircle2, Loader2, PlayCircle, Filter, 
  Map as MapIcon, X, Maximize2, Minimize2, Eye, ExternalLink, Activity, ScanLine, QrCode, Settings, BarChart3, History as HistoryIcon, CheckCheck, PlusCircle, Download
} from "lucide-vue-next";
import { useRoute, useRouter } from 'vue-router';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import ZoneScoreboard from './components/ZoneScoreboard.vue';
import PatrolLiveFeed from './components/PatrolLiveFeed.vue';
import PatrolMapReplay from './components/PatrolMapReplay.vue';
import PatrolReports from './components/PatrolReports.vue';

import PatrolCreator from './components/PatrolCreator.vue';
import EditPatrolModal from './components/EditPatrolModal.vue';
import ConfirmDeleteModal from '@/components/common/modals/ConfirmDeleteModal.vue';

const route = useRoute();
const router = useRouter();

const downloadingQRs = ref(false);

const downloadCheckpointQRs = async () => {
  downloadingQRs.value = true;
  try {
    const list = await patrolService.getMasterCheckpoints();
    if (!list || list.length === 0) {
      toastMsg.value = 'No checkpoints found to download.';
      return;
    }
    
    const tenantId = authService.getTenantId();
    let htmlContent = '';
    
    for (const cp of list) {
      const rawString = `${cp.checkpoint_id}-${tenantId}-AccessEasy2026`;
      const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
      const qrData = `ACPT::${cp.checkpoint_id}::${signature}`;
      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(qrData, {
          width: 200, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' }
        });
      } catch {}

      htmlContent += `
      <div class="card">
        <div class="brand">AccessEasy<div style="font-size:10px;font-weight:normal;margin-top:2px;">Checkpoint Badge</div></div>
        ${qrDataUrl ? `<img src="${qrDataUrl}" class="qr" />` : ''}
        <div class="name">${cp.name}</div>
        <div class="id">${cp.checkpoint_id}</div>
        <div class="meta">
          <div class="meta-item"><label>Floor</label><span>${cp.floor || '—'}</span></div>
          <div class="meta-item"><label>Building</label><span>${cp.building_id || '—'}</span></div>
        </div>
      </div>
      `;
    }

    const html = `
    <html>
      <head>
        <title>All Checkpoint Badges</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: monospace, system-ui, sans-serif; background: #fff; color: #000; padding: 20px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
          .card { width: 58mm; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px; border: 1px dashed #ccc; page-break-inside: avoid; margin-bottom: 20px; }
          .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; border-bottom: 1px dashed #000; width: 100%; padding-bottom: 4px; margin-bottom: 8px; }
          .qr { width: 45mm; height: 45mm; margin-bottom: 8px; }
          .name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
          .id { font-size: 11px; margin-bottom: 8px; }
          .meta { width: 100%; display: flex; justify-content: space-between; border-top: 1px dashed #000; padding-top: 8px; margin-bottom: 8px; }
          .meta-item { display: flex; flex-direction: column; text-align: center; width: 50%; }
          .meta-item label { font-size: 10px; text-transform: uppercase; }
          .meta-item span { font-weight: bold; font-size: 12px; }
          @media print { 
            body { padding: 0; display: block; }
            .card { float: left; margin: 10px; border: 1px solid #eee; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); };<\/script>
      </body>
    </html>`;
    
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();

  } catch (err) {
    console.error('Failed to download checkpoints:', err);
    toastMsg.value = 'Failed to generate QR list.';
    setTimeout(() => { toastMsg.value = ''; }, 6000);
  } finally {
    downloadingQRs.value = false;
  }
};

// UI state
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
  load();
});

const editingPatrol   = ref(null);

const showReports = ref(false);
const showWizard = ref(false);
const toastMsg = ref('');
const zoneSearch = ref('');
const selectedPatrolForMap = ref(null);
const expandedHistoryRow = ref(null);

const toggleHistoryExpand = (id) => {
  expandedHistoryRow.value = expandedHistoryRow.value === id ? null : id;
};

const openMapReplay = async (patrol) => {
  const cps = checkpointMap.value[patrol.id] || [];
  
  const parsedCps = cps.map((c, idx) => ({
    checkpoint_id: c.id || c.checkpoint_id,
    name: c.name,
    status: c.status || 'pending',
    scanTime: c.scanTime || null,
    floor: c.floor || 'Ground',
    latitude: c.latitude, 
    longitude: c.longitude,
    x: c.x !== undefined && c.x !== null ? c.x : (idx * 60 - 60),
    y: c.y !== undefined && c.y !== null ? c.y : (idx % 2 === 0 ? 40 : -40)
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
    // Only alert if the missed/delayed event happened recently (within the last 60 minutes)
    // to prevent old alerts from firing every time the page loads or refreshes.
    const timeStr = p.scheduledTime || p.startTime;
    if (timeStr) {
      try {
        const scheduledDate = new Date(timeStr.includes('T') ? timeStr : `${p.date || now.toISOString().split('T')[0]}T${timeStr}`);
        const ageMinutes = (now - scheduledDate) / 60000;
        if (ageMinutes > 60) return; // skip old alerts
      } catch (e) { /* skip invalid dates */ }
    }

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
const showDeleteModal = ref(false);
const patrolToDelete = ref(null);
const isDeleting = ref(false);
const showOverflowMenu = ref(false);
const overflowButtonRef = ref(null);
const dropdownStyle = ref({});

const toggleOverflowMenu = () => {
  if (!showOverflowMenu.value && overflowButtonRef.value) {
    const rect = overflowButtonRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + window.scrollY + 6}px`,
      left: `${rect.right - 224 + window.scrollX}px`,
    };
  }
  showOverflowMenu.value = !showOverflowMenu.value;
};

const dismissAlert = async (alertId) => {
  try {
    await patrolService.updateAlertStatus(alertId, 'resolved');
    activeAlerts.value = activeAlerts.value.filter(a => a.id !== alertId);
  } catch (error) {
    console.error("Failed to dismiss alert:", error);
  }
};

// Selected zone and filters
const selectedZoneId = ref(null);
const statusFilter = ref('all');

const setFilter = (status) => {
  statusFilter.value = status;
};

// Filtered zones for search
const filteredZones = computed(() => {
  if (!zoneSearch.value) return zones.value;
  const q = zoneSearch.value.toLowerCase();
  return zones.value.filter(z => (z.zoneName || z.name || '').toLowerCase().includes(q));
});

// Show all patrols or filtered by zone and status
const displayedPatrols = computed(() => {
  let list = allPatrols.value;
  
  if (selectedZoneId.value) {
    list = list.filter(p => {
      const matchId = String(p.zoneId || p.zone_id || p.zone) === String(selectedZoneId.value);
      const matchName = selectedZone.value?.name && p.zoneName?.toLowerCase().includes(selectedZone.value.name.toLowerCase());
      return matchId || matchName;
    });
  }

  if (statusFilter.value !== 'all') {
    list = list.filter(p => {
      if (statusFilter.value === 'running') return p.status === 'active';
      if (statusFilter.value === 'missed') return p.status === 'missed' || p.missedCheckpoints > 0;
      return p.status === statusFilter.value;
    });
  }

  return list;
});

const selectedZone = computed(() => {
  if (!selectedZoneId.value) return null;
  const z = zones.value.find(z => String(z.id) === String(selectedZoneId.value));
  if (z) return { id: z.id, name: z.zoneName || z.name };
  const p = allPatrols.value.find(p => String(p.zoneId || p.zone_id || p.zone) === String(selectedZoneId.value));
  return p ? { id: p.zoneId || p.zone_id || p.zone, name: p.zoneName || 'Zone' } : null;
});

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
  let missedPatrols = 0;

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

    // Check if the group has any missed patrols or checkpoints
    const hasMissed = slots.some(s => s.status === 'missed' || (s.missedCheckpoints && s.missedCheckpoints > 0));
    if (hasMissed) {
      missedPatrols++;
    }
  }

  return {
    running,
    completed,
    missed: missedPatrols,
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

const deletePatrol = (patrol) => {
  patrolToDelete.value = patrol;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!patrolToDelete.value) return;
  isDeleting.value = true;
  try {
    const patrol = patrolToDelete.value;
    // Delete associated tracking points, logs, and alerts first to avoid foreign key violations
    try {
      await authService.protectedApi.delete(`/items/tracking_points?filter[patrol_id][_eq]=${patrol.id}`);
    } catch (e) { /* best-effort cleanup */ }
    try {
      await authService.protectedApi.delete(`/items/patrol_logs?filter[patrol_id][_eq]=${patrol.id}`);
    } catch (e) { /* best-effort cleanup */ }
    try {
      await authService.protectedApi.delete(`/items/patrol_alerts?filter[patrol_id][_eq]=${patrol.id}`);
    } catch (e) { /* best-effort cleanup */ }
    
    await patrolService.deletePatrol(patrol.id);
    allPatrols.value = allPatrols.value.filter(p => p.id !== patrol.id);
    toastMsg.value = `Patrol deleted successfully.`;
    setTimeout(() => { toastMsg.value = ''; }, 3000);
  } catch (err) {
    alert(`Failed to delete patrol: ${err.message}`);
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
    patrolToDelete.value = null;
  }
};

async function load() {
  try {
    const [patrols, groups, alerts] = await Promise.all([
      patrolService.getPatrols(),
      patrolService.fetchCheckpointGroups(),
      patrolService.getAlerts()
    ]);
    
    const todayPatrols = patrols; // Removed date filter to show all patrols
    
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
    
    // Batch reactive assignments synchronously at the end to prevent screen flicker and layout shift
    checkpointMap.value = cpMap;
    allPatrols.value = todayPatrols;
    checkpointGroups.value = groups;
    // Keep only active/unresolved alerts
    activeAlerts.value = alerts.filter(a => a.status !== 'resolved');
  } catch (e) { console.error(e); }

  try {
    zones.value = await zoneService.fetchZones();
  } catch (e) { /* zones may not be available */ }

  // Fetch guards for pre-assignment dropdown
  try {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const roleRes = await fetch(`${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`, { headers: { Authorization: `Bearer ${token}` } });
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
  
  if (route.query.filter) {
    statusFilter.value = route.query.filter;
  }
  
  notificationInterval = setInterval(() => {
    checkMissedPatrols();
  }, 10000);

  pollInterval = setInterval(async () => {
    if (isPolling) return;
    
    isPolling = true;
    try {
      await load();
    } finally {
      isPolling = false;
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

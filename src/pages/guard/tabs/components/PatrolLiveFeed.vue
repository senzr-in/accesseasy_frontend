<template>
  <div class="flex flex-col md:flex-row h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
    
    <!-- LEFT PANEL: Patrol Explorer & Queue (42% width) -->
    <div class="w-full md:w-[42%] lg:w-[38%] flex flex-col border-r border-slate-200 dark:border-slate-800 h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      
      <!-- Toolbar Header -->
      <div class="shrink-0 p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <!-- Title & Count -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Patrol Queue
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {{ filteredPatrols.length }}
            </span>
          </div>

          <!-- Zone Selector -->
          <div class="flex items-center gap-1.5">
            <select 
              class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              :value="selectedZoneId || ''"
              @change="$emit('update:selectedZoneId', $event.target.value || null)"
            >
              <option value="">All Zones</option>
              <option v-for="z in displayZones" :key="z.id" :value="z.id">{{ z.zoneName || z.name }}</option>
            </select>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search patrol routes, guards..."
            class="w-full text-xs font-medium pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <!-- Patrol List Body -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-2">
        <div
          v-for="patrol in filteredPatrols"
          :key="patrol.id"
          class="p-3 rounded-xl border transition-all cursor-pointer relative group"
          :class="[
            selectedPatrolId === patrol.id 
              ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
          ]"
          @click="selectPatrol(patrol)"
        >
          <!-- Top Row: Route Name & Status -->
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border"
                   :class="patrol.status === 'active' 
                     ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30' 
                     : patrol.status === 'completed'
                     ? 'bg-emerald-600 text-white border-emerald-500'
                     : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'">
                {{ getGroupName(patrol).charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ getGroupName(patrol) }}
                </h4>
                <p v-if="patrol.zoneName" class="text-[10px] text-slate-400 truncate">
                  {{ patrol.zoneName }}
                </p>
              </div>
            </div>

            <!-- Status Pill -->
            <span
              class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0"
              :class="{
                'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400': patrol.status === 'active' && !patrol.missedCheckpoints,
                'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400': patrol.missedCheckpoints > 0,
                'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400': patrol.status === 'delayed',
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300': patrol.status === 'completed',
                'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400': patrol.status === 'scheduled'
              }"
            >
              {{ getStatusLabel(patrol) }}
            </span>
          </div>

          <!-- Middle Row: Guard & Time -->
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 my-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <div class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                {{ patrol.guardName ? patrol.guardName.charAt(0).toUpperCase() : '?' }}
              </div>
              <span class="truncate font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                {{ patrol.guardName || 'Unassigned' }}
              </span>
            </div>

            <div class="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
              <Clock class="w-3 h-3 text-slate-400" />
              <span>{{ getDisplayTime(patrol) }}</span>
            </div>
          </div>

          <!-- Bottom Row: Progress Bar -->
          <div class="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="patrol.missedCheckpoints > 0 ? 'bg-rose-500' : patrol.status === 'active' ? 'bg-indigo-600' : 'bg-emerald-500'"
                :style="{ width: getProgressPct(patrol.id) + '%' }"
              />
            </div>
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {{ getScanned(patrol.id) }}/{{ getCpCount(patrol.id) }} CP
            </span>
          </div>
        </div>

        <!-- Empty Filter State -->
        <div
          v-if="filteredPatrols.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center text-slate-400 p-4"
        >
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
            <Shield class="w-6 h-6" />
          </div>
          <p class="text-xs font-bold text-slate-700 dark:text-slate-300">No matching patrols</p>
          <p class="text-[11px] text-slate-400 mt-1 max-w-xs">Try selecting a different filter status or clearing the search query.</p>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: Live Command Center / Monitor Details (58% width) -->
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
      
      <!-- Empty State when no patrol is selected -->
      <div
        v-if="!selectedPatrolDetails"
        class="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-900/20"
      >
        <div class="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
          <Activity class="w-8 h-8 animate-pulse" />
        </div>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">
          Patrol Command Center
        </h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          Select a patrol round from the queue to inspect live checkpoint milestones, guard vitals, and geographical route replay.
        </p>
        <button
          class="mt-4 btn-primary text-xs flex items-center gap-1.5 h-9 px-4 cursor-pointer"
          @click="$router.push('/dashboard/patrols/create')"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>+ Create New Patrol</span>
        </button>
      </div>

      <!-- Loaded Details View -->
      <div v-else class="flex-1 flex flex-col overflow-hidden min-h-0">
        
        <!-- Hero Header -->
        <div class="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-base font-black shrink-0 shadow-md shadow-indigo-600/20">
              {{ activePatrol?.guardName?.charAt(0).toUpperCase() || 'P' }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black text-slate-900 dark:text-white truncate">
                  {{ activePatrol ? getGroupName(activePatrol) : 'Patrol Route' }}
                </h3>
                <span
                  class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md"
                  :class="{
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300': activePatrol?.status === 'active',
                    'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300': activePatrol?.status === 'completed',
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300': activePatrol?.status === 'scheduled',
                    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300': activePatrol?.status === 'delayed' || activePatrol?.missedCheckpoints > 0
                  }"
                >
                  {{ activePatrol ? getStatusLabel(activePatrol) : '' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Guard: <strong>{{ activePatrol?.guardName || 'Unassigned' }}</strong></span>
                <span v-if="activePatrol?.zoneName">· Zone: {{ activePatrol.zoneName }}</span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              class="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Edit Patrol"
              @click="$emit('editPatrol', activePatrol)"
            >
              <Pencil class="w-3.5 h-3.5 text-slate-400" />
              <span>Edit</span>
            </button>
            <button
              class="h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Delete Patrol"
              @click="$emit('deletePatrol', activePatrol)"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Content: Vitals, Timeline, Map -->
        <div class="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">
          
          <!-- Vitals Strip -->
          <div class="grid grid-cols-3 gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] font-bold uppercase text-slate-400">Completion</span>
              <p class="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {{ activePatrol ? getProgressPct(activePatrol.id) : 0 }}%
              </p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] font-bold uppercase text-slate-400">Checkpoints</span>
              <p class="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {{ activePatrol ? getScanned(activePatrol.id) : 0 }} / {{ activePatrol ? getCpCount(activePatrol.id) : 0 }}
              </p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] font-bold uppercase text-slate-400">Scheduled Time</span>
              <p class="text-base font-black text-slate-700 dark:text-slate-300 mt-0.5">
                {{ activePatrol ? getDisplayTime(activePatrol) : '—' }}
              </p>
            </div>
          </div>

          <!-- Checkpoints Timeline Section -->
          <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-indigo-500" />
                Checkpoint Milestones
              </h4>
              <span class="text-[10px] font-bold text-slate-400">
                {{ selectedPatrolDetails.checkpoints.length }} total
              </span>
            </div>
            
            <!-- Checkpoints Table Header -->
            <div class="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr] gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              <span>Checkpoint</span>
              <span class="text-center">Scan Time</span>
              <span class="text-center">Delay Status</span>
              <span class="text-right">State</span>
            </div>
            
            <!-- Checkpoints Rows -->
            <div class="space-y-1.5">
              <div
                v-for="(cp, idx) in selectedPatrolDetails.checkpoints"
                :key="cp.checkpoint_id || idx"
                class="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr] gap-3 items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <!-- Checkpoint Name & Node -->
                <div class="flex items-center gap-2.5 min-w-0">
                  <div 
                    class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border"
                    :class="{
                      'bg-emerald-500 border-emerald-500 text-white': ['scanned', 'completed'].includes(cp.status),
                      'bg-rose-500 border-rose-500 text-white': cp.status === 'missed',
                      'bg-amber-500 border-amber-500 text-white': cp.status === 'delayed',
                      'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 text-indigo-600': cp.status === 'pending'
                    }"
                  >
                    <CheckCheck v-if="['scanned', 'completed'].includes(cp.status)" class="w-3.5 h-3.5" />
                    <X v-else-if="cp.status === 'missed'" class="w-3.5 h-3.5" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {{ cp.name }}
                    </p>
                    <span v-if="cp.checkpoint_id" class="text-[9px] font-mono text-slate-400">
                      {{ cp.checkpoint_id }}
                    </span>
                  </div>
                </div>
                
                <!-- Scan Time -->
                <div class="text-center text-xs font-mono font-semibold" :class="cp.scanTime ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'">
                  {{ cp.scanTime || '—' }}
                </div>

                <!-- Delay -->
                <div class="text-center text-xs font-medium" :class="cp.delayedTime ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'">
                  {{ cp.delayedTime || 'On Schedule' }}
                </div>

                <!-- Status Pill -->
                <div class="text-right">
                  <span 
                    class="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                    :class="{
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400': ['scanned', 'completed'].includes(cp.status),
                      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400': cp.status === 'missed',
                      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400': cp.status === 'delayed',
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400': cp.status === 'pending'
                    }"
                  >
                    {{ cp.status === 'missed' ? 'Missed' : ['scanned', 'completed'].includes(cp.status) ? 'Scanned' : cp.status === 'delayed' ? 'Delayed' : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Route Map Replay Preview -->
          <div class="p-4 bg-slate-50 dark:bg-slate-900/50 flex-1 min-h-[300px] flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Navigation class="w-3.5 h-3.5 text-indigo-500" />
                Live Route & Geofence Preview
              </h4>
              <button
                class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                @click="$emit('openMap', selectedPatrolDetails)"
              >
                Expand Full Map &rarr;
              </button>
            </div>
            
            <div class="flex-1 min-h-[260px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-950">
              <div v-if="loadingMap" class="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-20">
                <Loader2 class="w-7 h-7 animate-spin text-indigo-500" />
              </div>
              
              <PatrolMapReplay
                :patrol-details="selectedPatrolDetails"
                hide-timeline
                hide-controls
                class="w-full h-full"
              />
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { 
  Shield, MapPin, Navigation, CheckCheck, X, AlertTriangle, 
  Pencil, Trash2, Activity, Loader2, Search, Clock, Plus
} from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { authService } from '@/services/authService';
import PatrolMapReplay from './PatrolMapReplay.vue';

const props = defineProps({
  patrols: { type: Array, default: () => [] },
  checkpointMap: { type: Object, default: () => ({}) },
  checkpointGroups: { type: Array, default: () => [] },
  selectedZoneId: { type: [String, Number], default: null },
  zones: { type: Array, default: () => [] },
  statusFilter: { type: String, default: 'all' }
});

const emit = defineEmits(['openMap', 'editPatrol', 'deletePatrol', 'update:selectedZoneId', 'update:statusFilter']);

const route = useRoute();
const internalZones = ref([]);
const displayZones = computed(() => (props.zones && props.zones.length > 0) ? props.zones : internalZones.value);
const searchQuery = ref('');

const selectedPatrolId = ref(null);
const selectedPatrolDetails = ref(null);
const loadingMap = ref(false);

const activePatrol = computed(() => {
  if (!selectedPatrolId.value) return null;
  return props.patrols.find(p => p.id === selectedPatrolId.value) || selectedPatrolDetails.value?.patrol;
});

watch(activePatrol, (newPatrol) => {
  if (selectedPatrolDetails.value && newPatrol) {
    selectedPatrolDetails.value.patrol = newPatrol;
  }
}, { deep: true });

const loadZones = async () => {
  try {
    internalZones.value = await zoneService.fetchZones();
  } catch (e) { console.error(e); }
};

// Consolidate repeating patrols into single rows for the UI
const groupedPatrols = computed(() => {
  const groups = new Map();

  props.patrols.forEach(p => {
    const gId = typeof p.groupId === 'object' && p.groupId ? p.groupId.id : (p.groupId || 'nogroup');
    const groupKey = `${p.zoneId}-${gId}-${p.date || ''}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(p);
  });

  const consolidated = [];
  const now = new Date();
  
  for (const group of groups.values()) {
    group.sort((a, b) => {
      const timeA = a.scheduledTime || a.startTime || '';
      const timeB = b.scheduledTime || b.startTime || '';
      return timeA.localeCompare(timeB);
    });

    let current = group.find(p => p.status === 'active' || p.status === 'delayed');
    
    if (!current) {
      const upcoming = group.filter(p => p.status === 'scheduled');
      if (upcoming.length > 0) {
        current = upcoming.reduce((closest, p) => {
          const getMs = (patrol) => {
            const t = patrol.scheduledTime || patrol.startTime || '';
            if (!t) return Infinity;
            return Math.abs(new Date(t.includes('T') ? t : `${patrol.date || new Date().toISOString().split('T')[0]}T${t}`) - now);
          };
          return getMs(p) < getMs(closest) ? p : closest;
        });
      }
    }

    if (!current) current = group[group.length - 1];

    const currentIdx = group.findIndex(p => p.id === current.id);
    const next = group.slice(currentIdx + 1).find(p => p.status === 'scheduled');

    consolidated.push({
      ...current,
      _displayNextTime: next ? getDisplayTime(next) : null,
      _originalGroup: group
    });
  }
  return consolidated;
});

const filteredPatrols = computed(() => {
  let list = [...groupedPatrols.value];
  
  // Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p => {
      const name = getGroupName(p).toLowerCase();
      const guard = (p.guardName || '').toLowerCase();
      const zone = (p.zoneName || '').toLowerCase();
      return name.includes(q) || guard.includes(q) || zone.includes(q);
    });
  }

  return list.sort((a, b) => {
    const order = { active: 0, delayed: 1, scheduled: 2, completed: 3, missed: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });
});

// Auto-select first patrol whenever patrols change or load
watch(() => filteredPatrols.value, (newPatrols) => {
  if (newPatrols && newPatrols.length > 0) {
    if (!selectedPatrolId.value || !newPatrols.some(p => p.id === selectedPatrolId.value)) {
      selectPatrol(newPatrols[0]);
    }
  } else {
    selectedPatrolId.value = null;
    selectedPatrolDetails.value = null;
  }
}, { immediate: true, deep: true });

const selectPatrol = async (patrol) => {
  if (!patrol) return;
  selectedPatrolId.value = patrol.id;
  loadingMap.value = true;
  try {
    const cps = props.checkpointMap[patrol.id] || [];
    const parsedCps = cps.map(c => {
      let compText = c.scanTime || null;
      let delayText = null;

      // Extract raw scan time from available fields
      let rawScan = c.scanned_at || c.date_updated || null;
      let scanDate = rawScan ? new Date(rawScan.includes('T') ? rawScan : rawScan.replace(' ', 'T')) : null;

      if (!compText && (c.status === 'scanned' || c.status === 'completed') && scanDate && !isNaN(scanDate)) {
         compText = scanDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // Calculate delayed minutes against the Patrol's scheduled start time
      let pDate = patrol.scheduledTime ? new Date(patrol.scheduledTime) : null;
      if (pDate && !isNaN(pDate)) {
        if (['scanned', 'completed'].includes(c.status)) {
           if (scanDate && !isNaN(scanDate)) {
             let diffMs = scanDate - pDate;
             let diffMins = Math.floor(diffMs / 60000);
             delayText = diffMins > 0 ? `${diffMins} min delay` : 'On Time';
           }
        } else if (c.status === 'missed' || c.status === 'pending') {
           let now = new Date();
           let diffMs = now - pDate;
           let diffMins = Math.floor(diffMs / 60000);
           if (diffMins > 0) {
             delayText = `${diffMins} min overdue`;
           }
        }
      }

      return {
        checkpoint_id: c.id || c.checkpoint_id,
        name: c.name,
        status: c.status || 'pending',
        scanTime: compText,
        delayedTime: delayText,
        expectedTime: c.expectedTime || c.expected_time || c.scheduledTime || null,
        floor: c.floor || 'Ground',
        latitude: c.latitude, 
        longitude: c.longitude,
        x: c.x,
        y: c.y
      };
    });

    const realTrackingPoints = await patrolService.getTrackingPoints(patrol.id);
    const generatedTracking = [...(realTrackingPoints || [])];

    // Fetch live guard coordinates if active
    if (patrol.status === 'active' || patrol.status === 'delayed' || patrol.status === 'scheduled') {
      try {
        const possibleGuardId = patrol.guardId || patrol.assigned_guard || patrol.user_created || (typeof patrol.guard === 'object' ? patrol.guard.id : patrol.guard);
        if (possibleGuardId) {
           const res = await authService.protectedApi.get(`/users/${possibleGuardId}?fields=id,currentLat,currentLng`);
           if (res.data?.data) {
             const user = res.data.data;
             if (user.currentLat && user.currentLng) {
               generatedTracking.push({
                 latitude: parseFloat(user.currentLat),
                 longitude: parseFloat(user.currentLng),
                 date_created: new Date().toISOString(),
                 isLive: true
               });
               patrol.currentLat = parseFloat(user.currentLat);
               patrol.currentLng = parseFloat(user.currentLng);
             }
           }
        }
      } catch (e) {
        console.error("Failed to fetch live guard location", e);
      }
    }

    selectedPatrolDetails.value = {
      patrol,
      checkpoints: parsedCps,
      trackingPoints: generatedTracking
    };
  } catch (e) {
    console.error(e);
  } finally {
    loadingMap.value = false;
  }
};

// Re-fetch details when checkpoint map updates in parent
watch(() => props.checkpointMap, () => {
  if (selectedPatrolId.value) {
    const patrol = props.patrols.find(p => p.id === selectedPatrolId.value);
    if (patrol) selectPatrol(patrol);
  }
}, { deep: true });

function getCheckpoints(patrolId) {
  return props.checkpointMap[patrolId] || [];
}
function getScanned(patrolId) {
  return getCheckpoints(patrolId).filter(c => c.status === 'scanned' || c.status === 'completed').length;
}
function getCpCount(patrolId) {
  return getCheckpoints(patrolId).length || 0;
}
function getProgressPct(patrolId) {
  const total = getCpCount(patrolId);
  return total ? Math.round(getScanned(patrolId) / total * 100) : 0;
}
function getStatusLabel(patrol) {
  if (patrol.missedCheckpoints > 0) return 'Missed';
  if (patrol.status === 'active') return 'Running';
  if (patrol.status === 'delayed') return 'Delayed';
  if (patrol.status === 'completed') return 'Completed';
  if (patrol.status === 'scheduled') return 'Scheduled';
  return patrol.status;
}

function getDisplayTime(patrol) {
  const timeStr = patrol.scheduledTime || patrol.startTime;
  if (!timeStr) return '—';
  
  let formattedTime = timeStr;
  let dateObj = null;

  if (timeStr.includes('T')) {
    const parts = timeStr.split('T')[1].split(':');
    formattedTime = `${parts[0]}:${parts[1]}`;
    dateObj = new Date(timeStr);
  } else if (patrol.date) {
    dateObj = new Date(`${patrol.date}T${timeStr}`);
  }

  if (dateObj && !isNaN(dateObj.getTime())) {
    const today = new Date();
    if (dateObj.toDateString() !== today.toDateString()) {
      const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${shortDate}, ${formattedTime}`;
    }
  }

  return formattedTime;
}

function getGroupName(patrol) {
  if (patrol.routeName) return patrol.routeName;
  if (patrol.groupId && patrol.groupId.name) return patrol.groupId.name;
  const gId = typeof patrol.groupId === 'object' ? patrol.groupId?.id : patrol.groupId;
  if (gId && props.checkpointGroups) {
    const group = props.checkpointGroups.find(g => g.id === gId);
    if (group && group.name) return group.name;
  }
  return 'Standard Patrol';
}

onMounted(() => {
  loadZones();
});
</script>

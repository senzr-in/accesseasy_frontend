<template>
  <div class="flex flex-col md:flex-row h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
    
    <!-- LEFT PANEL: Patrol List & Filters (45% width) -->
    <div class="w-full md:w-[45%] flex flex-col border-r border-slate-100 dark:border-slate-800 h-full overflow-hidden">
      <!-- Title & Filters Header -->
      <div class="shrink-0 px-5 py-4 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            Patrol Logs
          </h3>
          <div class="flex items-center gap-2">
            <select 
              class="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
              :value="statusFilter"
              @change="$emit('update:statusFilter', $event.target.value)"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
            </select>
            <select 
              class="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
              :value="selectedZoneId || ''"
              @change="$emit('update:selectedZoneId', $event.target.value || null)"
            >
              <option value="">All Zones</option>
              <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zoneName || z.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Column Headers -->
      <div class="grid grid-cols-[5fr_3fr_100px] gap-4 px-5 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-9"></span> <!-- Spacer for avatar -->
          <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Patrol Name</span>
        </div>
        <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center">Guard Name</span>
        <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right flex items-center justify-end">Status & Time</span>
      </div>

      <!-- Patrol List Body -->
      <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-2">
        <div
          v-for="patrol in filteredPatrols"
          :key="patrol.id"
          class="py-1.5 px-3 rounded-xl border grid grid-cols-[5fr_3fr_100px] items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all border-l-4"
          :class="[
            selectedPatrolId === patrol.id 
              ? 'bg-indigo-50/20 dark:bg-indigo-900/10 border-l-indigo-600 border-t-transparent border-r-transparent border-b-transparent' 
              : 'border-slate-100 dark:border-slate-800 border-l-transparent',
            patrol.missedCheckpoints > 0 ? 'bg-rose-50/10' : ''
          ]"
          @click="selectPatrol(patrol)"
        >
          <!-- 1. Patrol Name Column -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Patrol Avatar -->
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border"
                 :class="patrol.status === 'active' 
                   ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 text-indigo-700 dark:text-indigo-400' 
                   : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400'">
              {{ getGroupName(patrol).charAt(0).toUpperCase() }}
            </div>
            
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                {{ getGroupName(patrol) }}
              </div>
              
              <!-- Progress Bar -->
              <div class="flex items-center gap-1.5 mt-0.5">
                <div class="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1 shrink-0">
                  <div
                    class="h-1 rounded-full"
                    :class="patrol.missedCheckpoints > 0 ? 'bg-rose-500' : patrol.status === 'active' ? 'bg-indigo-500' : 'bg-emerald-500'"
                    :style="{ width: getProgressPct(patrol.id) + '%' }"
                  />
                </div>
                <span class="text-[9px] font-bold text-slate-500 leading-none">
                  {{ getScanned(patrol.id) }}/{{ getCpCount(patrol.id) }} CP
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Guard Name Column -->
          <div class="flex items-center gap-2 min-w-0">
             <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border"
                  :class="patrol.status === 'active' 
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 text-indigo-700 dark:text-indigo-400' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-750 text-slate-500'">
               {{ patrol.guardName?.charAt(0) || '?' }}
             </div>
             <div class="text-xs text-slate-600 dark:text-slate-400 truncate font-semibold">
               {{ patrol.guardName || 'Unassigned Guard' }}
             </div>
          </div>

          <!-- 3. Status & Time Badge -->
          <div class="text-right shrink-0">
            <span
              class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block"
              :class="{
                'bg-emerald-100 text-emerald-700': patrol.status === 'active' && !patrol.missedCheckpoints,
                'bg-rose-100 text-rose-700': patrol.missedCheckpoints > 0,
                'bg-amber-100 text-amber-700': patrol.status === 'delayed',
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300': patrol.status === 'completed' && !patrol.missedCheckpoints,
                'bg-indigo-50 text-indigo-600': patrol.status === 'scheduled'
              }"
            >
              {{ getStatusLabel(patrol) }}
            </span>
            <p class="text-[10px] font-mono text-slate-455 mt-0.5 leading-none">
              {{ getDisplayTime(patrol) }}
            </p>
          </div>
        </div>

        <div
          v-if="filteredPatrols.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center text-slate-400"
        >
          <Shield class="w-10 h-10 text-slate-200 dark:text-slate-800 mb-3" />
          <p class="text-xs font-bold text-slate-500">No matching patrols found.</p>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: Live Monitor Details (55% width) -->
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
      
      <!-- Empty State -->
      <div
        v-if="!selectedPatrolDetails"
        class="flex-1 flex flex-col items-center justify-center text-center p-6"
      >
        <Activity class="w-12 h-12 text-slate-300 dark:text-slate-750 mb-3 animate-pulse" />
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Monitor Details
        </h4>
        <p class="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed">
          Click any active or completed patrol round on the left to monitor live guard locations, routes, and timelines.
        </p>
      </div>

      <!-- Loaded Details Dashboard -->
      <div v-else class="flex-1 flex flex-col overflow-hidden min-h-0">
        
        <!-- Details Header -->
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-base font-black shrink-0 border-4 border-indigo-100">
              {{ activePatrol?.guardName?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
                {{ activePatrol?.guardName }}
              </h4>
              <p class="text-[10px] font-semibold text-slate-455 mt-1">
                {{ activePatrol ? getGroupName(activePatrol) : '' }}
              </p>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button
              class="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              title="Edit Patrol"
              @click="$emit('editPatrol', activePatrol)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              title="Delete Patrol"
              @click="$emit('deletePatrol', activePatrol)"
            >
              <Trash2 class="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        </div>

        <!-- Split Route Checkpoints and Location Map -->
        <div class="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          
          <!-- Checkpoints vertical checklist -->
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div class="flex items-center justify-between mb-4 mt-1 px-1">
              <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Checkpoint Timeline & Compliance
              </p>
            </div>
            
            <!-- Column Headers -->
            <div class="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-3 mr-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-7">Checkpoint</span>
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Completed Time</span>
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Delayed Time</span>
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</span>
            </div>
            
            <div class="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
              <div
                v-for="(cp, idx) in selectedPatrolDetails.checkpoints"
                :key="cp.checkpoint_id"
                class="flex items-center gap-3 relative z-10 bg-white dark:bg-slate-900 pl-1 pr-2"
              >
                <!-- Indicator node -->
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border"
                     :class="{
                       'bg-emerald-500 border-emerald-500 text-white': ['scanned', 'completed'].includes(cp.status),
                       'bg-rose-500 border-rose-500 text-white': cp.status === 'missed',
                       'bg-amber-500 border-amber-500 text-white': cp.status === 'delayed',
                       'bg-indigo-50 border-indigo-200 text-indigo-650 animate-pulse': cp.status === 'pending' && idx === getNextPendingIdx(activePatrol?.id),
                       'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700': cp.status === 'pending' && idx !== getNextPendingIdx(activePatrol?.id)
                     }">
                  <CheckCheck v-if="['scanned', 'completed'].includes(cp.status)" class="w-3 h-3" />
                  <X v-else-if="cp.status === 'missed'" class="w-3 h-3" />
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                
                <div class="flex-1 min-w-0 grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 items-center">
                  <!-- Checkpoint Name -->
                  <div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {{ cp.name }}
                    </span>
                  </div>
                  
                  <!-- Completed Time -->
                  <div class="text-center">
                    <span class="text-[10px] font-mono" :class="cp.scanTime ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'">
                      {{ cp.scanTime || '—' }}
                    </span>
                  </div>

                  <!-- Delayed Time -->
                  <div class="text-center">
                    <span class="text-[10px] font-mono" :class="cp.delayedTime ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-slate-600'">
                      {{ cp.delayedTime || '—' }}
                    </span>
                  </div>

                  <!-- Status -->
                  <div class="text-right">
                    <span class="text-[9px] font-bold inline-block px-1.5 py-0.5 rounded uppercase tracking-wider"
                          :class="['scanned', 'completed'].includes(cp.status) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : cp.status === 'missed' ? 'bg-rose-50 text-rose-600 border border-rose-100' : cp.status === 'delayed' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'text-slate-400'">
                      {{ cp.status === 'missed' ? 'Missed' : ['scanned', 'completed'].includes(cp.status) ? 'Completed' : cp.status === 'delayed' ? 'Delayed' : 'Pending' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Embedded Location Map Replay (Vitals & path visualization) -->
          <div class="flex-1 min-h-[350px] relative border-t border-slate-100 dark:border-slate-800 bg-slate-900">
            <div v-if="loadingMap" class="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-20">
              <Loader2 class="w-8 h-8 animate-spin text-white" />
            </div>
            
            <!-- Render the actual map component -->
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
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Shield, MapPin, Navigation, ChevronDown, CheckCheck, X, AlertTriangle, Pencil, Trash2, Activity, Loader2 } from 'lucide-vue-next';
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
const showAllLive = ref(true);
const zones = ref([]);

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
    zones.value = await zoneService.fetchZones();
  } catch (e) { console.error(e); }
};

// Filter patrols (zone and status filters are handled by parent)
const allPatrols = computed(() => {
  return props.patrols;
});

// Auto-select patrol if passed in query
watch(() => allPatrols.value, (newVals) => {
  if (route.query.patrolId && !selectedPatrolId.value && newVals.length > 0) {
    const pId = route.query.patrolId;
    // Check if the specific patrol exists in the raw list
    const p = newVals.find(x => String(x.id) === String(pId));
    if (p) {
      selectPatrol(p);
    }
  }
}, { immediate: true, deep: true });

// Consolidate repeating patrols into single rows for the UI
const groupedPatrols = computed(() => {
  const groups = new Map();

  allPatrols.value.forEach(p => {
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

const runningPatrols = computed(() => groupedPatrols.value.filter(p => p.status === 'active'));

const filteredPatrols = computed(() => {
  const sorted = [...groupedPatrols.value].sort((a, b) => {
    const order = { active: 0, delayed: 1, scheduled: 2, completed: 3, missed: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });
  return sorted;
});

const selectPatrol = async (patrol) => {
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
             delayText = diffMins > 0 ? `${diffMins} min` : 'On Time';
           }
        } else if (c.status === 'missed' || c.status === 'pending') {
           let now = new Date();
           let diffMs = now - pDate;
           let diffMins = Math.floor(diffMs / 60000);
           if (diffMins > 0) {
             delayText = `${diffMins} min`;
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
    const generatedTracking = [...realTrackingPoints];

    // INJECT LIVE GUARD LOCATION FROM USERS TABLE
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
               // Cache onto patrol object for map fallback center
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
function getNextPendingIdx(patrolId) {
  const cps = getCheckpoints(patrolId);
  return cps.findIndex(c => c.status === 'pending');
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

  // If we have a valid date and it's not today, append the short date
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
  return 'Standard Group';
}

onMounted(() => {
  loadZones();
});
</script>

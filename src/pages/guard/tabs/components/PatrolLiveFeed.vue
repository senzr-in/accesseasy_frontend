<template>
  <div class="flex flex-col h-full bg-white">

    <!-- SECTION 1: Live Patrol Status Table -->
    <div class="shrink-0 px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
      <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        Live Patrol Status
        <span v-if="activePatrols.length" class="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
          {{ activePatrols.length }} Active
        </span>
      </h3>
      <button v-if="allPatrols.length > 5" @click="showAllLive = !showAllLive"
        class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
        {{ showAllLive ? 'Show Less' : 'View All Patrols' }} →
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Live Patrols Table -->
      <div v-if="allPatrols.length" class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Guard</th>
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Zone / Checkpoint Group</th>
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Progress</th>
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Current Checkpoint</th>
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Next Checkpoint</th>
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Round Times</th>
              <th class="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
              <th class="px-4 py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="patrol in visiblePatrols" :key="patrol.id">
              <tr @click="toggleExpand(patrol.id)"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                :class="patrol.missedCheckpoints > 0 ? 'bg-rose-50/30' : ''">

              <!-- Guard -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 shadow-sm shrink-0">
                    <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-base font-black"
                      :class="patrol.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'">
                      {{ patrol.guardName?.charAt(0) || '?' }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-900 truncate">{{ patrol.guardName }}</p>
                    <p class="text-xs text-slate-400 font-mono">{{ patrol.id }}</p>
                  </div>
                </div>
              </td>

              <!-- Zone / Route -->
              <td class="px-4 py-3">
                <p class="text-sm font-semibold text-slate-800">{{ patrol.zoneName || '—' }}</p>
                <p class="text-xs text-slate-400">{{ getGroupName(patrol) }}</p>
              </td>

              <!-- Progress -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-700 whitespace-nowrap">
                    {{ getScanned(patrol.id) }}/{{ getCpCount(patrol.id) }}
                  </span>
                  <div class="w-16 bg-slate-100 rounded-full h-1.5 shrink-0">
                    <div class="h-1.5 rounded-full transition-all duration-500"
                      :class="patrol.missedCheckpoints > 0 ? 'bg-rose-500' : patrol.status === 'active' ? 'bg-indigo-500' : 'bg-emerald-500'"
                      :style="{ width: getProgressPct(patrol.id) + '%' }">
                    </div>
                  </div>
                </div>
              </td>

              <!-- Current Checkpoint -->
              <td class="px-4 py-3">
                <div v-if="getCurrentCp(patrol.id)" class="flex items-center gap-1.5">
                  <MapPin class="w-3 h-3 text-indigo-500 shrink-0" />
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ getCurrentCp(patrol.id).name }}</p>
                    <p class="text-xs text-slate-400">{{ getCurrentCp(patrol.id).scanTime || '—' }}</p>
                  </div>
                </div>
                <span v-else class="text-xs text-slate-300">—</span>
              </td>

              <!-- Next Checkpoint -->
              <td class="px-4 py-3">
                <div v-if="getNextCp(patrol.id)" class="flex items-center gap-1.5">
                  <Navigation class="w-3 h-3 text-slate-400 shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-slate-600">{{ getNextCp(patrol.id).name }}</p>
                    <p class="text-xs text-slate-400">{{ getNextCp(patrol.id).expectedTime || '—' }}</p>
                  </div>
                </div>
                <span v-else class="text-xs text-slate-300">—</span>
              </td>

              <!-- Round Times -->
              <td class="px-4 py-3">
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-semibold text-slate-700">
                    {{ patrol.status === 'completed' ? 'Done:' : 'Now:' }} {{ getDisplayTime(patrol) }}
                  </span>
                  <span v-if="patrol._displayNextTime && patrol._displayNextTime !== getDisplayTime(patrol)" class="text-[11px] text-slate-400 font-bold">
                    Next: {{ patrol._displayNextTime }}
                  </span>
                  <span v-else-if="!patrol._displayNextTime" class="text-[11px] text-slate-300">—</span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide inline-flex items-center gap-1"
                  :class="{
                    'bg-emerald-100 text-emerald-700': patrol.status === 'active' && !patrol.missedCheckpoints,
                    'bg-rose-100 text-rose-700': patrol.missedCheckpoints > 0,
                    'bg-amber-100 text-amber-700': patrol.status === 'delayed',
                    'bg-slate-100 text-slate-600': patrol.status === 'completed' && !patrol.missedCheckpoints,
                    'bg-indigo-50 text-indigo-600': patrol.status === 'scheduled'
                  }">
                  <span v-if="patrol.status === 'active' && !patrol.missedCheckpoints" class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  {{ getStatusLabel(patrol) }}
                </span>
              </td>

              <!-- Expand & Map Icons -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-3">
                  <button @click.stop="$emit('editPatrol', patrol)" class="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors" title="Edit Patrol">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click.stop="$emit('deletePatrol', patrol)" class="p-1.5 rounded-md hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors" title="Delete Patrol">
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <button @click.stop="$emit('openMap', patrol)" class="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors" title="View Location Map">
                    <MapPin class="w-4 h-4" />
                  </button>
                  <ChevronDown class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform"
                    :class="expandedRows.has(patrol.id) ? 'rotate-180' : ''" />
                </div>
              </td>
            </tr>

            <!-- Expanded Row: Checkpoint Timeline -->
            <tr v-if="expandedRows.has(patrol.id)" class="bg-slate-50/50 border-b border-slate-200 shadow-inner">
              <td colspan="8" class="px-6 py-5">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500">Group Checkpoints</h4>
                  <span class="text-xs font-semibold text-slate-400">{{ getScanned(patrol.id) }} of {{ getCpCount(patrol.id) }} Scanned</span>
                </div>
                
                <div class="flex items-start gap-0 overflow-x-auto custom-scrollbar pb-2 pt-2">
                  <template v-for="(cp, idx) in getCheckpoints(patrol.id)" :key="cp.checkpoint_id">
                    <!-- Step -->
                    <div class="flex flex-col items-center shrink-0 w-24 relative z-10">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-slate-50"
                        :class="['scanned', 'completed'].includes(cp.status) ? 'bg-emerald-500 text-white' : cp.status === 'missed' ? 'bg-rose-500 text-white' : cp.status === 'pending' && idx === getNextPendingIdx(patrol.id) ? 'bg-indigo-100 text-indigo-700 ring-indigo-50 animate-pulse' : 'bg-white text-slate-400 border border-slate-200'">
                        <CheckCheck v-if="['scanned', 'completed'].includes(cp.status)" class="w-3 h-3" />
                        <X v-else-if="cp.status === 'missed'" class="w-3 h-3" />
                        <span v-else>{{ idx + 1 }}</span>
                      </div>
                      <p class="text-xs font-bold mt-2.5 text-center truncate w-full px-1"
                         :class="['scanned', 'completed'].includes(cp.status) ? 'text-slate-700' : cp.status === 'missed' ? 'text-rose-700' : 'text-slate-500'">
                         {{ cp.name }}
                      </p>
                      <p class="text-[10px] text-center mt-0.5"
                         :class="['scanned', 'completed'].includes(cp.status) ? 'text-emerald-600' : cp.status === 'missed' ? 'text-rose-600' : 'text-slate-400'">
                         {{ cp.scanTime || (cp.status === 'missed' ? 'Missed' : (['scanned', 'completed'].includes(cp.status) ? 'Scanned' : cp.expectedTime || 'Pending')) }}
                      </p>
                    </div>
                    
                    <!-- Connector Line -->
                    <div v-if="idx < getCheckpoints(patrol.id).length - 1" 
                         class="h-0.5 flex-1 min-w-[30px] mt-3 -mx-4 z-0"
                         :class="['scanned', 'completed'].includes(cp.status) ? 'bg-emerald-200' : 'bg-slate-200'">
                    </div>
                  </template>

                  <div v-if="!getCheckpoints(patrol.id).length" class="text-xs text-slate-400 italic text-center w-full">
                    No checkpoints assigned to this group.
                  </div>
                </div>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- No patrols -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <Shield class="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-400">No active patrols</p>
        <p class="text-xs text-slate-300 mt-1">Patrols will appear here in real-time</p>
      </div>

      <!-- SECTION 2: Missed / Delayed Patrols -->
      <div v-if="missedPatrols.length" class="border-t border-slate-200">
        <div class="px-5 py-3 flex items-center justify-between bg-rose-50/30">
          <h3 class="text-sm font-bold text-rose-800 flex items-center gap-2">
            Missed / Delayed Patrols
            <span class="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {{ missedPatrols.length }}
            </span>
          </h3>
        </div>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-rose-100">
              <th class="px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-400">Guard</th>
              <th class="px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-400">Zone / Checkpoint Group</th>
              <th class="px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-400">Missed Checkpoint</th>
              <th class="px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-400">Expected Time</th>
              <th class="px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-400">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in missedPatrols" :key="item.key" class="border-b border-rose-50 bg-rose-50/20">
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                    {{ item.guardName?.charAt(0) || '?' }}
                  </div>
                  <span class="text-sm font-semibold text-slate-800">{{ item.guardName }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5 text-sm text-slate-600">{{ item.zoneName }} / {{ item.routeName || 'Group' }}</td>
              <td class="px-4 py-2.5 text-sm font-semibold text-rose-800">{{ item.checkpointName }}</td>
              <td class="px-4 py-2.5 text-sm text-rose-600 font-semibold">{{ item.expectedTime }}</td>
              <td class="px-4 py-2.5">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-700">Missed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SECTION 3: Upcoming Patrols -->
      <div v-if="upcomingPatrols.length" class="border-t border-slate-200">
        <div class="px-5 py-3 bg-slate-50/50">
          <h3 class="text-sm font-bold text-slate-900">Upcoming Patrols</h3>
        </div>
        <div class="px-5 py-3 flex gap-3 overflow-x-auto custom-scrollbar pb-4">
          <div v-for="patrol in upcomingPatrols" :key="patrol.id"
            class="shrink-0 w-36 border border-slate-200 rounded-xl p-3 bg-white hover:shadow-sm transition-shadow">
            <p class="text-sm font-bold text-indigo-600 mb-1">{{ getDisplayTime(patrol) }}</p>
            <p class="text-sm font-semibold text-slate-800 truncate">{{ patrol.zoneName }}</p>
            <p class="text-xs text-slate-400 truncate" :title="getGroupName(patrol)">{{ getGroupName(patrol) }}</p>
            <div class="flex items-center gap-1.5 mt-2">
              <div class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                {{ patrol.guardName?.charAt(0) || '?' }}
              </div>
              <span class="text-xs text-slate-600 font-medium truncate">{{ patrol.guardName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Shield, MapPin, Navigation, ChevronDown, CheckCheck, X, AlertTriangle, Pencil, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  patrols: { type: Array, default: () => [] },
  checkpointMap: { type: Object, default: () => ({}) },
  checkpointGroups: { type: Array, default: () => [] },
  selectedZoneId: { type: String, default: null }
});

const emit = defineEmits(['openMap', 'editPatrol', 'deletePatrol']);

const showAllLive = ref(false);
const expandedRows = ref(new Set());

function toggleExpand(id) {
  const newSet = new Set(expandedRows.value);
  if (newSet.has(id)) newSet.delete(id);
  else newSet.add(id);
  expandedRows.value = newSet;
}

// Filter patrols by selected zone (null = show all)
const allPatrols = computed(() => {
  if (!props.selectedZoneId) return props.patrols;
  return props.patrols.filter(p => p.zoneId === props.selectedZoneId);
});

const activePatrols = computed(() => allPatrols.value.filter(p => p.status === 'active'));

// Consolidate repeating patrols into single rows for the UI
const groupedPatrols = computed(() => {
  const groups = new Map();

  allPatrols.value.forEach(p => {
    // Normalize groupId — could be object from fields=*.*
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
    // Sort slots in this group chronologically
    group.sort((a, b) => {
      const timeA = a.scheduledTime || a.startTime || '';
      const timeB = b.scheduledTime || b.startTime || '';
      return timeA.localeCompare(timeB);
    });

    // Priority 1: Any actively running patrol
    let current = group.find(p => p.status === 'active' || p.status === 'delayed');
    
    // Priority 2: The closest upcoming scheduled patrol to NOW
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

    // Priority 3: Fallback to last entry
    if (!current) current = group[group.length - 1];

    // Determine the "Next" patrol (first scheduled slot AFTER current, must be a DIFFERENT slot)
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

const visiblePatrols = computed(() => {
  // Sort: Active first, then scheduled, then completed
  const sorted = [...groupedPatrols.value].sort((a, b) => {
    const order = { active: 0, delayed: 1, scheduled: 2, completed: 3, missed: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });
  return showAllLive.value ? sorted : sorted.slice(0, 8);
});

// For upcoming row at bottom, just show the consolidated upcoming ones
const upcomingPatrols = computed(() => 
  groupedPatrols.value.filter(p => p.status === 'scheduled' || p.status === 'pending')
);

// Build missed items from checkpoint map
const missedPatrols = computed(() => {
  const items = [];
  allPatrols.value.forEach(p => {
    const cps = props.checkpointMap[p.id] || [];
    cps.forEach(cp => {
      if (cp.status === 'missed') {
        items.push({
          key: `${p.id}-${cp.checkpoint_id}`,
          guardName: p.guardName,
          zoneName: p.zoneName,
          routeName: p.routeName || (p.groupId && p.groupId.name) || 'Standard Group',
          checkpointName: cp.name,
          expectedTime: cp.expectedTime || '—'
        });
      }
    });
  });
  return items;
});

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
function getCurrentCp(patrolId) {
  const cps = getCheckpoints(patrolId);
  // Last scanned one
  const scanned = cps.filter(c => c.status === 'scanned' || c.status === 'completed');
  return scanned.length ? scanned[scanned.length - 1] : null;
}
function getNextCp(patrolId) {
  const cps = getCheckpoints(patrolId);
  return cps.find(c => c.status === 'pending') || null;
}
function getNextPendingIdx(patrolId) {
  const cps = getCheckpoints(patrolId);
  return cps.findIndex(c => c.status === 'pending');
}
function getStatusLabel(patrol) {
  if (patrol.missedCheckpoints > 0) return 'Missed';
  if (patrol.status === 'active') return 'Live';
  if (patrol.status === 'delayed') return 'Delayed';
  if (patrol.status === 'completed') return 'Done';
  if (patrol.status === 'scheduled') return 'Scheduled';
  return patrol.status;
}

function getDisplayTime(patrol) {
  const timeStr = patrol.scheduledTime || patrol.startTime;
  if (!timeStr) return '—';
  if (timeStr.includes('T')) {
    const parts = timeStr.split('T')[1].split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

function getGroupName(patrol) {
  if (patrol.routeName) return patrol.routeName;
  if (patrol.groupId && patrol.groupId.name) return patrol.groupId.name;
  
  // Try to lookup from props
  const gId = typeof patrol.groupId === 'object' ? patrol.groupId?.id : patrol.groupId;
  if (gId && props.checkpointGroups) {
    const group = props.checkpointGroups.find(g => g.id === gId);
    if (group && group.name) return group.name;
  }
  return 'Standard Group';
}
</script>

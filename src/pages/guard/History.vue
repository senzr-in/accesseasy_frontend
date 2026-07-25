<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] overflow-auto custom-scrollbar">
    <!-- Top Bar Title Teleport -->
    <Teleport v-if="isMounted" to="#header-title-slot">
      <div class="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <span class="cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 transition-colors" @click="$router.push('/dashboard/patrols')">Patrols</span>
        <ChevronRight class="w-4 h-4" />
        <span class="font-bold text-slate-900 dark:text-slate-100">Patrol History</span>
      </div>
    </Teleport>

    <div class="max-w-[1400px] mx-auto w-full p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-80px)]">
      
      <!-- Header -->
      <div class="flex items-start gap-4 shrink-0">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
          <HistoryIcon class="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div class="pt-1">
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Patrol History</h1>
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Review all completed and missed patrol rounds across your zones.</p>
        </div>
      </div>

      <!-- Main Content (History Table) -->
      <div class="flex-1 ae-card overflow-hidden m-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div class="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Log Entries</h3>
          <div class="flex items-center gap-2">
            <!-- Add future date picker or search here if needed -->
          </div>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          <div v-if="loading" class="flex items-center justify-center h-40">
            <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <table v-else class="ae-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patrol ID</th>
                <th>Guard</th>
                <th>Zone</th>
                <th>Time Span</th>
                <th>Checkpoints</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="p in historicalPatrols"
                :key="p.id"
              >
                <tr
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  @click="toggleHistoryExpand(p.id)"
                >
                  <td class="text-slate-600 dark:text-slate-300 font-medium">
                    {{ p.date || new Date(p.date_created).toLocaleDateString() }}
                  </td>
                  <td><span class="font-mono text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded">{{ p.id }}</span></td>
                  <td class="font-bold text-slate-900 dark:text-slate-100">
                    {{ p.guardName || 'Unassigned' }}
                  </td>
                  <td class="text-slate-500 dark:text-slate-400 font-semibold">
                    {{ p.zoneName || '—' }}
                  </td>
                  <td class="text-slate-500 dark:text-slate-400 text-xs">
                    <div class="font-medium text-slate-800 dark:text-slate-200">
                      Actual: {{ p.actual_start_time ? new Date(p.actual_start_time).toLocaleTimeString([], {timeStyle: 'short'}) : (p.startTime || '--:--') }} → {{ p.actual_end_time ? new Date(p.actual_end_time).toLocaleTimeString([], {timeStyle: 'short'}) : (p.endTime || '--:--') }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                      Scheduled: {{ p.scheduledTime || p.startTime || 'On-demand' }}
                    </div>
                  </td>
                  <td>
                    <span class="font-bold text-slate-700 dark:text-slate-200">{{ checkpointGroups[p.id]?.filter(c => c.status === 'completed' || c.status === 'scanned').length || 0 }}</span>
                    <span class="text-slate-400 mx-1">/</span>
                    <span class="text-slate-500">{{ checkpointGroups[p.id]?.length || 0 }}</span>
                  </td>
                  <td>
                    <span
                      v-if="p.status === 'missed' || p.missedCheckpoints > 0"
                      class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 flex items-center gap-1 w-max"
                    >
                      <AlertTriangle class="w-3 h-3" /> {{ p.status === 'missed' ? 'Missed Patrol' : p.missedCheckpoints + ' Missed' }}
                    </span>
                    <span
                      v-else
                      class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"
                    >
                      <CheckCheck class="w-3 h-3" /> Clear
                    </span>
                  </td>
                </tr>
                
                <!-- Drill-down for checkpoints -->
                <tr
                  v-if="expandedHistoryRow === p.id"
                  class="bg-slate-50 dark:bg-slate-900/50 shadow-inner"
                >
                  <td
                    colspan="7"
                    class="px-6 py-4"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Checkpoints Detail
                      </h4>
                    </div>
                    <div class="w-full">
                      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <li
                          v-for="(cp, idx) in checkpointGroups[p.id]"
                          :key="idx"
                          class="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                        >
                          <CheckCheck v-if="cp.status === 'completed' || cp.status === 'scanned'" class="w-4 h-4 text-emerald-500 shrink-0" />
                          <AlertTriangle v-else-if="cp.status === 'missed'" class="w-4 h-4 text-rose-500 shrink-0" />
                          <Clock v-else class="w-4 h-4 text-slate-400 shrink-0" />
                          
                          <span :class="(cp.status === 'completed' || cp.status === 'scanned') ? 'text-slate-700 dark:text-slate-200 font-bold' : (cp.status === 'missed' ? 'text-rose-600 font-bold' : 'text-slate-500 dark:text-slate-400')">
                            {{ cp.name || cp.checkpointName }}
                          </span>
                          
                          <span v-if="cp.scanTime" class="text-slate-400 dark:text-slate-500 ml-auto font-mono text-[10px] tracking-wider bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {{ cp.scanTime }}
                          </span>
                          <span v-else class="text-slate-400 dark:text-slate-500 ml-auto font-mono text-[10px] tracking-wider italic">
                            {{ cp.status }}
                          </span>
                        </li>
                      </ul>
                      <p v-if="!checkpointGroups[p.id]?.length" class="text-xs text-slate-400 italic">No checkpoints recorded for this patrol.</p>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="!loading && !historicalPatrols.length">
                <td
                  colspan="7"
                  class="py-12 text-center text-sm text-slate-400 font-medium"
                >
                  No historical records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ChevronRight, History as HistoryIcon, AlertTriangle, CheckCheck, Clock, MapPin, Loader2 } from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';

const isMounted = ref(false);
const loading = ref(true);
const historicalPatrols = ref([]);
const checkpointGroups = ref({});
const expandedHistoryRow = ref(null);

const toggleHistoryExpand = (id) => {
  expandedHistoryRow.value = expandedHistoryRow.value === id ? null : id;
};

onMounted(async () => {
  isMounted.value = true;
  await loadHistory();
});

async function loadHistory() {
  loading.value = true;
  try {
    const patrols = await patrolService.getPatrols();
    
    // Filter for completed or missed patrols
    historicalPatrols.value = patrols
      .filter(p => p.status === 'completed' || p.status === 'missed' || p.missedCheckpoints > 0)
      .sort((a, b) => new Date(b.date_created || b.date) - new Date(a.date_created || a.date)); // Sort newest first

    // Fetch checkpoints for each historical patrol
    const cpMap = {};
    const routeCache = {};
    
    await Promise.all(historicalPatrols.value.map(async p => {
      const gId = typeof p.groupId === 'object' && p.groupId ? p.groupId.id : p.groupId;
      if (!gId) return;

      if (!routeCache[gId]) {
        routeCache[gId] = patrolService.getCheckpointsForRoute(gId);
      }
      const staticCps = await routeCache[gId];
      
      cpMap[p.id] = staticCps.map(cp => {
        let scanTime = null;
        if (cp.scanned_at) {
          const d = new Date(cp.scanned_at);
          scanTime = !isNaN(d) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : cp.scanned_at;
        }
        return { ...cp, scanTime };
      });
    }));
    
    checkpointGroups.value = cpMap;
  } catch (error) {
    console.error("Failed to load patrol history:", error);
  } finally {
    loading.value = false;
  }
}
</script>

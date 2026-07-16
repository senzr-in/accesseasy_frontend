<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isMusterMode"
      class="fixed inset-0 z-[300] bg-rose-950/95 backdrop-blur-md flex flex-col p-4 sm:p-8 text-white overflow-hidden"
    >
      <!-- Glowing hazard lines top and bottom -->
      <div class="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)] shrink-0" />

      <!-- Header Section -->
      <div class="py-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(224,242,254,0.3)]">
            <ShieldAlert class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-black uppercase tracking-widest text-white leading-none">
              EMERGENCY MUSTER CONSOLE
            </h1>
            <p class="text-xs font-bold text-rose-300 uppercase tracking-widest mt-1.5">
              Live Evacuation Accountability Roll
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <span 
            v-if="!isOnline" 
            class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
          >
            <WifiOff class="w-3.5 h-3.5" /> Offline Mode Enabled
          </span>
          <button
            class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 text-rose-950 font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 shrink-0"
            @click="cancelEvacuation"
          >
            Cancel Evacuation
          </button>
        </div>
      </div>

      <!-- Occupancy & Progress Counters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 shrink-0">
        <div class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span class="text-[9px] font-black uppercase tracking-widest text-rose-300">Checked In Occupancy</span>
          <h2 class="text-4xl font-black mt-2">
            {{ totalGuests }}
          </h2>
          <p class="text-[10px] text-rose-200 mt-1 uppercase tracking-widest">
            Total active badges in building
          </p>
        </div>
        <div class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span class="text-[9px] font-black uppercase tracking-widest text-rose-300">Accounted Safe</span>
          <h2 class="text-4xl font-black text-emerald-400 mt-2">
            {{ safeCount }}
          </h2>
          <p class="text-[10px] text-rose-200 mt-1 uppercase tracking-widest">
            Marked safe at assembly points
          </p>
        </div>
        <div class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span class="text-[9px] font-black uppercase tracking-widest text-rose-300">Safety Percentage</span>
          <div class="flex items-center gap-4 mt-2">
            <h2 class="text-4xl font-black text-amber-400">
              {{ safetyRatio }}%
            </h2>
            <div class="flex-1 h-3 bg-white dark:bg-slate-900/10 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full bg-emerald-500 transition-all duration-300"
                :style="{ width: `${safetyRatio}%` }"
              />
            </div>
          </div>
          <p class="text-[10px] text-rose-200 mt-1 uppercase tracking-widest">
            Target: 100% accountability
          </p>
        </div>
      </div>

      <!-- Evacuation List -->
      <div class="flex-1 overflow-y-auto bg-white dark:bg-slate-900/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col mb-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white dark:bg-slate-900/5 sticky top-0 backdrop-blur-md z-10 shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-white">
            Missing Visitors & Personnel List
          </h3>
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
            <input
              v-model="query"
              type="text"
              placeholder="Filter by name..."
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900/5 border border-white/15 text-xs text-white placeholder:text-rose-300/50 focus:outline-none focus:border-white/30"
            >
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="text-[9px] font-black uppercase tracking-widest text-rose-300 bg-white dark:bg-slate-900/5 border-b border-white/10 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th class="px-6 py-4">
                  Visitor Name
                </th>
                <th class="px-6 py-4">
                  Company
                </th>
                <th class="px-6 py-4">
                  Host
                </th>
                <th class="px-6 py-4 text-right">
                  Accountability Check
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr 
                v-for="visitor in filteredList" 
                :key="visitor.id"
                :class="['transition-colors', safeMap[visitor.id] ? 'bg-emerald-500/10 hover:bg-emerald-500/15' : 'hover:bg-white dark:bg-slate-900/5']"
              >
                <td class="px-6 py-4 font-bold text-white">
                  {{ visitor.personName }}
                </td>
                <td class="px-6 py-4 text-rose-200">
                  {{ visitor.company || 'Private Guest' }}
                </td>
                <td class="px-6 py-4 text-rose-200">
                  {{ visitor.personToMeet || '—' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    :class="[
                      'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-sm',
                      safeMap[visitor.id] 
                        ? 'bg-emerald-500 text-white border-emerald-400/30' 
                        : 'bg-white dark:bg-slate-900/5 text-rose-200 border-white/10 hover:border-white/20'
                    ]"
                    @click="toggleSafe(visitor.id)"
                  >
                    {{ safeMap[visitor.id] ? 'SAFE ✓' : 'MARK SAFE' }}
                  </button>
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td
                  colspan="4"
                  class="py-12 text-center text-xs font-black uppercase tracking-widest text-rose-300/60"
                >
                  No missing individuals match the query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hazard Stripes Bottom -->
      <div class="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)] shrink-0" />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ShieldAlert, Search, WifiOff } from 'lucide-vue-next';
import { useDashboardState } from '@/composables/useDashboardState';

const { isMusterMode, toggleMusterMode, visitorsInside } = useDashboardState();

const query = ref('');
const safeMap = ref({});
const isOnline = ref(navigator.onLine);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Sync to local storage
  const cachedSafe = localStorage.getItem('access_easy_muster_safe_roll');
  if (cachedSafe) {
    try {
      safeMap.value = JSON.parse(cachedSafe);
    } catch {
      safeMap.value = {};
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

const totalGuests = computed(() => visitorsInside.value.length);

const safeCount = computed(() => {
  let count = 0;
  visitorsInside.value.forEach(v => {
    if (safeMap.value[v.id]) count++;
  });
  return count;
});

const safetyRatio = computed(() => {
  if (totalGuests.value === 0) return 100;
  return Math.round((safeCount.value / totalGuests.value) * 100);
});

const filteredList = computed(() => {
  if (!query.value) return visitorsInside.value;
  return visitorsInside.value.filter(v => 
    v.personName?.toLowerCase().includes(query.value.toLowerCase())
  );
});

const toggleSafe = (visitorId) => {
  safeMap.value[visitorId] = !safeMap.value[visitorId];
  localStorage.setItem('access_easy_muster_safe_roll', JSON.stringify(safeMap.value));
};

const cancelEvacuation = () => {
  toggleMusterMode();
};
</script>

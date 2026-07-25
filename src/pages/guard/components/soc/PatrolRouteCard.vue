<template>
  <div class="relative bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col h-full shadow-2xl overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500">
    <!-- Subtle glow effect -->
    <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-10 bg-cyan-500 pointer-events-none transition-opacity duration-500 group-hover:opacity-20" />

    <!-- Header -->
    <div class="flex justify-between items-start mb-1">
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Route Name
      </p>
      <span class="inline-flex items-center px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
        Active
      </span>
    </div>
    
    <!-- Title -->
    <h3 class="text-lg font-black text-white tracking-wide truncate">
      {{ patrol.routeName || `ROUTE ${patrol.id}` }}
    </h3>
    <p class="text-xs text-slate-400 mb-6">
      #{{ patrol.id }} - Assigned to Guard <span class="text-slate-200 font-semibold">{{ patrol.guardName }}</span>
    </p>

    <!-- Progress Bar Section -->
    <div class="mb-6">
      <div class="flex justify-between items-end mb-2">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress Bar</span>
        <span class="text-[10px] font-bold text-slate-300">{{ remainingTime }}</span>
      </div>
      <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner mb-2">
        <div 
          class="h-full rounded-full transition-all duration-1000 ease-out bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
          :style="`width: ${progressPercentage}%`"
        />
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-300"><span class="font-bold text-white">{{ progressPercentage }}%</span> complete</span>
        <span class="text-slate-300"><span class="font-bold text-white">{{ completedCount }}</span>/{{ totalCount }} Checkpoints</span>
      </div>
    </div>

    <!-- Checkpoints List -->
    <div class="flex-1 min-h-0 flex flex-col mb-6">
      <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Checkpoints</span>
      <span class="text-xs text-slate-500 dark:text-slate-400 mb-3">Visits List</span>
      
      <!-- Scrollable timeline -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
        <div
          v-if="loading"
          class="flex justify-center py-4"
        >
          <div class="w-5 h-5 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
        </div>
        <div
          v-else
          class="relative border-l border-slate-700/50 ml-1.5 space-y-4 py-1"
        >
          <div 
            v-for="(cp, index) in checkpoints" 
            :key="cp.checkpoint_id"
            class="relative pl-5 flex items-center justify-between"
          >
            <!-- Timeline dot -->
            <div 
              class="absolute -left-1.5 w-3 h-3 rounded-full border-2 border-slate-900 z-10"
              :class="cp.status === 'scanned' ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'"
            />
            
            <!-- Checkpoint Name -->
            <span
              class="text-xs font-semibold"
              :class="cp.status === 'scanned' ? 'text-white' : 'text-slate-500 dark:text-slate-400'"
            >
              {{ cp.name }}
            </span>
            
            <!-- Time / Status indicator -->
            <div class="flex items-center gap-2">
              <span
                v-if="cp.status === 'scanned'"
                class="text-[10px] font-mono text-slate-400"
              >{{ cp.scanTime }}</span>
              <!-- Status dot right aligned -->
              <span 
                class="w-1.5 h-1.5 rounded-full"
                :class="cp.status === 'scanned' ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-slate-700'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Incidents -->
    <div class="mb-5">
      <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Incident Icon</span>
      <div
        class="flex items-center gap-2"
        :class="patrol.alerts > 0 ? 'text-rose-400' : 'text-slate-500 dark:text-slate-400'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
        <span class="text-xs font-bold">{{ patrol.alerts }} incidents flagged</span>
      </div>
    </div>

    <!-- Actions -->
    <div>
      <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Actions</span>
      <div class="flex gap-2">
        <button class="flex-1 flex items-center justify-center gap-1.5 bg-slate-800/50 hover:bg-slate-700 border border-white/5 hover:border-cyan-500/30 rounded-lg py-2 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-cyan-400"
          ><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle
            cx="12"
            cy="10"
            r="3"
          /></svg>
          <span class="text-[10px] font-bold text-slate-300">View Map</span>
        </button>
        <button class="flex-1 flex items-center justify-center gap-1 bg-slate-800/50 hover:bg-slate-700 border border-white/5 hover:border-cyan-500/30 rounded-lg py-2 transition-colors">
          <span class="text-[10px] font-bold text-slate-300">Contact Guard</span>
        </button>
        <button class="flex-1 flex items-center justify-center gap-1 bg-slate-800/50 hover:bg-slate-700 border border-white/5 hover:border-cyan-500/30 rounded-lg py-2 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-slate-400"
          ><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
          <span class="text-[10px] font-bold text-slate-300">History</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { patrolService } from '@/services/patrolService';

const props = defineProps({
  patrol: {
    type: Object,
    required: true
  }
});

const checkpoints = ref([]);
const loading = ref(true);

const fetchCheckpoints = async () => {
  loading.value = true;
  try {
    const details = await patrolService.getPatrolDetails(props.patrol.id);
    checkpoints.value = details.checkpoints || [];
  } catch (error) {
    console.error("Failed to load checkpoints", error);
  } finally {
    loading.value = false;
  }
};

const totalCount = computed(() => checkpoints.value.length);
const completedCount = computed(() => checkpoints.value.filter(cp => cp.status === 'scanned').length);
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

// Mock remaining time calculation for UI
const remainingTime = computed(() => {
  if (progressPercentage.value >= 100) return 'Complete';
  const remainingCheckpoints = totalCount.value - completedCount.value;
  // Estimate ~15 mins per remaining checkpoint
  const mins = remainingCheckpoints * 15;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
});

onMounted(() => {
  fetchCheckpoints();
});
</script>

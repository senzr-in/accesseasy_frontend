<template>
  <GlassCard
    class="relative flex flex-col h-full"
    no-padding
  >
    <!-- Map Toolbar -->
    <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
      <!-- Legend/Status -->
      <div class="flex items-center gap-3 bg-white dark:bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg pointer-events-auto">
        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span class="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
          GPS Active
        </div>
        <div class="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1" />
        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
          Indoor PDR
        </div>
      </div>
      
      <!-- Controls -->
      <div class="flex gap-2 pointer-events-auto">
        <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500/50 transition-all shadow-lg">
          <Layers class="w-4 h-4" />
        </button>
        <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500/50 transition-all shadow-lg">
          <Maximize class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Map Canvas (Simulated) -->
    <div class="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      <!-- Grid Pattern -->
      <div
        class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 32px 32px; color: white;"
      />
      
      <!-- Simulated Tracking Nodes -->
      <div
        v-for="patrol in socStore.activePatrols"
        :key="patrol.id"
        class="absolute w-12 h-12 -ml-6 -mt-6 transform transition-all duration-1000 ease-out"
        :style="getRandomPosition()"
      >
        <div class="relative w-full h-full flex items-center justify-center group cursor-pointer">
          <!-- Pulse Ring -->
          <div
            class="absolute inset-0 rounded-full animate-ping opacity-30"
            :class="patrol.mode === 'outdoor' ? 'bg-cyan-400' : 'bg-emerald-400'"
          />
          
          <!-- Avatar Node -->
          <div
            class="w-8 h-8 rounded-full border-2 bg-slate-900 shadow-xl flex items-center justify-center relative z-10"
            :class="patrol.mode === 'outdoor' ? 'border-cyan-500 shadow-cyan-500/30' : 'border-emerald-500 shadow-emerald-500/30'"
          >
            <User class="w-4 h-4 text-white" />
          </div>

          <!-- Tooltip -->
          <div class="absolute top-full mt-2 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
            <p class="text-xs font-bold text-white">
              {{ patrol.guardName }}
            </p>
            <p class="text-[10px] text-slate-400 font-mono">
              {{ patrol.mode === 'outdoor' ? 'GPS' : 'PDR' }} • {{ patrol.currentFloor || 'N/A' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Map Center Indicator -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-20 pointer-events-none">
        <Compass class="w-16 h-16 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
        <span class="text-xs font-bold uppercase tracking-widest mt-2 text-slate-500 dark:text-slate-400">Live Telemetry Active</span>
      </div>
    </div>
  </GlassCard>
</template>

<script setup>
import { Layers, Maximize, User, Compass } from 'lucide-vue-next';
import GlassCard from '../shared/GlassCard.vue';
import { useSOCStore } from '@/stores/useSOCStore';

const socStore = useSOCStore();

// Random position simulator for the mockup
const getRandomPosition = () => {
  const top = Math.floor(Math.random() * 60) + 20; // 20% to 80%
  const left = Math.floor(Math.random() * 60) + 20;
  return `top: ${top}%; left: ${left}%;`;
};
</script>

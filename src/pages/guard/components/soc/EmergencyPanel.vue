<template>
  <GlassCard class="flex flex-col gap-4 relative overflow-hidden" noPadding>
    <!-- SOS / Emergency Block -->
    <div class="p-5 border-b border-slate-200/50 dark:border-white/5 relative z-10 flex flex-col items-center justify-center bg-rose-50/50 dark:bg-rose-950/20 text-center">
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 shadow-xl border-4 border-white/50 dark:border-slate-900"
        :class="hasEmergency ? 'bg-rose-600 shadow-rose-500/50 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 shadow-transparent'"
      >
        <Siren class="w-8 h-8" :class="hasEmergency ? 'text-white' : 'text-slate-400 dark:text-slate-600'" />
      </div>
      
      <h3 class="text-sm font-black uppercase tracking-widest" :class="hasEmergency ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'">
        {{ hasEmergency ? 'Emergency Active' : 'System Secure' }}
      </h3>
      <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
        SOS Dispatch Panel
      </p>

      <button 
        class="mt-4 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border"
        :class="hasEmergency 
          ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]' 
          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700'"
      >
        {{ hasEmergency ? 'View Emergency' : 'Arm System' }}
      </button>
    </div>

    <!-- Weather & Context Block -->
    <div class="p-5 relative z-10 flex items-center justify-between">
      <div>
        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1 uppercase tracking-widest">
          <Cloud class="w-3.5 h-3.5 text-cyan-500" /> Operational Context
        </p>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">72°F</h3>
        <p class="text-xs font-bold text-slate-500">Clear Skies, 12mph Wind</p>
      </div>
      <div class="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/50 rounded-full flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20">
        <Sun class="w-6 h-6 text-amber-500 drop-shadow-[0_0_5px_#f59e0b]" />
      </div>
    </div>
  </GlassCard>
</template>

<script setup>
import { computed } from 'vue';
import { Siren, Cloud, Sun } from 'lucide-vue-next';
import GlassCard from '../shared/GlassCard.vue';
import { useSOCStore } from '@/stores/useSOCStore';

const socStore = useSOCStore();

// Simulation logic for mockup purposes
const hasEmergency = computed(() => socStore.criticalAlerts.length > 0);
</script>

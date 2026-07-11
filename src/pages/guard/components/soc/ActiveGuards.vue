<template>
  <div class="h-full flex flex-col overflow-hidden">
    <h2 class="text-lg font-black text-slate-900 dark:text-white drop-shadow-sm flex justify-between items-center shrink-0 mb-3">
      Active Guards in Field
      <span class="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
        {{ socStore.activePatrols.length }} Units
      </span>
    </h2>

    <div v-if="socStore.activePatrols.length === 0" class="h-32 rounded-[18px] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30">
      <ShieldOff class="w-8 h-8 text-slate-300 dark:text-white/20 mb-2" />
      <p class="text-sm font-bold text-slate-400">No Active Units</p>
    </div>

    <div v-else class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PatrolRouteCard 
          v-for="patrol in socStore.activePatrols" 
          :key="patrol.id"
          :patrol="patrol"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShieldOff } from 'lucide-vue-next';
import { useSOCStore } from '@/stores/useSOCStore';
import PatrolRouteCard from './PatrolRouteCard.vue';

const socStore = useSOCStore();
</script>

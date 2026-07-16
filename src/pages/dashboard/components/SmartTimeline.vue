<template>
  <div class="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
      <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Activity class="w-4 h-4 text-indigo-500" />
        Live Building Timeline
      </h3>
      <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black tracking-widest uppercase shrink-0">
        <span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" /></span> LIVE
      </span>
    </div>

    <!-- Timeline scroll container -->
    <div class="flex-1 overflow-y-auto mt-4 pr-1 space-y-4 custom-scrollbar">
      <div 
        v-for="event in timelineEvents" 
        :key="event.id"
        class="flex gap-4 relative pl-6 pb-2 group"
      >
        <!-- Timeline vertical connector line -->
        <div class="absolute left-2.5 top-5 bottom-0 w-[1px] bg-slate-200 group-last:hidden" />
        
        <!-- Bullet dot with customized state colors -->
        <div 
          class="absolute left-1.5 top-1.5 w-2 h-2 rounded-full ring-4"
          :class="[
            event.type === 'success' ? 'bg-emerald-500 ring-emerald-500/20' :
            event.type === 'warning' ? 'bg-amber-500 ring-amber-500/20' :
            event.type === 'alert' ? 'bg-rose-500 ring-rose-500/20 animate-pulse' :
            'bg-slate-400 ring-slate-400/20'
          ]"
        />

        <div class="flex-1 text-xs">
          <div class="flex justify-between items-center text-slate-400 font-bold text-[9px] uppercase tracking-widest leading-none">
            <span>{{ event.type || 'Event' }}</span>
            <span>{{ event.time }}</span>
          </div>
          <p class="font-bold text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
            {{ event.text }}
          </p>
        </div>
      </div>

      <!-- Empty state -->
      <div 
        v-if="timelineEvents.length === 0"
        class="py-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400"
      >
        No timeline events registered yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { Activity } from 'lucide-vue-next';
import { useDashboardState } from '@/composables/useDashboardState';

const { timelineEvents } = useDashboardState();
</script>

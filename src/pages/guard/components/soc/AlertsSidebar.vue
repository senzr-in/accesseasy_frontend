<template>
  <GlassCard
    class="h-full flex flex-col overflow-hidden"
    no-padding
  >
    <!-- Header -->
    <div class="p-5 border-b border-slate-200 dark:border-slate-800/50 dark:border-white/5 flex items-center justify-between shrink-0">
      <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
        Live Alerts
        <span
          v-if="socStore.criticalAlerts.length > 0"
          class="flex h-2.5 w-2.5 relative"
        >
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </span>
      </h2>
      <button class="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors">
        View All
      </button>
    </div>

    <!-- Alerts List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
      <div
        v-if="socStore.alerts.length === 0"
        class="h-full flex flex-col items-center justify-center text-center p-6"
      >
        <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck class="w-8 h-8 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <p class="text-sm font-bold text-slate-900 dark:text-white">
          All Clear
        </p>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          No active violations or warnings.
        </p>
      </div>

      <div
        v-for="alert in socStore.sortedAlerts"
        :key="alert.id"
        class="p-4 rounded-xl border relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer group"
        :class="[
          alert.severity === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-500/20 hover:border-rose-400/50' 
            : alert.severity === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400/50'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800/50 dark:border-white/5 hover:border-cyan-500/30'
        ]"
      >
        <!-- Accent Line -->
        <div 
          class="absolute left-0 top-0 bottom-0 w-1 opacity-80" 
          :class="alert.severity === 'error' ? 'bg-rose-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'" 
        />
        
        <div class="flex items-start gap-3 pl-1">
          <div class="mt-0.5 shrink-0">
            <AlertTriangle
              v-if="alert.severity === 'error' || alert.severity === 'warning'"
              class="w-4 h-4"
              :class="alert.severity === 'error' ? 'text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]' : 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]'"
            />
            <Info
              v-else
              class="w-4 h-4 text-cyan-500 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
            />
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
              {{ alert.message }}
            </p>
            <div
              class="flex justify-between items-center mt-2.5 pt-2.5 border-t"
              :class="alert.severity === 'error' ? 'border-rose-200/50 dark:border-rose-500/20' : alert.severity === 'warning' ? 'border-amber-200/50 dark:border-amber-500/20' : 'border-slate-200 dark:border-slate-800/50 dark:border-white/5'"
            >
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">{{ alert.time }}</span>
              <button
                class="text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                :class="alert.severity === 'error' ? 'text-rose-600 dark:text-rose-400' : alert.severity === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-cyan-600 dark:text-cyan-400'"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup>
import { ShieldCheck, AlertTriangle, Info } from 'lucide-vue-next';
import GlassCard from '../shared/GlassCard.vue';
import { useSOCStore } from '@/stores/useSOCStore';

const socStore = useSOCStore();
</script>

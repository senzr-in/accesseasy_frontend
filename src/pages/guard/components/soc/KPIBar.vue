<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    <!-- Guards On Duty -->
    <GlassCard class="flex flex-col justify-center relative group" noPadding>
      <div class="absolute right-0 top-0 w-20 h-20 bg-blue-500/10 rounded-full blur-[30px] group-hover:bg-blue-500/20 transition-all duration-500" />
      <div class="p-5 relative z-10">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          <ShieldCheck class="w-3.5 h-3.5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> On Duty
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-black text-slate-900 dark:text-white">{{ socStore.kpiMetrics.guardsOnDuty }}</h3>
          <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp class="w-3 h-3"/> 2</span>
        </div>
      </div>
    </GlassCard>

    <!-- Active Patrols -->
    <GlassCard class="flex flex-col justify-center relative group" noPadding>
      <div class="absolute right-0 top-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-[30px] group-hover:bg-cyan-500/20 transition-all duration-500" />
      <div class="p-5 relative z-10">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          <Route class="w-3.5 h-3.5 text-cyan-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> Patrols
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-black text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">{{ socStore.kpiMetrics.activePatrols }}</h3>
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          </span>
        </div>
      </div>
    </GlassCard>

    <!-- Completed Checkpoints -->
    <GlassCard class="flex flex-col justify-center relative group" noPadding>
      <div class="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-all duration-500" />
      <div class="p-5 relative z-10">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          <MapPin class="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Checkpoints
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-black text-slate-900 dark:text-white">{{ socStore.kpiMetrics.completedCheckpoints }}</h3>
          <div class="w-12 h-4 flex items-center gap-0.5 opacity-50">
            <!-- Sparkline simulation -->
            <div class="w-1.5 h-1/3 bg-emerald-400 rounded-t-sm"></div>
            <div class="w-1.5 h-2/3 bg-emerald-400 rounded-t-sm"></div>
            <div class="w-1.5 h-1/2 bg-emerald-400 rounded-t-sm"></div>
            <div class="w-1.5 h-3/4 bg-emerald-400 rounded-t-sm"></div>
            <div class="w-1.5 h-full bg-emerald-500 rounded-t-sm shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </div>
    </GlassCard>

    <!-- Active Alerts -->
    <GlassCard class="flex flex-col justify-center relative group" noPadding>
      <div class="absolute right-0 top-0 w-20 h-20 bg-amber-500/10 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition-all duration-500" />
      <div class="p-5 relative z-10">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          <Bell class="w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Alerts
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-black text-amber-600 dark:text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">{{ socStore.kpiMetrics.activeAlerts }}</h3>
          <span class="text-xs font-bold text-slate-400">Total</span>
        </div>
      </div>
    </GlassCard>

    <!-- Critical Incidents -->
    <GlassCard class="flex flex-col justify-center relative group" noPadding accentColor="bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]">
      <div class="absolute right-0 top-0 w-20 h-20 bg-rose-500/10 rounded-full blur-[30px] group-hover:bg-rose-500/20 transition-all duration-500" />
      <div class="p-5 relative z-10">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          <AlertTriangle class="w-3.5 h-3.5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Critical
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-black text-rose-600 dark:text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">{{ socStore.kpiMetrics.criticalIncidents }}</h3>
          <span v-if="socStore.kpiMetrics.criticalIncidents > 0" class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
          </span>
          <span v-else class="text-xs font-bold text-emerald-500">Safe</span>
        </div>
      </div>
    </GlassCard>

    <!-- Visitors Inside -->
    <GlassCard class="flex flex-col justify-center relative group" noPadding>
      <div class="absolute right-0 top-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-[30px] group-hover:bg-indigo-500/20 transition-all duration-500" />
      <div class="p-5 relative z-10">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          <Users class="w-3.5 h-3.5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> Visitors
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-3xl font-black text-slate-900 dark:text-white">{{ socStore.kpiMetrics.visitorsInside }}</h3>
          <span class="text-xs font-bold text-slate-400">Checked-in</span>
        </div>
      </div>
    </GlassCard>
  </div>
</template>

<script setup>
import { ShieldCheck, Route, MapPin, Bell, AlertTriangle, Users, TrendingUp } from 'lucide-vue-next';
import GlassCard from '../shared/GlassCard.vue';
import { useSOCStore } from '@/stores/useSOCStore';

const socStore = useSOCStore();
</script>

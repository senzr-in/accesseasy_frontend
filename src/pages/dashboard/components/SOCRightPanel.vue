<template>
  <div class="h-full flex flex-col gap-6">
    <!-- Today's Overview -->
    <div class="soc-card p-6 bg-zinc-900/80">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-white">
          Today's Overview
        </h3>
        <select class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-md text-xs text-slate-300 px-2 py-1 outline-none">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div class="space-y-5">
        <!-- Entries -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <LogIn class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-xs font-bold text-slate-300">Entries</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-white">{{ overview.entries }}</span>
                <span
                  class="text-[10px] font-bold"
                  :class="overview.entriesTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ overview.entriesTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(overview.entriesTrend) }}%
                </span>
              </div>
            </div>
            <div class="h-1.5 w-full bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full"
                style="width: 75%"
              />
            </div>
          </div>
        </div>

        <!-- Exits -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <LogOut class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-xs font-bold text-slate-300">Exits</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-white">{{ overview.exits }}</span>
                <span
                  class="text-[10px] font-bold"
                  :class="overview.exitsTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ overview.exitsTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(overview.exitsTrend) }}%
                </span>
              </div>
            </div>
            <div class="h-1.5 w-full bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-purple-500 rounded-full"
                style="width: 62%"
              />
            </div>
          </div>
        </div>

        <!-- Employees Inside -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Users class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-xs font-bold text-slate-300">Employees Inside</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-white">{{ overview.employeesInside }}</span>
                <span
                  class="text-[10px] font-bold"
                  :class="overview.employeesInsideTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ overview.employeesInsideTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(overview.employeesInsideTrend) }}%
                </span>
              </div>
            </div>
            <div class="h-1.5 w-full bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full"
                style="width: 85%"
              />
            </div>
          </div>
        </div>

        <!-- Vehicles Inside -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
            <Car class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-xs font-bold text-slate-300">Vehicles Inside</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-white">{{ overview.vehiclesInside }}</span>
                <span
                  class="text-[10px] font-bold"
                  :class="overview.vehiclesInsideTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ overview.vehiclesInsideTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(overview.vehiclesInsideTrend) }}%
                </span>
              </div>
            </div>
            <div class="h-1.5 w-full bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-teal-500 rounded-full"
                style="width: 40%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts Feed -->
    <div class="soc-card flex-1 flex flex-col overflow-hidden bg-zinc-900/80">
      <div class="px-6 py-5 border-b border-white/5 flex justify-between items-center shrink-0">
        <h3 class="text-xs font-black uppercase tracking-widest text-white">
          Alerts
        </h3>
        <button class="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
          View All
        </button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div 
          v-for="alert in alerts" 
          :key="alert.id"
          class="p-4 rounded-xl hover:bg-white dark:bg-slate-900/5 transition-colors flex gap-4 group"
        >
          <!-- Icon -->
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            :class="{
              'bg-rose-500/10 text-rose-500': alert.priority === 'critical',
              'bg-orange-500/10 text-orange-500': alert.priority === 'warning',
              'bg-blue-500/10 text-blue-500': alert.priority === 'info'
            }"
          >
            <ShieldAlert
              v-if="alert.priority === 'critical'"
              class="w-4 h-4"
            />
            <AlertTriangle
              v-else-if="alert.priority === 'warning'"
              class="w-4 h-4"
            />
            <Info
              v-else
              class="w-4 h-4"
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <h4
              class="text-xs font-bold text-white mb-1"
              :class="{
                'text-rose-400': alert.priority === 'critical',
                'text-orange-400': alert.priority === 'warning',
                'text-blue-400': alert.priority === 'info'
              }"
            >
              {{ alert.title }}
            </h4>
            <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <span class="truncate">{{ alert.location }}</span>
              <span class="text-slate-700 dark:text-slate-200">•</span>
              <span class="shrink-0">{{ alert.time }}</span>
            </div>
          </div>

          <!-- Action -->
          <button class="w-8 h-8 rounded-lg bg-white dark:bg-slate-900/5 hover:bg-white dark:bg-slate-900/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100">
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
        
        <div
          v-if="alerts.length === 0"
          class="py-12 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"
        >
          No active alerts.
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-white/5 shrink-0 flex justify-center bg-black/20">
        <button class="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2 uppercase tracking-widest group">
          View All Alerts <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LogIn, LogOut, Users, Car, ShieldAlert, AlertTriangle, Info, ArrowRight } from 'lucide-vue-next';

defineProps({
  overview: {
    type: Object,
    required: true,
    default: () => ({
      entries: 0,
      entriesTrend: 0,
      exits: 0,
      exitsTrend: 0,
      employeesInside: 0,
      employeesInsideTrend: 0,
      vehiclesInside: 0,
      vehiclesInsideTrend: 0
    })
  },
  alerts: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

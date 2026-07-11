<template>
  <div class="space-y-6 pb-12">
    <!-- Header alert banner -->
    <div class="bg-rose-500/10 border border-rose-500/25 rounded-3xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
      <div class="absolute -right-12 -top-12 w-40 h-40 bg-rose-500/5 rounded-full blur-2xl" />
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
          <ShieldAlert class="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 class="text-xs font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest leading-none">Security Briefing</h4>
          <p class="text-xs font-semibold text-rose-700 dark:text-rose-300 mt-1.5 leading-relaxed">
            Watchlist monitor: no blacklist matches detected. 2 visitors currently overstayed limits.
          </p>
        </div>
      </div>
      <button 
        @click="toggleMusterMode"
        class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shrink-0 shadow-sm"
      >
        Muster Mode
      </button>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Authorized Inside</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">{{ stats.activeNow }}</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Active guests in building</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-rose-500" />
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Denied Entries</span>
        <h3 class="text-3xl font-black mt-2 text-rose-500">{{ stats.deniedToday }}</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Failed gate validations</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Total gate scans</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">{{ stats.totalToday }}</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Checked in today</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Access Health</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">{{ authPercentage }}%</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorization ratio</p>
      </div>
    </div>

    <!-- Main Guard Grid layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Verification Match Photo Queue (Left 2-cols) -->
      <div class="lg:col-span-2 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[500px]">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Active Gate Verification Cards
          </h3>
          <button 
            @click="$router.push('/dashboard/authorize')"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest active:scale-95 shadow-sm transition-all flex items-center gap-1.5"
          >
            <Camera class="w-4 h-4" /> Open Camera Scan
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar bg-slate-50/30 dark:bg-zinc-950/20">
          <div 
            v-for="visitor in visitorsInside.slice(0, 6)" 
            :key="visitor.id"
            class="p-4 bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between shadow-sm cursor-pointer group"
            @click="openDrawer('visitor', visitor)"
          >
            <div class="flex gap-4">
              <!-- Visitor avatar photo -->
              <div class="w-16 h-16 rounded-xl bg-indigo-500/10 flex items-center justify-center font-bold text-lg text-indigo-600 shrink-0">
                <img v-if="visitor.photo" :src="getPhotoUrl(visitor.photo)" class="w-full h-full object-cover rounded-xl" />
                <span v-else>{{ visitor.personName?.charAt(0).toUpperCase() || '?' }}</span>
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-indigo-600 transition-colors">{{ visitor.personName }}</h4>
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-1 truncate">{{ visitor.company || 'Private Guest' }}</span>
                <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5 truncate">Access: {{ visitor.assignedAccessLevels?.accessLevelName || 'General' }}</span>
              </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center text-[10px]">
              <span class="text-slate-400 font-bold uppercase tracking-widest">Meeting Host: {{ visitor.personToMeet || '—' }}</span>
              <button 
                @click.stop="checkOutVisitor(visitor)"
                class="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold uppercase text-[9px]"
              >
                Check Out
              </button>
            </div>
          </div>
          
          <div v-if="visitorsInside.length === 0" class="col-span-2 py-20 text-center text-xs font-black uppercase tracking-widest text-slate-400">
            No active visitor verification records found inside.
          </div>
        </div>
      </div>

      <!-- Live scan activity log (Right 1-col) -->
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[500px] flex flex-col">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            Live Gate Scans
            <span class="relative flex h-1.5 w-1.5 shrink-0"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" /></span>
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-zinc-800">
          <div 
            v-for="log in recentLogs.slice(0, 10)" 
            :key="log.id"
            class="px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors flex justify-between items-center gap-4 text-xs"
          >
            <div class="min-w-0">
              <h4 class="font-bold text-slate-900 dark:text-white truncate">{{ log.name || 'Unknown Visitor' }}</h4>
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">{{ formatTime(log.date_created) }} · {{ log.door?.doorName || 'Main Gate' }}</span>
            </div>
            
            <span 
              class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shrink-0 border"
              :class="(log.ValidLogs === 'authorized' || log.ValidLogs === true) ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400'"
            >
              {{ (log.ValidLogs === 'authorized' || log.ValidLogs === true) ? 'Auth' : 'Denied' }}
            </span>
          </div>
          
          <div v-if="recentLogs.length === 0" class="py-16 text-center text-xs font-black uppercase tracking-widest text-slate-400">
            No gate access events today.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ShieldAlert, Camera } from 'lucide-vue-next';
import { useDashboardState } from '@/composables/useDashboardState';
import { authService } from '@/services/authService';

const { stats, visitorsInside, recentLogs, toggleMusterMode, checkOutVisitor, openDrawer } = useDashboardState();

const authPercentage = computed(() => {
  const total = stats.value.totalToday || 0;
  const denied = stats.value.deniedToday || 0;
  if (total === 0) return 100;
  return Math.round(((total - denied) / total) * 100);
});

const getPhotoUrl = (photoId) => {
  const token = authService.getToken();
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${token}`;
};

const formatTime = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return dateString; }
};
</script>

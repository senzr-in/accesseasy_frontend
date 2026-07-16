<template>
  <div class="space-y-6 pb-12">
    <!-- AI Briefing Banner -->
    <div class="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-slate-500/0 dark:from-indigo-500/20 dark:via-purple-500/10 border border-slate-200 dark:border-slate-800/50 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
      <div class="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Sparkles class="w-5 h-5 animate-pulse" />
        </div>
        <div class="space-y-2">
          <h2 class="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">
            AI Operational Briefing
          </h2>
          <p class="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Good morning, {{ userName }}. Today there are <strong class="text-indigo-600 dark:text-indigo-400">{{ stats.expectedToday }} expected visitors</strong>, <strong class="text-indigo-600 dark:text-indigo-400">{{ stats.pendingApprovals }} currently waiting</strong> in the lobby, and peak traffic is predicted between <strong class="text-slate-900 dark:text-white">09:30–11:00 AM</strong>. Recommended action: check in priority VIP guests and approve pending host passes before arrival volumes increase.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <button 
        class="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        @click="$router.push('/dashboard/visitors')"
      >
        <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <UserPlus class="w-5 h-5" />
        </div>
        <div class="text-left">
          <p class="text-xs font-black text-slate-900 dark:text-white leading-none">
            Register Walk-in
          </p>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Express form</span>
        </div>
      </button>

      <button 
        class="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        @click="commandPaletteOpen = true"
      >
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Search class="w-5 h-5" />
        </div>
        <div class="text-left">
          <p class="text-xs font-black text-slate-900 dark:text-white leading-none">
            Search Database
          </p>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Ctrl + K Shortcut</span>
        </div>
      </button>

      <button 
        class="flex items-center gap-3 p-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        @click="toggleMusterMode"
      >
        <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900/20 flex items-center justify-center text-white">
          <ShieldAlert class="w-5 h-5" />
        </div>
        <div class="text-left">
          <p class="text-xs font-black leading-none">
            Emergency Muster
          </p>
          <span class="text-[9px] font-black text-rose-200 uppercase tracking-widest mt-1 block">Trigger evacuation</span>
        </div>
      </button>

      <button 
        class="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        @click="$router.push('/dashboard/visitor-portals')"
      >
        <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Printer class="w-5 h-5" />
        </div>
        <div class="text-left">
          <p class="text-xs font-black text-slate-900 dark:text-white leading-none">
            Badge Printer
          </p>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Check print queue</span>
        </div>
      </button>
    </div>

    <!-- Smart Queue & Kanban switcher -->
    <div class="bg-white dark:bg-slate-900/80 dark:hover:bg-zinc-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
      <div class="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/50 dark:hover:bg-zinc-800/50">
        <div>
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            Smart Visitor Queue
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          </h3>
          <p class="text-[10px] font-semibold text-slate-400 mt-1">
            Manage, approve, and track lobby guests inside the premises.
          </p>
        </div>

        <!-- Layout toggle -->
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-zinc-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800/30 dark:border-zinc-800 shrink-0">
          <button 
            :class="['px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', layoutView === 'list' ? 'bg-white dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300']"
            @click="layoutView = 'list'"
          >
            List View
          </button>
          <button 
            :class="['px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', layoutView === 'kanban' ? 'bg-white dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300']"
            @click="layoutView = 'kanban'"
          >
            Kanban Board
          </button>
        </div>
      </div>

      <!-- List view rendering -->
      <div
        v-if="layoutView === 'list'"
        class="overflow-x-auto"
      >
        <table class="w-full text-sm text-left border-collapse">
          <thead class="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800 sticky top-0">
            <tr>
              <th class="px-6 py-4">
                Visitor
              </th>
              <th class="px-6 py-4">
                Host To Meet
              </th>
              <th class="px-6 py-4">
                Purpose
              </th>
              <th class="px-6 py-4">
                Status
              </th>
              <th class="px-6 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr 
              v-for="visitor in allQueue" 
              :key="visitor.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 dark:hoverdark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
              @click="openDrawer('visitor', visitor)"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                    <img
                      v-if="visitor.photo"
                      :src="getPhotoUrl(visitor.photo)"
                      class="w-full h-full object-cover rounded-full"
                    >
                    <span v-else>{{ visitor.personName?.charAt(0).toUpperCase() || '?' }}</span>
                  </div>
                  <div>
                    <span class="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{{ visitor.personName }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{{ visitor.company || 'Private Guest' }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-bold text-slate-700 dark:text-zinc-300">
                {{ visitor.personToMeet || '—' }}
              </td>
              <td class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {{ visitor.reasonForVisit || 'General Visit' }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border"
                  :class="visitor.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400'"
                >
                  {{ visitor.status === 'active' ? 'Inside' : 'Waiting' }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-right"
                @click.stop
              >
                <div class="flex items-center justify-end gap-2">
                  <button 
                    v-if="visitor.status === 'inactive'"
                    class="h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95"
                    @click="checkInVisitor(visitor)"
                  >
                    Check In
                  </button>
                  <button 
                    v-if="visitor.status === 'active'"
                    class="h-8 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 text-white font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95"
                    @click="checkOutVisitor(visitor)"
                  >
                    Check Out
                  </button>
                  <button 
                    class="h-8 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950"
                    @click="notifyHost(visitor)"
                  >
                    Notify Host
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="allQueue.length === 0">
              <td
                colspan="5"
                class="py-16 text-center text-xs font-black uppercase tracking-widest text-slate-400"
              >
                No active or waiting visitors registered today.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Kanban view rendering -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
      >
        <!-- Waiting Column -->
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <span class="text-[10px] font-black uppercase tracking-widest text-amber-500">Waiting ({{ visitorsWaiting.length }})</span>
          </div>
          <div class="space-y-3">
            <div 
              v-for="visitor in visitorsWaiting" 
              :key="visitor.id"
              class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/50 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
              @click="openDrawer('visitor', visitor)"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0">
                  <img
                    v-if="visitor.photo"
                    :src="getPhotoUrl(visitor.photo)"
                    class="w-full h-full object-cover rounded-full"
                  >
                  <span v-else>{{ visitor.personName?.charAt(0).toUpperCase() || '?' }}</span>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {{ visitor.personName }}
                  </h4>
                  <span class="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5 block">{{ visitor.company || 'Private' }}</span>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Meeting: {{ visitor.personToMeet || '—' }}</span>
                <button 
                  class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase tracking-widest"
                  @click.stop="checkInVisitor(visitor)"
                >
                  Check In
                </button>
              </div>
            </div>
            <div
              v-if="visitorsWaiting.length === 0"
              class="py-12 text-center text-xs font-black uppercase tracking-widest text-slate-400"
            >
              Queue is clear.
            </div>
          </div>
        </div>

        <!-- Inside Column -->
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <span class="text-[10px] font-black uppercase tracking-widest text-emerald-500">Inside Now ({{ visitorsInside.length }})</span>
          </div>
          <div class="space-y-3">
            <div 
              v-for="visitor in visitorsInside" 
              :key="visitor.id"
              class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/50 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
              @click="openDrawer('visitor', visitor)"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0">
                  <img
                    v-if="visitor.photo"
                    :src="getPhotoUrl(visitor.photo)"
                    class="w-full h-full object-cover rounded-full"
                  >
                  <span v-else>{{ visitor.personName?.charAt(0).toUpperCase() || '?' }}</span>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {{ visitor.personName }}
                  </h4>
                  <span class="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5 block">{{ visitor.company || 'Private' }}</span>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Meeting: {{ visitor.personToMeet || '—' }}</span>
                <button 
                  class="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-800 text-white font-bold text-[9px] uppercase tracking-widest"
                  @click.stop="checkOutVisitor(visitor)"
                >
                  Check Out
                </button>
              </div>
            </div>
            <div
              v-if="visitorsInside.length === 0"
              class="py-12 text-center text-xs font-black uppercase tracking-widest text-slate-400"
            >
              No visitors inside.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Sparkles, UserPlus, Search, ShieldAlert, Printer } from 'lucide-vue-next';
import { useDashboardState } from '@/composables/useDashboardState';
import { authService } from '@/services/authService';

const rawUser = authService.getUserData();
const userName = computed(() => `${rawUser?.first_name || ''} ${rawUser?.last_name || ''}`.trim() || 'Operator');

const { 
  stats, 
  visitorsWaiting, 
  visitorsInside, 
  commandPaletteOpen, 
  toggleMusterMode, 
  checkInVisitor, 
  checkOutVisitor, 
  notifyHost, 
  openDrawer 
} = useDashboardState();

const layoutView = ref('list');

const allQueue = computed(() => {
  return [...visitorsWaiting.value, ...visitorsInside.value];
});

const getPhotoUrl = (photoId) => {
  const token = authService.getToken();
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${token}`;
};
</script>

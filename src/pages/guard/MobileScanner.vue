<template>
  <div class="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden">
    <!-- Top Bar -->
    <div class="px-6 pt-8 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950">
      <h1 class="text-2xl font-bold tracking-tight">
        Guard<span class="text-blue-600 dark:text-blue-500">Mobile</span>
      </h1>
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
        Active Shift • Zone A
      </p>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col relative overflow-hidden">
      <!-- Patrol Scanner View -->
      <div
        v-if="activeTab === 'patrol'"
        class="flex-1 flex flex-col p-6 items-center justify-center animate-in fade-in zoom-in-95 duration-300"
      >
        <div class="w-full max-w-sm flex flex-col items-center">
          <div class="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8">
            Today's Patrol • Checkpoint 2 of 8
          </div>
          
          <h2 class="text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Warehouse Entrance
          </h2>
          
          <button class="w-48 h-48 rounded-full bg-blue-50 dark:bg-blue-900/20 p-2 shadow-sm border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all transform hover:scale-105 active:scale-95 group mb-12">
            <div class="w-full h-full bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center border border-blue-200 dark:border-blue-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-800/50 transition-colors">
              <ScanLine class="w-12 h-12 text-blue-600 dark:text-blue-400 mb-2" />
              <span class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-white">Scan QR</span>
            </div>
          </button>
          
          <div class="text-center space-y-1 w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8 shadow-sm">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Next Destination
            </p>
            <p class="text-sm font-bold text-slate-900 dark:text-white">
              Parking Structure A
            </p>
          </div>
          
          <div class="flex w-full gap-4">
            <button class="flex-1 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 flex justify-center items-center gap-2 shadow-sm">
              <FileWarning class="w-4 h-4" /> Report
            </button>
            <button class="flex-1 py-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-xs font-semibold uppercase tracking-wider hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-rose-600 dark:text-rose-400 flex justify-center items-center gap-2 shadow-sm">
              <AlertOctagon class="w-4 h-4" /> Emergency
            </button>
          </div>
        </div>
      </div>

      <!-- Gate Log View -->
      <div
        v-else-if="activeTab === 'gatelog'"
        class="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden"
      >
        <h2 class="text-xl font-bold mb-4 flex items-center justify-between text-slate-900 dark:text-white">
          Expected Visitors
          <span class="text-[10px] uppercase tracking-widest px-2 py-1 font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-md">3 Pending</span>
        </h2>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          <!-- Visitor Card -->
          <div
            v-for="v in 3"
            :key="v"
            class="bg-white dark:bg-slate-800 p-4 rounded-xl flex flex-col gap-4 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                A
              </div>
              <div class="flex-1">
                <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Alex Rivera
                </h3>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  10:00 AM • Meeting
                </p>
              </div>
            </div>
            <button class="w-full py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
              Check-in
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="h-20 shrink-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex px-6 items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
      <button 
        class="flex flex-col items-center gap-1.5 p-2 transition-all duration-300"
        :class="activeTab === 'patrol' ? 'text-blue-600 dark:text-blue-400 transform -translate-y-1' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white'"
        @click="activeTab = 'patrol'"
      >
        <Shield class="w-6 h-6" />
        <span class="text-[10px] font-bold uppercase tracking-wider">Patrol</span>
      </button>
      <button 
        class="flex flex-col items-center gap-1.5 p-2 transition-all duration-300 relative"
        :class="activeTab === 'gatelog' ? 'text-blue-600 dark:text-blue-400 transform -translate-y-1' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white'"
        @click="activeTab = 'gatelog'"
      >
        <Users class="w-6 h-6" />
        <span class="text-[10px] font-bold uppercase tracking-wider">Gate Log</span>
        <span class="absolute top-1 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-950" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ScanLine, FileWarning, AlertOctagon, Shield, Users } from 'lucide-vue-next';

const activeTab = ref('patrol');
</script>

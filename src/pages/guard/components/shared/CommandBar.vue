<template>
  <div class="flex items-center justify-between gap-4 mb-2 z-20">
    
    <!-- Linear-style Cmd+K Search Bar -->
    <div class="flex-1 max-w-xl relative group">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search class="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
      </div>
      <input 
        type="text" 
        placeholder="Search guards, visitors, locations, or incidents..." 
        class="block w-full pl-10 pr-16 py-2.5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-sm"
      >
      <div class="absolute inset-y-0 right-0 pr-2 flex items-center">
        <kbd class="inline-flex items-center px-2 py-1 border border-slate-200 dark:border-white/10 rounded-md text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
          Ctrl K
        </kbd>
      </div>
    </div>

    <!-- Quick Actions (Top Right) -->
    <div class="flex items-center gap-2">
      <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-200 dark:border-white/10 shadow-sm">
        <MessageSquare class="w-3.5 h-3.5" /> Broadcast
      </button>
      <button class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)] border border-cyan-400/50">
        <Plus class="w-3.5 h-3.5" /> Dispatch Guard
      </button>
    </div>

  </div>
</template>

<script setup>
import { Search, MessageSquare, Plus } from 'lucide-vue-next';
</script>

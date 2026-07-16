<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Guard Attendance
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Track clock-in and clock-out times for the security force.
        </p>
      </div>
      <button class="flex items-center gap-2 rounded-xl bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 px-4 py-2 text-[10px] font-black hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors shadow-sm uppercase tracking-widest">
        <FileText class="h-3.5 w-3.5" />
        Report
      </button>
    </div>

    <!-- Attendance Placeholder -->
    <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div class="p-6 text-center text-slate-500 dark:text-slate-400">
        <Clock class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">
          No attendance records today
        </h3>
        <p class="text-xs">
          Guards checking in via the mobile app will be logged here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FileText, Clock } from 'lucide-vue-next';
</script>

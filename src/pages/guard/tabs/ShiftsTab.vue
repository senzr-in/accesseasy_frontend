<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Shift Management
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Manage and assign guard schedules.
        </p>
      </div>
      <button class="flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-[10px] font-black text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm uppercase tracking-widest">
        <Plus class="h-3.5 w-3.5" />
        Add Shift
      </button>
    </div>

    <!-- Shifts Roster Placeholder -->
    <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div class="p-6 text-center text-slate-500 dark:text-slate-400">
        <CalendarDays class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">
          No shifts scheduled
        </h3>
        <p class="text-xs">
          Create your first shift pattern to start managing the roster.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, CalendarDays } from 'lucide-vue-next';
</script>

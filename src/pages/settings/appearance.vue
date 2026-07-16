<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white">
        Appearance
      </h2>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
        Customize how the application looks to you.
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette class="w-5 h-5 text-purple-500" /> Theme Mode
          </h3>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
            Switch between light and dark themes.
          </p>
        </div>
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button 
            class="p-3 rounded-md transition-colors flex items-center gap-2 font-bold text-sm" 
            :class="!isDark ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'"
            @click="toggleTheme('light')"
          >
            <Sun class="w-4 h-4" /> Light
          </button>
          <button 
            class="p-3 rounded-md transition-colors flex items-center gap-2 font-bold text-sm" 
            :class="isDark ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'"
            @click="toggleTheme('dark')"
          >
            <Moon class="w-4 h-4" /> Dark
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Palette, Sun, Moon } from 'lucide-vue-next';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark({
  storageKey: 'ae_theme',
});

const toggleTheme = (theme) => {
  isDark.value = theme === 'dark';
};
</script>

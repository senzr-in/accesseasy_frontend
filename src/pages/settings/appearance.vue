<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white">Appearance</h2>
      <p class="text-sm font-medium text-slate-500 mt-1">Customize how the application looks to you.</p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette class="w-5 h-5 text-purple-500" /> Theme Mode
          </h3>
          <p class="text-sm font-medium text-slate-500">
            Switch between light and dark themes.
          </p>
        </div>
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
           <button 
             @click="toggleTheme('light')" 
             class="p-3 rounded-md transition-colors flex items-center gap-2 font-bold text-sm"
             :class="!isDark ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
            >
             <Sun class="w-4 h-4" /> Light
           </button>
           <button 
             @click="toggleTheme('dark')" 
             class="p-3 rounded-md transition-colors flex items-center gap-2 font-bold text-sm"
             :class="isDark ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'"
            >
             <Moon class="w-4 h-4" /> Dark
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Palette, Sun, Moon } from 'lucide-vue-next';

const isDark = ref(false);

onMounted(() => {
   isDark.value = document.documentElement.classList.contains('dark');
});

const toggleTheme = (theme) => {
   if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ae_theme', 'dark');
      isDark.value = true;
   } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ae_theme', 'light');
      isDark.value = false;
   }
};
</script>

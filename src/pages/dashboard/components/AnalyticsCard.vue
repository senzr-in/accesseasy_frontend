<template>
  <div class="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm group hover:scale-[1.02] transition-all duration-300">
    <div class="p-8 relative">
      <div class="absolute top-0 right-0 p-8 opacity-5">
        <component :is="icon" class="w-16 h-16" />
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {{ title }}:
          </p>
          <component :is="icon" class="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <div class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: Object
});
</script>

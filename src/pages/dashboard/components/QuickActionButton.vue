<template>
  <button
    class="h-auto flex flex-col items-center justify-center gap-3 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group w-full"
  >
    <component
      :is="icon"
      class="w-6 h-6 text-slate-400 group-hover:text-white transition-colors"
    />
    <span class="text-[10px] font-black uppercase tracking-widest">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: String,
  icon: Object
});
</script>

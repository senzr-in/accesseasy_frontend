<template>
  <div class="relative bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500 w-full shrink-0">
    <!-- Ambient Glow Background -->
    <div :class="['absolute -right-24 -top-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10 dark:opacity-20 transition-all duration-500', glowColorClass]" />

    <div class="flex-grow space-y-3 relative z-10">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          {{ title }}
        </h1>
        <p class="text-sm font-semibold text-slate-500 dark:text-zinc-400 mt-1">
          {{ valueStatement }}
        </p>
      </div>

      <!-- Benefits Chips -->
      <div v-if="benefits && benefits.length" class="flex flex-wrap gap-2 pt-1">
        <span
          v-for="benefit in benefits"
          :key="benefit"
          class="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 bg-slate-100/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/80 px-2.5 py-1 rounded-lg shadow-sm"
        >
          <span :class="['w-1.5 h-1.5 rounded-full mr-1.5 shrink-0', dotColorClass]" />
          {{ benefit }}
        </span>
      </div>
    </div>

    <!-- Value Badge & Action Button -->
    <div class="flex flex-col sm:flex-row sm:items-center md:flex-col md:items-end gap-4 shrink-0 relative z-10">
      <!-- Value Badge -->
      <div v-if="valueBadge" :class="['px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest text-center shadow-sm w-full sm:w-auto', badgeColorClass]">
        <span class="text-slate-450 dark:text-zinc-500 font-bold mr-1">Value:</span>
        {{ valueBadge }}
      </div>

      <!-- Main Action Button -->
      <button
        v-if="actionText"
        @click="$emit('action')"
        :class="['h-11 px-5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md w-full sm:w-auto hover:opacity-90', buttonBgClass]"
      >
        <component :is="actionIcon" v-if="actionIcon" class="w-4 h-4" />
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  valueStatement: { type: String, required: true },
  benefits: { type: Array, default: () => [] },
  actionText: { type: String, default: '' },
  actionIcon: { type: [Object, Function], default: null },
  valueBadge: { type: String, default: '' },
  themeColor: { type: String, default: 'indigo' }, // 'indigo', 'emerald', 'blue', 'slate'
});

defineEmits(['action']);

const glowColorClass = computed(() => {
  switch (props.themeColor) {
    case 'emerald': return 'bg-emerald-500';
    case 'blue': return 'bg-blue-500';
    case 'slate': return 'bg-slate-500';
    case 'indigo':
    default: return 'bg-indigo-500';
  }
});

const dotColorClass = computed(() => {
  switch (props.themeColor) {
    case 'emerald': return 'bg-emerald-500';
    case 'blue': return 'bg-blue-500';
    case 'slate': return 'bg-slate-500';
    case 'indigo':
    default: return 'bg-indigo-500';
  }
});

const badgeColorClass = computed(() => {
  switch (props.themeColor) {
    case 'emerald':
      return 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    case 'blue':
      return 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
    case 'slate':
      return 'bg-slate-50/50 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800';
    case 'indigo':
    default:
      return 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
  }
});

const buttonBgClass = computed(() => {
  switch (props.themeColor) {
    case 'emerald':
      return 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20';
    case 'blue':
      return 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20';
    case 'slate':
      return 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-slate-900/20 dark:shadow-white/10';
    case 'indigo':
    default:
      return 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20';
  }
});
</script>

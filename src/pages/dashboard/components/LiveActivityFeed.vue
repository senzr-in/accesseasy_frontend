<template>
  <div class="soc-card h-full flex flex-col overflow-hidden bg-zinc-900/80">
    <div class="px-6 py-5 border-b border-white/5 shrink-0 flex items-center justify-between">
      <h3 class="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
        Live Activity
        <span class="relative flex h-2 w-2 shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      </h3>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
      <div 
        v-for="event in feed" 
        :key="event.id"
        class="px-6 py-4 hover:bg-white dark:bg-slate-900/5 transition-colors flex gap-4 text-xs group"
      >
        <!-- Avatar -->
        <div
          class="w-10 h-10 rounded-full bg-white dark:bg-slate-900/5 flex items-center justify-center font-bold text-sm text-slate-300 shrink-0 border"
          :class="getStatusColor(event.status, 'border')"
        >
          <img
            v-if="event.photo"
            :src="event.photo"
            class="w-full h-full object-cover rounded-full"
          >
          <span v-else>{{ event.name?.charAt(0).toUpperCase() || '?' }}</span>
        </div>

        <!-- Details -->
        <div class="min-w-0 flex-1">
          <div class="flex justify-between items-start gap-2">
            <h4
              class="font-bold text-white truncate"
              :class="getStatusColor(event.status, 'text')"
            >
              {{ event.type }}
            </h4>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">{{ event.time }}</span>
          </div>
          <p class="text-slate-300 font-semibold truncate mt-0.5">
            {{ event.name }}
          </p>
          <div class="flex items-center gap-2 mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ event.gate }}</span>
            <span class="text-slate-600 dark:text-slate-300">•</span>
            <span>{{ event.method }}</span>
          </div>
        </div>
      </div>
      
      <div
        v-if="feed.length === 0"
        class="py-16 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"
      >
        No recent activity.
      </div>
    </div>
  </div>
</template>

<script setup>
import { MapPin } from 'lucide-vue-next';

defineProps({
  feed: {
    type: Array,
    required: true,
    default: () => []
  }
});

const getStatusColor = (status, type = 'text') => {
  const map = {
    'authorized': { text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'denied': { text: 'text-rose-400', border: 'border-rose-500/30' },
    'warning': { text: 'text-orange-400', border: 'border-orange-500/30' }
  };
  return map[status]?.[type] || (type === 'text' ? 'text-white' : 'border-white/10');
};
</script>

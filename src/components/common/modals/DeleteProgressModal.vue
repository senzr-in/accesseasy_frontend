<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Non-clickable backdrop blur overlay to block background interaction -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

    <!-- Modal Card -->
    <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
          <Loader2 class="w-6 h-6 text-rose-600 dark:text-rose-400 animate-spin" />
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900 dark:text-slate-100">
            {{ title }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Please wait while records and permissions are deleted...
          </p>
        </div>
      </div>

      <!-- Deletion Progress Section -->
      <div class="my-5">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          <span>Progress ({{ current }} of {{ total }})</span>
          <span class="text-rose-600 dark:text-rose-400 font-extrabold">{{ percentage }}%</span>
        </div>

        <!-- Progress Bar Track -->
        <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            class="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${percentage}%` }"
          />
        </div>
      </div>

      <!-- Real-time Status Text -->
      <div class="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <Trash2 class="w-4 h-4 text-rose-500 shrink-0" />
        <span class="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
          {{ statusText || 'Deleting selected records...' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Loader2, Trash2 } from "lucide-vue-next";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Deleting Items...",
  },
  current: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  statusText: {
    type: String,
    default: "",
  },
});

const percentage = computed(() => {
  if (!props.total || props.total <= 0) return 0;
  const pct = Math.round((props.current / props.total) * 100);
  return Math.min(100, Math.max(0, pct));
});
</script>

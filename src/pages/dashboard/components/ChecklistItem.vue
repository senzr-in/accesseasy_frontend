<template>
  <div class="flex items-center gap-3 px-3 py-2">
    <CheckCircle2 v-if="checked" class="w-4 h-4 text-emerald-500" />
    <AlertTriangle v-else-if="warning" class="w-4 h-4 text-amber-500" />
    <div v-else class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
    <span class="text-xs font-bold text-slate-600 dark:text-slate-400">
      {{ label }}
    </span>
  </div>
</template>

<script setup>
import { CheckCircle2, AlertTriangle } from "lucide-vue-next";

defineProps({
  label: String,
  checked: { type: Boolean, default: false },
  warning: { type: Boolean, default: false }
});
</script>

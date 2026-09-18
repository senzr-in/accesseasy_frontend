<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      <transition-group
        enter-active-class="transition ease-out duration-300 transform"
        enter-from-class="opacity-0 translate-y-3 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95 -translate-y-2"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="pointer-events-auto rounded-2xl shadow-xl p-3.5 border backdrop-blur-md flex items-start gap-3 transition-all text-xs font-semibold select-none"
          :class="getToastClasses(toast.type)"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <AlertTriangle v-else-if="toast.type === 'warning'" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <Info v-else class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>

          <!-- Message -->
          <div class="flex-1 text-slate-800 dark:text-slate-100 leading-snug break-words">
            {{ toast.message }}
          </div>

          <!-- Close Button -->
          <button
            type="button"
            class="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            @click="toastStore.removeToast(toast.id)"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/useToastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const toastStore = useToastStore();

const getToastClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10';
    case 'error':
      return 'bg-rose-50/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-100 shadow-rose-500/10';
    case 'warning':
      return 'bg-amber-50/95 dark:bg-slate-900/95 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-100 shadow-amber-500/10';
    case 'info':
    default:
      return 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-indigo-500/10';
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <!-- Top Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm shrink-0">
      <div class="flex items-center gap-3.5">
        <button
          @click="router.push('/dashboard/settings')"
          class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          title="Back to Settings"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
          <QrCode class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Patrol Checkpoints
          </h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            QR codes, NFC tags, and scan points
          </p>
        </div>
      </div>
    </div>

    <!-- Checkpoint Library Container -->
    <div class="flex-1 min-h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <CheckpointLibrary />
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ArrowLeft, QrCode } from 'lucide-vue-next';
import CheckpointLibrary from '@/pages/guard/tabs/components/CheckpointLibrary.vue';

const router = useRouter();
</script>

<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] overflow-auto custom-scrollbar">
    <Teleport v-if="isMounted" to="#header-title-slot">
      <div class="flex items-center gap-3 w-full">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shrink-0"
          @click="$router.push('/dashboard/patrols')"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Patrol Checkpoints
          </h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">
            Manage master checkpoints, zone assignments, and NFC badges
          </p>
        </div>
      </div>
    </Teleport>

    <div class="max-w-[1400px] mx-auto w-full px-6 pt-2 pb-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-80px)]">
      
      <!-- Main Content (CheckpointLibrary component) -->
      <div class="flex-1 overflow-hidden">
        <CheckpointLibrary />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowLeft, MapPin } from 'lucide-vue-next';
import CheckpointLibrary from './tabs/components/CheckpointLibrary.vue';

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
</script>

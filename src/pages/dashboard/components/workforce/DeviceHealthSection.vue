<template>
  <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <h3 class="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Access Controller Device Health</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            Hardware Status
          </span>
        </h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time status of doors, turnstiles & biometric readers
        </p>
      </div>

      <!-- Health Breakdown Badges -->
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          {{ onlineCount }} Online
        </span>
        <span class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800">
          {{ offlineCount }} Offline
        </span>
      </div>
    </div>

    <!-- Health Grid -->
    <div v-if="devices.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div 
        v-for="dev in devices.slice(0, 6)" 
        :key="dev.id"
        class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between"
        :class="dev.status === 'Online' 
          ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-indigo-300' 
          : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30'"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
            :class="dev.status === 'Online' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
          >
            <HardDrive class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {{ dev.name }}
            </p>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {{ dev.type }} • <span class="font-mono">{{ dev.ip }}</span>
            </p>
          </div>
        </div>

        <div class="text-right shrink-0 ml-2">
          <span 
            class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
            :class="dev.status === 'Online' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'"
          >
            {{ dev.status }}
          </span>
          <p class="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            {{ dev.lastHeartbeat }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
      No hardware controllers configured yet.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { HardDrive } from 'lucide-vue-next';
import { deviceService } from '@/services/deviceService';

const devices = ref([]);

const onlineCount = computed(() => devices.value.filter(d => d.status === 'Online').length);
const offlineCount = computed(() => devices.value.filter(d => d.status !== 'Online').length);

onMounted(async () => {
  try {
    const list = await deviceService.getDevices();
    devices.value = list || [];
  } catch (err) {
    console.warn('Error loading devices in DeviceHealthSection:', err);
  }
});
</script>

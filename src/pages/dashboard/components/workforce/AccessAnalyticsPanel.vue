<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
    <!-- Peak Access Hours -->
    <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            Peak Access Hours
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Traffic entry & exit slots
          </p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Clock class="w-4 h-4" />
        </div>
      </div>
      <div v-if="peakSlots.length > 0" class="space-y-3">
        <div
          v-for="slot in peakSlots"
          :key="slot.time"
          class="space-y-1"
        >
          <div class="flex justify-between text-xs font-semibold">
            <span class="text-slate-700 dark:text-slate-200">{{ slot.time }}</span>
            <span class="text-indigo-600 dark:text-indigo-400 font-bold">{{ slot.count }} events</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              class="bg-indigo-500 h-full rounded-full"
              :style="{ width: slot.percentage + '%' }"
            />
          </div>
        </div>
      </div>
      <div v-else class="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
        No peak slot traffic recorded today.
      </div>
    </div>

    <!-- Device Usage -->
    <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            Device Activity
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Active access hardware
          </p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <HardDrive class="w-4 h-4" />
        </div>
      </div>
      <div v-if="topDevices.length > 0" class="space-y-3">
        <div
          v-for="dev in topDevices"
          :key="dev.name"
          class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5"
        >
          <div class="min-w-0 pr-2">
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {{ dev.name }}
            </p>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {{ dev.location }}
            </p>
          </div>
          <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            {{ dev.status || 'Active' }}
          </span>
        </div>
      </div>
      <div v-else class="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
        No active devices detected.
      </div>
    </div>

    <!-- Access Success Rate & Distribution -->
    <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
              Access Success Rate
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Authentication success breakdown
            </p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 class="w-4 h-4" />
          </div>
        </div>

        <div class="flex items-center justify-between p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl mb-4">
          <div>
            <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Overall Granted Rate</span>
            <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {{ grantedRate }}
            </p>
          </div>
          <span class="px-2 py-1 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
            {{ totalEvents > 0 ? 'Live Telemetry' : 'Standby' }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-xs font-bold mb-4">
          <div class="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span class="text-emerald-600 block font-black text-sm">{{ grantedCount }}</span>
            <span class="text-[10px] text-slate-400 font-semibold">Granted</span>
          </div>
          <div class="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span class="text-rose-600 block font-black text-sm">{{ deniedCount }}</span>
            <span class="text-[10px] text-slate-400 font-semibold">Denied</span>
          </div>
          <div class="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span class="text-amber-600 block font-black text-sm">0</span>
            <span class="text-[10px] text-slate-400 font-semibold">Failed</span>
          </div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
          <span>Authentication Status</span>
          <span>{{ grantedCount }} Validated</span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/5 flex overflow-hidden">
          <div
            class="bg-teal-500 h-full"
            :style="{ width: totalEvents > 0 ? (grantedCount / totalEvents * 100) + '%' : '100%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Clock, HardDrive, CheckCircle2 } from 'lucide-vue-next';
import { accessService } from '@/services/accessService';
import { deviceService } from '@/services/deviceService';

const peakSlots = ref([]);
const topDevices = ref([]);
const grantedCount = ref(0);
const deniedCount = ref(0);

const totalEvents = computed(() => grantedCount.value + deniedCount.value);
const grantedRate = computed(() => {
  if (totalEvents.value === 0) return '100%';
  return `${((grantedCount.value / totalEvents.value) * 100).toFixed(1)}%`;
});

onMounted(async () => {
  try {
    const [access, devs] = await Promise.all([
      accessService.getAccessOverview().catch(() => null),
      deviceService.getDevices().catch(() => [])
    ]);

    if (access) {
      grantedCount.value = access.granted || 0;
      deniedCount.value = access.denied || 0;
    }

    if (devs && devs.length > 0) {
      topDevices.value = devs.slice(0, 4).map(d => ({
        name: d.name,
        location: d.ip || 'Local Network',
        status: d.status
      }));
    }
  } catch (err) {
    console.warn('Error loading AccessAnalyticsPanel data:', err);
  }
});
</script>

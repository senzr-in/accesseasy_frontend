<template>
  <div v-if="activeAlarms && activeAlarms.length > 0" class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-2xl px-4 pointer-events-none">
    <div class="flex flex-col gap-2.5">
      <div
        v-for="alarm in activeAlarms"
        :key="alarm.id"
        class="pointer-events-auto rounded-2xl shadow-2xl border p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300 backdrop-blur-md"
        :class="alarmClass(alarm)"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div
            class="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 animate-pulse font-bold text-lg shadow-inner"
            :class="iconBgClass(alarm)"
          >
            <Flame v-if="alarm.type === 1 || alarm.title.includes('FIRE')" class="w-6 h-6 text-white" />
            <ShieldAlert v-else-if="alarm.type === 6 || alarm.title.includes('TAMPER')" class="w-6 h-6 text-white" />
            <AlertTriangle v-else class="w-6 h-6 text-white" />
          </div>

          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full font-mono shadow-xs" :class="badgeClass(alarm)">
                {{ alarm.severity.toUpperCase() }}
              </span>
              <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {{ alarm.formattedTime }}
              </span>
            </div>
            <h4 class="text-sm font-black tracking-tight truncate mt-0.5 text-slate-900 dark:text-white">
              {{ alarm.title }}
            </h4>
            <p class="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              Gateway: <span class="font-mono font-bold">{{ alarm.uuid }}</span> | Door Index: <span class="font-mono font-bold">{{ alarm.doorIndex }}</span>
            </p>
          </div>
        </div>

        <button
          class="shrink-0 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95"
          :class="buttonClass(alarm)"
          @click="dismissAlarm(alarm.id)"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Acknowledge</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Flame, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import { useMQTT } from '@/composables/useMQTT';

const { activeAlarms, dismissAlarm } = useMQTT();

const alarmClass = (alarm) => {
  if (alarm.severity === 'critical') {
    return 'bg-rose-500/95 dark:bg-rose-950/95 border-rose-600 text-white shadow-rose-500/30';
  }
  return 'bg-amber-500/95 dark:bg-amber-950/95 border-amber-600 text-white shadow-amber-500/30';
};

const iconBgClass = (alarm) => {
  if (alarm.severity === 'critical') return 'bg-rose-700/80';
  return 'bg-amber-700/80';
};

const badgeClass = (alarm) => {
  if (alarm.severity === 'critical') return 'bg-rose-900/60 text-rose-100';
  return 'bg-amber-900/60 text-amber-100';
};

const buttonClass = (alarm) => {
  if (alarm.severity === 'critical') {
    return 'bg-white text-rose-700 hover:bg-rose-50';
  }
  return 'bg-white text-amber-800 hover:bg-amber-50';
};
</script>

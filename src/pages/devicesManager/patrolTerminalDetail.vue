<template>
  <div
    v-if="modelValue && device"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
  >
    <div
      class="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
            <Smartphone class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                {{ device.controllerName || 'Patrol Terminal' }}
              </h3>
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  isOnline 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400']" />
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
              ID: {{ device.id || device.sn || 'N/A' }}
            </p>
          </div>
        </div>
        <button
          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body / Telemetry Details -->
      <div class="px-6 py-5 overflow-y-auto space-y-5 text-sm">
        <!-- Telemetry Cards Row -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Battery Level -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60">
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
              <span class="flex items-center gap-1.5 font-medium">
                <BatteryCharging v-if="device.is_charging" class="w-4 h-4 text-emerald-500" />
                <Battery v-else class="w-4 h-4 text-blue-500" />
                Battery
              </span>
              <span class="font-bold text-slate-700 dark:text-zinc-200">
                {{ device.battery_level != null ? device.battery_level + '%' : 'N/A' }}
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="batteryColorClass"
                :style="{ width: (device.battery_level || 0) + '%' }"
              />
            </div>
            <p v-if="device.is_charging" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
              <Zap class="w-3 h-3" /> Charging Active
            </p>
          </div>

          <!-- App & Hardware Version -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 flex flex-col justify-between">
            <span class="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
              <Cpu class="w-4 h-4 text-amber-500" />
              Hardware & Build
            </span>
            <div class="mt-1">
              <p class="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                {{ device.serverIp || 'Patrol Tablet' }}
              </p>
              <p class="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                v{{ device.deviceVersion || '1.0.0' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Location & Post Details -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-rose-500" />
            Station Assignment
          </h4>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px]">Assigned Site:</span>
              <span class="font-semibold text-slate-800 dark:text-zinc-200">
                {{ device.location?.locName || device.site_name || 'Main Facility' }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">Post / Gate:</span>
              <span class="font-semibold text-slate-800 dark:text-zinc-200">
                {{ device.timerMode || device.post_name || 'Main Gate' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Current Active Guard -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 space-y-2">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield class="w-3.5 h-3.5 text-blue-500" />
            Active Guard on Duty
          </h4>
          <div v-if="device.current_guard_name" class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                {{ device.current_guard_name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                  {{ device.current_guard_name }}
                </p>
                <p class="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  Badge: {{ device.current_guard_badge || 'N/A' }}
                </p>
              </div>
            </div>
            <span class="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded font-medium border border-emerald-200 dark:border-emerald-800/50">
              Shift Active
            </span>
          </div>
          <div v-else class="text-xs text-slate-400 italic py-1">
            Kiosk Locked — No active guard shift.
          </div>
        </div>

        <!-- Last Heartbeat Timestamp -->
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
          <span class="flex items-center gap-1">
            <Clock class="w-3.5 h-3.5" />
            Last Seen:
          </span>
          <span class="font-medium text-slate-700 dark:text-zinc-300">
            {{ formatLastSeen(device.last_seen_at || device.last_communicated_time) }}
          </span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
        <button
          v-if="device.status === 'locked'"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
          :disabled="actionLoading"
          @click="unlockDevice"
        >
          <Unlock class="w-3.5 h-3.5" />
          Unlock Terminal
        </button>
        <button
          v-else
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
          :disabled="actionLoading"
          @click="lockDevice"
        >
          <Lock class="w-3.5 h-3.5" />
          Remote Lock
        </button>

        <button
          class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          @click="close"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  Smartphone,
  X,
  Battery,
  BatteryCharging,
  Zap,
  Cpu,
  MapPin,
  Shield,
  Clock,
  Lock,
  Unlock
} from 'lucide-vue-next';
import { deviceService } from '@/services/deviceService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  device: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'updated']);

const actionLoading = ref(false);

const close = () => {
  emit('update:modelValue', false);
};

const isOnline = computed(() => {
  if (!props.device) return false;
  const lastSeen = props.device.last_seen_at || props.device.last_communicated_time;
  if (!lastSeen) return props.device.controllerStatus === 'online';
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  return diffMs < 2 * 60 * 1000; // within last 2 minutes
});

const batteryColorClass = computed(() => {
  const level = props.device?.battery_level ?? 100;
  if (level > 40) return 'bg-emerald-500';
  if (level > 20) return 'bg-amber-500';
  return 'bg-rose-500';
});

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Never';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const lockDevice = async () => {
  if (!props.device?.id) return;
  actionLoading.value = true;
  try {
    await deviceService.remoteLockDevice(props.device.id);
    emit('updated');
    close();
  } catch (err) {
    console.error('Remote lock failed:', err);
  } finally {
    actionLoading.value = false;
  }
};

const unlockDevice = async () => {
  if (!props.device?.id) return;
  actionLoading.value = true;
  try {
    await deviceService.remoteUnlockDevice(props.device.id);
    emit('updated');
    close();
  } catch (err) {
    console.error('Remote unlock failed:', err);
  } finally {
    actionLoading.value = false;
  }
};
</script>

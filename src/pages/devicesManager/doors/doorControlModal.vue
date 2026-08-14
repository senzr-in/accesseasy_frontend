<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
  >
    <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <DoorOpen class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ door?.doorName || 'Door Control' }}
            </h3>
            <p class="text-[11px] font-medium text-slate-500">
              Select open duration or control mode
            </p>
          </div>
        </div>
        <button
          class="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-5 flex flex-col gap-4">
        <!-- Preset Duration Buttons -->
        <div>
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Open Duration (Seconds)
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="sec in [5, 10, 30, 60]"
              :key="sec"
              class="h-10 rounded-xl text-xs font-bold transition-all border"
              :class="selectedDuration === sec && controlMode === 'pulse' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'"
              @click="selectDuration(sec)"
            >
              {{ sec }}s
            </button>
          </div>
        </div>

        <!-- Custom Duration Input -->
        <div class="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            Custom Seconds:
          </label>
          <input
            v-model.number="customDuration"
            type="number"
            min="1"
            max="255"
            class="w-full h-8 px-3 text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
            placeholder="1 - 255"
            @focus="controlMode = 'pulse'"
          >
        </div>

        <!-- Action Mode Selection -->
        <div>
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Advanced Control Modes
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border"
              :class="controlMode === 'hold' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'"
              @click="controlMode = 'hold'"
            >
              <DoorOpen class="w-4 h-4" /> Hold Open
            </button>
            <button
              class="h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border"
              :class="controlMode === 'lock' ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20' : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'"
              @click="controlMode = 'lock'"
            >
              <DoorClosed class="w-4 h-4" /> Lock Door
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
        <button
          class="h-9 px-3 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl transition-all flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/40 shrink-0 mr-auto"
          @click="showHardwareConfig = true"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
          <span>4-Door Config</span>
        </button>
        <button
          class="h-9 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 rounded-xl transition-colors"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          :disabled="sendingCommand"
          @click="executeControl"
        >
          <Loader2
            v-if="sendingCommand"
            class="w-3.5 h-3.5 animate-spin"
          />
          <span>Send Command</span>
        </button>
      </div>
    </div>

    <!-- 4-Door Hardware Config Modal -->
    <DoorConfigModal
      v-model="showHardwareConfig"
      :device-uuid="door?.deviceUuid || door?.uniqueId || ''"
      @toast="(t) => emit('toast', t)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { DoorOpen, DoorClosed, X, Loader2, SlidersHorizontal } from 'lucide-vue-next';
import { useMQTT } from '@/composables/useMQTT';
import { mqttService } from '@/services/mqttService';
import DoorConfigModal from './doorConfigModal.vue';

const showHardwareConfig = ref(false);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  door: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'toast']);

const { sendRemoteDoorOpen } = useMQTT();

onMounted(() => {
  mqttService.connect();
});

watch(() => props.modelValue, (val) => {
  if (val) mqttService.connect();
});

const controlMode = ref('pulse');
const selectedDuration = ref(5);
const customDuration = ref(null);
const sendingCommand = ref(false);

const close = () => {
  emit('update:modelValue', false);
};

const selectDuration = (sec) => {
  selectedDuration.value = sec;
  customDuration.value = null;
  controlMode.value = 'pulse';
};

const executeControl = async () => {
  if (!props.door) return;
  sendingCommand.value = true;

  try {
    const doorObj = props.door;
    const deviceUuid = doorObj.deviceUuid || doorObj.uniqueId || "UNKNOWN-DEVICE";
    const rawDoorNum = parseInt(doorObj.relayNumber || doorObj.channel || doorObj.doorNumber || 1, 10);
    const doorNum = ((rawDoorNum - 1) % 4) + 1;
    const doorBitmask = 1 << (doorNum - 1);
    const doorIndex = doorBitmask.toString(16).padStart(2, '0');

    let payloadData = {};

    if (controlMode.value === 'hold') {
      payloadData = {
        command: 6,
        index: doorIndex,
        extra: { action: 1 }
      };
    } else if (controlMode.value === 'lock') {
      payloadData = {
        command: 6,
        index: doorIndex,
        extra: { action: 0 }
      };
    } else {
      const dur = customDuration.value && customDuration.value > 0 ? customDuration.value : selectedDuration.value;
      payloadData = {
        command: 1,
        index: doorIndex,
        timing: dur,
        door_timing: dur,
        interval: dur,
        extra: {
          timing: dur,
          duration: dur,
          interval: dur
        }
      };

      // Also publish directly via MQTT WebSocket to guarantee timing reaches gateway
      sendRemoteDoorOpen(deviceUuid, doorIndex, dur);
    }

    const response = await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remoteControl",
        uuid: deviceUuid,
        data: payloadData
      })
    });

    const result = await response.json();
    if (result.success || response.ok) {
      const modeLabel = controlMode.value === 'hold' ? 'Hold Open' : controlMode.value === 'lock' ? 'Locked' : `Pulse Open (${customDuration.value || selectedDuration.value}s)`;
      emit('toast', { msg: `Door command sent: ${modeLabel}`, type: 'success' });
      close();
    } else {
      emit('toast', { msg: `Failed: ${result.error || 'Server error'}`, type: 'error' });
    }
  } catch (err) {
    console.error("Network error executing door control:", err);
    emit('toast', { msg: "Network error communicating with Knative bridge", type: 'error' });
  } finally {
    sendingCommand.value = false;
  }
};
</script>

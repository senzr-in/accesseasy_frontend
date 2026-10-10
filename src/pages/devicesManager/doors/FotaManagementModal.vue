<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-sky-50/70 via-indigo-50/30 to-white dark:from-sky-950/30 dark:via-zinc-900 dark:to-zinc-900">
          <div class="flex items-center gap-3.5">
            <div class="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <CloudUpload class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Firmware Over-The-Air (FOTA) Hub
                </h3>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  AWS S3 & MQTT
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Deploy firmware updates to Linux Gateways & Access Controllers
              </p>
            </div>
          </div>

          <button
            :disabled="isUpdating"
            class="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
            @click="closeModal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Form / Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">

          <!-- Target Device Card -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="space-y-0.5 min-w-0">
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Controller / Fleet</span>
              <p class="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate font-mono">
                {{ selectedDeviceLabel }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2.5 py-1 rounded-xl bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px] font-bold font-mono">
                Current: {{ currentVersion || 'v1.0.0' }}
              </span>
            </div>
          </div>

          <!-- Success View -->
          <div
            v-if="stepStatus === 'success'"
            class="py-6 text-center space-y-4 animate-in fade-in zoom-in-95"
          >
            <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
              <CheckCircle2 class="w-8 h-8" />
            </div>
            <div class="space-y-1">
              <h4 class="text-lg font-black text-slate-900 dark:text-white">
                FOTA Update Proceeded Successfully!
              </h4>
              <p class="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Firmware package staged in S3 and OTA command received & acknowledged by target node.
              </p>
            </div>

            <!-- Details Card -->
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left text-xs font-mono space-y-2 max-w-md mx-auto">
              <div class="flex justify-between">
                <span class="text-slate-400">Target:</span>
                <span class="font-bold text-slate-800 dark:text-zinc-200">{{ selectedDeviceLabel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Deployed Version:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ successDetails.version }}</span>
              </div>
              <div v-if="successDetails.fileName" class="flex justify-between">
                <span class="text-slate-400">Package:</span>
                <span class="truncate max-w-[240px] text-slate-700 dark:text-zinc-300">{{ successDetails.fileName }}</span>
              </div>
              <div v-if="successDetails.checksum" class="flex justify-between" :title="successDetails.checksum">
                <span class="text-slate-400">Checksum (SHA):</span>
                <span class="truncate max-w-[240px] text-slate-700 dark:text-zinc-300">{{ successDetails.checksum }}</span>
              </div>
            </div>

            <div class="pt-2 flex justify-center gap-3">
              <button
                type="button"
                class="px-6 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                @click="resetAndClose"
              >
                Done
              </button>
              <button
                type="button"
                class="px-4 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                @click="resetForm"
              >
                Deploy Another
              </button>
            </div>
          </div>

          <!-- Multi-Stage Progress Tracker -->
          <div
            v-else-if="isUpdating || stepStatus === 'processing'"
            class="py-4 space-y-5 animate-in fade-in"
          >
            <!-- 5-Stage Stepper Visualizer -->
            <div class="grid grid-cols-5 gap-1.5 text-center">
              <div
                v-for="step in stagesList"
                :key="step.num"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                :class="{
                  'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800': currentStage === step.num,
                  'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold': currentStage > step.num,
                  'text-slate-400 dark:text-zinc-600 opacity-60': currentStage < step.num
                }"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  :class="{
                    'bg-sky-500 text-white animate-pulse': currentStage === step.num,
                    'bg-emerald-500 text-white': currentStage > step.num,
                    'bg-slate-200 dark:bg-zinc-800 text-slate-500': currentStage < step.num
                  }"
                >
                  <span v-if="currentStage > step.num">✓</span>
                  <span v-else>{{ step.num }}</span>
                </div>
                <span class="text-[9px] uppercase tracking-wider leading-tight font-black">
                  {{ step.label }}
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-slate-800 dark:text-zinc-200">{{ currentStatusMessage }}</span>
                <span class="text-sky-600 dark:text-sky-400 font-mono">{{ progressPercent }}%</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 text-center font-mono">
              Listening to live MQTT telemetry & Knative SSE stream...
            </p>
          </div>

          <!-- Mode & Configuration Form -->
          <form v-else class="space-y-5" @submit.prevent="startDeployment">

            <!-- Error Banner -->
            <div
              v-if="errorMessage"
              class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 flex items-start gap-2.5 text-xs animate-in fade-in"
            >
              <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div class="flex-1">
                <span class="font-bold">Error:</span> {{ errorMessage }}
              </div>
              <button type="button" @click="errorMessage = ''" class="cursor-pointer">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Target Device Selector (If not locked) -->
            <div class="space-y-2">
              <label class="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Select Target Node</span>
                <span class="text-red-500">*</span>
              </label>

              <div class="relative">
                <select
                  v-model="selectedDeviceId"
                  required
                  class="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Select a hardware device --</option>
                  <option value="all">
                    🌐 All Devices (Broadcast Update to Fleet)
                  </option>
                  <option
                    v-for="dev in allDevices"
                    :key="dev.id || dev.sn || dev.deviceId"
                    :value="dev.sn || dev.deviceId || dev.id"
                  >
                    {{ dev.controllerName || dev.name || 'Device' }} ({{ dev.sn || dev.deviceId || dev.id }})
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <!-- Upload Firmware Package -->
            <div class="space-y-4 animate-in fade-in">
              <!-- File Drag & Drop -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Firmware Package (.zip / .tar.gz / .bin)</span>
                    <span class="text-red-500">*</span>
                  </label>
                  <span v-if="selectedFile" class="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatBytes(selectedFile.size) }}
                  </span>
                </div>

                <div
                  class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative"
                  :class="selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-sky-500 bg-slate-50/50 dark:bg-zinc-950/50'"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                  @click="triggerFileBrowse"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept=".zip,.bin,.tar.gz"
                    class="hidden"
                    @change="handleFileChange"
                  />

                  <div v-if="selectedFile" class="flex items-center justify-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 class="w-5 h-5" />
                    </div>
                    <div class="text-left min-w-0">
                      <p class="text-xs font-bold text-slate-900 dark:text-white truncate font-mono">
                        {{ selectedFile.name }}
                      </p>
                      <p class="text-[11px] text-emerald-600 dark:text-emerald-400">
                        Package selected. Click to replace file.
                      </p>
                    </div>
                  </div>

                  <div v-else class="space-y-1.5">
                    <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                      <UploadCloud class="w-5 h-5" />
                    </div>
                    <p class="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Click to browse or drag & drop firmware file
                    </p>
                    <p class="text-[10px] text-slate-400">
                      Supports .zip & .tar.gz (Linux Edge) or .bin (MCU boards)
                    </p>
                  </div>
                </div>
              </div>

              <!-- Target Version Input -->
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Target Version</span>
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="firmwareVersion"
                  type="text"
                  required
                  placeholder="e.g. 1.0.1"
                  class="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>



            <!-- Actions -->
            <div class="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                class="px-5 h-11 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                :disabled="!canDeploy"
                class="flex-1 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap class="w-4 h-4" />
                <span>Deploy Update ➔</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  CloudUpload,
  X,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-vue-next';
import { fotaService } from '@/services/fotaService';
import { mqttService } from '@/services/mqttService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  deviceUuid: {
    type: String,
    default: '',
  },
  targetDeviceId: {
    type: String,
    default: '',
  },
  targetDeviceName: {
    type: String,
    default: '',
  },
  currentVersion: {
    type: String,
    default: '',
  },
  registeredDevices: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'close', 'deployed', 'fota-success']);

const isOpen = computed(() => props.modelValue || props.visible);

// Form states
const selectedDeviceId = ref(props.targetDeviceId || props.deviceUuid || '');
const selectedFile = ref(null);
const firmwareVersion = ref('');
const changelog = ref('');
const rebootFlag = ref(false);
const fileInputRef = ref(null);

// Progress & Stages state
const isUpdating = ref(false);
const stepStatus = ref('idle'); // 'idle' | 'processing' | 'success'
const currentStage = ref(0); // 1=S3 Upload, 2=Downloading, 3=Verify, 4=Installing, 5=Testing, 6=Done
const progressPercent = ref(0);
const currentStatusMessage = ref('');
const errorMessage = ref('');
const successDetails = ref({});

const stagesList = [
  { num: 1, label: '1. S3 Staging' },
  { num: 2, label: '2. Download' },
  { num: 3, label: '3. Checksum' },
  { num: 4, label: '4. Install' },
  { num: 5, label: '5. Health' },
];

let sseUnsubscribe = null;

// Watchers for target device
watch(
  () => props.targetDeviceId || props.deviceUuid,
  (val) => {
    if (val) selectedDeviceId.value = val;
  },
  { immediate: true }
);

const allDevices = computed(() => {
  return props.registeredDevices || [];
});

const selectedDeviceLabel = computed(() => {
  if (selectedDeviceId.value === 'all') return 'All Devices (Fleet Broadcast)';
  const match = allDevices.value.find(
    (d) => d.sn === selectedDeviceId.value || d.id === selectedDeviceId.value || d.deviceId === selectedDeviceId.value
  );
  if (match) return `${match.controllerName || match.name || 'Device'} (${match.sn || match.id || match.deviceId})`;
  return props.targetDeviceName || selectedDeviceId.value || 'Selected Node';
});

const canDeploy = computed(() => {
  return Boolean(selectedDeviceId.value && selectedFile.value && firmwareVersion.value.trim().length > 0);
});



const triggerFileBrowse = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const processSelectedFile = (file) => {
  if (!file) return;
  selectedFile.value = file;

  if (!firmwareVersion.value) {
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const match = rawName.match(/\d+\.\d+(\.\d+)?/);
    if (match) {
      firmwareVersion.value = match[0];
    } else {
      firmwareVersion.value = rawName;
    }
  }
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  processSelectedFile(file);
};

const handleDrop = (e) => {
  const file = e.dataTransfer?.files?.[0];
  processSelectedFile(file);
};

const startDeployment = async () => {
  if (!canDeploy.value) return;

  errorMessage.value = '';
  isUpdating.value = true;
  stepStatus.value = 'processing';
  currentStage.value = 1;
  progressPercent.value = 15;
  currentStatusMessage.value = 'Uploading firmware package to AWS S3 bucket...';

  try {
    const uploadRes = await fotaService.uploadRelease(
      {
        file: selectedFile.value,
        version: firmwareVersion.value,
        changelog: changelog.value || 'OTA firmware update',
        autoDeploy: true,
        deviceId: selectedDeviceId.value,
        reboot: rebootFlag.value,
      },
      (percent) => {
        progressPercent.value = Math.min(90, Math.max(15, Math.round(percent * 0.9)));
      }
    );

    progressPercent.value = 100;
    currentStage.value = 5;
    currentStatusMessage.value = 'Firmware uploaded & OTA command dispatched!';

    successDetails.value = {
      version: firmwareVersion.value,
      fileName: selectedFile.value?.name,
      checksum: uploadRes?.metadata?.checksum || uploadRes?.checksum || '',
      deviceId: selectedDeviceId.value,
    };

    isUpdating.value = false;
    stepStatus.value = 'success';
    emit('deployed', successDetails.value);
    emit('fota-success', successDetails.value.version);

  } catch (err) {
    console.error('FOTA Deploy Error:', err);
    isUpdating.value = false;
    stepStatus.value = 'idle';
    errorMessage.value =
      err.response?.data?.error || err.message || 'Failed to upload firmware or dispatch OTA update.';
  }
};

const resetForm = () => {
  selectedFile.value = null;
  firmwareVersion.value = '';
  changelog.value = '';
  errorMessage.value = '';
  stepStatus.value = 'idle';
  isUpdating.value = false;
  currentStage.value = 0;
  progressPercent.value = 0;
};

const closeModal = () => {
  if (isUpdating.value) return;
  emit('update:modelValue', false);
  emit('close');
};

const resetAndClose = () => {
  resetForm();
  closeModal();
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 4px;
}
</style>

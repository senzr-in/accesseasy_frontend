<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
    <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <SlidersHorizontal class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Controller Configuration
            </h3>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>Device:</span>
              <select
                v-if="registeredControllers.length > 0"
                v-model="targetUuid"
                class="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[260px]"
              >
                <option
                  v-for="c in registeredControllers"
                  :key="c.sn"
                  :value="c.sn"
                >
                  {{ c.controllerName || 'Controller' }} ({{ c.sn }})
                </option>
              </select>
              <input
                v-else
                v-model="targetUuid"
                type="text"
                placeholder="Enter Device UUID..."
                class="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
              >
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            :disabled="fetchingConfig"
            @click="fetchConfig"
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': fetchingConfig }"
            />
            <span>Sync Device</span>
          </button>
          <button
            class="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Tab Navigation Bar -->
      <div class="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 px-6 gap-2 pt-2">
        <button
          v-for="tab in [
            { key: 'childInfo', label: channelTabLabel, icon: DoorOpen },
            { key: 'mqttInfo', label: 'MQTT Broker', icon: Radio },
            { key: 'netInfo', label: 'Network Settings', icon: Network },
            { key: 'fotaInfo', label: 'FOTA Firmware', icon: CloudUpload }
          ]"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer"
          :class="activeTab === tab.key ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 rounded-t-xl font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
          @click="activeTab = tab.key"
        >
          <component
            :is="tab.icon"
            class="w-3.5 h-3.5"
          />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
        <!-- 1. Door Configuration Grid -->
        <div
          v-if="activeTab === 'childInfo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-3.5"
        >
          <div
            v-for="(door, idx) in visibleDoorsConfig"
            :key="door.doorIndex"
            class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex flex-col gap-3.5 relative"
          >
            <!-- Door Header -->
            <div class="flex items-center gap-2 border-b border-slate-200/60 dark:border-zinc-800 pb-2.5">
              <span class="h-6 w-6 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shadow-sm">
                {{ idx + 1 }}
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Door Channel {{ idx + 1 }}
              </span>
            </div>

            <!-- Unlock Duration Slider -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label class="flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Unlock Duration</span>
                </label>
                <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{{ door.timing }}s</span>
              </div>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="door.timing"
                  type="range"
                  min="1"
                  max="255"
                  class="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                >
                <input
                  v-model.number="door.timing"
                  type="number"
                  min="1"
                  max="255"
                  class="w-14 h-7 px-1.5 text-center text-xs font-mono font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
              </div>
            </div>

            <!-- Buzzer Mode Select -->
            <div class="space-y-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Volume2 class="w-3.5 h-3.5 text-amber-500" />
                <span>Buzzer Prompt</span>
              </label>
              <select
                v-model.number="door.buzzer"
                class="w-full h-8 px-2.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option :value="1">
                  Enabled (Beep on Unlock)
                </option>
                <option :value="0">
                  Disabled (Mute)
                </option>
              </select>
            </div>

            <!-- Door Sensor Mode Select -->
            <div class="space-y-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                <span>Door Sensor</span>
              </label>
              <select
                v-model.number="door.sensor"
                class="w-full h-8 px-2.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option :value="0">
                  Normally Closed (NC Sensor)
                </option>
                <option :value="1">
                  Normally Open (NO Switch)
                </option>
                <option :value="2">
                  Disabled
                </option>
              </select>
            </div>

            <!-- Anti-Passback Mode Select -->
            <div class="space-y-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-blue-500" />
                <span>Anti-Passback</span>
              </label>
              <select
                v-model.number="door.apb"
                class="w-full h-8 px-2.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option :value="0">
                  Disabled
                </option>
                <option :value="1">
                  Enabled
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. MQTT Settings -->
        <div
          v-else-if="activeTab === 'mqttInfo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Broker Address</label>
            <input
              v-model="mqttConfig.mqttAddr"
              type="text"
              placeholder="mqtt.fieldseasy.com:1883"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Client Name</label>
            <input
              v-model="mqttConfig.mqttName"
              type="text"
              placeholder="iot-device"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input
              v-model="mqttConfig.password"
              type="password"
              placeholder="••••••••"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Topic Prefix</label>
            <input
              v-model="mqttConfig.prefix"
              type="text"
              placeholder="access_device/v1"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Heartbeat Check</label>
            <select
              v-model.number="mqttConfig.onlinecheck"
              class="w-full h-8 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option :value="1">
                Enabled
              </option>
              <option :value="0">
                Disabled
              </option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Real-Time Swipes</label>
            <select
              v-model.number="mqttConfig.reporttimely"
              class="w-full h-8 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option :value="1">
                Enabled
              </option>
              <option :value="0">
                Disabled
              </option>
            </select>
          </div>
        </div>

        <!-- 3. Network Settings -->
        <div
          v-else-if="activeTab === 'netInfo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">IP Address</label>
            <input
              v-model="netConfig.ip"
              type="text"
              placeholder="192.168.1.105"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Subnet Mask</label>
            <input
              v-model="netConfig.subnet"
              type="text"
              placeholder="255.255.255.0"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Gateway</label>
            <input
              v-model="netConfig.gateway"
              type="text"
              placeholder="192.168.1.1"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">DNS Server</label>
            <input
              v-model="netConfig.dns"
              type="text"
              placeholder="8.8.8.8"
              class="w-full h-8 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
        </div>

        <!-- 4. FOTA Firmware Settings -->
        <div
          v-if="activeTab === 'fotaInfo'"
          class="flex flex-col gap-4 animate-in fade-in duration-200"
        >
          <!-- S3 Info Card -->
          <div class="p-5 rounded-2xl border border-sky-200/70 dark:border-sky-900/40 bg-gradient-to-br from-sky-50/60 via-white to-indigo-50/30 dark:from-sky-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span class="text-[10px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-widest">Knative FOTA Service</span>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">AWS S3</span>
              </div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                FOTA Over-The-Air Firmware Upgrade
              </h4>
              <p class="text-xs text-slate-600 dark:text-zinc-400">
                Upload firmware bundle (.zip) to S3 bucket and proceed with instant OTA deployment to device <code class="font-mono font-bold text-sky-600 dark:text-sky-400">{{ targetUuid }}</code>.
              </p>
            </div>
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              @click="showFotaManagerModal = true"
            >
              <CloudUpload class="w-4 h-4" />
              <span>Open FOTA Window</span>
            </button>
          </div>

          <!-- 3-Step FOTA Proceed Form -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-4 shadow-2xs">
            <!-- Step 1: Device -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                <span>Target Hardware Device</span>
              </label>
              <input
                :value="targetUuid"
                readonly
                class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 font-mono text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>

            <!-- Step 2: Firmware Package -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Upload Firmware Package (.zip, .bin)</span>
                </label>
                <span v-if="fotaFile" class="text-[10px] font-mono text-emerald-600 font-bold">
                  {{ fotaFile.name }}
                </span>
              </div>
              
              <div
                class="border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
                :class="fotaFile ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-zinc-700 hover:border-sky-500 bg-slate-50/50 dark:bg-zinc-800/40'"
                @click="triggerDoorFotaFileInput"
              >
                <input
                  ref="doorFotaInputRef"
                  type="file"
                  accept=".zip,.bin,.tar.gz"
                  class="hidden"
                  @change="handleDoorFotaFile"
                />
                <div v-if="fotaFile" class="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
                  <CheckCircle2 class="w-4 h-4" />
                  <span>{{ fotaFile.name }} (Ready)</span>
                </div>
                <div v-else class="text-xs text-slate-500 flex items-center justify-center gap-2">
                  <UploadCloud class="w-4 h-4 text-sky-500" />
                  <span>Click to choose firmware file from computer</span>
                </div>
              </div>
            </div>

            <!-- Step 3: Firmware Version -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-bold">3</span>
                <span>Firmware Version</span>
              </label>
              <input
                v-model="fotaVersion"
                type="text"
                placeholder="e.g. v1.4.2"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <!-- Action Button -->
            <div class="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">
                Connected to AWS S3 & Knative MQTT
              </span>
              <button
                type="button"
                class="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="deployingFota || !targetUuid || !fotaFile || !fotaVersion"
                @click="triggerDoorFotaProceed"
              >
                <Loader2 v-if="deployingFota" class="w-3.5 h-3.5 animate-spin" />
                <CloudUpload v-else class="w-3.5 h-3.5" />
                <span>{{ deployingFota ? 'Uploading to S3 & Deploying...' : 'Proceed FOTA Update' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- Footer Actions -->
      <div class="px-6 py-3.5 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
        <button
          class="h-8 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="h-8 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          :disabled="savingConfig"
          @click="saveConfig"
        >
          <Loader2
            v-if="savingConfig"
            class="w-3.5 h-3.5 animate-spin"
          />
          <Save
            v-else
            class="w-3.5 h-3.5"
          />
          <span>Save Settings</span>
        </button>
      </div>
    </div>

    <!-- FOTA Management Modal Popup -->
    <FotaManagementModal
      v-model="showFotaManagerModal"
      :device-uuid="targetUuid"
      :registered-devices="registeredControllers"
    />
  </div>
  </Teleport>
</template>

<script setup>

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { SlidersHorizontal, RefreshCw, X, Clock, Volume2, ShieldCheck, Info, Save, Loader2, DoorOpen, Radio, Network, CloudUpload, Zap, UploadCloud, CheckCircle2 } from 'lucide-vue-next';
import { useMQTT } from '@/composables/useMQTT';
import { mqttService } from '@/services/mqttService';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { fotaService } from '@/services/fotaService';
import FotaManagementModal from './FotaManagementModal.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  deviceUuid: { type: String, default: '' },
  controllerType: { type: [Number, String], default: 4 }
});

const emit = defineEmits(['update:modelValue', 'toast']);

// FOTA State
const showFotaManagerModal = ref(false);
const deployingFota = ref(false);
const fotaFile = ref(null);
const fotaVersion = ref('');
const doorFotaInputRef = ref(null);

const triggerDoorFotaFileInput = () => {
  if (doorFotaInputRef.value) {
    doorFotaInputRef.value.click();
  }
};

const handleDoorFotaFile = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    fotaFile.value = file;
    if (!fotaVersion.value) {
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      const match = rawName.match(/v?\d+(\.\d+)+(-\w+)?/i);
      fotaVersion.value = match ? (match[0].startsWith('v') ? match[0] : `v${match[0]}`) : (rawName.startsWith('v') ? rawName : `v${rawName}`);
    }
  }
};

const triggerDoorFotaProceed = async () => {
  if (!targetUuid.value || !fotaFile.value || !fotaVersion.value) return;
  deployingFota.value = true;
  try {
    const res = await fotaService.uploadRelease({
      file: fotaFile.value,
      version: fotaVersion.value,
      changelog: `OTA update for ${targetUuid.value}`,
      autoDeploy: true,
      deviceId: targetUuid.value,
    });

    emit('toast', {
      type: 'success',
      title: 'FOTA Update Succeeded',
      message: `Firmware ${fotaVersion.value} uploaded to S3 and OTA command sent to node ${targetUuid.value}!`,
    });

    fotaFile.value = null;
    fotaVersion.value = '';
  } catch (err) {
    console.error('FOTA Proceed error:', err);
    emit('toast', {
      type: 'error',
      title: 'FOTA Failed',
      message: err.response?.data?.error || err.message || 'Failed to upload firmware to AWS S3',
    });
  } finally {
    deployingFota.value = false;
  }
};

const { sendGetConfig, sendSetConfig } = useMQTT();

const maxChannels = computed(() => {
  const t = Number(props.controllerType);
  if (t === 1) return 1;
  if (t === 2) return 2;
  if (t === 3) return 3;
  if (t === 4) return 4;
  return 4;
});

const channelTabLabel = computed(() => {
  if (maxChannels.value === 1) return 'Door Channel';
  return `${maxChannels.value} Door Channels`;
});

const targetUuid = ref(props.deviceUuid || '');
const registeredControllers = ref([]);
const activeTab = ref('childInfo');
const fetchingConfig = ref(false);
const savingConfig = ref(false);

const fetchRegisteredControllers = async () => {
  try {
    const token = authService.getToken();
    if (!token) return;
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=sn&fields[]=controllerName`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      registeredControllers.value = (data.data || []).filter(c => c.sn);
      if (!targetUuid.value && registeredControllers.value.length > 0) {
        targetUuid.value = registeredControllers.value[0].sn;
      }
    }
  } catch (err) {
    console.error('[doorConfigModal] Failed to fetch registered controllers:', err);
  }
};

watch(() => props.deviceUuid, (val) => {
  if (val) targetUuid.value = val;
});

let unsubReply = null;

const doorsConfig = ref([
  { doorIndex: '01', timing: 5, buzzer: 1, sensor: 0, apb: 0 },
  { doorIndex: '02', timing: 5, buzzer: 1, sensor: 0, apb: 0 },
  { doorIndex: '03', timing: 5, buzzer: 1, sensor: 0, apb: 0 },
  { doorIndex: '04', timing: 5, buzzer: 1, sensor: 0, apb: 0 },
]);

const visibleDoorsConfig = computed(() => {
  return doorsConfig.value.slice(0, maxChannels.value);
});

const mqttConfig = ref({
  mqttAddr: 'mqtt.fieldseasy.com:1883',
  mqttName: 'iot-device',
  password: 'Senzr123',
  prefix: 'access_device/v1',
  onlinecheck: 1,
  reporttimely: 1,
});

const netConfig = ref({
  ip: '192.168.1.105',
  subnet: '255.255.255.0',
  gateway: '192.168.1.1',
  dns: '8.8.8.8',
});

onMounted(() => {
  unsubReply = mqttService.on('access_device/v1/cmd/#', (topic, payload) => {
    try {
      const msg = JSON.parse(payload.toString());
      const isTarget = !msg.uuid || msg.uuid === targetUuid.value;
      if (isTarget) {
        console.log('[doorConfigModal] MQTT message received on topic:', topic, msg);
        
        // Handle setConfig / getConfig reply success code
        if (msg.code === 0 || msg.code === '0' || msg.code === '000000') {
          if (topic.includes('setConfig')) {
            emit('toast', { title: 'Success', message: `Controller ${targetUuid.value} confirmed setConfig saved successfully!`, type: 'success' });
          }
        }

        if (msg.data) {
          if (msg.data.childInfo && Array.isArray(msg.data.childInfo)) {
            doorsConfig.value = msg.data.childInfo.map(item => ({
              doorIndex: item.doorIndex || item.index || '01',
              timing: Number(item.timing || item.door_timing || 5),
              buzzer: Number(item.buzzer ?? 1),
              sensor: Number(item.sensor ?? 0),
              apb: Number(item.apb ?? 0)
            }));
            emit('toast', { title: 'Config Updated', message: `Updated 4-door parameters from ${targetUuid.value}`, type: 'success' });
          }
          if (msg.data.mqttInfo) {
            mqttConfig.value = { ...mqttConfig.value, ...msg.data.mqttInfo };
            emit('toast', { title: 'MQTT Info Updated', message: `Updated MQTT settings from ${targetUuid.value}`, type: 'success' });
          }
          if (msg.data.netInfo) {
            netConfig.value = { ...netConfig.value, ...msg.data.netInfo };
            emit('toast', { title: 'Net Info Updated', message: `Updated Network settings from ${targetUuid.value}`, type: 'success' });
          }
        }
        fetchingConfig.value = false;
      }
    } catch (e) { console.error('Failed to parse MQTT config reply:', e); }
  });
});

onUnmounted(() => {
  unsubReply?.();
});

const close = () => {
  emit('update:modelValue', false);
};

const fetchConfig = async () => {
  if (!targetUuid.value || !targetUuid.value.trim()) {
    emit('toast', { title: 'Missing UUID', message: 'Please select or enter a valid Gateway Controller UUID.', type: 'warning' });
    return;
  }

  fetchingConfig.value = true;
  try {
    const res = await sendGetConfig(targetUuid.value, activeTab.value);
    console.log('[doorConfigModal] Knative getConfig reply:', res);

    if (res && res.data) {
      if (res.data.childInfo && Array.isArray(res.data.childInfo)) {
        doorsConfig.value = res.data.childInfo.map(item => ({
          doorIndex: item.doorIndex || item.index || '01',
          timing: Number(item.timing || item.door_timing || 5),
          buzzer: Number(item.buzzer ?? 1),
          sensor: Number(item.sensor ?? 0),
          apb: Number(item.apb ?? 0)
        }));
      }
      if (res.data.mqttInfo) {
        mqttConfig.value = { ...mqttConfig.value, ...res.data.mqttInfo };
      }
      if (res.data.netInfo) {
        netConfig.value = { ...netConfig.value, ...res.data.netInfo };
      }
    }

    emit('toast', { title: 'Query Sent', message: `Dispatched getConfig via Knative HTTP router to ${targetUuid.value}`, type: 'info' });
  } catch (err) {
    console.error('Failed to query config via Knative:', err);
  } finally {
    setTimeout(() => { fetchingConfig.value = false; }, 1500);
  }
};

const saveConfig = async () => {
  if (!targetUuid.value || !targetUuid.value.trim()) {
    emit('toast', { title: 'Missing UUID', message: 'Please select or enter a valid Gateway Controller UUID.', type: 'warning' });
    return;
  }

  savingConfig.value = true;
  try {
    let payloadData = {};

    if (activeTab.value === 'childInfo') {
      payloadData = {
        childInfo: doorsConfig.value.map(d => ({
          doorIndex: d.doorIndex,
          timing: Number(d.timing || 5),
          buzzer: Number(d.buzzer ?? 1),
          sensor: Number(d.sensor ?? 0),
          apb: Number(d.apb ?? 0)
        }))
      };
    } else if (activeTab.value === 'mqttInfo') {
      payloadData = {
        mqttInfo: { ...mqttConfig.value }
      };
    } else if (activeTab.value === 'netInfo') {
      payloadData = {
        netInfo: { ...netConfig.value }
      };
    }

    // 1. Update Directus Controller Item
    const token = authService.getToken();
    if (token && targetUuid.value) {
      const targetCtrl = registeredControllers.value.find(c => c.sn === targetUuid.value);
      if (targetCtrl && targetCtrl.id) {
        fetch(`${import.meta.env.VITE_API_URL}/items/controllers/${targetCtrl.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            [activeTab.value]: payloadData[activeTab.value]
          })
        }).catch(err => console.warn('[doorConfigModal] API patch warning:', err));
      }

      // Also sync door timing and sensor settings to matching Directus door records
      if (activeTab.value === 'childInfo') {
        try {
          const dRes = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?filter[deviceUuid][_eq]=${targetUuid.value}&fields=id,doorNumber`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (dRes.ok) {
            const dData = await dRes.json();
            (dData.data || []).forEach(async (doorRec) => {
              const rawNum = parseInt(doorRec.doorNumber || '1', 10);
              const channelIdx = ((isNaN(rawNum) ? 0 : rawNum - 1) % 4);
              const cfg = doorsConfig.value[channelIdx];
              if (cfg && doorRec.id) {
                await fetch(`${import.meta.env.VITE_API_URL}/items/doors/${doorRec.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    timerMode: String(cfg.timing || 5),
                    senzrMode: Number(cfg.sensor || 0),
                    antipassbackMode: Number(cfg.apb || 0)
                  })
                }).catch(e => console.debug('Directus door sync warning:', e));
              }
            });
          }
        } catch (e) {
          console.debug('Directus door sync query warning:', e);
        }
      }
    }

    // 2. Dispatch setConfig command via Knative HTTP Router / MQTT
    const res = await sendSetConfig(targetUuid.value, payloadData);
    console.log('[doorConfigModal] Knative setConfig reply:', res);

    emit('toast', { title: 'Configuration Pushed', message: `Dispatched setConfig via Knative HTTP router to ${targetUuid.value}`, type: 'success' });
  } catch (err) {
    console.error('Save config failed:', err);
    emit('toast', { title: 'Error', message: 'Failed to push configuration via Knative', type: 'error' });
  } finally {
    savingConfig.value = false;
  }
};

watch(() => props.modelValue, async (val) => {
  if (val) {
    await fetchRegisteredControllers();
    if (props.deviceUuid) {
      targetUuid.value = props.deviceUuid;
    }
    if (targetUuid.value) {
      fetchConfig();
    }
  }
});
</script>

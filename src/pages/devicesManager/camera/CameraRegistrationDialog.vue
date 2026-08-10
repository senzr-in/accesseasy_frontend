<template>
  <v-dialog v-model="show" max-width="650px" persistent>
    <div class="bg-white dark:bg-[#151c2c] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            📹
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Connect New Camera Device
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Configure RTSP, ONVIF, or Frigate AI camera streams
            </p>
          </div>
        </div>
        <button
          @click="close"
          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
        >
          ✕
        </button>
      </div>

      <!-- Protocol Selection Tabs -->
      <div class="p-6 space-y-5">
        <div class="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <button
            v-for="t in tabs"
            :key="t.id"
            @click="activeProtocol = t.id"
            :class="[
              'flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5',
              activeProtocol === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <span>{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Camera Name & Location -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Camera Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Main Gate Cam 01"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location / Zone
              </label>
              <select
                v-model="form.location"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Main Entrance">Main Entrance</option>
                <option value="Lobby West">Lobby West</option>
                <option value="Server Room">Server Room</option>
                <option value="Parking Gate">Parking Gate</option>
              </select>
            </div>
          </div>

          <!-- Protocol Specific Inputs -->
          <!-- RTSP -->
          <div v-if="activeProtocol === 'rtsp'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary RTSP Stream URL *
              </label>
              <input
                v-model="form.rtspUrl"
                type="text"
                placeholder="rtsp://admin:password@192.168.1.100:554/h264"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="admin"
                  class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <!-- ONVIF -->
          <div v-if="activeProtocol === 'onvif'" class="space-y-3">
            <div class="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-indigo-900 dark:text-indigo-300">ONVIF Network Subnet Scan</h4>
                <p class="text-[10px] text-indigo-700 dark:text-indigo-400">Discover IP cameras on local LAN</p>
              </div>
              <button
                @click="scanOnvif"
                :disabled="isScanning"
                class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
              >
                {{ isScanning ? 'Scanning...' : 'Scan Subnet' }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">IP Address</label>
                <input
                  v-model="form.ip"
                  type="text"
                  placeholder="192.168.1.108"
                  class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ONVIF Port</label>
                <input
                  v-model="form.onvifPort"
                  type="number"
                  placeholder="8080"
                  class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <!-- FRIGATE -->
          <div v-if="activeProtocol === 'frigate'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Frigate MQTT Camera Topic Name
              </label>
              <input
                v-model="form.frigateTopic"
                type="text"
                placeholder="front_door_cam"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <!-- USB WebCam -->
          <div v-if="activeProtocol === 'usb'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Media Input Device
              </label>
              <select
                v-model="form.usbDeviceId"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs"
              >
                <option value="default">Default Kiosk Webcam (Integrated HD Camera)</option>
                <option value="usb-2">USB Video Capture Dongle 02</option>
              </select>
            </div>
          </div>

          <!-- Associated Door Mapping -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link to Access Control Door
            </label>
            <select
              v-model="form.linkedDoor"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold"
            >
              <option value="door_1">Door 1 - Main Entrance (Reader #1)</option>
              <option value="door_2">Door 2 - Lobby West (Reader #2)</option>
              <option value="door_3">Door 3 - Server Room Access</option>
              <option value="door_4">Door 4 - Executive Suite</option>
            </select>
          </div>

          <!-- AI Feature Checkboxes -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Enable AI Vision Features
            </label>
            <div class="flex items-center gap-4 text-xs font-medium">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="form.aiFace" class="rounded text-indigo-600" />
                <span>Facial Recognition</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="form.aiPerson" class="rounded text-indigo-600" />
                <span>Person Motion</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="form.aiLpr" class="rounded text-indigo-600" />
                <span>Vehicle LPR</span>
              </label>
            </div>
          </div>

          <!-- Live Stream Test Box -->
          <div class="pt-2">
            <button
              type="button"
              @click="testStreamConnection"
              :disabled="testingStream"
              class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>{{ testingStream ? 'Validating RTSP Signal...' : 'Test Connection & Preview Stream' }}</span>
            </button>

            <!-- Test Result Banner -->
            <div
              v-if="testResult"
              class="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span class="font-bold">Stream Connected Successfully!</span>
              </div>
              <span class="font-mono text-[10px] bg-emerald-200/60 dark:bg-emerald-400/20 px-2 py-0.5 rounded font-bold">1080p @ 30fps</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-end gap-3">
        <button
          @click="close"
          class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-bold rounded-xl transition"
        >
          Cancel
        </button>
        <button
          @click="saveCamera"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition"
        >
          Add Camera Device
        </button>
      </div>

    </div>
  </v-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const show = ref(props.modelValue);

const activeProtocol = ref('rtsp');
const testingStream = ref(false);
const testResult = ref(false);
const isScanning = ref(false);

const tabs = [
  { id: 'rtsp', label: 'RTSP IP Stream', icon: '📡' },
  { id: 'onvif', label: 'ONVIF Discover', icon: '🔍' },
  { id: 'frigate', label: 'Frigate AI', icon: '🤖' },
  { id: 'usb', label: 'Kiosk USB', icon: '📷' }
];

const form = reactive({
  name: '',
  location: 'Main Entrance',
  rtspUrl: '',
  username: 'admin',
  password: '',
  ip: '',
  onvifPort: 8080,
  frigateTopic: '',
  usbDeviceId: 'default',
  linkedDoor: 'door_1',
  aiFace: true,
  aiPerson: true,
  aiLpr: false
});

const close = () => {
  show.value = false;
  emit('update:modelValue', false);
  testResult.value = false;
};

const testStreamConnection = () => {
  testingStream.value = true;
  testResult.value = false;
  setTimeout(() => {
    testingStream.value = false;
    testResult.value = true;
  }, 1200);
};

const scanOnvif = () => {
  isScanning.value = true;
  setTimeout(() => {
    isScanning.value = false;
    form.ip = '192.168.1.108';
    form.name = 'ONVIF IP Dome Cam 108';
  }, 1500);
};

const saveCamera = () => {
  if (!form.name.trim()) return;
  const newCam = {
    id: `cam_${Date.now()}`,
    name: form.name,
    location: form.location,
    protocol: activeProtocol.value,
    rtspUrl: form.rtspUrl || `rtsp://admin:pass@${form.ip || '192.168.1.100'}:554/h264`,
    linkedDoor: form.linkedDoor,
    status: 'online',
    fps: 30,
    resolution: '1080p'
  };
  emit('saved', newCam);
  close();
};
</script>

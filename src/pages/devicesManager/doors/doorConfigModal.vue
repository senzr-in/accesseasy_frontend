<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
  >
    <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <SlidersHorizontal class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Controller Configuration <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-mono">{{ activeTab }}</span>
            </h3>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>Controller UUID:</span>
              <select
                v-if="registeredControllers.length > 0"
                v-model="targetUuid"
                class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[280px]"
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
                placeholder="Enter Gateway UUID..."
                class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-72"
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
            <span>Query Config</span>
          </button>
          <button
            class="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 cursor-pointer"
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
            { key: 'childInfo', label: '4-Door Channels (childInfo)', icon: DoorOpen },
            { key: 'mqttInfo', label: 'MQTT Broker (mqttInfo)', icon: Radio },
            { key: 'netInfo', label: 'Network TCP/IP (netInfo)', icon: Network }
          ]"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer"
          :class="activeTab === tab.key ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
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
      <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
        <!-- Gateway Info Banner -->
        <div class="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Info class="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>Parameters are synchronized directly with CC104 Controller Flash RAM via setConfig & getConfig (MQTT V1.0.6).</span>
          </div>
          <span class="text-[11px] font-mono bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded font-semibold text-blue-700 dark:text-blue-300 shrink-0">Topic: access_device/v1/cmd/{{ targetUuid || '{uuid}' }}/setConfig</span>
        </div>

        <!-- 1. 4-Door Configuration Grid (childInfo) -->
        <div
          v-if="activeTab === 'childInfo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div
            v-for="(door, idx) in doorsConfig"
            :key="door.doorIndex"
            class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex flex-col gap-4 relative overflow-hidden"
          >
            <!-- Door Badge Header -->
            <div class="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800 pb-3">
              <div class="flex items-center gap-2">
                <span class="h-7 w-7 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shadow-sm">
                  {{ door.doorIndex }}
                </span>
                <span class="text-sm font-bold text-slate-900 dark:text-white">
                  Door Channel {{ idx + 1 }}
                </span>
              </div>
              <span class="text-[11px] font-mono text-slate-400">Index: "{{ door.doorIndex }}"</span>
            </div>

            <!-- Lock Timing Slider/Input -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label class="flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Lock Delay / Pulse Timing</span>
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
                  class="w-16 h-8 px-2 text-center text-xs font-mono font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
              </div>
            </div>

            <!-- Buzzer Mode Select -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Volume2 class="w-3.5 h-3.5 text-amber-500" />
                <span>Buzzer Audio Prompt Mode</span>
              </label>
              <select
                v-model.number="door.buzzer"
                class="w-full h-9 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option :value="0">
                  0 - Disabled (Silent Swipe)
                </option>
                <option :value="1">
                  1 - Enabled (Beep Prompt on Swipe & Unlock)
                </option>
              </select>
            </div>

            <!-- Door Sensor Mode Select -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                <span>Door Sensor Contact Type</span>
              </label>
              <select
                v-model.number="door.sensor"
                class="w-full h-9 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option :value="0">
                  0 - Normal Close (NC Magnetic Sensor)
                </option>
                <option :value="1">
                  1 - Normal Open (NO Switch Contact)
                </option>
                <option :value="2">
                  2 - Sensor Monitored Disabled
                </option>
              </select>
            </div>

            <!-- Anti-Passback Mode Select -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-blue-500" />
                <span>Anti-Passback (APB) Mode</span>
              </label>
              <select
                v-model.number="door.apb"
                class="w-full h-9 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option :value="0">
                  0 - Disabled
                </option>
                <option :value="1">
                  1 - Enabled (Strict In/Out Sequence)
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. MQTT Broker Settings (mqttInfo) -->
        <div
          v-else-if="activeTab === 'mqttInfo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">MQTT Broker Address (mqttAddr)</label>
            <input
              v-model="mqttConfig.mqttAddr"
              type="text"
              placeholder="mqtt.fieldseasy.com:1883"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Client / Device Name (mqttName)</label>
            <input
              v-model="mqttConfig.mqttName"
              type="text"
              placeholder="iot-device"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">MQTT Password (password)</label>
            <input
              v-model="mqttConfig.password"
              type="password"
              placeholder="Senzr123"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Topic Prefix (prefix)</label>
            <input
              v-model="mqttConfig.prefix"
              type="text"
              placeholder="access_device/v1"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Online Check Heartbeat (onlinecheck)</label>
            <select
              v-model.number="mqttConfig.onlinecheck"
              class="w-full h-9 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option :value="1">
                1 - Enabled (Send Ping Heartbeat)
              </option>
              <option :value="0">
                0 - Disabled
              </option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Timely Log Reporting (reporttimely)</label>
            <select
              v-model.number="mqttConfig.reporttimely"
              class="w-full h-9 px-3 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option :value="1">
                1 - Enabled (Real-Time Swipes)
              </option>
              <option :value="0">
                0 - Disabled
              </option>
            </select>
          </div>
        </div>

        <!-- 3. Network TCP/IP Settings (netInfo) -->
        <div
          v-else-if="activeTab === 'netInfo'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Controller Static IP Address (ip)</label>
            <input
              v-model="netConfig.ip"
              type="text"
              placeholder="192.168.1.105"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Subnet Mask (subnet)</label>
            <input
              v-model="netConfig.subnet"
              type="text"
              placeholder="255.255.255.0"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Default Gateway (gateway)</label>
            <input
              v-model="netConfig.gateway"
              type="text"
              placeholder="192.168.1.1"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">DNS Server (dns)</label>
            <input
              v-model="netConfig.dns"
              type="text"
              placeholder="8.8.8.8"
              class="w-full h-9 px-3 text-xs font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <span class="text-xs text-slate-500">
          Publishes setConfig JSON payload to MQTT topic.
        </span>
        <div class="flex items-center gap-2">
          <button
            class="h-9 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="h-9 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
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
            <span>Apply {{ activeTab }} Config</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { SlidersHorizontal, RefreshCw, X, Clock, Volume2, ShieldCheck, Info, Save, Loader2, DoorOpen, Radio, Network } from 'lucide-vue-next';
import { useMQTT } from '@/composables/useMQTT';
import { mqttService } from '@/services/mqttService';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  deviceUuid: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'toast']);

const { sendGetConfig, sendSetConfig } = useMQTT();

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

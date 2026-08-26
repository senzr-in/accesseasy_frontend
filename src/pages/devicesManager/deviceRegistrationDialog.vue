<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full"
  >
    <!-- Main Form Container -->
    <div 
      v-if="!showNetworkScanner" 
      class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-amber-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
    >
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
        <div class="absolute inset-0 bg-white dark:bg-slate-900/40 dark:bg-zinc-950/40 backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20 shadow-inner">
              <Cpu class="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ device ? 'Configure Controller' : 'Add Hardware Device' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
            {{ device ? 'Update device network configuration and parameters' : 'Register a new controller or edge computing device to the network' }}
          </p>
        </div>
        <button 
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200" 
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <form
          id="device-form"
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <!-- Basic Info -->
          <div class="space-y-5">
            <h3 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Cpu class="w-4 h-4 text-amber-500" /> Device Identity
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Name <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.controllerName"
                  type="text"
                  required
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Serial Number <span class="text-red-500">*</span></span>
                  <button
                    type="button"
                    class="text-amber-500 hover:text-amber-600 flex items-center gap-1 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded transition-colors"
                    @click="openNetworkScanner"
                  >
                    <Wifi class="w-3 h-3" /> Scan Network
                  </button>
                </label>
                <input
                  v-model="formData.sn"
                  type="text"
                  required
                  placeholder="Device UUID / MAC"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5 col-span-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Type <span class="text-red-500">*</span></label>
                <select
                  v-model.number="formData.controllerType"
                  required
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select Device Type
                  </option>
                  <option :value="1">
                    Single Door Controller
                  </option>
                  <option :value="2">
                    2-Door Controller
                  </option>
                  <option :value="3">
                    3-Door Controller
                  </option>
                  <option :value="4">
                    4-Door Controller
                  </option>
                </select>
              </div>

              <!-- Patrol Terminal Stationing (Site & Post) -->
              <div
                v-if="formData.controllerType === 'patrol_terminal' || formData.attendanceMode === 'Patrol Terminal'"
                class="col-span-2 grid grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40"
              >
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">
                    Assigned Site / Facility
                  </label>
                  <select
                    v-model="formData.location"
                    class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  >
                    <option value="">Select Station Site</option>
                    <option v-for="s in sites" :key="s.id" :value="s.id">
                      {{ s.locName || 'Site ' + s.id }}
                    </option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">
                    Post / Gate Name
                  </label>
                  <input
                    v-model="formData.timerMode"
                    type="text"
                    placeholder="e.g. Main Gate, North Gate"
                    class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  >
                </div>
              </div>

              <!-- Camera Selection Dropdown (Only show for doors controllers, not NVRs themselves) -->
              <div
                v-if="formData.controllerType && formData.controllerType !== 'frigate_nvr'"
                class="space-y-1.5 col-span-2"
              >
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Linked AI Camera
                </label>
                <select
                  v-model="formData.linkedCamera"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option value="">
                    No Camera Linked
                  </option>
                  <option
                    v-for="cam in cameras"
                    :key="cam"
                    :value="cam"
                  >
                    {{ cam }}
                  </option>
                </select>
              </div>

              <!-- Network Switch -->
              <div class="col-span-2 bg-white dark:bg-zinc-950 p-5 rounded-[16px] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-amber-500 transition-colors" />
                <div class="pl-2">
                  <h4 class="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Network class="w-4 h-4 text-amber-500" />
                    Direct IP Connection
                  </h4>
                  <p class="text-[11px] text-muted-foreground mt-1 font-medium">
                    Enable for Controllers requiring direct TCP/UDP. Disable for edge devices using MQTT directly.
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="formData.useIpProtocol"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/30 rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500" />
                </label>
              </div>

              <div
                v-if="formData.useIpProtocol"
                class="col-span-2 grid grid-cols-2 gap-4 animate-in fade-in"
              >
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IP Address <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.serverIp"
                    type="text"
                    placeholder="192.168.1.201"
                    :required="formData.useIpProtocol"
                    class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  >
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">MAC Address</label>
                  <input
                    v-model="formData.macAddress"
                    type="text"
                    placeholder="00:1A:2B:3C:4D:5E"
                    class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  >
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end gap-3 z-10 shrink-0">
        <button
          type="button"
          class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white transition-all duration-200"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="device-form"
          :disabled="loading"
          class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          <Loader2
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <span class="relative z-10">{{ device ? 'Update Device' : 'Register Hardware' }}</span>
        </button>
      </div>
    </div>

    <!-- Network Scanner Panel -->
    <div 
      v-else 
      class="relative w-full max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
    >
      <!-- Scanner Header -->
      <div class="px-6 py-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-slate-50 dark:hover:bg-zinc-800">
        <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Wifi class="w-5 h-5 text-amber-500" />
          Network Scanner
        </h3>
        <button 
          class="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors" 
          @click="closeNetworkScanner"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scanner Body -->
      <div class="p-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <div
          v-if="scanningNetwork"
          class="flex flex-col items-center justify-center py-12 text-zinc-500"
        >
          <div class="relative w-16 h-16 mb-4">
            <div class="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
            <div class="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p class="text-sm font-medium animate-pulse">
            Scanning local subnet via MQTT...
          </p>
        </div>

        <div
          v-else-if="discoveredDevices.length === 0"
          class="text-center py-8 text-zinc-500 text-sm"
        >
          No recently connected devices found on the network.
          <button
            class="mt-4 block mx-auto text-amber-500 hover:underline font-bold"
            @click="fetchDiscoveredDevices"
          >
            Scan Again
          </button>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div 
            v-for="dev in discoveredDevices" 
            :key="dev.id"
            class="group cursor-pointer p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
            @click="selectDiscoveredDevice(dev)"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-bold text-sm text-slate-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                {{ dev.controllerName || 'Unknown Controller' }}
              </span>
              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded-full" 
                :class="dev.controllerStatus === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'"
              >
                {{ dev.controllerStatus || 'Offline' }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <div>SN: <span class="text-slate-700 dark:text-zinc-300">{{ dev.sn }}</span></div>
              <div>IP: <span class="text-slate-700 dark:text-zinc-300">{{ dev.serverIp || 'N/A' }}</span></div>
              <div>MAC: <span class="text-slate-700 dark:text-zinc-300">{{ dev.macAddress || 'N/A' }}</span></div>
              <div>Model: <span class="text-slate-700 dark:text-zinc-300">{{ dev.controllerType === 1 ? 'Face' : 'Controller' }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Loader2, Network, Cpu, Wifi } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const props = defineProps({
  modelValue: Boolean,
  device: { type: Object, default: null },
  startWithScanner: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);
const cameras = ref([]);
const sites = ref([]);

// Network Scanner state
const showNetworkScanner = ref(false);
const scanningNetwork = ref(false);
const discoveredDevices = ref([]);
const discoveredDeviceId = ref(null);

const formData = ref({
  controllerName: '',
  sn: '',
  controllerType: '',
  useIpProtocol: false,
  serverIp: '',
  macAddress: '',
  linkedCamera: '',
        location: '',
        timerMode: 'Main Gate',
        attendanceMode: ''
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.startWithScanner) {
      showNetworkScanner.value = true;
      fetchDiscoveredDevices();
    } else {
      showNetworkScanner.value = false;
    }
    
    fetchCameras();
    fetchSites();
    
    if (props.device) {
      formData.value = {
        controllerName: props.device.controllerName || '',
        sn: props.device.sn || '',
        controllerType: props.device.controllerType || '',
        useIpProtocol: !!props.device.serverIp,
        serverIp: props.device.serverIp || '',
        macAddress: props.device.macAddress || '',
        linkedCamera: props.device.linkedCamera || '',
        location: props.device.location?.id || props.device.location || '',
        timerMode: props.device.timerMode || 'Main Gate',
        attendanceMode: props.device.attendanceMode || ''
      };
    } else {
      formData.value = {
        controllerName: '',
        sn: '',
        controllerType: '',
        useIpProtocol: false,
        serverIp: '',
        macAddress: '',
        linkedCamera: ''
      };
    }
    discoveredDeviceId.value = null;
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const fetchSites = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?filter[tenant][tenantId][_eq]=${tenantId}&fields=id,locName,locAddress&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      sites.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch sites:", err);
  }
};

const fetchCameras = async () => {
  try {
    const token = authService.getToken();
    const eventRes = await fetch(
      `${import.meta.env.VITE_API_URL}/items/frigateEvents?aggregate[count]=id&groupBy[]=camera`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (eventRes.ok) {
      const evData = await eventRes.json();
      cameras.value = (evData.data || []).map(e => e.camera).filter(Boolean);
    }
  } catch (err) {
    console.error("Failed to fetch cameras:", err);
  }
};

// Network Scanner methods
const openNetworkScanner = () => {
  showNetworkScanner.value = true;
  fetchDiscoveredDevices();
};

const closeNetworkScanner = () => {
  showNetworkScanner.value = false;
};

const fetchDiscoveredDevices = async () => {
  scanningNetwork.value = true;
  try {
    const token = authService.getToken();
    // Fetch newly connected devices from mqtt_devices collection
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/mqtt_devices?sort=-date_created&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      discoveredDevices.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to scan network for devices:", err);
  } finally {
    scanningNetwork.value = false;
  }
};

const selectDiscoveredDevice = (dev) => {
  discoveredDeviceId.value = dev.id;
  formData.value.sn = dev.sn;
  
  if (dev.serverIp) {
    formData.value.useIpProtocol = true;
    formData.value.serverIp = dev.serverIp;
  }
  if (dev.macAddress) {
    formData.value.macAddress = dev.macAddress;
  }
  if (dev.controllerName && !formData.value.controllerName) {
    formData.value.controllerName = dev.controllerName;
  }
  if (dev.controllerType) {
    formData.value.controllerType = dev.controllerType;
  }
  
  closeNetworkScanner();
};

const handleSubmit = async () => {
  const isPatrolTerminal = formData.value.controllerType === 'patrol_terminal';
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();

    const isEdit = !!props.device;
    const isDiscovered = !!discoveredDeviceId.value;

    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/controllers/${props.device.id}`
      : `${import.meta.env.VITE_API_URL}/items/controllers`;

    const method = isEdit ? 'PATCH' : 'POST';

    // Build explicit clean payload
    const payload = {
      controllerName: formData.value.controllerName,
      sn: formData.value.sn,
      controllerType: isPatrolTerminal ? 1 : formData.value.controllerType,
        attendanceMode: isPatrolTerminal ? 'Patrol Terminal' : (formData.value.attendanceMode || null),
        location: formData.value.location || null,
        timerMode: formData.value.timerMode || 'Main Gate',
      tenant: tenantId,
      status: isEdit ? (props.device.status || 'unApproved') : 'approved',
      controllerStatus: isEdit ? (props.device.controllerStatus || 'offline') : 'online',
      serverIp: formData.value.useIpProtocol ? (formData.value.serverIp || null) : null,
      macAddress: formData.value.useIpProtocol ? (formData.value.macAddress || null) : null,
      linkedCamera: formData.value.linkedCamera || null
    };

    if (!isEdit) {
      payload.id = crypto.randomUUID();
    }

    const res = await fetch(url, {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Remove from discovery queue
      if (isDiscovered) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/items/mqtt_devices/${discoveredDeviceId.value}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (delErr) {
          console.error("Failed to clean up discovered device:", delErr);
        }
      }

      // First add initialization for Knative
      if (!isEdit && formData.value.sn) {
        try {
          await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "clearPermission",
              uuid: formData.value.sn
            })
          });
          console.log("Sent initial clearPermission to Knative for new device.");
        } catch (knErr) {
          console.error("Failed to send first add command to Knative:", knErr);
        }
      }

      emit('success');
      close();
    } else {
      const errorData = await res.json();
      alert("Error saving device: " + (errorData.errors?.[0]?.message || 'Unknown error'));
      console.error(errorData);
    }
  } catch (err) {
    console.error("Save error", err);
    alert("Failed to connect to API");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="ops.device_management" show-locked-badge locked-label="Security Handheld & Device Fleet Management — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Smartphone class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Guard Handhelds & Device Fleet Management
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Live battery monitoring, telemetry heartbeat checks, app version tracking, and remote device unlinking
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            @click="loadData"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            @click="showRegisterModal = true"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Register Device</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Total Fleet</span>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ devices.length }} <span class="text-xs text-slate-400 font-normal">Devices</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Online & Active</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ onlineCount }} <span class="text-xs text-emerald-500 font-bold">Reporting</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Low Battery (&lt; 20%)</span>
          <p class="text-2xl font-black text-amber-600 mt-1">{{ lowBatteryCount }} <span class="text-xs text-amber-500 font-bold">Warning</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Offline (&gt; 15m)</span>
          <p class="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{{ offlineCount }} <span class="text-xs text-slate-400 font-normal">Inactive</span></p>
        </div>
      </div>

      <!-- Device Fleet Table -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Registered Security Hardware</span>
          </div>
          <span class="text-xs font-semibold text-slate-500">Heartbeat Interval: <strong>3 mins</strong></span>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Device & Model</th>
                <th class="px-4 py-3.5">Assigned Guard</th>
                <th class="px-4 py-3.5">Site Location</th>
                <th class="px-4 py-3.5">Battery Level</th>
                <th class="px-4 py-3.5">App Version</th>
                <th class="px-4 py-3.5">Last Heartbeat</th>
                <th class="px-4 py-3.5 text-center">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="dev in devices" :key="dev.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                
                <!-- Device & Model -->
                <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                      <Smartphone class="w-4 h-4" />
                    </div>
                    <div>
                      <span class="block">{{ dev.device_name }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">{{ dev.device_model }} · IMEI: {{ dev.imei }}</span>
                    </div>
                  </div>
                </td>

                <!-- Assigned Guard -->
                <td class="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                  {{ dev.assigned_guard || 'Unassigned' }}
                </td>

                <!-- Site -->
                <td class="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  {{ dev.site_name }}
                </td>

                <!-- Battery Level -->
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="getBatteryBarClass(dev.battery_level)"
                        :style="`width: ${dev.battery_level}%`"
                      />
                    </div>
                    <span class="font-mono font-bold text-[11px]" :class="dev.battery_level < 20 ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'">
                      {{ dev.battery_level }}%
                    </span>
                    <span v-if="dev.battery_charging" class="text-amber-500 text-[10px]">⚡</span>
                  </div>
                </td>

                <!-- App Version -->
                <td class="px-4 py-3.5 font-mono text-slate-500">
                  {{ dev.app_version }} ({{ dev.os_version }})
                </td>

                <!-- Last Heartbeat -->
                <td class="px-4 py-3.5 font-mono text-slate-400">
                  {{ formatRelativeTime(dev.last_heartbeat) }}
                </td>

                <!-- Status Badge -->
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                    :class="getStatusBadgeClass(dev.status)"
                  >
                    {{ dev.status.replace('_', ' ') }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3.5 text-right">
                  <button
                    class="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    @click="unlinkDevice(dev.id)"
                  >
                    Unlink
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </FeatureGate>

    <!-- Register Device Modal -->
    <Teleport to="body">
      <div
        v-if="showRegisterModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showRegisterModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Register Handheld Device</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showRegisterModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitRegister" class="space-y-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Device Label / Name *</label>
              <input v-model="registerForm.device_name" required placeholder="e.g. Patrol Handheld #04" class="ae-input w-full py-2" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Device Hardware Model *</label>
              <input v-model="registerForm.device_model" required placeholder="e.g. Zebra TC26 / Samsung XCover" class="ae-input w-full py-2" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">IMEI / Hardware UUID *</label>
              <input v-model="registerForm.imei" required placeholder="15-digit IMEI or Unique UUID" class="ae-input w-full py-2 font-mono" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Property Site</label>
              <select v-model="registerForm.site_name" class="ae-input w-full py-2">
                <option value="Chennai Tech Park">Chennai Tech Park</option>
                <option value="ABC Retail Mall">ABC Retail Mall</option>
              </select>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 font-bold text-xs"
                @click="showRegisterModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Enroll Handheld
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Smartphone, Plus, RefreshCw, X } from 'lucide-vue-next';
import { deviceService } from '@/services/deviceService';
import FeatureGate from '@/components/common/FeatureGate.vue';

const devices = ref([]);
const showRegisterModal = ref(false);
const registerForm = ref({
  device_name: '',
  device_model: '',
  imei: '',
  site_name: 'Chennai Tech Park',
  assigned_guard: 'Kumar S',
  app_version: 'v2.4.1',
  os_version: 'Android 13'
});

const onlineCount = computed(() => devices.value.filter(d => d.status === 'online').length);
const lowBatteryCount = computed(() => devices.value.filter(d => d.battery_level < 20 || d.status === 'low_battery').length);
const offlineCount = computed(() => devices.value.filter(d => d.status === 'offline').length);

const getBatteryBarClass = (level) => {
  if (level > 50) return 'bg-emerald-500';
  if (level > 20) return 'bg-amber-500';
  return 'bg-rose-500';
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'online': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200';
    case 'low_battery': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'offline': default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200';
  }
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
};

const unlinkDevice = async (deviceId) => {
  if (confirm("Are you sure you want to unlink and remote wipe credentials on this handheld?")) {
    await deviceService.unlinkDevice(deviceId);
    await loadData();
  }
};

const submitRegister = async () => {
  await deviceService.registerDevice(registerForm.value);
  showRegisterModal.value = false;
  registerForm.value = {
    device_name: '',
    device_model: '',
    imei: '',
    site_name: 'Chennai Tech Park',
    assigned_guard: 'Kumar S',
    app_version: 'v2.4.1',
    os_version: 'Android 13'
  };
  await loadData();
};

const loadData = async () => {
  devices.value = await deviceService.fetchDevices();
};

onMounted(async () => {
  await loadData();
});
</script>

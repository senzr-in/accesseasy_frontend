<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="ops.device_management" :show-locked-badge="true" locked-label="Security Handheld and Device Fleet Management">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Smartphone class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Shared Patrol Terminals &amp; Device Management
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Manage site-bound terminals, QR code pairing, active guard shift monitoring, and hardware replacements
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            @click="loadData"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            <span>Refresh</span>
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            @click="showRegisterModal = true"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Assign Device to Site</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Terminals</span>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ devices.length }} <span class="text-xs text-slate-400 font-normal">Devices</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Guard Shifts</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ activeGuardsCount }} <span class="text-xs text-emerald-500 font-bold">On Duty</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Battery (&lt; 20%)</span>
          <p class="text-2xl font-black text-amber-600 mt-1">{{ lowBatteryCount }} <span class="text-xs text-amber-500 font-bold">Warning</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standby / Unpaired</span>
          <p class="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{{ standbyCount }} <span class="text-xs text-slate-400 font-normal">Idle</span></p>
        </div>
      </div>

      <!-- Device Fleet Table -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Terminal Registry &amp; Site Bindings</span>
          </div>
          <span class="text-xs font-semibold text-slate-500">Live Heartbeat Sync</span>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Device &amp; ID</th>
                <th class="px-4 py-3.5">Assigned Site</th>
                <th class="px-4 py-3.5">Current Guard (Live)</th>
                <th class="px-4 py-3.5">Battery</th>
                <th class="px-4 py-3.5">App Version</th>
                <th class="px-4 py-3.5">Last Seen</th>
                <th class="px-4 py-3.5 text-center">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-if="devices.length === 0">
                <td colspan="8" class="text-center py-8 text-slate-400 font-medium">
                  No terminals registered yet. Click &quot;Assign Device to Site&quot; to enroll a new terminal.
                </td>
              </tr>
              <tr v-for="dev in devices" :key="dev.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                
                <!-- Device & Model -->
                <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                      <Smartphone class="w-4 h-4" />
                    </div>
                    <div>
                      <span class="block">{{ dev.device_name }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">{{ dev.device_id }} · {{ dev.device_model }}</span>
                    </div>
                  </div>
                </td>

                <!-- Assigned Site -->
                <td class="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {{ dev.site_name }}
                  </span>
                  <span v-if="dev.zone_name" class="block text-[10px] text-slate-400 font-normal">{{ dev.zone_name }}</span>
                </td>

                <!-- Current Active Guard (Dynamic - from mobile heartbeat) -->
                <td class="px-4 py-3.5">
                  <div v-if="dev.current_guard_name || dev.active_guard" class="flex items-center gap-1.5">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <div>
                      <span class="font-bold text-slate-900 dark:text-white">{{ dev.current_guard_name || dev.active_guard?.name || dev.active_guard?.guard_name }}</span>
                      <span class="block text-[10px] text-emerald-600 dark:text-emerald-400">{{ dev.guard_status === 'on_break' ? 'On Break' : 'Active Shift' }}</span>
                    </div>
                  </div>
                  <div v-else class="text-slate-400 font-medium italic">
                    Standby (No active shift)
                  </div>
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
                  {{ dev.app_version }}
                </td>

                <!-- Last Seen -->
                <td class="px-4 py-3.5 font-mono text-slate-400">
                  {{ formatRelativeTime(dev.last_heartbeat) }}
                </td>

                <!-- Status Badge -->
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                    :class="getStatusBadgeClass(dev.status)"
                  >
                    {{ dev.status === 'active' || dev.status === 'approved' || dev.status === 'online' ? 'ACTIVE' : dev.status === 'locked' ? 'LOCKED' : dev.status === 'offline' ? 'OFFLINE' : 'STANDBY' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3.5 text-right">
                  <div class="inline-flex items-center gap-2">
                    <button
                      class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      @click="openPairingModal(dev)"
                      title="Show QR Code for Tablet Setup"
                    >
                      <QrCode class="w-3 h-3" />
                      <span>Pair / QR</span>
                    </button>
                    <!-- Lock / Unlock Toggle -->
                    <button
                      v-if="dev.status !== 'locked'"
                      class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      @click="lockDevice(dev)"
                      title="Remotely lock this terminal"
                    >
                      <Lock class="w-3 h-3" />
                      <span>Lock</span>
                    </button>
                    <button
                      v-else
                      class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      @click="unlockDevice(dev)"
                      title="Remove remote lock from this terminal"
                    >
                      <Unlock class="w-3 h-3" />
                      <span>Unlock</span>
                    </button>
                    <button
                      class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      @click="openReplaceModal(dev)"
                      title="Replace Damaged / Upgraded Tablet"
                    >
                      <RefreshCw class="w-3 h-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      class="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1"
                      @click="unlinkDevice(dev.id)"
                    >
                      Deactivate
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </FeatureGate>

    <!-- 1. Register / Assign Device Modal -->
    <Teleport to="body">
      <div
        v-if="showRegisterModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showRegisterModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Assign Device to Site</h3>
              <p class="text-[11px] text-slate-500 font-medium">Binds physical tablet permanently to a security site</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showRegisterModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitRegister" class="space-y-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Device Name / Label *</label>
              <input v-model="registerForm.device_name" required placeholder="e.g. ABC Mall Main Desk Tablet" class="ae-input w-full py-2" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Device ID / Terminal Code *</label>
              <input v-model="registerForm.device_id" required placeholder="e.g. PATROL-TAB-001" class="ae-input w-full py-2 font-mono uppercase" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Property Site *</label>
              <select v-model="registerForm.site_id" required class="ae-input w-full py-2" @change="onSiteSelect">
                <option value="">Select Property Site</option>
                <option v-for="s in availableSites" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hardware Model</label>
              <input v-model="registerForm.device_model" placeholder="e.g. Samsung Galaxy Tab A8" class="ae-input w-full py-2" />
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                @click="showRegisterModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Assign &amp; Generate QR
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- 2. Device Pairing QR Code Modal -->
    <Teleport to="body">
      <div
        v-if="showPairingModal && activePairingDevice"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showPairingModal = false"
      >
        <div class="w-full max-w-sm bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-center">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Device Pairing QR</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showPairingModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner mb-4">
            <qrcode-vue
              :value="pairingQrPayload"
              :size="190"
              level="H"
              class="rounded-lg"
            />
          </div>

          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 mb-4 text-left border border-slate-200 dark:border-white/5">
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Device:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">{{ activePairingDevice.device_name }}</span>
            </div>
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Assigned Site:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ activePairingDevice.site_name }}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-white/10">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Pairing Code:</span>
              <div class="flex items-center gap-2">
                <span class="font-black text-indigo-600 dark:text-indigo-400 text-sm tracking-wider font-mono">{{ activePairingDevice.pairing_code }}</span>
                <button
                  type="button"
                  class="p-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-600 dark:text-slate-300 transition-colors"
                  :title="copiedCode ? 'Copied!' : 'Copy Code'"
                  @click="copyPairingCode(activePairingDevice.pairing_code)"
                >
                  <Check v-if="copiedCode" class="w-3.5 h-3.5 text-emerald-500" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p class="text-[11.5px] text-slate-500 mb-4 leading-relaxed">
            Open the <strong>AccessEasy Patrol</strong> app on the tablet, tap <strong>Scan QR Code</strong>, or enter the 6-character code manually.
          </p>

          <button
            type="button"
            class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
            @click="showPairingModal = false"
          >
            Done
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 3. Replace Device Modal -->
    <Teleport to="body">
      <div
        v-if="showReplaceModal && activeReplaceDevice"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showReplaceModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Replace Damaged / Upgraded Device</h3>
              <p class="text-[11px] text-slate-500 font-medium">Transfers site bond &amp; guard roster to a new device</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showReplaceModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitReplace" class="space-y-3">
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300">
              <span class="font-bold block mb-0.5">Replacing Old Device:</span>
              <span>{{ activeReplaceDevice.device_name }} ({{ activeReplaceDevice.device_id }}) at <strong>{{ activeReplaceDevice.site_name }}</strong></span>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Device Name *</label>
              <input v-model="replaceForm.device_name" required placeholder="e.g. ABC Mall Replacement Tablet" class="ae-input w-full py-2" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Device ID *</label>
              <input v-model="replaceForm.device_id" required placeholder="e.g. PATROL-TAB-002" class="ae-input w-full py-2 font-mono uppercase" />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Hardware Model</label>
              <input v-model="replaceForm.device_model" placeholder="e.g. Samsung Galaxy Tab A9" class="ae-input w-full py-2" />
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                @click="showReplaceModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Transfer &amp; Decommission Old
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
import { Smartphone, Plus, RefreshCw, X, QrCode, Copy, Check, Lock, Unlock } from 'lucide-vue-next';
import QrcodeVue from 'qrcode.vue';
import { deviceService } from '@/services/deviceService';
import { siteService } from '@/services/siteService';
import { authService } from '@/services/authService';
import FeatureGate from '@/components/common/FeatureGate.vue';

const devices = ref([]);
const availableSites = ref([]);
const isLoading = ref(false);
const copiedCode = ref(false);

const showRegisterModal = ref(false);
const registerForm = ref({
  device_name: '',
  device_id: '',
  device_model: 'Samsung Galaxy Tab',
  site_id: '',
  site_name: '',
});

const showPairingModal = ref(false);
const activePairingDevice = ref(null);

const copyPairingCode = (code) => {
  if (!code) return;
  navigator.clipboard?.writeText(code);
  copiedCode.value = true;
  setTimeout(() => {
    copiedCode.value = false;
  }, 2000);
};

const showReplaceModal = ref(false);
const activeReplaceDevice = ref(null);
const replaceForm = ref({
  device_name: '',
  device_id: '',
  device_model: 'Patrol Tablet',
});

const activeGuardsCount = computed(() => devices.value.filter(d => d.active_guard != null).length);
const lowBatteryCount = computed(() => devices.value.filter(d => d.battery_level < 20).length);
const standbyCount = computed(() => devices.value.filter(d => d.active_guard == null && d.status === 'active').length);

const pairingQrPayload = computed(() => {
  if (!activePairingDevice.value) return '';
  const tenantId = authService.getTenantId() || 'default';
  const siteId = activePairingDevice.value.site_id || activePairingDevice.value.siteId || '';
  const siteName = activePairingDevice.value.site_name || activePairingDevice.value.siteName || 'Main Facility';
  const deviceId = activePairingDevice.value.device_id || activePairingDevice.value.deviceId || activePairingDevice.value.sn || 'PATROL-TAB-001';
  const deviceName = activePairingDevice.value.device_name || activePairingDevice.value.deviceName || 'Patrol Tablet';

  return JSON.stringify({
    type: 'device_pairing',
    version: '1.0',
    tenant: tenantId,
    tenant_id: tenantId,
    tenantId: tenantId,
    device_id: deviceId,
    deviceId: deviceId,
    device_name: deviceName,
    deviceName: deviceName,
    site_id: String(siteId),
    siteId: String(siteId),
    site_name: siteName,
    siteName: siteName,
    zone_id: activePairingDevice.value.zone_id || activePairingDevice.value.zoneId || '',
    zoneId: activePairingDevice.value.zone_id || activePairingDevice.value.zoneId || '',
    token: activePairingDevice.value.pairing_token || activePairingDevice.value.id || '',
    pairing_code: activePairingDevice.value.pairing_code || '',
    pairingCode: activePairingDevice.value.pairing_code || '',
    api_url: import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus',
    mqtt_broker: 'mqtt.fieldseasy.com',
    timestamp: new Date().toISOString()
  });
});

const getBatteryBarClass = (level) => {
  if (level > 50) return 'bg-emerald-500';
  if (level > 20) return 'bg-amber-500';
  return 'bg-rose-500';
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
    case 'online':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200';
    case 'low_battery':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'replaced':
    case 'deactivated':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200';
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

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
};

const onSiteSelect = () => {
  const selected = availableSites.value.find(s => String(s.id) === String(registerForm.value.site_id));
  if (selected) {
    registerForm.value.site_name = selected.name || selected.locName || 'Property Site';
  }
};

const openPairingModal = (dev) => {
  activePairingDevice.value = dev;
  showPairingModal.value = true;
};

const openReplaceModal = (dev) => {
  activeReplaceDevice.value = dev;
  replaceForm.value = {
    device_name: `${dev.site_name} New Tablet`,
    device_id: '',
    device_model: dev.device_model || 'Patrol Tablet',
  };
  showReplaceModal.value = true;
};

const lockDevice = async (dev) => {
  if (confirm(`Lock "${dev.device_name}"?\nThe mobile terminal will show a lock screen immediately on next heartbeat (within 45 seconds).`)) {
    await deviceService.lockDevice(dev.id);
    await loadData();
  }
};

const unlockDevice = async (dev) => {
  await deviceService.unlockDevice(dev.id);
  await loadData();
};

const unlinkDevice = async (deviceId) => {
  if (confirm('Are you sure you want to deactivate and remote wipe credentials on this terminal?')) {
    await deviceService.unlinkDevice(deviceId);
    await loadData();
  }
};

const submitRegister = async () => {
  try {
    const newDev = await deviceService.registerDevice(registerForm.value);
    showRegisterModal.value = false;
    registerForm.value = {
      device_name: '',
      device_id: '',
      device_model: 'Samsung Galaxy Tab',
      site_id: '',
      site_name: '',
    };
    await loadData();
    if (newDev) {
      const found = devices.value.find(d => d.id === newDev.id || d.device_id === newDev.device_id) || newDev;
      openPairingModal(found);
    }
  } catch (err) {
    console.error("Failed to register device:", err);
  }
};

const submitReplace = async () => {
  if (!activeReplaceDevice.value) return;
  const payload = {
    ...replaceForm.value,
    site_id: activeReplaceDevice.value.site_id,
    site_name: activeReplaceDevice.value.site_name,
    zone_id: activeReplaceDevice.value.zone_id,
    zone_name: activeReplaceDevice.value.zone_name,
  };
  await deviceService.replaceDevice(activeReplaceDevice.value.id, payload);
  showReplaceModal.value = false;
  await loadData();
};

const loadData = async () => {
  isLoading.value = true;
  try {
    devices.value = await deviceService.fetchDevices();
    availableSites.value = await siteService.fetchSites();
  } catch (e) {
    console.error('Failed to load device dashboard data:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadData();
});
</script>

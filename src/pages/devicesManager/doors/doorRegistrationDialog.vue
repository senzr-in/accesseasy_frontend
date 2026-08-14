<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
  >
    <div class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10">
        <div class="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shadow-inner">
              <DoorOpen class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ door ? 'Configure Door' : 'Register Access Point' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
            {{ door ? 'Update hardware parameters and access rules' : 'Define a new physical barrier in your security topology' }}
          </p>
        </div>
        <button
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <form
          id="door-form"
          class="space-y-8"
          @submit.prevent="handleSubmit"
        >
          <!-- Basic Information Section -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <DoorOpen class="w-4 h-4 text-blue-500" /> Basic Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Door Number <span class="text-red-500">*</span></label>
                <input
                  v-model.number="formData.doorNumber"
                  type="number"
                  required
                  min="1"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-zinc-500"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Door Name <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.doorName"
                  type="text"
                  required
                  placeholder="Main Entrance"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-zinc-500"
                >
              </div>
              
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location</label>
                <input
                  v-model="formData.location"
                  type="text"
                  placeholder="Floor 1, Building A"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-zinc-500"
                >
              </div>
              
              <!-- Controller Dropdown -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Linked Hardware Controller
                </label>
                <select
                  v-model="formData.deviceUuid"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option value="">
                    No hardware linked
                  </option>
                  <option
                    v-for="c in controllers"
                    :key="c.id"
                    :value="c.sn"
                  >
                    {{ c.controllerName }} ({{ c.sn }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Hardware Rules & Door Controls Section -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Sliders class="w-4 h-4 text-blue-500" /> Hardware Rules & Relay Settings
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <!-- Anti-Passback Mode -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Anti-Passback Mode</label>
                <select
                  v-model.number="formData.antiPassbackMode"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option :value="0">
                    Disabled
                  </option>
                  <option :value="1">
                    Prevent Double Entry (Strict APB)
                  </option>
                  <option :value="2">
                    Warning Log Only
                  </option>
                </select>
              </div>

              <!-- Interlock Mode -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Interlock Mode</label>
                <select
                  v-model.number="formData.interlockMode"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option :value="0">
                    Disabled (No Interlock)
                  </option>
                  <option :value="1">
                    Door 1 & 2 Interlock
                  </option>
                  <option :value="2">
                    Door 1, 2 & 3 Interlock
                  </option>
                  <option :value="4">
                    All Doors Interlock
                  </option>
                </select>
              </div>

              <!-- Relay Unlock Timing (Duration) -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Relay Hold Time (Seconds)</label>
                <input
                  v-model.number="formData.doorTiming"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="5"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>

              <!-- Door Sensor -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Door Position Sensor</label>
                <select
                  v-model.number="formData.sensorMode"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option :value="1">
                    Enabled (Monitor Open/Close)
                  </option>
                  <option :value="0">
                    Disabled
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Security & Access Section -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <ShieldCheck class="w-4 h-4 text-blue-500" /> Security & Access Rules
            </h4>
            <div class="space-y-1.5 max-w-sm">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authorized Departments</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-inner">
                <label
                  v-for="dept in departments"
                  :key="dept.id"
                  class="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <input
                    v-model="formData.assignedDepts"
                    type="checkbox"
                    :value="dept.id"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">{{ dept.departmentName || dept.name }}</span>
                </label>
                <div
                  v-if="departments.length === 0"
                  class="col-span-full text-xs text-zinc-400 italic text-center py-4"
                >
                  No departments found.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Inline Error Banner -->
      <div
        v-if="errorMessage"
        class="mx-8 mb-4 flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2 duration-200"
      >
        <AlertTriangle class="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <span class="flex-1 break-words">{{ errorMessage }}</span>
        <button
          class="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors cursor-pointer"
          @click="errorMessage = ''"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end gap-3 z-10">
        <button
          type="button"
          class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="door-form"
          :disabled="loading"
          class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Loader2
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <span class="relative z-10">{{ door ? 'Update Installation' : 'Deploy Door' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Loader2, DoorOpen, ShieldCheck, AlertTriangle, Sliders } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { mqttService } from '@/services/mqttService';

const props = defineProps({
  modelValue: Boolean, // controls v-if
  door: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);
const errorMessage = ref('');
const departments = ref([]);
const controllers = ref([]);

// Form state
const formData = ref({
  doorNumber: 1,
  doorName: '',
  location: '',
  deviceUuid: '',
  assignedDepts: [],
  antiPassbackMode: 0,
  interlockMode: 0,
  doorTiming: 5,
  sensorMode: 1
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    errorMessage.value = '';
    fetchDepartments();
    fetchControllers();
    
    if (props.door) {
      // Map Directus fields
      formData.value = {
        doorNumber: props.door.doorNumber || 1,
        doorName: props.door.doorName || '',
        location: props.door.location || '',
        deviceUuid: props.door.deviceUuid || '',
        assignedDepts: (props.door.assignedDepts || []).map(d => d.id || d),
        antiPassbackMode: props.door.antiPassbackMode !== undefined ? props.door.antiPassbackMode : 0,
        interlockMode: props.door.interlockMode !== undefined ? props.door.interlockMode : 0,
        doorTiming: props.door.doorTiming || 5,
        sensorMode: props.door.sensorMode !== undefined ? props.door.sensorMode : 1
      };
    } else {
      // Reset
      formData.value = {
        doorNumber: 1,
        doorName: '',
        location: '',
        deviceUuid: '',
        assignedDepts: [],
        antiPassbackMode: 0,
        interlockMode: 0,
        doorTiming: 5,
        sensorMode: 1
      };
    }
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const fetchDepartments = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=departmentName`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      departments.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch departments", err);
  }
};

const fetchControllers = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=controllerName&fields[]=sn`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      controllers.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch controllers", err);
  }
};

const generateDoorNumber = async (token, tenantId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][_eq]=${tenantId}&fields=doorNumber`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.data || data.data.length === 0) return '1';
    let max = 0;
    for (const d of data.data) {
      const n = parseInt((d.doorNumber || '').replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return String(max + 1);
  } catch { return '1'; }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    const isEdit = !!props.door;
    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/doors/${props.door.id}`
      : `${import.meta.env.VITE_API_URL}/items/doors`;
    
    const doorNumber = isEdit ? (props.door.doorNumber || '1') : await generateDoorNumber(token, tenantId);
    const uniqueId = isEdit ? (props.door.uniqueId || `${tenantId}-${doorNumber}`) : `${tenantId}-${doorNumber}`;

    const payload = {
      doorName: formData.value.doorName,
      doorNumber,
      location: formData.value.location || null,
      status: 'active',
      tenant: tenantId,
      uniqueId,
      deviceUuid: formData.value.deviceUuid || null,
      antiPassbackMode: formData.value.antiPassbackMode,
      interlockMode: formData.value.interlockMode,
      doorTiming: formData.value.doorTiming,
      sensorMode: formData.value.sensorMode,
      departmentIds: formData.value.assignedDepts.length > 0
        ? JSON.stringify(formData.value.assignedDepts)
        : null,
    };

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // If a hardware controller is linked, publish updated door configuration via MQTT V1.0.6
      if (formData.value.deviceUuid) {
        const doorNum = ((parseInt(doorNumber, 10) - 1) % 4) + 1;
        const doorIndex = String(doorNum).padStart(2, '0');
        mqttService.sendSetConfig(formData.value.deviceUuid, {
          index: doorIndex,
          timing: formData.value.doorTiming || 5,
          buzzer: 1,
          sensor: formData.value.sensorMode,
          apb: formData.value.antiPassbackMode,
          interlock: formData.value.interlockMode
        });
      }

      emit('success');
      close();
    } else {
      const errorData = await res.json();
      const msg = errorData.errors?.[0]?.message || JSON.stringify(errorData);
      errorMessage.value = `API Error: ${msg}`;
      console.error('Door save error:', errorData);
    }
  } catch (err) {
    console.error('Save error', err);
    errorMessage.value = `Network error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

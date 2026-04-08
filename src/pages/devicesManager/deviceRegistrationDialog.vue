<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full">
    <div class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-amber-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
        <div class="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl"></div>
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
        <button @click="close" class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <form @submit.prevent="handleSubmit" id="device-form" class="space-y-6">
          
          <!-- Basic Info -->
          <div class="space-y-5">
            <h3 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Cpu class="w-4 h-4 text-amber-500" /> Device Identity
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Name <span class="text-red-500">*</span></label>
                <input v-model="formData.controllerName" type="text" required class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Serial Number <span class="text-red-500">*</span></label>
                <input v-model="formData.sn" type="text" required class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
              </div>
              <div class="space-y-1.5 col-span-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Type <span class="text-red-500">*</span></label>
                <select v-model.number="formData.controllerType" required class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground">
                  <option value="" disabled>Select Device Type</option>
                  <option :value="1">Single Door Controller</option>
                  <option :value="2">2-Door Controller</option>
                  <option :value="3">3-Door Controller</option>
                  <option :value="4">4-Door Controller</option>
                </select>
              </div>

              <!-- Network Switch -->
              <div class="col-span-2 bg-white dark:bg-zinc-950 p-5 rounded-[16px] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-amber-500 transition-colors"></div>
                <div class="pl-2">
                  <h4 class="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Network class="w-4 h-4 text-amber-500" />
                    Direct IP Connection
                  </h4>
                  <p class="text-[11px] text-muted-foreground mt-1 font-medium">Enable for Controllers requiring direct TCP/UDP. Disable for edge devices using MQTT directly.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="formData.useIpProtocol" class="sr-only peer">
                  <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/30 rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div v-if="formData.useIpProtocol" class="col-span-2 grid grid-cols-2 gap-4 animate-in fade-in">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IP Address <span class="text-red-500">*</span></label>
                  <input v-model="formData.serverIp" type="text" placeholder="192.168.1.201" :required="formData.useIpProtocol" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">MAC Address</label>
                  <input v-model="formData.macAddress" type="text" placeholder="00:1A:2B:3C:4D:5E" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end gap-3 z-10 shrink-0">
        <button type="button" @click="close" class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white transition-all duration-200">
          Cancel
        </button>
        <button type="submit" form="device-form" :disabled="loading" class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span class="relative z-10">{{ device ? 'Update Device' : 'Register Hardware' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Loader2, Network } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const props = defineProps({
  modelValue: Boolean,
  device: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);

const formData = ref({
  controllerName: '',
  sn: '',
  controllerType: '',
  useIpProtocol: false,
  serverIp: '',
  macAddress: '',
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.device) {
      formData.value = {
        controllerName: props.device.controllerName || '',
        sn: props.device.sn || '',
        controllerType: props.device.controllerType || '',
        useIpProtocol: !!props.device.serverIp,
        serverIp: props.device.serverIp || '',
        macAddress: props.device.macAddress || '',
      };
    } else {
      formData.value = {
        controllerName: '',
        sn: '',
        controllerType: '',
        useIpProtocol: false,
        serverIp: '',
        macAddress: '',
      };
    }
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    // Always resolve async — sync getter is null before initialization
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();

    const isEdit = !!props.device;
    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/controllers/${props.device.id}`
      : `${import.meta.env.VITE_API_URL}/items/controllers`;

    // Build explicit clean payload — never spread formData directly
    const payload = {
      controllerName: formData.value.controllerName,
      sn: formData.value.sn,
      controllerType: formData.value.controllerType,
      tenant: tenantId,
      status: isEdit ? (props.device.status || 'unApproved') : 'unApproved',
      controllerStatus: isEdit ? (props.device.controllerStatus || 'offline') : 'offline',
      serverIp: formData.value.useIpProtocol ? (formData.value.serverIp || null) : null,
      macAddress: formData.value.useIpProtocol ? (formData.value.macAddress || null) : null,
    };

    // The controllers collection has a Directus validation rule requiring id on create
    if (!isEdit) {
      payload.id = crypto.randomUUID();
    }

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
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

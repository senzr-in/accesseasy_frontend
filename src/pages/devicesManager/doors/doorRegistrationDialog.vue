<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
  >
    <div class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900  rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/20  overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white   border-b border-zinc-100  z-10">
        <div class="absolute inset-0 bg-white dark:bg-slate-900/40  backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-blue-50  flex items-center justify-center border border-blue-100  shadow-inner">
              <DoorOpen class="w-5 h-5 text-blue-600 " />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100  tracking-tight">
              {{ door ? 'Configure Access Point' : 'Register Access Point' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400  ml-[52px]">
            {{ door ? 'Update hardware parameters and access rules' : 'Define a new physical barrier in your security topology' }}
          </p>
        </div>
        <button
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-950  text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 :text-white hover:bg-slate-200 :bg-zinc-700 transition-all duration-200"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50  custom-scrollbar">
        <form
          id="door-form"
          class="space-y-10"
          @submit.prevent="handleSubmit"
        >
          <!-- Basic Information Section -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200  pb-3 flex items-center gap-2 text-zinc-400 ">
              <DoorOpen class="w-4 h-4 text-blue-500" /> Basic Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Access Point Number <span class="text-red-500">*</span></label>
                <input
                  v-model.number="formData.doorNumber"
                  type="number"
                  required
                  min="1"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200  bg-white dark:bg-slate-900  text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-zinc-500"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Access Point Name <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.doorName"
                  type="text"
                  required
                  placeholder="Main Entrance"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200  bg-white dark:bg-slate-900  text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-zinc-500"
                >
              </div>
              

              
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location</label>
                <input
                  v-model="formData.location"
                  type="text"
                  placeholder="Floor 1, Building A"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200  bg-white dark:bg-slate-900  text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-zinc-500"
                >
              </div>
            </div>
          </div>



          <!-- Security & Access Section -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200  pb-3 flex items-center gap-2 text-zinc-400 ">
              <ShieldCheck class="w-4 h-4 text-blue-500" /> Security & Access Rules
            </h4>
            <div class="space-y-1.5 max-w-sm">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authorized Departments</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-4 rounded-xl border border-zinc-200  bg-white dark:bg-slate-900  shadow-inner">
                <label
                  v-for="dept in departments"
                  :key="dept.id"
                  class="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <input
                    v-model="formData.assignedDepts"
                    type="checkbox"
                    :value="dept.id"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-zinc-300  "
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200  truncate">{{ dept.departmentName || dept.name }}</span>
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
        class="mx-8 mb-4 flex items-start gap-3 p-4 rounded-xl border border-red-200  bg-red-50  text-red-700  text-sm font-medium animate-in slide-in-from-top-2 duration-200"
      >
        <AlertTriangle class="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <span class="flex-1 break-words">{{ errorMessage }}</span>
        <button
          class="shrink-0 text-red-400 hover:text-red-600 :text-red-300 transition-colors"
          @click="errorMessage = ''"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100  bg-white dark:bg-slate-900  flex justify-end gap-3 z-10">
        <button
          type="button"
          class="px-6 h-10 rounded-xl border border-zinc-200  text-[13px] font-bold text-slate-600 dark:text-slate-300  hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 :text-white transition-all duration-200"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="door-form"
          :disabled="loading"
          class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          <Loader2
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <span class="relative z-10">{{ door ? 'Update Installation' : 'Deploy Access Point' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Loader2, DoorOpen, ShieldCheck, AlertTriangle } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

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
  assignedDepts: []
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
        // Directus returns assignedDepts as array of objects potentially
        assignedDepts: (props.door.assignedDepts || []).map(d => d.id || d)
      };
    } else {
      // Reset
      formData.value = {
        doorNumber: 1,
        doorName: '',
        location: '',
        deviceUuid: '',
        assignedDepts: []
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
    
    // Auto-generate doorNumber and uniqueId for new doors (matching reference repo)
    const doorNumber = isEdit ? (props.door.doorNumber || '1') : await generateDoorNumber(token, tenantId);
    const uniqueId = isEdit ? (props.door.uniqueId || `${tenantId}-${doorNumber}`) : `${tenantId}-${doorNumber}`;

    // Build payload matching the reference repo schema
    const payload = {
      doorName: formData.value.doorName,
      doorNumber,
      location: formData.value.location || null,
      status: 'active',
      tenant: tenantId,
      uniqueId,
      deviceUuid: formData.value.deviceUuid || null,
      // departmentIds is stored as JSON string array (per reference repo)
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
      // Handle Many-to-Many departments update if necessary, or just rely on Directus relational save
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

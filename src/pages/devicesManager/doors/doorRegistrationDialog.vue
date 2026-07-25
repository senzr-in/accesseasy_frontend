<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
  >
    <div class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/20 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-zinc-100 dark:border-slate-800 z-10">
        <div class="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-inner">
              <DoorOpen class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {{ door ? 'Configure Access Point' : 'Register Access Point' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400 ml-[52px]">
            {{ door ? 'Update hardware parameters, gate types, and portal setups' : 'Define a new physical barrier and auto-generate its registration portal' }}
          </p>
        </div>
        <button
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-slate-950/20 custom-scrollbar">
        <form
          id="door-form"
          class="space-y-8"
          @submit.prevent="handleSubmit"
        >
          <!-- Basic Information Section -->
          <div v-show="currentStep === 1" class="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-slate-800 pb-3 flex items-center gap-2 text-zinc-400 dark:text-slate-500">
              <DoorOpen class="w-4 h-4 text-blue-500" /> Basic Information & Hardware
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5 col-span-2 md:col-span-1">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Access Point Name *</label>
                <input
                  v-model="formData.doorName"
                  type="text"
                  required
                  placeholder="e.g. Lobby Entrance"
                  class="ae-input w-full"
                >
              </div>

              <div class="space-y-1.5 col-span-2 md:col-span-1">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gate / Barrier Type *</label>
                <select
                  v-model="formData.doorType"
                  required
                  class="ae-input w-full pr-8"
                >
                  <option value="entry">Entry Gate</option>
                  <option value="exit">Exit Gate</option>
                  <option value="main">Main Gate</option>
                  <option value="speed_gate">Speed Gate</option>
                  <option value="turnstile">Turnstile</option>
                  <option value="barrier">Boom Barrier</option>
                  <option value="other">Other Barrier</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location</label>
                <input
                  v-model="formData.location"
                  type="text"
                  placeholder="e.g. Ground Floor, Block B"
                  class="ae-input w-full"
                >
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Controller Serial (Optional)</label>
                <input
                  v-model="formData.deviceUuid"
                  type="text"
                  placeholder="e.g. SN-8923-920"
                  class="ae-input w-full"
                >
              </div>
            </div>
          </div>

          <!-- Portal Management Section -->
          <div v-show="currentStep === 2" class="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-slate-800 pb-3 flex items-center gap-2 text-zinc-400 dark:text-slate-500">
              <Globe class="w-4 h-4 text-indigo-500" /> Visitor Registration Portal Setup
            </h4>

            <!-- Option 1: Auto create portal (Available for new doors) -->
            <div v-if="!door" class="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 space-y-4">
              <label class="flex items-start gap-2.5 cursor-pointer">
                <input
                  v-model="formData.autoCreatePortal"
                  type="checkbox"
                  class="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Create Portal Automatically</span>
                  <span class="text-[10px] text-slate-500">Generate a companion visitor registration portal link and QR code for this gate.</span>
                </div>
              </label>
            </div>

            <!-- Option 2: Link to existing portal -->
            <div v-if="!formData.autoCreatePortal" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5 col-span-2 sm:col-span-1">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assigned Visitor Portal</label>
                <select
                  v-model="formData.portalId"
                  class="ae-input w-full pr-8"
                >
                  <option value="">Unassigned — No linked registration portal</option>
                  <option
                    v-for="p in portalsList"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.Title }}
                  </option>
                </select>
              </div>

              <div class="space-y-1.5 col-span-2 sm:col-span-1">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Portal Status</label>
                <select
                  v-model="formData.portalStatus"
                  class="ae-input w-full pr-8"
                >
                  <option value="published">Active (Published)</option>
                  <option value="draft">Inactive (Draft)</option>
                </select>
              </div>

              <!-- Edit portal builder redirect -->
              <div v-if="formData.portalId" class="col-span-2 flex items-center justify-between p-3 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl">
                <span class="text-[11px] text-slate-500">Need to customize the portal branding, logo, or form inputs?</span>
                <button
                  type="button"
                  class="btn-secondary py-1 px-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 cursor-pointer"
                  @click="openPortalBuilder(formData.portalId)"
                >
                  Customize Portal (Builder)
                </button>
              </div>
            </div>
          </div>

          <!-- Security & Access Section -->
          <div v-show="currentStep === 2" class="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-slate-800 pb-3 flex items-center gap-2 text-zinc-400 dark:text-slate-500">
              <ShieldCheck class="w-4 h-4 text-blue-500" /> Security & Access Rules
            </h4>
            <div class="space-y-1.5 max-w-sm">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authorized Departments</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-4 rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner">
                <label
                  v-for="dept in departments"
                  :key="dept.id"
                  class="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <input
                    v-model="formData.assignedDepts"
                    type="checkbox"
                    :value="dept.id"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-zinc-300 dark:border-slate-700"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{{ dept.departmentName || dept.name }}</span>
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
        class="mx-8 mb-4 flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium animate-in slide-in-from-top-2 duration-200"
      >
        <AlertTriangle class="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <span class="flex-1 break-words">{{ errorMessage }}</span>
        <button
          class="shrink-0 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          @click="errorMessage = ''"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10">
        <!-- Step Indicators -->
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full transition-colors" :class="currentStep === 1 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'" />
          <div class="w-2 h-2 rounded-full transition-colors" :class="currentStep === 2 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'" />
        </div>
        
        <div class="flex gap-3">
          <button
            v-if="currentStep === 1"
            type="button"
            class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-slate-800 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all duration-200 cursor-pointer"
            @click="close"
          >
            Cancel
          </button>
          <button
            v-if="currentStep === 2"
            type="button"
            class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-slate-800 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all duration-200 cursor-pointer"
            @click="currentStep = 1"
          >
            Back
          </button>
          
          <button
            v-if="currentStep === 1"
            type="button"
            class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-md transition-all cursor-pointer"
            @click="currentStep = 2"
          >
            Next Step
          </button>
          <button
            v-if="currentStep === 2"
            type="submit"
            form="door-form"
            :disabled="loading"
            class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span class="relative z-10">{{ door ? 'Update Installation' : 'Deploy Access Point' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { X, Loader2, DoorOpen, ShieldCheck, AlertTriangle, Globe } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const props = defineProps({
  modelValue: Boolean, // controls v-if
  door: { type: Object, default: null },
  portal: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);
const errorMessage = ref('');
const departments = ref([]);
const portalsList = ref([]);
const currentStep = ref(1);

// Form state
const formData = ref({
  doorNumber: 1,
  doorName: '',
  location: '',
  deviceUuid: '',
  doorType: 'entry',
  assignedDepts: [],

  portalId: '',
  autoCreatePortal: true,
  portalStatus: 'published'
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    errorMessage.value = '';
    currentStep.value = 1;
    fetchDepartments();
    fetchPortals();
    
    if (props.door) {
      formData.value = {
        doorNumber: props.door.doorNumber || 1,
        doorName: props.door.doorName || '',
        location: props.door.location || '',
        deviceUuid: props.door.deviceUuid || '',
        doorType: props.door.doorType || 'entry',
        assignedDepts: (props.door.assignedDepts || []).map(d => d.id || d),

        portalId: props.portal?.id || '',
        autoCreatePortal: false,
        portalStatus: props.portal?.status || 'published'
      };
    } else {
      formData.value = {
        doorNumber: 1,
        doorName: '',
        location: '',
        deviceUuid: '',
        doorType: 'entry',
        assignedDepts: [],

        portalId: '',
        autoCreatePortal: true,
        portalStatus: 'published'
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

const fetchPortals = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/BrandedPages?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&fields=id,Title,status,Contentjson`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      portalsList.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch portals", err);
  }
};

const openPortalBuilder = (portalId) => {
  window.open(`${window.location.origin}/dashboard/visitor-portals/builder/${portalId}`, '_blank');
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
  errorMessage.value = '';
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    const isEdit = !!props.door;
    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/doors/${props.door.id}`
      : `${import.meta.env.VITE_API_URL}/items/doors`;
    
    const doorNumber = isEdit ? (props.door.doorNumber || '1') : await generateDoorNumber(token, tenantId);
    const uniqueId = isEdit ? (props.door.uniqueId || `${tenantId}-${doorNumber}`) : `${tenantId}-${doorNumber}`;

    const doorPayload = {
      doorName: formData.value.doorName,
      doorNumber,
      location: formData.value.location || null,
      doorType: formData.value.doorType || 'entry',
      status: 'active',
      tenant: tenantId,
      uniqueId,
      deviceUuid: formData.value.deviceUuid || null,
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
      body: JSON.stringify(doorPayload)
    });

    if (res.ok) {
      const savedDoor = await res.json();
      const savedDoorId = savedDoor.data.id;

      // 1. Create Portal Automatically if requested
      if (formData.value.autoCreatePortal && !isEdit) {
        const portalPayload = {
          Title: formData.value.doorName + ' Portal',
          status: formData.value.portalStatus || 'published',
          tenant: tenantId,
          Contentjson: {
            registrationFormTitle: formData.value.doorName + ' Registration',
            registrationFormDescription: 'Please fill in details to request entry access.',
            registrationFormButtonText: 'Submit Request',
            enableContact: false,
            defaultAccessLevel: 'Standard',
            assigned_door_id: savedDoorId
          },
          Assetjson: { images: { logo: null, banner: null } }
        };
        await fetch(`${import.meta.env.VITE_API_URL}/items/BrandedPages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(portalPayload)
        });
      }

      // 2. Link to an existing portal or update status
      if (formData.value.portalId) {
        const targetPortal = portalsList.value.find(p => String(p.id) === String(formData.value.portalId));
        if (targetPortal) {
          let parsedContent = targetPortal.Contentjson;
          if (typeof parsedContent === 'string') {
            try { parsedContent = JSON.parse(parsedContent); } catch { parsedContent = {}; }
          }
          const updatedContent = {
            ...parsedContent,
            assigned_door_id: savedDoorId
          };
          
          await fetch(`${import.meta.env.VITE_API_URL}/items/BrandedPages/${targetPortal.id}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              status: formData.value.portalStatus || targetPortal.status,
              Contentjson: updatedContent
            })
          });
        }
      }

      emit('success');
      close();
    } else {
      const errorData = await res.json();
      errorMessage.value = `API Error: ${errorData.errors?.[0]?.message || 'Save failed'}`;
    }
  } catch (err) {
    console.error('Save error', err);
    errorMessage.value = `Network error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

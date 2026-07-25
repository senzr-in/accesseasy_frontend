<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full"
  >
    <div class="relative w-full max-w-lg flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-emerald-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
        <div class="absolute inset-0 bg-white dark:bg-slate-900/40 dark:bg-zinc-950/40 backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
              <Shield class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ accessLevel ? 'Edit Clearance' : 'Create Access Group' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
            {{ accessLevel ? 'Modify access permissions and door assignments.' : 'Define a new security clearance level for employees.' }}
          </p>
        </div>
        <button
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto max-h-[70vh] bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <form
          id="access-level-form"
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">
              <span>Access Level Name <span class="text-red-500">*</span></span>
              <span class="text-zinc-400 font-normal normal-case tracking-normal">{{ formData.accessLevelName?.length || 0 }}/50</span>
            </label>
            <input 
              v-model="formData.accessLevelName" 
              type="text" 
              required 
              placeholder="e.g. IT Department Access"
              maxlength="50"
              class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground" 
            >
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</label>
            <textarea 
              v-model="formData.description" 
              rows="2" 
              placeholder="Optional description"
              class="w-full p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-foreground"
            />
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <DoorOpen class="w-3 h-3" /> Select Doors
              </label>
              <!-- Optional: Add a "Select All" toggle here if needed -->
            </div>
            
            <div
              v-if="fetchingDoors"
              class="flex justify-center py-6 text-zinc-400"
            >
              <Loader2 class="w-6 h-6 animate-spin" />
            </div>
            <div
              v-else-if="doors.length === 0"
              class="text-center py-6 text-sm text-zinc-400 bg-white dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800"
            >
              No doors available
            </div>
            <div
              v-else
              class="grid gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1"
            >
              <label 
                v-for="door in doors" 
                :key="door.id || door.RecordId" 
                :class="[
                  'flex items-center gap-4 p-4 rounded-[16px] border cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md',
                  formData.assignDoorsGroup.includes(door.id || door.RecordId) 
                    ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20' 
                    : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:hover:bg-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800/50'
                ]"
              >
                <input 
                  v-model="formData.assignDoorsGroup" 
                  type="checkbox" 
                  :value="door.id || door.RecordId" 
                  class="w-5 h-5 rounded-md text-emerald-500 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 transition-all" 
                >
                <div class="flex-1 overflow-hidden">
                  <div class="text-sm font-semibold truncate text-foreground">{{ door.doorName || door.name }}</div>
                  <div class="text-xs text-muted-foreground truncate">{{ door.doorNumber ? 'Door #' + door.doorNumber : '' }}</div>
                </div>
              </label>
            </div>
            <p class="text-[10px] text-muted-foreground font-medium">
              Selected doors will be accessible to users assigned to this level.
            </p>
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
          form="access-level-form"
          :disabled="loading"
          class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          <Loader2
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <span class="relative z-10">{{ accessLevel ? 'Update Access Group' : 'Create Clearance' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, Loader2, Shield, DoorOpen } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const props = defineProps({
  modelValue: Boolean,
  accessLevel: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);
const fetchingDoors = ref(false);
const doors = ref([]);

const formData = ref({
  accessLevelName: '',
  workingHours: '09:00-18:00',
  validHours: '24/7',   // UI-only field, NOT sent to API
  assignDoorsGroup: []
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.accessLevel) {
      formData.value = {
        accessLevelName: props.accessLevel.accessLevelName || '',
        workingHours: props.accessLevel.workingHours || '09:00-18:00',
        validHours: props.accessLevel.validHours || '24/7',
        assignDoorsGroup: Array.isArray(props.accessLevel.assignDoorsGroup) ? [...props.accessLevel.assignDoorsGroup] : []
      };
    } else {
      formData.value = {
        accessLevelName: '',
        workingHours: '09:00-18:00',
        validHours: '24/7',
        assignDoorsGroup: []
      };
    }
    fetchDoors();
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const fetchDoors = async () => {
  fetchingDoors.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    // Only fetch fields that exist and have permissions — matching reference codebase
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&fields[]=id&fields[]=doorName&fields[]=doorNumber`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      doors.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch doors", err);
  } finally {
    fetchingDoors.value = false;
  }
};

const toggleDoor = (id) => {
  const index = formData.value.assignDoorsGroup.indexOf(id);
  if (index === -1) {
    formData.value.assignDoorsGroup.push(id);
  } else {
    formData.value.assignDoorsGroup.splice(index, 1);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();

    const isEdit = !!props.accessLevel;
    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/accesslevels/${props.accessLevel.id}`
      : `${import.meta.env.VITE_API_URL}/items/accesslevels`;
    
    // Auto-generate accessLevelNumber for new records (matching reference)
    let nextNum = 1;
    const highestNumRes = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&sort[]=-accessLevelNumber&limit=1&fields[]=accessLevelNumber`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (highestNumRes.ok) {
      const topData = await highestNumRes.json();
      if (topData.data?.length > 0 && topData.data[0].accessLevelNumber) {
        nextNum = topData.data[0].accessLevelNumber + 1;
      }
    }

    // Build a clean payload — do NOT spread formData directly (validHours is UI-only)
    // NOTE: accessType is a boolean column in the DB — do NOT send a string like "all"
    const is24hrs = formData.value.validHours === "24/7";
    const payload = {
      accessLevelName: formData.value.accessLevelName,
      workingHours: is24hrs ? null : formData.value.workingHours,
      _24hrs: is24hrs,                                 // boolean ✓
      tenant: tenantId,
      assignDoorsGroup: formData.value.assignDoorsGroup,
    };

    if (!isEdit) {
      payload.accessLevelNumber = nextNum;
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
      alert("Error saving access group: " + (errorData.errors?.[0]?.message || 'Unknown'));
    }
  } catch (err) {
    console.error("Save error", err);
    alert("Failed to connect to API");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.main-scroll::-webkit-scrollbar {
  width: 6px;
}
.main-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.main-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .main-scroll::-webkit-scrollbar-thumb {
  background-color: #334155;
}
</style>

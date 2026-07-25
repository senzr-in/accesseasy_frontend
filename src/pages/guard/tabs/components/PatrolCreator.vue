<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div class="ae-card w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] rounded-3xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PlusCircle class="w-5 h-5 text-indigo-650" />
              Patrol Creator
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create a patrol route, sequence checkpoints, and configure timings
            </p>
          </div>
          <button
            class="btn-icon text-slate-400 hover:text-slate-655"
            @click="$emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Two Column Layout Form -->
        <div class="flex-1 overflow-hidden flex min-h-0">
          
          <!-- Left Column: Settings Form -->
          <div class="w-[45%] overflow-y-auto custom-scrollbar p-6 border-r border-slate-100 dark:border-slate-800 space-y-4">
            
            <!-- Patrol Name -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Patrol Name *</label>
              <input
                v-model="form.name"
                type="text"
                class="ae-input w-full font-semibold"
                placeholder="e.g. Night Warehouse Rounds"
              />
            </div>

            <!-- Target Zone -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Zone *</label>
              <select
                v-model="form.zoneId"
                class="ae-input w-full pr-8 font-semibold"
                @change="onZoneChange"
              >
                <option value="" disabled>Select zone...</option>
                <option
                  v-for="z in zones"
                  :key="z.id"
                  :value="z.id"
                >
                  {{ z.zoneName }}
                </option>
              </select>
            </div>

            <!-- Allowed Delay & Guard -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Allowed Delay (Min)</label>
                <input
                  v-model.number="form.gracePeriod"
                  type="number"
                  min="0"
                  class="ae-input w-full text-center font-bold"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">QR Support Required</label>
                <div class="flex items-center h-10">
                  <button
                    class="w-full h-9 rounded-xl border font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    :class="form.qrSupport ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200 dark:border-white/10 dark:bg-white/5'"
                    @click="form.qrSupport = !form.qrSupport"
                  >
                    <Check v-if="form.qrSupport" class="w-3.5 h-3.5" />
                    {{ form.qrSupport ? 'Enabled' : 'Disabled' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Guard Assignment -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Assign Guard (Optional)</label>
              <select
                v-model="form.guardId"
                class="ae-input w-full pr-8"
              >
                <option value="">Unassigned (Claimable on Mobile)</option>
                <option
                  v-for="g in guards"
                  :key="g.id"
                  :value="g.id"
                >
                  {{ g.name || g.full_name }}
                </option>
              </select>
            </div>

            <!-- Patrol Timings Configuration -->
            <div class="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div class="flex justify-between items-center">
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Patrol Timings *</label>
                <button
                  class="text-[10px] font-black text-indigo-650 hover:underline flex items-center gap-1"
                  @click="addTimingSlot"
                >
                  <Plus class="w-3 h-3" /> Add Time
                </button>
              </div>
              
              <div class="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                <div
                  v-for="(time, idx) in form.timings"
                  :key="idx"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="form.timings[idx]"
                    type="time"
                    class="ae-input py-1 h-9 text-xs flex-1 text-center font-bold"
                  />
                  <button
                    v-if="form.timings.length > 1"
                    class="w-9 h-9 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    @click="form.timings.splice(idx, 1)"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Checkpoint Selector & Ordering -->
          <div class="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 p-6 min-h-0">
            
            <div v-if="!form.zoneId" class="flex flex-col items-center justify-center flex-1 text-center">
              <Layers class="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2.5" />
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400">
                Please select a Zone to configure checkpoints.
              </p>
            </div>

            <div v-else class="flex-1 flex flex-col min-h-0 gap-4">
              <!-- Select Checkpoints Checklist -->
              <div class="flex-1 border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col min-h-0">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 shrink-0">
                  Select Checkpoints in Zone <span class="text-rose-500">*</span> ({{ availableCheckpoints.length }} Available)
                </p>
                <div class="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  <div
                    v-for="cp in availableCheckpoints"
                    :key="cp.id"
                    class="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
                    @click="toggleCheckpointSelection(cp)"
                  >
                    <input
                      type="checkbox"
                      :checked="isCheckpointSelected(cp)"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                      @click.stop="toggleCheckpointSelection(cp)"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{{ cp.name }}</p>
                      <p class="text-[10px] font-mono text-slate-450 mt-0.5">{{ cp.checkpoint_id }}</p>
                    </div>
                  </div>
                  <div
                    v-if="availableCheckpoints.length === 0"
                    class="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center px-4"
                  >
                    <p class="mb-3">No standalone checkpoints assigned to this zone.</p>
                    <button 
                      class="btn-secondary py-1.5 px-3 text-[10px]"
                      @click="$emit('open-library')"
                    >
                      <MapPin class="w-3 h-3 inline-block mr-1" /> Create Checkpoints Now
                    </button>
                  </div>
                </div>
              </div>

              <!-- Reorder Checkpoints Sequence -->
              <div
                v-if="selectedCheckpoints.length > 0"
                class="flex-1 border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col min-h-0"
              >
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 shrink-0">
                  Sequence Order (Drag or click arrows to reorder)
                </p>
                <div class="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                  <div
                    v-for="(cp, idx) in selectedCheckpoints"
                    :key="cp.id"
                    class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60"
                  >
                    <span class="w-5 h-5 rounded bg-indigo-55 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex-1">{{ cp.name }}</span>
                    
                    <!-- Sorting Arrows -->
                    <div class="flex items-center gap-1 shrink-0">
                      <button
                        :disabled="idx === 0"
                        class="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-450 disabled:opacity-30 cursor-pointer"
                        @click="moveUp(idx)"
                      >
                        &uarr;
                      </button>
                      <button
                        :disabled="idx === selectedCheckpoints.length - 1"
                        class="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-455 disabled:opacity-30 cursor-pointer"
                        @click="moveDown(idx)"
                      >
                        &darr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <!-- Validation Error Message -->
        <div v-if="validationError" class="px-6 py-2 text-xs font-semibold text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/50 shrink-0 text-center">
          ⚠️ {{ validationError }}
        </div>

        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <p class="text-xs font-semibold text-slate-455">
            <span v-if="selectedCheckpoints.length > 0">{{ selectedCheckpoints.length }} Checkpoints Selected</span>
            <span v-if="form.timings.length > 0"> &bull; {{ form.timings.length }} Timings Configured</span>
          </p>
          <div class="flex gap-2">
            <button
              class="btn-secondary py-1.5 text-xs"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="btn-primary py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="saving || selectedCheckpoints.length === 0"
              @click="submit"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              {{ saving ? 'Saving...' : 'Save Patrol Plan' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { PlusCircle, X, Plus, Layers, Check, Loader2 } from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';
import { authService } from '@/services/authService';

const props = defineProps({
  zones:  { type: Array, default: () => [] },
  guards: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'create']);

const saving = ref(false);
const validationError = ref('');
const allMasterCheckpoints = ref([]);
const availableCheckpoints = ref([]);
const selectedCheckpoints = ref([]);

const form = ref({
  name: '',
  zoneId: '',
  gracePeriod: 15,
  qrSupport: true,
  guardId: '',
  timings: ['08:00']
});

const onZoneChange = () => {
  // Load standalone checkpoints in this zone
  availableCheckpoints.value = allMasterCheckpoints.value.filter(c => {
    const zId = typeof c.zone === 'object' && c.zone ? c.zone.id : c.zone;
    return zId && String(zId) === String(form.value.zoneId);
  });
  selectedCheckpoints.value = [...availableCheckpoints.value];
};

const toggleCheckpointSelection = (cp) => {
  const idx = selectedCheckpoints.value.findIndex(c => c.id === cp.id);
  if (idx > -1) {
    selectedCheckpoints.value.splice(idx, 1);
  } else {
    selectedCheckpoints.value.push({ ...cp });
  }
};

const isCheckpointSelected = (cp) => {
  return selectedCheckpoints.value.some(c => c.id === cp.id);
};

const addTimingSlot = () => {
  form.value.timings.push('12:00');
};

const moveUp = (idx) => {
  if (idx === 0) return;
  const temp = selectedCheckpoints.value[idx - 1];
  selectedCheckpoints.value[idx - 1] = selectedCheckpoints.value[idx];
  selectedCheckpoints.value[idx] = temp;
};

const moveDown = (idx) => {
  if (idx === selectedCheckpoints.value.length - 1) return;
  const temp = selectedCheckpoints.value[idx + 1];
  selectedCheckpoints.value[idx + 1] = selectedCheckpoints.value[idx];
  selectedCheckpoints.value[idx] = temp;
};

const loadMasterCheckpoints = async () => {
  try {
    const list = await patrolService.getMasterCheckpoints();
    if (list) {
      list.forEach(cp => {
        const match = cp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
        cp.zone = match ? match[1] : null;
      });
    }
    allMasterCheckpoints.value = list || [];
  } catch (e) {
    console.error('Failed to load master checkpoints', e);
  }
};

const submit = async () => {
  validationError.value = '';
  if (!form.value.name.trim()) {
    validationError.value = 'Please enter a Patrol Name.';
    return;
  }
  if (!form.value.zoneId) {
    validationError.value = 'Please select a Zone.';
    return;
  }
  if (selectedCheckpoints.value.length === 0) {
    validationError.value = 'Please select at least one Checkpoint in the zone list.';
    return;
  }
  if (form.value.timings.length === 0) {
    validationError.value = 'Please add at least one Patrol Timing.';
    return;
  }

  saving.value = true;
  try {
    // 1. Create a Checkpoint Group representing the route configuration
    const group = await patrolService.createCheckpointGroup({
      name: form.value.name.trim(),
      zone_id: form.value.zoneId,
      frequency: 'shift',
      grace_period: form.value.gracePeriod
    });

    // 2. Clone and save checkpoints to this new group in order
    for (let index = 0; index < selectedCheckpoints.value.length; index++) {
      const originalCp = selectedCheckpoints.value[index];
      const clone = {
        name: originalCp.name,
        checkpoint_id: originalCp.checkpoint_id,
        building_id: originalCp.building_id,
        floor: originalCp.floor,
        dwell_time: originalCp.dwell_time,
        nfc_uid: originalCp.nfc_uid,
        status: 'pending',
        sort_order: index,
        zone: form.value.zoneId,
        latitude: originalCp.latitude || null,
        longitude: originalCp.longitude || null,
        x: originalCp.x || 0,
        y: originalCp.y || 0
      };
      await patrolService.saveCheckpoint(group.id, clone);
    }

    // 3. For each configured start time, create a scheduled patrol round for today
    const z = props.zones.find(z => z.id === form.value.zoneId);
    const todayStr = new Date().toISOString().split('T')[0];

    for (const time of form.value.timings) {
      const scheduledTimeStr = `${todayStr}T${time}:00`;
      
      const payload = {
        zoneId: form.value.zoneId,
        zoneName: z?.zoneName || 'Security Zone',
        groupId: group.id,
        guardId: form.value.guardId || null,
        guardName: form.value.guardId
          ? (props.guards.find(g => g.id === form.value.guardId)?.name || 'Assigned Guard')
          : 'Unassigned',
        date: todayStr,
        scheduledTime: scheduledTimeStr,
        status: 'scheduled',
        allowed_delay: form.value.gracePeriod,
        qr_support: form.value.qrSupport
      };

      await patrolService.createPatrol(payload);
    }

    emit('create');
    emit('close');
  } catch (err) {
    alert(`Failed to save patrol plan: ${err.message}`);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadMasterCheckpoints();
});
</script>

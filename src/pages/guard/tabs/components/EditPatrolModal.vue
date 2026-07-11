<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in">
      <div class="ae-card w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil class="w-5 h-5 text-indigo-600" />
              Edit Patrol
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Update the patrol details below</p>
          </div>
          <button @click="$emit('close')" class="btn-icon"><X class="w-4 h-4" /></button>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

          <!-- Zone -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Zone</label>
            <select v-model="form.zoneId" class="ae-input w-full" @change="onZoneChange">
              <option value="">Select zone...</option>
              <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name || z.zoneName }}</option>
            </select>
          </div>

          <!-- Checkpoint Group -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Route / Checkpoint Group</label>
            <select v-model="form.groupId" class="ae-input w-full">
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
              <option v-if="!groups.length" value="">Default Route</option>
            </select>
          </div>

          <!-- Guard Assignment -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Assign Guard
              <span class="text-slate-400 font-normal">(optional)</span>
            </label>
            <select v-model="form.guardId" class="ae-input w-full">
              <option value="">Unassigned — any guard can claim</option>
              <option v-for="g in guards" :key="g.id" :value="g.id">{{ g.name || g.full_name }}</option>
            </select>
          </div>

          <!-- Date & Times -->
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Patrol Date</label>
              <input type="date" v-model="form.date" class="ae-input w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Shift Start</label>
              <input type="time" v-model="form.startTime" class="ae-input w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Shift End</label>
              <input type="time" v-model="form.endTime" class="ae-input w-full" />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select v-model="form.status" class="ae-input w-full">
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">
            {{ error }}
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
          <button @click="$emit('close')" class="btn-ghost">Cancel</button>
          <button @click="submit" class="btn-primary" :disabled="saving || !form.zoneId">
            <span v-if="saving" class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Saving...
            </span>
            <span v-else class="flex items-center gap-2">
              <Pencil class="w-3.5 h-3.5" /> Save Changes
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Pencil, X } from 'lucide-vue-next';

const props = defineProps({
  patrol: { type: Object, required: true },
  zones:  { type: Array, default: () => [] },
  groups: { type: Array, default: () => [] },
  guards: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'save']);

const saving = ref(false);
const error  = ref('');

// Resolve guard ID from name in case patrol only has guardName
function resolveGuardId(patrol) {
  if (patrol.guardId) return patrol.guardId;
  const match = props.guards.find(g =>
    (g.name || g.full_name || '').toLowerCase() === (patrol.guardName || '').toLowerCase()
  );
  return match?.id || '';
}

function resolveGroupId(patrol) {
  if (typeof patrol.groupId === 'object' && patrol.groupId) return patrol.groupId.id;
  return patrol.groupId || '';
}

function timeFromIso(isoOrTime) {
  if (!isoOrTime) return '';
  if (isoOrTime.includes('T')) {
    const parts = isoOrTime.split('T')[1].split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return isoOrTime;
}

const form = ref({
  zoneId:    patrol_zoneId(),
  groupId:   resolveGroupId(props.patrol),
  guardId:   resolveGuardId(props.patrol),
  date:      props.patrol.date || new Date().toISOString().split('T')[0],
  startTime: timeFromIso(props.patrol.startTime || props.patrol.scheduledTime),
  endTime:   timeFromIso(props.patrol.endTime),
  status:    props.patrol.status || 'scheduled',
});

function patrol_zoneId() {
  return props.patrol.zoneId || '';
}

function onZoneChange() {
  // Auto-select zone name in submit
}

async function submit() {
  if (!form.value.zoneId) {
    error.value = 'Please select a zone.';
    return;
  }
  error.value = '';
  saving.value = true;

  const z = props.zones.find(z => z.id === form.value.zoneId);
  const g = props.guards.find(g => g.id === form.value.guardId);

  const payload = {
    zoneId:    form.value.zoneId,
    zoneName:  z ? (z.name || z.zoneName) : props.patrol.zoneName,
    groupId:   form.value.groupId || null,
    guardId:   form.value.guardId || null,
    guardName: g ? (g.name || g.full_name) : (form.value.guardId ? 'Assigned Guard' : 'Unassigned'),
    date:      form.value.date,
    startTime: form.value.startTime,
    endTime:   form.value.endTime,
    status:    form.value.status,
  };

  try {
    emit('save', { id: props.patrol.id, payload });
  } finally {
    saving.value = false;
  }
}
</script>

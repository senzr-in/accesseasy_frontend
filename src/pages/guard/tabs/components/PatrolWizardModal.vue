<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in">
      <div class="ae-card w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PlusCircle class="w-5 h-5 text-indigo-600" />
              Create Patrol
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Schedule a new patrol route
            </p>
          </div>
          <button
            class="btn-icon"
            @click="$emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Zone</label>
            <div v-if="!zones || !zones.length" class="text-xs border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-3 rounded-xl flex items-center justify-between">
              <span>No zones have been created yet.</span>
              <button
                type="button"
                @click="goToZones"
                class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
              >
                Create Zone
              </button>
            </div>
            <select
              v-else
              v-model="form.zoneId"
              class="ae-input w-full"
            >
              <option value="">
                Select zone...
              </option>
              <option
                v-for="z in zones"
                :key="z.id"
                :value="z.id"
              >
                {{ z.name || z.zoneName }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Route / Checkpoint Group</label>
            <select
              v-model="form.groupId"
              class="ae-input w-full"
            >
              <option
                v-for="g in groups"
                :key="g.id"
                :value="g.id"
              >
                {{ g.name }}
              </option>
              <option
                v-if="!groups.length"
                value=""
              >
                Default Route
              </option>
            </select>
          </div>

          <!-- Guard Assignment (optional pre-assign) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Assign Guard <span class="text-slate-400 font-normal">(optional — can be claimed on mobile)</span></label>
            <select
              v-model="form.guardId"
              class="ae-input w-full"
            >
              <option value="">
                Unassigned — any guard can claim
              </option>
              <option
                v-for="g in guards"
                :key="g.id"
                :value="g.id"
              >
                {{ g.name || g.full_name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Patrol Date</label>
              <input
                v-model="form.date"
                type="date"
                class="ae-input w-full"
              >
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Shift Start</label>
              <input
                v-model="form.startTime"
                type="time"
                class="ae-input w-full"
              >
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Shift End</label>
              <input
                v-model="form.endTime"
                type="time"
                class="ae-input w-full"
              >
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Repeat Every</label>
            <select
              v-model="form.repeat"
              class="ae-input w-full"
            >
              <option value="once">
                Once (single patrol)
              </option>
              <option value="2h">
                Every 2 hours
              </option>
              <option value="4h">
                Every 4 hours
              </option>
              <option value="daily">
                Daily (once per day)
              </option>
              <option value="custom">
                Custom interval...
              </option>
            </select>
          </div>

          <!-- Custom Interval Picker -->
          <transition name="slide-down">
            <div
              v-if="form.repeat === 'custom'"
              class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3"
            >
              <p class="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Custom Interval
              </p>
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-slate-600 dark:text-slate-300 mb-1">Hours</label>
                  <input
                    v-model.number="form.customHours"
                    type="number"
                    min="0"
                    max="23"
                    class="ae-input w-full text-center text-lg font-bold"
                    placeholder="0"
                  >
                </div>
                <div class="text-slate-400 font-bold text-lg mt-4">
                  :
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-slate-600 dark:text-slate-300 mb-1">Minutes</label>
                  <input
                    v-model.number="form.customMinutes"
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    class="ae-input w-full text-center text-lg font-bold"
                    placeholder="0"
                  >
                </div>
              </div>
              <p
                v-if="customIntervalMinutes > 0"
                class="text-xs text-amber-600 font-semibold"
              >
                Patrol every {{ customIntervalLabel }} within the shift window
              </p>
              <p
                v-else
                class="text-xs text-red-500"
              >
                Enter a valid interval (minimum 5 minutes)
              </p>
            </div>
          </transition>

          <!-- Slot Preview -->
          <div
            v-if="slotPreview.length > 0"
            class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"
          >
            <p class="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-2">
              {{ slotPreview.length }} Patrol{{ slotPreview.length > 1 ? 's' : '' }} Will Be Created
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(slot, i) in slotPreview"
                :key="i"
                class="text-xs font-semibold bg-white dark:bg-slate-900 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full"
              >
                {{ slot }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <button
            class="btn-ghost"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            class="btn-primary"
            :disabled="!form.zoneId || !form.groupId"
            @click="submit"
          >
            <PlusCircle class="w-3.5 h-3.5" />
            Schedule {{ slotPreview.length > 1 ? slotPreview.length + ' Patrols' : 'Patrol' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { PlusCircle, X } from 'lucide-vue-next';

const props = defineProps({
  zones:  { type: Array, default: () => [] },
  groups: { type: Array, default: () => [] },
  guards: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'create']);

const router = useRouter();

const goToZones = () => {
  emit('close');
  router.push('/dashboard/settings/zones');
};

const form = ref({
  zoneId:        '',
  groupId:       '',
  guardId:       '',
  date:          new Date().toISOString().split('T')[0],
  startTime:     '08:00',
  endTime:       '20:00',
  repeat:        'once',
  customHours:   1,
  customMinutes: 0,
});

// Resolve custom interval to minutes
const customIntervalMinutes = computed(() => {
  const h = Number(form.value.customHours) || 0;
  const m = Number(form.value.customMinutes) || 0;
  return h * 60 + m;
});

const customIntervalLabel = computed(() => {
  const total = customIntervalMinutes.value;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`;
  return `${m} minutes`;
});

// ── Compute slot times for the preview strip ────────────────────────────────
const slotPreview = computed(() => {
  const { startTime, endTime, repeat } = form.value;
  if (!startTime || !endTime) return [];

  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const startMin = sH * 60 + sM;
  const endMin   = eH * 60 + eM;

  let interval = 0;
  if      (repeat === '2h')     interval = 120;
  else if (repeat === '4h')     interval = 240;
  else if (repeat === 'custom') interval = customIntervalMinutes.value;

  const slots = [];
  if (interval >= 5) {
    for (let m = startMin; m < endMin; m += interval) {
      const h   = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`);
    }
  } else {
    // 'once' or 'daily'
    slots.push(startTime);
  }
  return slots;
});

function submit() {
  const z = props.zones.find(z => z.id === form.value.zoneId);
  if (!z) return;

  const newPatrol = {
    zoneId:    form.value.zoneId,
    zoneName:  z.name || z.zoneName,
    groupId:   form.value.groupId,
    guardId:   form.value.guardId || null,
    guardName: form.value.guardId
      ? (props.guards.find(g => g.id === form.value.guardId)?.name || 'Assigned Guard')
      : 'Unassigned',
    date:      form.value.date,
    startTime:       form.value.startTime,
    endTime:         form.value.endTime,
    repeat:          form.value.repeat,
    customHours:     form.value.customHours,
    customMinutes:   form.value.customMinutes,
    status:          'scheduled'
  };

  emit('create', newPatrol);
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>

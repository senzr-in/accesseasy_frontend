<template>
  <Teleport to="body">
    <div
      v-if="modelValue && incident"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="w-full max-w-3xl bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black text-slate-900 dark:text-white">{{ incident.title }}</h3>
                <span
                  class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                  :class="incident.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                >
                  {{ incident.priority }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                {{ incident.site_name }} · {{ incident.zone_name || 'General Sector' }} · Reported by {{ incident.reported_by }}
              </p>
            </div>
          </div>

          <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="$emit('update:modelValue', false)">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 7-Stage Visual Progress Stepper -->
        <div class="px-6 py-4 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/5 overflow-x-auto custom-scrollbar shrink-0">
          <div class="flex items-center justify-between min-w-[620px] gap-2">
            <div
              v-for="(stage, idx) in INCIDENT_STAGES"
              :key="stage.key"
              class="flex items-center flex-1 last:flex-none"
            >
              <div class="flex flex-col items-center gap-1">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all shadow-sm"
                  :class="getStepBadgeClass(stage.key, idx)"
                >
                  <Check v-if="isStepCompleted(stage.key, idx)" class="w-3.5 h-3.5 text-white" />
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <span
                  class="text-[10px] font-bold tracking-tight text-center whitespace-nowrap"
                  :class="incident.status === stage.key ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'"
                >
                  {{ stage.label.split('. ')[1] }}
                </span>
              </div>

              <!-- Connecting Line -->
              <div
                v-if="idx < INCIDENT_STAGES.length - 1"
                class="flex-1 h-0.5 mx-2 rounded transition-colors"
                :class="isStepCompleted(stage.key, idx) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'"
              />
            </div>
          </div>
        </div>

        <!-- Content Body (Scrollable) -->
        <div class="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs flex-1">
          
          <!-- Incident Overview & Description -->
          <div class="space-y-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Incident Description</h4>
            <p class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 leading-relaxed">
              {{ incident.description || 'No detailed notes provided.' }}
            </p>
          </div>

          <!-- Photo Attachment if present -->
          <div v-if="incident.photo_url" class="space-y-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Evidence Photo</h4>
            <img :src="incident.photo_url" class="rounded-xl max-h-48 object-cover border border-slate-200 dark:border-white/10" alt="Incident Evidence" />
          </div>

          <!-- Action Log Audit Trail -->
          <div class="space-y-2.5">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Workflow Action Log & Timeline</h4>
            <div class="space-y-2">
              <div
                v-for="(log, li) in (incident.action_log || [])"
                :key="li"
                class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-start justify-between gap-3"
              >
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 dark:text-white capitalize">{{ log.status.replace('_', ' ') }}</span>
                    <span class="text-[10px] text-slate-400">by <strong>{{ log.user }}</strong></span>
                  </div>
                  <p class="text-slate-600 dark:text-slate-300">{{ log.notes }}</p>
                </div>
                <span class="text-[10px] font-mono text-slate-400 shrink-0">{{ formatTime(log.time) }}</span>
              </div>
            </div>
          </div>

          <!-- Advance Workflow Stage Action Box -->
          <div v-if="nextStage" class="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-indigo-900 dark:text-indigo-300">
                Next Stage: <span class="uppercase font-black text-indigo-600">{{ nextStage.label }}</span>
              </span>
              <span class="text-[10px] text-indigo-500 font-semibold">Authorized Roles: {{ nextStage.allowedRoles.join(', ') }}</span>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 block">Transition Notes & Corrective Actions</label>
              <textarea
                v-model="transitionNotes"
                rows="2"
                placeholder="Enter actions taken, investigation findings, or sign-off notes..."
                class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none text-xs"
              ></textarea>
            </div>

            <button
              class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              @click="advanceWorkflow"
            >
              <span>Advance to {{ nextStage.label }}</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50/50 dark:bg-slate-900 shrink-0">
          <button
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
            @click="$emit('update:modelValue', false)"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { AlertTriangle, X, Check, ArrowRight } from 'lucide-vue-next';
import { incidentService, INCIDENT_STAGES } from '@/services/incidentService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  incident: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'updated']);

const transitionNotes = ref('');

const currentStageIndex = computed(() => {
  if (!props.incident) return 0;
  const idx = INCIDENT_STAGES.findIndex(s => s.key === props.incident.status);
  return idx === -1 ? 0 : idx;
});

const nextStage = computed(() => {
  if (!props.incident) return null;
  const available = incidentService.getAvailableTransitions(props.incident.status);
  return available[0] || null;
});

const isStepCompleted = (stageKey, idx) => {
  return idx < currentStageIndex.value;
};

const getStepBadgeClass = (stageKey, idx) => {
  if (idx < currentStageIndex.value) {
    return 'bg-emerald-500 text-white';
  }
  if (idx === currentStageIndex.value) {
    return 'bg-indigo-600 text-white ring-4 ring-indigo-600/20';
  }
  return 'bg-slate-200 dark:bg-slate-700 text-slate-400';
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const advanceWorkflow = async () => {
  if (!nextStage.value || !props.incident) return;
  await incidentService.transitionIncident(props.incident.id, nextStage.value.key, {
    notes: transitionNotes.value,
    user: 'Supervisor / Controller'
  });
  transitionNotes.value = '';
  emit('updated');
};
</script>

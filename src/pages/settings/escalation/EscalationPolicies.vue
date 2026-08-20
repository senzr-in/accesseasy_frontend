<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="incident.escalation" show-locked-badge locked-label="Escalation Engine & Multi-Tier Rules — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Volume2 class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Escalation Policies & Fallback Matrix
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Automated multi-tier alert dispatch if on-duty personnel fail to acknowledge critical alerts
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            @click="openSimulatorModal"
          >
            <Zap class="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Trigger</span>
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            @click="openAddPolicyModal"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>New Policy</span>
          </button>
        </div>
      </div>

      <!-- Active Escalating Incidents Strip -->
      <div v-if="activeEscalations.length" class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Active Escalation Jobs Running</span>
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            v-for="esc in activeEscalations"
            :key="esc.id"
            class="p-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm flex items-start justify-between gap-3"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-rose-700 dark:text-rose-300">{{ esc.incident_title }}</span>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                  Tier {{ esc.current_level }} of {{ esc.max_level }}
                </span>
              </div>
              <p class="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                {{ esc.site_name }} · {{ esc.zone_name }} · Guard: {{ esc.guard_name }}
              </p>
              <div class="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold pt-1">
                Next Tier Escalation in ~{{ getMinutesLeft(esc.next_escalation_at) }} mins (Voice Dispatch + Webhook)
              </div>
            </div>

            <button
              v-if="esc.status !== 'acknowledged'"
              class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer shrink-0 transition-all"
              @click="handleAcknowledge(esc)"
            >
              Acknowledge & Halt
            </button>
            <span v-else class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 shrink-0">
              ✓ Acknowledged
            </span>
          </div>
        </div>
      </div>

      <!-- Configured Escalation Policies -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Configured Escalation Rules</h3>
        
        <div class="space-y-4">
          <div
            v-for="policy in policies"
            :key="policy.id"
            class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <!-- Policy Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <ShieldAlert class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900 dark:text-white">{{ policy.name }}</h4>
                  <span class="text-[10px] text-slate-400 font-medium">Trigger: <strong>{{ policy.trigger_type.replace('_', ' ').toUpperCase() }}</strong> · Scope: {{ policy.site_name }}</span>
                </div>
              </div>

              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200">
                Active
              </span>
            </div>

            <!-- Multi-Tier Levels Visual Chain -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                v-for="lvl in policy.levels"
                :key="lvl.level"
                class="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 space-y-2 relative overflow-hidden"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">
                    Level {{ lvl.level }}
                  </span>
                  <span class="text-[10px] font-mono font-bold text-slate-500">
                    {{ lvl.delay_minutes === 0 ? 'Immediate (0m)' : `+${lvl.delay_minutes} mins delay` }}
                  </span>
                </div>

                <h5 class="text-xs font-bold text-slate-900 dark:text-white">{{ lvl.target_role }}</h5>
                <p class="text-[11px] text-slate-500 leading-relaxed">{{ lvl.action }}</p>

                <!-- Channels Chips -->
                <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                  <span v-for="ch in lvl.channels" :key="ch" class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                    {{ ch.replace('_', ' ') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </FeatureGate>

    <!-- Simulator Modal -->
    <Teleport to="body">
      <div
        v-if="showSimModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showSimModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Simulate Alert Escalation</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showSimModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-3">
            <label class="font-bold text-slate-700 dark:text-slate-300 block">Select Trigger Scenario</label>
            <div class="space-y-2">
              <button
                v-for="sc in [
                  { key: 'sos_emergency', label: 'Guard SOS Panic Trigger', desc: 'Guard activated emergency button on mobile' },
                  { key: 'missed_patrol', label: 'Missed Patrol Overdue > 15m', desc: 'Scheduled round failed to commence' },
                  { key: 'geofence_breach', label: 'Perimeter Geofence Violation', desc: 'Scan attempt outside property boundary' }
                ]"
                :key="sc.key"
                class="w-full p-3 rounded-xl border text-left transition-all cursor-pointer"
                :class="selectedSimType === sc.key ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
                @click="selectedSimType = sc.key"
              >
                <span class="block font-bold">{{ sc.label }}</span>
                <span class="text-[10px] text-slate-500">{{ sc.desc }}</span>
              </button>
            </div>
          </div>

          <div class="mt-6 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 font-bold text-xs"
              @click="showSimModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              @click="runSimulationTrigger"
            >
              Launch Alert Simulation
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Volume2, Plus, Zap, ShieldAlert, X } from 'lucide-vue-next';
import { escalationService } from '@/services/escalationService';
import FeatureGate from '@/components/common/FeatureGate.vue';

const policies = ref([]);
const activeEscalations = ref([]);
const showSimModal = ref(false);
const selectedSimType = ref('sos_emergency');

const loadData = async () => {
  policies.value = await escalationService.fetchPolicies();
  activeEscalations.value = await escalationService.fetchActiveEscalations();
};

const getMinutesLeft = (nextAt) => {
  if (!nextAt) return 5;
  const diff = new Date(nextAt).getTime() - Date.now();
  return Math.max(1, Math.round(diff / 60000));
};

const handleAcknowledge = async (esc) => {
  await escalationService.acknowledgeEscalation(esc.id, 'Central SOC Officer');
  await loadData();
};

const openSimulatorModal = () => {
  selectedSimType.value = 'sos_emergency';
  showSimModal.value = true;
};

const runSimulationTrigger = async () => {
  await escalationService.simulateTrigger(selectedSimType.value);
  showSimModal.value = false;
  await loadData();
};

const openAddPolicyModal = () => {
  alert("Policy creation modal is ready.");
};

onMounted(async () => {
  await loadData();
});
</script>

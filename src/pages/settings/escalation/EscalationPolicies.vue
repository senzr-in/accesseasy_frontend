<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="incident.escalation" show-locked-badge locked-label="Escalation Engine & Multi-Tier Rules — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <button
            @click="router.push('/dashboard/settings')"
            class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Back to Settings"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Volume2 class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Alert Rules
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Automated alerts for SOS alarms and missed patrols
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
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
                <span class="text-xs font-black text-rose-700 dark:text-rose-300">{{ esc.incident_title || esc.title || '🚨 EMERGENCY SOS' }}</span>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                  Tier {{ esc.current_level || 1 }} of {{ esc.max_level || 3 }}
                </span>
                <span v-if="esc.severity" class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                  {{ esc.severity }}
                </span>
              </div>
              <p class="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                {{ esc.site_name || esc.location || esc.site || 'Patrol Site' }} <span v-if="esc.zone_name">· {{ esc.zone_name }}</span> · Guard: <strong class="font-bold text-rose-900 dark:text-rose-200">{{ esc.guard_name || esc.reported_by || 'On-Duty Guard' }}</strong>
              </p>
              <div class="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold pt-1">
                Next Tier Escalation in ~{{ getMinutesLeft(esc.next_escalation_at || esc.date_created) }} mins (Voice Dispatch + Webhook)
              </div>
              <p v-if="esc.description || esc.notes" class="text-[10px] text-slate-600 dark:text-slate-400 italic pt-0.5">
                {{ esc.description || esc.notes }}
              </p>
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
                  <span class="text-[10px] text-slate-400 font-medium">Trigger: <strong>{{ (policy.trigger_type || 'sos_emergency').replace('_', ' ').toUpperCase() }}</strong> · Scope: {{ policy.site_name || 'All Sites (Global)' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200">
                  Active
                </span>

                <button
                  type="button"
                  @click="openEditPolicyModal(policy)"
                  class="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Edit Policy"
                >
                  <Pencil class="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  @click="deletePolicyAction(policy)"
                  class="h-7 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Delete Policy"
                >
                  <Trash2 class="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <!-- Multi-Tier Levels Visual Chain -->
            <div v-if="getPolicyLevels(policy).length" class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                v-for="lvl in getPolicyLevels(policy)"
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
                <div v-if="lvl.channels?.length" class="flex items-center gap-1.5 flex-wrap pt-1 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                  <span v-for="ch in lvl.channels" :key="ch" class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                    {{ String(ch).replace('_', ' ') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </FeatureGate>

    <!-- Create / Edit Policy Modal -->
    <Teleport to="body">
      <div
        v-if="showPolicyModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showPolicyModal = false"
      >
        <div class="w-full max-w-2xl bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs my-8">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">
                {{ editingPolicy.id ? 'Edit Escalation Policy' : 'Create Escalation Policy' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Define multi-tier notification chains when critical alerts occur</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showPolicyModal = false">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="savePolicySubmit" class="space-y-4">
            <!-- Grid: Name, Trigger, Site -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Policy Name *</label>
                <input
                  v-model="editingPolicy.name"
                  type="text"
                  required
                  placeholder="e.g. Critical SOS Emergency Matrix"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Trigger Event *</label>
                <select
                  v-model="editingPolicy.trigger_type"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="sos_emergency">Guard SOS Panic Trigger</option>
                  <option value="missed_patrol">Missed Patrol / Checkpoint Overdue</option>
                  <option value="geofence_breach">Perimeter Geofence Violation</option>
                  <option value="man_down">Man-Down / Inactivity Alert</option>
                  <option value="checkpoint_tamper">Checkpoint Tamper / QR Scan Failure</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scope / Property Location</label>
                <select
                  v-model="editingPolicy.site_name"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="All Sites (Global)">All Sites (Global)</option>
                  <option v-for="s in sites" :key="s.id" :value="s.name || s.locName">{{ s.name || s.locName }}</option>
                </select>
              </div>
            </div>

            <!-- Escalation Levels (Tiers) -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Escalation Chain Levels
                </label>
                <button
                  type="button"
                  @click="addLevel"
                  class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3 h-3" /> Add Tier Level
                </button>
              </div>

              <div class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <div
                  v-for="(lvl, idx) in editingPolicy.levels"
                  :key="idx"
                  class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 relative"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">
                      Tier Level {{ lvl.level }}
                    </span>
                    <button
                      v-if="editingPolicy.levels.length > 1"
                      type="button"
                      @click="removeLevel(idx)"
                      class="text-rose-500 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                    >
                      Remove Tier
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Delay (Minutes)</label>
                      <input
                        v-model.number="lvl.delay_minutes"
                        type="number"
                        min="0"
                        class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Target Role / Contact</label>
                      <input
                        v-model="lvl.target_role"
                        type="text"
                        placeholder="e.g. On-Duty Shift Supervisor"
                        class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Action Description</label>
                    <input
                      v-model="lvl.action"
                      type="text"
                      placeholder="e.g. Dispatch push notification and SMS alert to shift leader"
                      class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                    />
                  </div>

                  <!-- Channels Selection -->
                  <div class="flex items-center gap-2 flex-wrap pt-1">
                    <label
                      v-for="ch in ['in_app_push', 'sms', 'voice_call', 'email', 'webhook']"
                      :key="ch"
                      class="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800"
                    >
                      <input
                        type="checkbox"
                        :value="ch"
                        v-model="lvl.channels"
                        class="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>{{ ch.replace(/_/g, ' ').toUpperCase() }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
                @click="showPolicyModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                :disabled="isSavingPolicy"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>{{ isSavingPolicy ? 'Saving...' : 'Save Escalation Policy' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Volume2, Plus, ShieldAlert, X, ArrowLeft, Pencil, Trash2 } from 'lucide-vue-next';
import { escalationService } from '@/services/escalationService';
import { siteService } from '@/services/siteService';
import FeatureGate from '@/components/common/FeatureGate.vue';

const router = useRouter();

const policies = ref([]);
const activeEscalations = ref([]);
const sites = ref([]);

const showPolicyModal = ref(false);
const isSavingPolicy = ref(false);
const editingPolicy = ref({
  id: null,
  name: '',
  trigger_type: 'sos_emergency',
  site_name: 'All Sites (Global)',
  levels: [
    {
      level: 1,
      delay_minutes: 0,
      target_role: 'On-Duty Shift Supervisor',
      action: 'Immediate in-app push notification + SMS alert dispatch',
      channels: ['in_app_push', 'sms']
    },
    {
      level: 2,
      delay_minutes: 5,
      target_role: 'Central SOC & Operations Manager',
      action: 'Automated voice dispatch call + email escalation',
      channels: ['in_app_push', 'voice_call', 'email']
    }
  ]
});

const getPolicyLevels = (policy) => {
  let lvls = policy?.levels;
  if (typeof lvls === 'string') {
    try { lvls = JSON.parse(lvls); } catch (e) { lvls = []; }
  }
  return Array.isArray(lvls) ? lvls : [];
};

const loadData = async () => {
  policies.value = await escalationService.fetchPolicies();
  activeEscalations.value = await escalationService.fetchActiveEscalations();
  try {
    sites.value = await siteService.fetchSites();
  } catch (e) {}
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

const openAddPolicyModal = () => {
  editingPolicy.value = {
    id: null,
    name: '',
    trigger_type: 'sos_emergency',
    site_name: 'All Sites (Global)',
    levels: [
      {
        level: 1,
        delay_minutes: 0,
        target_role: 'On-Duty Shift Supervisor',
        action: 'Immediate in-app push notification + SMS alert dispatch',
        channels: ['in_app_push', 'sms']
      },
      {
        level: 2,
        delay_minutes: 5,
        target_role: 'Central SOC & Operations Manager',
        action: 'Automated voice dispatch call + email escalation',
        channels: ['in_app_push', 'voice_call', 'email']
      }
    ]
  };
  showPolicyModal.value = true;
};

const openEditPolicyModal = (policy) => {
  let lvls = getPolicyLevels(policy);
  if (!lvls.length) {
    lvls = [
      {
        level: 1,
        delay_minutes: 0,
        target_role: 'On-Duty Shift Supervisor',
        action: 'Immediate in-app push notification + SMS alert dispatch',
        channels: ['in_app_push', 'sms']
      }
    ];
  }
  editingPolicy.value = {
    id: policy.id,
    name: policy.name || '',
    trigger_type: policy.trigger_type || 'sos_emergency',
    site_name: policy.site_name || 'All Sites (Global)',
    levels: JSON.parse(JSON.stringify(lvls))
  };
  showPolicyModal.value = true;
};

const deletePolicyAction = async (policy) => {
  if (!confirm(`Are you sure you want to delete "${policy.name}"?`)) return;
  try {
    await escalationService.deletePolicy(policy.id);
    await loadData();
  } catch (err) {
    console.error("Failed to delete policy:", err);
  }
};

const addLevel = () => {
  const nextLvl = editingPolicy.value.levels.length + 1;
  const lastDelay = editingPolicy.value.levels[editingPolicy.value.levels.length - 1]?.delay_minutes || 0;
  editingPolicy.value.levels.push({
    level: nextLvl,
    delay_minutes: lastDelay + 5,
    target_role: nextLvl === 3 ? 'Director of Security / VP' : 'Operations Lead',
    action: 'Executive notification & webhook alert dispatch',
    channels: ['in_app_push', 'sms', 'webhook']
  });
};

const removeLevel = (index) => {
  editingPolicy.value.levels.splice(index, 1);
  editingPolicy.value.levels.forEach((l, idx) => {
    l.level = idx + 1;
  });
};

const savePolicySubmit = async () => {
  if (!editingPolicy.value.name.trim()) return;
  isSavingPolicy.value = true;
  try {
    await escalationService.savePolicy(editingPolicy.value);
    showPolicyModal.value = false;
    await loadData();
  } catch (err) {
    console.error("Failed to save policy:", err);
  } finally {
    isSavingPolicy.value = false;
  }
};

let pollTimer = null;
let isPollingEscalations = false;

onMounted(async () => {
  await loadData();
  // Auto-polling every 25 seconds for active escalations
  pollTimer = setInterval(async () => {
    if (isPollingEscalations) return;
    isPollingEscalations = true;
    try {
      activeEscalations.value = await escalationService.fetchActiveEscalations();
    } catch (e) {
    } finally {
      isPollingEscalations = false;
    }
  }, 25000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

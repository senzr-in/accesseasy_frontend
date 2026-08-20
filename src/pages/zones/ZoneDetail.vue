<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans transition-colors duration-300">
    <div class="flex flex-col gap-5 p-4 lg:p-6 min-h-full max-w-[1720px] mx-auto w-full">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <button
            class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            @click="router.push('/dashboard/settings/zones')"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ zoneData.zoneName || zoneData.name }}</h1>
              <span v-if="zoneData.code" class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {{ zoneData.code }}
              </span>
              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                :class="(zoneData.status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'"
              >
                {{ zoneData.status || 'active' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building2 class="w-3.5 h-3.5" />
              <span>Parent Site: <strong>{{ parentSiteName }}</strong></span>
              <span>·</span>
              <span>{{ zoneData.description || 'No description configured' }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            @click="openAddCpModal"
          >
            + Add Checkpoint to Zone
          </button>
        </div>
      </div>

      <!-- Metric Tiles -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Checkpoints</span>
          <p class="text-2xl font-black text-indigo-600 mt-1">{{ zoneCheckpoints.length }} <span class="text-xs text-slate-400 font-normal">registered</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Active Patrols</span>
          <p class="text-2xl font-black text-blue-600 mt-1">{{ activePatrolsCount }} <span class="text-xs text-slate-400 font-normal">active</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Parent Site</span>
          <p class="text-base font-black text-slate-800 dark:text-slate-200 mt-1 truncate">{{ parentSiteName }}</p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Security Tier</span>
          <p class="text-base font-black text-emerald-600 mt-1">{{ zoneData.securityTier || 'Standard Security' }}</p>
        </div>
      </div>

      <!-- Checkpoint List in Zone -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Zone Checkpoints & Inspection Points</h3>
            <p class="text-xs text-slate-500 mt-0.5">Physical QR/NFC scanning stations assigned to this security zone</p>
          </div>
          <button class="text-xs font-bold text-indigo-600 hover:underline cursor-pointer" @click="openAddCpModal">
            + New Checkpoint
          </button>
        </div>

        <div v-if="loading" class="p-12 flex justify-center">
          <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="zoneCheckpoints.length === 0" class="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p class="text-xs text-slate-400">No checkpoints created in this zone yet.</p>
          <button class="mt-2 text-xs font-bold text-indigo-600 hover:underline" @click="openAddCpModal">
            + Add First Checkpoint
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div
            v-for="cp in zoneCheckpoints"
            :key="cp.id || cp.checkpoint_id"
            class="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 hover:border-indigo-200 transition-colors"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <MapPin class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">{{ cp.checkpoint_name || cp.name }}</h4>
                  <span class="text-[10px] font-mono text-slate-400">{{ cp.checkpoint_id || cp.id }}</span>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Radius: {{ cp.allowed_radius_m || 50 }}m
              </span>
            </div>
            <p class="text-[11px] text-slate-500 mb-2">{{ cp.location_description || 'No location notes' }}</p>
            <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] font-semibold text-slate-400">
              <span v-if="cp.requires_nfc" class="text-indigo-600 font-bold">NFC Required</span>
              <span v-else>QR Verification</span>
              <span>·</span>
              <span v-if="cp.requires_photo" class="text-amber-600">Photo Required</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Create Checkpoint Modal -->
    <Teleport to="body">
      <div
        v-if="showCpModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showCpModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Add Checkpoint to {{ zoneData.zoneName || zoneData.name }}</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showCpModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitCreateCheckpoint" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Checkpoint Name *</label>
              <input
                v-model="newCpForm.checkpoint_name"
                required
                placeholder="e.g. North Gate Turnstile CP-01"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Checkpoint ID *</label>
                <input
                  v-model="newCpForm.checkpoint_id"
                  required
                  placeholder="e.g. CP-01"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Allowed Radius (m)</label>
                <input
                  v-model.number="newCpForm.allowed_radius_m"
                  type="number"
                  min="5"
                  max="500"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Location Notes</label>
              <input
                v-model="newCpForm.location_description"
                placeholder="e.g. Mounted on left column next to guard post"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
            <div class="flex items-center gap-4 pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="newCpForm.requires_photo" type="checkbox" class="rounded text-indigo-600" />
                <span class="font-medium text-slate-700 dark:text-slate-300">Require Photo</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="newCpForm.requires_nfc" type="checkbox" class="rounded text-indigo-600" />
                <span class="font-medium text-slate-700 dark:text-slate-300">Require NFC</span>
              </label>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showCpModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Save Checkpoint
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Upgrade Modal -->
    <UpgradeModal
      v-model="showUpgradeModal"
      :trigger-message="upgradeMsg"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Building2, MapPin, X } from 'lucide-vue-next';
import { zoneService } from '@/services/zoneService';
import { siteService } from '@/services/siteService';
import { patrolService } from '@/services/patrolService';
import { subscriptionService } from '@/services/subscriptionService';
import UpgradeModal from '@/components/common/UpgradeModal.vue';

const route = useRoute();
const router = useRouter();

const zoneData = ref({});
const parentSite = ref(null);
const zoneCheckpoints = ref([]);
const activePatrolsCount = ref(0);
const loading = ref(true);

const showCpModal = ref(false);
const showUpgradeModal = ref(false);
const upgradeMsg = ref('');

const newCpForm = ref({
  checkpoint_name: '',
  checkpoint_id: '',
  allowed_radius_m: 50,
  location_description: '',
  requires_photo: false,
  requires_nfc: false
});

const parentSiteName = computed(() => {
  return parentSite.value?.name || (zoneData.value?.site ? `Site ${zoneData.value.site}` : 'Main Property');
});

const openAddCpModal = async () => {
  const check = await subscriptionService.checkLimit('checkpoints');
  if (!check.allowed) {
    upgradeMsg.value = check.upgradeMessage;
    showUpgradeModal.value = true;
    return;
  }
  newCpForm.value = {
    checkpoint_name: '',
    checkpoint_id: `CP-${(zoneCheckpoints.value.length + 1).toString().padStart(2, '0')}`,
    allowed_radius_m: 50,
    location_description: '',
    requires_photo: false,
    requires_nfc: false
  };
  showCpModal.value = true;
};

const submitCreateCheckpoint = async () => {
  try {
    await patrolService.saveMasterCheckpoint({
      ...newCpForm.value,
      name: newCpForm.value.checkpoint_name,
      zone: zoneData.value.id,
      site: zoneData.value.site || parentSite.value?.id
    });
    showCpModal.value = false;
    await loadZoneDetails();
  } catch (error) {
    if (error.code === 'PLAN_LIMIT_EXCEEDED') {
      showCpModal.value = false;
      upgradeMsg.value = error.message;
      showUpgradeModal.value = true;
    } else {
      alert(error.message || "Failed to create checkpoint.");
    }
  }
};

const loadZoneDetails = async () => {
  loading.value = true;
  try {
    const zoneId = route.params.id;
    const allZones = await zoneService.fetchZones();
    zoneData.value = allZones.find(z => String(z.id) === String(zoneId)) || allZones[0] || {};

    if (zoneData.value.site) {
      parentSite.value = await siteService.getSiteById(zoneData.value.site);
    }

    zoneCheckpoints.value = await patrolService.getCheckpointsByZone(zoneData.value.id || zoneId);
    
    const patrols = await patrolService.getPatrols();
    activePatrolsCount.value = patrols.filter(p => String(p.zone) === String(zoneId) && p.status === 'active').length;
  } catch (e) {
    console.error("Error loading zone details:", e);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadZoneDetails();
});
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans transition-colors duration-300">
    <div class="flex flex-col gap-5 p-4 lg:p-6 min-h-full max-w-[1720px] mx-auto w-full">
      
      <!-- Top Navigation & Site Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <button
            class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            @click="router.push('/dashboard/sites')"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ siteData.name }}</h1>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {{ siteData.code }}
              </span>
              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                :class="siteData.healthStatus === 'healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
              >
                {{ siteData.healthStatus || 'healthy' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin class="w-3.5 h-3.5" /> {{ siteData.address }} &nbsp;·&nbsp; Geofence: {{ siteData.geofence_radius || 500 }}m
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
            @click="router.push(`/dashboard/sites/${siteData.id}/geofence`)"
          >
            <span>🎯 Geofence</span>
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
            @click="router.push(`/dashboard/patrols/create?siteId=${siteData.id}`)"
          >
            + Create Site Patrol
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            @click="openAddZoneModal"
          >
            + Add Zone
          </button>
        </div>
      </div>

      <!-- Quick Metric Tiles -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Guards Deployed</span>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ siteData.activeGuards || 0 }} <span class="text-xs text-slate-400 font-normal">/ {{ siteData.totalGuards || 0 }} on roster</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Active Patrols</span>
          <p class="text-2xl font-black text-blue-600 mt-1">{{ siteData.activePatrols || 0 }} <span class="text-xs text-slate-400 font-normal">in progress</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Site Compliance</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ siteData.completionRate || 100 }}% <span class="text-xs text-emerald-500 font-bold">today</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Property Zones</span>
          <p class="text-2xl font-black text-indigo-600 mt-1">{{ siteZones.length }} <span class="text-xs text-slate-400 font-normal">configured</span></p>
        </div>
      </div>

      <!-- Main Layout: Zones List + Live Site Map -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Left: Linked Property Zones (6 Cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Property Zones & Checkpoints</h3>
            <span class="text-xs font-bold text-slate-500">
              {{ siteZones.length }} Zones in Site
            </span>
          </div>

          <div v-if="siteZones.length === 0" class="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p class="text-xs text-slate-400">No zones added to this site yet.</p>
            <button class="mt-2 text-xs font-bold text-indigo-600 hover:underline" @click="openAddZoneModal">
              + Add First Zone
            </button>
          </div>

          <div v-else class="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[420px]">
            <div
              v-for="zone in siteZones"
              :key="zone.id || zone.name"
              class="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between hover:border-indigo-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-black text-xs flex items-center justify-center">
                  <MapPin class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">{{ zone.name || zone.zoneName }}</h4>
                  <p class="text-[10px] text-slate-500">
                    <span v-if="zone.code" class="font-mono text-slate-400 mr-1.5">{{ zone.code }}</span>
                    {{ zone.description || 'No description' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  :class="zone.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'"
                >
                  {{ zone.status || 'active' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Geo Boundary & Guard Tracking Map (6 Cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3 min-h-[380px]">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Site Perimeter & Geofence</h3>
            <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {{ siteData.activeGuards || 0 }} Online
            </span>
          </div>

          <div ref="siteMapRef" class="flex-1 w-full rounded-xl bg-slate-100 dark:bg-slate-800 min-h-[300px]"></div>
        </div>

      </div>

      <!-- Pro / Custom Site Restrictions (Site Access) Section -->
      <FeatureGate feature="enterprise.custom_roles" show-locked-badge locked-label="Site & Zone Restrictions — Pro Feature">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Site Personnel Restrictions & Access Control</h3>
              <p class="text-xs text-slate-500 mt-0.5">Restrict guard and supervisor visibility exclusively to this estate</p>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div class="text-xs text-slate-600 dark:text-slate-300">
              <span class="font-bold">Role-Based Site Boundary Active.</span> Guards assigned to this site cannot scan checkpoints outside this perimeter.
            </div>
            <span class="text-xs font-bold text-indigo-600">Active</span>
          </div>
        </div>
      </FeatureGate>

    </div>

    <!-- Create Zone Modal for this Site -->
    <Teleport to="body">
      <div
        v-if="showZoneModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showZoneModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Add Zone to {{ siteData.name }}</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showZoneModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitCreateZone" class="space-y-4 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Zone Name *</label>
              <input
                v-model="newZoneForm.name"
                required
                placeholder="e.g. North Gate & Logistics Hub"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Zone Code *</label>
              <input
                v-model="newZoneForm.code"
                required
                placeholder="e.g. ZN-LOG-01"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                v-model="newZoneForm.description"
                rows="2"
                placeholder="Specific perimeter description or patrol focus"
                class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm resize-none"
              ></textarea>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showZoneModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Save Zone
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Upgrade Modal -->
    <UpgradeModal
      v-model="showUpgradeModal"
      :trigger-message="upgradeTriggerMsg"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Building2, MapPin, X } from 'lucide-vue-next';
import { siteService } from '@/services/siteService';
import { zoneService } from '@/services/zoneService';
import { subscriptionService } from '@/services/subscriptionService';
import FeatureGate from '@/components/common/FeatureGate.vue';
import UpgradeModal from '@/components/common/UpgradeModal.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const router = useRouter();
const siteData = ref({});
const siteZones = ref([]);
const siteMapRef = ref(null);

const showZoneModal = ref(false);
const showUpgradeModal = ref(false);
const upgradeTriggerMsg = ref('');

const newZoneForm = ref({
  name: '',
  code: '',
  description: '',
  status: 'active'
});

const openAddZoneModal = async () => {
  const check = await subscriptionService.checkLimit('zones');
  if (!check.allowed) {
    upgradeTriggerMsg.value = check.upgradeMessage;
    showUpgradeModal.value = true;
    return;
  }
  newZoneForm.value = {
    name: '',
    code: '',
    description: '',
    status: 'active'
  };
  showZoneModal.value = true;
};

const submitCreateZone = async () => {
  try {
    await zoneService.createZone({
      ...newZoneForm.value,
      site: siteData.value.id
    });
    showZoneModal.value = false;
    siteZones.value = await zoneService.fetchZonesBySite(siteData.value.id);
  } catch (error) {
    if (error.code === 'PLAN_LIMIT_EXCEEDED') {
      showZoneModal.value = false;
      upgradeTriggerMsg.value = error.message;
      showUpgradeModal.value = true;
    } else {
      alert(error.message || "Failed to create zone.");
    }
  }
};

onMounted(async () => {
  const siteId = route.params.id || 'site-01';
  siteData.value = await siteService.getSiteById(siteId);
  siteZones.value = await zoneService.fetchZonesBySite(siteId);

  await nextTick();
  if (siteMapRef.value) {
    try {
      const lat = Number(siteData.value.latitude) || 12.9716;
      const lng = Number(siteData.value.longitude) || 80.2435;
      const radius = Number(siteData.value.geofence_radius) || 500;

      const map = L.map(siteMapRef.value, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc'
      }).addTo(map);

      // Add Geofence circle
      L.circle([lat, lng], {
        radius: radius,
        color: '#4f46e5',
        fillColor: '#4f46e5',
        fillOpacity: 0.15,
        weight: 2
      }).addTo(map);

      // Add Center Marker
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${siteData.value.name || 'Site Center'}</b><br>Property Center`);
    } catch (e) {
      console.error('Site map load error', e);
    }
  }
});
</script>

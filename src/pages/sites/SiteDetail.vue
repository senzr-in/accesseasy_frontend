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
                {{ siteData.healthStatus }}
              </span>
            </div>
            <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin class="w-3.5 h-3.5" /> {{ siteData.address }} &nbsp;·&nbsp; Geofence: {{ siteData.geofence_radius }}m
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
            @click="router.push(`/dashboard/patrols/create?siteId=${siteData.id}`)"
          >
            + Create Site Patrol
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            @click="router.push('/dashboard/settings/zones')"
          >
            Manage Zones ({{ siteData.zonesCount }})
          </button>
        </div>
      </div>

      <!-- 4 Quick Metric Tiles -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Guards Deployed</span>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ siteData.activeGuards }} <span class="text-xs text-slate-400 font-normal">/ {{ siteData.totalGuards }} on roster</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Active Patrols</span>
          <p class="text-2xl font-black text-blue-600 mt-1">{{ siteData.activePatrols }} <span class="text-xs text-slate-400 font-normal">in progress</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Site Compliance</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ siteData.completionRate }}% <span class="text-xs text-emerald-500 font-bold">today</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Total Checkpoints</span>
          <p class="text-2xl font-black text-indigo-600 mt-1">{{ siteData.checkpointsCount }} <span class="text-xs text-slate-400 font-normal">across {{ siteData.zonesCount }} zones</span></p>
        </div>
      </div>

      <!-- Main Layout: Zones & Checkpoints + Live Site Map -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Left: Linked Zones & Checkpoint Ticker (6 Cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Property Zones & Sectors</h3>
            <button class="text-xs font-bold text-indigo-600 hover:underline cursor-pointer" @click="router.push('/dashboard/settings/zones')">
              + Add Zone
            </button>
          </div>

          <div class="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            <div
              v-for="zone in mockSiteZones"
              :key="zone.name"
              class="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-black text-xs flex items-center justify-center">
                  <MapPin class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">{{ zone.name }}</h4>
                  <p class="text-[10px] text-slate-500">{{ zone.checkpoints }} Checkpoints · {{ zone.securityTier }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {{ zone.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Geo Boundary & Guard Tracking Map (6 Cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3 min-h-[380px]">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Site Perimeter & Guard Radar</h3>
            <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {{ siteData.activeGuards }} Online
            </span>
          </div>

          <div ref="siteMapRef" class="flex-1 w-full rounded-xl bg-slate-100 dark:bg-slate-800 min-h-[300px]"></div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Building2, MapPin } from 'lucide-vue-next';
import { siteService } from '@/services/siteService';
import { Loader } from '@googlemaps/js-api-loader';

const route = useRoute();
const router = useRouter();
const siteData = ref({});
const siteMapRef = ref(null);

const mockSiteZones = [
  { name: 'Perimeter Boundary & Main Gate', checkpoints: 8, securityTier: 'Tier 1 Critical', status: 'Covered' },
  { name: 'Basement Parking & Logistics Bay', checkpoints: 6, securityTier: 'Tier 2 High', status: 'Covered' },
  { name: 'Tower A Core & Server Rooms', checkpoints: 10, securityTier: 'Tier 1 Critical', status: 'Covered' },
  { name: 'Rooftop & Emergency Fire Exits', checkpoints: 4, securityTier: 'Tier 3 Standard', status: 'Scheduled' },
];

onMounted(async () => {
  const siteId = route.params.id || 'site-01';
  siteData.value = await siteService.getSiteById(siteId);

  await nextTick();
  const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
  const loader = new Loader({ apiKey, version: 'weekly' });
  try {
    await loader.load();
    if (siteMapRef.value) {
      const lat = siteData.value.latitude || 12.9716;
      const lng = siteData.value.longitude || 80.2435;
      const map = new google.maps.Map(siteMapRef.value, {
        center: { lat, lng },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Add Geofence circle
      new google.maps.Circle({
        strokeColor: '#4f46e5',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4f46e5',
        fillOpacity: 0.15,
        map,
        center: { lat, lng },
        radius: siteData.value.geofence_radius || 500,
      });

      // Add Center Marker
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: siteData.value.name,
      });
    }
  } catch (e) {
    console.error('Site map load error', e);
  }
});
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans transition-colors duration-300">
    <div class="flex flex-col gap-5 p-4 lg:p-6 min-h-full max-w-[1720px] mx-auto w-full">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">Sites & Properties Hub</h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Manage multi-site security estates, geographical boundaries, and property checkpoints
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Plan Capacity Indicator -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span class="w-2 h-2 rounded-full" :class="siteLimitInfo.allowed ? 'bg-emerald-500' : 'bg-rose-500'" />
            <span>Sites: <strong>{{ sites.length }}</strong> / {{ siteLimitInfo.max === Infinity ? '∞' : siteLimitInfo.max }}</span>
          </div>

          <button
            class="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            @click="openCreateModal"
          >
            <Plus class="w-4 h-4" />
            <span>Add New Site</span>
          </button>
        </div>
      </div>

      <!-- Plan Limit Warning Banner (if limit reached or approaching) -->
      <PlanLimitBanner
        v-if="!siteLimitInfo.allowed"
        :message="siteLimitInfo.upgradeMessage"
        :current-count="sites.length"
        :max-count="siteLimitInfo.max"
        severity="error"
        upgrade-label="Upgrade to Pro"
        @upgrade="showUpgradeModal = true"
      />

      <!-- Sites Grid View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="site in sites"
          :key="site.id"
          class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          @click="router.push(`/dashboard/sites/${site.id}`)"
        >
          <!-- Top Site Badge & Status -->
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-100 dark:border-indigo-500/20">
                  <Building2 class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{{ site.name }}</h3>
                  <span class="text-[10px] font-mono font-semibold text-slate-400">{{ site.code || ('SITE-' + (site.id || '01')) }}</span>
                </div>
              </div>

              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                :class="(site.healthStatus || 'healthy') === 'healthy' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200' 
                  : site.healthStatus === 'warning'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="(site.healthStatus || 'healthy') === 'healthy' ? 'bg-emerald-500' : site.healthStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'" />
                {{ site.healthStatus || 'healthy' }}
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-4">
              <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ site.address || 'No address specified' }}</span>
            </p>

            <!-- Metrics Strip -->
            <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center mb-4">
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Guards</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ site.activeGuards ?? 0 }} / {{ site.totalGuards ?? 0 }}</span>
              </div>
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Zones</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ site.zonesCount ?? 0 }}</span>
              </div>
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Checkpoints</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ site.checkpointsCount ?? 0 }}</span>
              </div>
            </div>

            <!-- Compliance Progress -->
            <div class="space-y-1.5 mb-2">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-slate-600 dark:text-slate-400">Patrol Compliance</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-mono">{{ site.completionRate ?? 100 }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="(site.completionRate ?? 100) >= 95 ? 'bg-emerald-500' : (site.completionRate ?? 100) >= 85 ? 'bg-amber-500' : 'bg-rose-500'"
                  :style="{ width: `${site.completionRate ?? 100}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Action Row -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span class="text-[11px] font-semibold text-slate-400">
              Radius: {{ site.geofence_radius || 500 }}m
            </span>
            <span class="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open Site Command →
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- 1. CREATE SITE MODAL (CLEAN & NON-CLUTTERED)                -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="showCreateSiteModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showCreateSiteModal = false"
      >
        <div class="w-full max-w-lg bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 my-6">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Security Site</h3>
                <p class="text-[11px] text-slate-500">Configure new property location & guard patrol sector</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showCreateSiteModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitCreateSite" class="space-y-4 text-xs">
            
            <!-- Site Name -->
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Property / Site Name *</label>
              <input
                v-model="newSiteForm.name"
                required
                placeholder="e.g. Bangalore Global Tech Campus"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <!-- Site Code & Address -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site Code *</label>
                <input
                  v-model="newSiteForm.code"
                  required
                  placeholder="e.g. BGTC-01"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div class="sm:col-span-2 space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Physical Address / Landmark</label>
                <input
                  v-model="newSiteForm.address"
                  placeholder="e.g. OMR IT Highway, Chennai"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <!-- Coordinates Section with Clean "Pick on Map" Button -->
            <div class="space-y-2 pt-1 pb-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-indigo-600" />
                  <span>Site Coordinates</span>
                </span>
                
                <!-- Action button: Only opens the map when clicked -->
                <button
                  type="button"
                  class="h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-indigo-200 dark:border-indigo-500/30 cursor-pointer shadow-sm"
                  @click="openMapPickerModal"
                >
                  <MapIcon class="w-3.5 h-3.5" />
                  <span>Pick Location on Map</span>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Latitude</label>
                  <input
                    v-model.number="newSiteForm.latitude"
                    type="number"
                    step="any"
                    required
                    placeholder="12.9716"
                    class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Longitude</label>
                  <input
                    v-model.number="newSiteForm.longitude"
                    type="number"
                    step="any"
                    required
                    placeholder="80.2435"
                    class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Advanced Settings Accordion (Geofence, Security Rules) -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                type="button"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                @click="showAdvancedSettings = !showAdvancedSettings"
              >
                <div class="flex items-center gap-2">
                  <SlidersHorizontal class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Advanced Settings (Geofence Radius & Security)</span>
                </div>
                <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': showAdvancedSettings }" />
              </button>

              <div v-if="showAdvancedSettings" class="p-4 space-y-3 bg-white dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-700 dark:text-slate-300">Geofence Radius (Meters)</label>
                    <input
                      v-model.number="newSiteForm.geofence_radius"
                      type="number"
                      min="50"
                      max="10000"
                      placeholder="500"
                      class="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                    />
                    <p class="text-[10px] text-slate-400">Allowed patrol scan boundary around property</p>
                  </div>
                  
                  <div class="space-y-1">
                    <label class="font-bold text-slate-700 dark:text-slate-300">Emergency Phone</label>
                    <input
                      v-model="newSiteForm.emergency_phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      class="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                    />
                    <p class="text-[10px] text-slate-400">Direct line for SOS alert escalations</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showCreateSiteModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Building2 class="w-3.5 h-3.5" />
                <span>Save Site</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- 2. DEDICATED MAP LOCATION PICKER MODAL                      -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="showMapPickerModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4"
        @click.self="showMapPickerModal = false"
      >
        <div class="w-full max-w-3xl bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          
          <!-- Map Picker Header -->
          <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <MapPin class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Select Property Location</h3>
                <p class="text-[11px] text-slate-500">Search any location or click on map to set property pin</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showMapPickerModal = false">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Location Search Input -->
          <div class="flex items-center gap-2 mb-2 shrink-0">
            <div class="relative flex-1">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="locationSearchQuery"
                type="text"
                placeholder="Search city, area, landmark, or street address (e.g. Whitefield, Bengaluru)..."
                @keydown.enter.prevent="searchLocation"
                class="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-indigo-500 shadow-inner"
              />
              <button
                v-if="locationSearchQuery"
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                @click="locationSearchQuery = ''"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              :disabled="isSearchingLocation"
              class="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              @click="searchLocation"
            >
              <Search class="w-3.5 h-3.5" />
              <span>{{ isSearchingLocation ? 'Searching...' : 'Find Place' }}</span>
            </button>
          </div>

          <!-- Fast Quick-Select Location Chips -->
          <div class="flex items-center gap-1.5 flex-wrap pb-2 shrink-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Quick Jump:</span>
            <button
              v-for="city in popularHubs"
              :key="city.name"
              type="button"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              @click="jumpToLocation(city.lat, city.lng, city.name)"
            >
              📍 {{ city.name }}
            </button>
          </div>

          <!-- Leaflet Interactive Map Canvas (100% Reliable, Never Blank) -->
          <div class="relative w-full flex-1 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800" style="min-height: 320px;">
            <div id="leaflet-site-picker-map" class="w-full h-full" style="min-height: 320px;"></div>
            
            <!-- Floating Coordinates & Instructions Pill -->
            <div class="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md pointer-events-none flex items-center gap-2 z-[999]">
              <span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span><strong>Lat:</strong> {{ tempCoords.lat.toFixed(4) }} · <strong>Lng:</strong> {{ tempCoords.lng.toFixed(4) }}</span>
            </div>
          </div>

          <!-- Map Picker Footer Actions -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div class="text-xs text-slate-500 truncate max-w-sm">
              <span v-if="tempAddress" class="truncate block">📍 {{ tempAddress }}</span>
              <span v-else class="text-slate-400">Click on map or drag pin to adjust</span>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showMapPickerModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                @click="confirmLocationSelection"
              >
                <Check class="w-3.5 h-3.5" />
                <span>Confirm Location</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- Upgrade Modal -->
    <UpgradeModal
      v-model="showUpgradeModal"
      :trigger-message="siteLimitInfo.upgradeMessage"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Building2, Plus, MapPin, X, Search, Map as MapIcon, 
  ChevronDown, SlidersHorizontal, Check 
} from 'lucide-vue-next';
import { siteService } from '@/services/siteService';
import { zoneService } from '@/services/zoneService';
import { patrolService } from '@/services/patrolService';
import { attendanceService } from '@/services/attendanceService';
import { subscriptionService } from '@/services/subscriptionService';
import { usePlanGuard } from '@/composables/usePlanGuard';
import PlanLimitBanner from '@/components/common/PlanLimitBanner.vue';
import UpgradeModal from '@/components/common/UpgradeModal.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();
const { isNormal, isPro, currentPlan } = usePlanGuard();
const sites = ref([]);
const showCreateSiteModal = ref(false);
const showMapPickerModal = ref(false);
const showAdvancedSettings = ref(false);
const showUpgradeModal = ref(false);
const siteLimitInfo = ref({ allowed: true, current: 0, max: 1, upgradeMessage: '' });
const locationSearchQuery = ref('');
const isSearchingLocation = ref(false);

const popularHubs = [
  { name: 'Chennai Tech Park', lat: 12.9716, lng: 80.2435 },
  { name: 'Bangalore Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Hyderabad Hitec City', lat: 17.4435, lng: 78.3772 },
  { name: 'Mumbai BKC', lat: 19.0657, lng: 72.8687 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 }
];

const newSiteForm = ref({
  name: '',
  code: '',
  address: '',
  geofence_radius: 500,
  emergency_phone: '',
  latitude: 12.9716,
  longitude: 80.2435
});

const resetSiteForm = () => {
  newSiteForm.value = {
    name: '',
    code: '',
    address: '',
    latitude: 12.9716,
    longitude: 80.2435,
    geofence_radius: 500,
    emergency_phone: '',
    status: 'active'
  };
};

// Temporary coordinates for map picker modal
const tempCoords = ref({ lat: 12.9716, lng: 80.2435 });
const tempAddress = ref('');

// Leaflet Map Picker Instance
let leafletMap = null;
let leafletMarker = null;
let leafletCircle = null;

const openCreateModal = async () => {
  const check = await subscriptionService.checkLimit('sites');
  siteLimitInfo.value = check;
  if (!check.allowed) {
    showUpgradeModal.value = true;
    return;
  }
  resetSiteForm();
  showCreateSiteModal.value = true;
};

const openMapPickerModal = async () => {
  tempCoords.value = {
    lat: Number(newSiteForm.value.latitude) || 12.9716,
    lng: Number(newSiteForm.value.longitude) || 80.2435
  };
  tempAddress.value = newSiteForm.value.address || '';
  locationSearchQuery.value = '';
  showMapPickerModal.value = true;

  await nextTick();
  setTimeout(() => {
    initLeafletMap();
  }, 100);
};

const initLeafletMap = () => {
  const container = document.getElementById('leaflet-site-picker-map');
  if (!container) return;

  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  const initialLat = tempCoords.value.lat;
  const initialLng = tempCoords.value.lng;

  leafletMap = L.map('leaflet-site-picker-map', {
    center: [initialLat, initialLng],
    zoom: 15,
    zoomControl: true
  });

  // OpenStreetMap standard tile layer (100% reliable, zero blank screens)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletMap);

  // Custom Icon for Site Pin
  const pinIcon = L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="position:relative; transform: translate(-50%, -100%);">
        <div style="background-color: #4f46e5; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); border: 2.5px solid #ffffff;">
          <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [0, 0]
  });

  // Marker
  leafletMarker = L.marker([initialLat, initialLng], {
    icon: pinIcon,
    draggable: true
  }).addTo(leafletMap);

  // Geofence Radius Circle
  const radius = Number(newSiteForm.value.geofence_radius) || 500;
  leafletCircle = L.circle([initialLat, initialLng], {
    radius: radius,
    color: '#4f46e5',
    fillColor: '#4f46e5',
    fillOpacity: 0.15,
    weight: 2
  }).addTo(leafletMap);

  // Marker Drag Listener
  leafletMarker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    updateTempLocation(pos.lat, pos.lng);
  });

  // Map Click Listener
  leafletMap.on('click', (e) => {
    updateTempLocation(e.latlng.lat, e.latlng.lng);
  });

  leafletMap.invalidateSize();
};

const updateTempLocation = (lat, lng) => {
  const cleanLat = parseFloat(lat.toFixed(6));
  const cleanLng = parseFloat(lng.toFixed(6));
  tempCoords.value = { lat: cleanLat, lng: cleanLng };

  if (leafletMarker) {
    leafletMarker.setLatLng([cleanLat, cleanLng]);
  }
  if (leafletCircle) {
    leafletCircle.setLatLng([cleanLat, cleanLng]);
  }

  // Reverse geocode with OpenStreetMap Nominatim
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLng}&zoom=18&addressdetails=1`, {
    headers: { 'Accept-Language': 'en' }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.display_name) {
        tempAddress.value = data.display_name;
      }
    })
    .catch(() => {});
};

const searchLocation = async () => {
  if (!locationSearchQuery.value.trim()) return;
  isSearchingLocation.value = true;

  try {
    const q = encodeURIComponent(locationSearchQuery.value.trim());
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    isSearchingLocation.value = false;

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(parseFloat(result.lat).toFixed(6));
      const lng = parseFloat(parseFloat(result.lon).toFixed(6));

      tempCoords.value = { lat, lng };
      tempAddress.value = result.display_name;

      if (leafletMap && leafletMarker && leafletCircle) {
        leafletMarker.setLatLng([lat, lng]);
        leafletCircle.setLatLng([lat, lng]);
        leafletMap.setView([lat, lng], 16);
      }
    } else {
      alert(`Location "${locationSearchQuery.value}" not found. Try searching with city name.`);
    }
  } catch (e) {
    isSearchingLocation.value = false;
    console.error('Search failed', e);
  }
};

const jumpToLocation = (lat, lng, cityName) => {
  tempCoords.value = { lat, lng };
  tempAddress.value = cityName;
  if (leafletMap && leafletMarker && leafletCircle) {
    leafletMarker.setLatLng([lat, lng]);
    leafletCircle.setLatLng([lat, lng]);
    leafletMap.setView([lat, lng], 15);
  }
};

const confirmLocationSelection = () => {
  newSiteForm.value.latitude = tempCoords.value.lat;
  newSiteForm.value.longitude = tempCoords.value.lng;
  if (tempAddress.value && (!newSiteForm.value.address || newSiteForm.value.address.length < 5)) {
    newSiteForm.value.address = tempAddress.value;
  }
  showMapPickerModal.value = false;
};

const loadSites = async () => {
  subscriptionService.clearCache();
  const rawSites = await siteService.fetchSites();
  siteLimitInfo.value = await subscriptionService.checkLimit('sites');

  try {
    const [zonesRes, masterCpRes, generalCpRes, patrolsRes, attendanceRes] = await Promise.allSettled([
      zoneService.fetchZones(null, null, true),
      patrolService.getMasterCheckpoints(),
      patrolService.getCheckpoints(),
      patrolService.getPatrols(),
      attendanceService.getTodayAttendance()
    ]);

    const allZones = zonesRes.status === 'fulfilled' && Array.isArray(zonesRes.value) ? zonesRes.value : [];
    const allMasterCp = masterCpRes.status === 'fulfilled' && Array.isArray(masterCpRes.value) ? masterCpRes.value : [];
    const allGeneralCp = generalCpRes.status === 'fulfilled' && Array.isArray(generalCpRes.value) ? generalCpRes.value : [];
    const allPatrols = patrolsRes.status === 'fulfilled' && Array.isArray(patrolsRes.value) ? patrolsRes.value : [];
    const allAttendance = attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value) ? attendanceRes.value : [];

    // Distinct master checkpoints (deduplicate by checkpoint_id or name to avoid counting route duplicate copies)
    const masterCpMap = new Map();
    const sourceCpList = allMasterCp.length > 0 ? allMasterCp : allGeneralCp.filter(c => !c.group_id);
    const fallbackList = sourceCpList.length > 0 ? sourceCpList : allGeneralCp;

    fallbackList.forEach(cp => {
      if (cp) {
        const key = String(cp.checkpoint_id || cp.name || cp.id).trim().toLowerCase();
        if (key && !masterCpMap.has(key)) {
          let parsedZone = cp.zone;
          if (!parsedZone && cp.instructions) {
            const match = cp.instructions.match(/__ZONE_ASSIGNMENT__:(\d+)/);
            if (match) parsedZone = Number(match[1]);
          }
          masterCpMap.set(key, { ...cp, zone: parsedZone });
        }
      }
    });
    const uniqueMasterCheckpoints = Array.from(masterCpMap.values());

    const isSingleSite = rawSites.length === 1;

    sites.value = rawSites.map(site => {
      const siteIdStr = String(site.id || '');

      // 1. Match zones for this site (or all tenant zones if single site)
      const siteZones = allZones.filter(z => {
        const zSiteId = String(z.site?.id || z.site || z.siteId || z.locationManagement || z.location || '');
        if (zSiteId && zSiteId === siteIdStr) return true;
        if (isSingleSite) return true;
        const zSiteName = String(z.siteName || z.site_name || z.locationName || '').toLowerCase();
        if (zSiteName && site.name && zSiteName.includes(site.name.toLowerCase())) return true;
        if (!zSiteId && rawSites[0]?.id === site.id) return true;
        return false;
      });

      const zoneIdsForSite = new Set(siteZones.map(z => String(z.id)));

      // 2. Match unique checkpoints for this site
      const siteCheckpoints = uniqueMasterCheckpoints.filter(cp => {
        const cpSiteId = String(cp.site?.id || cp.site || cp.siteId || cp.location || '');
        if (cpSiteId && cpSiteId === siteIdStr) return true;
        const cpZoneId = String(typeof cp.zone === 'object' && cp.zone ? cp.zone.id : cp.zone || '');
        if (cpZoneId && zoneIdsForSite.has(cpZoneId)) return true;
        if (isSingleSite) return true;
        if (!cpSiteId && !cpZoneId && rawSites[0]?.id === site.id) return true;
        return false;
      });

      // 3. Match patrols for this site
      const sitePatrols = allPatrols.filter(p => {
        const pSiteId = String(p.site?.id || p.site || p.zoneId || p.siteId || '');
        if (pSiteId && (pSiteId === siteIdStr || zoneIdsForSite.has(pSiteId))) return true;
        if (isSingleSite) return true;
        return false;
      });

      // 4. Extract DISTINCT Guards (both total roster and currently on-duty)
      const totalGuardsSet = new Set();
      const activeGuardsSet = new Set();

      // From Attendance logs:
      const siteAttendance = allAttendance.filter(r => {
        const rSiteId = String(r.site?.id || r.site || r.siteId || '');
        if (rSiteId && rSiteId === siteIdStr) return true;
        if (isSingleSite) return true;
        const rSiteName = String(r.site_name || '').toLowerCase();
        if (rSiteName && site.name && rSiteName.includes(site.name.toLowerCase())) return true;
        return false;
      });

      siteAttendance.forEach(r => {
        const guardKey = String(
          r.guard?.assignedUser?.id || 
          r.guard?.id || 
          r.guard_name || 
          (typeof r.guard === 'string' && r.guard) || 
          ''
        ).trim().toLowerCase();

        if (guardKey && !['security guard', 'guard', 'unknown'].includes(guardKey)) {
          totalGuardsSet.add(guardKey);
          const st = String(r.status || r.live_status || '').toLowerCase();
          const isOnDuty = st === 'present' || st === 'on_duty' || st === 'checked_in' || (!r.check_out_time && r.check_in_time);
          if (isOnDuty) {
            activeGuardsSet.add(guardKey);
          }
        }
      });

      // From Patrol assignments:
      sitePatrols.forEach(p => {
        const gName = String(
          p.guard_name || 
          p.guardName || 
          p.assigned_guard || 
          p.assignedGuard || 
          (typeof p.guard === 'string' ? p.guard : p.guard?.name) || 
          ''
        ).trim().toLowerCase();

        if (gName && !['unassigned', 'security guard', 'guard', ''].includes(gName)) {
          totalGuardsSet.add(gName);
          const st = String(p.status || '').toLowerCase();
          if (['active', 'in_progress', 'ongoing', 'started'].includes(st)) {
            activeGuardsSet.add(gName);
          }
        }
      });

      // If site has registered user IDs in empIds:
      if (Array.isArray(site.empIds)) {
        site.empIds.forEach(id => {
          if (id) totalGuardsSet.add(String(id).toLowerCase());
        });
      }

      const activeGuards = activeGuardsSet.size;
      const totalGuards = Math.max(totalGuardsSet.size, activeGuards);

      // 5. Patrol Compliance calculation
      const completedPatrols = sitePatrols.filter(p => String(p.status || '').toLowerCase() === 'completed');
      const completionRate = sitePatrols.length > 0 
        ? Math.round((completedPatrols.length / sitePatrols.length) * 100) 
        : 100;

      const healthStatus = site.healthStatus || (completionRate < 70 ? 'warning' : 'healthy');
      const code = site.code || site.locCode || (site.name ? site.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() + '-' + String(site.id).slice(-2) : `STE-${site.id}`);

      return {
        ...site,
        code,
        healthStatus,
        activeGuards,
        totalGuards,
        zonesCount: siteZones.length,
        checkpointsCount: siteCheckpoints.length,
        completionRate
      };
    });
  } catch (err) {
    console.error('Error enriching sites data:', err);
    sites.value = rawSites.map(site => ({
      ...site,
      code: site.code || site.locCode || `STE-${site.id}`,
      healthStatus: site.healthStatus || 'healthy',
      activeGuards: site.activeGuards || 0,
      totalGuards: site.totalGuards || 0,
      zonesCount: site.zonesCount || 0,
      checkpointsCount: site.checkpointsCount || 0,
      completionRate: site.completionRate ?? 100
    }));
  }
};

const submitCreateSite = async () => {
  try {
    await siteService.createSite(newSiteForm.value);
    showCreateSiteModal.value = false;
    await loadSites();
  } catch (error) {
    if (error.code === 'PLAN_LIMIT_EXCEEDED') {
      showCreateSiteModal.value = false;
      showUpgradeModal.value = true;
    } else {
      alert(error.message || "Failed to create site.");
    }
  }
};

onMounted(async () => {
  await loadSites();
});
</script>

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
          <button
            class="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            @click="openCreateModal"
          >
            <Plus class="w-4 h-4" />
            <span>Add New Site</span>
          </button>
        </div>
      </div>

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
                  <span class="text-[10px] font-mono font-semibold text-slate-400">{{ site.code }}</span>
                </div>
              </div>

              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                :class="site.healthStatus === 'healthy' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200' 
                  : site.healthStatus === 'warning'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="site.healthStatus === 'healthy' ? 'bg-emerald-500' : site.healthStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'" />
                {{ site.healthStatus }}
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-4">
              <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ site.address }}</span>
            </p>

            <!-- Metrics Strip -->
            <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center mb-4">
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Guards</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ site.activeGuards }} / {{ site.totalGuards }}</span>
              </div>
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Zones</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ site.zonesCount }}</span>
              </div>
              <div>
                <span class="text-[10px] font-semibold text-slate-400 block uppercase">Checkpoints</span>
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">{{ site.checkpointsCount }}</span>
              </div>
            </div>

            <!-- Compliance Progress -->
            <div class="space-y-1.5 mb-2">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-slate-600 dark:text-slate-400">Patrol Compliance</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-mono">{{ site.completionRate }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="site.completionRate >= 95 ? 'bg-emerald-500' : site.completionRate >= 85 ? 'bg-amber-500' : 'bg-rose-500'"
                  :style="{ width: `${site.completionRate}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Action Row -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span class="text-[11px] font-semibold text-slate-400">
              Radius: {{ site.geofence_radius }}m
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();
const sites = ref([]);
const showCreateSiteModal = ref(false);
const showMapPickerModal = ref(false);
const showAdvancedSettings = ref(false);
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

// Temporary coordinates for map picker modal
const tempCoords = ref({ lat: 12.9716, lng: 80.2435 });
const tempAddress = ref('');

// Leaflet Map Picker Instance
let leafletMap = null;
let leafletMarker = null;
let leafletCircle = null;

const openCreateModal = () => {
  showCreateSiteModal.value = true;
  showAdvancedSettings.value = false;
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
  sites.value = await siteService.fetchSites();
};

const submitCreateSite = async () => {
  await siteService.createSite(newSiteForm.value);
  showCreateSiteModal.value = false;
  await loadSites();
};

onMounted(async () => {
  await loadSites();
});
</script>

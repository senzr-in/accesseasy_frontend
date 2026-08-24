<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="geofence.site" show-locked-badge locked-label="Advanced Geofencing & Violation Engine — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <button
            class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            @click="router.push(`/dashboard/sites/${siteId}`)"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Geofence & Boundary Calibration: {{ siteData.name }}
              </h1>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                {{ siteData.code }}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              4-Tier GPS accuracy evaluation, checkpoint radius rings, and violation thresholds
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            @click="saveGeofenceSettings"
          >
            <Save class="w-3.5 h-3.5" />
            <span>Save Boundary</span>
          </button>
        </div>
      </div>

      <!-- Main Layout: Map (8 cols) + Test Simulator & Settings (4 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Left: Interactive Map with Geofence Rings (8 cols) -->
        <div class="lg:col-span-8 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3 min-h-[480px]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Perimeter & Checkpoint Radar</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                Radius: {{ currentRadius }}m
              </span>
            </div>
            <span class="text-xs text-slate-400">💡 Click map to set test GPS pin</span>
          </div>

          <!-- Leaflet Map Container -->
          <div ref="mapContainer" class="flex-1 w-full rounded-xl bg-slate-100 dark:bg-slate-800 min-h-[400px] z-0"></div>
        </div>

        <!-- Right: Real-time 4-Tier GPS Scan Evaluator (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- Boundary Radius Control Card -->
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Boundary Calibration</h3>
            
            <div>
              <div class="flex items-center justify-between text-xs font-bold mb-1.5">
                <span class="text-slate-600 dark:text-slate-300">Site Geofence Radius</span>
                <span class="font-mono text-indigo-600">{{ currentRadius }} meters</span>
              </div>
              <input
                v-model.number="currentRadius"
                type="range"
                min="50"
                max="2000"
                step="25"
                class="w-full accent-indigo-600 cursor-pointer"
                @input="updateMapCircle"
              />
              <div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>50m (Building)</span>
                <span>500m (Estate)</span>
                <span>2000m (Campus)</span>
              </div>
            </div>
          </div>

          <!-- Live 4-Tier GPS Test Simulator -->
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <div>
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity class="w-3.5 h-3.5 text-indigo-600" />
                <span>4-Tier GPS Scan Simulator</span>
              </h3>
              <p class="text-[11px] text-slate-500 mt-0.5">Test how different guard coordinates and GPS noise behave</p>
            </div>

            <div class="space-y-2.5">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Guard Lat</label>
                  <input v-model.number="testForm.guardLat" type="number" step="any" class="ae-input w-full font-mono text-xs py-1.5" />
                </div>
                <div>
                  <label class="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Guard Lng</label>
                  <input v-model.number="testForm.guardLng" type="number" step="any" class="ae-input w-full font-mono text-xs py-1.5" />
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] font-semibold mb-1">
                  <span class="text-slate-600 dark:text-slate-300">GPS Accuracy Drift</span>
                  <span class="font-mono text-slate-500">±{{ testForm.guardAccuracy }}m</span>
                </div>
                <input v-model.number="testForm.guardAccuracy" type="range" min="3" max="80" class="w-full accent-indigo-600" />
              </div>

              <button
                class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                @click="runSimulation"
              >
                Evaluate Scan Verdict
              </button>
            </div>

            <!-- Simulation Result Verdict Card -->
            <div v-if="simResult" class="p-3.5 rounded-xl border transition-all" :class="getVerdictClass(simResult.status)">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full" :class="getVerdictDot(simResult.status)" />
                  Verdict: {{ simResult.status }}
                </span>
                <span class="text-[10px] font-mono font-bold">{{ simResult.confidencePct }}% Confidence</span>
              </div>
              <p class="text-[11px] leading-relaxed">{{ simResult.message }}</p>
              <div class="mt-2 pt-2 border-t border-current/10 flex justify-between text-[10px] font-mono">
                <span>Distance: {{ simResult.distanceM }}m</span>
                <span>Accuracy: ±{{ simResult.accuracyM }}m</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Recent Geofence Violations Table -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Geofence Violation Log</h3>
            <p class="text-xs text-slate-500 mt-0.5">Historical records of out-of-boundary scans and GPS anomalies</p>
          </div>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Guard</th>
                <th class="px-4 py-3.5">Checkpoint</th>
                <th class="px-4 py-3.5">Distance Off</th>
                <th class="px-4 py-3.5">GPS Noise</th>
                <th class="px-4 py-3.5 text-center">4-Tier Verdict</th>
                <th class="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="viol in violations" :key="viol.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{{ viol.guard_name }}</td>
                <td class="px-4 py-3.5 text-slate-600 dark:text-slate-300">{{ viol.checkpoint_name }}</td>
                <td class="px-4 py-3.5 font-mono text-rose-600 font-bold">{{ viol.distance_m }}m away</td>
                <td class="px-4 py-3.5 font-mono text-slate-500">±{{ viol.accuracy_m }}m</td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    :class="viol.geofence_status === 'VIOLATION' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                  >
                    {{ viol.geofence_status }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-slate-400 font-mono">{{ viol.timestamp }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </FeatureGate>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Save, Activity, MapPin } from 'lucide-vue-next';
import { siteService } from '@/services/siteService';
import { geofenceService } from '@/services/geofenceService';
import FeatureGate from '@/components/common/FeatureGate.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const router = useRouter();

const siteId = route.params.id || 'site-01';
const siteData = ref({});
const violations = ref([]);
const currentRadius = ref(500);
const mapContainer = ref(null);

let leafletMap = null;
let perimeterCircle = null;
let centerMarker = null;
let testMarker = null;

const testForm = ref({
  guardLat: 12.9725,
  guardLng: 80.2450,
  guardAccuracy: 10
});

const simResult = ref(null);

const getVerdictClass = (status) => {
  switch (status) {
    case 'VALID': return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200';
    case 'WARNING': return 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200';
    case 'UNCERTAIN': return 'bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200';
    case 'VIOLATION': default: return 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200';
  }
};

const getVerdictDot = (status) => {
  switch (status) {
    case 'VALID': return 'bg-emerald-500';
    case 'WARNING': return 'bg-amber-500';
    case 'UNCERTAIN': return 'bg-blue-500';
    case 'VIOLATION': default: return 'bg-rose-500';
  }
};

const runSimulation = () => {
  const centerLat = siteData.value.latitude || 12.9716;
  const centerLng = siteData.value.longitude || 80.2435;
  
  simResult.value = geofenceService.evaluateGpsScan({
    guardLat: testForm.value.guardLat,
    guardLng: testForm.value.guardLng,
    guardAccuracy: testForm.value.guardAccuracy,
    cpLat: centerLat,
    cpLng: centerLng,
    cpRadius: currentRadius.value
  });

  if (leafletMap) {
    if (testMarker) {
      testMarker.setLatLng([testForm.value.guardLat, testForm.value.guardLng]);
    } else {
      testMarker = L.marker([testForm.value.guardLat, testForm.value.guardLng]).addTo(leafletMap);
    }
  }
};

const updateMapCircle = () => {
  if (perimeterCircle) {
    perimeterCircle.setRadius(currentRadius.value);
  }
};

const saveGeofenceSettings = async () => {
  await siteService.updateSite(siteId, {
    geofence_radius: currentRadius.value
  });
  alert("Geofence radius saved successfully!");
};

const initMap = () => {
  if (!mapContainer.value) return;
  const lat = siteData.value.latitude || 12.9716;
  const lng = siteData.value.longitude || 80.2435;

  leafletMap = L.map(mapContainer.value).setView([lat, lng], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(leafletMap);

  centerMarker = L.marker([lat, lng]).addTo(leafletMap).bindPopup(`<b>${siteData.value.name}</b><br>Property Center`);

  perimeterCircle = L.circle([lat, lng], {
    radius: currentRadius.value,
    color: '#4f46e5',
    fillColor: '#4f46e5',
    fillOpacity: 0.15,
    weight: 2
  }).addTo(leafletMap);

  leafletMap.on('click', (e) => {
    testForm.value.guardLat = parseFloat(e.latlng.lat.toFixed(6));
    testForm.value.guardLng = parseFloat(e.latlng.lng.toFixed(6));
    runSimulation();
  });
};

onMounted(async () => {
  siteData.value = await siteService.getSiteById(siteId);
  currentRadius.value = siteData.value.geofence_radius || 500;
  testForm.value.guardLat = parseFloat(((siteData.value.latitude || 12.9716) + 0.0012).toFixed(6));
  testForm.value.guardLng = parseFloat(((siteData.value.longitude || 80.2435) + 0.0015).toFixed(6));
  violations.value = await geofenceService.fetchViolations(siteId);

  await nextTick();
  initMap();
  runSimulation();
});

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
});
</script>

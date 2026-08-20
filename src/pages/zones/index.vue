<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between w-full shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
          <Layers class="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Zones
          </h2>
          <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Create and manage zones.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Zone Capacity Indicator -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span class="w-2 h-2 rounded-full" :class="zoneLimitInfo.allowed ? 'bg-emerald-500' : 'bg-rose-500'" />
          <span>Zones: <strong>{{ zones.length }}</strong> / {{ zoneLimitInfo.max === Infinity ? '∞' : zoneLimitInfo.max }}</span>
        </div>

        <button
          class="btn-primary text-xs flex items-center gap-1.5 h-8 px-3 shrink-0 cursor-pointer"
          @click="handleCreate"
        >
          <Plus class="w-3.5 h-3.5" /> Add Zone
        </button>
      </div>
    </div>

    <!-- Plan Limit Banner for Zones -->
    <PlanLimitBanner
      v-if="!zoneLimitInfo.allowed"
      :message="zoneLimitInfo.upgradeMessage"
      :current-count="zones.length"
      :max-count="zoneLimitInfo.max"
      severity="error"
      upgrade-label="Upgrade to Pro"
      @upgrade="showUpgradeModal = true"
    />

    <!-- Main Content & Sidebar -->
    <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 pt-2">
      
      <!-- Table Area -->
      <div class="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-0">
        
        <!-- Consolidated Top Toolbar -->
        <div class="flex flex-nowrap items-center gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-150 dark:border-slate-800 shrink-0 overflow-x-auto min-w-0 custom-scrollbar">
          
          <!-- Status Filter -->
          <div class="flex items-center gap-2 shrink-0 border-r border-slate-200 dark:border-slate-700 pr-4">
            <select
              v-model="statusFilter"
              class="ae-input text-xs font-semibold h-8 bg-white dark:bg-slate-900 w-[140px] cursor-pointer"
            >
              <option value="All Status">All Zones</option>
              <option value="Active">Active Zones</option>
              <option value="HasPatrols">Zones with Patrols</option>
            </select>
          </div>

          <!-- Filters & Actions -->
          <div class="flex items-center gap-3 flex-nowrap shrink-0 flex-1 justify-end">
            <!-- Search -->
            <div class="relative shrink-0 w-[200px]">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search zones..."
                class="ae-input w-full h-8 text-xs"
                style="padding-left: 2rem !important;"
              />
            </div>
          </div>
        </div>

        <!-- Loading / Empty -->
        <div v-if="isLoading" class="p-20 flex justify-center">
          <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
        </div>
        <div v-else-if="filteredZones.length === 0" class="p-20 flex flex-col items-center justify-center text-center">
          <Layers class="w-10 h-10 text-slate-300 mb-4" />
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No Zones Found</h3>
          <p class="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new zone.</p>
        </div>

        <!-- Table -->
        <div v-else class="flex-1 overflow-y-auto custom-scrollbar">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur z-10">
              <tr class="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th class="px-6 py-3">Zone Name</th>
                <th class="px-6 py-3">Description</th>
                <th class="px-6 py-3 text-center">Checkpoints</th>
                <th class="px-6 py-3 text-center">Patrols</th>
                <th class="px-6 py-3 text-center">Status</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
              <tr v-for="zone in paginatedZones" :key="zone.id" 
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  @click="handleEdit(zone)">
                <td class="px-6 py-3">
                  <div class="flex items-center gap-4">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getZoneIconColor(zone.zoneName)">
                      <component :is="getZoneIcon(zone.zoneName)" class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">{{ zone.zoneName }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                  {{ zone.description || 'Main area and surroundings' }}
                </td>
                <td class="px-6 py-3 text-center font-bold text-slate-900 dark:text-slate-100">
                  {{ getCheckpointCount(zone) }}
                </td>
                <td class="px-6 py-3 text-center font-bold text-slate-900 dark:text-slate-100">
                  {{ getPatrolCount(zone) }}
                </td>
                <td class="px-6 py-3 text-center">
                  <span v-if="(zone.status || 'active').toLowerCase() !== 'inactive'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold tracking-wide">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold tracking-wide">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Inactive
                  </span>
                </td>
                <td class="px-6 py-3" @click.stop>
                  <div class="flex items-center justify-end gap-2 transition-opacity">
                    <button 
                      class="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Zone"
                      @click="confirmDelete(zone)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Pagination -->
        <div class="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/50 dark:bg-slate-900 shrink-0">
          <p>
            Showing <span class="font-bold text-slate-700 dark:text-slate-300">{{ filteredZones.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1 }}</span> to 
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ Math.min(currentPage * itemsPerPage, filteredZones.length) }}</span> of 
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ filteredZones.length }}</span> zones
          </p>
          <div class="flex items-center gap-1.5">
            <button 
              class="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <div class="w-7 h-7 flex items-center justify-center rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-500/20">
              {{ currentPage }}
            </div>
            <button 
              class="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right Side Panels -->
      <div class="w-full lg:w-[280px] shrink-0 space-y-4 overflow-y-auto custom-scrollbar pr-1">
        
        <!-- What is a Zone? -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <HelpCircle class="w-3.5 h-3.5" />
            </div>
            <h3 class="text-[13px] font-bold text-slate-900 dark:text-slate-100">What is a Zone?</h3>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            A zone is a physical area or location that contains checkpoints. You can create patrols within zones.
          </p>
          <h4 class="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2.5">Examples</h4>
          <ul class="space-y-2.5 mb-4">
            <li class="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <div class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></div> Warehouse
            </li>
            <li class="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <div class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></div> Office Building
            </li>
            <li class="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <div class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></div> Factory Floor
            </li>
            <li class="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <div class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></div> Parking Area
            </li>
            <li class="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <div class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></div> Perimeter
            </li>
          </ul>
          <a href="#" @click.prevent="router.push({ name: 'HelpSupport' })" class="text-indigo-600 text-[11px] font-semibold hover:underline flex items-center gap-1">
            Learn more <ExternalLink class="w-3 h-3" />
          </a>
        </div>

        <!-- Tips -->
        <div class="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Lightbulb class="w-3.5 h-3.5" />
            </div>
            <h3 class="text-[13px] font-bold text-slate-900 dark:text-slate-100">Tips</h3>
          </div>
          <ul class="space-y-3">
            <li class="flex gap-2">
              <CheckCircle class="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300">Create zones based on physical locations.</p>
            </li>
            <li class="flex gap-2">
              <CheckCircle class="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300">Add checkpoints inside zones.</p>
            </li>
            <li class="flex gap-2">
              <CheckCircle class="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300">Assign patrols to zones for better management.</p>
            </li>
          </ul>
        </div>

      </div>

    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="zoneToDelete"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
          <div class="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-500/20">
            <Trash2 class="w-8 h-8 text-rose-500" />
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Zone</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Are you sure you want to delete <span class="font-bold text-slate-900 dark:text-white">{{ zoneToDelete.zoneName }}</span>? This action cannot be undone.
          </p>
          <div class="flex items-center gap-3 w-full">
            <button class="flex-1 btn-secondary py-2 text-sm" @click="zoneToDelete = null">Cancel</button>
            <button class="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow-sm" @click="handleDelete(zoneToDelete.id)">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Zone Form Modal -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
            <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <MapPin class="w-4 h-4 text-indigo-600" />
              {{ selectedZone ? 'Edit Security Zone' : 'Create Security Zone' }}
            </h2>
            <button
              class="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer"
              @click="showForm = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar bg-white dark:bg-slate-900">
            <ZoneForm
              :is-editing="!!selectedZone"
              :zone-data="selectedZone || {}"
              @save-success="onFormSuccess"
              @cancel="showForm = false"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upgrade Modal -->
    <UpgradeModal
      v-model="showUpgradeModal"
      :trigger-message="zoneLimitInfo.upgradeMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { 
  MapPin, Plus, Pencil, Loader2, X,
  Layers, CheckCircle, RefreshCw, Warehouse, Building2, Factory, 
  ParkingCircle, HelpCircle, Lightbulb, ExternalLink, MoreVertical, 
  Search, Filter, ChevronLeft, ChevronRight, Trash2
} from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import { zoneService } from "@/services/zoneService";
import { patrolService } from "@/services/patrolService";
import { subscriptionService } from "@/services/subscriptionService";
import PlanLimitBanner from "@/components/common/PlanLimitBanner.vue";
import UpgradeModal from "@/components/common/UpgradeModal.vue";
import ZoneForm from "./ZoneForm.vue";

const route = useRoute();
const router = useRouter();
const zones = ref([]);
const checkpoints = ref([]);
const patrols = ref([]);
const isLoading = ref(true);
const selectedZone = ref(null);
const showForm = ref(false);
const showUpgradeModal = ref(false);
const zoneLimitInfo = ref({ allowed: true, current: 0, max: 3, upgradeMessage: '' });
const zoneToDelete = ref(null);
const isMounted = ref(false);

const searchQuery = ref('');
const statusFilter = ref('All Status');
const currentPage = ref(1);
const itemsPerPage = 8; 

const fetchZones = async () => {
  isLoading.value = true;
  try {
    const [zonesData, checkpointsData, patrolsData, limitCheck] = await Promise.all([
      zoneService.fetchZones(),
      patrolService.getCheckpoints().catch(() => []),
      patrolService.getPatrols().catch(() => []),
      subscriptionService.checkLimit('zones').catch(() => ({ allowed: true, current: 0, max: 3 }))
    ]);
    zones.value = zonesData || [];
    checkpoints.value = checkpointsData || [];
    patrols.value = patrolsData || [];
    zoneLimitInfo.value = limitCheck;
  } catch (error) {
    console.error("Error fetching zones data:", error);
  } finally {
    isLoading.value = false;
  }
};

const getCheckpointCount = (zone) => {
  if (!checkpoints.value || !Array.isArray(checkpoints.value)) return 0;
  return checkpoints.value.filter(cp => {
    if (!cp) return false;
    
    let cpZoneId = cp.zone;
    if (cp.instructions) {
      const match = cp.instructions.match(/__ZONE_ASSIGNMENT__:([\w-]+)/);
      if (match) cpZoneId = match[1];
    }
    
    cpZoneId = typeof cpZoneId === 'object' && cpZoneId ? cpZoneId.id : cpZoneId;
    return String(cpZoneId) === String(zone.id) || (zone.zoneName && String(cpZoneId) === String(zone.zoneName));
  }).length;
};

// Calculate real patrol counts based on patrols linked to this zone
const getPatrolCount = (zone) => {
  if (!patrols.value || !Array.isArray(patrols.value)) return 0;
  
  let count = 0;
  for (const patrol of patrols.value) {
    if (!patrol) continue;
    
    // 1. Direct Relation
    if (String(patrol.zone) === String(zone.id) || String(patrol.zone_id) === String(zone.id)) {
      count++;
      continue;
    }
    
    // 2. Through Checkpoints
    if (Array.isArray(patrol.checkpoints)) {
      const hasCpInZone = patrol.checkpoints.some(cpId => {
        const cp = checkpoints.value.find(c => String(c.id) === String(cpId) || String(c.id) === String(cpId?.id));
        if (cp) {
          let cpZoneId = cp.zone;
          if (cp.instructions) {
            const match = cp.instructions.match(/__ZONE_ASSIGNMENT__:([\w-]+)/);
            if (match) cpZoneId = match[1];
          }
          cpZoneId = typeof cpZoneId === 'object' && cpZoneId ? cpZoneId.id : cpZoneId;
          return String(cpZoneId) === String(zone.id);
        }
        return false;
      });
      if (hasCpInZone) {
        count++;
      }
    }
  }
  return count;
};

const totalCheckpointsUsingZones = computed(() => {
  return zones.value.reduce((acc, z) => acc + getCheckpointCount(z), 0);
});

const totalPatrolsUsingZones = computed(() => {
  return zones.value.reduce((acc, z) => acc + getPatrolCount(z), 0);
});

const getZoneIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('warehouse')) return Warehouse;
  if (n.includes('office') || n.includes('building')) return Building2;
  if (n.includes('factory') || n.includes('plant')) return Factory;
  if (n.includes('park') || n.includes('garage')) return ParkingCircle;
  if (n.includes('perimeter')) return Layers;
  return Building2; // Default
};

const getZoneIconColor = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('warehouse')) return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400';
  if (n.includes('office')) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400';
  if (n.includes('factory')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400';
  if (n.includes('park')) return 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400';
  if (n.includes('perimeter')) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400';
  return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400';
};

const filteredZones = computed(() => {
  let list = zones.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(z => (z.zoneName || '').toLowerCase().includes(q) || (z.description || '').toLowerCase().includes(q));
  }
  if (statusFilter.value === 'Active') {
    list = list.filter(z => (z.status || 'active').toLowerCase() !== 'inactive');
  } else if (statusFilter.value === 'Inactive') {
    list = list.filter(z => (z.status || 'active').toLowerCase() === 'inactive');
  } else if (statusFilter.value === 'HasCPs') {
    list = list.filter(z => getCheckpointCount(z) > 0);
  } else if (statusFilter.value === 'HasPatrols') {
    list = list.filter(z => getPatrolCount(z) > 0);
  }
  return list;
});

const paginatedZones = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredZones.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredZones.value.length / itemsPerPage)));

const confirmDelete = (zone) => {
  zoneToDelete.value = zone;
};

const handleDelete = async (id) => {
  try {
    await zoneService.deleteZone(id);
    fetchZones();
    // Auto adjust pagination
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (error) {
    console.error("Error deleting zone:", error);
  } finally {
    zoneToDelete.value = null; // Close popup
  }
};

const handleEdit = (zone) => {
  selectedZone.value = zone;
  showForm.value = true;
};

const handleCreate = async () => {
  const check = await subscriptionService.checkLimit('zones');
  zoneLimitInfo.value = check;
  if (!check.allowed) {
    showUpgradeModal.value = true;
    return;
  }
  selectedZone.value = null;
  showForm.value = true;
};

const onFormSuccess = () => {
  showForm.value = false;
  fetchZones();
};

onMounted(() => {
  isMounted.value = true;
  fetchZones();
});
</script>

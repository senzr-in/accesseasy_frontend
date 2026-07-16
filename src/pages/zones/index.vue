<template>
  <div class="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header & Tabs -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
      <div>
        <h2 class="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Security Zones
        </h2>
        <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Physical areas that group Access Points (visitor scanning) and Checkpoints (guard patrol).
        </p>
      </div>

      <button
        class="btn-primary text-sm flex items-center gap-2"
        @click="handleCreate"
      >
        <Plus class="w-4 h-4" /> CREATE ZONE
      </button>
    </div>

    <!-- Quick Concept Legend -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex items-start gap-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/10 px-4 py-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <QrCode class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p class="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Access Points <span class="ml-1 text-[9px] font-semibold bg-emerald-200 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Visitors</span>
          </p>
          <p class="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
            Entry/exit gates where visitors or employees scan a QR code to check in or check out.
          </p>
        </div>
      </div>
      <div class="flex items-start gap-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-500/10 px-4 py-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p class="text-xs font-bold text-indigo-800 dark:text-indigo-300">
            Checkpoints <span class="ml-1 text-[9px] font-semibold bg-indigo-200 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Patrol</span>
          </p>
          <p class="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5 leading-relaxed">
            Guard patrol stops where security scans a QR code to confirm they completed that route stop.
          </p>
        </div>
      </div>
    </div>

    <!-- Zones View -->
    <div class="space-y-6 animate-in fade-in duration-300">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center p-20 text-slate-500 dark:text-slate-400 italic space-y-4"
      >
        <Loader2 class="w-10 h-10 animate-spin text-emerald-500/20" />
        <p>Loading security zones...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="zones.length === 0"
        class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-md"
      >
        <div class="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <MapPin class="w-8 h-8 text-slate-400" />
          </div>
          <div class="space-y-1">
            <h3 class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
              No Zones Defined
            </h3>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto"> 
              Create your first security zone to start grouping doors and monitoring spatial occupancy.
            </p>
          </div>
          <button 
            class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-sm transition-all" 
            @click="handleCreate"
          >
            Create First Zone
          </button>
        </div>
      </div>

      <!-- Grid List -->
      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div 
          v-for="zone in zones" 
          :key="zone.id" 
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md group hover:shadow-lg transition-all duration-200"
        >
          <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 p-4 flex flex-row items-center justify-between">
            <div class="space-y-1">
              <h3 class="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                <MapPin class="w-4 h-4 text-slate-400" /> {{ zone.zoneName || 'Unnamed Zone' }}
              </h3>
              <span class="inline-flex border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                {{ zone.type || 'Standard' }} Access
              </span>
            </div>
            <div class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button 
                class="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-800 shadow-sm" 
                @click="handleEdit(zone)"
              >
                <Settings class="w-3.5 h-3.5" />
              </button>
              <button 
                class="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 shadow-sm" 
                @click="handleDelete(zone.id)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        
          <div class="p-5">
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-1 mb-1">
                  <QrCode class="w-3 h-3 text-emerald-500" />
                  <p class="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                    Access Points
                  </p>
                </div>
                <p class="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {{ (zone.entry_doors?.length || 0) + (zone.exit_doors?.length || 0) }}
                </p>
                <p class="text-[9px] text-slate-400 leading-tight">
                  Visitor scan gates
                </p>
              </div>
              <div class="space-y-1 border-x border-slate-100 dark:border-slate-700 px-4">
                <div class="flex items-center gap-1 mb-1">
                  <MapPin class="w-3 h-3 text-indigo-500" />
                  <p class="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                    Checkpoints
                  </p>
                </div>
                <p class="text-lg font-bold text-slate-900 dark:text-slate-100">
                  0
                </p>
                <p class="text-[9px] text-slate-400 leading-tight">
                  Guard patrol stops
                </p>
              </div>
              <div class="space-y-1 text-right">
                <p class="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                  Status
                </p>
                <p class="text-xs font-bold text-emerald-600 mt-1">
                  Active
                </p>
              </div>
            </div>
          
            <p
              v-if="zone.description"
              class="mt-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 italic"
            >
              {{ zone.description }}
            </p>
          
            <button class="w-full mt-5 h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
              VIEW ZONE MAP <ArrowRight class="w-3.5 h-3.5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      <!-- Hierarchy Visual Placeholder -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden mt-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Group class="w-4 h-4 text-slate-400" />
            Zone Hierarchy
          </h3>
        </div>
        <div class="p-8 text-center font-medium text-slate-500 dark:text-slate-400 text-sm">
          Logical zone nesting and inheritance tree visualization ready for terminal nodes.
        </div>
      </div>
    </div>

    <!-- Zone Form Modal -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      >
        <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin class="w-4 h-4 text-indigo-600" />
              {{ selectedZone ? 'Edit Security Zone' : 'Create Security Zone' }}
            </h2>
            <button
              class="btn-icon bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { MapPin, ArrowLeft, Plus, Grid3X3, ArrowRight, Settings, Trash2, Group, Loader2, X, QrCode } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { zoneService } from "@/services/zoneService";
import ZoneForm from "./ZoneForm.vue";

const route = useRoute();
const zones = ref([]);
const isLoading = ref(true);
const selectedZone = ref(null);
const showForm = ref(false);

const fetchZones = async () => {
  isLoading.value = true;
  try {
    const data = await zoneService.fetchZones();
    zones.value = data || [];
  } catch (error) {
    console.error("Error fetching zones:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this zone?")) return;
  try {
    await zoneService.deleteZone(id);
    fetchZones();
  } catch (error) {
    console.error("Error deleting zone:", error);
    alert("Failed to delete zone");
  }
};

const handleEdit = (zone) => {
  selectedZone.value = zone;
  showForm.value = true;
};

const handleCreate = () => {
  selectedZone.value = null;
  showForm.value = true;
};

const onFormSuccess = () => {
  showForm.value = false;
  fetchZones();
};

onMounted(() => {
  fetchZones();
});
</script>

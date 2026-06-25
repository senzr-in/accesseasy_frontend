<template>
  <div class="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Title moved to global App Bar -->
      </div>
      <button
        class="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 rounded-xl px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center transition-all"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5 mr-2" /> CREATE ZONE
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center p-20 text-slate-500 italic space-y-4"
    >
      <Loader2 class="w-10 h-10 animate-spin text-emerald-500/20" />
      <p>Loading security zones...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="zones.length === 0"
      class="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl shadow-md"
    >
      <div class="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
          <MapPin class="w-8 h-8 text-slate-400 dark:text-zinc-600" />
        </div>
        <div class="space-y-1">
          <h3 class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
            No Zones Defined
          </h3>
          <p class="text-[10px] font-medium text-slate-500 dark:text-zinc-400 max-w-xs mx-auto"> 
            Create your first security zone to start grouping doors and monitoring spatial occupancy.
          </p>
        </div>
        <button 
          class="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-sm transition-all" 
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
        class="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-md group hover:shadow-lg transition-all duration-200"
      >
        <div class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 flex flex-row items-center justify-between">
          <div class="space-y-1">
            <h3 class="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              <MapPin class="w-4 h-4 text-slate-400 dark:text-zinc-500" /> {{ zone.zoneName || 'Unnamed Zone' }}
            </h3>
            <span class="inline-flex border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
              {{ zone.type || 'Standard' }} Access
            </span>
          </div>
          <div class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
              class="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 shadow-sm" 
              @click="handleEdit(zone)"
            >
              <Settings class="w-3.5 h-3.5" />
            </button>
            <button 
              class="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 shadow-sm" 
              @click="handleDelete(zone.id)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1">
              <p class="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-widest">
                Linked Doors
              </p>
              <p class="text-lg font-bold text-slate-900 dark:text-white">
                {{ (zone.entry_doors?.length || 0) + (zone.exit_doors?.length || 0) }}
              </p>
            </div>
            <div class="space-y-1 border-x border-slate-100 dark:border-zinc-800 px-4">
              <p class="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-widest">
                Occupancy
              </p>
              <p class="text-lg font-bold text-slate-900 dark:text-white">
                0
              </p>
            </div>
            <div class="space-y-1 text-right">
              <p class="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-widest">
                Status
              </p>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Active
              </p>
            </div>
          </div>
          
          <p
            v-if="zone.description"
            class="mt-4 text-[11px] font-medium text-slate-500 dark:text-zinc-400 line-clamp-1 italic"
          >
            {{ zone.description }}
          </p>
          
          <button class="w-full mt-6 h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm">
            VIEW ZONE MAP <ArrowRight class="w-3.5 h-3.5 ml-2" />
          </button>
        </div>
      </div>
    </div>

    <!-- Hierarchy Visual Placeholder -->
    <div class="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-md overflow-hidden mt-6">
      <div class="bg-slate-50 dark:bg-zinc-900 p-4 border-b border-slate-100 dark:border-zinc-800">
        <h3 class="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
          <Group class="w-4 h-4 text-slate-400" />
          Zone Hierarchy
        </h3>
      </div>
      <div class="p-8 text-center font-medium text-slate-500 dark:text-zinc-600 text-sm">
        Logical zone nesting and inheritance tree visualization ready for terminal nodes.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { MapPin, ArrowLeft, Plus, Grid3X3, ArrowRight, Settings, Trash2, Group, Loader2 } from "lucide-vue-next";
import { zoneService } from "@/services/zoneService";

const zones = ref([]);
const isLoading = ref(true);
const selectedZone = ref(null);

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
  // TODO: Open Zone Dialog Component
};

const handleCreate = () => {
  selectedZone.value = null;
  // TODO: Open Zone Dialog Component
};

onMounted(() => {
  fetchZones();
});
</script>

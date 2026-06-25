<template>
  <div class="space-y-8 p-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-2 mt-4 md:mt-0">
          Device Type Management
        </h1>
        <p class="text-[10px] text-cyan-600 dark:text-cyan-500 font-black uppercase tracking-[0.3em] mb-4 md:mb-0">
          Device Architecture & Operational Parameters
        </p>
      </div>
      <button class="h-10 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs tracking-widest uppercase bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 gap-2 shadow-xl shadow-slate-900/10 dark:shadow-white/5 active:scale-95 transition-all flex items-center justify-center whitespace-nowrap">
        <Plus class="w-4 h-4 sm:w-5 sm:h-5 mr-2 -ml-1" />
        New Device Type
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="type in deviceTypes" 
        :key="type.id"
        class="group relative rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:bg-slate-50 dark:hover:bg-zinc-900/60 overflow-hidden flex flex-col"
      >
        <!-- Scanning Effect -->
        <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out" />

        <div class="p-6 pb-4 flex flex-row items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl border border-cyan-100 dark:border-cyan-500/20 group-hover:border-cyan-500/50 transition-all duration-500 shadow-sm group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cpu class="w-6 h-6 text-cyan-600 dark:text-cyan-500 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {{ type.displayName }}
              </h3>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
                {{ type.name }}
              </p>
            </div>
          </div>
          <div class="flex gap-1 opacity-10 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <button class="h-8 w-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors">
              <Edit class="w-4 h-4" />
            </button>
            <button class="h-8 w-8 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="p-6 pt-0 space-y-6 flex-1 flex flex-col">
          <p class="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wide leading-relaxed line-clamp-2 min-h-[32px]">
            {{ type.description || 'No architectural specification documented.' }}
          </p>

          <div class="flex flex-wrap gap-3">
            <div class="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-xl text-[9px] font-black border border-slate-200 dark:border-white/10 uppercase tracking-[0.15em] shadow-sm">
              {{ type._count?.parameters || 0 }} Params
            </div>
            <div class="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-xl text-[9px] font-black border border-slate-200 dark:border-white/10 uppercase tracking-[0.15em] shadow-sm">
              {{ type._count?.alertRules || 0 }} Rules
            </div>
            <div class="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl text-[9px] font-black border border-cyan-200 dark:border-cyan-500/20 uppercase tracking-[0.15em] shadow-sm">
              {{ type._count?.devices || 0 }} Nodes
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-slate-100/50 dark:border-white/5 mt-auto">
            <button class="flex-1 h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-white/5 font-black text-[10px] uppercase tracking-[0.2em] gap-2 transition-all group/btn1">
              <Settings class="w-3.5 h-3.5 group-hover/btn1:rotate-90 transition-transform duration-500" />
              Config
            </button>
            <button class="flex-1 h-10 inline-flex items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 transition-all active:scale-95">
              View Matrix
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Card Area -->
      <div 
        class="group relative rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center p-8 bg-slate-50/30 dark:bg-white/[0.02] hover:bg-slate-50/80 dark:hover:bg-white/[0.05] hover:border-cyan-500/50 transition-all duration-500 cursor-pointer min-h-[280px] overflow-hidden"
      >
        <div class="absolute inset-0 bg-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="text-center relative z-10 transition-transform duration-500 group-hover:scale-105">
          <div class="h-16 w-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 mx-auto mb-6 shadow-xl group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Plus class="w-8 h-8 text-slate-400 dark:text-zinc-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 class="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-2">
            New Device Type
          </h3>
          <p class="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest max-w-[140px] mx-auto opacity-70">
            Initialize a new device architecture category
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Cpu, Edit, Trash2, Settings, Loader2 } from 'lucide-vue-next';
import { authService } from "@/services/authService";

const deviceTypes = ref([]);
const loading = ref(true);

const fetchDeviceTypes = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/prodCategory?fields=id,categoryName,description&filter[tenant][tenantId][_eq]=${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      deviceTypes.value = data.data.map(cat => ({
        id: cat.id,
        displayName: cat.categoryName,
        name: cat.categoryName.toLowerCase().replace(/\s+/g, '_'),
        description: cat.description || "Hardware category specification.",
        _count: { parameters: 0, alertRules: 0, devices: 0 } // Counts might need separate join
      }));
    }
  } catch (error) {
    console.error("Error fetching device types:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDeviceTypes();
});
</script>

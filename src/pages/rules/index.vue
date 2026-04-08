<template>
  <div class="w-full flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Access Rules
          <ShieldCheck class="w-6 h-6 text-cyan-600 dark:text-cyan-500" />
        </h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Configure access rules linking groups, zones, and schedules.
        </p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search rules..." 
            v-model="search"
            class="w-full pl-9 pr-4 h-10 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500" 
          />
        </div>
        <button 
          @click="openCreateDialog"
          class="flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95"
        >
          <Plus class="h-4 w-4" /> ADD RULE
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filtered.length === 0" class="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl">
      <div class="flex flex-col items-center justify-center p-16 text-center space-y-4">
        <div class="p-4 rounded-full bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10">
          <ShieldAlert class="w-12 h-12 text-cyan-500/40 dark:text-cyan-500/20" />
        </div>
        <div class="space-y-1">
          <h3 class="font-black text-lg text-slate-900 dark:text-white">No Rules Configured</h3>
          <p class="text-sm font-medium text-slate-500 max-w-xs mx-auto"> 
            Create business logic rules that combine schedules, users, and zones to grant access.
          </p>
        </div>
        <button 
          @click="openCreateDialog" 
          class="h-9 px-4 rounded-lg border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-500 text-xs font-black uppercase tracking-widest hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
        >
          Create First Rule
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap">
          <thead class="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">Rule Name</th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">Zone</th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">Group</th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">Schedule</th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">Priority</th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest">Status</th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
            <tr v-for="rule in filtered" :key="rule.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-cyan-500 group-hover:bg-cyan-500/10 transition-colors">
                    <ShieldCheck class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="font-black text-sm text-slate-900 dark:text-white">{{ rule.name }}</p>
                    <p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{{ rule.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold text-sm">
                 {{ rule.zone }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <Users class="h-3.5 w-3.5 text-slate-400" />
                  {{ rule.group }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <Clock class="h-3.5 w-3.5 text-slate-400" />
                  {{ rule.schedule }}
                </div>
              </td>
              <td class="px-6 py-4">
                 <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border" :class="getPriorityClass(rule.priority)">
                   {{ rule.priority }}
                 </span>
              </td>
              <td class="px-6 py-4">
                <div 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border"
                  :class="rule.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="rule.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ rule.status }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors">
                  <Settings class="w-4 h-4" />
                </button>
                <button @click="handleDelete(rule.id)" class="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Showing {{ filtered.length }} of {{ rules.length }} rules
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Search, Plus, ShieldCheck, ShieldAlert, Users, Clock, Settings, Trash2, Loader2 } from "lucide-vue-next";
import { antipassbackService } from "@/services/antipassbackService";

const rules = ref([]);
const isLoading = ref(true);
const search = ref("");

const fetchRules = async () => {
  isLoading.value = true;
  try {
    const data = await antipassbackService.fetchZones();
    // Mapping backend 'Anti-passback Zones' to the 'Rules' UI format
    rules.value = data.map(item => ({
      id: item.id,
      name: item.zoneName || `AP Zone ${item.id}`,
      zone: item.zone?.zoneName || "Global",
      group: "All Employees", // Mocked as the backend might not have this link clearly
      schedule: "24/7 Access", // Mocked
      priority: item.antiPassbackMode === 'PREVENT' ? 'High' : 'Normal',
      status: 'Active'
    })) || [];
  } catch (error) {
    console.error("Error fetching rules:", error);
  } finally {
    isLoading.value = false;
  }
};

const filtered = computed(() => {
  return rules.value.filter(r => 
      r.name.toLowerCase().includes(search.value.toLowerCase()) || 
      r.zone.toLowerCase().includes(search.value.toLowerCase())
  );
});

const getPriorityClass = (priority) => {
    switch(priority) {
        case 'High': return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
        case 'Normal': return 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20';
        case 'Low': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
}

const openCreateDialog = () => {
    alert("Create Rule dialog triggered");
};

const handleDelete = async (id) => {
    if(confirm("Are you sure you want to delete this rule?")) {
        try {
          await antipassbackService.deleteZone(id);
          fetchRules();
        } catch (error) {
          console.error("Error deleting rule:", error);
          alert("Failed to delete rule");
        }
    }
}

onMounted(() => {
  fetchRules();
});
</script>

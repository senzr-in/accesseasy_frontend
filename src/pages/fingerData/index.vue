<template>
  <div class="space-y-6 p-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button class="h-9 w-9 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Fingerprint Management
            <Fingerprint class="w-6 h-6 text-emerald-600" />
          </h1>
          <p class="text-slate-500 mt-1 text-sm">Register and manage high-precision fingerprint biometric credentials.</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button class="h-9 px-4 rounded-md border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 text-sm font-medium transition-colors">
          <Share2 class="w-4 h-4" />
          Export
        </button>
        <button class="h-9 px-4 rounded-md border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 text-sm font-medium transition-colors">
          <Download class="w-4 h-4" />
          Import
        </button>
        <button class="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
          <Plus class="w-4 h-4" />
          Add Finger
        </button>
        <button class="h-9 px-4 rounded-full border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 text-sm font-medium transition-colors">
          <Database class="w-4 h-4" />
          Batch Sync
        </button>
        <button class="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Total Templates</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ templates.length }}</p>
      </div>
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Scanner Status</p>
        <div class="flex items-center gap-2 text-2xl font-black text-emerald-600 dark:text-emerald-500">
          Online
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Storage Usage</p>
        <div class="flex items-center gap-2 text-2xl font-black text-blue-600 dark:text-blue-500">
          <HardDrive class="w-5 h-5" />
          Secure
        </div>
      </div>
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">High precision</p>
        <p class="text-2xl font-black text-emerald-600 dark:text-emerald-500">99.9%</p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 overflow-hidden">
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Fingerprint class="w-5 h-5 text-emerald-500" />
          Registered Credentials
        </h2>
        <div class="relative w-full md:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search employees..."
            class="w-full h-10 pl-9 pr-4 rounded-md border border-emerald-100 dark:border-emerald-500/20 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead class="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Employee</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Finger</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Quality</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Created At</th>
              <th class="px-6 py-4 text-xs font-semibold text-right text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
            <tr v-if="filteredTemplates.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic text-sm">
                No fingerprint templates found.
              </td>
            </tr>
            <tr 
              v-else
              v-for="temp in filteredTemplates" 
              :key="temp.id" 
              class="hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.02] transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <UserCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">
                      {{ temp.employee.firstName }} {{ temp.employee.lastName }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">ID: {{ temp.employee.employeeId }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">
                  {{ getFingerName(temp.fingerIndex) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-1000"
                      :class="temp.qualityScore > 0.9 ? 'bg-emerald-500' : temp.qualityScore > 0.8 ? 'bg-amber-500' : 'bg-rose-500'"
                      :style="{ width: `${temp.qualityScore * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ temp.qualityScore.toFixed(2) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                {{ new Date(temp.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="handleDelete(temp)"
                  class="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Fingerprint, ArrowLeft, Trash2, Search, Plus, 
  UserCheck, HardDrive, Share2, Download, RefreshCw, Database, Loader2
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const templates = ref([]);
const loading = ref(true);
const searchQuery = ref("");

const fetchFingerData = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    
    const params = new URLSearchParams({
      fields: [
        "id", "assignedTo.id", "assignedTo.employeeId", 
        "assignedTo.assignedUser.first_name", "assignedTo.assignedUser.last_name",
        "date_created"
      ].join(","),
      "filter[tenant][tenantId][_eq]": tenantId,
      limit: "-1",
      sort: "-date_created"
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      templates.value = data.data.map(item => ({
        id: item.id,
        employee: { 
          firstName: item.assignedTo?.assignedUser?.first_name || "Unknown", 
          lastName: item.assignedTo?.assignedUser?.last_name || "", 
          employeeId: item.assignedTo?.employeeId || "N/A" 
        },
        fingerIndex: 0, // Mocked as specific field might vary
        qualityScore: 0.92, // Mocked 
        createdAt: item.date_created
      })) || [];
    }
  } catch (error) {
    console.error("Error fetching finger data:", error);
  } finally {
    loading.value = false;
  }
};

const filteredTemplates = computed(() => {
    return templates.value.filter(temp => 
        temp.employee.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        temp.employee.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        temp.employee.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const getFingerName = (index) => {
    const names = ["R Thumb", "R Index", "R Middle", "R Ring", "R Little", "L Thumb", "L Index", "L Middle", "L Ring", "L Little"];
    return names[index] || `Finger ${index}`;
};

const handleDelete = async (temp) => {
    if(confirm(`Are you sure you want to delete the fingerprint template for ${temp.employee.firstName}?`)) {
        try {
          const token = authService.getToken();
          await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers/${temp.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchFingerData();
        } catch (error) {
          console.error("Error deleting finger template:", error);
        }
    }
};

onMounted(() => {
  fetchFingerData();
});
</script>

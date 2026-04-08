<template>
  <div class="space-y-6 p-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button class="h-9 w-9 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Face Management
            <Users class="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Manage AI biometric face templates for secure identification.</p>
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
          Add Face
        </button>
        <button class="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Enrolled -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Total Enrolled</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ embeddings.length }}</p>
      </div>
      <!-- High Quality -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">High Quality</p>
        <p class="text-2xl font-black text-emerald-600 dark:text-emerald-500">
          {{ embeddings.filter(e => e.qualityScore > 0.9).length }}
        </p>
      </div>
      <!-- AI Generated -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">AI Generated</p>
        <p class="text-2xl font-black text-blue-600 dark:text-blue-500">
          {{ embeddings.filter(e => e.captureMethod === 'AI').length }}
        </p>
      </div>
      <!-- Mobile Enrolled -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Mobile Enrolled</p>
        <p class="text-2xl font-black text-amber-600 dark:text-amber-500">
          {{ embeddings.filter(e => e.captureMethod === 'MOBILE').length }}
        </p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 overflow-hidden">
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Scan class="w-5 h-5 text-emerald-500" />
          Biometric Templates
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
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Method</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Quality</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Created At</th>
              <th class="px-6 py-4 text-xs font-semibold text-right text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
            <tr v-if="filteredEmbeddings.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic text-sm">
                No biometric templates found.
              </td>
            </tr>
            <tr 
              v-else
              v-for="emb in filteredEmbeddings" 
              :key="emb.id" 
              class="hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.02] transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <UserCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">
                      {{ emb.employee.firstName }} {{ emb.employee.lastName }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">ID: {{ emb.employee.employeeId }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border"
                  :class="emb.captureMethod === 'AI' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/20' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/20'"
                >
                  {{ emb.captureMethod }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-1000"
                      :class="emb.qualityScore > 0.9 ? 'bg-emerald-500' : emb.qualityScore > 0.8 ? 'bg-amber-500' : 'bg-rose-500'"
                      :style="{ width: `${emb.qualityScore * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ emb.qualityScore.toFixed(2) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                 {{ new Date(emb.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="handleDelete(emb)"
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
  Users, ArrowLeft, Scan, Trash2, Search, Plus, 
  UserCheck, RefreshCw, Download, Share2, Loader2 
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const embeddings = ref([]);
const loading = ref(true);
const searchQuery = ref("");

const fetchFaceData = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    
    const params = new URLSearchParams({
      fields: [
        "id", "assignedTo.id", "assignedTo.employeeId", 
        "assignedTo.assignedUser.first_name", "assignedTo.assignedUser.last_name",
        "base64Data", "date_created"
      ].join(","),
      "filter[tenant][tenantId][_eq]": tenantId,
      limit: "-1",
      sort: "-date_created"
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/aiFaceId?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      embeddings.value = data.data.map(item => ({
        id: item.id,
        employee: { 
          firstName: item.assignedTo?.assignedUser?.first_name || "Unknown", 
          lastName: item.assignedTo?.assignedUser?.last_name || "", 
          employeeId: item.assignedTo?.employeeId || "N/A" 
        },
        captureMethod: "AI", // Defaulting as specific method field might vary
        qualityScore: 0.95, // Mocked as API might not return this directly
        createdAt: item.date_created
      })) || [];
    }
  } catch (error) {
    console.error("Error fetching face data:", error);
  } finally {
    loading.value = false;
  }
};

const filteredEmbeddings = computed(() => {
    return embeddings.value.filter(emb => 
        emb.employee.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        emb.employee.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        emb.employee.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const handleDelete = async (emb) => {
    if(confirm(`Are you sure you want to delete the face template for ${emb.employee.firstName}?`)) {
        try {
          const token = authService.getToken();
          await fetch(`${import.meta.env.VITE_API_URL}/items/aiFaceId/${emb.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchFaceData();
        } catch (error) {
          console.error("Error deleting face template:", error);
        }
    }
}

onMounted(() => {
  fetchFaceData();
});
</script>

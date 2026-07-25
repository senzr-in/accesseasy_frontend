<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <!-- Header Section -->
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Today's Expected Visitors
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </span>
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Manage and verify visitor access passes.
        </p>
      </div>
      
      <div class="flex gap-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search visitor..."
            class="w-48 pl-8 pr-3 h-9 text-xs bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-all shadow-sm text-slate-900 dark:text-white"
            @input="debouncedSearch"
          >
        </div>
        <button 
          class="flex items-center gap-2 rounded-lg bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-[10px] font-black hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors shadow-sm uppercase tracking-widest"
          @click="loadVisitors"
        >
          <RefreshCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </button>
      </div>
    </div>

    <!-- Visitors List -->
    <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0">
      <div class="overflow-y-auto flex-1 p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50 dark:bg-zinc-950/50">
        <div class="flex flex-col gap-3">
          <!-- Loading State -->
          <div
            v-if="loading"
            class="py-20 flex justify-center"
          >
            <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="visitors.length === 0"
            class="py-20 text-center text-slate-500 dark:text-slate-400"
          >
            <Users class="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-300 dark:text-zinc-700" />
            <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">
              No visitors found
            </h3>
            <p class="text-xs">
              There are no expected visitors for today.
            </p>
          </div>

          <!-- Visitor Rows -->
          <div
            v-for="visitor in visitors"
            v-else
            :key="visitor.id"
            class="group relative flex items-center justify-between p-4 rounded-xl bg-white dark:hover:bg-zinc-800/40 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800/80 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)]"
          >
            <!-- Info -->
            <div class="flex items-center gap-4 flex-1">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-inner shrink-0 overflow-hidden">
                <img
                  v-if="visitor.photo"
                  :src="getPhotoUrl(visitor.photo)"
                  class="w-full h-full object-cover"
                >
                <span v-else>{{ visitor.personName?.charAt(0).toUpperCase() || '?' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="block text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ visitor.personName }}</span>
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ visitor.mobileNumber || 'No Phone' }} • {{ visitor.assignedAccessLevels?.accessLevelName || 'General Access' }}
                </span>
              </div>
            </div>

            <!-- Time -->
            <div class="hidden sm:flex flex-col items-center flex-1">
              <span class="text-[11px] font-black text-slate-700 dark:text-zinc-300">
                {{ visitor.startTime?.slice(0, 5) || '--:--' }} - {{ visitor.endTime?.slice(0, 5) || '--:--' }}
              </span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Expected Time
              </span>
            </div>

            <!-- Status & Actions -->
            <div class="flex items-center justify-end gap-3 shrink-0">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors"
                :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20': visitor.status === 'active',
                  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20': visitor.status === 'inactive' || !visitor.status,
                  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20': visitor.status === 'expired'
                }"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full" 
                  :class="visitor.status === 'active' ? 'bg-emerald-500' : (visitor.status === 'inactive' || !visitor.status ? 'bg-amber-500' : 'bg-rose-500')"
                />
                {{ visitor.status || 'inactive' }}
              </span>

              <button
                class="flex items-center gap-2 h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                @click="viewVisitorCard(visitor)"
              >
                <Printer class="w-3.5 h-3.5" /> 
                <span class="hidden md:inline">View Pass</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:hover:bg-zinc-800 shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:bg-slate-900 dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page <= 1 || loading"
          @click="page--; loadVisitors()"
        >
          Prev
        </button>
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Page {{ page }} of {{ totalPages || 1 }}
        </span>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:bg-slate-900 dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page >= totalPages || loading"
          @click="page++; loadVisitors()"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Reusable Visitor Pass Modal -->
    <VisitorPassModal 
      :show="showPassModal" 
      :visitor="selectedVisitor" 
      @close="handleModalClose" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Users, Printer, RefreshCw, Loader2, Search } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import VisitorPassModal from '@/components/common/modals/VisitorPassModal.vue';

const token = authService.getToken();

const visitors = ref([]);
const loading = ref(true);
const page = ref(1);
const limit = 10;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / limit));
const searchQuery = ref('');

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadVisitors();
  }, 400);
};

const showPassModal = ref(false);
const selectedVisitor = ref(null);

const getPhotoUrl = (photoId) => {
  if (!photoId) return '';
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${token}`;
};

const viewVisitorCard = (visitor) => {
  selectedVisitor.value = visitor;
  showPassModal.value = true;
};

const handleModalClose = () => {
  showPassModal.value = false;
  loadVisitors(); // Auto-refresh to get updated photos or status changes
};

const loadVisitors = async () => {
  loading.value = true;
  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId) {
      visitors.value = [];
      totalItems.value = 0;
      return;
    }

    // Default to today's date context (timezone-aware local date)
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset();
    const today = new Date(localDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    const filter = { 
      "filter[tenant][tenantId][_eq]": tenantId,
      "filter[startDate][_lte]": today,
      "filter[endDate][_gte]": today
    };

    if (searchQuery.value) {
      filter["filter[_or][0][personName][_icontains]"] = searchQuery.value;
      filter["filter[_or][1][mobileNumber][_icontains]"] = searchQuery.value;
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.value.toString(),
      sort: '-date_created',
      fields: 'id,personName,mobileNumber,startDate,endDate,startTime,endTime,status,photo,company,personToMeet,assignedAccessLevels.accessLevelName',
      meta: 'filter_count',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      const list = data.data || [];
      if (list.length > 0) {
        visitors.value = list;
        totalItems.value = data.meta?.filter_count ?? 0;
      } else {
        visitors.value = [];
        totalItems.value = 0;
      }
    } else {
      visitors.value = [];
      totalItems.value = 0;
    }
  } catch (err) {
    console.error('Failed to load visitors for guard:', err);
    visitors.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadVisitors();
});
</script>

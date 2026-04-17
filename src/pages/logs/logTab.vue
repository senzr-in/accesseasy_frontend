<template>
  <div class="space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Title moved to global App Bar -->
      </div>
      <div class="flex items-center gap-3">
        <button 
          v-if="userRole === 'Admin'"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest h-10 px-5 rounded-xl transition-colors shadow-sm flex items-center"
        >
          <Download class="w-4 h-4 mr-2" /> EXPORT
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <!-- Toolbar -->
      <div class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="relative w-full sm:w-80">
          <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search logs by employee or ID..."
            v-model="searchQuery"
            @input="debouncedSearch"
            class="w-full pl-9 h-10 rounded-lg text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white shadow-sm"
          />
        </div>
        <div class="flex items-center gap-2">
           <button class="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 flex items-center text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
             <Filter class="w-3.5 h-3.5 mr-2" />
             Filters
           </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse whitespace-nowrap relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 w-full">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest w-16">Profile</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Employee</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Date & Time</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Action</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Mode</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            <tr v-if="loading">
              <td colspan="6" class="h-64 text-center">
                <Loader2 class="w-8 h-8 animate-spin mx-auto text-blue-500" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="h-64 text-center text-slate-500">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <Activity class="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <p class="text-sm font-medium">No system logs found.</p>
                </div>
              </td>
            </tr>
            <tr 
              v-else
              v-for="log in items" 
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-5 py-3">
                 <div class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400">
                   <img v-if="log.avatarImage" :src="log.avatarImage" class="h-full w-full object-cover" />
                   <User v-else class="w-4 h-4" />
                 </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">
                    {{ getEmployeeName(log) }}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                    {{ log.employeeId?.employeeId || 'N/A' }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">
                    {{ log.date || '-' }}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-500 mt-0.5">
                    {{ formatTime(log.timeStamp, log.date_created) }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border"
                  :class="getActionClass(log.action)"
                >
                  {{ log.action || 'N/A' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">
                  <component :is="getModeIcon(log.mode)" class="w-3.5 h-3.5" />
                  {{ log.mode || 'Unknown' }}
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded w-fit border text-[10px] font-black uppercase tracking-widest" :class="getValidLogsClass(log.ValidLogs)">
                  <component :is="getValidLogsIcon(log.ValidLogs)" class="w-3 h-3" />
                  {{ getValidLogsText(log.ValidLogs) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors bg-transparent text-slate-700 dark:text-slate-300 shadow-sm"
          @click="page--"
          :disabled="page <= 1 || loading"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }}
        </div>
        <button
           class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors bg-transparent text-slate-700 dark:text-slate-300 shadow-sm"
          @click="page++"
          :disabled="page >= totalPages || loading"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { 
  Activity, Search, Filter, Download, User, 
  LogIn, LogOut, Loader2, Fingerprint, 
  Smartphone, MapPin, ScanFace, CheckCircle2, XCircle, HelpCircle 
} from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const items = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const page = ref(1);
const limit = 25;
const totalItems = ref(0);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();

const totalPages = computed(() => Math.ceil(totalItems.value / limit));

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchLogs();
  }, 300);
};

watch(page, () => {
  fetchLogs();
});

const aggregateCount = async () => {
  if (!token || !tenantId) return;
  try {
    const params = new URLSearchParams({
      "aggregate[count]": "id",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][mode][_neq]": "cronJob"
    });
    
    if (searchQuery.value) {
       params.append("filter[_and][2][_or][0][employeeId][employeeId][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][1][employeeId][assignedUser][first_name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][2][employeeId][assignedUser][last_name][_icontains]", searchQuery.value);
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    totalItems.value = data?.data?.[0]?.count?.id || 0;
  } catch (err) {
    console.error(err);
  }
};

const fetchLogs = async () => {
  if (!token || !tenantId) return;
  loading.value = true;
  await aggregateCount();

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.value.toString(),
      "sort[]": "-date_created",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][mode][_neq]": "cronJob"
    });

    const fields = [
      "status", "action", "employeeId.employeeId", 
      "employeeId.assignedUser.id", "employeeId.assignedUser.first_name", 
      "employeeId.assignedUser.last_name", "employeeId.assignedUser.avatar.id",
      "mode", "timeStamp", "date", "id", "ValidLogs", "date_created"
    ];

    fields.forEach(f => params.append("fields[]", f));

    if (searchQuery.value) {
       params.append("filter[_and][2][_or][0][employeeId][employeeId][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][1][employeeId][assignedUser][first_name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][2][employeeId][assignedUser][last_name][_icontains]", searchQuery.value);
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      
      items.value = await Promise.all(data.data.map(async (logItem) => {
        if (logItem.employeeId?.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${logItem.employeeId.assignedUser.avatar.id}`;
          try {
             const imgRes = await fetch(avatarUrl, { headers: { Authorization: `Bearer ${token}` }});
             if(imgRes.ok) {
               const blob = await imgRes.blob();
               logItem.avatarImage = URL.createObjectURL(blob);
             }
          } catch(e) {}
        }
        return logItem;
      }));
    }
  } catch (error) {
    console.error("Fetch logs error:", error);
  } finally {
    loading.value = false;
  }
};

const getEmployeeName = (item) => {
  let first_name = '';
  let last_name = '';
  
  if (item?.employeeId?.assignedUser) {
    first_name = item.employeeId.assignedUser.first_name || '';
    last_name = item.employeeId.assignedUser.last_name || '';
  } else if (item?.employeeId) {
    first_name = item.employeeId.first_name || item.employeeId.firstName || '';
    last_name = item.employeeId.last_name || item.employeeId.lastName || '';
  }

  const fullName = `${first_name} ${last_name}`.trim();
  
  if (fullName) return fullName;
  if (item?.name) return item.name;
  if (item?.employeeName) return item.employeeName;
  
  return "Unknown";
};

const formatTime = (timeStr, fallbackDateCreated) => {
    if (!timeStr && fallbackDateCreated) {
      const d = new Date(fallbackDateCreated);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    if(!timeStr) return "-";
    return timeStr.split(".")[0]; 
}

const getActionClass = (action) => {
  if(action?.toLowerCase() === 'in') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
  if(action?.toLowerCase() === 'out') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

const getModeIcon = (mode) => {
  switch (mode?.toLowerCase()) {
    case "face": return ScanFace;
    case "rfid": return MapPin;
    case "fingerprint": return Fingerprint;
    case "throughapp": return Smartphone;
    default: return Activity;
  }
}

const getValidLogsClass = (valid) => {
   if (valid === true || valid === "authorized" || valid === 1) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
   if (valid === false || valid === "unAuthorized" || valid === 0) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
   return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

const getValidLogsIcon = (valid) => {
   if(valid === true || valid === "authorized" || valid === 1) return CheckCircle2;
   if(valid === false || valid === "unAuthorized" || valid === 0) return XCircle;
   return HelpCircle;
}

const getValidLogsText = (valid) => {
   if(valid === true || valid === "authorized" || valid === 1) return "Authorized";
   if(valid === false || valid === "unAuthorized" || valid === 0) return "Unauthorized";
   return "Unknown";
}

onMounted(() => {
  fetchLogs();
});
</script>

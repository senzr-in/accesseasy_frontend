<template>
  <div class="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Activity Logs
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20">
            {{ logs.length }} Total
          </span>
        </h1>
        <p class="text-slate-500 font-medium mt-1">
          Real-time history of your access attempts.
        </p>
      </div>
      <div class="relative w-full max-w-[300px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search by door or status..."
          class="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
        >
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm flex flex-col h-[700px]">
      <div class="overflow-y-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 w-full">
            <tr>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                Time
              </th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                Location / Door
              </th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                Security Zone
              </th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr v-if="loading">
              <td
                colspan="4"
                class="text-center py-20 text-xs font-bold text-slate-400 italic bg-white dark:bg-zinc-950"
              >
                Loading history...
              </td>
            </tr>
            <tr v-else-if="filteredLogs.length === 0">
              <td
                colspan="4"
                class="text-center py-20 text-xs font-bold text-slate-400 italic bg-white dark:bg-zinc-950"
              >
                No activity logs found.
              </td>
            </tr>
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors group"
            >
              <td class="px-5 py-3">
                <div class="flex flex-col justify-center">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">{{ formatDate(log.timestamp) }}</span>
                  <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{{ formatTime(log.timestamp) }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-600 transition-colors duration-300">
                    <MapPin class="h-4 w-4" />
                  </div>
                  <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ log.door?.doorName || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500">
                  {{ log.door?.zone?.name || '—' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <span
                    v-if="log.eventType === 'ACCESS_GRANTED'"
                    class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                  >
                    <ShieldCheck class="h-3 w-3" />
                    Granted
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                  >
                    <ShieldAlert class="h-3 w-3" />
                    Denied
                  </span>
                </div>
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
import { Search, MapPin, ShieldCheck, ShieldAlert, Loader2 } from "lucide-vue-next";
import { authService } from "@/services/authService";

const logs = ref([]);
const loading = ref(true);
const search = ref("");

const fetchMyLogs = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    const userData = authService.getUserData();
    const userId = userData?.id;

    if (!userId) {
      console.warn("No user ID found for logs filtering");
      return;
    }

    const params = new URLSearchParams({
      limit: "50",
      "sort[]": "-date_created",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][employeeId][assignedUser][id][_eq]": userId
    });

    const fields = [
      "status", "action", "mode", "timeStamp", "date", "id", "ValidLogs", "date_created",
      "door.doorName", "door.zone.zoneName"
    ];
    fields.forEach(f => params.append("fields[]", f));

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      logs.value = data.data.map(item => ({
        id: item.id,
        timestamp: item.date_created,
        door: {
          doorName: item.door?.doorName || null,
          zone: { name: item.door?.zone?.zoneName || null }
        },
        eventType: (item.ValidLogs === true || item.ValidLogs === 'authorized' || item.ValidLogs === 1) ? 'ACCESS_GRANTED' : 'ACCESS_DENIED'
      })) || [];
    }
  } catch (error) {
    console.error("Error fetching my logs:", error);
  } finally {
    loading.value = false;
  }
};

const filteredLogs = computed(() => {
  if (!search.value) return logs.value;
  const s = search.value.toLowerCase();
  return logs.value.filter(log => 
    log.door?.doorName?.toLowerCase().includes(s) ||
    log.eventType?.toLowerCase().includes(s)
  );
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('default', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchMyLogs();
});
</script>

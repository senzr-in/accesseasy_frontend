<template>
  <div class="space-y-8 pb-12 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Visitor Overview
        </h1>
        <p class="text-sm font-medium text-slate-500 mt-1">
          Real-time tracking of guest check-ins and portal performance.
        </p>
      </div>
      <div class="flex gap-3">
        <!-- Export Dropdown -->
        <div class="relative group">
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95"
          >
            <FileDown class="w-4 h-4" />
            Export Data
          </button>
          <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50 hidden group-hover:block">
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportVisitorsExcel"
            >
              Export Visitors (Excel)
            </button>
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportVisitorsCSV"
            >
              Export Visitors (CSV)
            </button>
            <div class="border-t border-slate-100 dark:border-zinc-900 my-1" />
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportLogsExcel"
            >
              Export Logs (Excel)
            </button>
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportLogsCSV"
            >
              Export Logs (CSV)
            </button>
          </div>
        </div>

        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          @click="$router.push('/dashboard/visitor-portals')"
        >
          <Layout class="w-4 h-4" />
          Manage Portals
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total Visitors Today -->
      <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 pl-2">
          Today's Visitors
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-3xl font-black text-slate-900 dark:text-white pl-2"
        >
          {{ stats.totalToday }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">
          Total check-ins
        </p>
      </div>

      <!-- Active Now -->
      <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 pl-2">
          Inside Now
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-3xl font-black text-slate-900 dark:text-white pl-2"
        >
          {{ stats.activeNow }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">
          Active sessions
        </p>
      </div>

      <!-- Denied Visitors -->
      <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-rose-500" />
        <p class="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2 pl-2">
          Denied Entry
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-3xl font-black text-rose-600 dark:text-rose-400 pl-2"
        >
          {{ stats.deniedToday }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">
          Failed scans
        </p>
      </div>

      <!-- Active Portals -->
      <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <p class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 pl-2">
          Portals
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-3xl font-black text-slate-900 dark:text-white pl-2"
        >
          {{ stats.portals }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">
          Live registration points
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <!-- Visitor Analytics -->
      <div class="space-y-4">
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-md h-full flex flex-col justify-center">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Visitor Approval Health
            </h3>
            <span class="text-[9px] font-black text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 uppercase tracking-widest">Global Success Rate</span>
          </div>
          
          <div
            v-if="loading"
            class="w-full h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse"
          />
          <div
            v-else
            class="space-y-4"
          >
            <div class="flex px-1 justify-between text-[11px] font-black tracking-widest uppercase mb-3">
              <span class="text-emerald-600 dark:text-emerald-500">{{ healthRate }}% Successful</span>
              <span class="text-rose-600 dark:text-rose-500 shrink-0">{{ 100 - healthRate }}% Unauthorized</span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full h-3 bg-rose-500/20 rounded-full overflow-hidden flex border border-rose-500/10">
              <div
                class="h-full bg-emerald-500 transition-all duration-1000 border-r border-slate-900/10"
                :style="{ width: `${healthRate}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Live Visitor Logs -->
      <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-md h-[400px] flex flex-col">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            Recent Visitor Activity 
            <span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" /></span>
          </h3>
          <router-link
            to="/dashboard/visitors"
            class="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            View All Logs →
          </router-link>
        </div>
        
        <div class="overflow-y-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0">
              <tr>
                <th class="px-5 py-3">
                  Visitor
                </th>
                <th class="px-5 py-3">
                  Door
                </th>
                <th class="px-5 py-3">
                  Authorized By
                </th>
                <th class="px-5 py-3">
                  Time
                </th>
                <th class="px-5 py-3 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-if="loading"
                class="h-32"
              >
                <td
                  colspan="5"
                  class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Loading feed...
                </td>
              </tr>
              <tr
                v-else-if="recentLogs.length === 0"
                class="h-32"
              >
                <td
                  colspan="5"
                  class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  No visitors today
                </td>
              </tr>
              <tr
                v-for="log in recentLogs"
                v-else
                :key="log.id"
                class="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <td class="px-5 py-3">
                  <div class="text-[12px] font-semibold text-slate-900 dark:text-white">
                    {{ log.name || 'Unknown Visitor' }}
                  </div>
                  <div class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    {{ log.mode === 'throughApp' ? 'App Scan' : (log.mode || 'Portal Scan') }}
                  </div>
                </td>
                <td class="px-5 py-3 text-[11px] text-slate-600 dark:text-zinc-400">
                  {{ log.door?.doorName || log.door?.doorNumber || '-' }}
                </td>
                <td class="px-5 py-3 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span
                    v-if="log.user_created"
                    class="font-medium"
                  >
                    {{ log.user_created.first_name }} {{ log.user_created.last_name || '' }}
                  </span>
                  <span
                    v-else
                    class="text-slate-400 italic text-[10px]"
                  >
                    System / Auto
                  </span>
                </td>
                <td class="px-5 py-3 text-[11px] text-slate-600 dark:text-zinc-400">
                  {{ formatTime(log.date_created) }}
                </td>
                <td class="px-5 py-3 text-right">
                  <span
                    v-if="log.ValidLogs === 'authorized' || log.ValidLogs === true"
                    class="px-2 py-1 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 uppercase tracking-widest"
                  >Auth</span>
                  <span
                    v-else
                    class="px-2 py-1 rounded-md text-[9px] font-black bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 uppercase tracking-widest"
                  >Denied</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Layout, Users, ShieldCheck, Activity, Clock, FileDown } from 'lucide-vue-next';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const loading = ref(true);
const stats = ref({ totalToday: 0, activeNow: 0, deniedToday: 0, portals: 0 });
const recentLogs = ref([]);

const healthRate = computed(() => {
  const total = stats.value.totalToday + stats.value.deniedToday;
  if (total === 0) return 100;
  return Math.round((stats.value.totalToday / total) * 100);
});

const formatTime = (d) => d ? format(new Date(d), 'hh:mm a') : '—';

const fetchData = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();
    const today = new Date().toISOString().split('T')[0];
    const headers = { Authorization: `Bearer ${token}` };

    const response = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
      action: 'visitor-dashboard',
      tenantId,
      today
    }, { headers });

    const data = response.data;
    stats.value = {
      totalToday: data.totalToday || 0,
      deniedToday: data.deniedToday || 0,
      activeNow: data.activeNow || 0,
      portals: data.portals || 0
    };
    recentLogs.value = data.recentLogs || [];
  } catch (e) {
    console.error('Visitor dashboard fetch failed:', e);
  } finally {
    loading.value = false;
  }
};

const fetchAllVisitorsForExport = async () => {
  const tenantId = currentUserTenant.getTenantId();
  const token = authService.getToken();
  if (!tenantId || !token) return [];

  try {
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    const params = new URLSearchParams({
      limit: '-1',
      sort: '-date_created',
      fields: 'personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,quantity,assignedAccessLevels.accessLevelName,date_created',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const result = await res.json();
      return result.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch visitors for export", error);
  }
  return [];
};

const exportVisitorsExcel = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (exportItems.length === 0) {
    alert("No visitor data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitors");

  worksheet.columns = [
    { header: "Name", key: "personName", width: 25 },
    { header: "Email", key: "email", width: 25 },
    { header: "Mobile Number", key: "mobileNumber", width: 15 },
    { header: "Start Date", key: "startDate", width: 12 },
    { header: "End Date", key: "endDate", width: 12 },
    { header: "Start Time", key: "startTime", width: 10 },
    { header: "End Time", key: "endTime", width: 10 },
    { header: "Access Level", key: "accessLevelName", width: 25 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Status", key: "status", width: 12 }
  ];

  exportItems.forEach(item => {
    worksheet.addRow({
      personName: item.personName,
      email: item.email || "",
      mobileNumber: item.mobileNumber || "",
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      accessLevelName: item.assignedAccessLevels?.accessLevelName || "N/A",
      quantity: item.quantity,
      status: item.status
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitors_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
};

const exportVisitorsCSV = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (exportItems.length === 0) {
    alert("No visitor data to export");
    return;
  }

  const headers = ["Name", "Email", "Mobile Number", "Start Date", "End Date", "Start Time", "End Time", "Access Level", "Quantity", "Status"];
  const rows = exportItems.map(item => [
    `"${(item.personName || '').replace(/"/g, '""')}"`,
    `"${(item.email || '').replace(/"/g, '""')}"`,
    `"${(item.mobileNumber || '').replace(/"/g, '""')}"`,
    item.startDate,
    item.endDate,
    item.startTime,
    item.endTime,
    `"${(item.assignedAccessLevels?.accessLevelName || 'N/A').replace(/"/g, '""')}"`,
    item.quantity,
    item.status
  ]);

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitors_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

const exportLogsExcel = async () => {
  if (recentLogs.value.length === 0) {
    alert("No log data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitor Logs");

  worksheet.columns = [
    { header: "Visitor", key: "name", width: 25 },
    { header: "Mode", key: "mode", width: 15 },
    { header: "Door", key: "door", width: 20 },
    { header: "Authorized By", key: "authorizedBy", width: 25 },
    { header: "Time", key: "time", width: 20 },
    { header: "Status", key: "status", width: 12 }
  ];

  recentLogs.value.forEach(log => {
    const authBy = log.user_created ? `${log.user_created.first_name} ${log.user_created.last_name || ''}` : "System / Auto";
    const status = (log.ValidLogs === 'authorized' || log.ValidLogs === true) ? "Authorized" : "Denied";
    const timeFormatted = log.date_created ? format(new Date(log.date_created), 'yyyy-MM-dd hh:mm a') : "—";
    
    worksheet.addRow({
      name: log.name || "Unknown Visitor",
      mode: log.mode === 'throughApp' ? 'App Scan' : (log.mode || 'Portal Scan'),
      door: log.door?.doorName || log.door?.doorNumber || '-',
      authorizedBy: authBy,
      time: timeFormatted,
      status: status
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitor_Logs_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
};

const exportLogsCSV = async () => {
  if (recentLogs.value.length === 0) {
    alert("No log data to export");
    return;
  }

  const headers = ["Visitor", "Mode", "Door", "Authorized By", "Time", "Status"];
  const rows = recentLogs.value.map(log => {
    const authBy = log.user_created ? `${log.user_created.first_name} ${log.user_created.last_name || ''}` : "System / Auto";
    const status = (log.ValidLogs === 'authorized' || log.ValidLogs === true) ? "Authorized" : "Denied";
    const timeFormatted = log.date_created ? format(new Date(log.date_created), 'yyyy-MM-dd hh:mm a') : "—";

    return [
      `"${(log.name || 'Unknown Visitor').replace(/"/g, '""')}"`,
      `"${(log.mode === 'throughApp' ? 'App Scan' : (log.mode || 'Portal Scan')).replace(/"/g, '""')}"`,
      `"${(log.door?.doorName || log.door?.doorNumber || '-').replace(/"/g, '""')}"`,
      `"${authBy.replace(/"/g, '""')}"`,
      `"${timeFormatted}"`,
      status
    ];
  });

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitor_Logs_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

onMounted(() => {
  currentUserTenant.initialize().then(fetchData);
});
</script>

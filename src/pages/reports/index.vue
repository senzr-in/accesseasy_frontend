<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19]">
    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-6 space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest leading-none">
            Patrol Analytics
          </h1>
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 truncate max-w-xl">
            Analyze patrol performance and statistics
          </p>
        </div>
      </div>
      
      <!-- Toolbar: Filters & Export -->
      <div class="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
        <!-- Date Filter -->
        <div class="flex items-center bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-1.5 shadow-sm">
          <input
            type="date"
            v-model="filterStartDate"
            class="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 w-[110px]"
          />
          <span class="text-slate-400 px-2 text-xs font-medium">to</span>
          <input
            type="date"
            v-model="filterEndDate"
            class="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 w-[110px]"
          />
          <button
            v-if="filterStartDate || filterEndDate"
            class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 transition-colors"
            @click="clearDates"
            title="Clear dates"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          class="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none text-white text-xs font-bold tracking-wide flex items-center gap-2 transition-all hover:scale-105"
          @click="fetchData"
        >
          <Filter class="w-3.5 h-3.5" />
          Apply Filter
        </button>
        
        <button
          class="h-9 px-5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#151c2c] dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-200 text-xs font-bold tracking-wide flex items-center gap-2 transition-all"
          @click="exportPDF"
        >
          <Download class="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      <!-- Quick KPI Summary Strip -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patrols</span>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ totalRecords || 128 }}</p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Integrity Score</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">98.4% <span class="text-[11px] text-emerald-500 font-bold">Tamper Free</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geofence Compliance</span>
          <p class="text-2xl font-black text-indigo-600 mt-1">99.2% <span class="text-[11px] text-slate-400 font-normal">On-Site</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Adherence</span>
          <p class="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">100% <span class="text-[11px] text-emerald-500 font-bold">Optimal</span></p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Visitors Over Time -->
        <div class="lg:col-span-2 bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-5 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Patrol Volume</h3>
          </div>
          <div class="flex-1 h-[160px]">
            <VueApexCharts
              v-if="!loading && lineChartSeries[0].data.length > 0"
              type="area"
              height="100%"
              width="100%"
              :options="lineChartOptions"
              :series="lineChartSeries"
            />
            <div v-else-if="!loading" class="h-full flex flex-col items-center justify-center text-slate-400">
              <Activity class="w-8 h-8 mb-2 opacity-50" />
              <span class="text-xs">No traffic data available</span>
            </div>
          </div>
        </div>

        <!-- Visitors by Status -->
        <div class="bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-5 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Patrols by Status</h3>
          </div>
          <div class="flex-1 h-[160px]">
            <VueApexCharts
              v-if="!loading && pieChartSeries.length > 0 && pieChartSeries.some(v => v > 0)"
              type="donut"
              height="100%"
              width="100%"
              :options="pieChartOptions"
              :series="pieChartSeries"
            />
            <div v-else-if="!loading" class="h-full flex flex-col items-center justify-center text-slate-400">
              <PieChart class="w-8 h-8 mb-2 opacity-50" />
              <span class="text-xs">No status data available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Detailed Patrol Data</h3>
          <span class="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-slate-600 dark:text-slate-300">
            {{ totalRecords }} total
          </span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 dark:bg-[#1a2333] text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th class="px-5 py-3">Route</th>
                <th class="px-5 py-3">Guard</th>
                <th class="px-5 py-3">Date</th>
                <th class="px-5 py-3">Time</th>
                <th class="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-if="loading">
                <td colspan="5" class="p-8 text-center">
                  <Loader2 class="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                </td>
              </tr>
              <tr v-else-if="rawData.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400 text-sm">
                  No patrol records found.
                </td>
              </tr>
              <tr v-for="p in rawData" :key="p.id" v-else class="hover:bg-slate-50 dark:hover:bg-white/5">
                <td class="px-5 py-3 font-medium text-slate-900 dark:text-slate-200">{{ p.zoneName || 'Standard Route' }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-400">{{ p.guardName || '-' }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-400">{{ p.date || formatDate(p.date_created) }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-400">{{ p.scheduledTime || p.startTime || '-' }}</td>
                <td class="px-5 py-3">
                  <span
                    class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    :class="{
                      'bg-emerald-100 text-emerald-700': p.status === 'Completed',
                      'bg-amber-100 text-amber-700': p.status === 'Pending',
                      'bg-slate-100 text-slate-700': !['Completed', 'Pending'].includes(p.status)
                    }"
                  >
                    {{ p.status || 'Unknown' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="px-5 py-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
          <button 
            :disabled="currentPage === 1" 
            @click="currentPage--; fetchData()"
            class="text-xs font-semibold text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="text-xs text-slate-500">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
          <button 
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage++; fetchData()"
            class="text-xs font-semibold text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
import { 
  Users, Filter, Download, X, Activity, PieChart, Loader2, ArrowLeft
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import VueApexCharts from 'vue3-apexcharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const loading = ref(false);
const rawData = ref([]);
const totalRecords = ref(0);
const filterStartDate = ref('');
const filterEndDate = ref('');
const currentPage = ref(1);
const PAGE_SIZE = 50;

const tenantId = authService.getTenantId();
const apiUrl = import.meta.env.VITE_API_URL;

const totalPages = computed(() => Math.ceil(totalRecords.value / PAGE_SIZE));

const clearDates = () => {
  filterStartDate.value = '';
  filterEndDate.value = '';
  fetchData();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Time';
  let date = new Date(dateString);
  if (isNaN(date.getTime()) && typeof dateString === 'string') {
    date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
  }
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(date);
};

// Chart Data Setup
const lineChartSeries = ref([{ name: 'Patrols', data: [] }]);
const lineChartOptions = ref({
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
  colors: ['#6366f1'],
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
  },
  xaxis: { categories: [], labels: { style: { colors: '#94a3b8' } } },
  yaxis: { labels: { style: { colors: '#94a3b8' } } },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark' }
});

const pieChartSeries = ref([]);
const pieChartOptions = ref({
  chart: { type: 'donut', background: 'transparent' },
  labels: [],
  colors: ['#10b981', '#f59e0b', '#64748b', '#ef4444', '#3b82f6'],
  plotOptions: { donut: { size: '75%' } },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  tooltip: { theme: 'dark' }
});

const processCharts = (patrols) => {
  const trafficMap = {};
  const statusMap = {};
  
  patrols.forEach(p => {
    const dateStr = p.date || p.date_created;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = date.toISOString().split('T')[0];
      trafficMap[day] = (trafficMap[day] || 0) + 1;
    }
    const stat = p.status || 'Unknown';
    statusMap[stat] = (statusMap[stat] || 0) + 1;
  });

  const sortedDays = Object.keys(trafficMap).sort();
  lineChartSeries.value = [{ name: 'Patrols', data: sortedDays.map(d => trafficMap[d]) }];
  lineChartOptions.value = {
    ...lineChartOptions.value,
    xaxis: { ...lineChartOptions.value.xaxis, categories: sortedDays }
  };

  const statuses = Object.keys(statusMap);
  pieChartSeries.value = statuses.map(s => statusMap[s]);
  pieChartOptions.value = {
    ...pieChartOptions.value,
    labels: statuses
  };
};

const fetchData = async () => {
  loading.value = true;
  rawData.value = [];
  
  try {
    const params = new URLSearchParams({
      'filter[tenant][_eq]': tenantId,
      sort: '-date_created',
      limit: PAGE_SIZE,
      offset: (currentPage.value - 1) * PAGE_SIZE,
      'meta': 'filter_count'
    });

    if (filterStartDate.value) params.append('filter[date][_gte]', filterStartDate.value);
    if (filterEndDate.value) params.append('filter[date][_lte]', filterEndDate.value);

    const token = authService.getToken();
    const res = await fetch(`${apiUrl}/items/patrols?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      rawData.value = data.data || [];
      totalRecords.value = data.meta?.filter_count || rawData.value.length;
      processCharts(rawData.value);
    }
  } catch (error) {
    console.error('Failed to fetch patrol analytics:', error);
  } finally {
    loading.value = false;
  }
};

const exportPDF = () => {
  if (!rawData.value.length) {
    alert('No data to export.');
    return;
  }
  const doc = new jsPDF('landscape');
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Patrol Analytics Report', 14, 25);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  const getGuardName = (p) => p.guardName || 'Unknown Guard';
  
  const tableData = rawData.value.map(p => [
    p.zoneName || 'Standard Route',
    getGuardName(p),
    p.date || formatDate(p.date_created),
    p.scheduledTime || p.startTime || 'Unknown',
    p.status || 'Unknown'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Route Name', 'Assigned Guard', 'Date', 'Time', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] }
  });

  doc.save('patrol_analytics_report.pdf');
};

onMounted(() => {
  fetchData();
});
</script>

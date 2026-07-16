<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19]">
    <!-- Header -->
    <header class="bg-white dark:bg-[#151c2c] border-b border-slate-200 dark:border-white/5 px-6 py-4 shrink-0 flex items-center justify-between z-10">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reports & Analytics
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive operational logs for the security domain.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 relative">
        <!-- Date Range Filter -->
        <div class="flex items-center gap-2 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 shadow-sm">
          <input
            v-model="filterStartDate"
            type="date"
            class="bg-transparent text-[11px] font-medium text-slate-700 dark:text-slate-300 outline-none"
          >
          <span class="text-slate-400 text-[10px] uppercase font-bold">to</span>
          <input
            v-model="filterEndDate"
            type="date"
            class="bg-transparent text-[11px] font-medium text-slate-700 dark:text-slate-300 outline-none"
          >
          <button
            class="ml-1 p-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            title="Apply Filter"
            @click="applyDateFilter"
          >
            <Filter class="w-3.5 h-3.5" />
          </button>
          <button
            v-if="dateFilterApplied"
            class="p-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
            title="Clear Filter"
            @click="clearDateFilter"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="relative group">
          <button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20">
            <Download class="w-4 h-4" />
            Export Data
          </button>
          <div class="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button
              class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 first:rounded-t-xl"
              @click="downloadCSV"
            >
              Export as CSV
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 last:rounded-b-xl"
              @click="downloadPDF"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="bg-white dark:bg-[#151c2c] border-b border-slate-200 dark:border-white/5 px-6 shrink-0">
      <nav
        class="flex space-x-1 overflow-x-auto custom-scrollbar"
        aria-label="Tabs"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2"
          :class="[
            activeTab === tab.id
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-700'
          ]"
          @click="activeTab = tab.id"
        >
          <component
            :is="tab.icon"
            class="w-4 h-4"
          />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Main Content Area (Data Grid & Charts) -->
    <main class="flex-1 overflow-auto p-6 flex flex-col gap-6">
      <!-- KPI Widgets -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <!-- KPI 1 -->
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div class="relative z-10">
            <p class="text-indigo-100 text-[9px] font-black uppercase tracking-widest mb-0.5">
              Total Records
            </p>
            <h3 class="text-2xl font-black">
              {{ totalRecords }}
            </h3>
            <p class="text-indigo-200 text-[10px] mt-1 flex items-center gap-1 font-medium">
              <Activity class="w-3 h-3" /> Updated just now
            </p>
          </div>
        </div>
        
        <!-- KPI 2 -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all hover:scale-[1.02]">
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div class="relative z-10">
            <p class="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
              Resolved / Safe
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white">
              {{ resolvedRecords }}
            </h3>
            <p class="text-emerald-500 text-[10px] mt-1 font-bold">
              {{ resolutionRate }}% Resolution Rate
            </p>
          </div>
        </div>

        <!-- KPI 3 -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all hover:scale-[1.02]">
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div class="relative z-10">
            <p class="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
              Action Required
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white">
              {{ pendingRecords }}
            </h3>
            <p class="text-amber-500 text-[10px] mt-1 font-bold">
              Needs attention
            </p>
          </div>
        </div>

        <!-- KPI 4 -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all hover:scale-[1.02]">
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div class="relative z-10">
            <p class="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
              Critical Alerts
            </p>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white">
              {{ criticalRecords }}
            </h3>
            <p class="text-rose-500 text-[10px] mt-1 font-bold">
              High priority flags
            </p>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        <!-- Chart 1: Primary Trend / Metric -->
        <div class="lg:col-span-2 bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-4 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h2 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {{ primaryChartTitle }}
              </h2>
              <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {{ primaryChartSubtitle }}
              </p>
            </div>
          </div>
          <div class="flex-1 h-[140px] min-h-[140px]">
            <VueApexCharts
              :type="primaryChartType"
              height="100%"
              :options="primaryChartOptions"
              :series="primaryChartSeries"
            />
          </div>
        </div>

        <!-- Chart 2: Secondary Distribution -->
        <div class="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-4 flex flex-col">
          <div class="mb-2">
            <h2 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {{ secondaryChartTitle }}
            </h2>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {{ secondaryChartSubtitle }}
            </p>
          </div>
          <div class="flex-1 flex items-center justify-center h-[140px] min-h-[140px]">
            <VueApexCharts
              :type="secondaryChartType"
              width="100%"
              height="140"
              :options="secondaryChartOptions"
              :series="secondaryChartSeries"
            />
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
        <!-- Search and Table Header -->
        <div class="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-transparent shrink-0">
          <div class="relative w-full max-w-md">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search reports..." 
              class="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            >
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span
              v-if="loading"
              class="flex items-center gap-2"
            ><Loader2 class="w-4 h-4 animate-spin" /> Loading...</span>
            <span v-else>Showing {{ currentData.length }} results</span>
          </div>
        </div>

        <!-- The Table -->
        <div class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="sticky top-0 bg-slate-50 dark:bg-[#1a2333] text-slate-500 dark:text-slate-400 font-semibold z-10 border-b border-slate-200 dark:border-white/5 shadow-sm">
              <tr>
                <th class="px-6 py-3">
                  ID / Reference
                </th>
                <th class="px-6 py-3">
                  Date & Time
                </th>
                <th class="px-6 py-3">
                  Type
                </th>
                <th class="px-6 py-3">
                  Assignee / Source
                </th>
                <th class="px-6 py-3">
                  Status
                </th>
                <th class="px-6 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-if="loading">
                <td
                  colspan="6"
                  class="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <div class="flex flex-col items-center gap-2">
                    <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
                    <p>Fetching {{ tabs.find(t => t.id === activeTab)?.name }}...</p>
                  </div>
                </td>
              </tr>
              
              <tr v-else-if="currentData.length === 0">
                <td
                  colspan="6"
                  class="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <div class="flex flex-col items-center gap-2">
                    <FileText class="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p>No records found for {{ tabs.find(t => t.id === activeTab)?.name }}</p>
                  </div>
                </td>
              </tr>

              <tr 
                v-for="(item, index) in currentData" 
                :key="index"
                class="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                @click="openDetails(item)"
              >
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {{ item.ref }}
                </td>
                <td class="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {{ item.date }}
                </td>
                <td class="px-6 py-4">
                  <span class="text-slate-700 dark:text-slate-300 font-medium">{{ item.type }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <User class="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span class="text-slate-600 dark:text-slate-400">{{ item.source }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                    :class="getStatusColor(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details &rarr;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="p-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#151c2c] shrink-0">
          <button
            class="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled
          >
            Previous
          </button>
          <span class="text-sm text-slate-500 dark:text-slate-400">Page 1 of 1</span>
          <button
            class="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </main>

    <!-- Slide-out Details Drawer -->
    <div
      v-if="selectedReport"
      class="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        @click="closeDetails"
      />
      <div class="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div class="w-full h-full bg-white dark:bg-[#151c2c] shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
          <!-- Drawer Header -->
          <div class="px-6 py-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#0b0f19]">
            <div>
              <h2
                id="slide-over-title"
                class="text-lg font-bold text-slate-900 dark:text-white"
              >
                Report Details
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ selectedReport.ref }}
              </p>
            </div>
            <button
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="closeDetails"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Drawer Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Date & Time
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {{ selectedReport.date }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Report Type
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {{ selectedReport.type }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Source / Assignee
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {{ selectedReport.source }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Current Status
                </p>
                <div class="mt-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
                    :class="getStatusColor(selectedReport.status)"
                  >
                    {{ selectedReport.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- AI Summary Section (Only for Incidents/Alerts) -->
            <div
              v-if="activeTab === 'incidents' || activeTab === 'ai'"
              class="border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl p-5 relative overflow-hidden"
            >
              <div class="flex items-center justify-between mb-3 relative z-10">
                <h3 class="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <Sparkles class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  AI Report Summary
                </h3>
                <button 
                  v-if="!aiSummary"
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-70" 
                  :disabled="isGeneratingAi"
                  @click="generateAiSummary"
                >
                  <Loader2
                    v-if="isGeneratingAi"
                    class="w-3 h-3 animate-spin"
                  />
                  {{ isGeneratingAi ? 'Analyzing...' : 'Generate' }}
                </button>
              </div>
              
              <div class="relative z-10">
                <p
                  v-if="aiSummary"
                  class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  {{ aiSummary }}
                </p>
                <p
                  v-else
                  class="text-xs text-indigo-600/70 dark:text-indigo-400/70"
                >
                  Click generate to let ReportPro AI analyze the raw data logs and draft a comprehensive narrative summary for this event.
                </p>
              </div>
            </div>

            <!-- Raw Data Fallback -->
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Raw Payload Data
              </h3>
              <div class="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                <pre class="text-xs text-emerald-400 font-mono">{{ JSON.stringify(selectedReport, null, 2) }}</pre>
              </div>
            </div>
          </div>
          
          <!-- Drawer Footer -->
          <div class="px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b0f19] flex justify-end gap-3">
            <button
              class="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="closeDetails"
            >
              Close
            </button>
            <button
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              @click="downloadPDF"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Filter, Download, Search, Bell, Route, 
  BookOpen, Clock, Activity, Cpu, FileText, User, Loader2, Sparkles, X
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import VueApexCharts from 'vue3-apexcharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tabs Configuration
const tabs = [
  { id: 'incidents', name: 'Incidents & Alerts', icon: Bell },
  { id: 'patrols', name: 'Patrol Reports', icon: Route },
  { id: 'dar', name: 'Daily Activity (DAR)', icon: BookOpen },
  { id: 'ai', name: 'AI Analytics', icon: Cpu }
];

const activeTab = ref('incidents');
const loading = ref(false);
const rawData = ref([]);
const searchQuery = ref('');

const tenantId = authService.getTenantId();
const apiUrl = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Time';
  let date = new Date(dateString);
  
  if (isNaN(date.getTime()) && typeof dateString === 'string') {
    const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    date = new Date(isoString);
  }
  
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(date);
};

const fetchData = async () => {
  loading.value = true;
  rawData.value = [];
  try {
    let endpoint = '';
    
    if (activeTab.value === 'incidents') {
      const res = await authService.protectedApi.get(`/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created&limit=100`);
      rawData.value = res.data.data.map(item => ({
        ref: `ALT-${item.id}`,
        date: formatDate(item.date_created),
        _timestamp: new Date(item.date_created).getTime() || 0,
        type: item.title || item.type || item.alert_type || 'SOS Alert',
        source: item.reported_by || item.created_by || 'Unknown Guard',
        status: item.status || 'Pending'
      }));
    } 
    else if (activeTab.value === 'patrols') {
      const res = await authService.protectedApi.get(`/items/patrols?filter[tenant][_eq]=${tenantId}&sort=-date_created&limit=100`);
      rawData.value = res.data.data.map(item => ({
        ref: `PTR-${item.id}`,
        date: formatDate(item.date_created),
        _timestamp: new Date(item.date_created).getTime() || 0,
        type: 'Scheduled Patrol',
        source: item.user_id || 'Guard User',
        status: item.status || 'Scheduled'
      }));
    }
    else if (activeTab.value === 'dar') {
      const res = await authService.protectedApi.get(`/items/patrol_logs?filter[tenant][_eq]=${tenantId}&sort=-timestamp&limit=100`);
      rawData.value = res.data.data.map(item => ({
        ref: `LOG-${item.id}`,
        date: formatDate(item.timestamp),
        _timestamp: new Date(item.timestamp).getTime() || 0,
        type: item.log_type || 'Activity Log',
        source: item.guard_id || 'Guard System',
        status: 'Logged'
      }));
    }
    else if (activeTab.value === 'ai') {
      const res = await authService.protectedApi.get(`/items/frigateEvents?sort=-start_time&limit=50&filter[snapshot_file][_nnull]=true`);
      rawData.value = res.data.data.map(item => ({
        ref: `AI-${item.id}`,
        date: formatDate(item.start_time),
        _timestamp: new Date(item.start_time).getTime() || 0,
        type: item.label.toUpperCase(),
        source: item.camera || 'Unknown Camera',
        status: 'Auto-Logged'
      }));
    }
  } catch (error) {
    console.error(`Error fetching data for ${activeTab.value}:`, error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

watch(activeTab, () => {
  fetchData();
  closeDetails(); // Close drawer if open when switching tabs
});

const filterStartDate = ref('');
const filterEndDate = ref('');
const dateFilterApplied = ref(false);

const applyDateFilter = () => {
  if (filterStartDate.value || filterEndDate.value) {
    dateFilterApplied.value = true;
  }
};

const clearDateFilter = () => {
  filterStartDate.value = '';
  filterEndDate.value = '';
  dateFilterApplied.value = false;
};

const currentData = computed(() => {
  let data = rawData.value;
  
  if (dateFilterApplied.value) {
    const start = filterStartDate.value ? new Date(filterStartDate.value).getTime() : 0;
    const end = filterEndDate.value ? new Date(filterEndDate.value).getTime() + 86400000 : Infinity; // +1 day to include end day fully
    
    data = data.filter(item => {
      return item._timestamp >= start && item._timestamp <= end;
    });
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(item => 
      item.ref.toLowerCase().includes(q) || 
      item.type.toLowerCase().includes(q) || 
      item.source.toLowerCase().includes(q)
    );
  }
  
  return data;
});

// --- Drawer Logic ---
const selectedReport = ref(null);
const isGeneratingAi = ref(false);
const aiSummary = ref(null);

const openDetails = (item) => {
  selectedReport.value = item;
  aiSummary.value = null; // reset summary on new open
  isGeneratingAi.value = false;
};

const closeDetails = () => {
  selectedReport.value = null;
};

const generateAiSummary = () => {
  isGeneratingAi.value = true;
  // Mock AI Generation Delay
  setTimeout(() => {
    isGeneratingAi.value = false;
    aiSummary.value = `Based on the system logs at ${selectedReport.value.date}, an event categorized as "${selectedReport.value.type}" was recorded by ${selectedReport.value.source}. The current status is marked as "${selectedReport.value.status}". No critical deviations from standard operating procedure were detected in the immediate payload, and the incident requires standard review.`;
  }, 1500);
};

const getStatusColor = (status) => {
  const s = status.toLowerCase();
  if (s.includes('approved') || s.includes('resolved') || s.includes('closed') || s.includes('100%') || s.includes('completed')) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
  }
  if (s.includes('pending') || s.includes('investigating') || s.includes('scheduled')) {
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  }
  if (s.includes('missed') || s.includes('error') || s.includes('alert')) {
    return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
};

// --- Charts Logic ---
const primaryChartTitle = computed(() => {
  if (activeTab.value === 'patrols') return 'Zone Completion Rates';
  if (activeTab.value === 'dar') return 'Activity Volume Heatmap';
  if (activeTab.value === 'ai') return 'AI Detection Confidence';
  return 'Incident Timeline';
});

const primaryChartSubtitle = computed(() => {
  if (activeTab.value === 'patrols') return 'Performance tracking across zones';
  if (activeTab.value === 'dar') return 'Density of guard activities';
  if (activeTab.value === 'ai') return 'Confidence scores over time';
  return 'Volume of alerts over recent periods';
});

const primaryChartType = computed(() => {
  if (activeTab.value === 'patrols') return 'bar';
  if (activeTab.value === 'dar') return 'heatmap';
  if (activeTab.value === 'ai') return 'scatter';
  return 'area';
});

const primaryChartSeries = computed(() => {
  const base = totalRecords.value > 0 ? totalRecords.value : 20;
  
  if (activeTab.value === 'patrols') {
    return [
      { name: 'Completed', data: [85, 92, 78, 95, 88, 98] }, 
      { name: 'Missed', data: [15, 8, 22, 5, 12, 2] }
    ];
  }
  if (activeTab.value === 'dar') {
    return [
      { name: 'Morning', data: [10, 15, 20, 12, 8, 25, 30] },
      { name: 'Evening', data: [5, 8, 12, 20, 25, 15, 10] },
      { name: 'Night', data: [2, 3, 5, 4, 8, 2, 1] }
    ];
  }
  if (activeTab.value === 'ai') {
    return [
      { name: 'Intrusion', data: [[1, 95], [2, 88], [3, 99], [4, 75]] }, 
      { name: 'Loitering', data: [[1.5, 60], [2.5, 85], [3.5, 92]] }
    ];
  }
  
  // Area trend for incidents
  return [{ name: 'Records', data: [
    Math.round(base * 0.4), Math.round(base * 0.7), Math.round(base * 0.5),
    Math.round(base * 0.9), Math.round(base * 0.6), Math.round(base * 1.1),
    base
  ] }];
});

const primaryChartOptions = computed(() => {
  const isDark = document.documentElement.classList.contains('dark');
  const type = primaryChartType.value;
  
  if (type === 'bar') {
    return {
      chart: { stacked: true, toolbar: { show: false }, background: 'transparent' },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors: ['#10b981', '#ef4444'],
      xaxis: { 
        categories: ['North', 'South', 'East', 'West', 'Parking', 'Lobby'],
        labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: 600 } }
      },
      yaxis: { labels: { style: { colors: isDark ? '#475569' : '#cbd5e1', fontSize: '10px', fontWeight: 600 } } },
      grid: { show: true, borderColor: isDark ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
      legend: { show: true, position: 'top', fontSize: '11px', fontWeight: 600 }
    };
  }
  if (type === 'heatmap') {
    return {
      chart: { toolbar: { show: false }, background: 'transparent' },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors: ['#4f46e5'],
      xaxis: { 
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: 600 } }
      },
      grid: { show: false },
    };
  }
  if (type === 'scatter') {
    return {
      chart: { toolbar: { show: false }, background: 'transparent' },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors: ['#ef4444', '#f59e0b'],
      xaxis: { 
        type: 'numeric',
        labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: 600 } }
      },
      yaxis: { labels: { style: { colors: isDark ? '#475569' : '#cbd5e1', fontSize: '10px', fontWeight: 600 } } },
      grid: { show: true, borderColor: isDark ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
    };
  }
  
  // Area (Default)
  return {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', parentHeightOffset: 0 },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: ['#4f46e5'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: { 
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: 600 } }
    },
    yaxis: { 
      show: true,
      labels: { style: { colors: isDark ? '#475569' : '#cbd5e1', fontSize: '10px', fontWeight: 600 } }
    },
    grid: { show: true, borderColor: isDark ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  };
});

const secondaryChartTitle = computed(() => {
  if (activeTab.value === 'patrols') return 'Overall Pass Rate';
  return 'Status Distribution';
});

const secondaryChartSubtitle = computed(() => {
  if (activeTab.value === 'patrols') return 'Average across all active guards';
  return 'Current state breakdown';
});

const secondaryChartType = computed(() => {
  if (activeTab.value === 'patrols') return 'radialBar';
  return 'donut';
});

const secondaryChartSeries = computed(() => {
  if (activeTab.value === 'patrols') {
    return [85]; // 85% pass rate mock
  }
  
  const statusCounts = {};
  currentData.value.forEach(item => {
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  });
  return Object.values(statusCounts);
});

const secondaryChartOptions = computed(() => {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (activeTab.value === 'patrols') {
    return {
      chart: { type: 'radialBar', background: 'transparent' },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors: ['#10b981'],
      plotOptions: {
        radialBar: {
          hollow: { size: '70%' },
          dataLabels: {
            name: { show: true, fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' },
            value: { show: true, fontSize: '24px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }
          }
        }
      },
      labels: ['Passed']
    };
  }

  const statusCounts = {};
  currentData.value.forEach(item => {
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  });
  
  return {
    labels: Object.keys(statusCounts),
    chart: { type: 'donut', background: 'transparent' },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#64748b'],
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: true, position: 'bottom', fontSize: '11px', fontWeight: 600 },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 800,
              color: isDark ? '#f8fafc' : '#0f172a'
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '10px',
              fontWeight: 700,
              color: isDark ? '#64748b' : '#94a3b8'
            }
          }
        }
      }
    }
  };
});

// --- KPIs Logic ---
const totalRecords = computed(() => currentData.value.length);
const resolvedRecords = computed(() => currentData.value.filter(item => {
  const s = item.status.toLowerCase();
  return s.includes('approved') || s.includes('resolved') || s.includes('closed') || s.includes('100%') || s.includes('completed') || s.includes('logged') || s.includes('auto-logged');
}).length);
const pendingRecords = computed(() => currentData.value.filter(item => {
  const s = item.status.toLowerCase();
  return s.includes('pending') || s.includes('investigating') || s.includes('scheduled');
}).length);
const criticalRecords = computed(() => currentData.value.filter(item => {
  const s = item.status.toLowerCase();
  return s.includes('missed') || s.includes('error') || s.includes('alert') || s.includes('failed');
}).length);

const resolutionRate = computed(() => {
  if (totalRecords.value === 0) return 0;
  return Math.round((resolvedRecords.value / totalRecords.value) * 100);
});

// --- Export Logic ---
const downloadCSV = () => {
  if (currentData.value.length === 0) return;
  const headers = ['ID', 'Date', 'Type', 'Source', 'Status'];
  const rows = currentData.value.map(item => [
    item.ref, item.date, item.type, item.source, item.status
  ]);
  
  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `AccessEasy_Reports_${activeTab.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadPDF = () => {
  if (currentData.value.length === 0) return;
  const doc = new jsPDF('landscape');
  
  const reportType = tabs.find(t => t.id === activeTab.value)?.name || 'Security Report';
  const generatedDate = new Date().toLocaleString();
  
  // Brand Header Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  
  // Brand Logo / Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AccessEasy", 14, 22);
  
  // Subtitle
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("INTELLIGENT SECURITY OPERATIONS", 14, 29);
  
  // Report Meta Details
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(reportType, doc.internal.pageSize.width - 14, 22, { align: 'right' });
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedDate}`, doc.internal.pageSize.width - 14, 29, { align: 'right' });
  
  // KPI Summary Strip
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, 45, doc.internal.pageSize.width - 28, 16, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Records: ${totalRecords.value}`, 20, 54);
  doc.text(`Resolved: ${resolvedRecords.value}`, 75, 54);
  doc.text(`Action Required: ${pendingRecords.value}`, 130, 54);
  doc.text(`Critical Alerts: ${criticalRecords.value}`, 195, 54);

  // Table
  const headers = [['ID / Reference', 'Date & Time', 'Type', 'Assignee / Source', 'Status']];
  const data = currentData.value.map(item => [
    item.ref, item.date, item.type, item.source, item.status
  ]);
  
  autoTable(doc, {
    startY: 68,
    head: headers,
    body: data,
    theme: 'grid',
    styles: { 
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.1,
    },
    headStyles: { 
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 23, 42] },
      4: { halign: 'center', fontStyle: 'bold' } // Status
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    didDrawPage: function (data) {
      // Footer
      const str = "Page " + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(
        str + " - Confidential & Proprietary - AccessEasy Security",
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  doc.save(`AccessEasy_${activeTab.value}_Report.pdf`);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155;
}
</style>

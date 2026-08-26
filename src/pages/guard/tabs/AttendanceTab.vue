<template>
  <div class="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <!-- Top Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Guard Attendance & Roster
          </h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Real-time clock-in monitoring, shift compliance, and workforce availability
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          @click="loadAttendanceData"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>

        <!-- Pro Feature: Export Report -->
        <FeatureGate feature="attendance.advanced">
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            @click="exportCSV"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </FeatureGate>
      </div>
    </div>

    <!-- Pro: Advanced Operations Center Dashboard Strip -->
    <FeatureGate feature="attendance.advanced">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Total Roster -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Roster</span>
          <p class="text-xl font-black text-slate-900 dark:text-white mt-1">{{ stats.totalGuards }} <span class="text-[10px] text-slate-400 font-normal">Guards</span></p>
        </div>

        <!-- On Duty -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm border-l-4 border-l-emerald-500">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">On Duty</span>
          <p class="text-xl font-black text-emerald-600 mt-1">{{ stats.onDuty }} <span class="text-[10px] text-emerald-500 font-bold">Active</span></p>
        </div>

        <!-- Off Duty -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Off Duty</span>
          <p class="text-xl font-black text-slate-600 dark:text-slate-300 mt-1">{{ stats.offDuty }}</p>
        </div>

        <!-- Late Arrival -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm border-l-4 border-l-amber-500">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Late</span>
          <p class="text-xl font-black text-amber-600 mt-1">{{ stats.late }} <span class="text-[10px] text-amber-500 font-medium">Alerts</span></p>
        </div>

        <!-- Absent -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm border-l-4 border-l-rose-500">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Absent</span>
          <p class="text-xl font-black text-rose-600 mt-1">{{ stats.absent }}</p>
        </div>

        <!-- Shift Compliance % -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Compliance</span>
          <p class="text-xl font-black text-indigo-600 mt-1">{{ stats.complianceRate }}%</p>
        </div>
      </div>
    </FeatureGate>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-sm text-xs">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Status Filter -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            v-for="st in ['all', 'present', 'on_break', 'off_duty', 'absent']"
            :key="st"
            class="px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all"
            :class="statusFilter === st ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            @click="statusFilter = st"
          >
            {{ statusFilterLabel(st) }}
          </button>
        </div>

        <!-- Site Filter (Pro / Multi-site) -->
        <select
          v-model="selectedSiteFilter"
          class="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none"
        >
          <option value="">All Sites</option>
          <option v-for="site in sitesList" :key="site.id" :value="site.id">
            {{ site.name }}
          </option>
        </select>
      </div>

      <!-- Search Box -->
      <div class="relative w-full sm:w-64">
        <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search guard name, phone..."
          class="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loading" class="p-16 flex justify-center items-center gap-3 text-slate-400 text-xs">
        <Loader2 class="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading attendance logs...</span>
      </div>

      <div v-else-if="filteredList.length === 0" class="p-16 text-center text-slate-500 dark:text-slate-400">
        <Clock class="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">
          No Attendance Records Found
        </h3>
        <p class="text-xs text-slate-500">
          Try clearing filters or click Manual Check-In to record a guard attendance.
        </p>
      </div>

      <div v-else class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <tr>
              <th class="px-5 py-3.5">Security Guard</th>
              <th class="px-4 py-3.5">Site / Estate</th>
              <th class="px-4 py-3.5">Check-In</th>
              <th class="px-4 py-3.5">Live State</th>
              <th class="px-4 py-3.5">Check-Out</th>
              <th class="px-4 py-3.5">Verification</th>
              <th class="px-4 py-3.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <tr
              v-for="record in filteredList"
              :key="record.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <!-- Guard Identity -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-600">
                    {{ (record.guard_name || 'G')[0] }}
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white text-xs">{{ record.guard_name }}</h4>
                    <span class="text-[10px] text-slate-400 font-mono">{{ record.guard?.phone || 'No phone' }}</span>
                  </div>
                </div>
              </td>

              <!-- Site & Sector -->
              <td class="px-4 py-3.5">
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ record.site_name }}</span>
                <span v-if="record.zone_name" class="block text-[10px] text-slate-400">{{ record.zone_name }}</span>
              </td>

              <!-- Check-In Time -->
              <td class="px-4 py-3.5">
                <div v-if="record.check_in_time">
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {{ formatTime(record.check_in_time) }}
                  </span>
                  <span v-if="record.check_in_accuracy_m" class="block text-[10px] text-emerald-600 font-semibold">
                    GPS ±{{ record.check_in_accuracy_m }}m
                  </span>
                </div>
                <span v-else class="text-slate-400 italic">—</span>
              </td>

              <!-- Live State (from mobile app logs) -->
              <td class="px-4 py-3.5">
                <!-- On Break -->
                <div v-if="record.live_status === 'on_break' || record.status === 'on_break'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                  On Break
                  <span v-if="record.last_log_time" class="text-amber-500/70 font-normal ml-0.5">· {{ formatTime(record.last_log_time) }}</span>
                </div>
                <!-- Checked In -->
                <div v-else-if="record.live_status === 'checked_in' || (record.check_in_time && !record.check_out_time && !record.live_status)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  On Duty
                  <span v-if="record.check_in_time" class="text-emerald-600/60 font-normal ml-0.5">· {{ formatTime(record.check_in_time) }}</span>
                </div>
                <!-- Checked Out -->
                <div v-else-if="record.live_status === 'checked_out' || record.check_out_time"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                  Checked Out
                  <span v-if="record.check_out_time" class="text-slate-400 font-normal ml-0.5">· {{ formatTime(record.check_out_time) }}</span>
                </div>
                <!-- No activity yet -->
                <span v-else class="text-slate-400 text-[10px]">No punch yet</span>
              </td>

              <!-- Check-Out Time -->
              <td class="px-4 py-3.5">
                <span v-if="record.check_out_time" class="font-mono text-slate-800 dark:text-slate-200">
                  {{ formatTime(record.check_out_time) }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>

              <!-- Verification Method Column -->
              <td class="px-4 py-3.5">
                <div v-if="record.verification_mode === 'face_ai'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold shadow-sm">
                  <ScanFace class="w-3 h-3" />
                  <span>Face AI {{ record.confidence_score ? `(${record.confidence_score}%)` : '' }}</span>
                </div>
                <div v-else-if="record.verification_mode === 'nfc'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold">
                  <Radio class="w-3 h-3" />
                  <span>NFC Badge</span>
                </div>
                <div v-else-if="record.verification_mode === 'pin'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 text-[10px] font-bold">
                  <KeyRound class="w-3 h-3" />
                  <span>PIN Auth</span>
                </div>
                <div v-else class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                  <UserCheck class="w-3 h-3" />
                  <span>Manual</span>
                </div>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  :class="getStatusBadgeClass(record.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(record.status)" />
                  {{ record.status ? record.status.replace('_', ' ') : 'Present' }}
                  <span v-if="record.late_by_mins" class="ml-0.5">({{ record.late_by_mins }}m)</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Manual Check-In Modal -->
    <Teleport to="body">
      <div
        v-if="showManualModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showManualModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Manual Guard Check-In</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showManualModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitManualCheckIn" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Select Site *</label>
              <select v-model="manualForm.siteId" required class="ae-input w-full py-2">
                <option v-for="site in sitesList" :key="site.id" :value="site.id">{{ site.name }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Guard Name / ID *</label>
              <input
                v-model="manualForm.guardName"
                required
                placeholder="e.g. Kumar S (G-01)"
                class="ae-input w-full"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Assigned Zone / Sector</label>
              <input
                v-model="manualForm.zoneName"
                placeholder="e.g. Main Entrance Gate"
                class="ae-input w-full"
              />
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showManualModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Confirm Clock-In
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Guard Replacement Modal (Pro) -->
    <Teleport to="body">
      <div
        v-if="showReplacementModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showReplacementModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">Assign Guard Replacement</h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showReplacementModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl mb-4 text-xs text-amber-800 dark:text-amber-300">
            <strong>Absent Guard:</strong> {{ selectedAbsentRecord?.guard_name }} at {{ selectedAbsentRecord?.site_name }}
          </div>

          <form @submit.prevent="submitReplacement" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Select Replacement Guard *</label>
              <input
                v-model="replacementGuardName"
                required
                placeholder="e.g. Arun D (Available Reserve)"
                class="ae-input w-full"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Reason for Replacement</label>
              <input
                v-model="replacementReason"
                placeholder="e.g. Emergency leave, unreached on phone"
                class="ae-input w-full"
              />
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
                @click="showReplacementModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                Assign Replacement
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  Clock, RefreshCw, Download, UserCheck, Search, Loader2, X,
  ScanFace, Radio, KeyRound
} from 'lucide-vue-next';
import { attendanceService } from '@/services/attendanceService';
import { siteService } from '@/services/siteService';
import FeatureGate from '@/components/common/FeatureGate.vue';

const loading = ref(true);
const attendanceList = ref([]);
const sitesList = ref([]);
const stats = ref({
  totalGuards: 0,
  onDuty: 0,
  offDuty: 0,
  late: 0,
  absent: 0,
  complianceRate: 100
});

const statusFilter = ref('all');
const selectedSiteFilter = ref('');
const searchQuery = ref('');

const showManualModal = ref(false);
const showReplacementModal = ref(false);
const selectedAbsentRecord = ref(null);

const manualForm = ref({
  siteId: '',
  guardName: '',
  zoneName: ''
});

const replacementGuardName = ref('');
const replacementReason = ref('');
let pollInterval = null;
let _pollLocked = false;

// Map live_status → web status so filters work across both
const normalizeStatus = (r) => {
  // Prefer live_status from app logs if present
  const ls = r.live_status;
  if (ls === 'on_break') return 'on_break';
  if (ls === 'checked_out') return 'off_duty';
  if (ls === 'checked_in') return 'present';
  return r.status || 'absent';
};

const statusFilterLabel = (st) => {
  const labels = { all: 'All Guards', present: 'On Duty', on_break: 'On Break', off_duty: 'Off Duty', absent: 'Absent' };
  return labels[st] || st.replace('_', ' ');
};

const filteredList = computed(() => {
  let list = attendanceList.value;
  if (statusFilter.value !== 'all') {
    list = list.filter(r => normalizeStatus(r) === statusFilter.value);
  }
  if (selectedSiteFilter.value) {
    list = list.filter(r => String(r.site?.id || r.site) === String(selectedSiteFilter.value));
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(r => 
      (r.guard_name || '').toLowerCase().includes(q) ||
      (r.guard?.phone || '').includes(q) ||
      (r.site_name || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const formatTime = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(isoString.trim())) {
    const parts = isoString.trim().split(':');
    const d = new Date();
    d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || 0, 10));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return isoString;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200';
    case 'late':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200';
    case 'absent':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200';
    case 'on_break':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200';
    case 'off_duty':
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200';
  }
};

const getStatusDotClass = (status) => {
  switch (status) {
    case 'present': return 'bg-emerald-500';
    case 'late': return 'bg-amber-500';
    case 'absent': return 'bg-rose-500';
    case 'on_break': return 'bg-blue-500';
    default: return 'bg-slate-400';
  }
};

const loadAttendanceData = async (silent = false) => {
  // Prevent concurrent polling calls stacking up
  if (silent && _pollLocked) return;
  if (silent) _pollLocked = true;
  if (!silent) loading.value = true;
  try {
    const [att, st, sites] = await Promise.all([
      attendanceService.getTodayAttendance(),
      attendanceService.getAttendanceStats(),
      siteService.fetchSites()
    ]);
    attendanceList.value = att || [];
    stats.value = st || stats.value;
    if (sites && sites.length > 0) {
      sitesList.value = sites;
    }
  } catch (error) {
    console.error("Error loading attendance data:", error);
  } finally {
    if (!silent) loading.value = false;
  }
};

const handleCheckOut = async (record) => {
  try {
    await attendanceService.checkOut(record.id);
    await loadAttendanceData(true);
  } catch (e) {
    console.error("Failed to check out guard:", e);
  }
};

const handleStartBreak = async (record) => {
  try {
    await attendanceService.startBreak(record.id);
    await loadAttendanceData(true);
  } catch (e) {
    console.error("Failed to start break:", e);
  }
};

const handleEndBreak = async (record) => {
  try {
    await attendanceService.endBreak(record.id);
    await loadAttendanceData(true);
  } catch (e) {
    console.error("Failed to end break:", e);
  }
};

const openManualClockInModal = () => {
  manualForm.value = {
    siteId: sitesList.value[0]?.id || 'site-01',
    guardName: '',
    zoneName: ''
  };
  showManualModal.value = true;
};

const submitManualCheckIn = async () => {
  try {
    await attendanceService.checkIn(
      manualForm.value.guardName,
      manualForm.value.siteId,
      null,
      { accuracy: 10 }
    );
    showManualModal.value = false;
    await loadAttendanceData(true);
  } catch (e) {
    console.error("Failed to submit manual check-in:", e);
  }
};

const openReplacementModal = (record) => {
  selectedAbsentRecord.value = record;
  replacementGuardName.value = '';
  replacementReason.value = 'Guard Absent / Unresponsive';
  showReplacementModal.value = true;
};

const submitReplacement = async () => {
  if (!selectedAbsentRecord.value) return;
  try {
    await attendanceService.requestGuardReplacement(
      selectedAbsentRecord.value.guard?.id || selectedAbsentRecord.value.guard_name,
      selectedAbsentRecord.value.site?.id || selectedAbsentRecord.value.site,
      replacementGuardName.value,
      replacementReason.value
    );
    showReplacementModal.value = false;
    alert(`Replacement assigned successfully to ${replacementGuardName.value}`);
    await loadAttendanceData(true);
  } catch (e) {
    console.error("Failed to submit replacement:", e);
  }
};

const exportCSV = () => {
  const headers = ['Guard Name', 'Phone', 'Site', 'Zone', 'Check-In', 'Check-Out', 'Status'];
  const rows = filteredList.value.map(r => [
    r.guard_name,
    r.guard?.phone || '',
    r.site_name,
    r.zone_name || '',
    r.check_in_time || '',
    r.check_out_time || '',
    r.status
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `guard_attendance_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(async () => {
  await loadAttendanceData();
  // Poll every 30s — prevents API flood. 304s are fine (server-side cache hit)
  pollInterval = setInterval(async () => {
    if (_pollLocked) return;
    _pollLocked = true;
    try {
      await loadAttendanceData(true);
    } finally {
      _pollLocked = false;
    }
  }, 30000);
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
});
</script>

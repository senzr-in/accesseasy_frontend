<template>
  <div class="space-y-8 pb-12 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700">
    <template v-if="userRole === 'Guard'">
      <!-- Guard Security Dashboard -->
      <div class="flex flex-col gap-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Security Overview</h1>
            <p class="text-sm font-medium text-slate-500 mt-1">Welcome back, <span class="text-slate-700 dark:text-slate-300 font-bold">{{ userName }}</span> · {{ new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
          </div>
          <button @click="$router.push('/dashboard/authorize')" class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <ShieldCheck class="w-4 h-4" />
            Scan QR
          </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Authorized Today -->
          <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>
            <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 pl-2">Authorized</p>
            <p v-if="guardStatsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2">—</p>
            <p v-else class="text-3xl font-black text-slate-900 dark:text-white pl-2">{{ guardStats.authorized }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">Today's entries</p>
          </div>

          <!-- Unauthorized Today -->
          <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-2xl"></div>
            <p class="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2 pl-2">Denied</p>
            <p v-if="guardStatsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2">—</p>
            <p v-else class="text-3xl font-black text-rose-600 dark:text-rose-400 pl-2">{{ guardStats.unauthorized }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">Rejected scans</p>
          </div>

          <!-- Total Scans -->
          <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
            <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 pl-2">Total Scans</p>
            <p v-if="guardStatsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2">—</p>
            <p v-else class="text-3xl font-black text-slate-900 dark:text-white pl-2">{{ guardStats.authorized + guardStats.unauthorized }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">All events today</p>
          </div>

          <!-- Auth Rate -->
          <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-violet-500 rounded-l-2xl"></div>
            <p class="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2 pl-2">Auth Rate</p>
            <p v-if="guardStatsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2">—</p>
            <p v-else class="text-3xl font-black text-slate-900 dark:text-white pl-2">
              {{ guardStats.authorized + guardStats.unauthorized === 0 ? '—' : Math.round((guardStats.authorized / (guardStats.authorized + guardStats.unauthorized)) * 100) + '%' }}
            </p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pl-2">Success ratio</p>
          </div>
        </div>

        <!-- Recent Scans Feed -->
        <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 class="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">Recent Access Events</h2>
            <button @click="$router.push('/dashboard/settings/logs')" class="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest">View All →</button>
          </div>
          <div v-if="guardStatsLoading" class="flex items-center justify-center h-32 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Loading feed...
          </div>
          <div v-else-if="guardRecentLogs.length === 0" class="flex items-center justify-center h-32 text-[10px] font-black uppercase tracking-widest text-slate-400">
            No events today
          </div>
          <div v-else class="divide-y divide-slate-100 dark:divide-zinc-800">
            <div v-for="log in guardRecentLogs" :key="log.id" class="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
              <div :class="['w-2 h-2 rounded-full shrink-0', log.ValidLogs === 'authorized' ? 'bg-emerald-500' : 'bg-rose-500']"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {{ getEmployeeName(log) }}
                </p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ formatGuardTime(log.date_created) }}</p>
              </div>
              <span :class="['text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md', log.ValidLogs === 'authorized' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400']">
                {{ log.ValidLogs === 'authorized' ? 'Auth' : 'Denied' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button @click="$router.push('/dashboard/authorize')" class="group p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all text-left flex items-center gap-4">
            <ShieldCheck class="w-8 h-8 opacity-90 shrink-0" />
            <div>
              <h3 class="text-base font-black mb-0.5">Scan & Authorize</h3>
              <p class="text-xs font-medium text-indigo-100">Open QR scanner to verify employee entry.</p>
            </div>
          </button>
          <button @click="$router.push('/dashboard/settings/logs')" class="group p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-4">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <List class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white mb-0.5">Live Event Logs</h3>
              <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">View all access events across entry points.</p>
            </div>
          </button>
        </div>

      </div>
    </template>


    <template v-else-if="userRole === 'Employee'">
      <!-- Employee Dashboard View -->
      <div class="flex flex-col gap-6">
        <div>
           <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Welcome, {{ userName }}</h1>
           <p class="text-sm font-medium text-slate-500 mt-1">Here is your personal access summary for today.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button @click="$router.push('/dashboard/my-access')" class="group p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all text-left relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <QrCode class="w-10 h-10 mb-4 opacity-90" />
            <h3 class="text-xl font-black mb-1">Generate Mobile Key</h3>
            <p class="text-xs font-medium text-indigo-100">Create a dynamic QR code for secure door access.</p>
          </button>
          
          <button @click="$router.push('/dashboard/my-attendance')" class="group p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-all text-left">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <Calendar class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-1">My Attendance & Logs</h3>
            <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">Review your daily check-in times and entry history.</p>
          </button>
        </div>
      </div>
    </template>

    
    <template v-else>
      <!-- ==========================================
           ZONE 1: QUICK OPERATIONS (Immediate Action)
           ========================================== -->


      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="action in quickActions"
          :key="action.label"
          @click="action.onClick"
          :class="['group flex items-center gap-4 p-5 rounded-xl border-slate-200 dark:border-zinc-800 border bg-white dark:bg-zinc-950 shadow-md hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98]', action.borderClass]"
        >
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors', action.iconBg]">
            <component :is="action.icon" :class="['w-5 h-5', action.iconColor]" />
          </div>
          <div>
            <p :class="['text-[13px] font-bold', action.labelColor]">{{ action.label }}</p>
            <p class="text-[9px] font-black text-slate-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">{{ action.sub }}</p>
          </div>
        </button>
      </div>
    <!-- ==========================================
         ZONE 2: SECURITY & HARDWARE (Critical)
         ========================================== -->


      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Unauthorized Attempts (High Priority Alert) -->
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-3 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
          <div class="flex items-center justify-between pl-2">
            <span class="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Unauthorized</span>
            <div class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
              <ShieldAlert class="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div class="pl-2">
            <p v-if="statsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-800 animate-pulse">—</p>
            <p v-else class="text-3xl font-black text-rose-600 dark:text-rose-500">{{ counts.unauthorized }}</p>
            <p class="text-[9px] font-black text-rose-400/80 uppercase tracking-widest mt-1">Today's Denials</p>
          </div>
        </div>

        <!-- Authorized Access -->
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-3 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-zinc-800 group-hover:bg-emerald-500 transition-colors"></div>
          <div class="flex items-center justify-between pl-2">
            <span class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Authorized</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <ShieldCheck class="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div class="pl-2">
            <p v-if="statsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-800 animate-pulse">—</p>
            <p v-else class="text-3xl font-black text-slate-900 dark:text-white">{{ counts.authorized }}</p>
            <p class="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Successful Entries</p>
          </div>
        </div>

        <!-- Devices Status -->
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-3 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-zinc-800 group-hover:bg-blue-500 transition-colors"></div>
          <div class="flex items-center justify-between pl-2">
            <span class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Online Devices</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
              <Server class="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div class="pl-2">
            <p v-if="statsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-800 animate-pulse">—</p>
            <div v-else class="flex items-baseline gap-2">
              <p class="text-3xl font-black text-slate-900 dark:text-white">{{ counts.devices }}</p>
              <p class="text-sm font-bold text-slate-400 dark:text-zinc-600">/ {{ counts.devices }}</p>
            </div>
            <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">100% Operational</p>
          </div>
        </div>

        <!-- Active Doors -->
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-3 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-zinc-800 group-hover:bg-indigo-500 transition-colors"></div>
          <div class="flex items-center justify-between pl-2">
            <span class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Monitored Doors</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <DoorOpen class="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div class="pl-2">
            <p v-if="statsLoading" class="text-3xl font-black text-slate-200 dark:text-zinc-800 animate-pulse">—</p>
            <p v-else class="text-3xl font-black text-slate-900 dark:text-white">{{ counts.doors }}</p>
            <p class="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Active Access Points</p>
          </div>
        </div>
      </div>
    <!-- ==========================================
         ZONE 3: ANALYTICS & LIVE FEED
         ========================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      
      <!-- Analytics (Left) -->
      <div class="space-y-4">


        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-md flex flex-col justify-center h-[calc(100%-2.5rem)]">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Access Health Ratio</h3>
            <span class="text-[9px] font-black text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 uppercase tracking-widest">{{ totalLogs }} Events Today</span>
          </div>
          
          <div v-if="statsLoading" class="w-full h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse"></div>
          <div v-else class="space-y-4">
            <div class="flex px-1 justify-between text-[11px] font-black tracking-widest uppercase mb-3">
              <span class="text-emerald-600 dark:text-emerald-500">{{ authPercentage }}% Authorized</span>
              <span class="text-rose-600 dark:text-rose-500 shrink-0">{{ 100 - authPercentage }}% Denied</span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full h-3 bg-rose-500/20 rounded-full overflow-hidden flex border border-rose-500/10">
              <div class="h-full bg-emerald-500 transition-all duration-1000 border-r border-slate-900/10" :style="{ width: `${authPercentage}%` }"></div>
            </div>
            <p v-if="authPercentage < 80" class="text-[10px] text-amber-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-4">
              <AlertTriangle class="w-3.5 h-3.5" /> High rejection rate detected
            </p>
          </div>
        </div>
      </div>

      <!-- Live Activity Log (Right) -->
      <div class="space-y-4">

        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-md h-[calc(100%-2.5rem)] flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              Recent Activity 
              <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 text-[9px] font-black tracking-widest uppercase">
                <span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span></span> LIVE
              </span>
            </h3>
            <router-link to="/dashboard/settings/logs" class="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
              View Database <ArrowUpRight class="w-3.5 h-3.5" />
            </router-link>
          </div>
          
          <div class="overflow-y-auto flex-1">
            <table class="w-full text-sm text-left">
              <thead class="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0">
                <tr>
                  <th class="px-5 py-3">Identity</th>
                  <th class="px-5 py-3">Location</th>
                  <th class="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                <tr v-if="recentLogsLoading" class="h-32 bg-slate-50/50 dark:bg-zinc-900/50">
                  <td colspan="3" class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading feed...</td>
                </tr>
                <tr v-else-if="recentLogs.length === 0" class="h-32 bg-slate-50/50 dark:bg-zinc-900/50">
                  <td colspan="3" class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">No events logged yet.</td>
                </tr>
                <tr
                  v-else
                  v-for="log in recentLogs"
                  :key="log.id"
                  class="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors group"
                >
                  <td class="px-5 py-3">
                    <div class="text-[12px] font-semibold text-slate-900 dark:text-white">{{ getEmployeeName(log) }}</div>
                    <div class="text-[9px] text-slate-500 dark:text-zinc-500 font-black uppercase tracking-widest mt-1">{{ formatTime(log.date_created) }}</div>
                  </td>
                  <td class="px-5 py-3 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    <div class="flex items-center gap-1.5">
                      <DoorOpen class="w-3.5 h-3.5 text-slate-400" />
                      {{ log.door?.doorName || '—' }}
                    </div>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span v-if="log.ValidLogs === 'authorized' || log.ValidLogs === true" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-widest">
                      <CheckCircle class="w-3 h-3 border-emerald-500" /> Auth
                    </span>
                    <span v-else class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 uppercase tracking-widest">
                      <XCircle class="w-3 h-3 text-rose-500" /> Denied
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>


    </template>
    <!-- Dialogs -->
    <DoorRegistrationDialog v-model="showDoorDialog" @success="fetchStats" />
    <AddEmployeeDialog v-model="showEmployeeDialog" @success="fetchStats" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import {
  Building, Users, ShieldCheck, Server,
  DoorOpen, UserPlus, Shield, Zap, Activity, ArrowUpRight, ArrowRight,
  CheckCircle, XCircle, ShieldAlert, BarChart3, AlertTriangle, QrCode, Calendar, List
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import DoorRegistrationDialog from '@/pages/devicesManager/doors/doorRegistrationDialog.vue';
import AddEmployeeDialog from '@/pages/employee/my-teams/personalDetails/addEmployeeDialog.vue';

const router = useRouter();
let token = authService.getToken();
let tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
let rawUser = authService.getUserData();

const userName = computed(() => {
  if (!rawUser) return 'Employee';
  return `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim() || 'Employee';
});
const userRole = computed(() => authService.getUserRole() || rawUser?.role?.name || 'Employee');

// Dialog state
const showDoorDialog = ref(false);
const showEmployeeDialog = ref(false);

// Stats State
const statsLoading = ref(true);
const recentLogsLoading = ref(true);
const counts = ref({ doors: 0, employees: 0, groups: 0, devices: 0, authorized: 0, unauthorized: 0 });
const recentLogs = ref([]);

// Guard-specific stats
const guardStatsLoading = ref(true);
const guardStats = ref({ authorized: 0, unauthorized: 0 });
const guardRecentLogs = ref([]);

const formatGuardTime = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return dateString; }
};

const loadDashboardData = async () => {
  if (!token || !tenantId) return;
  const today = new Date().toISOString().split('T')[0];
  const headers = { Authorization: `Bearer ${token}` };

  if (userRole.value === 'Guard') {
    guardStatsLoading.value = true;
    try {
      const response = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
        action: 'main-dashboard',
        tenantId,
        today,
        role: 'Guard'
      }, { headers });
      
      const data = response.data;
      guardStats.value.authorized = data.authorized || 0;
      guardStats.value.unauthorized = data.unauthorized || 0;
      guardRecentLogs.value = data.recentLogs || [];
    } catch (e) {
      console.error('Guard stats fetch failed:', e);
    } finally {
      guardStatsLoading.value = false;
    }
  } else {
    statsLoading.value = true;
    recentLogsLoading.value = true;
    try {
      const response = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
        action: 'main-dashboard',
        tenantId,
        today,
        role: userRole.value
      }, { headers });

      const data = response.data;
      counts.value = {
        doors: data.doors || 0,
        employees: data.employees || 0,
        groups: data.groups || 0,
        devices: data.devices || 0,
        authorized: data.authorized || 0,
        unauthorized: data.unauthorized || 0
      };
      recentLogs.value = data.recentLogs || [];
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      statsLoading.value = false;
      recentLogsLoading.value = false;
    }
  }
};

const fetchStats = loadDashboardData;

// Computed Metrics
const totalLogs = computed(() => counts.value.authorized + counts.value.unauthorized);
const authPercentage = computed(() => {
  if (totalLogs.value === 0) return 100;
  return Math.round((counts.value.authorized / totalLogs.value) * 100);
});

onMounted(async () => {
  // Wait for currentUserTenant to fully initialize (async on first login)
  await currentUserTenant.initialize();

  // Refresh variables after initialization (they may have been null at setup time)
  token = authService.getToken();
  tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
  rawUser = authService.getUserData();

  loadDashboardData();
});

// Helpers
const getEmployeeName = (log) => {
  let first_name = '';
  let last_name = '';
  
  if (log?.employeeId?.assignedUser) {
    first_name = log.employeeId.assignedUser.first_name || '';
    last_name = log.employeeId.assignedUser.last_name || '';
  } else if (log?.employeeId) {
    first_name = log.employeeId.first_name || log.employeeId.firstName || '';
    last_name = log.employeeId.last_name || log.employeeId.lastName || '';
  }

  const fullName = `${first_name} ${last_name}`.trim();
  
  if (fullName) return fullName;
  if (log?.name) return log.name;
  if (log?.employeeName) return log.employeeName;
  
  return 'Unknown Guest';
};

const formatTime = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    return format(new Date(dateString), 'hh:mm a • MMM dd');
  } catch {
    return dateString;
  }
};

// Quick Actions Configuration
const quickActions = computed(() => [
  {
    label: 'Register Door', sub: 'Add new hardware point', 
    icon: DoorOpen, iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white', iconColor: 'text-indigo-600 dark:text-indigo-400 group-hover:text-white',
    labelColor: 'text-slate-900 dark:text-white', borderClass: 'border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50',
    onClick: () => { showDoorDialog.value = true; }
  },
  {
    label: 'New Employee', sub: 'Issue access credentials',
    icon: UserPlus, iconBg: 'bg-violet-50 dark:bg-violet-500/10 group-hover:bg-violet-500 group-hover:text-white', iconColor: 'text-violet-600 dark:text-violet-400 group-hover:text-white',
    labelColor: 'text-slate-900 dark:text-white', borderClass: 'border-slate-200 dark:border-zinc-800 hover:border-violet-500/50',
    onClick: () => { showEmployeeDialog.value = true; }
  },
  {
    label: 'Access Groups', sub: 'Manage clearances',
    icon: Shield, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white', iconColor: 'text-emerald-600 dark:text-emerald-400 group-hover:text-white',
    labelColor: 'text-slate-900 dark:text-white', borderClass: 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50',
    onClick: () => router.push('/dashboard/easy-access/configurators/access-levels')
  },
  {
    label: 'Add Guard', sub: 'Assign security personnel',
    icon: ShieldCheck, iconBg: 'bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-white', iconColor: 'text-amber-600 dark:text-amber-400 group-hover:text-white',
    labelColor: 'text-slate-900 dark:text-white', borderClass: 'border-slate-200 dark:border-zinc-800 hover:border-amber-500/50',
    onClick: () => router.push('/dashboard/guards')
  }
]);
</script>

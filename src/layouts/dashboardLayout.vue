<template>
  <div class="flex h-screen bg-slate-100 dark:bg-[#0b0f19] overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-300">
    <div class="flex w-full h-full overflow-hidden">
      <!-- Sidebar -->
      <component :is="activeSidebar" />

      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">

        <!-- 7-Day Free Trial Notification Banner -->
        <TrialBanner />

        <!-- Real-Time Emergency SOS Panic Alert Banner -->
        <transition
          enter-active-class="transition-all ease-out duration-300"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition-all ease-in duration-200"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
        >
          <div
            v-if="topSosAlert && appMode === 'patrol'"
            class="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 shadow-lg shadow-red-500/20 border-b border-red-500 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 animate-pulse"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5 text-white animate-bounce" />
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                    EMERGENCY SOS PANIC
                  </span>
                  <span class="text-xs font-bold truncate">
                    {{ topSosAlert.title || 'Guard SOS Distress Signal' }}
                  </span>
                </div>
                <p class="text-[11px] text-red-100 truncate">
                  Officer: <strong>{{ topSosAlert.reported_by || topSosAlert.guard_name || 'Guard' }}</strong> · Location: <strong>{{ topSosAlert.location || topSosAlert.site || topSosAlert.zone_name || 'Patrol Site' }}</strong> · {{ getFormattedAlertTime(topSosAlert.date_created) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="openAlertDetails(topSosAlert)"
                class="px-3 py-1 bg-white text-red-700 hover:bg-red-50 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                View Details
              </button>
              <button
                @click="navigateTo('/dashboard/settings/escalation')"
                class="px-3 py-1 bg-red-950/40 hover:bg-red-950/60 text-white border border-white/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Escalation Matrix
              </button>
              <button
                @click="resolveAlert(topSosAlert.id)"
                class="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                title="Dismiss Alert"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </transition>


                <!-- Top Nano Loading Progress Bar -->
        <div
          v-if="isPageNavigating"
          class="h-[3px] w-full bg-slate-200/50 dark:bg-slate-800 overflow-hidden shrink-0 relative z-50"
        >
          <div
            class="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"
            :style="{ width: pageNavProgress + '%' }"
          ></div>
        </div>

        <!-- Sleek Operational Sub-Header -->
        <header class="h-11 px-4 sm:px-6 bg-white/75 dark:bg-[#111827]/75 backdrop-blur-md border-b border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-3 shrink-0 z-20 transition-colors">
          <!-- Left: Breadcrumb Navigation -->
          <div class="flex items-center gap-2 min-w-0">
            <nav class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
              <router-link
                to="/dashboard"
                class="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-1 shrink-0"
              >
                <Shield class="w-3.5 h-3.5 text-indigo-500" />
                <span class="hidden sm:inline font-semibold">Workforce</span>
              </router-link>
              <ChevronRight class="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
              <span class="font-bold text-slate-800 dark:text-slate-100 truncate text-[11px] sm:text-xs tracking-tight">
                {{ currentPageTitle }}
              </span>
            </nav>
          </div>

          <!-- Right: Status, Refresh & Support -->
          <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <!-- Live Operational Heartbeat Badge -->
            <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10.5px] font-bold">
              <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Live System</span>
            </div>

            <!-- Fast View Refresh Button -->
            <button
              @click="triggerManualRefresh"
              :disabled="isRefreshing"
              class="h-7 px-2 sm:px-2.5 rounded-lg border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Refresh Current View"
            >
              <RotateCw class="w-3 h-3" :class="{ 'animate-spin text-indigo-500': isRefreshing }" />
              <span class="hidden md:inline">{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
            </button>

            <!-- WhatsApp Support Shortcut -->
            <button
              @click="openGlobalWhatsAppSupport"
              class="h-7 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Live WhatsApp Support"
            >
              <MessageCircle class="w-3 h-3" />
              <span class="hidden lg:inline">Support</span>
            </button>
          </div>
        </header>

        <!-- Page Content with Smooth Micro-Transition -->
        <main class="flex-1 flex flex-col overflow-hidden relative p-3 sm:p-5">
          <router-view v-slot="{ Component, route }">
            <div :key="route.path" class="w-full h-full flex-1 flex flex-col overflow-hidden animate-page-enter">
              <component :is="Component" />
            </div>
          </router-view>
        </main>
      </div>
    </div>

    <!-- 7-Day Trial Welcome Popup -->
    <TrialWelcomeModal />
    <!-- Alert Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedAlertForDetail"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="relative w-full max-w-md bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-255">
          <!-- Header (Red for SOS, Amber for Missed) -->
          <div
            class="px-6 py-5 flex items-center gap-3 border-b"
            :class="(selectedAlertForDetail.type?.toLowerCase() === 'sos' || selectedAlertForDetail.severity?.toLowerCase() === 'critical' || selectedAlertForDetail.title?.toLowerCase().includes('sos')) ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'"
          >
            <AlertTriangle v-if="(selectedAlertForDetail.type?.toLowerCase() === 'sos' || selectedAlertForDetail.severity?.toLowerCase() === 'critical' || selectedAlertForDetail.title?.toLowerCase().includes('sos'))" class="w-6 h-6 animate-pulse" />
            <Clock v-else class="w-6 h-6" />
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider leading-none">
                {{ (selectedAlertForDetail.type?.toLowerCase() === 'sos' || selectedAlertForDetail.severity?.toLowerCase() === 'critical' || selectedAlertForDetail.title?.toLowerCase().includes('sos')) ? 'SOS Emergency Alert' : 'Missed Patrol Alert' }}
              </h3>
              <p class="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold mt-1.5 uppercase tracking-wider">
                ID: {{ selectedAlertForDetail.id }}
              </p>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <div class="space-y-3 text-xs">
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Guard / Officer</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedAlertForDetail.reported_by || selectedAlertForDetail.guard_name || 'Unassigned' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Location / Zone</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedAlertForDetail.location || selectedAlertForDetail.site || selectedAlertForDetail.zone_name || 'Unknown Location' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Occurred Time</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ getFormattedDateTime(selectedAlertForDetail.date_created) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Current Status</span>
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  {{ selectedAlertForDetail.status || 'Unresolved' }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Alert Description:</p>
              {{ (selectedAlertForDetail.type?.toLowerCase() === 'sos' || selectedAlertForDetail.severity?.toLowerCase() === 'critical' || selectedAlertForDetail.title?.toLowerCase().includes('sos'))
                  ? `Guard ${selectedAlertForDetail.reported_by || selectedAlertForDetail.guard_name || 'Unknown'} triggered a panic alarm (SOS) from the guard mobile application. Location: ${selectedAlertForDetail.location || selectedAlertForDetail.site || selectedAlertForDetail.zone_name || 'Patrol Area'}. ${selectedAlertForDetail.description ? 'Notes: ' + selectedAlertForDetail.description : ''}`
                  : `The scheduled patrol round for ${selectedAlertForDetail.zone_name || selectedAlertForDetail.location || 'the designated zone'} was missed by the assigned guard. No check-ins were registered.`
              }}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex justify-end gap-2.5">
            <button
              @click="selectedAlertForDetail = null"
              class="h-9 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-slate-700 dark:text-slate-300"
            >
              Close
            </button>
            <button
              @click="resolveAlertFromDetail(selectedAlertForDetail.id)"
              class="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-500/10"
            >
              <CheckCheck class="w-4 h-4" /> Resolve & Dismiss
            </button>
          </div>
        </div>
      </div>
    </Teleport>


    <!-- App Download Modal -->
    <AppDownloadModal v-model="showDownloadAppModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Clock, X, AlertTriangle, CheckCheck, MessageCircle, Smartphone, Shield, ChevronRight, RotateCw, CheckCircle2 } from 'lucide-vue-next';
import SecuritySidebar from '@/components/layout/SecuritySidebar.vue';
import WorkforceSidebar from '@/components/layout/WorkforceSidebar.vue';
import TrialBanner from '@/components/layout/TrialBanner.vue';
import TrialWelcomeModal from '@/components/layout/TrialWelcomeModal.vue';
import AppDownloadModal from '@/components/common/AppDownloadModal.vue';
import { authService } from '@/services/authService';
import { patrolService } from '@/services/patrolService';

const showDownloadAppModal = ref(false);

const openGlobalWhatsAppSupport = () => {
  const text = 'Hi AccessEasy Support Team, I need assistance with our Security & Patrol platform.';
  window.open(`https://wa.me/919442566276?text=${encodeURIComponent(text)}`, '_blank');
};

const route = useRoute();
const router = useRouter();

const isPageNavigating = ref(false);
const pageNavProgress = ref(0);
let navProgressTimer = null;

const startNavProgress = () => {
  isPageNavigating.value = true;
  pageNavProgress.value = 15;
  if (navProgressTimer) clearInterval(navProgressTimer);
  navProgressTimer = setInterval(() => {
    if (pageNavProgress.value < 85) {
      pageNavProgress.value += Math.floor(Math.random() * 15) + 10;
    }
  }, 80);
};

const completeNavProgress = () => {
  pageNavProgress.value = 100;
  if (navProgressTimer) clearInterval(navProgressTimer);
  setTimeout(() => {
    isPageNavigating.value = false;
    pageNavProgress.value = 0;
  }, 220);
};

let unhookRouterBefore = null;
let unhookRouterAfter = null;

const isRefreshing = ref(false);
const triggerManualRefresh = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  startNavProgress();
  try {
    await fetchAlerts();
    window.dispatchEvent(new CustomEvent('accesseasy:refresh'));
  } finally {
    completeNavProgress();
    setTimeout(() => {
      isRefreshing.value = false;
    }, 350);
  }
};


const isNotificationsOpen = ref(false);
const activeAlertsList = ref([]);

const topSosAlert = computed(() => {
  return activeAlertsList.value.find(a => {
    if (!a || a.status === 'resolved' || a.status === 'closed') return false;
    const sev = (a.severity || '').toLowerCase();
    const typeStr = (a.type || '').toLowerCase();
    const titleStr = (a.title || '').toLowerCase();
    return sev === 'critical' || 
      typeStr.includes('sos') || 
      titleStr.includes('sos') || 
      titleStr.includes('emergency') || 
      titleStr.includes('threat') || 
      titleStr.includes('intruder') ||
      titleStr.includes('duress');
  }) || null;
});

const getDismissedAlertIds = () => {
  try {
    const raw = localStorage.getItem('accesseasy_dismissed_alerts');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveDismissedAlertId = (alertId) => {
  try {
    const dismissed = getDismissedAlertIds();
    const idToSave = alertId || 'dummy_unknown_alert';
    if (!dismissed.includes(idToSave)) {
      dismissed.push(idToSave);
      localStorage.setItem('accesseasy_dismissed_alerts', JSON.stringify(dismissed));
    }
  } catch (e) {}
};

const fetchAlerts = async () => {
  try {
    const alerts = await patrolService.getAlerts();
    const dismissedIds = new Set(getDismissedAlertIds());
    const unresolved = (alerts || []).filter(a => a && a.status !== 'resolved' && a.status !== 'closed' && !dismissedIds.has(a.id));
    
    // Reset seen state if a new alert arrives
    const currentIds = new Set(activeAlertsList.value.map(a => a.id));
    const hasNewAlert = unresolved.some(a => !currentIds.has(a.id));
    if (hasNewAlert) {
      hasSeenAlerts.value = false;
    }
    
    activeAlertsList.value = unresolved;
  } catch (error) {
    console.error("Failed to fetch alerts for navbar:", error);
  }
};



const resolveAlert = async (alertId) => {
  saveDismissedAlertId(alertId);
  activeAlertsList.value = activeAlertsList.value.filter(a => a.id && a.id !== alertId);
  try {
    if (alertId) await patrolService.updateAlertStatus(alertId, 'resolved');
  } catch (error) {
    console.error("Failed to resolve alert from navbar:", error);
  }
};

const selectedAlertForDetail = ref(null);

const openAlertDetails = (alert) => {
  selectedAlertForDetail.value = alert;
  isNotificationsOpen.value = false; // Close the popover
};

const resolveAlertFromDetail = async (alertId) => {
  await resolveAlert(alertId);
  selectedAlertForDetail.value = null; // Close the detail modal
};

const getFormattedDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  } catch (e) {
    return dateStr;
  }
};



const getFormattedAlertTime = (dateStr) => {
  if (!dateStr) return 'just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const diffMs = new Date() - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
};

const navigateTo = (path) => {
  router.push(path);
};



const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const activeSidebar = computed(() => {
  if (appMode === 'patrol' || appMode === 'security') return SecuritySidebar;
  return WorkforceSidebar;
});



const _userData = authService.getUserData();
const userName = computed(() => {
  if (!_userData) return 'Admin User';
  return `${_userData.first_name || ''} ${_userData.last_name || ''}`.trim() || 'Admin User';
});

const handleSignOut = async () => {
  authService.logout();
  router.push('/login');
};

let alertsPollTimer = null;
let isFetchingAlerts = false;

onMounted(() => {
  unhookRouterBefore = router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
      startNavProgress();
    }
    next();
  });
  unhookRouterAfter = router.afterEach(() => {
    completeNavProgress();
  });

  fetchAlerts();
  // Poll every 20 seconds for SOS and patrol alerts
  alertsPollTimer = setInterval(async () => {
    if (isFetchingAlerts) return;
    isFetchingAlerts = true;
    try {
      await fetchAlerts();
    } finally {
      isFetchingAlerts = false;
    }
  }, 20000);
});

onUnmounted(() => {
  if (unhookRouterBefore) unhookRouterBefore();
  if (unhookRouterAfter) unhookRouterAfter();
  if (navProgressTimer) clearInterval(navProgressTimer);
  if (alertsPollTimer) clearInterval(alertsPollTimer);
});

const currentPageTitle = computed(() => {
  const path = route.path || '';

  if (path.includes('/dashboard/employee')) return 'Employees';
  if (path.includes('/dashboard/attendance') || path.includes('/dashboard/myAttendance')) return 'Attendance';
  if (path.includes('/dashboard/leave')) return 'Leave Management';
  if (path.includes('/dashboard/doors') || path.includes('/dashboard/door')) return 'Access Doors';
  if (path.includes('/dashboard/devices') || path.includes('/dashboard/device')) return 'Device Fleet';
  if (path.includes('/dashboard/accesslevel')) return 'Access Levels';
  if (path.includes('/dashboard/task')) return 'Task Management';
  if (path.includes('/dashboard/payroll')) return 'Payroll';
  if (path.includes('/dashboard/schedules')) return 'Schedules';
  if (path.includes('/dashboard/rules')) return 'Access Rules';
  if (path.includes('/dashboard/settings/devices') || path.includes('/dashboard/settings/patrol-devices')) return 'Device Fleet';
  if (path.includes('/dashboard/settings/escalation')) return 'Emergency Escalation';
  if (path.includes('/dashboard/settings/patrol-shifts') || path.includes('/dashboard/settings/shifts')) return 'Shift Scheduler';
  if (path.includes('/dashboard/settings/subscription') || path.includes('/dashboard/settings/plans')) return 'Subscription & Plans';
  if (path.includes('/dashboard/settings/logs')) return 'Event Logs';
  if (path.includes('/dashboard/settings/zones')) return 'Zones & Access Points';
  if (path.includes('/dashboard/settings/checkpoints')) return 'Checkpoints';
  if (path.includes('/dashboard/settings')) return 'Settings';
  if (path.includes('/dashboard/sites')) return 'Sites & Geofences';
  if (path.includes('/dashboard/guards/attendance')) return 'Guard Attendance';
  if (path.includes('/dashboard/guards')) return 'Guards & Staff';
  if (path.includes('/dashboard/patrols/checkpoints')) return 'Patrol Checkpoints';
  if (path.includes('/dashboard/patrols/history')) return 'Patrol History';
  if (path.includes('/dashboard/patrols/create')) return 'Create Patrol';
  if (path.includes('/dashboard/patrols')) return 'Workforce Dashboard';
  if (path.includes('/dashboard/incidents')) return 'Incident Management';
  if (path.includes('/dashboard/reports')) return 'Reports & Analytics';
  if (path.includes('/dashboard/profile')) return 'Profile';
  if (path.includes('/dashboard/help')) return 'Help & Support';
  return 'Patrol Command';
});
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

/* Smooth Page Navigation Keyframe Animation */
@keyframes pageEnter {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-page-enter {
  animation: pageEnter 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>

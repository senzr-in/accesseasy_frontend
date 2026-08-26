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
            v-if="topSosAlert"
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

        <!-- Onboarding Banner -->
        <OnboardingBanner />

        <!-- Page Content -->
        <main class="flex-1 flex flex-col overflow-hidden relative p-4 sm:p-5">
          <router-view class="flex-1 min-h-0" />
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import { Building, Shield, MapPin, ChevronDown, ChevronRight, Search, Bell, Sun, Moon, User, Settings, Lock, LogOut, HelpCircle, AlertCircle, Clock, X, AlertTriangle, CheckCheck } from 'lucide-vue-next';
import SecuritySidebar from '@/components/layout/SecuritySidebar.vue';
import WorkforceSidebar from '@/components/layout/WorkforceSidebar.vue';
import OnboardingBanner from '@/components/layout/OnboardingBanner.vue';
import TrialBanner from '@/components/layout/TrialBanner.vue';
import TrialWelcomeModal from '@/components/layout/TrialWelcomeModal.vue';
import { authService } from '@/services/authService';
import { patrolService } from '@/services/patrolService';
import { onboardingService } from '@/services/onboardingService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { generateEncryptedQrToken } from '@/utils/security/access-control';
import { useZoneFilter } from '@/composables/useZoneFilter';

const route = useRoute();
const router = useRouter();
const { selectedZone, zones } = useZoneFilter();



const isDropdownOpen = ref(false);
const profileDropdownRef = ref(null);
const searchInput = ref(null);

const isNotificationsOpen = ref(false);
const notificationsDropdownRef = ref(null);
const activeAlertsList = ref([]);
const activeAlertsCount = computed(() => activeAlertsList.value.length);
const hasSeenAlerts = ref(false);

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

watch(isNotificationsOpen, (isOpen) => {
  if (isOpen) {
    hasSeenAlerts.value = true;
  }
});

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

const resolveAllAlerts = async () => {
  try {
    const promises = activeAlertsList.value.map(a => patrolService.updateAlertStatus(a.id, 'resolved'));
    await Promise.all(promises);
    activeAlertsList.value = [];
  } catch (error) {
    console.error("Failed to clear all alerts:", error);
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

onClickOutside(profileDropdownRef, () => {
  isDropdownOpen.value = false;
});

onClickOutside(notificationsDropdownRef, () => {
  isNotificationsOpen.value = false;
});

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

const navigateTo = (path) => {
  isDropdownOpen.value = false;
  router.push(path);
};

const expandedSection = ref('');
const toggleSection = (sec) => {
  expandedSection.value = expandedSection.value === sec ? '' : sec;
};

const selectedLanguage = ref('English');
const selectedTimeZone = ref('Asia/Kolkata');
const notificationsOn = ref(true);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const submitPasswordChange = () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('Please fill in all password fields');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    alert('New password and confirm password do not match');
    return;
  }
  alert('Password updated successfully!');
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};

const formattedLastLogin = computed(() => {
  return _userData?.last_login 
    ? new Date(_userData.last_login).toLocaleString() 
    : new Date().toLocaleDateString();
});

const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const activeSidebar = computed(() => (appMode === 'security' || appMode === 'patrol') ? SecuritySidebar : WorkforceSidebar);

const _userData = authService.getUserData();
const userRole = ref(authService.getUserRole() || 'Employee');
const tenantName = ref(_userData?.tenant?.tenantName || authService.getTenantName() || '');
const userName = computed(() => {
  if (!_userData) return 'Admin User';
  return `${_userData.first_name || ''} ${_userData.last_name || ''}`.trim() || 'Admin User';
});
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

const handleSignOut = async () => {
  authService.logout();
  router.push('/login');
};


// IN-04: Silently auto-generate QR for Employee users on first dashboard load
const autoGenerateEmployeeQr = async () => {
  try {
    const token = authService.getToken();
    const apiUrl = import.meta.env.VITE_API_URL;
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) return;

    const existing = await fetch(
      `${apiUrl}/items/qrgenerate?filter[qraccess][_eq]=true&filter[tenant][_eq]=${tenantId}&fields=id,expires_at,qraccess&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (existing.ok) {
      const existData = await existing.json();
      const activeToken = existData.data?.[0];
      if (activeToken && (!activeToken.expires_at || new Date(activeToken.expires_at) > new Date())) {
        return;
      }
    }

    const empRes = await fetch(
      `${apiUrl}/items/personalModule?filter[assignedUser][_eq]=${_userData?.id}&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&fields=id,assignedAccessLevel&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!empRes.ok) return;
    const empData = await empRes.json();
    const emp = empData.data?.[0];
    if (!emp) return;

    const rawToken = generateEncryptedQrToken(emp.id, emp.assignedAccessLevel || 'default');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await fetch(`${apiUrl}/items/qrgenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        tenant: tenantId,
        employeeId: emp.id,
        accessLevelsId: emp.assignedAccessLevel || null,
        qrcode: rawToken,
        qraccess: true,
        expires_at: expiresAt
      })
    });
  } catch (e) {
    console.warn('IN-04: Auto QR generation failed silently.', e);
  }
};

let alertsPollTimer = null;
let isFetchingAlerts = false;

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
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

  const role = authService.getUserRole();
  if (role === 'Admin' && !onboardingService.isCompleted() && !onboardingService.hasStarted()) {
    // router.push('/onboarding');
  }
  if (role === 'Employee') {
    autoGenerateEmployeeQr();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (alertsPollTimer) clearInterval(alertsPollTimer);
});

const currentPageTitle = computed(() => {
  const path = route.path;
  if (path.includes('/dashboard/settings/devices')) return 'Devices';
  if (path.includes('/dashboard/settings/ai-events')) return 'AI Cam Events';
  if (path.includes('/dashboard/settings/logs')) return 'Event Logs';
  if (path.includes('/dashboard/settings/zones')) return 'Zones & Access Points';
  if (path.includes('/dashboard/settings/timezones')) return 'Timezones';
  if (path.includes('/dashboard/settings/appearance')) return 'Admin Settings';
  if (path.includes('/dashboard/settings')) return 'Settings';
  if (path.includes('/dashboard/visitor-portals/builder')) return 'Portal Builder';
  if (path.includes('/dashboard/visitor-portals')) return 'Visitor Portals';
  if (path.includes('/dashboard/visitors')) return 'Visitor Console';
  if (path.includes('/dashboard/visitors')) return 'Visitors';
  if (path.includes('/dashboard/access-control/doors')) return 'Doors';
  if (path.includes('/dashboard/easy-access/employees')) return 'Employees';
  if (path.includes('/dashboard/easy-access/configurators/access-levels')) return 'Access Groups';
  if (path.includes('/dashboard/easy-access/biometrics/face')) return 'Face Enrollment';
  if (path.includes('/dashboard/easy-access/biometrics/fingerprint')) return 'Fingerprint';
  if (path.includes('/dashboard/easy-access/biometrics/qr')) return 'QR Generation';
  if (path.includes('/dashboard/guards')) return 'Guards';
  if (path.includes('/dashboard/patrols')) return 'Patrol Command';
  if (path.includes('/dashboard/incidents')) return 'Incident Management';
  if (path.includes('/dashboard/authorize')) return 'Scan & Authorize';
  if (path.includes('/dashboard/my-access')) return 'My Access';
  if (path.includes('/dashboard/my-attendance')) return 'My Attendance';
  if (path.includes('/dashboard/my-logs')) return 'My Logs';
  if (path.includes('/dashboard/profile')) return 'Profile';
  if (path.includes('/dashboard/report-automation')) return 'Scheduled Reports';
  if (path.includes('/dashboard/monitoring')) return 'Monitoring';
  return 'Dashboard';
});
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
</style>

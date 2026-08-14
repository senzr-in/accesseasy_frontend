<template>
  <div class="flex h-screen bg-slate-100 dark:bg-[#0b0f19] overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-300">
    <AlarmBanner />
    <div class="flex w-full h-full overflow-hidden">
      <!-- Sidebar -->
      <component :is="activeSidebar" />

      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">
        <header class="flex h-16 shrink-0 items-center justify-between border-b border-white/60 dark:border-white/10 bg-white/60 dark:bg-[#151c2c]/40 backdrop-blur-xl px-6 gap-4 transition-colors duration-300 z-40 relative">
          <!-- Left side: Search (only visible on the main Dashboard home) -->
          <div
            v-if="route.path === '/dashboard' || route.path === '/dashboard/'"
            class="flex items-center flex-1 max-w-xl animate-in fade-in duration-200"
          >
            <div class="relative w-full group">
              <Search class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-indigo-500:text-indigo-400 transition-colors" />
              <input 
                ref="searchInput"
                type="text" 
                placeholder="Search anything... (Ctrl + K)" 
                class="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:text-slate-500:text-slate-500 dark:text-slate-400 shadow-sm shadow-slate-100"
              >
            </div>
          </div>
          <div
            v-else
            id="header-title-slot"
            class="flex-1 flex flex-col justify-center min-w-0 pl-2 pr-4"
          />

          <!-- Right side: Actions & Profile -->
          <div class="flex items-center gap-4 pl-4 border-l border-slate-100 dark:border-white/5">
            <!-- Notifications Dropdown -->
            <div
              v-if="route.path === '/dashboard' || route.path === '/dashboard/'"
              ref="notificationsDropdownRef"
              class="relative"
            >
              <button
                class="relative w-10 h-10 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm text-slate-500 dark:text-slate-400 group"
                @click="isNotificationsOpen = !isNotificationsOpen"
              >
                <Bell class="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span
                  v-if="activeAlertsCount > 0 && !hasSeenAlerts"
                  class="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white dark:border-[#151c2c] rounded-full text-[8px] text-white font-bold flex items-center justify-center -mr-1 -mt-1"
                >
                  {{ activeAlertsCount }}
                </span>
              </button>

              <!-- Notifications Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isNotificationsOpen"
                  class="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 shadow-2xl py-2 z-[100] origin-top-right overflow-hidden"
                >
                  <!-- Header -->
                  <div class="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <p class="text-xs font-bold text-slate-900 dark:text-white">
                        Live Alerts
                      </p>
                      <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        Real-time security warnings
                      </p>
                    </div>
                    <button
                      v-if="activeAlertsCount > 0"
                      class="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider"
                      @click="resolveAllAlerts"
                    >
                      Clear All
                    </button>
                  </div>

                  <!-- Alert List -->
                  <div class="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-white/5">
                    <div
                      v-for="alert in activeAlertsList"
                      :key="alert.id"
                      class="p-3.5 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors relative group"
                      @click="openAlertDetails(alert)"
                    >
                      <!-- Icon -->
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        :class="alert.type?.toLowerCase() === 'sos' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'"
                      >
                        <AlertCircle
                          v-if="alert.type?.toLowerCase() === 'sos'"
                          class="w-4 h-4 animate-pulse"
                        />
                        <Clock
                          v-else
                          class="w-4 h-4"
                        />
                      </div>

                      <!-- Details -->
                      <div class="flex-1 min-w-0 pr-6">
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {{ alert.type?.toLowerCase() === 'sos' ? 'SOS Triggered' : 'Patrol Missed' }}
                        </p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {{ alert.type?.toLowerCase() === 'sos'
                            ? `Guard ${alert.guard_name || 'Unknown'} triggered an SOS in Zone: ${alert.zone_name || 'Unknown'}`
                            : `Scheduled patrol in Zone: ${alert.zone_name || 'Unknown'} was missed.`
                          }}
                        </p>
                        <p class="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">
                          {{ getFormattedAlertTime(alert.date_created) }}
                        </p>
                      </div>

                      <!-- Action: Resolve -->
                      <button
                        class="absolute right-3.5 top-3.5 w-6 h-6 rounded-md border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-100 dark:hover:border-rose-900/30 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Dismiss Alert"
                        @click.stop="resolveAlert(alert.id)"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="activeAlertsCount === 0"
                      class="py-12 px-4 text-center"
                    >
                      <Bell class="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2.5" />
                      <p class="text-xs font-bold text-slate-400 dark:text-slate-600">
                        No active alerts
                      </p>
                      <p class="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                        Everything is working normally
                      </p>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </header>

        <!-- Onboarding Banner Removed as per request -->

        <!-- Page Content -->
        <main class="flex-1 flex flex-col overflow-hidden relative">
          <router-view class="flex-1 min-h-0" />
        </main>
      </div>
    </div>
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
            :class="selectedAlertForDetail.type?.toLowerCase() === 'sos' ? 'bg-red-505/10 bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'"
          >
            <AlertTriangle
              v-if="selectedAlertForDetail.type?.toLowerCase() === 'sos'"
              class="w-6 h-6 animate-pulse"
            />
            <Clock
              v-else
              class="w-6 h-6"
            />
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider leading-none">
                {{ selectedAlertForDetail.type?.toLowerCase() === 'sos' ? 'SOS Emergency Alert' : 'Missed Patrol Alert' }}
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
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Guard Name</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedAlertForDetail.guard_name || 'Unassigned' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Security Zone</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedAlertForDetail.zone_name || 'Unknown Zone' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Occurred Time</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ getFormattedDateTime(selectedAlertForDetail.date_created) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Current Status</span>
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  Unresolved
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">
                Alert Description:
              </p>
              {{ selectedAlertForDetail.type?.toLowerCase() === 'sos'
                ? `Guard ${selectedAlertForDetail.guard_name || 'Unknown'} triggered a panic alarm (SOS) from the guard mobile application. Please dispatch support immediately to ${selectedAlertForDetail.zone_name || 'the designated zone'}.`
                : `The scheduled patrol round for ${selectedAlertForDetail.zone_name || 'the designated zone'} was missed by the assigned guard. No check-ins were registered.`
              }}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex justify-end gap-2.5">
            <button
              class="h-9 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-slate-700 dark:text-slate-300"
              @click="selectedAlertForDetail = null"
            >
              Close
            </button>
            <button
              class="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-500/10"
              @click="resolveAlertFromDetail(selectedAlertForDetail.id)"
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
import AlarmBanner from '@/components/AlarmBanner.vue';

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

const fetchAlerts = async () => {
  try {
    const alerts = await patrolService.getAlerts();
    const unresolved = (alerts || []).filter(a => a.status !== 'resolved');
    
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
  try {
    await patrolService.updateAlertStatus(alertId, 'resolved');
    activeAlertsList.value = activeAlertsList.value.filter(a => a.id !== alertId);
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

let alertsInterval = null;

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  const role = authService.getUserRole();
  if (role === 'Employee') {
    autoGenerateEmployeeQr();
  }
  
  fetchAlerts();
  alertsInterval = setInterval(fetchAlerts, 10000); // Poll for alerts every 10 seconds
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (alertsInterval) clearInterval(alertsInterval);
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
  if (path.includes('/dashboard/easy-access/biometrics')) return 'Biometrics Hub';
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

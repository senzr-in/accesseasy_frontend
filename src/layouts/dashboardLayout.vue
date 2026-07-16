<template>
  <div class="flex h-screen bg-slate-100 dark:bg-[#0b0f19] overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-300">
    <div class="flex w-full h-full overflow-hidden">
      <!-- Sidebar -->
      <component :is="activeSidebar" />

      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">
        <header class="flex h-16 shrink-0 items-center justify-between border-b border-white/60 dark:border-white/10 bg-white/60 dark:bg-[#151c2c]/40 backdrop-blur-xl px-6 gap-4 transition-colors duration-300 z-10 relative">
          <!-- Left side: Search -->
          <div class="flex items-center flex-1 max-w-xl">
            <div class="relative w-full group">
              <Search class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-indigo-500:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything... (Ctrl + K)" 
                class="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:text-slate-500:text-slate-500 dark:text-slate-400 shadow-sm shadow-slate-100"
              >
            </div>
          </div>

          <!-- Right side: Actions & Profile -->
          <div class="flex items-center gap-4 pl-4 border-l border-slate-100 dark:border-white/5">
            <!-- Zone Filter -->
            <div class="hidden md:flex items-center relative rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20:border-white/20 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-slate-800:bg-slate-800:bg-white pl-3 pr-2 py-2 cursor-pointer shadow-sm min-w-[140px]">
              <MapPin class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 pointer-events-none" />
              <select
                v-model="selectedZone"
                class="appearance-none bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none border-none pl-2 pr-6 cursor-pointer max-w-[150px] truncate w-full"
              >
                <option value="all">
                  All Zones
                </option>
                <option
                  v-for="z in zones"
                  :key="z.id"
                  :value="z.id"
                >
                  {{ z.zoneName }}
                </option>
              </select>
              <ChevronDown class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 pointer-events-none" />
            </div>

            <!-- Theme Toggle -->
            <button
              class="relative w-10 h-10 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-slate-800:bg-slate-800:bg-white hover:text-indigo-600 dark:hover:text-indigo-400:text-indigo-400 transition-colors shadow-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 group"
              @click="toggleDark()"
            >
              <Sun
                v-if="isDark"
                class="w-5 h-5 group-hover:scale-110 transition-transform"
              />
              <Moon
                v-else
                class="w-5 h-5 group-hover:scale-110 transition-transform"
              />
            </button>

            <!-- Notifications -->
            <button class="relative w-10 h-10 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-slate-800:bg-slate-800:bg-white hover:text-indigo-600 dark:hover:text-indigo-400:text-indigo-400 transition-colors shadow-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 group">
              <Bell class="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span class="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full text-[8px] text-white font-bold flex items-center justify-center -mr-1 -mt-1">3</span>
            </button>

            <!-- User Profile -->
            <button
              class="flex items-center gap-3 pl-2 cursor-pointer group"
              @click="handleSignOut"
            >
              <div class="flex flex-col text-right hidden sm:flex">
                <span class="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 dark:hover:text-indigo-400:text-indigo-400 transition-colors">{{ userName }}</span>
                <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{{ userRole }}</span>
              </div>
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
                <span class="text-sm font-bold text-indigo-700 dark:text-indigo-400">{{ userInitials }}</span>
              </div>
            </button>
          </div>
        </header>

        <!-- Onboarding Banner -->
        <OnboardingBanner />

        <!-- Page Content -->
        <main class="flex-1 flex flex-col overflow-hidden relative">
          <router-view class="flex-1 min-h-0" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';
import { Building, Shield, MapPin, ChevronDown, Search, Bell, Sun, Moon } from 'lucide-vue-next';
import SecuritySidebar from '@/components/layout/SecuritySidebar.vue';
import WorkforceSidebar from '@/components/layout/WorkforceSidebar.vue';
import OnboardingBanner from '@/components/layout/OnboardingBanner.vue';
import { authService } from '@/services/authService';
import { onboardingService } from '@/services/onboardingService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { generateEncryptedQrToken } from '@/utils/security/access-control';
import { useZoneFilter } from '@/composables/useZoneFilter';

const route = useRoute();
const router = useRouter();
const { selectedZone, zones } = useZoneFilter();

const isDark = useDark({
  storageKey: 'ae_theme',
});
const toggleDark = useToggle(isDark);

const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const activeSidebar = computed(() => appMode === 'security' ? SecuritySidebar : WorkforceSidebar);

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

onMounted(() => {
  const role = authService.getUserRole();
  if (role === 'Admin' && !onboardingService.isCompleted() && !onboardingService.hasStarted()) {
    router.push('/onboarding');
  }
  if (role === 'Employee') {
    autoGenerateEmployeeQr();
  }
});

const currentPageTitle = computed(() => {
  const path = route.path;
  if (path.includes('/dashboard/settings/devices')) return 'Devices';
  if (path.includes('/dashboard/settings/ai-events')) return 'AI Cam Events';
  if (path.includes('/dashboard/settings/logs')) return 'Event Logs';
  if (path.includes('/dashboard/settings/zones')) return 'Zones & Access Points';
  if (path.includes('/dashboard/settings/timezones')) return 'Timezones';
  if (path.includes('/dashboard/settings/appearance')) return 'Appearance';
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

<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans">
    <div class="flex w-full h-full overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">
        <!-- Top Header -->
        <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 gap-4">
          <div class="flex items-center gap-3">
            <!-- Left side empty or breadcrumbs can go here -->
          </div>

          <div class="flex items-center gap-3">
            <!-- Zone Filter -->
            <div class="hidden md:flex items-center relative rounded-full bg-slate-50 border border-slate-200 transition-colors hover:bg-slate-100 pl-3 pr-2 py-1.5 cursor-pointer shadow-sm">
              <MapPin class="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
              <select v-model="selectedZone" class="appearance-none bg-transparent text-sm font-semibold text-slate-700 outline-none border-none pl-2 pr-6 cursor-pointer max-w-[150px] truncate w-full">
                <option value="all">All Zones</option>
                <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zoneName }}</option>
              </select>
              <ChevronDown class="w-4 h-4 text-slate-600 absolute right-2.5 pointer-events-none" />
            </div>

            <!-- Organization Chip -->
            <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <Building class="w-3.5 h-3.5 text-slate-400" />
              <span class="text-xs font-medium text-slate-600">{{ tenantName || 'No Organization' }}</span>
            </div>

            <!-- Role Chip -->
            <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200">
              <Shield class="w-3.5 h-3.5 text-indigo-500" />
              <span class="text-xs font-semibold text-indigo-700">{{ userRole }}</span>
            </div>
          </div>
        </header>

        <!-- Onboarding Banner -->
        <OnboardingBanner />

        <!-- Page Content -->
        <main class="flex-1 flex flex-col overflow-hidden px-6 pt-5 pb-6 relative">
          <router-view class="flex-1 min-h-0" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Building, Shield, MapPin, ChevronDown } from 'lucide-vue-next';
import Sidebar from '@/components/layout/Sidebar.vue';
import OnboardingBanner from '@/components/layout/OnboardingBanner.vue';
import { authService } from '@/services/authService';
import { onboardingService } from '@/services/onboardingService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { generateEncryptedQrToken } from '@/utils/security/access-control';

const route = useRoute();
const router = useRouter();

const _userData = authService.getUserData();
const userRole = ref(authService.getUserRole() || 'Employee');
const tenantName = ref(_userData?.tenant?.tenantName || authService.getTenantName() || '');

import { useZoneFilter } from '@/composables/useZoneFilter';
const { selectedZone, zones } = useZoneFilter();

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

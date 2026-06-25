<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
    <div class="relative z-10 flex w-full h-full overflow-hidden">
      <!-- Sidebar Navigation -->
      <Sidebar />
      
      <!-- Main Content Area -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">
        <!-- Header / Topbar -->
        <header class="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl px-6">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {{ currentPageTitle }}
            </h1>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Organization Chip -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Building class="w-4 h-4 text-slate-500" />
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ tenantName || 'No Organization' }}</span>
            </div>

            <!-- Role Chip -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
              <Shield class="w-4 h-4 text-blue-500" />
              <span class="text-xs font-semibold text-blue-700 dark:text-blue-300">{{ userRole }}</span>
            </div>
          </div>
        </header>

        <!-- Onboarding Banner (shows for first-time users) -->
        <OnboardingBanner />

        <!-- Page Content Router View -->
        <main class="flex-1 flex flex-col overflow-hidden px-6 pt-4 pb-6 relative">
          <router-view class="flex-1 min-h-0" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Building, Shield } from 'lucide-vue-next';
import Sidebar from '@/components/layout/Sidebar.vue';
import OnboardingBanner from '@/components/layout/OnboardingBanner.vue';
import { authService } from '@/services/authService';
import { onboardingService } from '@/services/onboardingService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { generateEncryptedQrToken } from '@/utils/security/access-control';

const route = useRoute();
const router = useRouter();

// Read synchronously so header shows the correct values immediately
const _userData = authService.getUserData();
const userRole = ref(authService.getUserRole() || 'Employee');
const tenantName = ref(_userData?.tenant?.tenantName || authService.getTenantName() || '');

// IN-04: Silently auto-generate QR for Employee users on first dashboard load
const autoGenerateEmployeeQr = async () => {
  try {
    const token = authService.getToken();
    const apiUrl = import.meta.env.VITE_API_URL;
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) return;

    // Check if an active, non-expired QR already exists for this session
    const existing = await fetch(
      `${apiUrl}/items/qrgenerate?filter[qraccess][_eq]=true&filter[tenant][_eq]=${tenantId}&fields=id,expires_at,qraccess&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (existing.ok) {
      const existData = await existing.json();
      const activeToken = existData.data?.[0];
      // If a valid, non-expired token already exists, skip generation
      if (activeToken && (!activeToken.expires_at || new Date(activeToken.expires_at) > new Date())) {
        console.log('IN-04: Active QR token already exists, skipping auto-generation.');
        return;
      }
    }

    // Fetch the employee record to get their id and access level
    const empRes = await fetch(
      `${apiUrl}/items/personalModule?filter[assignedUser][_eq]=${_userData?.id}&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&fields=id,assignedAccessLevel&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!empRes.ok) return;
    const empData = await empRes.json();
    const emp = empData.data?.[0];
    if (!emp) return;

    // Generate a new encrypted token
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
    console.log('IN-04: QR token auto-generated on login.');
  } catch (e) {
    // Silent failure — employee can still manually generate from My Credentials
    console.warn('IN-04: Auto QR generation failed silently.', e);
  }
};

// Redirect first-time Admin users to the onboarding page
onMounted(() => {
  const role = authService.getUserRole();
  if (role === 'Admin' && !onboardingService.isCompleted() && !onboardingService.hasStarted()) {
    router.push('/onboarding');
  }
  // IN-04: Auto-generate QR for Employees on login
  if (role === 'Employee') {
    autoGenerateEmployeeQr();
  }
});

const currentPageTitle = computed(() => {
  // Simple mapping, can be expanded or driven by route meta
  const path = route.path;
  if (path.includes('/dashboard/visitors-overview')) return 'Visitor Dashboard';
  if (path.includes('/dashboard/access-control/doors')) return 'Doors';
  if (path.includes('/dashboard/access-control/zones')) return 'Access Zones';
  if (path.includes('/dashboard/easy-access/employees')) return 'Employees';
  if (path.includes('/dashboard/easy-access/configurators/access-levels')) return 'Access Group';
  if (path.includes('/dashboard/devices')) return 'Devices';
  if (path.includes('/dashboard/settings/logs')) return 'Event Logs';
  if (path.includes('/dashboard/settings')) return 'Settings';
  if (path.includes('/dashboard/logs')) return 'Event Logs';
  if (path.includes('/dashboard/guards')) return 'Guards';
  if (path.includes('/dashboard/my-access')) return 'My Access';
  if (path.includes('/dashboard/my-attendance')) return 'My Attendance';
  if (path.includes('/dashboard/my-logs')) return 'My Logs';
  if (path.includes('/dashboard/profile')) return 'Profile';
  if (path.includes('/dashboard/report-automation')) return 'Scheduled Reports';
  return 'Dashboard';
});
</script>


<style>
/* Custom Scrollbar to match Next.js app */
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

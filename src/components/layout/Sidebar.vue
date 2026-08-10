<template>
  <aside 
    class="relative flex flex-col h-screen bg-[#0b0f19] border-r border-white/5 shrink-0 z-20 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-20' : 'w-60'"
  >
    <!-- Toggle Button -->
    <button 
      class="absolute -right-3 top-5 w-6 h-6 bg-[#151c2c] border border-white/10 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-white hover:bg-white dark:bg-slate-900/5 transition-colors z-50 focus:outline-none" 
      @click="toggleSidebar"
    >
      <ChevronRight
        v-if="isCollapsed"
        class="w-3.5 h-3.5"
      />
      <ChevronLeft
        v-else
        class="w-3.5 h-3.5"
      />
    </button>

    <!-- Brand Logo -->
    <div 
      class="flex items-center h-14 border-b border-white/5 shrink-0 overflow-hidden transition-all duration-300"
      :class="isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'"
    >
      <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-4 h-4 text-white"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div
        v-if="!isCollapsed"
        class="flex flex-col leading-none whitespace-nowrap"
      >
        <span class="text-sm font-bold text-white tracking-tight">AccessEasy</span>
        <span class="text-[10px] font-medium text-slate-400 mt-0.5">{{ appMode === 'security' ? 'Security Platform' : appMode === 'patrol' ? 'Patrol Platform' : 'Workforce Platform' }}</span>
      </div>
    </div>
    <!-- Navigation -->
    <nav
      class="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-5"
      :class="isCollapsed ? 'px-2' : 'px-3'"
    >
      <!-- Daily Operations -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
        >
          Daily Operations
        </p>
        <div class="space-y-1">
          <a
            v-for="item in currentNav"
            :key="item.name"
            :href="item.href"
            class="flex items-center rounded-lg text-sm font-medium transition-all cursor-pointer group"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'bg-blue-600/10 text-blue-500 font-semibold'
                : 'text-slate-400 hover:bg-white dark:bg-slate-900/5 hover:text-slate-200',
              isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
            @click.prevent="$router.push(item.href)"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-300'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </a>
        </div>
      </div>

      <!-- Site Setup -->
      <div v-if="siteSetupNav.length > 0">
        <p
          v-if="!isCollapsed"
          class="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
        >
          Site Setup
        </p>
        <div class="space-y-1">
          <a
            v-for="item in siteSetupNav"
            :key="item.name"
            :href="item.href"
            class="flex items-center rounded-lg text-sm font-medium transition-all cursor-pointer group"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'bg-blue-600/10 text-blue-500 font-semibold'
                : 'text-slate-400 hover:bg-white dark:bg-slate-900/5 hover:text-slate-200',
              isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
            @click.prevent="$router.push(item.href)"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-300'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </a>
        </div>
      </div>
    </nav>

    <!-- User Footer -->
    <div
      class="shrink-0 border-t border-white/5 space-y-1"
      :class="isCollapsed ? 'p-2' : 'p-3'"
    >
      <!-- Settings link -->
      <router-link
        v-if="userRole === 'Admin'"
        to="/dashboard/settings"
        class="flex items-center w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-white dark:bg-slate-900/5 hover:text-slate-200 transition-colors group"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <Settings class="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-300 transition-colors shrink-0" />
        <span
          v-if="!isCollapsed"
          class="truncate"
        >Settings</span>
      </router-link>

      <!-- User row -->
      <button
        class="flex items-center w-full rounded-lg hover:bg-white dark:bg-slate-900/5 transition-colors text-left group"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'"
        :title="isCollapsed ? 'Sign Out' : ''"
        @click="handleSignOut"
      >
        <div class="w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
          {{ userInitials }}
        </div>
        <div
          v-if="!isCollapsed"
          class="flex flex-col min-w-0 flex-1"
        >
          <span class="text-xs font-semibold text-white truncate leading-none">{{ userName }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 truncate">{{ userRole }}</span>
        </div>
        <LogOut
          v-if="!isCollapsed"
          class="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 group-hover:text-slate-400 transition-colors shrink-0"
        />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, h, resolveComponent, ref } from 'vue';
import { useRouter, useLink, RouterLink } from 'vue-router';
import {
  LayoutDashboard, Users, Shield, ShieldCheck, MapPin, Search, Plus, 
  Settings, LogOut, ChevronLeft, ChevronRight, ClipboardList, Building2, Camera, ShieldAlert, Activity
} from 'lucide-vue-next';
import { authService } from '@/services/authService';

const router = useRouter();
const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const rawUser = authService.getUserData();

const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const userName = computed(() => {
  if (!rawUser) return 'Admin User';
  return `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim() || 'Admin User';
});
const userRole = computed(() => authService.getUserRole() || 'Employee');
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

// Nav items
const securityNav = computed(() => {
  return [
    { name: 'SOC Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Live Monitoring', href: '/dashboard/monitoring', icon: Camera },
    { name: 'Incident Logs', href: '/dashboard/incidents', icon: ShieldAlert },
    { name: 'AI Analytics', href: '/dashboard/analytics', icon: Activity }
  ];
});

const dailyOperationsNav = computed(() => {
  const items = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Visitors', href: '/dashboard/visitors', icon: Users },
    { name: 'Access Points', href: '/dashboard/access-control/doors', icon: MapPin }
  ];
  if (userRole.value === 'Admin' || userRole.value === 'Manager') {
    items.push({ name: 'Guards', href: '/dashboard/guards', icon: ShieldCheck });
  }
  items.push({ name: 'Reports', href: '/dashboard/report-automation', icon: ClipboardList });
  return items;
});

const currentNav = computed(() => {
  return appMode === 'security' ? securityNav.value : dailyOperationsNav.value;
});

const siteSetupNav = computed(() => {
  if (userRole.value === 'Admin' || userRole.value === 'Manager') {
    return [
      { name: 'Zones', href: '/dashboard/settings/zones', icon: Building2 },
    ];
  }
  return [];
});

// Sign out
const handleSignOut = async () => {
  if (userRole.value === 'Employee') {
    try {
      const token = authService.getToken();
      const apiUrl = import.meta.env.VITE_API_URL;
      if (token && rawUser?.id) {
        const qrRes = await fetch(
          `${apiUrl}/items/qrgenerate?filter[qraccess][_eq]=true&fields=id,employeeId&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          const revokePromises = qrData.data
            ?.filter(q => q.employeeId === rawUser.id || q.employeeId?.assignedUser === rawUser.id)
            ?.map(q =>
              fetch(`${apiUrl}/items/qrgenerate/${q.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ qraccess: false })
              })
            ) || [];
          await Promise.allSettled(revokePromises);
        }
      }
    } catch (e) {
      console.warn('QR revocation on logout failed silently.', e);
    }
  }
  authService.logout();
  router.push('/login');
};
</script>


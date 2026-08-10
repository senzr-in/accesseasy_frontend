<template>
  <aside 
    class="relative flex flex-col h-screen bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-white/5 shrink-0 z-20 transition-all duration-300 ease-in-out font-sans"
    :class="isCollapsed ? 'w-20' : 'w-60'"
  >
    <!-- Toggle Button -->
    <button 
      class="absolute -right-3 top-5 w-6 h-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors z-50 focus:outline-none" 
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
      class="flex items-center h-14 border-b border-slate-100 dark:border-white/5 shrink-0 overflow-hidden transition-all duration-300"
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
        <span class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">AccessEasy</span>
        <span class="text-[10px] font-medium text-slate-400 mt-0.5">Workforce Platform</span>
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
            v-for="item in dailyOperationsNav"
            :key="item.name"
            :href="item.href"
            class="flex items-center rounded-lg text-sm font-medium transition-all cursor-pointer group"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-slate-200',
              isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
            @click.prevent="$router.push(item.href)"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-slate-300'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </a>
        </div>
      </div>

      <!-- Site Setup -->
      <div>
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
                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-slate-200',
              isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
            @click.prevent="$router.push(item.href)"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-slate-300'"
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
      class="shrink-0 border-t border-slate-100 dark:border-white/5 space-y-1"
      :class="isCollapsed ? 'p-2' : 'p-3'"
    >
      <!-- User row -->
      <button
        class="flex items-center w-full rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2'"
        :title="isCollapsed ? 'Sign Out' : ''"
        @click="handleSignOut"
      >
        <div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
          {{ userInitials }}
        </div>
        <div
          v-if="!isCollapsed"
          class="flex flex-col min-w-0 flex-1"
        >
          <span class="text-xs font-semibold text-slate-900 dark:text-white truncate leading-none">{{ userName }}</span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ userRole }}</span>
        </div>
        <LogOut
          v-if="!isCollapsed"
          class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-slate-400 transition-colors shrink-0"
        />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  LayoutDashboard, Users, Shield, ShieldCheck, MapPin, 
  Settings, LogOut, ChevronLeft, ChevronRight, ClipboardList, Server, Activity, FileText, Camera, Video
} from 'lucide-vue-next';
import { authService } from '@/services/authService';

const router = useRouter();
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

// Unrestricted Workforce Navigation Items
const dailyOperationsNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Doors', href: '/dashboard/access-control/doors', icon: MapPin },
  { name: 'Groups', href: '/dashboard/easy-access/configurators/access-levels', icon: Shield },
  { name: 'Guards', href: '/dashboard/guards', icon: ShieldCheck },
  { name: 'Employees', href: '/dashboard/easy-access/employees', icon: Users },
  { name: 'Employee Logs', href: '/dashboard/easy-access/employee-logs', icon: FileText },
  { name: 'Face Biometrics', href: '/dashboard/easy-access/biometrics/face', icon: Camera },
  { name: 'Scheduled Reports', href: '/dashboard/report-automation', icon: ClipboardList }
];

const siteSetupNav = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Devices', href: '/dashboard/settings/devices', icon: Server },
  { name: 'Camera Devices', href: '/dashboard/devices/cameras', icon: Video },
  { name: 'Camera AI Logs', href: '/dashboard/monitoring/camera-logs', icon: Activity },
  { name: 'Event Logs', href: '/dashboard/settings/logs', icon: FileText }
];

const handleSignOut = async () => {
  authService.logout();
  router.push('/login');
};
</script>

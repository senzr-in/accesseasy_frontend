<template>
  <aside 
    class="relative flex flex-col h-screen bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-white/5 shrink-0 z-20 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-20' : 'w-60'"
  >
    <!-- Toggle Button -->
    <button 
      class="absolute -right-3 top-5 w-6 h-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors z-50 focus:outline-none" 
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
      class="flex items-center h-16 border-b border-slate-100 dark:border-white/5 shrink-0 overflow-hidden transition-all duration-300"
      :class="isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'"
    >
      <div class="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-white/5 border border-blue-500/20 dark:border-white/10 flex items-center justify-center shadow-sm shrink-0 p-1.5">
        <img :src="logoPatrol" class="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(27,79,216,0.25)]" alt="AccessEasy Patrol" />
      </div>
      <div
        v-if="!isCollapsed"
        class="flex flex-col leading-none whitespace-nowrap"
      >
        <div class="flex items-center gap-1">
          <span class="text-sm font-black text-slate-900 dark:text-white tracking-tight">AccessEasy</span>
          <span class="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight uppercase">PATROL</span>
        </div>
        <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{{ appMode === 'patrol' ? 'Patrol Platform' : 'Security Platform' }}</span>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav
      class="flex-1 overflow-y-auto custom-scrollbar py-5 space-y-6"
      :class="isCollapsed ? 'px-2' : 'px-4'"
    >
      <!-- Top Dashboard Link -->
      <div>
        <router-link
          to="/dashboard"
          class="flex items-center rounded-xl text-sm font-semibold transition-all group"
          :class="[
            $route.path === '/dashboard' || $route.path === '/dashboard/'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
            isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
          ]"
          :title="isCollapsed ? 'Dashboard' : ''"
        >
          <Home
            class="w-4 h-4 shrink-0"
            :class="$route.path === '/dashboard' || $route.path === '/dashboard/' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
          />
          <span
            v-if="!isCollapsed"
            class="truncate"
          >Dashboard</span>
        </router-link>
      </div>

      <!-- OPERATIONS -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap"
        >
          Operations
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in operationsNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-sm font-medium transition-all group"
            :class="[
              isItemActive(item)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="isItemActive(item) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- MANAGEMENT -->
      <div v-if="setupNav.length > 0">
        <p
          v-if="!isCollapsed"
          class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap"
        >
          Management
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in setupNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-sm font-medium transition-all group"
            :class="[
              isItemActive(item)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="isItemActive(item) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- ANALYTICS -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap"
        >
          Analytics
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in analyticsNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-sm font-medium transition-all group"
            :class="[
              isItemActive(item)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="isItemActive(item) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer Settings & Help -->
    <div
      class="shrink-0 space-y-1 pb-4"
      :class="isCollapsed ? 'px-2 pt-2' : 'px-4 pt-4'"
    >
      <router-link
        v-if="userRole === 'Admin' || userRole === 'Manager'"
        to="/dashboard/settings"
        class="flex items-center rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white transition-all group"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <Settings class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white shrink-0" />
        <span
          v-if="!isCollapsed"
          class="truncate"
        >Settings</span>
      </router-link>

      <!-- User Profile Dropdown -->
      <div 
        ref="profileDropdownRef"
        class="relative pt-4 mt-2 border-t border-slate-100 dark:border-white/5"
      >
        <div 
          class="flex items-center gap-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg py-2 transition-colors" 
          :class="isCollapsed ? 'justify-center' : ''"
          @click="isDropdownOpen = !isDropdownOpen"
        >
          <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shadow-sm shrink-0">
            <span class="text-xs font-bold text-indigo-700 dark:text-indigo-400">{{ userName.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-if="!isCollapsed" class="flex flex-col flex-1 min-w-0">
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ userName }}</span>
            <span class="text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate">{{ userRole }}</span>
          </div>
        </div>

        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute bottom-full left-0 mb-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-[100]"
          >
            <button
              @click="router.push('/dashboard/profile'); isDropdownOpen = false"
              class="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Users class="w-4 h-4 text-slate-400" />
              My Profile
            </button>
            <button
              @click="router.push('/dashboard/help'); isDropdownOpen = false"
              class="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <HelpCircle class="w-4 h-4 text-slate-400" />
              Help & Support
            </button>
            <div class="h-[1px] bg-slate-100 dark:bg-slate-700 my-1"></div>
            <button
              @click="handleSignOut"
              class="flex w-full items-center gap-3 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <LogOut class="w-4 h-4" />
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import {
  Home, Users, Shield, Lock, Map as MapIcon, BarChart2,
  MapPin, CheckCircle, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, Cpu, Clock, AlertTriangle, Globe, FileText,
  ShieldAlert, AlertCircle, Building2, QrCode, Activity
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import logoPatrol from '@/assets/images/logoPatrol.png';

const router = useRouter();
const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const route = useRoute();

const profileDropdownRef = ref(null);
onClickOutside(profileDropdownRef, () => {
  if (isDropdownOpen.value) {
    isDropdownOpen.value = false;
  }
});

const isItemActive = (item) => {
  if (item.href === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/dashboard/';
  }
  
  const [basePath, queryStr] = item.href.split('?');
  if (!route.path.startsWith(basePath)) return false;
  
  if (queryStr) {
    const searchParams = new URLSearchParams(queryStr);
    for (const [key, value] of searchParams) {
      if (route.query[key] !== value) return false;
    }
  }
  
  return true;
};
const rawUser = authService.getUserData();

const isCollapsed = ref(false);
const isDropdownOpen = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleSignOut = () => {
  authService.logout();
  router.push('/login');
};

const userName = computed(() => {
  if (!rawUser) return 'Admin User';
  return `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim() || 'Admin User';
});
const userRole = computed(() => authService.getUserRole() || 'Employee');

const operationsNav = computed(() => {
  if (appMode === 'patrol') {
    return [
      { name: 'Patrol Command', href: '/dashboard/patrols', icon: ShieldAlert },
      { name: 'Live Monitoring', href: '/dashboard/monitoring', icon: Activity },
      { name: 'Incidents', href: '/dashboard/incidents', icon: AlertCircle }
    ];
  }
  return [
    { name: 'Visitor Management', href: '/dashboard/visitors?tab=analytics', icon: BarChart2 },
    { name: 'Registration Portal', href: '/dashboard/visitors?tab=portals', icon: Globe },
    { name: 'Pending Approvals', href: '/dashboard/visitors?tab=pending', icon: CheckCircle }
  ];
});

const setupNav = computed(() => {
  if (appMode === 'patrol') {
    return [
      { name: 'Sites', href: '/dashboard/sites', icon: Building2 },
      { name: 'Zones', href: '/dashboard/settings/zones', icon: MapIcon },
      { name: 'Checkpoints', href: '/dashboard/settings/checkpoints', icon: QrCode },
      { name: 'Guards', href: '/dashboard/guards', icon: Users },
      { name: 'Shifts', href: '/dashboard/settings/shifts', icon: Clock }
    ];
  }
  return [];
});

const analyticsNav = [
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 }
];
</script>

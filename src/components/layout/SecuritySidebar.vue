<template>
  <aside 
    class="relative flex flex-col h-screen bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-white/5 shrink-0 z-20 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-20' : 'w-64'"
  >
    <!-- Toggle Button -->
    <button 
      class="absolute -right-3 top-5 w-6 h-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors z-50 focus:outline-none" 
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
        <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{{ appMode === 'patrol' ? 'Security & Patrol Ops' : 'Security Platform' }}</span>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav
      class="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3"
      :class="isCollapsed ? 'px-2' : 'px-3'"
    >
      <!-- Top Dashboard Link -->
      <div>
        <router-link
          to="/dashboard"
          class="flex items-center rounded-xl text-xs transition-all group"
          :class="[
            $route.path === '/dashboard' || $route.path === '/dashboard/'
              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs'
              : 'text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-white',
            isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'
          ]"
          :title="isCollapsed ? 'Dashboard' : ''"
        >
          <Home
            class="w-4 h-4 shrink-0 transition-colors"
            :class="$route.path === '/dashboard' || $route.path === '/dashboard/' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
          />
          <span
            v-if="!isCollapsed"
            class="truncate font-bold text-xs tracking-wide"
          >Dashboard</span>
        </router-link>
      </div>

      <!-- CORE OPERATIONS -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
        >
          Operations
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in operationsNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-xs transition-all group justify-between"
            :class="[
              isItemActive(item)
                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs'
                : 'text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-2.5' : 'px-3.5 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <div class="flex items-center gap-3 min-w-0">
              <component
                :is="item.icon"
                class="w-4 h-4 shrink-0 transition-colors"
                :class="isItemActive(item) ? 'text-indigo-600 dark:text-indigo-400' : (item.iconClass || 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white')"
              />
              <span
                v-if="!isCollapsed"
                class="truncate font-semibold text-xs"
              >{{ item.name }}</span>
            </div>
            <span 
              v-if="!isCollapsed && item.badge" 
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              :class="item.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </div>

      <!-- FLEET & PERIMETER -->
      <div v-if="setupNav.length > 0">
        <p
          v-if="!isCollapsed"
          class="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
        >
          Fleet & Perimeter
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in setupNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-xs transition-all group justify-between"
            :class="[
              isItemActive(item)
                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs'
                : 'text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-2.5' : 'px-3.5 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <div class="flex items-center gap-3 min-w-0">
              <component
                :is="item.icon"
                class="w-4 h-4 shrink-0 transition-colors"
                :class="isItemActive(item) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
              />
              <span
                v-if="!isCollapsed"
                class="truncate font-semibold text-xs"
              >{{ item.name }}</span>
            </div>
            <span 
              v-if="!isCollapsed && item.badge" 
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              :class="item.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </div>

      <!-- GOVERNANCE & AUDIT -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
        >
          Governance & Logs
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in analyticsNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-xs transition-all group justify-between"
            :class="[
              isItemActive(item)
                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs'
                : 'text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-2.5' : 'px-3.5 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <div class="flex items-center gap-3 min-w-0">
              <component
                :is="item.icon"
                class="w-4 h-4 shrink-0 transition-colors"
                :class="isItemActive(item) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
              />
              <span
                v-if="!isCollapsed"
                class="truncate font-semibold text-xs"
              >{{ item.name }}</span>
            </div>
            <span 
              v-if="!isCollapsed && item.badge" 
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              :class="item.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer Settings & Profile -->
    <div
      class="shrink-0 space-y-1 pb-3"
      :class="isCollapsed ? 'px-2 pt-2' : 'px-3 pt-2'"
    >
      <router-link
        v-if="userRole === 'Admin' || userRole === 'Manager'"
        to="/dashboard/settings"
        class="flex items-center rounded-xl text-xs transition-all group"
        :class="[
          $route.path === '/dashboard/settings'
            ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs'
            : 'text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-white',
          isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2'
        ]"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <Settings class="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white shrink-0" />
        <span
          v-if="!isCollapsed"
          class="truncate font-semibold text-xs"
        >Settings Hub</span>
      </router-link>

      <!-- User Profile Dropdown -->
      <div 
        ref="profileDropdownRef"
        class="relative pt-2 mt-1 border-t border-slate-100 dark:border-white/5"
      >
        <div 
          class="flex items-center gap-2.5 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg py-1.5 transition-colors" 
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
import { useRouter, useRoute } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import {
  Home, Users, Shield, Map as MapIcon, BarChart2,
  Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, Clock,
  ShieldAlert, AlertCircle, Building2, QrCode, Activity,
  UserCheck, Siren, Calendar, Smartphone, ScrollText, CreditCard,
  Globe, CheckCircle
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
  if (route.path === basePath || route.path.startsWith(basePath + '/')) {
    if (queryStr) {
      const searchParams = new URLSearchParams(queryStr);
      for (const [key, value] of searchParams) {
        if (route.query[key] !== value) return false;
      }
    }
    return true;
  }
  
  return false;
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
      { name: 'Guard Attendance', href: '/dashboard/guards/attendance', icon: UserCheck },
      { name: 'Incidents', href: '/dashboard/incidents', icon: AlertCircle },
      { name: 'Emergency Escalation', href: '/dashboard/settings/escalation', icon: Siren, iconClass: 'text-rose-500 group-hover:text-rose-600', badge: 'SOS', badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-black' }
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
      { name: 'Sites & Geofences', href: '/dashboard/sites', icon: Building2 },
      { name: 'Zones', href: '/dashboard/settings/zones', icon: MapIcon },
      { name: 'Checkpoints', href: '/dashboard/settings/checkpoints', icon: QrCode },
      { name: 'Guards & Staff', href: '/dashboard/guards', icon: Users },
      { name: 'Shift Scheduler', href: '/dashboard/settings/patrol-shifts', icon: Calendar, badge: '24/7', badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
      { name: 'Device Fleet', href: '/dashboard/settings/devices', icon: Smartphone }
    ];
  }
  return [];
});

const analyticsNav = computed(() => {
  if (appMode === 'patrol') {
    return [
      { name: 'Reports & Analytics', href: '/dashboard/reports', icon: BarChart2 },
      { name: 'Audit Trail', href: '/dashboard/settings/audit-log', icon: ScrollText },
      { name: 'Plan & Quotas', href: '/dashboard/settings/subscription', icon: CreditCard, badge: 'Tiers', badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' }
    ];
  }
  return [
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 }
  ];
});
</script>

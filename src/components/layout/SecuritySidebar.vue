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
      <div class="w-8 h-8 rounded-[10px] bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
        <Shield class="w-4 h-4 text-white" />
      </div>
      <div
        v-if="!isCollapsed"
        class="flex flex-col leading-none whitespace-nowrap"
      >
        <span class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">AccessEasy</span>
        <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-0.5">Security Platform</span>
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
              ($route.path.startsWith(item.href) && item.href !== '/dashboard')
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="($route.path.startsWith(item.href) && item.href !== '/dashboard') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
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
              $route.path.startsWith(item.href)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="$route.path.startsWith(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- SITE SETUP -->
      <div v-if="siteSetupNav.length > 0">
        <p
          v-if="!isCollapsed"
          class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 dark:text-slate-400 whitespace-nowrap"
        >
          Site Setup
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in siteSetupNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-sm font-medium transition-all group"
            :class="[
              $route.path.startsWith(item.href)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white',
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="$route.path.startsWith(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'"
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
      class="shrink-0 space-y-1"
      :class="isCollapsed ? 'p-2' : 'p-4'"
    >
      <router-link
        v-if="userRole === 'Admin' || userRole === 'Manager'"
        to="/dashboard/settings"
        class="flex items-center rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white transition-all group"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <Settings class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white shrink-0" />
        <span
          v-if="!isCollapsed"
          class="truncate"
        >Settings</span>
      </router-link>
      
      <router-link
        to="/help"
        class="flex items-center rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white transition-all group"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2.5'"
        :title="isCollapsed ? 'Help & Support' : ''"
      >
        <HelpCircle class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white shrink-0" />
        <span
          v-if="!isCollapsed"
          class="truncate"
        >Help & Support</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import {
  Home, Users, Shield, Lock, Map as MapIcon, BarChart2,
  MapPin, CheckCircle, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, Cpu, Fingerprint
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

const operationsNav = [
  { name: 'Visitor Management', href: '/dashboard/visitors', icon: Users },
  { name: 'Patrol Monitoring', href: '/dashboard/patrols', icon: MapIcon },
  { name: 'Biometrics Hub', href: '/dashboard/easy-access/biometrics', icon: Fingerprint }
];

const analyticsNav = [
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 }
];

const siteSetupNav = computed(() => {
  if (userRole.value === 'Admin' || userRole.value === 'Manager') {
    return [
      { name: 'Zones', href: '/dashboard/settings/zones', icon: MapPin },
      { name: 'Access Points', href: '/dashboard/access-control/doors', icon: CheckCircle },
      { name: 'Checkpoints', href: '/dashboard/settings/checkpoints', icon: Settings },
    ];
  }
  return [];
});

</script>

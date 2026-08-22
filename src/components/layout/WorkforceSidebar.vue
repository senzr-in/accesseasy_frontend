<template>
  <aside
    class="relative flex flex-col h-screen shrink-0 z-30 transition-all duration-300 ease-in-out select-none bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 shadow-[1px_0_10px_0_rgba(0,0,0,0.03)]"
    :class="isCollapsed ? 'w-[72px]' : 'w-[260px]'"
  >
    <!-- Expand / Collapse Toggle Button -->
    <button
      class="absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 shadow-md flex items-center justify-center z-50 focus:outline-none transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
      :title="isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'"
      @click="toggleSidebar"
    >
      <ChevronRight v-if="isCollapsed" class="w-4 h-4" />
      <ChevronLeft v-else class="w-4 h-4" />
    </button>

    <!-- Brand Header -->
    <div
      class="flex items-center h-16 shrink-0 border-b border-slate-100 dark:border-zinc-800/80 px-4 transition-all"
      :class="isCollapsed ? 'justify-center' : 'justify-between'"
    >
      <router-link
        to="/dashboard"
        class="flex items-center gap-3 no-underline group min-w-0"
      >
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
          <ShieldCheck class="w-5 h-5 text-white" />
        </div>
        <div v-if="!isCollapsed" class="flex flex-col min-w-0 animate-in fade-in duration-200">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">AccessEasy</span>
            <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">PRO</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Workforce Suite</span>
        </div>
      </router-link>
    </div>

    <!-- Quick Search Filter (Expanded Mode) -->
    <div v-if="!isCollapsed" class="px-3 pt-3 pb-1">
      <div class="relative flex items-center">
        <Search class="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
        <input
          v-model="navSearchQuery"
          type="text"
          placeholder="Quick jump..."
          class="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
        />
        <button
          v-if="navSearchQuery"
          class="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          @click="navSearchQuery = ''"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Navigation Scroll Area -->
    <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-5 custom-scrollbar">
      <!-- Main Dashboard Link -->
      <div v-if="matchesFilter('Dashboard')">
        <router-link
          to="/dashboard"
          class="relative flex items-center rounded-xl text-xs font-bold transition-all duration-200 no-underline group cursor-pointer"
          :class="[
            isDashboardActive
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 border border-transparent',
            isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'
          ]"
          :title="isCollapsed ? 'Dashboard' : ''"
        >
          <!-- Active Left Pill Indicator -->
          <div
            v-if="isDashboardActive && !isCollapsed"
            class="absolute -left-3 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full"
          ></div>
          
          <LayoutDashboard
            class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-200"
            :class="isDashboardActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300'"
          />
          <span v-if="!isCollapsed" class="truncate">Dashboard</span>
        </router-link>
      </div>

      <!-- Navigation Sections -->
      <div
        v-for="section in filteredSections"
        :key="section.title"
        class="space-y-1"
      >
        <!-- Section Header -->
        <div
          v-if="!isCollapsed"
          class="flex items-center justify-between px-3 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500"
        >
          <span>{{ section.title }}</span>
          <span class="text-[9px] font-mono opacity-60">{{ section.items.length }}</span>
        </div>

        <!-- Section Divider in Collapsed Mode -->
        <div
          v-else
          class="w-8 h-[1px] bg-slate-200 dark:bg-zinc-800 mx-auto my-2"
        ></div>

        <!-- Section Navigation Items -->
        <router-link
          v-for="item in section.items"
          :key="item.name"
          :to="item.href"
          class="relative flex items-center rounded-xl text-xs font-bold transition-all duration-200 no-underline group cursor-pointer"
          :class="[
            isItemActive(item.href)
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 border border-transparent',
            isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'
          ]"
          :title="isCollapsed ? item.name : ''"
        >
          <!-- Active Left Pill Indicator -->
          <div
            v-if="isItemActive(item.href) && !isCollapsed"
            class="absolute -left-3 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full"
          ></div>

          <component
            :is="item.icon"
            class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-200"
            :class="isItemActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300'"
          />
          <span v-if="!isCollapsed" class="truncate flex-1">{{ item.name }}</span>
          
          <!-- Optional Badge Pill -->
          <span
            v-if="!isCollapsed && item.badge"
            class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded tracking-wider"
            :class="item.badgeClass || 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </div>
    </nav>

    <!-- User Profile & Sign Out Footer -->
    <div class="shrink-0 p-3 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40">
      <div
        class="flex items-center rounded-xl p-2 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200 cursor-pointer group shadow-2xs"
        :class="isCollapsed ? 'justify-center' : 'gap-3'"
        @click="handleSignOut"
        :title="isCollapsed ? `${userName} (Click to Sign Out)` : 'Click to Sign Out'"
      >
        <div class="relative w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          {{ userInitials }}
          <!-- Online status dot -->
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950"></span>
        </div>
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {{ userName }}
          </p>
          <p class="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 truncate mt-0.5">
            {{ userRole }}
          </p>
        </div>
        <LogOut
          v-if="!isCollapsed"
          class="w-4 h-4 text-slate-400 hover:text-rose-500 transition-colors shrink-0 group-hover:translate-x-0.5"
          title="Sign Out"
        />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  LayoutDashboard, Users, Fingerprint, DoorClosed, MapPin,
  Calendar, Shield, Server, ShieldCheck, ChevronLeft,
  ChevronRight, LogOut, Search, X, Radio
} from 'lucide-vue-next';
import { authService } from '@/services/authService';

const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);
const navSearchQuery = ref('');

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const rawUser = authService.getUserData();
const userName = computed(() => {
  if (!rawUser) return 'Workforce Admin';
  const name = `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim();
  if (!name || name.toLowerCase().includes('patrol')) return 'Workforce Admin';
  return name;
});
const userRole = computed(() => authService.getUserRole() || 'Admin');
const userInitials = computed(() => (userName.value.charAt(0) || 'W').toUpperCase());

const navSections = [
  {
    title: 'PEOPLE',
    items: [
      { name: 'Employees', href: '/dashboard/easy-access/employees', icon: Users },
      { name: 'Biometrics', href: '/dashboard/easy-access/biometrics', icon: Fingerprint }
    ]
  },
  {
    title: 'ACCESS CONTROL',
    items: [
      { name: 'Doors', href: '/dashboard/access-control/doors', icon: DoorClosed },
      { name: 'Zones', href: '/dashboard/settings/zones', icon: MapPin },
      { name: 'Schedules', href: '/dashboard/access-control/schedules', icon: Calendar },
      { name: 'Access Groups', href: '/dashboard/easy-access/configurators/access-levels', icon: Shield }
    ]
  },
  {
    title: 'HARDWARE & LOGS',
    items: [
      { name: 'Devices & Controllers', href: '/dashboard/settings/devices', icon: Server, badge: 'MQTT', badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' },
      { name: 'Event Logs', href: '/dashboard/settings/logs', icon: ShieldCheck, badge: 'Live', badgeClass: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40' }
    ]
  }
];

const matchesFilter = (name) => {
  if (!navSearchQuery.value) return true;
  return name.toLowerCase().includes(navSearchQuery.value.toLowerCase().trim());
};

const filteredSections = computed(() => {
  if (!navSearchQuery.value) return navSections;
  const q = navSearchQuery.value.toLowerCase().trim();
  return navSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => item.name.toLowerCase().includes(q))
  })).filter(sec => sec.items.length > 0);
});

const isDashboardActive = computed(() => {
  return route.path === '/dashboard' || route.path === '/dashboard/';
});

const isItemActive = (href) => {
  return route.path.startsWith(href);
};

const handleSignOut = () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}
</style>

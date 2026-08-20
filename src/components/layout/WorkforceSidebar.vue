<template>
  <aside
    class="relative flex flex-col h-screen shrink-0 z-20 transition-all duration-200 ease-in-out select-none bg-[#FFFFFF] border-r border-[#E2E8F0]"
    :class="isCollapsed ? 'w-[70px]' : 'w-[250px]'"
  >
    <!-- Toggle Button -->
    <button
      class="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:border-[#94A3B8] shadow-xs flex items-center justify-center z-50 focus:outline-none transition-all cursor-pointer"
      @click="toggleSidebar"
    >
      <ChevronRight v-if="isCollapsed" class="w-3.5 h-3.5" />
      <ChevronLeft v-else class="w-3.5 h-3.5" />
    </button>

    <!-- Brand Header -->
    <div
      class="flex items-center h-16 shrink-0 border-b border-[#E2E8F0]"
      :class="isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'"
    >
      <div class="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-xs">
        <ShieldCheck class="w-4 h-4 text-white" />
      </div>
      <div v-if="!isCollapsed" class="flex flex-col min-w-0">
        <span class="text-sm font-bold tracking-tight text-[#0F172A]">AccessEasy</span>
        <span class="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] -mt-0.5">Workforce</span>
      </div>
    </div>

    <!-- Navigation Scroll Area -->
    <nav class="flex-1 overflow-y-auto py-4 space-y-6 px-3 custom-scrollbar">
      <!-- Main Dashboard -->
      <div>
        <router-link
          to="/dashboard"
          class="flex items-center rounded-lg text-xs font-medium transition-colors no-underline group"
          :class="[
            $route.path === '/dashboard' || $route.path === '/dashboard/'
              ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#DBEAFE]'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent',
            isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2'
          ]"
          :title="isCollapsed ? 'Dashboard' : ''"
        >
          <LayoutDashboard
            class="w-4 h-4 shrink-0"
            :class="$route.path === '/dashboard' || $route.path === '/dashboard/' ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#0F172A]'"
          />
          <span v-if="!isCollapsed" class="truncate">Dashboard</span>
        </router-link>
      </div>

      <!-- Section: PEOPLE -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]"
        >
          PEOPLE
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in peopleNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-lg text-xs font-medium transition-colors no-underline group"
            :class="[
              $route.path.startsWith(item.href)
                ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#DBEAFE]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent',
              isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0"
              :class="$route.path.startsWith(item.href) ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#0F172A]'"
            />
            <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- Section: ACCESS -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]"
        >
          ACCESS
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in accessNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-lg text-xs font-medium transition-colors no-underline group"
            :class="[
              $route.path.startsWith(item.href)
                ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#DBEAFE]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent',
              isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0"
              :class="$route.path.startsWith(item.href) ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#0F172A]'"
            />
            <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- Section: HARDWARE & LOGS -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]"
        >
          HARDWARE & LOGS
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in biometricsNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-lg text-xs font-medium transition-colors no-underline group"
            :class="[
              $route.path.startsWith(item.href)
                ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#DBEAFE]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent',
              isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0"
              :class="$route.path.startsWith(item.href) ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#0F172A]'"
            />
            <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- User Profile & Sign Out Footer -->
    <div class="shrink-0 p-3 border-t border-[#E2E8F0]">
      <div
        class="flex items-center rounded-lg p-2 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        :class="isCollapsed ? 'justify-center' : 'gap-3'"
        @click="handleSignOut"
      >
        <div class="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center shrink-0 shadow-2xs">
          {{ userInitials }}
        </div>
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-[#0F172A] truncate leading-tight">{{ userName }}</p>
          <p class="text-[10px] text-[#64748B] truncate">{{ userRole }}</p>
        </div>
        <LogOut v-if="!isCollapsed" class="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#0F172A] shrink-0" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  LayoutDashboard, Users, UserCheck, Building2,
  Shield, Key, DoorClosed, MapPin, Calendar,
  Fingerprint, Server, ChevronLeft, ChevronRight, LogOut, ShieldCheck
} from 'lucide-vue-next';
import { authService } from '@/services/authService';

const router = useRouter();
const isCollapsed = ref(false);

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
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

const peopleNav = [
  { name: 'Employees', href: '/dashboard/easy-access/employees', icon: Users },
  { name: 'Biometrics', href: '/dashboard/easy-access/biometrics', icon: Fingerprint }
];

const accessNav = [
  { name: 'Doors', href: '/dashboard/access-control/doors', icon: DoorClosed },
  { name: 'Zones', href: '/dashboard/settings/zones', icon: MapPin },
  { name: 'Schedules', href: '/dashboard/access-control/schedules', icon: Calendar },
  { name: 'Access Groups', href: '/dashboard/easy-access/configurators/access-levels', icon: Shield }
];

const biometricsNav = [
  { name: 'Devices', href: '/dashboard/settings/devices', icon: Server },
  { name: 'Event Logs', href: '/dashboard/settings/logs', icon: ShieldCheck }
];

const handleSignOut = () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 4px;
}
</style>

<template>
  <aside
    class="relative flex flex-col h-screen shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden"
    :class="isCollapsed ? 'w-[72px]' : 'w-[240px]'"
    style="background: linear-gradient(180deg, #0e1628 0%, #09101f 100%); border-right: 1px solid rgba(255,255,255,0.05);"
  >
    <!-- Toggle Button -->
    <button
      class="absolute -right-3 top-5 w-6 h-6 rounded-full flex items-center justify-center z-50 focus:outline-none transition-all duration-300 hover:scale-110"
      style="background:#151c2c; border:1px solid rgba(255,255,255,0.1); color:#64748b; box-shadow:0 2px 8px rgba(0,0,0,0.3);"
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
      class="flex items-center h-14 shrink-0 overflow-hidden"
      :class="isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'"
      style="border-bottom: 1px solid rgba(255,255,255,0.05);"
    >
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style="background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 2px 12px rgba(99,102,241,0.4);"
      >
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
        <span
          class="text-sm font-black tracking-tight"
          style="background:linear-gradient(135deg,#fff 0%,#a5b4fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;"
        >AccessEasy</span>
        <span
          class="text-[10px] font-medium mt-0.5"
          style="color:#374151;"
        >Workforce Platform</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav
      class="flex-1 overflow-y-auto py-4 space-y-5"
      :class="isCollapsed ? 'px-2' : 'px-3'"
      style="scrollbar-width:none;"
    >
      <!-- Daily Operations -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-2 mb-2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
          style="color:#374151; letter-spacing:0.1em;"
        >
          Daily Operations
        </p>
        <div
          ref="navGroupEl"
          class="relative space-y-0.5"
        >
          <!-- Sliding active background pill -->
          <div
            v-if="!isCollapsed"
            class="absolute left-0 right-0 rounded-xl pointer-events-none transition-all duration-300"
            style="background:linear-gradient(135deg,rgba(99,102,241,0.18),rgba(79,70,229,0.1)); border:1px solid rgba(99,102,241,0.2); z-index:0;"
            :style="activePillStyle"
          />
          <router-link
            v-for="(item, idx) in dailyOperationsNav"
            :key="item.name"
            :ref="el => { if(el?.$el) navEls[idx] = el.$el }"
            :to="item.href"
            class="flex items-center rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group relative z-10 no-underline"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'text-indigo-300'
                : 'hover:bg-white/5',
              isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2.5'
            ]"
            :style="!(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'color:#4b5563;' : ''"
            :title="isCollapsed ? item.name : ''"
            @click="updatePill(idx)"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors duration-200"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- Site Setup -->
      <div>
        <p
          v-if="!isCollapsed"
          class="px-2 mb-2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
          style="color:#374151; letter-spacing:0.1em;"
        >
          Site Setup
        </p>
        <div class="space-y-0.5">
          <router-link
            v-for="item in siteSetupNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group no-underline"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'text-indigo-300'
                : 'hover:bg-white/5',
              isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2.5'
            ]"
            :style="!(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'color:#4b5563;' : ''"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href)) ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- User Footer -->
    <div
      class="shrink-0 space-y-1"
      :class="isCollapsed ? 'p-2' : 'p-3'"
      style="border-top: 1px solid rgba(255,255,255,0.05);"
    >
      <!-- User row -->
      <button
        class="flex items-center w-full rounded-xl transition-all duration-200 text-left group hover:bg-white/5"
        :class="isCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2.5'"
        :title="isCollapsed ? 'Sign Out' : ''"
        @click="handleSignOut"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300"
          style="background:linear-gradient(135deg,rgba(99,102,241,0.25),rgba(79,70,229,0.15)); border:1px solid rgba(99,102,241,0.3); color:#818cf8;"
        >
          {{ userInitials }}
        </div>
        <div
          v-if="!isCollapsed"
          class="flex flex-col min-w-0 flex-1"
        >
          <span
            class="text-xs font-bold truncate leading-none"
            style="color:#e2e8f0;"
          >{{ userName }}</span>
          <span
            class="text-[10px] mt-0.5 truncate"
            style="color:#374151;"
          >{{ userRole }}</span>
        </div>
        <LogOut
          v-if="!isCollapsed"
          class="w-3.5 h-3.5 shrink-0 transition-colors"
          style="color:#374151;"
        />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  LayoutDashboard, Users, Shield, MapPin,
  Settings, LogOut, ChevronLeft, ChevronRight, ClipboardList, Server, FileText, Fingerprint
} from 'lucide-vue-next';
import { authService } from '@/services/authService';

const router = useRouter();
const route = useRoute();
const rawUser = authService.getUserData();

const isCollapsed = ref(false);
const navEls = ref([]);
const navGroupEl = ref(null);
const activePillStyle = ref({ height: '0px', top: '4px', opacity: 0 });

const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };

const userName = computed(() => {
  if (!rawUser) return 'Admin User';
  return `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim() || 'Admin User';
});
const userRole = computed(() => authService.getUserRole() || 'Employee');
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

const dailyOperationsNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Employees', href: '/dashboard/easy-access/employees', icon: Users },
  { name: 'Groups', href: '/dashboard/easy-access/configurators/access-levels', icon: Shield },
  { name: 'Doors', href: '/dashboard/access-control/doors', icon: MapPin },
  { name: 'Biometrics Hub', href: '/dashboard/easy-access/biometrics', icon: Fingerprint },
  { name: 'Event Logs', href: '/dashboard/settings/logs', icon: FileText },
  { name: 'Scheduled Reports', href: '/dashboard/report-automation', icon: ClipboardList }
];

const siteSetupNav = [
  { name: 'Devices', href: '/dashboard/settings/devices', icon: Server },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

const updatePill = async (idx) => {
  await nextTick();
  const el = navEls.value[idx];
  if (!el) return;
  activePillStyle.value = {
    height: `${el.offsetHeight}px`,
    top: `${el.offsetTop}px`,
    opacity: 1,
  };
};

watch(() => route.path, async () => {
  await nextTick();
  const activeIdx = dailyOperationsNav.findIndex(item =>
    item.exact ? route.path === item.href : route.path.startsWith(item.href)
  );
  if (activeIdx >= 0) updatePill(activeIdx);
}, { immediate: true });

onMounted(async () => {
  await nextTick();
  const activeIdx = dailyOperationsNav.findIndex(item =>
    item.exact ? route.path === item.href : route.path.startsWith(item.href)
  );
  if (activeIdx >= 0) updatePill(activeIdx);
});

const handleSignOut = async () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
nav::-webkit-scrollbar { display: none; }
.router-link-active { text-decoration: none; }
a { text-decoration: none; }
</style>

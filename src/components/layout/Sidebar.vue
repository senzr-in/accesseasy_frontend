<template>
  <div class="flex flex-col h-screen w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/60 z-20 shrink-0 transition-all duration-300">
    <!-- Branding -->
    <div class="flex items-center gap-3 px-6 h-20 border-b border-slate-200 dark:border-slate-800/60">
      <!-- Placeholder SVG for Logo to avoid external component dependency for now -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-blue-500">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <div class="flex flex-col">
        <span class="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
          Access <span class="text-blue-500">Easy</span>
        </span>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Enterprise</span>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
      <template v-for="item in navigationItems" :key="item.name">
        <!-- Render items with children as an accordion -->
        <RbacGuard v-if="item.role" :requiredRole="item.role">
          <div v-if="item.children" class="mb-1">
            <button
              @click="toggleMenu(item.name)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                isChildActive(item)
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'w-5 h-5',
                  isChildActive(item) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                ]"
              />
              <span>{{ item.name }}</span>
              <ChevronDown
                class="ml-auto w-4 h-4 transition-transform duration-200"
                :class="expandedMenus[item.name] ? 'rotate-180' : ''"
              />
            </button>
            <div v-show="expandedMenus[item.name]" class="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1">
              <router-link
                v-for="child in item.children"
                :key="child.name"
                :to="child.href"
                v-slot="{ isActive }"
                custom
              >
                <a
                  :href="child.href"
                  @click.prevent="$router.push(child.href)"
                  :class="[
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="isActive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
                  {{ child.name }}
                </a>
              </router-link>
            </div>
          </div>
          <!-- Normal items without children -->
          <router-link
            v-else
            :to="item.href"
            v-slot="{ isActive, isExactActive }"
            custom
          >
            <a
              :href="item.href"
              @click.prevent="$router.push(item.href)"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                (item.href === '/dashboard' ? isExactActive : isActive)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              ]"
            >
              <component 
                :is="item.icon" 
                :class="[
                  'w-5 h-5',
                  (item.href === '/dashboard' ? isExactActive : isActive) ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                ]" 
              />
              <span>{{ item.name }}</span>
              <ChevronRight v-if="(item.href === '/dashboard' ? isExactActive : isActive)" class="ml-auto w-4 h-4 opacity-50" />
            </a>
          </router-link>
        </RbacGuard>
        <!-- Same block for items without Roles -->
        <template v-else>
          <!-- Items with children -->
          <div v-if="item.children" class="mb-1">
            <button
              @click="toggleMenu(item.name)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                isChildActive(item)
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'w-5 h-5',
                  isChildActive(item) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                ]"
              />
              <span>{{ item.name }}</span>
              <ChevronDown
                class="ml-auto w-4 h-4 transition-transform duration-200"
                :class="expandedMenus[item.name] ? 'rotate-180' : ''"
              />
            </button>
            <div v-show="expandedMenus[item.name]" class="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1">
              <router-link
                v-for="child in item.children"
                :key="child.name"
                :to="child.href"
                v-slot="{ isActive }"
                custom
              >
                <a
                  :href="child.href"
                  @click.prevent="$router.push(child.href)"
                  :class="[
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="isActive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
                  {{ child.name }}
                </a>
              </router-link>
            </div>
          </div>
          <!-- Normal items without children -->
          <router-link
            v-else
            :to="item.href"
            v-slot="{ isActive, isExactActive }"
            custom
          >
            <a
              :href="item.href"
              @click.prevent="$router.push(item.href)"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                (item.href === '/dashboard' ? isExactActive : isActive)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              ]"
            >
              <component 
                :is="item.icon" 
                :class="[
                  'w-5 h-5',
                  (item.href === '/dashboard' ? isExactActive : isActive) ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                ]" 
              />
              <span>{{ item.name }}</span>
              <ChevronRight v-if="(item.href === '/dashboard' ? isExactActive : isActive)" class="ml-auto w-4 h-4 opacity-50" />
            </a>
          </router-link>
        </template>
      </template>
    </div>

    <!-- User Footer -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors group text-slate-500 dark:text-slate-400"
      >
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
        <span class="text-xs font-bold">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
      <!-- Sign Out -->
      <button @click="handleSignOut" class="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
          {{ userInitials }}
        </div>
        <div class="flex flex-col items-start min-w-0">
          <span class="text-sm font-bold text-slate-900 dark:text-white truncate w-full">
            {{ userName }}
          </span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
            {{ userRole }}
          </span>
        </div>
        <LogOut class="ml-auto w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  LayoutDashboard, 
  Settings, 
  List, 
  Users, 
  Building, 
  Key, 
  Server, 
  Shield, 
  ShieldCheck,
  ChevronRight,
  LogOut,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-vue-next';
import RbacGuard from './RbacGuard.vue';
import { authService } from '@/services/authService';

const router = useRouter();

// Read user synchronously from localStorage
const rawUser = authService.getUserData();

const userName = computed(() => {
  if (!rawUser) return 'Admin User';
  return `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim() || 'Admin User';
});
const userRole = computed(() => authService.getUserRole() || 'Employee');
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

const navigationItems = computed(() => {
  if (userRole.value === 'Guard') {
    return [
      { name: "Live Insights", href: "/dashboard", icon: LayoutDashboard },
      { name: "Authorize", href: "/dashboard/authorize", icon: ShieldCheck },
      { name: "Live Logs", href: "/dashboard/settings/logs", icon: List },
    ];
  }

  if (userRole.value === 'Employee') {
    return [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "My Access", href: "/dashboard/my-access", icon: Key },
      { name: "My Attendance", href: "/dashboard/my-attendance", icon: List }
    ];
  }
  
  return [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Authorize", href: "/dashboard/authorize", icon: Key, role: "Admin" },
    { name: "Doors", href: "/dashboard/access-control/doors", icon: Building, role: "Admin" },
    { name: "Groups", href: "/dashboard/easy-access/configurators/access-levels", icon: Shield, role: "Admin" },
    { name: "Guards", href: "/dashboard/guards", icon: ShieldCheck, role: "Admin" },
    { name: "Employees", href: "/dashboard/easy-access/employees", icon: Users, role: "Admin" },
    { name: "Visitor Portals", href: "/dashboard/visitor-portals", icon: Users, role: "Admin" },
    { 
      name: "Settings", 
      icon: Settings, 
      role: "Admin",
      children: [
        { name: "Branches", href: "/dashboard/settings/branches" },
        { name: "Zones", href: "/dashboard/settings/zones" },
        { name: "Timer Zones", href: "/dashboard/settings/timezones" },
        { name: "Devices", href: "/dashboard/settings/devices" },
        { name: "Event Logs", href: "/dashboard/settings/logs" }
      ]
    },
  ];
});

const expandedMenus = ref({
  "Settings": false
});

const toggleMenu = (name) => {
  expandedMenus.value[name] = !expandedMenus.value[name];
};

const isChildActive = (item) => {
  if (!item.children) return false;
  return item.children.some(child => router.currentRoute.value.path.includes(child.href));
};

const handleSignOut = async () => {
  // IN-05: Revoke QR token on logout for Employee users
  if (userRole.value === 'Employee') {
    try {
      const token = authService.getToken();
      const rawUser = authService.getUserData();
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (token && rawUser?.id) {
        // Find any active QR tokens for this user
        const qrRes = await fetch(
          `${apiUrl}/items/qrgenerate?filter[qraccess][_eq]=true&fields=id,employeeId&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          // Revoke all active tokens for this user
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
          console.log('IN-05: QR tokens revoked on logout.');
        }
      }
    } catch(e) {
      console.warn('IN-05: QR revocation on logout failed silently.', e);
    }
  }

  authService.logout();
  router.push('/login');
};

// Dark mode toggle
const isDark = ref(document.documentElement.classList.contains('dark'));

const toggleTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('ae_theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('ae_theme', 'dark');
  }
  isDark.value = !isDark.value;
};
</script>

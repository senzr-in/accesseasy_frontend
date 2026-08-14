<template>
  <aside
    class="sidebar"
    :class="isCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'"
  >
    <!-- Toggle Button -->
    <button
      class="sidebar__toggle"
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
      class="sidebar__brand"
      :class="isCollapsed ? 'sidebar__brand--collapsed' : 'sidebar__brand--expanded'"
    >
      <div class="sidebar__logo">
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
        class="sidebar__brand-text"
      >
        <span class="sidebar__brand-name">AccessEasy</span>
        <span class="sidebar__brand-mode">
          {{ appMode === 'security' ? 'Security Platform' : appMode === 'patrol' ? 'Patrol Platform' : 'Workforce Platform' }}
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav
      class="sidebar__nav"
      :class="isCollapsed ? 'px-2' : 'px-3'"
    >
      <!-- Daily Operations -->
      <div>
        <p
          v-if="!isCollapsed"
          class="sidebar__section-label"
        >
          Daily Operations
        </p>
        <div
          ref="navGroupEl"
          class="sidebar__nav-group"
        >
          <!-- Active pill indicator -->
          <div
            v-if="!isCollapsed"
            class="sidebar__active-pill"
            :style="activePillStyle"
          />
          <router-link
            v-for="(item, idx) in currentNav"
            :key="item.name"
            :ref="el => { if(el?.$el) navEls[idx] = el.$el }"
            :to="item.href"
            class="sidebar__nav-item"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'sidebar__nav-item--active'
                : 'sidebar__nav-item--idle',
              isCollapsed ? 'sidebar__nav-item--collapsed' : 'sidebar__nav-item--full'
            ]"
            :title="isCollapsed ? item.name : ''"
            @click="updatePill(idx)"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors duration-200"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate relative z-10"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- Site Setup -->
      <div v-if="siteSetupNav.length > 0">
        <p
          v-if="!isCollapsed"
          class="sidebar__section-label"
        >
          Site Setup
        </p>
        <div class="sidebar__nav-group">
          <router-link
            v-for="item in siteSetupNav"
            :key="item.name"
            :to="item.href"
            class="sidebar__nav-item"
            :class="[
              (item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'sidebar__nav-item--active'
                : 'sidebar__nav-item--idle',
              isCollapsed ? 'sidebar__nav-item--collapsed' : 'sidebar__nav-item--full'
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0 transition-colors duration-200"
              :class="(item.exact ? $route.path === item.href : $route.path.startsWith(item.href))
                ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'"
            />
            <span
              v-if="!isCollapsed"
              class="truncate relative z-10"
            >{{ item.name }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- User Footer -->
    <div
      class="sidebar__footer"
      :class="isCollapsed ? 'p-2' : 'p-3'"
    >
      <!-- Settings link -->
      <router-link
        v-if="userRole === 'Admin'"
        to="/dashboard/settings"
        class="sidebar__nav-item sidebar__nav-item--idle"
        :class="isCollapsed ? 'sidebar__nav-item--collapsed' : 'sidebar__nav-item--full'"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <Settings class="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors" />
        <span
          v-if="!isCollapsed"
          class="truncate"
        >Settings</span>
      </router-link>

      <!-- User row -->
      <button
        class="sidebar__user-btn"
        :class="isCollapsed ? 'sidebar__user-btn--collapsed' : 'sidebar__user-btn--full'"
        :title="isCollapsed ? 'Sign Out' : ''"
        @click="handleSignOut"
      >
        <div class="sidebar__avatar">
          {{ userInitials }}
        </div>
        <div
          v-if="!isCollapsed"
          class="sidebar__user-info"
        >
          <span class="sidebar__user-name">{{ userName }}</span>
          <span class="sidebar__user-role">{{ userRole }}</span>
        </div>
        <LogOut
          v-if="!isCollapsed"
          class="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0"
        />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  LayoutDashboard, Users, Shield, ShieldCheck, MapPin, Search, Plus,
  Settings, LogOut, ChevronLeft, ChevronRight, ClipboardList, Building2, Camera, ShieldAlert, Activity, Fingerprint
} from 'lucide-vue-next';
import { authService } from '@/services/authService';

const router = useRouter();
const route = useRoute();
const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const rawUser = authService.getUserData();

const isCollapsed = ref(false);
const navEls = ref([]);
const activePillStyle = ref({ height: '0px', top: '0px', opacity: 0 });

const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };

const userName = computed(() => {
  if (!rawUser) return 'Admin User';
  return `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim() || 'Admin User';
});
const userRole = computed(() => authService.getUserRole() || 'Employee');
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

const securityNav = computed(() => [
  { name: 'SOC Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Live Monitoring', href: '/dashboard/monitoring', icon: Camera },
  { name: 'Incident Logs', href: '/dashboard/incidents', icon: ShieldAlert },
  { name: 'AI Analytics', href: '/dashboard/analytics', icon: Activity }
]);

const dailyOperationsNav = computed(() => {
  const items = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Visitors', href: '/dashboard/visitors', icon: Users },
    { name: 'Access Points', href: '/dashboard/access-control/doors', icon: MapPin },
  ];
  if (userRole.value === 'Admin' || userRole.value === 'Manager') {
    items.push({ name: 'Biometrics Hub', href: '/dashboard/easy-access/biometrics', icon: Fingerprint });
  }
  items.push({ name: 'Reports', href: '/dashboard/report-automation', icon: ClipboardList });
  return items;
});

const currentNav = computed(() => appMode === 'security' ? securityNav.value : dailyOperationsNav.value);

const siteSetupNav = computed(() => {
  if (userRole.value === 'Admin' || userRole.value === 'Manager') {
    return [{ name: 'Zones', href: '/dashboard/settings/zones', icon: Building2 }];
  }
  return [];
});

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

// Auto-update pill on route change
watch(() => route.path, async () => {
  await nextTick();
  const activeIdx = currentNav.value.findIndex(item =>
    item.exact ? route.path === item.href : route.path.startsWith(item.href)
  );
  if (activeIdx >= 0) updatePill(activeIdx);
}, { immediate: true });

onMounted(async () => {
  await nextTick();
  const activeIdx = currentNav.value.findIndex(item =>
    item.exact ? route.path === item.href : route.path.startsWith(item.href)
  );
  if (activeIdx >= 0) updatePill(activeIdx);
});

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
            ?.map(q => fetch(`${apiUrl}/items/qrgenerate/${q.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ qraccess: false })
            })) || [];
          await Promise.allSettled(revokePromises);
        }
      }
    } catch (e) { console.warn('QR revocation on logout failed silently.', e); }
  }
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
/* ─── Sidebar Shell ───────────────────────────────────── */
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #09101f;
  border-right: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
  z-index: 20;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  /* Subtle grain texture overlay */
  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E"),
    linear-gradient(180deg, #0e1628 0%, #09101f 100%);
}
.sidebar--collapsed { width: 72px; }
.sidebar--expanded { width: 240px; }

/* ─── Toggle Button ───────────────────────────────────── */
.sidebar__toggle {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #151c2c;
  border: 1px solid rgba(255,255,255,0.1);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 50;
  transition: color 200ms, background 200ms, transform 350ms cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.sidebar__toggle:hover {
  color: white;
  background: #1e2d4a;
  transform: scale(1.15);
}

/* ─── Brand ───────────────────────────────────────────── */
.sidebar__brand {
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar__brand--collapsed { justify-content: center; padding: 0; }
.sidebar__brand--expanded { gap: 10px; padding: 0 20px; }

.sidebar__logo {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(99,102,241,0.35);
  transition: box-shadow 300ms;
}
.sidebar__logo:hover {
  box-shadow: 0 4px 16px rgba(99,102,241,0.5);
}

.sidebar__brand-name {
  display: block;
  font-size: 14px;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.sidebar__brand-mode {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #4b5563;
  white-space: nowrap;
  margin-top: 1px;
}

/* ─── Navigation ──────────────────────────────────────── */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding-top: 16px;
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sidebar__nav::-webkit-scrollbar { width: 0; }

.sidebar__section-label {
  padding: 0 8px;
  margin-bottom: 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #374151;
  white-space: nowrap;
}

.sidebar__nav-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Sliding active pill */
.sidebar__active-pill {
  position: absolute;
  left: 0;
  right: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(79,70,229,0.1));
  border: 1px solid rgba(99,102,241,0.2);
  pointer-events: none;
  transition: top 350ms cubic-bezier(0.34, 1.2, 0.64, 1),
              height 300ms cubic-bezier(0.34, 1.2, 0.64, 1),
              opacity 250ms;
  z-index: 0;
}

/* Nav items */
.sidebar__nav-item {
  display: flex;
  align-items: center;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 200ms, background 200ms, transform 300ms cubic-bezier(0.34,1.56,0.64,1);
}
.sidebar__nav-item--full { gap: 9px; padding: 8px 12px; }
.sidebar__nav-item--collapsed { justify-content: center; padding: 12px 0; }

.sidebar__nav-item--active { color: #a5b4fc; }
.sidebar__nav-item--idle { color: #4b5563; }
.sidebar__nav-item--idle:hover {
  color: #9ca3af;
  background: rgba(255,255,255,0.04);
  transform: translateX(2px);
}
.sidebar__nav-item--collapsed.sidebar__nav-item--idle:hover {
  transform: scale(1.1);
}

/* ─── Footer ──────────────────────────────────────────── */
.sidebar__footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__user-btn {
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 200ms, transform 300ms cubic-bezier(0.34,1.56,0.64,1);
}
.sidebar__user-btn--full { gap: 9px; padding: 8px 12px; }
.sidebar__user-btn--collapsed { justify-content: center; padding: 12px 0; }
.sidebar__user-btn:hover {
  background: rgba(255,255,255,0.04);
  transform: translateX(2px);
}
.sidebar__user-btn--collapsed:hover { transform: scale(1.1); }

.sidebar__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15));
  border: 1px solid rgba(99,102,241,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #818cf8;
  flex-shrink: 0;
  transition: box-shadow 250ms;
}
.sidebar__user-btn:hover .sidebar__avatar {
  box-shadow: 0 0 10px rgba(99,102,241,0.3);
}

.sidebar__user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.sidebar__user-name {
  font-size: 12px;
  font-weight: 800;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
.sidebar__user-role {
  font-size: 10px;
  color: #4b5563;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .sidebar { transition: none; }
  .sidebar__active-pill { transition: none; }
  .sidebar__nav-item:hover { transform: none; }
  .sidebar__toggle:hover { transform: none; }
  .sidebar__user-btn:hover { transform: none; }
}
</style>

<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] p-6 gap-6 overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Permissions</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Control what each role can access and manage</p>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all"
      :class="toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'"
    >
      <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4" />
      <AlertTriangle v-else class="w-4 h-4" />
      {{ toast.message }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
    </div>

    <div v-else class="flex flex-col gap-4">
      <!-- Role Permission Card -->
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
      >
        <!-- Role Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="roleColor(role).bg">
              <Shield class="w-4 h-4" :class="roleColor(role).icon" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ role.roleName || role.name }}</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 capitalize">{{ role.accessType || 'accesseasy' }}</p>
            </div>
          </div>
          <span v-if="savingRoleId === role.id" class="text-[10px] text-indigo-500 font-semibold flex items-center gap-1">
            <Loader2 class="w-3 h-3 animate-spin" /> Saving...
          </span>
        </div>

        <!-- Permission Toggles -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-slate-100 dark:bg-white/5">
          <div
            v-for="perm in permissionKeys"
            :key="perm.key"
            class="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#151c2c]"
          >
            <div class="flex items-center gap-2">
              <component :is="perm.icon" class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ perm.label }}</span>
            </div>
            <button
              class="w-8 h-4 rounded-full flex items-center transition-colors px-0.5"
              :class="getPermValue(role, perm.key) ? 'bg-indigo-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'"
              @click="togglePerm(role, perm.key)"
            >
              <div class="w-3 h-3 rounded-full bg-white shadow-sm transition-transform"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="roles.length === 0" class="py-24 flex flex-col items-center text-center bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5">
        <Lock class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">No roles found</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Create roles first to configure permissions</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Shield, Lock, Loader2, Eye, Users, MapPin, AlertTriangle, BarChart2, Settings, Camera, CheckCircle } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const apiUrl = import.meta.env.VITE_API_URL;
const loading = ref(false);
const savingRoleId = ref(null);
const roles = ref([]);
const toast = ref({ show: false, type: 'success', message: '' });

const showToast = (type, message) => {
  toast.value = { show: true, type, message };
  setTimeout(() => { toast.value.show = false; }, 2500);
};

const permissionKeys = [
  { key: 'enable_dashboard',    label: 'Dashboard',    icon: Eye },
  { key: 'enable_visitors',     label: 'Visitors',     icon: Users },
  { key: 'enable_patrols',      label: 'Patrols',      icon: MapPin },
  { key: 'enable_incidents',    label: 'Incidents',    icon: AlertTriangle },
  { key: 'enable_reports',      label: 'Reports',      icon: BarChart2 },
  { key: 'enable_settings',     label: 'Settings',     icon: Settings },
  { key: 'enable_guards',       label: 'Guards',       icon: Users },
  { key: 'enable_ai',           label: 'AI Events',    icon: Camera },
];

const roleColors = [
  { bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: 'text-indigo-600 dark:text-indigo-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-400' },
  { bg: 'bg-rose-50 dark:bg-rose-500/10', icon: 'text-rose-600 dark:text-rose-400' },
];
const roleColor = (role) => roleColors[roles.value.indexOf(role) % roleColors.length];

const getPermValue = (role, key) => {
  const perms = role.dataScope || {};
  return !!perms[key];
};

const togglePerm = async (role, key) => {
  const current = getPermValue(role, key);
  // Optimistic update
  if (!role.dataScope) role.dataScope = {};
  role.dataScope[key] = !current;

  savingRoleId.value = role.id;
  try {
    const token = authService.getToken();
    const res = await fetch(`${apiUrl}/items/roleConfigurator/${role.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dataScope: { ...role.dataScope } })
    });
    if (res.ok) {
      showToast('success', `Permission saved`);
    } else {
      const err = await res.json();
      console.error('Permission save failed:', err);
      role.dataScope[key] = current;
      showToast('error', 'Failed to save: ' + (err.errors?.[0]?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Permission update error', err);
    role.dataScope[key] = current;
    showToast('error', 'Network error — could not save permission');
  } finally {
    savingRoleId.value = null;
  }
};

const fetchRoles = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${apiUrl}/items/roleConfigurator?filter[tenant][tenantId][_eq]=${tenantId}&filter[accessType][_eq]=accessEasy`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      roles.value = (data.data || []).map(r => ({
        ...r,
        dataScope: r.dataScope || {}
      }));
    }
  } catch (err) {
    console.error('Permissions fetch error', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRoles);
</script>

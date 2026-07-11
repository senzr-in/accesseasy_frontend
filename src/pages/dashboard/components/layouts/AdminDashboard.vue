<template>
  <div class="space-y-6 pb-12">
    <!-- Live Building Health Card -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Doors Connected</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">{{ buildingStats.doors }}</h3>
        <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">✓ All hardware online</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Registered Employees</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">{{ buildingStats.employees }}</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Staff directory list</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Access Groups</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">{{ buildingStats.groups }}</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">RBAC permission tiers</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Server Health</span>
        <h3 class="text-3xl font-black mt-2 text-indigo-500">{{ buildingStatus.healthScore }}%</h3>
        <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Optimal execution</p>
      </div>
    </div>

    <!-- Admin Operational Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Building Status & Devices Widget -->
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col h-[450px]">
        <div class="pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <Server class="w-4 h-4 text-indigo-500" />
            Infrastructure Status
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto mt-4 space-y-4 custom-scrollbar text-xs">
          <!-- Active Gates -->
          <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-2xl border border-slate-200/30 dark:border-zinc-800">
            <div>
              <span class="block font-bold text-slate-800 dark:text-white leading-none">Gateways & Readers</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Total physical gateways</span>
            </div>
            <span class="text-sm font-black text-slate-900 dark:text-white">{{ buildingStatus.activeGates }} Active</span>
          </div>

          <!-- Offline Gates -->
          <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-2xl border border-slate-200/30 dark:border-zinc-800">
            <div>
              <span class="block font-bold text-slate-800 dark:text-white leading-none">Device Alerts</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Disconnected hardware items</span>
            </div>
            <span class="text-sm font-black text-rose-500">{{ buildingStatus.offlineGates }} Offline</span>
          </div>

          <!-- System Integration states -->
          <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-2xl border border-slate-200/30 dark:border-zinc-800">
            <div>
              <span class="block font-bold text-slate-800 dark:text-white leading-none">Active Security Personnel</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Guards currently checked-in</span>
            </div>
            <span class="text-sm font-black text-slate-900 dark:text-white">{{ buildingStatus.activeGuards }}</span>
          </div>
        </div>

        <!-- Add Actions footer -->
        <div class="pt-4 border-t border-slate-100 dark:border-zinc-800 shrink-0 flex gap-2">
          <button 
            @click="showDoorDialog = true"
            class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center"
          >
            Register Door
          </button>
          <button 
            @click="showEmployeeDialog = true"
            class="flex-1 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center"
          >
            Add Staff
          </button>
        </div>
      </div>

      <!-- Timeline activity -->
      <div class="lg:col-span-2 h-[450px]">
        <SmartTimeline />
      </div>
    </div>

    <!-- Dialogs -->
    <DoorRegistrationDialog
      v-model="showDoorDialog"
      @success="fetchStats"
    />
    <AddEmployeeDialog
      v-model="showEmployeeDialog"
      @success="fetchStats"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Server } from 'lucide-vue-next';
import { useDashboardState } from '@/composables/useDashboardState';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import SmartTimeline from '@/pages/dashboard/components/SmartTimeline.vue';
import DoorRegistrationDialog from '@/pages/devicesManager/doors/doorRegistrationDialog.vue';
import AddEmployeeDialog from '@/pages/employee/my-teams/personalDetails/addEmployeeDialog.vue';

const { buildingStatus } = useDashboardState();

const showDoorDialog = ref(false);
const showEmployeeDialog = ref(false);
const buildingStats = ref({ doors: 0, employees: 0, groups: 0 });

const fetchStats = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  if (!token || !tenantId) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
      action: 'main-dashboard',
      tenantId,
      today,
      role: 'Admin'
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    const data = response.data;
    buildingStats.value = {
      doors: data.doors || 0,
      employees: data.employees || 0,
      groups: data.groups || 0
    };
  } catch(e) {
    console.error('Admin stats loading failed:', e);
  }
};

onMounted(() => {
  fetchStats();
});
</script>

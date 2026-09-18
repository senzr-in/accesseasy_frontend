<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="ops.audit_log" show-locked-badge locked-label="Security System Audit Trail — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <button
            @click="router.push('/dashboard/settings')"
            class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Back to Settings"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <ScrollText class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Activity &amp; Audit Log
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              System activity history and configuration logs
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            :disabled="loading"
            @click="fetchAuditLogs"
            title="Refresh logs"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            <span>Refresh</span>
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            :disabled="filteredLogs.length === 0"
            @click="exportAuditCSV"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <span class="font-bold text-slate-400 uppercase text-[10px]">Filter Action:</span>
          <select v-model="actionFilter" class="ae-input py-1.5 min-w-[140px]">
            <option value="all">All Actions</option>
            <option value="CREATE">Create (CREATE)</option>
            <option value="UPDATE">Update (UPDATE)</option>
            <option value="DELETE">Delete (DELETE)</option>
            <option value="LOGIN">Auth & Login</option>
            <option value="INCIDENT">Incidents</option>
            <option value="PATROL">Patrols</option>
            <option value="GEOFENCE">Geofence</option>
          </select>
        </div>

        <div class="relative w-full sm:w-72">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by user, IP, or resource..."
            class="ae-input w-full py-1.5 pl-9 text-xs"
          />
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div class="overflow-x-auto custom-scrollbar flex-1">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th class="px-5 py-3.5">Timestamp</th>
                <th class="px-4 py-3.5">Actor (User)</th>
                <th class="px-4 py-3.5">Action Event</th>
                <th class="px-4 py-3.5">Resource Target</th>
                <th class="px-4 py-3.5">Details & Metadata</th>
                <th class="px-4 py-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <!-- Loading Skeleton -->
              <tr v-if="loading" v-for="n in 5" :key="'skel-' + n" class="animate-pulse">
                <td class="px-5 py-4"><div class="h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded w-28"></div></td>
                <td class="px-4 py-4"><div class="h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded w-36"></div></td>
                <td class="px-4 py-4"><div class="h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded w-20"></div></td>
                <td class="px-4 py-4"><div class="h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded w-24"></div></td>
                <td class="px-4 py-4"><div class="h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded w-48"></div></td>
                <td class="px-4 py-4 text-right"><div class="h-3.5 bg-slate-200 dark:bg-slate-700/50 rounded w-20 ml-auto"></div></td>
              </tr>

              <!-- Real Log Rows -->
              <tr v-else-if="filteredLogs.length > 0" v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                
                <!-- Timestamp -->
                <td class="px-5 py-3.5 font-mono text-slate-400">
                  {{ formatDateTime(log.timestamp) }}
                </td>

                <!-- Actor -->
                <td class="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-bold text-[10px] flex items-center justify-center">
                      {{ (log.user_name || 'U')[0]?.toUpperCase() }}
                    </div>
                    <span>{{ log.user_name }}</span>
                    <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{{ log.user_role }}</span>
                  </div>
                </td>

                <!-- Action Event -->
                <td class="px-4 py-3.5">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider"
                    :class="getActionBadgeClass(log.action)"
                  >
                    {{ log.action }}
                  </span>
                </td>

                <!-- Resource -->
                <td class="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                  {{ log.resource }}
                </td>

                <!-- Details -->
                <td class="px-4 py-3.5 text-slate-500 max-w-xs truncate" :title="log.details">
                  {{ log.details }}
                </td>

                <!-- IP Address -->
                <td class="px-4 py-3.5 text-right font-mono text-slate-400">
                  {{ log.ip_address }}
                </td>

              </tr>

              <tr v-else>
                <td colspan="6" class="py-14 text-center">
                  <div class="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <ScrollText class="w-8 h-8 opacity-30" />
                    <p class="font-medium text-xs">No audit records found</p>
                    <p class="text-[11px] text-slate-500">Activity logs will appear here as operational events are recorded.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer / Record Count -->
        <div v-if="!loading && logs.length > 0" class="px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-[11px] text-slate-400">
          <span>Showing {{ filteredLogs.length }} of {{ logs.length }} activity records</span>
        </div>
      </div>

    </FeatureGate>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ScrollText, Download, Search, RefreshCw, ArrowLeft } from 'lucide-vue-next';
import FeatureGate from '@/components/common/FeatureGate.vue';
import { authService } from '@/services/authService';

const router = useRouter();

const actionFilter = ref('all');
const searchQuery = ref('');
const loading = ref(false);
const logs = ref([]);

const fetchAuditLogs = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();

    // /activity is restricted to Directus admins only — use /items/logs directly
    const logsUrl = tenantId
      ? `/items/logs?filter[tenant][_eq]=${tenantId}&sort=-date_created&limit=100&fields=*`
      : `/items/logs?sort=-date_created&limit=100&fields=*`;

    const res = await authService.protectedApi.get(logsUrl);
    const rawLogs = res.data?.data || [];

    logs.value = rawLogs.map(log => {
      const actionUpper = String(log.action || log.type || log.punchType || 'EVENT').toUpperCase();
      const firstName = log.signedUser?.first_name || '';
      const lastName = log.signedUser?.last_name || '';
      const userName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : log.guardName || (log.employeeId ? `Guard #${log.employeeId}` : 'Guard');
      return {
        id: log.id,
        timestamp: log.date_created || log.date || log.timestamp,
        user_name: userName,
        user_role: 'Guard',
        action: actionUpper,
        resource: log.siteId || log.branchId
          ? `Site #${log.siteId || log.branchId}`
          : 'System',
        details: `${actionUpper} event recorded`,
        ip_address: '—'
      };
    });
  } catch (err) {
    console.error('[AuditLog] Failed to fetch audit logs:', err);
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAuditLogs();
});

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (actionFilter.value !== 'all') {
      const filterTerm = actionFilter.value.toUpperCase();
      const matchesAction = log.action.toUpperCase().includes(filterTerm);
      const matchesResource = log.resource.toUpperCase().includes(filterTerm);
      if (!matchesAction && !matchesResource) return false;
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return (
        (log.user_name || '').toLowerCase().includes(q) ||
        (log.user_role || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.resource || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.ip_address || '').toLowerCase().includes(q)
      );
    }
    return true;
  });
});

const getActionBadgeClass = (action) => {
  const a = String(action || '').toUpperCase();
  if (a.includes('DELETE') || a.includes('INCIDENT') || a.includes('ESCALATION') || a.includes('ERROR')) {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40';
  }
  if (a.includes('CREATE') || a.includes('ASSIGN') || a.includes('SUCCESS')) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40';
  }
  if (a.includes('LOGIN') || a.includes('AUTH')) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';
  }
  return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40';
};

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const exportAuditCSV = () => {
  const today = new Date().toISOString().split('T')[0];
  const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'Details', 'IP Address'];
  const rows = filteredLogs.value.map(l => [
    l.timestamp,
    `"${(l.user_name || '').replace(/"/g, '""')}"`,
    `"${(l.user_role || '').replace(/"/g, '""')}"`,
    `"${(l.action || '').replace(/"/g, '""')}"`,
    `"${(l.resource || '').replace(/"/g, '""')}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`,
    `"${(l.ip_address || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `security_audit_log_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

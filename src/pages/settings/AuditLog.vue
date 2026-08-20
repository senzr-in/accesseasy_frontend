<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="ops.audit_log" show-locked-badge locked-label="Security System Audit Trail — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <ScrollText class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Security Operations Audit Trail
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Immutable historical logs of all supervisor actions, patrol alterations, incident transitions, and configuration edits
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            @click="exportAuditCSV"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="font-bold text-slate-400 uppercase text-[10px]">Filter Action:</span>
          <select v-model="actionFilter" class="ae-input py-1.5 min-w-[140px]">
            <option value="all">All Actions</option>
            <option value="INCIDENT">Incident Transitions</option>
            <option value="DEVICE">Device & Hardware</option>
            <option value="GEOFENCE">Geofence Calibration</option>
            <option value="SHIFT">Shift Scheduling</option>
            <option value="ESCALATION">Alert Escalation</option>
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
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex-1">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
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
              <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                
                <!-- Timestamp -->
                <td class="px-5 py-3.5 font-mono text-slate-400">
                  {{ formatDateTime(log.timestamp) }}
                </td>

                <!-- Actor -->
                <td class="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-bold text-[10px] flex items-center justify-center">
                      {{ (log.user_name || 'U')[0] }}
                    </div>
                    <span>{{ log.user_name }}</span>
                    <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{{ log.user_role }}</span>
                  </div>
                </td>

                <!-- Action Event -->
                <td class="px-4 py-3.5">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase"
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
                <td class="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                  {{ log.details }}
                </td>

                <!-- IP Address -->
                <td class="px-4 py-3.5 text-right font-mono text-slate-400">
                  {{ log.ip_address }}
                </td>

              </tr>

              <tr v-if="filteredLogs.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  No audit records match the selected filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </FeatureGate>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ScrollText, Download, Search } from 'lucide-vue-next';
import FeatureGate from '@/components/common/FeatureGate.vue';

const actionFilter = ref('all');
const searchQuery = ref('');

const today = new Date().toISOString().split('T')[0];

const logs = ref([
  {
    id: "aud-01",
    timestamp: `${today}T10:14:22`,
    user_name: "Admin User",
    user_role: "Admin",
    action: "UPDATE_GEOFENCE",
    resource: "Site #site-01",
    details: "Adjusted perimeter geofence radius from 400m to 500m",
    ip_address: "10.132.174.88"
  },
  {
    id: "aud-02",
    timestamp: `${today}T09:42:00`,
    user_name: "Supervisor Rajesh",
    user_role: "Supervisor",
    action: "TRANSITION_INCIDENT",
    resource: "Incident #inc-101",
    details: "Advanced incident status from 'acknowledged' to 'investigating'",
    ip_address: "10.132.174.12"
  },
  {
    id: "aud-03",
    timestamp: `${today}T08:35:10`,
    user_name: "Supervisor Rajesh",
    user_role: "Supervisor",
    action: "ESCALATION_ACK",
    resource: "Alert #esc-act-01",
    details: "Acknowledged SOS panic button alert for Guard Kumar S",
    ip_address: "10.132.174.12"
  },
  {
    id: "aud-04",
    timestamp: `${today}T08:00:15`,
    user_name: "Admin User",
    user_role: "Admin",
    action: "ASSIGN_SHIFT",
    resource: "Roster Week #34",
    details: "Assigned Morning Shift (06-14) to Guard Kumar S for Mon-Fri",
    ip_address: "10.132.174.88"
  },
  {
    id: "aud-05",
    timestamp: `${today}T07:22:45`,
    user_name: "Admin User",
    user_role: "Admin",
    action: "UNLINK_DEVICE",
    resource: "Device #dev-03",
    details: "Remote wiped and unlinked hardware device SM-G715FN",
    ip_address: "10.132.174.88"
  }
]);

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (actionFilter.value !== 'all' && !log.action.includes(actionFilter.value)) return false;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return (
        log.user_name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ip_address.toLowerCase().includes(q)
      );
    }
    return true;
  });
});

const getActionBadgeClass = (action) => {
  if (action.includes('INCIDENT') || action.includes('ESCALATION')) {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200';
  }
  if (action.includes('GEOFENCE') || action.includes('DEVICE')) {
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200';
  }
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200';
};

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const exportAuditCSV = () => {
  const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'Details', 'IP Address'];
  const rows = filteredLogs.value.map(l => [
    l.timestamp,
    l.user_name,
    l.user_role,
    l.action,
    l.resource,
    `"${l.details}"`,
    l.ip_address
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

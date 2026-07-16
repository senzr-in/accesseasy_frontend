<template>
  <div class="ae-card overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Live Access Events
        </h3>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative w-52">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search name or door..."
            class="ae-input pl-9 h-8 text-xs"
          >
        </div>
        <button
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          @click="$router.push('/dashboard/visitors')"
        >
          View all →
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="ae-table">
        <thead>
          <tr>
            <th>Visitor</th>
            <th>Access Point</th>
            <th>Source</th>
            <th>Time</th>
            <th class="text-right">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredLogs.length">
            <td
              colspan="5"
              class="py-12 text-center text-sm text-slate-400"
            >
              No access events at this time.
            </td>
          </tr>
          <tr
            v-for="log in filteredLogs.slice(0, 6)"
            :key="log.id"
          >
            <!-- Visitor -->
            <td>
              <div class="flex items-center gap-2.5">
                <div class="p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60 shadow-sm shrink-0">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-700">
                    <img
                      v-if="log.photo"
                      :src="getPhotoUrl(log.photo)"
                      class="w-full h-full object-cover"
                    >
                    <span v-else>{{ (getVisitorName(log)).charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                    {{ getVisitorName(log) }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ log.employeeId ? 'Employee' : 'Visitor' }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Access Point (Door) -->
            <td>
              <span class="text-sm text-slate-700 dark:text-slate-200 font-medium">{{ log.deviceId?.name || '—' }}</span>
            </td>

            <!-- Source -->
            <td>
              <span
                class="badge"
                :class="getScanSourceClass(log)"
              >
                {{ getScanSourceLabel(log) }}
              </span>
            </td>

            <!-- Time -->
            <td>
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ formatTime(log.timeStamp, log.date_created) }}</span>
            </td>

            <!-- Status -->
            <td class="text-right">
              <span
                class="badge"
                :class="log.ValidLogs === true || log.ValidLogs === 1 ? 'badge-success' : 'badge-danger'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="log.ValidLogs === true || log.ValidLogs === 1 ? 'bg-emerald-500' : 'bg-red-500'"
                />
                {{ log.ValidLogs === true || log.ValidLogs === 1 ? 'Authorized' : 'Denied' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import { useDashboardState } from '@/composables/useDashboardState';

const { recentLogs } = useDashboardState();
const searchTerm = ref('');

// Sort by most recent
const sortedLogs = computed(() => {
  if (!recentLogs.value) return [];
  return [...recentLogs.value].sort((a, b) => {
    const ta = a.date_created || a.timeStamp || '';
    const tb = b.date_created || b.timeStamp || '';
    return tb.localeCompare(ta);
  });
});

const filteredLogs = computed(() => {
  if (!searchTerm.value) return sortedLogs.value;
  const q = searchTerm.value.toLowerCase();
  return sortedLogs.value.filter(log => {
    const name = getVisitorName(log).toLowerCase();
    const door = (log.deviceId?.name || '').toLowerCase();
    return name.includes(q) || door.includes(q);
  });
});

const getVisitorName = (log) => {
  if (log.name) return log.name;
  if (log.personName) return log.personName;
  if (log.employeeId?.assignedUser) {
    const u = log.employeeId.assignedUser;
    return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  }
  if (log.employeeId?.firstName) {
    return `${log.employeeId.firstName || ''} ${log.employeeId.lastName || ''}`.trim();
  }
  return 'Unknown';
};

// Source: determine how this access event was triggered
const getScanSourceLabel = (log) => {
  if (log.mode === 'throughApp') return 'Guard App';
  if (log.mode === 'portal') return 'Portal';
  if (log.employeeId) return 'Employee QR';
  return 'Admin';
};

const getScanSourceClass = (log) => {
  if (log.mode === 'throughApp') return 'badge-info';
  if (log.mode === 'portal') return 'badge-primary';
  if (log.employeeId) return 'badge-muted';
  return 'badge-muted';
};

const formatTime = (timeStr, fallback) => {
  if (!timeStr && fallback) {
    return new Date(fallback).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (!timeStr) return '--:--';
  try {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return timeStr.slice(0, 5); }
};

const getPhotoUrl = (photoId) => {
  if (!photoId) return '';
  const token = localStorage.getItem('access_token') || ''; 
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${token}`;
};
</script>

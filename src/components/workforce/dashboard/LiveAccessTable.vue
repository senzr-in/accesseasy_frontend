<template>
  <div class="live-access-card">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-bold text-[#0F172A]">Live Access Stream</h3>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Live
        </span>
      </div>

      <!-- Controls: Filter & Logs Link -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <select
          v-model="filterResult"
          class="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-[#2563EB] cursor-pointer"
        >
          <option value="all">All Events</option>
          <option value="granted">Granted Only</option>
          <option value="denied">Denied Only</option>
        </select>

        <router-link
          to="/dashboard/settings/logs"
          class="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap ml-1 cursor-pointer no-underline"
        >
          Full Logs &rarr;
        </router-link>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-[#0F172A]">
        <thead>
          <tr class="border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            <th class="py-3 px-3">Time</th>
            <th class="py-3 px-3">Employee</th>
            <th class="py-3 px-3">Location</th>
            <th class="py-3 px-3">Method</th>
            <th class="py-3 px-3 text-right">Result</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F1F5F9]">
          <tr
            v-for="ev in events"
            :key="ev.id"
            class="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            @click="openEventDetails(ev)"
          >
            <!-- Time -->
            <td class="py-3.5 px-3 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
              {{ ev.time }}
            </td>

            <!-- Employee -->
            <td class="py-3.5 px-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] shrink-0"
                >
                  {{ getInitials(ev.employee) }}
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-[#0F172A] truncate max-w-[140px]">{{ ev.employee }}</p>
                  <p class="text-[10px] text-[#64748B] leading-none mt-0.5">{{ ev.department }}</p>
                </div>
              </div>
            </td>

            <!-- Location -->
            <td class="py-3.5 px-3 text-[#64748B] whitespace-nowrap font-medium">
              {{ ev.location }}
            </td>

            <!-- Method -->
            <td class="py-3.5 px-3">
              <span class="inline-flex items-center text-[11px] text-[#475569] font-medium bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                {{ ev.method }}
              </span>
            </td>

            <!-- Result -->
            <td class="py-3.5 px-3 text-right">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                :class="ev.result === 'Granted' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'"
              >
                {{ ev.result }}
              </span>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="events.length === 0">
            <td colspan="5" class="py-8 text-center text-xs text-[#94A3B8]">
              No access events found matching your filter criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Quick Stats Footer -->
    <div class="pt-3.5 mt-1 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
      <span>Streaming live events via AccessEasy Gateway</span>
      <span class="font-mono font-medium text-[#2563EB]">{{ events.length }} active buffer</span>
    </div>
  </div>
</template>

<script setup>
import { useLiveAccess } from '@/composables/workforce/useLiveAccess';

const { events, filterResult } = useLiveAccess();

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
};

const emit = defineEmits(['select-event']);

const openEventDetails = (ev) => {
  emit('select-event', ev);
};
</script>

<style scoped>
.live-access-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

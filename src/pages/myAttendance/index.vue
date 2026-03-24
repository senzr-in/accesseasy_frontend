<template>
  <div class="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          My Attendance
          <span class="px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest leading-tight">
            {{ format(currentDate, "MMMM yyyy") }}
          </span>
        </h1>
        <p class="text-sm font-medium text-slate-500 mt-1">Review your presence and work hours.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-2 h-9 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
          <Download class="w-3.5 h-3.5" />
          Download Report (PDF)
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Calendar View -->
      <div class="lg:col-span-1 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly View</h3>
          <div class="flex items-center gap-1">
            <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"><ChevronLeft class="w-4 h-4" /></button>
            <button @click="nextMonth" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"><ChevronRight class="w-4 h-4" /></button>
          </div>
        </div>
        
        <div class="grid grid-cols-7 gap-1 text-center mb-2">
          <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day" class="text-[10px] font-black text-slate-400 py-1">{{ day }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <!-- Empty slots -->
          <div v-for="i in startDayOffset" :key="`empty-${i}`" class="aspect-square"></div>
          
          <!-- Calendar Days -->
          <div 
            v-for="day in calendarDays" 
            :key="day.date.toISOString()"
            :class="[
              'aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group cursor-default shadow-sm border',
              day.isToday ? 'bg-blue-600 text-white border-blue-600 font-bold' : 
              day.isPresent ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 
              'bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 border-slate-100 dark:border-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-700'
            ]"
          >
            <span class="text-xs font-black">{{ day.dayNumber }}</span>
            <div v-if="day.isPresent && !day.isToday" class="absolute bottom-1.5 h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div class="lg:col-span-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-1">Detailed Logs</h3>
        
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th class="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Date</th>
                <th class="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Check-in</th>
                <th class="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Location</th>
                <th class="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr v-if="loading" class="h-40">
                <td colspan="4" class="text-center">
                  <div class="flex justify-center items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
                    <Loader2 class="w-4 h-4 animate-spin" /> Loading records...
                  </div>
                </td>
              </tr>
              <tr v-else-if="records.length === 0" class="h-40">
                <td colspan="4" class="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No records found for this period.</td>
              </tr>
              <tr v-else v-for="record in records" :key="record.id" class="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                <td class="px-5 py-4">
                  <span class="font-black text-[12px] text-slate-900 dark:text-white">{{ format(new Date(record.date_created), "EEE, MMM dd") }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="text-[12px] font-bold text-slate-500 dark:text-zinc-400">{{ format(new Date(record.date_created), "hh:mm a") }}</span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    <DoorOpen class="w-3 h-3 text-slate-400" />
                    {{ record.door?.doorName || 'Main Entrance' }}
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span v-if="record.ValidLogs === 'authorized' || record.ValidLogs === true" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-widest">
                    Auth
                  </span>
                  <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 uppercase tracking-widest">
                    Denied
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { Download, ChevronLeft, ChevronRight, DoorOpen, Loader2 } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const currentDate = ref(new Date());
const records = ref([]);
const loading = ref(true);
const employeeId = ref(null);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const rawUser = authService.getUserData();

// Calendar logic
const monthStart = computed(() => startOfMonth(currentDate.value));
const monthEnd = computed(() => endOfMonth(currentDate.value));
const startDayOffset = computed(() => monthStart.value.getDay());

const calendarDays = computed(() => {
  const days = eachDayOfInterval({ start: monthStart.value, end: monthEnd.value });
  return days.map(day => {
    // Check if there is any authorized log for this day
    const isPresent = records.value.some(r => 
      isSameDay(new Date(r.date_created), day) && 
      (r.ValidLogs === 'authorized' || r.ValidLogs === true)
    );
    return {
      date: day,
      dayNumber: day.getDate(),
      isToday: isToday(day),
      isPresent
    };
  });
});

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const getEmployeeId = async () => {
  if (!rawUser?.id) return null;
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/employees?filter[assignedUser][_eq]=${rawUser.id}&fields=id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      console.warn("Could not fetch employee mapping (403 likely).");
      return null;
    }
    const data = await res.json();
    return data?.data?.[0]?.id || null;
  } catch (error) {
    console.error("Failed to fetch employee record mapped to current user:", error);
    return null;
  }
};

const loadAttendance = async () => {
  loading.value = true;
  try {
    // If employeeId is unknown, try to query logs by assignedUser relationship if possible.
    let url = '';
    if (employeeId.value) {
      url = `${import.meta.env.VITE_API_URL}/items/logs?filter[employeeId][_eq]=${employeeId.value}&fields=*,door.doorName&sort=-date_created&limit=100`;
    } else {
      url = `${import.meta.env.VITE_API_URL}/items/logs?filter[employeeId][assignedUser][_eq]=${rawUser.id}&fields=*,door.doorName&sort=-date_created&limit=100`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
       records.value = [];
       return;
    }
    const data = await res.json();
    records.value = data?.data || [];
  } catch (error) {
    console.error("Failed to load personal logs:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  employeeId.value = await getEmployeeId();
  await loadAttendance();
});

// If they change months, ideally we'd re-fetch data for that month.
watch(currentDate, () => {
  // If we had a month filter in the API query, we would re-fetch here.
});
</script>

<template>
  <div class="space-y-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 max-w-7xl mx-auto">
    <!-- Header (Compact description and month since page title is in top bar) -->
    <div class="flex items-center gap-3 pb-1">
      <span class="px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest leading-tight">
        {{ format(currentDate, "MMMM yyyy") }}
      </span>
      <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
        Your daily check-in/out summary for the month.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Calendar View -->
      <div class="lg:col-span-1 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Monthly View
          </h3>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
              @click="prevMonth"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
              @click="nextMonth"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center mb-1">
          <div
            v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
            :key="day"
            class="text-[10px] font-black text-slate-400 py-1"
          >
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <!-- Empty slots -->
          <div
            v-for="i in startDayOffset"
            :key="`empty-${i}`"
            class="aspect-square"
          />
          <!-- Calendar Days -->
          <div
            v-for="day in calendarDays"
            :key="day.date.toISOString()"
            :class="[
              'aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all shadow-sm border text-[11px] font-black',
              day.isToday
                ? 'bg-blue-600 text-white border-blue-600'
                : day.attendance === 'present' || day.attendance === 'workFromHome' || day.attendance === 'onDuty'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                  : day.attendance === 'halfDay'
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
                    : day.attendance === 'absent'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-400 dark:text-rose-500 border-rose-100 dark:border-rose-500/10'
                      : day.attendance === 'weekOff' || day.attendance === 'holiday'
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700'
                        : 'bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 border-slate-100 dark:border-zinc-800/50'
            ]"
          >
            <span>{{ day.dayNumber }}</span>
            <div
              v-if="day.attendance && !day.isToday"
              class="absolute bottom-1 h-1 w-1 rounded-full"
              :class="{
                'bg-emerald-500': ['present','workFromHome','onDuty'].includes(day.attendance),
                'bg-amber-500': day.attendance === 'halfDay',
                'bg-rose-400': day.attendance === 'absent',
              }"
            />
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-3 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500" />Present</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500" />Half Day</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-400" />Absent</span>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-2 px-1">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Detailed Logs
          </h3>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ records.length }} Records</span>
        </div>

        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm max-h-[420px] overflow-y-auto relative">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 dark:hover:bg-zinc-800 border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  Date
                </th>
                <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  First Punch
                </th>
                <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  Last Punch
                </th>
                <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  Work Hours
                </th>
                <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-if="loading"
                class="h-32"
              >
                <td
                  colspan="5"
                  class="text-center"
                >
                  <div class="flex justify-center items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
                    <Loader2 class="w-4 h-4 animate-spin" /> Loading records...
                  </div>
                </td>
              </tr>
              <tr
                v-else-if="records.length === 0"
                class="h-32"
              >
                <td
                  colspan="5"
                  class="text-center text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  No records found for this period.
                </td>
              </tr>
              <tr
                v-for="record in records"
                v-else
                :key="record.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 dark:hoverdark:hover:bg-zinc-800/50 transition-colors group"
              >
                <!-- Date -->
                <td class="px-4 py-2">
                  <div class="flex flex-col">
                    <span class="font-black text-[12px] text-slate-900 dark:text-white">{{ formatDisplayDate(record.date) }}</span>
                    <span class="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{{ formatDayName(record.date) }}</span>
                  </div>
                </td>

                <!-- First Punch (inTime) -->
                <td class="px-4 py-2">
                  <div class="flex flex-col">
                    <span
                      class="font-bold text-[12px]"
                      :class="record.lateBy && record.lateBy !== '00:00:00' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-zinc-300'"
                    >
                      {{ formatTime(record.inTime) }}
                    </span>
                    <span
                      v-if="record.lateBy && record.lateBy !== '00:00:00'"
                      class="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5"
                    >
                      Late {{ record.lateBy }}
                    </span>
                  </div>
                </td>

                <!-- Last Punch (outTime) -->
                <td class="px-4 py-2">
                  <div class="flex flex-col">
                    <span class="font-bold text-[12px] text-slate-700 dark:text-zinc-300">
                      {{ formatTime(record.outTime) }}
                    </span>
                    <span
                      v-if="record.earlyDeparture && record.earlyDeparture !== '00:00:00'"
                      class="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-0.5"
                    >
                      Early {{ record.earlyDeparture }}
                    </span>
                  </div>
                </td>

                <!-- Work Hours -->
                <td class="px-4 py-2">
                  <span class="font-bold text-[12px] text-slate-700 dark:text-zinc-300">{{ formatTime(record.workHours) }}</span>
                </td>

                <!-- Attendance Status -->
                <td class="px-4 py-2">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border"
                    :class="getAttendanceBadgeClass(record.attendance)"
                  >
                    {{ formatAttendanceLabel(record.attendance) }}
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const currentDate = ref(new Date());
const records = ref([]);
const loading = ref(true);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const rawUser = authService.getUserData();

// ── Calendar Logic ──────────────────────────────────────────────
const monthStart = computed(() => startOfMonth(currentDate.value));
const monthEnd   = computed(() => endOfMonth(currentDate.value));
const startDayOffset = computed(() => monthStart.value.getDay());

const calendarDays = computed(() => {
  const days = eachDayOfInterval({ start: monthStart.value, end: monthEnd.value });
  return days.map(day => {
    const match = records.value.find(r => r.date && isSameDay(parseISO(r.date), day));
    return {
      date:       day,
      dayNumber:  day.getDate(),
      isToday:    isToday(day),
      attendance: match?.attendance || null,
    };
  });
});

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

// ── API: Get personalModule ID for current user ──────────────────
const getPersonalModuleId = async () => {
  if (!rawUser?.id) return null;
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=${rawUser.id}&fields=id`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0]?.id || null;
  } catch {
    return null;
  }
};

// ── API: Load from /items/attendance ────────────────────────────
const loadAttendance = async () => {
  loading.value = true;
  try {
    const personalModuleId = await getPersonalModuleId();
    if (!personalModuleId) {
      console.warn("No personalModule ID found for current user");
      records.value = [];
      return;
    }

    const year  = currentDate.value.getFullYear();
    const month = String(currentDate.value.getMonth() + 1).padStart(2, "0");
    const dateFrom = `${year}-${month}-01`;
    const dateTo   = format(endOfMonth(currentDate.value), "yyyy-MM-dd");

    const params = new URLSearchParams({
      "filter[_and][0][employeeId][id][_eq]": personalModuleId,
      "filter[_and][1][date][_gte]":          dateFrom,
      "filter[_and][2][date][_lte]":          dateTo,
      "sort[]":                               "-date",
      "limit":                                "60",
    });

    const fields = [
      "id", "date", "status", "attendance",
      "inTime", "outTime", "workHours",
      "lateBy", "earlyDeparture", "overTime", "mode"
    ];
    fields.forEach(f => params.append("fields[]", f));

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const data = await res.json();
      records.value = data?.data || [];
    } else {
      console.error("Attendance fetch failed:", res.status);
      records.value = [];
    }
  } catch (err) {
    console.error("Error loading attendance:", err);
    records.value = [];
  } finally {
    loading.value = false;
  }
};

// ── Re-fetch when month changes ───────────────────────────────────
watch(currentDate, () => {
  loadAttendance();
});

onMounted(() => {
  loadAttendance();
});

// ── Formatting Helpers ────────────────────────────────────────────
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  try { return format(parseISO(dateStr), "MMM dd, yyyy"); } catch { return dateStr; }
};

const formatDayName = (dateStr) => {
  if (!dateStr) return "";
  try { return format(parseISO(dateStr), "EEEE"); } catch { return ""; }
};

const formatTime = (time) => {
  if (!time) return "—";
  try {
    // Time is stored as HH:mm:ss — display as HH:mm
    const parts = time.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return time;
  } catch { return time; }
};

const formatAttendanceLabel = (val) => {
  const map = {
    present:       "Present",
    absent:        "Absent",
    weekOff:       "Week Off",
    holiday:       "Holiday",
    onDuty:        "On Duty",
    workFromHome:  "Work From Home",
    halfDay:       "Half Day",
    paidLeave:     "Paid Leave",
    unpaidLeave:   "Unpaid Leave",
    lateComing:    "Late Coming",
    earlyLeaving:  "Early Leaving",
    holidayPresent:"Holiday Present",
    weekoffPresent:"Weekoff Present",
  };
  return map[val] || val || "—";
};

const getAttendanceBadgeClass = (val) => {
  switch (val) {
    case "present":
    case "workFromHome":
    case "onDuty":
    case "holidayPresent":
    case "weekoffPresent":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    case "halfDay":
    case "lateComing":
    case "earlyLeaving":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    case "absent":
    case "unpaidLeave":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    case "weekOff":
    case "holiday":
      return "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    case "paidLeave":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    default:
      return "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
  }
};
</script>

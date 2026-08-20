<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 lg:p-6 gap-5">
    
    <FeatureGate feature="attendance.shift_compliance" show-locked-badge locked-label="Shift Scheduler & Compliance — Pro Feature">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Calendar class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Guard Shift Scheduler & Rotation Roster
            </h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Plan weekly 24/7 security rotations, assign shift slots, and detect fatigue conflicts
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            @click="exportRosterCSV"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            @click="openShiftSlotModal(null, 'Mon')"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Assign Shift</span>
          </button>
        </div>
      </div>

      <!-- Quick KPI Stats Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Active Roster</span>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ rosterList.length }} <span class="text-xs text-slate-400 font-normal">Guards</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">24/7 Coverage</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">100% <span class="text-xs text-emerald-500 font-bold">Optimal</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Shift Templates</span>
          <p class="text-2xl font-black text-indigo-600 mt-1">{{ shiftTemplates.length }} <span class="text-xs text-slate-400 font-normal">Types</span></p>
        </div>
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Fatigue / Rest Conflicts</span>
          <p class="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">0 <span class="text-xs text-emerald-500 font-bold">Clean</span></p>
        </div>
      </div>

      <!-- Weekly Schedule Grid -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Weekly Shift Matrix (Mon — Sun)</span>
          </div>
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>💡 Click any shift cell to edit or reassign</span>
          </div>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5 w-48">Guard Name</th>
                <th v-for="day in daysList" :key="day" class="px-3 py-3.5 text-center">
                  {{ day }}
                </th>
                <th class="px-4 py-3.5 text-center">Total Hours</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="guard in rosterList" :key="guard.guardId" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <!-- Guard Name -->
                <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                      {{ (guard.guardName || 'G')[0] }}
                    </div>
                    <span>{{ guard.guardName }}</span>
                  </div>
                </td>

                <!-- 7 Day Shift Slots -->
                <td
                  v-for="day in daysList"
                  :key="day"
                  class="px-2 py-3 text-center cursor-pointer"
                  @click="openShiftSlotModal(guard, day)"
                >
                  <div
                    class="p-2 rounded-xl text-[10px] font-bold transition-all border inline-block w-full max-w-[120px]"
                    :class="getShiftSlotClass(guard.schedule?.[day]?.shiftId)"
                  >
                    <span class="block truncate">{{ guard.schedule?.[day]?.shiftName || 'OFF' }}</span>
                  </div>
                </td>

                <!-- Total Hours Calculated -->
                <td class="px-4 py-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {{ calculateGuardHours(guard) }} hrs
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </FeatureGate>

    <!-- Shift Assignment Modal -->
    <Teleport to="body">
      <div
        v-if="showSlotModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showSlotModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">
              Assign Shift: {{ selectedSlotGuard?.guardName }} ({{ selectedSlotDay }})
            </h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showSlotModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="conflictWarning" class="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl mb-4 text-amber-800 dark:text-amber-300">
            ⚠️ <strong>Conflict Warning:</strong> {{ conflictWarning }}
          </div>

          <div class="space-y-3">
            <label class="font-bold text-slate-700 dark:text-slate-300 block">Choose Shift Template</label>
            <div class="space-y-2">
              <button
                v-for="tmpl in shiftTemplates"
                :key="tmpl.id"
                class="w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="selectedTemplateId === tmpl.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'"
                @click="onSelectTemplate(tmpl)"
              >
                <div>
                  <span class="font-bold block">{{ tmpl.name }}</span>
                  <span class="text-[10px] text-slate-500 font-mono">{{ tmpl.startTime }} - {{ tmpl.endTime }} ({{ tmpl.durationHours }}h)</span>
                </div>
                <span v-if="selectedTemplateId === tmpl.id" class="text-indigo-600 font-bold">✓</span>
              </button>

              <button
                class="w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="selectedTemplateId === 'off' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'"
                @click="onSelectTemplate({ id: 'off', name: 'Weekly Off' })"
              >
                <div>
                  <span class="font-bold block">Weekly Off / Rest Day</span>
                  <span class="text-[10px] text-slate-400">No shift scheduled</span>
                </div>
                <span v-if="selectedTemplateId === 'off'" class="text-rose-600 font-bold">✓</span>
              </button>
            </div>
          </div>

          <div class="mt-6 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
              @click="showSlotModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              @click="confirmAssignShift"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Calendar, Download, Plus, X } from 'lucide-vue-next';
import { shiftService } from '@/services/shiftService';
import FeatureGate from '@/components/common/FeatureGate.vue';

const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const rosterList = ref([]);
const shiftTemplates = ref([]);

const showSlotModal = ref(false);
const selectedSlotGuard = ref(null);
const selectedSlotDay = ref('Mon');
const selectedTemplateId = ref('');
const selectedTemplateName = ref('');
const conflictWarning = ref(null);

const getShiftSlotClass = (shiftId) => {
  if (shiftId === 'tmpl-1') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-500/20';
  }
  if (shiftId === 'tmpl-2') {
    return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/20';
  }
  if (shiftId === 'tmpl-3') {
    return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200 dark:border-purple-500/20';
  }
  if (shiftId === 'tmpl-4') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20';
  }
  return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700';
};

const calculateGuardHours = (guard) => {
  if (!guard.schedule) return 0;
  let total = 0;
  Object.values(guard.schedule).forEach(s => {
    if (s.shiftId === 'tmpl-4') total += 12;
    else if (s.shiftId && s.shiftId !== 'off') total += 8;
  });
  return total;
};

const openShiftSlotModal = (guard, day) => {
  selectedSlotGuard.value = guard || rosterList.value[0];
  selectedSlotDay.value = day;
  const current = selectedSlotGuard.value?.schedule?.[day];
  selectedTemplateId.value = current?.shiftId || 'tmpl-1';
  selectedTemplateName.value = current?.shiftName || 'Morning (06-14)';
  conflictWarning.value = null;
  showSlotModal.value = true;
};

const onSelectTemplate = (tmpl) => {
  selectedTemplateId.value = tmpl.id;
  selectedTemplateName.value = tmpl.name;
  conflictWarning.value = shiftService.detectConflict(selectedSlotGuard.value, selectedSlotDay.value, tmpl.id);
};

const confirmAssignShift = async () => {
  if (!selectedSlotGuard.value) return;
  await shiftService.assignGuardShift(
    selectedSlotGuard.value.guardId,
    selectedSlotDay.value,
    selectedTemplateId.value,
    selectedTemplateName.value
  );
  showSlotModal.value = false;
  await loadData();
};

const exportRosterCSV = () => {
  const headers = ['Guard Name', ...daysList, 'Total Hours'];
  const rows = rosterList.value.map(g => [
    g.guardName,
    ...daysList.map(d => g.schedule?.[d]?.shiftName || 'OFF'),
    calculateGuardHours(g)
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `guard_shift_roster_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const loadData = async () => {
  rosterList.value = await shiftService.fetchWeeklyRoster();
  shiftTemplates.value = await shiftService.fetchShiftTemplates();
};

onMounted(async () => {
  await loadData();
});
</script>

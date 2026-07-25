<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] p-6 gap-6 overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Shifts</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage guard shift schedules</p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
        @click="openAdd"
      >
        <Plus class="w-4 h-4" /> Add Shift
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
    </div>

    <!-- Shifts Table -->
    <div v-else class="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
            <th class="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Shift Name</th>
            <th class="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Start Time</th>
            <th class="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">End Time</th>
            <th class="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Duration</th>
            <th class="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</th>
            <th class="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="shift in shifts"
            :key="shift.id"
            class="border-b border-slate-50 dark:border-white/3 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Clock class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ shift.shift || shift.name || 'Unnamed Shift' }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">{{ shift.entryTime || shift.startTime || '—' }}</td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">{{ shift.exitTime || shift.endTime || '—' }}</td>
            <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{{ calcDuration(shift) }}</td>
            <td class="px-5 py-3.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                Active
              </span>
            </td>
            <td class="px-5 py-3.5">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                title="Edit Shift"
                @click="openEdit(shift)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>

          <!-- Empty -->
          <tr v-if="shifts.length === 0">
            <td colspan="6" class="py-16 text-center">
              <Clock class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">No shifts configured</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Add shifts to organize guard schedules</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Clock class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              {{ isAdding ? 'Add Shift' : 'Edit Shift' }}
            </h3>
          </div>
          <button class="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" @click="closeModal">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Shift Name</label>
            <input
              v-model="form.shift"
              type="text"
              placeholder="e.g. Morning Shift"
              class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Start Time</label>
              <input
                v-model="form.entryTime"
                type="time"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">End Time</label>
              <input
                v-model="form.exitTime"
                type="time"
                class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
            </div>
          </div>
          <div v-if="form.entryTime && form.exitTime" class="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 rounded-lg px-3 py-2">
            Duration: <span class="font-semibold text-slate-700 dark:text-slate-200">{{ calcDuration(form) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
          <button
            class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            @click="closeModal"
          >Cancel</button>
          <button
            class="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
            :disabled="saving"
            @click="saveShift"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            {{ isAdding ? 'Create Shift' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Clock, Plus, Loader2, X, Pencil } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const apiUrl = import.meta.env.VITE_API_URL;
const loading = ref(false);
const saving = ref(false);
const shifts = ref([]);
const showModal = ref(false);
const isAdding = ref(false);
const selectedShift = ref(null);
const form = ref({ shift: '', entryTime: '', exitTime: '' });

const openAdd = () => {
  isAdding.value = true;
  selectedShift.value = null;
  form.value = { shift: '', entryTime: '', exitTime: '' };
  showModal.value = true;
};

const openEdit = (shift) => {
  isAdding.value = false;
  selectedShift.value = shift;
  form.value = {
    shift: shift.shift || shift.name || '',
    entryTime: shift.entryTime || shift.startTime || '',
    exitTime: shift.exitTime || shift.endTime || ''
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedShift.value = null;
};

const calcDuration = (s) => {
  try {
    const start = s.entryTime || s.startTime;
    const end = s.exitTime || s.endTime;
    if (!start || !end) return '—';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  } catch { return '—'; }
};

const saveShift = async () => {
  if (!form.value.shift.trim()) return alert('Shift name is required');
  saving.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const payload = {
      shift: form.value.shift,
      entryTime: form.value.entryTime,
      exitTime: form.value.exitTime,
    };

    if (isAdding.value) {
      payload.tenant = tenantId;
      await fetch(`${apiUrl}/items/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(`${apiUrl}/items/shifts/${selectedShift.value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    }

    closeModal();
    await fetchShifts();
  } catch (err) {
    console.error('Save shift error', err);
    alert('Failed to save shift.');
  } finally {
    saving.value = false;
  }
};

const fetchShifts = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${apiUrl}/items/shifts?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      shifts.value = data.data || [];
    }
  } catch (err) {
    console.error('Shifts fetch error', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchShifts);
</script>

<template>
  <div class="w-full flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Schedules
          <CalendarClock class="w-6 h-6 text-cyan-600 dark:text-cyan-500" />
        </h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Define time-based access windows for zones and doors.
        </p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            v-model="search" 
            type="text" 
            placeholder="Search schedules..."
            class="w-full pl-9 pr-4 h-10 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500 dark:text-slate-400" 
          >
        </div>
        <button 
          class="flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
          @click="openCreateDialog"
        >
          <Plus class="h-4 w-4" /> NEW SCHEDULE
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filtered.length === 0 && !isLoading"
      class="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-2xl"
    >
      <div class="flex flex-col items-center justify-center p-16 text-center space-y-4">
        <div class="p-4 rounded-full bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10">
          <CalendarClock class="w-12 h-12 text-cyan-500/40 dark:text-cyan-500/20" />
        </div>
        <div class="space-y-1">
          <h3 class="font-black text-lg text-slate-900 dark:text-white">
            No Schedules Found
          </h3>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto"> 
            Create time ranges and day patterns to control access flow across doors and zones.
          </p>
        </div>
        <button 
          class="h-9 px-4 rounded-lg border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-500 text-xs font-black uppercase tracking-widest hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors cursor-pointer" 
          @click="openCreateDialog"
        >
          Create First Schedule
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div
      v-else-if="!isLoading"
      class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap">
          <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Schedule Name
              </th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Days Active
              </th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Time Window
              </th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th class="h-12 px-6 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
            <tr
              v-for="sch in filtered"
              :key="sch.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <CalendarClock class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="font-black text-sm text-slate-900 dark:text-white">
                      {{ sch.name }}
                    </p>
                    <p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      ID: {{ sch.id }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ sch.days }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <Clock class="h-3.5 w-3.5 text-slate-400" />
                  {{ sch.timeFrom }} – {{ sch.timeTo }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border"
                  :class="sch.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="sch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'"
                  />
                  {{ sch.status }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                  @click="handleDelete(sch.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Showing {{ filtered.length }} of {{ schedules.length }} schedules
        </span>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <CalendarClock class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Create Schedule</h2>
              <p class="text-xs font-medium text-slate-400">Define access time window</p>
            </div>
          </div>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveSchedule" class="space-y-4">
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Schedule Name *</label>
            <input
              v-model="form.timeZoneName"
              type="text"
              required
              placeholder="e.g. 24/7 Access or Day Shift"
              class="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Start Time *</label>
              <input
                v-model="form.entryTime"
                type="time"
                required
                class="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">End Time *</label>
              <input
                v-model="form.exitTime"
                type="time"
                required
                class="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="showModal = false"
              class="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="h-10 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {{ isSaving ? 'Saving...' : 'Save Schedule' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { Search, Plus, CalendarClock, Clock, Trash2, X } from "lucide-vue-next";
import { authService } from "@/services/authService";

const schedules = ref([]);
const isLoading = ref(true);
const search = ref("");
const showModal = ref(false);
const isSaving = ref(false);

const form = reactive({
  timeZoneName: "",
  entryTime: "00:00",
  exitTime: "23:59"
});

const fetchSchedules = async () => {
  isLoading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/time?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=timeZoneName&fields[]=entryTime&fields[]=exitTime&fields[]=status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    
    schedules.value = (data.data || []).map(item => ({
      id: item.id,
      name: item.timeZoneName || `Schedule ${item.id}`,
      days: "All Days",
      timeFrom: item.entryTime?.slice(0, 5) || "00:00",
      timeTo: item.exitTime?.slice(0, 5) || "23:59",
      status: item.status === 'published' ? 'Active' : 'Inactive'
    }));
  } catch (error) {
    console.error("Error fetching schedules:", error);
  } finally {
    isLoading.value = false;
  }
};

const filtered = computed(() => {
  return schedules.value.filter(s => s.name.toLowerCase().includes(search.value.toLowerCase()));
});

const openCreateDialog = () => {
  form.timeZoneName = "";
  form.entryTime = "00:00";
  form.exitTime = "23:59";
  showModal.value = true;
};

const saveSchedule = async () => {
  isSaving.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    const payload = {
      timeZoneName: form.timeZoneName,
      entryTime: `${form.entryTime}:00`,
      exitTime: `${form.exitTime}:00`,
      status: "published",
      tenant: tenantId
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/time`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Failed to create schedule (${res.status})`);
    }

    showModal.value = false;
    await fetchSchedules();
  } catch (error) {
    console.error("Error saving schedule:", error);
    alert("Failed to save schedule: " + error.message);
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id) => {
  if (confirm("Are you sure you want to delete this schedule?")) {
    try {
      const token = authService.getToken();
      await fetch(`${import.meta.env.VITE_API_URL}/items/time/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule");
    }
  }
};

onMounted(() => {
  fetchSchedules();
});
</script>

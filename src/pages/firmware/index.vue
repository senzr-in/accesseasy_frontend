<template>
  <div class="p-8 space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header with Global Actions -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Firmware Management
        </h1>
        <p class="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black opacity-80">
          System Update Distribution
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button class="h-10 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs tracking-widest uppercase bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 gap-2 shadow-xl shadow-slate-900/10 dark:shadow-white/5 active:scale-95 transition-all flex items-center justify-center">
          <Upload class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          New Release
        </button>
      </div>
    </div>

    <!-- Global Selection & Status Bar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <div class="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Technical Profile</label>
              <div class="relative">
                <select 
                  v-model="selectedProfileId"
                  class="w-full h-12 pl-4 pr-10 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 appearance-none transition-all shadow-sm"
                >
                  <option
                    value=""
                    disabled
                  >
                    Choose hardware profile...
                  </option>
                  <optgroup
                    v-for="pt in productTypes"
                    :key="pt.id"
                    :label="pt.name"
                    class="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900"
                  >
                    <option
                      v-for="hp in pt.hardwareProfiles"
                      :key="hp.id"
                      :value="hp.id"
                      class="font-medium text-slate-700 dark:text-slate-300"
                    >
                      {{ hp.profileCode }} ({{ hp.boardRevision }})
                    </option>
                  </optgroup>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed italic pr-4">
              Select a specific hardware to view current production status and individual binary history.
            </p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 h-full flex flex-col justify-center shadow-sm">
          <div
            v-if="!selectedProfileId"
            class="text-center space-y-4 py-8"
          >
            <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mx-auto flex items-center justify-center border border-slate-100 dark:border-slate-700/50">
              <Package class="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              No Profile Selected
            </p>
          </div>
          <div
            v-else
            class="flex flex-col sm:flex-row items-center justify-between gap-6 py-4"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white mb-1">
                  Production Ready
                </h3>
                <p class="text-xs font-medium text-slate-500">
                  Hardware Profile: <span class="font-bold text-slate-700 dark:text-slate-300">{{ selectedProfileId }}</span>
                </p>
              </div>
            </div>
            <div class="text-right border-l-2 border-slate-100 dark:border-slate-800 pl-6 space-y-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Latest Build
              </p>
              <p class="text-xl font-black font-mono text-slate-900 dark:text-white tracking-tighter">
                {{ latest?.version || 'v1.4.2' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Release History Table -->
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Activity class="w-5 h-5 text-slate-800 dark:text-slate-200" />
            Global Release History
          </h2>
          <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest">
            Complete distribution log
          </p>
        </div>

        <div class="relative w-full sm:w-80">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Filter by version or hardware..."
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm"
          >
        </div>
      </div>

      <div class="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Version
                </th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Hardware Code
                </th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Payload Size
                </th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Release Date
                </th>
                <th class="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
              <tr v-if="loading && filteredFirmware.length === 0">
                <td
                  colspan="5"
                  class="px-8 py-24 text-center"
                >
                  <div class="flex flex-col items-center gap-4">
                    <Activity class="h-10 w-10 animate-pulse text-slate-300 dark:text-slate-700" />
                    <p class="text-sm font-black text-slate-500 uppercase tracking-widest">
                      Scanning Registry...
                    </p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredFirmware.length === 0">
                <td
                  colspan="5"
                  class="px-8 py-24 text-center"
                >
                  <div class="flex flex-col items-center gap-4">
                    <Package class="h-10 w-10 text-slate-200 dark:text-slate-800" />
                    <p class="text-sm font-black text-slate-400 uppercase tracking-widest">
                      No matching releases
                    </p>
                  </div>
                </td>
              </tr>
              <tr 
                v-for="(fw, idx) in filteredFirmware" 
                v-else 
                :key="idx" 
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-l-4 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-700"
              >
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                      v{{ fw.version.split('.')[0] }}
                    </div>
                    <div class="flex flex-col">
                      <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        {{ fw.version }}
                      </p>
                      <span
                        v-if="idx === 0 && !search"
                        class="inline-flex rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2 py-0.5 mt-1 w-fit text-[9px] font-black uppercase tracking-tighter"
                      >
                        Baseline
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <span class="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors group-hover:bg-white dark:group-hover:bg-slate-900">
                    {{ fw.hardwareProfileCode }}
                  </span>
                </td>
                <td class="px-8 py-5 text-[12px] text-slate-500 font-mono font-bold tracking-tighter">
                  {{ formatSize(fw.size) }}
                </td>
                <td class="px-8 py-5">
                  <div class="flex flex-col text-[12px]">
                    <span class="font-black text-slate-900 dark:text-white tracking-tight">{{ new Date(fw.lastModified).toLocaleDateString() }}</span>
                    <span class="text-slate-400 text-[10px] font-black uppercase opacity-80">{{ new Date(fw.lastModified).toLocaleTimeString() }}</span>
                  </div>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="h-10 w-10 inline-flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-all active:scale-90">
                      <Download class="h-5 w-5" />
                    </button>
                    <button
                      class="h-10 w-10 inline-flex items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all active:scale-90"
                      @click="handleDelete(fw)"
                    >
                      <Trash2 class="h-5 w-5" />
                    </button>
                  </div>
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
import { ref, computed, onMounted } from "vue";
import { Upload, Activity, Package, Download, Trash2, ChevronDown, CheckCircle2 } from "lucide-vue-next";

// Mock data to replicate Next.js initial state
const firmwareList = ref([
    { version: "1.4.2", hardwareProfileCode: "NVR-8CH-PRO", size: 14502100, lastModified: new Date().toISOString() },
    { version: "1.4.1", hardwareProfileCode: "CAM-BULLET-4K", size: 8402100, lastModified: new Date(Date.now() - 86400000 * 5).toISOString() },
    { version: "2.0.0-beta", hardwareProfileCode: "CTRL-DOOR-1", size: 21050200, lastModified: new Date(Date.now() - 86400000 * 12).toISOString() },
    { version: "1.3.9", hardwareProfileCode: "NVR-8CH-PRO", size: 14202100, lastModified: new Date(Date.now() - 86400000 * 30).toISOString() },
]);

const productTypes = ref([
    {
        id: "pt-1", name: "Recorders (NVR)", hardwareProfiles: [
            { id: "NVR-8CH-PRO", profileCode: "NVR-8CH-PRO", boardRevision: "v2.1" }
        ]
    },
    {
        id: "pt-2", name: "Cameras", hardwareProfiles: [
            { id: "CAM-BULLET-4K", profileCode: "CAM-BULLET-4K", boardRevision: "v1.0" }
        ]
    },
    {
        id: "pt-3", name: "Access Controllers", hardwareProfiles: [
            { id: "CTRL-DOOR-1", profileCode: "CTRL-DOOR-1", boardRevision: "v3.0" }
        ]
    }
]);

const selectedProfileId = ref("");
const latest = ref(null);
const loading = ref(false);
const search = ref("");

const filteredFirmware = computed(() => {
    return firmwareList.value.filter(fw =>
        fw.version.toLowerCase().includes(search.value.toLowerCase()) ||
        fw.hardwareProfileCode.toLowerCase().includes(search.value.toLowerCase())
    );
});

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleDelete = (fw) => {
    if(confirm(`Are you sure you want to delete profile ${fw.hardwareProfileCode} version ${fw.version}?`)) {
        firmwareList.value = firmwareList.value.filter(item => item !== fw);
    }
}
</script>

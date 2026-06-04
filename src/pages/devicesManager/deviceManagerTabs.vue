<template>
  <div class="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-4">
        <!-- Title moved to global App Bar -->
      </div>
      <div class="flex gap-3">
        <button
          class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-[10px] font-black text-white hover:bg-blue-700 transition-colors shadow-sm uppercase tracking-widest"
        >
          <Zap class="h-3.5 w-3.5 fill-current" />
          Mobile Pass Setup
        </button>
        <button
          class="flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm border border-slate-200 dark:border-zinc-800 font-black uppercase tracking-widest text-[10px] bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <Network class="h-3.5 w-3.5" />
          Scan Network
        </button>
        <button
          @click="showAddDeviceForm"
          class="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-[10px] font-black text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm uppercase tracking-widest"
        >
          <Plus class="h-3.5 w-3.5" />
          Add Manually
        </button>
      </div>
    </div>

    <!-- Search/Filter Area -->
    <div class="flex flex-col sm:flex-row items-center gap-4">
      <div class="relative w-full sm:flex-1">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search devices by name or serial..."
          v-model="search"
          @input="debouncedSearch"
          class="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-10 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>
      
      <!-- Tab filter -->
       <div class="flex bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-xl shadow-sm shrink-0">
        <button 
          v-for="tab in ['all', 'approved', 'unApproved']" 
          :key="tab"
          @click="activeStatusTab = tab"
          :class="[
            'px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
            activeStatusTab === tab 
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          {{ tab }}
        </button>
       </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col h-[700px]">
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 w-full">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Identity Matrix</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Protocol Type</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Link Status</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Core Engine</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Authorization</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Operations</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <tr v-if="loading">
              <td colspan="6" class="px-5 py-24 text-center text-slate-500">
                <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="px-5 py-24 text-center">
                <div class="flex flex-col items-center gap-4 max-w-xs mx-auto">
                    <div class="h-16 w-16 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                        <Zap class="h-8 w-8 text-slate-400" />
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Empty Infrastructure</p>
                        <p class="text-xs font-semibold text-slate-500">No hardware nodes detected in the current matrix.</p>
                    </div>
                </div>
              </td>
            </tr>
            <tr 
              v-else
              v-for="device in items" 
              :key="device.id" 
              class="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors duration-300"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <!-- Avatar fallback -->
                  <div class="h-8 w-8 shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    <img v-if="device.controllerImage?.url" :src="device.controllerImage.url" class="h-full w-full object-cover" />
                    <Cpu v-else class="h-4 w-4 text-zinc-400" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-semibold text-foreground group-hover/row:text-primary transition-colors">
                      {{ device.controllerName || 'Unnamed Node' }}
                    </span>
                    <span class="text-[11px] text-muted-foreground">
                      {{ device.sn || 'NO-SERIAL' }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-[13px] text-muted-foreground">
                  Type {{ device.controllerType || '?' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="relative flex h-2 w-2">
                    <span v-if="device.controllerStatus === 'successful'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span :class="[
                      'relative inline-flex rounded-full h-2 w-2',
                      device.controllerStatus === 'successful' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                      device.controllerStatus === 'failed' ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    ]"></span>
                  </div>
                  <span :class="[
                    'text-[12px] font-medium whitespace-nowrap',
                    device.controllerStatus === 'successful' ? 'text-emerald-700 dark:text-emerald-400' : 
                    device.controllerStatus === 'failed' ? 'text-rose-600' : 'text-zinc-500'
                  ]">
                    {{ device.controllerStatus || 'DORMANT' }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3 text-xs text-slate-500 font-semibold mt-0.5">
                  {{ device.serverIp || 'OFFLINE' }}
              </td>
              <td class="px-5 py-3 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border',
                  device.status === 'approved' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                ]">
                  <CheckCircle2 v-if="device.status === 'approved'" class="w-3 h-3" />
                  <Clock v-else class="w-3 h-3" />
                  {{ device.status }}
                </span>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity pr-2">
                  <button 
                    v-if="device.status !== 'approved'"
                    title="Approve Node"
                    class="flex items-center justify-center p-0 h-7 w-7 rounded-md bg-transparent text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm border border-emerald-200 dark:border-emerald-500/20 dark:hover:bg-emerald-500/10"
                  >
                    <ShieldCheck class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="editItem(device)"
                    title="Configuration Setup"
                    class="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-colors"
                  >
                    <Settings2 class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    title="Decommission Node"
                    class="flex items-center justify-center p-0 h-7 w-7 rounded-md bg-transparent text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200 dark:border-rose-900/50 dark:hover:bg-rose-900/20 shadow-sm"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 mt-auto shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          @click="page--"
          :disabled="page <= 1 || loading"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }} (Total: {{ totalItems }})
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          @click="page++"
          :disabled="page >= totalPages || loading"
        >
          Next
        </button>
      </div>
    <!-- Registration Dialog -->
    <DeviceRegistrationDialog v-model="showDialog" :device="selectedDevice" @success="fetchDeviceData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Zap, Network, Plus, Search, Loader2, Cpu, CheckCircle2, Clock, ShieldCheck, Settings2, DoorOpen, Trash2 } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DeviceRegistrationDialog from "./deviceRegistrationDialog.vue";

// Accessors
const token = authService.getToken();

// State
const items = ref([]);
const loading = ref(false);
const search = ref("");
const page = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const activeStatusTab = ref("all");
const showDialog = ref(false);
const selectedDevice = ref(null);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchDeviceData();
  }, 400);
};

watch([page, activeStatusTab], () => {
  if(page.value === 1 || activeStatusTab.value) {
    // Only fetch if tab changed (which resets page anyway usually, or page changed)
    fetchDeviceData();
  }
});

watch(activeStatusTab, () => {
  page.value = 1; // Reset to page 1 on tab change
});

const getImageUrl = async (imageId) => {
  if (!token) return null;
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/assets/${imageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

const fetchDeviceData = async () => {
  if (!token) return;
  // Always resolve tenantId async — sync getter returns null before initialization
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId) return;

  loading.value = true;

  try {
    const filterObj = { "filter[tenant][tenantId][_eq]": tenantId };

    if (activeStatusTab.value === "approved") {
      filterObj["filter[status][_eq]"] = "approved";
    } else if (activeStatusTab.value === "unApproved") {
      filterObj["filter[status][_eq]"] = "unApproved";
    }
    if (search.value) {
      filterObj["filter[_or][0][controllerName][_icontains]"] = search.value;
      filterObj["filter[_or][1][sn][_icontains]"] = search.value;
    }

    const queryParams = new URLSearchParams({
      limit: itemsPerPage.toString(),
      page: page.value.toString(),
      sort: "-date_created",
      meta: "filter_count",
      ...filterObj
    });

    // Matching reference codebase fields exactly
    const fields = [
      "controllerName", "id", "selectedDoors", "deviceName", "sn",
      "tenant", "tenant.tenantId", "status", "controllerStatus", "branchDetails",
      "serverIp", "controllerType", "controllerImage.id"
    ].map(f => `fields[]=${encodeURIComponent(f)}`).join('&');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/controllers?${queryParams.toString()}&${fields}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      items.value = await Promise.all(
        (data.data || []).map(async (item) => {
          if (item.controllerImage?.id) {
            item.controllerImage.url = await getImageUrl(item.controllerImage.id);
          }
          return item;
        })
      );
      totalItems.value = data.meta?.filter_count ?? 0;
    } else {
      console.error("Fetch devices failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Fetch devices error:", error);
  } finally {
    loading.value = false;
  }
};

const showAddDeviceForm = () => {
  selectedDevice.value = null;
  showDialog.value = true;
};

const editItem = (item) => {
  selectedDevice.value = item;
  showDialog.value = true;
};

onMounted(() => {
  fetchDeviceData();
});
</script>

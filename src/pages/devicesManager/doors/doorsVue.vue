<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <!-- Toolbar: Search + Add Door on the same line -->
    <div class="flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search doors by name or number..."
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          @input="debouncedSearch"
        >
      </div>

      <!-- Add Door -->
      <button
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shrink-0"
        @click="showAddDoorForm"
      >
        <Plus class="w-4 h-4" /> Add Door
      </button>
    </div>

    <!-- Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Door Name
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
                #
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Location
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">

                Status
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <!-- Loading -->
            <tr v-if="loading">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="items.length === 0">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <DoorOpen class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    No doors found.
                  </p>
                  <button
                    v-if="searchQuery"
                    class="text-xs font-bold text-blue-500 hover:underline"
                    @click="searchQuery = ''; fetchDoorData()"
                  >
                    Clear search
                  </button>
                  <button
                    v-else
                    class="h-9 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    @click="showAddDoorForm"
                  >
                    <Plus class="w-4 h-4 inline mr-1" /> Add First Door
                  </button>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="door in items"
              :key="door.id"
              class="group hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors duration-200"
            >
              <!-- Name -->
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <DoorOpen class="h-4 w-4" />
                  </div>
                  <div>
                    <span class="text-[13px] font-semibold text-slate-800 dark:text-white">{{ door.doorName || 'Unnamed Door' }}</span>
                    <p class="text-[11px] text-slate-400 font-mono">
                      {{ String(door.id).substring(0, 8) }}…
                    </p>
                  </div>
                </div>
              </td>

              <!-- Number -->
              <td class="px-5 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-mono font-bold border border-slate-200 dark:border-zinc-700">
                  #{{ door.doorNumber || '—' }}
                </span>
              </td>

              <!-- Location -->
              <td class="px-5 py-3">
                <span class="text-[12px] font-semibold text-slate-500">{{ door.location || '—' }}</span>
              </td>

              <!-- Status & Sensor Live State -->
              <td class="px-5 py-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Controller Connectivity Status -->
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                      getDeviceOnline(door)
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'
                        : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400'
                    ]"
                    :title="door.deviceUuid ? `Controller UUID: ${door.deviceUuid}` : 'No hardware linked'"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', getDeviceOnline(door) ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400']" />
                    {{ getDeviceOnline(door) ? 'Online' : (door.status || 'Offline') }}
                  </span>

                  <!-- Live Door Sensor State Indicator -->
                  <span
                    v-if="door.deviceUuid"
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border',
                      getDoorSensorState(door).badgeClass
                    ]"
                    :title="`Sensor status: ${getDoorSensorState(door).label}`"
                  >
                    <span>{{ getDoorSensorState(door).icon }}</span>
                    <span>{{ getDoorSensorState(door).label }}</span>
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-5 py-3 text-right">
                <div class="flex justify-end gap-2 pr-2">
                  <button
                    v-if="door.deviceUuid"
                    title="Control Door & Open Duration"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    @click="openControlModal(door)"
                  >
                    <DoorOpen class="w-3.5 h-3.5" />
                    <span>Control Door</span>
                  </button>
                  <button
                    title="View Door Event Logs"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    @click="viewDoorLogs(door)"
                  >
                    <FileText class="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </button>
                  <button
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-slate-200 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors shadow-sm cursor-pointer"
                    @click="editItem(door)"
                  >
                    Edit
                  </button>
                  <button
                    title="Delete Door"
                    class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-rose-200 dark:border-rose-900/50 bg-transparent text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm cursor-pointer"
                    @click="deleteItem(door)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (inside the card, at the bottom) -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }} &nbsp;·&nbsp; {{ totalItems }} total
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Next
        </button>
      </div>

      <!-- Registration Dialog -->
      <DoorRegistrationDialog
        v-model="showDialog"
        :door="selectedDoor"
        @success="fetchDoorData"
      />

      <!-- Door Control Modal -->
      <DoorControlModal
        v-model="showControlModal"
        :door="targetControlDoor"
        @toast="handleModalToast"
      />

      <!-- 4-Door Hardware Config Modal -->
      <DoorConfigModal
        v-model="showConfigModal"
        @toast="handleModalToast"
      />

      <!-- Toast Banner Notification -->
      <div
        v-if="toastMessage"
        class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 animate-in slide-in-from-top-2 duration-300"
      >
        <div
          class="w-2 h-2 rounded-full"
          :class="toastType === 'success' ? 'bg-emerald-400' : 'bg-rose-400'"
        />
        <span class="text-xs font-bold">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, DoorOpen, Trash2, Loader2, SlidersHorizontal, FileText } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useMQTT } from "@/composables/useMQTT";
import DoorRegistrationDialog from "./doorRegistrationDialog.vue";
import DoorControlModal from "./doorControlModal.vue";
import DoorConfigModal from "./doorConfigModal.vue";

const router = useRouter();
const showConfigModal = ref(false);
const { deviceOnlineMap, doorSensorStates } = useMQTT();

const getDeviceOnline = (door) => {
  if (!door || !door.deviceUuid) return door?.status === 'active';
  const info = deviceOnlineMap.value[door.deviceUuid];
  if (info && info.status) return info.status === 'online';
  return door.status === 'active';
};

const getDoorSensorState = (door) => {
  if (!door || !door.deviceUuid) {
    return { label: 'Unknown', icon: '❓', badgeClass: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
  }
  const rawNum = parseInt(door.relayNumber || door.channel || door.doorNumber || 1, 10);
  const doorNum = ((rawNum - 1) % 4) + 1;
  const doorBitmask = 1 << (doorNum - 1);
  const doorIdx = doorBitmask.toString(16).padStart(2, '0');
  const sensorKey = `${door.deviceUuid}_${doorIdx}`;

  const sensorInfo = doorSensorStates.value[sensorKey] || doorSensorStates.value[doorIdx];
  if (!sensorInfo) {
    return { label: 'Closed', icon: '🔒', badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  }

  switch (sensorInfo.state) {
    case 'open':
      return { label: 'Open', icon: '🚪', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'forced':
      return { label: 'Forced Open', icon: '🚨', badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse' };
    case 'timeout':
      return { label: 'Left Open', icon: '⌛', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'closed':
    default:
      return { label: 'Closed', icon: '🔒', badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  }
};

const viewDoorLogs = (door) => {
  router.push({
    path: "/dashboard/settings/logs",
    query: {
      doorId: door.id,
      doorName: door.doorName || "",
      doorNumber: door.doorNumber || "",
      sn: door.deviceUuid || "",
      deviceUuid: door.deviceUuid || ""
    }
  });
};

// Accessors
const token = authService.getToken();
const items = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const page = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const showDialog = ref(false);
const selectedDoor = ref(null);

// Door Control Modal State
const showControlModal = ref(false);
const targetControlDoor = ref(null);

// Toast Banner State
const toastMessage = ref("");
const toastType = ref("success");
let toastTimeout = null;

const showToast = (msg, type = "success") => {
  toastMessage.value = msg;
  toastType.value = type;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMessage.value = "";
  }, 3500);
};

const handleModalToast = ({ msg, type }) => {
  showToast(msg, type);
};

const openControlModal = (door) => {
  targetControlDoor.value = door;
  showControlModal.value = true;
};

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchDoorData();
  }, 400);
};

watch(page, () => {
  fetchDoorData();
});

const fetchDoorData = async () => {
  const currentToken = authService.getToken();
  if (!currentToken) return;
  const tenantId = await currentUserTenant.getTenantIdAsync();

  loading.value = true;

  try {
    const fields = [
      "id", "doorNumber", "doorName", "status",
      "departmentIds", "location", "uniqueId", "deviceUuid",
      "antipassbackMode", "doorsConfigure", "timerMode", "senzrMode", "buzzerMode"
    ].map(f => `fields[]=${encodeURIComponent(f)}`).join('&');

    let url = `${import.meta.env.VITE_API_URL}/items/doors?limit=${itemsPerPage}&page=${page.value}&sort=-id&${fields}`;
    if (tenantId) {
      url += `&filter[tenant][_eq]=${encodeURIComponent(tenantId)}`;
    }
    if (searchQuery.value) {
      const q = encodeURIComponent(searchQuery.value);
      url += `&filter[_or][0][doorName][_icontains]=${q}&filter[_or][1][doorNumber][_icontains]=${q}`;
    }

    let response = await fetch(url, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });

    if (!response.ok) {
      let fallbackUrl = `${import.meta.env.VITE_API_URL}/items/doors?limit=${itemsPerPage}&page=${page.value}&sort=-id&${fields}`;
      if (tenantId) {
        fallbackUrl += `&filter[tenant][tenantId][_eq]=${encodeURIComponent(tenantId)}`;
      }
      response = await fetch(fallbackUrl, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (!response.ok) {
        fallbackUrl = `${import.meta.env.VITE_API_URL}/items/doors?limit=${itemsPerPage}&page=${page.value}&sort=-id&${fields}`;
        response = await fetch(fallbackUrl, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
      }
    }

    if (response.ok) {
      const data = await response.json();
      items.value = data.data || [];
      totalItems.value = data.meta?.filter_count ?? (data.data || []).length;
    } else {
      console.error("Fetch doors failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Fetch doors error:", error);
  } finally {
    loading.value = false;
  }
};

const showAddDoorForm = () => {
  selectedDoor.value = null;
  showDialog.value = true;
};

const editItem = (item) => {
  selectedDoor.value = item;
  showDialog.value = true;
};

const deleteItem = async (door) => {
  if (confirm("Are you sure you want to delete this door?")) {
    try {
      const currentToken = authService.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/doors/${door.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      if (response.ok) {
        fetchDoorData();
      } else {
        showToast("Failed to delete door", "error");
      }
    } catch(err) {
      console.error("Failed to delete door", err);
    }
  }
};

onMounted(() => {
  fetchDoorData();
});
</script>

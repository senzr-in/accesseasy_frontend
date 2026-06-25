<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">

    <!-- Toolbar: Search + Add Door on the same line -->
    <div class="flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Search doors by name or number..."
          v-model="searchQuery"
          @input="debouncedSearch"
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      <!-- Add Door -->
      <button
        @click="showAddDoorForm"
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shrink-0"
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
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Door Name</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">#</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Location</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="5" class="px-5 py-24 text-center">
                <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="items.length === 0">
              <td colspan="5" class="px-5 py-24 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <DoorOpen class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">No doors found.</p>
                  <button
                    v-if="searchQuery"
                    @click="searchQuery = ''; fetchDoorData()"
                    class="text-xs font-bold text-blue-500 hover:underline"
                  >Clear search</button>
                  <button
                    v-else
                    @click="showAddDoorForm"
                    class="h-9 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    <Plus class="w-4 h-4 inline mr-1" /> Add First Door
                  </button>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-else
              v-for="door in items"
              :key="door.id"
              class="group/row hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors duration-200"
            >
              <!-- Name -->
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <DoorOpen class="h-4 w-4" />
                  </div>
                  <div>
                    <span class="text-[13px] font-semibold text-slate-800 dark:text-white">{{ door.doorName || 'Unnamed Door' }}</span>
                    <p class="text-[11px] text-slate-400 font-mono">{{ String(door.id).substring(0, 8) }}…</p>
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

              <!-- Status -->
              <td class="px-5 py-3">
                <span :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                  door.status === 'active'
                    ? 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400'
                    : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                ]">
                  <span :class="['w-1.5 h-1.5 rounded-full', door.status === 'active' ? 'bg-green-500' : 'bg-gray-400']"></span>
                  {{ door.status || 'unknown' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-3 text-right">
                <div class="flex justify-end gap-2 pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                  <button
                    v-if="door.deviceUuid"
                    @click="openDoor(door)"
                    title="Open Door"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-emerald-200 dark:border-emerald-800 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition-colors shadow-sm"
                  >
                    Open
                  </button>
                  <button
                    v-if="door.deviceUuid"
                    @click="lockDoor(door)"
                    title="Lock Door"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-rose-200 dark:border-rose-800 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors shadow-sm"
                  >
                    Lock
                  </button>
                  <button
                    @click="editItem(door)"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-slate-200 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteItem(door)"
                    title="Delete Door"
                    class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-rose-200 dark:border-rose-900/50 bg-transparent text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm"
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
          @click="page--"
          :disabled="page <= 1 || loading"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }} &nbsp;·&nbsp; {{ totalItems }} total
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
      <DoorRegistrationDialog v-model="showDialog" :door="selectedDoor" @success="fetchDoorData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Plus, Search, DoorOpen, DoorClosed, AlertCircle, Settings, Trash2, Filter, X, Loader2 } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DoorRegistrationDialog from "./doorRegistrationDialog.vue";

// Accessors
const token = authService.getToken();

// State
const items = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const page = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const showDialog = ref(false);
const selectedDoor = ref(null);

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
  if (!token) return;
  // Always resolve tenantId async — the sync getter returns null before initialization
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId) return;

  loading.value = true;

  try {
    const filterParams = {
      "filter[tenant][tenantId][_eq]": tenantId,
      "filter[status][_neq]": "archived",
    };
    if (searchQuery.value) {
      filterParams["filter[_or][0][doorName][_icontains]"] = searchQuery.value;
      filterParams["filter[_or][1][doorNumber][_icontains]"] = searchQuery.value;
    }

    const queryParams = new URLSearchParams({
      limit: itemsPerPage.toString(),
      page: page.value.toString(),
      sort: "-date_created",
      meta: "filter_count",
      ...filterParams
    });

    // Only request fields that exist and have read permissions (matching reference codebase)
    const fields = [
      "id", "doorNumber", "doorName", "status",
      "departmentIds", "location", "uniqueId", "deviceUuid"
    ].map(f => `fields[]=${encodeURIComponent(f)}`).join('&');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?${queryParams.toString()}&${fields}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      items.value = data.data || [];
      totalItems.value = data.meta?.filter_count ?? 0;
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

const openDoor = async (door) => {
  try {
    const deviceUuid = door.deviceUuid || door.uniqueId || "UNKNOWN-DEVICE";
    const doorNum = parseInt(door.doorNumber || 1, 10);
    const doorBitmask = 1 << (doorNum - 1);
    const doorIndex = doorBitmask.toString(16).padStart(2, '0');

    const response = await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-router`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remoteControl",
        uuid: deviceUuid,
        data: {
          command: 1, // 1 = Remote door opening
          index: doorIndex
        }
      })
    });

    const result = await response.json();
    if (result.success || response.ok) {
      alert("Door open command sent successfully!");
    } else {
      console.error("Failed to open door:", result.error);
      alert("Failed to open door");
    }
  } catch (err) {
    console.error("Network error communicating with Knative bridge:", err);
    alert("Network error communicating with Knative bridge");
  }
};

const lockDoor = async (door) => {
  try {
    const deviceUuid = door.deviceUuid || door.uniqueId || "UNKNOWN-DEVICE";
    const doorNum = parseInt(door.doorNumber || 1, 10);
    const doorBitmask = 1 << (doorNum - 1);
    const doorIndex = doorBitmask.toString(16).padStart(2, '0');

    const response = await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-router`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remoteControl",
        uuid: deviceUuid,
        data: {
          command: 6, // 6 = Unified control
          index: doorIndex,
          extra: {
            action: 0 // 0 = Lock
          }
        }
      })
    });

    const result = await response.json();
    if (result.success || response.ok) {
      alert("Door lock command sent successfully!");
    } else {
      console.error("Failed to lock door:", result.error);
      alert("Failed to lock door");
    }
  } catch (err) {
    console.error("Network error communicating with Knative bridge:", err);
    alert("Network error communicating with Knative bridge");
  }
};

const deleteItem = async (door) => {
    if (confirm("Are you sure you want to delete this door?")) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/items/doors/${door.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                fetchDoorData();
            } else {
                alert("Failed to delete door");
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

<template>
  <div class="flex flex-col h-full p-6 gap-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Data Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <!-- Toolbar -->
      <div class="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div class="relative w-full sm:w-80">
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search logs by employee, ID, or door..."
              class="w-full pl-9 h-10 rounded-lg text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white shadow-sm"
              @input="debouncedSearch"
            >
          </div>
          <!-- Active Door Filter Badge -->
          <div
            v-if="activeDoorFilter"
            class="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400 shrink-0"
          >
            <DoorOpen class="w-4 h-4" />
            <span>Door: <strong>{{ activeDoorFilter }}</strong></span>
            <button
              title="Clear Door Filter"
              class="ml-1 p-0.5 hover:bg-purple-500/20 rounded-full transition-colors"
              @click="clearDoorFilter"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Refresh logs"
            @click="fetchLogs"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-auto flex-1 min-h-0">
        <table class="w-full text-left border-collapse whitespace-nowrap relative">
          <thead class="bg-slate-50 dark:hover:bg-zinc-800 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 w-full">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest w-16">
                Profile
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Employee
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Date & Time
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Door
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Action
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Mode
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            <tr v-if="loading">
              <td
                colspan="7"
                class="h-64 text-center"
              >
                <Loader2 class="w-8 h-8 animate-spin mx-auto text-blue-500" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td
                colspan="7"
                class="h-64 text-center text-slate-500 dark:text-slate-400"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <Activity class="w-12 h-12 text-slate-300 dark:text-slate-700 dark:text-slate-200" />
                  <p class="text-sm font-medium">
                    No system logs found.
                  </p>
                </div>
              </td>
            </tr>
            <tr 
              v-for="log in items"
              v-else 
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-5 py-3">
                <div class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400">
                  <img
                    v-if="log.avatarImage"
                    :src="log.avatarImage"
                    class="h-full w-full object-cover"
                  >
                  <User
                    v-else
                    class="w-4 h-4"
                  />
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">
                    {{ getEmployeeName(log) }}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                    {{ log.employeeId?.employeeId || log.rfid || 'N/A' }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">
                    {{ log.date || '-' }}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {{ formatTime(log.timeStamp, log.date_created) }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 py-0.5">
                  <DoorOpen class="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{{ getDoorDisplayName(log) }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border"
                  :class="getActionClass(log.action)"
                >
                  {{ log.action || 'N/A' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">
                  <component
                    :is="getModeIcon(log.mode)"
                    class="w-3.5 h-3.5"
                  />
                  {{ log.mode || 'Unknown' }}
                </div>
              </td>
              <td class="px-5 py-3">
                <div
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded w-fit border text-[10px] font-black uppercase tracking-widest"
                  :class="getValidLogsClass(log.ValidLogs)"
                >
                  <component
                    :is="getValidLogsIcon(log.ValidLogs)"
                    class="w-3 h-3"
                  />
                  {{ getValidLogsText(log.ValidLogs) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-900/50 mt-auto">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors bg-transparent text-slate-700 dark:text-slate-300 shadow-sm"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Page {{ page }} of {{ totalPages || 1 }}
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors bg-transparent text-slate-700 dark:text-slate-300 shadow-sm"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { 
  Activity, Search, User, 
  LogIn, LogOut, Loader2, Fingerprint, 
  Smartphone, MapPin, ScanFace, CheckCircle2, XCircle, HelpCircle, DoorOpen, X, Edit2 
} from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const route = useRoute();
const router = useRouter();

const items = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const activeDoorFilter = ref("");
const page = ref(1);
const limit = 25;
const totalItems = ref(0);

const doorsList = ref([]);
const doorsById = ref({});
const doorsByDevUuid = ref({});
const doorsByNum = ref({});
const doorsByDevAndNum = ref({});

const fetchDoors = async () => {
  if (!token) token = authService.getToken();
  const tId = await currentUserTenant.getTenantIdAsync();
  if (!tId) return;
  try {
    const params = new URLSearchParams({
      "filter[_or][0][tenant][tenantId][_eq]": tId,
      "filter[_or][1][tenant][_eq]": tId,
      "limit": "100"
    });
    ["id", "doorNumber", "doorName", "status", "uniqueId", "deviceUuid", "doorsConfigure"].forEach(f => {
      params.append("fields[]", f);
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      doorsList.value = data.data || [];
      const dById = {};
      const dByDev = {};
      const dByNum = {};
      const dByDevAndNum = {};

      doorsList.value.forEach(d => {
        if (d.id) dById[d.id] = d;
        if (d.uniqueId) dById[d.uniqueId] = d;
        if (d.doorNumber !== undefined && d.doorNumber !== null) {
          const numStr = String(parseInt(d.doorNumber, 10));
          const numPadded = String(d.doorNumber).padStart(2, '0');
          dByNum[d.doorNumber] = d;
          dByNum[numStr] = d;
          dByNum[numPadded] = d;
        }

        const devIds = [];
        if (d.deviceUuid) devIds.push(String(d.deviceUuid).trim());
        if (d.uniqueId) devIds.push(String(d.uniqueId).trim());
        if (d.doorsConfigure) {
          if (typeof d.doorsConfigure === 'string') {
            devIds.push(d.doorsConfigure.trim());
          } else if (typeof d.doorsConfigure === 'object') {
            if (d.doorsConfigure.deviceId) {
              if (typeof d.doorsConfigure.deviceId === 'string') devIds.push(d.doorsConfigure.deviceId.trim());
              else if (typeof d.doorsConfigure.deviceId === 'object') {
                if (d.doorsConfigure.deviceId.uuid) devIds.push(String(d.doorsConfigure.deviceId.uuid).trim());
                if (d.doorsConfigure.deviceId.deviceUuid) devIds.push(String(d.doorsConfigure.deviceId.deviceUuid).trim());
                if (d.doorsConfigure.deviceId.id) devIds.push(String(d.doorsConfigure.deviceId.id).trim());
              }
            }
          }
        }
        
        devIds.forEach(devId => {
          if (!dByDev[devId] || d.doorNumber == '1' || d.doorNumber == '01') {
            dByDev[devId] = d;
          }
          if (d.doorNumber !== undefined && d.doorNumber !== null) {
            const numStr = String(parseInt(d.doorNumber, 10));
            const numPadded = String(d.doorNumber).padStart(2, '0');
            dByDevAndNum[`${devId}_${d.doorNumber}`] = d;
            dByDevAndNum[`${devId}_${numStr}`] = d;
            dByDevAndNum[`${devId}_${numPadded}`] = d;
          }
        });
      });
      doorsById.value = dById;
      doorsByDevUuid.value = dByDev;
      doorsByNum.value = dByNum;
      doorsByDevAndNum.value = dByDevAndNum;
    }
  } catch (err) {
    console.error("Fetch doors lookup error:", err);
  }
};

const getDoorDisplayName = (log) => {
  if (!log) return "—";

  // 1. Relational door object (non-null object with doorName / id / doorNumber)
  if (log.door && typeof log.door === 'object') {
    if (log.door.doorName) return log.door.doorName;
    if (log.door.id && doorsById.value[log.door.id]) return doorsById.value[log.door.id].doorName;
    if (log.door.uniqueId && doorsById.value[log.door.uniqueId]) return doorsById.value[log.door.uniqueId].doorName;
    if (log.door.doorNumber) {
      const devId = log.sn;
      if (devId && doorsByDevAndNum.value[`${devId}_${log.door.doorNumber}`]) {
        return doorsByDevAndNum.value[`${devId}_${log.door.doorNumber}`].doorName;
      }
      if (doorsByNum.value[log.door.doorNumber]) return doorsByNum.value[log.door.doorNumber].doorName;
    }
  }
  
  // 2. Direct doorName string on log
  if (log.doorName && typeof log.doorName === 'string') return log.doorName;

  // 3. Primitive door ID lookup (when log.door is primitive string/number)
  if (log.door && (typeof log.door === 'string' || typeof log.door === 'number')) {
    if (doorsById.value[log.door]) {
      return doorsById.value[log.door].doorName;
    }
  }

  // 4. Scoped Device SN + Door Number / Index matching
  const devId = log.sn;
  const doorNum = (log.door && (typeof log.door === 'string' || typeof log.door === 'number'))
    ? log.door
    : (log.doorNumber ?? log.doorIndex ?? log.doorNo ?? log.reader ?? null);

  if (doorNum !== undefined && doorNum !== null && doorNum !== "") {
    const numRaw = String(doorNum).trim();
    const cleanNum = String(parseInt(numRaw, 10));
    const paddedNum = numRaw.padStart(2, '0');

    // Scoped device lookup first
    if (devId) {
      if (doorsByDevAndNum.value[`${devId}_${numRaw}`]) return doorsByDevAndNum.value[`${devId}_${numRaw}`].doorName;
      if (doorsByDevAndNum.value[`${devId}_${cleanNum}`]) return doorsByDevAndNum.value[`${devId}_${cleanNum}`].doorName;
      if (doorsByDevAndNum.value[`${devId}_${paddedNum}`]) return doorsByDevAndNum.value[`${devId}_${paddedNum}`].doorName;
      if (doorsByDevUuid.value[devId]) return doorsByDevUuid.value[devId].doorName;
    }

    // Fallback: global doorNumber match
    if (doorsByNum.value[numRaw]) return doorsByNum.value[numRaw].doorName;
    if (doorsByNum.value[cleanNum]) return doorsByNum.value[cleanNum].doorName;
    if (doorsByNum.value[paddedNum]) return doorsByNum.value[paddedNum].doorName;
  }

  // 5. Active URL filter fallback
  if (route.query.doorName) {
    return route.query.doorName;
  }

  return "—";
};

const editingLogId = ref(null);
const savingDoorLogId = ref(null);

const getLogDoorValue = (log) => {
  if (!log) return "";
  if (log.door && typeof log.door === 'object') return log.door.id || "";
  if (log.door) return log.door;
  return "";
};

const onDoorSelectChange = async (log, event) => {
  const newDoorId = event.target.value;
  if (!newDoorId) {
    editingLogId.value = null;
    return;
  }
  await updateLogDoor(log, newDoorId);
};

const updateLogDoor = async (log, newDoorId) => {
  savingDoorLogId.value = log.id;
  editingLogId.value = null;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/logs/${log.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ door: newDoorId })
    });

    if (res.ok) {
      const updatedData = await res.json();
      const selectedDoorObj = doorsById.value[newDoorId] || doorsList.value.find(d => String(d.id) === String(newDoorId));
      log.door = selectedDoorObj || newDoorId;
      if (updatedData.data?.door) {
        log.door = updatedData.data.door;
      }
    } else {
      console.error("Failed to update door for log:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Error updating log door:", err);
  } finally {
    savingDoorLogId.value = null;
  }
};

let token = authService.getToken();
let tenantId = currentUserTenant.getTenantId();
let userRole = currentUserTenant.getRole();

const totalPages = computed(() => Math.ceil(totalItems.value / limit));

const clearDoorFilter = () => {
  activeDoorFilter.value = "";
  searchQuery.value = "";
  router.replace({ path: route.path, query: {} });
  page.value = 1;
  fetchLogs();
};

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchLogs();
  }, 300);
};

watch(page, () => {
  fetchLogs();
});

const aggregateCount = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!token || !tenantId) return;
  try {
    const params = new URLSearchParams({
      "aggregate[count]": "id",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][mode][_neq]": "cronJob",
      "_t": Date.now().toString()
    });
    
    if (searchQuery.value) {
       params.append("filter[_and][2][_or][0][employeeId][employeeId][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][1][employeeId][assignedUser][first_name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][2][employeeId][assignedUser][last_name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][3][name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][4][door][doorName][_icontains]", searchQuery.value);
    } else if (route.query.doorId || route.query.doorName || route.query.deviceUuid) {
       let idx = 0;
       if (route.query.doorId) {
         params.append(`filter[_and][2][_or][${idx++}][door][id][_eq]`, route.query.doorId);
         params.append(`filter[_and][2][_or][${idx++}][door][_eq]`, route.query.doorId);
       }
       if (route.query.doorName) {
         params.append(`filter[_and][2][_or][${idx++}][door][doorName][_icontains]`, route.query.doorName);
       }
       if (route.query.deviceUuid) {
         params.append(`filter[_and][2][_or][${idx++}][deviceUuid][_eq]`, route.query.deviceUuid);
       }
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    totalItems.value = data?.data?.[0]?.count?.id || 0;
  } catch (err) {
    console.error("Aggregate count error:", err);
  }
};

const fetchLogs = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!token || !tenantId) return;
  loading.value = true;
  await aggregateCount();

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.value.toString(),
      "sort[]": "-date_created",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][mode][_neq]": "cronJob",
      "_t": Date.now().toString()
    });

    const fields = [
      "status", "action", "employeeId.employeeId", 
      "employeeId.assignedUser.id", "employeeId.assignedUser.first_name", 
      "employeeId.assignedUser.last_name", "employeeId.assignedUser.avatar.id",
      "mode", "timeStamp", "date", "id", "ValidLogs", "date_created",
      "name", "rfid", "sn",
      "door.id", "door.doorNumber", "door.doorName"
    ];

    fields.forEach(f => params.append("fields[]", f));

    if (searchQuery.value) {
       params.append("filter[_and][2][_or][0][employeeId][employeeId][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][1][employeeId][assignedUser][first_name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][2][employeeId][assignedUser][last_name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][3][name][_icontains]", searchQuery.value);
       params.append("filter[_and][2][_or][4][door][doorName][_icontains]", searchQuery.value);
    } else if (route.query.doorId || route.query.doorName || route.query.deviceUuid) {
       let idx = 0;
       if (route.query.doorId) {
         params.append(`filter[_and][2][_or][${idx++}][door][id][_eq]`, route.query.doorId);
         params.append(`filter[_and][2][_or][${idx++}][door][_eq]`, route.query.doorId);
       }
       if (route.query.doorName) {
         params.append(`filter[_and][2][_or][${idx++}][door][doorName][_icontains]`, route.query.doorName);
       }
       if (route.query.deviceUuid) {
         params.append(`filter[_and][2][_or][${idx++}][deviceUuid][_eq]`, route.query.deviceUuid);
       }
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      
      items.value = await Promise.all(data.data.map(async (logItem) => {
        // Fallback: If employeeId is missing but rfid exists, look up assigned employee from cardManagement
        if (!logItem.employeeId && logItem.rfid) {
          try {
            const cardRes = await fetch(
              `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${encodeURIComponent(logItem.rfid)}&fields=employeeId.employeeId,employeeId.assignedUser.id,employeeId.assignedUser.first_name,employeeId.assignedUser.last_name,employeeId.assignedUser.avatar.id`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (cardRes.ok) {
              const cardData = await cardRes.json();
              if (cardData.data?.[0]?.employeeId) {
                logItem.employeeId = cardData.data[0].employeeId;
              }
            }
          } catch (e) {
            console.debug('Fallback card lookup error:', e);
          }
        }

        if (logItem.employeeId?.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${logItem.employeeId.assignedUser.avatar.id}`;
          try {
             const imgRes = await fetch(avatarUrl, { headers: { Authorization: `Bearer ${token}` }});
             if(imgRes.ok) {
               const blob = await imgRes.blob();
               logItem.avatarImage = URL.createObjectURL(blob);
             }
          } catch(e) {}
        }
        return logItem;
      }));
    } else {
      console.error("Fetch logs failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Fetch logs error:", error);
  } finally {
    loading.value = false;
  }
};

const getEmployeeName = (item) => {
  if (item?.employeeId?.assignedUser) {
    return `${item.employeeId.assignedUser.first_name || ''} ${item.employeeId.assignedUser.last_name || ''}`.trim() || "Unknown";
  }
  
  if (item?.name) return item.name;
  if (item?.employeeName) return item.employeeName;
  if (item?.rfid) return "Unassigned Card";
  
  return "Unknown";
};

const formatTime = (timeStr, fallbackDateCreated) => {
    if (!timeStr && fallbackDateCreated) {
      const d = new Date(fallbackDateCreated);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    if(!timeStr) return "-";
    return timeStr.split(".")[0]; 
}

const getActionClass = (action) => {
  if(action?.toLowerCase() === 'in') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
  if(action?.toLowerCase() === 'out') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

const getModeIcon = (mode) => {
  switch (mode?.toLowerCase()) {
    case "face": return ScanFace;
    case "rfid": return MapPin;
    case "fingerprint": return Fingerprint;
    case "throughapp": return Smartphone;
    default: return Activity;
  }
}

const getValidLogsClass = (valid) => {
   if (valid === true || valid === "authorized" || valid === 1) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
   if (valid === false || valid === "unAuthorized" || valid === 0) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
   return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

const getValidLogsIcon = (valid) => {
   if(valid === true || valid === "authorized" || valid === 1) return CheckCircle2;
   if(valid === false || valid === "unAuthorized" || valid === 0) return XCircle;
   return HelpCircle;
}

const getValidLogsText = (valid) => {
   if(valid === true || valid === "authorized" || valid === 1) return "Authorized";
   if(valid === false || valid === "unAuthorized" || valid === 0) return "Unauthorized";
   return "Unknown";
}

onMounted(async () => {
  await currentUserTenant.initialize();
  token = authService.getToken();
  tenantId = currentUserTenant.getTenantId();
  userRole = currentUserTenant.getRole();
  await fetchDoors();
  if (route.query.doorName || route.query.doorNumber || route.query.search || route.query.doorId) {
    const doorName = route.query.doorName || "";
    const doorNum = route.query.doorNumber ? `#${route.query.doorNumber}` : "";
    activeDoorFilter.value = doorName ? `${doorName} ${doorNum}`.trim() : (route.query.search || "");
  }
  fetchLogs();
  
  pollInterval = setInterval(() => {
    // Only background poll if we are on the first page and not searching
    if (page.value === 1 && !searchQuery.value) {
      // Fetch logs silently in background
      fetchLogsInBackground();
    }
  }, 5000);
});

let pollInterval = null;

const fetchLogsInBackground = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!token || !tenantId) return;

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.value.toString(),
      "sort[]": "-date_created",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][mode][_neq]": "cronJob",
      "_t": Date.now().toString()
    });

    const fields = [
      "status", "action", "employeeId.employeeId", 
      "employeeId.assignedUser.id", "employeeId.assignedUser.first_name", 
      "employeeId.assignedUser.last_name", "employeeId.assignedUser.avatar.id",
      "mode", "timeStamp", "date", "id", "ValidLogs", "date_created",
      "name", "rfid", "sn",
      "door.id", "door.doorNumber", "door.doorName"
    ];

    fields.forEach(f => params.append("fields[]", f));

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      
      const newItems = await Promise.all(data.data.map(async (logItem) => {
        if (logItem.employeeId?.assignedUser?.avatar?.id) {
           // Basic URL is enough for background, avoid re-fetching blobs to save memory
           logItem.avatarImage = `${import.meta.env.VITE_API_URL}/assets/${logItem.employeeId.assignedUser.avatar.id}?access_token=${token}`;
        }
        return logItem;
      }));
      
      // Update only if items changed or lengths differ
      if (newItems.length > 0) {
        items.value = newItems;
      }
    }
    
    // Also update count silently
    const countParams = new URLSearchParams({
      "aggregate[count]": "id",
      "filter[_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][1][mode][_neq]": "cronJob",
      "_t": Date.now().toString()
    });
    const countRes = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${countParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (countRes.ok) {
        const cData = await countRes.json();
        totalItems.value = cData?.data?.[0]?.count?.id || 0;
    }
  } catch (error) {
    // Silent
  }
};

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>


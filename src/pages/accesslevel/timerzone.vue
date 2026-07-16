<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search timer zones..."
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
        >
      </div>
      <button
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 dark:bg-white dark:bg-slate-900 text-white dark:text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shrink-0"
        @click="openAddDialog"
      >
        <Plus class="w-4 h-4" /> Add Timer Zone
      </button>
    </div>

    <!-- Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:hover:bg-zinc-800 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Name
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Start Time
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                End Time
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Status
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
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

            <!-- Error -->
            <tr v-else-if="error">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <AlertCircle class="w-10 h-10 text-rose-300 dark:text-rose-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">
                    {{ error }}
                  </p>
                  <button
                    class="text-xs font-bold text-blue-500 hover:underline"
                    @click="fetchTimerZones"
                  >
                    Try Again
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredTimerZones.length === 0">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <Clock class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    No timer zones found.
                  </p>
                  <button
                    v-if="searchQuery"
                    class="text-xs font-bold text-blue-500 hover:underline"
                    @click="searchQuery = ''"
                  >
                    Clear search
                  </button>
                  <button
                    v-else
                    class="h-9 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 dark:bg-slate-950 text-white dark:text-slate-900 dark:text-slate-100 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    @click="openAddDialog"
                  >
                    <Plus class="w-4 h-4 inline mr-1" /> Add First Timer Zone
                  </button>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="item in filteredTimerZones"
              v-else
              :key="item.id"
              class="group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
              @click="editZone(item)"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                    <Clock class="h-4 w-4" />
                  </div>
                  <span class="text-[13px] font-semibold text-slate-800 dark:text-white">{{ item.timeZoneName }}</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-mono font-bold border border-slate-200 dark:border-zinc-700">
                  {{ formatTime(item.entryTime) }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-mono font-bold border border-slate-200 dark:border-zinc-700">
                  {{ formatTime(item.exitTime) }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                    item.status === 'active' || item.status === 'published'
                      ? 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400'
                      : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', item.status === 'active' || item.status === 'published' ? 'bg-green-500' : 'bg-gray-400']" />
                  {{ item.status || 'unknown' }}
                </span>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                  <button
                    title="Delete Zone"
                    class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-rose-200 dark:border-rose-900/50 bg-transparent text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm"
                    @click.stop="deleteZone(item)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:hover:bg-zinc-800 shrink-0">
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-3">
          <span>{{ filteredTimerZones.length }} total</span>
        </div>
      </div>
    </div>

    <!-- Modals Overlay -->
    <div
      v-if="showDialog || showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <!-- Add/Edit Modal -->
      <div
        v-if="showDialog"
        class="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:hover:bg-zinc-800">
          <h3 class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            {{ isEditing ? "Edit Timer Zone" : "Add Timer Zone" }}
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200"
            @click="closeDialog"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Time Zone Name *</label>
            <input
              v-model="formData.timeZoneName"
              type="text"
              placeholder="e.g., Work Hours"
              class="w-full h-10 px-3 text-sm bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm text-slate-900 dark:text-white"
            >
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Start Time *</label>
              <input
                v-model="formData.entryTime"
                type="time"
                class="w-full h-10 px-3 text-sm bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              >
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">End Time *</label>
              <input
                v-model="formData.exitTime"
                type="time"
                class="w-full h-10 px-3 text-sm bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              >
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:hover:bg-zinc-800">
          <button
            class="h-9 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white transition-colors"
            @click="closeDialog"
          >
            Cancel
          </button>
          <button
            :disabled="!isFormValid || saving"
            class="flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
            @click="saveZone"
          >
            <Loader2
              v-if="saving"
              class="w-3.5 h-3.5 animate-spin"
            />
            {{ isEditing ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Delete Model -->
      <div
        v-if="showDeleteDialog"
        class="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden border border-rose-100 dark:border-rose-900/30 flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div class="p-6 flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
            <AlertCircle class="w-6 h-6 text-rose-500" />
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Delete Timer Zone
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to delete <span class="font-bold text-slate-700 dark:text-slate-300">"{{ zoneToDelete?.timeZoneName }}"</span>? This action cannot be undone.
          </p>
        </div>
        <div class="flex items-center gap-2 p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:hover:bg-zinc-800">
          <button
            :disabled="deleting"
            class="flex-1 h-10 rounded-xl bg-white dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            @click="showDeleteDialog = false"
          >
            Cancel
          </button>
          <button
            :disabled="deleting"
            class="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50 shadow-rose-500/20"
            @click="confirmDelete"
          >
            <Loader2
              v-if="deleting"
              class="w-4 h-4 animate-spin"
            />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <div
      v-if="snackbar.show"
      class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5"
      :class="snackbar.color === 'success' ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-rose-50 dark:bg-rose-900 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'"
    >
      <span class="text-sm font-semibold">{{ snackbar.message }}</span>
      <button
        class="opacity-50 hover:opacity-100 transition-opacity"
        @click="snackbar.show = false"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { Search, Plus, Clock, AlertCircle, Loader2, Trash2, X } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

// Reactive data
const timerZones = ref([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref(null);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const form = ref(null);
const zoneToDelete = ref(null);
const searchQuery = ref(""); // This comes from DataTableWrapper
const debouncedSearch = ref(""); // NEW: debounced version

let searchTimeout = null;

// Snackbar
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

// Table headers with widths
const headers = ref([
  {
    label: "Name",
    key: "timeZoneName",
    sortable: true,
    width: "200px",
  },
  {
    label: "Start Time",
    key: "entryTime",
    sortable: true,
    width: "200px",
  },
  {
    label: "End Time",
    key: "exitTime",
    sortable: true,
    width: "200px",
  },
  // {
  //   label: "Status",
  //   key: "status",
  //   sortable: true,
  //   width: "15%",
  //   align: "center",
  // },
  // {
  //   label: "Actions",
  //   key: "actions",
  //   sortable: false,
  //   width: "15%",
  //   align: "center",
  // },
]);

// Form data
const formData = reactive({
  id: null,
  timeZoneName: "",
  entryTime: "",
  exitTime: "",
  tenant: "",
});

// Get tenant ID and token
// Form valid calculation
const isFormValid = computed(() => {
  return formData.timeZoneName?.trim() && formData.entryTime && formData.exitTime;
});

const tenantId = ref(null);
const token = ref(null);

// API endpoints
const API_BASE = import.meta.env.VITE_API_URL;

const filteredTimerZones = computed(() => {
  const query = debouncedSearch.value.trim().toLowerCase();
  if (!query) return timerZones.value;

  return timerZones.value.filter((zone) =>
    zone.timeZoneName?.toLowerCase().includes(query)
  );
});
// Methods
const showNotification = (message, color = "success") => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  // Convert HH:mm:ss to HH:mm format for display
  return timeString.slice(0, 5);
};

const formatTimeForAPI = (timeString) => {
  if (!timeString) return "";
  // Ensure time is in HH:mm:ss format
  return timeString.length === 5 ? `${timeString}:00` : timeString;
};
const handleRowClick = (item) => {
  if (item && item.id) {
    editZone(item);
  } else {
    console.error("Invalid item or item ID");
    showNotification(
      "Unable to open timer zone details. Please try again.",
      "error"
    );
  }
};
const getStatusColor = (status) => {
  const statusColors = {
    draft: "warning",
    published: "success",
    archived: "error",
  };
  return statusColors[status] || "default";
};

const openAddDialog = () => {
  isEditing.value = false;
  resetForm();
  showDialog.value = true;
};

const editZone = (zone) => {
  isEditing.value = true;
  Object.assign(formData, {
    ...zone,
    entryTime: formatTime(zone.entryTime),
    exitTime: formatTime(zone.exitTime),
  });
  showDialog.value = true;
};

const saveZone = async () => {
  if (!formValid.value) return;

  saving.value = true;
  try {
    const payload = {
      timeZoneName: formData.timeZoneName,
      entryTime: formatTimeForAPI(formData.entryTime),
      exitTime: formatTimeForAPI(formData.exitTime),
      tenant: tenantId.value,
    };

    let response;
    if (isEditing.value) {
      // Update existing zone
      response = await fetch(`${API_BASE}/items/time/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(payload),
      });
    } else {
      // Add new zone
      response = await fetch(`${API_BASE}/items/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error(
        `Failed to ${isEditing.value ? "update" : "create"} timer zone`
      );
    }

    const result = await response.json();

    showNotification(
      `Timer zone ${isEditing.value ? "updated" : "created"} successfully`
    );

    closeDialog();
    await fetchTimerZones(); // Refresh the list
  } catch (err) {
    console.error("Error saving timer zone:", err);
    showNotification(
      `Failed to ${isEditing.value ? "update" : "create"} timer zone`,
      "error"
    );
  } finally {
    saving.value = false;
  }
};

const deleteZone = (zone) => {
  zoneToDelete.value = zone;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!zoneToDelete.value) return;

  deleting.value = true;
  try {
    const response = await fetch(
      `${API_BASE}/items/time/${zoneToDelete.value.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete timer zone");
    }

    showNotification("Timer zone deleted successfully");

    // Remove from local state
    timerZones.value = timerZones.value.filter(
      (z) => z.id !== zoneToDelete.value.id
    );

    showDeleteDialog.value = false;
    zoneToDelete.value = null;
  } catch (err) {
    console.error("Error deleting timer zone:", err);
    showNotification("Failed to delete timer zone", "error");
  } finally {
    deleting.value = false;
  }
};

const closeDialog = () => {
  showDialog.value = false;
  resetForm();
};

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    timeZoneName: "",
    entryTime: "",
    exitTime: "",
    tenant: "",
  });
  if (form.value) {
    form.value.resetValidation();
  }
};

const fetchTimerZones = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get user details first
    const userDetails = await currentUserTenant.fetchLoginUserDetails();

    if (!token.value || !tenantId.value) {
      throw new Error("Authentication required or tenant not found");
    }

    // Use proper Directus API parameter format
    const fields = [
      "id",
      "timeZoneName",
      "entryTime",
      "exitTime",
      "status",
      "tenant.tenantId",
      "tenant.tenantName",
    ];

    const url = new URL(`${API_BASE}/items/time`);
    fields.forEach((field) => {
      url.searchParams.append("fields[]", field);
    });
    url.searchParams.append("filter[status][_neq]", "archived");
    url.searchParams.append("filter[tenant][_eq]", tenantId.value);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch timer zones: ${response.status}`);
    }

    const result = await response.json();
    timerZones.value = result.data || [];
  } catch (err) {
    console.error("Error fetching timer zones:", err);

    if (err.message.includes("Failed to fetch")) {
      error.value =
        "Cannot connect to server. Please make sure the backend service is running.";
    } else {
      error.value = "Failed to load timer zones. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

// Initialize authentication data properly
const initializeAuth = async () => {
  try {
    // Get token and tenant ID
    token.value = authService.getToken();
    tenantId.value = currentUserTenant.getTenantId();

    if (!token.value || !tenantId.value) {
      throw new Error("Authentication data not available");
    }
  } catch (err) {
    console.error("Auth initialization error:", err);
    error.value = "Authentication failed. Please log in again.";
  }
};
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal.trim().toLowerCase();
  }, 300);
});
// Lifecycle - Initialize auth first, then fetch data
onMounted(async () => {
  await initializeAuth();
  if (token.value && tenantId.value) {
    await fetchTimerZones();
  }
});
</script>

<style scoped>
/* Tailwind CSS used exclusively */
</style>

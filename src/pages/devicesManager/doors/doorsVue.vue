<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <!-- Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <!-- Toolbar at the top of the card -->
      <div class="flex flex-wrap justify-between items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Access Points & Portals
        </h3>
        
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search portals or gates..."
              class="ae-input w-64"
              style="padding-left: 2.5rem;"
            />
          </div>
          <!-- Add Access Point -->
          <button
            class="btn-primary text-xs flex items-center gap-1.5"
            @click="showAddDoorForm"
          >
            <Plus class="w-4 h-4" /> Add Access Point
          </button>
        </div>
      </div>

      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Portal Name
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Access Point
              </th>

              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Status
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">
                QR Code
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white dark:bg-slate-900">
            <!-- Loading -->
            <tr v-if="loading">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <Loader2 class="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredItems.length === 0">
              <td
                colspan="6"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <DoorOpen class="w-10 h-10 text-slate-300" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    No portals or access points found.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="item in filteredItems"
              v-else
              :key="item.id"
              class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
            >
              <!-- Portal Name -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 text-indigo-650 shrink-0">
                    <Globe class="h-4 w-4" />
                  </div>
                  <div>
                    <span class="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                      {{ item.portalName }}
                    </span>
                    <p class="text-[10px] text-slate-400 font-mono">
                      {{ item.type === 'portal' ? item.id : 'Unassigned' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Access Point -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                    {{ item.doorName }}
                  </span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-mono border border-slate-250 dark:border-slate-800">
                    #{{ item.doorRecord?.doorNumber || '—' }}
                  </span>
                </div>
              </td>



              <!-- Status -->
              <td class="px-5 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize"
                  :class="item.portalStatus === 'published'
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/20'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="item.portalStatus === 'published' ? 'bg-emerald-500' : 'bg-amber-500'" />
                  {{ item.portalStatus === 'published' ? 'Active' : 'Draft' }}
                </span>
              </td>

              <!-- QR Code -->
              <td class="px-5 py-3.5 text-center">
                <div v-if="item.type === 'portal'" class="flex items-center justify-center gap-2">
                  <!-- Small QR preview -->
                  <img
                    v-if="qrDataUrls[item.id]"
                    :src="qrDataUrls[item.id]"
                    :alt="`QR for ${item.portalName}`"
                    class="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 bg-white p-0.5 shadow-sm"
                    title="QR Code Preview"
                  />
                  <div v-else class="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <QrCode class="w-4 h-4 text-slate-400" />
                  </div>
                  <!-- Download button -->
                  <button
                    class="h-7 w-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm cursor-pointer"
                    title="Download Portal QR Code"
                    @click="downloadQR(item)"
                  >
                    <Download class="w-3.5 h-3.5" />
                  </button>
                </div>
                <span v-else class="text-slate-300 dark:text-slate-700 text-xs">—</span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 text-right">
                <div class="flex justify-end gap-2 pr-2">
                  <button
                    v-if="item.type === 'portal'"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-indigo-200 rounded-md hover:bg-indigo-50 text-indigo-650 transition-colors shadow-sm cursor-pointer"
                    title="Open Portal URL"
                    @click="openPortalUrl(item)"
                  >
                    Launch
                  </button>
                  <button
                    title="Edit Access Point & Portal"
                    class="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    @click="editItem(item)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Delete"
                    class="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors shadow-sm cursor-pointer"
                    @click="deleteItem(item)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registration & Configuration Dialog -->
    <DoorRegistrationDialog
      v-model="showDialog"
      :door="selectedDoorRecord"
      :portal="selectedPortalRecord"
      @success="fetchDoorData"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Plus, Search, DoorOpen, Globe, Download, Pencil, Trash2, Loader2, QrCode } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DoorRegistrationDialog from "./doorRegistrationDialog.vue";
import QRCode from "qrcode";

const token = authService.getToken();

// State
const doors = ref([]);
const portals = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const showDialog = ref(false);
const selectedItem = ref(null);
const qrDataUrls = ref({});

const selectedDoorRecord = computed(() => selectedItem.value?.doorRecord || null);
const selectedPortalRecord = computed(() => selectedItem.value?.portalRecord || null);

// Parse Portal mappings & join with Access Points
const displayItems = computed(() => {
  const list = [];
  const linkedDoorIds = new Set();

  portals.value.forEach(portal => {
    let content = portal.Contentjson;
    if (typeof content === 'string') {
      try { content = JSON.parse(content); } catch { content = {}; }
    }
    const doorId = content?.assigned_door_id;
    const door = doorId ? doors.value.find(d => String(d.id) === String(doorId)) : null;
    
    if (doorId) {
      linkedDoorIds.add(String(doorId));
    }

    list.push({
      id: portal.id,
      type: 'portal',
      portalName: portal.Title || 'Unnamed Portal',
      portalStatus: portal.status || 'draft',
      doorId: door?.id || null,
      doorName: door?.doorName || 'Unassigned Access Point',
      doorType: door?.doorType || '—',
      portalRecord: portal,
      doorRecord: door
    });
  });

  // Display unlinked access points
  doors.value.forEach(door => {
    if (!linkedDoorIds.has(String(door.id))) {
      list.push({
        id: `unlinked-door-${door.id}`,
        type: 'unlinked-door',
        portalName: 'No Portal Assigned',
        portalStatus: 'draft',
        doorId: door.id,
        doorName: door.doorName || 'Unnamed Access Point',
        doorType: door.doorType || '—',
        portalRecord: null,
        doorRecord: door
      });
    }
  });

  return list;
});

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return displayItems.value;
  const q = searchQuery.value.toLowerCase();
  return displayItems.value.filter(item => 
    item.portalName.toLowerCase().includes(q) || 
    item.doorName.toLowerCase().includes(q) ||
    item.doorType.toLowerCase().includes(q)
  );
});

// Watch items to generate QRs
watch(displayItems, async (newList) => {
  for (const item of newList) {
    if (item.type === 'portal' && item.id && !qrDataUrls.value[item.id]) {
      const qrData = `${window.location.origin}/visit/${item.id}`;
      try {
        const url = await QRCode.toDataURL(qrData, { width: 128, margin: 0 });
        qrDataUrls.value[item.id] = url;
      } catch (e) { console.error(e); }
    }
  }
}, { deep: true, immediate: true });

const fetchDoorData = async () => {
  if (!token) return;
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId) return;

  loading.value = true;

  try {
    // Fetch doors
    const doorsRes = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Fetch visitor portals (BrandedPages)
    const portalsRes = await fetch(`${import.meta.env.VITE_API_URL}/items/BrandedPages?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (doorsRes.ok) {
      const dData = await doorsRes.json();
      doors.value = dData.data || [];
    }
    if (portalsRes.ok) {
      const pData = await portalsRes.json();
      portals.value = pData.data || [];
    }
  } catch (error) {
    console.error("Fetch doors/portals error:", error);
  } finally {
    loading.value = false;
  }
};

const showAddDoorForm = () => {
  selectedItem.value = null;
  showDialog.value = true;
};

const editItem = (item) => {
  selectedItem.value = item;
  showDialog.value = true;
};

const downloadQR = (item) => {
  const qrUrl = qrDataUrls.value[item.id];
  if (!qrUrl) return;
  const a = document.createElement("a");
  a.href = qrUrl;
  a.download = `Portal-${item.portalName.replace(/\s+/g, "_")}-QR.png`;
  a.click();
};

const openPortalUrl = (item) => {
  window.open(`${window.location.origin}/visit/${item.id}`, "_blank");
};

const deleteItem = async (item) => {
  const name = item.type === 'portal' ? item.portalName : item.doorName;
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  try {
    // 1. Delete portal if exists
    if (item.type === 'portal' && item.id) {
      await fetch(`${import.meta.env.VITE_API_URL}/items/BrandedPages/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    // 2. Delete door if exists
    if (item.doorId) {
      await fetch(`${import.meta.env.VITE_API_URL}/items/doors/${item.doorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    fetchDoorData();
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

onMounted(() => {
  fetchDoorData();
});
</script>

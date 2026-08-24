<template>
  <div class="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
    
    <!-- Consolidated Top Toolbar -->
    <div class="flex flex-nowrap items-center gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-150 dark:border-slate-800 shrink-0 overflow-x-auto min-w-0 custom-scrollbar">
      
      <!-- Micro KPIs removed as requested -->

      <!-- Filters & Actions -->
      <div class="flex items-center gap-3 flex-nowrap shrink-0 flex-1 justify-between">
        
        <!-- Left: Zone Filter -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Zone:</span>
            <select
              v-model="selectedZoneFilter"
              class="ae-input py-1 h-8 text-xs min-w-[110px] pr-8"
            >
              <option value="all">All Zones</option>
              <option
                v-for="zone in zones"
                :key="zone.id"
                :value="zone.id"
              >
                {{ zone.zoneName || zone.name }}
              </option>
            </select>
            <button
              type="button"
              @click="showAddZoneModal = true"
              class="h-8 px-2.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus class="w-3 h-3" />
              <span>New Zone</span>
            </button>
          </div>
        </div>

        <!-- Right: Search & Add Checkpoint -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="relative shrink-0 w-[180px]">
            <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search checkpoints..."
              class="ae-input w-full h-8 text-xs"
              style="padding-left: 2rem !important;"
            />
          </div>
          <button
            class="btn-primary text-xs flex items-center gap-1.5 h-8 px-3 shrink-0 whitespace-nowrap"
            @click="openCreateModal"
          >
            <Plus class="w-3.5 h-3.5" /> Add Checkpoint
          </button>
        </div>
        
      </div>
    </div>

    <!-- Main Table View -->
    <div class="flex-1 overflow-hidden flex flex-col min-h-0 relative">
      <div
        v-if="loading"
        class="flex justify-center items-center h-full flex-1"
      >
        <Loader2 class="w-8 h-8 animate-spin text-indigo-650" />
      </div>

      <div
        v-else-if="filteredCheckpoints.length === 0"
        class="flex flex-col items-center justify-center flex-1 py-16 text-center"
      >
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <MapPin class="w-8 h-8 text-slate-400" />
        </div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          No Checkpoints Found
        </h3>
        <p class="text-xs text-slate-550 max-w-xs leading-relaxed">
          Create checkpoints and assign them to zones. Standalone checkpoints can then be added into Patrol schedules.
        </p>
      </div>

      <!-- Responsive Checkpoints Data Table -->
      <div v-else class="flex-1 overflow-auto custom-scrollbar p-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-white/5 text-[11px] font-black uppercase text-slate-400 tracking-wider">
              <th class="pb-3 px-4">Checkpoint Name</th>
              <th class="pb-3 px-4">Zone</th>
              <th class="pb-3 px-4">Location</th>
              <th class="pb-3 px-4 text-center">Dwell Time</th>
              <th class="pb-3 px-4 text-center">Status</th>
              <th class="pb-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-white/5 text-xs">
            <tr
              v-for="cp in filteredCheckpoints"
              :key="cp.id"
              class="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
              @click="selectCheckpoint(cp)"
            >
              <!-- Name & ID -->
              <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                <div>{{ cp.name }}</div>
                <div class="text-[10px] font-mono text-slate-450 mt-0.5">{{ cp.checkpoint_id }}</div>
              </td>
              <!-- Zone -->
              <td class="py-3.5 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                  <Layers class="w-3.5 h-3.5 text-slate-400" />
                  {{ getZoneName(cp.zone) }}
                </span>
              </td>
              <!-- Location -->
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                <div class="text-[11px] font-semibold">Bldg: {{ cp.building_id || 'N/A' }}</div>
                <div class="text-[10px]">Floor: {{ cp.floor || 'N/A' }}</div>
              </td>
              <!-- Dwell Time -->
              <td class="py-3.5 px-4 text-center font-mono text-slate-500">
                {{ cp.dwell_time || 0 }} min
              </td>
              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors"
                  :class="cp.status !== 'inactive' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="cp.status !== 'inactive' ? 'bg-emerald-500' : 'bg-slate-450'" />
                  {{ cp.status !== 'inactive' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <!-- Actions (with QR) -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- QR Download -->
                  <div class="flex items-center gap-1 group/qr cursor-pointer" @click.stop="downloadCheckpointQr(cp)" title="Download QR">
                    <img v-if="qrDataUrls[cp.id]" :src="qrDataUrls[cp.id]" class="w-6 h-6 bg-white p-0.5 rounded border" />
                    <Download class="w-3.5 h-3.5 text-slate-400 group-hover/qr:text-indigo-500" />
                  </div>
                  <!-- Edit Button -->
                  <button
                    class="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    title="Edit Details"
                    @click.stop="selectCheckpoint(cp)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Add/Edit Checkpoint Drawer/Modal ── -->
    <Teleport to="body">
      <div
        v-if="editingCp"
        class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 w-full max-w-md overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <MapPin class="w-4 h-4 text-indigo-500" />
              <span>{{ isNew ? 'Add Checkpoint' : 'Edit Checkpoint' }}</span>
            </h3>
            <button
              class="text-slate-400 hover:text-slate-655 transition-colors"
              @click="closeEditor"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form Area -->
          <div class="p-6 space-y-4 text-left max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Checkpoint Name *</label>
              <input
                v-model="editingCp.name"
                type="text"
                class="ae-input w-full"
                placeholder="e.g. Server Room Entrance"
              />
            </div>

            <!-- Zone Assignment -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Zone Assignment *</label>
                <button
                  type="button"
                  @click="showAddZoneModal = true"
                  class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + New Zone
                </button>
              </div>
              <select
                v-model="editingCp.zone"
                @change="handleCpZoneChange"
                class="ae-input w-full pr-8"
              >
                <option :value="null" disabled>Select target zone...</option>
                <option
                  v-for="zone in zones"
                  :key="zone.id"
                  :value="zone.id"
                >
                  {{ zone.zoneName || zone.name }}
                </option>
                <option value="__NEW_ZONE__" class="font-bold text-indigo-600">+ Create New Zone...</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Building</label>
                <input
                  v-model="editingCp.building_id"
                  type="text"
                  class="ae-input w-full"
                  placeholder="e.g. Tower B"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Floor</label>
                <input
                  v-model="editingCp.floor"
                  type="text"
                  class="ae-input w-full"
                  placeholder="e.g. 2nd Floor"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Dwell Time (Minutes)</label>
                <input
                  v-model.number="editingCp.dwell_time"
                  type="number"
                  min="0"
                  class="ae-input w-full"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <button
                  type="button"
                  class="w-full h-9 rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs font-bold"
                  :class="editingCp.status !== 'inactive' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'"
                  @click="editingCp.status = editingCp.status !== 'inactive' ? 'inactive' : 'active'"
                >
                  <span class="w-2 h-2 rounded-full" :class="editingCp.status !== 'inactive' ? 'bg-emerald-500' : 'bg-slate-450'" />
                  {{ editingCp.status !== 'inactive' ? 'Active' : 'Inactive' }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">NFC UID (Optional)</label>
              <input
                v-model="editingCp.nfc_uid"
                type="text"
                class="ae-input w-full font-mono"
                placeholder="e.g. 04:A2:3E:C5"
              />
            </div>

            <!-- Print Badge Preview Area -->
            <div v-if="!isNew" class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <canvas ref="qrCanvas" class="w-12 h-12 bg-white rounded border" />
                <div>
                  <p class="text-[10px] font-extrabold text-slate-800 dark:text-slate-100">Badge QR Preview</p>
                  <p class="text-[9px] text-slate-450 mt-0.5">Use on checkpoints rounds</p>
                </div>
              </div>
              <button
                class="btn-secondary py-1 px-3 text-[10px]"
                @click="printBadge"
              >
                Print Badge
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 shrink-0">
            <button
              v-if="!isNew"
              class="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
              @click="deleteCheckpoint"
            >
              <Trash2 class="w-4 h-4" /> Delete
            </button>
            <div v-else />
            <div class="flex gap-2">
              <button
                class="btn-secondary py-1.5 text-xs"
                @click="closeEditor"
              >
                Cancel
              </button>
              <button
                class="btn-primary py-1.5 text-xs flex items-center gap-1.5"
                :disabled="saving || !editingCp.name"
                @click="saveCheckpoint"
              >
                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                {{ saving ? 'Saving...' : 'Save Checkpoint' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Add Zone Modal ── -->
    <Teleport to="body">
      <div
        v-if="showAddZoneModal"
        class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-150">
              Create New Zone
            </h3>
            <button
              class="text-slate-400 hover:text-slate-655"
              @click="showAddZoneModal = false; newZoneName = ''"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Zone Name</label>
              <input
                v-model="newZoneName"
                type="text"
                class="ae-input w-full"
                placeholder="e.g. Block A Warehouse"
                autofocus
                @keydown.enter="createNewZone"
              />
            </div>
          </div>
          <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              class="btn-secondary py-1 text-xs"
              @click="showAddZoneModal = false; newZoneName = ''"
            >
              Cancel
            </button>
            <button
              class="btn-primary py-1 text-xs"
              :disabled="creatingZone || !newZoneName.trim()"
              @click="createNewZone"
            >
              {{ creatingZone ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {
  Search, Plus, MapPin, Loader2, X, Trash2, Wifi, Clock,
  ArrowRight, Download, Check, AlertCircle, Settings, Layers, Building2, Pencil
} from 'lucide-vue-next';
import QRCode from 'qrcode';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { authService } from '@/services/authService';

const checkpoints = ref([]);
const zones = ref([]);
const checkpointGroups = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const selectedZoneFilter = ref('all');
const kpiFilter = ref('all');
const qrDataUrls = ref({});
const clonedCheckpoints = ref([]);

const getAssignedPatrolCount = (cp) => {
  return getLinkedPatrolNamesList(cp).length;
};

const getLinkedPatrolNamesList = (cp) => {
  if (!cp || !cp.checkpoint_id) return [];
  const matches = clonedCheckpoints.value.filter(c => {
    const isMatch = String(c.checkpoint_id) === String(cp.checkpoint_id);
    const groupExists = checkpointGroups.value.some(g => String(g.id) === String(c.group_id));
    return isMatch && groupExists;
  });
  
  const names = matches.map(m => {
    const g = checkpointGroups.value.find(group => String(group.id) === String(m.group_id));
    return g ? g.name : 'Active Route';
  });
  return [...new Set(names)];
};

// Modals State
const editingCp = ref(null);
const selectedCp = ref(null);

watch(checkpoints, async (newList) => {
  const tenantId = authService.getTenantId();
  for (const cp of newList) {
    if (qrDataUrls.value[cp.id]) continue;
    const rawString = `${cp.checkpoint_id}-${tenantId}-AccessEasy2026`;
    const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
    const qrData = `ACPT::${cp.checkpoint_id}::${signature}`;
    try {
      const url = await QRCode.toDataURL(qrData, { width: 64, margin: 0 });
      qrDataUrls.value[cp.id] = url;
    } catch (e) { console.error(e); }
  }
}, { deep: true });
const showAddZoneModal = ref(false);
const newZoneName = ref('');
const creatingZone = ref(false);

const qrCanvas = ref(null);

const isNew = computed(() => editingCp.value && !editingCp.value.id);

const filteredCheckpoints = computed(() => {
  let list = checkpoints.value;
  if (selectedZoneFilter.value !== 'all') {
    list = list.filter(c => {
      const zId = typeof c.zone === 'object' && c.zone ? c.zone.id : c.zone;
      return zId && String(zId) === String(selectedZoneFilter.value);
    });
  }
  if (kpiFilter.value === 'active') {
    list = list.filter(c => c.status !== 'inactive');
  } else if (kpiFilter.value === 'inactive') {
    list = list.filter(c => c.status === 'inactive');
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.checkpoint_id.toLowerCase().includes(q));
  }
  return list;
});

const loadCheckpoints = async () => {
  loading.value = true;
  try {
    const list = await patrolService.getMasterCheckpoints();
    if (list) {
      list.forEach(cp => {
        const match = cp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
        cp.zone = match ? Number(match[1]) : null;
        if (cp.instructions) {
          cp.instructions = cp.instructions.replace(/__ZONE_ASSIGNMENT__:\d+\s*/g, '');
        }
      });
    }
    checkpoints.value = list || [];
    
    zones.value = await zoneService.fetchZones();
    checkpointGroups.value = await patrolService.fetchCheckpointGroups();

    // Fetch cloned checkpoints
    const tenantId = authService.getTenantId();
    const clonedRes = await authService.protectedApi.get(
      `/items/checkpoints?filter[tenant][_eq]=${tenantId}&filter[group_id][_nnull]=true&limit=500`
    );
    clonedCheckpoints.value = clonedRes.data?.data || [];
  } catch (err) {
    console.error('Failed to load checkpoints:', err);
  } finally {
    loading.value = false;
  }
};

const getZoneName = (zoneVal) => {
  const zoneId = typeof zoneVal === 'object' && zoneVal ? zoneVal.id : zoneVal;
  if (!zoneId) return 'Unassigned';
  const z = zones.value.find(z => String(z.id) === String(zoneId));
  return z ? z.zoneName : 'Unassigned';
};

const getLinkedGroups = (cp) => {
  const cpZoneId = typeof cp.zone === 'object' && cp.zone ? cp.zone.id : cp.zone;
  return checkpointGroups.value.filter(g => {
    return g.zone_id && String(g.zone_id) === String(cpZoneId);
  });
};

const openCreateModal = () => {
  editingCp.value = {
    checkpoint_id: 'CP' + Math.floor(1000 + Math.random() * 9000),
    name: '',
    zone: selectedZoneFilter.value !== 'all' ? selectedZoneFilter.value : null,
    building_id: '',
    floor: '',
    nfc_uid: '',
    dwell_time: 0,
    instructions: '',
    status: 'active',
    x: 0,
    y: 0
  };
};

const selectCheckpoint = (cp) => {
  selectedCp.value = cp;
  editingCp.value = { ...cp };
};

const closeEditor = () => {
  editingCp.value = null;
  selectedCp.value = null;
};

const saveCheckpoint = async () => {
  if (!editingCp.value.name) return;
  saving.value = true;
  try {
    const payload = { ...editingCp.value };
    let cleanInst = payload.instructions || '';
    cleanInst = cleanInst.replace(/__ZONE_ASSIGNMENT__:\d+\s*/g, '');
    if (payload.zone) {
      payload.instructions = `__ZONE_ASSIGNMENT__:${payload.zone} ${cleanInst}`.trim();
    } else {
      payload.instructions = cleanInst.trim();
    }
    delete payload.zone;

    const updatedList = await patrolService.saveMasterCheckpoint(payload);
    if (updatedList) {
      updatedList.forEach(cp => {
        const match = cp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
        cp.zone = match ? Number(match[1]) : null;
        if (cp.instructions) {
          cp.instructions = cp.instructions.replace(/__ZONE_ASSIGNMENT__:\d+\s*/g, '');
        }
      });
    }
    checkpoints.value = updatedList || [];
    closeEditor();
  } catch (err) {
    console.error(`Failed to save checkpoint: ${err.message}`);
  } finally {
    saving.value = false;
  }
};

const toggleCheckpointStatus = async (cp) => {
  const newStatus = cp.status === 'inactive' ? 'active' : 'inactive';
  try {
    await patrolService.saveMasterCheckpoint({ ...cp, status: newStatus });
    cp.status = newStatus;
  } catch (e) {
    console.error('Failed to toggle status', e);
  }
};

const deleteCheckpoint = async () => {
  if (!editingCp.value || !editingCp.value.id) return;
  if (!confirm(`Are you sure you want to delete ${editingCp.value.name}?`)) return;
  
  saving.value = true;
  try {
    const updatedList = await patrolService.deleteMasterCheckpoint(editingCp.value.id);
    checkpoints.value = updatedList || [];
    closeEditor();
  } catch (err) {
    console.error(`Failed to delete checkpoint: ${err.message}`);
  } finally {
    saving.value = false;
  }
};

const handleCpZoneChange = () => {
  if (editingCp.value && editingCp.value.zone === '__NEW_ZONE__') {
    editingCp.value.zone = null;
    showAddZoneModal.value = true;
  }
};

const createNewZone = async () => {
  if (!newZoneName.value.trim()) return;
  creatingZone.value = true;
  try {
    const created = await zoneService.createZone({ zoneName: newZoneName.value.trim(), name: newZoneName.value.trim() });
    zones.value = await zoneService.fetchZones();
    if (editingCp.value) {
      editingCp.value.zone = created?.id || zones.value[zones.value.length - 1]?.id || null;
    }
    showAddZoneModal.value = false;
    newZoneName.value = '';
  } catch (e) {
    console.error('Failed to create zone', e);
  } finally {
    creatingZone.value = false;
  }
};

const downloadCheckpointQr = async (cp) => {
  const tenantId = authService.getTenantId();
  const rawString = `${cp.checkpoint_id}-${tenantId}-AccessEasy2026`;
  const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
  const qrData = `ACPT::${cp.checkpoint_id}::${signature}`;
  try {
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 400, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' }
    });
    const link = document.createElement('a');
    link.download = `${cp.name.replace(/\s+/g, '-')}-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  }
};

// Generate QR Code Preview on canvas
watch([editingCp, qrCanvas], async ([cp, canvas]) => {
  if (!cp || !canvas || isNew.value) return;
  await nextTick();
  const tenantId = authService.getTenantId();
  const rawString = `${cp.checkpoint_id}-${tenantId}-AccessEasy2026`;
  const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
  const qrData = `ACPT::${cp.checkpoint_id}::${signature}`;
  try {
    await QRCode.toCanvas(canvas, qrData, {
      width: 48,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch (e) { console.error('QR generation failed', e); }
}, { immediate: false });

const printBadge = async () => {
  if (!editingCp.value) return;
  
  const tenantId = authService.getTenantId();
  const rawString = `${editingCp.value.checkpoint_id}-${tenantId}-AccessEasy2026`;
  const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
  const qrData = `ACPT::${editingCp.value.checkpoint_id}::${signature}`;
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 200, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch {}

  const html = `
  <html>
    <head>
      <title>Checkpoint Badge - ${editingCp.value.name}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: monospace, system-ui, sans-serif; background: #fff; width: 58mm; margin: 0 auto; color: #000; }
        .card { width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px 0; }
        .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; border-bottom: 1px dashed #000; width: 100%; padding-bottom: 4px; margin-bottom: 8px; }
        .qr { width: 45mm; height: 45mm; margin-bottom: 8px; }
        .name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .id { font-size: 11px; margin-bottom: 8px; }
        .meta { width: 100%; display: flex; justify-content: space-between; border-top: 1px dashed #000; padding-top: 8px; margin-bottom: 8px; }
        .meta-item { display: flex; flex-direction: column; text-align: center; width: 50%; }
        .meta-item label { font-size: 10px; text-transform: uppercase; }
        .meta-item span { font-weight: bold; font-size: 12px; }
        @media print { body { width: 58mm; margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">AccessEasy<div style="font-size:10px;font-weight:normal;margin-top:2px;">Standalone Checkpoint</div></div>
        ${qrDataUrl ? `<img src="${qrDataUrl}" class="qr" />` : ''}
        <div class="name">${editingCp.value.name}</div>
        <div class="id">${editingCp.value.checkpoint_id}</div>
        <div class="meta">
          <div class="meta-item"><label>Floor</label><span>${editingCp.value.floor || '—'}</span></div>
          <div class="meta-item"><label>Building</label><span>${editingCp.value.building_id || '—'}</span></div>
        </div>
      </div>
      <script>window.onload = () => { window.print(); window.close(); };<\/script>
    </body>
  </html>`;
  
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
};

onMounted(() => {
  loadCheckpoints();
});
</script>

<style scoped>
.tooltip-trigger:hover .tooltip-content {
  display: block !important;
}
</style>

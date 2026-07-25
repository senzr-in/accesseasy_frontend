<template>
  <div class="h-full flex flex-col md:flex-row overflow-hidden bg-white dark:bg-slate-900 rounded-b-xl">
    <!-- Left: Config Panel (The Route Sequence) -->
    <div class="w-full md:w-[360px] bg-white dark:bg-slate-900 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 shrink-0">
      <!-- Tab Switcher -->
      <div class="flex bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          class="flex-1 py-2.5 text-xs font-semibold transition-all border-b-2"
          :class="rightTab === 'sequence' ? 'text-indigo-600 border-indigo-600 bg-white dark:bg-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600 dark:text-slate-300'"
          @click="rightTab = 'sequence'"
        >
          <Route class="w-3.5 h-3.5 inline mr-1" /> Route Sequence
        </button>
        <button
          class="flex-1 py-2.5 text-xs font-semibold transition-all border-b-2"
          :class="rightTab === 'qr' ? 'text-indigo-600 border-indigo-600 bg-white dark:bg-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600 dark:text-slate-300'"
          @click="rightTab = 'qr'"
        >
          <QrCode class="w-3.5 h-3.5 inline mr-1" /> Route QRs
        </button>
      </div>

      <!-- ═══ SEQUENCE TAB ═══ -->
      <div
        v-show="rightTab === 'sequence'"
        class="flex-1 flex flex-col min-h-0"
      >
        <div class="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Current Group Sequence
            </h3>
            <p
              v-if="selectedGroupObj"
              class="text-[10px] text-slate-400 mt-0.5"
            >
              {{ selectedGroupObj.name }}
            </p>
          </div>
          <span class="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{{ checkpoints.length }} stops</span>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5 pt-4 relative">
          <div
            v-if="!selectedPatrolId"
            class="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/80 dark:bg-slate-900/80 z-20 backdrop-blur-[2px]"
          >
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
              <Route class="w-6 h-6 text-indigo-500" />
            </div>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Select a Group
            </p>
            <p class="text-xs text-slate-400 mt-1 max-w-[200px]">
              Choose a group from the dropdown or create a new one to start building.
            </p>
          </div>
          
          <div
            v-else-if="!checkpoints.length"
            class="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-4">
              <MapPin class="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Route is Empty
            </p>
            <p class="text-xs text-slate-400 mt-1 max-w-[200px]">
              Click the <Plus class="w-3.5 h-3.5 inline text-indigo-500" /> buttons on the right to build your sequence.
            </p>
          </div>

          <div
            v-else
            class="relative pl-7 pb-4"
          >
            <!-- Timeline vertical line connecting items -->
            <div class="absolute left-[11px] top-4 bottom-4 w-0.5 bg-indigo-100 dark:bg-indigo-900/30 z-0" />
            
            <TransitionGroup
              name="sequence-list"
              tag="div"
              class="space-y-4 relative z-10 w-full"
            >
              <div
                v-for="(cp, idx) in checkpoints"
                :key="cp.id"
                draggable="true"
                class="group relative flex items-center gap-2.5 w-full rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-0.5"
                @dragstart="onDragStart(idx, $event)"
                @dragenter.prevent="onDragEnter(idx)"
                @dragover.prevent
                @drop.prevent="onDrop(idx)"
                @dragend="onDragEnd"
              >
                <!-- Drag Handle indicator -->
                <div class="flex flex-col gap-0.5 pl-3 text-slate-350 dark:text-slate-600 select-none cursor-grab">
                  <div class="flex gap-0.5"><span class="w-1 h-1 rounded-full bg-current" /><span class="w-1 h-1 rounded-full bg-current" /></div>
                  <div class="flex gap-0.5"><span class="w-1 h-1 rounded-full bg-current" /><span class="w-1 h-1 rounded-full bg-current" /></div>
                  <div class="flex gap-0.5"><span class="w-1 h-1 rounded-full bg-current" /><span class="w-1 h-1 rounded-full bg-current" /></div>
                </div>

                <!-- Stop Badge -->
                <div class="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-100 dark:border-indigo-900/50">
                  {{ idx + 1 }}
                </div>
                
                <!-- Info -->
                <div class="flex-1 py-3 pr-2 min-w-0">
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ cp.name }}
                  </p>
                  <p class="text-[9px] text-slate-400 font-mono mt-0.5">
                    {{ cp.checkpoint_id }}
                  </p>
                </div>

                <!-- Move controls (mobile fallback/group-hover) -->
                <div class="flex items-center gap-1.5 pr-3 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="flex flex-col">
                    <button
                      :disabled="idx === 0"
                      class="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-20 cursor-pointer hover:bg-indigo-50 rounded transition-colors"
                      @click.stop="moveUp(idx)"
                    >
                      <ChevronUp class="w-3.5 h-3.5" />
                    </button>
                    <button
                      :disabled="idx === checkpoints.length - 1"
                      class="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-20 cursor-pointer hover:bg-indigo-50 rounded transition-colors"
                      @click.stop="moveDown(idx)"
                    >
                      <ChevronDown class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div class="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-1" />
                  <button
                    class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                    title="Remove Stop"
                    @click.stop="removeCheckpointFromGroup(cp)"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- ═══ QR TAB ═══ -->
      <div
        v-show="rightTab === 'qr'"
        class="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900/50"
      >
        <div class="px-4 py-3 shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <QrCode class="w-4 h-4 text-indigo-500" /> Route Badges
            </h3>
            <p class="text-[10px] text-slate-400 mt-0.5">
              Physical QRs for {{ selectedGroupObj?.name || 'this route' }}
            </p>
          </div>
          <button
            class="btn-primary text-xs shadow-lg shadow-indigo-500/20"
            :disabled="!checkpoints.length"
            @click="printAllCheckpoints"
          >
            <Printer class="w-3.5 h-3.5 mr-1" />
            Print ({{ checkpoints.length }})
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div
            v-if="!checkpoints.length"
            class="text-center text-slate-400 text-xs py-10 flex flex-col items-center"
          >
            <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <QrCode class="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            Route is empty.
          </div>
          
          <TransitionGroup
            v-else
            name="fade-list"
            tag="div"
            class="grid grid-cols-2 gap-3 pb-4"
          >
            <div 
              v-for="(cp, idx) in checkpoints" 
              :key="'qr-'+cp.id+'-'+idx" 
              class="relative flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 group hover:-translate-y-0.5 overflow-hidden"
            >
              <div class="absolute top-0 left-0 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-1 rounded-br-lg border-b border-r border-indigo-100 dark:border-indigo-500/30 z-10">
                #{{ idx + 1 }}
              </div>
              
              <div class="w-20 h-20 bg-white p-1 rounded-lg border border-slate-100 dark:border-slate-600 mb-3 mt-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img
                  v-if="qrDataUrls[cp.checkpoint_id]"
                  :src="qrDataUrls[cp.checkpoint_id]"
                  class="w-full h-full object-contain mix-blend-multiply"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"
                >
                  <Loader2 class="w-4 h-4 animate-spin" />
                </div>
              </div>
              
              <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 text-center line-clamp-1 w-full">
                {{ cp.name }}
              </p>
              <p class="text-[9px] text-slate-400 font-mono mt-0.5 tracking-wider">
                {{ cp.checkpoint_id }}
              </p>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Right: Master Checkpoint Library Picker (swapped to Right) -->
    <div class="flex-1 relative bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-800 flex flex-col min-h-[350px]">
      <!-- Top toolbar (Group Selection) -->
      <div class="flex flex-wrap justify-between items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div class="flex items-center gap-3">
          <label class="ae-section-label">Checkpoint Group (Route)</label>
          <div class="flex gap-2">
            <select
              v-model="selectedPatrolId"
              class="ae-select w-52"
            >
              <option
                v-for="grp in checkpointGroups"
                :key="grp.id"
                :value="grp.id"
              >
                {{ grp.name || `Group ${grp.id}` }}
              </option>
            </select>
            <button
              class="btn-primary px-3 text-xs flex items-center gap-1 whitespace-nowrap"
              title="Create New Checkpoint Group"
              @click="showCreatePrompt = true"
            >
              <Plus class="w-4 h-4 shrink-0" />
              <span>New Group</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Library List -->
      <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 shrink-0">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Available Checkpoints
        </h3>
        <p class="text-[10px] text-slate-500">
          Click to add to the selected group sequence on the left.
        </p>
        
        <div class="relative mt-2">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search checkpoints..."
            class="ae-input w-64 text-xs"
            style="padding-left: 2.5rem;"
          >
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div
          v-if="loadingLibrary"
          class="flex justify-center p-8"
        >
          <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
        </div>
        <div
          v-else-if="filteredMasterCheckpoints.length === 0"
          class="flex flex-col items-center justify-center h-40 text-center"
        >
          <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Search class="w-5 h-5 text-slate-400" />
          </div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            No checkpoints found.
          </p>
        </div>
        <TransitionGroup
          v-else
          name="fade-list"
          tag="div"
          class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4"
        >
          <div
            v-for="cp in filteredMasterCheckpoints"
            :key="cp.id"
            class="group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-3.5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 active:scale-[0.98] flex flex-col gap-1 overflow-hidden"
            @click="addCheckpointToGroup(cp)"
          >
            <!-- Decorative accent line -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div class="flex justify-between items-start">
              <p class="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight pr-6">
                {{ cp.name }}
              </p>
              <button class="absolute right-3 top-3.5 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded w-max mt-1 border border-slate-100 dark:border-slate-800">
              {{ cp.checkpoint_id }}
            </p>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Create Group Modal -->
    <Teleport to="body">
      <div
        v-if="showCreatePrompt"
        class="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      >
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
          <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin class="w-4 h-4 text-indigo-600" /> New Checkpoint Group
            </h3>
            <button
              class="btn-icon"
              @click="showCreatePrompt = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="ae-section-label mb-1 block">Group Name</label>
              <input
                v-model="newGroupName"
                type="text"
                class="ae-input w-full"
                placeholder="e.g. Night Patrol Route"
                autofocus
              >
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="ae-section-label mb-1 block">Schedule Frequency</label>
                <select
                  v-model="newGroupFrequency"
                  class="ae-select w-full"
                >
                  <option value="hourly">
                    Hourly
                  </option>
                  <option value="shift">
                    Once per Shift
                  </option>
                  <option value="daily">
                    Daily
                  </option>
                  <option value="custom">
                    Custom Time
                  </option>
                </select>
              </div>
              <div>
                <label class="ae-section-label mb-1 block">Grace Period (mins)</label>
                <input
                  v-model.number="newGroupGrace"
                  type="number"
                  class="ae-input w-full"
                  placeholder="15"
                >
              </div>
            </div>
            <div>
              <label class="ae-section-label mb-1 block">Assign to Zone (Optional)</label>
              <select
                v-model="newGroupZone"
                class="ae-select w-full"
              >
                <option value="">
                  No specific zone
                </option>
                <option
                  v-for="z in zones"
                  :key="z.id"
                  :value="z.id"
                >
                  {{ z.zoneName }}
                </option>
              </select>
            </div>
            <div class="flex gap-3 justify-end mt-2">
              <button
                class="btn-ghost text-xs"
                @click="showCreatePrompt = false"
              >
                Cancel
              </button>
              <button
                class="btn-primary text-xs"
                :disabled="isCreating || !newGroupName.trim()"
                @click="createGroup"
              >
                <Loader2
                  v-if="isCreating"
                  class="w-3.5 h-3.5 animate-spin mr-1"
                />
                <Plus
                  v-else
                  class="w-3.5 h-3.5 mr-1"
                />
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Printer, ChevronUp, ChevronDown, QrCode, Route, Plus, X, Loader2, MapPin, Search, GripVertical } from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { authService } from '@/services/authService';
import QRCode from 'qrcode';

const selectedPatrolId = ref(null);
const checkpoints = ref([]); // Current group's sequence
const masterCheckpoints = ref([]); // Library
const rightTab = ref('sequence');
const qrDataUrls = ref({});

// Drag and drop state
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const checkpointGroups = ref([]);
const showCreatePrompt = ref(false);
const newGroupName = ref('');
const newGroupZone = ref('');
const newGroupFrequency = ref('shift');
const newGroupGrace = ref(15);
const zones = ref([]);
const isCreating = ref(false);

const loadingLibrary = ref(false);
const searchQuery = ref('');

const selectedGroupObj = computed(() => checkpointGroups.value.find(g => g.id === selectedPatrolId.value));

const filteredMasterCheckpoints = computed(() => {
  if (!searchQuery.value) return masterCheckpoints.value;
  const q = searchQuery.value.toLowerCase();
  return masterCheckpoints.value.filter(c => c.name.toLowerCase().includes(q) || c.checkpoint_id.toLowerCase().includes(q));
});

const loadGroups = async () => {
  const groups = await patrolService.fetchCheckpointGroups();
  checkpointGroups.value = groups;
  if (groups.length > 0 && !selectedPatrolId.value) {
    selectedPatrolId.value = groups[0].id;
  }
};

const loadMasterCheckpoints = async () => {
  loadingLibrary.value = true;
  try {
    masterCheckpoints.value = await patrolService.getMasterCheckpoints();
  } catch (e) {
    console.error(e);
  } finally {
    loadingLibrary.value = false;
  }
};

const fetchCheckpoints = async () => {
  if (!selectedPatrolId.value) {
    checkpoints.value = [];
    return;
  }
  try {
    checkpoints.value = await patrolService.getCheckpointsForRoute(selectedPatrolId.value);
  } catch (err) { console.error(err); }
};

watch(selectedPatrolId, fetchCheckpoints);

const createGroup = async () => {
  if (!newGroupName.value.trim()) return;
  isCreating.value = true;
  try {
    const newGrp = await patrolService.createCheckpointGroup({
      name: newGroupName.value.trim(),
      zone_id: newGroupZone.value || null,
      frequency: newGroupFrequency.value,
      grace_period: newGroupGrace.value
    });
    await loadGroups();
    selectedPatrolId.value = newGrp.id;
    showCreatePrompt.value = false;
    newGroupName.value = '';
    newGroupZone.value = '';
    newGroupFrequency.value = 'shift';
    newGroupGrace.value = 15;
  } catch (err) {
    alert(`Failed to create checkpoint group: ${err.message}`);
  } finally {
    isCreating.value = false;
  }
};

// Add a clone of the master checkpoint to the current group
const addCheckpointToGroup = async (masterCp) => {
  if (!selectedPatrolId.value) {
    alert("Please select or create a Checkpoint Group first.");
    return;
  }
  
  // Clone the data, stripping out the DB id so it creates a new record
  const clone = { ...masterCp };
  delete clone.id; 
  clone.group_id = selectedPatrolId.value;
  clone.status = 'pending';
  
  try {
    const list = await patrolService.saveCheckpoint(selectedPatrolId.value, clone);
    checkpoints.value = [...list];
  } catch (err) {
    console.error(err);
  }
};

const removeCheckpointFromGroup = async (cp) => {
  if (!selectedPatrolId.value) return;
  try {
    const list = await patrolService.deleteCheckpoint(selectedPatrolId.value, cp.id);
    checkpoints.value = [...list];
  } catch (err) {
    console.error(err);
  }
};

const moveUp = async (idx) => {
  if (idx === 0) return;
  const list = [...checkpoints.value];
  const temp = list[idx - 1];
  list[idx - 1] = list[idx];
  list[idx] = temp;
  
  try {
    const updated = await patrolService.reorderCheckpoints(selectedPatrolId.value, list);
    checkpoints.value = [...updated];
  } catch (err) { console.error(err); }
};

const moveDown = async (idx) => {
  if (idx === checkpoints.value.length - 1) return;
  const list = [...checkpoints.value];
  const temp = list[idx + 1];
  list[idx + 1] = list[idx];
  list[idx] = temp;
  
  try {
    const updated = await patrolService.reorderCheckpoints(selectedPatrolId.value, list);
    checkpoints.value = [...updated];
  } catch (err) { console.error(err); }
};

// Drag and Drop Handlers
const onDragStart = (idx, event) => {
  draggedIndex.value = idx;
  event.dataTransfer.effectAllowed = 'move';
};

const onDragEnter = (idx) => {
  if (draggedIndex.value !== null) {
    dragOverIndex.value = idx;
  }
};

const onDrop = async (idx) => {
  if (draggedIndex.value === null || draggedIndex.value === idx) {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    return;
  }
  
  const list = [...checkpoints.value];
  const item = list.splice(draggedIndex.value, 1)[0];
  list.splice(idx, 0, item);
  
  checkpoints.value = list;
  draggedIndex.value = null;
  dragOverIndex.value = null;

  try {
    const updated = await patrolService.reorderCheckpoints(selectedPatrolId.value, checkpoints.value);
    checkpoints.value = [...updated];
  } catch (err) { console.error(err); }
};

const onDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const generateQrDataUrl = async (cp) => {
  try {
    const tenantId = authService.getTenantId();
    const rawString = `${cp.checkpoint_id}-${tenantId}-AccessEasy2026`;
    const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
    const qrData = `ACPT::${cp.checkpoint_id}::${signature}`;
    return await QRCode.toDataURL(qrData, {
      width: 200, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
};

watch(checkpoints, async (newList) => {
  const map = { ...qrDataUrls.value };
  let changed = false;
  for (const cp of newList) {
    if (!map[cp.checkpoint_id]) {
      map[cp.checkpoint_id] = await generateQrDataUrl(cp);
      changed = true;
    }
  }
  if (changed) {
    qrDataUrls.value = map;
  }
}, { deep: true, immediate: true });

const printAllCheckpoints = async () => {
  if (!checkpoints.value.length) return;
  const cards = await Promise.all(
    checkpoints.value.map(async (cp, i) => ({
      cp,
      seq: i + 1,
      qr: await generateQrDataUrl(cp)
    }))
  );
  const win = window.open('', '_blank');
  win.document.write(buildPrintHtml(cards));
  win.document.close();
};

const buildPrintHtml = (cards) => `
  <html>
    <head>
      <title>Checkpoint Route Badges — ${selectedPatrolId.value}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: monospace, system-ui, sans-serif; background: #fff; width: 58mm; margin: 0 auto; color: #000; }
        .card { width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; page-break-after: always; padding: 10px 0; }
        .brand { font-size: 14px; font-weight: 800; text-transform: uppercase; border-bottom: 1px dashed #000; width: 100%; padding-bottom: 4px; margin-bottom: 8px; }
        .sub-brand { font-size: 10px; font-weight: normal; margin-top: 2px; }
        .seq { font-size: 12px; font-weight: bold; margin-bottom: 8px; border: 1px solid #000; padding: 2px 8px; border-radius: 4px; }
        .qr { width: 45mm; height: 45mm; margin-bottom: 8px; }
        .name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .id { font-size: 11px; margin-bottom: 8px; }
        .meta { width: 100%; display: flex; justify-content: space-between; border-top: 1px dashed #000; padding-top: 8px; margin-bottom: 8px; }
        .meta-item { display: flex; flex-direction: column; text-align: center; width: 50%; }
        .meta-item label { font-size: 10px; text-transform: uppercase; }
        .meta-item span { font-weight: bold; font-size: 12px; }
        .footer { font-size: 10px; text-align: center; border-top: 1px dashed #000; padding-top: 8px; width: 100%; }
        @media print { 
          body { width: 58mm; margin: 0; padding: 0; }
          .card { page-break-after: always; padding-bottom: 5mm; } 
        }
      </style>
    </head>
    <body>
      ${cards.map(({ cp, seq, qr }) => `
        <div class="card">
          <div class="brand">AccessEasy<div class="sub-brand">Route Checkpoint</div></div>
          <div class="seq">Stop #${seq}</div>
          ${qr ? `<img src="${qr}" class="qr" />` : '<div class="qr" style="border:1px solid #000;"></div>'}
          <div class="name">${cp.name}</div>
          <div class="id">${cp.checkpoint_id}</div>
          <div class="meta">
            <div class="meta-item"><label>Floor</label><span>${cp.floor || '—'}</span></div>
            <div class="meta-item"><label>Building</label><span>${cp.building_id || '—'}</span></div>
          </div>
          <div class="footer">Scan QR to confirm<br>checkpoint</div>
        </div>
      `).join('')}
      <script>window.onload = () => { window.print(); window.close(); };<\/script>
    </body>
  </html>
`;

onMounted(async () => {
  await loadGroups();
  await loadMasterCheckpoints();
  if (selectedPatrolId.value) fetchCheckpoints();
  
  try {
    zones.value = await zoneService.fetchZones();
  } catch (e) {
    console.error('Failed to load zones:', e);
  }
});
</script>

<style scoped>
/* Left panel grid transition */
.fade-list-move,
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.95);
}
.fade-list-leave-active {
  position: absolute;
}

/* Right panel sequence timeline transition */
.sequence-list-move,
.sequence-list-enter-active,
.sequence-list-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sequence-list-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.9);
}
.sequence-list-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.9);
}
.sequence-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>

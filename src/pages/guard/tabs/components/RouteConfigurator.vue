<template>
  <div class="h-full flex flex-col md:flex-row overflow-hidden bg-white rounded-b-xl">

    <!-- Left: Canvas Editor -->
    <div class="flex-1 relative bg-slate-50 border-r border-slate-200 flex flex-col min-h-[350px]">
      <!-- Top toolbar -->
      <div class="flex flex-wrap justify-between items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <div class="flex items-center gap-3">
          <label class="ae-section-label">Route</label>
          <div class="flex gap-2">
            <select v-model="selectedPatrolId" class="ae-select w-52">
              <option v-for="grp in checkpointGroups" :key="grp.id" :value="grp.id">
                {{ grp.name || `Group ${grp.id}` }}
              </option>
            </select>
            <button @click="showCreatePrompt = true" class="btn-primary px-3 text-xs flex items-center gap-1 whitespace-nowrap" title="Create New Checkpoint Group">
              <Plus class="w-4 h-4 shrink-0" />
              <span>Create Checkpoint Group</span>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Click map to place checkpoint
          </span>
        </div>
      </div>

      <!-- SVG Canvas -->
      <div
        class="flex-1 relative overflow-hidden flex items-center justify-center cursor-pointer select-none bg-white"
        @click="handleCanvasClick"
      >
        <!-- Grid pattern -->
        <div
          class="absolute inset-0 pointer-events-none opacity-30"
          :style="{
            backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }"
        />

        <svg class="w-full h-full" viewBox="0 0 600 400">
          <!-- Route lines between checkpoints -->
          <g :transform="`translate(300, 200)`">
            <line
              v-for="(cp, i) in checkpoints.slice(1)"
              :key="`line-${i}`"
              :x1="checkpoints[i].x * 2.2"
              :y1="-checkpoints[i].y * 2.2"
              :x2="cp.x * 2.2"
              :y2="-cp.y * 2.2"
              stroke="#CBD5E1"
              stroke-width="1.5"
              stroke-dasharray="4 3"
            />

            <!-- Draft route line (from last checkpoint to draft checkpoint) -->
            <line
              v-if="draftCp && checkpoints.length > 0"
              :x1="checkpoints[checkpoints.length - 1].x * 2.2"
              :y1="-checkpoints[checkpoints.length - 1].y * 2.2"
              :x2="draftCp.x * 2.2"
              :y2="-draftCp.y * 2.2"
              stroke="#94A3B8"
              stroke-width="1.5"
              stroke-dasharray="4 3"
              class="animate-pulse"
            />

            <!-- Checkpoint nodes -->
            <g
              v-for="(cp, index) in checkpoints"
              :key="cp.checkpoint_id"
              :transform="`translate(${cp.x * 2.2}, ${-cp.y * 2.2})`"
              class="cursor-pointer group"
              @click.stop="selectCheckpoint(cp)"
            >
              <!-- Outer ring (selected) -->
              <circle
                r="18"
                fill="none"
                :stroke="selectedCp?.checkpoint_id === cp.checkpoint_id ? '#4F46E5' : '#C7D2FE'"
                stroke-width="2"
                :opacity="selectedCp?.checkpoint_id === cp.checkpoint_id ? 0.8 : 0"
                class="transition-all"
              />
              <!-- Main dot -->
              <circle
                r="8"
                :fill="selectedCp?.checkpoint_id === cp.checkpoint_id ? '#4F46E5' : '#6366F1'"
                class="transition-colors"
              />
              <!-- Sequence number -->
              <text
                text-anchor="middle"
                dy="3"
                fill="white"
                font-size="7"
                font-weight="bold"
              >{{ index + 1 }}</text>
              <!-- Label -->
              <text
                y="-24"
                text-anchor="middle"
                fill="#475569"
                font-size="8"
                font-weight="600"
              >{{ cp.name }}</text>
            </g>

            <!-- Draft Checkpoint node -->
            <g
              v-if="draftCp"
              :transform="`translate(${draftCp.x * 2.2}, ${-draftCp.y * 2.2})`"
              class="cursor-pointer group"
            >
              <circle r="18" fill="none" stroke="#4F46E5" stroke-width="2" opacity="0.8" class="animate-pulse" />
              <circle r="8" fill="#4F46E5" />
              <text text-anchor="middle" dy="3" fill="white" font-size="7" font-weight="bold">*</text>
              <text y="-24" text-anchor="middle" fill="#475569" font-size="8" font-weight="600">{{ draftCp.name }} (Unsaved)</text>
            </g>
          </g>
        </svg>

        <!-- Legend -->
        <div class="absolute bottom-3 left-3 text-[10px] text-slate-400 font-medium">
          {{ checkpoints.length }} checkpoints · Click to add more
        </div>
      </div>
    </div>

    <!-- Right: Config Panel -->
    <div class="w-full md:w-[340px] bg-white flex flex-col h-full border-l border-slate-200 shrink-0">

      <!-- Tab Switcher -->
      <div class="flex bg-slate-50 border-b border-slate-200 shrink-0">
        <button
          @click="rightTab = 'editor'"
          class="flex-1 py-2.5 text-xs font-semibold transition-all border-b-2"
          :class="rightTab === 'editor' ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600'"
        >
          <Settings2 class="w-3.5 h-3.5 inline mr-1" /> Editor
        </button>
        <button
          @click="rightTab = 'qr'"
          class="flex-1 py-2.5 text-xs font-semibold transition-all border-b-2"
          :class="rightTab === 'qr' ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600'"
        >
          <QrCode class="w-3.5 h-3.5 inline mr-1" /> QR Badge
        </button>
      </div>

      <!-- ═══ EDITOR TAB ═══ -->
      <div v-show="rightTab === 'editor'" class="flex-1 flex flex-col min-h-0">

        <!-- Checkpoint Editor -->
        <div class="p-4 border-b border-slate-100 shrink-0">
          <h3 class="text-sm font-semibold text-slate-900 mb-1">Checkpoint Editor</h3>
          <p class="text-[10px] text-slate-400">Select or click canvas to configure</p>

          <div v-if="editingCp" class="space-y-2.5 mt-3">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="ae-section-label mb-1 block">Name</label>
                <input v-model="editingCp.name" type="text" class="ae-input" placeholder="e.g. Checkpoint Alpha" />
              </div>
              <div>
                <label class="ae-section-label mb-1 block flex items-center gap-1">NFC UID <span class="text-[9px] text-slate-400 font-normal">(Anti-Cheat)</span></label>
                <input v-model="editingCp.nfc_uid" type="text" class="ae-input font-mono text-xs uppercase" placeholder="e.g. 04:A1:B2..." />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="ae-section-label mb-1 block">Floor</label>
                <input v-model="editingCp.floor" type="text" class="ae-input" placeholder="Floor 1" />
              </div>
              <div>
                <label class="ae-section-label mb-1 block">Building</label>
                <input v-model="editingCp.building_id" type="text" class="ae-input" placeholder="HUB-A" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="ae-section-label mb-1 block">Task / Notes</label>
                <input v-model="editingCp.instructions" type="text" class="ae-input" placeholder="e.g. Check locks" />
              </div>
              <div>
                <label class="ae-section-label mb-1 block">Dwell Time (min)</label>
                <input v-model.number="editingCp.dwell_time" type="number" class="ae-input" placeholder="5" min="0" />
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="saveCheckpoint" class="btn-primary flex-1 text-xs justify-center">Save</button>
              <button @click="deleteCheckpoint" class="btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50">Delete</button>
            </div>
          </div>

          <div v-else class="mt-3 p-3 bg-slate-50 rounded-lg text-center">
            <p class="text-xs text-slate-400">Click a node or click the canvas to add a new checkpoint.</p>
          </div>
        </div>

        <!-- Route Sequence -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between border-b border-slate-100">
            <div>
              <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">Checkpoints</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">Visits List</p>
            </div>
            <span class="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{{ checkpoints.length }} stops</span>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 pt-2 space-y-1.5">
            <div
              v-for="(cp, idx) in checkpoints"
              :key="cp.checkpoint_id"
              class="checkpoint-row group flex items-center gap-2.5 py-2 px-3 rounded-lg border transition-all cursor-pointer"
              :class="selectedCp?.checkpoint_id === cp.checkpoint_id
                ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'"
              @click="selectCheckpoint(cp)"
            >
              <!-- Left status dot -->
              <span
                class="w-2 h-2 rounded-full shrink-0 transition-all"
                :class="cp.status === 'completed' ? 'bg-emerald-500'
                  : cp.status === 'missed'    ? 'bg-rose-400'
                  : selectedCp?.checkpoint_id === cp.checkpoint_id ? 'bg-indigo-500 animate-pulse'
                  : 'bg-slate-300'"
              />

              <!-- Checkpoint name -->
              <span
                class="flex-1 text-xs font-semibold font-mono truncate"
                :class="selectedCp?.checkpoint_id === cp.checkpoint_id ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-600'"
              >
                {{ cp.name }}
              </span>

              <!-- Timestamp -->
              <span class="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                {{ cp.scanned_at || '--:--:--' }}
              </span>

              <!-- Right live status dot -->
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="cp.status === 'completed' ? 'bg-emerald-500'
                  : cp.status === 'missed'    ? 'bg-rose-400'
                  : 'bg-slate-200'"
              />

              <!-- Reorder controls (hover) -->
              <div class="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" @click.stop>
                <button
                  @click="moveUp(idx)"
                  :disabled="idx === 0"
                  class="p-0.5 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors cursor-pointer"
                >
                  <ChevronUp class="w-3 h-3" />
                </button>
                <button
                  @click="moveDown(idx)"
                  :disabled="idx === checkpoints.length - 1"
                  class="p-0.5 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors cursor-pointer"
                >
                  <ChevronDown class="w-3 h-3" />
                </button>
              </div>
            </div>

            <div v-if="!checkpoints.length" class="text-center text-xs text-slate-400 py-6">
              <MapPin class="w-6 h-6 text-slate-300 mx-auto mb-2" />
              No checkpoints added yet
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ QR BADGE TAB ═══ -->
      <div v-show="rightTab === 'qr'" class="flex-1 flex flex-col items-center justify-center p-5">

        <div v-if="selectedCp" class="w-full space-y-4">
          <!-- Badge card -->
          <div id="qr-badge-card" class="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center shadow-sm">
            <div class="border-b border-slate-100 pb-3 w-full mb-3">
              <p class="text-xs font-black uppercase tracking-widest text-slate-900">ACCESSEASY</p>
              <p class="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Security Checkpoint</p>
            </div>
            <!-- Real QR -->
            <div class="p-3 bg-white border border-slate-100 rounded-lg mb-3">
              <canvas ref="qrCanvas" class="w-32 h-32" />
            </div>
            <p class="text-sm font-bold text-slate-900">{{ selectedCp.name }}</p>
            <p class="text-[10px] font-mono text-slate-400 mt-0.5">{{ selectedCp.checkpoint_id }}</p>
            <div class="grid grid-cols-2 gap-2 w-full mt-3 bg-slate-50 rounded-lg p-2.5 text-left text-[10px] text-slate-600">
              <div><span class="text-slate-400 uppercase tracking-wide block text-[8px]">Floor</span>{{ selectedCp.floor }}</div>
              <div><span class="text-slate-400 uppercase tracking-wide block text-[8px]">Building</span>{{ selectedCp.building_id }}</div>
            </div>
          </div>

          <!-- Print Buttons -->
          <div class="space-y-2">
            <button @click="printBadge" class="w-full btn-secondary text-xs justify-center">
              <Printer class="w-3.5 h-3.5" />
              Print This Badge
            </button>
            <button @click="printAllCheckpoints" class="w-full btn-primary text-xs justify-center">
              <Printer class="w-3.5 h-3.5" />
              Print All Checkpoints ({{ checkpoints.length }})
            </button>
          </div>
        </div>

        <div v-else class="text-center py-10">
          <QrCode class="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p class="text-sm text-slate-400">Select a checkpoint to preview its QR badge</p>
        </div>
      </div>

    </div>

    <!-- Create Group Modal -->
    <Teleport to="body">
      <div v-if="showCreatePrompt" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
          <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2"><MapPin class="w-4 h-4 text-indigo-600"/> New Checkpoint Group</h3>
            <button @click="showCreatePrompt = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors"><X class="w-4 h-4"/></button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="ae-section-label mb-1 block">Group Name</label>
              <input v-model="newGroupName" type="text" class="ae-input w-full" placeholder="e.g. Night Patrol Route" autofocus />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="ae-section-label mb-1 block">Schedule Frequency</label>
                <select v-model="newGroupFrequency" class="ae-select w-full">
                  <option value="hourly">Hourly</option>
                  <option value="shift">Once per Shift</option>
                  <option value="daily">Daily</option>
                  <option value="custom">Custom Time</option>
                </select>
              </div>
              <div>
                <label class="ae-section-label mb-1 block">Grace Period (mins)</label>
                <input v-model.number="newGroupGrace" type="number" class="ae-input w-full" placeholder="15" />
              </div>
            </div>
            <div>
              <label class="ae-section-label mb-1 block">Assign to Zone (Optional)</label>
              <select v-model="newGroupZone" class="ae-select w-full" @keyup.enter="createGroup">
                <option value="">No specific zone</option>
                <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zoneName }}</option>
              </select>
            </div>
            <div class="flex gap-3 justify-end mt-2">
              <button @click="showCreatePrompt = false" class="btn-ghost text-xs">Cancel</button>
              <button @click="createGroup" class="btn-primary text-xs" :disabled="isCreating || !newGroupName.trim()">
                <Loader2 v-if="isCreating" class="w-3.5 h-3.5 animate-spin mr-1" />
                <Plus v-else class="w-3.5 h-3.5 mr-1" />
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { Printer, ChevronUp, ChevronDown, QrCode, Settings2, Plus, X, Loader2, MapPin } from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import QRCode from 'qrcode';

const selectedPatrolId = ref(null);
const checkpoints = ref([]);
const selectedCp = ref(null);
const editingCp = ref(null);
const qrCanvas = ref(null);
const rightTab = ref('editor');

const checkpointGroups = ref([]);
const showCreatePrompt = ref(false);
const newGroupName = ref('');
const newGroupZone = ref('');
const newGroupFrequency = ref('shift');
const newGroupGrace = ref(15);
const zones = ref([]);
const isCreating = ref(false);

const loadGroups = async () => {
  const groups = await patrolService.fetchCheckpointGroups();
  checkpointGroups.value = groups;
  if (groups.length > 0 && !selectedPatrolId.value) {
    selectedPatrolId.value = groups[0].id;
  }
};

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
    const errMsg = err.response?.data?.errors?.[0]?.message || err.message || "Unknown error";
    alert(`Failed to create checkpoint group: ${errMsg}`);
    console.error(err);
  } finally {
    isCreating.value = false;
  }
};

const draftCp = computed(() => {
  if (selectedCp.value && !checkpoints.value.some(c => c.checkpoint_id === selectedCp.value.checkpoint_id)) {
    return selectedCp.value;
  }
  return null;
});

// Generate real QR on selected checkpoint change
watch([selectedCp, qrCanvas], async ([cp, canvas]) => {
  if (!cp || !canvas) return;
  await nextTick();
  const qrData = `ACPT::${cp.checkpoint_id}::${selectedPatrolId.value}`;
  try {
    await QRCode.toCanvas(canvas, qrData, {
      width: 112,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch (e) { console.error('QR generation failed', e); }
}, { immediate: false });

const fetchCheckpoints = async () => {
  try {
    checkpoints.value = await patrolService.getCheckpointsForRoute(selectedPatrolId.value);
    selectedCp.value = checkpoints.value[0] || null;
    editingCp.value = selectedCp.value ? { ...selectedCp.value } : null;
  } catch (err) { console.error(err); }
};

watch(selectedPatrolId, fetchCheckpoints);

const selectCheckpoint = (cp) => {
  selectedCp.value = cp;
  editingCp.value = { ...cp };
};

const handleCanvasClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const scale = 2.2;
  const rawX = (e.clientX - rect.left - rect.width / 2) * (600 / rect.width);
  const rawY = (rect.height / 2 - (e.clientY - rect.top)) * (400 / rect.height);
  const newId = `CP-${Math.floor(Math.random() * 900) + 100}`;
  const newCp = {
    checkpoint_id: newId,
    name: `CP ${checkpoints.value.length + 1}`,
    floor: '', building_id: '',
    instructions: '', dwell_time: 0,
    nfc_uid: '',
    x: Math.round(rawX / scale), y: Math.round(rawY / scale),
    status: 'pending'
  };
  selectedCp.value = newCp;
  editingCp.value = { ...newCp };
};

const saveCheckpoint = async () => {
  if (!editingCp.value) return;
  try {
    const list = await patrolService.saveCheckpoint(selectedPatrolId.value, editingCp.value);
    checkpoints.value = [...list]; // Ensure reactivity by spreading
    
    // Grab the saved object from the list to ensure we have the DB 'id'
    // This prevents creating endless duplicates if they click save multiple times
    const savedCp = list.find(c => c.checkpoint_id === editingCp.value.checkpoint_id);
    if (savedCp) {
      selectedCp.value = savedCp;
      editingCp.value = { ...savedCp };
    }
  } catch (err) { console.error(err); }
};

const deleteCheckpoint = async () => {
  if (!editingCp.value) return;
  try {
    const list = await patrolService.deleteCheckpoint(selectedPatrolId.value, editingCp.value.checkpoint_id);
    checkpoints.value = [...list]; // Ensure reactivity by spreading
    selectedCp.value = checkpoints.value[0] || null;
    editingCp.value = selectedCp.value ? { ...selectedCp.value } : null;
  } catch (err) { console.error(err); }
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

// Print single checkpoint
const printBadge = async () => {
  if (!selectedCp.value) return;
  const qrDataUrl = await generateQrDataUrl(selectedCp.value);
  const win = window.open('', '_blank');
  win.document.write(buildPrintHtml([{ cp: selectedCp.value, qr: qrDataUrl, seq: checkpoints.value.findIndex(c => c.checkpoint_id === selectedCp.value.checkpoint_id) + 1 }]));
  win.document.close();
};

// Print ALL checkpoints on one sheet
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
  win.document.write(buildPrintHtml(cards, true));
  win.document.close();
};

const generateQrDataUrl = async (cp) => {
  try {
    return await QRCode.toDataURL(`ACPT::${cp.checkpoint_id}::${selectedPatrolId.value}`, {
      width: 200, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch { return ''; }
};

const buildPrintHtml = (cards, allMode = false) => `
  <html>
    <head>
      <title>${allMode ? 'All Checkpoints' : 'Checkpoint Badge'} — ${selectedPatrolId.value}</title>
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
          <div class="brand">AccessEasy<div class="sub-brand">Security Checkpoint</div></div>
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
      \x3Cscript>window.onload = () => { window.print(); window.close(); };\x3C/script>
    </body>
  </html>
`;

 

onMounted(async () => {
  loadGroups();
  fetchCheckpoints();
  try {
    zones.value = await zoneService.fetchZones();
  } catch (e) {
    console.error('Failed to load zones:', e);
  }
});
</script>

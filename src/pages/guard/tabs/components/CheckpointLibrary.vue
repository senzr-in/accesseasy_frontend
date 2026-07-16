<template>
  <div class="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900">
    <!-- Top toolbar -->
    <div class="flex flex-wrap justify-end items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search checkpoints..."
            class="ae-input pl-9 w-64"
          >
        </div>
        <button
          class="btn-primary text-xs flex items-center gap-1.5"
          @click="openCreateModal"
        >
          <Plus class="w-4 h-4" /> Add Checkpoint
        </button>
      </div>
    </div>

    <!-- Main Content: Split View -->
    <div class="flex-1 flex min-h-0">
      <!-- Left: Checkpoint List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
        <div
          v-if="loading"
          class="flex justify-center items-center h-40"
        >
          <Loader2 class="w-6 h-6 animate-spin text-indigo-600" />
        </div>
        <div
          v-else-if="filteredCheckpoints.length === 0"
          class="flex flex-col items-center justify-center h-64 text-center"
        >
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <MapPin class="w-8 h-8 text-slate-400" />
          </div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            No Checkpoints Found
          </h3>
          <p class="text-xs text-slate-500 max-w-xs">
            Get started by creating a new standalone checkpoint to be used in your patrol routes.
          </p>
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div 
            v-for="cp in filteredCheckpoints" 
            :key="cp.id"
            class="ae-card p-4 cursor-pointer transition-all border-2"
            :class="selectedCp?.id === cp.id ? 'border-indigo-500 shadow-md bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-transparent hover:border-indigo-200'"
            @click="selectCheckpoint(cp)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MapPin class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {{ cp.name }}
                  </h3>
                  <p class="text-[10px] font-mono text-slate-500">
                    {{ cp.checkpoint_id }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
              <div><span class="block text-slate-400 uppercase text-[8px] font-bold tracking-widest">Building</span>{{ cp.building_id || '—' }}</div>
              <div><span class="block text-slate-400 uppercase text-[8px] font-bold tracking-widest">Floor</span>{{ cp.floor || '—' }}</div>
            </div>
            
            <div class="flex items-center gap-1.5">
              <span
                v-if="cp.nfc_uid"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700"
              >
                <Wifi class="w-3 h-3" /> NFC
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Clock class="w-3 h-3" /> {{ cp.dwell_time || 0 }}m Dwell
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Inspector / Editor -->
      <div class="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 flex flex-col h-full">
        <!-- Editor View -->
        <div
          v-if="editingCp"
          class="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col"
        >
          <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              {{ isNew ? 'Create Checkpoint' : 'Edit Checkpoint' }}
            </h3>
            <button
              class="btn-icon"
              @click="closeEditor"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <div class="space-y-4 flex-1">
            <div>
              <label class="ae-section-label block mb-1">Checkpoint Name <span class="text-red-500">*</span></label>
              <input
                v-model="editingCp.name"
                type="text"
                class="ae-input w-full"
                placeholder="e.g. Main Lobby Gate"
                autofocus
              >
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="ae-section-label block mb-1">Building</label>
                <input
                  v-model="editingCp.building_id"
                  type="text"
                  class="ae-input w-full"
                  placeholder="e.g. Tower A"
                >
              </div>
              <div>
                <label class="ae-section-label block mb-1">Floor</label>
                <input
                  v-model="editingCp.floor"
                  type="text"
                  class="ae-input w-full"
                  placeholder="e.g. Ground"
                >
              </div>
            </div>
            
            <div>
              <label class="ae-section-label block mb-1 flex items-center gap-1">NFC UID <span class="text-[9px] text-slate-400 font-normal">(Anti-cheat)</span></label>
              <input
                v-model="editingCp.nfc_uid"
                type="text"
                class="ae-input w-full font-mono text-xs uppercase"
                placeholder="e.g. 04:A1:B2..."
              >
            </div>
            
            <div>
              <label class="ae-section-label block mb-1">Dwell Time (minutes)</label>
              <input
                v-model.number="editingCp.dwell_time"
                type="number"
                class="ae-input w-full"
                min="0"
                placeholder="0"
              >
              <p class="text-[10px] text-slate-500 mt-1">
                Required time guard must spend at location
              </p>
            </div>
            
            <div>
              <label class="ae-section-label block mb-1">Guard Instructions</label>
              <textarea
                v-model="editingCp.instructions"
                class="ae-input w-full h-20 resize-none text-xs"
                placeholder="e.g. Ensure back door is securely locked..."
              />
            </div>
            
            <!-- QR Preview (only if existing) -->
            <div
              v-if="!isNew"
              class="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center"
            >
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Standalone QR Badge
              </p>
              <div class="p-2 bg-white rounded-lg border border-slate-200">
                <canvas
                  ref="qrCanvas"
                  class="w-24 h-24"
                />
              </div>
              <button
                class="btn-secondary text-xs w-full mt-3 justify-center"
                @click="printBadge"
              >
                <Printer class="w-3.5 h-3.5" /> Print QR Badge
              </button>
            </div>
          </div>
          
          <div class="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4 flex gap-2 shrink-0">
            <button
              v-if="!isNew"
              class="btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50 px-3"
              @click="deleteCheckpoint"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <button
              class="btn-ghost flex-1 text-xs"
              @click="closeEditor"
            >
              Cancel
            </button>
            <button
              class="btn-primary flex-1 text-xs justify-center"
              :disabled="!editingCp.name || saving"
              @click="saveCheckpoint"
            >
              <Loader2
                v-if="saving"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span v-else>Save</span>
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div
          v-else
          class="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400"
        >
          <MousePointerClick class="w-10 h-10 mb-3 text-slate-300" />
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No Checkpoint Selected
          </p>
          <p class="text-xs mt-1 max-w-[200px]">
            Select a checkpoint from the library to view details or edit.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { MapPin, Search, Plus, X, Clock, Wifi, Printer, Trash2, Loader2, MousePointerClick } from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';
import QRCode from 'qrcode';
import { authService } from '@/services/authService';

const checkpoints = ref([]);
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref('');
const selectedCp = ref(null);
const editingCp = ref(null);
const isNew = ref(false);
const qrCanvas = ref(null);

const filteredCheckpoints = computed(() => {
  if (!searchQuery.value) return checkpoints.value;
  const q = searchQuery.value.toLowerCase();
  return checkpoints.value.filter(c => 
    c.name?.toLowerCase().includes(q) || 
    c.checkpoint_id?.toLowerCase().includes(q) ||
    c.building_id?.toLowerCase().includes(q)
  );
});

const loadCheckpoints = async () => {
  loading.value = true;
  try {
    checkpoints.value = await patrolService.getMasterCheckpoints();
  } catch (err) {
    console.error('Failed to load master checkpoints', err);
  } finally {
    loading.value = false;
  }
};

const selectCheckpoint = (cp) => {
  selectedCp.value = cp;
  editingCp.value = { ...cp };
  isNew.value = false;
};

const openCreateModal = () => {
  selectedCp.value = null;
  isNew.value = true;
  editingCp.value = {
    checkpoint_id: `CP-${Math.floor(Math.random() * 9000) + 1000}`,
    name: '',
    building_id: '',
    floor: '',
    nfc_uid: '',
    dwell_time: 0,
    instructions: '',
    x: 0, // Not used in library visually, but good for DB compat
    y: 0
  };
};

const closeEditor = () => {
  editingCp.value = null;
  selectedCp.value = null;
};

const saveCheckpoint = async () => {
  if (!editingCp.value.name) return;
  saving.value = true;
  try {
    const updatedList = await patrolService.saveMasterCheckpoint(editingCp.value);
    checkpoints.value = updatedList;
    
    // Reselect
    const saved = updatedList.find(c => c.checkpoint_id === editingCp.value.checkpoint_id);
    if (saved) {
      selectCheckpoint(saved);
    } else {
      closeEditor();
    }
  } catch (err) {
    console.error(`Failed to save checkpoint: ${err.message}`);
  } finally {
    saving.value = false;
  }
};

const deleteCheckpoint = async () => {
  if (!editingCp.value || !editingCp.value.id) return;
  if (!confirm(`Are you sure you want to delete ${editingCp.value.name}?`)) return;
  
  saving.value = true;
  try {
    const updatedList = await patrolService.deleteMasterCheckpoint(editingCp.value.id);
    checkpoints.value = updatedList;
    closeEditor();
  } catch (err) {
    console.error(`Failed to delete checkpoint. It may be in use by a route.`);
  } finally {
    saving.value = false;
  }
};

// Generate QR Code
watch([editingCp, qrCanvas], async ([cp, canvas]) => {
  if (!cp || !canvas || isNew.value) return;
  await nextTick();
  const tenantId = authService.getTenantId();
  const signature = btoa(`${cp.checkpoint_id}-${tenantId}-AccessEasy2026`).replace(/=/g, '');
  const qrData = `ACPT::${cp.checkpoint_id}::${signature}`;
  try {
    await QRCode.toCanvas(canvas, qrData, {
      width: 96,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    });
  } catch (e) { console.error('QR generation failed', e); }
}, { immediate: false });

const printBadge = async () => {
  if (!editingCp.value) return;
  
  const tenantId = authService.getTenantId();
  const signature = btoa(`${editingCp.value.checkpoint_id}-${tenantId}-AccessEasy2026`).replace(/=/g, '');
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

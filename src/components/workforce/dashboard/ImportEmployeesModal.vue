<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-150"
      @click.self="close"
    >
      <div class="w-full max-w-lg bg-[#FFFFFF] border border-[#E8E8E8] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-[#171717]">
              {{ showDuplicateModal ? 'Duplicate Records Found' : 'Import Employees' }}
            </h3>
            <p class="text-xs text-[#6B6B6B] mt-0.5">
              {{ showDuplicateModal ? 'Choose how to handle existing workforce profiles' : 'Upload CSV file for batch employee provisioning' }}
            </p>
          </div>
          <button
            class="w-7 h-7 rounded-md border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F7F7F8] transition-colors cursor-pointer"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- In-App Duplicate Resolution View -->
        <div v-if="showDuplicateModal" class="p-6 space-y-4 text-xs">
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div class="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
              <span>Found {{ duplicateInfo.count }} Duplicate Record(s)</span>
            </div>
            <p class="text-[11px] text-amber-700">
              The following employee IDs / emails already exist in your workforce directory:
            </p>
            <div class="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
              <span
                v-for="name in duplicateInfo.sample"
                :key="name"
                class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono border border-amber-200"
              >
                {{ name }}
              </span>
              <span v-if="duplicateInfo.count > duplicateInfo.sample.length" class="text-[10px] text-amber-700 font-medium self-center">
                +{{ duplicateInfo.count - duplicateInfo.sample.length }} more
              </span>
            </div>
          </div>

          <p class="text-xs text-[#525252] leading-relaxed">
            Select an action to proceed with the batch import:
          </p>

          <div class="pt-3 border-t border-[#E8E8E8] flex items-center justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 rounded-lg border border-[#E8E8E8] font-semibold text-xs text-[#171717] hover:bg-[#F7F7F8] transition-colors cursor-pointer"
              @click="handleDuplicateChoice('skip')"
            >
              Skip Duplicates
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-[#171717] text-[#FFFFFF] font-semibold text-xs hover:bg-[#2D2D2D] transition-colors cursor-pointer"
              @click="handleDuplicateChoice('edit')"
            >
              Update Existing Records
            </button>
          </div>
        </div>

        <!-- Normal Import Upload View -->
        <div v-else class="p-6 space-y-4 text-xs">
          <!-- Drop Area -->
          <div
            class="border-2 border-dashed border-[#E8E8E8] hover:border-[#3478F6] rounded-xl p-8 text-center transition-colors cursor-pointer bg-[#F7F7F8]"
            @click="$refs.fileInput.click()"
          >
            <UploadCloud class="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
            <p class="font-medium text-[#171717]">Click to select CSV or drag file here</p>
            <p class="text-[11px] text-[#929292] mt-1">Supports standard UTF-8 CSV</p>
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden"
              @change="handleFileSelected"
            >
          </div>

          <!-- Selected File Preview if any -->
          <div v-if="selectedFile" class="p-3 rounded-lg border border-[#E8E8E8] bg-[#FFFFFF] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <FileSpreadsheet class="w-4 h-4 text-[#3478F6]" />
              <span class="font-medium text-[#171717]">{{ selectedFile.name }}</span>
            </div>
            <span class="text-[11px] text-[#6B6B6B]">{{ (selectedFile.size / 1024).toFixed(1) }} KB</span>
          </div>

          <!-- Error / Feedback -->
          <div v-if="importError" class="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs">
            {{ importError }}
          </div>

          <!-- Template Download Link -->
          <div class="flex items-center justify-between text-xs text-[#6B6B6B] pt-2">
            <span>Need the standard CSV structure?</span>
            <a href="#" class="text-[#3478F6] font-medium hover:underline flex items-center gap-1" @click.prevent="downloadTemplate">
              Download CSV Template
            </a>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-[#E8E8E8] flex items-center justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 rounded-lg border border-[#E8E8E8] font-medium text-xs text-[#171717] hover:bg-[#F7F7F8] transition-colors cursor-pointer"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="!selectedFile || isImporting"
              class="px-4 py-2 rounded-lg bg-[#171717] text-[#FFFFFF] font-medium text-xs hover:bg-[#2D2D2D] transition-colors disabled:opacity-50 cursor-pointer"
              @click="processImport"
            >
              {{ isImporting ? 'Processing Import...' : 'Import Records' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { X, UploadCloud, FileSpreadsheet, AlertTriangle } from 'lucide-vue-next';
import { processCSVImport } from '@/utils/helpers/importHelper';
import { currentUserTenant } from '@/utils/currentUserTenant';

defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['update:isOpen', 'success']);

const selectedFile = ref(null);
const isImporting = ref(false);
const importError = ref('');

const showDuplicateModal = ref(false);
const duplicateInfo = ref({ count: 0, sample: [] });
let duplicateResolver = null;

const close = () => {
  if (duplicateResolver) {
    duplicateResolver('skip');
    duplicateResolver = null;
  }
  showDuplicateModal.value = false;
  emit('update:isOpen', false);
  selectedFile.value = null;
  importError.value = '';
};

const handleFileSelected = (e) => {
  if (e.target.files && e.target.files[0]) {
    selectedFile.value = e.target.files[0];
    importError.value = '';
  }
};

const downloadTemplate = () => {
  const csvContent = "data:text/csv;charset=utf-8,Employee ID,First Name,Last Name,Email,Phone,Designation\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "accesseasy_employee_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDuplicateChoice = (choice) => {
  showDuplicateModal.value = false;
  if (duplicateResolver) {
    duplicateResolver(choice);
    duplicateResolver = null;
  }
};

const processImport = async () => {
  if (!selectedFile.value) return;
  isImporting.value = true;
  importError.value = '';

  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    await processCSVImport(selectedFile.value, 'personalModule', tenantId, {
      onDuplicateFound: ({ duplicateRecords, count }) => {
        return new Promise((resolve) => {
          duplicateInfo.value = { count, sample: duplicateRecords.slice(0, 10) };
          duplicateResolver = resolve;
          showDuplicateModal.value = true;
        });
      }
    });
    emit('success');
    close();
  } catch (err) {
    console.error('Import processing error:', err);
    importError.value = err.message || 'Failed to process import.';
  } finally {
    isImporting.value = false;
  }
};
</script>

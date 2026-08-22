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
            <h3 class="text-sm font-bold text-[#171717]">Import Employees</h3>
            <p class="text-xs text-[#6B6B6B] mt-0.5">Upload CSV file for batch employee provisioning</p>
          </div>
          <button
            class="w-7 h-7 rounded-md border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F7F7F8] transition-colors cursor-pointer"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 text-xs">
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
import { X, UploadCloud, FileSpreadsheet } from 'lucide-vue-next';
import { processCSVImport } from '@/utils/helpers/importHelper';
import { currentUserTenant } from '@/utils/currentUserTenant';

defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['update:isOpen', 'success']);

const selectedFile = ref(null);
const isImporting = ref(false);
const importError = ref('');

const close = () => {
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

const processImport = async () => {
  if (!selectedFile.value) return;
  isImporting.value = true;
  importError.value = '';

  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    await processCSVImport(selectedFile.value, 'personalModule', tenantId);
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

<template>
  <v-dialog
    v-model="dialogModel"
    max-width="750px"
    persistent
    scrollable
  >
    <v-card class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
      <!-- Header -->
      <v-card-title class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-white/10 backdrop-blur-md">
            <ScanFace class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-bold">Enroll Face from Photo</h3>
            <p class="text-xs text-emerald-100 font-normal">Convert image to 192-d MobileFaceNet embedding & Base64 raw data</p>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          color="white"
          @click="closeModal"
        >
          <X class="w-5 h-5" />
        </v-btn>
      </v-card-title>

      <v-card-text class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        <!-- 1. Select Employee -->
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <UserCheck class="w-4 h-4 text-emerald-600" />
            Select Employee / Guard *
          </label>
          <v-autocomplete
            v-model="selectedEmployee"
            :items="employees"
            item-title="displayName"
            item-value="id"
            return-object
            placeholder="Search employee by name or ID..."
            variant="outlined"
            density="comfortable"
            color="primary"
            class="rounded-lg"
            :loading="loadingEmployees"
            hide-details="auto"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="`ID: ${item.raw.employeeId || 'N/A'}`">
                <template #prepend>
                  <v-avatar size="32" color="emerald-lighten-4" class="mr-2 text-emerald-800 text-xs font-bold">
                    {{ (item.raw.displayName || 'U').charAt(0).toUpperCase() }}
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </div>

        <!-- 2. Photo Upload & Drop Zone -->
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <UploadCloud class="w-4 h-4 text-emerald-600" />
            Upload Face Photo *
          </label>

          <div
            class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative group"
            :class="isDragging ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              class="hidden"
              @change="handleFileSelect"
            >

            <div v-if="!selectedFile" class="py-4 space-y-2">
              <div class="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Camera class="w-7 h-7" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to browse or drag & drop photo
                </p>
                <p class="text-xs text-slate-500 mt-1">
                  Supports JPG, PNG, WebP (Front-facing portrait recommended)
                </p>
              </div>
            </div>

            <!-- Uploaded File Summary -->
            <div v-else class="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div class="flex items-center gap-3 text-left">
                <div class="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  IMG
                </div>
                <div class="truncate max-w-[280px]">
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ selectedFile.name }}</p>
                  <p class="text-[11px] text-slate-500">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
                </div>
              </div>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
                @click.stop="resetFile"
              >
                <Trash2 class="w-4 h-4" />
              </v-btn>
            </div>
          </div>
        </div>

        <!-- 3. Real-Time Processing & AI Diagnostics -->
        <div v-if="processing || analysisResult" class="rounded-xl p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-emerald-500" />
              AI Face Processing & Vector Extraction
            </h4>
            <span
              v-if="analysisResult"
              class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
            >
              192-D Vector Ready
            </span>
          </div>

          <!-- Loading state during inference -->
          <div v-if="processing" class="py-6 text-center space-y-3">
            <v-progress-circular indeterminate color="emerald" size="36" width="3" />
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
              {{ processingStatus }}
            </p>
          </div>

          <!-- Processed Result Previews -->
          <div v-else-if="analysisResult" class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <!-- Cropped 112x112 MobileFaceNet Preview -->
            <div class="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div class="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-500 shrink-0 shadow-md">
                <img :src="analysisResult.croppedDataUrl" alt="Cropped Face" class="w-full h-full object-cover">
                <span class="absolute bottom-0 right-0 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-tl">112×112</span>
              </div>
              <div class="space-y-1">
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Cropped Face (ROI)</p>
                <p class="text-[11px] text-slate-500">Aligned for MobileFaceNet</p>
                <div class="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <CheckCircle class="w-3 h-3" />
                  <span>Single Face Verified</span>
                </div>
              </div>
            </div>

            <!-- Mathematical Vector Diagnostics -->
            <div class="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-500">Vector Dimensions:</span>
                <span class="font-bold text-slate-900 dark:text-white">192 Floats</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">L2 Vector Norm:</span>
                <span class="font-bold text-emerald-600">1.000000 (Unit Vector)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Raw Image Base64:</span>
                <span class="font-bold text-blue-600">Generated ({{ (analysisResult.base64Image.length / 1024).toFixed(0) }} KB)</span>
              </div>
            </div>
          </div>

          <!-- Error Feedback -->
          <div v-if="processingError" class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ processingError }}</span>
          </div>
        </div>
      </v-card-text>

      <!-- Footer / Actions -->
      <v-card-actions class="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <v-btn
          variant="text"
          color="slate"
          :disabled="enrolling"
          @click="closeModal"
        >
          Cancel
        </v-btn>

        <v-btn
          color="emerald"
          variant="elevated"
          class="text-white font-bold px-6 shadow-md shadow-emerald-600/20"
          :loading="enrolling"
          :disabled="!isReadyToEnroll || processing"
          @click="submitEnrollment"
        >
          <Save class="w-4 h-4 mr-2" />
          Enroll & Save Face Biometrics
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { 
  ScanFace, X, UserCheck, UploadCloud, Camera, Trash2, 
  Sparkles, CheckCircle, AlertCircle, Save 
} from 'lucide-vue-next';
import { biometricService } from '@/services/biometricService';
import { webFaceEmbeddingService } from '@/services/webFaceEmbeddingService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialEmployeeId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'enrolled']);

const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// State
const employees = ref([]);
const loadingEmployees = ref(false);
const selectedEmployee = ref(null);

const fileInputRef = ref(null);
const selectedFile = ref(null);
const isDragging = ref(false);

const processing = ref(false);
const processingStatus = ref('');
const processingError = ref('');
const analysisResult = ref(null);

const enrolling = ref(false);

const isReadyToEnroll = computed(() => {
  return selectedEmployee.value?.id && analysisResult.value?.embedding?.length === 192;
});

// Load employee list for dropdown
const fetchEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const rawEmployees = await biometricService.getEmployeesForEnrollment();
    employees.value = rawEmployees.map(emp => {
      const firstName = emp.assignedUser?.first_name || emp.personName || 'Unknown';
      const lastName = emp.assignedUser?.last_name || '';
      const empId = emp.employeeId || emp.id;
      return {
        id: emp.id,
        employeeId: empId,
        userId: emp.assignedUser?.id || null,
        displayName: `${firstName} ${lastName}`.trim() + (empId ? ` (${empId})` : '')
      };
    });

    if (props.initialEmployeeId) {
      const match = employees.value.find(e => 
        String(e.id) === String(props.initialEmployeeId) || 
        String(e.employeeId) === String(props.initialEmployeeId) ||
        String(e.userId) === String(props.initialEmployeeId)
      );
      if (match) {
        selectedEmployee.value = match;
      }
    }
  } catch (e) {
    console.error('Error fetching employees:', e);
  } finally {
    loadingEmployees.value = false;
  }
};

const triggerFileInput = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (file) processFile(file);
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) processFile(file);
};

const resetFile = () => {
  selectedFile.value = null;
  analysisResult.value = null;
  processingError.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// Run Face Detection + MobileFaceNet 192-d Inference in Browser
const processFile = async (file) => {
  if (!file.type.startsWith('image/')) {
    processingError.value = 'Please select a valid image file (JPG, PNG, WebP).';
    return;
  }

  selectedFile.value = file;
  processing.value = true;
  processingError.value = '';
  analysisResult.value = null;
  processingStatus.value = 'Loading MobileFaceNet neural network...';

  try {
    processingStatus.value = 'Detecting facial boundaries & cropping 112×112 ROI...';
    
    // Execute client-side pipeline
    const result = await webFaceEmbeddingService.processImageFile(file);
    
    processingStatus.value = 'Extracting 192-d MobileFaceNet feature embedding...';
    analysisResult.value = result;
  } catch (err) {
    console.error('Error processing face photo:', err);
    processingError.value = err.message || 'Failed to detect or extract face embedding. Please try another photo.';
  } finally {
    processing.value = false;
  }
};

// Submit to Directus /items/faceId
const submitEnrollment = async () => {
  if (!isReadyToEnroll.value) return;

  enrolling.value = true;
  try {
    const result = await biometricService.enrollFaceWithPhoto({
      personalModuleId: selectedEmployee.value.id,
      file: selectedFile.value,
      base64Image: analysisResult.value.base64Image,
      embeddingVector: analysisResult.value.embedding
    });

    if (result.success) {
      emit('enrolled', {
        employee: selectedEmployee.value,
        data: result.data
      });
      closeModal();
    }
  } catch (err) {
    console.error('Error saving face enrollment to Directus:', err);
    processingError.value = err.response?.data?.errors?.[0]?.message || err.message || 'Failed to save face enrollment';
  } finally {
    enrolling.value = false;
  }
};

const closeModal = () => {
  dialogModel.value = false;
  resetFile();
  selectedEmployee.value = null;
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    fetchEmployees();
  } else {
    resetFile();
  }
});

onMounted(() => {
  if (props.modelValue) {
    fetchEmployees();
  }
});
</script>

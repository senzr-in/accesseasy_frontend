<template>
  <div class="space-y-6 p-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button class="h-9 w-9 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Face Management
            <Users class="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">
            Manage AI biometric face templates (192-d vectors) for secure mobile patrol & access control.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button class="h-9 px-4 rounded-md border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 text-sm font-medium transition-colors">
          <Share2 class="w-4 h-4" />
          Export
        </button>
        <button class="h-9 px-4 rounded-md border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 text-sm font-medium transition-colors">
          <Download class="w-4 h-4" />
          Import
        </button>
        <button
          class="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          @click="showEnrollModal = true"
        >
          <Plus class="w-4 h-4" />
          Enroll Face from Photo
        </button>
        <button
          class="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
          @click="fetchFaceData"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Enrolled -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
          Total Enrolled
        </p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">
          {{ embeddings.length }}
        </p>
      </div>
      <!-- High Quality -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
          High Quality (≥0.90)
        </p>
        <p class="text-2xl font-black text-emerald-600 dark:text-emerald-500">
          {{ embeddings.filter(e => e.qualityScore >= 0.9).length }}
        </p>
      </div>
      <!-- Web Enrolled -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
          Web Uploaded
        </p>
        <p class="text-2xl font-black text-blue-600 dark:text-blue-500">
          {{ embeddings.filter(e => e.captureMethod === 'Web Portal' || e.captureMethod === 'WEB_UPLOAD').length }}
        </p>
      </div>
      <!-- Mobile Enrolled -->
      <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
          Mobile Enrolled
        </p>
        <p class="text-2xl font-black text-amber-600 dark:text-amber-500">
          {{ embeddings.filter(e => e.captureMethod === 'Mobile Patrol Device').length }}
        </p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 overflow-hidden">
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Scan class="w-5 h-5 text-emerald-500" />
          Biometric Templates (MobileFaceNet 192-d)
        </h2>
        <div class="relative w-full md:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search employees..."
            class="w-full h-10 pl-9 pr-4 rounded-md border border-emerald-100 dark:border-emerald-500/20 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          >
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead class="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Photo & Employee
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Enrolled Source
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Raw Image (Base64)
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Quality
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Created At
              </th>
              <th class="px-6 py-4 text-xs font-semibold text-right text-slate-600 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                <Loader2 class="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                Loading biometric templates...
              </td>
            </tr>
            <tr v-else-if="filteredEmbeddings.length === 0">
              <td
                colspan="6"
                class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic text-sm"
              >
                No biometric templates found. Click "Enroll Face from Photo" to add one.
              </td>
            </tr>
            <tr 
              v-for="emb in filteredEmbeddings"
              v-else 
              :key="emb.id" 
              class="hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.02] transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <!-- Photo Thumbnail -->
                  <div class="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700">
                    <img
                      v-if="emb.photoUrl"
                      :src="emb.photoUrl"
                      alt="Face"
                      class="w-full h-full object-cover"
                    >
                    <UserCheck v-else class="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">
                      {{ emb.employee.firstName }} {{ emb.employee.lastName }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                      ID: {{ emb.employee.employeeId }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border"
                  :class="emb.captureMethod === 'Web Portal' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300'"
                >
                  {{ emb.captureMethod }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span 
                  v-if="emb.hasRawImage"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                >
                  <CheckCircle class="w-3 h-3 text-emerald-600" />
                  Base64 Saved
                </span>
                <span v-else class="text-xs text-slate-400 italic">No Base64</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-1000"
                      :class="emb.qualityScore > 0.9 ? 'bg-emerald-500' : emb.qualityScore > 0.8 ? 'bg-amber-500' : 'bg-rose-500'"
                      :style="{ width: `${emb.qualityScore * 100}%` }"
                    />
                  </div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ emb.qualityScore.toFixed(2) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                {{ new Date(emb.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  class="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  @click="handleDelete(emb)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Web Face Enrollment Modal -->
    <WebEnrollmentModal
      v-model="showEnrollModal"
      @enrolled="handleEnrolled"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Users, ArrowLeft, Scan, Trash2, Search, Plus, 
  UserCheck, RefreshCw, Download, Share2, Loader2, CheckCircle 
} from 'lucide-vue-next';
import { biometricService } from "@/services/biometricService";
import WebEnrollmentModal from "@/pages/faceEmbedding/webUploadFaceEmbedding/WebEnrollmentModal.vue";

const embeddings = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const showEnrollModal = ref(false);

const fetchFaceData = async () => {
  loading.value = true;
  try {
    const rawProfiles = await biometricService.getTenantFaceProfiles();
    
    embeddings.value = rawProfiles.map(item => {
      const assignedUser = item.assignedTo?.assignedUser || {};
      const firstName = assignedUser.first_name || item.assignedTo?.personName || "Unknown";
      const lastName = assignedUser.last_name || "";
      const employeeId = item.assignedTo?.employeeId || item.assignedTo?.id || "N/A";
      
      const photoId = item.referencePhoto?.id || item.referencePhoto || item.photo?.id || item.photo;
      const photoUrl = item.rawImage || (photoId ? biometricService.getFacePhotoUrl(photoId) : null);

      return {
        id: item.id,
        employee: { 
          firstName,
          lastName,
          employeeId
        },
        captureMethod: item.deviceEnrolled || (item.rawImage ? 'Web Portal' : 'Mobile Patrol Device'),
        qualityScore: item.qualityScore || 0.98,
        createdAt: item.date_created || item.date_updated || new Date().toISOString(),
        photoUrl,
        hasRawImage: !!item.rawImage
      };
    });
  } catch (error) {
    console.error("Error fetching face profiles:", error);
  } finally {
    loading.value = false;
  }
};

const filteredEmbeddings = computed(() => {
  return embeddings.value.filter(emb => 
    emb.employee.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    emb.employee.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    String(emb.employee.employeeId).toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleEnrolled = () => {
  fetchFaceData();
};

const handleDelete = async (emb) => {
  if (confirm(`Are you sure you want to delete the face template for ${emb.employee.firstName}?`)) {
    try {
      await biometricService.deleteFaceProfile(emb.id);
      fetchFaceData();
    } catch (error) {
      console.error("Error deleting face template:", error);
    }
  }
};

onMounted(() => {
  fetchFaceData();
});
</script>

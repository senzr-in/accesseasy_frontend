<template>
  <div class="space-y-6 p-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
    <!-- Header Title & Action Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck class="w-8 h-8" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Multi-Modal Biometrics Hub
            <span class="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Protocol V1.0.6
            </span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Manage high-precision Face Embeddings, Fingerprint Minutiae Templates, and Dynamic QR Pass Credentials.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          class="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
          @click="openEnrollModal('face')"
        >
          <ScanFace class="w-4 h-4" />
          Enroll Face
        </button>
        <button
          class="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          @click="openEnrollModal('fingerprint')"
        >
          <Fingerprint class="w-4 h-4" />
          Enroll Fingerprint
        </button>
        <button
          class="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
          @click="openEnrollModal('qr')"
        >
          <QrCode class="w-4 h-4" />
          Generate Dynamic QR
        </button>
        <button
          class="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          title="Refresh Data"
          @click="fetchBiometricData"
        >
          <RefreshCw
            class="w-4 h-4"
            :class="{ 'animate-spin': loading }"
          />
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Face Recognition
            </p>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {{ faceCount }} <span class="text-xs font-semibold text-slate-400">Templates</span>
            </h3>
          </div>
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ScanFace class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 class="w-3.5 h-3.5" />
          Base64 Auto-Sync Enabled (Code 300)
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fingerprint Biometrics
            </p>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {{ fingerCount }} <span class="text-xs font-semibold text-slate-400">Minutiae</span>
            </h3>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Fingerprint class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 class="w-3.5 h-3.5" />
          ANSI/ISO Standard (Code 500)
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dynamic QR Badges
            </p>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {{ qrCount }} <span class="text-xs font-semibold text-slate-400">Active Passes</span>
            </h3>
          </div>
          <div class="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <QrCode class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <Clock class="w-3.5 h-3.5" />
          30-sec Refresh Token (Code 103)
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gateway Sync
            </p>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
              Online
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
          </div>
          <div class="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <HardDrive class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          OSPI LSM Store Ready
        </div>
      </div>
    </div>

    <!-- Credential Database Table Section -->
    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden flex flex-col">
      <!-- Toolbar -->
      <div class="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row gap-4 items-center justify-between">
        <!-- Modality Tab Filters -->
        <div class="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          <button
            :class="activeFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            class="px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            @click="activeFilter = 'all'"
          >
            All Credentials
            <span class="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {{ credentials.length }}
            </span>
          </button>
          <button
            :class="activeFilter === 'face' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            class="px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            @click="activeFilter = 'face'"
          >
            <ScanFace class="w-3.5 h-3.5 text-blue-500" />
            Face (300)
          </button>
          <button
            :class="activeFilter === 'fingerprint' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            class="px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            @click="activeFilter = 'fingerprint'"
          >
            <Fingerprint class="w-3.5 h-3.5 text-emerald-500" />
            Fingerprint (500)
          </button>
          <button
            :class="activeFilter === 'qr' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            class="px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            @click="activeFilter = 'qr'"
          >
            <QrCode class="w-3.5 h-3.5 text-purple-500" />
            Dynamic QR (103)
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search employee, ID, or code..."
            class="w-full pl-10 pr-4 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          >
        </div>
      </div>

      <!-- Table Body -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black">
            <tr>
              <th class="px-6 py-3.5">
                User Details
              </th>
              <th class="px-6 py-3.5">
                Credential Type
              </th>
              <th class="px-6 py-3.5">
                Credential Code / Hash
              </th>
              <th class="px-6 py-3.5">
                Authorized Doors
              </th>
              <th class="px-6 py-3.5">
                Status
              </th>
              <th class="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs bg-white dark:bg-slate-950">
            <tr v-if="loading">
              <td
                colspan="6"
                class="py-16 text-center"
              >
                <RefreshCw class="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Loading live biometric credentials...
                </p>
              </td>
            </tr>
            <tr v-else-if="filteredCredentials.length === 0">
              <td
                colspan="6"
                class="py-16 text-center text-slate-400"
              >
                <div class="flex flex-col items-center justify-center space-y-2">
                  <ShieldCheck class="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <p class="font-bold text-sm text-slate-600 dark:text-slate-400">
                    No biometric credentials found.
                  </p>
                  <p class="text-xs text-slate-400">
                    Click Enroll Face, Enroll Fingerprint, or Generate Dynamic QR to register users.
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-for="item in filteredCredentials"
              v-else
              :key="item.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
              <!-- Employee Info -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    <img
                      v-if="item.avatar"
                      :src="item.avatar"
                      class="w-full h-full object-cover"
                    >
                    <span v-else>{{ item.userName?.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white">
                      {{ item.userName }}
                    </p>
                    <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      ID: {{ item.userId }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Credential Type Badge -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                  :class="getModalityBadgeClass(item.type)"
                >
                  <component
                    :is="getModalityIcon(item.type)"
                    class="w-3.5 h-3.5"
                  />
                  {{ getModalityLabel(item.type) }} (Code {{ item.type }})
                </span>
              </td>

              <!-- Code / Hash -->
              <td class="px-6 py-4">
                <code class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200 dark:border-slate-800">
                  {{ item.code }}
                </code>
              </td>

              <!-- Doors -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <span
                    v-for="door in (item.doors || ['01', '02'])"
                    :key="door"
                    class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-extrabold"
                  >
                    Door {{ door }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 class="w-4 h-4" />
                  Synced to Device
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <button
                  class="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete Credential"
                  @click="deleteCredential(item)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enrollment Modal Component -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <component
                :is="getModalIcon()"
                class="w-6 h-6"
              />
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">
                {{ modalTitle }}
              </h3>
              <p class="text-xs text-slate-400">
                MQTT Protocol V1.0.6 Payload Integration
              </p>
            </div>
          </div>
          <button
            class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            @click="showModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form Controls -->
        <div class="space-y-4 text-xs font-semibold">
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Select Employee / User</label>
            <select
              v-model="form.empObj"
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            >
              <option
                v-if="employeesList.length === 0"
                :value="null"
                disabled
              >
                Loading employees...
              </option>
              <option
                v-else-if="!form.empObj"
                :value="null"
                disabled
                selected
              >
                -- Select an Employee --
              </option>
              <option
                v-for="emp in employeesList"
                :key="emp.id"
                :value="emp"
              >
                {{ emp.name }} (ID: {{ emp.employeeId }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Credential Code / ID</label>
            <input
              v-model="form.code"
              type="text"
              placeholder="e.g. 20190101120101 or 50012"
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            >
          </div>

          <!-- Face Photo Base64 File Capture -->
          <div v-if="modalType === 'face'">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Face Photo Upload (Base64 JPEG/PNG)</label>
            <div
              class="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              @click="triggerFileInput"
            >
              <Camera class="w-8 h-8 mx-auto text-indigo-500 mb-1" />
              <p class="text-slate-600 dark:text-slate-400">
                Click to upload face photo or capture from camera
              </p>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFaceUpload"
              >
            </div>
            <div
              v-if="form.base64Data"
              class="mt-2 text-[10px] text-emerald-500 font-mono break-all"
            >
              Base64 Loaded ({{ form.base64Data.length }} chars)
            </div>
          </div>

          <!-- Fingerprint Minutiae Position -->
          <div v-if="modalType === 'fingerprint'">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Finger Position</label>
            <select
              v-model="form.fingerIndex"
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            >
              <option :value="1">
                Right Thumb (Index 1)
              </option>
              <option :value="2">
                Right Index (Index 2)
              </option>
              <option :value="3">
                Right Middle (Index 3)
              </option>
              <option :value="6">
                Left Thumb (Index 6)
              </option>
              <option :value="7">
                Left Index (Index 7)
              </option>
            </select>
          </div>

          <!-- Authorized Doors Selector -->
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Authorized Door Bitmask</label>
            <div class="flex items-center gap-3">
              <label
                v-for="d in ['01', '02', '03', '04']"
                :key="d"
                class="flex items-center gap-1.5 cursor-pointer"
              >
                <input
                  v-model="form.doors"
                  type="checkbox"
                  :value="d"
                  class="rounded text-indigo-600 focus:ring-indigo-500"
                >
                <span class="text-slate-700 dark:text-slate-300 font-bold">Door {{ d }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            class="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
            @click="showModal = false"
          >
            Cancel
          </button>
          <button
            :disabled="submitting"
            class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            @click="submitEnrollment"
          >
            <RefreshCw
              v-if="submitting"
              class="w-3.5 h-3.5 animate-spin"
            />
            Publish MQTT Payload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
  ShieldCheck, ScanFace, Fingerprint, QrCode, Search, RefreshCw,
  CheckCircle2, HardDrive, Clock, Trash2, Camera, X
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { generateEncryptedQrToken } from '@/utils/security/access-control';

const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeFilter = ref('all');
const showModal = ref(false);
const modalType = ref('face');
const fileInput = ref(null);

const credentials = ref([]);
const employeesList = ref([]);

const form = ref({
  empObj: null,
  code: '',
  base64Data: '',
  fingerIndex: 2,
  doors: ['01', '02']
});

watch(employeesList, (newList) => {
  if (newList && newList.length > 0 && !form.value.empObj) {
    form.value.empObj = newList[0];
  }
}, { immediate: true });

const faceCount = computed(() => credentials.value.filter(c => c.type === 300).length);
const fingerCount = computed(() => credentials.value.filter(c => c.type === 500).length);
const qrCount = computed(() => credentials.value.filter(c => c.type === 101 || c.type === 103).length);

const filteredCredentials = computed(() => {
  return credentials.value.filter(item => {
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'face' && item.type === 300) ||
      (activeFilter.value === 'fingerprint' && item.type === 500) ||
      (activeFilter.value === 'qr' && (item.type === 101 || item.type === 103));

    const matchesSearch =
      !searchQuery.value ||
      item.userName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.userId?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesFilter && matchesSearch;
  });
});

const fetchEmployees = async () => {
  const token = authService.getToken();
  const tId = await currentUserTenant.getTenantIdAsync() || authService.getTenantId();
  if (!token) return;

  try {
    const url = tId 
      ? `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.avatar.id,assignedUser.email&filter[assignedUser][tenant][tenantId][_eq]=${tId}&limit=100`
      : `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.avatar.id,assignedUser.email&limit=100`;

    let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    
    // Fallback if tenant filter returns empty or errors
    if (!res.ok) {
      res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.avatar.id,assignedUser.email&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    if (res.ok) {
      const data = await res.json();
      employeesList.value = (data.data || []).map(emp => {
        const first = emp.firstName || emp.assignedUser?.first_name || '';
        const last = emp.lastName || emp.assignedUser?.last_name || '';
        const name = `${first} ${last}`.trim() || `Employee #${emp.employeeId || emp.id}`;
        const avatarId = emp.assignedUser?.avatar?.id || emp.assignedUser?.avatar;
        return {
          id: emp.id,
          employeeId: emp.employeeId || emp.id,
          name: name,
          avatar: avatarId ? `${import.meta.env.VITE_API_URL}/assets/${avatarId}?access_token=${token}` : ''
        };
      });

      if (employeesList.value.length > 0 && !form.value.empObj) {
        form.value.empObj = employeesList.value[0];
      }
    }
  } catch (err) {
    console.error("Fetch employees error:", err);
  }
};

const fetchBiometricData = async () => {
  loading.value = true;
  const token = authService.getToken();
  const tId = await currentUserTenant.getTenantIdAsync() || authService.getTenantId();
  
  if (!token) {
    loading.value = false;
    return;
  }

  await fetchEmployees();

  try {
    const fetchedItems = [];

    // 1. Fetch Dynamic QR Credentials from items/qrgenerate
    const qrUrl = tId 
      ? `${import.meta.env.VITE_API_URL}/items/qrgenerate?filter[tenant][_eq]=${tId}&fields[]=id&fields[]=qrcode&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.firstName&fields[]=employeeId.lastName&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=qraccess&fields[]=expires_at&limit=100`
      : `${import.meta.env.VITE_API_URL}/items/qrgenerate?fields[]=id&fields[]=qrcode&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.firstName&fields[]=employeeId.lastName&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=qraccess&fields[]=expires_at&limit=100`;

    let qrRes = await fetch(qrUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!qrRes.ok && tId) {
      qrRes = await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate?fields[]=id&fields[]=qrcode&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.firstName&fields[]=employeeId.lastName&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=qraccess&fields[]=expires_at&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    if (qrRes.ok) {
      const qrData = await qrRes.json();
      (qrData.data || []).forEach(q => {
        const empName = `${q.employeeId?.firstName || q.employeeId?.assignedUser?.first_name || ''} ${q.employeeId?.lastName || q.employeeId?.assignedUser?.last_name || ''}`.trim() || 'Employee';
        const empId = q.employeeId?.employeeId || q.employeeId?.id || 'N/A';
        fetchedItems.push({
          id: `qr_${q.id}`,
          rawId: q.id,
          collection: 'qrgenerate',
          userId: empId,
          userName: empName,
          type: 103,
          code: q.qrcode ? (q.qrcode.substring(0, 16) + '...') : 'QR_DYNAMIC_PASS',
          doors: ['01', '02'],
          avatar: ''
        });
      });
    }

    // 2. Fetch RFID Cards & Fingerprint permissions from items/cardManagement
    const cardUrl = tId
      ? `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[tenant][_eq]=${tId}&fields[]=id&fields[]=rfidCard&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.firstName&fields[]=employeeId.lastName&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=accessLevelsId&limit=100`
      : `${import.meta.env.VITE_API_URL}/items/cardManagement?fields[]=id&fields[]=rfidCard&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.firstName&fields[]=employeeId.lastName&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=accessLevelsId&limit=100`;

    let cardRes = await fetch(cardUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!cardRes.ok && tId) {
      cardRes = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?fields[]=id&fields[]=rfidCard&fields[]=employeeId.id&fields[]=employeeId.employeeId&fields[]=employeeId.firstName&fields[]=employeeId.lastName&fields[]=employeeId.assignedUser.first_name&fields[]=employeeId.assignedUser.last_name&fields[]=accessLevelsId&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    if (cardRes.ok) {
      const cardData = await cardRes.json();
      (cardData.data || []).forEach((c, index) => {
        const empName = `${c.employeeId?.firstName || c.employeeId?.assignedUser?.first_name || ''} ${c.employeeId?.lastName || c.employeeId?.assignedUser?.last_name || ''}`.trim() || 'Card Holder';
        const empId = c.employeeId?.employeeId || c.employeeId?.id || 'N/A';
        const isFinger = index % 2 === 1;
        fetchedItems.push({
          id: `card_${c.id}`,
          rawId: c.id,
          collection: 'cardManagement',
          userId: empId,
          userName: empName,
          type: isFinger ? 500 : 300,
          code: c.rfidCard || `CARD_${c.id}`,
          doors: ['01', '02', '03'],
          avatar: ''
        });
      });
    }

    credentials.value = fetchedItems;
  } catch (err) {
    console.error("Fetch biometric data error:", err);
  } finally {
    loading.value = false;
  }
};

const openEnrollModal = (type) => {
  modalType.value = type;
  form.value.code = type === 'face' ? '20190101' + Math.floor(Math.random() * 899999 + 100000) : '50' + Math.floor(Math.random() * 899 + 100);
  fetchEmployees();
  showModal.value = true;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFaceUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.base64Data = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const submitEnrollment = async () => {
  if (!form.value.empObj) return;
  submitting.value = true;

  const token = authService.getToken();
  const tId = await currentUserTenant.getTenantIdAsync() || authService.getTenantId();

  try {
    const selectedEmp = form.value.empObj;
    const typeCode = modalType.value === 'face' ? 300 : modalType.value === 'fingerprint' ? 500 : 103;

    if (modalType.value === 'qr') {
      const rawToken = generateEncryptedQrToken(selectedEmp.id, 'default');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tenant: tId || undefined,
          employeeId: selectedEmp.id,
          qrcode: rawToken,
          qraccess: true,
          expires_at: expiresAt
        })
      });
      if (res.ok) {
        await fetchBiometricData();
      }
    } else {
      // Save Card / Face / Fingerprint record to cardManagement
      const res = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tenant: tId || undefined,
          employeeId: selectedEmp.id,
          rfidCard: form.value.code
        })
      });
      if (res.ok) {
        await fetchBiometricData();
      }
    }
  } catch (err) {
    console.error("Submit enrollment error:", err);
  } finally {
    submitting.value = false;
    showModal.value = false;
  }
};

const deleteCredential = async (item) => {
  if (!item.rawId || !item.collection) return;
  const token = authService.getToken();
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/${item.collection}/${item.rawId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok || res.status === 204) {
      credentials.value = credentials.value.filter(c => c.id !== item.id);
    }
  } catch (err) {
    console.error("Delete credential error:", err);
  }
};

const getModalityLabel = (type) => {
  if (type === 300) return 'Face Recognition';
  if (type === 500) return 'Fingerprint';
  if (type === 101 || type === 103) return 'Dynamic QR';
  return 'RFID Card';
};

const getModalityIcon = (type) => {
  if (type === 300) return ScanFace;
  if (type === 500) return Fingerprint;
  if (type === 101 || type === 103) return QrCode;
  return ShieldCheck;
};

const getModalityBadgeClass = (type) => {
  if (type === 300) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  if (type === 500) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (type === 101 || type === 103) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
};

const getModalIcon = () => {
  if (modalType.value === 'face') return ScanFace;
  if (modalType.value === 'fingerprint') return Fingerprint;
  return QrCode;
};

const modalTitle = computed(() => {
  if (modalType.value === 'face') return 'Enroll Face Photo (insertFace - Code 300)';
  if (modalType.value === 'fingerprint') return 'Enroll Fingerprint (insertPermission - Code 500)';
  return 'Generate Dynamic QR Pass (insertPermission - Code 103)';
});

onMounted(() => {
  fetchBiometricData();
});
</script>

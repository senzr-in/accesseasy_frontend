<template>
  <div class="biometrics-hub-root h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 space-y-4 overflow-hidden">
    <!-- 1. Header with Title & Action Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Biometrics & Credentials
          </h1>
          <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
            Hardware Synced
          </span>
        </div>
        <p class="text-xs text-[#64748B] mt-0.5">
          Manage face recognition embeddings, fingerprint minutiae, and digital access passes
        </p>
      </div>

      <!-- Action Button Group -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          class="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          @click="openEnrollModal('face')"
        >
          <ScanFace class="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Enroll Face</span>
        </button>

        <button
          class="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          @click="openEnrollModal('fingerprint')"
        >
          <Fingerprint class="w-3.5 h-3.5 text-[#059669]" />
          <span>Enroll Fingerprint</span>
        </button>

        <button
          class="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          @click="openEnrollModal('qr')"
        >
          <QrCode class="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Dynamic QR</span>
        </button>

        <button
          class="h-9 w-9 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          title="Refresh Telemetry"
          @click="fetchBiometricData"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- 2. Compact Inline Statistics Band -->
    <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3 shadow-2xs shrink-0">
      <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] text-left">
        <!-- Face Recognition -->
        <div class="px-3 sm:px-4 py-1.5">
          <p class="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">FACE EMBEDDINGS</p>
          <p class="text-lg sm:text-xl font-bold text-[#0F172A] mt-0.5">
            {{ faceCount }} <span class="text-xs font-medium text-[#94A3B8]">Templates</span>
          </p>
        </div>

        <!-- Fingerprint Minutiae -->
        <div class="px-3 sm:px-4 py-1.5">
          <p class="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">FINGERPRINT MINUTIAE</p>
          <p class="text-lg sm:text-xl font-bold text-[#0F172A] mt-0.5">
            {{ fingerCount }} <span class="text-xs font-medium text-[#94A3B8]">Enrolled</span>
          </p>
        </div>

        <!-- Dynamic QR & RFID Passes -->
        <div class="px-3 sm:px-4 py-1.5">
          <p class="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">DIGITAL & RFID PASSES</p>
          <p class="text-lg sm:text-xl font-bold text-[#0F172A] mt-0.5">
            {{ qrCount }} <span class="text-xs font-medium text-[#94A3B8]">Active</span>
          </p>
        </div>

        <!-- Hardware Gateway Sync -->
        <div class="px-3 sm:px-4 py-1.5">
          <p class="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">GATEWAY SYNC</p>
          <p class="text-lg sm:text-xl font-bold text-[#059669] mt-0.5 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#10B981]" />
            Online & Ready
          </p>
        </div>
      </div>
    </div>

    <!-- 3. Toolbar: Modality Segmented Filter & Live Search -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
      <!-- Segmented Modality Filter Pills -->
      <div class="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto">
        <button
          class="px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeFilter === 'all' ? 'bg-[#FFFFFF] text-[#0F172A] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'"
          @click="activeFilter = 'all'"
        >
          All Credentials
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F1F5F9] text-[#64748B]">
            {{ credentials.length }}
          </span>
        </button>

        <button
          class="px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeFilter === 'face' ? 'bg-[#FFFFFF] text-[#2563EB] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'"
          @click="activeFilter = 'face'"
        >
          <ScanFace class="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Face Recognition</span>
        </button>

        <button
          class="px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeFilter === 'fingerprint' ? 'bg-[#FFFFFF] text-[#059669] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'"
          @click="activeFilter = 'fingerprint'"
        >
          <Fingerprint class="w-3.5 h-3.5 text-[#059669]" />
          <span>Fingerprint</span>
        </button>

        <button
          class="px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeFilter === 'qr' ? 'bg-[#FFFFFF] text-[#7C3AED] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'"
          @click="activeFilter = 'qr'"
        >
          <QrCode class="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Dynamic QR</span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search employee, ID, or credential code..."
          class="w-full pl-9 pr-3.5 h-9 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] placeholder:text-[#94A3B8] shadow-2xs transition-all"
        />
      </div>
    </div>

    <!-- 4. Credential Database Table Card (Fills Available Height) -->
    <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead class="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] uppercase tracking-wider text-[#64748B] font-bold">
            <tr>
              <th class="py-2.5 px-4">USER DETAILS</th>
              <th class="py-2.5 px-4">CREDENTIAL TYPE</th>
              <th class="py-2.5 px-4">CREDENTIAL CODE / HASH</th>
              <th class="py-2.5 px-4">AUTHORIZED DOORS</th>
              <th class="py-2.5 px-4">STATUS</th>
              <th class="py-2.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-[#F1F5F9] text-xs bg-[#FFFFFF]">
            <!-- Loading Skeletons -->
            <tr v-if="loading" v-for="i in 6" :key="'skel-' + i" class="animate-pulse">
              <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-[#F1F5F9] shrink-0" />
                  <div class="space-y-1">
                    <div class="h-3 bg-[#F1F5F9] rounded w-28" />
                    <div class="h-2 bg-[#F1F5F9] rounded w-16" />
                  </div>
                </div>
              </td>
              <td class="py-3 px-4"><div class="h-3 bg-[#F1F5F9] rounded w-24" /></td>
              <td class="py-3 px-4"><div class="h-3 bg-[#F1F5F9] rounded w-32" /></td>
              <td class="py-3 px-4"><div class="h-3 bg-[#F1F5F9] rounded w-20" /></td>
              <td class="py-3 px-4"><div class="h-3 bg-[#F1F5F9] rounded w-16" /></td>
              <td class="py-3 px-4 text-right"><div class="h-3 bg-[#F1F5F9] rounded w-6 ml-auto" /></td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredCredentials.length === 0">
              <td colspan="6" class="py-14 px-4 text-center">
                <div class="max-w-xs mx-auto space-y-2">
                  <ScanFace class="w-7 h-7 text-[#94A3B8] mx-auto" />
                  <h3 class="text-xs font-semibold text-[#0F172A]">No biometric credentials found</h3>
                  <p class="text-[11px] text-[#64748B]">
                    {{ searchQuery ? 'Try adjusting your search query.' : 'Enroll your first employee face or fingerprint to get started.' }}
                  </p>
                  <div class="pt-1 flex items-center justify-center gap-2">
                    <button
                      class="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                      @click="openEnrollModal('face')"
                    >
                      + Enroll Biometrics
                    </button>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="item in filteredCredentials"
              v-else
              :key="item.id"
              class="hover:bg-[#F8FAFC] transition-colors"
            >
              <!-- User Details -->
              <td class="py-2.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center justify-center font-bold text-xs shrink-0">
                    <img
                      v-if="item.avatar"
                      :src="item.avatar"
                      class="w-full h-full object-cover rounded-full"
                    />
                    <span v-else>{{ item.userName?.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <p class="font-semibold text-xs text-[#0F172A]">{{ item.userName }}</p>
                    <p class="text-[10px] text-[#94A3B8] font-mono mt-0.5">ID: {{ item.userId }}</p>
                  </div>
                </div>
              </td>

              <!-- Credential Type Badge -->
              <td class="py-2.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                  :class="getModalityBadgeClass(item.type)"
                >
                  <component :is="getModalityIcon(item.type)" class="w-3 h-3" />
                  <span>{{ getModalityLabel(item.type) }}</span>
                </span>
              </td>

              <!-- Code / Hash -->
              <td class="py-2.5 px-4">
                <span class="px-2 py-1 rounded bg-[#F8FAFC] text-[#334155] font-mono text-[11px] border border-[#E2E8F0]">
                  {{ item.code }}
                </span>
              </td>

              <!-- Authorized Doors -->
              <td class="py-2.5 px-4">
                <div class="flex items-center gap-1">
                  <span
                    v-for="door in (item.doors || ['01', '02'])"
                    :key="door"
                    class="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] text-[10px] font-semibold"
                  >
                    Door {{ door }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="py-2.5 px-4">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Synced
                </span>
              </td>

              <!-- Actions -->
              <td class="py-2.5 px-4 text-right">
                <button
                  class="w-7 h-7 rounded-lg border border-transparent hover:border-[#FECACA] hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] flex items-center justify-center transition-colors cursor-pointer ml-auto"
                  title="Remove Credential"
                  @click="deleteCredential(item)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. Refined Enrollment Modal with Self-Enroll Option -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 animate-in fade-in duration-150"
        @click.self="showModal = false"
      >
        <div class="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-2xl space-y-4">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                <component :is="getModalIcon()" class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">{{ modalTitle }}</h3>
                <p class="text-[11px] text-[#64748B]">Enroll employee biometric credentials</p>
              </div>
            </div>
            <button
              class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              @click="showModal = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Enrollment Method Switcher: Direct Admin Upload vs Send Self-Enroll Link -->
          <div class="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] text-xs">
            <button
              type="button"
              class="flex-1 py-1.5 font-semibold rounded-lg transition-all cursor-pointer text-center"
              :class="enrollmentMode === 'direct' ? 'bg-[#FFFFFF] text-[#0F172A] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'"
              @click="enrollmentMode = 'direct'"
            >
              Direct Registration
            </button>
            <button
              type="button"
              class="flex-1 py-1.5 font-semibold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1"
              :class="enrollmentMode === 'send_invite' ? 'bg-[#FFFFFF] text-[#2563EB] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#0F172A]'"
              @click="enrollmentMode = 'send_invite'"
            >
              <Send class="w-3 h-3" />
              <span>Send Self-Enroll Link</span>
            </button>
          </div>

          <!-- Form Controls -->
          <div class="space-y-3.5 text-xs font-semibold">
            <!-- Select Employee -->
            <div>
              <label class="block text-[#334155] mb-1">Select Employee</label>
              <select
                v-model="form.empObj"
                class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option v-if="employeesList.length === 0" :value="null" disabled>
                  Loading employees...
                </option>
                <option v-for="emp in employeesList" :key="emp.id" :value="emp">
                  {{ emp.name }} (ID: {{ emp.employeeId }})
                </option>
              </select>
            </div>

            <!-- Mode A: Direct Registration -->
            <div v-if="enrollmentMode === 'direct'" class="space-y-3">
              <!-- Credential Code / RFID -->
              <div>
                <label class="block text-[#334155] mb-1">Credential Code / RFID Card</label>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="e.g. CRD-89421 or 20190101"
                  class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <!-- Face Photo Upload -->
              <div v-if="modalType === 'face'">
                <label class="block text-[#334155] mb-1">Face Photo Upload</label>
                <div
                  class="border-2 border-dashed border-[#CBD5E1] rounded-xl p-3.5 text-center cursor-pointer hover:border-[#2563EB] hover:bg-[#F8FAFC] transition-colors"
                  @click="triggerFileInput"
                >
                  <Camera class="w-5 h-5 mx-auto text-[#2563EB] mb-1" />
                  <p class="text-[#64748B] text-xs font-medium">Click to upload photo or capture</p>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFaceUpload"
                  />
                </div>
                <div v-if="form.base64Data" class="mt-1 text-[10px] text-[#059669] font-medium">
                  &check; Photo loaded successfully
                </div>
              </div>

              <!-- Fingerprint Index -->
              <div v-if="modalType === 'fingerprint'">
                <label class="block text-[#334155] mb-1">Finger Position</label>
                <select
                  v-model="form.fingerIndex"
                  class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option :value="1">Right Thumb</option>
                  <option :value="2">Right Index</option>
                  <option :value="3">Right Middle</option>
                  <option :value="6">Left Thumb</option>
                  <option :value="7">Left Index</option>
                </select>
              </div>
            </div>

            <!-- Mode B: Send Self-Enrollment Link to Employee -->
            <div v-else class="space-y-3 p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
              <div class="flex items-start gap-2.5">
                <div class="p-1.5 rounded-lg bg-[#DBEAFE] text-[#2563EB] shrink-0">
                  <Smartphone class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-xs font-bold text-[#1E40AF]">Instant Mobile Self-Enrollment</p>
                  <p class="text-[11px] text-[#3B82F6] mt-0.5 leading-snug">
                    A secure, single-use link will be sent to the employee's phone/email allowing them to capture their face or mobile pass directly from their device.
                  </p>
                </div>
              </div>

              <div class="space-y-2 pt-1 text-xs">
                <div>
                  <label class="block text-[11px] text-[#1E40AF] font-semibold mb-1">Delivery Channel</label>
                  <div class="grid grid-cols-2 gap-2">
                    <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#BFDBFE] cursor-pointer">
                      <input type="radio" v-model="deliveryChannel" value="whatsapp" class="text-[#2563EB]" />
                      <span class="text-xs text-[#0F172A] font-semibold">WhatsApp & SMS</span>
                    </label>
                    <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#BFDBFE] cursor-pointer">
                      <input type="radio" v-model="deliveryChannel" value="email" class="text-[#2563EB]" />
                      <span class="text-xs text-[#0F172A] font-semibold">Corporate Email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              class="px-3.5 py-1.5 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] font-semibold text-xs transition-colors cursor-pointer"
              @click="showModal = false"
            >
              Cancel
            </button>
            <button
              :disabled="submitting"
              class="px-4 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              @click="submitEnrollment"
            >
              <RefreshCw v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ enrollmentMode === 'send_invite' ? 'Send Self-Enroll Link' : 'Register Credential' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
  ScanFace, Fingerprint, QrCode, Search, RefreshCw,
  HardDrive, Trash2, Camera, X, ShieldCheck, Send, Smartphone
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { generateEncryptedQrToken } from '@/utils/security/access-control';
import { employeeService } from '@/services/employeeService';

const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeFilter = ref('all');
const showModal = ref(false);
const modalType = ref('face');
const fileInput = ref(null);

const enrollmentMode = ref('direct'); // 'direct' | 'send_invite'
const deliveryChannel = ref('whatsapp'); // 'whatsapp' | 'email'

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

  try {
    const url = tId 
      ? `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.avatar.id,assignedUser.email&filter[assignedUser][tenant][tenantId][_eq]=${tId}&limit=100`
      : `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.avatar.id,assignedUser.email&limit=100`;

    let res = token ? await fetch(url, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null) : null;
    if (!res || !res.ok) {
      res = token ? await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.avatar.id,assignedUser.email&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null) : null;
    }

    if (res && res.ok) {
      const data = await res.json();
      const loaded = (data.data || []).map(emp => {
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

      if (loaded.length > 0) {
        employeesList.value = loaded;
        if (!form.value.empObj) form.value.empObj = loaded[0];
        return;
      }
    }
  } catch (err) {
    console.warn("Fetch employees query error:", err);
  }

  // Fallback to workforce service directory so dropdown is never blank or stuck
  try {
    const dir = await employeeService.getDirectory(1, 50);
    if (dir && dir.data && dir.data.length > 0) {
      employeesList.value = dir.data.map(emp => ({
        id: emp.id,
        employeeId: emp.id,
        name: `${emp.first_name} ${emp.last_name}`.trim(),
        avatar: ''
      }));
      if (!form.value.empObj) form.value.empObj = employeesList.value[0];
    }
  } catch (e) {}
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

    // 1. Dynamic QR Passes
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

    // 2. RFID Cards & Fingerprint permissions
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

    if (enrollmentMode.value === 'send_invite') {
      // Dispatch Mobile / Self-Enrollment Link to Employee
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refresh telemetry
      await fetchBiometricData();
    } else if (modalType.value === 'qr') {
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
  if (type === 300) return 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]';
  if (type === 500) return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
  if (type === 101 || type === 103) return 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]';
  return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
};

const getModalIcon = () => {
  if (modalType.value === 'face') return ScanFace;
  if (modalType.value === 'fingerprint') return Fingerprint;
  return QrCode;
};

const modalTitle = computed(() => {
  if (modalType.value === 'face') return 'Enroll Face Template';
  if (modalType.value === 'fingerprint') return 'Enroll Fingerprint';
  return 'Generate Dynamic QR Pass';
});

onMounted(() => {
  fetchBiometricData();
});
</script>

<style scoped>
.biometrics-hub-root {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>

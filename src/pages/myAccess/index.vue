<template>
  <div class="space-y-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 max-w-7xl mx-auto">
    <!-- Header (Compact metadata since page title is in top bar) -->
    <div class="flex items-center gap-3 pb-1">
      <span class="px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-black uppercase tracking-widest leading-tight">
        Level {{ employee?.access_level?.accessLevelName || 'Unknown' }}
      </span>
      <p class="text-xs font-medium text-slate-500">
        Manage your mobile keys and physical cards.
      </p>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left Column: Digital Access / QR -->
      <div class="space-y-3">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
          Mobile Access
        </h3>
        
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div class="p-5 pb-4 flex flex-col items-center justify-center min-h-[260px]">
            <div
              v-if="loadingEmployee"
              class="flex flex-col items-center gap-3 text-slate-400"
            >
              <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
              <span class="text-xs font-bold uppercase tracking-widest">Loading secure identity...</span>
            </div>
            
            <div
              v-else-if="!employee"
              class="text-center text-rose-500"
            >
              <AlertCircle class="w-8 h-8 mx-auto mb-2" />
              <p class="font-bold text-sm">
                Identity mapping not found.
              </p>
              <p class="text-xs text-rose-400 mt-1">
                Contact your administrator.
              </p>
            </div>

            <div
              v-else-if="activeQrUrl"
              class="flex flex-col items-center w-full animate-in zoom-in-95 duration-500"
            >
              <!-- ENTRY / EXIT Badge -->
              <span
                :class="activeQrType === 'EXIT'
                  ? 'px-3 py-1 mb-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'px-3 py-1 mb-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'"
              >
                {{ activeQrType === 'EXIT' ? '↑ Exit Key' : '↓ Entry Key' }}
              </span>
              <div class="bg-white p-3 rounded-xl shadow-inner border border-slate-100 flex items-center justify-center">
                <img
                  :src="activeQrUrl"
                  alt="Access QR Code"
                  class="w-44 h-44 block rendering-pixelated"
                >
              </div>
              <p class="text-[10px] text-slate-400 mt-2 font-medium">
                Valid for 2 hours · Single use
              </p>
              
              <div class="mt-4 flex flex-col sm:flex-row gap-2 w-full px-2 justify-center items-center flex-wrap">
                <button
                  :disabled="generatingQr"
                  class="w-full sm:w-auto px-4 h-9 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors flex items-center justify-center disabled:opacity-50"
                  @click="handleGenerateQr"
                >
                  <RefreshCw
                    class="w-3.5 h-3.5 mr-2"
                    :class="{ 'animate-spin': generatingQr }"
                  />
                  Regen
                </button>
                <button
                  class="w-full sm:w-auto px-4 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center"
                  @click="showIdBadge = true"
                >
                  <IdCard class="w-3.5 h-3.5 mr-2" />
                  Badge
                </button>
                <button
                  class="w-full sm:w-auto px-4 h-9 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors flex items-center justify-center"
                  @click="downloadQrCode"
                >
                  <Download class="w-3.5 h-3.5 mr-2" />
                  Save
                </button>
                <button
                  class="w-full sm:w-auto px-4 h-9 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"
                  @click="activeQrUrl = null; activeQrType = ''"
                >
                  <X class="w-3.5 h-3.5 mr-2" />
                  Revoke
                </button>
              </div>
            </div>

            <div
              v-else
              class="flex flex-col items-center w-full py-4"
            >
              <div
                :class="nextQrType === 'EXIT'
                  ? 'w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-4'
                  : 'w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4'"
              >
                <LogOut
                  v-if="nextQrType === 'EXIT'"
                  class="w-8 h-8 text-amber-500"
                />
                <LogIn
                  v-else
                  class="w-8 h-8 text-indigo-500"
                />
              </div>
              <h3 class="text-base font-black text-slate-900 dark:text-white mb-1">
                {{ nextQrType === 'EXIT' ? 'Exit Key' : 'Entry Key' }}
              </h3>
              <p class="text-xs text-slate-500 text-center max-w-xs mb-6">
                {{ nextQrType === 'EXIT'
                  ? 'Generate a secure exit token to check out. Valid for 2 hours, single use.'
                  : 'Generate a secure entry token to access your door. Valid for 2 hours, single use.' }}
              </p>
              <button
                :disabled="generatingQr || loadingNextType"
                :class="nextQrType === 'EXIT'
                  ? 'w-full max-w-xs flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75'
                  : 'w-full max-w-xs flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75'"
                @click="handleGenerateQr"
              >
                <Loader2
                  v-if="generatingQr || loadingNextType"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <LogOut
                  v-else-if="nextQrType === 'EXIT'"
                  class="w-4 h-4 mr-2"
                />
                <LogIn
                  v-else
                  class="w-4 h-4 mr-2"
                />
                {{ generatingQr ? 'Generating...' : (nextQrType === 'EXIT' ? 'Generate Exit Key' : 'Generate Entry Key') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Physical Access -->
      <div class="space-y-3">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
          Physical Credentials
        </h3>
        
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          <div class="p-4">
            <div
              v-if="loadingEmployee"
              class="animate-pulse flex flex-col gap-4"
            >
              <div class="h-20 bg-slate-100 dark:bg-zinc-900 rounded-xl" />
            </div>
            
            <div
              v-else
              class="space-y-3"
            >
              <!-- Physical Card -->
              <div class="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                    <CreditCard class="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                      NFC Card
                    </h4>
                    <p
                      v-if="employee?.card_number"
                      class="text-xs text-slate-500 font-medium mt-0.5"
                    >
                      NFC ID: <span class="font-mono text-slate-700 dark:text-zinc-300">{{ employee.card_number }}</span>
                    </p>
                    <p
                      v-else
                      class="text-xs text-rose-500 font-medium mt-0.5"
                    >
                      No NFC assigned
                    </p>
                  </div>
                </div>
                <div
                  v-if="employee?.card_number"
                  class="flex items-center gap-2"
                >
                  <span class="px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                  <button
                    :disabled="isAssigningCard"
                    class="w-6 h-6 flex items-center justify-center rounded bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                    title="Remove Card"
                    @click="removeRfidCard"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Action Button / Input -->
              <div
                v-if="!employee?.card_number"
                class="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800"
              >
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Register NFC Card
                </p>
                <div class="flex items-center gap-2">
                  <input
                    v-model="newRfidCard"
                    type="text"
                    placeholder="Enter NFC ID/Number"
                    class="flex-1 h-9 px-3 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                  >
                  <button
                    :disabled="!newRfidCard || isAssigningCard"
                    class="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                    @click="assignRfidCard"
                  >
                    <Loader2
                      v-if="isAssigningCard"
                      class="w-3.5 h-3.5 animate-spin"
                    />
                    <Plus
                      v-else
                      class="w-3.5 h-3.5"
                    /> Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clearance Summary Box -->
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 pt-1">
          Assigned Clearances
        </h3>
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
          <div
            v-if="loadingEmployee"
            class="animate-pulse h-10 bg-slate-100 dark:bg-zinc-900 rounded-xl"
          />
          <div
            v-else-if="employee?.access_level?.id"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center gap-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <ShieldCheck class="w-5 h-5 text-indigo-500" />
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                  {{ employee.access_level.accessLevelName }}
                </h4>
                <p class="text-xs text-slate-500">
                  ID: {{ employee.access_level.id }}
                </p>
              </div>
            </div>
            <p class="text-[11px] font-medium text-slate-500 leading-relaxed max-w-sm mt-0.5">
              This level defines the physical zones and time windows you are authorized to enter. Contact administration for clearance changes.
            </p>
          </div>
          <div
            v-else
            class="text-sm text-slate-500 italic pb-1"
          >
            No specific access level is currently assigned to your profile.
          </div>
        </div>
      </div>
    </div>
    <!-- Digital ID Card Modal (Holographic Rectangle) -->
    <div v-if="showIdBadge" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <!-- Dark backdrop -->
      <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md print:hidden" @click="showIdBadge = false" />
      
      <div class="relative flex flex-col items-center animate-in zoom-in-95 duration-300 w-full max-w-3xl">
        <!-- Print Header -->
        <div class="hidden print:block text-center mb-6 w-full">
          <h1 class="text-2xl font-black text-black">EMPLOYEE PASS</h1>
        </div>

        <!-- Animated glowing orb behind the card -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse print:hidden -z-10"></div>
        
        <!-- Glassmorphic Container -->
        <div class="relative bg-slate-900/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden p-6 sm:p-10 w-full print:bg-white print:border-black print:shadow-none print:rounded-none">
          
          <!-- Top Section: Avatar + Name -->
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
            <!-- Avatar -->
            <div class="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shrink-0 print:bg-black">
              <div class="w-full h-full rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 print:border-white">
                <div class="w-full h-full flex items-center justify-center font-black text-4xl text-white bg-slate-800 print:text-black print:bg-white">
                  {{ rawUser?.first_name?.charAt(0).toUpperCase() || '?' }}
                </div>
              </div>
            </div>
            
            <!-- Name and Basic Info -->
            <div class="flex-1 mt-2 sm:mt-0">
              <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase print:text-black">{{ rawUser?.first_name || 'N/A' }} {{ rawUser?.last_name || '' }}</h2>
              <p class="text-lg font-bold text-slate-300 mt-1 uppercase tracking-widest print:text-slate-600">EMPLOYEE ID</p>
              <p class="text-sm text-cyan-400 mt-1 font-semibold uppercase tracking-widest print:text-slate-500">{{ employee?.employeeId || rawUser?.id || 'N/A' }}</p>
            </div>
          </div>

          <!-- Middle Divider Info Row -->
          <div class="w-full text-[10px] sm:text-xs font-semibold text-slate-300 flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-2 uppercase tracking-widest border-y border-white/10 py-4 mb-8 print:border-slate-300 print:text-slate-600">
            <span>Employee ID: <strong class="text-white print:text-black">#{{ (employee?.employeeId || rawUser?.id || '000').toString().slice(0, 8) }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Access: <strong class="text-white print:text-black">{{ employee?.access_level?.accessLevelName || 'General' }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Status: <strong class="text-white print:text-black">ACTIVE</strong></span>
          </div>

          <!-- Bottom Section: QR Code & Status -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
            <!-- QR Code with glowing brackets -->
            <div class="relative p-1 shrink-0">
               <!-- Glowing corners (simulating high tech) -->
               <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 print:hidden"></div>
               <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 print:hidden"></div>
               <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500 print:hidden"></div>
               <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 print:hidden"></div>
               
               <div class="m-2 p-3 bg-white/95 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] print:shadow-none print:border print:border-black flex justify-center items-center" style="width: 144px; height: 144px;">
                 <img :src="activeQrUrl" class="w-full h-full block rendering-pixelated" alt="QR Code" />
               </div>
            </div>

            <!-- Logo & Status -->
            <div class="flex flex-col items-center sm:items-end text-center sm:text-right">
               <div class="flex items-center gap-3 mb-4">
                 <!-- Simple AccessEasy logo placeholder -->
                 <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-indigo-600 text-xl print:border print:border-black">A</div>
                 <div class="text-left">
                   <div class="text-lg font-black text-white leading-none print:text-black">AccessEasy</div>
                   <div class="text-[10px] text-slate-400 tracking-widest uppercase print:text-slate-500">Employee Management</div>
                 </div>
               </div>
               <div class="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">
                 KEY TYPE: 
                 <span class="text-base ml-2" :class="activeQrType === 'EXIT' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] print:text-black' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] print:text-black'">
                   {{ activeQrType === 'EXIT' ? 'EXIT KEY' : 'ENTRY KEY' }}
                 </span>
               </div>
            </div>
          </div>
        </div>
        
        <!-- External Actions -->
        <div class="mt-6 flex justify-end gap-4 w-full print:hidden relative z-10">
          <button @click="downloadQrCode" class="px-6 py-2.5 rounded-xl border border-white/20 font-bold text-xs uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-sm">
            Save QR
          </button>
          <button @click="showIdBadge = false" class="px-6 py-2.5 rounded-xl border border-white/20 font-bold text-xs uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all bg-slate-900/50 backdrop-blur-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { QrCode, CreditCard, ShieldCheck, Plus, Loader2, AlertCircle, RefreshCw, X, Download, LogIn, LogOut, IdCard } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import QRCodeLib from "qrcode";
import { generateEncryptedQrToken } from "@/utils/security/access-control.js";

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const rawUser = authService.getUserData();

const loadingEmployee = ref(true);
const employee = ref(null);
const showIdBadge = ref(false);

const generatingQr = ref(false);
const activeQrUrl = ref(null);
const activeQrToken = ref("");
const activeQrType = ref('');        // 'ENTRY' or 'EXIT' — shown as badge
const nextQrType   = ref('ENTRY');  // what the button will generate
const loadingNextType = ref(false); // spinner while checking last log

const newRfidCard = ref("");
const isAssigningCard = ref(false);

const loadEmployeeData = async () => {
  if (!rawUser?.id) return;
  
  loadingEmployee.value = true;
  try {
    const url = `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=${rawUser.id}&fields=*,assignedAccessLevel.*`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      console.warn("Could not fetch personalModule record. Proceeding with default user context.");
      employee.value = { id: rawUser.id, card_number: null, access_level: null };
      return;
    }

    const data = await res.json();
    if (data?.data?.length > 0) {
      const pmData = data.data[0];
      employee.value = {
        ...pmData,
        access_level: pmData.assignedAccessLevel,
        personalModuleId: pmData.id
      };
    } else {
      employee.value = { id: rawUser.id, card_number: null, access_level: null };
    }
  } catch (error) {
    console.error("Failed to load personal employee data:", error);
    employee.value = { id: rawUser.id, card_number: null, access_level: null };
  } finally {
    loadingEmployee.value = false;
  }
};

const fetchNextQrType = async () => {
  if (!employee.value) return;
  loadingNextType.value = true;
  try {
    const empId = employee.value.personalModuleId || employee.value.id;
    const today = new Date().toISOString().split('T')[0];
    const url = `${import.meta.env.VITE_API_URL}/items/logs`
      + `?filter[_and][0][employeeId][_eq]=${empId}`
      + `&filter[_and][1][date][_eq]=${today}`
      + `&filter[_and][2][ValidLogs][_eq]=authorized`
      + `&sort=-timeStamp`
      + `&limit=1`
      + `&fields=action`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      const lastLog = data?.data?.[0];
      // Last action 'in' → next should be EXIT; otherwise ENTRY
      nextQrType.value = (lastLog?.action === 'in') ? 'EXIT' : 'ENTRY';
    }
  } catch (e) {
    console.warn('Could not fetch last log, defaulting to ENTRY', e);
    nextQrType.value = 'ENTRY';
  } finally {
    loadingNextType.value = false;
  }
};

// Check if employee already has an unscanned, unexpired QR in DB.
// Active = qraccess:true AND expires_at > now
const checkActiveQr = async () => {
  try {
    const empId = employee.value?.personalModuleId || employee.value?.id;
    const now = new Date().toISOString();
    const url = `${import.meta.env.VITE_API_URL}/items/qrgenerate`
      + `?filter[_and][0][employeeId][_eq]=${empId}`
      + `&filter[_and][1][qraccess][_eq]=true`
      + `&filter[_and][2][expires_at][_gt]=${encodeURIComponent(now)}`
      + `&sort=-date_created&limit=1&fields=id,qr_type,expires_at`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      return data?.data?.[0] ?? null;
    }
  } catch (e) {
    console.warn('checkActiveQr failed', e);
  }
  return null;
};

// Wrapper called by both buttons:
// 1. Check for existing active QR  2. Refresh type from logs  3. Generate
const handleGenerateQr = async () => {
  const activeQr = await checkActiveQr();
  if (activeQr) {
    const typeLabel = activeQr.qr_type ? activeQr.qr_type.toLowerCase() : 'access';
    alert(`You already have an active ${typeLabel} QR. Ask the guard to scan it first.`);
    return;
  }
  await fetchNextQrType();
  await generateNewQr();
};

const generateNewQr = async () => {
  generatingQr.value = true;
  try {
    let accessLevelId = employee.value?.access_level?.id;

    if (!accessLevelId) {
      try {
        const alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&limit=1&fields[]=id`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const alData = await alRes.json();
        accessLevelId = alData?.data?.length > 0 ? alData.data[0].id : 1;
      } catch (e) {
        accessLevelId = 1;
      }
    }

    const qrType = nextQrType.value; // 'ENTRY' or 'EXIT'

    // 1. Generate AES-256 encrypted token with timestamp
    const authId = employee.value?.id || rawUser.id || 'unassigned';
    const rawToken = generateEncryptedQrToken(authId, accessLevelId);
    console.log("Generated Encrypted token:", rawToken, "| Type:", qrType);

    // 2. Post to Directus — 2-hour expiry, tagged with qr_type
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const payload = {
      tenant: tenantId,
      accessLevelsId: accessLevelId,
      qrcode: rawToken,
      qraccess: true,
      expires_at: expiresAt,
      qr_type: qrType,
    };

    if (employee.value?.personalModuleId) {
      payload.employeeId = employee.value.personalModuleId;
    } else if (employee.value?.id) {
      payload.employeeId = employee.value.id;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) console.error("Failed to save QR to backend");

    // 3. Build visual QR payload — includes qr_type for guard app
    const qrPayloadObj = JSON.stringify({
      type: "EMPLOYEE",
      qr_type: qrType,
      token: rawToken,
      name: rawUser?.first_name || "Employee",
      empId: employee.value?.employeeId || ""
    });

    // 4. Render QR image
    const qrDataUrl = await QRCodeLib.toDataURL(qrPayloadObj, {
      width: 400,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });

    activeQrUrl.value = qrDataUrl;
    activeQrToken.value = rawToken;
    activeQrType.value = qrType;

  } catch (err) {
    console.error("Error creating QR code", err);
  } finally {
    generatingQr.value = false;
  }
};

const downloadQrCode = () => {
  if (!activeQrUrl.value) return;
  const link = document.createElement("a");
  link.href = activeQrUrl.value;
  link.download = `Access_Key_${employee.value?.id || 'User'}_${new Date().toISOString().split('T')[0]}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const assignRfidCard = async () => {
  if (!employee.value || !newRfidCard.value) return;
  
  isAssigningCard.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${employee.value.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ card_number: newRfidCard.value })
    });

    if (res.ok) {
      employee.value.card_number = newRfidCard.value;
      newRfidCard.value = "";
    } else {
      console.error("Failed to assign RFID card");
    }
  } catch (error) {
    console.error("Error assigning RFID:", error);
  } finally {
    isAssigningCard.value = false;
  }
};

const removeRfidCard = async () => {
  if (!employee.value) return;
  
  if (!confirm("Are you sure you want to revoke this RFID card?")) return;

  isAssigningCard.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${employee.value.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ card_number: null })
    });

    if (res.ok) {
      employee.value.card_number = null;
    }
  } catch (error) {
    console.error("Error revoking RFID:", error);
  } finally {
    isAssigningCard.value = false;
  }
};

onMounted(async () => {
  await loadEmployeeData();
  await fetchNextQrType();
});
</script>

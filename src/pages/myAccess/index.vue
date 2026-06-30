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
              
              <div class="mt-4 flex flex-col sm:flex-row gap-3 w-full px-4 justify-center items-center">
                <button
                  :disabled="generatingQr"
                  class="w-full sm:w-auto px-4 h-9 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors flex items-center justify-center disabled:opacity-50"
                  @click="handleGenerateQr"
                >
                  <RefreshCw
                    class="w-3.5 h-3.5 mr-2"
                    :class="{ 'animate-spin': generatingQr }"
                  />
                  Regenerate
                </button>
                <button
                  class="w-full sm:w-auto px-4 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center"
                  @click="downloadQrCode"
                >
                  <Download class="w-3.5 h-3.5 mr-2" />
                  Download
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { QrCode, CreditCard, ShieldCheck, Plus, Loader2, AlertCircle, RefreshCw, X, Download, LogIn, LogOut } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import QRCodeLib from "qrcode";
import { generateEncryptedQrToken } from "@/utils/security/access-control.js";

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const rawUser = authService.getUserData();

const loadingEmployee = ref(true);
const employee = ref(null);

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
    // TODO: replace with your toast/snackbar component
    alert(`You already have an active ${activeQr.qr_type} QR. Ask the guard to scan it first.`);
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

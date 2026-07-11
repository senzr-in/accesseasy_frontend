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
              <!-- Vertical Minimalist ID Badge -->
              <div class="relative w-full mb-6 flex flex-col items-center mx-auto">
                
                <!-- The Badge Card (Target for html2canvas) -->
                <div 
                  ref="badgeCardRef"
                  class="bg-[#fafafa] border border-slate-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden w-full max-w-[340px] flex flex-col items-center relative pt-8 pb-0 min-h-[540px]"
                >
                  <!-- Lanyard hole and clip at top -->
                  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-purple-900 rounded-b-md z-10 shadow-sm"></div>
                  <div class="absolute top-5 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-slate-200 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border border-slate-300 z-10"></div>

                  <!-- Header / Logo -->
                  <div class="flex items-center gap-2.5 mt-5 mb-6 z-10">
                    <div class="w-10 h-11 bg-purple-800 flex items-center justify-center shadow-sm" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                      <span class="text-white font-black text-2xl mt-0.5">N</span>
                    </div>
                    <div class="flex flex-col justify-center">
                      <span class="text-purple-800 font-extrabold text-[26px] leading-none tracking-tight">Nexora</span>
                      <span class="text-purple-900 font-bold text-[10px] tracking-[0.12em] mt-0.5">TECHNOLOGIES</span>
                    </div>
                  </div>

                  <!-- Avatar -->
                  <div class="relative w-36 h-36 rounded-full border-[1.5px] border-purple-500 p-1 mb-5 shrink-0 z-10 bg-white shadow-sm">
                    <div class="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                      <!-- For demo purposes, an image is inserted if present, else fallback to initials -->
                      <img v-if="employee?.avatarUrl" :src="employee.avatarUrl" class="w-full h-full object-cover" />
                      <!-- We use a placeholder image from unavatar or similar if no initial is present, or just use the initial -->
                      <img v-else-if="!rawUser?.first_name" src="https://i.pravatar.cc/300?img=47" class="w-full h-full object-cover" />
                      <span v-else class="font-black text-6xl text-slate-300">
                        {{ rawUser?.first_name?.charAt(0).toUpperCase() || 'P' }}
                      </span>
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="flex flex-col items-center z-10 mb-5 px-4 w-full">
                    <h2 class="text-2xl font-black text-purple-800 tracking-tight uppercase leading-none mb-2 text-center w-full truncate">
                      {{ rawUser?.first_name || 'PRIYA' }} {{ rawUser?.last_name || 'SHARMA' }}
                    </h2>
                    <p class="text-[12px] text-slate-800 font-bold tracking-[0.05em] uppercase text-center mb-2 w-full truncate">
                      {{ employee?.access_level?.accessLevelName || 'MARKETING EXECUTIVE' }}
                    </p>
                    <p class="text-[13px] font-bold text-purple-800 uppercase text-center tracking-wide">
                      EMP ID: {{ employee?.employeeId || rawUser?.id || 'NX32567' }}
                    </p>
                  </div>

                  <!-- QR Code -->
                  <div class="bg-white w-44 h-44 flex items-center justify-center z-10 relative mb-16 shadow-sm border border-slate-100 p-2 rounded-md">
                    <img :src="activeQrUrl" class="w-full h-full block rendering-pixelated" alt="QR Code" />
                  </div>

                  <!-- Bottom Decorative Waves -->
                  <div class="absolute bottom-0 left-0 w-full h-40 overflow-hidden z-0 pointer-events-none">
                    <!-- Layer 1: Light purple -->
                    <svg class="absolute bottom-0 left-0 w-full h-32 text-purple-800" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M0,100 L0,30 Q40,80 100,0 L100,100 Z" opacity="0.8" />
                    </svg>
                    <!-- Layer 2: Dark purple foreground -->
                    <svg class="absolute bottom-0 left-0 w-full h-24 text-purple-900" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M0,100 L0,50 Q50,100 100,20 L100,100 Z" />
                    </svg>
                  </div>
                  
                  <!-- Bottom Text -->
                  <div class="absolute bottom-0 left-0 w-full h-10 flex items-center justify-center z-10">
                    <span class="text-[9.5px] font-semibold text-white/95 tracking-[0.2em] uppercase">
                      Think &bull; Innovate &bull; Inspire
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2 w-full max-w-[320px] justify-center mx-auto">
                <button
                  :disabled="isDownloading"
                  class="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-lg disabled:opacity-75 active:scale-95"
                  @click="downloadFullBadge"
                >
                  <Loader2 v-if="isDownloading" class="w-4 h-4 mr-2 animate-spin" />
                  <Download v-else class="w-4 h-4 mr-2" />
                  {{ isDownloading ? 'Saving...' : 'Save ID Badge' }}
                </button>
              </div>
            </div>

            <div
              v-else
              class="flex flex-col items-center w-full py-4"
            >
              <div class="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <IdCard class="w-8 h-8 text-indigo-500" />
              </div>
              <h3 class="text-base font-black text-slate-900 dark:text-white mb-1">
                Digital ID Badge
              </h3>
              <p class="text-xs text-slate-500 text-center max-w-xs mb-6">
                Generate your secure digital ID badge for access. This is a one-time setup.
              </p>
              <button
                :disabled="generatingQr"
                class="w-full max-w-xs flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
                @click="handleGenerateQr"
              >
                <Loader2
                  v-if="generatingQr"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <IdCard
                  v-else
                  class="w-4 h-4 mr-2"
                />
                {{ generatingQr ? 'Generating...' : 'Generate ID Badge' }}
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
import { QrCode, CreditCard, ShieldCheck, Plus, Loader2, AlertCircle, RefreshCw, X, Download, LogIn, LogOut, IdCard } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import QRCodeLib from "qrcode";
import { generateEncryptedQrToken } from "@/utils/security/access-control.js";
import html2canvas from "html2canvas";

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const rawUser = authService.getUserData();

const loadingEmployee = ref(true);
const employee = ref(null);
const showIdBadge = ref(false);

const badgeCardRef = ref(null);
const isDownloading = ref(false);

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
  // Unused now that QR is one-time static badge
};

// Check if employee already has a QR in DB.
const checkActiveQr = async () => {
  try {
    const empId = employee.value?.personalModuleId || employee.value?.id;
    const url = `${import.meta.env.VITE_API_URL}/items/qrgenerate`
      + `?filter[_and][0][employeeId][_eq]=${empId}`
      + `&filter[_and][1][qraccess][_eq]=true`
      + `&sort=-date_created&limit=1&fields=id,qrcode,qr_type`;
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

// 1. Check for existing active QR  2. Generate if none exists
const handleGenerateQr = async () => {
  const activeQr = await checkActiveQr();
  if (activeQr && activeQr.qrcode) {
    // If it exists, just load it visually
    activeQrToken.value = activeQr.qrcode;
    activeQrType.value = 'ACCESS';
    
    const qrPayloadObj = JSON.stringify({
      type: "EMPLOYEE",
      qr_type: "ACCESS",
      token: activeQr.qrcode,
      name: rawUser?.first_name || "Employee",
      empId: employee.value?.employeeId || ""
    });
    
    activeQrUrl.value = await QRCodeLib.toDataURL(qrPayloadObj, {
      width: 400, margin: 1, color: { dark: '#000000', light: '#ffffff' }
    });
    return;
  }
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

    const qrType = 'ACCESS';

    // 1. Generate AES-256 encrypted token
    const authId = employee.value?.id || rawUser.id || 'unassigned';
    const rawToken = generateEncryptedQrToken(authId, accessLevelId);
    console.log("Generated Encrypted token:", rawToken, "| Type:", qrType);

    // 2. Post to Directus — No expiry
    const payload = {
      tenant: tenantId,
      accessLevelsId: accessLevelId,
      qrcode: rawToken,
      qraccess: true,
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

const downloadFullBadge = async () => {
  if (!badgeCardRef.value) return;
  isDownloading.value = true;
  try {
    const canvas = await html2canvas(badgeCardRef.value, {
      scale: 3, // High resolution for sharp printing/saving
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    
    const link = document.createElement("a");
    link.download = `Employee_Badge_${employee.value?.employeeId || rawUser?.id || 'ID'}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Error generating badge image:", err);
  } finally {
    isDownloading.value = false;
  }
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
  
  // Try to load an existing badge if one was already generated
  const activeQr = await checkActiveQr();
  if (activeQr && activeQr.qrcode) {
    activeQrToken.value = activeQr.qrcode;
    activeQrType.value = 'ACCESS';
    
    const qrPayloadObj = JSON.stringify({
      type: "EMPLOYEE",
      qr_type: "ACCESS",
      token: activeQr.qrcode,
      name: rawUser?.first_name || "Employee",
      empId: employee.value?.employeeId || ""
    });
    
    activeQrUrl.value = await QRCodeLib.toDataURL(qrPayloadObj, {
      width: 400, margin: 1, color: { dark: '#000000', light: '#ffffff' }
    });
  }
});
</script>

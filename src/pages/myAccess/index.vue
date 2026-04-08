<template>
  <div class="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Access Profile
          <span class="px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-black uppercase tracking-widest leading-tight">
            Level {{ employee?.access_level?.accessLevelName || 'Unknown' }}
          </span>
        </h1>
        <p class="text-sm font-medium text-slate-500 mt-1">Manage your mobile keys and physical cards.</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Left Column: Digital Access / QR -->
      <div class="space-y-6">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Mobile Access</h3>
        
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div class="p-8 pb-6 flex flex-col items-center justify-center min-h-[300px]">
            <div v-if="loadingEmployee" class="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
              <span class="text-xs font-bold uppercase tracking-widest">Loading secure identity...</span>
            </div>
            
            <div v-else-if="!employee" class="text-center text-rose-500">
              <AlertCircle class="w-8 h-8 mx-auto mb-2" />
              <p class="font-bold text-sm">Identity mapping not found.</p>
              <p class="text-xs text-rose-400 mt-1">Contact your administrator.</p>
            </div>

            <div v-else-if="activeQrUrl" class="flex flex-col items-center w-full animate-in zoom-in-95 duration-500">
              <div class="bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex items-center justify-center">
                <img :src="activeQrUrl" alt="Access QR Code" class="w-48 h-48 block rendering-pixelated" />
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-6 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                Active Code: {{ activeQrToken }}
              </p>
              
              <div class="mt-8 flex flex-col sm:flex-row gap-3 w-full px-4 justify-center items-center">
                <button @click="generateNewQr" :disabled="generatingQr" class="w-full sm:w-auto px-4 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors flex items-center justify-center disabled:opacity-50">
                  <RefreshCw class="w-3.5 h-3.5 mr-2" :class="{ 'animate-spin': generatingQr }" />
                  Regenerate
                </button>
                <button @click="downloadQrCode" class="w-full sm:w-auto px-4 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center">
                  <Download class="w-3.5 h-3.5 mr-2" />
                  Download
                </button>
                <button @click="activeQrUrl = null" class="w-full sm:w-auto px-4 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center">
                  <X class="w-3.5 h-3.5 mr-2" />
                  Revoke
                </button>
              </div>
            </div>

            <div v-else class="flex flex-col items-center w-full">
              <div class="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <QrCode class="w-10 h-10 text-indigo-500" />
              </div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">Request Mobile Key</h3>
              <p class="text-sm text-slate-500 text-center max-w-xs mb-8">Generate a secure cryptographic QR token to access authorized doors using your mobile phone.</p>
              
              <button @click="generateNewQr" :disabled="generatingQr" class="w-full max-w-xs flex items-center justify-center h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75">
                <Loader2 v-if="generatingQr" class="w-4 h-4 mr-2 animate-spin" />
                <QrCode v-else class="w-4 h-4 mr-2" />
                {{ generatingQr ? 'Generating...' : 'Generate New Key' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Physical Access -->
      <div class="space-y-6">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Physical Credentials</h3>
        
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          
          <div class="p-6">
            <div v-if="loadingEmployee" class="animate-pulse flex flex-col gap-4">
              <div class="h-20 bg-slate-100 dark:bg-zinc-900 rounded-xl"></div>
            </div>
            
            <div v-else class="space-y-4">
              <!-- Physical Card -->
              <div class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between group">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                    <CreditCard class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">RFID Smart Card</h4>
                    <p class="text-xs text-slate-500 font-medium mt-0.5" v-if="employee?.card_number">
                      Card Number: <span class="font-mono text-slate-700 dark:text-zinc-300">{{ employee.card_number }}</span>
                    </p>
                    <p class="text-xs text-rose-500 font-medium mt-0.5" v-else>No card assigned</p>
                  </div>
                </div>
                <div v-if="employee?.card_number" class="flex items-center gap-2">
                  <span class="px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                  <button @click="removeRfidCard" :disabled="isAssigningCard" class="w-6 h-6 flex items-center justify-center rounded bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors" title="Remove Card">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Action Button / Input -->
              <div v-if="!employee?.card_number" class="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Register Physical Card</p>
                <div class="flex items-center gap-2">
                  <input type="text" v-model="newRfidCard" placeholder="Enter Card ID/Number" class="flex-1 h-10 px-3 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white" />
                  <button @click="assignRfidCard" :disabled="!newRfidCard || isAssigningCard" class="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2">
                    <Loader2 v-if="isAssigningCard" class="w-3.5 h-3.5 animate-spin" />
                    <Plus v-else class="w-3.5 h-3.5" /> Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clearance Summary Box -->
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 pt-4">Assigned Clearances</h3>
        <div class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <div v-if="loadingEmployee" class="animate-pulse h-10 bg-slate-100 dark:bg-zinc-900 rounded-xl"></div>
          <div v-else-if="employee?.access_level?.id" class="flex flex-col gap-3">
             <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
               <ShieldCheck class="w-5 h-5 text-indigo-500" />
               <div>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ employee.access_level.accessLevelName }}</h4>
                  <p class="text-xs text-slate-500">ID: {{ employee.access_level.id }}</p>
               </div>
             </div>
             <p class="text-[11px] font-medium text-slate-500 leading-relaxed max-w-sm mt-1">This level defines the physical zones and time windows you are authorized to enter. Contact administration for clearance changes.</p>
          </div>
          <div v-else class="text-sm text-slate-500 italic pb-2">
            No specific access level is currently assigned to your profile.
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { QrCode, CreditCard, ShieldCheck, Plus, Loader2, AlertCircle, RefreshCw, X, Download } from "lucide-vue-next";
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

const newRfidCard = ref("");
const isAssigningCard = ref(false);

const loadEmployeeData = async () => {
  if (!rawUser?.id) return;
  
  loadingEmployee.value = true;
  try {
    const url = `${import.meta.env.VITE_API_URL}/items/employees?filter[assignedUser][_eq]=${rawUser.id}&fields=*,access_level.*`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // If the employee role doesn't have permissions to read `employees` collection (403), handle gracefully
    if (!res.ok) {
      console.warn("Could not fetch employee record (likely 403 permissions). Proceeding with default user context.");
      employee.value = { id: null, card_number: null, access_level: null };
      return;
    }

    const data = await res.json();
    if (data?.data?.length > 0) {
      employee.value = data.data[0];
      
      // Also fetch personalModule to get the correct foreign key for QR Generate
      try {
        const pmRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=${rawUser.id}&fields=id`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pmData = await pmRes.json();
        if (pmData?.data?.length > 0) {
          employee.value.personalModuleId = pmData.data[0].id;
        }
      } catch (e) {
        console.warn("Could not fetch personalModule ID", e);
      }
    } else {
      employee.value = { id: null, card_number: null, access_level: null };
    }
  } catch (error) {
    console.error("Failed to load personal employee data:", error);
    employee.value = { id: null, card_number: null, access_level: null };
  } finally {
    loadingEmployee.value = false;
  }
};

const generateNewQr = async () => {
  generatingQr.value = true;
  try {
    let accessLevelId = employee.value?.access_level?.id; 

    // If access level is unknown (e.g., due to 403 permissions on employee read),
    // fetch the first available access level from the tenant per the API reference log.
    if (!accessLevelId) {
      try {
        const alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&limit=1&fields[]=id`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const alData = await alRes.json();
        if (alData?.data?.length > 0) {
          accessLevelId = alData.data[0].id;
        } else {
          accessLevelId = 1;
        }
      } catch (e) {
        accessLevelId = 1;
      }
    }

    // 1. Generate local secure token using AES-256 + Timestamp
    const authId = employee.value?.id || rawUser.id || 'unassigned';
    const rawToken = generateEncryptedQrToken(authId, accessLevelId);
    console.log("Generated local Encrypted token:", rawToken);

    // 2. Post to Directus
    // IN-06: Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const payload = {
      tenant: tenantId,
      accessLevelsId: accessLevelId,
      qrcode: rawToken,
      qraccess: true,
      expires_at: expiresAt
    };
    
    // Only attach employeeId if we successfully fetched it; otherwise rely on Directus hooks
    // Use personalModule ID because the qrgenerate table expects the personalModule foreign key
    if (employee.value?.personalModuleId) {
       payload.employeeId = employee.value.personalModuleId;
    } else if (employee.value?.id) {
       // fallback
       payload.employeeId = employee.value.id;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate`, {
       method: "POST",
       headers: { 
         "Authorization": `Bearer ${token}`,
         "Content-Type": "application/json"
       },
       body: JSON.stringify(payload)
    });

    if (!res.ok) {
       console.error("Failed to save QR to backend");
    }

    // 3. Render Visual QR Code from the token
    const qrDataUrl = await QRCodeLib.toDataURL(rawToken, {
      width: 400,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });
    
    activeQrUrl.value = qrDataUrl;
    activeQrToken.value = rawToken;

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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/employees/${employee.value.id}`, {
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/employees/${employee.value.id}`, {
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

onMounted(() => {
  loadEmployeeData();
});
</script>

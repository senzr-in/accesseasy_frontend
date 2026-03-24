<template>
  <div class="space-y-6 p-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="h-9 w-9 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            QR Access Management
            <QrCode class="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Generate and track secure, time-limited mobile access keys.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Generator Section -->
      <div class="lg:col-span-1 space-y-6">
        <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Plus class="w-5 h-5 text-emerald-500" />
              Generate New Key
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Select Employee</label>
              <div class="relative">
                <select 
                  v-model="selectedEmployeeId"
                  class="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  <option value="" disabled>Search employee...</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id" class="text-slate-700 dark:bg-slate-900 dark:text-white">
                    {{ emp.name }} ({{ emp.email }})
                  </option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Access Level (Optional)</label>
              <div class="relative">
                <select 
                  v-model="selectedAccessLevelId"
                  class="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  <option value="" disabled>Default permissions</option>
                  <option v-for="al in accessLevels" :key="al.id" :value="al.id" class="text-slate-700 dark:bg-slate-900 dark:text-white">
                    {{ al.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Validity Duration</label>
              <div class="relative">
                <select 
                  v-model="validity"
                  class="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  <option value="15" class="text-slate-700 dark:bg-slate-900 dark:text-white">15 Minutes</option>
                  <option value="60" class="text-slate-700 dark:bg-slate-900 dark:text-white">1 Hour</option>
                  <option value="480" class="text-slate-700 dark:bg-slate-900 dark:text-white">8 Hours</option>
                  <option value="1440" class="text-slate-700 dark:bg-slate-900 dark:text-white">24 Hours</option>
                </select>
              </div>
            </div>

            <button
              @click="handleGenerate"
              :disabled="isGenerating || !selectedEmployeeId"
              class="w-full h-10 inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors mt-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RefreshCw v-if="isGenerating" class="w-4 h-4 animate-spin mr-2" />
              <Zap v-else class="w-4 h-4 mr-2" />
              Generate Mobile Key
            </button>
          </div>
        </div>

        <div v-if="currentQR" class="rounded-xl border-2 border-emerald-500 bg-white dark:bg-slate-900 shadow-2xl shadow-emerald-500/10 animate-in zoom-in duration-300">
          <div class="text-center p-4 pb-0">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white mb-2 mx-auto">Active Key</span>
            <h3 class="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Access Token</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Expires {{ new Date(currentQR.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
          <div class="p-6 flex flex-col items-center gap-4">
            <div class="p-4 bg-white rounded-2xl border border-emerald-500/20 shadow-inner flex flex-col items-center justify-center relative w-44 h-44">
              <!-- Inline QR Code SVG Mockup for simplicity in UI matching without extra libraries -->
              <QrCode class="w-32 h-32 text-slate-900" />
            </div>
            <div class="flex gap-2 w-full">
              <button class="flex-1 h-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Share2 class="w-3 h-3 mr-1" /> Share
              </button>
              <button @click="currentQR = null" class="flex-1 h-8 inline-flex items-center justify-center rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div class="lg:col-span-2 space-y-6">
        <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 h-full overflow-hidden">
          <div class="p-6 border-b border-emerald-500/5 bg-emerald-50 dark:bg-emerald-500/[0.02]">
            <h2 class="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock class="w-5 h-5 text-emerald-500" />
              Key Generation History
            </h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead class="bg-slate-50 dark:bg-slate-950/50">
                <tr>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Employee</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Generated At</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Expires At</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr v-if="history.length === 0">
                  <td colspan="4" class="px-6 py-48 text-center text-slate-500 dark:text-slate-400 italic text-sm">
                    No QR keys generated yet.
                  </td>
                </tr>
                <tr 
                  v-else
                  v-for="log in history" 
                  :key="log.id"
                  class="hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.02] transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <Users class="w-4 h-4 text-slate-400" />
                      <div class="text-sm font-bold text-slate-900 dark:text-white">
                        {{ log.employee.name }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {{ new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {{ new Date(log.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      v-if="new Date(log.expiresAt) < new Date()"
                      class="inline-flex items-center px-2 py-0.5 rounded textxs font-semibold border border-transparent bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    >
                      Expired
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 gap-1"
                    >
                      <CheckCircle2 class="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Zap, ArrowLeft, QrCode, Share2, Plus, 
  Users, Clock, CheckCircle2, RefreshCw, Loader2 
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const employees = ref([]);
const accessLevels = ref([]);
const history = ref([]);
const loading = ref(true);
const isGenerating = ref(false);

const selectedEmployeeId = ref("");
const selectedAccessLevelId = ref("");
const validity = ref("60");
const currentQR = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const token = authService.getToken();
    
    // Fetch Employees
    const empRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,employeeId,firstName,lastName,personalEmail,assignedUser.first_name,assignedUser.last_name,assignedUser.email&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&limit=-1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (empRes.ok) {
      const data = await empRes.json();
      employees.value = data.data.map(e => ({
        id: e.id,
        name: `${e.firstName || e.assignedUser?.first_name || "Unknown"} ${e.lastName || e.assignedUser?.last_name || ""}`,
        email: e.personalEmail || e.assignedUser?.email || "N/A"
      }));
    }

    // Fetch Access Levels
    const alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?fields=id,accessLevelName&filter[tenant][tenantId][_eq]=${tenantId}&limit=-1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (alRes.ok) {
      const data = await alRes.json();
      accessLevels.value = data.data.map(al => ({
        id: al.id,
        name: al.accessLevelName
      }));
    }

    // Fetch QR History
    const qrRes = await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate?fields=id,qrcode,qraccess,date_created,employeeId.firstName,employeeId.lastName,employeeId.assignedUser.first_name,employeeId.assignedUser.last_name&filter[tenant][_eq]=${tenantId}&limit=20&sort=-date_created`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (qrRes.ok) {
      const data = await qrRes.json();
      history.value = data.data.map(q => ({
        id: q.id,
        employee: { name: `${q.employeeId?.firstName || q.employeeId?.assignedUser?.first_name || "Unknown"} ${q.employeeId?.lastName || q.employeeId?.assignedUser?.last_name || ""}` },
        timestamp: q.date_created,
        // Using a mock expiry of 24h as API field might vary
        expiresAt: new Date(new Date(q.date_created).getTime() + 86400000).toISOString()
      }));
    }

  } catch (error) {
    console.error("Error fetching QR data:", error);
  } finally {
    loading.value = false;
  }
};

const handleGenerate = async () => {
    isGenerating.value = true;
    try {
        const tenantId = authService.getTenantId();
        const token = authService.getToken();
        
        // Generate a random 8-char code for the mockup flow
        const qrCodeValue = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const payload = {
          qrcode: qrCodeValue,
          qraccess: true,
          employeeId: selectedEmployeeId.value,
          accessLevelsId: selectedAccessLevelId.value || null,
          tenant: tenantId
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          currentQR.value = {
            qrValue: data.data.qrcode,
            expiresAt: new Date(Date.now() + parseInt(validity.value) * 60000).toISOString()
          };
          fetchData();
        }
    } catch (error) {
        console.error("Error generating QR key:", error);
    } finally {
        isGenerating.value = false;
    }
}

onMounted(() => {
  fetchData();
});
</script>

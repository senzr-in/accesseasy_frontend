<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header/Toolbar -->
    <div class="flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by name, email, or mobile..."
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          @input="debouncedSearch"
        >
      </div>

      <!-- Export Dropdown -->
      <div class="relative group">
        <button
          class="flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm shrink-0"
        >
          <FileDown class="w-4 h-4" /> Export
        </button>
        <div class="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50 hidden group-hover:block">
          <button
            class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
            @click="exportVisitorsExcel"
          >
            Export Excel
          </button>
          <button
            class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
            @click="exportVisitorsCSV"
          >
            Export CSV
          </button>
        </div>
      </div>
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm shrink-0"
      >
        <UserPlus class="w-4 h-4" /> Pre-Register Visitor
      </button>
    </div>

    <!-- Main Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-y-auto flex-1 h-full p-4 custom-scrollbar bg-slate-50/50 dark:bg-zinc-950/50">
        <div class="flex flex-col gap-3">
          <!-- Loading -->
          <div v-if="loading" class="py-24 flex justify-center">
            <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
          </div>

          <!-- Empty -->
          <div v-else-if="items.length === 0" class="py-24 text-center">
            <div class="flex flex-col items-center justify-center space-y-3">
              <Users class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">
                No visitors found.
              </p>
              <button
                v-if="searchQuery"
                class="text-xs font-bold text-indigo-500 hover:underline"
                @click="searchQuery = ''; loadVisitors()"
              >
                Clear search params
              </button>
            </div>
          </div>

          <!-- Rows -->
          <div
            v-for="visitor in items"
            v-else
            :key="visitor.id"
            class="group relative flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] overflow-hidden"
          >
            <!-- Left: Profile Info -->
            <div class="flex items-center gap-4 min-w-[200px] flex-1">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-inner shrink-0">
                {{ visitor.personName?.charAt(0).toUpperCase() || '?' }}
              </div>
              <div class="flex flex-col">
                <span class="block text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ visitor.personName }}</span>
                <span class="text-[10px] font-semibold text-slate-500 mt-0.5">{{ visitor.mobileNumber || '' }}  {{ visitor.email ? '• ' + visitor.email : '' }}</span>
              </div>
            </div>

            <!-- Middle: Access/Company Info (placeholder if no company, using access level) -->
            <div class="hidden md:flex flex-col flex-1 min-w-[150px]">
              <span class="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                {{ visitor.assignedAccessLevels?.accessLevelName || 'General Access' }}
              </span>
            </div>

            <!-- Middle: Validity/Time -->
            <div class="hidden lg:flex flex-col items-center flex-1 min-w-[150px]">
              <span class="text-[11px] font-black text-slate-700 dark:text-zinc-300">
                {{ visitor.startTime?.slice(0, 5) || '--:--' }} - {{ visitor.endTime?.slice(0, 5) || '--:--' }}
              </span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {{ formatDate(visitor.startDate) }}
              </span>
            </div>

            <!-- Right: Status & Actions -->
            <div class="flex items-center justify-end gap-4 shrink-0 min-w-[200px]">
              <!-- Status Badge -->
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors"
                :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20': visitor.status === 'active',
                  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20': visitor.status === 'inactive',
                  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20': visitor.status === 'expired'
                }"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full" 
                  :class="visitor.status === 'active' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : (visitor.status === 'inactive' ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-rose-500 shadow-[0_0_5px_#f43f5e]')"
                />
                {{ visitor.status || 'inactive' }}
              </span>

              <!-- Action Button -->
              <button
                @click="viewVisitorCard(visitor)"
                class="flex items-center gap-2 h-8 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-transparent hover:border-slate-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm hover:shadow-[0_0_15px_rgba(79,70,229,0.2)] group-hover:bg-white dark:group-hover:bg-zinc-800"
              >
                <Printer class="w-3.5 h-3.5" /> 
                <span class="hidden sm:inline">View Card</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }} &nbsp;·&nbsp; {{ totalItems }} total
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Registration Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        @click="showAddModal = false"
      />
      
      <div class="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
            <UserPlus class="w-4 h-4 mr-2" />
            Pre-register Visitor
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            @click="showAddModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Form -->
        <div class="p-6 space-y-4 overflow-y-auto">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name <span class="text-rose-500">*</span></label>
            <input
              v-model="form.personName"
              type="text"
              placeholder="John Doe"
              class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
              required
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile Number <span class="text-rose-500">*</span></label>
              <input
                v-model="form.mobileNumber"
                type="text"
                inputmode="numeric"
                maxlength="10"
                placeholder="10-digit number"
                class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                @input="form.mobileNumber = $event.target.value.replace(/\D/g, '')"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="john@example.com"
                class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Time</label>
              <input
                v-model="form.startTime"
                type="time"
                class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Time</label>
              <input
                v-model="form.endTime"
                type="time"
                class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
              >
            </div>
          </div>
          
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Level (Optional)</label>
            <select
              v-model="form.assignedAccessLevels"
              class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
            >
              <option value="">
                None
              </option>
              <option
                v-for="lvl in accessLevels"
                :key="lvl.id"
                :value="lvl.id"
              >
                {{ lvl.accessLevelName }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-5 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <button
            class="h-9 px-4 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            @click="showAddModal = false"
          >
            Cancel
          </button>
          <button 
            :disabled="!form.personName || !form.mobileNumber || saving"
            class="h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            @click="submitVisitor"
          >
            <Loader2
              v-if="saving"
              class="w-4 h-4 animate-spin"
            />
            <UserPlus
              v-else
              class="w-4 h-4"
            />
            Register
          </button>
        </div>
      </div>
    </div>
  </div>

    <!-- Digital ID Card Modal -->
    <!-- Digital ID Card Modal (Holographic Rectangle) -->
    <div v-if="showIdCardModal && selectedVisitorForCard" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <!-- Dark backdrop -->
      <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md print:hidden" @click="showIdCardModal = false" />
      
      <div class="relative flex flex-col items-center animate-in zoom-in-95 duration-300 w-full max-w-3xl">
        <!-- Print Header -->
        <div class="hidden print:block text-center mb-6 w-full">
          <h1 class="text-2xl font-black text-black">VISITOR PASS</h1>
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
                <img v-if="selectedVisitorForCard.photo" :src="getPhotoUrl(selectedVisitorForCard.photo)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center font-black text-4xl text-white bg-slate-800 print:text-black print:bg-white">
                  {{ selectedVisitorForCard.personName?.charAt(0).toUpperCase() || '?' }}
                </div>
              </div>
            </div>
            
            <!-- Name and Basic Info -->
            <div class="flex-1 mt-2 sm:mt-0">
              <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase print:text-black">{{ selectedVisitorForCard.personName }}</h2>
              <p class="text-lg font-bold text-slate-300 mt-1 uppercase tracking-widest print:text-slate-600">VISITOR ID</p>
              <p class="text-sm text-cyan-400 mt-1 font-semibold uppercase tracking-widest print:text-slate-500" v-if="selectedVisitorForCard.company">{{ selectedVisitorForCard.company }}</p>
            </div>
          </div>

          <!-- Middle Divider Info Row -->
          <div class="w-full text-[10px] sm:text-xs font-semibold text-slate-300 flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-2 uppercase tracking-widest border-y border-white/10 py-4 mb-8 print:border-slate-300 print:text-slate-600">
            <span>Visitor ID: <strong class="text-white print:text-black">#{{ (selectedVisitorForCard.id || '000').toString().slice(0, 8) }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Date: <strong class="text-white print:text-black">{{ formatDate(selectedVisitorForCard.startDate) }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Access: <strong class="text-white print:text-black">{{ selectedVisitorForCard.assignedAccessLevels?.accessLevelName || 'General' }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Expiry: <strong class="text-white print:text-black">{{ formatDate(selectedVisitorForCard.endDate) }}</strong></span>
            <span v-if="selectedVisitorForCard.personToMeet">
              <span class="text-white/20 print:hidden">|</span>
              Host: <strong class="text-white print:text-black">{{ selectedVisitorForCard.personToMeet }}</strong>
            </span>
            <span v-if="selectedVisitorForCard.mobileNumber">
              <span class="text-white/20 print:hidden">|</span>
              Phone: <strong class="text-white print:text-black">{{ selectedVisitorForCard.mobileNumber }}</strong>
            </span>
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
               
               <div class="m-2 p-3 bg-white/95 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] print:shadow-none print:border print:border-black">
                 <qrcode-vue :value="selectedVisitorForCard.id || 'N/A'" :size="120" level="H" :margin="1" background="transparent" />
               </div>
            </div>

            <!-- Logo & Status -->
            <div class="flex flex-col items-center sm:items-end text-center sm:text-right">
               <div class="flex items-center gap-3 mb-4">
                 <!-- Simple AccessEasy logo placeholder -->
                 <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-indigo-600 text-xl print:border print:border-black">A</div>
                 <div class="text-left">
                   <div class="text-lg font-black text-white leading-none print:text-black">AccessEasy</div>
                   <div class="text-[10px] text-slate-400 tracking-widest uppercase print:text-slate-500">Visitor Management</div>
                 </div>
               </div>
               <div class="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">
                 STATUS: 
                 <span class="text-base ml-2" :class="selectedVisitorForCard.status === 'active' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] print:text-black' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] print:text-black'">
                   {{ selectedVisitorForCard.status }}
                 </span>
               </div>
            </div>
          </div>
        </div>
        
        <!-- External Actions -->
        <div class="mt-6 flex justify-end gap-4 w-full print:hidden relative z-10">
          <button @click="showIdCardModal = false" class="px-6 py-2.5 rounded-xl border border-white/20 font-bold text-xs uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all bg-slate-900/50 backdrop-blur-sm">
            Close
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { 
  Users, Search, UserPlus, Loader2, Briefcase, UserCheck, X, FileDown, Printer 
} from 'lucide-vue-next';
import ExcelJS from 'exceljs';
import QrcodeVue from 'qrcode.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

// State
const token = authService.getToken();

const getPhotoUrl = (photoId) => {
  if (!photoId) return '';
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${token}`;
};

const loading = ref(true);
const saving = ref(false);
const items = ref([]);
const accessLevels = ref([]);
const searchQuery = ref('');
const page = ref(1);
const limit = 10;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / limit));
const showAddModal = ref(false);

const showIdCardModal = ref(false);
const selectedVisitorForCard = ref(null);

const viewVisitorCard = (visitor) => {
  selectedVisitorForCard.value = visitor;
  showIdCardModal.value = true;
};

const printCard = () => {
  window.print();
};

const today = new Date().toISOString().split('T')[0];

const form = ref({
  personName: '',
  mobileNumber: '',
  email: '',
  startDate: today,
  endDate: today,
  startTime: '09:00',
  endTime: '18:00',
  assignedAccessLevels: ''
});

// Search
let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadVisitors();
  }, 400);
};

watch(page, () => loadVisitors());

const loadAccessLevels = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return;
  try {
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    const params = new URLSearchParams({ limit: 100, ...filter });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      accessLevels.value = data.data || [];
    }
  } catch(err) {
    console.error('Failed to load access levels', err);
  }
};

const loadVisitors = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return;

  loading.value = true;
  try {
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    
    if (searchQuery.value) {
      filter["filter[_or][0][personName][_icontains]"] = searchQuery.value;
      filter["filter[_or][1][email][_icontains]"] = searchQuery.value;
      filter["filter[_or][2][mobileNumber][_icontains]"] = searchQuery.value;
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.value.toString(),
      sort: '-date_created',
      fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,quantity,assignedAccessLevels.accessLevelName,date_created,photo,personToMeet,reasonForVisit,company',
      meta: 'filter_count',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      items.value = data.data || [];
      totalItems.value = data.meta?.filter_count ?? 0;
    }
  } catch (err) {
    console.error('Failed to load visitors', err);
  } finally {
    loading.value = false;
  }
};

const fetchAllVisitorsForExport = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return [];

  try {
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    if (searchQuery.value) {
      filter["filter[_or][0][personName][_icontains]"] = searchQuery.value;
      filter["filter[_or][1][email][_icontains]"] = searchQuery.value;
      filter["filter[_or][2][mobileNumber][_icontains]"] = searchQuery.value;
    }

    const params = new URLSearchParams({
      limit: '-1',
      sort: '-date_created',
      fields: 'personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,quantity,assignedAccessLevels.accessLevelName,date_created',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const result = await res.json();
      return result.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch visitors for export", error);
  }
  return [];
};

const exportVisitorsExcel = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (exportItems.length === 0) {
    alert("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitors");

  worksheet.columns = [
    { header: "Name", key: "personName", width: 25 },
    { header: "Email", key: "email", width: 25 },
    { header: "Mobile Number", key: "mobileNumber", width: 15 },
    { header: "Start Date", key: "startDate", width: 12 },
    { header: "End Date", key: "endDate", width: 12 },
    { header: "Start Time", key: "startTime", width: 10 },
    { header: "End Time", key: "endTime", width: 10 },
    { header: "Access Level", key: "accessLevelName", width: 25 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Status", key: "status", width: 12 }
  ];

  exportItems.forEach(item => {
    worksheet.addRow({
      personName: item.personName,
      email: item.email || "",
      mobileNumber: item.mobileNumber || "",
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      accessLevelName: item.assignedAccessLevels?.accessLevelName || "N/A",
      quantity: item.quantity,
      status: item.status
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitors_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
};

const exportVisitorsCSV = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (exportItems.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = ["Name", "Email", "Mobile Number", "Start Date", "End Date", "Start Time", "End Time", "Access Level", "Quantity", "Status"];
  const rows = exportItems.map(item => [
    `"${(item.personName || '').replace(/"/g, '""')}"`,
    `"${(item.email || '').replace(/"/g, '""')}"`,
    `"${(item.mobileNumber || '').replace(/"/g, '""')}"`,
    item.startDate,
    item.endDate,
    item.startTime,
    item.endTime,
    `"${(item.assignedAccessLevels?.accessLevelName || 'N/A').replace(/"/g, '""')}"`,
    item.quantity,
    item.status
  ]);

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitors_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

const submitVisitor = async () => {
  const userTenant = await currentUserTenant.fetchLoginUserDetails();
  const tenantData = userTenant?.tenant;
  if (!tenantData || !token || !form.value.personName) return;

  if (form.value.mobileNumber && !/^\d{10}$/.test(form.value.mobileNumber)) {
    alert("Mobile number must be exactly 10 digits.");
    saving.value = false;
    return;
  }

  saving.value = true;
  try {
    const payload = {
      personName: form.value.personName,
      email: form.value.email,
      mobileNumber: form.value.mobileNumber,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      assignedAccessLevels: form.value.assignedAccessLevels || null,
      status: 'inactive',
      tenant: tenantData,
      quantity: 1
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Reset & Reload
      form.value = { personName: '', mobileNumber: '', email: '', startDate: today, endDate: today, startTime: '09:00', endTime: '18:00', assignedAccessLevels: '' };
      showAddModal.value = false;
      page.value = 1;
      loadVisitors();
    } else {
      console.error('Failed to create visitor entry', await res.text());
    }
  } catch (error) {
    console.error('Error creating visitor', error);
  } finally {
    saving.value = false;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(() => {
  loadAccessLevels();
  loadVisitors();
});
</script>

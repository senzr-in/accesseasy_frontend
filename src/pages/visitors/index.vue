<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header/Toolbar -->
    <div class="flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Search by name, email, or mobile..."
          v-model="searchQuery"
          @input="debouncedSearch"
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      <!-- Hide Pre-Register Visitor Action (commented out for future use if needed) -->
      <!--
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm shrink-0"
      >
        <UserPlus class="w-4 h-4" /> Pre-Register Visitor
      </button>
      -->
    </div>

    <!-- Main Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Visitor Profile</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Validity Period</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Access</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="4" class="px-5 py-24 text-center">
                <Loader2 class="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="items.length === 0">
              <td colspan="4" class="px-5 py-24 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <Users class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">No visitors found.</p>
                  <button
                    v-if="searchQuery"
                    @click="searchQuery = ''; loadVisitors()"
                    class="text-xs font-bold text-indigo-500 hover:underline"
                  >Clear search params</button>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-else
              v-for="visitor in items"
              :key="visitor.id"
              class="group/row hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors duration-200"
            >
               <!-- Profile -->
               <td class="px-5 py-3">
                 <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-400 shrink-0">
                     {{ visitor.personName?.charAt(0).toUpperCase() || '?' }}
                   </div>
                   <div>
                     <span class="block text-sm font-bold text-slate-900 dark:text-white">{{ visitor.personName }}</span>
                     <span class="text-[10px] font-semibold text-slate-500">{{ visitor.mobileNumber || '' }}  {{ visitor.email ? '• ' + visitor.email : '' }}</span>
                   </div>
                 </div>
               </td>

               <!-- Validity Period -->
               <td class="px-5 py-3">
                 <div class="flex flex-col">
                   <span class="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                     {{ formatDate(visitor.startDate) }} to {{ formatDate(visitor.endDate) }}
                   </span>
                   <span class="text-[10px] font-semibold text-slate-400 mt-0.5">
                     {{ visitor.startTime?.slice(0, 5) || '--:--' }} - {{ visitor.endTime?.slice(0, 5) || '--:--' }}
                   </span>
                 </div>
               </td>

               <!-- Access Level -->
               <td class="px-5 py-3">
                 <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                   <Briefcase class="w-3 h-3" /> 
                   {{ visitor.assignedAccessLevels?.accessLevelName || 'N/A' }} 
                   <span v-if="visitor.quantity > 1" class="ml-1 text-slate-400">(x{{ visitor.quantity }})</span>
                 </span>
               </td>

               <!-- Status -->
               <td class="px-5 py-3 text-right">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    :class="{
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0': visitor.status === 'active',
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 shrink-0': visitor.status === 'inactive',
                      'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 shrink-0': visitor.status === 'expired'
                    }"
                  >
                    <div class="w-1.5 h-1.5 rounded-full" 
                        :class="visitor.status === 'active' ? 'bg-emerald-500' : (visitor.status === 'inactive' ? 'bg-amber-500' : 'bg-rose-500')"></div>
                    {{ visitor.status || 'inactive' }}
                  </span>
               </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          @click="page--"
          :disabled="page <= 1 || loading"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }}
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          @click="page++"
          :disabled="items.length < limit || loading"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Registration Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showAddModal = false"></div>
      
      <div class="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
            <UserPlus class="w-4 h-4 mr-2" />
            Pre-register Visitor
          </h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Form -->
        <div class="p-6 space-y-4 overflow-y-auto">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name <span class="text-rose-500">*</span></label>
            <input v-model="form.personName" type="text" placeholder="John Doe" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white" required />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile Number <span class="text-rose-500">*</span></label>
              <input v-model="form.mobileNumber" type="tel" placeholder="+12345678" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
              <input v-model="form.email" type="email" placeholder="john@example.com" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
              <input v-model="form.startDate" type="date" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
              <input v-model="form.endDate" type="date" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Time</label>
              <input v-model="form.startTime" type="time" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Time</label>
              <input v-model="form.endTime" type="time" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
          </div>
          
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Level (Optional)</label>
            <select v-model="form.assignedAccessLevels" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white">
              <option value="">None</option>
              <option v-for="lvl in accessLevels" :key="lvl.id" :value="lvl.id">{{ lvl.accessLevelName }}</option>
            </select>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-5 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <button @click="showAddModal = false" class="h-9 px-4 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            @click="submitVisitor"
            :disabled="!form.personName || !form.mobileNumber || saving"
            class="h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <UserPlus v-else class="w-4 h-4" />
            Register
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { 
  Users, Search, UserPlus, Loader2, Briefcase, UserCheck, X 
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

// State
const token = authService.getToken();
const loading = ref(true);
const saving = ref(false);
const items = ref([]);
const accessLevels = ref([]);
const searchQuery = ref('');
const page = ref(1);
const limit = 15;
const showAddModal = ref(false);

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
      limit,
      page: page.value,
      sort: '-date_created',
      fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,quantity,assignedAccessLevels.accessLevelName,date_created',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      items.value = data.data || [];
    }
  } catch (err) {
    console.error('Failed to load visitors', err);
  } finally {
    loading.value = false;
  }
};

const submitVisitor = async () => {
  const userTenant = await currentUserTenant.fetchLoginUserDetails();
  const tenantData = userTenant?.tenant;
  if (!tenantData || !token || !form.value.personName) return;

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

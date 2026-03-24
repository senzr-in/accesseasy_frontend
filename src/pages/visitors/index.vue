<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header/Toolbar -->
    <div class="flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Search by name, company, or host..."
          v-model="searchQuery"
          @input="debouncedSearch"
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      <!-- Add Action -->
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm shrink-0"
      >
        <UserPlus class="w-4 h-4" /> Sign In Visitor
      </button>
    </div>

    <!-- Main Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Visitor Profile</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Purpose / Company</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Host</th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Time In</th>
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
                   <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-zinc-400">
                     {{ visitor.name?.charAt(0).toUpperCase() }}
                   </div>
                   <div>
                     <span class="block text-sm font-bold text-slate-900 dark:text-white">{{ visitor.name }}</span>
                     <span class="text-[10px] font-semibold text-slate-500">{{ visitor.phone || visitor.email || 'No Contact Info' }}</span>
                   </div>
                 </div>
               </td>

               <!-- Purpose/Company -->
               <td class="px-5 py-3">
                 <div>
                   <span class="block text-xs font-bold text-slate-700 dark:text-zinc-300">{{ visitor.purpose || 'General Visit' }}</span>
                   <span class="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5" v-if="visitor.company">
                    <Briefcase class="w-3 h-3" /> {{ visitor.company }}
                   </span>
                 </div>
               </td>

               <!-- Host -->
               <td class="px-5 py-3">
                 <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                   <UserCheck class="w-3 h-3" /> {{ visitor.host || 'Unassigned' }}
                 </span>
               </td>

               <!-- Time In -->
               <td class="px-5 py-3 text-right">
                 <div class="flex flex-col items-end">
                  <span class="text-xs font-bold text-slate-800 dark:text-zinc-200">{{ formatDate(visitor.date_created) }}</span>
                  <span class="text-[10px] font-semibold text-slate-400">{{ formatTime(visitor.date_created) }}</span>
                 </div>
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
      
      <div class="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-zinc-800">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
            <UserPlus class="w-4 h-4 mr-2" />
            Registry Intake
          </h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Form -->
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name *</label>
            <input v-model="form.name" type="text" placeholder="John Doe" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white" required />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</label>
              <input v-model="form.phone" type="tel" placeholder="+12345678" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Company</label>
              <input v-model="form.company" type="text" placeholder="Acme Corp" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Purpose of Visit</label>
            <input v-model="form.purpose" type="text" placeholder="Meeting / Delivery / Maintenence" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Host Employee</label>
            <input v-model="form.host" type="text" placeholder="Who are they seeing?" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-5 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-zinc-900/50">
          <button @click="showAddModal = false" class="h-9 px-4 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            @click="submitVisitor"
            :disabled="!form.name || saving"
            class="h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <UserPlus v-else class="w-4 h-4" />
            Sign In
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
const searchQuery = ref('');
const page = ref(1);
const limit = 15;
const showAddModal = ref(false);

const form = ref({
  name: '',
  phone: '',
  company: '',
  purpose: '',
  host: ''
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

const loadVisitors = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return;

  loading.value = true;
  try {
    const filter = { "filter[tenant][_eq]": tenantId };
    
    if (searchQuery.value) {
      filter["filter[_or][0][name][_icontains]"] = searchQuery.value;
      filter["filter[_or][1][company][_icontains]"] = searchQuery.value;
      filter["filter[_or][2][host][_icontains]"] = searchQuery.value;
    }

    const params = new URLSearchParams({
      limit,
      page: page.value,
      sort: '-date_created',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitors?${params.toString()}`, {
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
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token || !form.value.name) return;

  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      phone: form.value.phone,
      company: form.value.company,
      purpose: form.value.purpose,
      host: form.value.host,
      tenant: { tenantId }
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitors`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Reset & Reload
      form.value = { name: '', phone: '', company: '', purpose: '', host: '' };
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

const formatTime = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadVisitors();
});
</script>

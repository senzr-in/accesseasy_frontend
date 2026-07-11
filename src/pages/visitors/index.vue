<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden animate-in">

    <!-- Page Header -->
    <div class="flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-lg font-bold text-slate-900">Visitor Management</h1>
          <p class="text-xs text-slate-500">Register, manage and track all visitors</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Portal Link Share -->
        <button
          v-if="activePortal"
          @click="copyPortalLink"
          class="btn-secondary text-xs"
          title="Share visitor registration link"
        >
          <LinkIcon class="w-3.5 h-3.5" />
          Share Portal Link
        </button>
        <button @click="showAddModal = true" class="btn-primary text-sm">
          <UserPlus class="w-4 h-4" />
          Register Visitor
        </button>
      </div>
    </div>

    <!-- Portal link copied toast -->
    <transition name="fade">
      <div v-if="linkCopied" class="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700">
        <CheckCircle class="w-4 h-4" />
        Portal link copied to clipboard! Share it with visitors to self-register.
      </div>
    </transition>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 shrink-0">
      <button 
        @click="activeTab = 'records'"
        class="px-4 py-2 text-sm font-bold transition-all relative"
        :class="activeTab === 'records' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'"
      >
        Visitor Records
        <span v-if="activeTab === 'records'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
      </button>
      <button 
        @click="activeTab = 'logs'"
        class="px-4 py-2 text-sm font-bold transition-all relative flex items-center gap-1.5"
        :class="activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'"
      >
        <Activity class="w-3.5 h-3.5" /> Live Logs
        <span class="flex h-1.5 w-1.5 relative -top-1">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span v-if="activeTab === 'logs'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
      </button>
      <button 
        @click="activeTab = 'analytics'"
        class="px-4 py-2 text-sm font-bold transition-all relative flex items-center gap-1.5"
        :class="activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'"
      >
        <BarChart3 class="w-3.5 h-3.5" /> Analytics
        <span v-if="activeTab === 'analytics'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
      </button>
      <button 
        @click="activeTab = 'portals'"
        class="px-4 py-2 text-sm font-bold transition-all relative flex items-center gap-1.5"
        :class="activeTab === 'portals' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'"
      >
        <Globe class="w-3.5 h-3.5" /> Registration Links
        <span v-if="activeTab === 'portals'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
      </button>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'" class="flex flex-col gap-4 animate-in">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="ae-card p-4 ae-card-hover border-l-4 border-l-indigo-500">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Database</p>
          <p class="text-3xl font-bold text-slate-900">{{ totalItems }}</p>
        </div>
        <div class="ae-card p-4 ae-card-hover border-l-4 border-l-emerald-500">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Checked In (Active)</p>
          <p class="text-3xl font-bold text-emerald-600">{{ analytics.checkedIn }}</p>
        </div>
        <div class="ae-card p-4 ae-card-hover border-l-4 border-l-slate-400">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Checked Out</p>
          <p class="text-3xl font-bold text-slate-700">{{ analytics.checkedOut }}</p>
        </div>
        <div class="ae-card p-4 ae-card-hover border-l-4 border-l-rose-500">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Blocked / Denied</p>
          <p class="text-3xl font-bold text-rose-600">{{ analytics.blocked }}</p>
        </div>
      </div>
      <div class="ae-card flex-1 min-h-[300px] flex flex-col items-center justify-center text-center p-10 bg-slate-50/50">
        <BarChart3 class="w-12 h-12 text-slate-300 mb-3" />
        <h3 class="text-sm font-bold text-slate-700">Visitor Trends</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm">Historical visitor trend charts and peak time analytics will populate here once enough data is collected.</p>
      </div>
    </div>

    <!-- Search & Export Bar (Only in Records Tab) -->
    <div v-if="activeTab === 'records'" class="flex items-center gap-3 shrink-0 animate-in">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by name, email, mobile..."
          class="ae-input pl-9"
          @input="debouncedSearch"
        />
      </div>

      <!-- Status Filter -->
      <div class="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-1">
        <button
          v-for="f in filters"
          :key="f.value"
          @click="statusFilter = f.value"
          class="px-3 py-1 rounded-md text-xs font-semibold transition-all"
          :class="statusFilter === f.value
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Export -->
      <div class="relative group">
        <button class="btn-secondary text-xs">
          <FileDown class="w-3.5 h-3.5" />
          Export
        </button>
        <div class="absolute right-0 mt-1 w-36 ae-card shadow-lg py-1 z-50 hidden group-hover:block">
          <button class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" @click="exportVisitorsExcel">
            Export Excel
          </button>
          <button class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors" @click="exportVisitorsCSV">
            Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Visitor Table -->
    <div v-if="activeTab === 'records'" class="ae-card overflow-hidden flex flex-col flex-1 min-h-0 animate-in">
      <!-- Table Header -->
      <div class="grid grid-cols-12 px-5 py-3 border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
        <div class="col-span-4">Visitor</div>
        <div class="col-span-3 hidden md:block">Contact</div>
        <div class="col-span-2 hidden lg:block">Validity</div>
        <div class="col-span-2 text-center">Status</div>
        <div class="col-span-1 text-center">Actions</div>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto flex-1 custom-scrollbar">
        <!-- Loading -->
        <div v-if="loading" class="flex flex-col gap-3 p-4">
          <div v-for="i in 5" :key="i" class="h-14 bg-slate-100 animate-pulse rounded-lg" />
        </div>

        <!-- Empty -->
        <div v-else-if="filteredItems.length === 0" class="py-20 text-center">
          <Users class="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p class="text-sm font-semibold text-slate-500">No visitors found</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          <button v-if="searchQuery" class="mt-3 text-xs font-medium text-indigo-600 hover:underline" @click="searchQuery = ''; loadVisitors()">
            Clear search
          </button>
        </div>

        <!-- Rows -->
        <div
          v-for="visitor in filteredItems"
          :key="visitor.id"
          class="grid grid-cols-12 px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer items-center"
          @click="viewVisitorCard(visitor)"
        >
          <!-- Avatar + Name -->
          <div class="col-span-4 flex items-center gap-4">
            <div class="p-1 rounded-[1.25rem] bg-slate-100/80 border border-slate-200/60 shadow-sm shrink-0">
              <div class="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-100 flex items-center justify-center text-xl font-black text-indigo-700">
                <img v-if="visitor.photo" :src="getPhotoUrl(visitor.photo)" class="w-full h-full object-cover" />
                <span v-else>{{ visitor.personName?.charAt(0).toUpperCase() || '?' }}</span>
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-base font-bold text-slate-900 truncate">{{ visitor.personName }}</p>
              <p class="text-sm text-slate-500 truncate">{{ visitor.personToMeet ? `→ ${visitor.personToMeet}` : visitor.company || '' }}</p>
            </div>
          </div>

          <!-- Contact -->
          <div class="col-span-3 hidden md:block">
            <p class="text-sm text-slate-700">{{ visitor.mobileNumber || '—' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ visitor.email || '' }}</p>
          </div>

          <!-- Validity -->
          <div class="col-span-2 hidden lg:block">
            <p class="text-sm text-slate-700">{{ formatDate(visitor.startDate) }}</p>
            <p class="text-xs text-slate-400">{{ visitor.startTime?.slice(0, 5) || '' }} – {{ visitor.endTime?.slice(0, 5) || '' }}</p>
          </div>

          <!-- Status -->
          <div class="col-span-2 flex justify-center">
            <span class="badge" :class="getStatusClass(visitor.status)">
              <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDot(visitor.status)" />
              {{ getStatusLabel(visitor.status) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-1 flex justify-center gap-1" @click.stop>
            <!-- View -->
            <button @click="viewVisitorCard(visitor)" class="btn-icon" title="View badge">
              <Eye class="w-3.5 h-3.5" />
            </button>
            <!-- Block / Unblock -->
            <button
              @click="toggleBlock(visitor)"
              class="btn-icon"
              :title="visitor.status === 'blocked' ? 'Unblock visitor' : 'Block visitor'"
              :class="visitor.status === 'blocked' ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50' : ''"
            >
              <component :is="visitor.status === 'blocked' ? ShieldCheck : ShieldOff" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white shrink-0">
        <button
          class="btn-secondary text-xs py-1.5"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          ← Previous
        </button>
        <span class="text-xs text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }} &nbsp;·&nbsp; {{ totalItems }} total
        </span>
        <button
          class="btn-secondary text-xs py-1.5"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Registration Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div class="relative w-full max-w-md ae-card shadow-xl overflow-hidden animate-in flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <UserPlus class="w-4 h-4 text-indigo-600" />
                </div>
                <h3 class="text-sm font-bold text-slate-900">Pre-Register Visitor</h3>
              </div>
              <button @click="showAddModal = false" class="btn-icon">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Form -->
            <div class="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div class="space-y-1.5">
                <label class="ae-section-label">Full Name <span class="text-rose-500">*</span></label>
                <input v-model="form.personName" type="text" placeholder="John Doe" class="ae-input" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="ae-section-label">Mobile <span class="text-rose-500">*</span></label>
                  <input v-model="form.mobileNumber" type="text" inputmode="numeric" maxlength="10" placeholder="10-digit" class="ae-input" @input="form.mobileNumber = $event.target.value.replace(/\D/g, '')" />
                </div>
                <div class="space-y-1.5">
                  <label class="ae-section-label">Email</label>
                  <input v-model="form.email" type="email" placeholder="john@example.com" class="ae-input" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="ae-section-label">Start Date</label>
                  <input v-model="form.startDate" type="date" class="ae-input" />
                </div>
                <div class="space-y-1.5">
                  <label class="ae-section-label">End Date</label>
                  <input v-model="form.endDate" type="date" class="ae-input" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="ae-section-label">Start Time</label>
                  <input v-model="form.startTime" type="time" class="ae-input" />
                </div>
                <div class="space-y-1.5">
                  <label class="ae-section-label">End Time</label>
                  <input v-model="form.endTime" type="time" class="ae-input" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="ae-section-label">Person to Meet</label>
                  <input v-model="form.personToMeet" type="text" placeholder="Host name or department" class="ae-input" />
                </div>
                <div class="space-y-1.5">
                  <label class="ae-section-label">Reason for Visit</label>
                  <input v-model="form.reasonForVisit" type="text" placeholder="e.g. Meeting, Interview" class="ae-input" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="ae-section-label">Access Level (Optional)</label>
                <select v-model="form.assignedAccessLevels" class="ae-select">
                  <option value="">None</option>
                  <option v-for="lvl in accessLevels" :key="lvl.id" :value="lvl.id">{{ lvl.accessLevelName }}</option>
                </select>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button @click="showAddModal = false" class="btn-ghost">Cancel</button>
              <button
                :disabled="!form.personName || !form.mobileNumber || saving"
                @click="submitVisitor"
                class="btn-primary"
              >
                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                <UserPlus v-else class="w-4 h-4" />
                Register
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Live Logs Tab -->
    <div v-if="activeTab === 'logs'" class="flex-1 flex flex-col overflow-hidden animate-in">
      <LiveVisitorLogsTable class="flex-1 shadow-none border border-slate-200/50" />
    </div>

    <!-- Registration Links Tab -->
    <div v-if="activeTab === 'portals'" class="flex-1 flex flex-col overflow-hidden animate-in">
      <VisitorPortals embedded class="flex-1 shadow-none border border-slate-200/50 rounded-xl" />
    </div>

    <!-- Visitor Pass Modal -->
    <VisitorPassModal
      :show="showIdCardModal"
      :visitor="selectedVisitorForCard"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Users, Search, UserPlus, Loader2, X, FileDown, ArrowLeft,
  Eye, ShieldOff, ShieldCheck, LinkIcon, CheckCircle, Activity,
  BarChart3, Globe
} from 'lucide-vue-next';
import ExcelJS from 'exceljs';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import VisitorPassModal from '@/components/common/modals/VisitorPassModal.vue';
import LiveVisitorLogsTable from '@/pages/dashboard/components/LiveVisitorLogsTable.vue';
import VisitorPortals from '@/pages/visitorPortals/index.vue';

const activeTab = ref('records');

const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;

const getPhotoUrl = (photoId) => photoId ? `${apiUrl}/assets/${photoId}?access_token=${token}` : '';

// State
const loading = ref(true);
const saving = ref(false);
const items = ref([]);
const accessLevels = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const page = ref(1);
const limit = 15;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / limit));
const showAddModal = ref(false);
const showIdCardModal = ref(false);
const selectedVisitorForCard = ref(null);
const linkCopied = ref(false);
const activePortal = ref(null);

const analytics = computed(() => {
  return {
    checkedIn: items.value.filter(v => v.status === 'active').length,
    checkedOut: items.value.filter(v => v.status === 'checked_out').length,
    blocked: items.value.filter(v => v.status === 'blocked').length
  };
});

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'inactive' },
  { label: 'Blocked', value: 'blocked' },
];

const filteredItems = computed(() => {
  if (statusFilter.value === 'all') return items.value;
  return items.value.filter(v => v.status === statusFilter.value);
});

const today = new Date().toISOString().split('T')[0];
const form = ref({
  personName: '', mobileNumber: '', email: '',
  startDate: today, endDate: today,
  startTime: '09:00', endTime: '18:00',
  personToMeet: '', reasonForVisit: '', assignedAccessLevels: ''
});

const viewVisitorCard = (visitor) => {
  selectedVisitorForCard.value = visitor;
  showIdCardModal.value = true;
};

const handleModalClose = () => {
  showIdCardModal.value = false;
  loadVisitors(); // Auto-refresh to get updated photos or status changes
};

// Debounced search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { page.value = 1; loadVisitors(); }, 400);
};

watch(page, () => loadVisitors());

const getStatusClass = (status) => {
  if (status === 'active') return 'badge-success';
  if (status === 'blocked') return 'badge-danger';
  return 'badge-warning';
};
const getStatusDot = (status) => {
  if (status === 'active') return 'bg-emerald-500';
  if (status === 'blocked') return 'bg-red-500';
  return 'bg-amber-500';
};
const getStatusLabel = (status) => {
  if (status === 'active') return 'Checked In';
  if (status === 'blocked') return 'Blocked';
  if (status === 'checked_out') return 'Checked Out';
  return 'Registered';
};

const loadAccessLevels = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return;
  try {
    const res = await fetch(`${apiUrl}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { const d = await res.json(); accessLevels.value = d.data || []; }
  } catch (e) { console.error(e); }
};

const loadActivePortal = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return;
  try {
    const res = await fetch(`${apiUrl}/items/visitorPortals?filter[tenant][tenantId][_eq]=${tenantId}&limit=1&fields=id,Title`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { const d = await res.json(); activePortal.value = d.data?.[0] || null; }
  } catch (e) { /* silent */ }
};

const copyPortalLink = async () => {
  if (!activePortal.value) return;
  const url = `${window.location.origin}/visit/${activePortal.value.id}`;
  try {
    await navigator.clipboard.writeText(url);
    linkCopied.value = true;
    setTimeout(() => { linkCopied.value = false; }, 3500);
  } catch (e) { alert(`Share this link: ${url}`); }
};

const loadVisitors = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return;
  loading.value = true;
  try {
    const filter = { 'filter[tenant][tenantId][_eq]': tenantId };
    if (searchQuery.value) {
      filter['filter[_or][0][personName][_icontains]'] = searchQuery.value;
      filter['filter[_or][1][email][_icontains]'] = searchQuery.value;
      filter['filter[_or][2][mobileNumber][_icontains]'] = searchQuery.value;
    }
    const params = new URLSearchParams({
      limit: limit.toString(), page: page.value.toString(),
      sort: '-date_created',
      fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,assignedAccessLevels.accessLevelName,date_created,photo,personToMeet,reasonForVisit,company',
      meta: 'filter_count', ...filter
    });
    const res = await fetch(`${apiUrl}/items/visitor?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const d = await res.json(); items.value = d.data || []; totalItems.value = d.meta?.filter_count ?? 0; }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

// Block / Unblock
const toggleBlock = async (visitor) => {
  const newStatus = visitor.status === 'blocked' ? 'inactive' : 'blocked';
  const confirmed = confirm(newStatus === 'blocked'
    ? `Block ${visitor.personName}? They will not be able to gain entry.`
    : `Unblock ${visitor.personName}?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${apiUrl}/items/visitor/${visitor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      visitor.status = newStatus;
    }
  } catch (e) { console.error('Block/unblock failed', e); }
};

const submitVisitor = async () => {
  const userTenant = await currentUserTenant.fetchLoginUserDetails();
  const tenantData = userTenant?.tenant;
  if (!tenantData || !token || !form.value.personName) return;
  if (form.value.mobileNumber && !/^\d{10}$/.test(form.value.mobileNumber)) {
    alert('Mobile number must be exactly 10 digits.');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      personName: form.value.personName, email: form.value.email,
      mobileNumber: form.value.mobileNumber, startDate: form.value.startDate,
      endDate: form.value.endDate, startTime: form.value.startTime,
      endTime: form.value.endTime, personToMeet: form.value.personToMeet || null,
      reasonForVisit: form.value.reasonForVisit || null,
      assignedAccessLevels: form.value.assignedAccessLevels || null,
      status: 'inactive', tenant: tenantData, quantity: 1
    };
    const res = await fetch(`${apiUrl}/items/visitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      form.value = { personName: '', mobileNumber: '', email: '', startDate: today, endDate: today, startTime: '09:00', endTime: '18:00', personToMeet: '', reasonForVisit: '', assignedAccessLevels: '' };
      showAddModal.value = false;
      page.value = 1;
      loadVisitors();
    }
  } catch (e) { console.error(e); }
  finally { saving.value = false; }
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// Export (unchanged logic)
const fetchAllVisitorsForExport = async () => {
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId || !token) return [];
  try {
    const res = await fetch(`${apiUrl}/items/visitor?filter[tenant][tenantId][_eq]=${tenantId}&limit=-1&sort=-date_created&fields=personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,assignedAccessLevels.accessLevelName,date_created`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { const d = await res.json(); return d.data || []; }
  } catch (e) { console.error(e); }
  return [];
};

const exportVisitorsExcel = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (!exportItems.length) { alert('No data to export'); return; }
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Visitors');
  worksheet.columns = [
    { header: 'Name', key: 'personName', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Mobile', key: 'mobileNumber', width: 15 },
    { header: 'Start Date', key: 'startDate', width: 12 },
    { header: 'End Date', key: 'endDate', width: 12 },
    { header: 'Access Level', key: 'accessLevelName', width: 25 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  exportItems.forEach(item => worksheet.addRow({ ...item, accessLevelName: item.assignedAccessLevels?.accessLevelName || 'N/A' }));
  const buffer = await workbook.xlsx.writeBuffer();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  link.download = `Visitors_${today}.xlsx`;
  link.click();
};

const exportVisitorsCSV = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (!exportItems.length) { alert('No data to export'); return; }
  const headers = ['Name', 'Email', 'Mobile', 'Start Date', 'End Date', 'Access Level', 'Status'];
  const rows = exportItems.map(i => [
    `"${(i.personName || '').replace(/"/g, '""')}"`,
    `"${(i.email || '').replace(/"/g, '""')}"`,
    i.mobileNumber, i.startDate, i.endDate,
    `"${(i.assignedAccessLevels?.accessLevelName || 'N/A').replace(/"/g, '""')}"`,
    i.status
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `Visitors_${today}.csv`;
  link.click();
};

let refreshInterval;

onMounted(() => {
  loadAccessLevels();
  loadVisitors();
  loadActivePortal();
  
  // Background polling for real-time updates without showing loading spinner
  refreshInterval = setInterval(async () => {
    // Only poll if we are on the first page and not searching to avoid disrupting user workflow
    if (page.value === 1 && !searchQuery.value) {
      const tenantId = await currentUserTenant.getTenantIdAsync();
      if (!tenantId || !token) return;
      
      try {
        const filter = { 'filter[tenant][tenantId][_eq]': tenantId };
        const params = new URLSearchParams({
          limit: limit.toString(), page: page.value.toString(),
          sort: '-date_created',
          fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,assignedAccessLevels.accessLevelName,date_created,photo,personToMeet,reasonForVisit,company',
          meta: 'filter_count', ...filter
        });
        const res = await fetch(`${apiUrl}/items/visitor?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { 
          const d = await res.json(); 
          items.value = d.data || []; 
          totalItems.value = d.meta?.filter_count ?? 0; 
        }
      } catch (e) {
        // silent fetch error during polling
      }
    }
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

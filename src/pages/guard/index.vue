<template>
  <div class="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-4">
        <!-- Title moved to global App Bar -->
      </div>
      <div class="flex gap-3">
        <button
          @click="openAddDialog"
          class="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-[10px] font-black text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm uppercase tracking-widest shrink-0"
        >
          <UserPlus class="h-3.5 w-3.5" />
          Add Guard
        </button>
      </div>
    </div>

    <!-- Stats & Search Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Stats Cards -->
      <div class="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-500">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Force</p>
          </div>
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ items.length }}</h3>
        </div>
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Personnel</p>
          </div>
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
            {{ items.filter(g => g.status === 'active').length }}
          </h3>
        </div>
      </div>

      <!-- Search -->
      <div class="col-span-1 flex items-end">
        <div class="relative w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search guards by name or email..."
            v-model="searchQuery"
            class="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-10 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
    </div>

    <!-- Guard Cards Grid -->
    <div v-else-if="filteredItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="guard in filteredItems"
        :key="guard.id"
        class="group/card bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col overflow-hidden relative"
      >
        <!-- Top accent -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-purple-500/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

        <div class="p-5 flex flex-col items-center text-center relative border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/20">
          <div class="absolute top-4 right-4">
            <span :class="[
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border',
              guard.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
            ]">
              {{ guard.status || 'active' }}
            </span>
          </div>

          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-xl shadow-inner mb-3 group-hover/card:scale-105 transition-transform duration-300 relative">
            {{ initials(guard) }}
            <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5"></div>
          </div>
          <h3 class="text-[14px] font-bold text-slate-900 dark:text-white group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">
            {{ fullName(guard) }}
          </h3>
          <p class="text-[11px] text-slate-500 mt-0.5 truncate max-w-full px-2">{{ guard.email || 'No email provided' }}</p>
        </div>

        <div class="p-5 space-y-3 flex-1 bg-white dark:bg-zinc-950">
          <div class="flex items-center gap-3 text-sm">
            <div class="p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-400">
              <Phone class="w-3.5 h-3.5" />
            </div>
            <span class="text-slate-600 dark:text-zinc-300 text-[12px] font-medium">{{ guard.phone || 'No phone' }}</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <div class="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-500">
              <ShieldCheck class="w-3.5 h-3.5" />
            </div>
            <span class="text-indigo-600 dark:text-indigo-400 text-[12px] font-black tracking-widest uppercase">Guard Role</span>
          </div>
        </div>

        <!-- Inline Actions -->
        <div class="absolute right-3 bottom-4 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity translate-y-2 group-hover/card:translate-y-0 duration-200">
          <button
            @click="editGuard(guard)"
            title="Edit Guard"
            class="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm transition-colors"
          >
            <Settings class="w-3.5 h-3.5" />
          </button>
          <button
            @click="deleteGuard(guard)"
            title="Delete Guard"
            class="flex items-center justify-center p-0 h-7 w-7 rounded-md bg-white dark:bg-zinc-800 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200 dark:border-rose-900/50 dark:hover:bg-rose-900/20 shadow-sm"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredItems.length === 0 && !loading" class="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20">
      <div class="h-16 w-16 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-sm mb-4">
        <ShieldCheck class="h-8 w-8 text-slate-400" />
      </div>
      <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">No Guards Found</h3>
      <p class="text-[13px] font-medium text-slate-500 max-w-sm text-center mb-6">
        You do not have any guards registered in the system yet.
      </p>
      <button
        @click="openAddDialog"
        class="h-9 px-4 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
      >
        <UserPlus class="w-3.5 h-3.5 mr-2" /> Add Guard
      </button>
    </div>

    <!-- Add/Edit Dialog -->
    <div v-if="showDialog" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full">
      <div class="relative w-full max-w-lg flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        <!-- Premium Glass Header -->
        <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
          <div class="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-1">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                <ShieldCheck class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {{ editingGuard ? 'Edit Guard' : 'Create Guard' }}
              </h2>
            </div>
            <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
              {{ editingGuard ? 'Update the security personnel details.' : 'Register a new guard to the system.' }}
            </p>
          </div>
          <button @click="showDialog = false" class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Dialog Body -->
        <div class="px-8 py-6 space-y-5 overflow-y-auto max-h-[60vh] bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
          <div v-if="dialogError" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-widest">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            {{ dialogError }}
          </div>

          <form @submit.prevent="handleSubmit" id="guard-form" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">First Name <span class="text-red-500">*</span></label>
                <input v-model="form.first_name" type="text" placeholder="John" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Last Name</label>
                <input v-model="form.last_name" type="text" placeholder="Doe" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Email <span class="text-red-500">*</span></label>
              <input v-model="form.email" type="email" placeholder="guard@example.com" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Phone</label>
              <input v-model="form.phone" type="tel" placeholder="+1 (555) 000-0000" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500" />
            </div>

            <div class="space-y-1.5" v-if="!editingGuard">
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Password <span class="text-red-500">*</span></label>
              <input v-model="form.password" type="password" placeholder="Minimum 8 characters" class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500" />
            </div>
          </form>
        </div>

        <!-- Dialog Footer -->
        <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end gap-3 z-10 shrink-0">
          <button type="button" @click="showDialog = false" class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all duration-200 shadow-sm">
            Cancel
          </button>
          <button type="submit" form="guard-form" :disabled="dialogLoading" class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(79,70,229,0.3)] disabled:opacity-50 transition-all active:scale-95 duration-200">
            <Loader2 v-if="dialogLoading" class="w-4 h-4 animate-spin" />
            <span class="relative z-10">{{ editingGuard ? 'Update Guard' : 'Create Personnel' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { UserPlus, Search, Loader2, ShieldCheck, Phone, Settings, Trash2, X, AlertTriangle } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const items = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showDialog = ref(false);
const editingGuard = ref(null);
const dialogLoading = ref(false);
const dialogError = ref('');

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
});

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter(g =>
    fullName(g).toLowerCase().includes(q) || (g.email || '').toLowerCase().includes(q)
  );
});

const fullName = (g) => `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown';
const initials = (g) => fullName(g).charAt(0).toUpperCase();

const openAddDialog = () => {
  editingGuard.value = null;
  dialogError.value = '';
  form.value = { first_name: '', last_name: '', email: '', phone: '', password: '' };
  showDialog.value = true;
};

const editGuard = (guard) => {
  editingGuard.value = guard;
  dialogError.value = '';
  form.value = {
    first_name: guard.first_name || '',
    last_name: guard.last_name || '',
    email: guard.email || '',
    phone: guard.phone || '',
    password: '',
  };
  showDialog.value = true;
};

const fetchGuards = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][userApp][_eq]=fieldeasy&filter[_and][1][tenant][tenantId][_eq]=${tenantId}&filter[_and][2][title][_eq]=Guard&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=email&fields[]=phone&fields[]=status`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      items.value = data.data || [];
    }
  } catch (err) {
    console.error('Failed to fetch guards:', err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  dialogError.value = '';
  if (!form.value.first_name.trim()) {
    dialogError.value = 'First name is required.';
    return;
  }
  if (!form.value.email.trim()) {
    dialogError.value = 'Email is required.';
    return;
  }
  if (!editingGuard.value && !form.value.password.trim()) {
    dialogError.value = 'Password is required for new guards.';
    return;
  }

  dialogLoading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();

    const isEdit = !!editingGuard.value;
    const url = isEdit
      ? `${import.meta.env.VITE_API_URL}/users/${editingGuard.value.id}`
      : `${import.meta.env.VITE_API_URL}/users`;

    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone: form.value.phone || null,
      userApp: 'fieldeasy',
      title: 'Guard',
      tenant: tenantId,
    };

    if (!isEdit) {
      // Fetch the generic Employee role dynamically for system auth
      const roleRes = await fetch(`${import.meta.env.VITE_API_URL}/roles?filter[name][_eq]=Employee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roleData = await roleRes.json();
      const employeeRoleId = roleData?.data?.[0]?.id;

      if (employeeRoleId) {
        payload.role = employeeRoleId;
      }
      
      payload.password = form.value.password;
    }

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const userData = await res.json();
      const newUserId = userData.data?.id;

      // If this is a newly created Guard, they strictly require a personalModule profile to pass Flow validation!
      if (!isEdit && newUserId) {
        const generatedEmpId = `GRD-${Date.now().toString().slice(-5)}`;
        const personalPayload = {
          employeeId: generatedEmpId,
          firstName: form.value.first_name,
          lastName: form.value.last_name || '-',
          personalEmail: form.value.email,
          personalPhone: form.value.phone || null,
          designation: 'Guard',
          status: 'true',
          accessOn: true,
          uniqueId: `${tenantId}-${generatedEmpId}`,
          config: [{ shiftName: 1, startTime: "09:00", endTime: "18:00" }],
          attendancePolicyHistory: { status: "published" },
          tenant: tenantId,
          assignedUser: newUserId,
        };

        const personalRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(personalPayload),
        });

        if (!personalRes.ok) {
          console.warn('Backend rejected personalModule assignment for Guard.');
        }
      }

      showDialog.value = false;
      await fetchGuards();
    } else {
      const errData = await res.json();
      dialogError.value = errData.errors?.[0]?.message || 'Failed to save guard.';
    }
  } catch (err) {
    dialogError.value = `Network error: ${err.message}`;
  } finally {
    dialogLoading.value = false;
  }
};

const deleteGuard = async (guard) => {
  if (!confirm(`Delete guard "${fullName(guard)}"?`)) return;
  try {
    const token = authService.getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${guard.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchGuards();
    } else {
      alert('Failed to delete guard.');
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
};

onMounted(() => {
  fetchGuards();
});
</script>

<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] p-6 gap-6 overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Roles</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage security personnel access roles</p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
        @click="openAdd"
      >
        <Plus class="w-4 h-4" /> Add Role
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
    </div>

    <!-- Roles Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-5 flex flex-col gap-3 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Shield class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ role.roleName || role.name }}</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{{ role.accessType || 'accesseasy' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Active
            </span>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
              title="Edit Role"
              @click.stop="openEdit(role)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div class="border-t border-slate-100 dark:border-white/5 pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p class="text-slate-400 dark:text-slate-500">Access Type</p>
            <p class="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 capitalize">{{ role.accessType || 'Standard' }}</p>
          </div>
          <div>
            <p class="text-slate-400 dark:text-slate-500">Role Name</p>
            <p class="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 capitalize">{{ role.roleName || '—' }}</p>
          </div>
        </div>

      </div>

      <!-- Empty -->
      <div v-if="roles.length === 0" class="col-span-3 py-24 flex flex-col items-center text-center">
        <Shield class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">No roles found</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Add your first security role to get started</p>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Shield class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              {{ isAdding ? 'Add Role' : 'Edit Role' }}
            </h3>
          </div>
          <button class="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" @click="closeModal">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role Name</label>
            <input
              v-model="form.roleName"
              type="text"
              placeholder="e.g. supervisor"
              class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Access Type</label>
            <select
              v-model="form.accessType"
              class="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="accessEasy">AccessEasy (Security)</option>
              <option value="workforce">Workforce</option>
            </select>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
          <button
            class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            @click="closeModal"
          >Cancel</button>
          <button
            class="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
            :disabled="saving"
            @click="saveRole"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            {{ isAdding ? 'Create Role' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Shield, Plus, Loader2, X, Pencil } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const apiUrl = import.meta.env.VITE_API_URL;
const loading = ref(false);
const saving = ref(false);
const roles = ref([]);
const showModal = ref(false);
const isAdding = ref(false);
const selectedRole = ref(null);
const form = ref({ roleName: '', accessType: 'accessEasy' });

const openAdd = () => {
  isAdding.value = true;
  selectedRole.value = null;
  form.value = { roleName: '', accessType: 'accessEasy' };
  showModal.value = true;
};

const openEdit = (role) => {
  isAdding.value = false;
  selectedRole.value = role;
  form.value = {
    roleName: role.roleName || role.name || '',
    accessType: role.accessType || 'accessEasy'
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedRole.value = null;
};

const saveRole = async () => {
  if (!form.value.roleName.trim()) return alert('Role name is required');
  saving.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();

    if (isAdding.value) {
      await fetch(`${apiUrl}/items/roleConfigurator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roleName: form.value.roleName,
          accessType: form.value.accessType,
          tenant: tenantId
        })
      });
    } else {
      await fetch(`${apiUrl}/items/roleConfigurator/${selectedRole.value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roleName: form.value.roleName,
          accessType: form.value.accessType
        })
      });
    }

    closeModal();
    await fetchRoles();
  } catch (err) {
    console.error('Save role error', err);
    alert('Failed to save role.');
  } finally {
    saving.value = false;
  }
};

const fetchRoles = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${apiUrl}/items/roleConfigurator?filter[tenant][tenantId][_eq]=${tenantId}&filter[accessType][_eq]=accessEasy`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      roles.value = data.data || [];
    }
  } catch (err) {
    console.error('Roles fetch error', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRoles);
</script>

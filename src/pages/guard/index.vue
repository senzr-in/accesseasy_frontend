<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden animate-in pb-6 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 rounded-2xl px-4 pt-3 relative">
    <!-- Header -->
    <div class="flex items-center justify-between w-full shrink-0">
      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Guard Management
          </h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage security personnel
          </p>
        </div>
      </div>
      
      <div class="flex items-center">
        <button
          class="btn-primary text-xs flex items-center gap-1.5 h-9"
          @click="openAddDialog"
        >
          <UserPlus class="w-4 h-4" /> Add Guard
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-24 flex-1 relative z-10"
    >
      <Loader2 class="w-8 h-8 animate-spin text-emerald-600" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="items.length === 0"
      class="flex flex-col items-center justify-center flex-1 text-center py-24 relative z-10"
    >
      <ShieldCheck class="w-12 h-12 text-slate-300 mb-4" />
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
        No Guards Found
      </h3>
      <p class="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        Add your first guard using their mobile number. They will log in using OTP.
      </p>
      <button
        class="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        @click="openAddDialog"
      >
        Add Guard
      </button>
    </div>

    <!-- Grid View -->
    <div
      v-else
      class="overflow-y-auto flex-1 custom-scrollbar relative z-10 pr-2"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
        <div
          v-for="guard in items"
          :key="guard.id"
          @click="selectedGuard = guard"
          :class="[
            'group relative flex flex-col rounded-[20px] p-5 border bg-white dark:bg-slate-900 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden cursor-pointer',
            guard.status === 'active' ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-emerald-500/5' :
            guard.status === 'break' ? 'border-blue-200 hover:border-blue-300 hover:shadow-blue-500/5' :
            'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:shadow-slate-500/5'
          ]"
        >
          <!-- Ambient glow background based on status (lighter for light theme) -->
          <div
            :class="[
              'absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 blur-3xl opacity-10 pointer-events-none transition-colors duration-500',
              guard.status === 'active' ? 'bg-emerald-400' :
              guard.status === 'break' ? 'bg-blue-400' : 'bg-slate-400'
            ]"
          />

          <!-- Status Dot (Top Right) -->
          <div class="absolute top-4 right-4 flex items-center justify-center">
            <div
              :class="[
                'w-2 h-2 rounded-full shadow-sm',
                guard.status === 'active' ? 'bg-emerald-500' :
                guard.status === 'break' ? 'bg-blue-500' : 'bg-slate-400'
              ]"
            />
          </div>

          <!-- Avatar & Identity -->
          <div class="relative z-10 flex flex-col items-center mt-2 mb-4">
            <div class="w-16 h-16 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 shadow-sm mb-3 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl">
              <img
                v-if="guard.avatar"
                :src="getAvatarUrl(guard.avatar)"
                :alt="guard.first_name"
                class="w-full h-full object-cover"
                @error="guard.avatar = null"
              >
              <span v-else>{{ guard.first_name?.charAt(0).toUpperCase() || '?' }}</span>
            </div>
            <h3 class="text-[16px] font-bold text-slate-900 dark:text-slate-100 tracking-wide">
              {{ guard.first_name }} {{ guard.last_name }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Employee ID {{ guard.employee_id || guard.id.toString().substring(0, 8).toUpperCase() }}
            </p>
          </div>

          <!-- Details List -->
          <div class="relative z-10 space-y-3 flex-1 w-full px-1">
            <!-- Status Row -->
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400">Status</span>
              <div class="flex items-center gap-1.5">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    guard.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    guard.status === 'break' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                  ]"
                >
                  {{ guard.status === 'active' ? 'ON DUTY' : guard.status === 'break' ? 'BREAK' : 'OFF DUTY' }}
                </span>
                <button
                  class="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Toggle Status"
                  @click.stop="cycleStatus(guard)"
                >
                  <RefreshCw class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <!-- Assigned Zone Row -->
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400">Assigned Zone</span>
              <div
                class="flex items-center gap-1.5 font-medium truncate max-w-[120px]"
                :class="guard.assigned_zone_name ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'"
                :title="guard.assigned_zone_name || 'Unassigned'"
              >
                <span class="truncate">{{ guard.assigned_zone_name || 'Unassigned' }}</span>
                <MapPin class="w-3 h-3 shrink-0" :class="guard.assigned_zone_name ? 'text-emerald-500' : 'text-slate-400'" />
              </div>
            </div>
          </div>



          <!-- Admin Actions (Edit / Delete) appearing on hover -->
          <div class="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              title="Edit Guard"
              class="h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200 dark:border-slate-800 shadow-sm"
              @click.stop="editGuard(guard)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              title="Delete Guard"
              class="h-8 w-8 rounded-full flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200 shadow-sm"
              @click.stop="deleteGuard(guard)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Guard Details Modal -->
    <Teleport to="body">
      <div
        v-if="selectedGuard"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in"
        @click="selectedGuard = null"
      >
        <div
          class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800"
          @click.stop
        >
          <div class="h-24 bg-gradient-to-r from-indigo-500 to-emerald-500 relative">
            <button
              class="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              @click="editGuard(selectedGuard)"
              title="Edit Guard"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              @click="selectedGuard = null"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <div class="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
            <div class="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-100 -mt-10 mb-3 shadow-sm flex items-center justify-center text-slate-500 text-2xl font-bold z-10">
              <button
                v-if="selectedGuard.avatar"
                @click.stop="previewImage = getAvatarUrl(selectedGuard.avatar).replace('&width=100&height=100&fit=cover', '')"
                title="View Full Photo"
                class="w-full h-full block cursor-pointer bg-transparent border-0 p-0 m-0"
              >
                <img
                  :src="getAvatarUrl(selectedGuard.avatar)"
                  class="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  @error="selectedGuard.avatar = null"
                >
              </button>
              <span v-else>{{ selectedGuard.first_name?.charAt(0).toUpperCase() || 'G' }}</span>
            </div>
            
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ selectedGuard.first_name }} {{ selectedGuard.last_name }}
            </h2>
            <p class="text-xs text-slate-500 font-medium mb-4">
              ID: {{ selectedGuard.employee_id || selectedGuard.id.toString().substring(0, 8).toUpperCase() }}
            </p>

            <div class="w-full grid grid-cols-2 gap-3 mb-6">
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                <p
                  class="text-xs font-bold"
                  :class="selectedGuard.status === 'active' ? 'text-emerald-600' : selectedGuard.status === 'break' ? 'text-blue-600' : 'text-slate-600'"
                >
                  {{ selectedGuard.status === 'active' ? 'ON DUTY' : selectedGuard.status === 'break' ? 'BREAK' : 'OFF DUTY' }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Zone</p>
                <p class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {{ selectedGuard.assigned_zone_name || 'Unassigned' }}
                </p>
              </div>
            </div>

            <div class="w-full space-y-2 text-left">
              <component
                :is="selectedGuard.phone ? 'a' : 'div'"
                :href="selectedGuard.phone ? `tel:${selectedGuard.phone}` : undefined"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                :class="{ 'cursor-pointer': selectedGuard.phone }"
              >
                <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400">Phone</p>
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ selectedGuard.phone || 'No phone provided' }}</p>
                </div>
              </component>

              <component
                :is="selectedGuard.email ? 'a' : 'div'"
                :href="selectedGuard.email ? `mailto:${selectedGuard.email}` : undefined"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                :class="{ 'cursor-pointer': selectedGuard.email }"
              >
                <div class="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400">Email</p>
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ selectedGuard.email || 'No email provided' }}</p>
                </div>
              </component>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div 
        v-if="previewImage" 
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 animate-in zoom-in-95 duration-200"
        @click="previewImage = null"
      >
        <button class="absolute top-4 right-4 text-white hover:text-slate-300">
          <X class="w-8 h-8" />
        </button>
        <img :src="previewImage" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" @click.stop />
      </div>
    </Teleport>

    <!-- Add Guard Modal -->
    <Teleport to="body">
      <div
        v-if="showAddDialog"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
      >
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 flex flex-col my-auto">
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
            {{ editingGuard ? 'Edit Guard' : 'Add Guard' }}
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
            @click="showAddDialog = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-5 space-y-5 text-left max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div class="flex flex-col items-center justify-center gap-3">
            <div class="relative">
              <div
                class="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors group"
                @click="triggerFileUpload"
              >
                <img
                  v-if="form.avatarPreview"
                  :src="form.avatarPreview"
                  class="w-full h-full object-cover"
                >
                <img
                  v-else-if="editingGuard?.avatar && !form.removeAvatar"
                  :src="getAvatarUrl(editingGuard.avatar)"
                  class="w-full h-full object-cover"
                  @error="editingGuard.avatar = null"
                >
                <div
                  v-else
                  class="text-slate-400 group-hover:text-emerald-500 flex flex-col items-center"
                >
                  <Camera class="w-6 h-6 mb-1" />
                  <span class="text-[8px] uppercase font-bold tracking-widest">Upload</span>
                </div>
                <div
                  v-if="form.avatarPreview || (editingGuard?.avatar && !form.removeAvatar)"
                  class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="w-6 h-6 text-white" />
                </div>
              </div>
              
              <button
                v-if="form.avatarPreview || (editingGuard?.avatar && !form.removeAvatar)"
                class="absolute top-0 right-0 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10 translate-x-1 -translate-y-1"
                @click.stop="form.removeAvatar = true; form.avatarFile = null; form.avatarPreview = null"
                title="Remove Photo"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept="image/*"
              @change="onFileChange"
            >
            <div class="text-center flex flex-col items-center">
              <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Guard Photo
              </p>
              <p class="text-[9px] text-slate-400 mt-0.5">
                Click to upload or change image
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">First Name</label>
              <input
                v-model="form.first_name"
                type="text"
                placeholder="John"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Last Name</label>
              <input
                v-model="form.last_name"
                type="text"
                placeholder="Doe"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address (Optional)</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="guard@example.com"
              class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mobile Number</label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="10-digit number"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assigned Zone</label>
              <select
                v-model="form.assigned_door"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
                <option :value="null">
                  Unassigned
                </option>
                <option
                  v-for="door in doors"
                  :key="door.id"
                  :value="door.id"
                >
                  {{ door.doorName || 'Unnamed Zone' }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="!editingGuard"
            class="pt-2 border-t border-slate-100 dark:border-slate-700"
          >
            <p class="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mb-2">
              Guards login using their mobile number and OTP.
            </p>
          </div>
        </div>
        <div class="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors"
            @click="showAddDialog = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
            :disabled="saving"
            @click="saveGuard"
          >
            <Loader2
              v-if="saving"
              class="w-4 h-4 animate-spin mr-2 inline"
            />
            Save Guard
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Message Guard Modal -->
    <GuardMessageModal 
      v-model:show="showMessageModal"
      :guard="selectedGuardForMessage"
      @sent="handleMessageSent"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Delete Guard"
      confirmMessage="Are you sure you want to delete this guard?"
      itemLabel="Guard Name"
      :itemName="guardToDelete ? `${guardToDelete.first_name} ${guardToDelete.last_name}` : ''"
      description="This action cannot be undone and will remove the guard's access."
      :deleting="isDeleting"
      @close="showDeleteModal = false; guardToDelete = null;"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
import { 
  Users, UserPlus, Phone, Mail, FileText, ChevronRight, CheckCircle2, 
  Clock, AlertTriangle, Search, Filter, MoreVertical, X, Shield, History, MapPin, Edit, ArrowLeft, MessageSquare, Pencil, Trash2, Camera, Loader2, RefreshCw
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import GuardMessageModal from '@/components/guard/GuardMessageModal.vue';
import ConfirmDeleteModal from '@/components/common/modals/ConfirmDeleteModal.vue';

const apiUrl = import.meta.env.VITE_API_URL;
const loading = ref(false);
const saving = ref(false);
const selectedGuard = ref(null);
const previewImage = ref(null);
const showAddDialog = ref(false);
const showDeleteModal = ref(false);
const guardToDelete = ref(null);
const isDeleting = ref(false);
const editingGuard = ref(null);
const doors = ref([]);
const fileInput = ref(null);
const form = ref({ 
  first_name: '', 
  last_name: '', 
  email: '', 
  phone: '',
  assigned_door: null,
  avatarFile: null,
  avatarPreview: null,
  removeAvatar: false
});
const items = ref([]);
const guardRoleId = ref(null);

const showMessageModal = ref(false);
const selectedGuardForMessage = ref(null);

const openMessageModal = (guard) => {
  selectedGuardForMessage.value = guard;
  showMessageModal.value = true;
};

const handleMessageSent = () => {
  console.log('Message sent successfully.');
};

const cycleStatus = async (guard) => {
  const cycle = { active: 'suspended', suspended: 'active' };
  // For break status, go to active; otherwise cycle active ↔ suspended
  const nextStatus = guard.status === 'break' ? 'active' : (cycle[guard.status] || 'active');
  try {
    const token = authService.getToken();
    const res = await fetch(`${apiUrl}/users/${guard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      guard.status = nextStatus;
    } else {
      const err = await res.json();
      alert('Failed to update status: ' + (err.errors?.[0]?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Status update error', err);
    alert('Failed to update guard status.');
  }
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  form.value.avatarFile = file;
  form.value.avatarPreview = URL.createObjectURL(file);
};

const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const getAvatarUrl = (avatarId) => {
  if (!avatarId) return '';
  const token = authService.getToken();
  return `${apiUrl}/assets/${avatarId}?access_token=${token}&width=100&height=100&fit=cover`;
};

const openAddDialog = () => {
  editingGuard.value = null;
  form.value = { 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone: '',
    assigned_door: null,
    avatarFile: null,
    avatarPreview: null,
    removeAvatar: false
  };
  showAddDialog.value = true;
};

const editGuard = async (guard) => {
  selectedGuard.value = null;
  editingGuard.value = guard;
  form.value = {
    first_name: guard.first_name || '',
    last_name: guard.last_name || '',
    email: guard.email || '',
    phone: (guard.phone || '').replace(/^\+91/, ''),
    assigned_door: null,
    avatarFile: null,
    avatarPreview: null,
    removeAvatar: false
  };
  showAddDialog.value = true;
  
  try {
    const token = authService.getToken();
    const pmRes = await fetch(`${apiUrl}/items/personalModule?filter[assignedUser][_eq]=${guard.id}&fields[]=id&fields[]=assigned_door`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (pmRes.ok) {
        const pmData = await pmRes.json();
        if (pmData.data && pmData.data.length > 0) {
            const pm = pmData.data[0];
            form.value.assigned_door = typeof pm.assigned_door === 'object' && pm.assigned_door !== null ? pm.assigned_door.id || pm.assigned_door : pm.assigned_door;
            editingGuard.value.personalModuleId = pm.id;
        }
    }
  } catch(err) {
      console.error('Failed to fetch guard personal info:', err);
  }
};

const deleteGuard = (guard) => {
  guardToDelete.value = guard;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!guardToDelete.value) return;
  isDeleting.value = true;
  try {
    const token = authService.getToken();
    await fetch(`${apiUrl}/users/${guardToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchGuards();
    showDeleteModal.value = false;
    guardToDelete.value = null;
  } catch (err) {
    console.error('Delete error', err);
    alert('Failed to delete guard');
  } finally {
    isDeleting.value = false;
  }
};

const fetchDoors = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(`${apiUrl}/items/doors?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&fields[]=id&fields[]=doorName`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      doors.value = data.data || [];
    }
  } catch (err) {
    console.error('Failed to fetch doors:', err);
  }
};

const fetchGuardRoleId = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        guardRoleId.value = data.data[0].id;
        return data.data[0].id;
      }
    }
  } catch (err) {
    console.error('Failed to fetch guard role ID:', err);
  }
  return null;
};

const fetchGuards = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    let roleId = guardRoleId.value;
    if (!roleId) {
      roleId = await fetchGuardRoleId();
    }

    let filterString = `filter[tenant][_eq]=${tenantId}`;
    if (roleId) {
      filterString += `&filter[accesseasyRole][_eq]=${roleId}`;
    }

    const res = await fetch(
      `${apiUrl}/users?${filterString}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=email&fields[]=phone&fields[]=status&fields[]=title&fields[]=avatar&fields[]=accesseasyRole.*&fields[]=tenant.userApp`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      items.value = (data.data || []).map(u => ({
        ...u,
        employee_id: u.title || null
      }));
      
      const guardIds = items.value.map(g => g.id).join(',');
      if (guardIds) {
        const pmRes = await fetch(`${apiUrl}/items/personalModule?filter[assignedUser][_in]=${guardIds}&fields[]=assignedUser&fields[]=assigned_door.doorName`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (pmRes.ok) {
           const pmData = await pmRes.json();
           const zoneMap = {};
           pmData.data.forEach(pm => {
              if (pm.assignedUser && pm.assigned_door && pm.assigned_door.doorName) {
                  zoneMap[pm.assignedUser] = pm.assigned_door.doorName;
              }
           });
           items.value.forEach(g => {
              if (zoneMap[g.id]) g.assigned_zone_name = zoneMap[g.id];
           });
        }
      }
    }
  } catch (err) {
    console.error('Fetch error', err);
  } finally {
    loading.value = false;
  }
};

const saveGuard = async () => {
  if (!form.value.first_name.trim()) return alert("First name is required");
  if (!form.value.phone || form.value.phone.length < 10) return alert("Valid 10-digit mobile number is required");
  
  saving.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    const roleRes = await fetch(`${apiUrl}/roles?filter[name][_eq]=Employee`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const roleData = await roleRes.json();
    const employeeRoleId = roleData?.data?.[0]?.id;

    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: `+91${form.value.phone.replace(/\D/g, '')}`,
    };
    
    if (form.value.email) {
      payload.email = form.value.email;
    }
    
    if (!editingGuard.value) {
      payload.userApp = 'accesseasy';
      payload.accesseasyRole = guardRoleId.value || null;
      payload.tenant = tenantId;
      payload.role = employeeRoleId;
      if (!payload.email) payload.email = `guard_${Date.now()}@accesseasy.app`;
    }

    if (form.value.avatarFile) {
      const formData = new FormData();
      formData.append('title', `guard-avatar-${Date.now()}`);
      formData.append('file', form.value.avatarFile);
      
      const fileRes = await fetch(`${apiUrl}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        payload.avatar = fileData.data.id;
      } else {
         const errData = await fileRes.json();
         console.warn("Avatar upload failed", errData);
         alert("Image upload failed: " + (errData.errors?.[0]?.message || "Unknown error"));
         saving.value = false;
         return;
      }
    } else if (form.value.removeAvatar) {
      payload.avatar = null;
    }

    const url = editingGuard.value
      ? `${apiUrl}/users/${editingGuard.value.id}`
      : `${apiUrl}/users`;

    const res = await fetch(url, {
      method: editingGuard.value ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const userData = await res.json();
      const newUserId = userData.data?.id;

      // Personal Module for Guard
      if (!editingGuard.value && newUserId) {
        const generatedEmpId = `GRD-${Date.now().toString().slice(-5)}`;
        const personalPayload = {
          employeeId: generatedEmpId,
          firstName: form.value.first_name,
          lastName: form.value.last_name || '-',
          personalPhone: payload.phone,
          personalEmail: payload.email,
          designation: 'Guard',
          status: 'true',
          accessOn: true,
          uniqueId: `${tenantId}-${generatedEmpId}`,
          tenant: tenantId,
          assignedUser: newUserId,
          assigned_door: form.value.assigned_door,
          mobilePermissions: { enable_incidents: true, enable_patrols: true }
        };

        await fetch(`${apiUrl}/items/personalModule`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(personalPayload),
        });
      } else if (editingGuard.value && editingGuard.value.personalModuleId) {
        // Update assigned_door and email
        await fetch(`${apiUrl}/items/personalModule/${editingGuard.value.personalModuleId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
             assigned_door: form.value.assigned_door,
             personalEmail: form.value.email
          }),
        });
      }

      showAddDialog.value = false;
      await fetchGuards();
    } else {
      const err = await res.json();
      alert(err.errors?.[0]?.message || 'Failed to save guard');
    }
  } catch (err) {
    console.error('Save error', err);
    alert('An error occurred while saving the guard.');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchGuards();
  fetchDoors();
});
</script>

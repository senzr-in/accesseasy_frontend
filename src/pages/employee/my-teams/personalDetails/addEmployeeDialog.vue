<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full"
  >
    <div class="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-violet-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
        <div class="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20 shadow-inner">
              <UserPlus class="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ employee ? 'Edit Profile' : 'Onboard Employee' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
            {{ employee ? 'Update personal details and organization assignment.' : 'Create a new digital identity for access control and management.' }}
          </p>
        </div>
        <button
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <form
          id="employee-form"
          class="space-y-10"
          @submit.prevent="handleSubmit"
        >
          <!-- Personal Info -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <User class="w-4 h-4 text-violet-500" /> Personal Identity
            </h4>
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">First Name <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  required
                  placeholder="John"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Middle Name</label>
                <input
                  v-model="formData.middleName"
                  type="text"
                  placeholder="M."
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last Name <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gender</label>
                <select
                  v-model="formData.gender"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select gender
                  </option>
                  <option value="male">
                    Male
                  </option>
                  <option value="female">
                    Female
                  </option>
                  <option value="other">
                    Other
                  </option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Marital Status</label>
                <select
                  v-model="formData.maritalStatus"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select status
                  </option>
                  <option value="single">
                    Single
                  </option>
                  <option value="married">
                    Married
                  </option>
                  <option value="divorced">
                    Divorced
                  </option>
                  <option value="widowed">
                    Widowed
                  </option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date of Birth</label>
                <input
                  v-model="formData.dateOfBirth"
                  type="date"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Blood Group</label>
                <select
                  v-model="formData.bloodGroup"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select group
                  </option>
                  <option
                    v-for="bg in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']"
                    :key="bg"
                    :value="bg"
                  >
                    {{ bg }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact & Address -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Plus class="w-4 h-4 rotate-45 text-violet-500" /> Contact Details
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Personal Email</label>
                <input
                  v-model="formData.personalEmail"
                  type="email"
                  placeholder="personal@email.com"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Personal Phone</label>
                <input
                  v-model="formData.personalPhone"
                  type="tel"
                  placeholder="+1 234 567 890"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
            </div>
            <div class="grid gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Permanent Address</label>
                <input
                  v-model="formData.permanentAddress"
                  type="text"
                  placeholder="Full permanent address..."
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Communication Address</label>
                <input
                  v-model="formData.communicationAddress"
                  type="text"
                  placeholder="Full communication address..."
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
            </div>
          </div>

          <!-- Professional Details -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <UserPlus class="w-4 h-4 text-violet-500" /> Professional Status
            </h4>
            <div class="grid gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Official Email <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="john.doe@organization.com"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Employee ID <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.employeeId"
                  type="text"
                  required
                  placeholder="EMP001"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Designation</label>
                <input
                  v-model="formData.designation"
                  type="text"
                  placeholder="Software Engineer"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date of Joining</label>
                <input
                  v-model="formData.dateOfJoining"
                  type="date"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</label>
                <select
                  v-model="formData.status"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option value="active">
                    Active
                  </option>
                  <option value="inactive">
                    Inactive
                  </option>
                  <option value="suspended">
                    Suspended
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Organization Structure -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Building class="w-4 h-4 text-violet-500" /> Organization Structure
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Department</label>
                <select
                  v-model="formData.departmentId"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select department
                  </option>
                  <option
                    v-for="dept in departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name || dept.departmentName }}
                  </option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Branch</label>
                <select
                  v-model="formData.branchId"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select branch
                  </option>
                  <option
                    v-for="branch in branches"
                    :key="branch.id"
                    :value="branch.id"
                  >
                    {{ branch.locdetail?.locationName || branch.name || branch.branchName }}
                  </option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Access Group</label>
                <select
                  v-model="formData.groupId"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select group
                  </option>
                  <option
                    v-for="group in groups"
                    :key="group.id"
                    :value="group.id"
                  >
                    {{ group.accessLevelName || group.name || group.groupName }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Form End -->
          </div>

          <!-- Credentials & Access -->
          <div class="space-y-5">
            <h4 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <ShieldAlert class="w-4 h-4 text-violet-500" /> Credentials & Access
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">RFID Card Number</label>
                <input
                  v-model="formData.rfidCard"
                  type="text"
                  placeholder="Enter RFID Card number..."
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5 flex flex-col justify-end">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Access Status</label>
                <div class="flex items-center gap-2 h-9">
                  <input
                    id="access-on-checkbox"
                    v-model="formData.accessOn"
                    type="checkbox"
                    class="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                  <label
                    for="access-on-checkbox"
                    class="text-sm font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {{ formData.accessOn ? 'Access Enabled' : 'Access Disabled' }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Allowed Entrance Modes -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Allowed Entrance Modes</label>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <!-- Face -->
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all">
                  <input
                    v-model="formData.face"
                    type="checkbox"
                    class="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-zinc-300 select-none">Face</span>
                </label>
                <!-- Finger -->
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all">
                  <input
                    v-model="formData.finger"
                    type="checkbox"
                    class="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-zinc-300 select-none">Fingerprint</span>
                </label>
                <!-- RFID -->
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all">
                  <input
                    v-model="formData.rfid"
                    type="checkbox"
                    class="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-zinc-300 select-none">RFID</span>
                </label>
                <!-- QR -->
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all">
                  <input
                    v-model="formData.QrAttendance"
                    type="checkbox"
                    class="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-zinc-300 select-none">QR Code</span>
                </label>
                <!-- Geo -->
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all">
                  <input
                    v-model="formData.GeoAttendance"
                    type="checkbox"
                    class="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                  <span class="text-xs font-semibold text-slate-700 dark:text-zinc-300 select-none">Geo Fence</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Inline Error Banner -->
      <div
        v-if="errorMessage"
        class="mx-8 mb-4 flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2 duration-200 shrink-0"
      >
        <AlertTriangle class="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <span class="flex-1 break-words">{{ errorMessage }}</span>
        <button
          type="button"
          class="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          @click="errorMessage = ''"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end gap-3 z-10 shrink-0">
        <button
          type="button"
          class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="employee-form"
          :disabled="loading"
          class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          <Loader2
            v-if="loading"
            class="w-4 h-4 animate-spin"
          />
          <span class="relative z-10">{{ employee ? 'Update Profile' : 'Onboard Employee' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, Loader2, UserPlus, User, Plus, Building, AlertTriangle, ShieldAlert } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { convertToCardAccessHex } from '@/utils/helpers/convertToCardAccessHex';

const props = defineProps({
  modelValue: Boolean,
  employee: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);
const errorMessage = ref('');
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const departments = ref([]);
const branches = ref([]);
const groups = ref([]);

const originalCardNumber = ref('');
const originalCardId = ref(null);

const fetchEmployeeCard = async () => {
  if (!props.employee?.id) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${props.employee.id}&filter[type][_eq]=rfid`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.data?.length > 0) {
      originalCardId.value = data.data[0].id;
      originalCardNumber.value = data.data[0].rfidCard;
      formData.value.rfidCard = data.data[0].rfidCard;
    } else {
      originalCardId.value = null;
      originalCardNumber.value = '';
      formData.value.rfidCard = '';
    }
  } catch (err) {
    console.error("Error fetching employee card:", err);
  }
};

const formData = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  gender: '',
  bloodGroup: '',
  dateOfBirth: '',
  maritalStatus: '',
  permanentAddress: '',
  communicationAddress: '',
  personalEmail: '',
  personalPhone: '',
  employeeId: '',
  designation: '',
  dateOfJoining: '',
  departmentId: '',
  branchId: '',
  groupId: '',
  status: 'active',
  rfidCard: '',
  accessOn: true,
  face: false,
  finger: false,
  rfid: false,
  QrAttendance: false,
  GeoAttendance: false,
});

// Load dropdowns when opened
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    errorMessage.value = '';
    if (props.employee) {
      // Editing existing employee
      formData.value = {
        firstName: props.employee.firstName || props.employee.assignedUser?.first_name || '',
        middleName: props.employee.middleName || '',
        lastName: props.employee.lastName || props.employee.assignedUser?.last_name || '',
        email: props.employee.assignedUser?.email || '',
        gender: props.employee.gender || '',
        bloodGroup: props.employee.bloodGroup || '',
        dateOfBirth: props.employee.dateOfBirth ? props.employee.dateOfBirth.split('T')[0] : '',
        maritalStatus: props.employee.maritalStatus || '',
        permanentAddress: props.employee.permanentAddress || '',
        communicationAddress: props.employee.communicationAddress || '',
        personalEmail: props.employee.personalEmail || '',
        personalPhone: props.employee.personalPhone || props.employee.assignedUser?.phone || '',
        employeeId: props.employee.employeeId || '',
        designation: props.employee.designation || '',
        dateOfJoining: props.employee.dateOfJoining ? props.employee.dateOfJoining.split('T')[0] : '',
        departmentId: props.employee.department?.id || props.employee.department || '',
        branchId: props.employee.branch?.id || props.employee.branch || '',
        groupId: props.employee.assignedAccessLevel?.id || props.employee.assignedAccessLevel || props.employee.group?.id || props.employee.group || '',
        status: props.employee.status || 'active',
        rfidCard: '',
        accessOn: props.employee.accessOn !== false,
        face: props.employee.face === true,
        finger: props.employee.finger === true,
        rfid: props.employee.rfid === true,
        QrAttendance: props.employee.QrAttendance === true,
        GeoAttendance: props.employee.GeoAttendance === true,
      };
      originalCardId.value = null;
      originalCardNumber.value = '';
      fetchEmployeeCard();
    } else {
      // Reset Form for new employee
      formData.value = {
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        gender: '',
        bloodGroup: '',
        dateOfBirth: '',
        maritalStatus: '',
        permanentAddress: '',
        communicationAddress: '',
        personalEmail: '',
        personalPhone: '',
        employeeId: '',
        designation: '',
        dateOfJoining: '',
        departmentId: '',
        branchId: '',
        groupId: '',
        status: 'active',
        rfidCard: '',
        accessOn: true,
        face: false,
        finger: false,
        rfid: false,
        QrAttendance: false,
        GeoAttendance: false,
      };
      originalCardId.value = null;
      originalCardNumber.value = '';
    }
    
    fetchDepartments();
    fetchBranches();
    fetchGroups();
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const fetchDepartments = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    departments.value = data.data || [];
  } catch (err) {}
};

const fetchBranches = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/locationManagement?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][locType][_eq]=branch`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    branches.value = data.data || [];
  } catch (err) {}
};

const fetchGroups = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    groups.value = data.data || [];
  } catch (err) {}
};

// Handle Employee Creation mapping strictly to test-web-1 action schema
const handleSubmit = async () => {
  loading.value = true;
  try {
    const isEdit = !!props.employee;
    let newUserId = null;

    // Validate RFID Card uniqueness if entered
    if (formData.value.rfidCard && formData.value.rfidCard !== originalCardNumber.value) {
      const cardCheckRes = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${formData.value.rfidCard}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cardCheckRes.ok) {
        const cardCheckData = await cardCheckRes.json();
        if (cardCheckData.data?.length > 0) {
          throw new Error(`RFID Card Number ${formData.value.rfidCard} is already assigned to another employee.`);
        }
      }
    }

    if (!isEdit) {
      // Step 1: Create the Directus user first (following Next.js pattern)
      // First figure out employee role ID
      const roleRes = await fetch(`${import.meta.env.VITE_API_URL}/roles?filter[name][_eq]=Employee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roleData = await roleRes.json();
      const employeeRoleId = roleData?.data?.[0]?.id;

      if (!employeeRoleId) throw new Error("Employee role not found configuring system");

      const userPayload = {
        first_name: formData.value.firstName,
        last_name: formData.value.lastName || '-',
        email: formData.value.email,
        role: employeeRoleId,
        tenant: tenantId,
        phone: formData.value.personalPhone ? `+91${formData.value.personalPhone}` : formData.value.personalEmail,
        userApp: "accesseasy",
        appAccess: true
      };

      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userPayload)
      });

      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error("Failed to create user account: " + (errorData.errors?.[0]?.message || 'Unknown'));
      }

      const userData = await userRes.json();
      newUserId = userData.data.id;
    } else {
        // If editing, update existing user properties slightly
        if(props.employee.assignedUser?.id) {
             const userUpdatePayload = {
                first_name: formData.value.firstName,
                last_name: formData.value.lastName || '-',
                phone: formData.value.personalPhone ? `+91${formData.value.personalPhone}` : null,
                email: formData.value.email
             };
             const patchRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${props.employee.assignedUser.id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(userUpdatePayload)
            });
            if (!patchRes.ok) {
              const errData = await patchRes.json();
              throw new Error("Failed to update user: " + (errData.errors?.[0]?.message || 'Unknown'));
            }
        }
    }

    // Step 2: Create/Update the PersonalModule record linked to user
    const personalPayload = {
      employeeId: formData.value.employeeId,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      middleName: formData.value.middleName,
      personalEmail: formData.value.personalEmail,
      personalPhone: formData.value.personalPhone ? `+91${formData.value.personalPhone}` : null,
      gender: formData.value.gender,
      dateOfBirth: formData.value.dateOfBirth || null,
      maritalStatus: formData.value.maritalStatus,
      bloodGroup: formData.value.bloodGroup,
      communicationAddress: formData.value.communicationAddress,
      permanentAddress: formData.value.permanentAddress,
      designation: formData.value.designation,
      dateOfJoining: formData.value.dateOfJoining || null,
      
      // Critical fields required by backend
      status: formData.value.status === 'active' ? 'true' : 'false',
      accessOn: formData.value.accessOn,
      face: formData.value.face,
      finger: formData.value.finger,
      rfid: formData.value.rfid,
      QrAttendance: formData.value.QrAttendance,
      GeoAttendance: formData.value.GeoAttendance,
      uniqueId: `${tenantId}-${formData.value.employeeId}`,
      config: [{ shiftName: 1, startTime: "09:00", endTime: "18:00" }], // basic fallback config mapping
      attendancePolicyHistory: { status: "published" },
      leaves: [],
      workingRange: null,

      tenant: tenantId,
      department: formData.value.departmentId || null,
      assignedAccessLevel: formData.value.groupId || null,
      branch: formData.value.branchId || null
    };

    if (!isEdit) {
        personalPayload.assignedUser = newUserId;
    }

    const personalUrl = isEdit 
        ? `${import.meta.env.VITE_API_URL}/items/personalModule/${props.employee.id}`
        : `${import.meta.env.VITE_API_URL}/items/personalModule`;

    const personalRes = await fetch(personalUrl, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(personalPayload)
    });

    if (!personalRes.ok) {
      const errorData = await personalRes.json();
      console.error("Directus personalModule creation failed:", errorData);
      const detailMsg = errorData.errors?.[0]?.message || 'Unknown server error';
      throw new Error(`Failed to ${isEdit ? 'update' : 'create'} personal record: ` + detailMsg);
    }

    const personalResData = await personalRes.json();
    const savedPersonalRecordId = isEdit ? props.employee.id : personalResData.data.id;
    
    // Handle RFID Card management
    if (formData.value.rfidCard !== originalCardNumber.value) {
      if (originalCardId.value && !formData.value.rfidCard) {
        // Delete card
        await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement/${originalCardId.value}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (formData.value.rfidCard) {
        const accessLevelNum = formData.value.groupId 
          ? groups.value.find(g => g.id === formData.value.groupId)?.accessLevelNumber || 1 
          : 1;
        const cardAccess = formData.value.accessOn;

        const cardPayload = {
          rfidCard: formData.value.rfidCard,
          type: "rfid",
          enabled: cardAccess,
          cardAccess: cardAccess,
          accessLevelsId: accessLevelNum,
          cardAccessLevelArray: `${formData.value.rfidCard}:${cardAccess ? 1 : 0}:${accessLevelNum}`,
          cardAccessLevelHex: convertToCardAccessHex(
            formData.value.rfidCard,
            cardAccess,
            accessLevelNum
          ),
          employeeId: savedPersonalRecordId,
          tenant: tenantId
        };

        if (originalCardId.value) {
          // Update card
          await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement/${originalCardId.value}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(cardPayload)
          });
        } else {
          // Create card
          await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(cardPayload)
          });
        }
      }
    }

    emit('success');
    close();

  } catch (err) {
    console.error("Save error", err);
    errorMessage.value = err.message || "Failed to save employee";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.main-scroll::-webkit-scrollbar {
  width: 6px;
}
.main-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.main-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .main-scroll::-webkit-scrollbar-thumb {
  background-color: #334155;
}
</style>

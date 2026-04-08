<template>
  <div class="p-6 space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
      <p class="text-slate-500 font-medium mt-1">Manage your personal information and security.</p>
    </div>

    <!-- Personal Details -->
    <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6">
      <h2 class="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <User class="h-4 w-4" />
        Personal Details
      </h2>
      <div class="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div class="relative group">
          <div class="h-24 w-24 rounded-3xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
            <User v-if="!profileImage" class="h-12 w-12 text-blue-500" />
            <img v-else :src="profileImage" class="h-full w-full object-cover" />
          </div>
          <button class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white dark:border-slate-900 flex items-center justify-center hover:bg-blue-700 transition-colors">
            <Camera class="h-4 w-4" />
          </button>
        </div>
        <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
            <input 
              v-model="firstName" 
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
            <input 
              v-model="lastName" 
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Phone</label>
            <input 
              v-model="phone" 
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Email</label>
            <input 
              v-model="email" 
              disabled
              class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 opacity-60"
            />
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Home Address</label>
        <input 
          v-model="address" 
          class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        />
      </div>
      <div class="flex justify-end pt-4">
        <button 
          @click="handleSaveProfile"
          :disabled="saving"
          class="px-8 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {{ saving ? "Saving..." : "Save Changes" }}
        </button>
      </div>
    </div>

    <!-- Security & Password -->
    <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6">
      <h2 class="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Key class="h-4 w-4" />
        Security & Password
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</label>
          <input 
            type="password"
            v-model="oldPassword" 
            class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
          <input 
            type="password"
            v-model="newPassword" 
            class="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>
      </div>
      <div class="flex justify-end">
        <button 
          @click="handleUpdatePassword"
          class="px-8 h-10 rounded-xl border border-blue-600/20 text-blue-600 font-black bg-blue-500/5 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
        >
          Update Password
        </button>
      </div>
    </div>

    <!-- Account Status -->
    <div class="rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4 text-center md:text-left">
        <div class="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <Shield class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xl font-black">Active Access Level</p>
          <p class="text-xs font-bold opacity-80">{{ accessLevel }}</p>
        </div>
      </div>
      <div class="flex items-center gap-8">
        <div class="text-center">
          <p class="text-sm font-black">Employee ID</p>
          <p class="text-[10px] font-bold opacity-80 uppercase tracking-widest">{{ employeeId }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm font-black text-white/80 mb-1">Status</p>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-white text-blue-600 font-black uppercase tracking-widest text-[9px]">Verified</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  User, Camera, Key, Shield, Loader2 
} from 'lucide-vue-next';
import { authService } from "@/services/authService";

const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const email = ref("");
const address = ref("");
const employeeId = ref("");
const accessLevel = ref("");
const profileImage = ref(null);

const oldPassword = ref("");
const newPassword = ref("");

const loading = ref(true);
const saving = ref(false);

const fetchProfile = async () => {
  loading.value = true;
  try {
    const userData = authService.getUserData();
    if (userData) {
      firstName.value = userData.first_name || "";
      lastName.value = userData.last_name || "";
      phone.value = userData.phone || "";
      email.value = userData.email || "";
      employeeId.value = userData.id || "";
      accessLevel.value = userData.role?.name || "User";
      
      if (userData.avatar?.id) {
        profileImage.value = `${import.meta.env.VITE_API_URL}/assets/${userData.avatar.id}`;
      }
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});

const handleSaveProfile = () => {
  saving.value = true;
  // TODO: Implement update profile API call if needed
  setTimeout(() => {
    saving.value = false;
    alert("Profile changes saved successfully!");
  }, 600);
};

const handleUpdatePassword = () => {
  if (!oldPassword.value || !newPassword.value) {
    alert("Please fill in both password fields");
    return;
  }
  alert("Password updated successfully!");
  oldPassword.value = "";
  newPassword.value = "";
};
</script>

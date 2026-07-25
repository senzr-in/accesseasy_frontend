<template>
  <div class="p-6 max-w-3xl mx-auto h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
    <!-- Header -->
    <div class="mb-6 flex items-start gap-4">
      <button 
        @click="router.push('/dashboard')"
        class="mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-sm shrink-0"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your personal and security details.
        </p>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Personal Details -->
      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h2 class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
          <User class="h-3.5 w-3.5" /> Personal Details
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
            <div class="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              {{ firstName || '-' }}
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
            <div class="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              {{ lastName || '-' }}
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
            <div class="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              {{ phone || '-' }}
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div class="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
              {{ email || '-' }}
            </div>
          </div>
          <div class="space-y-1.5 md:col-span-2">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Home Address</label>
            <div class="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[38px]">
              {{ address || '-' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Account Status -->
      <div class="rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Shield class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Access Level</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ accessLevel }}</p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white text-right">{{ employeeId || '-' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Shield, ArrowLeft } from 'lucide-vue-next';
import { authService } from "@/services/authService";

const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const email = ref("");
const address = ref("");
const employeeId = ref("");
const accessLevel = ref("");

const fetchProfile = async () => {
  try {
    const userData = authService.getUserData();
    if (userData) {
      firstName.value = userData.first_name || "";
      lastName.value = userData.last_name || "";
      phone.value = userData.phone || "";
      email.value = userData.email || "";
      employeeId.value = userData.id || "";
      accessLevel.value = userData.role?.name || "User";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

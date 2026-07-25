<template>
  <div class="flex min-h-screen w-full bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex-col lg:flex-row relative overflow-hidden font-sans">
    <!-- Left Side: Marketing Content -->
    <div class="flex-1 flex flex-col justify-center px-6 py-8 lg:px-14 lg:py-6 bg-white dark:bg-slate-900/10 dark:bg-black/20 backdrop-blur-md border-r border-slate-200 dark:border-white/10 relative overflow-hidden border-b lg:border-b-0">
      <!-- Grid Background Pattern -->
      <div 
        class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 24px 24px;"
      />

      <div class="max-w-xl relative z-10 animate-fade-in-left">
        <div class="flex items-center gap-3 mb-6">
          <div class="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/20 shadow-xl shadow-blue-600/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-blue-600"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-black tracking-tight uppercase leading-none text-slate-900 dark:text-white">AccessEasy</span>
            <span class="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase mt-0.5">Scale Globally</span>
          </div>
        </div>

        <h1 class="text-3xl lg:text-4xl font-black tracking-tight leading-[1] mb-4 text-slate-900 dark:text-white">
          Build your secure <br>
          <span class="text-blue-600">Enterprise</span> Network.
        </h1>

        <p class="text-[12px] text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed max-w-sm uppercase tracking-wide">
          Join the elite organizations using AccessEasy for unified infrastructure security.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-8">
          <div
            v-for="(h, i) in highlights"
            :key="i"
            class="flex items-center gap-3 group"
          >
            <div class="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300">
              <component
                :is="h.icon"
                class="h-4 w-4 text-blue-600"
              />
            </div>
            <div>
              <h3 class="font-black text-[10px] tracking-[0.05em] uppercase text-slate-900 dark:text-white">
                {{ h.text }}
              </h3>
              <p class="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-snug mt-0.5 uppercase tracking-widest">
                {{ h.sub }}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-200 dark:border-white/5">
          <p class="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-600 dark:text-slate-300 mb-4 uppercase">
            Industry Standards
          </p>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <div
              v-for="(ind, i) in industries"
              :key="i"
              class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-300 cursor-default group"
            >
              <component
                :is="ind.icon"
                class="h-4 w-4 group-hover:text-blue-600 transition-colors"
              />
              <span class="text-[9px] font-black tracking-widest uppercase">{{ ind.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Registration Form -->
    <div class="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 dark:bg-transparent">
      <!-- Glow effect -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div class="w-full max-w-[480px] rounded-[2rem] bg-white dark:bg-slate-900/90 dark:bg-[#0a0e1a]/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative z-10 animate-fade-in-up">
        <div class="text-center mb-8">
          <div class="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-[1rem] bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/20">
            <UserPlus class="h-5 w-5" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">
            Create Account
          </h2>
          <p class="text-[9px] text-blue-600 font-black tracking-[0.4em] uppercase text-center w-full">
            Join the next-gen security platform
          </p>
        </div>

        <form
          class="space-y-5"
          @submit.prevent="handleRegistration"
        >
          <!-- Personal Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Full Name</label>
              <div class="relative group">
                <input
                  v-model="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  class="w-full h-11 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
                >
                <User class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Phone Number</label>
              <div class="relative group">
                <input
                  v-model="mobileNumber"
                  type="text"
                  inputmode="numeric"
                  required
                  placeholder="10-digit number"
                  maxlength="10"
                  class="w-full h-11 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
                  @input="mobileNumber = $event.target.value.replace(/\D/g, '')"
                >
                <Phone class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>
            
            <div class="space-y-1.5">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Work Email</label>
              <div class="relative group">
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  class="w-full h-11 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
                  @input="email = email.toLowerCase()"
                >
                <Mail class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Employee ID</label>
              <div class="relative group">
                <input
                  v-model="employeeId"
                  type="text"
                  required
                  placeholder="EMP-001"
                  class="w-full h-11 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
                >
                <IdCard class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>

          <!-- Company info -->
          <div class="space-y-1.5">
            <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Company Name</label>
            <div class="relative group">
              <input
                v-model="companyName"
                type="text"
                required
                placeholder="Acme Corporation"
                class="w-full h-11 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
              >
              <Building2 class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
          >
            <span v-if="isLoading">Processing...</span>
            <template v-else>
              Launch my account
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </button>

          <div class="flex items-center justify-between gap-4 py-2 opacity-50">
            <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
            <span class="text-[9px] font-black tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">OR</span>
            <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
          </div>

          <button
            type="button"
            class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-white shadow-sm transition-all group"
            @click="signupWithGoogle"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>

          <p class="text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2">
            Already have an account? 
            <router-link
              to="/login"
              class="text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
            >
              Sign In
            </router-link>
          </p>
        </form>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase flex items-center gap-2">
          <div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Join 500+ Enterprises
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATIONS -->
    <div class="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="pointer-events-auto min-w-[320px] p-4 rounded-2xl bg-white dark:bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-start gap-3 animate-fade-in-up"
        >
          <div
            :class="[
              'mt-0.5 p-1 rounded-lg',
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              toast.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
            ]"
          >
            <CheckCircle
              v-if="toast.type === 'success'"
              class="w-4 h-4"
            />
            <AlertCircle
              v-else-if="toast.type === 'error'"
              class="w-4 h-4"
            />
            <Info
              v-else
              class="w-4 h-4"
            />
          </div>
          <div class="flex-1">
            <p class="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
              {{ toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Notice' : 'Information' }}
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              {{ toast.message }}
            </p>
          </div>
          <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-300"
            @click="removeToast(toast.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { 
  UserPlus, User, Mail, Phone, Building2, MapPin, 
  ArrowRight, CheckCircle, AlertCircle, Info, X,
  IdCard, Zap, ShieldCheck, BarChart3, Cpu,
  Factory, Warehouse, GraduationCap, HeartPulse, Globe
} from "lucide-vue-next";

const router = useRouter();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    ...(import.meta.env.VITE_API_TOKEN ? { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` } : {}),
  },
});

const isLoading = ref(false);
const companyName = ref("");
const fullName = ref("");
const email = ref("");
const mobileNumber = ref("");
const employeeId = ref("");
const emailError = ref("");
const phoneError = ref("");
const year = ref(new Date().getFullYear());

const isEmailValid = ref(false);
const isPhoneValid = ref(false);

const toasts = ref([]);
let emailToastId = null;
let phoneToastId = null;

const highlights = [
  { icon: Zap, text: "Rapid deployment", sub: "Live in under 24 hours." },
  { icon: ShieldCheck, text: "Enterprise grade", sub: "Military-level encryption." },
  { icon: BarChart3, text: "Scalable logs", sub: "Billions of events tracked." },
  { icon: Cpu, text: "Native hardware", sub: "Deep device integration." },
];

const industries = [
  { icon: Building2, name: "Corporate" },
  { icon: Factory, name: "Industrial" },
  { icon: Warehouse, name: "Logistics" },
  { icon: GraduationCap, name: "Education" },
  { icon: HeartPulse, name: "Healthcare" },
  { icon: Globe, name: "Critical Infra" },
];

const addToast = (message, type = "info", duration = 5000) => {
  const id = Date.now() + Math.random();
  const toast = { id, message, type };
  toasts.value.push(toast);
  if (duration > 0) setTimeout(() => removeToast(id), duration);
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) toasts.value.splice(index, 1);
};

const showSuccess = (message, duration = 3000) => addToast(message, "success", duration);
const showError = (message, duration = 5000) => addToast(message, "error", duration);

const isFormValid = computed(() => {
  return (
    companyName.value.trim() !== "" &&
    fullName.value.trim() !== "" &&
    email.value.trim() !== "" &&
    mobileNumber.value.trim() !== "" &&
    employeeId.value.trim() !== "" &&
    isValidEmail(email.value) &&
    /^\d{10}$/.test(mobileNumber.value)
  );
});

function isValidEmail(e) {
  return /.+@.+\..+/.test(e);
}

async function validateRegistration() {
  if (!isFormValid.value) {
    showError("Please fill all required fields correctly");
    return false;
  }
  
  // Quick availability checks
  try {
    const emailRes = await api.get(`/users`, {
      params: { "filter[email][_eq]": email.value.toLowerCase(), "fields[]": "email" },
    });
    if (emailRes.data.data.length > 0) {
      showError("This email is already registered");
      return false;
    }

    const phoneRes = await api.get(`/users`, {
      params: { "filter[phone][_eq]": `+91${mobileNumber.value}`, "fields[]": "phone" },
    });
    if (phoneRes.data.data.length > 0) {
      showError("This phone number is already registered");
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Validation error:", err);
    return true; // Proceed and let the main handler catch API errors
  }
}

function buildTrialPlan(opts = {}) {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 14);

  const toISO = (d) => d.toISOString().split("T")[0];

  return {
    users: 120,
    features: [
      {
        key: "trial",
        name: "trial",
        features: ["all features"],
      },
      {
        key: "lite",
        name: "Lite",
        features: [
          "Selfie & QR check-in",
          "Geofence check-in",
          "Leave management",
          "Expense management",
          "Daily & monthly reports",
        ],
        value: 120,
      },
      {
        key: "fieldpro",
        name: "FieldPro",
        features: [
          "All Lite features",
          "Work order management",
          "Client management",
          "Field job tracking",
          "Work order scheduling",
        ],
        value: 120,
      },
      {
        key: "pro",
        name: "PRO",
        features: [
          "All Lite features",
          "Face check-in with liveness",
          "Regularisation",
          "Scheduled reports",
          "Payroll integration (API)",
        ],
        value: 120,
      },
      {
        key: "crm",
        name: "GrowthSuite CRMENTERPRISE",
        features: [
          "All Lite features",
          "Smart Forms (custom)",
          "CRM Dashboard",
          "Role configurator",
          "WhatsApp reports",
          "Employee KPI Dashboard",
          "CRM integrations (Zoho, ERPNext)",
        ],
        value: 120,
      },
    ],
    billing_cycle: opts.billing_cycle || "trial",
    start_date: toISO(today),
    end_date: toISO(end),
    currency: opts.currency || "INR",
    total_value: opts.total_value ?? 0,
  };
}

async function handleRegistration() {
  isLoading.value = true;
  
  if (!(await validateRegistration())) {
    isLoading.value = false;
    return;
  }

  try {
    const accountSettings = {
      currency: "INR",
      currency_name: "Indian Rupee",
      currency_symbol: "₹",
      country: "India",
      country_code: "IN",
    };

    const tenantPayload = {
      tenantName: companyName.value,
      panOrGst: null,
      companyAddress: null,
      accountSettings: JSON.stringify(accountSettings),
      plan: JSON.stringify(buildTrialPlan()),
    };
    const tenantResponse = await api.post("/items/tenant", tenantPayload);
    const tenantId = tenantResponse.data.data.tenantId;

    const adminRoleId = "ea2303aa-1662-43ca-a7f7-ab84924a7e0a";
    const personalModulePayload = {
      status: "active",
      accessOn: true,
      cycleType: 1,
      uniqueId: `${tenantId}-${employeeId.value}`,
      employeeId: employeeId.value,
      assignedUser: {
        first_name: fullName.value,
        email: email.value.toLowerCase(),
        phone: `+91${mobileNumber.value}`,
        role: adminRoleId,
        tenant: tenantId,
        appAccess: true,
        userApp: "accesseasy",
      },
    };
    await api.post("/items/personalModule", personalModulePayload);

    showSuccess("Registration successful! Initiating login...", 3000);

    const registeredPhoneNumber = `+91${mobileNumber.value}`;
    localStorage.setItem("justRegisteredPhone", registeredPhoneNumber);
    localStorage.setItem("fromRegistration", "true");

    setTimeout(() => {
      router.push({
        path: "/login",
        query: { autoSubmit: "true" }
      });
    }, 2000);
  } catch (e) {
    console.error("Registration error:", e);
    showError(e.response?.data?.message || "Registration failed. Please contact support.");
    isLoading.value = false;
  }
}

async function signupWithGoogle() {
  try {
    sessionStorage.setItem("connector_type", "google");
    isLoading.value = true;
    
    const response = await fetch(`${import.meta.env.VITE_KN_API_URL}/google-accesseasy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "google" }),
    });

    const data = await response.json();
    if (data.success && data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Failed to initialize Google signup");
    }
  } catch (error) {
    console.error("Google signup error:", error);
    showError(error.message || "Failed to connect to Google");
    isLoading.value = false;
  }
}
</script>

<style scoped>
.animate-fade-in-left {
  animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Custom Scrollbar for form */
.flex-1 {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}

.flex-1::-webkit-scrollbar {
  width: 4px;
}

.flex-1::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}

.progress-bar-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
}

/* Toast Styles */
.toast-container {
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toast-list > * {
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Mobile Responsiveness */
@media (max-width: 960px) {
  .toast-container {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full bg-[#030614] text-slate-100 relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
    <!-- Left Side: Marketing & Skyscraper Hero Section -->
    <div class="w-full h-full flex flex-col justify-between px-6 py-8 lg:px-12 lg:py-10 relative z-20 overflow-hidden border-r border-slate-800/60 shadow-[10px_0_35px_rgba(0,0,0,0.35)] min-h-[500px]">
      <!-- Photorealistic Skyscraper Office Background Image with Network Overlay -->
      <div 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105 pointer-events-none z-0"
        :style="{ backgroundImage: `url(${loginHeroBg})` }"
      />
      <!-- Subtle Dark Blue Overlay Gradient for Text Contrast (Low Opacity) -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#04081c]/50 via-[#071133]/30 to-[#030614]/60 pointer-events-none z-0" />

      <!-- Tech Grid Pattern -->
      <div 
        class="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.9) 1px, transparent 0); background-size: 30px 30px;"
      />

      <!-- Floating Tech Mesh Nodes Animation -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div class="node-particle node-1" />
        <div class="node-particle node-2" />
        <div class="node-particle node-3" />
      </div>

      <!-- Top Header / Logo -->
      <div class="relative z-10 animate-fade-in-down">
        <div class="flex items-center gap-3.5 mb-2">
          <!-- Hex Shield Icon -->
          <div class="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-700/20 flex items-center justify-center border border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md group cursor-pointer hover:border-blue-300 transition-all duration-300">
            <Shield class="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-bold tracking-tight text-white drop-shadow-md">AccessEasy</span>
            <span class="text-[11px] font-medium text-slate-300 tracking-wider">Secure. Manage. Empower.</span>
          </div>
        </div>
      </div>

      <!-- Hero Body Content -->
      <div class="max-w-xl relative z-10 my-auto py-6">
        <!-- Animated Pill Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 text-xs font-semibold tracking-wide mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <span class="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
          <span>Scale Globally</span>
        </div>

        <!-- Headline -->
        <h1 class="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-white drop-shadow-xl">
          Build your secure<br>
          Enterprise Network.<br>
          Empowered Workforce.
        </h1>

        <p class="text-xs lg:text-sm text-slate-100 font-normal leading-relaxed mb-6 max-w-lg drop-shadow-md">
          The all-in-one platform for access control, workforce management, and real-time intelligence.
        </p>

        <!-- 4 Feature Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div
            v-for="(feature, idx) in features"
            :key="idx"
            class="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-blue-500/30 backdrop-blur-md hover:bg-slate-900/80 hover:border-blue-400/60 shadow-md hover:shadow-blue-500/25 transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div class="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900/60 to-slate-900/80 border border-blue-400/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-all duration-300">
              <component
                :is="feature.icon"
                class="h-4.5 w-4.5"
              />
            </div>
            <div>
              <h3 class="font-bold text-xs text-white tracking-wide mb-0.5 group-hover:text-blue-300 transition-colors">
                {{ feature.title }}
              </h3>
              <p class="text-[10px] lg:text-[11px] text-slate-200 leading-snug opacity-90">
                {{ feature.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Hardware Authentication Methods Badges Bar -->
      <div class="relative z-10 pt-4 border-t border-slate-700/60">
        <p class="text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-3 drop-shadow flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-cyan-400" />
          <span>Supported Access & Authentication Modalities</span>
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div
            v-for="(auth, i) in authMethods"
            :key="i"
            class="p-2.5 rounded-xl bg-slate-900/70 border border-blue-500/30 backdrop-blur-md shadow-md hover:border-cyan-400/70 hover:bg-slate-900/90 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-default"
          >
            <div class="h-9 w-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:border-cyan-400/80 transition-all duration-300">
              <component
                :is="auth.icon"
                class="w-5 h-5 text-cyan-400"
              />
            </div>
            <span class="text-xs font-bold text-white tracking-wide leading-tight group-hover:text-cyan-300 transition-colors">
              {{ auth.name }}
            </span>
            <span class="text-[9px] text-slate-300 font-medium tracking-tight mt-0.5 opacity-90">
              {{ auth.sub }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Real White Marble Luxury Registration Form Section -->
    <div class="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#e5e9f0] min-h-screen z-10">
      <!-- Background Ambient Glow & Sparks -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-400/15 rounded-full blur-[140px] pointer-events-none" />

      <!-- Main Marble Card Container -->
      <div 
        class="w-full max-w-[480px] rounded-[2.5rem] p-8 lg:p-10 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.25),0_0_35px_rgba(255,255,255,0.8)] border border-white/90 relative z-10 animate-fade-in-up text-slate-900 overflow-hidden bg-cover bg-center"
        :style="{ backgroundImage: `url(${marbleBg})` }"
      >
        <!-- Light Translucent White Wash for Polished Marble Texture Visibility -->
        <div class="absolute inset-0 bg-white/40 pointer-events-none z-0" />

        <div class="relative z-10">
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3">
              <div class="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-60 duration-1000 scale-125" />
              <div class="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <UserPlus class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Create Account
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
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
                <label class="text-[10px] font-black tracking-[0.15em] text-slate-600 ml-1 uppercase">Full Name</label>
                <div class="relative group">
                  <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d93b2] group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input
                    v-model="fullName"
                    type="text"
                    required
                    placeholder="John Doe"
                    class="w-full h-11 pl-11 pr-4 bg-white/85 hover:bg-white/95 focus:bg-white border border-[#d8e2ee] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none rounded-2xl text-[13px] font-semibold text-slate-800 placeholder:text-[#7d93b2] shadow-sm"
                  >
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black tracking-[0.15em] text-slate-600 ml-1 uppercase">Phone Number</label>
                <div class="relative flex items-center bg-white/85 hover:bg-white/95 focus-within:bg-white border border-[#d8e2ee] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-2xl shadow-sm overflow-hidden h-11">
                  <!-- Country Code Selector Dropdown -->
                  <div class="relative shrink-0 flex items-center pl-3 pr-2 border-r border-[#d8e2ee] bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
                    <select
                      v-model="selectedCountryCode"
                      class="appearance-none bg-transparent text-[12px] font-bold text-slate-800 pr-5 outline-none cursor-pointer py-1.5"
                    >
                      <option
                        v-for="c in countryCodes"
                        :key="c.code"
                        :value="c.code"
                        class="text-slate-900 bg-white font-medium py-1"
                      >
                        {{ c.flag }} {{ c.code }} ({{ c.name }})
                      </option>
                    </select>
                    <ChevronDown class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>

                  <!-- Phone Number Input with Phone Icon -->
                  <div class="relative flex-1 flex items-center">
                    <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d93b2] group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                    <input
                      v-model="mobileNumber"
                      type="text"
                      inputmode="numeric"
                      required
                      placeholder="10-digit number"
                      maxlength="12"
                      class="w-full h-full pl-9 pr-4 bg-transparent outline-none text-[13px] font-semibold text-slate-800 placeholder:text-[#7d93b2]"
                      @input="mobileNumber = $event.target.value.replace(/\D/g, '')"
                    >
                  </div>
                </div>
              </div>
            
              <div class="space-y-1.5">
                <label class="text-[10px] font-black tracking-[0.15em] text-slate-600 ml-1 uppercase">Work Email</label>
                <div class="relative group">
                  <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d93b2] group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input
                    v-model="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    class="w-full h-11 pl-11 pr-4 bg-white/85 hover:bg-white/95 focus:bg-white border border-[#d8e2ee] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none rounded-2xl text-[13px] font-semibold text-slate-800 placeholder:text-[#7d93b2] shadow-sm"
                    @input="email = email.toLowerCase()"
                  >
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black tracking-[0.15em] text-slate-600 ml-1 uppercase">Employee ID</label>
                <div class="relative group">
                  <IdCard class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d93b2] group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input
                    v-model="employeeId"
                    type="text"
                    required
                    placeholder="EMP-001"
                    class="w-full h-11 pl-11 pr-4 bg-white/85 hover:bg-white/95 focus:bg-white border border-[#d8e2ee] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none rounded-2xl text-[13px] font-semibold text-slate-800 placeholder:text-[#7d93b2] shadow-sm"
                  >
                </div>
              </div>
            </div>

            <!-- Company info -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black tracking-[0.15em] text-slate-600 ml-1 uppercase">Company Name</label>
              <div class="relative group">
                <Building2 class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d93b2] group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                <input
                  v-model="companyName"
                  type="text"
                  required
                  placeholder="Acme Corporation"
                  class="w-full h-11 pl-11 pr-4 bg-white/85 hover:bg-white/95 focus:bg-white border border-[#d8e2ee] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none rounded-2xl text-[13px] font-semibold text-slate-800 placeholder:text-[#7d93b2] shadow-sm"
                >
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full h-12 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-[0_6px_25px_rgba(59,130,246,0.4)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group mt-3"
            >
              <span v-if="isLoading">Processing...</span>
              <template v-else>
                LAUNCH MY ACCOUNT
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>

            <div class="flex items-center justify-between gap-4 py-1.5 opacity-60">
              <div class="h-[1px] flex-1 bg-slate-300" />
              <span class="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">OR</span>
              <div class="h-[1px] flex-1 bg-slate-300" />
            </div>

            <button
              type="button"
              class="w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-[0.12em] flex items-center justify-center gap-3 bg-white/90 hover:bg-white border border-[#d8e2ee] hover:border-slate-300 text-slate-800 shadow-sm transition-all active:scale-[0.99] group"
              @click="signupWithGoogle"
            >
              <svg
                class="w-4 h-4 shrink-0"
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
              SIGN UP WITH GOOGLE
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

          <div class="mt-6 text-center text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase flex items-center justify-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Join 500+ Enterprises
          </div>
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
import { authService } from "@/services/authService";
import { 
  UserPlus, User, Mail, Phone, Building2, MapPin, 
  ArrowRight, CheckCircle, AlertCircle, Info, X, ChevronDown,
  IdCard, Zap, Shield, ShieldCheck, BarChart3, Layers, Globe,
  ScanFace, Fingerprint, Radio, Nfc, Bluetooth
} from "lucide-vue-next";

// Directly import image assets for Vite bundling
import loginHeroBg from "@/assets/images/login_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";

const router = useRouter();

const isLoading = ref(false);
const companyName = ref("");
const fullName = ref("");
const email = ref("");
const mobileNumber = ref("");
const employeeId = ref("");
const emailError = ref("");
const phoneError = ref("");
const year = ref(new Date().getFullYear());

const countryCodes = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA/Canada" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+81", flag: "🇯🇵", name: "Japan" }
];
const selectedCountryCode = ref("+91");

const isEmailValid = ref(false);
const isPhoneValid = ref(false);

const toasts = ref([]);
let emailToastId = null;
let phoneToastId = null;

const features = [
  { icon: Zap, title: "Real-time Access Control", desc: "Monitor and manage access in real-time across all your locations." },
  { icon: BarChart3, title: "Workforce Intelligence", desc: "Gain actionable insights into your workforce and operations." },
  { icon: ShieldCheck, title: "Secure & Reliable", desc: "Enterprise-grade security with 99.9% uptime you can trust." },
  { icon: Layers, title: "Scalable & Flexible", desc: "Built to scale with your organization and adapt to your needs." }
];

const authMethods = [
  { name: "Face AI", sub: "3D Recognition", icon: ScanFace },
  { name: "Fingerprint", sub: "Biometric Sensor", icon: Fingerprint },
  { name: "RFID Card", sub: "13.56MHz Smart", icon: Radio },
  { name: "NFC Mobile", sub: "Instant Tap & Go", icon: Nfc },
  { name: "Bluetooth", sub: "BLE Touchless", icon: Bluetooth }
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
  
  // Quick availability checks using unauthenticated Knative auth-service
  try {
    const emailExists = await authService.checkEmailExists(email.value.toLowerCase());
    if (emailExists) {
      showError("This email is already registered");
      return false;
    }

    const fullPhoneNumber = `${selectedCountryCode.value}${mobileNumber.value}`;
    const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
    if (phoneExists) {
      showError("This phone number is already registered");
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Validation error:", err);
    return true; // Proceed and let the backend catch API errors
  }
}

async function handleRegistration() {
  isLoading.value = true;
  
  if (!(await validateRegistration())) {
    isLoading.value = false;
    return;
  }

  const fullPhoneNumber = `${selectedCountryCode.value}${mobileNumber.value}`;

  try {
    const regResult = await authService.register({
      tenantName: companyName.value,
      fullName: fullName.value,
      email: email.value.toLowerCase(),
      phone: fullPhoneNumber,
      employeeId: employeeId.value,
      userApp: "accesseasy"
    });

    if (regResult && regResult.success === false) {
      showError(regResult.message || "Registration failed. Please check your details.");
      isLoading.value = false;
      return;
    }

    // Trigger default initial settings and welcome/admin notification emails
    const tenantId = regResult?.tenant_id || regResult?.tenantId || regResult?.tenant || "";
    authService.setupInitialSettings({
      tenantId: tenantId,
      companyName: companyName.value,
      name: fullName.value,
      email: email.value.toLowerCase(),
      phone: fullPhoneNumber,
      userApp: "accesseasy",
      setupDefaults: true,
    }).catch((err) => {
      console.warn("[Register] Default initial settings notification error:", err);
    });

    showSuccess("Registration successful! Setting up initial configuration...", 3000);

    localStorage.setItem("justRegisteredPhone", fullPhoneNumber);
    localStorage.setItem("fromRegistration", "true");

    setTimeout(() => {
      router.push({
        path: "/login",
        query: { autoSubmit: "true" }
      });
    }, 2000);
  } catch (e) {
    console.error("Registration error:", e);
    showError(e.response?.data?.message || e.message || "Registration failed. Please contact support.");
    isLoading.value = false;
  }
}

async function signupWithGoogle() {
  try {
    sessionStorage.setItem("connector_type", "google");
    sessionStorage.setItem("tenant_id", "new");
    isLoading.value = true;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "456615098701-cihaj0btvoe011ba92r7hpbemkse5vm3.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/auth/callback`;
    const knBase = import.meta.env.VITE_KN_API_URL || "https://appv1.fieldseasy.com/kn";

    try {
      const response = await fetch(`${knBase}/google-accesseasy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "google",
          redirect_uri: redirectUri,
          redirectUri: redirectUri,
          client_id: clientId,
          clientId: clientId,
          action: "signup",
          userApp: "accesseasy",
        }),
      });

      const data = await response.json();
      if (data.success && data.url) {
        let targetUrl = data.url;
        try {
          const parsedUrl = new URL(targetUrl);
          parsedUrl.searchParams.set("redirect_uri", redirectUri);
          targetUrl = parsedUrl.toString();
        } catch (e) {
          console.warn("Could not set redirect_uri on data.url:", e);
        }
        window.location.href = targetUrl;
        return;
      }
    } catch (apiErr) {
      console.warn("Backend google-accesseasy endpoint error, falling back to direct OAuth URL:", apiErr);
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

    window.location.href = googleAuthUrl;
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

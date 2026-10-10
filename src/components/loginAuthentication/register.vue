<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full bg-[#1C1E1E] text-slate-100 relative overflow-x-hidden font-sans selection:bg-[#1E4FD8] selection:text-white">
    <!-- Left Side: Marketing Hero Section -->
    <div class="w-full h-full flex flex-col justify-between px-6 py-8 lg:px-12 lg:py-10 relative z-20 overflow-hidden border-r border-[#E4E1D8]/15 shadow-[10px_0_35px_rgba(0,0,0,0.2)] min-h-[500px]">
      <!-- Background Image with Overlay -->
      <div 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105 pointer-events-none z-0 opacity-20"
        :style="{ backgroundImage: `url(${loginHeroBg})` }"
      />
      <!-- Rich Charcoal Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#1C1E1E]/95 via-[#151717]/90 to-[#1C1E1E]/95 pointer-events-none z-0" />

      <!-- Tech Grid Pattern -->
      <div 
        class="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.8) 1px, transparent 0); background-size: 28px 28px;"
      />

      <!-- Top Header / Logo -->
      <div class="relative z-10 animate-fade-in-down">
        <div class="flex items-center gap-3.5 mb-2">
          <!-- Hex Shield Icon -->
          <div class="h-11 w-11 rounded-xl bg-[#1E4FD8]/20 flex items-center justify-center border border-[#1E4FD8]/40 shadow-[0_0_20px_rgba(30,79,216,0.25)] backdrop-blur-md group cursor-pointer hover:border-[#1E4FD8] transition-all duration-300">
            <Shield class="w-6 h-6 text-[#1E4FD8] group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-bold tracking-tight text-white">AccessEasy</span>
            <span class="text-[11px] font-medium text-[#EFECE2]/70 tracking-wider">Secure. Manage. Empower.</span>
          </div>
        </div>
      </div>

      <!-- Hero Body Content -->
      <div class="max-w-xl relative z-10 my-auto py-6">
        <!-- Pill Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E4FD8]/15 border border-[#1E4FD8]/30 text-[#EEF2FE] text-xs font-semibold tracking-wide mb-6 backdrop-blur-md">
          <span class="h-2 w-2 rounded-full bg-[#1E4FD8] animate-ping" />
          <span>Scale Globally</span>
        </div>

        <!-- Headline -->
        <h1 class="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-white">
          Build your secure<br>
          Enterprise Network.<br>
          Empowered Workforce.
        </h1>

        <p class="text-xs lg:text-sm text-[#EFECE2]/80 font-normal leading-relaxed mb-6 max-w-lg">
          The all-in-one platform for access control, workforce management, and real-time intelligence.
        </p>

        <!-- 4 Feature Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div
            v-for="(feature, idx) in features"
            :key="idx"
            class="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] hover:border-[#1E4FD8]/50 shadow-sm transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div class="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-[#1E4FD8]/15 border border-[#1E4FD8]/30 text-[#EEF2FE] group-hover:scale-105 transition-all duration-300">
              <component
                :is="feature.icon"
                class="h-4.5 w-4.5 text-[#1E4FD8]"
              />
            </div>
            <div>
              <h3 class="font-bold text-xs text-white tracking-wide mb-0.5 group-hover:text-[#EEF2FE] transition-colors">
                {{ feature.title }}
              </h3>
              <p class="text-[10px] lg:text-[11px] text-[#EFECE2]/70 leading-snug">
                {{ feature.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Hardware Authentication Methods Badges Bar -->
      <div class="relative z-10 pt-4 border-t border-white/10">
        <p class="text-[11px] font-bold tracking-wider text-[#EFECE2]/70 uppercase mb-3 flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-[#1E4FD8]" />
          <span>Supported Access & Authentication Modalities</span>
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div
            v-for="(auth, i) in authMethods"
            :key="i"
            class="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-[#1E4FD8]/60 hover:bg-white/[0.08] transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-default"
          >
            <div class="h-9 w-9 rounded-lg bg-[#1E4FD8]/15 border border-[#1E4FD8]/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-all duration-300">
              <component
                :is="auth.icon"
                class="w-4.5 h-4.5 text-[#EEF2FE]"
              />
            </div>
            <span class="text-xs font-bold text-white tracking-wide leading-tight group-hover:text-[#EEF2FE] transition-colors">
              {{ auth.name }}
            </span>
            <span class="text-[9px] text-[#EFECE2]/60 font-medium tracking-tight mt-0.5">
              {{ auth.sub }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Clean Modern Registration Form Section -->
    <div class="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#FAFAF8] min-h-screen z-10">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1E4FD8]/5 rounded-full blur-[120px] pointer-events-none" />

      <!-- Main Card Container -->
      <div class="w-full max-w-[480px] rounded-3xl p-8 lg:p-10 shadow-[0_20px_50px_-12px_rgba(28,30,30,0.08),0_1px_3px_rgba(28,30,30,0.05)] border border-[#E4E1D8] bg-white relative z-10 animate-fade-in-up text-[#1C1E1E]">
        <div class="relative z-10">
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3">
              <div class="h-14 w-14 rounded-2xl bg-[#EEF2FE] border border-[#1E4FD8]/20 flex items-center justify-center shadow-sm">
                <UserPlus class="w-7 h-7 text-[#1E4FD8]" />
              </div>
            </div>
            <h2 class="text-2xl font-bold text-[#1C1E1E] tracking-tight mb-1">
              Create Account
            </h2>
            <p class="text-xs text-[#5B615F] font-medium">
              Join the next-gen security platform
            </p>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="handleRegistration"
          >
            <!-- Personal Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold tracking-wider text-[#5B615F] uppercase">Full Name</label>
                <div class="relative flex items-center">
                  <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B908D] focus-within:text-[#1E4FD8] transition-colors pointer-events-none" />
                  <input
                    v-model="fullName"
                    type="text"
                    required
                    placeholder="John Doe"
                    class="w-full h-11 pl-10 pr-3.5 bg-[#FAFAF8] hover:bg-white focus:bg-white border border-[#E4E1D8] focus:border-[#1E4FD8] focus:ring-4 focus:ring-[#1E4FD8]/10 transition-all outline-none rounded-xl text-xs font-semibold text-[#1C1E1E] placeholder:text-[#8B908D] shadow-2xs"
                  >
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[11px] font-bold tracking-wider text-[#5B615F] uppercase">Phone Number</label>
                <div class="relative flex items-center bg-[#FAFAF8] hover:bg-white focus-within:bg-white border border-[#E4E1D8] focus-within:border-[#1E4FD8] focus-within:ring-4 focus-within:ring-[#1E4FD8]/10 transition-all rounded-xl shadow-2xs overflow-hidden h-11">
                  <!-- Country Code Selector Dropdown -->
                  <div class="relative shrink-0 flex items-center justify-between px-2.5 border-r border-[#E4E1D8] bg-[#FAFAF8] hover:bg-[#F1EEE6] transition-colors w-[78px] h-full cursor-pointer">
                    <span class="text-xs font-bold text-[#1C1E1E] select-none tracking-tight whitespace-nowrap">
                      {{ selectedCountryDisplay }}
                    </span>
                    <ChevronDown class="w-3 h-3 text-[#8B908D] shrink-0 pointer-events-none" />

                    <select
                      v-model="selectedCountryCode"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-slate-900"
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
                  </div>

                  <!-- Phone Number Input -->
                  <input
                    v-model="mobileNumber"
                    type="tel"
                    inputmode="numeric"
                    required
                    placeholder="Mobile number"
                    maxlength="10"
                    class="flex-1 min-w-0 h-full px-3 bg-transparent outline-none text-xs font-semibold text-[#1C1E1E] placeholder:text-[#8B908D]"
                    @input="mobileNumber = $event.target.value.replace(/\D/g, '')"
                  >
                </div>
              </div>
            
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold tracking-wider text-[#5B615F] uppercase">Work Email</label>
                <div class="relative flex items-center">
                  <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B908D] focus-within:text-[#1E4FD8] transition-colors pointer-events-none" />
                  <input
                    v-model="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    class="w-full h-11 pl-10 pr-3.5 bg-[#FAFAF8] hover:bg-white focus:bg-white border border-[#E4E1D8] focus:border-[#1E4FD8] focus:ring-4 focus:ring-[#1E4FD8]/10 transition-all outline-none rounded-xl text-xs font-semibold text-[#1C1E1E] placeholder:text-[#8B908D] shadow-2xs"
                    @input="email = email.toLowerCase()"
                  >
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[11px] font-bold tracking-wider text-[#5B615F] uppercase">Employee ID</label>
                <div class="relative flex items-center">
                  <IdCard class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B908D] focus-within:text-[#1E4FD8] transition-colors pointer-events-none" />
                  <input
                    v-model="employeeId"
                    type="text"
                    required
                    placeholder="EMP-001"
                    class="w-full h-11 pl-10 pr-3.5 bg-[#FAFAF8] hover:bg-white focus:bg-white border border-[#E4E1D8] focus:border-[#1E4FD8] focus:ring-4 focus:ring-[#1E4FD8]/10 transition-all outline-none rounded-xl text-xs font-semibold text-[#1C1E1E] placeholder:text-[#8B908D] shadow-2xs"
                  >
                </div>
              </div>
            </div>

            <!-- Company info -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold tracking-wider text-[#5B615F] uppercase">Company Name</label>
              <div class="relative flex items-center">
                <Building2 class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B908D] focus-within:text-[#1E4FD8] transition-colors pointer-events-none" />
                <input
                  v-model="companyName"
                  type="text"
                  required
                  placeholder="Acme Corporation"
                  class="w-full h-11 pl-10 pr-3.5 bg-[#FAFAF8] hover:bg-white focus:bg-white border border-[#E4E1D8] focus:border-[#1E4FD8] focus:ring-4 focus:ring-[#1E4FD8]/10 transition-all outline-none rounded-xl text-xs font-semibold text-[#1C1E1E] placeholder:text-[#8B908D] shadow-2xs"
                >
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#1E4FD8] hover:bg-[#153AA0] text-white shadow-[0_4px_14px_rgba(30,79,216,0.25)] hover:shadow-[0_6px_20px_rgba(30,79,216,0.35)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer mt-2"
            >
              <span v-if="isLoading">Processing...</span>
              <template v-else>
                <span>Launch My Account</span>
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>

            <div class="flex items-center justify-between gap-3 py-1">
              <div class="h-[1px] flex-1 bg-[#E4E1D8]" />
              <span class="text-[10px] font-bold text-[#8B908D] uppercase tracking-widest">OR</span>
              <div class="h-[1px] flex-1 bg-[#E4E1D8]" />
            </div>

            <button
              type="button"
              class="w-full h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-3 bg-white hover:bg-[#FAFAF8] border border-[#E4E1D8] text-[#1C1E1E] shadow-2xs hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer"
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
              <span>Sign Up with Google</span>
            </button>

            <p class="text-center text-xs font-medium text-[#5B615F] pt-2">
              Already have an account? 
              <router-link
                to="/login"
                class="text-[#1E4FD8] hover:text-[#153AA0] font-bold underline underline-offset-4 cursor-pointer"
              >
                Sign In
              </router-link>
            </p>
          </form>

          <div class="mt-6 text-center text-[10px] font-medium tracking-wider text-[#8B908D] uppercase flex items-center justify-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-[#2F8F5B]" />
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
          class="pointer-events-auto min-w-[320px] p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xl flex items-start gap-3 animate-fade-in-up text-[#1C1E1E]"
        >
          <div
            :class="[
              'mt-0.5 p-1.5 rounded-xl',
              toast.type === 'success' ? 'bg-[#E9F5EE] text-[#2F8F5B]' : 
              toast.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-[#EEF2FE] text-[#1E4FD8]'
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
            <p class="text-xs font-bold text-[#1C1E1E] leading-tight">
              {{ toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Notice' : 'Information' }}
            </p>
            <p class="text-[11px] font-medium text-[#5B615F] mt-0.5">
              {{ toast.message }}
            </p>
          </div>
          <button
            class="text-[#8B908D] hover:text-[#1C1E1E] cursor-pointer"
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
const selectedCountryDisplay = computed(() => {
  const match = countryCodes.find((c) => c.code === selectedCountryCode.value);
  return match ? `${match.flag} ${match.code}` : selectedCountryCode.value;
});

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

<template>
  <div class="flex min-h-screen w-full bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex-col lg:flex-row relative overflow-hidden font-sans">
    
    <!-- Left Side: Marketing Content -->
    <div class="flex-1 flex flex-col justify-center px-6 py-8 lg:px-14 lg:py-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border-r border-slate-200 dark:border-white/10 relative overflow-hidden border-b lg:border-b-0">
      <!-- Grid Background Pattern -->
      <div 
        class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 24px 24px;"
      ></div>

      <div class="max-w-xl relative z-10 animate-fade-in-left">
        <div class="flex items-center gap-3 mb-6">
          <div class="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/20 shadow-xl shadow-blue-600/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-blue-600">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-black tracking-tight uppercase leading-none text-slate-900 dark:text-white">AccessEasy</span>
            <span class="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase mt-0.5">Enterprise Hub</span>
          </div>
        </div>

        <h1 class="text-3xl lg:text-4xl font-black tracking-tight leading-[1] mb-4 text-slate-900 dark:text-white">
          Manage multiple <br />
          <span class="text-blue-600">Security</span> Profiles.
        </h1>

        <p class="text-[12px] text-slate-500 font-bold mb-8 leading-relaxed max-w-sm uppercase tracking-wide">
          Switch between organizations or verification methods seamlessly with our unified identity bridge.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-8">
          <div class="flex items-center gap-3 group" v-for="(h, i) in highlights" :key="i">
            <div class="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300">
              <component :is="h.icon" class="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 class="font-black text-[10px] tracking-[0.05em] uppercase text-slate-900 dark:text-white">{{ h.text }}</h3>
              <p class="text-[9px] font-bold text-slate-500 leading-snug mt-0.5 uppercase tracking-widest">{{ h.sub }}</p>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-200 dark:border-white/5">
          <p class="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-4 uppercase">Connected Modules</p>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <div class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-300 cursor-default group" v-for="(ind, i) in industries" :key="i">
              <component :is="ind.icon" class="h-4 w-4 group-hover:text-blue-600 transition-colors" />
              <span class="text-[9px] font-black tracking-widest uppercase">{{ ind.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Switch Account Form -->
    <div class="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-slate-50/50 dark:bg-transparent">
      <!-- Glow effect -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-[420px] rounded-[2rem] bg-white/90 dark:bg-[#0a0e1a]/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative z-10 animate-fade-in-up">
        
        <div class="text-center mb-8">
          <div class="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-[1rem] bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500/20">
            <Users class="h-5 w-5" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">Switch Account</h2>
          <p class="text-[9px] text-emerald-600 font-black tracking-[0.4em] uppercase">Connect via phone or email</p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-8">
          <button 
            @click="setMode('phone')"
            :class="[
              'flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300',
              mode === 'phone' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            Phone
          </button>
          <button 
            @click="setMode('email')"
            :class="[
              'flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300',
              mode === 'email' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            E-Mail
          </button>
        </div>

        <!-- Form Elements -->
        <div class="space-y-6">
          
          <div
            v-if="showTimeoutMessage"
            class="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-shake relative"
          >
            <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">Session timed out</p>
              <p class="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1">Please sign in again to continue.</p>
            </div>
            <button @click="dismissTimeoutMessage" class="text-rose-500/50 hover:text-rose-500 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="mode === 'phone'" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Mobile Number</label>
              <div class="flex gap-2">
                <div class="h-12 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl border border-transparent dark:border-white/5 text-[12px] font-black text-slate-900 dark:text-white">
                  +91
                </div>
                <div class="relative group flex-1">
                  <input
                    v-model.trim="phoneRaw"
                    type="tel"
                    maxlength="10"
                    placeholder="Enter phone"
                    @input="sanitizePhone"
                    @keyup.enter="handleSubmit"
                    class="w-full h-12 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
                  />
                  <Phone class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
              </div>
            </div>
            <p v-if="phoneError" class="text-[10px] font-bold text-rose-500 uppercase tracking-wide ml-1 animate-shake">{{ phoneError }}</p>
          </div>

          <div v-if="mode === 'email'" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Work Email</label>
              <div class="relative group">
                <input
                  v-model.trim="email"
                  type="email"
                  placeholder="name@company.com"
                  @keyup.enter="handleSubmit"
                  class="w-full h-12 px-4 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-600/10 transition-all outline-none rounded-xl text-[12px] font-bold text-slate-900 dark:text-white"
                />
                <Mail class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              </div>
            </div>
            <p v-if="emailError" class="text-[10px] font-bold text-rose-500 uppercase tracking-wide ml-1 animate-shake">{{ emailError }}</p>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 flex gap-3">
            <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p class="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
              We'll initiate a secure session and take you to OTP verification.
            </p>
          </div>

          <button
            @click="handleSubmit"
            :disabled="loading || emailLoading"
            class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span v-if="loading || emailLoading">Initialising...</span>
            <template v-else>
              Sign In to Profile
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </button>

          <p class="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Don't have an account? 
            <router-link to="/register" class="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 cursor-pointer">Signup Now</router-link>
          </p>
        </div>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase flex items-center gap-2 text-nowrap">
          <div class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Direct Access Gateway
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import { 
  Users, Phone, Mail, ArrowRight, ShieldCheck,
  Zap, BarChart3, Cpu, Building2, Factory,
  Warehouse, GraduationCap, HeartPulse, Globe,
  AlertCircle, X
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const mode = ref("phone");
const phoneRaw = ref("");
const phoneError = ref("");
const loading = ref(false);
const email = ref("");
const emailError = ref("");
const emailLoading = ref(false);
const showTimeoutMessage = ref(false);
const year = ref(new Date().getFullYear());

const highlights = [
  { icon: Zap, text: "Instant switch", sub: "Switch profiles sub-second." },
  { icon: ShieldCheck, text: "Hardware locked", sub: "Session tied to device." },
  { icon: BarChart3, text: "Cross-org audit", sub: "Unified security logs." },
  { icon: Cpu, text: "JWT powered", sub: "Standardized auth tokens." },
];

const industries = [
  { icon: Building2, name: "Corporate" },
  { icon: Factory, name: "Industrial" },
  { icon: Warehouse, name: "Logistics" },
  { icon: GraduationCap, name: "Education" },
  { icon: HeartPulse, name: "Healthcare" },
  { icon: Globe, name: "Critical Infra" },
];

function setMode(next) {
  mode.value = next;
  phoneError.value = "";
  emailError.value = "";
}

function sanitizePhone() {
  phoneRaw.value = (phoneRaw.value || "").replace(/\D/g, "").slice(0, 10);
  if (phoneError.value) phoneError.value = "";
}

function validPhone(num) {
  return /^\d{10}$/.test(num);
}

function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function clearPreviousSession() {
  localStorage.removeItem("pinVerifiedInSession");
  localStorage.removeItem("fromOtp");
  localStorage.removeItem("sessionUuid");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("fullPhoneNumber");
  localStorage.removeItem("email");
  localStorage.removeItem("emailSessionUuid");
  localStorage.removeItem("userData");
  localStorage.removeItem("tenantData");
}

function dismissTimeoutMessage() {
  showTimeoutMessage.value = false;
}

async function handleSubmit() {
  if (mode.value === "phone") {
    phoneError.value = "";
    const digits = (phoneRaw.value || "").replace(/\D/g, "");
    if (!validPhone(digits)) {
      phoneError.value = "Please enter a valid 10-digit mobile number.";
      return;
    }

    loading.value = true;

    try {
      clearPreviousSession();

      const fullPhoneNumber = "+91" + digits;

      const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
      if (!phoneExists) {
        phoneError.value = "This phone number is not registered. Please sign up first.";
        return;
      }

      const isResigned = await authService.checkUserResigned(fullPhoneNumber);
      if (isResigned) {
        phoneError.value = "Resigned Employee has No access. Please contact your Company Admin.";
        return;
      }

      const user = await authService.getUserByPhone(fullPhoneNumber);
      const hasPin = user && user.userPin;
      const token = authService.getToken();
      const isTokenValid = token && authService.isAuthenticated();

      localStorage.setItem("userPhone", digits);
      localStorage.setItem("fullPhoneNumber", fullPhoneNumber);
      localStorage.setItem("fromAlternateLogin", "true");

      if (!hasPin || (hasPin && !isTokenValid)) {
        await proceedToOtpVerification(fullPhoneNumber);
      } else if (hasPin && isTokenValid) {
        router.push({
          name: "PinVerification",
          params: { contactType: "phone", contactValue: digits },
        });
      }
    } catch (error) {
      console.error("Error during phone login:", error);
      phoneError.value = error.response?.data?.message || error.message || "An error occurred. Please try again.";
    } finally {
      loading.value = false;
    }
  } else {
    emailError.value = "";
    if (!validEmail(email.value)) {
      emailError.value = "Enter a valid email address.";
      return;
    }

    emailLoading.value = true;

    try {
      clearPreviousSession();

      const emailExists = await authService.checkEmailExists(email.value);
      if (!emailExists) {
        emailError.value = "This email is not registered. Please sign up first.";
        return;
      }

      const isResigned = await authService.checkUserResignedByEmail(email.value);
      if (isResigned) {
        emailError.value = "Resigned Employee has No access. Please contact your Company Admin.";
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/emailLogin/generate-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value, userApp: "fieldeasy" }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.otp_session_uuid) {
        throw new Error(data?.message || "Could not start email session. Try again.");
      }

      localStorage.setItem("email", email.value);
      localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
      localStorage.setItem("fromAlternateLogin", "true");

      router.push({
        name: "EmailVerification",
        params: { email: email.value },
      });
    } catch (error) {
      console.error("Error during email login:", error);
      emailError.value = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    } finally {
      emailLoading.value = false;
    }
  }
}

async function proceedToOtpVerification(fullPhoneNumber) {
  try {
    let response = await authService.generateOtp(fullPhoneNumber);

    if (typeof response === "string") {
      try {
        response = JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }
    }

    if (response && response.otp_session_uuid) {
      localStorage.setItem("sessionUuid", response.otp_session_uuid);
      localStorage.setItem("fromOtp", "true");

      router.push({
        name: "Verification",
        params: { phoneNumber: fullPhoneNumber.replace("+91", "") },
      });
    } else {
      phoneError.value = response?.message || response?.msg91Response?.message || "Failed to generate OTP.";
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    phoneError.value = error.response?.data?.message || error.message || "Failed to generate OTP.";
  }
}

onMounted(() => {
  clearPreviousSession();
  if (route.query.timeout) {
    showTimeoutMessage.value = true;
  }
});
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

:deep(.v-alert) {
  border: none !important;
  background: rgba(244, 63, 94, 0.1) !important;
  color: #f43f5e !important;
}

:deep(.v-alert__prepend .v-icon) {
  color: #f43f5e !important;
}

:deep(.v-alert__close .v-btn) {
  color: #f43f5e !important;
}
</style>

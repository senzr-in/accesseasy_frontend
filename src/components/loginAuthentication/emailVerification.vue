<template>
  <div class="flex min-h-screen w-full bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex-col lg:flex-row relative overflow-hidden font-sans">
    
    <!-- Left Side: Marketing Content (Same as Login) -->
    <div class="flex-1 flex flex-col justify-center px-6 py-8 lg:px-14 lg:py-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border-r border-slate-200 dark:border-white/10 relative overflow-hidden">
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
            <span class="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase mt-0.5">Universal OS</span>
          </div>
        </div>

        <h1 class="text-3xl lg:text-4xl font-black tracking-tight leading-[1] mb-4 text-slate-900 dark:text-white">
          Secure your infrastructure. <br />
          <span class="text-blue-600">Empower</span> your workforce.
        </h1>

        <p class="text-[12px] text-slate-500 font-bold mb-8 leading-relaxed max-w-sm uppercase tracking-wide">
          The ultimate platform for real-time access control and workforce intelligence.
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
          <p class="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-4 uppercase">Trusted Enterprise Networks</p>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <div class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-300 cursor-default group" v-for="(ind, i) in industries" :key="i">
              <component :is="ind.icon" class="h-4 w-4 group-hover:text-blue-600 transition-colors" />
              <span class="text-[9px] font-black tracking-widest uppercase">{{ ind.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Email OTP Verification Form -->
    <div class="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-slate-50/50 dark:bg-transparent">
      <!-- Glow effect -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-[420px] rounded-[2rem] bg-white/90 dark:bg-[#0a0e1a]/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative z-10 animate-fade-in-up">
        
        <div class="text-center mb-6">
          <div class="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-[1rem] bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/20">
            <Mail class="h-5 w-5" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">Verify Email</h2>
          <p class="text-[9px] text-blue-600 font-black tracking-[0.4em] uppercase">Verification code sent to {{ displayEmail }}</p>
        </div>

        <!-- Alerts -->
        <div v-if="error" class="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3 animate-shake">
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p class="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed font-semibold uppercase tracking-wider">
            {{ error }}
          </p>
        </div>

        <div v-if="success" class="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
          <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p class="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-semibold uppercase tracking-wider">
            {{ success }}
          </p>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Verification Code</label>
            <div class="flex justify-between gap-2">
              <input
                v-for="(digit, index) in 6"
                :key="index"
                v-model="otpDigits[index]"
                maxlength="1"
                type="text"
                @input="handleInput(index)"
                @keydown="handleKeydown($event, index)"
                ref="otpFields"
                class="w-12 h-14 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-xl font-black text-slate-900 dark:text-white shadow-sm"
              />
            </div>
            
            <div class="flex items-center justify-between px-1 mt-2">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Didn't receive code?
              </p>
              <button 
                v-if="timer <= 0" 
                @click="resendOtp" 
                :disabled="resendLoading"
                class="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-[0.1em] transition-colors disabled:opacity-50"
              >
                {{ resendLoading ? 'Sending...' : 'Resend Now' }}
              </button>
              <span v-else class="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                Retry in {{ timer }}s
              </span>
            </div>
          </div>

          <button
            @click="verifyCode"
            :disabled="loading || !isValidOtp"
            class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span v-if="loading">Verifying...</span>
            <template v-else>
              Verify & Continue
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </button>

          <div class="flex items-center justify-between gap-4 py-2 opacity-50">
            <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
            <span class="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase">OR</span>
            <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
          </div>

          <p class="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer">Back to Login</router-link>
          </p>
        </div>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase flex items-center gap-2">
          <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Secure Session Active
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import { 
  Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle,
  Zap, BarChart3, Cpu, Building2, Factory, Warehouse, 
  GraduationCap, HeartPulse, Globe
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const otpDigits = ref(Array(6).fill(""));
const loading = ref(false);
const resendLoading = ref(false);
const error = ref("");
const success = ref("");
const focusedIndex = ref(-1);
const userEmail = ref("");
const otpFields = ref([]);
const year = ref(new Date().getFullYear());
const timer = ref(30);
let timerInterval = null;

const highlights = [
  { icon: Zap, text: "Real-time attendance", sub: "Live presence tracking." },
  { icon: ShieldCheck, text: "Advanced access", sub: "Secure doors & roles." },
  { icon: BarChart3, text: "Operational insights", sub: "Instant system health." },
  { icon: Cpu, text: "Smart integration", sub: "Hardware & networks." },
];

const industries = [
  { icon: Building2, name: "Offices" },
  { icon: Factory, name: "Manufacturing" },
  { icon: Warehouse, name: "Logistics" },
  { icon: GraduationCap, name: "Education" },
  { icon: HeartPulse, name: "Healthcare" },
  { icon: Globe, name: "Enterprises" },
];

const isValidOtp = computed(() =>
  otpDigits.value.every((digit) => digit !== ""),
);

const displayEmail = computed(() => {
  return userEmail.value || localStorage.getItem("email") || "your email";
});

function startTimer() {
  timer.value = 30;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function clearSuccess() {
  success.value = "";
}

async function resendOtp() {
  resendLoading.value = true;
  error.value = "";
  success.value = "";
  try {
    await onEmailSubmit(userEmail.value);
    success.value = "OTP sent successfully!";
    setTimeout(() => clearSuccess(), 3000);
    startTimer();
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      if (otpFields.value[0]) {
        otpFields.value[0].focus();
      }
    });
  } catch (err) {
    error.value = err?.message || "Failed to resend OTP. Please try again.";
  } finally {
    resendLoading.value = false;
  }
}

async function onEmailSubmit(email) {
  error.value = "";
  success.value = "";
  if (!validEmail(email)) {
    error.value = "Enter a valid email address.";
    return;
  }
  try {
    const emailExists = await authService.checkEmailExists(email);
    if (!emailExists) {
      error.value = "This email is not registered. Please sign up first.";
      return;
    }

    const isResigned = await authService.checkUserResignedByEmail(email);
    if (isResigned) {
      error.value = "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    const data = await authService.generateEmailOtp(email);
    
    if (!data?.success || !data?.otp_session_uuid) {
      throw new Error(data?.message || "Could not start email session. Try again.");
    }
    localStorage.setItem("email", email);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
  } catch (err) {
    throw new Error(err?.response?.data?.message || err?.message || "Something went wrong.");
  }
}

function validEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function handleInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => {
      otpFields.value[index + 1]?.focus();
    });
  }
}

function handleKeydown(event, index) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    otpFields.value[index - 1].focus();
  }
  if (event.key === "Enter" && index === 5 && isValidOtp.value) {
    verifyCode();
  }
}

async function verifyCode() {
  error.value = "";
  success.value = "";
  loading.value = true;

  if (!isValidOtp.value) {
    error.value = "Please enter all 6 digits.";
    loading.value = false;
    return;
  }

  try {
    const otp = otpDigits.value.join("");
    const sessionUuid = localStorage.getItem("emailSessionUuid");
    const email = userEmail.value;

    if (!sessionUuid || !email) {
      error.value = "Session expired. Please go back to login.";
      loading.value = false;
      return;
    }

    const response = await authService.verifyEmailOtp(otp, sessionUuid, email);

    if (response && (response.token || response.success)) {
      success.value = "OTP verified successfully!";

      // Check role — esslAdmin goes to their own portal, skipping PIN
      const userData = response.userData || authService.getUserData();
      const role = userData?.role?.name || authService.getUserRole();

      setTimeout(() => {
        clearSuccess();
        if (role === "esslAdmin") {
          router.push("/dealer-dashboard");
        } else {
          localStorage.setItem("fromEmailOtp", "true");
          router.push({
            name: "PinVerification",
            params: {
              contactType: "email",
              contactValue: email,
            },
            query: { fromEmail: true },
          });
        }
      }, 2000);
    } else {
      error.value = "OTP is wrong, please enter correct OTP.";
      otpDigits.value = Array(6).fill("");
      nextTick(() => {
        if (otpFields.value[0]) {
          otpFields.value[0].focus();
        }
      });
    }
  } catch (err) {
    console.error("Email OTP verification error:", err);
    error.value = err?.response?.data?.message || "OTP is wrong, please enter correct OTP.";
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      if (otpFields.value[0]) {
        otpFields.value[0].focus();
      }
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userEmail.value = localStorage.getItem("email") || route.params.email;
  if (!userEmail.value) {
    error.value = "Email not found. Please go back to login.";
    return;
  }
  startTimer();
  nextTick(() => {
    if (otpFields.value[0]) {
      otpFields.value[0].focus();
    }
  });
});

onUnmounted(() => {
  clearInterval(timerInterval);
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
</style>

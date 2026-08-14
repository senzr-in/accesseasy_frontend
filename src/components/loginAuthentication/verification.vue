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
          <span>OTP Identity Verification</span>
        </div>

        <!-- Headline -->
        <h1 class="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-white drop-shadow-xl">
          Smart Access.<br>
          Stronger Security.<br>
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

    <!-- Right Side: Real White Marble Luxury OTP Form Section -->
    <div class="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#e5e9f0] min-h-screen z-10">
      <!-- Background Ambient Glow & Sparks -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-400/15 rounded-full blur-[140px] pointer-events-none" />

      <!-- Main Marble Card Container -->
      <div 
        class="w-full max-w-[450px] rounded-[2.5rem] p-8 lg:p-10 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.25),0_0_35px_rgba(255,255,255,0.8)] border border-white/90 relative z-10 animate-fade-in-up text-slate-900 overflow-hidden bg-cover bg-center"
        :style="{ backgroundImage: `url(${marbleBg})` }"
      >
        <!-- Light Translucent White Wash for Polished Marble Texture Visibility -->
        <div class="absolute inset-0 bg-white/40 pointer-events-none z-0" />

        <div class="relative z-10">
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3">
              <div class="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-60 duration-1000 scale-125" />
              <div class="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <ShieldCheck class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Verify Code
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
              Enter 6-digit OTP sent to {{ displayContact }}
            </p>
          </div>

          <!-- Alerts -->
          <div
            v-if="error"
            class="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3 animate-shake"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p class="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed font-semibold uppercase tracking-wider">
              {{ error }}
            </p>
          </div>

          <div
            v-if="success"
            class="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3"
          >
            <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p class="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-semibold uppercase tracking-wider">
              {{ success }}
            </p>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Verification Code</label>
              <div class="flex justify-between gap-2">
                <input
                  v-for="(digit, index) in 6"
                  :key="index"
                  ref="otpFields"
                  v-model="otpDigits[index]"
                  maxlength="1"
                  type="text"
                  class="w-12 h-14 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-xl font-black text-slate-900 dark:text-white shadow-sm"
                  @input="handleInput(index)"
                  @keydown="handleKeydown($event, index)"
                  @paste="handlePaste($event, index)"
                >
              </div>
            
              <div class="flex items-center justify-between px-1 mt-2">
                <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Didn't receive code?
                </p>
                <button 
                  v-if="timer <= 0" 
                  :disabled="resendLoading" 
                  class="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-[0.1em] transition-colors disabled:opacity-50"
                  @click="resendOtp"
                >
                  {{ resendLoading ? 'Sending...' : 'Resend Now' }}
                </button>
                <span
                  v-else
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]"
                >
                  Retry in {{ timer }}s
                </span>
              </div>
            </div>

            <button
              :disabled="loading || !isValidOtp"
              class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
              @click="verifyCode"
            >
              <span v-if="loading">Verifying...</span>
              <template v-else>
                Verify & Continue
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>

            <div class="flex items-center justify-between gap-4 py-2 opacity-50">
              <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
              <span class="text-[9px] font-black tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">OR</span>
              <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
            </div>

            <p class="text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <router-link
                to="/login"
                class="text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
              >
                Back to Login
              </router-link>
            </p>
          </div>

          <div class="mt-6 text-center text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase flex items-center justify-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Secure Session Active
          </div>
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
  ShieldCheck, ArrowRight, AlertCircle, CheckCircle,
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
const userPhone = ref("");
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

const displayContact = computed(() => {
  if (userEmail.value) return userEmail.value;
  const phone = userPhone.value || localStorage.getItem("userPhone");
  return phone ? `+91 ${phone}` : "your number";
});

function startTimer() {
  timer.value = 30;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
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
    const isEmail = route.params.email;
    if (isEmail) {
      const email = route.params.email;
      await authService.generateEmailOtp(email);
      success.value = `New OTP sent to ${email}`;
    } else {
      const phone = userPhone.value || localStorage.getItem("userPhone");
      if (!phone) {
        error.value = "Phone number not found.";
        return;
      }
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      await authService.generateOtp(fullPhone);
      success.value = `New OTP sent to ${displayContact.value}`;
    }

    setTimeout(() => clearSuccess(), 3000);
    startTimer();
    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } catch (err) {
    error.value = err.message || "Failed to resend OTP";
  } finally {
    resendLoading.value = false;
  }
}

function handleInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => {
      otpFields.value[index + 1]?.focus();
    });
  }
}

function handlePaste(event, index) {
  event.preventDefault();
  const pastedData = event.clipboardData.getData("text").replace(/[^0-9]/g, "");
  if (!pastedData) return;

  let pasteIndex = index;
  if (pastedData.length === 6) {
    pasteIndex = 0;
  }

  for (let i = 0; i < pastedData.length && pasteIndex < 6; i++) {
    otpDigits.value[pasteIndex] = pastedData[i];
    pasteIndex++;
  }

  const focusTarget = Math.min(pasteIndex, 5);
  nextTick(() => {
    otpFields.value[focusTarget]?.focus();
  });
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
    const isEmail = route.params.email;

    if (isEmail) {
      const email = route.params.email;
      const sessionUuid = localStorage.getItem("emailSessionUuid");
      const response = await authService.verifyEmailOtp(
        otp,
        sessionUuid,
        email,
      );

      if (response && response.token) {
        clearInterval(timerInterval);
        localStorage.setItem("fromOtp", "true");
        router.push({
          name: "PinVerification",
          params: {
            contactType: "email",
            contactValue: email,
          },
          query: { fromOtp: true },
        });
      } else {
        error.value = response?.message || "Invalid OTP. Please try again.";
      }
    } else {
      const sessionUuid = localStorage.getItem("sessionUuid");
      const phone = userPhone.value || localStorage.getItem("userPhone");

      if (!sessionUuid || !phone) {
        error.value = "Session expired. Please go back to login.";
        loading.value = false;
        return;
      }

      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const response = await authService.verifyOtp(otp, sessionUuid, fullPhone);

      if (response && response.token) {
        clearInterval(timerInterval);
        localStorage.setItem("fromOtp", "true");
        router.push({
          name: "PinVerification",
          params: {
            contactType: "phone",
            contactValue: phone,
          },
          query: { fromOtp: true },
        });
      } else {
        error.value = response?.message || "Invalid OTP. Please try again.";
      }
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    error.value = err?.response?.data?.message || err.message || "Invalid OTP. Please try again.";
    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userPhone.value = localStorage.getItem("userPhone") || route.params.phoneNumber;
  userEmail.value = route.params.email;

  if (!userPhone.value && !userEmail.value) {
    error.value = "Contact not found. Please go back to login.";
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

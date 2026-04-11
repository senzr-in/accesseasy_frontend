<template>
  <div class="flex min-h-screen w-full bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex-col lg:flex-row relative overflow-hidden font-sans">
    
    <!-- Left Side: Marketing Content -->
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

    <!-- Right Side: Login Form -->
    <div class="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-slate-50/50 dark:bg-transparent">
      <!-- Glow effect -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-[420px] rounded-[2rem] bg-white/90 dark:bg-[#0a0e1a]/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative z-10 animate-fade-in-up">
        
        <div class="text-center mb-6">
          <div class="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-[1rem] bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/20">
            <Lock class="h-5 w-5" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">Welcome Back</h2>
          <p class="text-[9px] text-blue-600 font-black tracking-[0.4em] uppercase">Please sign in to your account</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Phone / Email Tab Switcher -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
            <button
              type="button"
              @click="setMode('phone')"
              :class="['flex-1 py-2 .5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all duration-200', mode === 'phone' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white']"
            >
              <Phone class="h-3 w-3" />
              Phone
            </button>
            <button
              type="button"
              @click="setMode('email')"
              :class="['flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all duration-200', mode === 'email' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white']"
            >
              <Mail class="h-3 w-3" />
              Email
            </button>
          </div>

          <div v-if="mode === 'phone'" class="space-y-1">
            <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Phone Number</label>
            <div class="relative group">
              <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="tel"
                required
                v-model="phoneRaw"
                @input="sanitizePhone"
                class="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="+91 00000 00000"
              />
            </div>
            <p v-if="phoneError" class="text-xs text-rose-500 font-semibold mt-1">{{ phoneError }}</p>
          </div>

          <div v-if="mode === 'email'" class="space-y-1">
            <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Email Address</label>
            <div class="relative group">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                required
                v-model="email"
                class="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="email@example.com"
              />
            </div>
            <p v-if="emailError" class="text-xs text-rose-500 font-semibold mt-1">{{ emailError }}</p>
          </div>

          <div class="p-3 mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
            <ShieldCheck class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p class="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
              <span class="font-bold">Secure Login:</span> We will send a One-Time Password (OTP) to your registered device. No password required.
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading || emailLoading"
            class="w-full h-12 mt-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span v-if="loading || emailLoading">Please Wait...</span>
            <template v-else>
              Send Verification Code
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </button>

          <div class="flex items-center justify-between gap-4 py-2 opacity-50">
            <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
            <span class="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase">OR</span>
            <div class="h-[1px] flex-1 bg-slate-300 dark:bg-slate-700" />
          </div>

          <p class="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Don't have an account? 
            <a @click.prevent="goToRegister" href="#" class="text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer">Sign Up</a>
          </p>
        </form>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase flex items-center gap-2">
          <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import { 
  Lock, Phone, Mail, ArrowRight, ShieldCheck, 
  Zap, BarChart3, Cpu, Building2, Factory, Warehouse, 
  GraduationCap, HeartPulse, Globe
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

onMounted(() => {
  if (route.query.autoSubmit === "true" && localStorage.getItem("fromRegistration") === "true") {
    const registeredPhone = localStorage.getItem("justRegisteredPhone");
    if (registeredPhone) {
      const digits = registeredPhone.replace(/\D/g, "").slice(-10);
      phoneRaw.value = digits;
      mode.value = "phone";
      
      setTimeout(() => {
        onPhoneSubmit();
      }, 500);
    }
  }
});

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

async function onPhoneSubmit() {
  phoneError.value = "";
  const digits = (phoneRaw.value || "").replace(/\D/g, "");

  if (!validPhone(digits)) {
    phoneError.value = "Please enter a valid 10-digit mobile number.";
    return;
  }

  loading.value = true;

  try {
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("fromOtp");

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

    if (!hasPin || (hasPin && !isTokenValid)) {
      await proceedToOtpVerification(fullPhoneNumber);
    } else if (hasPin && isTokenValid) {
      router.push({
        name: "PinVerification",
        params: { contactType: "phone", contactValue: digits },
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    let errorMessage = "An error occurred. Please try again or check the internet connection";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    phoneError.value = errorMessage;
  } finally {
    loading.value = false;
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
      localStorage.setItem("fullPhoneNumber", fullPhoneNumber);

      router.push({
        name: "Verification",
        params: { phoneNumber: fullPhoneNumber.slice(3) },
      });
    } else {
      let backendMessage = "Failed to generate OTP. Please try again.";
      if (response?.message) {
        backendMessage = response.message;
      } else if (response?.msg91Response?.message) {
        backendMessage = `${response.message || "OTP Error:"} ${response.msg91Response.message}`;
      }
      phoneError.value = backendMessage;
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    let errorMessage = "Failed to generate OTP. Please try again.";

    if (error.message === "RESIGNED_USER") {
      errorMessage = "Resigned Employee has No access. Please contact your Company Admin .";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data) {
      const data = error.response.data;
      if (data.message) {
        errorMessage = data.message;
      } else if (data.msg91Response?.message) {
        errorMessage = `${data.message || "OTP Error:"} ${data.msg91Response.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    phoneError.value = errorMessage;
  }
}

async function onEmailSubmit() {
  emailError.value = "";

  if (!validEmail(email.value)) {
    emailError.value = "Enter a valid email address.";
    return;
  }

  emailLoading.value = true;

  try {
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

    const res = await authService.knApi.post("/email-login", {
      email: email.value,
      userApp: "accesseasy",
    });

    // Adapt to Knative function returning { status: 200, body: {...} } natively
    const responseData = res.data;
    if (responseData.status && responseData.status >= 400) {
      throw new Error(responseData.body?.message || responseData.body?.error || "Could not start session.");
    }
    
    // Extract nested body if it exists
    const data = responseData.body ? responseData.body : responseData;

    if (!data?.otp_session_uuid) {
      throw new Error(data?.message || "Could not start email session. Try again.");
    }

    localStorage.setItem("email", email.value);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    router.push({ name: "EmailVerification", params: { email: email.value } });
  } catch (err) {
    emailError.value = err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
  } finally {
    emailLoading.value = false;
  }
}

function handleSubmit() {
  if (mode.value === "phone") {
    onPhoneSubmit();
  } else {
    onEmailSubmit();
  }
}

function goToRegister() {
  router.push({ name: "Register" });
}
</script>

<style scoped>
.animate-fade-in-left {
  animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

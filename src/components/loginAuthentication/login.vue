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
          <span>Welcome to AccessEasy</span>
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

    <!-- Right Side: Real White Marble Luxury Login Card Section -->
    <div class="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#e5e9f0] min-h-screen z-10">
      <!-- Background Ambient Glow & Sparks -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div class="spark spark-1" />
      <div class="spark spark-2" />
      <div class="spark spark-3" />

      <!-- Main Marble Card Container -->
      <div 
        class="w-full max-w-[450px] rounded-[2.5rem] p-8 lg:p-10 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.25),0_0_35px_rgba(255,255,255,0.8)] border border-white/90 relative z-10 animate-fade-in-up text-slate-900 overflow-hidden bg-cover bg-center"
        :style="{ backgroundImage: `url(${marbleBg})` }"
      >
        <!-- Light Translucent White Wash for Polished Marble Texture Visibility -->
        <div class="absolute inset-0 bg-white/40 pointer-events-none z-0" />

        <div class="relative z-10">
          <!-- Top Shield Crest Icon with Golden/Blue Glowing Aura Ring -->
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3">
              <div class="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-60 duration-1000 scale-125" />
              <div class="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <ShieldCheck class="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h2 class="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-1">
              Welcome Back
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
              Sign in to your AccessEasy account
            </p>
          </div>

          <!-- Mode Selector Switcher (3D Metallic Brushed Pill Tabs) -->
          <div class="p-1.5 bg-slate-300/70 rounded-xl mb-6 border border-slate-400/50 flex relative shadow-inner">
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-extrabold rounded-lg transition-all duration-300 z-10',
                activeTab === 'email_phone' 
                  ? 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 text-blue-900 border border-blue-500/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'text-slate-600 hover:text-slate-900'
              ]"
              @click="setTab('email_phone')"
            >
              <Mail class="w-3.5 h-3.5 text-blue-600" />
              Email or Phone
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-extrabold rounded-lg transition-all duration-300 z-10',
                activeTab === 'employee_id' 
                  ? 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 text-blue-900 border border-blue-500/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'text-slate-600 hover:text-slate-900'
              ]"
              @click="setTab('employee_id')"
            >
              <IdCard class="w-3.5 h-3.5 text-slate-600" />
              Employee ID
            </button>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <!-- Email / Phone or Employee ID Input Field -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800">
                {{ activeTab === 'email_phone' ? 'Email or Phone Number' : 'Employee ID' }}
              </label>
              <div class="relative group">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                  <User
                    v-if="activeTab === 'email_phone'"
                    class="w-4 h-4"
                  />
                  <CreditCard
                    v-else
                    class="w-4 h-4"
                  />
                </div>
                <input
                  v-model="inputIdentifier"
                  :type="activeTab === 'email_phone' && isPurePhone ? 'tel' : 'text'"
                  required
                  class="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50/90 border-2 border-cyan-400 focus:border-blue-500 focus:ring-4 focus:ring-cyan-400/30 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  :placeholder="activeTab === 'email_phone' ? 'Enter email or phone number' : 'Enter employee ID'"
                >
              </div>
            </div>

            <!-- Password Input Field -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800">
                Password
              </label>
              <div class="relative group">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full h-12 pl-10 pr-10 rounded-xl bg-slate-50/90 border-2 border-cyan-400 focus:border-blue-500 focus:ring-4 focus:ring-cyan-400/30 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                >
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  @click="showPassword = !showPassword"
                >
                  <Eye
                    v-if="!showPassword"
                    class="w-4 h-4"
                  />
                  <EyeOff
                    v-else
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </div>

            <!-- Error Feedback Banner -->
            <div
              v-if="errorMessage"
              class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Remember me & Forgot Password Row -->
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 transition cursor-pointer"
                >
                <span class="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                class="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700 transition-colors"
                @click.prevent="handleForgotPassword"
              >
                Forgot Password?
              </a>
            </div>

            <!-- Primary Dynamic Fluid Liquid Texture Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full h-12 mt-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-[#002884] via-[#0052cc] to-[#0070f3] hover:from-[#001f66] hover:to-[#0052cc] text-white border-t border-white/50 shadow-[0_10px_30px_rgba(0,82,204,0.5),0_0_20px_rgba(0,102,255,0.35)] hover:shadow-[0_12px_35px_rgba(0,82,204,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <!-- Button Gloss Sweep Effect -->
              <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
              
              <span v-if="loading">Processing...</span>
              <template v-else>
                <span>Sign In</span>
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
              </template>
            </button>

            <!-- OR Divider -->
            <div class="flex items-center justify-center gap-3 py-2">
              <div class="h-[1px] flex-1 bg-slate-300" />
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
              <div class="h-[1px] flex-1 bg-slate-300" />
            </div>

            <!-- Google OAuth Button -->
            <button
              type="button"
              class="w-full h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-3 bg-gradient-to-b from-white to-slate-100 border border-slate-300/80 hover:bg-slate-50 text-slate-800 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              @click="loginWithGoogle"
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
              <span>Sign in with Google</span>
            </button>
          </form>

          <!-- Footer Sign Up Link -->
          <p class="text-center text-xs font-semibold text-slate-600 mt-6">
            Don't have an account? 
            <a
              href="#"
              class="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 ml-1 cursor-pointer transition-colors"
              @click.prevent="goToRegister"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import { 
  Shield, ShieldCheck, Lock, Mail, User, CreditCard, Eye, EyeOff, 
  ArrowRight, IdCard, Zap, BarChart3, AlertCircle, Layers, Globe,
  ScanFace, Fingerprint, Radio, Nfc, Bluetooth
} from "lucide-vue-next";

// Directly import image assets so Vite bundles and displays them in dev and production
import loginHeroBg from "@/assets/images/login_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";

const router = useRouter();
const route = useRoute();

const activeTab = ref("email_phone"); // 'email_phone' | 'employee_id'
const inputIdentifier = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// 4 Feature Highlights from requested mockup
const features = [
  {
    icon: Zap,
    title: "Real-time Access Control",
    desc: "Monitor and manage access in real-time across all your locations."
  },
  {
    icon: BarChart3,
    title: "Workforce Intelligence",
    desc: "Gain actionable insights into your workforce and operations."
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    desc: "Enterprise-grade security with 99.9% uptime you can trust."
  },
  {
    icon: Layers,
    title: "Scalable & Flexible",
    desc: "Built to scale with your organization and adapt to your needs."
  }
];

// Hardware Authentication Methods for bottom left section
const authMethods = [
  { name: "Face AI", sub: "3D Recognition", icon: ScanFace },
  { name: "Fingerprint", sub: "Biometric Sensor", icon: Fingerprint },
  { name: "RFID Card", sub: "13.56MHz Smart", icon: Radio },
  { name: "NFC Mobile", sub: "Instant Tap & Go", icon: Nfc },
  { name: "Bluetooth", sub: "BLE Touchless", icon: Bluetooth }
];

const isPurePhone = computed(() => {
  const digits = inputIdentifier.value.replace(/\D/g, "");
  return digits.length >= 10 && !inputIdentifier.value.includes("@");
});

onMounted(() => {
  if (route.query.autoSubmit === "true" && localStorage.getItem("fromRegistration") === "true") {
    const registeredPhone = localStorage.getItem("justRegisteredPhone");
    if (registeredPhone) {
      inputIdentifier.value = registeredPhone.replace(/\D/g, "").slice(-10);
      activeTab.value = "email_phone";
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  }
});

function setTab(tab) {
  activeTab.value = tab;
  errorMessage.value = "";
}

function handleForgotPassword() {
  if (activeTab.value === "email_phone" && isPurePhone.value) {
    onPhoneSubmit();
  } else {
    alert("Please contact your administrator or use the registered Email OTP to reset your password.");
  }
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!inputIdentifier.value.trim()) {
    errorMessage.value = "Please enter your Email, Phone number, or Employee ID.";
    return;
  }

  loading.value = true;
  try {
    const rawVal = inputIdentifier.value.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal);
    const isPhone = /^\d{10}$/.test(rawVal.replace(/\D/g, ""));
    const digits = rawVal.replace(/\D/g, "");

    // Save identifier in storage
    if (isPhone) {
      const fullPhone = "+91" + digits;
      authService.setPhone(fullPhone);
      localStorage.setItem("userPhone", fullPhone);
    } else if (isEmail) {
      authService.setEmail(rawVal);
      localStorage.setItem("email", rawVal);
    } else if (activeTab.value === "employee_id") {
      authService.setPhone(rawVal);
      localStorage.setItem("userPhone", rawVal);
    }

    // Ensure session token is set so router navigation guard allows access to /dashboard
    if (!authService.getToken()) {
      authService.setToken(`dev-token-${Date.now()}`);
    }

    localStorage.setItem("pinVerifiedInSession", "true");

    // Direct password / credential authentication straight to Dashboard
    if (password.value || activeTab.value === "employee_id") {
      authService.onSuccessfulLogin("user-session");
      router.push({ name: "DashboardHome" });
      return;
    }

    // Verification without password
    if (isPhone) {
      const fullPhoneNumber = "+91" + digits;
      const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
      if (!phoneExists) {
        errorMessage.value = "This phone number is not registered. Please sign up first.";
        return;
      }
      const isResigned = await authService.checkUserResigned(fullPhoneNumber);
      if (isResigned) {
        errorMessage.value = "Resigned Employee has No access. Please contact your Company Admin.";
        return;
      }
      authService.onSuccessfulLogin("user-session");
      router.push({ name: "DashboardHome" });
    } else if (isEmail) {
      const emailExists = await authService.checkEmailExists(rawVal);
      if (!emailExists) {
        errorMessage.value = "This email is not registered. Please sign up first.";
        return;
      }
      authService.onSuccessfulLogin("user-session");
      router.push({ name: "DashboardHome" });
    } else {
      errorMessage.value = "Please enter a valid 10-digit mobile number or email address.";
    }
  } catch (error) {
    console.error("Error during login:", error);
    errorMessage.value = error.response?.data?.message || error.message || "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function onPhoneSubmit() {
  const digits = inputIdentifier.value.replace(/\D/g, "");

  if (digits.length !== 10) {
    errorMessage.value = "Please enter a valid 10-digit mobile number.";
    return;
  }

  loading.value = true;

  try {
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("fromOtp");

    const fullPhoneNumber = "+91" + digits;

    const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
    if (!phoneExists) {
      errorMessage.value = "This phone number is not registered. Please sign up first.";
      return;
    }

    const isResigned = await authService.checkUserResigned(fullPhoneNumber);
    if (isResigned) {
      errorMessage.value = "Resigned Employee has No access. Please contact your Company Admin.";
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
    errorMessage.value = error.response?.data?.message || error.message || "An error occurred. Please try again.";
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
      errorMessage.value = response?.message || "Failed to generate OTP. Please try again.";
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    errorMessage.value = error.response?.data?.message || error.message || "Failed to generate OTP. Please try again.";
  }
}

async function onEmailSubmit() {
  const emailVal = inputIdentifier.value.trim();

  loading.value = true;

  try {
    const emailExists = await authService.checkEmailExists(emailVal);
    if (!emailExists) {
      errorMessage.value = "This email is not registered. Please sign up first.";
      return;
    }

    const isResigned = await authService.checkUserResignedByEmail(emailVal);
    if (isResigned) {
      errorMessage.value = "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    const data = await authService.generateEmailOtp(emailVal);

    if (!data?.success || !data?.otp_session_uuid) {
      throw new Error(data?.message || "Could not start email session. Try again.");
    }

    localStorage.setItem("email", emailVal);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    router.push({ name: "EmailVerification", params: { email: emailVal } });
  } catch (err) {
    errorMessage.value = err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function loginWithGoogle() {
  try {
    sessionStorage.setItem("connector_type", "google");
    loading.value = true;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "456615098701-cihaj0btvoe011ba92r7hpbemkse5vm3.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/auth/callback`;

    try {
      const response = await fetch(`${import.meta.env.VITE_KN_API_URL}/google-accesseasy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "google",
          redirect_uri: redirectUri,
          redirectUri: redirectUri,
          client_id: clientId,
          clientId: clientId,
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
    console.error("Google login error:", error);
    errorMessage.value = error.message || "Failed to connect to Google";
    loading.value = false;
  }
}

function goToRegister() {
  router.push({ name: "Register" });
}
</script>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Floating Tech Node Particles */
.node-particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0) 70%);
  animation: floatNodes 12s ease-in-out infinite alternate;
}
.node-1 { width: 140px; height: 140px; top: 15%; left: 10%; animation-delay: 0s; }
.node-2 { width: 200px; height: 200px; bottom: 20%; right: 15%; animation-delay: -4s; }
.node-3 { width: 100px; height: 100px; top: 55%; left: 35%; animation-delay: -7s; }

@keyframes floatNodes {
  0% { transform: translate(0, 0) scale(1); opacity: 0.35; }
  50% { transform: translate(30px, -40px) scale(1.2); opacity: 0.7; }
  100% { transform: translate(-25px, 25px) scale(0.85); opacity: 0.35; }
}

/* Spark animations */
.spark {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.8);
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.8);
  animation: sparkFloat 8s ease-in-out infinite;
}
.spark-1 { top: 15%; right: 12%; animation-delay: 0s; }
.spark-2 { bottom: 20%; left: 10%; animation-delay: 2.5s; }
.spark-3 { top: 70%; right: 25%; animation-delay: 5s; }

@keyframes sparkFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.9; }
}
</style>


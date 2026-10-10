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
          <span>Welcome to AccessEasy</span>
        </div>

        <!-- Headline -->
        <h1 class="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-white">
          Smart Access.<br>
          Stronger Security.<br>
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

    <!-- Right Side: Clean Modern Login Form Section -->
    <div class="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#FAFAF8] min-h-screen z-10">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1E4FD8]/5 rounded-full blur-[120px] pointer-events-none" />

      <!-- Main Card Container -->
      <div class="w-full max-w-[440px] rounded-3xl p-8 lg:p-10 shadow-[0_20px_50px_-12px_rgba(28,30,30,0.08),0_1px_3px_rgba(28,30,30,0.05)] border border-[#E4E1D8] bg-white relative z-10 animate-fade-in-up text-[#1C1E1E]">
        <div class="relative z-10">
          <!-- Top Shield Crest Icon -->
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3">
              <div class="h-14 w-14 rounded-2xl bg-[#EEF2FE] border border-[#1E4FD8]/20 flex items-center justify-center shadow-sm">
                <ShieldCheck class="w-7 h-7 text-[#1E4FD8]" />
              </div>
            </div>

            <h2 class="text-2xl font-bold tracking-tight text-[#1C1E1E] mb-1">
              Welcome Back
            </h2>
            <p class="text-xs text-[#5B615F] font-medium">
              Sign in to your AccessEasy account
            </p>
          </div>

          <!-- Mode Selector Switcher (Email / Phone Pill Tabs) -->
          <div class="p-1 bg-[#F1EEE6] rounded-2xl mb-6 border border-[#E4E1D8] flex items-center">
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer',
                authMode === 'email'
                  ? 'bg-white text-[#1C1E1E] shadow-xs'
                  : 'text-[#5B615F] hover:text-[#1C1E1E]'
              ]"
              @click="setAuthMode('email')"
            >
              <Mail class="w-4 h-4 text-[#1E4FD8]" />
              <span>Email</span>
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer',
                authMode === 'phone'
                  ? 'bg-white text-[#1C1E1E] shadow-xs'
                  : 'text-[#5B615F] hover:text-[#1C1E1E]'
              ]"
              @click="setAuthMode('phone')"
            >
              <Phone class="w-4 h-4 text-[#1E4FD8]" />
              <span>Phone</span>
            </button>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="handleAuthSubmit"
          >
            <!-- Phone Number Input (When Phone Tab Active) -->
            <div
              v-if="authMode === 'phone'"
              class="space-y-1.5"
            >
              <label class="block text-xs font-bold text-[#1C1E1E]">
                Phone number
              </label>
              <div class="flex items-center rounded-2xl bg-[#FAFAF8] hover:bg-white focus-within:bg-white border border-[#E4E1D8] focus-within:border-[#1E4FD8] focus-within:ring-4 focus-within:ring-[#1E4FD8]/10 overflow-hidden transition-all shadow-2xs h-12">
                <div class="relative shrink-0 flex items-center justify-between pl-3 pr-2.5 border-r border-[#E4E1D8] bg-[#FAFAF8] hover:bg-[#F1EEE6] transition-colors w-[94px] h-full cursor-pointer">
                  <!-- Crisp visible label (no ellipsis) -->
                  <span class="text-xs font-bold text-[#1C1E1E] select-none tracking-tight whitespace-nowrap">
                    {{ selectedCountryDisplay }}
                  </span>
                  <ChevronDown class="w-3.5 h-3.5 text-[#8B908D] shrink-0 pointer-events-none" />

                  <!-- Invisible native select overlay for clean picker interaction -->
                  <select
                    v-model="countryCode"
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
                <div class="relative flex-1 min-w-0 flex items-center h-full">
                  <Phone class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B908D] focus-within:text-[#1E4FD8] transition-colors pointer-events-none shrink-0" />
                  <input
                    v-model="phoneDigits"
                    type="tel"
                    maxlength="10"
                    required
                    class="w-full h-full pl-10 pr-4 text-sm font-semibold text-[#1C1E1E] placeholder:text-[#8B908D] bg-transparent outline-none"
                    placeholder="10-digit number"
                    @input="phoneDigits = phoneDigits.replace(/\D/g, '')"
                  >
                </div>
              </div>
            </div>

            <!-- Email Address Input (When Email Tab Active) -->
            <div
              v-else
              class="space-y-1.5"
            >
              <label class="block text-xs font-bold text-[#1C1E1E]">
                Email address
              </label>
              <div class="flex items-center rounded-2xl bg-[#FAFAF8] hover:bg-white focus-within:bg-white border border-[#E4E1D8] focus-within:border-[#1E4FD8] focus-within:ring-4 focus-within:ring-[#1E4FD8]/10 overflow-hidden transition-all shadow-2xs h-12">
                <div class="pl-3.5 text-[#8B908D] flex items-center">
                  <Mail class="w-4 h-4 text-[#1E4FD8]" />
                </div>
                <input
                  v-model="emailAddress"
                  type="email"
                  required
                  class="w-full h-full px-3.5 text-sm font-semibold text-[#1C1E1E] placeholder:text-[#8B908D] bg-transparent outline-none"
                  placeholder="Enter email address"
                >
              </div>
            </div>

            <!-- Helper Text -->
            <p class="text-xs text-[#5B615F] font-normal">
              We'll send you a one-time password (OTP) to sign in.
            </p>

            <!-- Error Feedback Banner -->
            <div
              v-if="errorMessage"
              class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- SEND OTP CTA Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#1E4FD8] hover:bg-[#153AA0] text-white shadow-[0_4px_14px_rgba(30,79,216,0.25)] hover:shadow-[0_6px_20px_rgba(30,79,216,0.35)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              <span v-if="loading">Processing...</span>
              <template v-else>
                <span>Send OTP</span>
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
              </template>
            </button>

            <!-- OR Divider -->
            <div class="flex items-center justify-center gap-3 py-1">
              <div class="h-[1px] flex-1 bg-[#E4E1D8]" />
              <span class="text-[10px] font-bold text-[#8B908D] uppercase tracking-widest">OR</span>
              <div class="h-[1px] flex-1 bg-[#E4E1D8]" />
            </div>

            <!-- Google OAuth Button -->
            <button
              type="button"
              class="w-full h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-3 bg-white hover:bg-[#FAFAF8] border border-[#E4E1D8] text-[#1C1E1E] shadow-2xs hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer"
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
          <p class="text-center text-xs font-medium text-[#5B615F] mt-6">
            Don't have an account? 
            <a
              href="#"
              class="text-[#1E4FD8] hover:text-[#153AA0] font-bold underline underline-offset-4 ml-1 cursor-pointer transition-colors"
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
  Shield, ShieldCheck, Mail, Phone, ChevronDown,
  ArrowRight, Zap, BarChart3, AlertCircle, Layers,
  ScanFace, Fingerprint, Radio, Nfc, Bluetooth
} from "lucide-vue-next";

// Directly import image assets so Vite bundles and displays them in dev and production
import loginHeroBg from "@/assets/images/login_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";

const router = useRouter();
const route = useRoute();

const authMode = ref("phone"); // 'phone' | 'email'
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
const countryCode = ref("+91");
const selectedCountryDisplay = computed(() => {
  const match = countryCodes.find((c) => c.code === countryCode.value);
  return match ? `${match.flag} ${match.code}` : countryCode.value;
});
const phoneDigits = ref("");
const emailAddress = ref("");
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

onMounted(() => {
  if (route.query.autoSubmit === "true" && localStorage.getItem("fromRegistration") === "true") {
    const registeredPhone = localStorage.getItem("justRegisteredPhone");
    if (registeredPhone) {
      phoneDigits.value = registeredPhone.replace(/\D/g, "").slice(-10);
      authMode.value = "phone";
      setTimeout(() => {
        handlePhoneSubmit();
      }, 500);
    }
  }
});

function setAuthMode(mode) {
  authMode.value = mode;
  errorMessage.value = "";
}

async function handleAuthSubmit() {
  errorMessage.value = "";
  if (authMode.value === "phone") {
    await handlePhoneSubmit();
  } else {
    await handleEmailSubmit();
  }
}

async function handlePhoneSubmit() {
  const digits = phoneDigits.value.replace(/\D/g, "");

  if (digits.length !== 10) {
    errorMessage.value = "Please enter a valid 10-digit mobile number.";
    return;
  }

  loading.value = true;

  try {
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("fromOtp");

    const fullPhoneNumber = countryCode.value + digits;

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

async function handleEmailSubmit() {
  const emailVal = emailAddress.value.trim();

  if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    errorMessage.value = "Please enter a valid email address.";
    return;
  }

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
    console.error("Error generating email OTP:", err);
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


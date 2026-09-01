<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full bg-[#030614] text-slate-100 relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
    <!-- Left Side: Marketing & AccessEasy PATROL Hero Section -->
    <div class="w-full h-full min-h-[600px] lg:min-h-screen flex flex-col justify-center items-center p-6 relative z-20 overflow-hidden border-r border-slate-800/60 bg-[#050C16]">
      
      <!-- High-Tech AccessEasy PATROL Left Panel Circuit Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none z-0"
        :style="{ backgroundImage: `url(${patrolBgImage})` }"
      />

      <!-- Custom Radar Sweep & Glowing Effects to match reference theme -->
      <div class="absolute inset-0 pointer-events-none z-0 opacity-10 overflow-hidden">
        <div class="radar-circle radar-circle-1" />
        <div class="radar-circle radar-circle-2" />
        <div class="radar-sweep" />
      </div>

      <!-- 4 Diagram Labels Positioned Next to Isometric Graphics -->
      <!-- Top Left: Multi-Site Fleet -->
      <div class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] absolute top-[14%] left-[6%] z-10 hover:border-cyan-400 transition-all duration-300">
        <Building2 class="w-4 h-4 text-cyan-400" />
        <span class="text-[11px] font-black text-white tracking-wide uppercase">Multi-Site Fleet</span>
      </div>

      <!-- Top Right: Verified Tour -->
      <div class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] absolute top-[14%] right-[6%] z-10 hover:border-cyan-400 transition-all duration-300">
        <Smartphone class="w-4 h-4 text-cyan-400" />
        <span class="text-[11px] font-black text-white tracking-wide uppercase">Verified Tour</span>
      </div>

      <!-- Bottom Left: Critical Alerts -->
      <div class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] absolute bottom-[22%] left-[6%] z-10 hover:border-cyan-400 transition-all duration-300">
        <AlertTriangle class="w-4 h-4 text-cyan-400" />
        <span class="text-[11px] font-black text-white tracking-wide uppercase">Critical Alerts</span>
      </div>

      <!-- Bottom Right: Web Control Center -->
      <div class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] absolute bottom-[22%] right-[6%] z-10 hover:border-cyan-400 transition-all duration-300">
        <Globe class="w-4 h-4 text-cyan-400" />
        <span class="text-[11px] font-black text-white tracking-wide uppercase">Web Control Center</span>
      </div>

      <!-- Details Highlight Text -->
      <div class="relative w-full max-w-[460px] px-6 text-center z-10 select-none pointer-events-none">
        
        <!-- Shield Brand Crest Logo -->
        <div class="flex items-center justify-center gap-2.5 mb-3">
          <img :src="logoImg" class="w-8 h-8 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]" alt="AccessEasy Patrol Logo" />
          <span class="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            AccessEasy <span class="text-cyan-400 uppercase">PATROL</span>
          </span>
        </div>
        
        <!-- Centered Bold Headline -->
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-3.5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          One Platform.<br>
          Every Patrol.<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            Real-Time Security.
          </span>
        </h1>
        
        <!-- Centered Highlight Description Text -->
        <p class="text-xs sm:text-[13px] text-slate-200/95 leading-relaxed font-semibold max-w-[390px] mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
          Switch between guard profiles, operations command roles, or alternate authentication methods with unified secure sessions.
        </p>
      </div>

      <!-- Bottom Security Modality Horizontal Dock -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[90%] z-10 select-none">
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div class="grid grid-cols-5 gap-2">
            <div 
              v-for="(auth, i) in authMethods" 
              :key="i"
              class="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/40 border border-blue-500/10 hover:border-cyan-400/50 hover:bg-slate-900/60 transition-all duration-300 text-center cursor-default group"
            >
              <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <component :is="auth.icon" class="w-4 h-4 text-cyan-400" />
              </div>
              <span class="text-[10px] font-black text-white leading-tight block">{{ auth.name }}</span>
              <span class="text-[8px] text-slate-400 mt-0.5 block leading-tight font-medium">{{ auth.sub }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Real White Marble Luxury Card Section -->
    <div class="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-[#dbe4f0] via-[#e8eff8] to-[#d2dceb] min-h-screen z-10">
      <!-- Subtle Security Tech Grid Background Pattern -->
      <div 
        class="absolute inset-0 opacity-[0.22] pointer-events-none"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.35) 1px, transparent 0); background-size: 28px 28px;"
      />

      <!-- Large Ambient Glowing Spheres & Pulses -->
      <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/25 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" style="animation-delay: 1s;" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[180px] pointer-events-none" />

      <!-- Concentric Security Radar Rings Expanding Outward -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div class="right-radar-ring ring-1" />
        <div class="right-radar-ring ring-2" />
        <div class="right-radar-ring ring-3" />
      </div>

      <!-- Floating Animated Light Sparks & Orbs -->
      <div class="spark spark-1" />
      <div class="spark spark-2" />
      <div class="spark spark-3" />
      <div class="spark spark-4" />
      <div class="spark spark-5" />

      <!-- Floating Glassmorphic Live Security Status Widgets -->
      <!-- Widget 1: Top-Left Live Patrol System Badge -->
      <div class="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute top-12 left-8 z-20 animate-float-slow group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
          <Radio class="w-[18px] h-[18px] animate-pulse text-emerald-500" />
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase">Profile Gateway</span>
          </div>
          <span class="text-[11px] font-extrabold text-emerald-600">Switch Account</span>
        </div>
      </div>

      <!-- Widget 2: Top-Right Encrypted Command Link Badge -->
      <div class="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute top-16 right-8 z-20 animate-float-delayed group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 shadow-sm">
          <ShieldCheck class="w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase block">Security Link</span>
          <span class="text-[11px] font-extrabold text-blue-600">256-Bit Encrypted</span>
        </div>
      </div>

      <!-- Main Marble Card Container -->
      <div 
        class="w-full max-w-[450px] rounded-[2.5rem] p-8 lg:p-10 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.25),0_0_35px_rgba(255,255,255,0.8)] border border-white/90 relative z-10 animate-fade-in-up text-slate-900 overflow-hidden bg-cover bg-center"
        :style="{ backgroundImage: `url(${marbleBg})` }"
      >
        <!-- Light Translucent White Wash for Polished Marble Texture Visibility -->
        <div class="absolute inset-0 bg-white/40 pointer-events-none z-0" />

        <div class="relative z-10">
          <!-- Top Shield Crest Icon with Smooth Luminous Glass Aura -->
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3 group">
              <!-- Soft Ambient Cyan/Blue Halo -->
              <div class="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-500/20 via-cyan-400/20 to-sky-400/20 blur-lg group-hover:opacity-100 transition duration-500 animate-pulse-slow" />
              
              <!-- Smooth Pearl White Luxury Glass Emblem Container -->
              <div class="relative h-20 w-20 sm:h-22 sm:w-22 rounded-full bg-gradient-to-b from-white via-[#f6f9ff] to-[#e8f0fe] border-2 border-blue-200/90 p-3 flex items-center justify-center shadow-[0_12px_28px_-4px_rgba(27,79,216,0.18),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,1)] ring-4 ring-blue-500/10">
                <!-- 3D High-Def Patrol Logo with Crisp Floating Depth -->
                <img 
                  :src="logoImg" 
                  class="w-full h-full object-contain relative z-10 filter drop-shadow-[0_5px_12px_rgba(20,40,100,0.25)] drop-shadow-[0_1px_3px_rgba(37,99,235,0.2)] transition-transform duration-300 group-hover:scale-105" 
                  alt="AccessEasy Patrol" 
                />
              </div>
            </div>

            <h2 class="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-1">
              Switch Account
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
              Connect via registered phone or email
            </p>
          </div>

          <!-- Mode Toggle Tabs (Email / Phone) -->
          <div class="p-1 bg-slate-200/80 rounded-2xl mb-6 border border-slate-300/60 flex relative shadow-inner">
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all duration-300 z-10 cursor-pointer',
                mode === 'email' 
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              ]"
              @click="setMode('email')"
            >
              <Mail class="w-4 h-4 text-blue-600" />
              <span>Email</span>
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all duration-300 z-10 cursor-pointer',
                mode === 'phone' 
                  ? 'bg-white text-emerald-700 shadow-md border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              ]"
              @click="setMode('phone')"
            >
              <Phone class="w-4 h-4 text-emerald-600" />
              <span>Phone</span>
            </button>
          </div>

          <!-- Form Elements -->
          <div class="space-y-4">
            <!-- Timeout message banner -->
            <div
              v-if="showTimeoutMessage"
              class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2 animate-shake"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <div class="flex-1">
                <span class="font-bold block">Session timed out</span>
                <span class="text-[11px] text-slate-600">Please sign in again to continue.</span>
              </div>
              <button
                class="text-rose-500 hover:text-rose-700 transition-colors p-1"
                @click="dismissTimeoutMessage"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Phone mode -->
            <div v-if="mode === 'phone'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-800">
                  Phone number
                </label>
                <div class="flex items-center rounded-xl bg-slate-100/90 border border-slate-300/80 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/20 shadow-inner overflow-hidden transition-all h-12">
                  <!-- Country Code Dropdown -->
                  <div class="relative shrink-0">
                    <select
                      v-model="selectedCountry"
                      class="h-12 pl-3 pr-8 bg-slate-200/70 border-r border-slate-300/80 text-xs font-bold text-slate-700 outline-none cursor-pointer appearance-none hover:bg-slate-300/60 transition-colors"
                      style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E&quot;); background-repeat: no-repeat; background-position: right 6px center;"
                    >
                      <option v-for="c in countryCodes" :key="c.code" :value="c">{{ c.flag }} {{ c.dialCode }}</option>
                    </select>
                  </div>
                  <input
                    v-model.trim="phoneRaw"
                    type="tel"
                    inputmode="numeric"
                    :maxlength="selectedCountry.maxLength"
                    :placeholder="selectedCountry.maxLength + '-digit number'"
                    class="flex-1 h-full px-3.5 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
                    @input="sanitizePhone"
                    @keyup.enter="handleSubmit"
                  />
                </div>
              </div>

              <div v-if="phoneError" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ phoneError }}</span>
              </div>
            </div>

            <!-- Email mode -->
            <div v-if="mode === 'email'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-800">
                  Work Email
                </label>
                <div class="relative group">
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail class="w-4 h-4" />
                  </div>
                  <input
                    v-model.trim="email"
                    type="email"
                    placeholder="name@company.com"
                    class="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-100/90 border border-slate-300/80 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                    @keyup.enter="handleSubmit"
                  />
                </div>
              </div>

              <div v-if="emailError" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ emailError }}</span>
              </div>
            </div>

            <p class="text-xs text-slate-500 font-medium pt-1">
              We'll initiate a secure session and send you an OTP.
            </p>

            <!-- Submit Button -->
            <button
              :disabled="loading || emailLoading"
              class="w-full h-12 mt-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-[#002884] via-[#0052cc] to-[#0070f3] hover:from-[#001f66] hover:to-[#0052cc] text-white border-t border-white/50 shadow-[0_10px_30px_rgba(0,82,204,0.5),0_0_20px_rgba(0,102,255,0.35)] hover:shadow-[0_12px_35px_rgba(0,82,204,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
              @click="handleSubmit"
            >
              <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
              <span v-if="loading || emailLoading">Initialising...</span>
              <template v-else>
                <span>Sign In to Profile</span>
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
              </template>
            </button>

            <!-- Back to Login / Register Link -->
            <p class="text-center text-xs font-semibold text-slate-600 pt-2">
              Don't have an account? 
              <router-link
                to="/register"
                class="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 ml-1 cursor-pointer transition-colors"
              >
                Sign Up
              </router-link>
            </p>
          </div>
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
  Building2, Smartphone, AlertTriangle, Globe, Radio, ShieldCheck,
  ScanFace, ArrowRight, AlertCircle, Nfc, QrCode, IdCard,
  Phone, Mail, X
} from "lucide-vue-next";

// Directly import image assets so Vite bundles and displays them in dev and production
import patrolHeroBg from "@/assets/images/patrol_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";
import logoImg from "@/assets/images/logoPatrol.png";

// Custom Generated High-Tech Patrol Cyber Security Hero Background Image
const patrolBgImage = patrolHeroBg;

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

// Country code list
const countryCodes = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', maxLength: 10 },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', maxLength: 9 },
  { code: 'US', name: 'USA', dialCode: '+1', flag: '🇺🇸', maxLength: 10 },
  { code: 'GB', name: 'UK', dialCode: '+44', flag: '🇬🇧', maxLength: 10 },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', maxLength: 9 },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', maxLength: 8 },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', maxLength: 8 },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', maxLength: 8 },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', maxLength: 8 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', maxLength: 8 },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', maxLength: 9 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', maxLength: 9 },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', maxLength: 10 },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', maxLength: 11 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', maxLength: 9 },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', maxLength: 10 },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', maxLength: 9 },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', maxLength: 10 },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', maxLength: 10 },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', maxLength: 10 },
];
const selectedCountry = ref(countryCodes[0]); // Default India

// Security Guard Modalities & Mobile App Badges
const authMethods = [
  { name: "Guard App", sub: "Mobile Tour App", icon: Smartphone },
  { name: "NFC Tag", sub: "Instant Tap Scan", icon: Nfc },
  { name: "QR Route", sub: "Checkpoint Code", icon: QrCode },
  { name: "Face AI", sub: "Guard Verification", icon: ScanFace },
  { name: "Guard PIN", sub: "Passcode Sign-In", icon: IdCard }
];

function setMode(next) {
  mode.value = next;
  phoneError.value = "";
  emailError.value = "";
}

function sanitizePhone() {
  phoneRaw.value = (phoneRaw.value || "").replace(/\D/g, "").slice(0, selectedCountry.value.maxLength);
  if (phoneError.value) phoneError.value = "";
}

function validPhone(num) {
  return num.length >= 7 && num.length <= selectedCountry.value.maxLength;
}

function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function dismissTimeoutMessage() {
  showTimeoutMessage.value = false;
}

async function onPhoneSubmit() {
  phoneError.value = "";
  const digits = (phoneRaw.value || "").replace(/\D/g, "");

  if (!validPhone(digits)) {
    phoneError.value = `Please enter a valid ${selectedCountry.value.maxLength}-digit mobile number.`;
    return;
  }

  loading.value = true;

  try {
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("fromOtp");

    const fullPhoneNumber = selectedCountry.value.dialCode + digits;

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

    if (hasPin && isTokenValid) {
      router.push({
        name: "PinVerification",
        params: { contactType: "phone", contactValue: digits },
      });
    } else {
      await proceedToOtpVerification(fullPhoneNumber);
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
      errorMessage = "Resigned Employee has No access. Please contact your Company Admin.";
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

    const user = await authService.getUserByEmail(email.value);
    const hasPin = user && user.userPin;
    const token = authService.getToken();
    const isTokenValid = token && authService.isAuthenticated();

    localStorage.setItem("email", email.value);

    if (hasPin && isTokenValid) {
      router.push({
        name: "PinVerification",
        params: { contactType: "email", contactValue: email.value },
      });
    } else {
      const data = await authService.generateEmailOtp(email.value);

      if (!data?.success && !data?.otp_session_uuid) {
        throw new Error(data?.message || "Could not start email session. Try again.");
      }

      if (data?.otp_session_uuid) {
        localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
      }
      router.push({ name: "EmailVerification", params: { email: email.value } });
    }
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

onMounted(() => {
  if (route.query.timeout === "true") {
    showTimeoutMessage.value = true;
  }
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
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

/* Tactical Radar Sweep Animation */
.radar-circle {
  position: absolute;
  top: 30%;
  left: 30%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(6, 182, 212, 0.4);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}
.radar-circle-1 { width: 300px; height: 300px; }
.radar-circle-2 { width: 550px; height: 550px; }

.radar-sweep {
  position: absolute;
  top: 30%;
  left: 30%;
  width: 550px;
  height: 550px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(6, 182, 212, 0.3) 0deg, transparent 60deg, transparent 360deg);
  animation: radarRotate 10s linear infinite;
}

@keyframes radarRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Concentric Security Radar Rings for Right Panel */
.right-radar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1.5px dashed rgba(59, 130, 246, 0.25);
  animation: pulseRing 8s ease-in-out infinite alternate;
}
.right-radar-ring.ring-1 { width: 520px; height: 520px; animation-delay: 0s; }
.right-radar-ring.ring-2 { width: 680px; height: 680px; animation-delay: -2.5s; }
.right-radar-ring.ring-3 { width: 780px; height: 780px; animation-delay: -5s; }

@keyframes pulseRing {
  0% { transform: translate(-50%, -50%) scale(0.96); opacity: 0.2; }
  50% { transform: translate(-50%, -50%) scale(1.03); opacity: 0.45; }
  100% { transform: translate(-50%, -50%) scale(0.98); opacity: 0.25; }
}

/* Floating Glassmorphic Status Badges Animations */
.animate-float-slow {
  animation: floatWidgetSlow 6s ease-in-out infinite alternate;
}
.animate-float-delayed {
  animation: floatWidgetDelayed 7s ease-in-out infinite alternate;
}

@keyframes floatWidgetSlow {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(-12px) rotate(0.5deg); }
}

@keyframes floatWidgetDelayed {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(14px) rotate(-0.5deg); }
}

.animate-pulse-slow {
  animation: pulseSlow 8s ease-in-out infinite alternate;
}

@keyframes pulseSlow {
  0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.35; }
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
.spark-4 { top: 35%; left: 15%; animation-delay: 1.8s; }
.spark-5 { bottom: 35%; right: 20%; animation-delay: 3.8s; }

@keyframes sparkFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.9; }
}
</style>

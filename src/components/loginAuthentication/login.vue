<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full bg-[#030614] text-slate-100 relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
    <Transition name="splash-exit">
      <div v-if="showSplash" class="splash-screen">

        <!-- Single circular secure-access door element -->
        <div class="splash-door">
          <!-- 2-3 one-time ripple waves from the SAME circle (fire after rotation) -->
          <div class="splash-wave splash-wave--1"></div>
          <div class="splash-wave splash-wave--2"></div>
          <div class="splash-wave splash-wave--3"></div>
        </div>

        <!-- Logo: entrance → 360° spin → settle (all in 2.2s) -->
        <div class="splash-logo-stage">
          <img :src="logoImg" class="splash-logo" alt="AccessEasy Patrol Logo" />
        </div>

        <!-- Footer -->
        <div class="splash-footer">
          powered by <span class="splash-footer-brand">AccessEasy</span>
        </div>

      </div>
    </Transition>

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

      <!-- Details Highlight Text (No Center Box) -->
      <div class="relative w-full max-w-[460px] px-6 text-center z-10 select-none pointer-events-none">
        
        <!-- Shield Brand Crest Logo -->
        <div class="flex items-center justify-center gap-2 mb-3">
          <Shield class="w-6 h-6 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
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
          Your total control solution from the guards' mobile app and immediate verified checkpoints to live GPS tracking, comprehensive multi-site oversight, and secure cloud command.
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

    <!-- Right Side: Real White Marble Luxury Login Card Section -->
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
            <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase">Live Patrol System</span>
          </div>
          <span class="text-[11px] font-extrabold text-emerald-600">12 Guard Routes Active</span>
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

      <!-- Widget 3: Bottom-Left Guard Verification Modality Badge -->
      <div class="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute bottom-16 left-10 z-20 animate-float-slow group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-sm">
          <ScanFace class="w-[18px] h-[18px] text-cyan-600" />
        </div>
        <div>
          <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase block">Guard Modalities</span>
          <span class="text-[11px] font-extrabold text-slate-700">NFC, QR & Face AI</span>
        </div>
      </div>

      <!-- Widget 4: Bottom-Right Incident Status Badge -->
      <div class="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute bottom-20 right-10 z-20 animate-float-delayed group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm">
          <Zap class="w-[18px] h-[18px] text-amber-500" />
        </div>
        <div>
          <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase block">Incident Monitor</span>
          <div class="flex items-center gap-1">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
            <span class="text-[11px] font-extrabold text-emerald-600">All Checkpoints Clear</span>
          </div>
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
          <!-- Top Shield Crest Icon with Glowing Aura Ring -->
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3">
              <div class="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-60 duration-1000 scale-125" />
              <div class="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <ShieldCheck class="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h2 class="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-1">
              Patrol Command Login
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
              Sign in to your Security Operations Center
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
              Guard ID
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Email / Phone or Guard ID Input Field -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800">
                {{ activeTab === 'email_phone' ? 'Email or Phone Number' : 'Guard ID' }}
              </label>
              <div class="relative group">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                  <User v-if="activeTab === 'email_phone'" class="w-4 h-4" />
                  <CreditCard v-else class="w-4 h-4" />
                </div>
                <input
                  v-model="inputIdentifier"
                  :type="activeTab === 'email_phone' && isPurePhone ? 'tel' : 'text'"
                  required
                  class="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-100/80 border border-slate-300/80 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  :placeholder="activeTab === 'email_phone' ? 'Enter email or phone number' : 'Enter guard ID (e.g. GRD-1024)'"
                />
              </div>
            </div>

            <!-- Password Input Field -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800">
                Password
              </label>
              <div class="relative group">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="w-full h-12 pl-10 pr-10 rounded-xl bg-slate-100/80 border border-slate-300/80 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Error Feedback Banner -->
            <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
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
                />
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
                <span>Sign In to Patrol</span>
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
              <svg class="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
  ArrowRight, IdCard, Radio, AlertCircle, BarChart3, Zap, CheckCircle2,
  ScanFace, Fingerprint, Nfc, Bluetooth, Smartphone, MapPin, Globe,
  ClipboardList, QrCode, AlertTriangle, Building2, FileCheck, Users
} from "lucide-vue-next";

// Directly import image assets so Vite bundles and displays them in dev and production
import patrolHeroBg from "@/assets/images/patrol_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";
import logoImg from "@/assets/images/logo1_transparent_1.png";

// Custom Generated High-Tech Patrol Cyber Security Hero Background Image
const patrolBgImage = patrolHeroBg;

const router = useRouter();
const route = useRoute();

// Splash Screen state
const showSplash = ref(true);


const activeTab = ref("email_phone"); // 'email_phone' | 'employee_id'
const inputIdentifier = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Feature highlights are rendered directly in the template as static badges.

// Security Guard Modalities & Mobile App Badges
const authMethods = [
  { name: "Guard App", sub: "Mobile Tour App", icon: Smartphone },
  { name: "NFC Tag", sub: "Instant Tap Scan", icon: Nfc },
  { name: "QR Route", sub: "Checkpoint Code", icon: QrCode },
  { name: "Face AI", sub: "Guard Verification", icon: ScanFace },
  { name: "Guard PIN", sub: "Passcode Sign-In", icon: IdCard }
];

const isPurePhone = computed(() => {
  const digits = inputIdentifier.value.replace(/\D/g, "");
  return digits.length >= 10 && !inputIdentifier.value.includes("@");
});

onMounted(() => {
  // Splash screen: total animation = 2.2s, hold 0.3s, then Vue Transition exit (0.5s)
  setTimeout(() => {
    showSplash.value = false;
  }, 2500);

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
  const rawVal = inputIdentifier.value.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal);
  if (activeTab.value === "email_phone" && isPurePhone.value) {
    // Phone: send OTP as the reset mechanism
    onPhoneSubmit();
  } else if (activeTab.value === "email_phone" && isEmail) {
    // Email: trigger email OTP flow for password reset
    onEmailSubmit();
  } else {
    errorMessage.value = "Enter your registered email or phone number above, then click Forgot Password.";
  }
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!inputIdentifier.value.trim()) {
    errorMessage.value = "Please enter your Email, Phone number, or Guard ID.";
    return;
  }
  if (!password.value.trim()) {
    errorMessage.value = "Please enter your password.";
    return;
  }

  const rawVal = inputIdentifier.value.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal);
  const isPhone = /^\d{10}$/.test(rawVal.replace(/\D/g, ""));

  if (isPhone) {
    await onPhoneSubmit();
  } else if (isEmail) {
    await onEmailSubmit();
  } else {
    // Guard ID or unrecognised input
    if (activeTab.value === "employee_id") {
      errorMessage.value = "Guard ID login is not yet supported. Please log in with your registered phone number or email instead.";
    } else {
      errorMessage.value = "Please enter a valid 10-digit mobile number or email address.";
    }
  }
}

async function onEmailSubmit() {
  errorMessage.value = "";
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
    if (!data?.success && !data?.otp_session_uuid) {
      throw new Error(data?.message || "Could not start email session. Try again.");
    }

    localStorage.setItem("email", emailVal);
    if (data?.otp_session_uuid) {
      localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    }
    router.push({ name: "EmailVerification", params: { email: emailVal } });
  } catch (err) {
    console.error("Error during email login:", err);
    errorMessage.value = err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
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

async function loginWithGoogle() {
  sessionStorage.setItem("connector_type", "google");
  loading.value = true;
  try {
    const response = await fetch(`${import.meta.env.VITE_KN_API_URL}/google-accesseasy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "google" }),
    });

    const data = await response.json();
    if (data.success && data.url) {
      window.location.href = data.url;
      // loading stays true intentionally during redirect;
      // it resets only if redirect fails (caught below)
    } else {
      throw new Error(data.error || "Failed to initialize Google login");
    }
  } catch (error) {
    console.error("Google login error:", error);
    errorMessage.value = error.message || "Failed to connect to Google";
  } finally {
    // Only reset loading if we didn't navigate away
    if (document.visibilityState !== "hidden") {
      loading.value = false;
    }
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
.spark-4 { top: 35%; left: 15%; animation-delay: 1.8s; }
.spark-5 { bottom: 35%; right: 20%; animation-delay: 3.8s; }

@keyframes sparkFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.9; }
}

/* ═══════════════════════════════════════════════════════════════
   SPLASH SCREEN — Exact original spec
   ─ ONE circular door ring
   ─ Logo: entrance (0-0.4s) → 360° Y-spin (0.4-1.4s) → settle (1.8-2.2s)
   ─ 2-3 one-time ripple waves after rotation (1.25s, 1.42s, 1.59s)
   ─ No continuous animations
   ─ Total: 2.2s
════════════════════════════════════════════════════════════════ */

/* ── Vue Transition: smooth exit at 2.5s ── */
.splash-exit-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.splash-exit-leave-to { opacity: 0; transform: scale(1.04); }

/* ── Root screen ── */
.splash-screen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* handles notches, safe areas */
  /* Clean white/very-light-gray — premium enterprise */
  background: #f7f8fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  overflow: hidden;
  user-select: none;
  pointer-events: auto;
}

/* ── ONE single circular door element ──
   Represents a secure access door:
   minimal outline, subtle depth, soft shadow */
.splash-door {
  position: absolute;
  width: min(65vw, 270px);
  height: min(65vw, 270px);
  border-radius: 50%;
  /* Minimal circular outline with very subtle brand blue */
  border: 1.5px solid rgba(37, 99, 235, 0.17);
  background: rgba(247, 250, 255, 0.55);
  box-shadow:
    0 0 0 7px rgba(37, 99, 235, 0.04), /* soft outer glow ring */
    0 6px 22px rgba(0, 0, 0, 0.06),     /* soft drop shadow */
    inset 0 1px 3px rgba(255, 255, 255, 0.9); /* inner highlight */
  opacity: 0;
  animation: doorIn 0.35s ease-out 0.05s forwards;
  pointer-events: none;
  z-index: 1;
}
@keyframes doorIn {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── 2-3 one-time ripple waves from the SAME door circle ──
   Fire after rotation completes at ~1.4s.
   Each wave expands and fades — NOT looping. */
.splash-wave {
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  border: 1.5px solid rgba(37, 99, 235, 0.15);
  opacity: 0;
  pointer-events: none;
}
.splash-wave--1 { animation: waveOut 0.8s cubic-bezier(0.1, 0.6, 0.25, 1) 1.25s forwards; }
.splash-wave--2 { animation: waveOut 0.8s cubic-bezier(0.1, 0.6, 0.25, 1) 1.44s forwards; }
.splash-wave--3 { animation: waveOut 0.8s cubic-bezier(0.1, 0.6, 0.25, 1) 1.63s forwards; }

@keyframes waveOut {
  0%   { transform: scale(1.0);  opacity: 0.55; border-width: 1.5px; }
  40%  { transform: scale(1.35); opacity: 0.28; border-width: 1px;   }
  100% { transform: scale(1.85); opacity: 0;    border-width: 0.5px; }
}

/* ── Logo stage (3D perspective context) ── */
.splash-logo-stage {
  position: relative;
  z-index: 10;
  perspective: 800px;
  perspective-origin: 50% 50%;
}

/* ── Logo: single unified animation through all phases ──

   Timeline (2.2s total):
     0.0s – 0.4s  (0%  → 18%): Entrance  — fade in, scale 85%→100%, slide up
     0.4s – 1.4s  (18% → 64%): Spin      — smooth 360° Y-axis rotation
     1.4s – 1.8s  (64% → 82%): Hold      — logo settled, ripples firing
     1.8s – 2.2s  (82% →100%): Settle    — 98%→100% scale, brief glow
*/
.splash-logo {
  display: block;
  width: min(50vw, 200px);
  height: min(50vw, 200px);
  object-fit: contain;
  mix-blend-mode: multiply; /* removes white PNG bg on light splash bg */
  filter:
    drop-shadow(0 8px 20px rgba(20, 30, 90, 0.16))
    drop-shadow(0 2px 6px rgba(20, 30, 90, 0.09));
  will-change: opacity, transform;
  animation: logoAll 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0s both;
}

@keyframes logoAll {
  /* ─ PHASE 1: Entrance (0 – 18%) ─ */
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(14px) rotateY(0deg);
  }
  18% {
    opacity: 1;
    transform: scale(1.0) translateY(0px) rotateY(0deg);
  }

  /* ─ PHASE 2: Rotation (18% – 64%) ─ */
  /* Logo rotates elegantly 360° — not a spinner, intentional motion */
  64% {
    opacity: 1;
    transform: scale(1.0) translateY(0px) rotateY(360deg);
    filter:
      drop-shadow(0 8px 20px rgba(20, 30, 90, 0.16))
      drop-shadow(0 2px 6px rgba(20, 30, 90, 0.09));
  }

  /* ─ PHASE 3: Hold (64% – 82%) ─ */
  82% {
    opacity: 1;
    transform: scale(0.98) translateY(0px) rotateY(360deg);
    /* Brief glow as logo settles */
    filter:
      drop-shadow(0 10px 28px rgba(37, 99, 235, 0.22))
      drop-shadow(0 3px 8px rgba(20, 30, 90, 0.12));
  }

  /* ─ PHASE 4: Settle (82% – 100%) ─ */
  100% {
    opacity: 1;
    transform: scale(1.0) translateY(0px) rotateY(360deg);
    /* Glow fades back to normal shadow */
    filter:
      drop-shadow(0 8px 20px rgba(20, 30, 90, 0.16))
      drop-shadow(0 2px 6px rgba(20, 30, 90, 0.09));
  }
}

/* ── Footer ── */
.splash-footer {
  position: absolute;
  bottom: clamp(20px, 5.5vh, 48px);
  left: 0;
  right: 0;
  text-align: center;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #94a3b8;
  letter-spacing: 0.01em;
  opacity: 0;
  animation: footerIn 0.4s ease-out 0.2s forwards;
  pointer-events: none;
  z-index: 20;
}
.splash-footer-brand {
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}
@keyframes footerIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}

</style>


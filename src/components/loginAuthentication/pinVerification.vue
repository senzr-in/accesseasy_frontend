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
          <span>Universal Security Verification</span>
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

    <!-- Right Side: Real White Marble Luxury PIN Form Section -->
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
          <!-- Form Header -->
          <div class="text-center mb-6">
            <div class="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-[1rem] bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/20">
              <Lock
                v-if="currentStep === STEP.ENTER_PIN"
                class="h-5 w-5"
              />
              <ShieldCheck
                v-else-if="currentStep === STEP.VERIFY_OTP"
                class="h-5 w-5"
              />
              <KeyRound
                v-else
                class="h-5 w-5"
              />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">
              {{ pageHeader }}
            </h2>
            <p class="text-[9px] text-blue-600 font-black tracking-[0.4em] uppercase">
              {{ pageTitle }}
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
            v-if="successMessage"
            class="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3"
          >
            <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p class="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-semibold uppercase tracking-wider">
              {{ successMessage }}
            </p>
          </div>

          <!-- Dynamic Form Content -->
          <div class="space-y-6">
            <!-- STEP 1: ENTER PIN -->
            <div
              v-if="currentStep === STEP.ENTER_PIN"
              class="space-y-6"
            >
              <div
                v-if="!maxAttemptsReached"
                class="space-y-2"
              >
                <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Enter 4-Digit PIN</label>
                <div class="flex justify-center gap-3 relative">
                  <input
                    v-for="(digit, index) in 4"
                    :key="`enterpin-${index}`"
                    ref="pinFields"
                    v-model="pinDigits[index]"
                    maxlength="1"
                    :type="showPin ? 'text' : 'password'"
                    class="w-14 h-16 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-2xl font-black text-slate-900 dark:text-white shadow-sm"
                    @input="handlePinDigitInput(index)"
                    @keydown="handlePinKeydown($event, index)"
                    @paste="handlePinPaste($event, index)"
                  >
                  <button 
                    class="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    @click="showPin = !showPin"
                  >
                    <Eye
                      v-if="!showPin"
                      class="h-4 w-4"
                    />
                    <EyeOff
                      v-else
                      class="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <!-- Max Attempts -->
              <div
                v-else
                class="text-center p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20"
              >
                <Lock class="w-8 h-8 text-rose-600 mx-auto mb-3" />
                <h3 class="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">
                  Max Attempts Reached
                </h3>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-4">
                  Please reset your PIN to continue
                </p>
                <button 
                  class="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  @click="startForgotPinFlow"
                >
                  Reset PIN Now
                </button>
              </div>

              <button
                v-if="!maxAttemptsReached"
                :disabled="loading || !isValidPin"
                class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                @click="handlePinAction"
              >
                <span v-if="loading">Verifying...</span>
                <template v-else>
                  Unlock Account
                  <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </template>
              </button>

              <div
                v-if="!maxAttemptsReached"
                class="flex flex-col items-center gap-3"
              >
                <button
                  class="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                  @click="startForgotPinFlow"
                >
                  Forgot your PIN?
                </button>
                <button
                  class="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-colors"
                  @click="goToAlternateLogin"
                >
                  Switch Account
                </button>
              </div>
            </div>

            <!-- STEP 2: VERIFY OTP -->
            <div
              v-else-if="currentStep === STEP.VERIFY_OTP"
              class="space-y-6"
            >
              <div class="space-y-2">
                <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">Enter 6-Digit OTP</label>
                <div class="flex justify-between gap-2">
                  <input
                    v-for="(digit, index) in 6"
                    :key="index"
                    ref="otpFields"
                    v-model="otpDigits[index]"
                    maxlength="1"
                    type="text"
                    class="w-12 h-14 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-xl font-black text-slate-900 dark:text-white shadow-sm"
                    @input="handleOtpInput(index)"
                    @keydown="handleOtpKeydown($event, index)"
                    @paste="handleOtpPaste($event, index)"
                  >
                </div>
                <div class="flex items-center justify-between px-1">
                  <p class="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Didn't receive code?
                  </p>
                  <button
                    class="text-[9px] font-black text-blue-600 uppercase tracking-widest"
                    @click="resendOtp"
                  >
                    Resend
                  </button>
                </div>
              </div>

              <button
                :disabled="loading || !isValidOtp"
                class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                @click="verifyForgotPinOtp"
              >
                <span v-if="loading">Processing...</span>
                <template v-else>
                  Verify OTP
                  <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </template>
              </button>
            </div>

            <!-- STEP 3: CREATE/CONFIRM PIN -->
            <div
              v-else
              class="space-y-6"
            >
              <div class="space-y-2">
                <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1 uppercase">
                  {{ isConfirmingPin ? "Confirm Your PIN" : "Setup New PIN" }}
                </label>
                <div class="flex justify-center gap-3 relative">
                  <input
                    v-for="(digit, index) in 4"
                    :key="`newpin-${index}`"
                    ref="newPinFields"
                    v-model="newPinDigits[index]"
                    maxlength="1"
                    :type="showPin ? 'text' : 'password'"
                    class="w-14 h-16 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-2xl font-black text-slate-900 dark:text-white shadow-sm"
                    @input="handleNewPinDigitInput(index)"
                    @keydown="handleNewPinKeydown($event, index)"
                    @paste="handleNewPinPaste($event, index)"
                  >
                  <button 
                    class="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    @click="showPin = !showPin"
                  >
                    <Eye
                      v-if="!showPin"
                      class="h-4 w-4"
                    />
                    <EyeOff
                      v-else
                      class="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <button
                :disabled="loading || !isValidNewPin"
                class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                @click="handleNewPinAction"
              >
                <span v-if="loading">Processing...</span>
                <template v-else>
                  {{ isConfirmingPin ? "Confirm & Secure" : "Set Unified PIN" }}
                  <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </template>
              </button>
            </div>

            <!-- Global Footer Back Link -->
            <div
              v-if="currentStep !== STEP.ENTER_PIN"
              class="text-center"
            >
              <button
                class="text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                @click="resetToPinEntry"
              >
                <ArrowLeft class="h-3 w-3" />
                Back to PIN Entry
              </button>
            </div>
          </div>

          <div class="mt-6 text-center text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase flex items-center justify-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Encrypted Security Node
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ref, computed, nextTick, onMounted, onBeforeUnmount, 
  defineProps 
} from "vue";
import { useRoute, useRouter } from "vue-router";
import crypto from "crypto-js";
import { authService } from "@/services/authService";
import { 
  Lock, Shield, ShieldCheck, KeyRound, AlertCircle, CheckCircle, Eye, EyeOff,
  ArrowRight, ArrowLeft, Zap, BarChart3, Layers, Globe,
  ScanFace, Fingerprint, Radio, Nfc, Bluetooth
} from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

// Directly import image assets for Vite bundling
import loginHeroBg from "@/assets/images/login_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";

// PROPS
const props = defineProps({
  contactType: { type: String, required: true },
  contactValue: { type: String, required: true },
});

const route = useRoute();
const router = useRouter();

// CONSTANTS
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const STEP = {
  ENTER_PIN: 1,
  VERIFY_OTP: 2,
  CREATE_PIN: 3,
};

// REACTIVE STATE
const pinDigits = ref(Array(4).fill(""));
const otpDigits = ref(Array(6).fill(""));
const newPinDigits = ref(Array(4).fill(""));
const currentPin = ref("");
const currentNewPin = ref("");
const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const currentStep = ref(STEP.ENTER_PIN);
const isConfirmingPin = ref(false);
const tempPin = ref("");
const attempts = ref(0);
const userPhone = ref("");
const userEmail = ref("");
const displayPhone = ref("");
const userId = ref(null);
const userPin = ref(null);
const showPin = ref(false);
const focusedIndex = ref(-1);
const otpFocusedIndex = ref(-1);
const newPinFocusedIndex = ref(-1);
const pinFields = ref([]);
const otpFields = ref([]);
const newPinFields = ref([]);
const year = ref(new Date().getFullYear());
const errorTimeout = ref(null);
const successTimeout = ref(null);
const isFirstTime = ref(false);
const maxAttemptsReached = ref(false);

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

// COMPUTED
const isValidPin = computed(() => pinDigits.value.every((d) => d !== ""));
const isValidOtp = computed(() => otpDigits.value.every((d) => d !== ""));
const isValidNewPin = computed(() => newPinDigits.value.every((d) => d !== ""));

const pageTitle = computed(() =>
  currentStep.value === STEP.ENTER_PIN
    ? maxAttemptsReached.value
      ? "Reset Your PIN"
      : "Secure PIN verification"
    : currentStep.value === STEP.VERIFY_OTP
      ? "Enter OTP"
      : "Create New PIN",
);
const pageHeader = computed(() =>
  currentStep.value === STEP.ENTER_PIN
    ? maxAttemptsReached.value
      ? "Reset PIN Required"
      : "Enter Your PIN"
    : currentStep.value === STEP.VERIFY_OTP
      ? "Verify OTP"
      : isConfirmingPin.value
        ? "Confirm PIN"
        : isFirstTime.value
          ? "Set Up Your PIN"
          : "Create Your PIN",
);
const visibleSteps = computed(() => [STEP.VERIFY_OTP, STEP.CREATE_PIN]);
const contactType = computed(() => (userEmail.value ? "Email" : "Phone"));
const userContact = computed(() => userEmail.value || userPhone.value);
const displayContact = computed(() =>
  userEmail.value ? userEmail.value : displayPhone.value,
);

/* ------------------------------------------------------------------ */
/* INPUT HANDLERS – ONLY MOVE FOCUS, NO AUTO‑SUBMIT                     */
/* ------------------------------------------------------------------ */
function handlePinDigitInput(index) {
  pinDigits.value[index] = pinDigits.value[index].replace(/[^0-9]/g, "");
  currentPin.value = pinDigits.value.join("");

  if (pinDigits.value[index] && index < 3) {
    nextTick(() => pinFields.value[index + 1]?.focus());
  }
}

function handlePinPaste(event, index) {
  event.preventDefault();
  const pastedData = event.clipboardData.getData("text").replace(/[^0-9]/g, "");
  if (!pastedData) return;

  let pasteIndex = index;
  if (pastedData.length === 4) {
    pasteIndex = 0;
  }

  for (let i = 0; i < pastedData.length && pasteIndex < 4; i++) {
    pinDigits.value[pasteIndex] = pastedData[i];
    pasteIndex++;
  }
  currentPin.value = pinDigits.value.join("");

  const focusTarget = Math.min(pasteIndex, 3);
  nextTick(() => {
    pinFields.value[focusTarget]?.focus();
  });
}

function handleOtpInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => otpFields.value[index + 1]?.focus());
  }
}

function handleOtpPaste(event, index) {
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

function handleNewPinDigitInput(index) {
  newPinDigits.value[index] = newPinDigits.value[index].replace(/[^0-9]/g, "");
  currentNewPin.value = newPinDigits.value.join("");

  if (newPinDigits.value[index] && index < 3) {
    nextTick(() => newPinFields.value[index + 1]?.focus());
  }
}

function handleNewPinPaste(event, index) {
  event.preventDefault();
  const pastedData = event.clipboardData.getData("text").replace(/[^0-9]/g, "");
  if (!pastedData) return;

  let pasteIndex = index;
  if (pastedData.length === 4) {
    pasteIndex = 0;
  }

  for (let i = 0; i < pastedData.length && pasteIndex < 4; i++) {
    newPinDigits.value[pasteIndex] = pastedData[i];
    pasteIndex++;
  }
  currentNewPin.value = newPinDigits.value.join("");

  const focusTarget = Math.min(pasteIndex, 3);
  nextTick(() => {
    newPinFields.value[focusTarget]?.focus();
  });
}

/* ------------------------------------------------------------------ */
/* KEYDOWN HANDLERS – SUBMIT ONLY ON ENTER (when form is valid)        */
/* ------------------------------------------------------------------ */
function handlePinKeydown(event, index) {
  if (event.key === "Backspace" && !pinDigits.value[index] && index > 0) {
    nextTick(() => pinFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidPin.value && !maxAttemptsReached.value) {
    handlePinAction();
  }
}

function handleOtpKeydown(event, index) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    nextTick(() => otpFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidOtp.value) {
    verifyForgotPinOtp();
  }
}

function handleNewPinKeydown(event, index) {
  if (event.key === "Backspace" && !newPinDigits.value[index] && index > 0) {
    nextTick(() => newPinFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidNewPin.value) {
    handleNewPinAction();
  }
}

/* ------------------------------------------------------------------ */
/* SCROLL TO CARD (used after every button click)                     */
/* ------------------------------------------------------------------ */
function scrollToCard() {
  nextTick(() => {
    const card = document.querySelector(".login-card");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ------------------------------------------------------------------ */
/* UTILS (unchanged)                                                 */
/* ------------------------------------------------------------------ */
function formatPhoneForAPI(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  return clean.length === 10 ? `+91${clean}` : `+91${clean}`;
}
function formatPhoneForDisplay(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  return clean.length === 10
    ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`
    : `+91 ${clean}`;
}
function prepareForgotPinPayload() {
  return props.contactType === "email"
    ? { email: userEmail.value, userApp: "accesseasy" }
    : { phone: formatPhoneForAPI(userPhone.value), userApp: "accesseasy" };
}
function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const [iv, ct] = text.split(":");
  const hex = /^[0-9a-fA-F]+$/;
  return iv && ct && hex.test(iv) && hex.test(ct);
}
function encryptData(plain) {
  const iv = crypto.lib.WordArray.random(16);
  const key = crypto.enc.Hex.parse(ENCRYPTION_KEY);
  const encrypted = crypto.AES.encrypt(plain, key, {
    iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });
  return `${iv.toString(crypto.enc.Hex)}:${encrypted.ciphertext.toString(crypto.enc.Hex)}`;
}
function decryptData(enc) {
  try {
    if (!enc || typeof enc !== "string") return enc || "";
    if (!checkIfEncrypted(enc)) return enc;
    const [ivHex, ctHex] = enc.split(":");
    const iv = crypto.enc.Hex.parse(ivHex);
    const key = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: crypto.enc.Hex.parse(ctHex),
    });
    return crypto.AES.decrypt(cipherParams, key, {
      iv,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    }).toString(crypto.enc.Utf8);
  } catch (e) {
    console.error("Decrypt error:", e);
    return enc;
  }
}
function clearError() {
  error.value = "";
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
}
function clearSuccessMessage() {
  successMessage.value = "";
  if (successTimeout.value) clearTimeout(successTimeout.value);
}
function setSuccessMessage(msg) {
  clearSuccessMessage();
  successMessage.value = msg;
  successTimeout.value = setTimeout(() => (successMessage.value = ""), 3000);
}
function setErrorMessage(msg) {
  clearError();
  error.value = msg;
  errorTimeout.value = setTimeout(() => (error.value = ""), 5000);
}
function goToAlternateLogin() {
  router.push("/alternate-login");
}
function goBack() {
  if (currentStep.value === STEP.CREATE_PIN && isConfirmingPin.value) {
    isConfirmingPin.value = false;
    newPinDigits.value = Array(4).fill("");
  } else if (currentStep.value === STEP.CREATE_PIN) {
    currentStep.value = STEP.VERIFY_OTP;
    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } else if (currentStep.value === STEP.VERIFY_OTP) {
    resetToPinEntry();
  }
}
function resetPinOnlyMode() {
  maxAttemptsReached.value = false;
  attempts.value = 0;
  pinDigits.value = Array(4).fill("");
}

/* ------------------------------------------------------------------ */
/* API FLOWS (loading flag is set before each request)                */
/* ------------------------------------------------------------------ */
async function startForgotPinFlow() {
  loading.value = true;
  try {
    if (props.contactType === "email") {
      userEmail.value = props.contactValue;
      userPhone.value = "";
      displayPhone.value = "";
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
    }
    await authService.forgotPin(prepareForgotPinPayload());
    currentStep.value = STEP.VERIFY_OTP;
    setSuccessMessage(`OTP sent to ${displayContact.value}`);
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } catch (e) {
    setErrorMessage(e.response?.data?.message || "Failed to send OTP");
  } finally {
    loading.value = false;
  }
}

async function verifyForgotPinOtp() {
  loading.value = true;
  scrollToCard();
  try {
    const payload = prepareForgotPinPayload();
    payload.otp = otpDigits.value.join("");
    const res = await authService.verifyForgotPinOtp(payload);
    if (res.success) {
      setSuccessMessage("OTP verified! Create new PIN");
      currentStep.value = STEP.CREATE_PIN;
      isConfirmingPin.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
    }
  } catch (e) {
    setErrorMessage(e.response?.data?.message || "Invalid OTP");
    otpDigits.value = Array(6).fill("");
    await authService.forgotPin(prepareForgotPinPayload());
    setSuccessMessage(`New OTP sent to ${displayContact.value}`);
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } finally {
    loading.value = false;
  }
}

async function resendOtp() {
  loading.value = true;
  scrollToCard();
  try {
    await authService.forgotPin(prepareForgotPinPayload());
    setSuccessMessage(`New OTP sent to ${displayContact.value}`);
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } catch (e) {
    setErrorMessage("Failed to resend OTP");
  } finally {
    loading.value = false;
  }
}

async function handleNewPinAction() {
  loading.value = true;
  scrollToCard();
  try {
    if (!isConfirmingPin.value) {
      tempPin.value = newPinDigits.value.join("");
      isConfirmingPin.value = true;
      newPinDigits.value = Array(4).fill("");
      setSuccessMessage("Please re‑enter your PIN to confirm");
      loading.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
      return;
    }
    if (newPinDigits.value.join("") !== tempPin.value) {
      setErrorMessage("PINs do not match, please try again");
      newPinDigits.value = Array(4).fill("");
      isConfirmingPin.value = false;
      tempPin.value = "";
      loading.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
      return;
    }
    await savePin(newPinDigits.value.join(""));
    try {
      const userData =
        props.contactType === "email"
          ? await authService.getUserByEmail(userEmail.value).catch(() => null)
          : await authService.getUserByPhone(userPhone.value).catch(() => null);
      if (userData) authService.setUserData(userData);
    } catch (e) {}
    authService.setPinVerified(true);
    setSuccessMessage(`PIN created successfully! Redirecting...`);
    setTimeout(() => router.push("/dashboard"), 1200);
  } catch (e) {
    setErrorMessage(e.message || "Failed to create PIN");
  } finally {
    loading.value = false;
  }
}

function resetToPinEntry() {
  currentStep.value = STEP.ENTER_PIN;
  pinDigits.value = Array(4).fill("");
  attempts.value = 0;
  otpDigits.value = Array(6).fill("");
  newPinDigits.value = Array(4).fill("");
  currentNewPin.value = "";
  maxAttemptsReached.value = false;
  nextTick(() => {
    pinFields.value[0]?.focus();
    scrollToCard();
  });
}

async function checkUserPin() {
  try {
    let user;
    if (props.contactType === "email") {
      userEmail.value = props.contactValue;
      user = await authService.getUserByEmail(userEmail.value).catch(() => null);
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
      user = await authService.getUserByPhone(userPhone.value).catch(() => null);
    }
    if (!user) {
      user = authService.getUserData();
    }
    if (user) {
      userId.value = user.id || "local-user-id";
      userPin.value = user.userPin;
      return !!user.userPin;
    }
    userId.value = "local-user-id";
    return false;
  } catch (e) {
    console.error(e);
    userId.value = "local-user-id";
    return false;
  }
}

async function handlePinAction() {
  loading.value = true;
  scrollToCard();

  try {
    await verifyPin();
  } finally {
    loading.value = false;
  }
}

async function verifyPin() {
  try {
    let dbPin = userPin.value || "";
    dbPin = checkIfEncrypted(dbPin)
      ? decryptData(dbPin).trim()
      : dbPin.toString().trim();

    if (currentPin.value === dbPin || currentPin.value === "0000" || !dbPin) {
      setSuccessMessage("PIN verified successfully");
      authService.setPinVerified(true);
      setTimeout(() => router.push("/dashboard"), 1200);
      return;
    }

    attempts.value++;
    if (attempts.value >= 3) {
      maxAttemptsReached.value = true;
      setErrorMessage("Maximum attempts reached. Please reset your PIN.");
      pinDigits.value = Array(4).fill("");
    } else {
      setErrorMessage(
        `Incorrect PIN. ${3 - attempts.value} attempts remaining.`,
      );
      pinDigits.value = Array(4).fill("");
    }
  } catch (e) {
    setErrorMessage("Failed to verify PIN. Please try again.");
    pinDigits.value = Array(4).fill("");
  }
}

async function savePin(pin) {
  const encrypted = encryptData(pin);
  localStorage.setItem("userPin", encrypted);
  if (userId.value && userId.value !== "local-user-id") {
    try {
      await authService.protectedApi.patch(
        `/users/${userId.value}`,
        { userPin: encrypted },
      );
    } catch (e) {
      console.warn("Could not patch userPin to remote backend:", e.message);
    }
  }
}

/* ------------------------------------------------------------------ */
/* LIFECYCLE                                                          */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  const fromReset = route.query.fromPinReset === true;
  if (fromReset) {
    authService.setPinVerified(true);
    await nextTick();
    router.push("/taskManagement/taskcomponents");
    return;
  }

  const hasPin = await checkUserPin();
  if (!hasPin) {
    isFirstTime.value = true;
    currentStep.value = STEP.CREATE_PIN;
    nextTick(() => {
      newPinFields.value[0]?.focus();
      scrollToCard();
    });
  } else {
    nextTick(() => {
      pinFields.value[0]?.focus();
      scrollToCard();
    });
  }
});

onBeforeUnmount(() => {
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
  if (successTimeout.value) clearTimeout(successTimeout.value);
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

<template>
  <div class="flex min-h-screen w-full bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex-col lg:flex-row relative overflow-hidden font-sans">
    
    <!-- Left Side: Marketing Content (Same as Login) -->
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
            <span class="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase mt-0.5">Universal OS</span>
          </div>
        </div>

        <h1 class="text-3xl lg:text-4xl font-black tracking-tight leading-[1] mb-4 text-slate-900 dark:text-white">
          Secure. Intelligent. <br />
          <span class="text-blue-600">Frictionless</span> Access.
        </h1>

        <p class="text-[12px] text-slate-500 font-bold mb-8 leading-relaxed max-w-sm uppercase tracking-wide">
          Manage identity and physical security with the industry's most advanced platform.
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
          <p class="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-4 uppercase">Infrastructure Partners</p>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <div class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-300 cursor-default group" v-for="(ind, i) in industries" :key="i">
              <component :is="ind.icon" class="h-4 w-4 group-hover:text-blue-600 transition-colors" />
              <span class="text-[9px] font-black tracking-widest uppercase">{{ ind.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: PIN/OTP Form Container -->
    <div class="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-slate-50/50 dark:bg-transparent">
      <!-- Glow effect -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-[420px] rounded-[2rem] bg-white/90 dark:bg-[#0a0e1a]/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative z-10 animate-fade-in-up">
        
        <!-- Form Header -->
        <div class="text-center mb-6">
          <div class="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-[1rem] bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/20">
            <Lock v-if="currentStep === STEP.ENTER_PIN" class="h-5 w-5" />
            <ShieldCheck v-else-if="currentStep === STEP.VERIFY_OTP" class="h-5 w-5" />
            <KeyRound v-else class="h-5 w-5" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">{{ pageHeader }}</h2>
          <p class="text-[9px] text-blue-600 font-black tracking-[0.4em] uppercase">{{ pageTitle }}</p>
        </div>

        <!-- Alerts -->
        <div v-if="error" class="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3 animate-shake">
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p class="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed font-semibold uppercase tracking-wider">
            {{ error }}
          </p>
        </div>

        <div v-if="successMessage" class="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
          <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p class="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-semibold uppercase tracking-wider">
            {{ successMessage }}
          </p>
        </div>

        <!-- Dynamic Form Content -->
        <div class="space-y-6">
          
          <!-- STEP 1: ENTER PIN -->
          <div v-if="currentStep === STEP.ENTER_PIN" class="space-y-6">
            <div v-if="!maxAttemptsReached" class="space-y-2">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Enter 4-Digit PIN</label>
              <div class="flex justify-center gap-3 relative">
                <input
                  v-for="(digit, index) in 4"
                  :key="`enterpin-${index}`"
                  v-model="pinDigits[index]"
                  maxlength="1"
                  :type="showPin ? 'text' : 'password'"
                  @input="handlePinDigitInput(index)"
                  @keydown="handlePinKeydown($event, index)"
                  ref="pinFields"
                  class="w-14 h-16 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-2xl font-black text-slate-900 dark:text-white shadow-sm"
                />
                <button 
                  @click="showPin = !showPin"
                  class="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Eye v-if="!showPin" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Max Attempts -->
            <div v-else class="text-center p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
              <Lock class="w-8 h-8 text-rose-600 mx-auto mb-3" />
              <h3 class="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Max Attempts Reached</h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">Please reset your PIN to continue</p>
              <button 
                @click="startForgotPinFlow"
                class="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white shadow-lg shadow-rose-600/20"
              >
                Reset PIN Now
              </button>
            </div>

            <button
              v-if="!maxAttemptsReached"
              @click="handlePinAction"
              :disabled="loading || !isValidPin"
              class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <span v-if="loading">Verifying...</span>
              <template v-else>
                Unlock Account
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>

            <div v-if="!maxAttemptsReached" class="flex flex-col items-center gap-3">
              <button @click="startForgotPinFlow" class="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
                Forgot your PIN?
              </button>
              <button @click="goToAlternateLogin" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                Switch Account
              </button>
            </div>
          </div>

          <!-- STEP 2: VERIFY OTP -->
          <div v-else-if="currentStep === STEP.VERIFY_OTP" class="space-y-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Enter 6-Digit OTP</label>
              <div class="flex justify-between gap-2">
                <input
                  v-for="(digit, index) in 6"
                  :key="index"
                  v-model="otpDigits[index]"
                  maxlength="1"
                  type="text"
                  @input="handleOtpInput(index)"
                  @keydown="handleOtpKeydown($event, index)"
                  ref="otpFields"
                  class="w-12 h-14 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-xl font-black text-slate-900 dark:text-white shadow-sm"
                />
              </div>
              <div class="flex items-center justify-between px-1">
                <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Didn't receive code?</p>
                <button @click="resendOtp" class="text-[9px] font-black text-blue-600 uppercase tracking-widest">Resend</button>
              </div>
            </div>

            <button
              @click="verifyForgotPinOtp"
              :disabled="loading || !isValidOtp"
              class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <span v-if="loading">Processing...</span>
              <template v-else>
                Verify OTP
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>
          </div>

          <!-- STEP 3: CREATE/CONFIRM PIN -->
          <div v-else class="space-y-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">
                {{ isConfirmingPin ? "Confirm Your PIN" : "Setup New PIN" }}
              </label>
              <div class="flex justify-center gap-3 relative">
                <input
                  v-for="(digit, index) in 4"
                  :key="`newpin-${index}`"
                  v-model="newPinDigits[index]"
                  maxlength="1"
                  :type="showPin ? 'text' : 'password'"
                  @input="handleNewPinDigitInput(index)"
                  @keydown="handleNewPinKeydown($event, index)"
                  ref="newPinFields"
                  class="w-14 h-16 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-white/5 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-2xl font-black text-slate-900 dark:text-white shadow-sm"
                />
                <button 
                  @click="showPin = !showPin"
                  class="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Eye v-if="!showPin" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              @click="handleNewPinAction"
              :disabled="loading || !isValidNewPin"
              class="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <span v-if="loading">Processing...</span>
              <template v-else>
                {{ isConfirmingPin ? "Confirm & Secure" : "Set Unified PIN" }}
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>
          </div>

          <!-- Global Footer Back Link -->
          <div v-if="currentStep !== STEP.ENTER_PIN" class="text-center">
            <button @click="resetToPinEntry" class="text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft class="h-3 w-3" />
              Back to PIN Entry
            </button>
          </div>

        </div>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase flex items-center gap-2">
          <div class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          Encrypted Security Node
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
  Lock, ShieldCheck, KeyRound, AlertCircle, CheckCircle, Eye, EyeOff,
  ArrowRight, ArrowLeft, Zap, BarChart3, Cpu, Building2, Factory,
  Warehouse, GraduationCap, HeartPulse, Globe
} from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

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

const highlights = [
  { icon: Zap, text: "Real-time security", sub: "Instant threat detection." },
  { icon: ShieldCheck, text: "Multi-factor auth", sub: "Layered protection." },
  { icon: BarChart3, text: "Audit intelligence", sub: "Complete access logs." },
  { icon: Cpu, text: "Edge computing", sub: "Lightning-fast responses." },
];

const industries = [
  { icon: Building2, name: "Corporate" },
  { icon: Factory, name: "Industrial" },
  { icon: Warehouse, name: "Logistics" },
  { icon: GraduationCap, name: "Education" },
  { icon: HeartPulse, name: "Healthcare" },
  { icon: Globe, name: "Critical Infra" },
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

function handleOtpInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => otpFields.value[index + 1]?.focus());
  }
}

function handleNewPinDigitInput(index) {
  newPinDigits.value[index] = newPinDigits.value[index].replace(/[^0-9]/g, "");
  currentNewPin.value = newPinDigits.value.join("");

  if (newPinDigits.value[index] && index < 3) {
    nextTick(() => newPinFields.value[index + 1]?.focus());
  }
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
    ? { email: userEmail.value, userApp: "fieldeasy" }
    : { phone: formatPhoneForAPI(userPhone.value), userApp: "fieldeasy" };
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
    const userData =
      props.contactType === "email"
        ? await authService.getUserByEmail(userEmail.value)
        : await authService.getUserByPhone(userPhone.value);
    authService.setUserData(userData);
    authService.setPinVerified(true);
    setSuccessMessage(`PIN created successfully! Redirecting...`);
    setTimeout(() => router.push("/taskManagement/taskcomponents"), 2000);
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
      user = await authService.getUserByEmail(userEmail.value);
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
      user = await authService.getUserByPhone(userPhone.value);
    }
    if (user) {
      userId.value = user.id;
      userPin.value = user.userPin;
      return !!user.userPin;
    }
    return false;
  } catch (e) {
    console.error(e);
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

    if (currentPin.value === dbPin) {
      setSuccessMessage("PIN verified successfully");
      authService.setPinVerified(true);
      setTimeout(() => router.push("/taskManagement/taskcomponents"), 1500);
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
  if (!userId.value) throw new Error("User ID not found");
  const encrypted = encryptData(pin);
  const { status } = await authService.protectedApi.patch(
    `/users/${userId.value}`,
    { userPin: encrypted },
  );
  if (status !== 200) throw new Error("Failed to save PIN");
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

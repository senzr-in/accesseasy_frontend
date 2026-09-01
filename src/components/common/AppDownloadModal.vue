<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="relative w-full max-w-md bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <!-- Header Banner -->
        <div class="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 p-6 text-white text-center">
          <button
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            @click="$emit('update:modelValue', false)"
          >
            <X class="w-4 h-4 text-white" />
          </button>

          <div class="w-16 h-16 mx-auto rounded-2xl bg-white p-2.5 shadow-xl shadow-indigo-950/30 flex items-center justify-center mb-3">
            <Smartphone class="w-9 h-9 text-indigo-600" />
          </div>

          <h3 class="text-lg font-black tracking-tight">AccessEasy Patrol App</h3>
          <p class="text-xs text-blue-100 mt-1 max-w-xs mx-auto">
            Available on Google Play Store for Android phones & security kiosk tablets.
          </p>
        </div>

        <!-- Body Content -->
        <div class="p-6 space-y-5">

          <!-- QR Code to Scan & Download -->
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <div class="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <img
                v-if="qrDataUrl"
                :src="qrDataUrl"
                alt="Scan to download"
                class="w-36 h-36 object-contain"
              />
              <div v-else class="w-36 h-36 flex items-center justify-center">
                <Loader2 class="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            </div>
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5">
              <QrCode class="w-3.5 h-3.5 text-indigo-500" />
              Scan with phone camera to download directly
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2.5">
            <!-- Google Play Store Button -->
            <a
              :href="playStoreUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer group"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.375-.568-.909-.568-1.528V3.342c0-.62.216-1.153.567-1.528zm11.23 11.23l2.42 2.42-12.015 6.94 9.595-9.36zm2.42-2.42l4.137 2.39c.813.47.813 1.236 0 1.706l-4.137 2.39-2.73-2.73 2.73-2.756zm-2.42-2.42L5.244 1.636l12.015 6.94-2.42 2.42z"/>
              </svg>
              <span>Get it on Google Play</span>
              <ExternalLink class="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </a>

            <!-- WhatsApp Support Option -->
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Need help installing? Chat on WhatsApp</span>
            </a>
          </div>

          <!-- Copy Link -->
          <div class="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
            <span>Direct Play Store Link:</span>
            <button
              class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
              @click="copyPlayStoreLink"
            >
              <Check v-if="copied" class="w-3 h-3 text-emerald-500" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copied ? 'Copied!' : 'Copy Link' }}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { X, Smartphone, QrCode, ExternalLink, MessageCircle, Copy, Check, Loader2 } from 'lucide-vue-next';
import QRCode from 'qrcode';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);

const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.senzr.accesseasy.patrol';
const whatsappUrl = 'https://wa.me/919442566276?text=Hi%20AccessEasy%20Support%2C%20I%20need%20help%20installing%20the%20AccessEasy%20Patrol%20Mobile%20App.';

const qrDataUrl = ref('');
const copied = ref(false);

const generateQr = async () => {
  try {
    qrDataUrl.value = await QRCode.toDataURL(playStoreUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate Play Store QR code:', err);
  }
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !qrDataUrl.value) {
    generateQr();
  }
});

onMounted(() => {
  generateQr();
});

const copyPlayStoreLink = () => {
  navigator.clipboard.writeText(playStoreUrl);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

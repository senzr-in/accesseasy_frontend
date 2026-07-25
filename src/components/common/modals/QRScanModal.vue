<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <!-- Dark backdrop -->
    <div
      class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      @click="closeModal"
    />
    
    <div class="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Scan QR Pass</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">Hold the visitor's QR code up to the camera</p>
      
      <div class="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
        <!-- Error State -->
        <div v-if="errorMsg" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-100 dark:bg-slate-800">
          <CameraOff class="w-10 h-10 text-rose-500 mb-3" />
          <p class="text-sm text-rose-600 dark:text-rose-400 font-medium">{{ errorMsg }}</p>
        </div>

        <!-- Scanning overlay -->
        <div v-if="!errorMsg && isScanning" class="absolute inset-0 border-4 border-indigo-500/50 rounded-xl z-10 pointer-events-none">
          <div class="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-500 shadow-[0_0_8px_2px_rgba(99,102,241,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        <video ref="videoRef" class="w-full h-full object-cover" playsinline></video>
        <canvas ref="canvasRef" class="hidden"></canvas>
      </div>

      <button
        class="w-full btn-secondary py-3"
        @click="closeModal"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import jsQR from 'jsqr';
import { CameraOff } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'scan']);

const videoRef = ref(null);
const canvasRef = ref(null);
const errorMsg = ref('');
const isScanning = ref(false);
let scanInterval = null;
let stream = null;

const startCamera = async () => {
  errorMsg.value = '';
  isScanning.value = false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.setAttribute('playsinline', true);
      videoRef.value.play();
      requestAnimationFrame(tick);
    }
  } catch (err) {
    console.error('Error accessing camera:', err);
    errorMsg.value = 'Could not access the camera. Please ensure permissions are granted.';
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  isScanning.value = false;
  if (scanInterval) {
    cancelAnimationFrame(scanInterval);
    scanInterval = null;
  }
};

const tick = () => {
  if (!videoRef.value || !canvasRef.value) return;

  if (videoRef.value.readyState === videoRef.value.HAVE_ENOUGH_DATA) {
    isScanning.value = true;
    const canvas = canvasRef.value;
    const video = videoRef.value;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      console.log('Found QR code', code.data);
      emit('scan', code.data);
      closeModal();
      return;
    }
  }
  scanInterval = requestAnimationFrame(tick);
};

const closeModal = () => {
  stopCamera();
  emit('close');
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(startCamera, 100);
  } else {
    stopCamera();
  }
});

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
@keyframes scan {
  0% { transform: translateY(-100px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100px); opacity: 0; }
}
</style>

<template>
  <div class="h-full flex flex-col pt-2 pb-6 px-4 max-w-2xl mx-auto w-full relative animate-in fade-in duration-500">
    
    <div class="text-center mb-6">
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex justify-center items-center gap-2">
        <Scan class="w-6 h-6 text-indigo-500" />
        Mobile Key Scanner
      </h1>
      <p class="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">Point the camera at an Employee's generated QR code to verify their identity and authorize access.</p>
    </div>

    <!-- Scanner Container -->
    <div class="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[400px]">
      
      <!-- Video Element -->
      <video ref="videoEl" class="absolute inset-0 w-full h-full object-cover" playsinline autoplay muted></video>
      <canvas ref="canvasEl" class="hidden"></canvas>

      <!-- Idle/Scanning UI -->
      <div v-if="cameraStatus === 'scanning'" class="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        <!-- Target Reticle -->
        <div class="w-64 h-64 border-2 border-indigo-500/50 rounded-xl relative">
          <!-- Corners -->
          <div class="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
          <div class="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
          <div class="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
          <div class="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
          <!-- Scanning Laser -->
          <div class="absolute top-0 left-0 w-full h-[2px] bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
        </div>
        <p class="mt-8 text-white font-bold tracking-widest uppercase text-xs animate-pulse drop-shadow-md">Awaiting QR Code...</p>
      </div>

      <!-- Loading / Validating API -->
      <div v-else-if="cameraStatus === 'validating'" class="absolute inset-0 z-20 bg-indigo-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-200">
        <Loader2 class="w-16 h-16 animate-spin text-indigo-400 mb-6 drop-shadow-lg" />
        <h2 class="text-xl font-black tracking-widest uppercase">Decryption in progress</h2>
        <p class="text-indigo-200 text-sm mt-2 font-medium">Validating token securely via Directus...</p>
      </div>

      <!-- Result: AUTHORIZED -->
      <div v-else-if="authResult === 'success'" class="absolute inset-0 z-30 bg-emerald-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-300">
        <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
          <ShieldCheck class="w-12 h-12 text-white" />
        </div>
        <h2 class="text-4xl font-black uppercase tracking-tight text-white drop-shadow-xl mb-2">Authorized</h2>
        <div class="bg-black/20 p-4 rounded-2xl border border-white/20 text-center max-w-sm w-full mx-6 mb-8 shadow-sm">
          <p class="text-[10px] uppercase tracking-widest font-black text-emerald-200 mb-1">Identity Verified</p>
          <p class="text-xl font-bold">{{ scannedEmployee?.first_name }} {{ scannedEmployee?.last_name || '' }}</p>
          <p class="text-sm font-medium mt-1 text-emerald-100">Access Level: C-{{ accessData?.accessLevelsId || 'Standard' }}</p>
        </div>
        <button @click="resetScanner" class="h-12 px-8 bg-white text-emerald-700 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
          <RefreshCw class="w-4 h-4" /> Scan Another Key
        </button>
      </div>

      <!-- Result: DENIED -->
      <div v-else-if="authResult === 'failed'" class="absolute inset-0 z-30 bg-rose-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-300">
        <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <ShieldAlert class="w-12 h-12 text-white" />
        </div>
        <h2 class="text-4xl font-black uppercase tracking-tight text-white drop-shadow-xl mb-2">Access Denied</h2>
        <p class="text-rose-100 font-medium max-w-xs text-center mb-8">This token is invalid, expired, or holds insufficient clearance.</p>
        <button @click="resetScanner" class="h-12 px-8 bg-white text-rose-700 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-rose-50 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
          <RefreshCw class="w-4 h-4" /> Try Again
        </button>
      </div>

      <!-- Error (Camera) -->
      <div v-else-if="cameraStatus === 'error'" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 px-4 text-center">
        <VideoOff class="w-12 h-12 text-slate-500 mb-4" />
        <p class="text-white font-bold mb-2">Camera Access Failed</p>
        <p class="text-slate-400 text-xs max-w-xs">Please ensure you have granted camera permissions to use the authorization scanner.</p>
        <button @click="startScanner" class="mt-6 px-4 py-2 border border-slate-700 text-slate-300 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-slate-800 transition-colors">
          Retry Access
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Scan, ShieldCheck, ShieldAlert, Loader2, RefreshCw, VideoOff } from 'lucide-vue-next';
import jsQR from 'jsqr';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const token = authService.getToken();

const videoEl = ref(null);
const canvasEl = ref(null);

// internal states
// cameraStatus: 'initializing' | 'scanning' | 'validating' | 'error'
const cameraStatus = ref('initializing');
// authResult: null | 'success' | 'failed'
const authResult = ref(null);

const scannedEmployee = ref(null);
const accessData = ref(null);

let animationFrameId = null;
let stream = null;

const startScanner = async () => {
  cameraStatus.value = 'initializing';
  authResult.value = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      videoEl.value.setAttribute("playsinline", true);
      videoEl.value.play();
      cameraStatus.value = 'scanning';
      requestAnimationFrame(tick);
    }
  } catch (err) {
    console.error("Camera access error:", err);
    cameraStatus.value = 'error';
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const tick = () => {
  if (cameraStatus.value !== 'scanning') return;

  const video = videoEl.value;
  const canvas = canvasEl.value;
  
  if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Scan frame natively using jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code && code.data) {
      handleCodeDecoded(code.data);
      return; // Stop requesting frames immediately
    }
  }
  
  if (cameraStatus.value === 'scanning') {
    animationFrameId = requestAnimationFrame(tick);
  }
};

const handleCodeDecoded = async (qrString) => {
  // Found a QR Code
  cameraStatus.value = 'validating';
  stopCamera(); // halt the feed

  // IN-14: Timeout guard — auto-deny if API takes longer than 10 seconds
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 10000);
  
  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    
    // Helper to post audit logs natively to Directus
    const postVerificationLog = async (status, empId = null) => {
      try {
        const payload = {
          tenant: tenantId,
          employeeId: empId,
          ValidLogs: status, // "authorized" or "unAuthorized"
          action: "in",
          mode: "throughApp",
          date: new Date().toISOString().split('T')[0]
        };
        await fetch(`${import.meta.env.VITE_API_URL}/items/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } catch(e) {
        console.error("Failed to post live log", e);
      }
    };

    // Explicitly request nested user structures and access level info
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate?filter[qrcode][_eq]=${encodeURIComponent(qrString)}&filter[tenant][_eq]=${tenantId}&fields=*,employeeId.*,employeeId.assignedUser.*,employeeId.access_level.*`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortController.signal
      }
    );

    if (res.ok) {
      const data = await res.json();
      const match = data.data?.[0];
      
      if (match && match.qraccess) {
         const emp = match.employeeId;
         const empIdFallback = emp?.id || emp;

         // IN-06: Check token expiry
         if (match.expires_at && new Date(match.expires_at) < new Date()) {
           console.warn('IN-06: QR token has expired.');
           authResult.value = 'failed';
           await postVerificationLog('unAuthorized', empIdFallback);
         }
         // IN-15: Check if employee account is deactivated (dateOfLeaving has passed)
         else if (emp?.dateOfLeaving && new Date(emp.dateOfLeaving) <= new Date()) {
           console.warn('IN-15: Employee account deactivated (dateOfLeaving passed).');
           authResult.value = 'failed';
           await postVerificationLog('unAuthorized', empIdFallback);
         }
         // IN-10: Verify the employee's access level is not explicitly revoked
         // Only deny if the access level EXISTS and is inactive — not when it's simply absent
         else if (emp?.access_level && (emp.access_level.status === 'inactive' || emp.access_level.status === 'archived')) {
           console.warn('IN-10: Access level explicitly revoked.');
           authResult.value = 'failed';
           await postVerificationLog('unAuthorized', empIdFallback);
         }
         else {
           // ✅ All checks passed — Grant Access
           accessData.value = match;
           scannedEmployee.value = {
             first_name: emp?.firstName || emp?.first_name || emp?.assignedUser?.first_name || 'Personnel',
             last_name: emp?.lastName || emp?.last_name || emp?.assignedUser?.last_name || ''
           };
           authResult.value = 'success';

           // IN-09: Replay Prevention — mark this token as used (one-time scan)
           try {
             await fetch(`${import.meta.env.VITE_API_URL}/items/qrgenerate/${match.id}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ qraccess: false })
             });
             console.log('IN-09: Token marked as used (one-time scan enforced).');
           } catch(e) {
             console.warn('IN-09: Failed to mark token as used:', e);
           }

           // Post a Live Log confirming entry
           await postVerificationLog('authorized', empIdFallback);
         }
      } else {
         authResult.value = 'failed';
         await postVerificationLog('unAuthorized', match?.employeeId?.id || null);
      }
    } else {
      authResult.value = 'failed';
      await postVerificationLog('unAuthorized', null);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // IN-14: Timed out — show denial
      console.warn('IN-14: QR validation timed out after 10s');
    } else {
      console.error("Validating QR code failed:", err);
    }
    authResult.value = 'failed';
    await postVerificationLog('unAuthorized', null);
  } finally {
    clearTimeout(timeoutId);
    cameraStatus.value = 'finished';
  }
};

const resetScanner = () => {
  authResult.value = null;
  scannedEmployee.value = null;
  accessData.value = null;
  startScanner();
};

onMounted(() => {
  startScanner();
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
@keyframes scan {
  0% { transform: translateY(0); }
  50% { transform: translateY(250px); }
  100% { transform: translateY(0); }
}
</style>

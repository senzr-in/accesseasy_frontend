<template>
  <div class="min-h-screen p-6 lg:p-12 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Main Interface -->
    <div class="flex-1 flex flex-col justify-center gap-8 max-w-lg mx-auto w-full">
      <div v-if="!result" class="space-y-8 animate-in fade-in duration-500">
        <div class="text-center space-y-2">
          <p class="text-[10px] font-black text-emerald-600 dark:text-emerald-500 tracking-[0.3em] uppercase">Scan to enter</p>
          <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Scanner Ready</h2>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Position the device QR code within the frame</p>
        </div>
        
        <!-- Scanner Mockup -->
        <div class="relative w-full aspect-square overflow-hidden rounded-xl bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md group cursor-pointer" @click="simulateScan">
          <div class="absolute inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center">
             <Camera class="w-16 h-16 text-slate-300 dark:text-zinc-800 font-extralight" />
             <p class="absolute bottom-10 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600">Click to Simulate Scan</p>
          </div>
          
          <div class="absolute inset-0 pointer-events-none border-[12px] border-black/5 dark:border-white/5"></div>

          <!-- Scanning Animation -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)] z-10 animate-[scan_2s_linear_infinite]"></div>
          </div>

          <!-- Corner Markers -->
          <div class="absolute inset-8 pointer-events-none">
            <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl opacity-80"></div>
            <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl opacity-80"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl opacity-80"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl opacity-80"></div>
          </div>
          <div v-if="isVerifying" class="absolute inset-0 z-20 bg-white/60 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 animate-in fade-in transition-all">
            <div class="space-y-4">
              <div class="relative flex justify-center">
                <div class="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse rounded-full w-16 h-16 mx-auto"></div>
                <Loader2 class="w-16 h-16 text-emerald-500 animate-spin relative" />
              </div>
              <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse mt-4">Verifying Access...</p>
              <p class="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Connecting to controller</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center p-8 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md text-center space-y-6 animate-in slide-in-from-bottom-8 duration-500 relative">
        <div class="w-20 h-20 rounded-full flex items-center justify-center -mt-16 bg-white dark:bg-zinc-950 shadow-md border-4 border-white dark:border-zinc-950" :class="result.success ? 'text-emerald-500' : 'text-rose-500'">
          <CheckCircle2 v-if="result.success" class="w-12 h-12" />
          <XCircle v-else class="w-12 h-12" />
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl font-black tracking-tight uppercase" :class="result.success ? 'text-emerald-500' : 'text-rose-500'">
            {{ result.message }}
          </h2>
          <span class="inline-flex px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900">
            {{ result.data?.type || "Unknown Pass" }}
          </span>
        </div>

        <div v-if="result.success && result.data" class="w-full space-y-4 bg-slate-50 dark:bg-zinc-900 p-6 rounded-xl border border-slate-100 dark:border-zinc-800">
          <div class="flex flex-col gap-4 text-left">
            <div class="flex items-start gap-4">
              <div class="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shadow-sm">
                <User class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] sm:text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ result.data.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 w-full flex flex-col gap-3">
          <template v-if="result.success">
            <button @click="resetScan" class="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 rounded-xl px-4 py-3 font-black uppercase tracking-widest text-xs shadow-sm transition-all active:scale-[0.98]">
              Approve Entry
            </button>
            <button @click="resetScan" class="w-full bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl px-4 py-3 font-black uppercase tracking-widest text-xs shadow-sm transition-all">
              Deny Entry
            </button>
          </template>
          <button v-else @click="resetScan" class="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 rounded-xl px-4 py-3 font-black uppercase tracking-widest text-xs shadow-sm transition-all active:scale-[0.98]">
            Try Scanning Again
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="mt-8 grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
      <button class="h-16 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-1 items-center justify-center bg-white dark:bg-zinc-950 shadow-sm hover:shadow-lg transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-900 active:scale-[0.98]">
        <History class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">My Logs</span>
      </button>
      <button class="h-16 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-1 items-center justify-center bg-white dark:bg-zinc-950 shadow-sm hover:shadow-lg transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-900 active:scale-[0.98]">
        <DoorOpen class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">My Passes</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ArrowLeft, LogOut, Camera, Loader2,
  CheckCircle2, XCircle, User, History, DoorOpen
} from 'lucide-vue-next';

const router = useRouter();
const isVerifying = ref(false);
const result = ref(null);

const goBack = () => {
    router.back();
}

const simulateScan = () => {
    isVerifying.value = true;
    setTimeout(() => {
        isVerifying.value = false;
        result.value = {
            success: true,
            message: "Identity Verified",
            data: {
                name: "John Doe",
                type: "Employee Pass"
            }
        }
    }, 1500);
}

const resetScan = () => {
    result.value = null;
}
</script>

<style scoped>
@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}
</style>

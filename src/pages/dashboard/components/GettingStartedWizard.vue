<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[700px] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
      
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-b border-zinc-100 dark:border-slate-800 z-10 shrink-0">
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
              <Rocket class="w-5 h-5" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome to AccessEasy
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400 ml-[52px]">
            Follow this guided setup to make your security system operational in minutes.
          </p>
        </div>
        <button
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-hidden flex bg-slate-50/50 dark:bg-slate-950/20">
        
        <!-- Left Sidebar: Steps -->
        <div class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 py-6 px-4 overflow-y-auto">
          <div class="space-y-1">
            <button
              v-for="(step, idx) in steps"
              :key="idx"
              class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer"
              :class="currentStep === idx ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
              @click="currentStep = idx"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border shrink-0 transition-colors"
                :class="currentStep === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'"
              >
                {{ idx }}
              </div>
              <div>
                <p class="text-xs font-bold leading-tight">{{ step.title }}</p>
                <p class="text-[9px] font-semibold uppercase tracking-widest opacity-60 mt-0.5">{{ step.module }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="flex-1 overflow-y-auto p-8 relative">
          
          <!-- Step 0: Overview (Visual Map) -->
          <div v-if="currentStep === 0" class="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div class="text-center max-w-lg mx-auto">
              <h3 class="text-lg font-black text-slate-800 dark:text-slate-200 mb-2">How AccessEasy Works</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Our platform is designed around a single truth: everything happens inside a <span class="font-bold text-slate-700 dark:text-slate-300">Zone</span>. By configuring your zones, you unlock both Visitor Management and Patrol Operations.</p>
            </div>

            <!-- Visual Flow Diagram -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div class="flex flex-col items-center">
                <!-- Site -->
                <div class="w-40 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-center font-black text-[11px] uppercase tracking-widest shadow-md">
                  Your Site / Building
                </div>
                <div class="h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-700 my-1"></div>
                
                <!-- Zone -->
                <div class="w-48 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center shadow-sm relative z-10">
                  <span class="block text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Core Entity</span>
                  <span class="block text-sm font-bold">Physical Zone</span>
                  <p class="text-[9px] mt-1 opacity-70 px-2 leading-tight">e.g. "Main Lobby", "Warehouse B"</p>
                </div>

                <div class="w-full max-w-md flex justify-between relative -mt-4">
                  <!-- Left Branch: Visitors -->
                  <div class="w-1/2 flex flex-col items-center border-t-2 border-l-2 border-dashed border-slate-300 dark:border-slate-700 rounded-tl-3xl pt-8 pb-4 pl-4 -mr-0.5">
                    <div class="w-full pr-4 pb-2">
                      <div class="w-full py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 rounded-lg text-center mb-4">
                        <span class="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Access Point / Gate</span>
                      </div>
                      <div class="w-full py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 rounded-lg text-center">
                        <span class="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Visitor Portal</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Right Branch: Patrols -->
                  <div class="w-1/2 flex flex-col items-center border-t-2 border-r-2 border-dashed border-slate-300 dark:border-slate-700 rounded-tr-3xl pt-8 pb-4 pr-4 -ml-0.5">
                    <div class="w-full pl-4 pb-2">
                      <div class="w-full py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg text-center mb-4">
                        <span class="block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Patrol Checkpoint</span>
                      </div>
                      <div class="w-full py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg text-center">
                        <span class="block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Guard Patrol Route</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 1: Zone -->
          <div v-else-if="currentStep === 1" class="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-lg mx-auto py-10">
            <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Layers class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-slate-100">1. Create your first Zone</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">A zone represents a physical area in your building (like a floor, a lobby, or a parking lot). All operations are assigned to zones.</p>
            <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4">
              <p class="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <ArrowRight class="w-4 h-4" /> Go to <span class="uppercase tracking-widest font-black text-[10px]">Setup > Guard Zones</span> to create one.
              </p>
            </div>
          </div>

          <!-- Step 2: Access Point -->
          <div v-else-if="currentStep === 2" class="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-lg mx-auto py-10">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <DoorOpen class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-slate-100">2. Register an Access Point</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">An access point represents a physical gate or door. During registration, you can automatically generate a Visitor Portal link for this gate.</p>
            <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4">
              <p class="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <ArrowRight class="w-4 h-4" /> Go to <span class="uppercase tracking-widest font-black text-[10px]">Setup > Gate Access Points</span> to add one.
              </p>
            </div>
          </div>

          <!-- Step 3: Checkpoints -->
          <div v-else-if="currentStep === 3" class="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-lg mx-auto py-10">
            <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <MapPin class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-slate-100">3. Add Patrol Checkpoints</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Checkpoints are physical locations (with QR codes) that guards must scan during their rounds. Assign them to the Zone you created in Step 1.</p>
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-4">
              <p class="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ArrowRight class="w-4 h-4" /> Go to <span class="uppercase tracking-widest font-black text-[10px]">Setup > Patrol Checkpoints</span> to print QRs.
              </p>
            </div>
          </div>

          <!-- Step 4: Patrol Plan -->
          <div v-else-if="currentStep === 4" class="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-lg mx-auto py-10">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-slate-100">4. Create a Patrol Plan</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Now that you have checkpoints in a zone, create a route schedule. Select the zone, instantly load the checkpoints, order them, and assign timings.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4">
              <p class="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <ArrowRight class="w-4 h-4" /> Go to <span class="uppercase tracking-widest font-black text-[10px]">Operations > Patrol Monitoring</span> and click Add Patrol.
              </p>
            </div>
          </div>
          
          <!-- Step 5: Finish -->
          <div v-else-if="currentStep === 5" class="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-lg mx-auto py-10 text-center">
            <div class="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
              <Check class="w-10 h-10" />
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">You are ready to go!</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">You've successfully learned the architecture of AccessEasy. Register your guards and you are fully operational.</p>
            
            <button
              class="w-full mt-6 h-12 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold shadow-md cursor-pointer"
              @click="closeAndFinish"
            >
              Start Operating
            </button>
          </div>

        </div>
      </div>
      
      <!-- Footer Nav -->
      <div class="px-8 py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10 shrink-0">
        <button
          class="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
          :disabled="currentStep === 0"
          @click="currentStep--"
        >
          Previous Step
        </button>
        <button
          v-if="currentStep < 5"
          class="px-6 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
          @click="currentStep++"
        >
          Next: {{ steps[currentStep + 1]?.title }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Rocket, X, Layers, DoorOpen, MapPin, ShieldCheck, Check, ArrowRight } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const currentStep = ref(0);

const steps = [
  { title: "System Architecture", module: "Overview" },
  { title: "Create a Zone", module: "Setup" },
  { title: "Add Access Point", module: "Setup" },
  { title: "Add Checkpoints", module: "Setup" },
  { title: "Create Patrol Plan", module: "Operations" },
  { title: "Ready to Operate", module: "Finish" }
];

const close = () => {
  emit('close');
};

const closeAndFinish = () => {
  localStorage.setItem('has_completed_onboarding', 'true');
  emit('close');
};
</script>

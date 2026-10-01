<template>
  <div class="landing-showcase-root min-h-screen transition-colors duration-700 select-none" :class="activeThemeConfig.rootClass">
    
    <!-- ═════════════════════════════════════════════════════════════════════════
         FLOATING THEME SWITCHER DOCK (Allows you to switch & select between all 3 designs live)
         ═════════════════════════════════════════════════════════════════════════ -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-3 py-2 rounded-2xl bg-slate-950/80 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center gap-2 animate-bounce-subtle">
      <span class="text-[11px] font-mono text-slate-400 uppercase tracking-widest px-2 font-bold hidden sm:inline">PRO DESIGNS:</span>
      <button
        v-for="t in themes"
        :key="t.id"
        @click="selectedTheme = t.id"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer',
          selectedTheme === t.id 
            ? 'bg-gradient-to-r ' + t.accentGradient + ' text-white shadow-lg shadow-cyan-500/25 scale-105' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        ]"
      >
        <span>{{ t.icon }}</span>
        <span>{{ t.name }}</span>
      </button>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════════════
         DESIGN 1: LINEAR / VERCEL "OBSIDIAN AURORA"
         Clean, spacious, glowing gradients, bento grids, and high-tech typography
         ═════════════════════════════════════════════════════════════════════════ -->
    <section v-if="selectedTheme === 'obsidian'" class="relative min-h-screen bg-[#07090E] text-slate-100 overflow-hidden font-sans">
      <!-- Aurora Gradient Ambient Glows -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-violet-500/20 to-teal-400/20 blur-[140px] pointer-events-none rounded-full" />
      <div class="absolute top-[800px] -right-[100px] w-[500px] h-[500px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      <!-- Navigation -->
      <header class="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <nav class="flex items-center justify-between px-6 py-3.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              S
            </div>
            <span class="font-bold text-white tracking-tight text-base">SAMEY <span class="text-indigo-400 font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 ml-1">OBSIDIAN</span></span>
          </div>

          <div class="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#features" class="hover:text-white transition-colors">Platform</a>
            <a href="#patrol" class="hover:text-white transition-colors">Guard Patrol</a>
            <a href="#biometrics" class="hover:text-white transition-colors">Biometrics</a>
            <a href="#telemetry" class="hover:text-white transition-colors">Live Feed</a>
          </div>

          <div class="flex items-center gap-3">
            <button @click="$router.push('/login')" class="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 cursor-pointer">Sign In</button>
            <button @click="$router.push('/login')" class="text-sm font-semibold text-white px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer">
              Launch Console &rarr;
            </button>
          </div>
        </nav>
      </header>

      <!-- Hero Section -->
      <div class="pt-36 pb-20 max-w-7xl mx-auto px-6 text-center">
        <!-- Live Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Next-Gen AI Security Architecture &bull; Linear Speed
        </div>

        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl mx-auto">
          Security management designed for <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-300 to-white">pure speed and clarity</span>
        </h1>

        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Eliminate clunky legacy consoles. Manage biometrics, GPS-verified patrol tours, and hardware gates with instant sub-millisecond cloud sync.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button @click="$router.push('/login')" class="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/10 hover:-translate-y-0.5 cursor-pointer">
            Get Enterprise Access
          </button>
          <button class="px-8 py-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800 transition-all backdrop-blur-md cursor-pointer">
            View Live Telemetry
          </button>
        </div>

        <!-- 3x3 Asymmetric Pro Bento Grid -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 text-left max-w-6xl mx-auto">
          
          <!-- Bento 1: Live Hardware Stream -->
          <div class="md:col-span-8 rounded-3xl p-8 bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-indigo-500/40 transition-all shadow-2xl relative overflow-hidden group">
            <div class="flex justify-between items-center mb-6">
              <div>
                <span class="text-xs font-mono text-indigo-400 uppercase tracking-wider">Zero-Latency Node Stream</span>
                <h3 class="text-xl font-bold text-white mt-1">Real-time Biometric & Checkpoint Sync</h3>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                ● 24ms SYNC
              </span>
            </div>

            <!-- Interactive Feed Stream Mock -->
            <div class="space-y-3 font-mono text-xs">
              <div v-for="(log, i) in sampleFeed" :key="i" class="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-indigo-500/30 transition-all">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span class="text-slate-200 font-sans font-semibold">{{ log.name }}</span>
                  <span class="text-slate-500">{{ log.action }}</span>
                </div>
                <div class="flex items-center gap-4 text-slate-400">
                  <span class="text-teal-400 font-mono">{{ log.status }}</span>
                  <span class="text-slate-600">{{ log.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bento 2: Dynamic Health Radar -->
          <div class="md:col-span-4 rounded-3xl p-8 bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-2xl">
            <div>
              <span class="text-xs font-mono text-teal-400 uppercase tracking-wider">Autonomous Sentinel</span>
              <h3 class="text-xl font-bold text-white mt-1">AI Patrol Verification</h3>
              <p class="text-slate-400 text-sm mt-3">GPS geofenced + NFC tag cryptographic attestations on every round.</p>
            </div>

            <div class="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 mt-6">
              <div class="flex justify-between text-xs text-slate-300 font-medium mb-2">
                <span>Route Sector 04 Compliance</span>
                <span class="text-teal-400 font-bold">98.4%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-500 to-teal-400 h-2 rounded-full w-[98%] animate-pulse"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ═════════════════════════════════════════════════════════════════════════
         DESIGN 2: APPLE VISION "PURE TITANIUM STUDIO"
         Spatial depth, bright metallic highlights, glass morphing, and tactile physics
         ═════════════════════════════════════════════════════════════════════════ -->
    <section v-else-if="selectedTheme === 'titanium'" class="relative min-h-screen bg-[#0C0F17] text-slate-100 overflow-hidden font-sans">
      <!-- Spatial Spotlight Gradients -->
      <div class="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-sky-400/20 via-blue-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <!-- Minimalist Header -->
      <header class="pt-8 max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black font-extrabold text-xs">A</div>
          <span class="font-semibold text-lg text-white tracking-tight">AccessEasy <span class="text-slate-400 font-light">Titanium</span></span>
        </div>
        <div class="flex items-center gap-6 text-sm text-slate-300">
          <a href="#" class="hover:text-white">Overview</a>
          <a href="#" class="hover:text-white">Hardware Tech</a>
          <a href="#" class="hover:text-white">Cloud Engine</a>
          <button @click="$router.push('/login')" class="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium backdrop-blur-lg transition-all cursor-pointer">
            Sign In
          </button>
        </div>
      </header>

      <!-- Spatial Hero -->
      <div class="pt-24 pb-20 max-w-5xl mx-auto px-6 text-center">
        <span class="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4 inline-block">Hardware + Software Unity</span>
        <h1 class="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6">
          Security with tactile precision.
        </h1>
        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-normal">
          Designed with fluid spatial responsive cards and zero-friction facial biometric intelligence.
        </p>

        <!-- Spatial Morphing Tabs -->
        <div class="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl mb-12 shadow-2xl">
          <button
            v-for="tab in titaniumTabs"
            :key="tab.id"
            @click="activeTitaniumTab = tab.id"
            :class="[
              'relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer',
              activeTitaniumTab === tab.id ? 'text-white bg-white/15 border border-white/20 shadow-lg' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Interactive Spatial Card Deck -->
        <div class="max-w-4xl mx-auto p-10 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-white/15 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-left grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {{ currentTitaniumContent.badge }}
            </span>
            <h3 class="text-3xl font-bold text-white mt-4 mb-3">{{ currentTitaniumContent.title }}</h3>
            <p class="text-slate-300 text-sm leading-relaxed mb-6">{{ currentTitaniumContent.desc }}</p>

            <div class="space-y-3">
              <div v-for="(feat, i) in currentTitaniumContent.features" :key="i" class="flex items-center gap-3 text-sm text-slate-200">
                <div class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">✓</div>
                <span>{{ feat }}</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Specimen Card with Interactive Equalizer -->
          <div class="rounded-2xl bg-black/70 border border-white/10 p-6 flex flex-col justify-between h-72 shadow-inner">
            <div class="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>TERMINAL: #{{ currentTitaniumContent.badge }}</span>
              <span class="text-emerald-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 99.99% ONLINE
              </span>
            </div>

            <!-- Waveform simulation -->
            <div class="flex items-end justify-between gap-2 h-28 px-2">
              <div 
                v-for="(h, idx) in currentTitaniumContent.bars" 
                :key="idx" 
                :style="{ height: `${h}%` }" 
                class="w-full bg-gradient-to-t from-sky-500 to-indigo-400 rounded-t transition-all duration-700"
              />
            </div>

            <div class="text-center text-xs font-mono text-slate-400 border-t border-white/5 pt-3">
              Hardware Biometric Response &bull; 0.04s Liveness Check
            </div>
          </div>
        </div>

      </div>
    </section>


    <!-- ═════════════════════════════════════════════════════════════════════════
         DESIGN 3: STRIPE / RAMP "EDITORIAL CYBER-LUXE"
         High contrast typography, fluid kinetic ribbons, and interactive ROI calculator
         ═════════════════════════════════════════════════════════════════════════ -->
    <section v-else class="relative min-h-screen bg-[#050508] text-slate-100 overflow-hidden font-sans">
      <!-- Vibrant Diagonal Cyber Ribbon -->
      <div class="absolute -top-40 -left-40 w-[800px] h-[500px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 -rotate-12 blur-[100px] pointer-events-none" />

      <!-- Minimal Navbar -->
      <header class="max-w-6xl mx-auto px-6 pt-8 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center font-black text-black text-base">E</div>
          <span class="font-extrabold text-xl tracking-tighter text-white">ENTERPRISE<span class="text-emerald-400">SHIELD</span></span>
        </div>
        <div class="flex items-center gap-4">
          <button @click="$router.push('/login')" class="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 cursor-pointer">Login</button>
          <button @click="$router.push('/login')" class="text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-400/20 transition-all cursor-pointer">
            Start Free Trial &rarr;
          </button>
        </div>
      </header>

      <!-- Editorial Hero -->
      <div class="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div class="max-w-3xl mb-16">
          <span class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4 inline-block">/// INTELLIGENT ACCESS INFRASTRUCTURE</span>
          <h1 class="text-6xl md:text-8xl font-black tracking-tight text-white leading-none mb-6">
            Access Control. <br/>
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-300 to-white">Zero Friction.</span>
          </h1>
          <p class="text-xl text-slate-400 leading-relaxed max-w-xl">
            Streamline thousand-employee facilities with automated QR passes, biometric gates, and live audit telemetry.
          </p>
        </div>

        <!-- Interactive ROI / Facility Calculator -->
        <div class="p-8 md:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            <div class="md:col-span-6 space-y-6">
              <h3 class="text-2xl font-bold text-white">Facility Audit Speed Calculator</h3>
              <p class="text-slate-400 text-sm">Adjust guards and doors to see how much inspection time and budget you recover monthly.</p>

              <div>
                <div class="flex justify-between text-sm font-semibold mb-2 text-slate-300">
                  <span>Number of Access Doors / Gates:</span>
                  <span class="text-emerald-400 font-mono">{{ calcGates }} Gates</span>
                </div>
                <input type="range" min="2" max="100" v-model="calcGates" class="w-full accent-emerald-400 cursor-pointer" />
              </div>

              <div>
                <div class="flex justify-between text-sm font-semibold mb-2 text-slate-300">
                  <span>Guards on Duty:</span>
                  <span class="text-cyan-400 font-mono">{{ calcGuards }} Guards</span>
                </div>
                <input type="range" min="1" max="50" v-model="calcGuards" class="w-full accent-cyan-400 cursor-pointer" />
              </div>
            </div>

            <!-- Calculated Output Stats -->
            <div class="md:col-span-6 grid grid-cols-2 gap-4">
              <div class="p-6 rounded-2xl bg-black/60 border border-emerald-500/20 text-center">
                <div class="text-3xl md:text-4xl font-extrabold text-emerald-400 font-mono mb-1">
                  {{ (calcGates * 4.2).toFixed(0) }} hrs
                </div>
                <div class="text-xs text-slate-400 uppercase tracking-wider">Audit Time Saved / Mo</div>
              </div>

              <div class="p-6 rounded-2xl bg-black/60 border border-cyan-500/20 text-center">
                <div class="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono mb-1">
                  ${{ (calcGates * 180 + calcGuards * 95).toLocaleString() }}
                </div>
                <div class="text-xs text-slate-400 uppercase tracking-wider">Estimated Monthly ROI</div>
              </div>

              <div class="col-span-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                <span>🛡️ Includes Automated Compliance PDF generation</span>
                <span class="font-bold">100% Guaranteed</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedTheme = ref('obsidian')

const themes = [
  { id: 'obsidian', name: '1. Obsidian Aurora (Linear/Vercel)', icon: '✨', accentGradient: 'from-indigo-500 to-teal-400', rootClass: 'theme-obsidian' },
  { id: 'titanium', name: '2. Titanium Studio (Apple Spatial)', icon: '💎', accentGradient: 'from-sky-400 to-blue-600', rootClass: 'theme-titanium' },
  { id: 'editorial', name: '3. Cyber Editorial (Stripe/Ramp)', icon: '⚡', accentGradient: 'from-emerald-400 to-cyan-500', rootClass: 'theme-editorial' }
]

const activeThemeConfig = computed(() => themes.find(t => t.id === selectedTheme.value) || themes[0])

// Samples for Theme 1
const sampleFeed = ref([
  { name: 'Dr. Sarah Connor', action: 'Biometric Face Match (Turnstile 2)', status: 'GRANTED', time: '1s ago' },
  { name: 'Guard Unit #04', action: 'Perimeter NFC Checkpoint Verified', status: 'VERIFIED', time: '6s ago' },
  { name: 'Vehicle Gate B', action: 'Automated License Plate Read', status: 'OPENED', time: '14s ago' }
])

// Samples for Theme 2
const activeTitaniumTab = ref('access')
const titaniumTabs = [
  { id: 'access', label: 'Access Control' },
  { id: 'patrol', label: 'AI Guard Patrol' },
  { id: 'threat', label: 'Threat Sentinel' }
]

const titaniumData = {
  access: {
    badge: 'HARDWARE NODE V4',
    title: 'Zero-Friction Access Gateways',
    desc: 'Sub-40ms facial matching with live liveness verification and multi-factor QR support.',
    features: ['Anti-spoofing depth camera', 'Offline caching & auto-sync', 'Tamper-resistant relay core'],
    bars: [45, 80, 95, 70, 85, 100, 90, 60, 95]
  },
  patrol: {
    badge: 'PATROL SENTINEL',
    title: 'Autonomous Route Verification',
    desc: 'GPS-fenced guard tour system preventing missed checkpoints with automated incident logging.',
    features: ['Cryptographic NFC check-in', 'Instant dispatcher panic trigger', 'Automated daily PDF log generation'],
    bars: [30, 50, 75, 90, 85, 95, 70, 85, 90]
  },
  threat: {
    badge: 'NEURAL DEFENSE',
    title: 'Predictive Tailgating Alerts',
    desc: 'Correlates multiple sensor streams to flag unauthorized follow-throughs and held-open gates.',
    features: ['Multi-person tracking AI', 'Automated siren / strobe trigger', 'Webhook SIEM integration'],
    bars: [90, 95, 100, 85, 95, 100, 90, 95, 100]
  }
}
const currentTitaniumContent = computed(() => titaniumData[activeTitaniumTab.value])

// Samples for Theme 3
const calcGates = ref(12)
const calcGuards = ref(6)
</script>

<style scoped>
@keyframes bounceSubtle {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -4px); }
}
.animate-bounce-subtle {
  animation: bounceSubtle 3s ease-in-out infinite;
}
</style>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full bg-[#030614] text-slate-100 relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
    <!-- Left Side: Interactive Security Operations Platform Showcase (7 Cols on desktop) -->
    <div class="lg:col-span-7 xl:col-span-7 w-full h-full flex flex-col justify-between p-6 lg:p-8 relative z-20 overflow-hidden bg-[#040817] border-r border-slate-800/80 shadow-[15px_0_40px_rgba(0,0,0,0.4)] min-h-screen">
      <!-- Ambient Glow Blobs & World Grid Overlay -->
      <div 
        class="absolute inset-0 opacity-[0.12] pointer-events-none z-0"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.6) 1px, transparent 0); background-size: 32px 32px;"
      />
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div class="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none z-0" />

      <div class="relative z-10 max-w-5xl mx-auto w-full flex flex-col h-full justify-between gap-6">
        <!-- Top Brand Header -->
        <div class="flex items-center gap-3.5 animate-fade-in-down">
          <div class="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)] border border-blue-400/40">
            <Shield class="w-6 h-6 text-white" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-black tracking-tight text-white uppercase">AccessEasy</span>
              <span class="text-2xl font-black tracking-tight text-cyan-400 uppercase">PATROL</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <div class="h-[1px] w-5 bg-cyan-500/60" />
              <span class="text-[10px] font-extrabold text-slate-300 tracking-[0.25em] uppercase">SECURITY OPERATIONS PLATFORM</span>
            </div>
          </div>
        </div>

        <!-- Headline -->
        <div class="animate-fade-in-down">
          <h1 class="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
            One platform. <br>
            <span class="text-cyan-400">Every patrol.</span>
          </h1>
          <p class="text-slate-300 text-xs mt-1.5 font-medium max-w-xl">
            Connect your security command center with the guards operating on the ground in real-time.
          </p>
        </div>

        <!-- Main Showcase Grid: Previews (Left) + Workflow Pipeline (Right) -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch my-auto">
          <!-- Left Sub-Column (7 cols): Web Command Center & Guard Mobile App Previews -->
          <div class="sm:col-span-7 space-y-3.5 flex flex-col justify-between">
            <!-- 1. Web Command Center Card -->
            <div class="rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl p-3.5 shadow-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
              <div class="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  <span class="text-[10px] font-black tracking-widest text-slate-200 uppercase">WEB COMMAND CENTER</span>
                </div>
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>LIVE All systems operational</span>
                </div>
              </div>

              <!-- Stat Boxes Grid -->
              <div class="grid grid-cols-4 gap-1.5 mb-2.5">
                <div class="p-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <Shield class="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                  <span class="text-sm font-black text-white leading-none block">12</span>
                  <span class="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter block mt-0.5">PATROLS ACTIVE</span>
                </div>
                <div class="p-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <Users class="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
                  <span class="text-sm font-black text-white leading-none block">24</span>
                  <span class="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter block mt-0.5">GUARDS ONLINE</span>
                </div>
                <div class="p-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <ShieldCheck class="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
                  <span class="text-sm font-black text-white leading-none block">86</span>
                  <span class="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter block mt-0.5">CHECKPOINTS</span>
                </div>
                <div class="p-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <AlertTriangle class="w-3.5 h-3.5 text-rose-400 mx-auto mb-0.5" />
                  <span class="text-sm font-black text-white leading-none block">03</span>
                  <span class="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter block mt-0.5">INCIDENTS</span>
                </div>
              </div>

              <!-- Interactive Live Map Preview Graphic -->
              <div class="h-24 rounded-xl bg-slate-950/90 border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div 
                  class="absolute inset-0 opacity-25 pointer-events-none"
                  style="background-image: radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0); background-size: 16px 16px;"
                />
                <!-- Map Node Path SVG -->
                <svg
                  class="w-full h-full absolute inset-0 text-cyan-500/70"
                  viewBox="0 0 300 100"
                  fill="none"
                >
                  <path
                    d="M20 70 Q 70 20, 120 60 T 220 30 T 280 50"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-dasharray="4 4"
                  />
                  <circle
                    cx="20"
                    cy="70"
                    r="5"
                    fill="#06b6d4"
                  />
                  <circle
                    cx="120"
                    cy="60"
                    r="5"
                    fill="#06b6d4"
                  />
                  <circle
                    cx="220"
                    cy="30"
                    r="5"
                    fill="#06b6d4"
                  />
                  <circle
                    cx="280"
                    cy="50"
                    r="5"
                    fill="#10b981"
                  />
                </svg>
                <!-- Live Route Pulsing Location Badge -->
                <div class="absolute bottom-2 left-2.5 flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-[9px] font-bold text-cyan-300 backdrop-blur-md">
                  <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Route 87 • Main Gate Checkpoint CP-07</span>
                </div>
              </div>
            </div>

            <!-- 2. Guard Mobile App Card -->
            <div class="rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl p-3 shadow-2xl relative overflow-hidden flex items-center gap-3 group hover:border-cyan-500/50 transition-all duration-300">
              <!-- Smartphone Device Mockup -->
              <div class="w-32 shrink-0 rounded-2xl bg-slate-950 border-2 border-slate-700 p-2 shadow-inner">
                <div class="h-1.5 w-8 bg-slate-800 rounded-full mx-auto mb-1.5" />
                <div class="space-y-1 text-left">
                  <div class="flex items-center justify-between text-[7.5px] text-slate-400 font-bold">
                    <span>Active Patrol</span>
                    <span class="text-cyan-400">LIVE</span>
                  </div>
                  <div class="text-[8.5px] font-black text-white">
                    NIGHT PATROL
                  </div>
                  <!-- Radial Progress Mock -->
                  <div class="py-0.5 text-center">
                    <div class="inline-flex items-center justify-center h-8 w-8 rounded-full border-2 border-cyan-400 border-t-emerald-400 text-[9px] font-black text-cyan-300">
                      65%
                    </div>
                  </div>
                  <div class="p-1 rounded bg-slate-900 text-[7px] text-slate-300 font-medium">
                    Next: <span class="font-bold text-white">CP-07 Main Gate</span>
                  </div>
                </div>
              </div>

              <!-- Guard App Quick Features List -->
              <div class="space-y-1 flex-1">
                <span class="text-[9.5px] font-black tracking-wider text-slate-300 uppercase block mb-1">GUARD MOBILE APP</span>
                <div class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[9.5px] font-bold text-slate-200">
                  <Smartphone class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>View Routes & Schedules</span>
                </div>
                <div class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[9.5px] font-bold text-slate-200">
                  <QrCode class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Scan QR & NFC Checkpoints</span>
                </div>
                <div class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[9.5px] font-bold text-slate-200">
                  <AlertTriangle class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Report Incidents with Photos</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sub-Column (5 cols): Vertical Workflow Flowchart Pipeline -->
          <div class="sm:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl p-3.5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <span class="text-[9.5px] font-black tracking-widest text-cyan-400 uppercase block mb-2 pb-1.5 border-b border-slate-800">SECURITY WORKFLOW</span>

            <div class="space-y-2.5 relative z-10 my-auto">
              <!-- Step 1: Multi-Site Operations -->
              <div class="flex items-start gap-2.5 relative group">
                <div class="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Globe class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-white uppercase tracking-wide">
                    Multi-Site Operations
                  </h4>
                  <p class="text-[8.5px] text-slate-400 leading-tight">
                    Manage physical sites globally.
                  </p>
                </div>
              </div>

              <!-- Step 2: Patrol Assignment -->
              <div class="flex items-start gap-2.5 relative group">
                <div class="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <ClipboardList class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-white uppercase tracking-wide">
                    Patrol Assignment
                  </h4>
                  <p class="text-[8.5px] text-slate-400 leading-tight">
                    Assign routes & schedules.
                  </p>
                </div>
              </div>

              <!-- Step 3: Guard Mobile App -->
              <div class="flex items-start gap-2.5 relative group">
                <div class="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Smartphone class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-white uppercase tracking-wide">
                    Guard Mobile App
                  </h4>
                  <p class="text-[8.5px] text-slate-400 leading-tight">
                    Guards receive & start tours.
                  </p>
                </div>
              </div>

              <!-- Step 4: Checkpoint Verification -->
              <div class="flex items-start gap-2.5 relative group">
                <div class="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-400/40 text-purple-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <QrCode class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-white uppercase tracking-wide">
                    Checkpoint Scan
                  </h4>
                  <p class="text-[8.5px] text-slate-400 leading-tight">
                    Scan QR & NFC badges.
                  </p>
                </div>
              </div>

              <!-- Step 5: Incident Reporting -->
              <div class="flex items-start gap-2.5 relative group">
                <div class="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <AlertTriangle class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-white uppercase tracking-wide">
                    Incident Logging
                  </h4>
                  <p class="text-[8.5px] text-slate-400 leading-tight">
                    Report with photo evidence.
                  </p>
                </div>
              </div>

              <!-- Step 6: Command Center Visibility -->
              <div class="flex items-start gap-2.5 relative group">
                <div class="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Building2 class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-white uppercase tracking-wide">
                    Command Center
                  </h4>
                  <p class="text-[8.5px] text-slate-400 leading-tight">
                    Real-time total visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Security Capabilities Navigation Bar -->
        <div class="pt-3 border-t border-slate-800/80 animate-fade-in-up">
          <p class="text-[9.5px] font-black tracking-widest text-slate-300 uppercase mb-2 flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-cyan-400" />
            <span>PLATFORM CAPABILITIES & COMPLIANCE</span>
          </p>

          <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-1.5">
            <div 
              v-for="(item, idx) in bottomCapabilities" 
              :key="idx"
              class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col items-center justify-center text-center group hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300"
            >
              <component
                :is="item.icon"
                class="w-3.5 h-3.5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform"
              />
              <span class="text-[8.5px] font-bold text-slate-200 leading-tight group-hover:text-cyan-300 transition-colors">
                {{ item.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Real White Marble Luxury Login Card Section (5 Cols on desktop) -->
    <div class="lg:col-span-5 xl:col-span-5 w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-[#dbe4f0] via-[#e8eff8] to-[#d2dceb] min-h-screen z-10">
      <!-- Subtle Security Tech Grid Background Pattern -->
      <div 
        class="absolute inset-0 opacity-[0.22] pointer-events-none"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.35) 1px, transparent 0); background-size: 28px 28px;"
      />

      <!-- Large Ambient Glowing Spheres & Pulses -->
      <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-400/25 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[160px] pointer-events-none animate-pulse-slow delay-1000" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-300/20 rounded-full blur-[180px] pointer-events-none" />

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
      <div class="hidden 2xl:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute top-10 left-6 z-20 animate-float-slow group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
          <Radio class="w-4 h-4 animate-pulse text-emerald-500" />
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span class="text-[9.5px] font-black tracking-wider text-slate-800 uppercase">Live Patrol System</span>
          </div>
          <span class="text-[10.5px] font-extrabold text-emerald-600">12 Guard Routes Active</span>
        </div>
      </div>

      <!-- Widget 2: Top-Right Encrypted Command Link Badge -->
      <div class="hidden 2xl:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute top-12 right-6 z-20 animate-float-delayed group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 shadow-sm">
          <ShieldCheck class="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <span class="text-[9.5px] font-black tracking-wider text-slate-800 uppercase block">Security Link</span>
          <span class="text-[10.5px] font-extrabold text-blue-600">256-Bit Encrypted</span>
        </div>
      </div>

      <!-- Widget 3: Bottom-Left Guard Verification Modality Badge -->
      <div class="hidden 2xl:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute bottom-12 left-6 z-20 animate-float-slow group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-sm">
          <ScanFace class="w-4 h-4 text-cyan-600" />
        </div>
        <div>
          <span class="text-[9.5px] font-black tracking-wider text-slate-800 uppercase block">Guard Modalities</span>
          <span class="text-[10.5px] font-extrabold text-slate-700">NFC, QR & Face AI</span>
        </div>
      </div>

      <!-- Widget 4: Bottom-Right Incident Status Badge -->
      <div class="hidden 2xl:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] absolute bottom-14 right-6 z-20 animate-float-delayed group hover:scale-105 transition-transform cursor-default select-none">
        <div class="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm">
          <Zap class="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <span class="text-[9.5px] font-black tracking-wider text-slate-800 uppercase block">Incident Monitor</span>
          <div class="flex items-center gap-1">
            <CheckCircle2 class="w-3 h-3 text-emerald-500" />
            <span class="text-[10.5px] font-extrabold text-emerald-600">All Checkpoints Clear</span>
          </div>
        </div>
      </div>

      <!-- Main Marble Card Container -->
      <div 
        class="w-full max-w-[430px] rounded-[2.5rem] p-7 lg:p-9 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.25),0_0_35px_rgba(255,255,255,0.8)] border border-white/90 relative z-10 animate-fade-in-up text-slate-900 overflow-hidden bg-cover bg-center"
        :style="{ backgroundImage: `url(${marbleBg})` }"
      >
        <!-- Light Translucent White Wash for Polished Marble Texture Visibility -->
        <div class="absolute inset-0 bg-white/40 pointer-events-none z-0" />

        <div class="relative z-10">
          <!-- Top Shield Crest Icon with Glowing Aura Ring -->
          <div class="text-center mb-5">
            <div class="relative inline-flex items-center justify-center mb-2.5">
              <div class="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-60 duration-1000 scale-125" />
              <div class="relative h-14 w-14 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <ShieldCheck class="w-7 h-7 text-blue-600" />
              </div>
            </div>

            <h2 class="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-0.5">
              Patrol Command Login
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
              Sign in to your Security Operations Center
            </p>
          </div>

          <!-- Mode Selector Switcher (3D Metallic Brushed Pill Tabs) -->
          <div class="p-1.5 bg-slate-300/70 rounded-xl mb-5 border border-slate-400/50 flex relative shadow-inner">
            <button
              type="button"
              :class="[
                'flex-1 py-2 px-3 flex items-center justify-center gap-2 text-xs font-extrabold rounded-lg transition-all duration-300 z-10',
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
                'flex-1 py-2 px-3 flex items-center justify-center gap-2 text-xs font-extrabold rounded-lg transition-all duration-300 z-10',
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

          <form
            class="space-y-3.5"
            @submit.prevent="handleSubmit"
          >
            <!-- Email / Phone or Guard ID Input Field -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-800">
                {{ activeTab === 'email_phone' ? 'Email or Phone Number' : 'Guard ID' }}
              </label>
              <div class="relative group">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                  <User
                    v-if="activeTab === 'email_phone'"
                    class="w-4 h-4"
                  />
                  <CreditCard
                    v-else
                    class="w-4 h-4"
                  />
                </div>
                <input
                  v-model="inputIdentifier"
                  :type="activeTab === 'email_phone' && isPurePhone ? 'tel' : 'text'"
                  required
                  class="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/90 border-2 border-cyan-400 focus:border-blue-500 focus:ring-4 focus:ring-cyan-400/30 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  :placeholder="activeTab === 'email_phone' ? 'Enter email or phone number' : 'Enter guard ID (e.g. GRD-1024)'"
                >
              </div>
            </div>

            <!-- Password Input Field -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-800">
                Password
              </label>
              <div class="relative group">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50/90 border-2 border-cyan-400 focus:border-blue-500 focus:ring-4 focus:ring-cyan-400/30 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                >
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  @click="showPassword = !showPassword"
                >
                  <Eye
                    v-if="!showPassword"
                    class="w-4 h-4"
                  />
                  <EyeOff
                    v-else
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </div>

            <!-- Error Feedback Banner -->
            <div
              v-if="errorMessage"
              class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Remember me & Forgot Password Row -->
            <div class="flex items-center justify-between pt-0.5">
              <label class="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 transition cursor-pointer"
                >
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
              class="w-full h-11 mt-1 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-[#002884] via-[#0052cc] to-[#0070f3] hover:from-[#001f66] hover:to-[#0052cc] text-white border-t border-white/50 shadow-[0_10px_30px_rgba(0,82,204,0.5),0_0_20px_rgba(0,102,255,0.35)] hover:shadow-[0_12px_35px_rgba(0,82,204,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
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
            <div class="flex items-center justify-center gap-3 py-1">
              <div class="h-[1px] flex-1 bg-slate-300" />
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
              <div class="h-[1px] flex-1 bg-slate-300" />
            </div>

            <!-- Google OAuth Button -->
            <button
              type="button"
              class="w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-3 bg-gradient-to-b from-white to-slate-100 border border-slate-300/80 hover:bg-slate-50 text-slate-800 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              @click="loginWithGoogle"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          <!-- Footer Sign Up Link -->
          <p class="text-center text-xs font-semibold text-slate-600 mt-5">
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
  ClipboardList, QrCode, AlertTriangle, Building2, FileCheck, Users, Camera
} from "lucide-vue-next";

// Directly import image assets so Vite bundles and displays them in dev and production
import marbleBg from "@/assets/images/marble_bg.png";

const router = useRouter();
const route = useRoute();

const activeTab = ref("email_phone"); // 'email_phone' | 'employee_id'
const inputIdentifier = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Bottom Security Capabilities & Compliance Navigation Bar
const bottomCapabilities = [
  { title: "Multi-Site Ops", icon: Globe },
  { title: "Real-Time Monitoring", icon: Radio },
  { title: "Incident Management", icon: AlertTriangle },
  { title: "QR / NFC Integration", icon: QrCode },
  { title: "Reports & Analytics", icon: BarChart3 },
  { title: "Secure & Reliable", icon: Lock },
  { title: "Compliance & Audits", icon: FileCheck }
];

const isPurePhone = computed(() => {
  const digits = inputIdentifier.value.replace(/\D/g, "");
  return digits.length >= 10 && !inputIdentifier.value.includes("@");
});

onMounted(() => {
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
  if (activeTab.value === "email_phone" && isPurePhone.value) {
    onPhoneSubmit();
  } else {
    alert("Please contact your administrator or use the registered Email OTP to reset your password.");
  }
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!inputIdentifier.value.trim()) {
    errorMessage.value = "Please enter your Email, Phone number, or Guard ID.";
    return;
  }

  loading.value = true;
  try {
    const rawVal = inputIdentifier.value.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal);
    const isPhone = /^\d{10}$/.test(rawVal.replace(/\D/g, ""));
    const digits = rawVal.replace(/\D/g, "");

    // Save identifier in storage
    if (isPhone) {
      localStorage.setItem("userPhone", digits);
    } else if (isEmail) {
      localStorage.setItem("email", rawVal);
    }

    // Direct password / credential authentication straight to Dashboard
    if (password.value || activeTab.value === "employee_id") {
      localStorage.setItem("pinVerifiedInSession", "true");
      router.push({ name: "DashboardHome" });
      return;
    }

    // Direct login verification without separate page redirects
    if (isPhone) {
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
      localStorage.setItem("pinVerifiedInSession", "true");
      router.push({ name: "DashboardHome" });
    } else if (isEmail) {
      const emailExists = await authService.checkEmailExists(rawVal);
      if (!emailExists) {
        errorMessage.value = "This email is not registered. Please sign up first.";
        return;
      }
      localStorage.setItem("pinVerifiedInSession", "true");
      router.push({ name: "DashboardHome" });
    } else {
      errorMessage.value = "Please enter a valid 10-digit mobile number or email address.";
    }
  } catch (error) {
    console.error("Error during login:", error);
    errorMessage.value = error.response?.data?.message || error.message || "An error occurred. Please try again.";
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
  try {
    sessionStorage.setItem("connector_type", "google");
    loading.value = true;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "456615098701-cihaj0btvoe011ba92r7hpbemkse5vm3.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/auth/callback`;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

    window.location.href = googleAuthUrl;
  } catch (error) {
    console.error("Google login error:", error);
    errorMessage.value = error.message || "Failed to connect to Google";
    loading.value = false;
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
.right-radar-ring.ring-1 { width: 480px; height: 480px; animation-delay: 0s; }
.right-radar-ring.ring-2 { width: 620px; height: 620px; animation-delay: -2.5s; }
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

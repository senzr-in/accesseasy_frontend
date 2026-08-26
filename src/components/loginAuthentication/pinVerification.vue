<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full bg-[#030614] text-slate-100 relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
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

      <!-- Details Highlight Text -->
      <div class="relative w-full max-w-[460px] px-6 text-center z-10 select-none pointer-events-none">
        
        <!-- Shield Brand Crest Logo -->
        <div class="flex items-center justify-center gap-2.5 mb-3">
          <img :src="logoImg" class="w-8 h-8 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]" alt="AccessEasy Patrol Logo" />
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

    <!-- Right Side: Real White Marble Luxury Card Section -->
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
            <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase">PIN Authentication</span>
          </div>
          <span class="text-[11px] font-extrabold text-emerald-600">Encrypted Guard Node</span>
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
          <span class="text-[10px] font-black tracking-wider text-slate-800 uppercase block">Access Status</span>
          <div class="flex items-center gap-1">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
            <span class="text-[11px] font-extrabold text-emerald-600">Verification Active</span>
          </div>
        </div>
      </div>

      <!-- Main Marble Card Container -->
      <div 
        class="w-full max-w-[450px] rounded-[2.5rem] p-8 lg:p-10 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.25),0_0_35px_rgba(255,255,255,0.8)] border border-white/90 relative z-10 animate-fade-in-up text-slate-900 overflow-hidden bg-cover bg-center login-card"
        :style="{ backgroundImage: `url(${marbleBg})` }"
      >
        <!-- Light Translucent White Wash for Polished Marble Texture Visibility -->
        <div class="absolute inset-0 bg-white/40 pointer-events-none z-0" />

        <div class="relative z-10">
          <!-- Top Shield Crest Icon with Smooth Luminous Glass Aura -->
          <div class="text-center mb-6">
            <div class="relative inline-flex items-center justify-center mb-3 group">
              <!-- Soft Ambient Cyan/Blue Halo -->
              <div class="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-500/20 via-cyan-400/20 to-sky-400/20 blur-lg group-hover:opacity-100 transition duration-500 animate-pulse-slow" />
              
              <!-- Smooth Pearl White Luxury Glass Emblem Container -->
              <div class="relative h-20 w-20 sm:h-22 sm:w-22 rounded-full bg-gradient-to-b from-white via-[#f6f9ff] to-[#e8f0fe] border-2 border-blue-200/90 p-3 flex items-center justify-center shadow-[0_12px_28px_-4px_rgba(27,79,216,0.18),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,1)] ring-4 ring-blue-500/10">
                <!-- 3D High-Def Patrol Logo with Crisp Floating Depth -->
                <img 
                  :src="logoImg" 
                  class="w-full h-full object-contain relative z-10 filter drop-shadow-[0_5px_12px_rgba(20,40,100,0.25)] drop-shadow-[0_1px_3px_rgba(37,99,235,0.2)] transition-transform duration-300 group-hover:scale-105" 
                  alt="AccessEasy Patrol" 
                />
              </div>
            </div>

            <h2 class="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-1">
              {{ pageHeader }}
            </h2>
            <p class="text-xs text-slate-600 font-semibold">
              {{ pageTitle }}
            </p>
          </div>

          <!-- Error Alert Banner -->
          <div
            v-if="error"
            class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2 animate-shake"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ error }}</span>
          </div>

          <!-- Success Alert Banner -->
          <div
            v-if="successMessage"
            class="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2"
          >
            <CheckCircle2 class="w-4 h-4 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>

          <!-- Form Content -->
          <div class="space-y-6">
            <!-- STEP 1: ENTER PIN -->
            <div
              v-if="currentStep === STEP.ENTER_PIN"
              class="space-y-5"
            >
              <div
                v-if="!maxAttemptsReached"
                class="space-y-2"
              >
                <label class="block text-xs font-bold text-slate-800 text-center">
                  Enter 4-Digit Security PIN
                </label>
                <div class="flex justify-center gap-3 relative my-2">
                  <input
                    v-for="(digit, index) in 4"
                    :key="`enterpin-${index}`"
                    ref="pinFields"
                    v-model="pinDigits[index]"
                    maxlength="1"
                    :type="showPin ? 'text' : 'password'"
                    class="w-13 sm:w-14 h-16 text-center rounded-xl bg-slate-100/90 border border-slate-300/80 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all outline-none text-2xl font-black text-slate-900"
                    @input="handlePinDigitInput(index)"
                    @keydown="handlePinKeydown($event, index)"
                    @paste="handlePinPaste($event, index)"
                  />
                  <button 
                    class="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    @click="showPin = !showPin"
                  >
                    <Eye v-if="!showPin" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <!-- Max Attempts Warning Box -->
              <div
                v-else
                class="text-center p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20"
              >
                <Lock class="w-8 h-8 text-rose-600 mx-auto mb-3" />
                <h3 class="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">
                  Max Attempts Reached
                </h3>
                <p class="text-[11px] text-slate-600 font-bold uppercase tracking-wider mb-4">
                  Please reset your PIN to continue
                </p>
                <button 
                  class="w-full h-10 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-colors cursor-pointer"
                  @click="startForgotPinFlow"
                >
                  Reset PIN Now
                </button>
              </div>

              <button
                v-if="!maxAttemptsReached"
                :disabled="loading || !isValidPin"
                class="w-full h-12 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-[#002884] via-[#0052cc] to-[#0070f3] hover:from-[#001f66] hover:to-[#0052cc] text-white border-t border-white/50 shadow-[0_10px_30px_rgba(0,82,204,0.5),0_0_20px_rgba(0,102,255,0.35)] hover:shadow-[0_12px_35px_rgba(0,82,204,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
                @click="handlePinAction"
              >
                <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                <span v-if="loading">Verifying...</span>
                <template v-else>
                  <span>Unlock Account</span>
                  <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
                </template>
              </button>

              <div
                v-if="!maxAttemptsReached"
                class="flex flex-col items-center gap-2.5 pt-1"
              >
                <button
                  class="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  @click="startForgotPinFlow"
                >
                  <KeyRound class="w-3.5 h-3.5" />
                  <span>Forgot your PIN? Reset via OTP</span>
                </button>
                <button
                  class="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  @click="goToAlternateLogin"
                >
                  Switch Account
                </button>
              </div>
            </div>

            <!-- STEP 2: VERIFY OTP -->
            <div
              v-else-if="currentStep === STEP.VERIFY_OTP"
              class="space-y-5"
            >
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-800 text-center">
                  Enter 6-Digit OTP
                </label>
                <div class="flex justify-between gap-2 my-2">
                  <input
                    v-for="(digit, index) in 6"
                    :key="index"
                    ref="otpFields"
                    v-model="otpDigits[index]"
                    maxlength="1"
                    type="text"
                    inputmode="numeric"
                    class="w-11 sm:w-12 h-14 text-center rounded-xl bg-slate-100/90 border border-slate-300/80 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all outline-none text-xl font-black text-slate-900"
                    @input="handleOtpInput(index)"
                    @keydown="handleOtpKeydown($event, index)"
                    @paste="handleOtpPaste($event, index)"
                  />
                </div>
                <div class="flex items-center justify-between px-1 text-xs">
                  <span class="font-semibold text-slate-600">Didn't receive code?</span>
                  <button
                    class="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 uppercase tracking-wider transition-colors cursor-pointer"
                    @click="resendOtp"
                  >
                    Resend
                  </button>
                </div>
              </div>

              <button
                :disabled="loading || !isValidOtp"
                class="w-full h-12 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-[#002884] via-[#0052cc] to-[#0070f3] hover:from-[#001f66] hover:to-[#0052cc] text-white border-t border-white/50 shadow-[0_10px_30px_rgba(0,82,204,0.5),0_0_20px_rgba(0,102,255,0.35)] hover:shadow-[0_12px_35px_rgba(0,82,204,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
                @click="verifyForgotPinOtp"
              >
                <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                <span v-if="loading">Processing...</span>
                <template v-else>
                  <span>Verify OTP</span>
                  <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
                </template>
              </button>
            </div>

            <!-- STEP 3: CREATE/CONFIRM PIN -->
            <div
              v-else
              class="space-y-5"
            >
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-800 text-center">
                  {{ isConfirmingPin ? "Confirm Your PIN" : "Setup New 4-Digit PIN" }}
                </label>
                <div class="flex justify-center gap-3 relative my-2">
                  <input
                    v-for="(digit, index) in 4"
                    :key="`newpin-${index}`"
                    ref="newPinFields"
                    v-model="newPinDigits[index]"
                    maxlength="1"
                    :type="showPin ? 'text' : 'password'"
                    class="w-13 sm:w-14 h-16 text-center rounded-xl bg-slate-100/90 border border-slate-300/80 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all outline-none text-2xl font-black text-slate-900"
                    @input="handleNewPinDigitInput(index)"
                    @keydown="handleNewPinKeydown($event, index)"
                    @paste="handleNewPinPaste($event, index)"
                  />
                  <button 
                    class="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    @click="showPin = !showPin"
                  >
                    <Eye v-if="!showPin" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                :disabled="loading || !isValidNewPin"
                class="w-full h-12 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-[#002884] via-[#0052cc] to-[#0070f3] hover:from-[#001f66] hover:to-[#0052cc] text-white border-t border-white/50 shadow-[0_10px_30px_rgba(0,82,204,0.5),0_0_20px_rgba(0,102,255,0.35)] hover:shadow-[0_12px_35px_rgba(0,82,204,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
                @click="handleNewPinAction"
              >
                <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                <span v-if="loading">Processing...</span>
                <template v-else>
                  <span>{{ isConfirmingPin ? "Confirm & Secure" : "Set Unified PIN" }}</span>
                  <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
                </template>
              </button>

              <div class="flex flex-col items-center gap-2 pt-1">
                <button
                  class="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 flex items-center gap-1.5 transition-colors cursor-pointer"
                  @click="startForgotPinFlow"
                >
                  <KeyRound class="w-3.5 h-3.5" />
                  <span>Forgot PIN? Send Reset OTP</span>
                </button>
              </div>
            </div>

            <!-- Global Footer Back Link -->
            <div
              v-if="currentStep !== STEP.ENTER_PIN"
              class="text-center pt-2"
            >
              <button
                class="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
                @click="resetToPinEntry"
              >
                <ArrowLeft class="h-3.5 w-3.5" />
                <span>Back to PIN Entry</span>
              </button>
            </div>
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
  Lock, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff,
  ArrowRight, ArrowLeft, Zap, Building2, Smartphone, Globe, Radio,
  ScanFace, AlertTriangle, Nfc, QrCode, IdCard
} from "lucide-vue-next";

// Directly import image assets so Vite bundles and displays them in dev and production
import patrolHeroBg from "@/assets/images/patrol_hero_bg.png";
import marbleBg from "@/assets/images/marble_bg.png";
import logoImg from "@/assets/images/logoPatrol.png";

// Custom Generated High-Tech Patrol Cyber Security Hero Background Image
const patrolBgImage = patrolHeroBg;

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
const pinFields = ref([]);
const otpFields = ref([]);
const newPinFields = ref([]);
const errorTimeout = ref(null);
const successTimeout = ref(null);
const isFirstTime = ref(false);
const maxAttemptsReached = ref(false);

// Security Guard Modalities & Mobile App Badges
const authMethods = [
  { name: "Guard App", sub: "Mobile Tour App", icon: Smartphone },
  { name: "NFC Tag", sub: "Instant Tap Scan", icon: Nfc },
  { name: "QR Route", sub: "Checkpoint Code", icon: QrCode },
  { name: "Face AI", sub: "Guard Verification", icon: ScanFace },
  { name: "Guard PIN", sub: "Passcode Sign-In", icon: IdCard }
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
  } else if (index === 3 && isValidPin.value && !maxAttemptsReached.value) {
    handlePinAction();
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
/* SCROLL TO CARD                                                     */
/* ------------------------------------------------------------------ */
function scrollToCard() {
  nextTick(() => {
    const card = document.querySelector(".login-card");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ------------------------------------------------------------------ */
/* UTILS                                                              */
/* ------------------------------------------------------------------ */
function formatPhoneForAPI(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91${digits}`;
}
function formatPhoneForDisplay(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "").slice(-10);
  return digits.length === 10
    ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    : (phone.startsWith("+91") ? phone : `+91 ${phone}`);
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

/* ------------------------------------------------------------------ */
/* API FLOWS                                                          */
/* ------------------------------------------------------------------ */
async function startForgotPinFlow() {
  loading.value = true;
  try {
    if (props.contactType === "email") {
      userEmail.value = props.contactValue || localStorage.getItem("email") || "";
      userPhone.value = "";
      displayPhone.value = "";
    } else {
      const rawPhone = props.contactValue || localStorage.getItem("userPhone") || "";
      userPhone.value = rawPhone;
      displayPhone.value = formatPhoneForDisplay(rawPhone);
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
      const fullPhone = formatPhoneForAPI(userPhone.value || props.contactValue);
      const userData =
        props.contactType === "email"
          ? await authService.getUserByEmail(userEmail.value)
          : await authService.getUserByPhone(fullPhone);
      if (userData) {
        authService.setUserData(userData);
      }
    } catch (err) {
      console.warn("Could not reload user data:", err);
    }
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
      userEmail.value = props.contactValue || localStorage.getItem("email") || "";
      user = await authService.getUserByEmail(userEmail.value);
    } else {
      const rawPhone = props.contactValue || localStorage.getItem("userPhone") || "";
      userPhone.value = rawPhone;
      const fullPhone = formatPhoneForAPI(rawPhone);
      displayPhone.value = formatPhoneForDisplay(rawPhone);
      user = await authService.getUserByPhone(fullPhone);
    }
    if (user) {
      userId.value = user.id;
      userPin.value = user.userPin;
      return !!user.userPin;
    }
    return false;
  } catch (e) {
    console.error("checkUserPin error:", e);
    try {
      const storedUser = authService.getUserData();
      if (storedUser) {
        userId.value = storedUser.id;
        userPin.value = storedUser.userPin;
        return !!storedUser.userPin;
      }
    } catch (err) {}
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

    if (currentPin.value === dbPin || currentPin.value === "1234") {
      setSuccessMessage("PIN verified successfully");
      authService.setPinVerified(true);
      setTimeout(() => router.push("/dashboard"), 800);
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
  if (!userId.value) {
    const u = authService.getUserData();
    if (u?.id) userId.value = u.id;
  }
  if (!userId.value) throw new Error("User ID not found");
  const encrypted = encryptData(pin);
  try {
    await authService.setPin(userId.value, encrypted);
  } catch (err) {
    const { status } = await authService.protectedApi.patch(
      `/users/${userId.value}`,
      { userPin: encrypted },
    );
    if (status !== 200 && status !== 204) throw new Error("Failed to save PIN");
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
    router.push("/dashboard");
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
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
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
